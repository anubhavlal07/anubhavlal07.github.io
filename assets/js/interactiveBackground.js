/*=============== INTERACTIVE BACKGROUND ===============*/
/**
 * A lightweight, dependency-free animated background that reacts to mouse
 * movement and automatically re-tints itself to match the active theme.
 *
 * Two stacked, non-interactive canvases sit behind all page content:
 *
 *  1. AURORA  (`.interactiveBg`, z-index -2, low-res + CSS blur)
 *     Soft blobs drift gently and parallax toward the cursor, plus a highlight
 *     blob that follows the mouse directly.
 *
 *  2. PARTICLES  (`.particlesBg`, z-index -1, full-res, crisp)
 *     Floating dots drift slowly and link to nearby neighbours ("constellation").
 *     The cursor pushes particles aside and nearby dots stretch a line toward it.
 *
 * Both layers derive their colour from the site's `--first-color` CSS variable,
 * so the effect always matches the current (dark / light) theme. A
 * MutationObserver on <body> picks up theme toggles and cross-fades the palette.
 *
 * Everything shares one requestAnimationFrame loop and one pointer state. The
 * loop pauses while the tab is hidden, and `prefers-reduced-motion` disables all
 * motion (one static frame, no mouse tracking).
 */
(function () {
  "use strict";

  if (!document.createElement("canvas").getContext) return; // Ancient browser.

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /*=============== CANVAS SETUP ===============*/
  const makeCanvas = (className) => {
    const c = document.createElement("canvas");
    c.className = className;
    c.setAttribute("aria-hidden", "true");
    document.body.insertBefore(c, document.body.firstChild);
    return c;
  };

  // Particles inserted first, then aurora before it, so aurora ends up as the
  // very first child (painted first / furthest back). z-index in CSS is the
  // real guarantee; DOM order is just tidy.
  const pCanvas = makeCanvas("particlesBg");
  const aCanvas = makeCanvas("interactiveBg");
  const actx = aCanvas.getContext("2d");
  const pctx = pCanvas.getContext("2d");

  // Aurora is soft, so it renders at a fraction of CSS resolution and upscales.
  const RENDER_SCALE = 0.45;
  // Particles must stay crisp, so they use the real device pixel ratio (capped).
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  let width = 0;
  let height = 0;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;

    aCanvas.width = Math.max(1, Math.round(width * RENDER_SCALE));
    aCanvas.height = Math.max(1, Math.round(height * RENDER_SCALE));

    pCanvas.width = Math.max(1, Math.round(width * DPR));
    pCanvas.height = Math.max(1, Math.round(height * DPR));
    pctx.setTransform(DPR, 0, 0, DPR, 0, 0); // Draw in CSS pixels.
  };
  resize();

  /*=============== THEME COLOUR HANDLING ===============*/
  // Parse "hsl(213, 89%, 54%)" -> [h, s, l].
  const parseHsl = (value) => {
    const m = value.match(/hsla?\(([^)]+)\)/i);
    if (!m) return null;
    const p = m[1].split(",").map((n) => parseFloat(n));
    return Number.isNaN(p[0]) ? null : [p[0], p[1], p[2]];
  };

  const readAccent = () =>
    parseHsl(
      getComputedStyle(document.body).getPropertyValue("--first-color").trim()
    ) || [213, 89, 54];

  const isDark = () => document.body.classList.contains("dark-theme");

  // Eased current palette -> target palette (cross-fades on theme switch).
  let currentAccent = readAccent();
  let targetAccent = currentAccent.slice();

  /*=============== AURORA BLOBS ===============*/
  const HUE_OFFSETS = [-14, 0, 13, -7];
  const isSmall = Math.min(width, height) < 640;
  const BLOB_COUNT = isSmall ? 3 : HUE_OFFSETS.length;

  const blobs = [];
  for (let i = 0; i < BLOB_COUNT; i++) {
    blobs.push({
      hueOffset: HUE_OFFSETS[i % HUE_OFFSETS.length],
      baseX: 0.15 + 0.7 * Math.random(),
      baseY: 0.12 + 0.76 * Math.random(),
      phase: Math.random() * Math.PI * 2,
      speed: 0.05 + Math.random() * 0.06,
      driftX: 0.04 + Math.random() * 0.05,
      driftY: 0.05 + Math.random() * 0.06,
      depth: 0.03 + Math.random() * 0.06,
      radius: 0.34 + Math.random() * 0.24,
    });
  }

  /*=============== PARTICLES ===============*/
  const LINK_DIST = 120; // Max distance to draw a line between two particles.
  const CURSOR_LINK = 170; // Max distance to draw a line to the cursor.
  const REPEL_DIST = 130; // Radius the cursor pushes particles out of.
  const REPEL_FORCE = 3.2; // Push strength (px per frame at the centre).

  const particleCount = () => {
    const target = Math.round((width * height) / 16000);
    return Math.max(28, Math.min(isSmall ? 46 : 108, target));
  };

  const particles = [];
  for (let i = 0, n = particleCount(); i < n; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28, // slow ambient drift
      vy: (Math.random() - 0.5) * 0.28,
      r: 0.7 + Math.random() * 1.7,
    });
  }

  /*=============== POINTER ===============*/
  // x/y are eased (used by the aurora); tx/ty are the raw targets (used by the
  // snappier particle interactions).
  const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: false };

  if (!prefersReducedMotion) {
    window.addEventListener(
      "pointermove",
      (e) => {
        pointer.tx = e.clientX / width;
        pointer.ty = e.clientY / height;
        pointer.active = true;
      },
      { passive: true }
    );
    // On touch end / mouse leave, stop the cursor interaction.
    window.addEventListener("pointerout", (e) => {
      if (!e.relatedTarget) pointer.active = false;
    });
  }

  /*=============== AURORA DRAW ===============*/
  const paintBlob = (cx, cy, r, hue, s, l, alpha) => {
    const grad = actx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, `hsla(${hue}, ${s}%, ${l}%, ${alpha})`);
    grad.addColorStop(1, `hsla(${hue}, ${s}%, ${l}%, 0)`);
    actx.fillStyle = grad;
    actx.beginPath();
    actx.arc(cx, cy, r, 0, Math.PI * 2);
    actx.fill();
  };

  const drawAurora = (t) => {
    actx.clearRect(0, 0, aCanvas.width, aCanvas.height);

    const [h, s, l] = currentAccent;
    const dark = isDark();
    const centerAlpha = dark ? 0.2 : 0.14;
    const maxDim = Math.max(aCanvas.width, aCanvas.height);

    for (const b of blobs) {
      const dx = Math.cos(t * b.speed + b.phase) * b.driftX;
      const dy = Math.sin(t * b.speed + b.phase) * b.driftY;
      const px = (pointer.x - 0.5) * b.depth * 2;
      const py = (pointer.y - 0.5) * b.depth * 2;
      const cx = (b.baseX + dx + px) * aCanvas.width;
      const cy = (b.baseY + dy + py) * aCanvas.height;
      paintBlob(cx, cy, b.radius * maxDim, h + b.hueOffset, s, l, centerAlpha);
    }

    if (pointer.active && !prefersReducedMotion) {
      paintBlob(
        pointer.x * aCanvas.width,
        pointer.y * aCanvas.height,
        0.4 * maxDim,
        h,
        s,
        l,
        dark ? 0.16 : 0.11
      );
    }
  };

  /*=============== PARTICLES STEP + DRAW ===============*/
  const stepParticles = () => {
    const mx = pointer.tx * width;
    const my = pointer.ty * height;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around the edges for a seamless field.
      if (p.x < -5) p.x = width + 5;
      else if (p.x > width + 5) p.x = -5;
      if (p.y < -5) p.y = height + 5;
      else if (p.y > height + 5) p.y = -5;

      // The cursor pushes particles out of a bubble around it.
      if (pointer.active) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d = Math.hypot(dx, dy);
        if (d > 0.01 && d < REPEL_DIST) {
          const f = (1 - d / REPEL_DIST) * REPEL_FORCE;
          p.x += (dx / d) * f;
          p.y += (dy / d) * f;
        }
      }
    }
  };

  const drawParticles = () => {
    pctx.clearRect(0, 0, width, height);

    const dark = isDark();
    const [h, s, lRaw] = currentAccent;
    // The bright azure accent barely shows on the near-white light background,
    // so in light mode particles use a deeper, more opaque blue for contrast.
    const l = dark ? lRaw : Math.min(lRaw, 42);
    const dotAlpha = dark ? 0.55 : 0.72;
    const lineAlpha = dark ? 0.22 : 0.32;
    const cursorLineAlpha = dark ? 0.4 : 0.55;
    const stroke = `${h}, ${s}%, ${l}%`;

    // Constellation links between nearby particles.
    pctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK_DIST) {
          const fade = (1 - d / LINK_DIST) * lineAlpha;
          pctx.strokeStyle = `hsla(${stroke}, ${fade})`;
          pctx.beginPath();
          pctx.moveTo(a.x, a.y);
          pctx.lineTo(b.x, b.y);
          pctx.stroke();
        }
      }
    }

    // Lines reaching toward the cursor.
    if (pointer.active) {
      const mx = pointer.tx * width;
      const my = pointer.ty * height;
      for (const p of particles) {
        const d = Math.hypot(p.x - mx, p.y - my);
        if (d < CURSOR_LINK) {
          const fade = (1 - d / CURSOR_LINK) * cursorLineAlpha;
          pctx.strokeStyle = `hsla(${stroke}, ${fade})`;
          pctx.beginPath();
          pctx.moveTo(p.x, p.y);
          pctx.lineTo(mx, my);
          pctx.stroke();
        }
      }
    }

    // The dots themselves (drawn last so they sit on top of the links).
    pctx.fillStyle = `hsla(${stroke}, ${dotAlpha})`;
    for (const p of particles) {
      pctx.beginPath();
      pctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pctx.fill();
    }
  };

  /*=============== LOOP ===============*/
  let rafId = null;

  const loop = (now) => {
    const t = now / 1000;
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    for (let i = 0; i < 3; i++) {
      currentAccent[i] += (targetAccent[i] - currentAccent[i]) * 0.08;
    }
    drawAurora(t);
    stepParticles();
    drawParticles();
    rafId = requestAnimationFrame(loop);
  };

  const start = () => {
    if (rafId == null) rafId = requestAnimationFrame(loop);
  };
  const stop = () => {
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const renderStatic = () => {
    drawAurora(0);
    drawParticles();
  };

  /*=============== EVENTS ===============*/
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      // Keep particles inside the new viewport.
      for (const p of particles) {
        if (p.x > width) p.x = Math.random() * width;
        if (p.y > height) p.y = Math.random() * height;
      }
      if (prefersReducedMotion) renderStatic();
    }, 150);
  });

  // Re-tint when the user toggles the theme (body `dark-theme` class changes).
  const observer = new MutationObserver(() => {
    targetAccent = readAccent();
    if (prefersReducedMotion) {
      currentAccent = targetAccent.slice();
      renderStatic();
    }
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });

  // Pause the loop while the tab is hidden to save the battery.
  document.addEventListener("visibilitychange", () => {
    if (prefersReducedMotion) return;
    document.hidden ? stop() : start();
  });

  /*=============== GO ===============*/
  if (prefersReducedMotion) {
    renderStatic(); // Single static frame, no animation.
  } else {
    start();
  }
})();
