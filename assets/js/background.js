(() => {
  const canvas = document.getElementById("bg-field");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const root = document.documentElement;

  const GAP = 26;
  const RADIUS = 210;
  const PUSH = 10;
  const RIPPLE_SPEED = 0.9;
  const RIPPLE_LIFE = 1300;
  const RIPPLE_BAND = 70;

  const base = document.createElement("canvas");
  const baseCtx = base.getContext("2d");

  let width = 0;
  let height = 0;
  let dpr = 1;
  let cols = 0;
  let rows = 0;
  let offsetX = 0;
  let offsetY = 0;
  let dot = [255, 255, 255, 0.08];
  let accent = [107, 140, 255];
  let peak = 0.6;

  const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, strength: 0, target: 0 };
  const ripples = [];
  let frame = 0;

  function parseColor(value, fallback) {
    const probe = document.createElement("span");
    probe.style.color = value;
    probe.style.display = "none";
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    const match = resolved.match(/rgba?\(([^)]+)\)/);
    if (!match) return fallback;
    const parts = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return [parts[0], parts[1], parts[2], parts[3] === undefined ? 1 : parts[3]];
  }

  function readTheme() {
    const styles = getComputedStyle(root);
    dot = parseColor(styles.getPropertyValue("--dot").trim() || "rgba(255,255,255,0.08)", dot);
    const a = parseColor(styles.getPropertyValue("--accent").trim() || "#6b8cff", [107, 140, 255, 1]);
    accent = [a[0], a[1], a[2]];
    peak = root.dataset.theme === "dark" ? 0.95 : 0.8;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    base.width = canvas.width;
    base.height = canvas.height;
    cols = Math.ceil(width / GAP) + 1;
    rows = Math.ceil(height / GAP) + 1;
    offsetX = Math.round(((width % GAP) / 2) + GAP / 2) - GAP;
    offsetY = Math.round(GAP / 2);
    paintBase();
    draw();
  }

  function paintBase() {
    baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    baseCtx.clearRect(0, 0, width, height);
    baseCtx.fillStyle = `rgba(${dot[0]},${dot[1]},${dot[2]},${dot[3]})`;
    for (let r = 0; r < rows; r += 1) {
      const y = offsetY + r * GAP;
      for (let c = 0; c < cols; c += 1) {
        baseCtx.fillRect(offsetX + c * GAP - 0.75, y - 0.75, 1.5, 1.5);
      }
    }
  }

  function rippleBoost(x, y, now) {
    let boost = 0;
    for (let i = 0; i < ripples.length; i += 1) {
      const ripple = ripples[i];
      const age = now - ripple.t;
      const ring = age * RIPPLE_SPEED;
      const d = Math.hypot(x - ripple.x, y - ripple.y);
      const delta = Math.abs(d - ring);
      if (delta < RIPPLE_BAND) {
        const fade = 1 - age / RIPPLE_LIFE;
        boost = Math.max(boost, (1 - delta / RIPPLE_BAND) * fade);
      }
    }
    return boost;
  }

  function drawDot(x, y, influence) {
    const alpha = dot[3] + (peak - dot[3]) * influence;
    const r = Math.round(dot[0] + (accent[0] - dot[0]) * influence);
    const g = Math.round(dot[1] + (accent[1] - dot[1]) * influence);
    const b = Math.round(dot[2] + (accent[2] - dot[2]) * influence);
    const size = 1.5 + influence * 1.9;
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }

  function draw(now = performance.now()) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(base, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const active = pointer.strength > 0.01;
    const rippling = ripples.length > 0;
    if (!active && !rippling) return;

    let c0 = 0;
    let c1 = cols - 1;
    let r0 = 0;
    let r1 = rows - 1;
    if (!rippling) {
      c0 = Math.max(0, Math.floor((pointer.x - RADIUS - offsetX) / GAP));
      c1 = Math.min(cols - 1, Math.ceil((pointer.x + RADIUS - offsetX) / GAP));
      r0 = Math.max(0, Math.floor((pointer.y - RADIUS - offsetY) / GAP));
      r1 = Math.min(rows - 1, Math.ceil((pointer.y + RADIUS - offsetY) / GAP));
      ctx.clearRect(offsetX + c0 * GAP - GAP / 2, offsetY + r0 * GAP - GAP / 2, (c1 - c0 + 1) * GAP, (r1 - r0 + 1) * GAP);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    for (let r = r0; r <= r1; r += 1) {
      const y = offsetY + r * GAP;
      for (let c = c0; c <= c1; c += 1) {
        const x = offsetX + c * GAP;
        let influence = 0;
        let px = x;
        let py = y;
        if (active) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < RADIUS) {
            const t = 1 - d / RADIUS;
            influence = t * t * pointer.strength;
            if (d > 0.001) {
              px += (dx / d) * PUSH * influence;
              py += (dy / d) * PUSH * influence;
            }
          }
        }
        if (rippling) influence = Math.max(influence, rippleBoost(x, y, now) * 0.9);
        drawDot(px, py, Math.min(1, influence));
      }
    }
  }

  function tick(now) {
    frame = 0;
    pointer.x += (pointer.tx - pointer.x) * 0.22;
    pointer.y += (pointer.ty - pointer.y) * 0.22;
    pointer.strength += (pointer.target - pointer.strength) * 0.12;
    for (let i = ripples.length - 1; i >= 0; i -= 1) {
      if (now - ripples[i].t > RIPPLE_LIFE) ripples.splice(i, 1);
    }
    draw(now);
    const settling =
      Math.abs(pointer.tx - pointer.x) > 0.3 ||
      Math.abs(pointer.ty - pointer.y) > 0.3 ||
      Math.abs(pointer.target - pointer.strength) > 0.01;
    if ((settling || ripples.length) && !document.hidden) schedule();
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(tick);
  }

  function onMove(event) {
    if (reduced.matches || !finePointer.matches || event.pointerType === "touch") return;
    if (pointer.strength < 0.02) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }
    pointer.tx = event.clientX;
    pointer.ty = event.clientY;
    pointer.target = 1;
    schedule();
  }

  function onLeave() {
    pointer.target = 0;
    schedule();
  }

  function onDown(event) {
    if (reduced.matches) return;
    if (event.target.closest && event.target.closest("dialog, input, textarea")) return;
    ripples.push({ x: event.clientX, y: event.clientY, t: performance.now() });
    if (ripples.length > 4) ripples.shift();
    schedule();
  }

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 120);
  });
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  window.addEventListener("blur", onLeave);

  new MutationObserver(() => {
    readTheme();
    paintBase();
    draw();
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  readTheme();
  resize();
})();
