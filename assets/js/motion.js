(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const spotlight = document.querySelector(".spotlight");

  if (spotlight) {
    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      spotlight.style.setProperty("--spot-x", `${x}px`);
      spotlight.style.setProperty("--spot-y", `${y}px`);
    };
    const onMove = (event) => {
      if (reduced.matches || !finePointer.matches) return;
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
  }

  document.addEventListener(
    "pointermove",
    (event) => {
      if (!finePointer.matches) return;
      const tile = event.target.closest && event.target.closest(".tile");
      if (!tile) return;
      const rect = tile.getBoundingClientRect();
      tile.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      tile.style.setProperty("--my", `${event.clientY - rect.top}px`);
    },
    { passive: true }
  );

  const root = document.documentElement;
  let hideTimer = 0;
  let nearEdge = false;
  const showScrollbar = () => {
    root.classList.add("is-scrolling");
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      if (!nearEdge) root.classList.remove("is-scrolling");
    }, 900);
  };
  document.addEventListener("scroll", showScrollbar, { capture: true, passive: true });
  window.addEventListener(
    "pointermove",
    (event) => {
      if (!finePointer.matches) return;
      const edge = event.clientX >= root.clientWidth - 16;
      if (edge === nearEdge) return;
      nearEdge = edge;
      if (edge) {
        window.clearTimeout(hideTimer);
        root.classList.add("is-scrolling");
      } else {
        showScrollbar();
      }
    },
    { passive: true }
  );

  const reveal = (el) => el.classList.add("is-revealed");
  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              reveal(entry.target);
              observer.unobserve(entry.target);
            });
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
        )
      : null;

  function scan() {
    const pending = document.querySelectorAll("[data-reveal]:not(.is-revealed):not([data-reveal-bound])");
    pending.forEach((el) => {
      el.setAttribute("data-reveal-bound", "");
      if (el.parentElement) {
        const siblings = Array.from(el.parentElement.children).filter((child) => child.hasAttribute("data-reveal"));
        el.style.setProperty("--reveal-i", String(Math.min(siblings.indexOf(el), 6)));
      }
      if (!observer || reduced.matches) reveal(el);
      else observer.observe(el);
    });
  }

  scan();
  document.addEventListener("site:content", () => requestAnimationFrame(scan));
})();
