import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  bashRules,
  documentedCommands,
  isPermitted,
  parseAllowedTools,
  ruleAllows,
  skillsNamedBy,
  splitPipeline,
} from './agent-allowlist';

const WORKFLOWS = ['.github/workflows/journal-write.yml', '.github/workflows/journal-radar.yml'];

const read = (path: string) => readFileSync(path, 'utf-8');

describe('splitPipeline', () => {
  it('splits a pipe, because the permission check does', () => {
    expect(splitPipeline('grep -ri foo src/ | head')).toEqual(['grep -ri foo src/', 'head']);
  });

  it('splits && and ;', () => {
    expect(splitPipeline('python3 -c "x" && echo ok')).toEqual(['python3 -c "x"', 'echo ok']);
    expect(splitPipeline('npm ci; npm run build')).toEqual(['npm ci', 'npm run build']);
  });

  it('leaves a pipe inside quotes alone', () => {
    expect(splitPipeline('grep -E "leverage|robust" file.md')).toEqual([
      'grep -E "leverage|robust" file.md',
    ]);
  });

  it('does not read a redirection as a chain', () => {
    expect(splitPipeline('npm run build 2>&1')).toEqual(['npm run build 2>&1']);
  });
});

describe('ruleAllows', () => {
  it('treats a bare rule as the whole command', () => {
    expect(ruleAllows('npm run build', 'npm run build')).toBe(true);
    expect(ruleAllows('npm run build', 'npm run astro check')).toBe(false);
  });

  it('treats :* as a prefix', () => {
    expect(ruleAllows('git:*', 'git push')).toBe(true);
    expect(ruleAllows('gh issue view:*', 'gh issue view 12 --json body')).toBe(true);
    expect(ruleAllows('gh issue view:*', 'gh workflow run deploy.yml')).toBe(false);
  });

  it('lets the prefix end mid-word, as the tool does', () => {
    // Bash(node scripts/:*) depends on this. The cost is that Bash(git:*)
    // authorises `gitleaks` as well; the answer is a narrower rule, not a
    // checker that disagrees with the permission system it is modelling.
    expect(ruleAllows('node scripts/:*', 'node scripts/prose-check.mjs a.md')).toBe(true);
    expect(ruleAllows('git:*', 'gitleaks detect')).toBe(true);
  });
});

describe('documentedCommands', () => {
  it('reads a bash fence and an inline span, and ignores other fences', () => {
    const md = [
      'Run `npm ci` first.',
      '',
      '```yaml',
      'date: 2026-09-01',
      '```',
      '',
      '```bash',
      'npm run build   # the gate',
      '```',
    ].join('\n');

    expect(documentedCommands(md, 'x.md').map((c) => c.command)).toEqual([
      'npm ci',
      'npm run build',
    ]);
  });
});

describe('the CI allowlists cover the skills their workflows load', () => {
  for (const workflow of WORKFLOWS) {
    it(`${workflow}`, () => {
      const yaml = read(workflow);
      const rules = bashRules(parseAllowedTools(yaml));
      const skills = skillsNamedBy(yaml);

      // A workflow that names no skill means the prompt was rewritten and this
      // test quietly stopped checking anything.
      expect(skills.length).toBeGreaterThan(0);

      const denied = skills
        .flatMap((skill) => documentedCommands(read(skill), skill))
        .filter((c) => !isPermitted(c.command, rules));

      expect(
        denied.map((c) => `${c.file}:${c.line}  ${c.command}`),
        'Each of these is a turn the job will spend being told no. Either add a '
          + 'rule to the workflow\'s --allowedTools, or stop the skill from asking '
          + 'for it in CI.',
      ).toEqual([]);
    });
  }
});
