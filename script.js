const message = document.querySelector("#message");
const messageCopy = document.querySelector("#message-copy");
const daughterMark = document.querySelector(".daughter-mark");
const ambient = document.querySelector("#ambient");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.documentElement.classList.add("is-ready");

const createAmbientParticles = () => {
  const fragment = document.createDocumentFragment();
  const particleCount = window.innerWidth <= 700 ? 12 : 20;

  for (let index = 0; index < particleCount; index += 1) {
    const particle = document.createElement("span");
    const redLight = index % 4 === 0;
    const size = 1 + (index % 3) * 0.45;

    particle.className = "ambient-particle";
    particle.style.setProperty("--particle-x", `${(index * 47 + 13) % 100}%`);
    particle.style.setProperty("--particle-y", `${(index * 67 + 19) % 100}%`);
    particle.style.setProperty("--particle-size", `${size}px`);
    particle.style.setProperty("--particle-color", redLight ? "rgb(178 83 94 / .7)" : "rgb(232 227 224 / .55)");
    particle.style.setProperty("--particle-glow", redLight ? "rgb(151 57 70 / .16)" : "rgb(240 235 232 / .08)");
    particle.style.setProperty("--particle-duration", `${11 + (index % 7) * 1.7}s`);
    particle.style.setProperty("--particle-delay", `${-((index * 1.9) % 14)}s`);
    particle.style.setProperty("--particle-drift-x", `${(index % 2 === 0 ? 1 : -1) * (8 + index % 9)}px`);
    particle.style.setProperty("--particle-opacity", `${0.12 + (index % 4) * 0.045}`);
    fragment.append(particle);
  }

  ambient.append(fragment);
};

const prepareMessage = () => {
  const originalText = messageCopy.textContent.trim();
  const words = originalText.match(/\S+|\s+/g) ?? [];
  const fragment = document.createDocumentFragment();
  let wordIndex = 0;

  messageCopy.setAttribute("aria-label", originalText);
  messageCopy.setAttribute("aria-live", "off");

  for (const token of words) {
    if (/^\s+$/.test(token)) {
      fragment.append(document.createTextNode(token));
      continue;
    }

    const word = document.createElement("span");
    const normalized = token.toLocaleLowerCase("es").replace(/[.,;:!?❤️]/g, "");
    word.className = "message-word";

    if (["bonita", "perfecta", "lindo", "gabriela"].includes(normalized)) {
      word.classList.add("is-highlight");
    }

    word.style.setProperty("--word-delay", `${Math.min(wordIndex * 24, 680)}ms`);
    word.setAttribute("aria-hidden", "true");
    word.textContent = token;
    fragment.append(word);
    wordIndex += 1;
  }

  messageCopy.replaceChildren(fragment);
  message.classList.add("is-prepared");
};

const revealMessage = () => {
  message.classList.add("is-visible");
};

const observeMessage = () => {
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealMessage();
    return;
  }

  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      revealMessage();
      observer.disconnect();
    }
  }, { threshold: 0.2, rootMargin: "0px 0px -6% 0px" });

  observer.observe(message);
};

createAmbientParticles();
prepareMessage();
observeMessage();

if (!reducedMotion.matches) {
  let scrollFrame = 0;

  window.addEventListener("scroll", () => {
    if (scrollFrame) {
      return;
    }

    scrollFrame = window.requestAnimationFrame(() => {
      const offset = -Math.min(window.scrollY * 0.012, 8);
      daughterMark.style.setProperty("--scroll-parallax-y", `${offset}px`);
      scrollFrame = 0;
    });
  }, { passive: true });

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let pointerFrame = 0;

    document.addEventListener("pointermove", event => {
      if (pointerFrame) {
        return;
      }

      pointerFrame = window.requestAnimationFrame(() => {
        const lightX = `${(event.clientX / window.innerWidth) * 100}%`;
        const lightY = `${(event.clientY / window.innerHeight) * 100}%`;
        ambient.style.setProperty("--light-x", lightX);
        ambient.style.setProperty("--light-y", lightY);

        const bounds = daughterMark.getBoundingClientRect();
        const relativeX = ((event.clientX - bounds.left) / bounds.width) * 100;
        const relativeY = ((event.clientY - bounds.top) / bounds.height) * 100;
        const insideMark = relativeX >= 0 && relativeX <= 100 && relativeY >= 0 && relativeY <= 100;

        daughterMark.style.setProperty("--hover-x", `${relativeX}%`);
        daughterMark.style.setProperty("--hover-y", `${relativeY}%`);
        daughterMark.style.setProperty("--parallax-x", insideMark ? `${((relativeX - 50) / 50) * 3}px` : "0px");
        daughterMark.style.setProperty("--parallax-y", insideMark ? `${((relativeY - 50) / 50) * 3}px` : "0px");
        pointerFrame = 0;
      });
    }, { passive: true });

    daughterMark.addEventListener("pointerleave", () => {
      daughterMark.style.setProperty("--parallax-x", "0px");
      daughterMark.style.setProperty("--parallax-y", "0px");
    });
  }
}
