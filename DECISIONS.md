# DECISIONS.md — why the CSS looks the way it does

`css/style.css` used to carry its own history inline. Roughly 60% of that
file was comment, and much of it was not describing what a rule does but
recounting how it got there: measurements taken, approaches tried and
reverted, bugs reported on a real phone and chased down, browser quirks
identified by name. All of that is worth keeping — it is the reason the
same problem never has to be solved twice — but it is not what you want
to read past when you open the file to change a colour.

So the two jobs are split. The stylesheet keeps a short line per rule
saying **what it does now**. Every long note has moved here, unabridged,
and the stylesheet points at it by number: `→ DECISIONS.md §37`.

Nothing was rewritten on the way over. These are the original notes,
verbatim, only re-flowed as prose. The lettered entries at the end (§A
onward) are new, and cover changes made after the split.

**Adding a rule that needs more than a line of explanation:** put the
line in the stylesheet, the reasoning here, and number it after the last
entry. Renumbering an existing one means editing the stylesheet too, so
don't — retire an entry by marking it obsolete rather than removing it.

---

## Index

The numbered entries (§1–§84) are the original per-rule notes, in
stylesheet order — so this list doubles as a map of the stylesheet
itself. The lettered entries (§A onward) are changes made after the
split and are each about a decision rather than a rule.

**By theme, §1–§84**

| | |
|---|---|
| §1–§3, §6 | Foundations: `@font-face`, `html`, the universal reset, text-size-adjust |
| §4–§5 | Skip link, scroll lock |
| §7–§12 | The nav: fixed bar, hover, the 67.5em burger threshold, notched phones |
| §13–§18 | `main`, page headings, subtitles, `strong` |
| §19–§20 | Link colour as a custom property, and its contrast measurements |
| §21–§25 | Reveal-on-scroll images, side rows, source lines, document headings |
| §26–§27 | The landing-page cards |
| §28–§29 | Quercia: background overlay and the translucent band |
| §30 | Gallery page container |
| §31–§34, §36–§47 | The clump photos: stage, rows, badges, the Quercia variant, landscape phones |
| §35, §69 | The discorso scroll hint |
| §48–§49 | Text window, lightbox trigger |
| §50–§56 | Gallery grid and lightbox |
| §57–§68 | The document viewer |
| §70 | Image badges |
| §71–§72 | The language switcher |
| §73–§83 | The home essay: block, masthead, epigraph note, hero, photos, reveal, ornament, divider |
| §84 | `.visually-hidden` |

**Lettered entries**

| | |
|---|---|
| §A | Headings and lists inside figcaptions |
| §B | From px to rem |
| §C | The language pill |
| §D | The landscape footer, and the badge sizes |
| §E | `backdrop-filter` without `backdrop-filter` |
| §F | The structured-data graph, the fonts, the lightbox alt |
| §G | Scroll restoration on back navigation — *superseded by §H* |
| §H | Scroll restoration, taken over rather than arranged for |
| §I | What the Creative Commons line actually covers |
| §J | The breakpoint ladder, and why it stays six rungs |
| §K | Image loading is animation timing on this site |
| §AA | The nav bar grew with the type; its box did not |
| §AB | A dialog open at print time, and the gallery's missing spinner |
| §AC | The invalid figcaption, and why it stays |
| §AD | The gallery lightbox on a phone: paint order, viewport caps, gear placement |
| §AE | The burger opened behind the focus, and the pill's real containing block |
| §AF | Patent list: priority year instead of grant year |
| §AG | The two French entries replaced by their German family members |

---

## §1 — `@font-face`

> Merriweather and Merriweather Sans, self-hosted under the SIL OFL, so no request ever leaves for a third-party font server. Every font-weight declared in this file has a real loaded face behind it.

Merriweather & Merriweather Sans, self-hosted (SIL Open Font License — see
fonts/OFL-merriweather.txt and fonts/OFL-merriweather-sans.txt, two separate
families/copyright holders despite the shared name) instead of loaded from
Google Fonts, so no request/IP is ever sent to a third-party server. Weights
loaded: Merriweather 300/400/700/900 (+ 400 italic); Merriweather Sans
300/400/700/800 (+ 400 italic) — the 800 face was added for the five sans page
titles below, which previously declared font-weight:900 with no matching sans
face at all, silently resolving to 700 (see the h1 rule further down). Every
font-weight declaration in this file now matches an actual loaded face for
whichever family is active at that point, never a value like 600 that would
just resolve to the nearest one available instead of rendering as requested.

## §2 — `html`

> Every font-size in this file is in rem, and they all resolve against this one value — which is the reader's own browser setting, not a number of ours.

Every font-size in this file is now in rem, so they all resolve against this
one value — and this one value is the reader's own browser setting, not a
number of ours. 100% is what makes that true: it means "whatever the user
asked for", where the more common html{font-size:62.5%} trick would silently
override a larger default back down. Sizes that are structural rather than
textual (padding, radii, borders, breakpoints for layout) stay in px on
purpose. See §B below.

## §3 — `*`

> Suppresses the default tap highlight mobile browsers draw over any tapped link or button.

Mobile browsers apply their own default tap-highlight (often a translucent
blue) to any tapped link/button unless told not to — never reset anywhere in
this file before. Best available hypothesis for a reported stray blue line
near the nav after closing a lightbox on mobile portrait: a lingering
highlight rect from the tap that opened or closed the dialog, surfacing
through whatever repaint the scroll-lock/unlock and scroll-to-0 sequence
triggers. Not confirmed live this round — couldn't get a mobile browser
session working to reproduce it — so treat this as the first, safe thing to
try rather than a confirmed fix; flagged in the response to ask for a
screenshot if it's still there after this.

## §4 — `.skip-link`

> Skip link: the first focusable thing on every page. Off-screen until focused, then it drops into view above the nav.

Skip link: the first focusable thing on every page, so a keyboard user doesn't
have to tab through the whole nav bar on every single page load just to reach
the content. Off-screen until focused (not display:none/visibility:hidden,
which would also remove it from the tab order) — then it drops into view above
the nav so it reads before the brand/links, not on top of them.

## §5 — `.body-scroll-locked`

> On <body> for as long as either dialog is open, so the page's own scrollbar doesn't sit visible behind it.

Applied to <body> for as long as either dialog is open (see
initLightbox()/initDocViewer() in animations.js) — without this, the page's
own scrollbar stays visible behind the dialog even though showModal() already
prevents the page itself from actually scrolling; visually confusing next to
the dialog's own scrollbar. scrollbar-gutter:stable on <html> above means this
never causes a layout shift: the gutter space stays reserved whether or not a
scrollbar is actually drawn in it.

## §6 — `body (-webkit-text-size-adjust)`

> Stops iOS Safari's "font boosting" heuristic from rescaling text on its own between portrait and landscape.

Stop iOS Safari from silently rescaling text size based on the ratio of a
block's width to the viewport (its "font boosting" heuristic for readability
in narrow columns) — without this, the same element can render at a different
visual size between portrait and landscape purely from that ratio changing,
with no font-size rule of ours actually changing

## §7 — `body (padding-top)`

> Reserves room for the fixed nav, in rem so the gap grows together with the bar's own type.

Reserve space so the fixed nav doesn't cover the top of the page content. In
rem, like the bar's own type: with a px value here and rem type up there,
raising the browser's default font size grew the bar but not the gap under it,
and the nav ended up sitting on the first line of every page. Slightly over-
reserved at large sizes (some of the bar's own metrics are still px), which is
the harmless direction to be wrong in.

## §8 — `.site-nav`

> Site nav: fixed bar, hides on scroll down and returns on scroll up. Floats at max-width 59.375rem (950px at a 16px default) — wider than main and footer's shared 760px, on purpose. In rem, so the bar widens with the labels it holds, like the 67.5em breakpoint below.

Site nav: fixed bar, hides on scroll down, reappears on scroll up. Floats
narrower than full width (max-width 59.375rem, 950px at a 16px default —
measured to comfortably fit brand + 5 links on one line with real margin,
while still reading as a floating panel like the footer; in rem since §AA, so
the bar grows with those labels). Flush with the top edge, so only the bottom
corners round — mirrors the footer, which is flush with the bottom edge and
rounds only its top corners. It doesn't match main/footer's 760px on purpose, not
from inconsistency: main and footer already share the same value, and the
clump's resting frame (further down) lines up with them too, within a couple
of pixels for the photos' drop shadow. The nav stays wider deliberately —
narrowing it to match would cramp the menu items and the space around the
signature, tuned separately for its own reason (breathing room for a
horizontal menu, not the text-reading measure the other three share).

## §9 — `.nav-links a:hover`

> Hover carries the underline only; the weight change is on .active, which is set in the markup and never changes while the page is open.

The weight change is now on .active only, not on :hover. Both used to bold the
link, and bolding a nowrap item inside a space-between flex row makes it
wider, which pushes every sibling sideways for as long as the cursor sits on
it — five links jumping around under the pointer. .active is set once in the
markup and never changes while the page is open, so it can carry weight
without any of that; hover keeps the underline, which is a normal enough
affordance on its own. (The alternative — a hidden bold ghost via
content:attr() reserving the wider box — needs a data-text attribute
duplicating every link label in all 14 pages, and one more thing to keep in
sync at every edit.)

## §10 — `@media (max-width: 67.5em)`

> Mobile: thin bar with brand left and burger right, links folding into a dropdown. In em rather than px, because what this threshold measures is how much room six text labels need.

Mobile: thin bar with brand left, burger right; links become a dropdown.
Threshold raised to 1080px: with the real Merriweather Sans font (wider than
the fallback), the nav-inner needs more room before it fits on one line
without wrapping. Expressed in em (67.5em = 1080px at a 16px default) rather
than px, because what this threshold is really measuring is how much room six
labels of text need — so it has to move when that text moves. With the labels
in rem, a reader on a 20px default font gets a bar whose contents are 25%
wider, and a fixed 1080px cutoff would have left them on the one-line desktop
layout well past the point where it still fits. An em query resolves against
the browser default, so the cutoff scales with exactly the thing it's
guarding.

## §11 — `.site-nav (padding, notched phones)`

> Keeps the normal 20px on phones without a notch, and grows past it where a landscape notch would otherwise sit on the brand or the burger.

Max(), not a plain env() fallback: keeps the normal 20px on phones without a
notch (env() resolves to 0 there, and max() just keeps the 20px), but grows
past it in landscape on a notched iPhone, where the notch relocates to a side
edge and can otherwise sit right on top of "Teresio Gassino" or the burger
icon. Only takes effect together with the page's viewport-fit=cover meta tag,
already set — without it env() always resolves to 0 and this is a no-op.

## §12 — `.nav-links`

> visibility:hidden takes the closed dropdown out of the tab order and the accessibility tree, which the max-height/opacity/pointer-events trio never did.

Visibility:hidden, not just the max-height/opacity/pointer-events trio this
used to rely on. Those three collapse the dropdown visually and block the
mouse, but none of them removes anything from the tab order or the
accessibility tree — pointer-events stops a pointer, it has no say over the
keyboard. So a keyboard user on any screen below the nav breakpoint, where
these six links are supposed to be folded away behind the burger, tabbed into
six invisible links after the brand and had focus disappear for six stops.
visibility:hidden closes both doors at once (not focusable, not announced)
and, unlike display:none, still animates, since it's a transitionable
property. The 0s delay equal to the open animation's own duration is what
keeps that animation intact: on close, visibility flips only once max-height
has finished collapsing, so the panel is still painted while it slides shut
instead of vanishing on frame one. On open, .nav-links.open resets the delay
to 0s so it becomes visible immediately and the slide-down is visible from the
start.

## §13 — `main (outline)`

> No focus ring on <main> itself: its tabindex="-1" exists only as a target for the skip link to move focus to, never as something to draw a box around.

Found via Safari's own Web Inspector: this is the actual element behind the
reported blue line, not either dialog or their scroll containers (both wrong
guesses tried first). tabindex="-1" (on the <main id="main"> tag itself) makes
this programmatically focusable purely so the skip link has something to move
focus to — that's a mechanical target, never meant to show a visible ring
around the entire page's content; the real feedback for a skip-link jump is
the page scrolling there, not an outline. Unconditional, not scoped to :focus-
visible: why focus lands here after closing a dialog, on Safari specifically,
isn't fully understood, so this guarantees no ring renders regardless of the
exact mechanism rather than depending on getting that heuristic right too.

## §14 — `main > *:last-child`

> Zeroes the trailing margin of whatever element happens to close a page, so the gap down to the footer is one predictable value everywhere.

Whatever type of element happens to close a page (p, figure, div...) carries
its own trailing margin, which otherwise stacks on top of main's own padding-
bottom and makes the gap to the footer vary by page depending on content type.
Zeroing it here makes that gap a single, predictable value everywhere.

## §15 — `body.page-home main`

> Extra bottom padding on Home, so the closing fregio keeps a visible gap above the fixed footer even on a notched phone.

The fregio is now main's own last child (the fonte line that used to close the
page moved up into the masthead), so the last-child rule above zeroes its own
48px bottom margin — the same 48px it still keeps above itself. On mobile that
leaves only the generic 61px padding-bottom to clear the fixed footer, which
on notched phones (safe-area-inset-bottom padding pushing the footer past
~65-70px tall with its two-line credit text) can eat the padding entirely and
leave the fregio with no visible gap at all. Adding back the 48px it lost
keeps the gap below it equal to the gap above it, clearing even the tallest
notched-phone footer with room to spare. Desktop doesn't need this: its footer
is short enough (~38px, see body.page-galleria main below) that the generic
98px padding already clears 48px+38px on its own.

## §16 — `body.page-index h1, body.page-logos h1, body.page-discorso h1, body.page-curriculum h1…`

> The five section-index pages take a sans title; Home's masthead and Quercia keep the serif h1. Weight 800, the heaviest cut this family actually has.

Five section-index pages (landing, Logos 27, Discorso, Curriculum, Foto) get a
sans title instead of the default serif — home.html's essay masthead and
quercia.html keep the serif h1 untouched. font-weight:800, not 900:
Merriweather Sans has no 900 cut at all (the family tops out at 800 — see the
new @font-face above), so a 900 request here was silently resolving to 700 the
whole time, same as the plain h1 rule everywhere else on the site. 800 is the
heaviest weight that's actually real for this family. No letter-spacing here
(unlike .brand/.nav-links a below): the old 700-fallback made this rule render
as literally the same face the navbar uses, so the same +0.3px tracking read
as consistent by coincidence. Now that this loads its own real 800 cut — a
different, more tightly-drawn face — that coincidence is gone, and adding
navbar tracking on top of it has no remaining reason. Left at the font's own
natural spacing.

## §17 — `h1:has(+ .page-subtitle)`

> Dek-style subtitle under those five titles: serif italic, deliberately a different register from the sans title just above it.

Dek-style subtitle under the h1 on the five sans-title pages above: serif
italic, quieter than body copy, deliberately a different register from the
now-sans title just above it. Tightens the gap to the title (h1's normal
margin-bottom is sized for body content, not for a subtitle sitting right
underneath) and takes over h1's usual role of separating the title area from
whatever follows.

## §18 — `body.page-logos strong, body.page-curriculum strong`

> On these two label-dense pages the short bold lead-ins take the 900 cut, so they read as landmarks rather than as ordinary emphasis.

Logos 27 and Curriculum: the bold lead-ins inside the color-band figcaptions
(article headings, document names, patent labels) get the heavier 900 cut
instead of the browser-default bold (700) — these two pages are dense with
short bold labels, so the extra weight helps them read as landmarks in the
text rather than blending into ordinary emphasis.

## §19 — `:root`

> Link colour as a custom property, so each background context can override it locally instead of every context needing its own fully-specified selector.

Link colour, as a custom property so each background context can override it
locally instead of every context needing its own fully-specified selector:
:root sets the default for the dark page background and .essay-block cards
(8.49:1 on #101010), and the two contexts below override --link where the
default would fail or read poorly — .color-band (light pastel cards) needs
something much darker, .ritagli-band (translucent light-grey band) needs
something lighter again. Every `a` just reads var(--link); which value wins is
resolved by normal inheritance/cascade, not by selector specificity, so
there's no risk of one context's rule accidentally outranking another's the
way two selectors targeting the same property can.

## §20 — `--link: #699EC6`

> Same hue family as the brand blue, at a lightness tuned for this context: 6.62:1 on the page background, 5.47:1 on .essay-block.

Same hue as the brand blue (#2974AE, itself derived from the #CEDCE6 card band
— see sfondi/firma.svg) and as .color-band's link colour below: one hue family
across three lightness/ saturation points tuned per context, not one recycled
hex value. 6.62 on #101010, 5.47 on .essay-block (#232323, this page's
strictest context) — comfortable margin above the 4.5 AA floor without
drifting into the highlighter-bright territory a lighter step on this scan
lands in.

## §21 — `.js .reveal-img.visible img`

> The .js prefix is here purely to match the specificity of the .from-right rule above, so source order gets to decide again.

.js prefix added here too, purely to match the specificity of the .from-right
rule above (both now: .js + 2 more classes + img). Without it, this rule's
lower specificity (.reveal-img.visible img, one class short) lost to .js
.reveal-img.from-right img regardless of source order once both classes were
present on the same element — so a "from-right" image would reach .visible but
stay stuck at its +60px starting offset forever, never settling into place.
The .js prefix is functionally redundant on its own (.visible is only ever
added by the same script that adds .js), but it's what restores the tie that
lets source order decide again, same as before the .no-js/.js split existed.

## §22 — `.side-row`

> Side-by-side figure: image and description next to each other. The figcaption sits inside .side-row rather than as a direct child of <figure>, which the W3C validator flags as a content-model error.

Side-by-side figure: image + description next to each other --- figcaption
sits inside .side-row here, not as <figure>'s direct first/last child — a W3C
validator flags this as a content-model error. Left as-is deliberately: making
figcaption a true direct child means switching this layout from flex to CSS
Grid, which changes how row height gets computed for the text-driven image
stretch used on the Logos 27 page, and needs its own compensating fix per card
(cropping, column width) to match. Tried once, reverted — the validator
warning has no real accessibility cost (screen readers still associate the
caption correctly regardless of DOM position within the figure), so it wasn't
worth the risk to a hand-tuned layout.

## §23 — `.fonte-row`

> A second row below the image+text one, with an invisible spacer standing in for the image column, so the Fonte line stays indented in line with the text.

Fonte-row: a second side-row below the image+text one, with an invisible
spacer standing in for the image column, so the Fonte line stays visually
indented in line with the text — without contributing its height to the
image's stretch (see Logos 27, where letting Fonte's height affect the stretch
crushed the image into an oddly narrow crop for the two longer entries).

## §24 — `.reveal-img.side figcaption .doc-heading`

> The line already doing a title's job — the document's name and what it is — is a real <h2> now; font:inherit undoes h2's own defaults so it renders exactly as that first line did.

The line that was already doing a title's job — the document's name and what
it is — is now an <h2> instead of a bold run at the head of a paragraph.
font:inherit undoes all of h2's own defaults (20px, 700, 36px top margin) so
it renders exactly as that first line did, with the leading <strong> still
carrying the weight.

## §25 — `body.page-logos .side-row`

> On Logos 27 the image stretches to whatever height the text naturally takes, since the four entries carry very different amounts of it.

Logos 27 specifically: the image stretches to match whatever height the text
naturally takes (rather than a fixed aspect ratio), since the four entries
have different amounts of text — this keeps every image/text pair matched in
height without picking one fixed size that would only fit one of them
correctly.

## §26 — `.cards`

> The landing page's four link-cards, moved here from an inline <style> block that was duplicated identically in both index files.

Index landing page: the four link-cards to the site's main sections.
Previously duplicated as an inline <style> block on index.html and
en/index.html — identical in both, so it belongs here instead. The image
darkens on hover using the same technique and value as the color-band photo
links elsewhere (.side-row > a::after), so the two "photo you can click"
patterns on the site read as one convention rather than two different darken
amounts.

## §27 — `.card::after`

> Hover darkens the whole coloured card rather than just the photo, at the same value used for the photo links elsewhere on the site.

Hover-darken the whole colored band, not just the photo — an overlay on .card
itself, clipped to its own border-radius by overflow:hidden above, using the
same value as the color-band photo-link darkening elsewhere (.side-row >
a::after) so it's the same convention, just scoped to the full card here.

## §28 — `body.page-quercia (background overlay)`

> Overlay raised from the site's usual 0.75 to 0.85 — a measured fix for a real contrast failure, not a style preference.

Overlay raised from the site's usual 0.75 to 0.85 — measured fix for a real
contrast failure, not a style preference. Verified by compositing the actual
render stack pixel-by-pixel (sgimignano.svg under the gradient, blurred, under
.ritagli-band's own translucent white): at 0.75 the text minimum was 3.39:1
and the link minimum 2.95:1, both failing WCAG AA, over 15–33% of the band's
area. Unlike discorso's watermark (a repeating texture, which the blur evens
out), sgimignano.svg is one large no-repeat illustration with big plain-white
areas the blur can't flatten — those areas were the failure. At 0.85 (paired
with .ritagli-band's own lowered alpha just below) the minimums become 5.40:1
and 4.70:1, 0% of the area below threshold. Raising the white band's alpha
instead of the overlay was tried and made it worse — it brightens the backdrop
sitting behind light-colored text, the wrong direction entirely.

## §29 — `body.page-quercia .ritagli-band`

> Paired with the raised overlay above, and scoped to Quercia only: Discorso's own band already passed.

Paired with the raised overlay above — see that rule's own comment for the
measured numbers this combination produces. Scoped to quercia only: discorso's
own .ritagli-band already passed (its watermark is a repeating texture the
blur evens out), so it's left at the site's base 0.25 rather than changing a
page that didn't need it.

## §30 — `body.page-galleria main`

> Extra clearance under the last row of photos: this page's background SVG renders its lines solid white if the grid crowds the fixed footer.

The background SVG on this page loses its opacity control and its lines render
solid white (#fff) if the last row of photos sits too close to the footer bar
— the footer itself is position:fixed and 38px tall, eating into whatever
padding is reserved here, so this is 105px (the real target) + 38px (footer's
own height) = 143px, not 105px directly, to get a true 105px of visible
clearance

## §31 — `.clump-stage`

> Clump: several images slide in together from different sides and land clustered, with the page's text below. Each photo sets its own start and resting offsets inline.

Clump: several images slide in together from different sides and land
clustered with spacing between them, then page text follows below. Each
.clump-photo sets its own --fx/--fy (start offset) and --tx/--ty (resting
offset) inline, so the same keyframe works for all of them. The stage bleeds
slightly past main's padding (negative margin) to give the photos more room to
actually grow larger.

## §32 — `#clump-row-1, #clump-row-2, #clump-row-3`

> Scroll targets for the highlighted words in the ritagli-band, offset so the fixed nav doesn't land on top of the photo.

The three in-page scroll targets the ritagli-band's highlighted words jump to
(#clump-row-1/2/3, see discorso.html) — offset so the fixed .site-nav doesn't
land directly on top of the photo. 100px clears the nav's own rendered height
(≈58px desktop, ≈50px mobile) with some breathing room to spare, so one value
covers both rather than needing a breakpoint-specific one.

## §33 — `.clump-badge`

> The badge sits over the blank paper margin at the bottom of each scan, never over the typed text the zoom exists to make legible.

Badge: sits over the blank paper margin at the bottom of each scan (verified
on all six images — narrowest is sartor.webp, still ~7% of clear white space
even after the crop), not over the typed text, so it doesn't compete with the
exact thing the zoom exists to make legible. Hidden by default; only ever
shown inside the hover-capable block below — on touch it never renders, which
is deliberate (see that block's comment).

**Note (see §D).** On Quercia the badge *is* meant to render on touch, and for
a long time it didn't. The cause was not this rule but the two stacked-layout
blocks, which set `.clump-photo { position: static }` and so removed the photo
as a containing block: both badges escaped up to `.clump-stage` and piled up on
top of each other in the middle of it. Those are `position: relative` now.

## §34 — `.clump-photo.settled`

> Hover zoom gated twice on purpose: on .settled, because an animation's forwards fill outranks a :hover transform, and on a real mouse, because touch has no true hover.

Hover zoom: gated two ways on purpose. 1) .settled — added by JS on
animationend. While clumpIn is still running, the animation's forwards fill
holds `transform` at a priority normal author rules can't beat (CSS animations
outrank plain-specificity author declarations in the cascade), so a :hover
transform here would silently do nothing until the animation ends anyway.
Waiting for .settled sidesteps that entirely instead of fighting it with
!important, and also avoids the transform being reset mid-flight if the cursor
happens to already be sitting where a photo lands. 2) (hover: hover) and
(pointer: fine) — real mouse only. Touch has no true hover; a tap would latch
the zoomed state until the next tap elsewhere, which reads as broken, not
zoomed.

## §35 — `.discorso-hint`

> On a hover-capable pointer the per-photo badge already does this job, so the page-level banner would only be saying the same thing twice.

The top-of-page hint is what told touch users (and mouse users, before this)
to click a photo. On a hover-capable pointer the per-photo badge now does that
job at the moment it's actually useful, so the page-level banner would just be
saying the same thing twice — once abstractly at the top, once concretely on
the image itself. Left untouched for touch, where the badge never appears and
the banner is still the only signal there is.

## §36 — `@media (max-width: 800px)`

> Below this the clustered layout gives way to a plain vertical stack. Raised from 640px: the cluster's fixed pixel offsets were being clipped between 641px and roughly 760px.

On narrow screens, drop the clustered layout entirely and stack the images
vertically at a readable size, instead of shrinking them. Threshold raised
from 640px to 800px — this was a real clipping bug, not a taste adjustment.
The clustered layout is built from fixed pixel offsets: two 370px-wide photos
at --tx:-378px and --tx:8px span 756px in total, centred on .clump-anchor, and
quercia's own pair spans 712px the same way. Neither shrinks with the
viewport. Between 641px (where the old mobile rule stopped applying) and
roughly 760px the cluster was therefore wider than the column it sits in, and
because body carries overflow-x:hidden the overflow wasn't even scrollable —
the outer edge of each column was simply cut off, with no way to reach it.
That band is not hypothetical: it's iPad mini portrait (744px) and a good part
of the Android tablet range. 800px clears 756px with room for the photos' own
drop shadow, and the clustered layout only starts where there's actually space
to draw it.

## §37 — `.clump-photo, .clump-photo.settled`

> Explicit reset at .settled's own specificity: rotating to portrait doesn't remove that class, and the old grid offset was surviving into the stacked layout.

Explicit reset, matching .clump-photo.settled's specificity: that rule pins a
translate() offset once the entrance animation ends, which only ever happens
in the desktop/landscape grid layout. Rotating from there to portrait doesn't
remove the .settled class (nothing tells it to), so without this the old grid
offset was still being applied on top of the new stacked layout — the
"scattered with big gaps" bug.

## §38 — `body.page-quercia .clump-stage / .clump-photo (Quercia's clump)`

> Quercia's clump reuses Discorso's markup and mechanics wholesale; only the resting position, the per-card frame and the shared launch side differ.

Quercia's own clump: same .clump-stage/.clump-anchor/.clump-photo markup and
mechanics as discorso (reused wholesale — initClumpPhotos() in animations.js
just selects every .clump-photo on the page, so nothing there needed to
change) — entrance animation, hover-zoom, hover-reveal badge, all unchanged.
Three things differ from the earlier overlapping-diagonal version: (1) the
resting position — side by side now, at the same y; (2) each photo now carries
its own padded, translucent, blurred frame — same look as .ritagli-band, at
double its 22px padding (44px) — the whole time the animation runs, since it's
on .clump-photo itself, the element the animation actually transforms, not
something added only once it settles; and (3) both photos now launch from the
same off-screen point on the right (--fx:900px on both, in quercia.html /
en/quercia.html), not from opposite sides — confirmed live that having one
photo fly in from the left was itself the source of a Chrome-only animation
lag (absent on Firefox, and never affecting the photo arriving from the
right), unrelated to the backdrop-filter blur also on this element. Since both
now share a launch point, they're staggered instead: different
--delay/animation-duration per photo (set inline, not here — see the comment
above .clump-photo img below) so the left-bound photo starts first and lands
first, while the right-bound one enters mid-flight and lands just after —
still reads as motion from two directions despite the shared origin. The
horizontal rhythm at rest: ritagli-band's own left edge, then card 1 (44px
padding, photo, 44px padding), a gap, card 2 (same), ritagli-band's own right
edge — three equal 32px gaps in total (outer-left, between the cards, outer-
right), computed against 712px (main's typical full-width content column: 760
− 48 padding): two 340×244 cards (281×185 photo + 29.33px padding — 22px × 4/3
— on every side — equal to .ritagli-band's own text padding, not doubled
anymore) plus three 32px gaps sum to exactly that, landing the pair
symmetrically on their own by construction (see the inline --tx values in
quercia.html) rather than needing a separate centering calculation. The same
32px also reappears vertically, between ritagli-band's own bottom padding-edge
and the cards' top padding- edge — via ordinary margin collapse between
.ritagli-band's bottom margin and .clump-stage's top margin (32px/0). That
collapse logic was right, but the numbers behind it weren't: the stage was
taller than the card (260 vs 254) with ty:0, and .clump-anchor sits at top:50%
of the stage — so the card's top edge actually landed 130px down into the
stage before the margin collapse ever got a chance to apply, not flush with
the stage's own top edge like the math assumed. That's the "enormous" gap
reported. Fixed by making the stage exactly as tall as the card (no slack) and
centering the card on the anchor via ty = −half its own height (−120px), so
its top edge lands exactly on the stage's own top edge, where the collapse
math actually applies.

## §39 — `@media (min-width: 801px)`

> Unlike Discorso's, this stage isn't bled past main's padding, and it is exactly as tall as the card, with no internal slack.

Unlike discorso's stage, this one isn't bled past main's own padding via a
negative margin — asked to keep any overflow bounded by ritagli-band's own
side margins rather than widening the stage past them. 244px: exactly the
card's own height, no internal slack — see this block's opening comment for
why that matters here. Kept as the exact inverse of the generic stacking rule
above, so it moved from 641px to 801px along with it — see that rule's own
comment for the clipping bug behind the change.

## §40 — `body.page-quercia .clump-photo (animation-duration)`

> animation-duration is set inline per photo in quercia.html, not here: the two travel different distances and are meant to land at different times.

Animation-duration is NOT set here anymore — the two photos now launch from
the same off-screen point on the right but travel different distances and land
at different times by design (the left-bound photo arrives first; the right-
bound one enters mid-flight and lands just after), so each carries its own
animation-duration inline in quercia.html / en/quercia.html instead of sharing
one page-level value — same place --delay has always lived, via the base
.clump-photo rule's animation-delay: var(--delay, 0s).

## §41 — `body.page-quercia .clump-photo:first-child`

> Visual order swapped on mobile without touching DOM order, which still controls the desktop z-stacking.

Visual order swapped on mobile (both portrait and landscape, both flex
layouts) — without touching DOM order, which still controls the desktop
z-stacking from the "invert which is on top" round. `order` is a flex/grid-
only property, a no-op under desktop's position:absolute layout, so this can
sit unconditionally rather than needing its own media query.

## §42 — `@media (min-width: 801px)`

> The exact inverse of the stacking breakpoint above, so this fixed width never outranks that rule's width:100% reset on specificity.

Scoped to min-width:801px — the exact inverse of discorso's own mobile
breakpoint (max-width:800px) — so this never fights that rule's width:100%
mobile reset on specificity. Both numbers moved up together (from 641/640)
when that rule's clipping bug was fixed; the inverse relationship, which is
the part that matters here, is unchanged. Left unscoped once before, its fixed
width beat the generic mobile rule's width:100% on specificity regardless of
media query, pushing a photo off the right edge of the viewport — the actual
overflow reported back then. 340×244 is the CARD size — padding included, not
just the photo — see this block's own opening comment for the three-equal-
gaps math this comes from (281×185 photo + 29.33px padding on every side =
340×244 card). Because this sizing (and the padding/ background/blur right
below, which is what makes each card look like a small ritagli-band) is on
.clump-photo itself — the element the entrance animation actually transforms —
the frame is there from the very first frame of the fly-in, not just at rest.

## §43 — `body.page-quercia .clump-badge`

> Always visible on touch, where this page has no hint banner to carry the job, and positioned at 1/7 of the photo's own height so one rule holds at any size.

Badge visible unconditionally on touch (no page-level hint banner here, unlike
discorso's .discorso-hint, so it has to carry that job on its own on a screen
with no hover at all) but hover-only on an actual mouse, matching discorso's
own behaviour there — see the hover-capable media query below. bottom:1/7 of
the photo's own height, not a fixed pixel value: the containing block for this
absolute position is .clump-photo a, whose own height IS the photo's rendered
height (the padding lives on its parent, .clump-photo, not on this element),
so this one rule is correct at any size — desktop or mobile — without separate
breakpoint-specific numbers.

## §44 — `@media (max-width: 800px)`

> The generic stacking rule above already handles the portrait layout; this adds the ritagli-styled frame and the two photos' real aspect ratio.

The generic stacked-mobile rule above (max-width:800px) already gives
quercia's photos the right portrait treatment for free — same static/no-
animation reset discorso's own six photos get. This adds the same ritagli-
styled frame the desktop cards get above (padding at 4/3 of .ritagli-band's
own 22px text padding (≈29.33px), same background/blur/radius) — missing here
before, added now — and swaps the generic 14/9 aspect-ratio for these two
photos' real one (630×415), so the mobile crop matches the desktop object-
fit:cover crop rather than a compromise ratio tuned for discorso's varied
source scans. Badge sized up to match .discorso-hint's own scale (that page's
equivalent page-level hint), since a badge this size is now the primary "these
are clickable" signal on a touchscreen, not a small corner label — its
position (bottom:1/7 of the photo's height) comes from the shared rule above,
not repeated here.

## §45 — `@media (max-height: 500px) and (orientation: landscape)`

> The landscape-phone case, keyed on viewport height rather than width: a rotated phone is very often wider than the breakpoint above.

The landscape-phone case is its own thing, not just "the portrait rule at a
different width": a phone rotated sideways is very often wider than the 800px
breakpoint above (some land in the 800–930px range there), which would
otherwise leave it in the desktop/ animated branch by mistake. Keyed on
viewport HEIGHT instead — reliably short on an actual phone regardless of its
rotated width, where a genuine landscape desktop or tablet window is
comfortably taller than the 500px cutoff used here. Written to stand on its
own (not assuming the max-width:800px rule already ran, since at these wider
landscape widths it may not have).

## §46 — `body.page-quercia .clump-badge`

> Badge sizing repeated rather than shared, because this block deliberately stands on its own.

Size calibration matches the portrait badge above — duplicated rather than
shared because this block already stands on its own (see its own opening
comment) rather than assuming the max-width:800px block ran first. Position
(bottom:1/7 of the photo's height) comes from the shared rule further up, not
repeated here.

## §47 — `@media (orientation: landscape) and (max-height: 500px)`

> Landscape phones are generously wide but very short, and the footer is fixed: everything goes onto one line here.

Landscape phones: width is often generous (700px+) even on small devices, so
the max-width breakpoint above doesn't catch them — but height is very short
(350-420px), and the footer is position:fixed, so it needs to be even more
compact here regardless of width. Force everything onto a single line since
landscape width is rarely the constraint, height always is. No border-radius
override here on purpose: whether the footer should be square (edge-to-edge,
on a narrow phone that also matches the max-width:700px block above) or
rounded (floating with visible side margins, its own max-width:760px never
reaching the actual screen edges — the common case on iPhone-mini-and-up-width
landscape phones, where this query alone applies) depends on width, not on
being in landscape as such, so it's left to whichever of those two width-based
rules applies.

**Superseded — see §D.** The footer is no longer `position: fixed` in this
query, which removes the height pressure this whole entry was reasoning
about. The border-radius question it leaves open is settled there too.

## §48 — `.text-window`

> Fixed-height scrollable box for a long list inside a card, set in the Fonte's own typeface — this content is citation, not prose.

Fixed-height scrollable window for a long bulleted list inside a card (e.g.
the patents list) — a fixed box with overflow-y:auto instead of letting the
card grow to fit everything, for text instead of an image. Set in the Fonte's
own typeface/size: this content is a citation-style list (titles + patent
numbers + links), not narrative prose, so it reads as the same register as the
"Fonte:" lines rather than body text.

## §49 — `.lightbox-trigger`

> The trigger is a real <button> wrapping the image; this only strips the browser's own button chrome so the image sizes exactly as before.

Lightbox-trigger is a real <button> wrapping the <img> now, not the img itself
with tabindex/role="button" bolted on — this reset just strips the browser's
own button chrome (border, padding, background, font) so it's visually
transparent and the img inside sizes exactly as it did before, under whichever
more specific selector governs it (.gallery-grid .reveal-img img, .hero-photo
img, .essay-photo img — all descendant selectors, so they still reach through
the button wrapper without any changes of their own).

## §50 — `.gallery-grid .reveal-img.crop-top img`

> foto-02 is a portrait shot forced into the grid's 4:3 cell, and a centred crop was cutting into the subject's head.

Crop from the top instead of the center: foto-02 is a portrait shot (464×542)
forced into the grid's 4:3 landscape crop, and a centred crop was cutting into
the top of the subject's head/face — the part of a portrait a centred crop is
least able to afford to lose. Reuses the same idea as .reveal-img.side.crop-
top elsewhere in this file, just scoped to the gallery grid instead.

## §51 — `.gallery-grid .reveal-img:hover .gallery-caption, .gallery-grid .reveal-img:focus-withi…`

> Keyboard parity for the reveal-on-hover affordances, here and on the two rules below: focus now shows what hovering would have shown.

:focus-within alongside :hover, here and on the two rules below. Every reveal-
on-hover affordance on the site was invisible to anyone driving it from the
keyboard: tabbing to a thumbnail lit up the focus ring but not the caption
that hovering the same thumbnail would have shown. :focus-within rather than
:focus because the focusable element is the <button> inside the figure, not
the figure the caption is positioned against.

## §52 — `@media (hover: none)`

> On a screen with no pointer at all the captions are simply always on — on touch they were reachable only by opening each photo in the lightbox.

On a screen with no pointer at all the captions are simply always on. The
hover-only treatment was written for the desktop grid, where several small
images each carrying a permanent dark gradient would read as busy — but on
touch it meant these six photos had no caption anywhere on the page, reachable
only by opening each one in the lightbox. Below the grid's own breakpoint the
layout is one or two columns wide, where a standing caption per photo is not
busy at all. Same conclusion already reached for the single large essay photo
(see .essay-photo-caption); this just applies it here too.

## §53 — `@keyframes galleryRevealLeft`

> A larger start offset for the gallery, animation-based rather than transition-based so the hover-zoom below can keep its own timing.

Larger start offset for the gallery: creates a "two film reels sliding in"
effect — the top row from the right, the bottom row from the left. animation-
based (like discorso's clumpIn), NOT transition-based like the shared .reveal-
img rule above: that's what lets the hover-zoom below use its own fast,
symmetric transition without a repeat of the bug where a shared transition-
duration on .visible governed BOTH the entrance reveal and the hover response,
speeding up the entrance to match the hover's snappier pace instead of its own
intended 1.2s.

## §54 — `.js .gallery-grid .reveal-img.settled img, .js .gallery-grid .reveal-img.from-right.set…`

> Once the entrance animation ends, JS adds .settled and the hover-zoom takes over as a plain, symmetric transition.

Once the entrance animation ends, initGalleryReveal() in animations.js adds
.settled — same handoff pattern as discorso's .clump-photo.settled. From here
on it's pure transition, decoupled from the entrance entirely: symmetric in
both directions (hover-in and hover-out), and immune to ever being sped up by
a future change to the entrance timing again. Two selectors, not one: .reveal-
img.from-right.visible img (the entrance rule two blocks up) has 5 classes of
specificity, one more than a plain .reveal-img.settled img (4). For from-right
photos that outranks animation: none below, so the finished animation's
forwards-fill effect never actually lets go of transform — hover then has
nothing to override, confirmed live (only the from-right thumbnails were
stuck; the rest hover-zoomed fine). Repeating the settled rule with .from-
right added matches that 5-class specificity and, coming later in the file,
wins the tie for those photos too.

## §55 — `@media (hover: hover) and (pointer: fine)`

> The same 1.5 scale as Discorso's clump, safe here without a z-index bump because the grid cell clips it.

Hover-zoom, matching discorso's .clump-photo:hover exactly (same 1.5 scale) —
safe here without discorso's z-index bump or its own translate offset, because
.gallery-grid .reveal-img has overflow:hidden: the scaled image crops to the
card's own boundary instead of spilling into neighbouring grid cells.

## §56 — `.lightbox-counter`

> Position counter, shown above the caption only when the lightbox has more than one photo to step through.

Position counter ("3 / 6"), shown above the caption only when the lightbox has
more than one photo to step through (see showIndex() in animations.js — same
currentHasMultiple gate that shows/hides prev/next). Quieter than .lightbox-
caption since it's secondary wayfinding, not editorial content; empty and
collapsed the rest of the time via the same :empty pattern .lightbox-caption
already uses.

## §57 — `.doc-viewer-overlay`

> A second, deliberately simpler lightbox for scanned documents: this one lets the image sit at its natural size and scroll, instead of shrinking it to fit.

Document viewer: a second, deliberately simpler lightbox variant for scanned
documents (diploma-cfm, teresio-cavaliere, the Banchelli Facebook screenshots)
where the whole point is reading small print, not admiring a photo. .lightbox-
overlay scales its image DOWN to fit the viewport (max-width/max-height) —
exactly wrong here, since shrinking a dense scan to fit the screen is what
made the raw-file new-tab link necessary in the first place. This one instead
lets the image sit at its own natural pixel size (or a per-image tuned width
via --doc-width, set inline on the trigger once someone's actually tested
legibility on real hardware — unset by default, deliberately not guessed at
here) inside a container that scrolls both ways. No prev/next: unlike the
photo lightbox, each of these is a standalone document, never a sequence to
step through, so that whole piece of initLightbox()'s job doesn't exist here.

## §58 — `.doc-viewer-bar (user-select)`

> Keeps a stray text selection from starting on the dialog's own chrome. Deliberately not applied to the transcript, which someone may want to copy.

Reduces how often a stray text selection can even start on the chrome itself
(double-tap/drag on the toggle or close button) — paired with the explicit
selection clear in initDocViewer()'s close handler in animations.js, which is
the deterministic half of the fix. Deliberately NOT applied to .doc-viewer-
text below: the transcript is real content someone may want to copy.

## §59 — `.doc-viewer-toggle`

> The same pill language as the badges elsewhere on the site; aria-pressed in JS carries the real state, this is only its sighted equivalent.

Same pill language as .clump-badge/.img-badge elsewhere on the site, so this
reads as the same family of UI chrome rather than a one-off control invented
for this single feature. aria-pressed (toggled in JS) carries the actual state
to screen readers; the [aria-pressed="true"] rule below is only the sighted
equivalent of that, not a substitute for it.

## §60 — `.doc-viewer-scroll:focus-visible, .doc-viewer-text:focus-visible`

> The scrollable stage. Its tabindex="0" lives in the markup, and is what lets a keyboard user focus it and scroll with the arrow keys.

The scrollable stage. overflow:auto (not scroll) so a document that *does* fit
needs no scrollbar at all — diploma-cfm on a wide desktop window, say.
tabindex="0" in the markup, not here, is what lets a keyboard user actually
focus this element and scroll it with arrow keys; that's native browser
behaviour for any scrollable element with a tab stop, nothing bespoke to write
in JS for it.

## §61 — `.doc-viewer-scroll`

> Centring is done by margin:auto on the child instead: justify-content:center made the left edge of a wider-than-container document permanently unreachable.

No justify-content: center here — see .doc-viewer-scroll img's margin:auto for
why the same visual centering is achieved without the bug justify-
content:center caused: when a document is wider than the container, justify-
content:center gives the flex line a negative starting offset that scrollLeft
can never reach in LTR — the image's left edge becomes permanently
unreachable, exactly what was reported live. margin:auto on the child centers
the same way when there's free space, but collapses to 0 instead of negative
when there isn't, so the whole image always stays inside the scrollable range.

## §62 — `.doc-viewer-scroll img (width cap)`

> Caps a document at the viewport width, with nowhere for extra width to go but off both edges. --doc-width can still ask for less, never more.

Capped so a document can't run wider than the viewport — nowhere for the extra
width to go but off both edges, which combined with justify-content:center
above was the actual cause of the reported horizontal-scroll bug. Holds on
mobile too now: a portrait-shaped scan (banchellilogos, banchellidiscorso,
teresio-cavaliere) reads fine capped by width, same as everywhere else. --doc-
width can still request a SMALLER width than the cap, for a document whose
natural size tested too small to read — it only ever shrinks the image, never
grows it past the cap.

## §63 — `.doc-viewer-loading`

> Shown while the real image is still loading, with the image itself hidden until 'load' fires.

Shown while the real image is still loading — see initDocViewer()'s open(),
which toggles this class and hides the img itself (no intrinsic size yet)
until 'load' fires. Without this, the img with no width/height rendered the
browser's own tiny default broken- image placeholder, centered by margin:auto
above — the "dot at screen center" reported during the load gap on the larger
full-resolution scans this dialog often opens.

## §64 — `.doc-viewer-loading::after`

> The gear is Valerio's own drawing, verified centred on its real pivot — the axle hole, not the shape's bounding box.

The gear itself — Valerio's own design (sfondi/spinner-gear.svg), verified
centered on its actual pivot point (the small axle hole, not the shape's own
bounding box, which is off-center since it's a half gear) via pixel analysis
before use. background-size:contain with centered position handles this
automatically regardless of the exact box size given here: the SVG's own pivot
lands at the box's center either way. Slower than the plain ring this replaced
(1.4s vs 0.8s) — a detailed, asymmetric shape reads as a spin rather than a
blur at a more measured pace; a simple ring didn't need that.

## §65 — `@media (max-width: 700px) and (orientation: portrait)`

> The exception: a landscape-shaped scan capped by width alone shrinks to a sliver on a narrow portrait phone, so this one sizes from height instead.

The exception: a LANDSCAPE-shaped scan (diploma-cfm) capped by width alone
shrinks to a sliver on a narrow portrait phone — most of its height goes
unused. Opted in per-trigger via data-doc-fit="height" (see initDocViewer() in
animations.js, which toggles this class on open), and only on mobile portrait:
elsewhere the plain width cap above already leaves the document at a
comfortable size, since the viewport itself is wide there. Sizes from height
instead — 100% of .doc-viewer-scroll's own (flex- computed) height, not 100vh
directly, so it doesn't run under the top bar — and lets width overflow into
the container's horizontal scroll rather than capping it.

## §66 — `body.page-curriculum .doc-viewer-text-inner`

> Curriculum's two transcripts are official forms rather than recovered narrative, so they read in sans instead of the site's prose serif.

Curriculum's two transcripts (diploma-cfm, teresio-cavaliere) are official
documents/forms, not recovered narrative — unlike discorso's and quercia's
Facebook-post transcripts, which stay serif to match the site's prose
register. Sans here instead, matching how labels/badges already read elsewhere
on the site.

## §67 — `.doc-viewer-form-columns`

> Side-by-side blocks reproducing the scans' own mastheads and signature rows.

Side-by-side blocks — diploma-cfm's masthead (left-aligned left column, right-
aligned right column, matching the scan) and both documents' signature blocks
(--left modifier: right column also left-aligned, since two signature labels
sitting side by side don't call for the same right-justification a letterhead
does).

## §68 — `.doc-viewer-text-inner .fill`

> Text hand-written onto a blank line of a printed form, as distinct from the form's own printed copy.

Text hand-written onto a blank line on the printed form — italic plus an
underline evokes both "this was written in by hand" and "this sat on a ruled
blank", distinct from the surrounding printed copy. Not the same thing as
.doc-viewer-text-inner mark above (that's an editorial highlight added after
the fact on a Facebook screenshot); this is original to the document itself.

## §69 — `.discorso-hint`

> Overlay hint sitting inside the first row of images, so it's visible without any scroll, and fading out once the clump comes into view.

Overlay hint positioned within the first row of images (not centered on the
whole tall clump), so it's visible immediately without any scroll — fades out
once the clump scrolls into view instead of taking up permanent space in the
reading column (see js/animations.js for the IntersectionObserver that drives
it)

## §70 — `.img-badge-left`

> Used only where the source image already has content of its own in the default bottom-right corner.

Used only where the source image itself has content (a caption, a label)
sitting in the default bottom-right corner — e.g. the Einstellungen cover,
whose "EINSTELLUNGEN" text can't be cropped away from that corner because
object-fit:cover never crops vertically when the box is narrower than the
source image. Moves just that one badge, leaves .img-badge (bottom-right) as
the site default everywhere else.

## §71 — `.lang-link-desktop / .lang-link (language switcher)`

> Language switcher: a floating pill on desktop, the last item of the burger dropdown below the breakpoint. It sits outside `.nav-inner` but still inside `.site-nav`, whose backdrop-filter makes it the containing block for this position:fixed pill — which is what the `left: calc()` below is measured against.

Language switcher: two separate elements, not one reused via media queries. On
desktop, .lang-link-desktop floats outside the nav bar entirely as a small
pill — deliberately no flag colour, just dark background + "IT"/"EN" text, so
it doesn't add a saturated note to an otherwise neutral bar. Below the
breakpoint, .lang-link (flag icon + short label) takes over instead, as the
last item in the mobile burger dropdown — see the media query below. Outside
.nav-inner, but inside .site-nav, and that distinction is the whole story: the
bar's own backdrop-filter makes it the containing block for any position:fixed
descendant, so the pill is positioned against the BAR, not against the
viewport. Measured rather than assumed — offsetParent reports HEADER.site-nav,
and the left: calc() below lands on the bar's right edge + 12px at 1081, 1200,
1440 and 1900px (1020 / 1080 / 1200 / 1430), never on the viewport-relative
value it would take if the filter did not capture it (1028 / 1087 / 1207 /
1437). This entry used to claim the opposite — that the pill sat outside the
bar's subtree precisely to escape that containing block. It never did sit
outside it, and the geometry in §72 only works because it doesn't. Same
translucent background and blur as the bar, so it reads as part of the same
family of chrome, and hides together with it on scroll via the shared .nav-
hidden class. Position is now derived from the bar's own geometry rather than
tuned by eye — see §C below.

## §72 — `.lang-link-desktop`

> Left edge derived from the bar's own right edge plus a 12px gap, rather than tuned by eye. Half the bar's max-width, in the same unit.

Left edge = the bar's own right edge + a 12px gap. With .site-nav itself as
the containing block (§71), 50% is the bar's own centre and min(29.6875rem,
50vw) is half its max-width, so the expression resolves to the bar's left edge
+ its full width + 12px — its right edge plus the gap — at any viewport width.
The min() keeps it honest below the bar's max-width even though the pill is
hidden there. Both
halves are in rem and stay in step: see §AA. No translateX any more, because
this is a left edge and not a centre point.

## §73 — `.essay-block`

> Home essay: each paragraph in a low-contrast rounded box, contiguous with its neighbours so the read stays continuous.

Home essay v2: each paragraph sits in a low-contrast rounded box — flat
colour, no blur/transparency needed since the page background is plain black
with nothing complex behind to blend with (unlike Quercia/Discorso's ritagli-
band, which sits over a busy SVG texture). Boxes are contiguous — margin:0
between them — so the only perceptible seam is where two rounded corners meet,
not a gap or a rule; this keeps the read continuous instead of chopping the
essay into visibly separate cards.

## §74 — `.essay-block-signature`

> The closing date/signature block, centred as a unit with the signature still flush right inside it.

Date/signature closing block: with the masthead above now centred, a right-
aligned box read as orphaned off to one side — centring the whole box keeps it
in the same visual axis as the title. Left-align inside the box (its width is
fit-content, set by the widest date line) and pin just the signature to that
box's own right edge, so "Valerio" still reads as flush-right against the date
above it, exactly as before — just centred as a unit rather than pinned to the
column's right edge.

## §75 — `.essay-masthead`

> Feature masthead, home.html only: title, thin-sans dek, byline-style credit line.

Feature masthead (home.html only): title + thin-sans dek + byline- style
credit line, New Scientist-style. A self-contained block scoped by class
rather than a body.page-home hook, so it only touches h1 here — the plain,
left-aligned h1 every other page's title relies on is untouched outside this
block.

## §76 — `.epigraph-note`

> The "(*)" marker takes the text colour rather than link blue: it points to a note further down the same page, it isn't a citation link.

The "(*)"/"(**)" marker: same colour as the epigraph text around it (no blue
link colour — this isn't a citation link, just a pointer to a note further
down the same page). Uses a real text-decoration (not a border-bottom box-
model hack) so its thickness is an explicit, intentional value — 1.5px,
matched to sit alongside the bold in-body reference links (their underline
reads heavier purely because bold font metrics draw a thicker stroke by
default, not because anyone set it deliberately) — rather than an accident of
two unrelated techniques landing at different weights next to each other.
Quiet at rest, consolidates to full brightness on hover/focus, same curve as
.brand-text and the ornament link.

## §77 — `.hero-photo`

> Full-bleed hero breaking out of main's 760px column to the full viewport width, clipped by body's own overflow-x.

Full-bleed hero, New Scientist-style: breaks out of main's 760px column to the
full viewport width. Relies on body's overflow-x: hidden (set above) to clip
the 100vw box so it never creates a horizontal scrollbar. No border-radius — a
full-bleed image reads as the page's own edge, not as a card, so rounding it
would fight that read.

## §78 — `.hero-photo img`

> Height tied to width via aspect-ratio rather than to vh, so the crop fraction stays constant at any window width.

Height is tied to width via aspect-ratio here, not to vh: a vh height is
independent of viewport width, so on a wide-but-short window the image scales
up a lot to fill that width and the vertical crop grows well past what a
narrower window would show — this is what was cutting off the lower hand.
aspect-ratio keeps the crop fraction constant (~9% off top and bottom)
regardless of window width, since height now scales together with it. Mobile
portrait gets its own vh-based rule below, where width is already the
constraint and a tall aspect-ratio box would be excessive.

## §79 — `.essay-photo`

> Radius and clipping on the frame alone, so the caption sitting below in normal flow doesn't get rounded into the box.

The rounded, clipped frame around the image only — kept separate from .essay-
photo itself since a caption now sits below the image as normal-flow text: if
overflow/radius stayed on the outer figure, the box would grow to fit that
text too, and the bottom corners would end up rounding around the caption
instead of hugging the photo, breaking the "photo reads like the coloured
cards" match this radius exists for.

## §80 — `.essay-photo-caption`

> Always-visible caption under the photo, in the same register as .hero-caption.

Always-visible caption under the photo, matching .hero-caption's register
(same font, size, colour) since both are the same kind of line — what the
picture shows — even though this one sits in the normal column instead of
breaking out full-bleed. Replaces the old .gallery-caption hover-overlay
treatment here: that style still fits the actual thumbnail grid on the Foto
page, where many small images make a permanent caption too busy, but for a
single large photo in the essay a caption only visible on hover was never
reachable on touch at all.

## §81 — `.js .essay-anim`

> A small rise-and-fade per paragraph, subtle enough that repeating it down a long essay reads as the page settling into place.

Entrance animation: a small, quick rise-and-fade, deliberately subtle enough
that repeating it once per paragraph down a long essay reads as "the page
settling into place" rather than as a repeated effect — the opposite would
work against the continuous, old-style-article reading this page is trying to
preserve.

## §82 — `.essay-ornament`

> Closing mark drawn from one of Teresio's own patents, kept at the same faint level as the watermarks on the other pages.

Finalino after the signature: a minimal mark (ruota.svg, drawn from one of
Teresio's own patents) closing the text before the editorial "fonte" note.
Kept at the same faint level as the technical-drawing watermarks on the other
pages (a 0.75 dark overlay over white lines there works out to the same result
as plain opacity here — see the body.page-* background rules above) so it
reads as a quiet paper mark, not as an illustration competing with the text.

## §83 — `.essay-divider`

> Paragraph divider from a Teresio patent, sized at half the reading column's width on any breakpoint.

Paragraph divider: the "vite" mechanical detail, from a Teresio patent, at
full opacity (unlike the fregio, this one doesn't fade — confirmed live). Size
is 50% of the reading column's width on any breakpoint (not a fixed px value),
so it stays "half the column" whether that column is 620px on desktop or
narrower on mobile.

## §84 — `.visually-hidden`

> Standard clip technique: content stays in the accessibility tree so screen readers read it, but takes up no visual space.

Visually-hidden: standard clip technique. Content stays in the accessibility
tree (unlike display:none/visibility:hidden) so screen readers read it, but it
takes up no visual space. Used to give screen-reader users the full
transcription of a scanned ritaglio next to its <img>, without duplicating
that much text on-screen for sighted users who already see the photographed
page.

---

# Changes made after the split

## §A — Headings and lists in the figcaptions

Logos 27, Curriculum, Foto, Home and Quercia each had an `<h1>` and then
nothing else. Navigating by heading in a screen reader — the main way
someone using one scans a page — returned the page title and stopped, on
pages that are visibly divided into four or six separate documents.

On Logos 27 the fix was already sitting in the markup: each figcaption
opened with a line doing a title's job (the document's name and what it
is) as a bold run at the head of a paragraph. That line is now an `<h2>`
with `font: inherit`, which undoes every one of h2's own defaults (20px,
700, a 36px top margin) so it renders exactly as it did before, with the
leading `<strong>` still carrying the weight. Nothing moved on screen.

Curriculum has no such line — its bold runs sit mid-sentence ("Nel 1962 è
nominato **Cavaliere** dell'Ordine…"), and promoting one would have cut
the sentence in half. Each of its four figures got a
`<h2 class="visually-hidden">` instead, naming the document. A hidden
heading is the right tool exactly here: the structure is real and is
already conveyed visually by four separate coloured cards, so the heading
adds nothing for a sighted reader and supplies the missing landmark for
everyone else.

The four articles on Logos 27 and the seven patents on Curriculum were
both a single `<p>` held together by `&gt;` characters and `<br>` line
breaks. A screen reader read each as one long paragraph full of
greater-than signs, rather than "list, 7 items". Both are `<ul>`s now,
with the `>` marker redrawn as a `::before` so they render identically:
no bullet, no indent, no gap between items.

Foto was deliberately left alone. Six `<h2>`s for six photos would be
noise rather than structure, and converting the grid to a `<ul>` needs
`display: contents` on the `<li>`, which has a history of stripping the
list role in exactly the assistive technology the change is for. What
that page actually needed was its captions reaching touch and keyboard
users — see §51 and §52.

## §B — From px to rem

Every `font-size` in the stylesheet was in px: 45 of them, against a
single `em` and no `clamp()` anywhere. Page zoom scaled them, so this was
never a WCAG 1.4.4 failure — but a reader who has raised the default font
size in their browser, rather than zooming, got nothing at all. On a site
whose natural audience is family and Olivetti colleagues, that is not a
theoretical reader.

All 45 are now in rem, against `html { font-size: 100% }`. The 100% is
load-bearing: it means "whatever the user asked for", where the common
`62.5%` trick would quietly override a larger default back down. Sizes
that are structural rather than textual — padding, radii, borders, layout
breakpoints — stay in px on purpose. Type scales; boxes do not have to.

Three things had to move with the type, or raising the default font size
would have broken the layout rather than helping:

- `body`'s `padding-top` (the space reserved under the fixed nav) and
  `main`'s `padding-bottom` (reserved above the fixed footer), which
  otherwise stayed put while the bars they clear grew. Slightly
  over-reserved at large sizes, since some of the bars' own metrics are
  still px — the harmless direction to be wrong in.
- `.brand-signature`'s height, so the signature mark keeps its proportion
  to the wordmark beside it.
- The nav breakpoint, from `1080px` to `67.5em`. What that threshold
  measures is how much room six text labels need, so it has to move when
  the text does. An `em` media query resolves against the browser
  default, which is exactly the thing that changed. At a 16px default it
  is still 1080px, so nothing changes for most readers.

There is no `clamp()` here yet. Several of the remaining breakpoints
exist only to step a font size down by hand and would collapse into a
single `clamp()` — a worthwhile follow-up, not part of this pass.

## §C — The language pill

`.lang-link-desktop` was positioned at `left: calc(62.5vw + 356.25px)`,
tuned by eye and honest about it in its own comment. The trouble is that
`vw` grows faster than the bar it is supposed to sit beside: `.site-nav`
stops widening at 950px, the formula never does. The gap between the two
was 31px at 1200px, 121px at 1920px, and about 200px on an ultrawide —
and at the other end the formula ran *into* the bar between 1081px and
1119px, which needed a media query of its own to patch.

The bar's right edge has a closed form: it is `max-width: 950px` with
`margin: auto`, so the edge is exactly `50% + min(475px, 50vw)` at any
viewport width. The pill's `left` is now that expression plus a 12px gap,
and the `translateX(-50%)` is gone, because this is a left edge and not a
centre point. The `min()` keeps the expression honest below 950px even
though the pill is hidden there.

The 1081–1119px patch was deleted with it: the formula it existed to
correct no longer overlaps anything at any width.

`top` moved from `32.8px` to `2.05rem` — the same number, now scaling in
the same direction as the bar's own type (see §B).

## §D — The landscape footer, and the badge sizes

Three small type sizes were doing damage out of proportion to their size.

**The footer at 10px in landscape.** On a landscape phone the viewport is
around 390px tall, and a fixed nav plus a fixed footer were taking roughly a
quarter of it and never giving it back — on the one orientation with the least
height to spare. The previous answer was to shrink the footer until it fit,
which solved the geometry by making the text unreadable: 10px is not small
type, it is texture that happens to be shaped like words.

The footer is `position: static` in this query now. It costs nothing: it is a
credit line and a licence badge, not navigation, and nothing on the site
depends on it being reachable at all times. With the height pressure gone the
type goes back to the portrait size (10.5px) rather than keeping a second,
smaller mobile value — one fewer number to hold in sync, and the two mobile
orientations now agree.

Two consequences had to be handled:

- `main`'s bottom padding exists only to clear a *fixed* footer. In flow it
  would be a large empty gap, so it drops to 48px here — including the two
  page-specific overrides, listed explicitly because each outranks a bare
  `main` on specificity. 48px and not 0: Foto's background SVG renders its
  lines solid white when the photo grid runs right up against the footer
  (§30), and that is a quirk of proximity, not of `position: fixed`.
- The safe-area inset stays. A static footer at the end of the document still
  sits over the home indicator once the page is scrolled to the bottom, which
  is exactly the case the inset was added for. `border-radius: 0` is now set
  explicitly rather than left to whichever width-based rule happens to apply —
  the open question in §47 — because a footer in flow at the end of the page
  has no floating edge to round.

**The two badges at 11px.** `.clump-badge` and `.img-badge` are both up to
12px. Below 12px a label stops being read and starts being recognised by
shape, and `.clump-badge` in particular carries a real instruction ("clicca
per il testo pdf completo") rather than a one-word category. `.img-badge`'s
700 weight and 0.3px tracking were already compensating for a size that was
simply too small; they stay, but they are no longer load-bearing.

**Where the clump badge had gone.** Not a sizing problem at all — see the note
added to §33.

## §E — backdrop-filter without backdrop-filter

Every translucent surface on the site leans on the blur to stay legible,
because what sits behind it is not a flat colour: it is the page itself
scrolling under the bar, and a decorative watermark SVG under the bands.
Without the blur that content reads through sharply and competes with the text
on top — the nav's black labels over whatever paragraph is passing beneath
them, `.ritagli-band`'s light text over the watermark's lines.

Two separate gaps were open:

- **Safari before 18 supports only `-webkit-backdrop-filter`.** Five surfaces
  declared the unprefixed property alone (`.site-nav`, `.nav-links`, `footer`,
  `.doc-viewer-bar`, `.lang-link-desktop`) and so had no blur at all on iOS 17
  and earlier — a large share of real iPhones. All of them carry both
  spellings now; the Quercia clump frames already did.
- **Browsers with neither** get an `@supports not (...)` block. The condition
  tests both spellings, so Safari 17 doesn't fall into it.

The fallback values are chosen to land on roughly the apparent colour the
blurred surface already produces, so nothing shifts for anyone who has the
filter. The light chrome (`rgba(220,220,220,0.68)` over the dark page) blends
to about `#9B9B9B`; raising the alpha to 0.92 keeps it in the same family
while cutting the show-through, and lifts black text from 7.56:1 to 13.08:1.

`.ritagli-band` is the exception, and the obvious fix would have broken it: it
is white at 0.25 over a dark page, i.e. a *dark* panel carrying light text, so
raising the white alpha would have washed the text out rather than protected
it. It gets a solid `#4C4C4C` instead — the exact colour its own blend already
produces, which preserves both #ddd body text at 6.32:1 and the band's own
`--link: #A8D5F2` at 5.51:1, the figure that rule's inline comment has always
claimed.

## §F — The graph, the fonts, and the lightbox alt

**Structured data.** Four pages had no JSON-LD at all and, less obviously,
the two that did had no way of being connected: `index.html` described a
`Person` and `home.html` described an `Article` `about` a `Person`, but both
were anonymous nodes, so nothing said they were the same man — and the Italian
and English versions made four unrelated people rather than one.

Every page now emits an `@graph` built around a handful of shared `@id`s:

- `#teresio` — the `Person`, defined in full only on the two landing pages
  and referenced by `{"@id": …}` everywhere else. `sameAs` now carries both
  the Italian Wikipedia article and Wikidata `Q103831208`; the Wikidata URI
  is the one search engines actually use for entity reconciliation, and for a
  figure this obscure it is worth more than the article. `birthPlace` and
  `deathPlace` added while there.
- `#logos27` — a `Product`, `sameAs` Wikidata `Q17637386`, which records
  Gassino and Sottsass as its designers. Referenced from `logos.html` and
  `mentions`ed from the essay.
- `#quercia`, and one `#website` node per language.

The Italian and English pages use the *same* `#teresio` id on purpose. It is
one human being; two ids would recreate the problem this was meant to solve.
Everything else is per-language, since those really are distinct documents.

`discorso.html` was not on the list of pages to fix but got the same
treatment: leaving one island would have defeated the point.

**Fonts.** Subset conservatively via `fonts/subset.sh`, which is in the repo
so this is reproducible rather than a one-off. The range keeps all of Latin-1,
Latin Extended-A, Greek, typographic punctuation, arrows, primes and common
maths symbols; the only codepoints dropped are eight combining diacritics and
two modifier apostrophes, none of which can be needed here because every
accented character in those ranges exists precomposed. 321 KB → 270 KB across
the ten files, 163 KB → 139 KB for the four faces a page actually loads.

Measured and rejected: subsetting to the 109 characters the site really uses
cuts about 60% instead of 16%, but it makes every future content edit a
font-regeneration step, and the failure mode is silent — type a character
nobody anticipated and it renders in a system fallback that nobody notices.
Also measured and rejected: `--no-hinting --desubroutinize` saves 228 bytes
across all ten files, which is not worth any rendering risk on Windows.

Worth knowing: ↗ (U+2197) and ⤢ (U+2922) are used on the site and are in
neither Merriweather family. They already fell back to a system font before
this change and still do — the subset didn't cause that and can't fix it.

**Lightbox alt.** `overlayImg.alt` is set to `""` deliberately. The caption
element beneath is an `aria-live` region whose text is either the thumbnail's
own `alt` or a longer version of the same sentence, so giving the enlarged
image an `alt` as well had a screen reader read essentially the same
description twice — on every open and again on every prev/next step. Nothing
is lost: the description still arrives via the caption, which is also the only
one of the two that announces updates as you step through the gallery. The
thumbnail keeps its `alt`, which is what names the trigger button and what
matters for the page itself.

## §G — Scroll restoration on back navigation

Removing `target="_blank"` from the in-essay links made back navigation matter:
following a reference out of the middle of the Home essay and pressing Back has
to put you back where you were reading. Getting there took three attempts, and
the first two are recorded because both looked correct and neither was.

**Attempt 1 — read the navigation type.** `history.scrollRestoration` was set to
`auto` when `performance.getEntriesByType('navigation')[0].type` was
`back_forward` and `manual` otherwise. Worked on desktop, did nothing on a
phone.

**Attempt 2 — reset the flag on the way out.** `scrollRestoration` is a property
of the **history entry**, not of the document: setting `manual` on load flags
that entry, the flag survives navigating away, and on return the browser
consults it and declines to restore — potentially before the re-parsed document
gets to set anything. So a `pagehide` handler put the entry back to `auto`
before leaving. Sound reasoning, still no effect on a phone.

**What it actually was: `scroll-behavior: smooth` on `html`.** With smooth
scrolling in force at parse time, a browser restoring your position performs
that restore as an *animated* scroll rather than an instant jump. Mobile engines
routinely cancel that animation partway — an early layout pass, a font landing,
a stray touch — and the page settles at the top. Nothing was wrong with the
`scrollRestoration` value in attempts 1 or 2; the restore was being requested
and then thrown away.

Two changes, together:

- `scroll-behavior: smooth` moved off `html` and onto `html.scroll-smooth`,
  with the class added by the inline `<head>` script one animation frame after
  `load`. By then restoration has already happened, instantly. Every later
  anchor click — the footnote round-trip on home.html, the highlighted-word
  jumps on discorso.html — is smooth exactly as before. The
  `prefers-reduced-motion` block still overrides it with `!important`.
- The `manual` branch is gone entirely: `history.scrollRestoration = 'auto'`,
  unconditionally. Nothing on the site depended on `manual`. It was there so a
  reload wouldn't drop the reader into the middle of an essay whose
  scroll-reveal animations had already been consumed above them — a cosmetic
  concern, and a much smaller one than losing your place. Setting `auto`
  explicitly rather than deleting the line keeps the intent visible and
  re-flags any history entry left over from a previously deployed version.

**The discriminator this section proposed** was: if the correct position appears
and then the page goes to the top, something is still animating or cancelling
the restore; if it never appears, restoration isn't being attempted at all. That
discriminator was right, and it fired — the first symptom is exactly what a
phone kept doing after this fix shipped. See §H, which supersedes the gating
described above.

Restoring `target="_blank"` on internal links for touch devices only was
considered as a fallback and is worse on its own terms: it needs JavaScript to
rewrite `target` from a `matchMedia` query, and it hands mobile readers — the
ones least able to manage a tab stack — a pile of tabs of the same site.

## §H — Scroll restoration, taken over rather than arranged for

§G ends with a fix that was correct about the cause and incomplete about the
scope, and with a prediction of how the remaining case would look. The
prediction came true: on a phone, after following an in-essay link out of
home.html and pressing Back, the right position appears for a moment and the
page then goes to the top.

**What the §G fix can and cannot cover.** Its mechanism is a gate:
`scroll-behavior: smooth` is held off `html` until one animation frame after
`load`, so the restore happens while scrolling is still instant. That is sound
for one path — a document parsed fresh from cache — and structurally blind to
three others:

- **bfcache resume.** The document is not re-parsed. It is resumed with the
  class list it had when you left, `scroll-smooth` already on `html`. `load`
  never fires again, so the gate never runs, and the engine's restore animates
  exactly as it did before §G. This is the path iOS Safari takes for Back
  almost always, and Chrome for Android takes often. It is the single most
  likely explanation for the reported symptom.
- **A fragment left in the URL.** Blink keeps a live *fragment anchor* while a
  document loads and re-scrolls to it as layout settles, up to and past `load`.
  The finalino's back-to-top link is `href="#top"`, so any entry created by
  tapping it has `home.html#top` as its URL — and `#top` with no matching
  element means the top of the document. Come back to that entry and the late
  fragment re-scroll lands *after* a restore that had already succeeded.
- **Late layout.** Fonts are `font-display: swap`; the essay reflows when
  Merriweather lands. Blink retries a deferred restore when the document grows,
  and once the class is on, that retry is animated too.

All three are the same shape: a second scroll arriving after a correct first
one. Which one fires depends on the engine, the cache state and the URL, which
is why chasing them one at a time produced three plausible fixes in §G and a
bug that survived all of them.

**So stop arranging conditions for the browser's restore and do it here.**
`initScrollMemory()` in `js/animations.js`:

- `history.scrollRestoration = 'manual'`, set in the inline `<head>` script so
  it is in force before the engine's own restore can run. Note this is not
  §G attempt 1 or 2 revisited: those two only *toggled the flag* and left the
  restoring to the browser. Neither ever saved or restored a position. A real
  manual implementation had not been tried.
- Every history entry gets a random key stamped into `history.state`, and the
  scroll position is saved per key in `sessionStorage`. Per-entry, not per-URL:
  `home.html` and `home.html#nota` are two entries with two remembered
  positions, which is what makes the footnote round-trip return you to the
  paragraph you left rather than to the note.
- The presence of a saved value for the current entry is itself the "we have
  been here before" test. A forward navigation, or a shared link to
  `home.html#nota`, arrives on a new unkeyed entry, restores nothing, and lets
  the fragment behave normally. No navigation-type sniffing — §G attempt 1 did
  that, and `performance.getEntriesByType('navigation')[0].type` is reported
  inconsistently across mobile engines anyway.
- After restoring, the position is **re-asserted every frame** for up to
  1200 ms. This is the part that actually closes the bug: it does not matter
  which of the three late scrolls above fires, or whether a fourth exists — it
  is overwritten on the next frame. The window closes early once the document
  height and the position have both held steady for 250 ms, and immediately on
  any `touchstart`, `wheel`, `keydown` or `pointerdown`, so it can never fight a
  reader who has started scrolling. A 150 ms grace period at the start ignores
  the tail of an iOS edge-swipe-back, which would otherwise abort the restore it
  just triggered.
- Restores are wired to three entry points, matching the three paths above:
  top-level call at parse time (fresh document), `pageshow` with `persisted`
  (bfcache), and `popstate` (same-document Back). With `manual` the engine moves
  the page for none of them, so all three are ours.
- `scroll-behavior: smooth` keeps §G's gate, moved onto this function: the class
  goes on only when a restore window closes, and comes off at the start of every
  later one. Assertions inside the loop use the two-argument `window.scrollTo`,
  which is unconditionally instant regardless of the class.

**Saving.** Written on `pagehide`, on `visibilitychange` to hidden (iOS can
discard a backgrounded tab without firing `pagehide`), on any `click` in the
capture phase before its default action runs — that one is what captures the
reading position *before* an in-page anchor jump moves it — and lazily at most
twice a second while scrolling, so an abrupt kill costs half a second of
position. Saves are suppressed while the restore loop itself is moving the page.

**Failsafe.** `manual` means that if `animations.js` 404s or throws, nothing
restores at all — strictly worse than the browser's own attempt. The inline
`<head>` script's existing `load` handler, which already swaps `.js` back to
`.no-js` when `window.__animsReady` is missing, now also puts
`scrollRestoration` back to `auto` and adds `scroll-smooth` in the same branch.
A broken `animations.js` therefore degrades to §G's behaviour, not to none.

**What was NOT done, and why.** `href="#top"` on the finalino stays. Rewriting
it as a scripted scroll plus a `replaceState` would clean the fragment out of
the URL and remove the Blink fragment-anchor risk at the source — but it also
destroys the round trip, since Back would no longer return you down the page,
and the re-assertion window covers the fragment case regardless. The link is a
symptom-carrier here, not a cause worth trading behaviour for.

**Reload was a gap, found in live testing.** After §H shipped, Back worked and
refreshing any page went to the top — a regression, because `auto` used to keep
your place on a reload and every browser does so by default. It is not a
trade-off for the Back fix; the two are the same mechanism and both should work.

The cause is a hedge that was missing. Back on a phone almost always resolves
through bfcache, so the `pageshow` handler was doing the work and the
freshly-parsed init path was rarely exercised. A reload always takes that init
path, and it depends on `history.state` carrying `twKey` into the new document.
State survives a traversal reliably; across a reload it is less certain, and
when it does not survive, `keyFor()` mints a new key on the reloaded page and
the saved position becomes unreachable.

The fix is a second, coarser key: `save()` now writes the position under the URL
(`tw:u:<pathname><search>`) as well as under the entry. On init, the entry key is
read first and the URL key is consulted **only when the navigation type is
`reload`**. That gate matters — without it, clicking through to `home.html` from
the index would restore a position left earlier in the same session, when a
fresh arrival must land at the top. This is not §G attempt 1's navigation
sniffing returning: the type does not decide *whether* to restore, only *which
of two keys to read*, and a wrong answer costs a scroll position rather than a
working page. Verified across four cases: reload with state, reload without
state, fresh navigation to the same URL, and back/forward — the last two
correctly restore nothing from the fallback.

Worth recording that the simulated reload restored correctly *with* state
intact, so the root cause was inferred rather than observed. The fallback makes
the outcome right either way. If a reload still opens at the top, read
`history.state` in the console on a fresh load and again after refreshing: if
`twKey` changes, the inference was right and the fallback is now carrying it; if
it does not change, the position is not being saved and `sessionStorage` is
where to look.

**If it is still wrong**, the re-assertion window is the thing to instrument:
log `window.scrollY` on every frame of `step()` and read whether the position is
being taken away *inside* the window (the loop is losing a fight — raise
`WINDOW_MS`, or the aborting input is spurious) or *after* it closes (something
scrolls later than 1200 ms, which would be a genuinely new cause). The
`STABLE_MS` early exit means the window usually closes well before its ceiling,
so check whether it closed early for a bad reason before raising the ceiling.

## §I — What the Creative Commons line actually covers

The footer claimed CC BY-NC-SA over the whole site. The site reproduces
material that isn't ours: two Facebook posts by Luciano Banchelli, scanned
pages from Elserino Piol's *Il sogno di un'impresa* (Il Sole 24 Ore, 2004) and
Sandro Sartor's *Via Jervis, n. 11* (Manni, 2005), press images, and the
Quercia photographs from two Facebook groups. You cannot license under CC what
you do not own, so the claim was wrong as written.

**What was already right, and is the load-bearing part.** Italian quotation
right (art. 70 L. 633/41) turns on the reproduction being for criticism,
discussion or teaching, non-competing with the original — and, at comma 3, on
naming the work, the author and the publisher *at the point of use*. The site
already does this everywhere and does it well: Piol and Sartor carry title,
publisher, year and page ranges; Banchelli carries links to both original posts
and a note on who he was; the Quercia photos name their two groups; the patents
name Espacenet and Rechnerlexikon with consultation dates. Nothing about
attribution needed fixing. The defect was confined to the licence sentence
over-claiming.

**The fix is three words.** `(alcuni diritti riservati)` / `(some rights
reserved)` becomes `salvo diversamente indicato` / `unless otherwise
indicated` — the shortest phrasing that still carries CC's own recommended
sense, with the comma dropped so the line reads as one clause rather than a
claim plus a caveat. This is Creative Commons' own recommended marking, and Wikipedia's
footer formula, and it works precisely because the "diversamente indicato"
already exists in quantity throughout the site. Replacing the slogan rather
than appending to it costs seven characters in Italian and six in English, so
the fixed footer does not gain a line even on the narrowest phone — and the CC
slogan carried no information the licence link doesn't already carry.

**The longer statement lives in the credits, not in new UI.** `discorso.html`
is the page carrying the third-party material, and its `.ritagli-band` is
already a credits block. One closing paragraph there — `.ritagli-nota`, a step
smaller and dimmer behind a hairline, because "who owns this" is a different
register from "where this came from" — says the whole thing without a new page
or a new component. For the same reason it is excluded from the `>` marker
that `body.page-discorso` puts before each band paragraph: the note is not a
fifth source, and taking the marker would file it as one. The other pages with third-party material (logos, quercia,
curriculum) have their own `.fonte` lines and are covered by the footer
qualifier; repeating the note on each would be noise.

**What was rejected.**

- **A dialog opened from the footer credit line.** Considered, and wrong on
  three counts: it would be the third `<dialog>` on the site, for two
  sentences, next to two that open real content; a legal notice behind JS is
  absent from print, reader mode and crawlers, and it is the one text on the
  site that should always be reachable; and `alcuni diritti riservati` reads as
  a parenthetical, so making it a trigger needs an affordance that draws *more*
  attention than the note deserves — the opposite of the goal. The instinct
  behind the idea was right (the long form must not sit permanently in a fixed
  bar); the answer is to shorten the note, not to hide it.
- **A dedicated `licenza.html` / `licence.html`.** The norm for large cultural
  archives, and overkill here: two more files with nav, sitemap and JSON-LD to
  keep in step, for three lines of text.

**Not a legal opinion.** This is an editorial decision about how the site
presents itself. If the site ever draws real traffic, the Banchelli screenshots
are the item worth a professional read — they are full reproductions of short
works, which sits closer to the edge of art. 70 than an excerpted book page
does.

## §J — The breakpoint ladder, and why it stays six rungs

Two separate observations from the audit, and they resolve in opposite
directions.

**Units: the audit was right.** Every threshold but one was in `px`. Only the
nav's `67.5em` (§10) was in `em`, so a reader who raises their browser's
default font size got the burger menu at the right moment and everything else
at the wrong one. In a media query `em` resolves against the browser's default
font size — not against anything `html` sets — so a default of 20px moves every
threshold up by a quarter, and the layout changes when the text actually needs
the room. Page zoom scales `px` and `em` alike and was never the problem; the
default-size setting was, and this site's readers are exactly the people who
change it.

All six width thresholds and the two `max-height: 500px` queries are now `em`.
The conversion is exact at a 16px default: every query was evaluated at every
integer width from 200px to 2000px before and after, and no width changes
outcome. The odd-looking `min-width: 50.0625em` is `801px` — the exact
complement of `max-width: 50em`, so the pair meets without a gap or an overlap.
Change one and you must change the other.

Height thresholds were converted too, on the same reasoning: a viewport is
"too short" relative to how big the text is, not relative to a pixel count. The
one consequence worth knowing is that a short laptop window with a large
default font now matches the landscape-phone footer rule where it previously
did not. That is the rule doing its job, but it is a behaviour change and not
purely mechanical.

**Consolidation: the audit was wrong, and reading the rules is what showed it.**
The recommendation to fold seven thresholds into three or four came from
counting them, not from looking at what they do. Each is a different
component running out of horizontal room at a different width:

- `35em` — the landing card's image and text stop fitting side by side
- `37.5em` — the lightbox arrows start crowding the image
- `40em` — `.side-row`'s two photos stop fitting inside the 760px column
- `43.75em` — the general phone rung: padding, headings, footer, hero
- `50em` — the clump stage reflows from beside the text to above it
- `67.5em` — the nav collapses

The bottom three sit within 80px of each other because three components with
three different geometries run out of room at nearly the same time, not
because the same problem was patched three times. `37.5em` could arguably be
folded into `40em` — overlay arrows are not layout, and shrinking them 40px
early costs nothing visually. But that is one rung for a real behaviour change
in the 600–640px range, and the other two cannot move at all: pushing the card
rung up to `40em` stacks cards on viewports where side-by-side still reads
well. **Nothing was merged.**

What the audit was actually describing — "unpredictable intermediate
behaviour" — is a documentation problem, not a count problem. The fix is the
ladder comment now sitting above `.skip-link` in the stylesheet: it names each
rung, says which component owns it, and shows the arithmetic. Someone adding a
rule picks an existing rung instead of inventing a seventh, which is how a
ladder gets untidy in the first place.

**Blocks were not gathered either.** `max-width: 43.75em` appears seven times,
each next to the rules it modifies. Gathering them into one block per
threshold would trade locality — change a component by reading one place — for
a tidiness nobody benefits from while editing.

**Not verified in a browser.** The equivalence proof above is arithmetic, over
every integer width. It guarantees the queries fire identically at a 16px
default; it says nothing about whether the layout at, say, a 20px default and
900px wide is any good, because no threshold was ever exercised there before.
Worth a look on a real phone with the system font enlarged.

## §K — Image loading is animation timing on this site

Two separate optimisations were proposed during the audit, both standard advice,
both reverted after they broke the same thing. Writing down why, because the
advice will come up again and it is always going to sound reasonable.

**Attempt 1: `loading="lazy"` below the fold.** It killed the slide-in. The
mechanism is a collision: the lazy-load trigger and the `IntersectionObserver`
that adds `.visible` fire at roughly the same viewport threshold. The reveal
starts, the 0.7s transition runs, and the network request starts in the same
instant — on a fast scroll the transition finishes over an empty box and the
image snaps in afterwards.

**Attempt 2: `fetchpriority="high"` on each page's LCP image.** Same symptom,
different route. `fetchpriority` does **not** enable lazy loading — it is only a
hint to the scheduler, and it never changes *whether* something loads. But
marking one image High necessarily deprioritises every other image *relative to
it*, and Chrome's scheduler already holds low-priority images back during the
initial layout phase. On `home.html` the hero got its head start and
`logos-27.webp` — 305 KB, the heaviest asset on the page — started behind it,
arriving after its `.essay-anim` reveal had already run. On `discorso.html` it
would have been worse: `capellaro.webp` is one of six `.clump-photo` images that
are supposed to land as a simultaneous cluster, and it was the only one marked.

**The rule this establishes.** Every content image on this site is animated —
`.reveal-img`, `.essay-anim` or `.clump-photo`, all 34 of them, without a single
exception. There is no such thing here as a change to image scheduling that is
not also a change to the animations. Any optimisation phrased as "defer",
"deprioritise", "reorder" or "prioritise" is touching the site's primary visual
language, and has to be judged on how the images *arrive*, not on a waterfall.

**And the benefit was small anyway.** `fetchpriority="high"` earns its keep when
the LCP image is discovered late — a CSS background, something injected by JS,
a carousel slide. On every page here the LCP image is a plain `<img>` sitting
directly under the `h1`, which the preload scanner finds in the first kilobyte
of `<main>`, and which Chrome boosts to High on its own once layout runs. The
hint bought a few tens of milliseconds of pre-layout scheduling and cost a
visible regression on the page's signature interaction.

**`quercia.html` was the one arguable exception** and was reverted with the
rest. Both its clump photos were marked, so there was no imbalance between them,
nothing else on the page animates, and the thing they outranked was a 377 KB
decorative watermark — the one configuration where the hint helps an animation
instead of fighting it. It went anyway: a lone per-page exception is a thing
someone has to remember, and a few hundred milliseconds on an interior page does
not pay for that in a codebase whose whole maintenance model is that the
fourteen files are the same.

**What is left, and it is nothing.** No `loading`, no `fetchpriority`, no
`decoding` attribute on any image. Every image is fetched eagerly at the
browser's own priority, which is what the animations need. The remaining
image-weight work is encoding, not scheduling: see the audit note on the
decorative SVGs, where the bytes are real and the timing is not involved.


## §L — Two colour declarations the dark page never made

Both of these were found by running the site in a real browser rather than by
reading the stylesheet, and both had already been *half* solved by someone
looking at the right problem from the wrong end.

**The scrollbars.** The page is dark by design and always has been, but nothing
ever told the browser so. `color-scheme` was unset, which means the UA default
of `light` applied, which means every surface the UA draws itself stayed light:
the page scrollbar and the two scrollable dark panels (`.doc-viewer-scroll`,
`.doc-viewer-text`), each of which drew a white bar down its own edge against
`#101010`. One declaration on `:root` covers those and any form control the site
ever grows.

**Corrected after the fact:** `.text-window` was originally named in that list
too, and it does not belong there. It is not a dark panel — it is a light box on
a pastel card — so page-level `dark` gave it the opposite problem, a dark
scrollbar on a light surface. It now sets `color-scheme: light` for itself. The
lesson is narrow but worth keeping: `color-scheme` describes a *surface*, not a
site, and this site has both kinds. The print block re-declares it
as `light`, and does so with `:root` rather than `html` — the two select the same
element but `:root` scores as a pseudo-class (0,1,0) against `html`'s type
selector (0,0,1), so a print rule written as `html { color-scheme: light }`
loses to the `:root` block above it and silently does nothing. That exact
mistake was made and caught in testing.

**The patent links.** `.text-window` lays `rgba(0, 0, 0, 0.06)` over whichever
card colour it sits on. §48 already knew this — it is the whole reason the box's
body text is `#4A4A4A` and not `#555`, and the comment on that line spells the
arithmetic out. What it did not do was apply the same correction to the *links*.
Those inherit `--link: #205C8B` from `.color-band`, a value tuned against the
bare card colour, so inside the box they sit on `#EDB5B5` rather than `#FCC1C1`
and measure **4.01:1** — under AA, on all 41 patent links, on both language
versions. axe-core flags it `serious`; a hand calculation against the band colour
does not, which is why it survived the previous audit.

`--link: #1A4F78` scoped to `.text-window` measures 4.88 on tinted pink, 5.43 on
tinted blue, 5.92 on tinted peach, 6.27 on tinted yellow. Worth noting the blue
card would have failed too, at 4.46 — so this is not a pink-card patch, it is the
missing half of §48.

## §M — Printing, which did not work at all

Printing this site produced almost nothing, and it took generating actual PDFs to
see it. Two failures stacked, and each alone would have been enough.

**Colour.** Light-on-dark text plus a browser that does not print background
colours by default equals `#eee` on white paper. Measured on `discorso.html`: the
body text was invisible.

**The reveal choreography.** Every content image and every essay paragraph starts
at `opacity: 0` behind `.js` and is revealed by the `IntersectionObserver`.
Printing does not scroll, so the observer never sees anything below the first
screen. Measured: `home.html` printed **122 words of 621** across four sheets,
three of them blank apart from the fixed nav and footer stamped onto each.
`curriculum.html` printed **3 of its 41 patents** — the rest clipped by
`.text-window`'s 130px box.

After the block: `home.html` 612 words, `curriculum.html` 733 words and 41 of 41
patents, `discorso.html` all six clump photos.

Three things worth writing down, because all three were mistakes made in the
first draft of the block:

**The clump photos are children of `.clump-anchor`, not siblings.** The anchor is
a zero-by-zero absolutely positioned point, so hiding it looks harmless. It
removes all six photos. `discorso.html` printed as text-only for one round
because of this.

**An A4 sheet is about 673 CSS px of printable width**, which is under the 50em
rung. Every narrow-layout rule on the site is therefore already in force while
printing, including `.clump-anchor { flex-direction: column }`. Paper is wide
enough for two photos a row and the print block has to say so explicitly. More
generally: *the print layout is the phone layout unless told otherwise*, which is
a useful default and an easy thing to forget.

**`print-color-adjust: exact` is not "keep the colour if the reader wants
backgrounds".** It forces the background to print whether they asked or not. The
first draft put it on `.reveal-img.side.color-band` and `.card` to preserve the
pastel identity; at full column width that floods entire sheets with ink to say
something purely decorative, and those blocks carry `#1a1a1a`/`#222` text that is
already legible on bare paper. It now applies to `.hl` alone — four inline
highlights on Discorso, the one place on the site where colour carries meaning
rather than mood — with an underline as the colourless fallback.

The footer is unpinned rather than hidden: it carries the licence line, so it
prints once, at the end, where it belongs. The nav, the language pill, the skip
link, the burger and every `⤢ Ingrandisci` / `↗ Link` badge are instructions for
a pointer and are dropped.

## §N — The save that was always a little behind

`initScrollMemory`'s scroll listener throttled on the leading edge only:

```js
if (Date.now() - lastFlush > 500) save();
```

It fires on the first scroll event past the 500ms mark and then goes quiet — so
wherever the page comes to rest *after* that event is never recorded. Smooth
scrolling makes this the normal case rather than an edge case: a
`scroll-behavior: smooth` jump emits its first event near the start of the
animation and finishes hundreds of pixels later, inside the same window.

Measured, comparing `window.scrollY` against what was actually in
`sessionStorage`:

| page | real | stored | behind by |
|---|---|---|---|
| `discorso.html` | 1500 | 1408 | 92px |
| `curriculum.html` | 1611 | 1476 | 135px |
| `home.html` | 2000 | 1766 | 234px |

Two micro-scrolls 700ms apart correct the value immediately, which confirms the
mechanism rather than merely the symptom.

This does not affect the ordinary exits — `click` in capture, `pagehide` and
`visibilitychange` all flush the truth, which is why the click-a-link-then-Back
round trip always restored exactly. It affects the one exit that fires none of
the three, which §H's own `pagehide` comment already names: iOS discarding a
backgrounded tab. That path reads whatever happens to be in storage. §H estimated
the loss at "at most half a second of reading position"; measured, it is up to
234px, about a quarter of a phone screen.

A trailing-edge `setTimeout(save, 150)` alongside the existing throttle takes all
three deltas to zero, with the four §H restoration scenarios unchanged: link then
Back 2400/2400, `#nota` round trip 1500 → 4193 → 1500, reload 1500/1500, forward
navigation 0.

**This is not the iOS jump-to-top symptom.** Chromium does not reproduce that one
— four scenarios, twenty-five samples of a flat trace after Back — and this fix
does not claim to address it. That one still needs a device.

## §O — The patent card: eight visible, forty-one kept

§48 sized `.text-window` at 130px for a seven-item list. The list then grew to
41 and nobody resized the box. Measured before this change: **20.8 screenfuls of
content behind a window showing 2.1 rows** on a phone, 16.9 and 3.1 rows on
desktop. The archive's most distinctive holding was being read through a slot.

The fix is editorial rather than dimensional. The card now shows the eight
patents Teresio filed between 1964 and 1968 — the Logos 27 years — and the
complete list opens in a dialog. After the cut: 3.5 screenfuls on mobile, 2.7 on
desktop.

**The eight are selected by patent number in the build, not by the year on
screen.** This matters and is easy to get wrong later: the list prints *grant*
years, and the selection is by *filing* date, so the visible years run 1965–1969
and two 1968 patents fall on opposite sides of the line (3,363,837 is in,
3,390,929 is out). No reader can infer the rule from the page, which is why the
caption now states it outright — "gli otto depositati fra il 1964 e il 1968, gli
anni della Logos 27" — and why the caption also had to stop saying "Ufficio
brevetti degli Stati Uniti", which had been false since the French and Italian
patents were added.

> **OBSOLETE — superseded by §AF.** Kept because the retire rule says to mark,
> not delete, and because the first sentence above is still the operative fact.
> Everything after it is not. §AF replaced grant years with priority years on
> the page, which removes the *grant vs filing* asymmetry this paragraph was
> built on: printed year and selection basis are now the same kind of date.
> What is measurably true of the page today:
>
> - visible years on the card run **1963–1966**, not 1965–1969;
> - the pair falling on opposite sides is **two 1966 patents**, not two 1968
>   ones — same two documents, 3,363,837 in and 3,390,929 out, now sharing a
>   printed year instead of differing by one;
> - the caption no longer states the rule at all. It reads "depositati dal 1955
>   al 1995" and names the priority year as the year shown; the slice is named
>   by `.doc-list-intro` instead, and only as "Brevetti degli anni Logos" —
>   which names the period, not the cut.
>
> **And "depositati fra il 1964 e il 1968" is retired outright, because the cut
> was never chronological.** Confirmed by V. The selection runs *to the
> mechanical bit* — 3,363,837, the entry the card's own text singles out in bold
> — and stops there. The one patent excluded from that window, 3,390,929, is
> "Soundproof cover for an office machine": a cover, not calculating mechanism,
> and of little interest beside the rest. That is the whole rule, and it is
> editorial.
>
> The dates could not have told you this, and the cross-check is worth keeping
> because it forecloses the search rather than merely failing at it. The two
> boundary documents are inseparable on **every** basis the site holds:
>
> | | 3,363,837 (in) | 3,390,929 (out) |
> |---|---|---|
> | priority year, shown on the page | 1966 | 1966 |
> | grant year, still in JSON-LD `datePublished` | 1968 | 1968 |
> | priority date, from V's source table | **9 Feb 1966** | **7 Apr 1966** |
>
> Only the full dates separate them, so a build that wants a mechanical
> threshold can use any cut-off between those two days. **Write that down as
> the implementation, never as the reason.** Turning the boundary back into a
> justification is precisely how "1964–1968" came to be here: a range
> back-derived from a choice, then read by everyone after as the choice itself.
> It survived one display change (grant → priority years, §AF) as a plain
> falsehood before anyone noticed.
>
> **What still stands from the paragraph above:** the first sentence — selection
> is by patent number in the build, not by the year on screen — and the
> conclusion drawn from it, that no reader can infer the cut from the page.
> If anything that conclusion is now firmer than §O could argue it. §O thought
> the obstacle was a mismatch between two kinds of date, which a display change
> could in principle have removed — and §AF did remove it, without helping. An
> editorial judgement about which patent is interesting is not inferable from
> any column at all. `.doc-list-intro` naming the slice is therefore permanent,
> not a workaround waiting on better data.
>
> **Incidental, but useful.** §AF left `datePublished` on grant years by design,
> which means the page still carries both columns — priority in the HTML, grant
> in the JSON-LD. That is what made it checkable that §O's original "1965–1969,
> two 1968 patents" was accurate when written rather than careless. Treat the
> mismatch as a second axis, not as debt to be paid off.

### The transcript is a [hidden] div, not a <template>

Every other transcript on this site is a `<template>`, and that is right for
them: they transcribe a scan that is already on the page, so they are an
*alternative* to visible content, never the only copy of it.

The complete patent list is not that. After the cut it is the only copy of 33 of
those 41 entries — and `<template>` content is not in the document, so no
stylesheet can reveal it. Printing `curriculum.html` would have dropped from 41
patents to 8, undoing half of §M one day after it was written.

So it lives in `<div id="text-brevetti-completi" hidden>`: out of the
accessibility tree and the tab order on screen (verified), cloned into the dialog
by `cloneSource()`, and unhidden by the print block as an appendix — after
`</main>`, before the footer, with `break-before: page`. The card keeps its own
eight in print: they match the caption directly above them, and a printed
selection followed by a labelled complete list reads correctly. Result: 5 pages,
876 words, 41 of 41.

`cloneSource()` exists only because of this split. `<template>` exposes
`.content`; a plain element does not, so the helper branches on it.

### Without JavaScript: unhidden here too, and the dead trigger is accepted

The print block was for a long time the only path on which the `[hidden]`
container was revealed, and that left a hole this section had not noticed. Both
ways into the dialog are `<button>`s — the one wrapping the drawing, labelled by
its "⤢ Lista" badge, and the "Espandi la lista" one at the foot of the box,
styled as a plain link but a `<button>` all the same — so with JavaScript off
those 33 entries were not merely hidden, they were **unreachable**. With JS
disabled before the fix the page offered **8 of the 41**: the card's own list is
not gated behind `.js` and rendered normally, so it stayed readable — the 33
that exist nowhere but the `[hidden]` container did not. Counted in a browser
with scripting off, before and after: **8 → all 41**, and with scripting on the
page is byte-for-byte the behaviour it had before (badge shown, expand shown,
container `display: none`). The appendix renders 760px wide, aligned with
`main`. That is the one place
the README's no-JS contract ("no animations, everything on screen") was not
being kept.

So `.no-js .doc-list-full[hidden]` now unhides the same container as an
appendix, and `.no-js` hides both expand controls, exactly as print does. It is
NOT a copy of the print rule: on screen the container is a direct child of
`<body>`, outside `<main>`, so it has to restate main's own 760px / 24px
measure to line up with the page above it, and it has to carry main's
`6.125rem` bottom padding or the **fixed** footer sits on top of the last
patents. Print needs neither, and needs `!important` where this does not —
`[hidden]` is a UA `display: none`, which any author rule outranks, but the
print block is also overriding the on-screen rules it re-declares.

**When the appendix appears differs by path, and on one of them it is late.**
There are three ways to reach `.no-js`, not two. With JavaScript disabled
outright, and when `animations.js` never arrives or fails to parse, the class
is on `<html>` from the first byte and the appendix is simply part of the page
— it is written into the initial layout and nothing shifts. But when
`animations.js` parses and then **throws part-way**, `.js` is on the element
until the inline `<head>` script checks `__animsReady` on `load` and swaps it
back: the appendix, and the disappearance of both expand controls, land
*after* load. That is a layout shift on an already-painted page. Accepted, and
small — the container sits below `</main>`, off-screen for anyone who has not
scrolled, so the CLS cost is near zero and it happens only on a failure branch.
Written down because it is invisible in testing: disabling JavaScript in
devtools exercises the first path and never this one. **To see it, make
`animations.js` throw rather than removing it.**

**Accepted residue: the rotator `<button>` stays focusable and does nothing.**
The drawing sits *inside* the trigger, not beside it, so with JS off there is a
`<button>` in the tab order that takes focus, takes Enter and Space, and fires a
click nobody listens for. This is not fixable from the stylesheet, and the note
matters mostly to stop the next person trying:

- `display: none` / `visibility: hidden` / `content-visibility: hidden` on the
  button take the patent drawing with them — it is content, not chrome.
- `pointer-events: none` stops the mouse and **not** the keyboard, which is
  worse than doing nothing: same control, two behaviours by input device.
- Removing something from the tab order needs `tabindex="-1"`, `disabled` or
  `inert` — all three are **attributes**, and CSS cannot set attributes. Same
  wall as `[hidden]` above, where the sheet can only override the `display`.

That leaves markup or script, and both were weighed and declined:

- **Emit a `<span>` and let `initPatentRotator()` promote it** (`role="button"`,
  `tabindex="0"`, handler) — clean without JS, but it contradicts the README's
  "triggers are real `<button>`/`<a>` elements" and walks straight into §T:
  `.side-row > a, .side-row > img, .side-row > button` carries `overflow:
  hidden`, `position: relative`, `border-radius` and the hover overlay, i.e.
  the frame the entering image slides out from behind. An inert defect traded
  for a likely visual regression.
- **Disable it from the inline `<head>` script** — covers the wrong half. Of the
  two no-JS paths, only the *failsafe* one (`animations.js` 404s or throws, the
  inline script swaps `.js` back to `.no-js` on `load`) can run any script at
  all; with JavaScript disabled outright nothing runs, inline included. Two
  different behaviours in two situations the reader cannot tell apart. And
  `disabled` on a button wrapping an image risks the UA's dimmed rendering on
  the patent drawing itself.

**Why accepting it is not a shrug: A2 changed what pressing it costs.** Before,
this button was the only route to 33 patents, so a press that did nothing lost
the reader the content. Now the complete list is printed below the card on the
same page — the press leads nowhere because there is nowhere left to go. Nor is
it a violation: 4.1.2 asks for name, role and value, and the control has a name
and a role; no criterion requires that a control do something. One wasted Tab
stop, in a mode that also has no animations.

**One knock-on to know about.** `.no-js` hiding `.img-badge` also removes it from
the accessibility tree, and the badge was part of the button's accessible name,
which is computed from its contents. So without JS the trigger announces as
"Disegno di brevetto di calcolatore meccanico, pulsante" rather than
"… ⤢ Lista, pulsante". Correct, in that the badge promised a dialog that cannot
open — but if the badge is ever given an `aria-label` or a `.visually-hidden`
sibling, re-check what the button is called on this path.

### The focus trap bug in §C stopped being latent

The audit flagged that both dialogs computed their focusables with
`"button, [tabindex]"`, which excludes `a[href]`, and noted it was harmless only
for as long as no transcript contained a link.

This transcript contains 41. `.doc-viewer-text` carries `tabindex="0"`, so it was
the last entry in the filtered list; Tab from it hit the wrap branch and jumped
back to the close button. **Every one of the 41 pdf links was unreachable by
forward tabbing, inside a dialog that exists for those links.** Fixed by adding
`a[href]` to the selector. Verified: Tab from the close button now walks × →
panel → 3,084,855 → 3,121,487.

### Text-only mode, and why the trigger is a <button>

`initDocViewer`'s `open()` branches on the absence of `data-doc-src`: a trigger
with a transcript and no scan opens straight into text, with the toggle hidden
rather than present and inert. The dialog's `aria-label` is swapped per trigger
and restored from `defaultLabel`, because one dialog now serves two quite
different things.

The image trigger was an `<a>` to Rechnerlexikon. It is now a `<button>` — this
control genuinely has no destination, unlike the site's other
`.doc-viewer-trigger`s, which are anchors with `preventDefault`. The
Rechnerlexikon URL is not lost: it is the first link in the `.fonte` line
directly below, where it always also was.

"Espandi la lista" sits **below** the box rather than at the end of the list inside
it. Inside, the control that reveals the rest of a list you can only see three
rows of would itself have needed scrolling to find. It is 44px tall, which is
also the standard the burger still fails.

### The rotator, and three things it deliberately does not do

Scrolling the short list cross-fades the card between three scans.

**It does not load frames 2 and 3 with the page.** They carry `data-frame-src`
and get a real `src` on an idle callback after `load`. §K's rule is that image
scheduling here IS animation timing — but that rule is about the frame that
animates, and only frame 1 does. Frames 2 and 3 sit behind it at `opacity: 0` and
are never revealed on arrival, so deferring them costs no choreography and keeps
them off the critical path. **Re-measured: 78,908 B + 83,078 B = 161,986 B, 158
KiB.** This line said 134 KB, which was the pair's weight before the two scans
were replaced (brev4, brev5). WebP does not compress further in transit, so
there is no reading of 134 that is still true. The same figure appears in the
`prefers-reduced-motion` note further down, where those bytes are not merely
deferred but never requested at all — **if one is ever re-measured, re-measure
both.**

**It does not run below 60px of scroll range.** Mapping a 20px range onto three
frames turns a trackpad nudge into a full image change. Under the threshold the
card just keeps frame 1, which is the pre-rotation behaviour.

**It does not run under `prefers-reduced-motion`.** The cross-fade would already
be flattened by the global reduce block, but an image that changes underneath you
as you scroll is motion whether or not it fades, and three interchangeable scans
are decoration. Verified: frame index stays `[0,0,0,0,0,0]` across the full
scroll under `reduce`, against `[0,0,1,1,2,2]` without.

**Free consequence, worth writing down before someone refactors it away.** That
`reduce` return sits at the TOP of `initPatentRotator()`, above the point where
`loadFrames` is defined and scheduled — so under `reduce` the deferred swap
never runs, frames 2 and 3 keep their inert 1x1 gif as `src`, and the two real
scans are **never requested at all**. Measured on this build: `brevetto-2.webp`
78,908 B + `brevetto-3.webp` 83,078 B = **161,986 B, 158 KiB not downloaded**
by a reader on `reduce`. **Verified in a browser, not inferred:** with
`prefers-reduced-motion: reduce` the only image request the card makes is
`brevetto.webp`, frames 2 and 3 report `naturalWidth` 1 throughout, and the
current-frame index stays `[0,0,0,0,0,0]` across the full scroll — against
`[0,0,1,1,2,2]` and all three files requested without the preference. This is a side effect of where the guard is placed,
not of anything that announces itself: move the `reduce` check below the
`loadFrames` scheduling, or hoist the loader out of the function, and the
saving disappears silently with no visible or behavioural change to notice it
by. **If you refactor the rotator, re-check that the guard still precedes the
loader.**

That interchangeability is also why frames 2 and 3 carry `alt=""`. Only frame 1
describes the drawing, so the trigger's accessible name stays fixed no matter
which scan is showing.

### Specificity, again

The three frames are `<img>` inside a `.reveal-img`, so the entrance rules own
them: `.js .reveal-img.visible img { opacity: 1 }` is (0,3,1) and was flooding
all three opaque, stacking the drawings on top of each other. `.patent-frame` at
(0,1,0) is not close. The rotator's rule is (0,4,0). The entrance itself is left
alone on purpose — the `translateX` slide still applies to all three, which is
correct, since the card moves as one block. Only which frame is opaque is taken
back.

> **Re-measured in a browser, and §P moved these numbers without saying so.**
> Headless Chromium, fonts loaded, `.text-window` clientHeight 130px in every
> case. The post-cut figures above — 3.5 screenfuls on mobile, 2.7 on desktop —
> reproduce **exactly** once `.doc-list-intro` and the in-box `.doc-list-expand`
> are removed from the box: 2.72 on desktop, 3.5 at 390px. Both were put inside
> `.text-window` by §P, which is later, and §P did not restate the measurement it
> had just changed. **As the page stands: 3.12 screenfuls on desktop (405px of
> content), 3.92 at 390px, 3.59 at 414px.** Desktop is flat at 3.12 from 768px
> up, because `main` caps at 760px. The two additions cost 52px between them
> (intro 20.8px, expand 25px, plus margins).
>
> The decision is untouched — 3.12 against the pre-cut 20.8 is the same result —
> but note what went wrong: **§O recorded rendered numbers without recording the
> viewport or the layout they were taken in**, which is why reproducing them took
> a bisect rather than a re-run. Any rendered figure written here should carry
> its conditions.

### Still open

The box is still 130px. The cut fixed the 20.8 screenfuls; it did not change how
many rows fit at once, which is still 2.1 on a phone. Raising it to roughly 170px
would show four or five entries while leaving ~250px of scroll for the rotation,
well clear of the 60px threshold. Not done, because it is a design call, not a
defect.


## §P — Six adjustments to the patent card

Follow-up to §O, after seeing it on screen.

**The caption gives the span, the box names the slice.** The card now reads
"depositati dal 1958 al 1995 presso gli uffici brevetti di diversi paesi" — the
whole working life, and no longer a country list that kept going stale as
jurisdictions were added. The 1964-1968 selection is named where the selection
actually is: a centred bold line inside the box, "Intorno agli anni della Logos".
§O's problem stands and this is its answer — the printed years are grant years,
the selection is by filing date, and no reader can infer that from the page.

> **OBSOLETE on both quotations — superseded by §AF.** The shape of the decision
> stands (caption gives the span, box names the slice); the two strings quoted
> in it do not, and neither does the closing justification.
>
> | quoted here | on the page |
> |---|---|
> | "depositati dal 1958 al 1995" | "depositati dal 1955 al 1995" (§AF §1 — priority dates open the range three years earlier) |
> | "Intorno agli anni della Logos" | "Brevetti degli anni Logos" / "Patents of the Logos years" |
>
> The last sentence — grant years vs filing date — is dead outright: the list
> prints priority years now. And "the 1964-1968 selection" names a rule that
> never existed: the cut is editorial, running to the mechanical bit and
> dropping the soundproof cover. **What §P got right and should be kept is the
> division of labour** — caption gives the span, box names the slice — which
> holds all the better now that the slice provably cannot be stated as a range.
> See the retirement note in §O for the rule and the cross-check.

**The dialog's first line now states the numbering convention.** Patent families
spanning several countries are listed once under the US document, with the other
jurisdictions' codes in brackets. That was being applied silently.

**"Espandi la lista" moved inside the box, and changed register.** §O put it
below the box and argued that a control inside a three-rows-visible list would
need scrolling to be found. That argument was answered rather than overruled: the
badge over the drawing is now the primary control and is always visible, so the
in-box copy is *deliberately* redundant — it is for the reader who scrolled to
the bottom looking for more, which is exactly the reader who will have reached
it. Two controls doing one job should not look alike, so this one is a plain
underlined link and the badge stays a badge.

**The four group headings are centred in the dialog.** At dialog width they are
the only thing separating 41 otherwise near-identical rows; left-aligned, a
heading reads as a longer list item.

**`.text-window` gets `color-scheme: light`.** See the correction in §L.

In print both copies of the expand control are hidden — they are interface, and
the complete list is already printing below as the appendix — while
`.doc-list-intro` stays, because it names what the card's eight are.


## §Q — The iOS bug in the rotator, and what it was really about

Reported symptom: on iOS only, in both orientations, the patent drawing vanished
whenever the list box was scrolled back to the top. Scrolling down again brought
back frame 2 and then frame 3 but never frame 1; scrolling up showed frame 1
again, which then disappeared the moment the box reached zero.

Cause, and it is one character: **Safari lets a scroll container rubber-band past
its own start, so `box.scrollTop` goes negative during the bounce.** Chromium
never does this, which is exactly why every desktop test passed — including the
full-range sweep that reported `[0,0,1,1,2,2]`.

With a negative `scrollTop` the index came out `-1`. The old code then did:

```js
frames[current].classList.remove("is-current");  // card goes blank
frames[i].classList.add("is-current");           // TypeError on frames[-1]
current = i;                                     // never reached
```

So the class was removed, the exception aborted the callback before it could be
put anywhere else, and `current` stayed stale at 0. The next scroll computed
`i === 0 === current` and took the early return — refusing to restore what it had
just removed. The card stayed blank until the reader scrolled far enough for `i`
to become 1. Every detail of the report follows from those three lines.

Two changes, and the second matters more than the first:

**`Math.max(0, …)`** clamps the bottom the way `Math.min` already clamped the top
(iOS bounces past the end too, where `scrollTop / range` exceeds 1).

**The update is now self-healing rather than incremental.** It asserts the whole
set every time — `frames.forEach((f, n) => f.classList.toggle("is-current", n === i))`
— instead of trusting `current` to describe the DOM, and the early return checks
the DOM as well as the index. The clamp fixes this bug; the rewrite means the next
one cannot leave the card permanently blank, because any scroll event repairs the
state. A cache of what the DOM should look like is a liability when an exception
can desync it.

The general lesson for this codebase: **anything reading `scrollTop` from a
container must assume it can be out of range in both directions.** Chromium will
not tell you.

## §R — Patent list corrections

**Jurisdiction codes.** Sixteen of the 41 entries are patent families filed in
several countries. They are listed once under the US document with the other
jurisdictions' codes in brackets — the convention the dialog's first line now
states. Two things were cleaned up in the source data on the way in: `CH468255`
appeared twice under 3,404,765, and 3,005,585 appeared as two separate rows
(`CH340647` and `SE195739`), now merged into one. Sixteen families, 22 codes.

> **The two counts are stale — §AG moved them and did not say so.** Swapping the
> two French documents for their German family members kept the French numbers
> as cross-references, `(FR2039399)` on DE 7014884 and `(FR2055456)` on
> DE 2036218. Both rows had carried no bracketed code before, so each swap added
> one entry and one code. **Re-counted from the rendered list: 18 of the 41
> entries carry codes, 24 codes in all**, IT and EN identical. The convention
> itself is unchanged, and so is the sentence below — two of the card's eight
> have codes, and the box still stays clean.

The codes are added **only inside `.doc-list-full`**, which is both the dialog and
the printed appendix. The card's eight-entry box stays clean: two of those eight
have codes, and a bracketed list of foreign numbers inside a box showing two rows
at a time buys nothing.

**Headings.** The dialog is back to three headings across four lists, which is
what §O found before it added a fourth. The first group needs no label — it is the
default — and "Firmati da Teresio e Natale Capellaro" became "Firmati con Natale
Capellaro", which reads as a variation on the unlabelled group rather than
repeating the subject.

**`.doc-list-intro` matches "il bit meccanico".** The intent was always that this
line look like the bold run inside the list a few rows below it, not like a
heading of its own. The first attempt read that as *lighter* and set weight 700
and colour #222; both were wrong. §18's 900 cut is right here, and the colour
should be `.text-window`'s own #4A4A4A citation grey.

The weight comes free by inheritance. The colour does not:
`.reveal-img.side.color-band figcaption p` at (0,3,2) sets #222 on every `<p>` in
the card, and `.doc-list-intro` is one. Hence
`.reveal-img.side.color-band .text-window .doc-list-intro { color: inherit }` —
(0,5,0), and `inherit` rather than a repeated literal so it tracks `.text-window`
if that grey is ever retuned. Verified: intro and list rows both compute to
`rgb(74, 74, 74)`.

The lower-case fix in "(il bit meccanico)" belongs to the same pass.

The badge is now just "⤢ Lista" / "⤢ List", matching the length of the other
badges on the page rather than carrying a sentence.


## §S — The burger reaches the WCAG floor, twice

The pre-publish audit measured `.menu-toggle` at **26x20 CSS px** on a phone: the
most-used control on the site, and the smallest thing on it. WCAG 2.2 SC 2.5.8
sets the floor at **24 px on both axes**, so it is the height that binds — and a
proposed 28x22 would not have cleared it either.

**The first attempt scaled the drawing** to 31x24, keeping the 1.3 aspect, and
was reported back as looking misaligned against the wordmark. It was, and the
reason is not where either of us first looked.

Three assumptions turned out to be wrong, all of them checkable:

**The burger does not set the navbar height.** With the burger at 20, 24 or 31 px
the navbar measured 57.6 px every time: `.nav-inner`'s `12px` padding plus the
brand's 33.6 px line box, which is the tallest flex item. Shrinking the burger
could not have made the bar shallower.

**Nothing was off-centre.** Wordmark box, signature and burger all centre on
28.83. Measured as ink centroids rather than boxes the spread is about a pixel —
wordmark 27.70, burger 28.83, signature 29.33.

**The alignment cue was a shared edge, not a shared centre.** At 26x20 the top
rule lands at y = 19.0, which is exactly the cap height of "Teresio Gassino".
That edge was doing all the work. Grown to 24 px the drawing starts at 17.0, two
pixels above the cap line, and ends at 40.7, nearly eight below the baseline — so
the burger straddled the wordmark instead of sitting on the same line as it. The
eye reads the shared edge; the arithmetic reads the centres; only one of them was
being looked at.

**The fix is 26x24: the original 26x20 glyph inside a 24px-tall target box**, bars
at `top: 2 / 11 / 20` so the drawing spans 2..22 and centres at 12. SC 2.5.8
measures the target, not the drawing, so two pixels of clearance above and below
satisfy it without changing anything visible. Verified: box 26x24, burger ink back
to 19.0..38.7, top rule flush with the cap height again, X still converging on 12
when open.

The earlier note here argued padding was a dodge — "the burger is not a small icon
that happens to need a bigger hit area, it is a small icon full stop". That was
wrong, and specifically it assumed the glyph's dimensions were arbitrary. They
were not: 20 px is two 2px rules and two 9px gaps landing on the brand's cap
height. Padding is the right tool precisely because the drawing was already
correct.

**If you resize this control, keep the top rule on the cap height of the brand
text**, and reach the 24px target with the box rather than the glyph.

A sweep of every non-inline `<a>` and `<button>` across all seven pages at 390px
returns **zero** under 24x24. The eight a naive check still flags on Curriculum
are the patent links inside `.text-window` — inline links in a text block, which
SC 2.5.8 exempts explicitly.

`sitemap.xml`'s `lastmod` went to 2026-08-26 across all 14 URLs in the same pass;
it had been claiming 2026-08-20, from before the patent list was rebuilt.

## §T — The rotator's entrance stopped animating

Reported after §O shipped: the patent card's first drawing entered "a scatto",
desktop and mobile alike, while every other image on the site still slid in.

Two independent causes, both introduced by the rotator's own CSS.

**A shorthand ate the transform transition.** `.reveal-img img` carries
`transition: opacity 0.8s ease, transform 0.8s ease`. The rotator declared
`transition: opacity 0.45s ease` for its cross-fade — and `transition` is a
shorthand, so that did not *add* an opacity timing, it *replaced the whole
declaration*. Measured: the frames reported `transition-property: opacity`,
duration `0.45s`, against `opacity, transform` / `0.8s, 0.8s` on every other
image. The 60px slide therefore ran in zero seconds.

**And the wrapper was clipping it anyway.** `.patent-rotator-frames` had
`overflow: hidden` for rounded corners, so even with the transition restored the
slide would have happened *inside* the box. The clip is not needed: each frame is
an `<img>` inside a `.reveal-img`, so `.reveal-img img { border-radius: 8px }`
already rounds it.

**Correction, one round later.** Only the first cause was real. Removing the clip
was not a fix, it was a second bug: with `overflow: hidden` gone, the entering
drawing slid *across* the pastel card instead of emerging from behind its frame
edge, and a reader spotted immediately that this card behaved unlike the other
three. The clip was never what made the entrance snap — the missing transform
transition was, on its own.

The three anchors get their clip from `.side-row > a { overflow: hidden }`, and
the patent card's trigger is a `<button>`, so it matched none of that rule: no
clip, no `position: relative`, no `border-radius`, and no hover overlay either.
Those selectors are now `.side-row > a, .side-row > button`, and `.patent-rotator`
has been cut back to the one thing a button needs and an anchor does not —
undoing the UA button styling. Everything structural comes from the shared rule,
so this card cannot drift from the other three again. Verified: all four triggers
report `overflow: hidden`, `position: relative`, `border-radius: 8px` and a live
`::after`.

The general lesson is the one-line version of §O's: **when you swap an element's
tag, re-read every selector that was styling it.** `a` → `button` silently
dropped four declarations.

The fix for the snap is to declare no `transition` at all and inherit the site's.
That costs a slower cross-fade — 0.8s rather than 0.45s — and buys an entrance
identical to every other image, which is the trade §K's doctrine implies: on this
site image behaviour *is* the visual language, and a bespoke timing on one card is
a bug even when it looks fine in isolation.

Verified by sampling `translateX` through the entrance: 60 → 59.4 → 51.8 → 38.3 →
25.5 → 16 → 9.6 → 5.2 → 2.4 → 0.7, easing over ~0.8s, against a single 60 → 0 step
before.

**General rule worth keeping: never set `transition` shorthand on an element that
already inherits one from a shared rule.** Use the longhand, or set none.


## §U — The last of the small audit items

Four fixes with nothing interesting in common except that each was cheap.

**`region` is gone, and with it the last axe violation.** `.lang-link-desktop`
sat between `<a class="skip-link">` and `<header>`, outside every landmark, which
axe flags as `moderate` on all 14 pages. Moved to the first child of `<header>` —
it is navigation and belongs in the banner. All 14 pages now return **zero**
violations at wcag2a/aa + wcag21 + wcag22aa + best-practice, not merely zero
serious ones.

**`<meta name="referrer" content="strict-origin-when-cross-origin">`** on all 14.
GitHub Pages cannot set headers, so the meta is the only route; unlike a CSP it
needs no hash and no maintenance.

**The language switcher says what it is.** Both copies — the desktop pill and the
one inside the nav — carry `lang` on the text and an `aria-label` ("English
version" / "Versione italiana"). Without `lang`, a screen reader in Italian reads
"EN" as Italian letters; without the label, the whole accessible name was two
characters.

**Hidden section headings on the two long pages.** Home is 604 words and Discorso
1087, each with a single `<h1>` — for a screen-reader user navigating by heading,
one undifferentiated block. Galleria (35 words) and Quercia (76) need nothing and
got nothing.

Home takes four rather than the two or three first suggested, because the essay
is not linear: it runs from Arè to the Logos 27 to the move to Siena, then jumps
back to 1953 for the house at Monte Navale. Three headings would have filed the
house under "after Olivetti", which is wrong by a decade. So: *Gli inizi e le
prime macchine*, *La Logos 27*, *Dopo l'Olivetti*, *La casa di Monte Navale*.

Discorso takes two, matching what is actually there: *I ritagli* for the clump of
six photographed clippings, *Le fonti* for the band that says where each came
from.

All are `<h2 class="visually-hidden">`. Verified as costing nothing: document
height is 4057px on Home and 1893px on Discorso, unchanged to the pixel, and each
heading measures 1px in the clip rect.

The insertion is anchored on a phrase from each paragraph rather than on an index,
because the Italian and English essays do not have the same number of blocks — the
English splits one paragraph in two.


## §V — Four small behaviours, and one deliberately left alone

### The ornament worked exactly once

`<a href="#top">` at the end of the essay. First click scrolls to the top and
sets the fragment; every click after that navigates to a fragment the document is
already at, so the browser does nothing. Measured with real clicks: 2500 → 0,
then 2500 → 2500, then 2500 → 2500. Not a taste question — the control was dead.

This turned out to be one instance of a pattern, not a one-off. See §W.

`initOrnamentLinks()` preventDefaults and calls `window.scrollTo({ top: 0 })`,
with no `behavior`, so it resolves to the computed `scroll-behavior`: smooth once
§G has armed it, instant under `prefers-reduced-motion`, without this function
needing to know about either. The `href` stays in the markup for the no-JS case.
A side effect worth having: no more `#top` in the URL or on the history stack —
the ornament is a convenience, not a place.

### The focus ring on the lightbox X

Reported on mobile: opening a lightbox by tap painted a focus ring on the close
button. It comes from `closeBtn.focus()` — programmatic focus on a `<button>`
leaves several engines matching `:focus-visible`, Safari most readily. Chromium
does not, which is why it never showed up in testing here.

**Suppressing the ring would have been the wrong repair.** Keyboard users need it,
and it is doing its job correctly for them. What was wrong was the target. Focus
now goes to the dialog itself (`focusDialog()`, `tabIndex = -1` then `focus()`).
The dialog already carries `outline: none` as a container rather than a control,
a screen reader announces its `aria-label` on arrival, and the first Tab lands on
the X with a proper ring. Verified: `document.activeElement` is the
`<dialog>`, `:focus-visible` on the X is false on open and true after one Tab.

### The burger's hesitation was real, and measurable

Reported as a few milliseconds where the icon looks like a single central bar.
It is not a paint or a script delay — it is the easing.

With one shared `ease` on both properties, the bars converged as fast as they
rotated. Measured frame by frame: the rotation reaches 30 degrees only at 134ms,
by which point the two rules sit **4.7px apart**. Two 2px rules, 4.7px apart, at a
shallow angle, read as one thick blurred bar.

Direction-specific easing fixes it without changing the duration. Opening,
rotation leads (`cubic-bezier(0.16, 1, 0.3, 1)`) and convergence lags
(`cubic-bezier(0.7, 0, 0.84, 0)`); closing wants the mirror, or the same artefact
appears on the way back, so the base rule times the return and the `.open` rule
times the trip out. After: 30 degrees at **43ms with the bars still 18px apart** —
the X is legible before the rules go anywhere near each other. Zero ambiguous
frames in either direction, against a floor of 6.0px before.

### The patent card's image box

The wrapper carried `aspect-ratio: 800 / 615`, the scans' own proportion. But
`.reveal-img.side img` crops **every** side image to 4/3 regardless of what it is
— the three neighbouring cards hold 1.41, 1.42 and even 0.73 and all render
281x210. 800/615 is 1.3008, slightly taller, so the wrapper stood 5.3px proud of
the picture inside it: a sliver of pastel under the drawing, visible whenever the
hover overlay painted it, and a badge sitting 10px up from the wrapper instead of
10px up from the image.

Now 4/3, like everything else in a `.side-row`. `object-fit: cover` trims 7.5px
off the top and bottom of an 800x615 scan — about 1.2% a side, well inside the
drawings' own margins, so redrawn images with wider borders are not needed. All
four triggers now measure 210.4px tall with a 0px strip and the badge 10px above
the image.

### Language switching does not keep your place, and should not

Genuinely tempting, and rejected on measurement. The two versions are
translations, not the same document: `home.html` is 4057px tall and
`en/home.html` is 4660px — **15% apart**, because the English essay splits one
paragraph in two. A proportional restore would land a reader most of a screen away
from where they were, worst exactly on the longest page, where it would matter
most. Wrong beats absent here: landing at the top is honest and predictable.

An accurate version is possible — record which `<h2>` section is at the top and
restore to the same section in the other language, which §U's hidden headings now
make feasible on both long pages. That is real machinery for a two-page benefit,
and it is not built. Noted here so the next person knows the option was weighed
rather than missed.


## §W — Every in-page link had the ornament's bug

§V fixed the ornament and treated it as a quirk of `#top`. It was not: **any**
fragment link on this site goes dead after its first use, for the same reason.
Clicking a link whose target the document is already at asks the browser to
navigate nowhere, and it obliges.

Site-wide there are 25 such links with real targets, plus the two `#top`. Three
groups are affected in practice:

- **The four coloured words on Discorso**, which are the page's whole mechanism:
  the colour ties an excerpt to the paragraph it came from, and the link is how
  you follow it.
- **The footnote links on Home**, `#nota` and the English `#nota-1` / `#nota-2`.
- **The skip link**, `#main`, on all 14 pages.

Discorso is the worst case, because **four links share three targets**:
"documento" and the first "parole" both point at `#clump-row-1`. Using either one
kills both. Measured with real clicks: 1400 → 138, then 1400 → 1400, then
1400 → 1400, and "parole" dead on arrival afterwards.

`initFragmentLinks()` intervenes **only** when `location.hash` already equals the
link's href — the single case the browser gets wrong. Every navigation that works
today is left completely alone, and that restraint is load-bearing rather than
tidy: `initScrollMemory()` keys each history entry by a `twKey` it keeps in
`history.state` (§H), so a handler here that pushed or replaced state would
quietly break scroll restoration across the whole site. This one pushes nothing
and replaces nothing.

`scrollIntoView` respects the `scroll-margin-top: 100px` that clears the fixed
nav, and with no `behavior` argument resolves to the computed `scroll-behavior` —
smooth once §G has armed it, instant under `prefers-reduced-motion` — so the
function does not need to know about either. Targets carrying `tabindex` also get
focus, because that is what a real fragment navigation does: it is how the skip
link reaches `<main tabindex="-1">`.

After: all four coloured words land on 138 / 138 / 614 / 1117 on three
consecutive clicks each, alternating between the two links that share
`#clump-row-1` works indefinitely, the footnotes are stable across three clicks,
and the skip link moves focus to `<main>` every time. §H's four restoration
scenarios are unchanged, including the `#nota` round trip at 1500 → 4193 → 1500.

### A testing note worth more than the fix

The first diagnosis of this used `element.click()` from `page.evaluate`, and it
lied. **A synthetic `.click()` on an anchor sets `location.hash` but does not
perform the fragment scroll**, so `#nota` appeared broken on the very first use —
in a build where it was fine, and with `animations.js` blocked entirely, which
ruled out this codebase as the cause. A real user click scrolled to 3157 as it
should.

Anything testing anchor behaviour here has to use a real click. The synthetic
path produces a failure that looks exactly like the bug being hunted, which is
the most expensive kind of wrong.


## §X — The pre-publish audit batch

Seven small corrections found by a full pre-publish pass (static parse of all 14
pages, axe-core on each at 1440 and 390, contrast measured from rendered pixels
rather than from declared values, overflow at seven widths, target sizes, and a
keyboard walk through both dialogs). The pass found **no axe violations on any
page** and no broken link, dead fragment, duplicate id or missing `alt`, so what
follows is the whole list, not a selection from it.

### The rotator's frames 2 and 3 were invalid HTML

`src` is a required attribute on `<img>`, and the two deferred frames had only
`data-frame-src`. It never broke anything — `initPatentRotator()` supplies the
real source on an idle callback after `load` (§O) — but it was the single
validation error in the whole site. They now carry the same inert 1×1 gif already
used as the between-opens placeholder in both dialogs, with `data-frame-src`
untouched, so the deferral is unchanged and nothing new is fetched: the
placeholder is a data URI, and the frames sit at `opacity: 0` until the swap.

Two comments in the stylesheet asserted "frames 2 and 3 have no src at all" as
part of their reasoning. Both are now wrong about the mechanism and right about
the outcome, and both were rewritten rather than left to mislead.

### Five patent PDFs were linked absolutely

Inside `#text-brevetti-completi`, five of the 41 entries pointed at
`https://teresioweb.github.io/brevetti/…` while the other 36 were relative — in
both languages, so ten links in total. Nothing visible went wrong, but a local
preview of those five silently reached production instead of the file on disk,
which is the kind of difference that hides a broken path until after deploy. They
now follow each language's own convention: relative on the Italian page, root-
absolute on the English one.

### `.clump-badge` had 0.24 of contrast margin

The badge is `rgba(0,0,0,0.55)` with `#fff` text, and it sits by design on the
blank paper margin at the bottom of a scan (§33) — so its worst case is white
underneath. Composited, that measured **rgb(115,115,115), 4.76:1**: an AA pass by
a quarter of a point, on a line that is a working instruction ("clicca per il
testo pdf completo"), not decoration. Raised to 0.65, which composites to
rgb(89,89,89) and **7.01:1**, measured back on the rendered page — which
incidentally clears AAA as well. `.img-badge` was already at 0.72 (9.23:1) for the
same reason; this brings the two into the same register.

Everything else measured comfortable and was left alone: body text on the
watermark 7.40:1, `.fonte` on the pastel bands 4.81–6.18:1, the highlighted words
11–14:1, gallery captions 14–20:1, the nav's `#111` on its composited `rgb(155)`
6.79:1. `.fonte` at `#888` on the plain page background stays at 5.37:1 — AA, not
AAA, which is a standing decision and not an oversight.

### Forced colours were the one output mode with no answer

The site already handles `prefers-reduced-motion`, `color-scheme`, print, and a
breakpoint ladder in `em` that follows the reader's own default size (§J). Forced
colours — Windows High Contrast and its equivalents — had nothing.

The failure is specific rather than general. Forced colours override `color` and
`background-color` with the reader's system pair; they do **not** override
`background-image`. Every page here puts its watermark behind the text as
`linear-gradient(rgba(16,16,16,.75) …), url(…)`, and `.gallery-caption` is a
gradient of its own — so the dark wash survives the override while the text does
not, and a reader on a black-on-white theme ends up with system-black over
roughly rgb(76,76,76). The new block drops those images, the same way and for the
same reason `@media print` already does.

The rest of the block is borders. Forced colours flatten the page to a single
background, and every element that reads as a separate surface only because it is
a different shade — the nav pill, the language pill, the skip link, the badges
floating on photographs, both dialogs — loses that separation. `.hl` gets the
print sheet's colourless underline fallback, because Discorso's four highlights
are the one place where hue alone carries meaning (§I) and forced colours
collapse all four to the same pair.

Nothing in the block sets `forced-color-adjust: none`. Overriding the reader's
palette is precisely what this mode exists to prevent, and no part of this site
has a reason to.

### `dateModified`, which the prose already knew

`home.html` signs off "Ivrea, novembre 2018 (rivisto nel luglio 2026)" and its
`Article` graph carried only `datePublished: 2018-11-01`. Added
`dateModified: 2026-07-31` on both language versions. One line each; the visible
text was already correct and only the machine-readable copy was behind.

### Four typographic slips

Three straight apostrophes in visible text or in `alt`/`data-doc-alt` (`Dopo
l'Olivetti`, `all'aperto`, `l'orizzonte`, `l'onorificenza`, `Spilla d'Oro`,
`sull'Olivetti`, and the English `Capellaro's`), against `&rsquo;` everywhere
else on the site.

The fourth is different and worth stating precisely, because the obvious repair
is the wrong one. Banchelli's post reads `Giannitrapani …girava`, with no space
after the ellipsis. The `<template>` transcript reproduced that; the
`.visually-hidden` sibling on the same photo had quietly *corrected* it to
`… girava`. Two transcriptions of one source disagreeing is worse than either
version of the spacing, and the source is the one that decides: the hidden copy
now matches the template, typo included. Same in English. `Spilla d'0ro` — a zero
for an O, a few lines above — is left standing for exactly the same reason.

### Three group labels that were headings pretending not to be

The complete patent list is 41 rows in four groups, and the three labels dividing
them were `<p><strong>`. They are now `<h3 class="doc-list-heading">`, so the
list is navigable by heading in a dialog whose entire content is that list.

The first group keeps no label at all, deliberately: its members are the patents
Teresio filed alone, and the only honest label would restate by exclusion what
the three headings below already say.

Dropping `<strong>` cost two inherited values that had to be declared back on the
class. The weight: `<strong>` was collecting §18's
`body.page-curriculum strong { font-weight: 900 }`, and an `<h3>` is 700 — the
line would have lightened without anyone touching a weight. The size: an `<h3>`
is 1.17em by default, and these want to read as dividers between rows rather than
as bigger rows, so the `font-size: 1rem` that was already in the rule is now
doing real work instead of restating what a `<p>` gave for free. **Swapping an
element's tag means re-reading every selector that was styling it** — the same
lesson §T recorded, arriving again from the other direction.

### Left alone on purpose

- **The hero's 15px.** `.hero-photo` is `width: 100vw` while `html` carries
  `scrollbar-gutter: stable`, so on any engine with a classic scrollbar the
  full-bleed figure is clipped by about 7px a side. Measured at every width from
  320 to 1440; it is the only element on the site that still overflows once the
  entrance animations have settled. The crop is right as it stands, so the
  behaviour stays. Recorded here so it reads as a decision rather than as
  something nobody noticed.
- **The Quercia's `og:image`** is 630×415, under the 1200×630 that
  `summary_large_image` wants. There is no larger source, and the page is the
  hidden one.
- **Path conventions.** The Italian pages use relative paths, the English ones
  root-absolute from the domain root — `css/style.css` against `/css/style.css`,
  `images/…` against `/images/…`. This is deliberate and already stated in
  `README.md`, but it had never been written down as a decision, which made it
  read as drift to an outside reader and cost this audit a finding. Both work;
  the split exists because the English pages live one directory down and
  root-absolute paths let them share every asset without a `../` in front of it.
  Anything added to `en/` follows the English convention, not the Italian one.


## §Y — Firefox darkened a light scrollbar that Chrome had already fixed

§L gave `.text-window` `color-scheme: light`, and it was the right fix for the
symptom as diagnosed at the time: `:root` sets `color-scheme: dark` for the
page, and this box — a light citation panel on a pastel card, not a dark
panel like `.doc-viewer-scroll`/`.doc-viewer-text` — had been swept up in that
one declaration by mistake. Chrome confirmed the fix immediately. Firefox kept
drawing a dark scrollbar on the same light box.

The two engines disagree about what decides a scrollbar's colour when it is
`auto` (the default `scrollbar-color`). Chromium reads `color-scheme` alone.
Firefox reads that **and** a second, older, independent signal: a heuristic
ported from WebKit — first written for Cocoa's scrollbars, later reused for
Windows in `nsNativeThemeWin` — that inspects the *specified*
`background-color` on the scrolling element itself and darkens the scrollbar
whenever the raw R+G+B sum is under 384 (Bugzilla #865806). "Specified" is the
operative word: it reads the declared triplet, not the colour the tint
actually paints once composited with whatever sits behind it.

`.text-window` declares `background: rgba(0, 0, 0, 0.06)`. To a human eye that
is a 6% wash — barely a shadow — over the card colour underneath. To this
heuristic the triplet is `(0, 0, 0)`, sum zero, indistinguishable from solid
black. Alpha never enters the calculation. So Firefox's own signal said
"dark background here" while `color-scheme: light` said the opposite, and on
Firefox the background heuristic is not overridden by `color-scheme` — the two
apply together, and this one wins the paint.

The fix is a second, independent lever neither heuristic can see past:
`scrollbar-color: rgba(0, 0, 0, 0.35) transparent`. Both engines that ever
guess (Chromium and Firefox) treat an explicit `scrollbar-color` as
non-`auto` and stop guessing entirely, so it settles the box regardless of
which heuristic a given engine runs. Safari has never implemented
`scrollbar-color` at all — for Safari `color-scheme: light` from §L remains
the entire story, exactly as it already was, so the addition changes nothing
there.

### Checked for elsewhere

The failure mode needs three things at once: an element that scrolls, a
`background-color` with a near-zero literal RGB triplet, and a declared
`color-scheme` that disagrees with what that triplet implies. The site has
exactly three `overflow: auto` / `overflow-y: auto` elements in total —
`.text-window`, `.doc-viewer-scroll`, `.doc-viewer-text` — so the search was
exhaustive rather than a sample.

- **`.doc-viewer-scroll`** and **`.doc-viewer-text`** carry no
  `background-color` of their own; both sit inside `.doc-viewer-overlay`,
  `background: #101010`, and both are under the page's own
  `color-scheme: dark` with no local override. Declared colour and declared
  scheme agree — dark background, dark scheme — so Firefox's heuristic and
  `color-scheme` reach the same answer and there is nothing to fix.
- Every other `rgba(0, 0, 0, …)` background on the site (`.img-badge`,
  `.clump-badge`, both lightbox/doc-viewer scrims, the gallery caption
  gradient, the burger overlay) sits on an element that does not scroll. The
  Firefox heuristic only fires on the scrolling element itself, so an
  identical low-alpha black is inert everywhere else it appears.

`.text-window` was the only place all three conditions lined up, and is now
the only place carrying an explicit `scrollbar-color`.


## §Z — The rotator's second and third frames were replaced

`brevetto-2.webp` and `brevetto-3.webp` now show different drawings: Fig. 3 of a
patent filed 1 April 1966, and Fig. 2 of one filed 24 September 1964. Frame 1 is
untouched.

**The choice is aesthetic, and only aesthetic.** These two are not more
representative of Teresio's work than the ones they replace, not more
significant patents, and not tied to anything the card's caption or the list
below it says. They are better-looking drawings. That is the whole reason, and
it is written down here so that nobody later reads meaning into the selection
and tries to preserve a criterion that was never applied. If a third drawing
turns up that looks better still, swapping it in costs nothing and breaks
nothing.

### Geometry, which is the part that is not free

The card holds `aspect-ratio: 4 / 3` on `.patent-rotator-frames`, and §P sized
the frames at 800×615 — a ratio of 1.3008, trimmed to 4/3 by `object-fit: cover`
at about 1.2% off the top and bottom, well inside the drawings' own margins.
Three frames cross-fading in the same box means all three have to be that
geometry exactly, or the card resizes mid-rotation.

The two sources arrived at 1173×902 (1.3004) and 1200×922 (1.3015) — both within
0.06% of the existing 1.3008. A straight resize to 800×615 was enough; neither
needed a crop or a pad, so nothing was lost from either drawing beyond the 1.2%
that `object-fit` was always going to take. Confirmed after conversion: all
three frames report 800×615, and stepping the box through its full 275px of
scroll range cross-fades 1 → 2 → 3 with no reflow.

### Weight

WebP quality 80, giving 79KB and 83KB against frame 1's 65KB. Quality 85–88 was
tried first and produced 92–102KB; the reference numerals — which are the only
reason to look at a patent drawing closely — stayed legible at 80, so the extra
20KB a frame bought nothing a reader would see. The three frames are no longer
"roughly the same bytes-per-pixel", a phrase `README.md` used to justify the
no-reflow claim; the claim survives because it never depended on the bytes, only
on the geometry, and the README now says so.

Frames 2 and 3 keep `alt=""` (§O): the trigger's accessible name is fixed and
must not change with the picture, which is exactly the property that makes an
aesthetic swap like this one cost nothing in the accessibility tree.

## §AA — The nav bar grew with the type; its box did not

`§10` moved the burger threshold from `1080px` to `67.5em` so it would
track the browser's default font size, and `§B` put all 45 `font-size`
declarations in rem for the same reason. Both worked. What neither
touched was the bar those labels sit in: `.site-nav` stayed at
`max-width: 950px` and `.nav-inner` at `900px`, per `§B`'s rule that
boxes stay in px while type scales.

Between them that leaves a gap. At a 20px default the threshold moves to
1350px, exactly as intended — but the six labels inside are 25% wider
while their container is still 862px of content box, and `.nav-inner` is
`flex-wrap: nowrap` with `white-space: nowrap`, so the row overflows
instead of folding. Measured on `home.html` with Chromium's
`Page.setFontSizes`:

| default | 1280px | 1440px | 1920px |
|---|---|---|---|
| 16px | fits | fits | fits |
| 18px | fits | fits | fits |
| 20px | burger | overflows 52px, spills 8px past the bar | same |
| 22px | burger | burger | overflows 134px, spills 90px |
| 24px | burger | burger | overflows 203px, spills 159px |

Not a narrow window: above the threshold it is every desktop width, since
the bar's width no longer depends on the viewport. On screen, "Foto" and
the language pill sit outside the translucent panel against the dark page.

Both max-widths are now in rem — `59.375rem` and `56.25rem`, the same
numbers at a 16px default — so the box scales in the unit the threshold
already used.

**The pill moves with it, and this is the part to remember.**
`.lang-link-desktop` is positioned from the bar's geometry (`§72`):
`calc(50% + min(475px, 50vw) + 12px)`, where `475px` is half of `950px`
written out. Converting only the two max-widths puts the pill *inside* the
bar — 107px in at a 20px default, 225px at 24px, on top of the last link.
It is now `min(29.6875rem, 50vw)`, half of `59.375rem`. **Three values
encode one measurement: `.site-nav`'s max-width, `.nav-inner`'s, and half
of the first inside the pill's `left`. Change one, change all three.**

Verified across 3 default sizes × 4 widths: at 16px every measurement is
unchanged (bar 950px, links 44px inside it, pill 12px clear); at 20px and
24px the overflow goes to zero and the pill returns to its 12px gap.

What this does not change: `main` and `footer` stay at `760px`, so a
reader on a 20px default now sees a 1188px bar over a 760px column. The
bar was already the wider of the two by design (`§8`); this widens the
difference at large defaults rather than introducing it.

## §AB — A dialog open at print time, and the gallery's missing spinner

Two separate gaps, both in the same place: the two dialogs were built as
screen furniture and nothing accounted for the reader leaving one open.

**Printing.** `§M` gave the site a print sheet on the reasoning that a
memorial should survive onto paper. It handles the page. It never handled
the case where a dialog is open — and both dialogs are `position: fixed`
with a viewport-height scroll pane, so the printer painted the first
screenful over every sheet and dropped the rest. Measured, text view, at
a 900px viewport:

| panel | content | visible | lost |
|---|---|---|---|
| `text-brevetti-completi` | 2659px | 850px | **1809px** |
| `text-banchelli-ricordo` | 1405px | 850px | 555px |
| `text-quercia-2` | 1299px | 850px | 449px |
| `text-banchelli-logos` | 1269px | 850px | 419px |
| `text-quercia-1` | 1031px | 850px | 181px |
| `text-teresio-cavaliere` | 892px | 850px | 42px |
| `text-diploma-cfm` | 850px | 850px | 0 |

Six of seven. Curriculum was the worst, which is the opposite of what
`§M`'s appendix trick suggests: that trick fixes printing *the page*, and
does nothing for printing *the dialog*.

`body:has(dialog[open]) > *:not(dialog[open])` is the whole gate. No open
dialog, no match, and the sheet prints exactly as before — verified
unchanged at 5 pages for Curriculum, 4 for Home, 2 for Discorso, 1 for
Foto. With one open, the page behind is dropped and the panel prints
whole: the patent list goes from one clipped screen to 3 pages and 670
words.

**`position: static !important` on the dialog looks like a no-op and is
not.** A top-layer element computes `static` to `absolute`, so the dialog
does not return to flow — measured, it still reports `absolute` and
`body.scrollHeight` falls to 35px. But removing the declaration collapses
the patent list from 3 pages and 670 words to 1 page and 231, because the
UA's own fixed positioning then caps the printable box at one viewport.
It was tried both ways. Keep it.

**The footer does not come along**, for the same top-layer reason: it is
laid out beneath the dialog's opaque background and never paints, even
though its text reaches the PDF's text layer. So a printed transcript
carries no licence line. Printing the page itself — the normal case —
still does.

`[hidden]` is left to outrank the `display: block` that opens the panels,
so image view prints the scan and text view prints the transcript, never
both.

**The spinner.** `§63` gave the document viewer a loading gear because it
opens multi-hundred-KB scans. The gallery lightbox never got one, and it
has the same problem: five of its six photos point `data-src` at a file
separate from the thumbnail already on the page — `foto-01.webp` is 178KB
against the thumb's 78KB. On a slow connection a tap opened an empty
dialog that said nothing.

It reuses `docViewerSpin` and the same gear, with two differences from
`§63`. `.lightbox-content` needs `min-height: 160px` while loading, since
the image is at `opacity: 0` with no intrinsic size and the box would
otherwise collapse to nothing around the gear. And it needs a guard the
doc viewer does not: that dialog always loads a fresh `src`, while
prev/next here can land on an image the browser already has, and
assigning a `src` that changes nothing fires no `load` event — the gear
would turn forever. `if (overlayImg.complete && overlayImg.naturalWidth >
0) settle();` right after the assignment covers it. Verified: throttled
to 40KB/s the gear appears and clears, eight prev/next steps leave
nothing stuck, and reopening a cached photo settles immediately.

Home's two triggers have no `data-src` — they reuse the thumbnail's own
`src`, already in the page — so there is nothing to wait for and the
guard settles them on the spot.

## §AC — The invalid figcaption, and why it stays

`figure`'s content model wants `figcaption` as a direct first or last
child. On the four side-by-side card pages it is one level deeper:

    figure.reveal-img.side > div.side-row > figcaption

That is 16 errors from the Nu validator — 4 each on `logos.html`,
`curriculum.html` and their two English counterparts. Every other page
validates clean, and `home.html` already has the conforming shape
(`figure > button + figcaption`), so the right pattern exists in the
codebase. axe reports nothing: it checks ARIA and computed
accessibility, not the HTML content model.

**It stays anyway.** Three attempts to correct it: two broke the
images' appearance, the third ran out before producing anything. The
structure is load-bearing — `.side-row` is the flex row that gives the
image column its 42% and the caption the rest, and `.fonte-row` below it
repeats the same two-column geometry with an invisible spacer (`§23`).
Pulling `figcaption` out to be a direct child of `figure` means the
figure itself has to become the flex container, which changes what
`.reveal-img.side figcaption`, `.from-right .side-row` and
`.align-top .side-row` are selecting.

**What it actually costs.** Two things, both bounded. The 16 validator
errors, visible to anyone who runs the site through the W3C checker. And
four `figure` elements on Logos and Curriculum with no accessible name,
since a `figcaption` nested this deep does not name its figure. The
captions themselves stay in the reading order and are read normally; what
is lost is the figure↔caption association, not the text.

Weighed against three failed attempts at a layout that works, that is the
trade being taken. This entry exists so a fourth attempt starts from the
record rather than from the validator output.

## §AD — The gallery lightbox on a phone

Three faults, found by opening the lightbox on a portrait phone after
`§AB` shipped. One was caused by `§AB`, two were older than it.

**Prev/next vanished in portrait. This one was `§AB`'s fault.** The
loading gear needed a positioning context, so `.lightbox-content` got
`position: relative`. That moved it out of the in-flow painting phase and
into the positioned one, where it now competes with `.lightbox-prev`,
`.lightbox-next` and `.lightbox-close` — all `position: absolute`, all
earlier in the DOM, none carrying a `z-index`. Later sibling wins, so the
photo painted over the controls. Confirmed by hit-testing the centre of
the prev button against the original build and the new one:

| build | portrait | landscape |
|---|---|---|
| before `§AB` | `lightbox-prev` | `lightbox-prev` |
| after `§AB` | `IMG` | `lightbox-prev` |

Landscape was unaffected because there the photo spans 180–664 and the
buttons sit at 18–70 and 774–826, so nothing overlaps. In portrait the
photo spans 20–370 and swallows both. The three controls now carry
`z-index: 1`, which is the durable fix — it holds whatever
`.lightbox-content` does later.

**21px of horizontal scroll, and this one is original.** Measured
identically on the untouched zip: 24px at 320, 21px at 390, and 14–21px
of *vertical* overflow in landscape. Small, but real.

**Capping the content was the wrong repair.** The first attempt held the
photo to `min(90vw, calc(100vw - 80px))`, which removed the overflow by
removing photo: 351x227 down to 310x200 in portrait, 483x312 down to
331x214 in landscape — a third of the area gone in exchange for 17px of
scroll. The gutter is what should give way, not the picture. It is now
`min(5%, 40px)`: proportional where the screen is small, and the original
40px wherever there is room, so no wide screen changes.

Two details that cost a round each. **Percent, not `vw`** — `vw` counts
the scrollbar that the padding box does not have, leaving 7px hanging off
a 1024px window. And **`max-width: 100%` on the photo, not `90vw`** —
with `90vw` on a shrink-to-fit flex column the percentage resolved
against a width derived from the image itself and came out 1.5% short.

Where the height is the binding constraint, `min(80vh, calc(100vh - 2 *
--lb-pad-y - --lb-chrome))` applies, with `--lb-pad-y` dropping from 16px
to 8px under `max-height: 30em` because a phone held sideways has nothing
else to give. Never a percentage in `max-height`: against
`.lightbox-content`'s auto height it is indefinite, which voids the whole
declaration and leaves the photo with no cap at all — 205px of overflow
when it was tried that way.

Result against the original, 12 viewports:

| | photo | overflow h/v |
|---|---|---|
| portrait, all widths | **identical** | 19–24 → 0 |
| tablet 768, desktop 1280/1920 | **identical** | 0–2 → 0 |
| desktop 1024 | +1.6% | 0 → 0 |
| landscape 932 | identical | 14 → 0 |
| landscape 844 / 740 / 568 | −2% / −6% / −13% | 17/18/21 → 0 |

Short landscape is the only place that trades size for the fix, and it is
the only place where 80vh plus the caption genuinely cannot fit.

**Prev/next were never on the photo's middle.** `top: 50%` centres them
on the dialog, but the photo is not the whole column — the counter and
caption hang below it, so the photo's centre sits half of `--lb-chrome`
higher. Measured 32px off in portrait and on every desktop size, in the
original too. `top: calc(50% - var(--lb-chrome) / 2)` puts it at 0
everywhere. The same variable both reserves the space and applies the
shift, so they cannot drift apart.

**The gear had a fixed offset, and only one case fits a fixed offset.**
It sat at `top: 80px`, the centre of the 160px square reserved on the
image while it loads. That is right exactly once: on opening, when the
overlay image holds the 1x1 blank and the square is the whole box.
Stepping with prev/next is the other case — the browser keeps the
previous photo painted until the new one decodes, so the box is as tall
as the photo you just left and a fixed 80px lands near its top edge:

| | box height | gear off centre |
|---|---|---|
| opening (blank, 160px square) | 160px | 0 |
| step onto a 410px photo, portrait | 410px | −125px |
| step onto a 542px photo, desktop | 542px | −191px |
| step onto a 720px photo, desktop | 720px | −280px |

The gear now uses `top: calc(50% - var(--lb-chrome) / 2)` — the same
expression as prev/next, and for the same reason: the column is centred
but the photo is not the whole column. It is the box's centre whatever
the box currently is, so opening and stepping agree. Measured at 0 or
−1px (rounding) in every case above.

Two dead ends worth recording so they are not retried. **Handing the
overlay image the thumbnail's `width`/`height` before the file arrives**,
to reserve the photo's real box and kill the layout shift, looks right and
does not work: inside a column flex container with both axes `auto` the
intrinsic ratio does not resolve, and the box came out square anyway
(measured 338x338 where 338x218 was wanted). **And `dvh` instead of `vh`**
was added on a theory that a collapsing phone URL bar was moving the photo
under a correctly-placed gear. The theory was wrong — the gear is correct
on opening on both desktop and phone, and only wrong between photos — so
the `dvh` lines came back out rather than stay as an untested change
attached to a misdiagnosis.


## §AE — The burger opened behind the focus, and the pill's real containing block

Two things found in the pre-publish audit, both about the nav bar.

**The burger sat after the menu it opens.** `.nav-inner`'s children were
`.brand`, `<nav class="nav-links">`, `<button class="menu-toggle">`, in that
order. Below 67.5em the button is the only way to reveal the dropdown, and it
came after the dropdown in the DOM — so opening the menu from the keyboard and
pressing Tab walked straight past it into the page:

| | Tab after opening |
|---|---|
| before | comparsa, (\*), (hero photo), prodigio, … |
| after | Un ricordo, Logos 27, Un discorso di…, Curriculum, Foto, EN, … |

The menu was reachable only by Shift+Tab, in reverse order. WCAG 2.4.3.

The fix is to put the button before the nav in the markup, and it costs
nothing visually, which was checked rather than assumed: below 67.5em
`.nav-links` is `position: absolute` and so is out of the flex flow entirely,
and above it `.menu-toggle` is `display: none`. Geometry compared before and
after on three pages × ten widths (320, 360, 390, 560, 700, 800, 1080, 1081,
1200, 1440), open and closed, measuring x/y/width/height/display/visibility of
`.site-nav`, `.nav-inner`, `.brand`, `.nav-links`, `.menu-toggle`,
`.lang-link-desktop`, the first and last link, `body`'s padding-top and
`scrollHeight`: **0 differences in 51 comparisons.** Tab order with the menu
closed, tab order on desktop, and Escape-closes-and-returns-focus are all
unchanged. axe reports no violations on any of the 14 pages after the move.

**The open dropdown covered whatever came next.** Present before the swap too,
and not fixed by it — the swap only moves it from the first Tab to the
seventh. With the menu open at 390px, the first focusable outside it is the
`.fonte` link in the Home masthead at y=214, and the dropdown is painted over
it: `elementFromPoint` at the link's own centre returns the element on top,
not the link. WCAG 2.2 SC 2.4.11 (Focus Not Obscured).

The page already closes the menu on an outside *click*; it now does the same
on focus leaving the bar, which is the keyboard's version of the same gesture
(`focusout` on `.site-nav`, ignoring moves whose `relatedTarget` is still
inside it — brand → burger → menu items is not leaving). Verified: the six
menu items keep the menu open and are all hit-testable; the seventh Tab closes
it and the link underneath becomes hit-testable again. Clicking a menu link
still navigates, and the burger still toggles on click.

**And the language pill is not where §71 said it was.** See §71: the comment
claimed the pill lived outside the nav's DOM subtree to avoid the bar becoming
its containing block. It does not live outside it, the bar *is* its containing
block, and `§72`'s `left: calc()` is correct only because of that. Comment and
entry realigned to the measurement; no CSS values changed.


## §AF — Patent list: priority year instead of grant year

The list used to print the grant year of the linked document. That year is an
administrative fact about one patent office, not about the invention: for a
family extended across several countries it lags the first grant elsewhere by
years. IT 1,060,649 is the clear case — granted in Italy on 20 August 1982,
Italian filing 20 May 1976, and its own front page declares "PRIORITA:
Svizzera dom. brev. n. 6645 del 23 maggio 1975". Three dates, three different
events. Sorting a chronological list on the last of the three sorts it by
patent-office backlog.

The list now prints the **priority year** — the first filing of the family,
the Paris Convention date every later member of the family claims back to. It
is the only date that is comparable across jurisdictions and the only one that
answers "when did he do this".

Only the year is shown, as before; month and day are used as the sort key so
that entries sharing a year fall in the right order. The four groupings
(solo / with Capellaro / with other co-inventors / after Olivetti) are
categorical, not chronological, so sorting happens **within** each group, not
across the whole list. Ties — 3,423,018 and 3,451,616 both claim 10 April
1965 — keep their previous relative order (stable sort).

Two consequences to keep in mind:

1. **The card's date range moved from 1958 to 1955.** Grant years put the
   earliest entry in 1958; priority dates open the range three years
   earlier, because US 3,005,585 claims priority from 6 October 1955
   (CH340647) — the first item of the Capellaro group. Both the Italian
   ("depositati dal 1955 al 1995") and the English ("filed 1955 to 1995")
   now match the list below them. "Depositati" / "filed" stays accurate: a
   priority date *is* the first filing date of the family. Range re-derived
   from the rendered DOM, not from the source table — min 1955, max 1995 on
   both pages.
2. **JSON-LD `datePublished` still carries the grant year** and was
   deliberately not touched: `datePublished` means publication, so 1982 is
   correct there for IT 1,060,649 even though the page now shows 1975.
   schema.org has no priority-date property for CreativeWork, so aligning the
   two would have meant putting a wrong value in a correctly-named field. The
   consequence is that the "0 year mismatches HTML ↔ JSON-LD" check from the
   pre-publish audit no longer holds by design.

The source table came from V and was applied mechanically: 41 numbers matched
one-to-one against the list (set equality checked both ways), every printed
year re-read from the DOM and compared against the table, and every block
re-checked as non-decreasing after the sort. IT and EN produce identical
ordering.


## §AG — The two French entries replaced by their German family members

The "Dopo l'Olivetti" group used to link the two French documents of these
families. They now link the German ones:

| was | is now | family cross-reference kept |
|---|---|---|
| FR 2.039.399 | DE 7014884 | (FR2039399) |
| FR 2.055.456 | DE 2036218 | (FR2055456) |

Both German documents declare the Italian priority on their own front page,
and both match the table already used in §AF: DE 7014884 reads "Pr 23.04.69
IT Italien 51530A-69", DE 2036218 reads "Unionspriorität — Datum 22. Juli
1969, Land Italien, Aktenzeichen 52736 A-69". So the priority years and the
sort order are unchanged by the swap; only the linked artefact changed.

**Why: the language rule, and nothing else.** The site links its maintenance
documents in German too, so German wins over French for consistency. That is
the whole reason, and it is worth writing down plainly because the swap is
NOT an improvement on the other axes — on one of the two rows it is a step
back. What each of the four documents actually is:

| document | what it is | names Teresio? |
|---|---|---|
| FR 2.039.399 (out) | *Demande de brevet — 1re publication*: the application | yes, "Déposant : GASSINO Teresio" |
| DE 7014884 (in) | *Eintragungsverfügung*: a registered utility model | yes, "Anm: Gassino, Teresio, Ivrea, Turin" |
| FR 2.055.456 (out) | *Brevet d'invention*, "décision de délivrance 13 avril 1971": **a granted patent** | yes, "PEDRINI Brunetto et GASSINO Teresio" |
| DE 2036218 (in) | *Offenlegungsschrift*: the published application, no grant | yes, as second applicant |

So: on the first row the swap traded an application for a registered right —
a small gain. On the second it traded a granted patent for a published
application — a real loss, accepted knowingly for the sake of one rule
instead of two competing ones.

An earlier draft of this entry claimed the swap fixed the audit's
"some PDFs never name Teresio" problem. **That was wrong** and is recorded
here so nobody repeats it: all four documents name him, the two French ones
arguably more directly (as *Déposant*) than DE 7014884 does (as *Anm.*).
Whoever revisits this should not use the name as an argument either way.

The German titles are kept in German, with an Italian translation on the
Italian page and an English one on the English page, in typographic double
quotes inside the brackets. For DE 2036218 the translation shares the
brackets with the co-inventor, as requested: ("…", con B. Pedrini).

Housekeeping notes:

- `FR2039399A1.pdf` and `FR2055456A5.pdf` are still in /brevetti/ but no
  longer linked from anywhere. Kept for now — the cross-references in the
  list still cite those numbers.
- The JSON-LD `hasPart` entries were realigned to the German documents, and
  named by what each one actually is rather than flattened to "Patent":

  | node name | datePublished | source of the date |
  |---|---|---|
  | DE Gebrauchsmuster 7,014,884 — Tafel mit Reihen… | 1970 | Bekanntmachungstag, from the `30.7.70` roll stamp |
  | DE Offenlegungsschrift 2,036,218 — Kodezeichenlesesystem | 1971 | Offenlegungstag, `4. Februar 1971` |

  The two dates are not the same legal event — the first is the announcement
  of a registered utility model, the second the laying-open of a pending
  application — and neither is a grant. `datePublished` is still the right
  schema.org property for both, because both *are* publication events; what
  it is not, in either row, is a grant year. Note the asymmetry: DE 7014884
  never had an Offenlegungstag (a Gebrauchsmuster is registered, not
  examined and laid open), and DE 2036218 shows no Bekanntmachung because
  the document is the application, not a grant.
- DE 2036218 carries the same qualifier as IT 1280321: "pdf della domanda di
  concessione" / "pdf of the grant application". The document is headed
  *Offenlegungsschrift*, its second page opens *Eingereichte Fassung —
  Patentanmeldung*, and it records `Anmeldetag 21. Juli 1970` /
  `Offenlegungstag 4. Februar 1971` with no grant field: it reproduces the
  application as filed. DE 7014884 deliberately does NOT get the qualifier —
  it is an *Eintragungsverfügung* with a roll number and Bekanntmachungstag
  (`7014884 30.7.70`), i.e. a registered right, not a pending application.
  Note that the qualifier does not mean the same thing on the two rows that
  carry it: IT 1280321 *is* a granted patent (1.280.321 is an Italian grant
  number) whose linked pdf happens to be the application; DE 2036218 has no
  grant behind it at all, 2036218 being the publication number of the
  application itself. Same wording, two different situations.
- **And the two numbers are not the same kind of thing either.** Noticed by V,
  and sharper than it first looks once you open the two PDFs:

  | row | number shown | is it printed on the linked pdf? |
  |---|---|---|
  | IT 1280321 | grant number | **no** — the pdf shows only `DOMANDA NUMERO 101995900424946`, deposito 03/03/1995, pubblicazione 03/09/1996 |
  | DE 2036218 | publication number of the application | **yes** — "Offenlegungsschrift 2036218", from `Aktenzeichen P 20 36 218.9` |

  A reader who clicks the Italian row cannot find the number they clicked
  from. This is structural, not sloppiness: Germany runs ONE number series per
  case, so there is nothing to choose. Verified against the DPMA rather than
  assumed — an earlier draft of this entry asserted it from memory, and got
  the kind code wrong on top:

  - *DPMAinformativ* Nr. 5: for the number series opened in 1968 (the one
    2036218 belongs to) the Aktenzeichen and the publication number are
    identical apart from the "P" prefix and the check digit, with a document
    kind code appended. Matches this document exactly: `Aktenzeichen
    P 20 36 218.9` → publication number `2036218`.
  - *DPMAinformativ* Nr. 3 shows it happening: `DE 27 03 353 A1`
    (Offenlegungsschrift) and `DE 27 03 353 B2` ("Auslegeschrift,
    Zweitveröffentlichung nach Offenlegungsschrift") — one number, two
    successive publications of one case.
  - Correction to that earlier draft: for a 1970 filing the granted document
    would have been an **Auslegeschrift (B1/B2)**, not a `C2`. The C codes
    come later. The number is the same either way, which is the point that
    matters here.

  So `2036218` is not a throwaway application number: a grant, had there been
  one, would carry it. That is why the qualifier stays "pdf della domanda di
  concessione" — it describes the *document*, while the number is already the
  one that would survive a grant.

  Italy runs TWO unrelated series, so a choice must be made there, and the
  grant number was chosen because it is the one the patent is citable and
  searchable by. The
  German row is consistent by necessity; the Italian one is inconsistent by
  choice, and the price is the broken visual link between number and document.
  Option left on the table if it ever bothers anyone: add the application
  number to the Italian row the way other cross-references are given —
  `… Testina magnetica e dispositivo che la contiene (AR95A007)`.
- The same row now names its applicant: **per / for Proget di Gassino Massimo
  & C. S.N.C.** The list has two words with fixed technical meanings, honoured
  in all sixteen occurrences before this one and in both languages: *con* /
  *with* introduces a co-inventor, always a person (con G. Lanza, con N.
  Giolitti…); *per* / *for* introduces the applicant, always a legal person
  (per Jacqueline S.p.A., per Tesalon Anstalt, per Ages S.p.A.). Proget is the
  applicant, so *per*. *con* would have been the only entry in the list
  putting a company in the co-inventor slot — not just inconsistent but
  untrue. Note that *per* asserts nothing about the nature of the
  relationship: Tesalon and Ages were outside commissioners, Proget was the
  son's firm used as the legal vehicle for the filing, and the list does not
  and should not try to distinguish the two. If that distinction is ever worth
  making, it belongs in prose, not here.
- These are the first two glosses ever to appear on the *Italian* page: the
  original-title-plus-gloss-in-quotes pattern was until now an English-page
  device only (Centro Formazione Meccanici, Cavaliere, the three Olivetti
  office names). Correct here — they are the only two rows in a third
  language — but it is a precedent: a French document coming back in would
  need one too.
- The German titles are wrapped in `<span lang="de">` on both pages, so a
  screen reader switches voice for them. The French titles they replaced had
  no such marking; this is a small improvement, not a restoration.
- The office label is lowercase ("ufficio brevetti tedesco") to match the
  five Italian and the previous two French rows, and the year keeps the
  comma after it as every other one of the 41 rows does.
