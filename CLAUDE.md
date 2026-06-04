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

## Datenbank-Schema (Supabase, Projekt-ID ypdybccegznjlxzqqxut)
Migrationen via Supabase MCP angewendet (kein lokaler supabase/migrations-Ordner). Region eu-west-1, Postgres 17.
Bestehende Tabellen: users, profiles, posts, kommentare, inserate, dokumente, direktnachrichten, nachrichten, user_nischen.

### Agent-Workflow-Tabellen (neu)
**admins** — `user_id uuid PK → auth.users`, `erstellt_am`. Admin = Michael (michael.cunha.schilling@gmail.com).
  Helper `public.is_admin()` (SECURITY DEFINER, search_path=public) prüft Mitgliedschaft ohne RLS-Rekursion.

**quellen** — Scan-Quellen für den Agent:
  `id uuid PK`, `url text NOT NULL UNIQUE`, `name text NOT NULL`, `beschreibung`, `nischen text[]`,
  `rss_feed` (bevorzugt), `aktiv bool=true`, `vorgeschlagen_von → auth.users`, `genehmigt bool=false`,
  `genehmigt_von → auth.users`, `genehmigt_am`, `letzter_scan`, `fehler_count int=0` (3x ohne Ergebnis → Alarm), `erstellt_am`.
  Seed (5, alle genehmigt): BAG Schweiz (+RSS), Swissmedic, Cosmetica Suisse, SDKF, EU Kommission Kosmetik.

**posts** — erweitert um: `status text='ausstehend'` CHECK(ausstehend|genehmigt|abgelehnt|publiziert|in_bearbeitung),
  `freigegeben_von → auth.users`, `freigabe_datum`, `freigabe_kommentar`, `agent_erstellt bool=false`,
  `pexels_bild_url`, `quellen_url`, `quellen_id → quellen`, `relevanz_score int` CHECK(1..10),
  `url_hash text UNIQUE` (MD5 der Quellen-URL, Duplikatschutz), `volltext text` CHECK(≤500 Zeichen, Copyright).
  Index: status, quellen_id. WICHTIG: User-Community-Posts werden mit status='publiziert' eingefügt (kein Freigabe-Flow).

**tester_rollen** — `id PK`, `user_id → auth.users UNIQUE`, `nischen text[]` (Zuständigkeit; 'alle' = alle),
  `kann_quellen_vorschlagen bool=true`, `aktiv bool=true`, `erstellt_am`.

**scan_logs** — `id PK`, `quelle_id → quellen`, `scan_zeitpunkt=now()`, `status` CHECK(erfolg|fehler|keine_neuen_inhalte),
  `gefundene_artikel int=0`, `weitergeleitete_artikel int=0` (relevanz_score≥7), `fehler_meldung`, `dauer_sekunden`.

**freigabe_reminder** — `id PK`, `post_id → posts`, `tester_id → tester_rollen`,
  `erster_reminder` (24h), `zweiter_reminder` (48h, Eskalation Admin), `erledigt bool=false`.

### RLS (alle Tabellen aktiv)
Helper: `is_admin()`, `is_tester()`, `tester_sieht_nische(post_nischen text)` (SECURITY DEFINER; EXECUTE nur authenticated+service_role).
Admin-RPCs (SECURITY DEFINER, self-guarded mit is_admin): `admin_stats()` → json{users,tester,ausstehend,scans_heute},
  `admin_list_tester()` → Tester+Email, `admin_add_tester(p_email,p_nischen)` → legt Tester per E-Mail-Lookup an.
- **posts**: publizierte für alle lesbar; Autor sieht eigene; Tester sehen ALLE Status ihrer Nischen (für Freigabe-Tabs);
  Admin alles; authenticated insert eigene (autor_id=auth.uid()); Tester update ausstehende ihrer Nische.
- **quellen**: authenticated sehen genehmigte (+ eigene Vorschläge); Tester können vorschlagen (genehmigt=false, eigene);
  nur Admin genehmigt/verwaltet.
- **tester_rollen**: nur Admin (lesen+schreiben).
- **scan_logs**: nur Admin.
- **freigabe_reminder**: Tester sehen eigene; Admin alle.
- **admins**: nur Admin.
Agent/Cron arbeitet via service_role (umgeht RLS).

### Offene Sicherheits-Hinweise (Supabase Advisor)
- "Leaked Password Protection" in Auth aktivieren (HaveIBeenPwned) – Auth-Setting, nicht via SQL.
- Vorbestehende Tabellen users/user_nischen/dokumente/direktnachrichten haben RLS aktiv, aber keine Policies (nicht Teil dieses Tasks).

## Tester-/Admin-UI (Agent-Freigabe-Workflow)
- Rollen-Erkennung: `lib/roles.ts` Hook `useRole()` → {isAdmin,isTester,loading} via RPCs is_admin/is_tester
  (tester_rollen ist per RLS nur für Admins lesbar, daher RPC statt Direktabfrage).
- Kanonische Nischen-Keys: `lib/nischen.ts` (laser, gesicht, nagel, pmu, wimpern, haar, med) + nischeLabel().
  WICHTIG: posts.nischen UND tester_rollen.nischen nutzen diese Keys (ILIKE-Matching in tester_sieht_nische).
- **/freigaben** (Tester+Admin, sonst Redirect /feed): Tabs Ausstehend/Genehmigt/Abgelehnt, Karten mit Typ-Badge,
  Datum, Relevanz x/10, Pexels-Vorschau, Nischen-Tags, Quellen-Link. Aktionen: Freigeben (→publiziert,
  freigegeben_von, freigabe_datum), Ablehnen (Pflicht-Grund →abgelehnt, freigabe_kommentar), Bearbeiten-Modal
  (Titel/Zusammenfassung/Nischen; "Speichern" hält ausstehend, "Speichern & Freigeben" publiziert).
- **/quellen** (Tester+Admin): Formular Quelle vorschlagen (genehmigt=false), Liste genehmigter Quellen (read-only),
  Admin sieht zusätzlich Vorschläge mit Genehmigen (genehmigt=true) / Ablehnen (delete).
- **/admin** (nur Admin): Statistiken (admin_stats), Tester verwalten (admin_list_tester / admin_add_tester,
  Nischen-Toggle + aktiv-Toggle direkt auf tester_rollen), Quellen genehmigen, letzte 10 Scan-Logs.
- Navigation: Sidebar + BottomNav zeigen Freigaben (rotes Badge = Anzahl ausstehend), Quellen (Tester/Admin),
  Admin (nur Admin) rollenabhängig.
- Beispieldaten geseedet: 3 ausstehende Agent-Posts + 4 Scan-Logs (zum Testen der UI).
- Hinweis: Michael ist Admin (kein Tester) → sieht via RLS alle ausstehenden Posts in /freigaben.

## Agent (Ordner agent/, Node CommonJS, läuft auf Mac mini via Cron)
Eigenständiger Scan-/Monitoring-Agent. Nutzt globales fetch (Node 18+), kein node-fetch-Import.
Setup/Keys/Cron: siehe agent/README.md. Konfiguration in agent/.env (NIE committen; .env.example als Vorlage).
- **scan.js** (täglich 07:00): lädt aktive+genehmigte quellen → RSS (rss-parser) bevorzugt, sonst Scrape (cheerio)
  → Filter: 7 Tage, url_hash-Duplikat, Keyword-Vorfilter (DE/FR/IT/EN), Titel-Ähnlichkeit (Jaccard ≥0.8 skip)
  → Claude (claude-haiku-4-5, System-Prompt mit Prompt-Caching, robustes extractJSON) max 10 Calls/Scan
  → Score ≥7 → Pexels-Bild (mit Nischen-Fallbacks, null bei Misserfolg) → insert posts status='ausstehend',
  agent_erstellt=true. Pro Quelle scan_logs-Eintrag, fehler_count reset/erhöht. Budget-Stopp bei $1/Lauf.
  Danach Healthchecks-Ping + Telegram-Scan-Bericht. Flags: --dry-run (→agent/dry-run-results.json), --test (1 Artikel/Quelle).
- **monitor.js** (stündlich): kein Scan heute nach 08:00 → Alarm; quellen.fehler_count≥3 → Alarm; posts>48h ausstehend → Eskalation. Sonst still.
- **reminder.js** (täglich 11:00): ausstehende Posts >24h → Tester (nach Nischen-Match) erinnern + freigabe_reminder anlegen; >48h ohne 2. Reminder → Eskalation an Admin.
- **telegram-webhook.js** (Dauerprozess, Port 3001, Node http): Tester-Antworten JA/✅→publiziert, NEIN/❌→abgelehnt, ÄNDERN <txt>→in_bearbeitung; sonst Hilfe. Autorisierung via TELEGRAM_CHAT_ID.
- **telegram.js**: Klasse mit sendScanBericht/sendFehlerAlarm/sendTesterReminder/sendEskalation/sendTagesbudgetWarnung/sendHeartbeat (schlägt nie hart fehl).
- **config.js**: Budget/Limits/Timeouts. **healthchecks.io**: Period 1d/Grace 1h → Alarm wenn 25h kein Ping.
- WICHTIG: Agent braucht service_role-Key (SUPABASE_AGENT_KEY) um RLS zu umgehen (ausstehende Posts anlegen, tester_rollen lesen). Nur server-seitig, nie im Frontend.
- Claude-typ GESETZ/NEWS/TREND/KI → posts.typ (gesetz/news/trend/news); Nischen-Labels → Keys (lib/nischen-Vokabular).
