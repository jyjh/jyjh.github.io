/* Homepage hero splash (layouts/index.html + assets/css/home-hero.css).
   One-time landing: the splash covers the window on arrival; the first
   downward scroll gesture, the cue click, or PageDown/Space slides it away
   while the post list stays pinned at the top - so what appears after the
   hero is the latest post. Afterwards the page behaves exactly like the
   stock theme until the next reload.

   Poison scrolls differently per breakpoint:
   - >= 48em: body is overflow:hidden and .container.content is the scroller;
     the sidebar is a fixed-width column, so it slides in from the left.
   - < 48em: the document itself scrolls and the sidebar is a stacked top
     bar, so we pin the document at the top and let the curtain reveal it. */
(function () {
  var content = document.querySelector(".container.content");
  var hero = document.querySelector("[data-home-hero]");
  var sidebar = document.querySelector(".sidebar");
  if (!content || !hero || !sidebar) return;

  var desktop = window.matchMedia("(min-width: 48em)");
  var reducedMotion = false;
  try {
    reducedMotion = !window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
  } catch (err) {}
  var DURATION = reducedMotion ? 0 : 600;
  var dismissed = false;

  // The splash stays "live" until it has fully animated off-screen; while it
  // is live the page is held at the very top so the list cannot drift behind
  // the curtain.
  function heroLive() {
    return !dismissed || !!hero.parentNode;
  }
  function pinToTop() {
    if (desktop.matches) {
      if (content.scrollTop !== 0) content.scrollTop = 0;
    } else if (window.pageYOffset !== 0) {
      window.scrollTo(0, 0);
    }
  }
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    pinToTop();
    if (desktop.matches) sidebar.style.transform = "";
    hero.style.transform = "translateY(-100%)";
    window.setTimeout(function () {
      if (hero.parentNode) hero.parentNode.removeChild(hero);
    }, DURATION + 60);
  }

  // Hold the page at the top while the splash is live (covers wheel,
  // scrollbar drags, touch and any programmatic scroll).
  content.addEventListener("scroll", function () {
    if (heroLive()) pinToTop();
  }, { passive: true });
  window.addEventListener("scroll", function () {
    if (heroLive()) pinToTop();
  }, { passive: true });

  // The first downward scroll intent dismisses the splash.
  window.addEventListener("wheel", function (e) {
    if (!heroLive()) return;
    if (e.deltaY > 0) {
      e.preventDefault();
      dismiss();
    }
  }, { passive: false });

  var touchStartY = null;
  window.addEventListener("touchstart", function (e) {
    if (heroLive()) touchStartY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener("touchmove", function (e) {
    if (!heroLive()) return;
    e.preventDefault();
    if (touchStartY !== null && touchStartY - e.touches[0].clientY > 24) dismiss();
  }, { passive: false });

  window.addEventListener("keydown", function (e) {
    if (!heroLive()) return;
    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
      e.preventDefault();
      dismiss();
    }
  });

  var cue = hero.querySelector(".home-hero__cue");
  if (cue) {
    cue.addEventListener("click", function (e) {
      e.preventDefault();
      dismiss();
    });
  }

  if (desktop.matches) sidebar.style.transform = "translateX(-100%)";
})();
