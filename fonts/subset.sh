#!/usr/bin/env bash
# Re-subsets the Merriweather / Merriweather Sans .woff2 files in this
# directory, in place, from the Fontsource originals.
#
# Why this exists: the fonts as shipped by Fontsource carry ~231 glyphs
# and a full set of OpenType feature tables, most of which this site will
# never use. The range below keeps all of Latin-1, Latin Extended-A,
# Greek, typographic punctuation, arrows, common maths symbols, primes
# and the f-ligatures — comfortably more than the site's own text needs,
# so ordinary edits can't fall through to a system font — and drops only
# the combining diacritics, which have no use here because every accented
# character in these ranges is available precomposed.
#
# Deliberately NOT subset to the ~109 characters the site actually uses.
# That cuts about 60% instead of 17%, but it turns every future edit into
# a font-regeneration step: type a character nobody thought of and it
# silently renders in a fallback face. The conservative range needs
# re-running only if the site ever gains a non-Latin script.
#
# Usage:  ./subset.sh /path/to/fontsource/originals
# Requires: pip install fonttools brotli
set -euo pipefail

SRC="${1:?usage: ./subset.sh /path/to/originals}"
DEST="$(cd "$(dirname "$0")" && pwd)"

RANGE='U+0020-007E,U+00A0-00FF,U+0100-017F,U+0192,U+01FA-01FF,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03CE,U+2000-200B,U+2010-2015,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2032-2033,U+2039-203A,U+2044,U+2074,U+20AC,U+2113,U+2122,U+2126,U+212E,U+2190-2199,U+21B5,U+2202,U+2206,U+220F,U+2211-2212,U+2215,U+221A,U+221E,U+222B,U+2248,U+2260,U+2264-2265,U+25CA,U+2713,U+2717,U+2794,U+27A2,U+FB01-FB02'

for f in "$SRC"/*.woff2; do
  name="$(basename "$f")"
  pyftsubset "$f" \
    --unicodes="$RANGE" \
    --flavor=woff2 \
    --layout-features='kern,liga,ccmp,locl,mark,mkmk,rlig' \
    --name-IDs='*' \
    --notdef-outline \
    --output-file="$DEST/$name"
  printf '%-40s %7s -> %7s\n' "$name" \
    "$(stat -c%s "$f")" "$(stat -c%s "$DEST/$name")"
done

echo
echo "name ID 0 (copyright) and 14 (licence URL) are preserved by --name-IDs='*';"
echo "check with: python3 -c \"from fontTools.ttLib import TTFont; print([n.toUnicode() for n in TTFont('$DEST/merriweather-400-normal.woff2')['name'].names if n.nameID in (0,14)])\""
