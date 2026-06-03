import { Post } from './supabase'

const now = Date.now()
const day = 86400000

export const DEMO_POSTS: Post[] = [
  { id:'1', titel:'Neue Laserklassen-Vorschriften 2026', zusammenfassung:'Das Gesundheitsamt hat aktualisierte Richtlinien für Lasergeräte ab Klasse 3B erlassen. Ab Juli 2026 ist eine erweiterte Zertifizierung erforderlich.', inhalt:'Das Bundesamt für Gesundheit (BAG) hat aktualisierte Richtlinien für den Einsatz von Lasergeräten ab Klasse 3B veröffentlicht.\nAb dem 1. Juli 2026 benötigen Kosmetikstudios eine erweiterte Zertifizierung sowie einen Sachkundenachweis für das behandelnde Personal.\nBetroffen sind insbesondere Geräte zur Haarentfernung und zur Behandlung von Pigmentstörungen. Studios sollten ihre Zertifikate frühzeitig erneuern, um den Betrieb nicht zu unterbrechen.', typ:'gesetz', nischen:'laser', quelle_name:'BAG Schweiz', quelle_url:'https://www.bag.admin.ch', likes:24, ist_agent:true, erstellt_am:new Date(now-2*day).toISOString() },
  { id:'2', titel:'PMU-Pigmente: EU-Richtlinie jetzt relevant', zusammenfassung:'Die REACH-Verordnung schränkt weitere Pigmentfarben ein. Betroffen sind Blau- und Grüntöne für permanentes Make-up.', inhalt:'Die europäische REACH-Verordnung schränkt ab sofort weitere Pigmentfarben ein, die auch in der Schweiz verwendet werden.\nBetroffen sind vor allem bestimmte Blau- und Grüntöne, die für permanentes Make-up und Microblading eingesetzt werden.\nSwissmedic empfiehlt, nur noch zertifizierte, REACH-konforme Pigmente zu beziehen und die Chargennummern zu dokumentieren.', typ:'gesetz', nischen:'pmu', quelle_name:'Swissmedic', quelle_url:'https://www.swissmedic.ch', likes:18, ist_agent:true, erstellt_am:new Date(now-5*day).toISOString() },
  { id:'3', titel:'Bio-Fermentation: Der grösste Beauty-Trend 2026', zusammenfassung:'Fermentierte Wirkstoffe verbessern die Bioverfügbarkeit von Vitaminen und stärken die Hautbarriere messbar.', inhalt:'Fermentierte Wirkstoffe gelten als der grösste Beauty-Trend des Jahres 2026.\nDurch die Fermentation werden Wirkstoffe in kleinere Moleküle aufgespalten, was die Bioverfügbarkeit von Vitaminen deutlich erhöht.\nStudien zeigen, dass fermentierte Seren die Hautbarriere messbar stärken und Reizungen reduzieren.', typ:'trend', nischen:'gesicht', quelle_name:'Cosmetica Suisse', likes:41, ist_agent:true, erstellt_am:new Date(now-12*day).toISOString() },
  { id:'4', titel:'Neue Erkenntnisse zu Gel-Systemen bei Nägeln', zusammenfassung:'Pausen zwischen Gel-Applikationen reduzieren Schäden um 60 Prozent.', inhalt:'Eine neue Studie der Schweizerischen Dermatologischen Klinik zeigt, dass regelmässige Pausen zwischen Gel-Applikationen Nagelschäden um bis zu 60 Prozent reduzieren können.\nEmpfohlen wird eine Pause von mindestens zwei Wochen nach jeweils drei aufeinanderfolgenden Applikationen.', typ:'news', nischen:'nagel', quelle_name:'SDKF', likes:35, ist_agent:false, erstellt_am:new Date(now-1*day).toISOString() },
]

export const DEMO_COMMUNITY: Post[] = [
  { id:'c1', titel:'Erfahrung mit Nd:YAG Laser?', inhalt:'Ich suche Kolleginnen mit Erfahrung beim Nd:YAG bei Hauttyp IV-V. Welche Einstellungen nutzt ihr und wie sind eure Resultate?', zusammenfassung:'Ich suche Kolleginnen mit Erfahrung beim Nd:YAG bei Hauttyp IV-V.', typ:'community', nischen:'laser', autor_name:'Sophie K.', erstellt_am:new Date(now-7200000).toISOString(), likes:12, kommentare_count:5 },
  { id:'c2', titel:'PMU-Pigmente REACH-konform?', inhalt:'Suche REACH-konforme Pigmente für Augenbrauen PMU. Welche Marken könnt ihr empfehlen, die zuverlässig liefern?', zusammenfassung:'Suche REACH-konforme Pigmente für Augenbrauen PMU.', typ:'community', nischen:'pmu', autor_name:'Lena M.', erstellt_am:new Date(now-14400000).toISOString(), likes:8, kommentare_count:11 },
  { id:'c3', titel:'Hebelifting bei feinen Haaren?', inhalt:'Wimpernlifting hängt bei feinen Haaren schnell durch. Habt ihr Tipps für eine längere Haltbarkeit bei sehr feinen Naturwimpern?', zusammenfassung:'Wimpernlifting hängt bei feinen Haaren schnell durch.', typ:'community', nischen:'wimpern', autor_name:'Nina B.', erstellt_am:new Date(now-28800000).toISOString(), likes:19, kommentare_count:7 },
]

export const ALL_DEMO: Post[] = [...DEMO_POSTS, ...DEMO_COMMUNITY]

export function findDemoPost(id: string): Post | null {
  return ALL_DEMO.find(p => p.id === id) || null
}

export function formatDatum(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / day)
  if (days < 1) {
    const h = Math.floor(diff / 3600000)
    if (h < 1) return 'Gerade eben'
    return `vor ${h}h`
  }
  if (days < 7) return `vor ${days} ${days === 1 ? 'Tag' : 'Tagen'}`
  return d.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' })
}
