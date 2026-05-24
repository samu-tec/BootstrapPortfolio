// Animaciones del cliente: reveal on-scroll vía IntersectionObserver,
// efecto tilt 3D en cards de proyecto, y stagger de delays para los tags
// flotantes. Las tres son independientes y los nombres exportados se
// pueden llamar por separado desde main.js.

const TILT_MAX_X = 7;
const TILT_MAX_Y = 9;
const REVEAL_DURATION_MS = 520;
const REVEAL_STAGGER_MS = 50;
const REVEAL_STAGGER_MAX_MS = 160;

export function initReveal(items) {
  if (!items.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible", "has-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          const revealDelay = Number.parseFloat(
            getComputedStyle(entry.target).getPropertyValue("--reveal-delay")
          ) || 0;
          // El margen extra (+80ms) garantiza que el transition haya
          // terminado antes de soltar will-change vía has-revealed.
          window.setTimeout(() => {
            entry.target.classList.add("has-revealed");
          }, revealDelay + REVEAL_DURATION_MS + 80);
          observer.unobserve(entry.target);
        }
      }
    },
    {
      rootMargin: "0px 0px -2% 0px",
      threshold: 0.12
    }
  );

  // Reseteamos el contador al cambiar de padre para que reveals de secciones
  // distintas no acumulen delay entre ellos. Dentro de un mismo grupo, cada
  // item suma un escalón hasta el tope para evitar cascadas demasiado largas.
  let groupIndex = 0;
  let lastParent = null;
  items.forEach((item) => {
    const parent = item.parentElement;
    if (parent !== lastParent) {
      groupIndex = 0;
      lastParent = parent;
    }
    item.style.setProperty("--reveal-delay", `${Math.min(groupIndex * REVEAL_STAGGER_MS, REVEAL_STAGGER_MAX_MS)}ms`);
    groupIndex += 1;
    observer.observe(item);
  });
}

export function initTilt(cards) {
  if (!cards.length) {
    return;
  }

  const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hoverMedia = window.matchMedia("(hover: hover) and (pointer: fine)");

  if (motionMedia.matches || !hoverMedia.matches) {
    return;
  }

  cards.forEach((card) => {
    let frameId = null;
    let pendingX = 0;
    let pendingY = 0;
    let pendingGX = 50;
    let pendingGY = 50;

    const apply = () => {
      card.style.setProperty("--tilt-x", `${pendingX}deg`);
      card.style.setProperty("--tilt-y", `${pendingY}deg`);
      card.style.setProperty("--glow-x", `${pendingGX}%`);
      card.style.setProperty("--glow-y", `${pendingGY}%`);
      frameId = null;
    };

    const onMove = (event) => {
      const rect = card.getBoundingClientRect();
      const xRatio = (event.clientX - rect.left) / rect.width;
      const yRatio = (event.clientY - rect.top) / rect.height;
      pendingY = (xRatio - 0.5) * TILT_MAX_Y * 2;
      pendingX = (0.5 - yRatio) * TILT_MAX_X * 2;
      pendingGX = xRatio * 100;
      pendingGY = yRatio * 100;
      if (frameId === null) {
        frameId = window.requestAnimationFrame(apply);
      }
    };

    const onEnter = () => {
      card.classList.add("is-tilting");
    };

    const onLeave = () => {
      pendingX = 0;
      pendingY = 0;
      pendingGX = 50;
      pendingGY = 50;
      if (frameId === null) {
        frameId = window.requestAnimationFrame(apply);
      }
      card.classList.remove("is-tilting");
    };

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseenter", onEnter);
    card.addEventListener("mouseleave", onLeave);
  });
}

export function initFloatingTags(list) {
  if (!list) {
    return;
  }
  const items = list.querySelectorAll("li");
  items.forEach((item, index) => {
    item.style.setProperty("--tag-index", String(index));
    // 7 buckets de 0.4s cubren el ciclo de 2.8s de tag-float; así los tags
    // suben y bajan desfasados sin sincronizarse en bloque.
    item.style.setProperty("--tag-float-delay", `${(index % 7) * 0.4}s`);
  });
}
