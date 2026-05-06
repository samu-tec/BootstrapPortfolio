const TILT_MAX_X = 7;
const TILT_MAX_Y = 9;

export function initReveal(items) {
  if (!items.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.16 }
  );

  let groupIndex = 0;
  let lastParent = null;
  items.forEach((item) => {
    const parent = item.parentElement;
    if (parent !== lastParent) {
      groupIndex = 0;
      lastParent = parent;
    }
    item.style.setProperty("--reveal-delay", `${Math.min(groupIndex * 70, 320)}ms`);
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
    item.style.setProperty("--tag-float-delay", `${(index % 7) * 0.4}s`);
  });
}
