#!/usr/bin/env python3
"""Measure every text role against the background it actually paints on.

The five cascade comparers prove a change moved nothing. From the theme
flip onward everything moves on purpose, so they retire and this takes
over: it proves the thing we actually care about, which is that no text
role in the shipped palette sits under WCAG AA.
"""
import re, sys, pathlib

def _srgb(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def luminance(h):
    h = h.lstrip('#')
    r, g, b = (int(h[i:i+2], 16) for i in (0, 2, 4))
    return 0.2126 * _srgb(r) + 0.7152 * _srgb(g) + 0.0722 * _srgb(b)

def ratio(fg, bg):
    a, b = luminance(fg), luminance(bg)
    if a < b:
        a, b = b, a
    return (a + 0.05) / (b + 0.05)

def load(path):
    """Pull `'key': #HEX,` pairs out of a theme's Sass map."""
    src = pathlib.Path(path).read_text()
    return dict(re.findall(r"'([a-z0-9-]+)':\s*(#[0-9A-Fa-f]{6})", src))

# (token, background token, minimum). Backgrounds are the surface the
# role's semantic consumer actually paints on -- page, card or inverse.
TEXT_ROLES = [
    ('ink-900',   'paper-100', 4.5),   # --color-heading on page
    ('ink-900',   'paper-000', 4.5),   # --color-heading on card
    ('ink-500',   'paper-100', 4.5),   # --color-text on page
    ('ink-500',   'paper-000', 4.5),   # --color-text on card
    ('ink-400',   'paper-100', 4.5),   # --color-text-muted on page
    ('ink-300',   'paper-100', 4.5),   # --color-text-faint on page
    ('ink-300',   'paper-000', 4.5),   # --color-text-faint on card
    ('paper-400', 'paper-100', 4.5),   # --color-text-faintest on page
    ('ink-860',   'paper-000', 4.5),   # --color-prose on card
    ('ink-840',   'paper-000', 4.5),   # --color-prose-soft on card
    ('accent-on', 'accent-500', 4.5),  # button label on ember
    ('accent-on', 'accent-600', 4.5),  # button label on ember hover
    ('paper-000', 'ink-900',   4.5),   # --color-on-inverse
    ('paper-000', 'ink-800',   4.5),   # --color-on-inverse on footer CTA
    ('paper-025', 'ink-900',   4.5),   # --color-on-inverse-soft
    ('accent-400', 'ink-900',  4.5),   # ember on an inverse surface
    ('danger-500', 'paper-000', 4.5),  # --color-danger on card
]

def main(theme_path):
    t = load(theme_path)
    failed = []
    for fg, bg, floor in TEXT_ROLES:
        r = ratio(t[fg], t[bg])
        ok = r >= floor
        if not ok:
            failed.append((fg, bg, r, floor))
        print(f"{'ok  ' if ok else 'FAIL'} {fg:11} {t[fg]} on {bg:11} {t[bg]}  {r:5.2f}:1")
    if failed:
        print(f"\n{len(failed)} role(s) under AA:", file=sys.stderr)
        for fg, bg, r, floor in failed:
            print(f"  {fg} on {bg}: {r:.2f} < {floor}", file=sys.stderr)
        return 1
    print(f"\nall {len(TEXT_ROLES)} text roles clear AA")
    return 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1
                  else 'src/styles/themes/_press-room.scss'))
