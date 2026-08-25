#!/usr/bin/env python3
"""Gate: every cross-collection reference in src/content/ resolves.

`reference('products')` in src/content.config.ts validates the services ->
products join on every build and prints a named [ERROR] when it breaks --
but Astro 7.2.4 exits 0 anyway and emits the page with a dead link in it
(measured: a planted bad id logged "Invalid content reference" and still
gave "52 page(s) built" with exit 0). `npm run astro check` does not see it
either: the reference is data, not types.

So the schema reports and this script fails. Run it beside contrast-check.py.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
CONTENT = ROOT / "src" / "content"

# (collection holding the field, field name, collection it points into,
#  alternative field that may stand in for it)
#
# `proves` is optional on a service because not every practice ships a
# product -- consulting is proven by the work delivered. The schema allows AT
# MOST one of `proves` and `provenBy`, and this gate checks the same pair.
#
# A service with NEITHER is legal and is not a failure here. That was the rule
# once, and demanding proof from all seven produced exactly what a forced field
# always produces: three practices carrying invented claims nobody had counted.
# Proof is optional because proof is optional; every consumer omits the line
# rather than printing "Proven by" with a blank after it, and the guards that
# do so are in Services.astro and services/index.astro. What this gate still
# catches is the two failures that are real -- both fields set at once, and a
# `proves` pointing at a product that does not exist.
JOINS = [("services", "proves", "products", "provenBy")]

failures = []
checked = 0

for source, field, target, alt in JOINS:
    src_dir, tgt_dir = CONTENT / source, CONTENT / target
    if not src_dir.is_dir():
        failures.append(f"missing collection directory: {src_dir}")
        continue
    for entry in sorted(src_dir.rglob("*.md")):
        head = entry.read_text(encoding="utf-8").split("---", 2)
        if len(head) < 3:
            failures.append(f"{entry.relative_to(ROOT)}: no frontmatter fence")
            continue
        m = re.search(rf"^{field}:\s*(\S+)\s*$", head[1], re.MULTILINE)
        has_alt = re.search(rf"^{alt}:\s*\S", head[1], re.MULTILINE) is not None
        if not m:
            continue
        if has_alt:
            failures.append(
                f"{entry.relative_to(ROOT)}: both `{field}:` and `{alt}:` -- pick one"
            )
            continue
        ref = m.group(1).strip("\"'")
        checked += 1
        if not (tgt_dir / f"{ref}.md").is_file():
            failures.append(
                f"{entry.relative_to(ROOT)}: {field} -> '{ref}' "
                f"has no entry in the {target} collection"
            )

for line in failures:
    print(f"FAIL  {line}")
if failures:
    print(f"\n{len(failures)} broken reference(s).")
    sys.exit(1)
print(f"ok  {checked} cross-collection reference(s) resolve.")
