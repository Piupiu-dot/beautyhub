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
- Sprache UI: Deutsch (Schweizer Hochdeutsch – KEIN ß! Immer "ss": weiss, Schliessen, grösste, Strasse)
- Auth: Supabase Email/Passwort (kein Google/Apple – B2B)
- Farbschema: Cremeton (#faf8f5), Gold (#b8924a), Dunkelblau (#1A1A2E)
- Header auf allen App-Seiten: "BeautyHub" als Logo oben links
- Feed/Community 1-spaltig (volle Breite), Marktplatz 2-spaltig (md: 3-spaltig)
- Filter-/Kategorie-Keys (z.B. laser, geraete, mobel) sind INTERNE Filterwerte → nicht umbenennen, nur Label-Maps für die Anzeige
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

## Login/Registrierung – aktueller Stand (app/login/page.tsx)
- Slogan unter Logo: "Die Plattform für Schweizer Beauty-Profis"
- Goldener Fokus-Ring (#b8924a, 2px) auf allen Input-/Select-Feldern
- Tab-Wechsel-Links: "Noch kein Konto? Jetzt registrieren" / "Bereits registriert? Jetzt anmelden"
- Passwort-Toggle (Auge) auf Login + beiden Registrierungs-Passwortfeldern
- Schritt 1 "Zugangsdaten": E-Mail, Passwort, Passwort wiederholen (kein Name-Feld mehr)
- Schritt 2 "Dein Profil": Vorname/Nachname, Unternehmensname (Pflicht), Kanton, Mitarbeitende, Bereich (Dropdown), Nischen (Pills)
- Offen: Seiten /agb und /datenschutz existieren noch nicht (Checkbox-Links → 404)

## App-UI – aktueller Stand
- Feed-Karten (components/PostCard.tsx): kein Bild mehr, stattdessen Gradient-Header pro Kategorie
  (Gesetz=Gold, Trend=Grün, News=Blau, KI=Lila; KI greift bei ist_agent). Label gross/weiss zentriert.
  Detailseite feed/[id] nutzt denselben Gradient-Hero.
- Filter-Labels Feed/Community: Laser & IPL, Gesicht & Haut, Nails, PMU, Lashes & Brows, Haare, Medizinisch
- Marktplatz-Labels: Geräte, Produkte, Möbel, Kurse, Sonstiges; Button "+ Inserat erstellen"
- Profil: Bereich als goldenes Badge, Nischen-Pills, Kanton/Mitarbeitende; Abmelden mit Bestätigungsdialog ("Wirklich abmelden?")
- Detailseite "Beitrag nicht gefunden": Illustration + Button "Zurück zum Feed"
