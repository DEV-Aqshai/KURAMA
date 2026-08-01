/* ============================================
   KURAMA — interactions
   ============================================ */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Loader ---------- */
  const loader = document.getElementById("loader");
  const loaderProgress = document.getElementById("loaderProgress");
  let progress = 0;
  const loaderInterval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loaderInterval);
      loaderProgress.style.transition = "width .25s ease";
      loaderProgress.style.width = "100%";
      setTimeout(() => {
        loader.classList.add("is-done");
        document.body.style.overflow = "";
        playHeroIntro();
      }, 280);
    } else {
      loaderProgress.style.transition = "width .3s ease";
      loaderProgress.style.width = progress + "%";
    }
  }, 160);
  document.body.style.overflow = "hidden";

  /* ---------- Custom cursor ---------- */
  const dot = document.getElementById("cursorDot");
  if (dot && matchMedia("(hover:hover)").matches) {
    window.addEventListener("pointermove", (e) => {
      dot.style.left = e.clientX + "px";
      dot.style.top = e.clientY + "px";
    });
    document.querySelectorAll("a, button, .product, .swatch").forEach((el) => {
      el.addEventListener("mouseenter", () => dot.classList.add("is-active"));
      el.addEventListener("mouseleave", () => dot.classList.remove("is-active"));
    });
  }

  /* ---------- Nav scroll state ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- GSAP setup ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Manifesto reveal
    gsap.utils.toArray(".reveal-text").forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        onEnter: () => el.classList.add("is-visible"),
      });
    });

    // Product cards staggered reveal
    gsap.utils.toArray(".product").forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 82%",
        onEnter: () => el.classList.add("is-visible"),
      });
    });

    // Swatches subtle parallax rise
    gsap.utils.toArray(".swatch").forEach((el, i) => {
      gsap.fromTo(
        el,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: i * 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        }
      );
    });

    // Price count-up
    document.querySelectorAll(".product-price").forEach((el) => {
      const target = parseInt(el.dataset.price, 10);
      const counter = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(counter, {
            val: target,
            duration: 1.4,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = "$" + Math.floor(counter.val).toLocaleString("en-US");
            },
          });
        },
      });
    });

    // Hero band split-in
    gsap.from(".hero-band--top", { yPercent: -100, duration: 1, ease: "power4.out", delay: 0.3 });
    gsap.from(".hero-band--bottom", { yPercent: 100, duration: 1, ease: "power4.out", delay: 0.3 });
  } else {
    // Fallback: reveal everything immediately if GSAP failed to load
    document.querySelectorAll(".reveal-text, .product").forEach((el) => el.classList.add("is-visible"));
    document.querySelectorAll(".product-price").forEach((el) => {
      el.textContent = "$" + parseInt(el.dataset.price, 10).toLocaleString("en-US");
    });
  }

  /* ---------- Hero title split-letter intro ---------- */
  function playHeroIntro() {
    const title = document.querySelector("[data-split]");
    if (!title || !window.gsap) return;
    const text = title.textContent;
    title.innerHTML = text
      .split("")
      .map((ch) => `<span class="letter" style="display:inline-block">${ch}</span>`)
      .join("");
    gsap.from(title.querySelectorAll(".letter"), {
      yPercent: 120,
      opacity: 0,
      duration: 1,
      ease: "power4.out",
      stagger: 0.045,
      delay: 0.15,
    });
    gsap.from(".hero-3d", { scale: 0.7, opacity: 0, duration: 1.1, ease: "power3.out", delay: 0.5 });
    gsap.from(".hero-sub", { y: 20, opacity: 0, duration: 0.9, ease: "power3.out", delay: 0.9 });
    gsap.from(".hero-scroll", { y: 20, opacity: 0, duration: 0.9, ease: "power3.out", delay: 1.05 });
  }

  /* ---------- Product image tilt on mouse move ---------- */
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    const wrap = card.querySelector(".product-image-wrap");
    if (!wrap) return;
    const maxTilt = 8;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      wrap.style.transform = `rotateY(${px * maxTilt * 2}deg) rotateX(${-py * maxTilt}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      wrap.style.transform = "rotateY(0deg) rotateX(0deg)";
    });
    wrap.style.transition = "transform .35s ease";
  });

  /* ---------- Nav toggle (mobile no-op placeholder) ---------- */
  const navToggle = document.getElementById("navToggle");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      document.querySelector(".nav-links").classList.toggle("is-open");
    });
  }
});
