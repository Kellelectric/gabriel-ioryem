(() => {
  const header = document.getElementById("site-header");
  const progress = document.getElementById("scroll-progress");
  const menuToggle = document.getElementById("menu-toggle");
  const mobileNav = document.getElementById("mobile-navigation");
  const exploreTrack = document.getElementById("explore-track");

  const closeMenu = (returnFocus = false) => {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    mobileNav.classList.add("hidden");
    if (returnFocus) menuToggle.focus();
  };

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
      mobileNav.classList.toggle("hidden", isOpen);
    });
    mobileNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => closeMenu()));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") closeMenu(true);
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) closeMenu();
    });
  }

  const updateScroll = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 24);
    if (progress) {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (total > 0 ? window.scrollY / total * 100 : 0) + "%";
    }
  };
  window.addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();

  const revealItems = document.querySelectorAll(".fade-up, .reveal-line");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    }), { threshold: 0.12 });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  document.querySelectorAll(".reveal-line").forEach((line, index) => {
    line.style.transitionDelay = (120 + index * 110) + "ms";
  });

  if (exploreTrack) {
    const arrows = document.querySelectorAll("[data-scroll]");
    const links = [...exploreTrack.querySelectorAll("a[href^='#']")];
    const updateArrows = () => {
      const max = exploreTrack.scrollWidth - exploreTrack.clientWidth;
      const prev = document.querySelector('[data-scroll="prev"]');
      const next = document.querySelector('[data-scroll="next"]');
      if (prev) prev.disabled = exploreTrack.scrollLeft <= 2;
      if (next) next.disabled = exploreTrack.scrollLeft >= max - 2;
    };
    arrows.forEach(button => button.addEventListener("click", () => {
      exploreTrack.scrollBy({ left: (button.dataset.scroll === "next" ? 1 : -1) * Math.max(180, exploreTrack.clientWidth * 0.65), behavior: "smooth" });
    }));
    exploreTrack.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    updateArrows();

    if ("IntersectionObserver" in window) {
      const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const id = "#" + entry.target.id;
          links.forEach(link => {
            const active = link.getAttribute("href") === id;
            link.classList.toggle("is-current", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
          const activeLink = links.find(link => link.getAttribute("href") === id);
          if (activeLink) activeLink.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
        });
      }, { rootMargin: "-25% 0px -60% 0px" });
      links.forEach(link => {
        const section = document.querySelector(link.getAttribute("href"));
        if (section) sectionObserver.observe(section);
      });
    }
  }

  const flow = document.getElementById("lead-flow");
  if (flow) {
    let step = 1;
    const data = { purpose: "", context: "", name: "", email: "", phone: "" };
    const progressBar = document.getElementById("lead-progress");
    const widths = { 1: "25%", 2: "50%", 3: "75%", 4: "100%", done: "100%" };
    const showStep = nextStep => {
      flow.querySelectorAll(".lead-step").forEach(panel => panel.classList.add("hidden"));
      const panel = flow.querySelector('.lead-step[data-step="' + nextStep + '"]');
      if (panel) panel.classList.remove("hidden");
      if (progressBar) progressBar.style.width = widths[nextStep] || "100%";
      step = nextStep;
      const heading = panel?.querySelector("h3");
      if (heading) heading.setAttribute("tabindex", "-1"), heading.focus();
    };

    flow.querySelectorAll(".lead-option").forEach(button => {
      button.addEventListener("click", () => {
        data.purpose = button.dataset.value || "";
        flow.querySelectorAll(".lead-option").forEach(option => option.setAttribute("aria-pressed", String(option === button)));
        window.setTimeout(() => showStep(2), 140);
      });
    });

    flow.querySelectorAll(".lead-next").forEach(button => {
      button.addEventListener("click", () => {
        if (step === 2) {
          data.context = document.getElementById("lead-context").value.trim();
          showStep(3);
        } else if (step === 3) {
          const name = document.getElementById("lead-name");
          if (!name.value.trim()) { name.focus(); name.reportValidity(); return; }
          data.name = name.value.trim();
          showStep(4);
        }
      });
    });

    flow.querySelectorAll(".lead-back").forEach(button => button.addEventListener("click", () => {
      if (step > 1 && step <= 4) showStep(step - 1);
    }));

    const submit = document.getElementById("lead-submit");
    if (submit) submit.addEventListener("click", () => {
      const email = document.getElementById("lead-email");
      const phone = document.getElementById("lead-phone");
      if (!email.checkValidity()) { email.reportValidity(); email.focus(); return; }
      data.email = email.value.trim();
      data.phone = phone.value.trim();
      const subject = "Professional enquiry: " + data.purpose;
      const body = [
        "Enquiry type: " + data.purpose,
        "Name: " + data.name,
        "Email: " + data.email,
        "Phone / WhatsApp: " + (data.phone || "Not provided"),
        "",
        "Context:",
        data.context || "No additional context supplied."
      ].join("\n");
      const mailto = "mailto:info@kellelectricals.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      const mailLink = document.getElementById("lead-mailto");
      if (mailLink) mailLink.href = mailto;
      const quoteLink = document.getElementById("lead-quote-link");
      if (quoteLink && data.purpose.includes("Project enquiry")) quoteLink.classList.remove("hidden");
      showStep("done");
    });
  }
})();