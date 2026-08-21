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
verbatim, only re-flowed as prose. Three entries at the end (§A, §B, §C)
are new, and cover changes made after the split.

**Adding a rule that needs more than a line of explanation:** put the
line in the stylesheet, the reasoning here, and number it after the last
entry. Renumbering an existing one means editing the stylesheet too, so
don't — retire an entry by marking it obsolete rather than removing it.

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

> Site nav: fixed bar, hides on scroll down and returns on scroll up. Floats at max-width 950px — wider than main and footer's shared 760px, on purpose.

Site nav: fixed bar, hides on scroll down, reappears on scroll up. Floats
narrower than full width (max-width 950px — measured to comfortably fit brand
+ 5 links on one line with real margin, while still reading as a floating
panel like the footer). Flush with the top edge, so only the bottom corners
round — mirrors the footer, which is flush with the bottom edge and rounds
only its top corners. 950px doesn't match main/footer's 760px on purpose, not
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

> Language switcher: a floating pill on desktop, the last item of the burger dropdown below the breakpoint. It lives outside the nav's DOM subtree because the bar's own backdrop-filter would otherwise become its containing block.

Language switcher: two separate elements, not one reused via media queries. On
desktop, .lang-link-desktop floats outside the nav bar entirely as a small
pill — deliberately no flag colour, just dark background + "IT"/"EN" text, so
it doesn't add a saturated note to an otherwise neutral bar. Below the
breakpoint, .lang-link (flag icon + short label) takes over instead, as the
last item in the mobile burger dropdown — see the media query below. Living
outside the nav bar's DOM subtree on purpose: the pill uses position:fixed and
needs to size itself against the true viewport, but .site-nav's own backdrop-
filter makes it the containing block for any position:fixed descendant, so
nesting the pill inside would size it relative to the bar instead. Same
translucent background and blur as the bar, so it reads as part of the same
family of chrome, and hides together with it on scroll via the shared .nav-
hidden class. Position is now derived from the bar's own geometry rather than
tuned by eye — see §C below.

## §72 — `.lang-link-desktop`

> Left edge derived from the bar's own right edge plus a 12px gap, rather than tuned by eye.

Left edge = the bar's own right edge + a 12px gap. .site-nav is max-
width:950px, margin auto, so its right edge is exactly 50% + min(475px, 50vw)
at any viewport width; the min() keeps the expression honest below 950px even
though the pill is hidden there. No translateX any more, because this is a
left edge and not a centre point.

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

**If it is still wrong on some device**, the discriminator is what you see in
the first moment after pressing Back. If the correct position appears and then
the page slides or jumps to the top, something is still animating or cancelling
the restore. If the correct position never appears at all, restoration isn't
being attempted, and the next suspects are content height changing after the
restore — `font-display: swap` reflowing a long essay when the webfont lands, or
an image without `width`/`height` (none currently) — rather than anything about
`scrollRestoration`.

Restoring `target="_blank"` on internal links for touch devices only was
considered as a fallback and is worse on its own terms: it needs JavaScript to
rewrite `target` from a `matchMedia` query, and it hands mobile readers — the
ones least able to manage a tab stack — a pile of tabs of the same site.
