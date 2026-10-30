# Arctium Gartenpflege

Website für **arctium-gartenpflege.de** – Gartenpflege, Heckenschnitt, Rasenpflege.

Statische Seite (HTML, CSS, JS), gehostet über GitHub Pages.

## Struktur
- `index.html` – Startseite (Leistungen, Über mich, Ablauf, Kontakt)
- `impressum.html`, `datenschutz.html` – Rechtstexte
- `css/style.css`, `js/main.js`
- `img/` – Logo, Favicon, Fotos
- `fonts/` – lokal eingebundene Schriften (Barlow Condensed, Inter), DSGVO-freundlich

## Eigene Domain
Sobald die Domain bei Strato aktiv ist:
1. Datei `CNAME` mit dem Inhalt `arctium-gartenpflege.de` anlegen.
2. Bei Strato DNS: A-Records auf 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153; CNAME `www` auf `arctiumdesign.github.io`.
3. In GitHub unter Settings → Pages die Domain eintragen und „Enforce HTTPS" aktivieren.
