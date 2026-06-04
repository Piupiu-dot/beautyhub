# BeautyHub Agent

Autonomer Scan- und Monitoring-Agent für BeautyHub Schweiz. Er durchsucht genehmigte
Quellen nach relevanten Gesetzes-/Branchen-News, bewertet sie mit Claude, holt ein
passendes Pexels-Bild und legt relevante Beiträge (`status='ausstehend'`) zur Tester-Freigabe an.

## Bestandteile

| Datei | Zweck | Ausführung |
|---|---|---|
| `scan.js` | Quellen scannen, analysieren, Beiträge anlegen | täglich 07:00 (Cron) |
| `monitor.js` | Health-Checks, sendet Alarme bei Problemen | stündlich (Cron) |
| `reminder.js` | erinnert Tester an offene Freigaben, eskaliert nach 48h | täglich 11:00 (Cron) |
| `telegram-webhook.js` | verarbeitet Tester-Antworten (JA/NEIN/ÄNDERN) | Dauerprozess, Port 3001 |
| `telegram.js` | Telegram-Benachrichtigungen (Klasse) | – |
| `config.js` | zentrale Konfiguration (Budget, Limits, Timeouts) | – |

## 1. Installation & Setup

```bash
# Im Projekt-Root (Pakete sind bereits in package.json):
npm install

# Agent-Konfiguration anlegen:
cp agent/.env.example agent/.env
# agent/.env mit echten Werten füllen (siehe unten). agent/.env wird NICHT committet.
```

> Node 18+ erforderlich (für globales `fetch`). Getestet mit Node 22.

## 2. API-Keys beschaffen

- **Supabase** `SUPABASE_AGENT_KEY`: Dashboard → Project Settings → API → `service_role` key.
  Der Agent umgeht damit RLS (nötig zum Anlegen ausstehender Posts und Lesen von `tester_rollen`).
  Nur auf dem Mac mini ablegen, niemals ins Frontend/Git.
- **Anthropic** `ANTHROPIC_API_KEY`: https://console.anthropic.com → API Keys.
- **Pexels** `PEXELS_API_KEY` (kostenlos): https://www.pexels.com/api/ → Konto erstellen → API-Key kopieren.
- **Telegram Bot** `TELEGRAM_BOT_TOKEN`: In Telegram **@BotFather** öffnen → `/newbot` → Namen vergeben → Token kopieren.
  `TELEGRAM_CHAT_ID`: Bot anschreiben, dann `https://api.telegram.org/bot<TOKEN>/getUpdates` aufrufen und die `chat.id` auslesen
  (oder den Bot **@userinfobot** fragen).
- **Healthchecks.io** `HEALTHCHECKS_URL` (kostenlos):
  1. Konto auf https://healthchecks.io erstellen.
  2. Neuen Check anlegen, **Period = 1 day, Grace = 1 hour** (Alarm, wenn 25h kein Signal kommt).
  3. Die Ping-URL (`https://hc-ping.com/<uuid>`) als `HEALTHCHECKS_URL` eintragen.
  4. In den Integrations des Checks Email und/oder Telegram als Alarmkanal hinterlegen.
  `scan.js` pingt diese URL nach jedem erfolgreichen Scan; bleibt der Ping aus, alarmiert healthchecks.io.

## 3. Cron-Jobs auf dem Mac mini

`crontab -e` öffnen und eintragen (Pfad anpassen):

```cron
0 7 * * * node /pfad/beautyhub/agent/scan.js     >> /pfad/beautyhub/agent/scan.log 2>&1
0 * * * * node /pfad/beautyhub/agent/monitor.js
0 11 * * * node /pfad/beautyhub/agent/reminder.js
```

> Hinweis: macOS schläft. Damit Cron zuverlässig läuft, Energiesparen anpassen
> (`System­einstellungen → Energie → "Bei Display-Aus nicht in den Ruhezustand"`) oder `caffeinate` nutzen.

## 4. Erster Test (ohne zu speichern)

```bash
node agent/scan.js --dry-run
```
Schreibt das Ergebnis nach `agent/dry-run-results.json` und speichert NICHTS in Supabase.

Weitere Flags:
- `--test` → nur 1 Artikel pro Quelle, speichert aber in Supabase (kleiner Echtlauf).

## 5. Telegram-Webhook starten

```bash
node agent/telegram-webhook.js   # lauscht auf Port 3001 unter /telegram-webhook
```

Telegram muss die eingehenden Nachrichten an den Server senden. Mit Tailscale-IP:

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<tailscale-ip>:3001/telegram-webhook"
```

Tester antworten dann direkt im Chat: `JA`, `NEIN`, oder `ÄNDERN <Kommentar>`.

## Konfiguration (`config.js`)

| Wert | Default | Bedeutung |
|---|---|---|
| `MAX_CLAUDE_CALLS_PRO_SCAN` | 10 | Obergrenze Claude-Calls pro Scan |
| `MAX_ARTIKEL_ALTER_TAGE` | 7 | nur Artikel der letzten 7 Tage |
| `MIN_RELEVANZ_SCORE` | 7 | ab diesem Score wird ein Beitrag angelegt |
| `MAX_FEHLER_PRO_QUELLE` | 3 | ab 3 Fehlern → Monitor-Alarm |
| `VOLLTEXT_MAX_ZEICHEN` | 500 | Copyright: nie Volltext speichern |
| `TAGES_BUDGET_USD` | 1.00 | Scan stoppt bei erreichtem Budget |

## Sicherheits-/Kostenhinweise

- **Copyright:** `volltext` ist auf 500 Zeichen begrenzt; nie der vollständige Originaltext.
- **Budget:** Der Scan stoppt, sobald die geschätzten Kosten `TAGES_BUDGET_USD` erreichen
  (Schätzung pro Lauf anhand der Claude-Token-Usage; für ein echtes Tagesbudget über mehrere
  Läufe wäre eine persistente Kosten-Tabelle nötig).
- **Modell:** `claude-haiku-4-5` mit Prompt-Caching des System-Prompts (günstig & schnell).
