// Telegram-Benachrichtigungen für den BeautyHub-Agent.
// Verwendet die Telegram Bot API (https://core.telegram.org/bots/api).

const CHF = (n) => (Number(n) || 0).toFixed(2)
const FREIGABEN_URL = 'https://www.thebeautyhub.ch/freigaben'

function jetzt() {
  const d = new Date()
  const datum = d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const uhrzeit = d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })
  return { datum, uhrzeit }
}

class Telegram {
  constructor(token = process.env.TELEGRAM_BOT_TOKEN, chatId = process.env.TELEGRAM_CHAT_ID) {
    this.token = token
    this.chatId = chatId
  }

  // Zentrale Sende-Methode. Schlägt nie hart fehl (Agent soll wegen Telegram nicht crashen).
  async send(text) {
    if (!this.token || !this.chatId) {
      console.warn('[telegram] TELEGRAM_BOT_TOKEN/CHAT_ID fehlt – Nachricht nur im Log:\n' + text)
      return { ok: false, skipped: true }
    }
    try {
      const res = await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: this.chatId, text, disable_web_page_preview: true }),
      })
      const json = await res.json().catch(() => ({}))
      if (!json.ok) console.error('[telegram] Fehler:', json.description || res.status)
      return json
    } catch (e) {
      console.error('[telegram] Sendefehler:', e.message)
      return { ok: false, error: e.message }
    }
  }

  sendScanBericht(stats) {
    const { datum, uhrzeit } = jetzt()
    let text =
`✅ BeautyHub Scan abgeschlossen
📅 ${datum} um ${uhrzeit}

📰 Quellen gescannt: ${stats.anzahl_quellen ?? 0}
🔍 Artikel gefunden: ${stats.anzahl_artikel ?? 0}
✨ Relevant (Score ≥7): ${stats.anzahl_relevant ?? 0}
📋 Zur Freigabe ausstehend: ${stats.anzahl_ausstehend ?? 0}
💰 Kosten heute: $${CHF(stats.kosten)}
⏱ Dauer: ${stats.sekunden ?? 0}s`
    if (stats.fehler_zusammenfassung) text += `\n\n⚠️ ${stats.fehler_zusammenfassung}`
    return this.send(text)
  }

  sendFehlerAlarm(fehler) {
    const { datum, uhrzeit } = jetzt()
    return this.send(
`🚨 BeautyHub Agent Fehler

❌ ${fehler.fehler_typ || 'Unbekannter Fehler'}
📍 Quelle: ${fehler.quelle_name || '–'}
💬 ${fehler.fehler_meldung || ''}
🕐 ${fehler.zeitpunkt || `${datum} ${uhrzeit}`}

Bitte prüfen: agent/monitor.log`)
  }

  sendTesterReminder(post, tester) {
    const stunden = post.stunden ?? post.wartet_seit_h ?? '?'
    return this.send(
`🔔 Freigabe ausstehend – BeautyHub

📋 ${post.typ || 'NEWS'} | ${Array.isArray(post.nischen) ? post.nischen.join(', ') : (post.nischen || '')}
📰 ${post.titel || ''}
📄 ${post.zusammenfassung || ''}
🔗 Quelle: ${post.quellen_url || post.quelle_url || '–'}
⭐ Relevanz: ${post.relevanz_score ?? '?'}/10
⏰ Wartet seit: ${stunden}h

👉 Freigeben: ${FREIGABEN_URL}

Antworten mit:
✅ JA – freigeben
❌ NEIN – ablehnen
✏️ ÄNDERN – gefolgt von deinem Kommentar`)
  }

  sendEskalation(post) {
    const datum = post.erstellt_am ? new Date(post.erstellt_am).toLocaleString('de-CH') : jetzt().datum
    return this.send(
`⚠️ ESKALATION – Freigabe seit 48h ausstehend

📰 ${post.titel || ''}
🕐 Erstellt: ${datum}
👤 Zuständige Tester wurden bereits erinnert

Bitte manuell prüfen:
${FREIGABEN_URL}`)
  }

  sendTagesbudgetWarnung(kosten) {
    return this.send(
`💸 Tages-Budget erreicht

Kosten heute: $${CHF(kosten)}
Budget: $1.00
Scan wurde gestoppt.

Weitere Artikel werden morgen verarbeitet.`)
  }

  sendHeartbeat() {
    const { datum, uhrzeit } = jetzt()
    return this.send(`💚 BeautyHub läuft\n${datum} ${uhrzeit}`)
  }
}

module.exports = Telegram
module.exports.Telegram = Telegram
