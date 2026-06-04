#!/usr/bin/env node
// BeautyHub Telegram-Webhook – verarbeitet Tester-Antworten.
// Läuft als kleiner HTTP-Server auf Port 3001 (Node-Builtin, kein Express).
// Telegram sendet eingehende Nachrichten an: https://[tailscale-ip]:3001/telegram-webhook
//
// Befehle:
//   JA / ✅              -> letzten ausstehenden Post freigeben (publiziert)
//   NEIN / ❌            -> letzten ausstehenden Post ablehnen
//   ÄNDERN <kommentar>   -> Kommentar speichern, status=in_bearbeitung
//   sonst                -> Hilfetext

require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const http = require('http')
const { createClient } = require('@supabase/supabase-js')

const PORT = 3001
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_AGENT_KEY)

const HILFE =
`🤖 BeautyHub – So antwortest du:
✅ JA – Beitrag freigeben
❌ NEIN – Beitrag ablehnen
✏️ ÄNDERN <dein Kommentar> – zur Überarbeitung`

async function sendeAntwort(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) { console.warn('[webhook] kein Bot-Token, Antwort:', text); return }
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    })
  } catch (e) { console.error('[webhook] Antwort-Fehler:', e.message) }
}

// Letzter (neuester) ausstehender Post
async function letzterAusstehender() {
  const { data } = await supabase.from('posts').select('*').eq('status', 'ausstehend').order('erstellt_am', { ascending: false }).limit(1).maybeSingle()
  return data
}

async function verarbeite(text, chatId) {
  const t = (text || '').trim()
  const upper = t.toUpperCase()

  if (upper === 'JA' || t === '✅' || upper.startsWith('JA ')) {
    const post = await letzterAusstehender()
    if (!post) return sendeAntwort(chatId, 'Kein ausstehender Beitrag vorhanden.')
    await supabase.from('posts').update({ status: 'publiziert', freigabe_datum: new Date().toISOString() }).eq('id', post.id)
    return sendeAntwort(chatId, `✅ Freigegeben & publiziert:\n${post.titel}`)
  }

  if (upper === 'NEIN' || t === '❌' || upper.startsWith('NEIN ')) {
    const post = await letzterAusstehender()
    if (!post) return sendeAntwort(chatId, 'Kein ausstehender Beitrag vorhanden.')
    await supabase.from('posts').update({ status: 'abgelehnt', freigabe_kommentar: 'Abgelehnt via Telegram', freigabe_datum: new Date().toISOString() }).eq('id', post.id)
    return sendeAntwort(chatId, `❌ Abgelehnt:\n${post.titel}`)
  }

  if (upper.startsWith('ÄNDERN') || upper.startsWith('ANDERN')) {
    const kommentar = t.replace(/^ändern|^andern/i, '').trim()
    if (!kommentar) return sendeAntwort(chatId, 'Bitte Kommentar angeben: ÄNDERN <dein Kommentar>')
    const post = await letzterAusstehender()
    if (!post) return sendeAntwort(chatId, 'Kein ausstehender Beitrag vorhanden.')
    await supabase.from('posts').update({ status: 'in_bearbeitung', freigabe_kommentar: kommentar }).eq('id', post.id)
    return sendeAntwort(chatId, `✏️ Zur Überarbeitung markiert:\n${post.titel}\nKommentar: ${kommentar}`)
  }

  return sendeAntwort(chatId, HILFE)
}

const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || !req.url.includes('/telegram-webhook')) { res.writeHead(404); return res.end() }
  let body = ''
  req.on('data', (c) => { body += c; if (body.length > 1e6) req.destroy() })
  req.on('end', async () => {
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"ok":true}')
    try {
      const update = JSON.parse(body || '{}')
      const msg = update.message || update.edited_message
      if (!msg || !msg.text) return
      const chatId = String(msg.chat.id)
      // Autorisierung: nur der konfigurierte Chat darf Beiträge steuern
      if (process.env.TELEGRAM_CHAT_ID && chatId !== String(process.env.TELEGRAM_CHAT_ID)) {
        return sendeAntwort(chatId, 'Nicht autorisiert.')
      }
      await verarbeite(msg.text, chatId)
    } catch (e) { console.error('[webhook] Verarbeitungsfehler:', e.message) }
  })
})

server.listen(PORT, () => console.log(`[webhook] BeautyHub Telegram-Webhook läuft auf Port ${PORT} (/telegram-webhook)`))
