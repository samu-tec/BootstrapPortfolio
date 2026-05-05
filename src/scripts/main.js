import { initHeroScene } from "./hero-scene.js";
import { initReveal, initTilt, initParallaxBackdrop, initFloatingTags } from "./animations.js";
import { initCopyEmail } from "./copy-email.js";

document.documentElement.classList.add("has-js");
document.documentElement.classList.add("js-enabled");

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

const revealItems = document.querySelectorAll(".reveal");
initReveal(revealItems);

const tiltCards = document.querySelectorAll("[data-tilt]");
initTilt(tiltCards);

initParallaxBackdrop(document.querySelector("[data-parallax-root]"));

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
