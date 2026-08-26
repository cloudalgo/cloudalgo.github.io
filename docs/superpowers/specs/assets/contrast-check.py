#!/usr/bin/env python3
"""Measure every text role against the background it actually paints on.

The five cascade comparers prove a change moved nothing. From the theme
flip onward everything moves on purpose, so they retire and this takes
over: it proves the thing we actually care about, which is that no text
role in the shipped palette sits under WCAG AA.

Two tables, because there are two kinds of role.

TEXT_ROLES is flat hex-on-hex -- most of the palette. ALPHA_TEXT_ROLES
is `--color-on-inverse-*`: `paper-000` (white) painted at a CSS alpha
over `--surface-inverse` (== `ink-900`), never a flat hex. A reader
that only pulls `'key': #HEX` pairs out of the Sass map can't see an
alpha role at all, so it gets its own compositing path
(composite_luminance, below) and its own table.

Two ALPHA rungs (a35/a40) are real, shipped text that measures
under AA. They are pre-existing -- this repaint did not cause them and
does not fix them; see the ALLOWLIST comment above ALPHA_TEXT_ROLES.
They print with a KNOWN marker and their real ratio -- never hidden,
never silently passed -- and do not fail the gate. Every other role,
flat or alpha, must clear its floor or the gate exits non-zero, which
means a new alpha rung (or a regression in an existing one) that is
not on the allowlist DOES fail the build.

What a green run does NOT prove: WCAG 1.4.11's 3:1 floor for non-text
UI components and graphics is out of scope entirely (e.g. the
`ink-870` hairline rule on an `ink-900` section measures 1.44:1 and is
not a text role, so it is not in either table below), and any
`--color-on-inverse-aNN` rung not listed in ALPHA_TEXT_ROLES is
unmeasured.
"""
import re, sys, pathlib

def _srgb(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def luminance(h):
    r, g, b = hex_to_rgb(h)
    return 0.2126 * _srgb(r) + 0.7152 * _srgb(g) + 0.0722 * _srgb(b)

def ratio_of(l_a, l_b):
    """WCAG contrast ratio from two relative luminances (order-independent)."""
    hi, lo = (l_a, l_b) if l_a >= l_b else (l_b, l_a)
    return (hi + 0.05) / (lo + 0.05)

def ratio(fg, bg):
    return ratio_of(luminance(fg), luminance(bg))

def composite_luminance(fg_hex, bg_hex, alpha):
    """Luminance of fg-at-alpha flattened over bg, the way a browser paints
    it: blend the raw sRGB-ENCODED channel bytes (c = alpha*fg + (1-alpha)*bg
    per channel), THEN run the gamma-expansion luminance math on the result.
    This is compositing in sRGB space, not linear light -- that is what a
    browser does by default, and it is what the reference ratios below were
    measured against."""
    fg_rgb, bg_rgb = hex_to_rgb(fg_hex), hex_to_rgb(bg_hex)
    blended = (alpha * f + (1 - alpha) * b for f, b in zip(fg_rgb, bg_rgb))
    return sum(w * _srgb(c) for w, c in zip((0.2126, 0.7152, 0.0722), blended))

def load(path):
    """Pull `'key': #HEX,` pairs out of a theme's Sass map."""
    src = pathlib.Path(path).read_text()
    return dict(re.findall(r"'([a-z0-9-]+)':\s*(#[0-9A-Fa-f]{6})", src))

# (fg token, bg token, minimum). Backgrounds are the surface the role's
# semantic consumer actually paints on -- page, card or inverse.
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
    ('danger-400', 'paper-000', 4.5),  # --color-danger-soft on card (.sw-error-msg)

    # The ember band (fold 5). Its quote plate is an accent-050 surface --
    # a THIRD background, lighter than both page and card, so these rungs
    # are not covered by any row above.
    ('ink-860',   'accent-050', 4.5),  # --color-prose on the band's quote plate
    ('ink-400',   'accent-050', 4.5),  # --color-text-muted on the band's cite
    ('accent-050', 'ink-900',   4.5),  # the band CTA's pale label on its ink fill

    # The ONE role in the palette held to WCAG's large-text floor rather
    # than 4.5. White on ember measures ~3.2:1 and is legal only as large
    # text; --color-on-accent-display exists to name that and its comment
    # in _semantic.scss carries the conditions. The band's headline is the
    # sole consumer: bold, with a clamp floor of 1.5rem, which is 20.4px
    # even after the root drops to 85% at 1200px -- clear of the 18.66px
    # bold threshold. If a second consumer appears, re-derive this row.
    ('paper-000', 'accent-500', 3.0),  # --color-on-accent-display, large text only
]

# ALLOWLIST -- white-over-inverse text under AA, tracked on purpose.
#
# `--color-on-inverse-a40` is real text at:
#   a40: src/components/ui/ProductCard.astro:82,
#        src/styles/tokens/_components.scss:50 (--section-label-color-inverse)
# Composited over this theme's `ink-900` (#131110) they measure 3.21 / 3.82 --
# both under 4.5:1. This is NOT something the repaint introduced: the
# old `ink-900` was #0A0A0A, darker, so every one of these ratios was even
# lower before (e.g. a45 -- not a failure, see below -- was 4.50, is now
# 4.53; #131110 is lighter than #0A0A0A, so compositing against it only ever
# moves these ratios up). Fixing them is a call-site change on pages that
# have not been redesigned yet, which is out of scope here; a later
# "drift sweep" task retires the raw -aNN rungs in favour of the five named
# on-inverse roles (body/strong/muted/faint/ghost) and is expected to fix
# these two as a side effect. Until then they are allowlisted BY NAME, so
# this gate still fails on any alpha rung -- new or existing -- that regresses
# under AA without having been told about it first.
#
# (role label, alpha, minimum, allowlist reason or None)
ALPHA_TEXT_ROLES = [
    # a35's one call site went with the /blog/[slug] rebuild. The rung is
    # still declared, so it is still measured -- if anything reaches for it
    # again this row is the record of what it costs.
    ('on-inverse-a35 (--color-on-inverse-a35)', 0.35, 4.5,
     'KNOWN -- no call sites'),
    ('on-inverse-a40 (--color-on-inverse-a40)', 0.40, 4.5,
     'KNOWN -- ProductCard.astro:82, _components.scss:50'),
    ('on-inverse-faint / a45 (--color-on-inverse-faint)', 0.45, 4.5, None),
    ('on-inverse-muted / a55 (--color-on-inverse-muted)', 0.55, 4.5, None),
    ('on-inverse-strong / a70 (--color-on-inverse-strong)', 0.70, 4.5, None),
    ('on-inverse-body / a88 (--color-on-inverse-body)', 0.88, 4.5, None),
]

def check_flat(t):
    """Returns (results, failed) where results is [(label, ratio, floor)]
    for every role that cleared its floor."""
    results, failed = [], []
    for fg, bg, floor in TEXT_ROLES:
        r = ratio(t[fg], t[bg])
        ok = r >= floor
        label = f"{fg} on {bg}"
        print(f"{'ok  ' if ok else 'FAIL'} {fg:11} {t[fg]} on {bg:11} {t[bg]}  {r:5.2f}:1")
        (results if ok else failed).append((label, r, floor))
    return results, failed

def check_alpha(t):
    """Same shape as check_flat, plus a third list for allowlisted (KNOWN)
    rungs -- under AA, but not counted as a gate failure."""
    fg_hex, bg_hex = t['paper-000'], t['ink-900']
    l_bg = luminance(bg_hex)
    print(f"\n-- on-inverse: paper-000 {fg_hex} at alpha, over ink-900 {bg_hex} --")
    results, failed, allowlisted = [], [], []
    for role, alpha, floor, known in ALPHA_TEXT_ROLES:
        r = ratio_of(composite_luminance(fg_hex, bg_hex, alpha), l_bg)
        margin = r - floor
        if known:
            tag = 'KNOWN'
            allowlisted.append((role, r, floor))
        elif r >= floor:
            tag = 'ok'
            results.append((role, r, floor))
        else:
            tag = 'FAIL'
            failed.append((role, r, floor))
        tail = f"  {known}" if known else f"  margin {margin:+.2f}"
        print(f"{tag:5} {role:52} alpha={alpha:.2f}  {r:5.2f}:1{tail}")
    return results, failed, allowlisted

def main(theme_path):
    t = load(theme_path)
    flat_ok, flat_failed = check_flat(t)
    alpha_ok, alpha_failed, allowlisted = check_alpha(t)

    if flat_failed or alpha_failed:
        total_failed = flat_failed + alpha_failed
        print(f"\n{len(total_failed)} role(s) under AA:", file=sys.stderr)
        for label, r, floor in total_failed:
            print(f"  {label}: {r:.2f} < {floor}", file=sys.stderr)
        return 1

    checked = len(TEXT_ROLES) + len(ALPHA_TEXT_ROLES)
    passing = flat_ok + alpha_ok
    lowest_label, lowest_ratio, _ = min(passing, key=lambda row: row[1])
    print(
        f"\n{checked} roles checked "
        f"({len(TEXT_ROLES)} flat + {len(ALPHA_TEXT_ROLES)} on-inverse alpha), "
        f"{len(allowlisted)} allowlisted (pre-existing, tracked above), "
        f"{len(passing)} clear AA -- lowest {lowest_ratio:.2f}:1 ({lowest_label})"
    )
    return 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1
                  else 'src/styles/themes/_press-room.scss'))
