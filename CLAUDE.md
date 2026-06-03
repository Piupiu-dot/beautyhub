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

## Branding-Farben (Typ-Codes)
- Gold #b8924a (Gesetz) · Dunkelgrün #2d6a4f (Trend) · Dunkelblau #1c2b4a (News) · gedämpftes Lila #6b4c8b (KI)
- Aktiv-Hintergrund Nav/Filter: #fdf6ec · Sidebar-Trennlinie: #e8e0d5 · Creme-Flächen: #f5f0eb

## App-UI – aktueller Stand
- Feed-Karten (components/PostCard.tsx): KEIN Banner/Gradient mehr. Kompakte Karte mit kleinem
  farbigem Typ-Badge oben links (Branding-Farben oben), Publikationsdatum oben rechts (lib/demo.ts formatDatum:
  "vor 2 Tagen" / "12. Mai 2026"). Titel & Text prominent.
- Detailseite feed/[id]: solider Branding-Farb-Hero (kein Gradient) + Titel, Inhalt, Quelle, Datum, Tags.
- Demo-Daten zentral in lib/demo.ts (DEMO_POSTS, DEMO_COMMUNITY, findDemoPost). Feed/Community/Detail teilen sie.
  WICHTIG: Detailseite fällt auf findDemoPost(id) zurück, wenn die DB-Query (UUID-Spalte) für Demo-IDs wie '1'/'c1'
  nichts liefert → behebt den "Beitrag nicht gefunden"-Bug.
- Filter (Feed): 2 Ebenen, kombinierbar + clientseitig (useMemo). Ebene 1 Content-Typ (Alle/Gesetze/News/Trends/KI,
  KI=ist_agent), Ebene 2 Nischen-Pills. Mobile: Tabs mit goldenem Unterstrich + scrollbare Pills.
  Desktop (md+): vertikale Filter-Rail (INHALT/NISCHE), horizontale Leisten ausgeblendet. Suche über Titel+Inhalt
  (Desktop inline, Mobile ausklappbar). Leerzustand: "Keine Beiträge für diese Auswahl gefunden." + "Filter zurücksetzen".
- Filter (Community): nur Nischen-Ebene (alle Beiträge sind typ=community) + Desktop-Rail + Leerzustand.
- Marktplatz-Platzhalter: cremefarben (#f5f0eb), Kategorie-Text gold zentriert, keine Icons.
- Profil: Bereich (goldenes Badge) + Kanton (graues Badge) nebeneinander, Nischen als cremefarbene Pills,
  Abmelden mit Bestätigungsdialog ("Wirklich abmelden?"). "App installieren"-Box Hintergrund #1c2b4a.
- Sidebar: Trennlinie #e8e0d5, grösseres Logo, mehr Abstand, aktiver Eintrag #fdf6ec/Gold.
- Dokumente: Intro-Platzhalter (cremefarben, goldener Titel "Dokumente & Gesetzestexte") über der Demo-Liste.
