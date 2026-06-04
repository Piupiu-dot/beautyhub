#!/usr/bin/env node
// BeautyHub Reminder – läuft täglich um 11:00 via Cron.
// Erinnert zuständige Tester an ausstehende Freigaben (>24h) und eskaliert nach 48h an den Admin.

require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const { createClient } = require('@supabase/supabase-js')
const Telegram = require('./telegram')

const stundenSeit = (iso) => Math.floor((Date.now() - new Date(iso).getTime()) / 3600000)

// Ist ein Tester für die Nischen eines Posts zuständig?
function zustaendig(tester, postNischen) {
  const tn = tester.nischen || []
  if (tn.includes('alle')) return true
  const pn = (postNischen || '').split(',').map((s) => s.trim()).filter(Boolean)
  return pn.some((n) => tn.includes(n))
}

async function main() {
  const tg = new Telegram()
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_AGENT_KEY)
  const now = Date.now()
  const grenze24 = new Date(now - 24 * 3600000).toISOString()

  // 1. Ausstehende Posts älter als 24h
  const { data: posts } = await supabase.from('posts').select('*').eq('status', 'ausstehend').lt('erstellt_am', grenze24)
  if (!posts || !posts.length) { console.log('[reminder] keine ausstehenden Posts >24h'); return }

  const { data: tester } = await supabase.from('tester_rollen').select('*').eq('aktiv', true)

  for (const post of posts) {
    const alterH = stundenSeit(post.erstellt_am)
    const { data: reminders } = await supabase.from('freigabe_reminder').select('*').eq('post_id', post.id)

    if (!reminders || !reminders.length) {
      // 3. Noch kein Reminder -> zuständige Tester erinnern
      const zustaendige = (tester || []).filter((t) => zustaendig(t, post.nischen))
      for (const t of zustaendige) {
        await tg.sendTesterReminder({ ...post, stunden: alterH }, t)
        await supabase.from('freigabe_reminder').insert({ post_id: post.id, tester_id: t.id, erster_reminder: new Date().toISOString() })
      }
      if (!zustaendige.length) console.log(`[reminder] kein zuständiger Tester für Post ${post.id}`)
    } else if (alterH >= 48 && reminders.some((r) => r.erster_reminder && !r.zweiter_reminder)) {
      // 4. Bereits 24h-Reminder, aber noch kein 48h -> Eskalation an Admin
      await tg.sendEskalation(post)
      for (const r of reminders.filter((r) => !r.zweiter_reminder)) {
        await supabase.from('freigabe_reminder').update({ zweiter_reminder: new Date().toISOString() }).eq('id', r.id)
      }
    }
  }
  console.log(`[reminder] ${posts.length} ausstehende Posts geprüft`)
}

main().catch((e) => { console.error('[reminder] Fehler:', e.message); process.exit(1) })
