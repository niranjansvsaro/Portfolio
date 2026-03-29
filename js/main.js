(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Loader ---------- */
  const loader = document.getElementById("loader");
  function hideLoader() {
    if (!loader) return;
    loader.classList.add("is-hidden");
    document.body.style.overflow = "";
  }
  document.body.style.overflow = "hidden";
  window.addEventListener("load", () => {
    setTimeout(hideLoader, prefersReducedMotion ? 200 : 550);
  });
  if (document.readyState === "complete") {
    setTimeout(hideLoader, prefersReducedMotion ? 200 : 550);
  }
  // Failsafe in case external resources delay the load event indefinitely
  setTimeout(hideLoader, 3000);

  /* ---------- Typing animation ---------- */
  const phrases = [
    "Full Stack Development",
    "Machine Learning",
    "Hackathons & Open Source",
    "Clean Architecture & DX",
    "System Design & Cloud",
  ];
  const typingEl = document.getElementById("typingText");
  const cursorEl = document.getElementById("typingCursor");

  function runTyping() {
    if (!typingEl || prefersReducedMotion) {
      if (typingEl) typingEl.textContent = phrases[0];
      if (cursorEl) cursorEl.style.display = "none";
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    const typeSpeed = 78;
    const deleteSpeed = 42;
    const pauseEnd = 2100;
    const pauseStart = 380;

    function tick() {
      const phrase = phrases[phraseIndex];
      if (!deleting) {
        typingEl.textContent = phrase.slice(0, charIndex + 1);
        charIndex++;
        if (charIndex === phrase.length) {
          setTimeout(() => {
            deleting = true;
            tick();
          }, pauseEnd);
          return;
        }
        setTimeout(tick, typeSpeed);
      } else {
        typingEl.textContent = phrase.slice(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(tick, pauseStart);
          return;
        }
        setTimeout(tick, deleteSpeed);
      }
    }

    tick();
  }

  runTyping();

  /* ---------- Parallax: grid + hero ---------- */
  const parallaxGrid = document.getElementById("parallaxGrid");
  const hero = document.getElementById("hero");
  const heroContent = document.getElementById("heroContent");

  function onScrollParallax() {
    if (prefersReducedMotion || !parallaxGrid) return;
    const y = window.scrollY;
    parallaxGrid.style.transform = `translate3d(0, ${y * 0.04}px, 0)`;
  }

  window.addEventListener("scroll", onScrollParallax, { passive: true });
  onScrollParallax();

  if (hero && heroContent && finePointer && !prefersReducedMotion) {
    hero.addEventListener(
      "mousemove",
      (e) => {
        const r = hero.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        heroContent.style.transform = `perspective(1200px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) translateZ(0)`;
      },
      { passive: true }
    );
    hero.addEventListener(
      "mouseleave",
      () => {
        heroContent.style.transform = "";
      },
      { passive: true }
    );
  }

  /* ---------- Vanilla Tilt ---------- */
  function initTilt() {
    if (typeof VanillaTilt === "undefined" || prefersReducedMotion || !finePointer) return;
    const defaults = {
      max: 14,
      speed: 600,
      glare: false,
      "max-glare": 0.15,
      scale: 1.02,
      gyroscope: false,
    };
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      const max = parseFloat(el.getAttribute("data-tilt-max"));
      const scale = parseFloat(el.getAttribute("data-tilt-scale"));
      const mg = el.getAttribute("data-tilt-max-glare");
      VanillaTilt.init(el, {
        max: Number.isFinite(max) ? max : defaults.max,
        speed: defaults.speed,
        glare: el.getAttribute("data-tilt-glare") === "true",
        "max-glare": mg != null && Number.isFinite(parseFloat(mg)) ? parseFloat(mg) : defaults["max-glare"],
        scale: Number.isFinite(scale) ? scale : defaults.scale,
        gyroscope: false,
      });
    });
  }

  initTilt();

  /* ---------- Sticky header + active nav ---------- */
  const header = document.getElementById("header");
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav__link[data-nav], .nav__logo[data-nav]");

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }

  function getActiveSection() {
    const scrollPos = window.scrollY + 120;
    let current = "";
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute("id") || "";
      }
    });
    return current;
  }

  function highlightNav() {
    const id = getActiveSection();
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.charAt(0) !== "#") return;
      const target = href.slice(1);
      link.classList.toggle("is-active", target === id);
    });
  }

  window.addEventListener(
    "scroll",
    () => {
      updateHeader();
      highlightNav();
    },
    { passive: true }
  );
  updateHeader();
  highlightNav();

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  function closeMenu() {
    navToggle?.classList.remove("is-open");
    navMenu?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  navToggle?.addEventListener("click", () => {
    const open = navMenu?.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", !!open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  });

  document.querySelectorAll(".nav__menu a").forEach((a) => {
    a.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 900px)").matches) closeMenu();
    });
  });

  /* ---------- Scroll reveal (Intersection Observer) ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && !prefersReducedMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.06 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const ownerEmail = "niranjansvsaro@gmail.com";

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("contactName")?.value.trim();
    const email = document.getElementById("contactEmail")?.value.trim();
    const message = document.getElementById("contactMessage")?.value.trim();

    if (!name || !email || !message) {
      if (formStatus) formStatus.textContent = "Please fill in all fields.";
      return;
    }

    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`From: ${name} <${email}>\n\n${message}`);
    const mailto = `mailto:${ownerEmail}?subject=${subject}&body=${body}`;
    if (formStatus) {
      formStatus.textContent = "Opening your email client…";
    }
    window.location.href = mailto;
    setTimeout(() => {
      if (formStatus) {
        formStatus.textContent = `If nothing opened, email ${ownerEmail} directly.`;
      }
    }, 900);
  });

  /* ---------- Certification Modal ---------- */
  const certLinks = document.querySelectorAll(".cert-list__link");
  const certModal = document.getElementById("certModal");
  const certModalImage = document.getElementById("certModalImage");
  const certModalOverlay = document.getElementById("certModalOverlay");

  if (certModal && certModalImage && certModalOverlay) {
    certLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href && href !== "#") {
          e.preventDefault();
          certModalImage.src = href;
          certModal.classList.add("is-open");
          document.body.style.overflow = "hidden";
        }
      });
    });

    const closeModal = () => {
      certModal.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(() => {
        certModalImage.src = "";
      }, 300);
    };

    certModalOverlay.addEventListener("click", closeModal);
    const certModalClose = document.getElementById("certModalClose");
    if (certModalClose) certModalClose.addEventListener("click", closeModal);
  }

})();
