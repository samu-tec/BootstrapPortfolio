// Escena 3D ligera renderizada en Canvas 2D: un icosaedro rotando con
// partículas orbitando a su alrededor. Sin dependencias. Hace throttle a
// ~71fps, pausa cuando la pestaña no es visible y respeta prefers-reduced
// -motion. En móvil baja DPR y reduce partículas; en hover muy limitado se
// desactiva entero desde main.js.

// 12 vértices canónicos del icosaedro usando el número áureo phi: las
// coordenadas (0, ±1, ±phi), (±1, ±phi, 0), (±phi, 0, ±1) producen un
// poliedro regular con todas las aristas de longitud 2.
const ICOSAHEDRON_VERTICES = (() => {
  const phi = (1 + Math.sqrt(5)) / 2;
  return [
    [0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi],
    [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0],
    [phi, 0, 1], [-phi, 0, 1], [phi, 0, -1], [-phi, 0, -1]
  ].map(([x, y, z]) => ({ x, y, z }));
})();

// Aristas calculadas por distancia: dos vértices conectados están a
// longitud 2 (la arista canónica). Tolerancia 0.01 para errores de float.
const ICOSAHEDRON_EDGES = (() => {
  const edges = [];
  const target = 2;
  for (let i = 0; i < ICOSAHEDRON_VERTICES.length; i += 1) {
    for (let j = i + 1; j < ICOSAHEDRON_VERTICES.length; j += 1) {
      const a = ICOSAHEDRON_VERTICES[i];
      const b = ICOSAHEDRON_VERTICES[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
      if (d < target + 0.01) {
        edges.push([i, j]);
      }
    }
  }
  return edges;
})();

export function initHeroScene(canvas) {
  if (!canvas || typeof window === "undefined") {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileMedia = window.matchMedia("(max-width: 760px)");
  const hoverMedia = window.matchMedia("(hover: hover)");

  let isMobile = mobileMedia.matches;
  let canHover = hoverMedia.matches;
  let dprCap = isMobile ? 1 : 1.5;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = null;
  let running = false;
  let mouseX = 0;
  let mouseY = 0;
  let smoothMouseX = 0;
  let smoothMouseY = 0;
  let lastFrameTime = 0;

  const orbitalCount = isMobile ? 22 : 44;
  const orbitals = [];
  for (let i = 0; i < orbitalCount; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 2.7 + Math.random() * 1.6;
    orbitals.push({
      theta,
      phi,
      radius,
      yOffset: (Math.random() - 0.5) * 1.4,
      speed: 0.00018 + Math.random() * 0.00045,
      twinkle: Math.random() * Math.PI * 2
    });
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }
    isMobile = mobileMedia.matches;
    dprCap = isMobile ? 1 : 1.5;
    dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Rotaciones de Euler aplicadas en orden X -> Y -> Z. Cada bloque sustituye
  // dos coordenadas con las versiones rotadas por matriz 2D del plano que toca.
  function rotate(p, ax, ay, az) {
    let { x, y, z } = p;
    const cx1 = Math.cos(ax);
    const sx1 = Math.sin(ax);
    const ny = y * cx1 - z * sx1;
    const nz1 = y * sx1 + z * cx1;
    y = ny;
    z = nz1;
    const cy1 = Math.cos(ay);
    const sy1 = Math.sin(ay);
    const nx = x * cy1 + z * sy1;
    const nz2 = -x * sy1 + z * cy1;
    x = nx;
    z = nz2;
    const cz1 = Math.cos(az);
    const sz1 = Math.sin(az);
    const nnx = x * cz1 - y * sz1;
    const nny = x * sz1 + y * cz1;
    return { x: nnx, y: nny, z };
  }

  // Proyección de perspectiva sencilla: factor = fov / (fov + z) hace que
  // los puntos lejanos (z alto) se vean más pequeños. baseScale ajusta el
  // tamaño visual al lado más corto del canvas para que escale con la caja.
  function project(p) {
    const baseScale = Math.min(width, height) * 0.21;
    const fov = 6;
    const factor = fov / (fov + p.z);
    const offsetX = canHover ? smoothMouseX * 22 : 0;
    const offsetY = canHover ? smoothMouseY * 14 : 0;
    return {
      x: width / 2 + p.x * baseScale * factor + offsetX * factor,
      y: height / 2 + p.y * baseScale * factor + offsetY * factor,
      depth: factor
    };
  }

  function draw(time) {
    if (width <= 0 || height <= 0) {
      return;
    }

    smoothMouseX += (mouseX - smoothMouseX) * 0.05;
    smoothMouseY += (mouseY - smoothMouseY) * 0.05;

    ctx.clearRect(0, 0, width, height);

    const t = time * 0.001;
    const rotX = Math.sin(t * 0.18) * 0.25 + (canHover ? smoothMouseY * 0.18 : 0);
    const rotY = t * 0.22 + (canHover ? smoothMouseX * 0.32 : 0);
    const rotZ = Math.cos(t * 0.12) * 0.18;

    const radial = ctx.createRadialGradient(
      width / 2 + (canHover ? smoothMouseX * 18 : 0),
      height * 0.45 + (canHover ? smoothMouseY * 12 : 0),
      0,
      width / 2,
      height * 0.55,
      Math.max(width, height) * 0.62
    );
    radial.addColorStop(0, "rgba(255, 122, 24, 0.32)");
    radial.addColorStop(0.42, "rgba(255, 122, 24, 0.07)");
    radial.addColorStop(1, "rgba(255, 122, 24, 0)");
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    const transformed = ICOSAHEDRON_VERTICES.map((v) => {
      const r = rotate(v, rotX, rotY, rotZ);
      const p = project(r);
      return { ...r, ...p };
    });

    ctx.lineCap = "round";
    for (const [a, b] of ICOSAHEDRON_EDGES) {
      const va = transformed[a];
      const vb = transformed[b];
      const avgZ = (va.z + vb.z) / 2;
      const depth = clamp((avgZ + 2.2) / 4.4, 0, 1);
      const alpha = 0.18 + depth * 0.55;
      const grad = ctx.createLinearGradient(va.x, va.y, vb.x, vb.y);
      grad.addColorStop(0, `rgba(255, 180, 94, ${alpha})`);
      grad.addColorStop(1, `rgba(255, 122, 24, ${alpha * 0.85})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.55 + depth * 0.95;
      ctx.beginPath();
      ctx.moveTo(va.x, va.y);
      ctx.lineTo(vb.x, vb.y);
      ctx.stroke();
    }

    for (const v of transformed) {
      const depth = clamp((v.z + 2.2) / 4.4, 0, 1);
      const r = 2.2 + depth * 2.6;
      const glow = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, r * 4.5);
      glow.addColorStop(0, `rgba(255, 122, 24, ${0.32 * depth + 0.04})`);
      glow.addColorStop(1, "rgba(255, 122, 24, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(v.x, v.y, r * 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 226, 188, ${0.55 + depth * 0.4})`;
      ctx.beginPath();
      ctx.arc(v.x, v.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const orb of orbitals) {
      const angle = orb.theta + time * orb.speed;
      const x = Math.sin(orb.phi) * Math.cos(angle) * orb.radius;
      const z = Math.sin(orb.phi) * Math.sin(angle) * orb.radius;
      const y = Math.cos(orb.phi) * orb.radius * 0.6 + orb.yOffset;
      const r = rotate({ x, y, z }, rotX * 0.6, rotY * 0.7, rotZ * 0.5);
      const p = project(r);
      const depth = clamp((r.z + 2.6) / 5.2, 0, 1);
      const twinkle = (Math.sin(time * 0.0028 + orb.twinkle) + 1) * 0.5;
      const radius = 0.9 + depth * 1.6;
      ctx.fillStyle = `rgba(255, 234, 210, ${0.18 + depth * 0.42 + twinkle * 0.15})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Cap a ~71fps (14ms entre frames). En pantallas a 120Hz evita gastar
  // batería sin aportar fluidez extra a la escena (que ya se ve estable).
  function frame(time) {
    if (!running) {
      return;
    }
    if (time - lastFrameTime >= 14) {
      draw(time);
      lastFrameTime = time;
    }
    rafId = window.requestAnimationFrame(frame);
  }

  function start() {
    if (running) {
      return;
    }
    running = true;
    lastFrameTime = 0;
    rafId = window.requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function handleMouseMove(event) {
    if (!canHover) {
      return;
    }
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    mouseX = (event.clientX / w - 0.5) * 2;
    mouseY = (event.clientY / h - 0.5) * 2;
  }

  function handleMouseLeave() {
    mouseX = 0;
    mouseY = 0;
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  }

  function handleMotionChange() {
    if (motionMedia.matches) {
      stop();
      resize();
      draw(0);
    } else {
      start();
    }
  }

  function handleHoverChange() {
    canHover = hoverMedia.matches;
    if (!canHover) {
      mouseX = 0;
      mouseY = 0;
    }
  }

  resize();

  if (motionMedia.matches) {
    draw(0);
  } else {
    start();
  }

  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (motionMedia.matches) {
      draw(performance.now());
    }
  });
  resizeObserver.observe(canvas);

  window.addEventListener("mousemove", handleMouseMove, { passive: true });
  window.addEventListener("mouseleave", handleMouseLeave);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  motionMedia.addEventListener?.("change", handleMotionChange);
  hoverMedia.addEventListener?.("change", handleHoverChange);
}

function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
