// Reveals each .reveal-img as it scrolls into view: slides in from
// the side (left by default, or right if it has the "from-right" class)
// and fades in. Plays once per image.
function initScrollReveal() {
  const images = document.querySelectorAll(".reveal-img");
  if (!images.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  images.forEach((img) => observer.observe(img));
}

// Home essay: same one-shot reveal-on-scroll pattern as .reveal-img
// above, applied to each paragraph box and photo individually
// (.essay-anim). Kept as a separate observer/class rather than
// reusing .reveal-img because the animation itself is different
// (rise + fade, not a side slide) and deliberately excludes specific
// elements (title, epigraph, closing source note) that .reveal-img's
// blanket selector would otherwise catch.
function initEssayReveal() {
  const blocks = document.querySelectorAll(".essay-anim");
  if (!blocks.length) return;

  const essayObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          essayObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  blocks.forEach((el) => essayObserver.observe(el));
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
    overlayImg.src = src;
    overlayImg.alt = alt;
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

  const open = (index) => {
    const el = items[index];
    const standalone = el && el.dataset.standalone === "true";
    currentHasMultiple = !standalone && items.length > 1;
    if (prevBtn) prevBtn.style.display = currentHasMultiple ? "" : "none";
    if (nextBtn) nextBtn.style.display = currentHasMultiple ? "" : "none";
    showIndex(index);
    lastFocusedEl = document.activeElement;
    overlay.showModal();
    // move focus into the dialog — closeBtn rather than the image itself,
    // since overlayImg has no tabindex and isn't a real control
    closeBtn.focus();
  };

  // Fires on every close, however it happens — Escape (native, no
  // listener needed for that part), the close button, or the
  // backdrop-click handler below — all funnel through overlay.close(),
  // and Escape triggers this same event natively. One place for
  // cleanup instead of repeating it at each call site.
  const BLANK_SRC = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7"; // inert 1x1 transparent gif — keeps overlayImg.src always non-empty/valid between opens

  overlay.addEventListener("close", () => {
    overlayImg.src = BLANK_SRC;
    if (overlayCaption) overlayCaption.textContent = "";
    currentIndex = -1;
    if (lastFocusedEl) {
      lastFocusedEl.focus();
      lastFocusedEl = null;
    }
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

document.addEventListener("DOMContentLoaded", () => {
  initScrollReveal();
  initEssayReveal();
  initNavHide();
  initMobileMenu();
  initLightbox();
  initDiscorsoHint();
  initClumpPhotos();
});
