#!/usr/bin/env node
// BeautyHub Agent – Haupt-Scan.
// Holt Artikel aus genehmigten Quellen, filtert per Keywords, bewertet sie mit Claude
// und legt relevante Beiträge als status='ausstehend' zur Tester-Freigabe an.
//
// Flags:
//   --dry-run   nichts speichern, Ergebnis -> agent/dry-run-results.json
//   --test      nur 1 Artikel pro Quelle, speichert in Supabase

require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const RSSParser = require('rss-parser')
const cheerio = require('cheerio')
const { createClient } = require('@supabase/supabase-js')
const Anthropic = require('@anthropic-ai/sdk')
const cfg = require('./config')
const Telegram = require('./telegram')

const DRY_RUN = process.argv.includes('--dry-run')
const TEST = process.argv.includes('--test')

const MODEL = 'claude-haiku-4-5-20251001'
// Ungefähre Preise (USD pro 1 Mio Tokens) – nur zur Budget-Schätzung.
const PREIS = { input: 1.0, output: 5.0, cache_read: 0.1, cache_write: 1.25 }

// ---------- Keyword-Vorfilter (DE/FR/IT/EN) ----------
const KEYWORDS = [
  'Verordnung','Richtlinie','Bewilligung','Zulassung','Verbot','Änderung','Gesetz','Vorschrift','Pflicht','Kosmetik','Behandlung','Gerät','Zertifizierung','Hygiene',
  'ordonnance','directive','autorisation','interdiction','modification','loi','règlement','obligation','cosmétique',
  'ordinanza','direttiva','autorizzazione','divieto','modifica','legge','regolamento','cosmetico',
  'regulation','directive','authorization','prohibition','amendment','law','requirement','cosmetic','laser','treatment',
].map((k) => k.toLowerCase())

// ---------- Pexels-Fallback pro Nische ----------
const PEXELS_FALLBACK = {
  'Laser & IPL': 'professional laser treatment salon',
  'Nails': 'professional nail salon manicure',
  'PMU': 'permanent makeup artist professional',
  'Gesicht & Haut': 'facial treatment beauty salon',
  'Haare': 'professional hair salon',
  'Lashes & Brows': 'eyelash extension professional',
  'Medizinisch': 'medical aesthetics clinic',
}

const SYSTEM_PROMPT = `Du bist Experte für Schweizer und EU-Gesetzgebung im Beauty-Bereich.
Analysiere den Artikel für BeautyHub Schweiz, eine B2B-Plattform
für Schweizer Beauty-Fachleute.

WICHTIG: Antworte NUR mit rohem JSON. Kein Markdown, keine Backticks,
kein Text davor oder danach.

Relevanz-Beispiele:
✅ Score 9: "BAG erlässt Bewilligungspflicht für IPL-Geräte ab 2026"
✅ Score 8: "EU verbietet 15 Inhaltsstoffe in Kosmetika"
❌ Score 2: "Neue Lippenstift-Kollektion von L'Oréal"
❌ Score 3: "Beauty-Influencerin empfiehlt Hautpflege-Routine"

{
  "relevant": true/false,
  "relevanz_score": 1-10,
  "typ": "GESETZ" | "NEWS" | "TREND" | "KI",
  "titel": "Deutsch, max 60 Zeichen",
  "zusammenfassung": "2-3 Sätze Deutsch: was ändert sich + Bedeutung für Schweizer Beauty-Profis",
  "volltext": "Max 500 Zeichen, nie vollständiger Originaltext",
  "nischen": ["Laser & IPL", "Gesicht & Haut", "Nails", "PMU",
              "Lashes & Brows", "Haare", "Medizinisch"],
  "pexels_suchbegriff": "Englischer Begriff, professionell beauty-bezogen"
}`

// typ (GESETZ/NEWS/TREND/KI) -> posts.typ-Key
const TYP_MAP = { GESETZ: 'gesetz', NEWS: 'news', TREND: 'trend', KI: 'news' }
// Anzeige-Label -> posts.nischen-Key
const NISCHE_KEY = {
  'Laser & IPL': 'laser', 'Gesicht & Haut': 'gesicht', 'Nails': 'nagel', 'PMU': 'pmu',
  'Lashes & Brows': 'wimpern', 'Haare': 'haar', 'Medizinisch': 'med',
}

// ---------- Robustes JSON-Parsing ----------
const extractJSON = (text) => {
  const cleaned = text.replace(/```json|```/g, '').trim()
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Kein JSON in Claude Response')
  return JSON.parse(match[0])
}

// ---------- Hilfsfunktionen ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const md5 = (s) => crypto.createHash('md5').update(s).digest('hex')

function hatKeyword(text) {
  const t = (text || '').toLowerCase()
  return KEYWORDS.some((k) => t.includes(k))
}

// Titel-Ähnlichkeit (Token-Jaccard) – 0..1
function aehnlichkeit(a, b) {
  const norm = (s) => new Set((s || '').toLowerCase().replace(/[^a-zäöü0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3))
  const A = norm(a), B = norm(b)
  if (!A.size || !B.size) return 0
  let inter = 0
  for (const w of A) if (B.has(w)) inter++
  return inter / new Set([...A, ...B]).size
}

function istNeu(datum) {
  if (!datum) return true // ohne Datum behalten
  const alterTage = (Date.now() - new Date(datum).getTime()) / 86400000
  return alterTage >= 0 && alterTage <= cfg.MAX_ARTIKEL_ALTER_TAGE
}

async function mitTimeout(promise, ms) {
  let t
  const timeout = new Promise((_, rej) => { t = setTimeout(() => rej(new Error('Timeout')), ms) })
  try { return await Promise.race([promise, timeout]) } finally { clearTimeout(t) }
}

async function mitRetry(fn) {
  let last
  for (let i = 0; i < cfg.RETRY_VERSUCHE; i++) {
    try { return await fn() } catch (e) { last = e; if (i < cfg.RETRY_VERSUCHE - 1) await sleep(cfg.RETRY_PAUSE_MS) }
  }
  throw last
}

// ---------- Artikel aus einer Quelle holen ----------
const rss = new RSSParser({
  timeout: cfg.REQUEST_TIMEOUT_MS,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) BeautyHubBot/1.0',
    Accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7',
  },
})

async function holeArtikel(quelle) {
  if (quelle.rss_feed) {
    const feed = await mitRetry(() => rss.parseURL(quelle.rss_feed))
    return (feed.items || []).map((i) => ({
      titel: i.title || '', link: i.link || quelle.url,
      inhalt: (i.contentSnippet || i.content || i.summary || '').toString(),
      datum: i.isoDate || i.pubDate || null,
    }))
  }
  // Fallback: Website scrapen (Best-Effort)
  const res = await mitTimeout(fetch(quelle.url, { headers: { 'User-Agent': 'BeautyHubBot/1.0' } }), cfg.REQUEST_TIMEOUT_MS)
  const html = await res.text()
  const $ = cheerio.load(html)
  const artikel = []
  $('article, .news-item, .teaser, li').slice(0, 20).each((_, el) => {
    const titel = $(el).find('h1, h2, h3, a').first().text().trim()
    const link = $(el).find('a').first().attr('href') || quelle.url
    const inhalt = $(el).text().replace(/\s+/g, ' ').trim().slice(0, 2000)
    if (titel && titel.length > 15) artikel.push({ titel, link: link.startsWith('http') ? link : quelle.url, inhalt, datum: null })
  })
  return artikel
}

// ---------- Pexels ----------
async function holePexelsBild(begriff, nischenLabels) {
  const key = process.env.PEXELS_API_KEY
  if (!key) return null
  const versuche = [begriff, ...(nischenLabels || []).map((n) => PEXELS_FALLBACK[n]).filter(Boolean), 'beauty salon professional']
  for (const q of versuche) {
    if (!q) continue
    try {
      const res = await mitTimeout(fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=1&orientation=landscape`, { headers: { Authorization: key } }), cfg.REQUEST_TIMEOUT_MS)
      const json = await res.json()
      const url = json?.photos?.[0]?.src?.large
      if (url) return url
    } catch { /* nächster Fallback */ }
  }
  return null // kein Crash
}

// ---------- Claude-Analyse ----------
function kostenAusUsage(u) {
  if (!u) return 0
  return (
    ((u.input_tokens || 0) * PREIS.input +
     (u.output_tokens || 0) * PREIS.output +
     (u.cache_read_input_tokens || 0) * PREIS.cache_read +
     (u.cache_creation_input_tokens || 0) * PREIS.cache_write) / 1_000_000
  )
}

async function analysiere(anthropic, quelle, artikel, letzteTitel) {
  const userText =
`Bereits publizierte Titel (Duplikate vermeiden):
${letzteTitel.map((t) => '- ' + t).join('\n') || '(keine)'}

Artikel:
Quelle: ${quelle.name}
Titel: ${artikel.titel}
Inhalt: ${(artikel.inhalt || '').slice(0, 2000)}`

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 700,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: userText }],
  })
  const text = (resp.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('')
  return { result: extractJSON(text), kosten: kostenAusUsage(resp.usage) }
}

// ---------- Main ----------
async function main() {
  const start = Date.now()
  const tg = new Telegram()
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_AGENT_KEY)
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const stats = { anzahl_quellen: 0, anzahl_artikel: 0, anzahl_relevant: 0, anzahl_ausstehend: 0, kosten: 0 }
  const fehlerListe = []
  const dryResults = []
  let claudeCalls = 0
  let budgetGestoppt = false

  // 2. Letzte 5 publizierte Titel
  const { data: letzte } = await supabase.from('posts').select('titel').eq('status', 'publiziert').order('erstellt_am', { ascending: false }).limit(5)
  const letzteTitel = (letzte || []).map((p) => p.titel)
  const gesehenTitel = [...letzteTitel]

  // 3. Aktive, genehmigte Quellen
  const { data: quellen } = await supabase.from('quellen').select('*').eq('aktiv', true).eq('genehmigt', true)
  stats.anzahl_quellen = (quellen || []).length

  for (const quelle of quellen || []) {
    if (budgetGestoppt) break
    const qStart = Date.now()
    let gefunden = 0, weitergeleitet = 0, scanStatus = 'keine_neuen_inhalte', fehlerMeldung = null
    try {
      // 4a. Artikel holen
      let artikel = await holeArtikel(quelle)
      // 4b. Letzte 7 Tage
      artikel = artikel.filter((a) => istNeu(a.datum))
      if (TEST) artikel = artikel.slice(0, 1)
      gefunden = artikel.length

      for (const a of artikel) {
        if (claudeCalls >= cfg.MAX_CLAUDE_CALLS_PRO_SCAN) break
        if (stats.kosten >= cfg.TAGES_BUDGET_USD) { budgetGestoppt = true; break }

        // 4c. URL-Hash Duplikat-Check
        const hash = md5(a.link)
        const { data: dup } = await supabase.from('posts').select('id').eq('url_hash', hash).maybeSingle()
        if (dup) continue

        // 4d. Keyword-Vorfilter
        if (!hatKeyword(a.titel + ' ' + a.inhalt)) continue

        // 4e. Titel-Ähnlichkeit (80% -> überspringen)
        if (gesehenTitel.some((t) => aehnlichkeit(t, a.titel) >= 0.8)) continue

        // 4f. Claude-Call
        claudeCalls++
        let analyse
        try {
          analyse = await analysiere(anthropic, quelle, a, letzteTitel)
        } catch (e) {
          fehlerListe.push(`${quelle.name}: Claude/JSON-Fehler (${e.message})`)
          continue
        }
        stats.kosten += analyse.kosten
        const r = analyse.result
        if (!r.relevant || (r.relevanz_score || 0) < cfg.MIN_RELEVANZ_SCORE) continue
        stats.anzahl_relevant++
        gesehenTitel.push(r.titel || a.titel)

        // 4g. Pexels-Bild
        const bild = await holePexelsBild(r.pexels_suchbegriff, r.nischen)

        const nischenKeys = (r.nischen || []).map((n) => NISCHE_KEY[n] || n).filter(Boolean)
        const post = {
          titel: (r.titel || a.titel).slice(0, 200),
          zusammenfassung: r.zusammenfassung || '',
          volltext: (r.volltext || '').slice(0, cfg.VOLLTEXT_MAX_ZEICHEN),
          typ: TYP_MAP[r.typ] || 'news',
          nischen: nischenKeys.join(','),
          ist_agent: true,
          agent_erstellt: true,
          status: 'ausstehend',
          quelle_name: quelle.name,
          quelle_url: a.link,
          quellen_url: a.link,
          quellen_id: quelle.id,
          relevanz_score: r.relevanz_score,
          pexels_bild_url: bild,
          url_hash: hash,
        }

        if (DRY_RUN) {
          dryResults.push(post)
        } else {
          const { error } = await supabase.from('posts').insert(post)
          if (error) { fehlerListe.push(`${quelle.name}: Insert-Fehler (${error.message})`); continue }
        }
        weitergeleitet++
        stats.anzahl_ausstehend++
      }

      stats.anzahl_artikel += gefunden
      scanStatus = weitergeleitet > 0 ? 'erfolg' : (gefunden > 0 ? 'erfolg' : 'keine_neuen_inhalte')

      // 4i. fehler_count zurücksetzen
      if (!DRY_RUN) await supabase.from('quellen').update({ fehler_count: 0, letzter_scan: new Date().toISOString() }).eq('id', quelle.id)
    } catch (e) {
      scanStatus = 'fehler'
      fehlerMeldung = e.message
      fehlerListe.push(`${quelle.name}: ${e.message}`)
      if (!DRY_RUN) {
        await supabase.from('quellen').update({ fehler_count: (quelle.fehler_count || 0) + 1, letzter_scan: new Date().toISOString() }).eq('id', quelle.id)
      }
    }

    // Scan-Log pro Quelle
    if (!DRY_RUN) {
      await supabase.from('scan_logs').insert({
        quelle_id: quelle.id, status: scanStatus, gefundene_artikel: gefunden,
        weitergeleitete_artikel: weitergeleitet, fehler_meldung: fehlerMeldung,
        dauer_sekunden: Math.round((Date.now() - qStart) / 1000),
      })
    }

    await sleep(cfg.PAUSE_ZWISCHEN_QUELLEN_MS)
  }

  stats.sekunden = Math.round((Date.now() - start) / 1000)
  if (fehlerListe.length) stats.fehler_zusammenfassung = `${fehlerListe.length} Fehler:\n` + fehlerListe.slice(0, 5).join('\n')

  // Budget-Warnung
  if (budgetGestoppt) await tg.sendTagesbudgetWarnung(stats.kosten)

  // Dry-Run-Ausgabe
  if (DRY_RUN) {
    fs.writeFileSync(path.join(__dirname, 'dry-run-results.json'), JSON.stringify({ stats, posts: dryResults }, null, 2))
    console.log(`[dry-run] ${dryResults.length} Beiträge -> agent/dry-run-results.json`)
    console.log(JSON.stringify(stats, null, 2))
    return
  }

  // 5. Healthchecks.io Ping
  if (process.env.HEALTHCHECKS_URL) {
    try { await fetch(process.env.HEALTHCHECKS_URL) } catch (e) { console.error('[healthchecks] Ping fehlgeschlagen:', e.message) }
  }

  // 6. Telegram-Bericht
  await tg.sendScanBericht(stats)
  console.log('[scan] fertig', stats)
}

main().catch(async (e) => {
  console.error('[scan] Fataler Fehler:', e)
  try { await new Telegram().sendFehlerAlarm({ fehler_typ: 'Scan abgebrochen', quelle_name: '–', fehler_meldung: e.message }) } catch {}
  process.exit(1)
})
