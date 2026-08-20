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
├── quercia.html                    ← hidden page, NOT in nav, linked from home.html text only (also the one page with no .page-subtitle — see "Deliberate choices" below)
├── en/                              ← English counterpart of every page above, same filenames (see "English version" below)
├── css/style.css
├── js/animations.js
├── fonts/                          ← self-hosted Merriweather/Merriweather Sans .woff2 files (see "Font" below)
├── pdf/                            ← source PDFs linked from Discorso, Curriculum and Logos 27 (patents, scanned documents)
├── sfondi/                         ← decorative/UI SVGs and favicons (flags, ornamental dividers, spinner, favicon)
├── robots.txt
├── sitemap.xml
└── images/
    ├── discorso/                   ← thumbnails for the clump animation
    ├── galleria/                   ← Foto gallery images
    └── quercia/                    ← images for the hidden Quercia page
```

Each Italian page has an English counterpart at the same filename under `/en/` (see "English version" below).

## Font
Merriweather (serif) and Merriweather Sans are self-hosted in `fonts/` (`.woff2`, SIL Open Font License — see `fonts/OFL-merriweather.txt`), loaded via `@font-face` in `css/style.css`. No Google Fonts request is ever made — nothing to load from a third-party server, no IP shared with Google. The files were sourced from the Fontsource npm packages (`@fontsource/merriweather`, `@fontsource/merriweather-sans`), which redistribute Google Fonts for exactly this purpose.

Weights included: Merriweather 300/400/700/900 + 400 italic, Merriweather Sans 300/400/700/800 + 400 italic. Every one of these is actually used somewhere on the site *except* Merriweather 300 (serif light) — it's declared in `@font-face` but no current rule applies that weight in the serif family; harmless to leave (browsers only fetch a declared font if some rule actually requests it) but just as fine to drop if you'd rather trim the `fonts/` folder further. Merriweather Sans 500 was dropped for the same reason — it was never referenced by anything. Merriweather Sans 800 was added later: the five sans page titles (Index, Logos 27, Discorso, Curriculum, Foto) were declaring `font-weight: 900`, but the family has no 900 cut at all — it tops out at 800 — so the browser was silently falling back to 700 the whole time. The titles now declare (and load) the real 800 face instead.

## 1. Images
All content photos are served as WebP, sized close to their actual display context (roughly 2× the CSS display width, for retina screens) rather than at whatever resolution the source scan or camera happened to produce — a card thumbnail shown at 180px isn't served a 2000px-wide file. Two of the Curriculum scans, the CFM diploma and the Cavaliere honour diploma, are each served twice: once as an on-page WebP thumbnail (800px wide), and once as a larger WebP (`-full` suffix, up to 1600px on the long edge) opened via the document viewer rather than a separate image link. `curriculum-fronte.webp` is linked only once, at 1200px, with no larger version. `images/creative.png` (the footer's Creative Commons badge) and every SVG in `sfondi/` are untouched — already small enough that neither conversion nor resizing would meaningfully help.

Six images do double duty as `og:image`/`twitter:image` social-preview sources as well as on-page thumbnails (`card-tecnigrafo`, `logos-pintori`, `curriculum-fronte`, `discorso/capellaro`, `teresio-tecnigrafo`, `galleria/foto-01`) — each is sized to at least 1200px on the long edge, above the usual social-platform minimum, even where the on-page thumbnail itself would need less. Quercia's own `og:image` (`quercia/quercia-1-clump.webp`) is the exception: it's served at its on-page clump-thumbnail size (630×415), below that same minimum, since that page has no larger on-page version of the photo to reuse.

No image on the site uses `loading="lazy"`, deliberately. Every image already fades/slides in via its own IntersectionObserver-driven reveal (see "Per-image reveal" below); native lazy-loading would add a second, independent trigger for when the image actually loads, which can visibly desync from that reveal — the animation starting before the image's bytes have arrived, or firing while the browser is still fetching. The reveal already defers the *visual* appearance until the image is in view; stacking lazy-load on top doesn't gain much and risks a stutter.

## 2. Layout notes

- **Header**: a fixed, translucent gray nav bar (`rgba(220,220,220,0.68)`, same opacity as the footer, with a blur), content constrained to a centered `.nav-inner` (max-width 900px) so the brand and links don't stick to the viewport edges on wide screens. "Teresio Gassino" links to the landing page. It hides on scroll down and reappears on scroll up. **On mobile** (under 1080px), the links collapse into a burger menu on the right; tapping it animates open and the burger morphs into an X — tap again (or tap a link, or tap outside) to close. The bar stays visible while the dropdown is open.
- **Typography**: Merriweather (serif) for body text; Merriweather Sans for the nav, the footer, and every small "Fonte: ..." citation line (class `.fonte`) — gives those UI/metadata bits their own visual register instead of sharing the reading typeface. The five section-index pages (Index, Logos 27, Discorso, Curriculum, Foto) use a sans-serif `<h1>` instead, echoing the nav bar's own typeface; Home and Quercia keep the serif title. Each of those five titles is followed by a `.page-subtitle` in the *opposite* register (serif italic), for contrast against the sans title above it.
- **Footer**: fixed gray bar, all text black, Creative Commons logo first followed by the credit line.
- **Side-by-side image + description** (Logos 27, Curriculum): any `<figure class="reveal-img side">` shows the image and its `<figcaption>` next to each other (stacks on mobile). Add `from-right` to flip which side the image is on, and `align-top` to align the text to the top of the image instead of centering it vertically. `crop-top` (crop the image from the top instead of the center) is a plain `.reveal-img` modifier, not exclusive to this side-by-side pairing — it's also used on its own in the Foto grid.
- **Image badges** (Logos 27, Curriculum): every linked image gets a small pill badge in the bottom corner (PDF / Link / Enlarge) via `.img-badge`, plus a subtle darkening overlay on hover, so it's clear upfront that the image is clickable and what it opens.
- **Clump animation** (Un discorso di Capellaro, Quercia): the thumbnails in `.clump-stage` slide in together from different sides and land clustered, on page load — pure CSS. Discorso uses six photos at 370×240px each with all the page's text sitting below in a single dark translucent `.ritagli-band`; Quercia reuses the same mechanism for just two photos at 630×415px, above its own (shorter) `.ritagli-band` intro paragraph. On mobile, the clump switches to a plain vertical stack at readable size instead of the clustered layout.
- **Document viewer** (Discorso's two Banchelli photos, Curriculum's diploma/onorificenza photos, both Quercia photos): a second native `<dialog>` (`.doc-viewer-overlay`, distinct from the Foto lightbox below), opened via any `.doc-viewer-trigger` — enlarges the image and, where a transcript exists, shows a "Versione testuale" pill button (`.doc-viewer-toggle`) that swaps the image for the transcribed text, cloned in from a `<template>` on open (`initDocViewer()` in `js/animations.js`). Quercia replaced its earlier fixed-height scroll-window treatment with this same pattern, for consistency with Discorso.
- **Per-image reveal** (Home, Logos 27, Curriculum, Foto, Quercia): each image fades/slides in individually as it scrolls into view, via `js/animations.js`'s `IntersectionObserver`. Every content image also carries `width`/`height` attributes matching its real file dimensions, so the browser can reserve the right space before the file loads (avoids layout shift) — paired everywhere with an explicit `height: auto` in CSS, since the two together are what actually let the browser compute a *proportional* height instead of using the attributes' raw pixel values verbatim.
- **Foto grid hover**: once a thumbnail's entrance reveal finishes, `initGalleryReveal()` adds `.settled`, handing control from the entrance `animation` to a plain `transition` — from there, hovering (`hover: hover` and `pointer: fine` devices only) scales the image to 1.5× within its own card (`overflow: hidden` on `.reveal-img` crops it to the card's bounds) and fades in a caption gradient (`.gallery-caption`) with the photo's `data-caption` text. The settled rule needs two selectors, not one — see the comment directly above `.gallery-grid .reveal-img.settled img` in `css/style.css` for why `from-right` photos need their own copy to actually win the specificity tie against their own entrance rule.
- **Lightbox**: a native `<dialog>` (see "Accessibility & SEO" below), opened via any `.lightbox-trigger` button — each one wraps an `<img>` and carries a `data-caption` for the text shown under the enlarged photo. Used on the Foto grid and the two standalone photos on Home.

## 3. Accessibility & SEO
- Every page has a self-referencing `<link rel="canonical">` alongside its existing `hreflang` alternates — the two homepages (`index.html` and `en/index.html`) canonicalize to their clean root URLs (`https://teresioweb.github.io/`, `.../en/`) rather than the `/index.html` form, since both resolve to the same page on GitHub Pages and only one should be the one search engines index.
- The lightbox and the document viewer are both real `<dialog>` elements opened with `.showModal()`, not styled `<div>`s — focus trapping, Escape-to-close, and top-layer stacking all come from the browser rather than hand-rolled JS. A small supplementary Tab handler patches one Chromium quirk on each (focus briefly passing through `document.body` at the wrap points instead of cycling directly between controls); everything else about the trap is native. Lightbox and document-viewer triggers are real `<button>`/`<a>` elements, so focus and Enter/Space activation are native too.
- **Colour-coded ritagli, made screen-reader-accessible.** The six photographed excerpts on "Un discorso di Capellaro" each carry a `.visually-hidden` transcription (clip technique, not `display:none` — stays in the accessibility tree) inside their link, so screen-reader users get the same text a sighted user gets from the scanned image. Since the colour-coding that ties each photo to its source paragraph below (see "Deliberate choices") is otherwise a purely visual cue, each hidden transcription opens by naming its own colour and which numbered paragraph ("first", "second"...) it points to, rather than assuming the reader can see the link.
- Decorative elements (the burger icon's bars, empty `alt=""` on purely ornamental images) are excluded from the accessibility tree.
- `robots.txt` points to `sitemap.xml`, which lists all 14 pages (7 Italian + 7 English) with their `hreflang` relationships.

## 4. English version (`/en/`)
The site is bilingual: every Italian page has an English counterpart at the same filename under `/en/` — `curriculum.html` ↔ `en/curriculum.html`, and so on (same rule for all 7 pages, including the hidden `quercia.html`).

- **Shared assets, one copy.** The English pages don't duplicate CSS, JS, fonts, or images — they reference the exact same files as the Italian ones do, via **absolute paths from the domain root** (`/css/style.css`, `/js/animations.js`, `/images/...`, `/sfondi/...`, `/pdf/...`). This is why they work correctly one directory level deep without needing `../`. The Italian pages use relative paths (`css/style.css` etc.) instead.
- **`hreflang` tags.** Every page's `<head>` (both languages) has `<link rel="alternate" hreflang="...">` tags pointing to its counterpart, so search engines treat the two as translations of the same page rather than duplicate content.
- **Language switcher**: a small pill floats near the top-right of the viewport on desktop (`.lang-link-desktop`, position: fixed, deliberately outside `.nav-inner` so it never competes for space in the nav bar). Below the 1080px breakpoint, it hides and the same link appears instead as the last item in the burger dropdown (`.lang-link`), flag icon plus label. Both are plain links to the sibling page in the other language — no JavaScript involved, no state to keep in sync.
- **Two flag icons** live in `sfondi/`: `flag-it.svg` and `flag-gb.svg`, small hand-drawn SVGs (not emoji, for consistent rendering across every OS/browser).
- **Extra footnote in the English essay.** `en/home.html` includes an additional footnote, (**), giving international readers background on Natale Capellaro that Italian readers are assumed to already have — it doesn't exist in the Italian version, by design.
- **Translation approach for proper names and titles**: book, article, and chapter titles are kept in their original language (they're real citations, not paraphrased) with an English gloss added in quotes — e.g. *Il sogno di un'impresa* ("The dream of an enterprise"). This applies throughout Logos 27, Curriculum, and "A speech by Capellaro".

## 5. Deliberate choices
A few things that look like inconsistencies or omissions on a quick pass, kept as-is on purpose:

- **Colour as meaning, only where it already has a referent.** The highlighted quotes on "Un discorso di Capellaro" link in colour to the specific excerpt they're citing — that's colour carrying real meaning. Extending the same colour-coding logic site-wide (tying section or page colours to some recurring meaning across the whole site) was considered and dropped: without a concrete referent behind it, the same device reads as a gimmick, and it would force meaning onto colour choices that are just visual rhythm everywhere else on the site.
- **No `.page-subtitle` on Quercia**, unlike the other five section pages. It's a one-paragraph easter-egg page; matching Home's sans-serif subtitle treatment here would be more formatting than the content can carry.

## 6. Push to GitHub
```bash
cd site
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

## 7. Turn on GitHub Pages
Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)` → Save. Since the repo is named `teresioweb.github.io` (a user/organization site), it deploys straight to `https://teresioweb.github.io/` — no repo name in the path. Live within a minute or two.
