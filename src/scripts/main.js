// Entry point del cliente: arranca hero canvas, reveal scroll, tilt 3D,
// floating tags, copia de correo y el toggle de la nav móvil.

import { initHeroScene } from "./hero-scene.js";
import { initReveal, initTilt, initFloatingTags } from "./animations.js";
import { initCopyEmail } from "./copy-email.js";

// La clase has-js permite al CSS condicionar estilos a que JS esté activo
// (por ejemplo, los reveals quedan visibles por defecto si JS falla).
document.documentElement.classList.add("has-js");

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

initReveal(document.querySelectorAll(".reveal"));
initTilt(document.querySelectorAll("[data-tilt]"));
document.querySelectorAll("[data-floating-tags]").forEach((list) => initFloatingTags(list));

const toast = document.querySelector(".toast");
const copyButtons = document.querySelectorAll("[data-copy-email]");
initCopyEmail(copyButtons, toast);

const heroCanvas = document.querySelector("[data-hero-canvas]");
if (heroCanvas) {
  const supportsCanvas = !!heroCanvas.getContext;
  const lowEnd = (navigator.hardwareConcurrency || 4) <= 2 || (navigator.deviceMemory || 8) <= 1;
  if (supportsCanvas && !lowEnd) {
    document.documentElement.classList.add("has-3d");
    initHeroScene(heroCanvas);
  } else {
    heroCanvas.classList.add("is-disabled");
  }
}
