#!/usr/bin/env node
// BeautyHub Monitor – läuft stündlich via Cron.
// Sendet nur bei Problemen Telegram-Alarme (kein Spam, wenn alles ok).

require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
const cfg = require('./config')
const Telegram = require('./telegram')

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`
  try { fs.appendFileSync(path.join(__dirname, 'monitor.log'), line) } catch {}
  console.log(msg.trim())
}

async function main() {
  const tg = new Telegram()
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_AGENT_KEY)
  const now = new Date()
  const tagesBeginn = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  // 1. War heute ein Scan?
  const { count: scansHeute } = await supabase.from('scan_logs').select('id', { count: 'exact', head: true }).gte('scan_zeitpunkt', tagesBeginn)
  if (!scansHeute && now.getHours() >= 8) {
    log('ALARM: Heute noch kein Scan nach 08:00')
    await tg.sendFehlerAlarm({ fehler_typ: 'Kein Scan heute', quelle_name: '–', fehler_meldung: 'Bis nach 08:00 Uhr wurde kein Scan registriert.' })
  }

  // 2. Quellen mit fehler_count >= MAX_FEHLER_PRO_QUELLE
  const { data: kaputt } = await supabase.from('quellen').select('*').gte('fehler_count', cfg.MAX_FEHLER_PRO_QUELLE)
  for (const q of kaputt || []) {
    log(`ALARM: Quelle ${q.name} hat fehler_count=${q.fehler_count}`)
    await tg.sendFehlerAlarm({ fehler_typ: `Quelle ${cfg.MAX_FEHLER_PRO_QUELLE}x fehlgeschlagen`, quelle_name: q.name, fehler_meldung: `fehler_count=${q.fehler_count}. Quelle prüfen/deaktivieren.` })
  }

  // 3. Ausstehende Posts > 48h
  const grenze48 = new Date(now.getTime() - 48 * 3600000).toISOString()
  const { data: alt } = await supabase.from('posts').select('id, titel, erstellt_am').eq('status', 'ausstehend').lt('erstellt_am', grenze48)
  for (const p of alt || []) {
    log(`ESKALATION: Post "${p.titel}" seit >48h ausstehend`)
    await tg.sendEskalation(p)
  }

  if (scansHeute && !(kaputt || []).length && !(alt || []).length) log('OK – keine Auffälligkeiten')
}

main().catch((e) => { log('Monitor-Fehler: ' + e.message); process.exit(1) })
