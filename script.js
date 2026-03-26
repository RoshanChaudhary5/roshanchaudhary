console.log("Portfolio loaded");

const yearEl = document.querySelector("[data-year]");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const contactForm = document.querySelector("[data-contact-form]");
const contactStatus = document.querySelector("[data-contact-status]");
const contactToast = document.querySelector("[data-contact-toast]");
const contactToastClose = document.querySelector("[data-contact-toast-close]");

const prefersReducedMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;

const navToggle = document.querySelector(".nav-toggle");
const navOverlay = document.querySelector("[data-nav-overlay]");
const navDrawer = document.getElementById("nav-drawer"); 
const desktopNavLinks = document.querySelector(".nav-links");
const drawerNavLinks = document.querySelector("[data-nav-drawer-links]");
const modal = document.getElementById("contact-modal");
let modalOpeners = Array.from(document.querySelectorAll("[data-modal-open]"));
let navCloseEls = Array.from(document.querySelectorAll("[data-nav-close]"));
let contactToastTimer = null;

window.addEventListener("DOMContentLoaded", () => {
    document.documentElement.classList.add("is-loaded");
});

if (desktopNavLinks && drawerNavLinks) {
    const fragment = document.createDocumentFragment();
    for (const link of desktopNavLinks.querySelectorAll("a[href^=\"#\"], button[data-modal-open]")) {
        const clone = link.cloneNode(true);
        clone.setAttribute("data-nav-close", "");
        fragment.appendChild(clone);
    }
    drawerNavLinks.replaceChildren(fragment);
    modalOpeners = Array.from(document.querySelectorAll("[data-modal-open]"));
    navCloseEls = Array.from(document.querySelectorAll("[data-nav-close]"));
}

const navLinks = Array.from(document.querySelectorAll(".nav-link[href^=\"#\"]"));
const navTargetIds = new Set(
    navLinks
        .map((link) => link.getAttribute("href"))
        .filter((href) => href && href.startsWith("#"))
        .map((href) => href.slice(1))
);
const sections = Array.from(document.querySelectorAll("main section[id]")).filter((section) => navTargetIds.has(section.id));

const setActive = (id) => {
    for (const link of navLinks) {
        const href = link.getAttribute("href");
        const active = href === `#${id}`;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
    }
};

for (const link of navLinks) {
    link.addEventListener("click", () => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) return;
        setActive(href.slice(1));
    });
}

let navLastFocus = null;

const isNavOpen = () => document.documentElement.classList.contains("nav-open");

const setNavOpen = (open) => {
    if (!navToggle || !navOverlay || !navDrawer) return;

    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navDrawer.setAttribute("aria-hidden", open ? "false" : "true");
    navOverlay.setAttribute("aria-hidden", open ? "false" : "true");

    if ("inert" in navDrawer) navDrawer.inert = !open;
    else if (open) navDrawer.removeAttribute("inert");
    else navDrawer.setAttribute("inert", "");

    document.documentElement.classList.toggle("nav-open", open);
    document.body.classList.toggle("nav-open", open);
};

const closeNav = () => {
    if (!navToggle || !navOverlay || !navDrawer) return;
    if (!isNavOpen()) return;

    setNavOpen(false);
    if (navLastFocus && navLastFocus.focus) navLastFocus.focus();
    else navToggle.focus();
    navLastFocus = null;
};

const openNav = () => {
    if (!navToggle || !navOverlay || !navDrawer) return;
    if (isNavOpen()) return;

    navLastFocus = document.activeElement;
    setNavOpen(true);
    navDrawer.scrollTop = 0;

    const firstFocus = navDrawer.querySelector(".nav-close") || navDrawer.querySelector("a, button");
    if (firstFocus && firstFocus.focus) firstFocus.focus();
};

const toggleNav = () => {
    if (isNavOpen()) closeNav();
    else openNav();
};

const getDrawerFocusable = () => {
    if (!navDrawer) return [];
    const selector = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";
    return Array.from(navDrawer.querySelectorAll(selector)).filter((el) => {
        const style = window.getComputedStyle(el);
        return style.visibility !== "hidden" && style.display !== "none";
    });
};

const getModalFocusable = () => {
    if (!modal) return [];
    const selector = "a[href], button:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";
    return Array.from(modal.querySelectorAll(selector)).filter((el) => {
        const style = window.getComputedStyle(el);
        return style.visibility !== "hidden" && style.display !== "none";
    });
};

const clearContactToastTimer = () => {
    if (contactToastTimer) {
        window.clearTimeout(contactToastTimer);
        contactToastTimer = null;
    }
};

const hideContactToast = () => {
    if (!contactToast || contactToast.hidden) return;

    clearContactToastTimer();
    contactToast.classList.remove("is-visible");

    window.setTimeout(() => {
        if (!contactToast.classList.contains("is-visible")) {
            contactToast.hidden = true;
        }
    }, 220);
};

const showContactToast = () => {
    if (!contactToast) return;

    clearContactToastTimer();
    contactToast.hidden = false;
    window.requestAnimationFrame(() => {
        contactToast.classList.add("is-visible");
    });
    contactToastTimer = window.setTimeout(hideContactToast, 5000);
};

if (navToggle && navOverlay && navDrawer) {
    navToggle.addEventListener("click", toggleNav);
    navOverlay.addEventListener("click", closeNav);

    for (const el of navCloseEls) el.addEventListener("click", closeNav);

    document.addEventListener("keydown", (event) => {
        if (!isNavOpen()) return;

        if (event.key === "Escape") {
            event.preventDefault();
            closeNav();
            return;
        }

        if (event.key !== "Tab") return;

        const focusables = getDrawerFocusable();
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (event.shiftKey) {
            if (active === first || !navDrawer.contains(active)) {
                event.preventDefault();
                last.focus();
            }
        } else {
            if (active === last || !navDrawer.contains(active)) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    if (window.matchMedia && window.matchMedia("(min-width: 901px)").addEventListener) {
        window.matchMedia("(min-width: 901px)").addEventListener("change", (e) => {
            if (e.matches) closeNav();
        });
    }
}

let modalLastFocus = null;
const isModalOpen = () => modal?.classList.contains("is-open");

const closeModal = () => {
    if (!modal) return;
    if (!isModalOpen()) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
    if (modalLastFocus && modalLastFocus.focus) modalLastFocus.focus();
    modalLastFocus = null;
};

const openModal = (id) => {
    if (!modal || modal.id !== id) return;
    if (isNavOpen()) closeNav();
    modalLastFocus = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
    const focusables = getModalFocusable();
    if (focusables.length) focusables[0].focus();
};

for (const opener of modalOpeners) {
    opener.addEventListener("click", () => {
        const target = opener.getAttribute("data-modal-open");
        openModal(target);
    });
}

if (modal) {
    const modalCloseEls = Array.from(modal.querySelectorAll("[data-modal-close]"));
    const modalOverlay = modal.querySelector(".modal__overlay");

    for (const btn of modalCloseEls) btn.addEventListener("click", closeModal);
    if (modalOverlay) modalOverlay.addEventListener("click", closeModal);

    document.addEventListener("keydown", (event) => {
        if (!isModalOpen()) return;

        if (event.key === "Escape") {
            event.preventDefault();
            closeModal();
            return;
        }

        if (event.key !== "Tab") return;
        const focusables = getModalFocusable();
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (event.shiftKey) {
            if (active === first || !modal.contains(active)) {
                event.preventDefault();
                last.focus();
            }
        } else {
            if (active === last || !modal.contains(active)) {
                event.preventDefault();
                first.focus();
            }
        }
    });
}

if (contactToastClose) {
    contactToastClose.addEventListener("click", hideContactToast);
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideContactToast();
});

const revealEls = Array.from(document.querySelectorAll(".reveal"));

for (const el of revealEls) {
    const delay = Number(el.dataset.delay);
    if (Number.isFinite(delay)) el.style.setProperty("--delay", `${delay}ms`);
}

for (const group of document.querySelectorAll("[data-reveal-group]")) {
    const step = Number(group.getAttribute("data-reveal-group")) || 80;
    const members = Array.from(group.querySelectorAll(".reveal")).filter((el) => el.closest("[data-reveal-group]") === group);

    for (let i = 0; i < members.length; i += 1) {
        const el = members[i];
        if (el.dataset.delay != null) continue;
        el.style.setProperty("--delay", `${i * step}ms`);
    }
}

if (revealEls.length && !prefersReducedMotion && "IntersectionObserver" in window) {
    // Mark above-the-fold content visible before enabling the hidden state.
    for (const el of revealEls) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) el.classList.add("is-visible");
    }

    document.documentElement.classList.add("reveal-on");

    const revealObserver = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            }
        },
        {
            rootMargin: "0px 0px -10% 0px",
            threshold: 0.12,
        }
    );

    for (const el of revealEls) {
        if (el.classList.contains("is-visible")) continue;
        revealObserver.observe(el);
    }
}

const initialHash = window.location.hash ? window.location.hash.slice(1) : "";
if (initialHash && navTargetIds.has(initialHash)) setActive(initialHash);
else if (sections.length) setActive(sections[0].id);

if (contactForm) {
    const emailField = contactForm.querySelector("#contact-email");
    const nextField = contactForm.querySelector("[data-contact-next]");
    const replyToField = contactForm.querySelector("[data-contact-replyto]");
    const submitButton = contactForm.querySelector("button[type=\"submit\"]");
    const currentUrl = new URL(window.location.href);

    if (nextField && currentUrl.protocol !== "file:") {
        currentUrl.searchParams.set("contact", "success");
        currentUrl.hash = "contact";
        nextField.value = currentUrl.toString();
    }

    if (contactStatus) {
        const params = new URLSearchParams(window.location.search);
        if (params.get("contact") === "success") {
            contactStatus.textContent = "Message sent successfully.";
            showContactToast();
            params.delete("contact");
            const cleanSearch = params.toString();
            const cleanUrl = `${window.location.pathname}${cleanSearch ? `?${cleanSearch}` : ""}${window.location.hash}`;
            window.history.replaceState({}, "", cleanUrl);
        }
    }

    contactForm.addEventListener("submit", () => {
        if (replyToField && emailField) replyToField.value = emailField.value.trim();

        if (contactStatus) {
            contactStatus.textContent = "Sending message...";
        }

        if (submitButton) submitButton.disabled = true;
    });
}

if ("IntersectionObserver" in window && navLinks.length && sections.length) {
    const observer = new IntersectionObserver(
        (entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];

            if (visible && visible.target && visible.target.id) setActive(visible.target.id);
        },
        {
            rootMargin: "-45% 0px -50% 0px",
            threshold: 0,
        }
    );

    for (const section of sections) observer.observe(section);
}

// Hero parallax / physics hover
const heroCard = document.querySelector(".media-card");
if (heroCard && !prefersReducedMotion) {
    const setTilt = (x, y) => {
        heroCard.style.setProperty("--tiltX", `${y * -8}deg`);
        heroCard.style.setProperty("--tiltY", `${x * 10}deg`);
        heroCard.style.setProperty("--parallaxX", `${x * 16}px`);
        heroCard.style.setProperty("--parallaxY", `${y * 16}px`);
    };

    heroCard.addEventListener("pointermove", (event) => {
        if (event.pointerType && event.pointerType !== "mouse") return;
        const rect = heroCard.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        setTilt(x, y);
    });

    heroCard.addEventListener("pointerleave", () => setTilt(0, 0));
}
