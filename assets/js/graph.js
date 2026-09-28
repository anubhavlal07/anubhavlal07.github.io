(() => {
  const canvas = document.getElementById("graph");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const MAX_NODES = 60;
  const PHONE_NODES = 24;
  const AREA_PER_NODE = 23000;
  const FRAME_MS = 1000 / 30;
  const POINTER_RADIUS = 170;
  const EDGE_GLOW = 0.32;
  const NODE_GLOW = 0.5;

  const xs = new Float32Array(MAX_NODES);
  const ys = new Float32Array(MAX_NODES);
  const vxs = new Float32Array(MAX_NODES);
  const vys = new Float32Array(MAX_NODES);
  const radii = new Float32Array(MAX_NODES);
  const glow = new Float32Array(MAX_NODES);

  const colors = { node: "rgba(20, 33, 61, 0.22)", edge: "rgba(20, 33, 61, 0.08)", trace: "#c98a1b" };
  const pointer = { x: -1e4, y: -1e4, active: false, strength: 0 };

  let count = 0;
  let width = 0;
  let height = 0;
  let linkDistance = 140;
  let linkDistanceSq = linkDistance * linkDistance;
  let frame = 0;
  let lastTime = 0;
  let resizeTimer = 0;

  function readColors() {
    const style = getComputedStyle(root);
    colors.node = style.getPropertyValue("--graph-node").trim() || colors.node;
    colors.edge = style.getPropertyValue("--graph-edge").trim() || colors.edge;
    colors.trace = style.getPropertyValue("--trace").trim() || colors.trace;
  }

  function seed(i) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.004 + Math.random() * 0.006;
    xs[i] = Math.random() * width;
    ys[i] = Math.random() * height;
    vxs[i] = Math.cos(angle) * speed;
    vys[i] = Math.sin(angle) * speed;
    radii[i] = Math.random() < 0.18 ? 2.4 : 1.5;
    glow[i] = 0;
  }

  function targetCount() {
    const cap = width < 600 ? PHONE_NODES : MAX_NODES;
    return Math.max(10, Math.min(cap, Math.round((width * height) / AREA_PER_NODE)));
  }

  function resize() {
    const nextWidth = window.innerWidth;
    const nextHeight = window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(nextWidth * dpr);
    canvas.height = Math.round(nextHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (width && height) {
      const sx = nextWidth / width;
      const sy = nextHeight / height;
      for (let i = 0; i < count; i++) {
        xs[i] *= sx;
        ys[i] *= sy;
      }
    }
    width = nextWidth;
    height = nextHeight;
    linkDistance = Math.min(180, Math.max(110, Math.sqrt(width * height) / 7));
    linkDistanceSq = linkDistance * linkDistance;
    const next = targetCount();
    for (let i = count; i < next; i++) seed(i);
    count = next;
    draw();
  }

  function step(dt) {
    for (let i = 0; i < count; i++) {
      let x = xs[i] + vxs[i] * dt;
      let y = ys[i] + vys[i] * dt;
      if (x < 0 || x > width) {
        vxs[i] = -vxs[i];
        x = x < 0 ? 0 : width;
      }
      if (y < 0 || y > height) {
        vys[i] = -vys[i];
        y = y < 0 ? 0 : height;
      }
      xs[i] = x;
      ys[i] = y;
    }

    const target = pointer.active ? 1 : 0;
    pointer.strength += (target - pointer.strength) * Math.min(1, dt / 180);
    if (pointer.strength < 0.005) pointer.strength = 0;

    for (let i = 0; i < count; i++) {
      if (pointer.strength === 0) {
        glow[i] = 0;
        continue;
      }
      const dx = xs[i] - pointer.x;
      const dy = ys[i] - pointer.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      glow[i] = d < POINTER_RADIUS ? (1 - d / POINTER_RADIUS) * pointer.strength : 0;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = colors.edge;
    let glowing = false;

    for (let i = 0; i < count; i++) {
      if (glow[i] > 0) glowing = true;
      const xi = xs[i];
      const yi = ys[i];
      for (let j = i + 1; j < count; j++) {
        const dx = xi - xs[j];
        const dy = yi - ys[j];
        const dSq = dx * dx + dy * dy;
        if (dSq > linkDistanceSq) continue;
        ctx.globalAlpha = 1 - dSq / linkDistanceSq;
        ctx.beginPath();
        ctx.moveTo(xi, yi);
        ctx.lineTo(xs[j], ys[j]);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.node;
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      ctx.moveTo(xs[i] + radii[i], ys[i]);
      ctx.arc(xs[i], ys[i], radii[i], 0, Math.PI * 2);
    }
    ctx.fill();

    if (glowing) {
      ctx.strokeStyle = colors.trace;
      ctx.fillStyle = colors.trace;
      for (let i = 0; i < count; i++) {
        const gi = glow[i];
        for (let j = i + 1; j < count; j++) {
          const gj = glow[j];
          if (gi === 0 && gj === 0) continue;
          const dx = xs[i] - xs[j];
          const dy = ys[i] - ys[j];
          const dSq = dx * dx + dy * dy;
          if (dSq > linkDistanceSq) continue;
          ctx.globalAlpha = (1 - dSq / linkDistanceSq) * (gi > gj ? gi : gj) * EDGE_GLOW;
          ctx.beginPath();
          ctx.moveTo(xs[i], ys[i]);
          ctx.lineTo(xs[j], ys[j]);
          ctx.stroke();
        }
        if (gi > 0) {
          ctx.globalAlpha = gi * NODE_GLOW;
          ctx.beginPath();
          ctx.arc(xs[i], ys[i], radii[i] + 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  function tick(time) {
    frame = window.requestAnimationFrame(tick);
    const elapsed = time - lastTime;
    if (elapsed < FRAME_MS) return;
    lastTime = time;
    step(Math.min(elapsed, 80));
    draw();
  }

  function start() {
    if (frame || document.hidden || reducedMotion.matches) return;
    lastTime = performance.now();
    frame = window.requestAnimationFrame(tick);
  }

  function stop() {
    if (!frame) return;
    window.cancelAnimationFrame(frame);
    frame = 0;
  }

  function refreshMotion() {
    if (reducedMotion.matches) {
      stop();
      pointer.active = false;
      pointer.strength = 0;
      glow.fill(0);
      draw();
    } else {
      start();
    }
  }

  function onPointer(event) {
    if (reducedMotion.matches) return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }

  function onPointerEnd(event) {
    if (event.pointerType !== "mouse") pointer.active = false;
  }

  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("pointerdown", onPointer, { passive: true });
  window.addEventListener("pointerup", onPointerEnd, { passive: true });
  window.addEventListener("pointercancel", onPointerEnd, { passive: true });
  document.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) pointer.active = false;
  });
  window.addEventListener("blur", () => { pointer.active = false; });

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 150);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", refreshMotion);
  else if (reducedMotion.addListener) reducedMotion.addListener(refreshMotion);

  new MutationObserver(() => {
    readColors();
    draw();
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  readColors();
  resize();
  refreshMotion();
})();
