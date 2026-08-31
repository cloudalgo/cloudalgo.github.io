/**
 * Does the Journal's CI allowlist cover what its skills tell the model to type?
 *
 * A denied tool call in `claude-code-action` is not an error. The model is told
 * no, it adapts, and the run carries on -- one turn poorer. The run that failed
 * on 2026-08-31 spent 11 of its ~60 turns that way and shipped nothing; the run
 * after it spent 17. Nothing in the log says which calls were refused, only how
 * many, so the waste is invisible until someone pays for a `--debug` run.
 *
 * The skills are the ground truth for what gets typed: they are handed to the
 * model as authoritative instructions, and a command written in one is a
 * command the model will try. So the gap is checkable statically -- read the
 * commands out of the skills a workflow names, read the rules out of that
 * workflow's --allowedTools, and see whether each is permitted.
 */

/** One shell command found in a skill, with where it was written. */
export interface DocumentedCommand {
  /** The command as the skill writes it, placeholders and all. */
  command: string;
  /** Repo-relative path of the skill file. */
  file: string;
  /** 1-based line number, so a failure points at something editable. */
  line: number;
}

/**
 * The binaries worth checking. A closed list, not a heuristic: prose is full of
 * words that would parse as a command, and a checker that cries wolf gets
 * deleted. Add a name here when a skill starts using it.
 */
const KNOWN_BINARIES = [
  'awk', 'basename', 'cat', 'chmod', 'cp', 'curl', 'date', 'diff', 'dirname',
  'echo', 'find', 'gh', 'git', 'grep', 'head', 'jq', 'ls', 'mkdir', 'mv',
  'node', 'npm', 'npx', 'python', 'python3', 'rm', 'rsvg-convert', 'sed',
  'sort', 'tail', 'test', 'touch', 'tr', 'uniq', 'wc', 'wget', 'xargs',
];

const STARTS_WITH_BINARY = new RegExp(`^(?:${KNOWN_BINARIES.join('|')})\\s`);

/**
 * Pull the `--allowedTools "..."` argument out of a workflow file.
 *
 * Returns the tool names as written -- `Read`, `Bash(git:*)` and so on --
 * because the caller wants both halves: the Bash rules to match against, and
 * the bare tool names to report an unrecognised one.
 */
export function parseAllowedTools(workflowYaml: string): string[] {
  const match = workflowYaml.match(/--allowedTools\s+"([^"]*)"/);
  if (!match) return [];
  return match[1].split(',').map((t) => t.trim()).filter(Boolean);
}

/** The inside of every `Bash(...)` entry: `git:*`, `npm run build`, ... */
export function bashRules(allowedTools: string[]): string[] {
  return allowedTools
    .map((tool) => tool.match(/^Bash\((.*)\)$/)?.[1])
    .filter((rule): rule is string => Boolean(rule));
}

/** The `.claude/skills/<name>/SKILL.md` paths a workflow's prompt names. */
export function skillsNamedBy(workflowYaml: string): string[] {
  const paths = workflowYaml.match(/\.claude\/skills\/[\w-]+\/SKILL\.md/g) ?? [];
  return [...new Set(paths)];
}

/**
 * Split a command line the way the permission check does: per segment.
 *
 * `grep foo bar | head` is two commands and needs two rules -- the lesson that
 * cost a run. `&&`, `||` and `;` chain the same way. Quotes are respected so a
 * pipe inside a `grep -E "a|b"` pattern does not split anything.
 */
export function splitPipeline(command: string): string[] {
  const segments: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < command.length; i += 1) {
    const ch = command[i];

    if (quote) {
      current += ch;
      if (ch === quote && command[i - 1] !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }
    // `2>&1` is a redirection, not a chain; only a doubled & separates.
    const two = command.slice(i, i + 2);
    if (two === '&&' || two === '||') {
      segments.push(current);
      current = '';
      i += 1;
      continue;
    }
    if (ch === '|' || ch === ';') {
      segments.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  segments.push(current);

  return segments.map((s) => s.trim()).filter(Boolean);
}

/**
 * Does one rule permit one command?
 *
 * Claude Code reads a rule ending in `:*` as a plain string prefix and anything
 * else as the whole command. Plain really is plain -- `Bash(git:*)` authorises
 * `gitleaks` too, and no boundary is required -- which is a good reason to keep
 * these rules specific. This function mirrors that rather than improving on it:
 * a checker that is stricter than the thing it checks fails runs that would
 * have worked, and `Bash(node scripts/:*)` is exactly the case that needs the
 * prefix to end mid-word.
 */
export function ruleAllows(rule: string, command: string): boolean {
  if (!rule.endsWith(':*')) return rule === command;
  return command.startsWith(rule.slice(0, -2));
}

/** Is every segment of this command line permitted by some rule? */
export function isPermitted(command: string, rules: string[]): boolean {
  return splitPipeline(command).every((segment) =>
    rules.some((rule) => ruleAllows(rule, segment)),
  );
}

/** Strip a trailing `# comment` that is not inside quotes. */
function stripComment(line: string): string {
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quote) {
      if (ch === quote && line[i - 1] !== '\\') quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '#' && (i === 0 || /\s/.test(line[i - 1]))) {
      return line.slice(0, i);
    }
  }
  return line;
}

/**
 * Every shell command a skill tells the model to run.
 *
 * Two places count: a ```bash fence, and an inline `code span` that starts with
 * a known binary followed by whitespace. The whitespace matters -- it is what
 * keeps the frontmatter example's `date: 2026-09-01` out of the results.
 */
export function documentedCommands(markdown: string, file: string): DocumentedCommand[] {
  const found: DocumentedCommand[] = [];
  let inShellFence = false;
  let inOtherFence = false;

  markdown.split('\n').forEach((raw, index) => {
    const line = raw.trim();

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim().toLowerCase();
      if (inShellFence || inOtherFence) {
        inShellFence = false;
        inOtherFence = false;
      } else if (['bash', 'sh', 'shell', 'console'].includes(lang)) {
        inShellFence = true;
      } else {
        inOtherFence = true;
      }
      return;
    }

    const push = (command: string) => {
      const cleaned = stripComment(command).trim();
      if (cleaned && STARTS_WITH_BINARY.test(cleaned)) {
        found.push({ command: cleaned, file, line: index + 1 });
      }
    };

    if (inShellFence) {
      push(line.replace(/^\$\s+/, ''));
      return;
    }
    if (inOtherFence) return;

    for (const span of line.matchAll(/`([^`]+)`/g)) push(span[1]);
  });

  return found;
}
