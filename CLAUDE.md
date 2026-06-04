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
- Header auf allen App-Seiten: "BeautyHub" als Logo oben links
- Feed/Community 1-spaltig (volle Breite), Marktplatz 2-spaltig (lg: 3-spaltig)
- Filter-/Kategorie-Keys (z.B. laser, geraete, mobel) sind INTERNE Filterwerte → nicht umbenennen, nur Label-Maps für die Anzeige
- Nach jeder Änderung: git add . && git commit -m "..." && git push

## Design-Tokens (Stand Redesign)
- Hintergrund: #faf8f5 (warm off-white) · Karten: .card-Klasse (globals.css) = #fff, 1px #f0ece6, radius 12px, shadow 0 1px 3px rgba(0,0,0,.06)
- Gold (Primär) #b8924a · Dunkelblau #1c2b4a · Text primär #1a1a1a · Text sekundär #6b7280 · Trennlinien #f0ece6 · Aktiv-Creme #fdf6ec
- Typ-Badges als weiche Pills: Gesetz #fdf6ec/#b8924a · News #f0f4ff/#1c2b4a · Trend #f0faf5/#2d6a4f · KI #f5f0fa/#6b4c8b
- Marktplatz-Zustand: NEU #dcfce7/#166534, GEBRAUCHT #f0ece6/#6b7280
- Schrift: Jost (Body) + Cormorant Garamond (.font-serif) – beibehalten
- Neue Surface? → `.card`-Klasse verwenden statt bg-white/rounded-2xl/shadow-sm

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
- Sidebar (components/Sidebar.tsx, lg+): 220px, Trennlinie #f0ece6, Logo "BeautyHub" (#1c2b4a) + "SCHWEIZ" gold.
  Nav-Items 44px, aktiv = #fdf6ec + Gold + linke 3px-Goldlinie. Unten Profil-Widget (Avatar + Name + Abmelden mit Dialog).
- BottomNav (components/BottomNav.tsx, <lg): 60px, obere Trennlinie #f0ece6, aktiver Tab = Gold + 2px-Goldlinie oben.
- Feed-Karten (components/PostCard.tsx): KEIN Banner. .card-Stil, weiche Typ-Pill + Datum oben, Titel 18px,
  Beschreibung 2 Zeilen grau, Quelle (gold) + Herz unten. Datum via lib/demo.ts formatDatum ("vor 2 Tagen" / "12. Mai 2026").
- Detailseite feed/[id]: solider Branding-Farb-Hero + Titel, Inhalt, Quelle, Datum, Tags.
- Demo-Daten zentral in lib/demo.ts (DEMO_POSTS, DEMO_COMMUNITY, findDemoPost). Feed/Community/Detail teilen sie.
  WICHTIG: Detailseite fällt auf findDemoPost(id) zurück, wenn die DB-Query (UUID-Spalte) für Demo-IDs wie '1'/'c1'
  nichts liefert → behebt den "Beitrag nicht gefunden"-Bug.
- Filter (Feed): 2 Ebenen, kombinierbar + clientseitig (useMemo). Ebene 1 Content-Typ (Alle/Gesetze/News/Trends/KI,
  KI=ist_agent) als Tabs mit goldenem Unterstrich, Ebene 2 Nischen-Pills (gold ausgefüllt = aktiv).
  Desktop (md+): vertikale Filter-Rail (INHALT/NISCHE), horizontale Leisten ausgeblendet. Suche über Titel+Inhalt
  (Desktop inline, Mobile ausklappbar). Leerzustand: "Keine Beiträge für diese Auswahl gefunden." + "Filter zurücksetzen".
- Filter (Community): nur Nischen-Ebene (alle Beiträge sind typ=community) + Desktop-Rail + Leerzustand. Karten im .card-Stil.
- Marktplatz: 2-spaltig, lg: 3-spaltig. Platzhalter #faf8f5 + Kategorie-Text gold zentriert. Preis gold 16px semibold.
  NEU-Badge grün (#dcfce7/#166534), GEBRAUCHT grau (#f0ece6/#6b7280).
- Profil: Header-Bereich cremefarben #fdf6ec, Avatar 72px, Bereich (goldenes Badge) + Kanton (graues Badge),
  Nischen als cremefarbene Pills (max 5 + "+n"), Abmelden-Dialog. "App installieren"-Box #1c2b4a.
- Dokumente: elegante Platzhalter-Seite (cremefarbener Block, Titel "Dokumente & Gesetzestexte" in #1c2b4a,
  Untertitel, "In Kürze verfügbar"-Badge). Frühere Demo-Liste entfernt.
