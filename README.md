# Teresio Gassino — GitHub Pages Site

A static tribute site with real content, bilingual Italian/English text set in Merriweather, and scroll/load-triggered image animations. No build tools required.

## Structure
```
site/
├── index.html                      ← landing page
├── home.html                       ← full essay
├── logos.html
├── discorso.html
├── curriculum.html
├── galleria.html                   ← Foto
├── quercia.html                    ← hidden page, NOT in nav, linked from home.html text only
├── en/                             ← English counterpart of every page above, same filenames
├── css/style.css
├── js/animations.js
├── DECISIONS.md                    ← long-form reasoning behind the CSS
├── fonts/                          ← self-hosted Merriweather/Merriweather Sans .woff2 + subset.sh
├── pdf/                            ← source PDFs linked from Discorso, Curriculum and Logos 27
├── sfondi/                         ← decorative/UI SVGs and favicons
├── robots.txt
├── sitemap.xml
└── images/
    ├── discorso/                   ← thumbnails for the clump animation
    ├── galleria/                   ← Foto gallery images
    └── quercia/                    ← images for the hidden Quercia page
```

## Where things are written down
- **`css/style.css`** — one short comment per rule, saying what that rule does.
- **`DECISIONS.md`** — the reasoning, measurements and history behind those rules. The stylesheet points at it by number: `→ DECISIONS.md §37`.
- **`js/animations.js`** — comments stay inline, next to the control flow they describe.

Adding a rule that needs more than a line of explanation: line in the stylesheet, reasoning in `DECISIONS.md`, numbered after the last entry. Don't renumber existing entries — every number is referenced from the stylesheet. Retire one by marking it obsolete; don't delete it.

## Font
Merriweather (serif) and Merriweather Sans, self-hosted in `fonts/` as `.woff2` (SIL Open Font License, see `fonts/OFL-merriweather.txt`), loaded via `@font-face` in `css/style.css`. No Google Fonts request is ever made. Files come from the Fontsource npm packages (`@fontsource/merriweather`, `@fontsource/merriweather-sans`).

Weights present: Merriweather 300/400/700/900 + 400 italic, Merriweather Sans 300/400/700/800 + 400 italic. Merriweather 300 (serif light) is declared but unused; Sans 300 is used, by `.essay-subtitle`. Merriweather Sans has no 900 cut — the five sans page titles use 800.

Four faces load on a typical page: 139 KB total. All ten files are subset by **`fonts/subset.sh`**; re-run it against the Fontsource originals whenever those are replaced. The range covers Latin-1, Latin Extended-A, Greek, typographic punctuation, arrows and common maths symbols. Two characters used on the site fall back to a system font because neither Merriweather contains them: ↗ (U+2197) and ⤢ (U+2922).

## 1. Images
All content photos are WebP, sized at roughly 2× their CSS display width. Two Curriculum scans (the CFM diploma and the Cavaliere honour) exist twice: an on-page thumbnail at 800px and a `-full` version up to 1600px on the long edge, opened in the document viewer. `curriculum-fronte.webp` exists only at 1200px. `images/creative.png` and every SVG in `sfondi/` are untouched.

Six images double as `og:image`/`twitter:image` sources as well as on-page thumbnails — `card-tecnigrafo`, `logos-pintori`, `curriculum-fronte`, `discorso/capellaro`, `teresio-tecnigrafo`, `galleria/foto-01` — each at least 1200px on the long edge. Quercia's `og:image` (`quercia/quercia-1-clump.webp`) is 630×415.

Every content image carries `width`/`height` attributes matching its real file dimensions, paired with `height: auto` in CSS.

No image uses `loading="lazy"`.

## 2. Layout notes

- **Header**: fixed, translucent gray nav bar (`rgba(220,220,220,0.68)` with a blur), content constrained to a centred `.nav-inner` (max-width 900px). "Teresio Gassino" links to the landing page. The bar hides on scroll down and reappears on scroll up. Below `67.5em` (1080px at a 16px default font) the links collapse into a burger menu on the right; tapping it animates open and the burger morphs into an X — tap again, tap a link, or tap outside to close. The bar stays visible while the dropdown is open, and the closed dropdown is `visibility: hidden` so it stays out of the tab order. Hovering a nav link shows an underline; only `.active` is bold.
- **Type scale**: every `font-size` is in `rem`, against `html { font-size: 100% }` — the reader's own browser setting. Padding, radii, borders and layout breakpoints stay in px. `body`'s `padding-top`, `main`'s `padding-bottom`, `.brand-signature`'s height and the nav breakpoint all scale with the type. No `clamp()` yet. (`DECISIONS.md` §B)
- **Typefaces**: Merriweather (serif) for body text; Merriweather Sans for the nav, the footer, and every `.fonte` citation line. The five section-index pages (Index, Logos 27, Discorso, Curriculum, Foto) take a sans `<h1>`; Home and Quercia keep the serif title. Each of those five titles is followed by a `.page-subtitle` in serif italic.
- **Footer**: fixed gray bar, black text, Creative Commons logo then the credit line. On a landscape phone it is not fixed — it scrolls away with the page, full-bleed and square-cornered, and `main`'s bottom padding drops accordingly. (`DECISIONS.md` §D)
- **Translucent chrome**: the nav, the footer, the language pill, the burger dropdown and `.ritagli-band` are translucent over the page and use `backdrop-filter`, declared both prefixed and unprefixed. An `@supports not (...)` block gives browsers without it an opaque equivalent; `.ritagli-band`'s fallback is a solid `#4C4C4C`. (`DECISIONS.md` §E)
- **Side-by-side image + description** (Logos 27, Curriculum): `<figure class="reveal-img side">` puts the image and its `<figcaption>` next to each other, stacking on mobile. Modifiers: `from-right` flips the image to the other side, `align-top` aligns the text to the top of the image. `crop-top` (crop from the top instead of the centre) is a plain `.reveal-img` modifier and is also used on its own in the Foto grid.
- **Image badges** (Logos 27, Curriculum): every linked image carries a 12px pill badge in the bottom corner — PDF / Link / Enlarge, via `.img-badge` — plus a darkening overlay on hover and on `:focus-within`.
- **Clump animation** (Discorso, Quercia): the thumbnails in `.clump-stage` slide in and land clustered on page load, in pure CSS. Discorso uses six photos at 370×240px entering from different sides, with all the page's text below in one dark translucent `.ritagli-band`. Quercia reuses the mechanism for two photos at 630×415px above its own shorter `.ritagli-band`; both enter from the right, staggered by their inline `animation-duration`/`--delay`. Below 800px the clump becomes a plain vertical stack. (`DECISIONS.md` §36, §40)
- **Document viewer** (Discorso's two Banchelli photos, Curriculum's diploma and onorificenza, both Quercia photos): a native `<dialog>` (`.doc-viewer-overlay`) opened by any `.doc-viewer-trigger`. It enlarges the image and, where a transcript exists, shows a "Versione testuale" pill (`.doc-viewer-toggle`) that swaps the image for text cloned from a `<template>`. While the scan loads the image sits at `opacity: 0` behind a spinner; both `onload` and `onerror` clear it, so a file that never arrives shows the broken-image placeholder and its `alt`. The transcript button still works in that case.
- **Per-image reveal** (Home, Logos 27, Curriculum, Foto, Quercia): each image fades or slides in as it scrolls into view, via `observeReveal(selector)` in `js/animations.js` — one `IntersectionObserver` helper called twice, for `.reveal-img` (slide in from a side) and `.essay-anim` (rise and fade, Home only). The two classes are separate: `.essay-anim` is applied per element and skips the title, epigraph and closing source note.
- **Foto grid hover**: once a thumbnail's entrance reveal finishes, `initGalleryReveal()` adds `.settled` and control passes from the entrance `animation` to a `transition`. On `hover: hover` + `pointer: fine` devices, hovering scales the image to 1.5× inside its card and fades in a caption gradient (`.gallery-caption`) carrying the photo's `data-caption`. The caption also shows on `:focus-within`, and under `@media (hover: none)` it is always on.
- **Lightbox**: a native `<dialog>` opened by any `.lightbox-trigger` button, each wrapping an `<img>` and carrying a `data-caption` shown under the enlarged photo. Used on the Foto grid and the two standalone photos on Home.

## 3. When something breaks
- **If `js/animations.js` fails, the content still shows.** The reveal animations start at `opacity: 0`, gated behind a `.js` class the inline `<head>` script adds. `animations.js` sets `window.__animsReady = true` as the **last** statement of its `DOMContentLoaded` handler; the inline script checks that flag on `load` and swaps `.js` back to `.no-js` if it is missing. Degraded outcome: no animations, everything on screen. **If you add an `init*()` call, add it above that flag.**
- **If a document scan fails to load**, the viewer stops pretending to load it — see "Document viewer".
- **Back navigation restores your reading position.** `history.scrollRestoration` is left at `auto`, and `scroll-behavior: smooth` is held off `html` until one frame after `load` — while it is in force, a browser restores scroll as an animated scroll, which mobile engines cancel partway. In-page anchor jumps are still smooth. (`DECISIONS.md` §G)

## 4. Accessibility & SEO
- Every page has a self-referencing `<link rel="canonical">` alongside its `hreflang` alternates. The two homepages canonicalize to `https://teresioweb.github.io/` and `.../en/`, not the `/index.html` form.
- The lightbox and the document viewer are real `<dialog>` elements opened with `.showModal()` — focus trapping, Escape-to-close and top-layer stacking are native. A small Tab handler patches one Chromium quirk on each. Their triggers are real `<button>`/`<a>` elements.
- **Colour-coded ritagli.** The six photographed excerpts on Discorso each carry a `.visually-hidden` transcription (clip technique, so it stays in the accessibility tree). Each opens by naming its own colour and which numbered paragraph it points to, since the colour link between excerpt and source paragraph is otherwise purely visual. **The transcription is a sibling of the `<a>`, not a child of it** — as a child it becomes part of the link's accessible name.
- **Heading structure.** On Logos 27 the opening line of each figcaption is a real `<h2>` with `font: inherit`. Curriculum's bold runs sit mid-sentence, so each of its four figures carries a `<h2 class="visually-hidden">` naming the document instead. Foto has no per-photo headings. (`DECISIONS.md` §A)
- **Real lists.** The four articles on Logos 27 and the seven patents on Curriculum are `<ul class="doc-list">`, with the `>` marker drawn as a `::before`.
- Decorative elements — the burger icon's bars, ornamental images — carry empty `alt=""` and stay out of the accessibility tree.
- The lightbox's enlarged `<img>` has `alt=""`; its `aria-live` caption is what announces the photo.
- **Structured data on all 14 pages, as one connected graph.** Every page carries a JSON-LD `@graph` referencing shared `@id`s: `#teresio` (the `Person`, defined in full on the two landing pages, `sameAs` the Italian Wikipedia article and Wikidata `Q103831208`), `#logos27` (a `Product`, `sameAs` Wikidata `Q17637386`), `#quercia`, and `#website` per language. Section pages are `CollectionPage`/`ImageGallery`/`WebPage` nodes that are `isPartOf` their site node and `about` the person. Italian and English pages share the same `#teresio` id. (`DECISIONS.md` §F)
- `robots.txt` points to `sitemap.xml`, which lists all 14 pages with their `hreflang` relationships.

## 5. English version (`/en/`)
Every Italian page has an English counterpart at the same filename under `/en/` — `curriculum.html` ↔ `en/curriculum.html`, including the hidden `quercia.html`.

- **Shared assets, one copy.** The English pages reference the same CSS, JS, fonts and images as the Italian ones, via **absolute paths from the domain root** (`/css/style.css`, `/images/...`). The Italian pages use relative paths (`css/style.css`).
- **`hreflang` tags** in every page's `<head>`, both languages, pointing to the counterpart.
- **Canonical link targets.** Nothing links to `index.html` in its `/index.html` form: the brand link uses `./` on Italian pages and `/en/` on English ones, and the language switcher uses `/` and `/en/`.
- **Language markup.** Italian titles, institution names and phrases inside the English pages carry `lang="it"` — including the Italian terms left untranslated inside the hidden transcripts. The Italian pages likewise mark their French and German quotations.
- **Language switcher**: a small pill sits just right of the nav bar on desktop (`.lang-link-desktop`, `position: fixed`, outside `.nav-inner`), positioned from the bar's own geometry: `calc(50% + min(475px, 50vw) + 12px)`. Below the nav breakpoint it hides and the same link appears as the last item in the burger dropdown (`.lang-link`), flag icon plus label. Both are plain links to the sibling page — no JavaScript.
- **Two flag icons** in `sfondi/`: `flag-it.svg` and `flag-gb.svg`, small hand-drawn SVGs, not emoji.
- **Extra footnote in the English essay.** `en/home.html` has an additional footnote, (**), giving background on Natale Capellaro. It does not exist in the Italian version.
- **Titles of works** stay in their original language with an English gloss in quotes — *Il sogno di un'impresa* ("The dream of an enterprise") — throughout Logos 27, Curriculum and Discorso.

## 6. Deliberate choices
Things that look like omissions on a quick pass and are not:

- **Colour carries meaning only on Discorso**, where each highlighted quote is tied to the excerpt it cites. It is not a site-wide system.
- **`target="_blank"` is for external sites and for PDFs and full-resolution scans only.** Internal links stay in the same tab.
- **Quercia has no `.page-subtitle`**, unlike the other five section pages.
- **Merriweather 300 is declared and unused.**
- **Foto's grid is not a `<ul>`** and has no per-photo headings.

## 7. Push to GitHub
```bash
cd site
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

## 8. Turn on GitHub Pages
Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)` → Save. The repo is named `teresioweb.github.io` (a user site), so it deploys straight to `https://teresioweb.github.io/` — no repo name in the path. Live within a minute or two.
