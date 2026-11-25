(() => {
  // Enable animation-only hiding only after this script has successfully started.
  document.documentElement.classList.add("js-enabled");
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
      if (!isOpen) mobileNav.querySelector("a")?.focus();
    });
    mobileNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      const target = link.hash ? document.querySelector(link.hash) : null;
      closeMenu();
      if (target) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        window.requestAnimationFrame(() => target.focus({ preventScroll: true }));
      }
    }));
    document.addEventListener("pointerdown", event => {
      if (
        menuToggle.getAttribute("aria-expanded") === "true" &&
        !mobileNav.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) closeMenu();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") closeMenu(true);
    });
    window.addEventListener("hashchange", () => closeMenu());
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

  // Soft glow that follows the pointer across engineering cards.
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".expertise-card, .study-card").forEach(card => card.addEventListener("pointermove", event => {
      const box = card.getBoundingClientRect();
      card.style.setProperty("--mx", event.clientX - box.left + "px");
      card.style.setProperty("--my", event.clientY - box.top + "px");
    }));
  }

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
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let loopWidth = 0;
    let animationFrame = 0;
    let previousFrame = 0;
    let hoverPaused = false;
    let focusPaused = false;
    let pauseUntil = 0;

    // Duplicate the links once so the strip can glide continuously without
    // removing the original, keyboard-accessible navigation links.
    if (!reducedMotion.matches && exploreTrack.scrollWidth > exploreTrack.clientWidth + 4) {
      const copies = links.map(link => {
        const copy = link.cloneNode(true);
        copy.removeAttribute("id");
        copy.removeAttribute("aria-current");
        copy.classList.remove("is-current");
        copy.setAttribute("aria-hidden", "true");
        copy.tabIndex = -1;
        copy.dataset.autoCopy = "true";
        return copy;
      });
      copies.forEach(copy => exploreTrack.appendChild(copy));
      exploreTrack.dataset.autoSliding = "true";
      exploreTrack.style.scrollSnapType = "none";
      exploreTrack.style.scrollBehavior = "auto";
      loopWidth = copies[0].getBoundingClientRect().left - links[0].getBoundingClientRect().left;
    }

    const pauseAuto = (duration = 2600) => {
      pauseUntil = Math.max(pauseUntil, performance.now() + duration);
    };
    const updateArrows = () => {
      const max = exploreTrack.scrollWidth - exploreTrack.clientWidth;
      const looping = exploreTrack.dataset.autoSliding === "true";
      const prev = document.querySelector('[data-scroll="prev"]');
      const next = document.querySelector('[data-scroll="next"]');
      if (prev) prev.disabled = !looping && exploreTrack.scrollLeft <= 2;
      if (next) next.disabled = !looping && exploreTrack.scrollLeft >= max - 2;
    };

    arrows.forEach(button => button.addEventListener("click", () => {
      pauseAuto(3200);
      exploreTrack.scrollBy({
        left: (button.dataset.scroll === "next" ? 1 : -1) * Math.max(180, exploreTrack.clientWidth * 0.65),
        behavior: "smooth"
      });
    }));
    exploreTrack.addEventListener("scroll", updateArrows, { passive: true });
    exploreTrack.addEventListener("pointerenter", () => { hoverPaused = true; });
    exploreTrack.addEventListener("pointerleave", () => { hoverPaused = false; pauseAuto(900); });
    exploreTrack.addEventListener("focusin", () => { focusPaused = true; });
    exploreTrack.addEventListener("focusout", event => {
      if (!exploreTrack.contains(event.relatedTarget)) {
        focusPaused = false;
        pauseAuto(1400);
      }
    });
    exploreTrack.addEventListener("pointerdown", () => pauseAuto(3200));
    exploreTrack.addEventListener("touchstart", () => pauseAuto(3200), { passive: true });
    exploreTrack.addEventListener("wheel", () => pauseAuto(2400), { passive: true });
    window.addEventListener("resize", updateArrows);
    document.addEventListener("visibilitychange", () => {
      previousFrame = 0;
    });
    updateArrows();

    const animateExplore = timestamp => {
      if (!previousFrame) previousFrame = timestamp;
      const elapsed = Math.min(40, timestamp - previousFrame);
      previousFrame = timestamp;
      if (
        loopWidth > 0 &&
        !document.hidden &&
        !hoverPaused &&
        !focusPaused &&
        timestamp >= pauseUntil &&
        !reducedMotion.matches
      ) {
        exploreTrack.scrollLeft += elapsed * 0.022;
        if (exploreTrack.scrollLeft >= loopWidth) exploreTrack.scrollLeft -= loopWidth;
      }
      animationFrame = window.requestAnimationFrame(animateExplore);
    };
    if (loopWidth > 0) animationFrame = window.requestAnimationFrame(animateExplore);

    if (reducedMotion.addEventListener) {
      reducedMotion.addEventListener("change", event => {
        if (event.matches && animationFrame) {
          window.cancelAnimationFrame(animationFrame);
          animationFrame = 0;
          exploreTrack.querySelectorAll("[data-auto-copy='true']").forEach(copy => copy.remove());
          exploreTrack.removeAttribute("data-auto-sliding");
          exploreTrack.style.scrollSnapType = "";
          exploreTrack.style.scrollBehavior = "";
          loopWidth = 0;
          updateArrows();
        }
      });
    }

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
          // Mirror the current section in the desktop header navigation.
          document.querySelectorAll(".desktop-nav a[href^='#']").forEach(navLink => {
            navLink.classList.toggle("is-current", navLink.getAttribute("href") === id);
          });
          // Keep section observation passive; it must not change document scroll position.
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
    const WHATSAPP = "2348140205895";
    const data = { needs: [], property: "", timing: "", location: "", context: "", name: "", phone: "", email: "" };
    const progressBar = document.getElementById("lead-progress");
    const byId = id => document.getElementById(id);
    let step = 1;

    // Business, partnership and media conversations skip the site questions.
    const offsiteOnly = () => {
      const picked = [...flow.querySelectorAll('[data-field="needs"] [aria-pressed="true"]')];
      return picked.length > 0 && picked.every(button => button.dataset.offsite === "true");
    };
    const route = () => offsiteOnly() ? [1, 4, 5, 6] : [1, 2, 3, 4, 5, 6];

    const paintBrief = () => {
      const parts = new Set([...flow.querySelectorAll('[data-field="needs"] [aria-pressed="true"]')].map(button => button.dataset.part).filter(Boolean));
      document.querySelectorAll(".iso-part").forEach(part => part.classList.toggle("on", parts.has(part.dataset.part)));
      document.querySelector(".brief-visual")?.classList.toggle("has-parts", parts.size > 0);
      const set = (id, value) => { const el = byId(id); if (el) el.textContent = value || "Not chosen yet"; };
      set("brief-needs", data.needs.join(", "));
      set("brief-property", data.property);
      set("brief-timing", data.timing);
    };

    const showStep = nextStep => {
      flow.querySelectorAll(".lead-step").forEach(panel => panel.classList.add("hidden"));
      const panel = flow.querySelector('.lead-step[data-step="' + nextStep + '"]');
      if (panel) panel.classList.remove("hidden");
      const steps = route();
      const position = nextStep === "done" ? steps.length : steps.indexOf(nextStep) + 1;
      const percent = nextStep === "done" ? 100 : Math.round(position / steps.length * 100);
      const counter = panel?.querySelector(".step-count");
      if (counter) counter.textContent = position + " of " + steps.length;
      if (progressBar) {
        progressBar.style.width = percent + "%";
        progressBar.setAttribute("aria-valuenow", String(percent));
        progressBar.setAttribute("aria-valuetext", nextStep === "done" ? "Enquiry prepared" : "Step " + position + " of " + steps.length);
      }
      step = nextStep;
      const heading = panel?.querySelector("h3");
      if (heading) heading.setAttribute("tabindex", "-1"), heading.focus();
    };
    const move = direction => {
      const steps = route();
      const target = steps[steps.indexOf(step) + direction];
      if (target) showStep(target);
    };

    flow.querySelectorAll(".lead-options").forEach(group => {
      const field = group.dataset.field;
      const multi = group.dataset.multi === "true";
      group.querySelectorAll(".lead-option").forEach(button => button.addEventListener("click", () => {
        if (multi) {
          button.setAttribute("aria-pressed", String(button.getAttribute("aria-pressed") !== "true"));
          data[field] = [...group.querySelectorAll('[aria-pressed="true"]')].map(option => option.dataset.value);
          paintBrief();
          const hint = flow.querySelector('[data-step="1"] .field-hint');
          if (hint && hint.classList.contains("is-error")) { hint.classList.remove("is-error"); hint.textContent = "Choose everything that applies."; }
          return;
        }
        group.querySelectorAll(".lead-option").forEach(option => option.setAttribute("aria-pressed", String(option === button)));
        data[field] = button.dataset.value || "";
        paintBrief();
        window.setTimeout(() => move(1), 160);
      }));
    });

    const needsError = () => {
      const hint = flow.querySelector('[data-step="1"] .field-hint');
      if (hint) { hint.textContent = "Choose at least one option to continue."; hint.classList.add("is-error"); }
    };
    flow.querySelectorAll(".lead-next").forEach(button => button.addEventListener("click", () => {
      if (step === 1 && !data.needs.length) { needsError(); return; }
      if (step === 4) {
        data.location = byId("lead-location").value.trim();
        data.context = byId("lead-context").value.trim();
      }
      if (step === 5) {
        const name = byId("lead-name");
        if (!name.value.trim()) { name.focus(); name.reportValidity(); return; }
        data.name = name.value.trim();
      }
      move(1);
    }));
    flow.querySelectorAll(".lead-back").forEach(button => button.addEventListener("click", () => move(-1)));
    flow.querySelectorAll("input.form-field").forEach(input => input.addEventListener("keydown", event => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      input.closest(".lead-step")?.querySelector(".lead-next, #lead-submit")?.click();
    }));

    const submit = byId("lead-submit");
    if (submit) submit.addEventListener("click", () => {
      const email = byId("lead-email");
      const phone = byId("lead-phone");
      const error = byId("lead-contact-error");
      if (!email.checkValidity()) { email.reportValidity(); email.focus(); return; }
      if (!email.value.trim() && !phone.value.trim()) { error?.classList.remove("hidden"); phone.focus(); return; }
      error?.classList.add("hidden");
      data.email = email.value.trim();
      data.phone = phone.value.trim();

      const rows = [
        ["Needs", data.needs.join(", ")],
        ["Property", data.property],
        ["Timing", data.timing],
        ["Location", data.location],
        ["Details", data.context],
        ["Name", data.name],
        ["Phone / WhatsApp", data.phone],
        ["Email", data.email]
      ].filter(row => row[1]);
      const summary = byId("lead-summary");
      if (summary) {
        summary.textContent = "";
        rows.forEach(([label, value]) => {
          const row = document.createElement("div");
          const term = document.createElement("dt");
          const detail = document.createElement("dd");
          term.textContent = label;
          detail.textContent = value;
          row.append(term, detail);
          summary.appendChild(row);
        });
      }
      const firstName = data.name.split(/\s+/)[0];
      const title = flow.querySelector(".done-title");
      if (title) title.textContent = "Thanks, " + firstName + ". Your brief is ready.";

      const subject = "Project brief: " + data.needs.join(", ");
      const body = ["Hello, this is " + data.name + ". Here is a short brief from gabriel-ioryem.vercel.app.", ""]
        .concat(rows.map(([label, value]) => label + ": " + value)).join("\n");
      const mailto = "mailto:info@kellelectricals.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      const mailLink = byId("lead-mailto");
      if (mailLink) mailLink.href = mailto;
      const whatsappLink = byId("lead-whatsapp");
      if (whatsappLink) whatsappLink.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(body);
      byId("lead-quote-link")?.classList.toggle("hidden", offsiteOnly());
      showStep("done");
    });
    flow.querySelector(".lead-restart")?.addEventListener("click", () => showStep(6));
  }

  // Phone action bar: appears after the hero and steps aside once the contact section is on screen.
  const mobileCta = document.getElementById("mobile-cta");
  const hero = document.getElementById("home");
  const contact = document.getElementById("contact");
  if (mobileCta && hero && contact && "IntersectionObserver" in window) {
    let pastHero = false;
    let atContact = false;
    const sync = () => mobileCta.classList.toggle("is-visible", pastHero && !atContact);
    new IntersectionObserver(([entry]) => { pastHero = !entry.isIntersecting; sync(); }).observe(hero);
    new IntersectionObserver(([entry]) => { atContact = entry.isIntersecting; sync(); }, { rootMargin: "0px 0px -30% 0px" }).observe(contact);
  }
})();