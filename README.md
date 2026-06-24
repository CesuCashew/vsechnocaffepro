# Mezičas Caffe

One-page web pro (fiktivní) kavárnu a music bar **Mezičas Caffe**. Podnik žije
tři životy během jednoho dne a tahle proměna je celý koncept značky:

- **Ráno** — pomalá snídaně, výběrová káva, ticho
- **Poledne** — denní menu, rychlý oběd, ruch
- **Večer** — koktejly, DJ / živá hudba, noc

Stránka mění barvy, sazbu i obsah podle denní doby. Při prvním načtení odvodí
náladu z reálného času návštěvníka; ručně se přepíná „otočkou času" v hlavičce.

## Jak to funguje

- Denní doba je řízena atributem `data-mode="rano|poledne|vecer"` na `<html>`.
- Veškeré téma (barvy, akcent, zrno, typografická nálada) jede přes **CSS custom
  properties** přepínané podle `data-mode`. Žádné přebarvování po elementech v JS.
- Volba se pamatuje v `localStorage`; tlačítkem **„podle času"** se vrátíš
  k řízení reálným časem.
- Přepnutí působí jako **plynutí času** — světelný „wipe" přejede plochu (GSAP).
  Při `prefers-reduced-motion` je přepnutí okamžité, bez animace.

Logika je okomentovaná v [js/main.js](js/main.js), sekce `MODE ENGINE`.

## Tech

- Vanilla **HTML + CSS + JS**, jedna stránka, žádný framework.
- **GSAP + ScrollTrigger** (reveal, paralax, přechod módů) + **Lenis** (smooth
  scroll) — oboje z CDN. Web funguje i bez nich (progressive enhancement).
- Fonty: **Fraunces** (display) + **IBM Plex Mono** (čísla, čas, metadata),
  `display: swap`.
- Přístupnost: sémantické HTML, ovládání klávesnicí (i přepínač času jako
  radiogroup), viditelný focus, kontrast AA v každém módu, respekt k reduced motion.

## Struktura

```
index.html        # stránka
css/styles.css    # designový systém + témata po denní době
js/main.js        # mode engine, hodiny, GSAP/Lenis, kurzor
assets/           # obrazové sloty (viz assets/README.md)
```

## Spuštění

Otevři `index.html` v prohlížeči, žádný build. Pro správné načtení fontů a CDN
je lepší servírovat přes lokální server, např.:

```
python -m http.server
```

Texty, položky menu, akce a kontakty jsou vymyšlené — vyměň za skutečné.
