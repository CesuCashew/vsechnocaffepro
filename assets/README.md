# assets/ — obrázky

Web používá tyhle fotky, zpracované v CSS do **duotónu + zrna** laděného do
denní doby (viz `.slot` v `css/styles.css`):

| soubor | kde se zobrazuje | motiv |
| --- | --- | --- |
| `hero-rano.webp` | hero (ráno) + náhled kapitoly 01 | výběrová káva |
| `hero-poledne.webp` | hero (poledne) + náhled kapitoly 02 | polední talíře |
| `hero-vecer.webp` | hero (večer) + náhled kapitoly 03 | večerní koktejl |
| `interier.webp` | sekce Rezervace | interiér podniku |

Zdroj: [Unsplash](https://unsplash.com) (volná licence i pro komerční použití).
Jsou to ilustrační fotky — klidně je vyměň za vlastní snímky podniku.

## Jak vyměnit fotku

Stačí přepsat soubor stejným názvem (formát `.webp`, ideálně ~1400 px na šířku),
nebo upravit `src` u `<img>` v `index.html`. Duotónové zpracování (grayscale +
barevný nádech + zrno) se aplikuje automaticky přes CSS, takže nová fotka
zapadne do stylu sama. Sytost nádechu ladí proměnné `--slot-gray`, `--slot-blend`
a `--slot-tint` v jednotlivých `[data-mode]` blocích.
