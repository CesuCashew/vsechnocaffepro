/* =================================================================
   MEZIČAS CAFFE — main.js
   -----------------------------------------------------------------
   Obsah:
   A) MODE ENGINE   — jádro: ráno / poledne / večer
   B) TIMEDIAL      — přepínač denní doby (radiogroup, klávesnice)
   C) HODINY        — živý čas v hlavičce + auto-aktualizace módu
   D) HERO COPY     — výměna headline/podnadpisu podle módu
   E) WIPE/PŘECHOD  — "plynutí času" přes GSAP (respektuje rmotion)
   F) GSAP + LENIS  — smooth scroll, reveal, decentní paralax
   G) KURZOR        — vlastní kurzor (jen fine pointer)
   H) NAVIGACE      — mobilní rozbalení

   Web je psaný jako progressive enhancement: když GSAP/Lenis chybí
   nebo je zapnuté prefers-reduced-motion, vše funguje bez animací.
   ================================================================= */

(() => {
    "use strict";

    const root = document.documentElement; // <html> nese data-mode
    const MODES = ["rano", "poledne", "vecer"];
    const STORAGE_KEY = "mezicas:mode"; // ruční volba; když chybí => řídí čas
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Texty heru pro jednotlivé denní doby.
       Sem patří headline + kicker + lede. Menu/program jsou v HTML
       a přepínají se přes CSS (data-when vs. data-mode). */
    const COPY = {
        rano: {
            kicker: "Otevřeno od 7:30 · káva a ticho",
            line1: "Pomalé",
            line2: "ráno",
            lede: "Než se den rozběhne, patří stůl u okna vám. Filtr, který klidně stihne vystydnout, a nikdo vás nikam nežene.",
            note: "Ráno se snídá. Ceny jsou v korunách, kuchyně do 10:30.",
            cap: "Stůl u okna, 8:14",
            theme: "#efe5d4",
        },
        poledne: {
            kicker: "Polední provoz · denní menu na tabuli",
            line1: "Polední",
            line2: "provoz",
            lede: "V poledne se kuchyně rozjede naplno. Talíř, sklenka limonády a hodina, která uteče rychleji než obvykle.",
            note: "Polední menu visí na tabuli. Vaříme do 14:30.",
            cap: "Tabule s menu, 12:30",
            theme: "#eceae0",
        },
        vecer: {
            kicker: "Bar do půlnoci · DJ a živá hudba",
            line1: "Noční",
            line2: "směna",
            lede: "Světla dolů, hlasitost nahoru. Koktejl míchaný od oka a hudba, kvůli které se nikomu nechce domů.",
            note: "Bar míchá do půlnoci, o víkendu déle. Ceny v korunách.",
            cap: "U baru, 22:47",
            theme: "#15110f",
        },
    };

    /* Elementy (cache) */
    const els = {
        opts: Array.from(document.querySelectorAll(".timedial__opt")),
        thumb: document.querySelector(".timedial__thumb"),
        reset: document.getElementById("timeReset"),
        clock: document.getElementById("clock"),
        clockFoot: document.getElementById("clock-foot"),
        themeColor: document.getElementById("theme-color"),
        kicker: document.getElementById("hero-kicker"),
        line1: document.querySelector(".hero__title-line:not(.hero__title-line--em)"),
        line2: document.querySelector(".hero__title-line--em"),
        lede: document.getElementById("hero-lede"),
        menuNote: document.getElementById("menu-note"),
        heroCap: document.querySelector(".hero__cap"),
        wipe: document.querySelector(".wipe"),
        chapterBtns: Array.from(document.querySelectorAll(".chapter__btn")),
    };

    let currentMode = null;
    let isManual = false; // true = uživatel zvolil ručně (drží se localStorage)

    /* =============================================================
       A) MODE ENGINE
       ============================================================= */

    /** Odvodí denní dobu z lokálního času návštěvníka.
        Hranice (orientační, lze ladit):
        5:00–11:00 ráno · 11:00–17:00 poledne · 17:00–5:00 večer */
    function modeFromClock(date = new Date()) {
        const h = date.getHours() + date.getMinutes() / 60;
        if (h >= 5 && h < 11) return "rano";
        if (h >= 11 && h < 17) return "poledne";
        return "vecer";
    }

    /** Aplikuje mód: nastaví data-mode, texty, stav přepínače.
        @param {string} mode  rano|poledne|vecer
        @param {object} opts  { animate, persist } */
    function applyMode(mode, { animate = true, persist = false } = {}) {
        if (!MODES.includes(mode)) mode = "rano";
        if (mode === currentMode) {
            // I beze změny módu udrž stav přepínače/úložiště konzistentní
            if (persist) setManual(mode);
            return;
        }

        const change = () => {
            root.setAttribute("data-mode", mode);
            currentMode = mode;
            syncCopy(mode);
            syncDial(mode);
            if (els.themeColor) els.themeColor.setAttribute("content", COPY[mode].theme);
        };

        if (animate && !prefersReduced && window.gsap && els.wipe) {
            runWipe(mode, change); // "plynutí času" — viz sekce E
        } else {
            change();
        }

        if (persist) setManual(mode);
    }

    /** Ruční volba: ulož do localStorage a ukaž reset na "reálný čas". */
    function setManual(mode) {
        isManual = true;
        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch (e) {
            /* localStorage může být zakázané — nevadí, jen nezapamatujeme */
        }
        if (els.reset) els.reset.hidden = false;
    }

    /** Vrátí se k řízení reálným časem (smaže uloženou volbu). */
    function clearManual() {
        isManual = false;
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) { /* viz výše */ }
        if (els.reset) els.reset.hidden = true;
        applyMode(modeFromClock(), { animate: true, persist: false });
    }

    /* =============================================================
       D) HERO COPY — výměna textů podle módu
       ============================================================= */
    function syncCopy(mode) {
        const c = COPY[mode];
        if (els.kicker) els.kicker.textContent = c.kicker;
        if (els.line1) els.line1.textContent = c.line1;
        if (els.line2) els.line2.textContent = c.line2;
        if (els.lede) els.lede.textContent = c.lede;
        if (els.menuNote) els.menuNote.textContent = c.note;
        if (els.heroCap) els.heroCap.textContent = c.cap;
        // Hero fotka se přepíná čistě přes CSS podle data-mode (viz .slot__mode).
    }

    /* =============================================================
       B) TIMEDIAL — přepínač jako radiogroup s plnou klávesnicí
       ============================================================= */
    function syncDial(mode) {
        els.opts.forEach((opt) => {
            const on = opt.dataset.mode === mode;
            opt.setAttribute("aria-checked", on ? "true" : "false");
            // roving tabindex: tabovatelný je jen aktivní (ARIA radio pattern)
            opt.tabIndex = on ? 0 : -1;
        });
    }

    function initDial() {
        // Klik myší
        els.opts.forEach((opt) => {
            opt.addEventListener("click", () => {
                applyMode(opt.dataset.mode, { animate: true, persist: true });
            });
        });

        // Klávesnice: šipky přepínají + rovnou vybírají (ARIA radiogroup)
        const group = document.querySelector(".timedial");
        if (group) {
            group.addEventListener("keydown", (e) => {
                const idx = els.opts.findIndex((o) => o.dataset.mode === currentMode);
                let next = null;
                if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % MODES.length;
                else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + MODES.length) % MODES.length;
                else if (e.key === "Home") next = 0;
                else if (e.key === "End") next = MODES.length - 1;

                if (next !== null) {
                    e.preventDefault();
                    const opt = els.opts[next];
                    applyMode(opt.dataset.mode, { animate: true, persist: true });
                    opt.focus();
                }
            });
        }

        // Kapitoly v sekci "Den" také přepínají mód
        els.chapterBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                applyMode(btn.dataset.mode, { animate: true, persist: true });
            });
        });

        // Reset na reálný čas
        if (els.reset) els.reset.addEventListener("click", clearManual);
    }

    /* =============================================================
       C) HODINY — živý čas + periodická aktualizace módu
       ============================================================= */
    function pad(n) {
        return String(n).padStart(2, "0");
    }

    function tick() {
        const now = new Date();
        const hms = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        if (els.clock) {
            els.clock.textContent = hms;
            els.clock.setAttribute("datetime", now.toISOString());
        }
        if (els.clockFoot) {
            els.clockFoot.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        }

        // Pokud běžíme podle reálného času, plynule přejdi do správného módu
        if (!isManual) {
            const should = modeFromClock(now);
            if (should !== currentMode) applyMode(should, { animate: true, persist: false });
        }
    }

    function initClock() {
        tick();
        setInterval(tick, 1000);
    }

    /* =============================================================
       E) WIPE / PŘECHOD MÓDU — "plynutí času"
       Světelný pruh přejede plochu; uprostřed (když je plocha
       zakrytá) se přepne data-mode a vymění texty, pak se odkryje.
       ============================================================= */
    function runWipe(mode, change) {
        const gsap = window.gsap;
        const dir = MODES.indexOf(mode) > MODES.indexOf(currentMode || "rano") ? 1 : -1;
        const wipe = els.wipe;

        // Barva pruhu = cílový akcent (přečteme z příští palety přes dočasný prvek)
        wipe.style.background = accentFor(mode);
        wipe.style.transformOrigin = dir === 1 ? "left center" : "right center";

        gsap.killTweensOf(wipe);
        gsap.set(wipe, { visibility: "visible", scaleX: 0, transformOrigin: dir === 1 ? "left center" : "right center" });

        const tl = gsap.timeline({
            onComplete: () => gsap.set(wipe, { visibility: "hidden", scaleX: 0 }),
        });
        // Pruh přejede dovnitř
        tl.to(wipe, { scaleX: 1, duration: 0.42, ease: "power3.inOut" });
        // Pod zakrytím přepneme mód + texty
        tl.add(() => {
            change();
            animateHeroIn();
        });
        // Pruh odjede pryč na druhou stranu
        tl.set(wipe, { transformOrigin: dir === 1 ? "right center" : "left center" });
        tl.to(wipe, { scaleX: 0, duration: 0.5, ease: "power3.inOut" }, "+=0.02");
    }

    /** Krátký reveal headline po výměně textu. */
    function animateHeroIn() {
        if (prefersReduced || !window.gsap) return;
        const lines = [els.line1, els.line2, els.kicker, els.lede].filter(Boolean);
        window.gsap.fromTo(
            lines,
            { yPercent: 18, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.55, stagger: 0.06, ease: "power3.out" }
        );
    }

    /** Vytáhne hodnotu --accent pro daný mód (čteme z dočasného uzlu). */
    function accentFor(mode) {
        const probe = document.createElement("span");
        probe.setAttribute("data-mode", mode);
        probe.style.cssText = "position:absolute;opacity:0;pointer-events:none";
        document.body.appendChild(probe);
        const val = getComputedStyle(probe).getPropertyValue("--accent").trim();
        probe.remove();
        return val || "#b9661f";
    }

    /* =============================================================
       F) GSAP + LENIS — smooth scroll, reveal, decentní paralax
       ============================================================= */
    let lenis = null;

    function initScroll() {
        const hasGsap = !!window.gsap;
        const hasST = hasGsap && !!window.ScrollTrigger;

        // Lenis smooth scroll — jen když to dává smysl (ne při reduced motion)
        if (window.Lenis && !prefersReduced) {
            lenis = new Lenis({ duration: 1.1, smoothWheel: true });
            const raf = (time) => {
                lenis.raf(time);
                requestAnimationFrame(raf);
            };
            requestAnimationFrame(raf);

            if (hasST) {
                lenis.on("scroll", window.ScrollTrigger.update);
            }
        }

        // Označ prvky k reveal
        const revealTargets = [
            ".rubric", ".chapter", ".menu-col", ".menu-aside",
            ".reserve__lead", ".reserve__contact", ".reserve__big",
            ".bill", ".note", ".margins__side", ".hero__plate",
        ];
        const nodes = [];
        revealTargets.forEach((sel) => document.querySelectorAll(sel).forEach((n) => {
            n.setAttribute("data-reveal", "");
            nodes.push(n);
        }));

        if (hasST && !prefersReduced) {
            window.gsap.registerPlugin(window.ScrollTrigger);

            // Reveal po vstupu do viewportu
            nodes.forEach((n) => {
                window.gsap.to(n, {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: "power3.out",
                    scrollTrigger: { trigger: n, start: "top 86%" },
                    onStart: () => n.classList.add("is-in"),
                });
            });

            // Decentní paralax na obrazových slotech
            document.querySelectorAll("[data-parallax]").forEach((el) => {
                const amount = parseFloat(el.dataset.parallax) || 0.1;
                window.gsap.to(el, {
                    yPercent: -amount * 100,
                    ease: "none",
                    scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
                });
            });
        } else {
            // Bez GSAP/ST nebo s reduced motion — vše rovnou viditelné
            nodes.forEach((n) => n.classList.add("is-in"));
        }
    }

    /* =============================================================
       G) KURZOR — vlastní kurzor (jen jemný pointer, ne dotyk)
       ============================================================= */
    function initCursor() {
        const cursor = document.querySelector(".cursor");
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (!cursor || !fine || prefersReduced) return;

        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;

        const move = window.gsap
            ? window.gsap.quickTo(cursor, "x", { duration: 0.25, ease: "power3" })
            : null;
        const moveY = window.gsap
            ? window.gsap.quickTo(cursor, "y", { duration: 0.25, ease: "power3" })
            : null;

        window.addEventListener("pointermove", (e) => {
            x = e.clientX;
            y = e.clientY;
            cursor.classList.add("is-on");
            if (move) {
                move(x);
                moveY(y);
            } else {
                cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
            }
        });

        // Zvětšení nad odkazy/tlačítky
        document.querySelectorAll("a, button, [role='radio']").forEach((el) => {
            el.addEventListener("pointerenter", () => cursor.classList.add("is-hot"));
            el.addEventListener("pointerleave", () => cursor.classList.remove("is-hot"));
        });

        window.addEventListener("pointerout", (e) => {
            if (!e.relatedTarget) cursor.classList.remove("is-on");
        });
    }

    /* =============================================================
       H) NAVIGACE — mobilní rozbalení
       ============================================================= */
    function initNav() {
        const toggle = document.getElementById("navToggle");
        const nav = document.getElementById("nav");
        if (!toggle || !nav) return;

        toggle.addEventListener("click", () => {
            const open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            toggle.setAttribute("aria-label", open ? "Zavřít navigaci" : "Otevřít navigaci");
        });

        nav.querySelectorAll("a").forEach((a) => {
            a.addEventListener("click", () => {
                nav.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* =============================================================
       INIT
       ============================================================= */
    function init() {
        // Výchozí mód podle priority:
        //   1) ?mode= v URL (deep-link na konkrétní náladu)
        //   2) uložená ruční volba (localStorage)
        //   3) reálný čas návštěvníka
        let initial = null;
        const urlMode = new URLSearchParams(location.search).get("mode");

        if (urlMode && MODES.includes(urlMode)) {
            initial = urlMode;
            isManual = true;
            if (els.reset) els.reset.hidden = false;
        } else {
            try {
                initial = localStorage.getItem(STORAGE_KEY);
            } catch (e) {
                initial = null;
            }

            if (initial && MODES.includes(initial)) {
                isManual = true;
                if (els.reset) els.reset.hidden = false;
            } else {
                initial = modeFromClock();
                isManual = false;
            }
        }
        // První aplikace bez wipe (žádný "přechod" při loadu)
        applyMode(initial, { animate: false, persist: false });

        initDial();
        initClock();
        initNav();
        initScroll();
        initCursor();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
