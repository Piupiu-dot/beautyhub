# BeautyHub Schweiz – Projektübersicht

## Was ist BeautyHub Schweiz?
B2B-Plattform für Schweizer Beauty-Fachleute. Ziel: Nischenspezifische Informationsversorgung über Gesetzesänderungen, Branchennews und Community-Austausch. Schulprojekt AIBS Fachausweis.
Live-URL: https://www.thebeautyhub.ch

## Tech Stack
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
- Backend/Auth/DB: Supabase
- Hosting: Vercel (Auto-Deploy via GitHub Push)
- Domain: thebeautyhub.ch (Infomaniak)

## Konventionen
- Sprache UI: Deutsch
- Auth: Supabase Email/Passwort (kein Google/Apple – B2B)
- Farbschema: Cremeton, Gold, Dunkelblau
- Nach jeder Änderung: git add . && git commit -m "..." && git push

## Offene Aufgaben (Priorität)
- [x] 1. Detaillierte Nischen-Liste einfügen (Unterkategorien pro Bereich)
- [x] 2. Formular-Validierung mit deutschen Fehlermeldungen
- [x] 3. Passwort-Toggle (Auge-Symbol) hinzufügen
- [~] 4. AGB/Datenschutz Checkbox (DSG Schweiz) – Pflichtfeld
      (Checkbox + Pflichtprüfung erledigt; Seiten /agb und /datenschutz fehlen noch)
- [ ] 5. E-Mail Bestätigung in Supabase aktivieren
- [ ] 6. Landing Page erstellen (öffentlich zugänglich)
- [x] 7. Ladeindikator beim Absenden
- [ ] 8. Profilbild Upload
