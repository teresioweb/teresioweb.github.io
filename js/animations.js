// iOS Safari specifically (confirmed absent on Android Chrome) has a
// documented class of bug where a backdrop-filter layer goes stale —
// doesn't repaint — after something nearby changes render state, like
// a dialog opening/closing. .site-nav is the only backdrop-filter
// element that's always on screen near the top of every page, which
// matches a reported ghost line appearing there after closing either
// dialog. Toggling the filter off and back on forces WebKit to tear
// down and rebuild that specific compositing layer instead of trying
// to reuse the stale one. Called from both dialogs' close handlers.
//
// BOTH forms are written, exactly as the stylesheet declares both. The
// unprefixed `backdrop-filter` only became a real CSSOM property in
// WebKit with Safari 18 — on iOS 16 and 17, which is precisely where
// this bug lives, assigning nav.style.backdropFilter creates an inert
// expando on the JS object and never touches the CSS, so the layer was
// never rebuilt on the only browsers the function was written for.
// Elsewhere (Chromium, Safari 18+) the prefixed line is pure
// redundancy and costs nothing.
function nudgeNavBackdropFilter() {
  const nav = document.querySelector(".site-nav");
  if (!nav) return;
  const prev = nav.style.backdropFilter;
  const prevWebkit = nav.style.webkitBackdropFilter;
  nav.style.backdropFilter = "none";
  nav.style.webkitBackdropFilter = "none";
  void nav.offsetHeight; // forces the browser to apply the change above before the one below
  nav.style.backdropFilter = prev;
  nav.style.webkitBackdropFilter = prevWebkit;
}

// One-shot reveal-on-scroll: adds .visible to each element matching
// `selector` the first time it comes into view, then stops watching
// it. The CSS behind .visible is what actually animates — which
// animation plays is a property of the selector, not of this
// function, so the same three lines drive both reveals on the site
// (see the two call sites at the bottom of this file):
//
//   .reveal-img   slides in from the left, or from the right with
//                 the "from-right" class
//   .essay-anim   rises and fades, on the Home essay
//
// Each call builds its OWN observer over its own element set, which
// is what the two hand-written copies of this did before it was
// parameterised — the duplication was in the plumbing, never in the
// behaviour, and nothing about the two reveals is shared at runtime.
// Worth keeping in mind before "simplifying" the two calls into one
// selector list: the classes stay separate on purpose. .essay-anim
// is applied to specific elements and deliberately skips others on
// that page (title, epigraph, closing source note) that a blanket
// .reveal-img would otherwise catch, and the two animations differ.
//
// threshold 0.2 — fires once a fifth of the element is on screen,
// not at first pixel, so an element doesn't start animating while
// still effectively off the bottom edge.
function observeReveal(selector) {
  const targets = document.querySelectorAll(selector);
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // one-shot: never replays
        }
      });
    },
    { threshold: 0.2 }
  );

  targets.forEach((el) => observer.observe(el));
}

// Gallery photos specifically: once the entrance animation
// (galleryRevealLeft/Right in style.css) finishes, adds .settled so
// CSS can hand off from animation to a plain transition for the
// hover-zoom — same handoff pattern as initClumpPhotos() below, and
// for the same reason: an animation and a transition sharing the
// same property can fight over timing if left on the same class the
// whole time (this is what made the entrance itself speed up to
// match the hover's own pace, before the two were split apart).
function initGalleryReveal() {
  const photos = document.querySelectorAll(".gallery-grid .reveal-img");
  if (!photos.length) return;

  photos.forEach((photo) => {
    photo.addEventListener(
      "animationend",
      () => photo.classList.add("settled"),
      { once: true }
    );
  });
}

// Nav bar: hides when scrolling down, reappears when scrolling up.
// Stays visible while near the top of the page, or while the mobile
// dropdown is open.
function initNavHide() {
  const nav = document.querySelector(".site-nav");
  const langLink = document.querySelector(".lang-link-desktop");
  const menu = document.querySelector(".nav-links");
  if (!nav) return;

  let lastY = window.scrollY;
  const hideAfter = 80; // px scrolled before the nav is allowed to hide

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    const menuOpen = menu && menu.classList.contains("open");
    const hide = !menuOpen && y >= hideAfter && y > lastY;

    nav.classList.toggle("nav-hidden", hide);
    if (langLink) langLink.classList.toggle("nav-hidden", hide); // floats with the nav, hides with it too

    lastY = y;
  }, { passive: true });
}

// Mobile burger: toggles the dropdown, closes on link tap or outside tap.
// The button itself morphs into an X while the dropdown is open.
function initMobileMenu() {
  const btn = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".nav-links");
  if (!btn || !menu) return;

  const setOpen = (open) => {
    menu.classList.toggle("open", open);
    btn.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    // Labels come from data-label-open/data-label-close on the button itself
    // (set per-language in each page's HTML), not hardcoded here — so English
    // pages keep English screen-reader labels after the menu is toggled.
    const label = open ? btn.dataset.labelClose : btn.dataset.labelOpen;
    if (label) btn.setAttribute("aria-label", label);
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(!menu.classList.contains("open"));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && e.target !== btn) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("open")) {
      setOpen(false);
      btn.focus();
    }
  });

  // Keyboard counterpart of the outside-click handler above. Tabbing off
  // the last item used to leave the dropdown open on top of the page, and
  // the next stop — the first link in main — sits underneath it: measured
  // at 390px, elementFromPoint over that link returned the footer, not the
  // link. WCAG 2.2 SC 2.4.11. relatedTarget still inside the bar means
  // focus only moved between brand, burger and menu items, which is not
  // leaving.  → DECISIONS.md §AE
  const bar = btn.closest(".site-nav");
  if (bar) {
    bar.addEventListener("focusout", (e) => {
      if (!menu.classList.contains("open")) return;
      if (e.relatedTarget && bar.contains(e.relatedTarget)) return;
      setOpen(false);
    });
  }
}

// Lightbox: click any .lightbox-trigger button (each wraps an image)
// to see the full image enlarged in a native <dialog>. A data-caption
// attribute (or the image's own alt text) shows as a caption under
// the enlarged image — as plain text by default (textContent), or as
// real HTML only where a caption actually needs it (a link, on the
// Home page's two standalone photos), opted into per-trigger via
// data-caption-html="true" rather than assumed everywhere; every
// data-caption on the site is site-authored, never user input, so
// the two that do use innerHTML are still safe. If there's more than
// one trigger on the page (the Foto gallery), prev/next buttons and
// the left/right arrow keys step through them all, looping at both
// ends — no swipe gesture, by design. A trigger marked
// data-standalone="true" (the Home essay photos) never shows
// prev/next, even if the page happens to have more than one
// lightbox-trigger — each opens on its own.
//
// Built on the native <dialog> element via showModal(), not a plain
// div toggled with a CSS class: this gets focus trapping, Escape-to-
// close, and top-layer stacking for free from the browser, instead of
// hand-rolling them. The trap isn't perfectly clean in practice —
// Chromium briefly routes focus through document.body at both wrap
// points instead of straight from last control to first (or vice
// versa); see the small Tab handler further down for the one-step
// patch that removes it. Triggers are real <button> elements wrapping
// an <img>, not an img with tabindex/role="button" grafted onto it —
// so focus, Enter/Space activation, and being announced as a button
// are all native too, nothing left to patch there. What's left for
// this function to actually do: prev/next on the arrow keys, and
// clearing the image/caption on close.
function initLightbox() {
  const overlay = document.querySelector(".lightbox-overlay");
  if (!overlay) return;

  const overlayImg = overlay.querySelector("img");
  const overlayCaption = overlay.querySelector(".lightbox-caption");
  const overlayCounter = overlay.querySelector(".lightbox-counter");
  const lightboxContent = overlay.querySelector(".lightbox-content");
  const closeBtn = overlay.querySelector(".lightbox-close");
  const prevBtn = overlay.querySelector(".lightbox-prev");
  const nextBtn = overlay.querySelector(".lightbox-next");

  const items = Array.from(document.querySelectorAll(".lightbox-trigger"));
  let currentIndex = -1;
  let currentHasMultiple = false;
  let lastFocusedEl = null; // whatever had focus before open(), as a backstop alongside the dialog's own native focus restoration

  const showIndex = (index) => {
    if (!items.length) return;
    currentIndex = (index + items.length) % items.length; // loop both ends
    const el = items[currentIndex];
    // el is the <button>; src/alt still live on the <img> nested inside it
    const img = el.querySelector("img");
    const src = el.dataset.src || (img && img.src) || "";
    const alt = el.dataset.alt || (img && img.alt) || "";
    const caption = el.dataset.caption || alt || "";
    // Loading state, same two moves as initDocViewer(): hide the image so
    // the browser's zero-size placeholder never shows, and put a spinner on
    // the container. Five of the six gallery photos point data-src at a
    // file separate from the thumbnail, so on a slow connection the tap was
    // followed by an empty dialog with nothing to say it was working. The
    // guard below is what the doc viewer does not need: that dialog always
    // loads a fresh src, while here prev/next can land on an image the
    // browser already has, and a src assignment that changes nothing fires
    // no load event — the spinner would turn forever.
    const settle = () => {
      overlayImg.style.opacity = "";
      if (lightboxContent) lightboxContent.classList.remove("lightbox-loading");
    };
    overlayImg.style.opacity = "0";
    if (lightboxContent) lightboxContent.classList.add("lightbox-loading");
    overlayImg.onload = settle;
    overlayImg.onerror = settle; // see initDocViewer(): a file that never arrives must not leave the gear turning
    overlayImg.src = src;
    if (overlayImg.complete && overlayImg.naturalWidth > 0) settle();
    // alt="" on purpose, even though a perfectly good alt exists on the
    // thumbnail. The caption element below is an aria-live region and its
    // text is either the thumbnail's own alt (see `caption` above, which
    // falls back to it) or a longer version of the same sentence — so
    // giving the enlarged <img> an alt as well made a screen reader read
    // essentially the same description twice on every open and every
    // prev/next step. Emptying it here doesn't lose anything: the
    // description still reaches the user through the caption, which is
    // also the only one of the two that updates announcements as you step
    // through the gallery. The thumbnail keeps its alt, which is what
    // matters for the page itself and for the trigger button's name.
    overlayImg.alt = "";
    if (overlayCounter) {
      // "3 / 6" — only when there's more than one photo to step through
      // (mirrors prevBtn/nextBtn's own currentHasMultiple gate above);
      // :empty in CSS hides it the rest of the time, same pattern as
      // .lightbox-caption. aria-live="polite" on the element (set in
      // markup) means this update is announced on prev/next — but only
      // once the dialog is actually open and visible; setting it here,
      // before showModal() runs on the very first open, is silent.
      overlayCounter.textContent = currentHasMultiple ? `${currentIndex + 1} / ${items.length}` : "";
    }
    if (overlayCaption) {
      // innerHTML only for the two captions that actually carry a real
      // link (data-caption-html="true" on the Home page's standalone
      // photos) — every other caption on the site is plain text, and
      // textContent is the safer default for those: it can't be
      // misread as markup no matter what characters end up in it.
      if (el.dataset.captionHtml === "true") {
        overlayCaption.innerHTML = caption;
      } else {
        overlayCaption.textContent = caption;
      }
    }
  };

  // Focus goes to the dialog itself, not to its close button. Focusing a
  // <button> programmatically leaves several engines — Safari in
  // particular — matching :focus-visible, so opening a lightbox by tap
  // painted a keyboard focus ring on the X for no reason a touch user
  // could act on. Suppressing the ring would have been the wrong repair:
  // keyboard users need it. Moving the target is the right one. The
  // dialog carries outline: none already (it is a container, not a
  // control), a screen reader announces its aria-label on arrival, and
  // the first Tab still lands on the X with a proper ring.
  const focusDialog = () => {
    overlay.tabIndex = -1;
    overlay.focus();
  };

  const open = (index) => {
    const el = items[index];
    const standalone = el && el.dataset.standalone === "true";
    currentHasMultiple = !standalone && items.length > 1;
    if (prevBtn) prevBtn.style.display = currentHasMultiple ? "" : "none";
    if (nextBtn) nextBtn.style.display = currentHasMultiple ? "" : "none";
    showIndex(index);
    lastFocusedEl = document.activeElement;
    document.body.classList.add("body-scroll-locked");
    overlay.showModal();
    focusDialog();
  };

  // Fires on every close, however it happens — Escape (native, no
  // listener needed for that part), the close button, or the
  // backdrop-click handler below — all funnel through overlay.close(),
  // and Escape triggers this same event natively. One place for
  // cleanup instead of repeating it at each call site.
  const BLANK_SRC = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7"; // inert 1x1 transparent gif — keeps overlayImg.src always non-empty/valid between opens

  overlay.addEventListener("close", () => {
    document.body.classList.remove("body-scroll-locked");
    overlayImg.src = BLANK_SRC;
    overlayImg.style.opacity = "";
    if (lightboxContent) lightboxContent.classList.remove("lightbox-loading");
    if (overlayCounter) overlayCounter.textContent = "";
    if (overlayCaption) overlayCaption.textContent = "";
    currentIndex = -1;
    window.getSelection()?.removeAllRanges(); // see initDocViewer()'s own close handler for why
    if (lastFocusedEl) {
      lastFocusedEl.focus();
      lastFocusedEl = null;
    }
    void document.body.offsetHeight; // forces a synchronous reflow — see initDocViewer()'s own close handler for why
    nudgeNavBackdropFilter();
  });

  items.forEach((el, index) => {
    // el is a real <button> now, not an img with tabindex/role="button"
    // bolted on — Enter and Space already fire a native click on any
    // button, so there's no keydown handler to write here anymore.
    // No preventDefault needed either: type="button" has no default
    // action (no form submission, no navigation) to suppress.
    el.addEventListener("click", () => open(index));
  });

  if (prevBtn) prevBtn.addEventListener("click", () => currentHasMultiple && showIndex(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => currentHasMultiple && showIndex(currentIndex + 1));

  closeBtn.addEventListener("click", () => overlay.close());

  // click on the backdrop area (outside .lightbox-content) closes too —
  // the dialog's own ::backdrop pseudo-element isn't a real DOM node so
  // it can't take a click listener directly, but a click landing on the
  // dialog's own padding area (outside its children) still targets the
  // dialog element itself, so this check still works the same way it
  // did on the old plain-div overlay.
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.close();
  });

  // Escape and focus trapping are both native to showModal() — no
  // listener needed for either, in principle. Arrow-key prev/next
  // isn't native, so that's still handled here; attached to the
  // dialog itself rather than document, since focus never leaves it
  // while open (the native trap), so a keydown on overlay is already
  // scoped to exactly the window where the dialog is showing.
  //
  // The Tab handling below is a narrow patch on top of that native
  // trap, not a replacement for it: tested directly, Chromium's own
  // wraparound briefly passes focus through document.body for one
  // stop (last control -> body -> first control, and the same
  // in reverse) before landing back inside the dialog. Focus never
  // actually reaches real page content either way — the nav, the
  // gallery thumbnails — so it isn't a security-relevant trap
  // failure, but body has no visible focus ring, so it reads to a
  // keyboard user as focus vanishing for a step. Intercepting just
  // the two wrap points (last->first, first->last) removes that stop
  // entirely; everything else about the native trap is left alone.
  overlay.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && currentHasMultiple) showIndex(currentIndex - 1);
    if (e.key === "ArrowRight" && currentHasMultiple) showIndex(currentIndex + 1);

    if (e.key === "Tab") {
      // Derived from the DOM instead of a fixed [closeBtn, prevBtn,
      // nextBtn] list: that fixed list misses any link a caption may
      // carry (data-caption-html="true", used where a caption needs
      // a real link rather than plain text) — Tab could never reach
      // it, and with prev/next hidden the trap would treat closeBtn
      // as both first and last, so a single Tab just bounced in
      // place. Querying the dialog directly picks up whatever is
      // actually focusable and visible at the time, in DOM order.
      const focusable = Array.from(
        overlay.querySelectorAll("button, a[href]")
      ).filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

// "Un discorso" hint: two different rules, not one shared formula.
// Portrait: visible only at scroll 0 — the simplest version, which
// worked fine there from the start. Landscape: visible until scroll
// reaches 3/5 of the viewport's own height — a plain, fixed fraction
// of the screen, not tied to the clump's on-screen position at all.
//
// Earlier versions computed the threshold from where the first photo
// actually sits in the document, to make the trigger point track the
// real content instead of an arbitrary number. In testing that chain
// turned out to be fragile in more ways than expected — entrance
// animations restarting on rotation, a transform transition on
// .settled adding its own delay, font-loading timing — and each fix
// for one browser's behavior didn't reliably hold on another (it
// matched Chromium in emulation but not real Android). A fixed
// fraction of the viewport sidesteps all of that: it depends on
// nothing but window.innerHeight, measured once per orientation.
//
// The threshold is captured once per rotation into landscape, not
// recomputed on every scroll: mobile browser chrome (the address
// bar) collapses as you scroll, changing innerHeight mid-scroll, and
// a threshold recomputed against that live value would keep
// receding right as the reader approaches it.
function initDiscorsoHint() {
  const hint = document.querySelector(".discorso-hint");
  if (!hint) return;

  let isLandscape = null;
  let landscapeThreshold = 0;

  const update = () => {
    const hide = isLandscape
      ? window.scrollY > landscapeThreshold
      : window.scrollY > 0;
    hint.classList.toggle("hidden", hide);
  };

  const checkOrientation = () => {
    const nowLandscape = window.innerWidth > window.innerHeight;
    if (nowLandscape === isLandscape) return;
    isLandscape = nowLandscape;
    if (isLandscape) landscapeThreshold = window.innerHeight * 0.6;
    update();
  };

  checkOrientation();
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", checkOrientation);
}

// Clump photos: marks each .clump-photo as .settled once its entrance
// animation (clumpIn) finishes, so the hover-zoom CSS rule can safely
// take over the transform property (see the .settled comment in
// style.css for why this has to wait rather than just using :hover
// directly). Falls back gracefully if animationend never fires for
// some reason — no .settled just means no hover-zoom, not a break.
//
// On the mobile stacked layout the entrance animation is switched off
// entirely (animation: none), so animationend never fires there and
// .settled would otherwise never get added at all while portrait —
// each photo is marked settled immediately in that case instead.
// This matters beyond hover-zoom: .settled's own CSS always sets
// animation: none, at a higher specificity than the base rule that
// turns the entrance animation back on above the mobile breakpoint.
// Without marking photos settled in portrait, rotating a phone from
// portrait to landscape lets that base rule take over again and the
// browser restarts the entrance animation from scratch — photos
// visibly fly in a second time, and anything measuring their
// position (like the "Un discorso" hint's landscape threshold, a bit
// further down this file) can catch them mid-flight and compute a
// wrong result. Settling them in portrait closes that door before it
// can open: once .settled is set, no later media-query match can
// ever turn the animation back on.
function initClumpPhotos() {
  const photos = document.querySelectorAll(".clump-photo");
  if (!photos.length) return;

  photos.forEach((photo) => {
    if (getComputedStyle(photo).animationName === "none") {
      photo.classList.add("settled");
      return;
    }
    photo.addEventListener(
      "animationend",
      () => photo.classList.add("settled"),
      { once: true }
    );
  });
}

// Document viewer: a second dialog, separate from initLightbox()'s,
// for scanned documents meant to be read rather than admired — see
// the CSS comment above .doc-viewer-overlay for why it doesn't just
// reuse .lightbox-overlay. Deliberately the simpler of the two: no
// prev/next, no carousel index, because every .doc-viewer-trigger on
// a page is its own standalone document, never a sequence.
//
// Triggers stay real <a href="…"> elements pointing at the raw image
// file, not <button>s like the photo lightbox uses — click is
// intercepted with preventDefault() when JS runs, but without JS the
// link still works exactly as it did before this feature existed
// (opens the full-resolution file in a new tab). Progressive
// enhancement, not a replacement.
//
// The transcript toggle only appears when a trigger actually has a
// data-text-target pointing at a <template> on the page (see
// discorso.html) — most .doc-viewer-trigger elements don't yet, and
// the button stays hidden for those rather than opening onto an
// empty panel.
function initDocViewer() {
  const overlay = document.querySelector(".doc-viewer-overlay");
  const triggers = document.querySelectorAll(".doc-viewer-trigger");
  if (!overlay || !triggers.length) return;

  const scrollWrap = overlay.querySelector(".doc-viewer-scroll");
  const img = scrollWrap.querySelector("img");
  const textPanel = overlay.querySelector(".doc-viewer-text");
  const toggleBtn = overlay.querySelector(".doc-viewer-toggle");
  const closeBtn = overlay.querySelector(".doc-viewer-close");
  const BLANK_SRC = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7"; // same inert 1x1 placeholder as initLightbox, same reason: keeps img.src always non-empty/valid between opens
  let lastFocusedEl = null;
  let activeTemplateId = null;
  // the label authored in the HTML ("Documento ingrandito" / "Enlarged
  // document"), kept so a text-only open can replace it and an image
  // open can put it back — the dialog is shared, the label is not
  const defaultLabel = overlay.getAttribute("aria-label") || "";

  // Transcripts come from two kinds of carrier. Most are <template>,
  // which never renders — right for a scan's transcription, which only
  // ever exists as an alternative to an image that is already on the
  // page. The complete patent list is the exception: it is the only
  // copy of 33 of those 41 entries now that the card shows eight, so it
  // has to survive printing, and <template> content cannot be revealed
  // by a stylesheet at all. It lives in a [hidden] <div> instead, out of
  // the accessibility tree and the tab order on screen, unhidden by the
  // print block. Cloning has to handle both.
  const cloneSource = (el) =>
    el.content
      ? el.content.cloneNode(true)
      : Array.from(el.children).reduce((frag, child) => {
          frag.appendChild(child.cloneNode(true));
          return frag;
        }, document.createDocumentFragment());

  const showImage = () => {
    scrollWrap.hidden = false;
    textPanel.hidden = true;
    toggleBtn.setAttribute("aria-pressed", "false");
  };

  const showText = () => {
    scrollWrap.hidden = true;
    textPanel.hidden = false;
    toggleBtn.setAttribute("aria-pressed", "true");
  };

  // Focus goes to the dialog itself, not to its close button. Focusing a
  // <button> programmatically leaves several engines — Safari in
  // particular — matching :focus-visible, so opening a lightbox by tap
  // painted a keyboard focus ring on the X for no reason a touch user
  // could act on. Suppressing the ring would have been the wrong repair:
  // keyboard users need it. Moving the target is the right one. The
  // dialog carries outline: none already (it is a container, not a
  // control), a screen reader announces its aria-label on arrival, and
  // the first Tab still lands on the X with a proper ring.
  const focusDialog = () => {
    overlay.tabIndex = -1;
    overlay.focus();
  };

  const open = (trigger) => {
    const src = trigger.dataset.docSrc;
    activeTemplateId = trigger.dataset.textTarget || null;
    const template = activeTemplateId && document.getElementById(activeTemplateId);

    // Text-only triggers: a transcript with no scan behind it. Used by
    // the "Espandi lista" controls on Curriculum, where the dialog holds
    // the complete 41-patent list and there is no document to enlarge —
    // so there is nothing for the toggle to toggle between, and it stays
    // hidden rather than sitting there as a control that does nothing.
    const textOnly = !src;
    if (textOnly && !template) return;

    overlay.setAttribute("aria-label", trigger.dataset.docLabel || defaultLabel);

    textPanel.innerHTML = "";
    if (template) textPanel.appendChild(cloneSource(template));

    if (textOnly) {
      toggleBtn.hidden = true;
      showText();
      textPanel.scrollTop = 0;
      lastFocusedEl = document.activeElement;
      document.body.classList.add("body-scroll-locked");
      overlay.showModal();
      focusDialog();
      return;
    }

    // hidden until 'load' fires — without this, the browser renders
    // its own tiny default placeholder (no intrinsic size is known
    // yet) centered by margin:auto, which is exactly the stray dot
    // reported at screen center during the load gap. scrollWrap gets
    // a loading class instead, for a visible "it's working" cue on
    // the large full-resolution files this dialog often loads.
    img.style.opacity = "0";
    scrollWrap.classList.add("doc-viewer-loading");
    // load and error are the only two ways this ever finishes, so both
    // have to undo the two lines above. Without the error half, a file
    // that never arrives (bad path after a rename, a dropped
    // connection mid-download on the multi-hundred-KB scans this
    // dialog opens) left the spinner turning forever over an image
    // held at opacity:0 — a dialog that looks busy and never isn't,
    // with nothing to read and nothing to say what went wrong.
    // Restoring opacity on error is deliberate rather than tidy-up:
    // the browser's own broken-image placeholder and the alt text
    // become visible, which at least reads as "this failed". Where the
    // document has a transcript the "Versione testuale" button is
    // already there beside it and still works — the transcript is
    // cloned from an inline <template>, so it doesn't depend on the
    // image having loaded at all, and on those documents the failure
    // costs the scan but not the content.
    const settle = () => {
      img.style.opacity = "";
      scrollWrap.classList.remove("doc-viewer-loading");
    };
    img.onload = settle;
    img.onerror = settle;
    img.src = src;
    img.alt = trigger.dataset.docAlt || "";
    img.classList.toggle("doc-fit-height", trigger.dataset.docFit === "height");
    scrollWrap.scrollTop = 0;
    scrollWrap.scrollLeft = 0;

    toggleBtn.hidden = !template;

    showImage();
    lastFocusedEl = document.activeElement;
    document.body.classList.add("body-scroll-locked");
    overlay.showModal();
    focusDialog();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      open(trigger);
    });
  });

  toggleBtn.addEventListener("click", () => {
    if (textPanel.hidden) showText();
    else showImage();
  });

  closeBtn.addEventListener("click", () => overlay.close());

  // backdrop click closes — checks two targets, not just one. Unlike
  // .lightbox-overlay, this dialog has zero padding (the whole point
  // is letting the image fill the viewport), so its .doc-viewer-bar
  // and .doc-viewer-scroll children together cover 100% of the
  // dialog's own box — e.target === overlay on its own would almost
  // never fire, since there's no exposed sliver of the dialog element
  // itself left to click. scrollWrap is the realistic target: it's
  // the flex container behind the image, hit whenever the document is
  // narrower/shorter than the viewport (diploma-cfm centered in a
  // wide window) or the view is scrolled past the image's edge.
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target === scrollWrap) overlay.close();
  });

  overlay.addEventListener("close", () => {
    document.body.classList.remove("body-scroll-locked");
    img.src = BLANK_SRC;
    img.style.opacity = "";
    scrollWrap.classList.remove("doc-viewer-loading");
    textPanel.innerHTML = "";
    activeTemplateId = null;
    window.getSelection()?.removeAllRanges(); // this dialog has actual selectable text (the transcript) — a stray selection surviving close, confirmed by report as the real cause of the reported line, not the tap-highlight tried last round
    if (lastFocusedEl) {
      lastFocusedEl.focus();
      lastFocusedEl = null;
    }
    // forces a synchronous reflow — targets a known class of WebKit/
    // iOS Safari bug where a stale compositing layer isn't repainted
    // after toggling overflow/display until something external forces
    // one. Matches the reported symptoms closely: not reproducible in
    // Chromium even with touch emulation (tried live); activeElement
    // correctly returns to the trigger on close, ruling out a
    // lingering focus/selection state as the cause; and the report
    // itself — clears on an unrelated touch elsewhere, persists
    // through an orientation change — describes a stuck paint layer,
    // not any live DOM/CSS state. This doesn't need to know exactly
    // what's stale; it just forces a redraw that discards it.
    void document.body.offsetHeight;
    nudgeNavBackdropFilter(); // confirmed iOS-Safari-only (absent on Android Chrome) — see this function's own comment
  });

  // Escape and focus trapping are native to showModal(), same as
  // initLightbox() — but the Tab-wraparound patch that function needs
  // turned out to be needed here too, confirmed by testing live: the
  // same Chromium body-detour behaviour documented on that patch shows
  // up on this dialog as well. Derived from the DOM rather than a
  // fixed list for the same reason as initLightbox()'s version: the
  // toggle button is conditionally hidden (no transcript on this
  // trigger), and whichever of scrollWrap/textPanel is currently
  // visible should be the one counted, not both.
  overlay.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    // a[href] is in this selector and initLightbox()'s is not an
    // oversight there — it was a latent bug here. The selector used to
    // be "button, [tabindex]", which was harmless only for as long as
    // no transcript contained a link. The complete patent list does:
    // 41 of them. textPanel carries tabindex="0", so it was the last
    // entry in the filtered list, and Tab from it hit the wrap branch
    // and jumped back to the close button — putting every one of those
    // 41 pdf links out of reach of forward tabbing, inside a dialog
    // whose entire purpose is those links.
    const focusable = Array.from(
      overlay.querySelectorAll("button, a[href], [tabindex]")
    ).filter((el) => el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}




// In-page fragment links go dead after their first use. Clicking
// href="#clump-row-1" navigates to that fragment and scrolls; clicking it
// again asks the browser to navigate somewhere the document already is,
// so it does nothing at all. Measured on Discorso with real clicks:
// 1400 -> 138, then 1400 -> 1400, then 1400 -> 1400.
//
// On this site that is worse than it sounds, because the four coloured
// words share three targets: "documento" and the first "parole" both
// point at #clump-row-1, so using either one kills both. The same applies
// to the footnote links on Home and to every skip link.
//
// The handler intervenes ONLY when location.hash already equals the
// link's href — the one case the browser gets wrong. Every working
// navigation is left entirely alone, which matters more than it looks:
// initScrollMemory() keys each history entry by a twKey it stores in
// history.state, so anything here that pushed or replaced state would
// quietly break scroll restoration. This pushes nothing and replaces
// nothing.
//
// scrollIntoView respects scroll-margin-top (100px, clearing the fixed
// nav) and, with no `behavior` given, resolves to the computed
// scroll-behavior — smooth once §G has armed it, instant under
// prefers-reduced-motion. Targets carrying tabindex get focus too, since
// that is what a real fragment navigation would have done: it is how the
// skip link reaches <main tabindex="-1">.
function initFragmentLinks() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest && e.target.closest('a[href^="#"]');
    if (!link || link.classList.contains("ornament-link")) return;

    const href = link.getAttribute("href");
    if (href.length < 2 || href !== location.hash) return;

    const target = document.getElementById(href.slice(1));
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ block: "start" });
    if (target.hasAttribute("tabindex")) target.focus({ preventScroll: true });
  });
}

// The end-of-essay ornament is a "back to top" link. As a bare
// href="#top" it worked exactly once: after the first click the fragment
// is already #top, so the browser has nothing to navigate to and every
// later click does nothing at all. Measured: 2500 -> 0, then 2500 ->
// 2500, then 2500 -> 2500.
//
// preventDefault plus an explicit scroll makes it repeatable, and drops
// the #top from the URL and from the history stack as a side effect —
// the ornament is a convenience, not a place. scrollTo is called with no
// `behavior`, which resolves to the computed `scroll-behavior`: smooth
// once initScrollMemory has armed it, and instantly under
// prefers-reduced-motion, without this function having to know about
// either. The href stays in the markup so it still works without JS.
function initOrnamentLinks() {
  document.querySelectorAll(".ornament-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0 });
    });
  });
}

// Patent card rotator: scrolling the short patent list swaps the drawing
// beside it. Three scans of Teresio's own patents, cross-faded as the
// reader moves down the eight entries.
//
// Three things this deliberately does NOT do:
//
// 1. It does not put the second and third scans in the initial page load.
//    They carry data-frame-src rather than src and are given a real src
//    only after window 'load', on an idle callback. §K's rule is that on
//    this site image scheduling IS animation timing — but that rule is
//    about the frame that animates, and only frame 1 does. Frames 2 and 3
//    sit behind it at opacity:0 and are never revealed on arrival, so
//    deferring them costs no choreography and keeps 134 KB off the
//    critical path of a page that already carries four scans.
//
// 2. It does not run when the box has almost nothing to scroll. Below
//    MIN_RANGE the eight entries very nearly fit, and mapping a 20px
//    range onto three frames turns an accidental trackpad nudge into a
//    full image change. Under that threshold the card just keeps frame 1,
//    which is the pre-existing behaviour and a perfectly good outcome.
//
// 3. It does not run under prefers-reduced-motion. The cross-fade would
//    already be flattened to nothing by the global reduce block, but an
//    image that changes underneath you as you scroll is motion whether or
//    not it fades, and the three scans are interchangeable illustration —
//    a reader who opts out loses decoration, not content. That is also
//    why frames 2 and 3 carry alt="": only frame 1 describes the drawing,
//    so the accessible name of the trigger stays fixed no matter which
//    scan happens to be showing.
function initPatentRotator() {
  const rotator = document.querySelector(".patent-rotator");
  if (!rotator) return;

  const frames = Array.from(rotator.querySelectorAll(".patent-frame"));
  if (frames.length < 2) return;

  const figure = rotator.closest("figure");
  const box = figure && figure.querySelector(".text-window");
  if (!box) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const MIN_RANGE = 60; // px of scrollable overflow below which this is off

  // deferred load, so the two extra scans never compete with first paint
  const loadFrames = () => {
    frames.forEach((f) => {
      const src = f.dataset.frameSrc;
      if (src) {
        f.src = src;
        delete f.dataset.frameSrc;
      }
    });
  };
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
  if (document.readyState === "complete") idle(loadFrames);
  else addEventListener("load", () => idle(loadFrames), { once: true });

  let current = 0;
  let ticking = false;

  const update = () => {
    ticking = false;
    const range = box.scrollHeight - box.clientHeight;
    if (range < MIN_RANGE) return;

    // Math.max(0, …) is the whole iOS bug fix. Safari lets a scroll
    // container rubber-band past its own start, so box.scrollTop goes
    // NEGATIVE during the bounce at the top — something Chromium never
    // does, which is why this passed every desktop test. The index then
    // came out -1, and the old code removed .is-current from the current
    // frame before throwing on frames[-1].classList: the card went blank,
    // `current` never advanced past the stale value, and the early
    // `i === current` return then refused to put the class back. The
    // reported symptom follows exactly — image gone at scroll zero, back
    // only once you had scrolled far enough to reach frame 2.
    //
    // Math.min still guards the other end, where iOS bounces past the
    // bottom and scrollTop/range exceeds 1.
    const i = Math.min(
      frames.length - 1,
      Math.max(0, Math.floor((box.scrollTop / range) * frames.length))
    );

    // Self-healing rather than incremental: assert the whole set every
    // time instead of trusting `current` to describe the DOM. If anything
    // ever knocks the classes out of step again, the next scroll event
    // repairs it — exactly one frame carries .is-current, always.
    if (i === current && frames[i].classList.contains("is-current")) return;
    frames.forEach((f, n) => f.classList.toggle("is-current", n === i));
    current = i;
  };

  box.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );
}

// Scroll memory: puts the reader back where they were after Back.
//
// This replaces the browser's own restoration ("auto") rather than
// trying to arrange conditions in which the browser's restoration
// behaves — which is what §G's three earlier attempts all did, and
// which kept failing on phones for a reason none of them could reach:
// the browser decides WHEN to restore, and every failure mode is a
// second scroll landing after that moment. §G's fix (holding
// scroll-behavior:smooth off html until one frame after `load`) closes
// exactly one of those windows, the one where the restore itself gets
// animated on a freshly parsed document. It cannot close the others:
//
//   - back/forward cache. On a bfcache resume the document is not
//     re-parsed — it is resumed with the class list it had when you
//     left, scroll-smooth already on html. `load` never fires again,
//     so the head script's one-frame gate never runs, and the engine's
//     restore animates exactly as it did before §G. This is the path
//     iOS Safari takes for Back almost always, and Chrome for Android
//     takes often.
//   - a fragment left in the URL. Blink keeps a live "fragment anchor"
//     while a document loads and re-scrolls to it as layout settles,
//     up to and past `load`. Come back to an entry whose URL is
//     home.html#top (the finalino's back-to-top link puts it there)
//     and that late re-scroll is a scroll to the top of the document,
//     landing after a restore that had already succeeded.
//   - late layout. Fonts are font-display:swap; the essay reflows when
//     Merriweather lands. Blink retries a deferred restore when the
//     document grows, and that retry is animated too once the class is
//     on.
//
// All three produce the same symptom — the right position appears for
// an instant, then the page goes to the top — because all three are a
// second scroll arriving after a correct first one. So the fix isn't
// to keep hunting for the one that fires on a given phone; it's to
// stop being the passive party. scrollRestoration goes to `manual`,
// this file remembers the position itself, and after restoring it
// KEEPS re-asserting it for a short window, so any late scroll from
// any of the above is simply overwritten on the next frame. The window
// closes early once the document height and the scroll position have
// both been stable for a moment, and immediately on any real touch,
// wheel or key press, so it can never fight the reader.
//
// scroll-behavior:smooth is still gated, but on this function rather
// than on `load`: the class goes on only once a restore window has
// closed, and comes back off at the start of every later one. §G's
// insight holds, it just needed a gate that also covers the resumed
// and same-document paths.
//
// Called at top level, not from DOMContentLoaded, so the restore
// starts on the first frame after this file parses rather than waiting
// for the rest of the document.
//
// If this file 404s or throws before this point, the inline <head>
// script's `load` failsafe puts scrollRestoration back to `auto` and
// adds scroll-smooth — degrading to the pre-§H behaviour rather than
// to no restoration at all.  → DECISIONS.md §H
function initScrollMemory() {
  const root = document.documentElement;
  const STORE = "tw:y:";
  const WINDOW_MS = 1200; // hard ceiling on how long we keep re-asserting
  const STABLE_MS = 250;  // height + position unchanged this long → done early
  const GRACE_MS = 150;   // ignore "user input" this soon after a restore starts:
                          // the tail of an iOS edge-swipe-back can land here

  // Generation counter, bumped by disarmSmooth(). armSmooth() adds the
  // class on the next frame, and a restore starting inside that gap
  // would otherwise have its disarm undone a frame later by an arm that
  // belongs to the restore before it.
  let smoothGen = 0;
  let smoothArmed = false;

  const armSmooth = () => {
    if (smoothArmed) return;
    smoothArmed = true;
    const gen = smoothGen;
    requestAnimationFrame(() => {
      if (gen === smoothGen) root.classList.add("scroll-smooth");
    });
  };

  const disarmSmooth = () => {
    smoothGen += 1;
    smoothArmed = false;
    root.classList.remove("scroll-smooth");
  };

  if (!("scrollRestoration" in history)) {
    armSmooth();
    return;
  }
  history.scrollRestoration = "manual";

  // Each history entry carries its own random key in history.state, so
  // the saved position is per-ENTRY, not per-URL. This is what makes
  // the footnote round-trip work: home.html and home.html#nota are two
  // entries with two keys and two remembered positions, and Back from
  // the note returns to the paragraph you left, not to the note again.
  // Traversal hands the state object back with its key intact, so an
  // entry is only ever keyed once; a brand-new entry arrives with
  // state null and gets stamped here.
  const keyFor = () => {
    const state = history.state || {};
    if (state.twKey) return state.twKey;
    state.twKey =
      "k" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    try {
      history.replaceState(state, "");
    } catch (e) {
      /* replaceState can throw on file:// in some engines — the key is
         then per-load rather than per-entry, which costs restoration
         across a hash jump and nothing else */
    }
    return state.twKey;
  };

  let key = keyFor();

  // Second, coarser key: the URL rather than the history entry. It exists
  // only for reloads. The entry key lives in history.state, and a state
  // object is not guaranteed to survive a reload the way it survives a
  // traversal — engines differ, and when it doesn't survive, keyFor()
  // mints a fresh key on the reloaded document and the saved position
  // becomes unreachable. The page then opens at the top, which is exactly
  // what a reload should NOT do. The hash is left out on purpose: this is
  // a coarse net for "same page, reloaded", and per-fragment positions are
  // the entry key's job.  → DECISIONS.md §H
  const urlKey = () => "tw:u:" + location.pathname + location.search;

  const readRaw = (fullKey) => {
    try {
      const v = sessionStorage.getItem(fullKey);
      return v === null ? null : parseFloat(v);
    } catch (e) {
      return null; // private mode, storage disabled — no memory, no error
    }
  };
  const read = (k) => readRaw(STORE + k);

  // Reload is the one navigation where the URL fallback may be consulted.
  // Anywhere else it would be wrong: clicking through to home.html from
  // the index is a fresh arrival and must land at the top, even though
  // this tab may hold a position for that URL from earlier in the session.
  const isReload = () => {
    try {
      const nav = performance.getEntriesByType("navigation")[0];
      if (nav && nav.type) return nav.type === "reload";
      return performance.navigation && performance.navigation.type === 1;
    } catch (e) {
      return false;
    }
  };

  // Only ever written for the CURRENT entry. Flushed on the way out of
  // the page, on tab-hide (iOS can discard a backgrounded tab without
  // ever firing pagehide), on any click before its default action runs
  // — that last one is what captures the reading position before an
  // in-page anchor jump moves it — and lazily while scrolling, so an
  // abrupt kill loses at most half a second of reading position.
  let lastFlush = 0;
  let restoring = false; // suppress saves while our own loop is moving the page
  const save = () => {
    if (restoring) return;
    lastFlush = Date.now();
    try {
      const y = String(Math.round(window.scrollY));
      sessionStorage.setItem(STORE + key, y);
      sessionStorage.setItem(urlKey(), y);
    } catch (e) {
      /* nothing to do: restoration is a nicety, never a hard failure */
    }
  };

  // Leading edge AND trailing edge. The throttle alone was writing a
  // position that could be several hundred pixels behind the real one:
  // it fires on the FIRST scroll event past the 500ms mark and then goes
  // quiet, so wherever the page comes to rest after that event is never
  // recorded. Smooth scrolling makes this the normal case rather than an
  // edge case — a `scroll-behavior: smooth` jump emits its first event
  // near the start of the animation and finishes hundreds of pixels
  // later, inside the same 500ms window. Measured before this line
  // existed: discorso.html stored 1408 for a real 1500, curriculum.html
  // 1476 for 1611, home.html 1766 for 2000.
  //
  // click/pagehide/visibilitychange already catch the ordinary exits, so
  // this is not about them — it is about the exit that fires none of the
  // three, which the pagehide comment below already names: iOS
  // discarding a backgrounded tab. That path reads whatever is in
  // storage, and this makes sure what is in storage is where the reader
  // actually is.
  let flushTimer = 0;
  addEventListener(
    "scroll",
    () => {
      if (Date.now() - lastFlush > 500) save();
      clearTimeout(flushTimer);
      flushTimer = setTimeout(save, 150); // 150ms: shorter than any
                                          // plausible pause in reading,
                                          // long enough that a smooth
                                          // jump lands before it fires
    },
    { passive: true }
  );
  addEventListener("pagehide", () => {
    save();
    // A bfcache resume brings the class list back exactly as it was.
    // Leaving without scroll-smooth means the resumed document cannot
    // animate its own restore before pageshow gets a chance to run.
    disarmSmooth();
  });
  addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") save();
  });
  addEventListener("click", save, { capture: true, passive: true });

  // Restores to `target` and defends it for a short window. Runs with
  // scroll-behavior forced back to auto (disarmSmooth) so every
  // assertion below is an instant jump, never an animation something
  // else can cancel.
  let restoreGen = 0;
  const restoreTo = (target) => {
    // Supersede any loop still running: popstate and pageshow can land
    // close together, and two loops asserting two targets would fight.
    restoreGen += 1;
    const gen = restoreGen;

    if (target === null || !isFinite(target) || target <= 0) {
      restoring = false; // nothing to defend; release any superseded loop's flag
      armSmooth();
      return;
    }

    disarmSmooth();
    restoring = true;

    const started = performance.now();
    let lastHeight = -1;
    let stableSince = 0;
    let live = true;

    const abort = () => {
      if (performance.now() - started < GRACE_MS) return;
      stop();
    };
    const events = ["touchstart", "wheel", "keydown", "pointerdown"];

    function stop() {
      if (!live) return;
      live = false;
      events.forEach((t) => removeEventListener(t, abort, true));
      if (gen !== restoreGen) return; // superseded: the newer loop owns the rest
      restoring = false;
      save(); // the restored position is now this entry's position
      armSmooth();
    }

    events.forEach((t) =>
      addEventListener(t, abort, { capture: true, passive: true })
    );

    function step(now) {
      if (!live) return;
      if (gen !== restoreGen) return stop(); // a newer restore took over

      const height = root.scrollHeight;
      const max = Math.max(0, height - window.innerHeight);
      // Clamped, not stored clamped: the document is usually still
      // growing (fonts, images), so a target past the current bottom
      // is normal and will become reachable a few frames later.
      const y = Math.min(target, max);

      if (Math.abs(window.scrollY - y) > 1) {
        // Two-argument form on purpose: it is unconditionally instant,
        // and it stays instant even if some future rule puts
        // scroll-behavior back on html while this loop is running.
        window.scrollTo(0, y);
        stableSince = 0;
      } else if (height === lastHeight) {
        if (!stableSince) stableSince = now;
        else if (now - stableSince > STABLE_MS) return stop();
      } else {
        stableSince = 0;
      }
      lastHeight = height;

      if (now - started >= WINDOW_MS) return stop();
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  };

  // A new entry has no saved position, so a plain forward navigation to
  // home.html — or a shared link to home.html#nota — restores nothing
  // and the fragment is left to behave normally. The presence of a
  // saved value IS the "we have been on this entry before" test. The one
  // exception is a reload, where the entry key may not have survived and
  // the URL key answers instead — see urlKey() above. This is not §G
  // attempt 1's navigation sniffing: the type is not deciding whether to
  // restore, only which of two keys to read, and a wrong answer costs a
  // position, not a broken page.
  const initial = read(key);
  restoreTo(initial === null && isReload() ? readRaw(urlKey()) : initial);

  // bfcache resume: the layout is already final, so this settles in a
  // frame. Nothing else in this file runs on that path — no parse, no
  // DOMContentLoaded, no load.
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    key = keyFor();
    restoreTo(read(key));
  });

  // Same-document traversal (the footnote round-trip). With `manual`
  // the engine won't move the page for these either, so they are ours
  // to handle. popstate fires before hashchange, and on traversal the
  // state comes back keyed, so keyFor() returns the existing key here
  // rather than minting one.
  addEventListener("popstate", () => {
    key = keyFor();
    restoreTo(read(key));
  });

  // A hash link CLICK pushes a fresh, unkeyed entry. Stamp it, then seed
  // it once the smooth jump has actually landed — a save on the next
  // frame would record the position the jump started from, and a later
  // Back onto this entry would then miss the note it is supposed to
  // return to. 700ms clears the 0.5s-ish smooth scroll with room spare;
  // if the reader scrolls away before then, the lazy scroll flush above
  // has already written a truer value and this one just matches it.
  addEventListener("hashchange", () => {
    key = keyFor();
    setTimeout(save, 700);
  });
}

// Runs immediately, at parse time, not from DOMContentLoaded: the whole
// point is to get the reader's position back before the next frame is
// painted, and DOMContentLoaded is one more frame than that costs.
// Everything else on this page can wait; this cannot.
initScrollMemory();

document.addEventListener("DOMContentLoaded", () => {
  // two separate calls, two separate observers — see observeReveal()
  observeReveal(".reveal-img");
  observeReveal(".essay-anim");
  initGalleryReveal();
  initNavHide();
  initMobileMenu();
  initLightbox();
  initDocViewer();
  initDiscorsoHint();
  initClumpPhotos();
  initPatentRotator();
  initOrnamentLinks();
  initFragmentLinks();

  // Failsafe flag, read by the inline <head> script on window 'load'.
  // Deliberately the LAST statement of this handler, not the first
  // line of the file: the point isn't "did this file arrive", it's
  // "did every reveal observer actually get attached". The CSS that
  // starts .reveal-img/.essay-anim at opacity:0 is gated behind the
  // .js class, and only the two observeReveal() calls above ever add
  // the .visible that undoes it — so if anything above throws, the
  // calls after it never run and that content would stay invisible
  // forever. Setting the flag here means a throw anywhere in the
  // sequence leaves it unset, and the <head> script swaps .js back to
  // .no-js, which drops the opacity:0 starting state entirely: no
  // animation, but every paragraph and photo is on screen. Same
  // outcome if this file 404s or fails to parse — the handler never
  // registers, the flag never appears.
  window.__animsReady = true;
});
