console.log("Portfolio loaded");

const yearEl = document.querySelector("[data-year]");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const prefersReducedMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;

const navToggle = document.querySelector(".nav-toggle");
const navOverlay = document.querySelector("[data-nav-overlay]");
const navDrawer = document.getElementById("nav-drawer");
const desktopNavLinks = document.querySelector(".nav-links");
const drawerNavLinks = document.querySelector("[data-nav-drawer-links]");

if (desktopNavLinks && drawerNavLinks) {
    const fragment = document.createDocumentFragment();
    for (const link of desktopNavLinks.querySelectorAll("a[href^=\"#\"]")) {
        const clone = link.cloneNode(true);
        clone.setAttribute("data-nav-close", "");
        fragment.appendChild(clone);
    }
    drawerNavLinks.replaceChildren(fragment);
}

const navLinks = Array.from(document.querySelectorAll(".nav-link[href^=\"#\"]"));
const navCloseEls = Array.from(document.querySelectorAll("[data-nav-close]"));
const sections = Array.from(document.querySelectorAll("main section[id]"));

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

    if (window.matchMedia && window.matchMedia("(min-width: 761px)").addEventListener) {
        window.matchMedia("(min-width: 761px)").addEventListener("change", (e) => {
            if (e.matches) closeNav();
        });
    }
}

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
if (initialHash) setActive(initialHash);
else if (sections.length) setActive(sections[0].id);

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
