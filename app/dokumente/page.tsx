'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'

const DOCS = [
  { id: '1', titel: 'Hygiene-Checkliste Kosmetikstudio CH', beschreibung: 'Vollständige Checkliste für tägliche, wöchentliche und monatliche Hygiene. Konform mit Schweizer Gesundheitsvorschriften.', typ: 'checkliste', seiten: 2, downloads: 234 },
  { id: '2', titel: 'Einwilligungsformular Laser-Behandlung', beschreibung: 'Rechtssicheres Einwilligungsformular nach Schweizer Recht. Aufklärung über Risiken und Nachsorge inklusive.', typ: 'vorlage', seiten: 3, downloads: 189 },
  { id: '3', titel: 'Einwilligungsformular PMU / Permanent Make-up', beschreibung: 'Vollständiges Formular für PMU-Behandlungen. REACH-Konformität und Nachsorgehinweise inklusive.', typ: 'vorlage', seiten: 4, downloads: 312 },
  { id: '4', titel: 'Kosmetikverordnung Schweiz - Zusammenfassung', beschreibung: 'Kompakte Zusammenfassung der wichtigsten Punkte der Schweizer Kosmetikverordnung. Aktualisiert April 2026.', typ: 'gesetz', seiten: 6, downloads: 456 },
  { id: '5', titel: 'Laserklassen Übersicht - Zulassungspflichten CH', beschreibung: 'Infoblatt zu den Laserklassen 1-4 und Zulassungspflichten in der Schweiz.', typ: 'info', seiten: 2, downloads: 178 },
  { id: '6', titel: 'REACH-konforme Pigmente - Verbotsliste 2026', beschreibung: 'Aktuelle Liste der verbotenen Pigmente für PMU und Tattoos. Stand Januar 2026.', typ: 'gesetz', seiten: 3, downloads: 389 },
  { id: '7', titel: 'Nachsorgeblatt Nageldesign / Gel', beschreibung: 'Professionelles Nachsorgeblatt für Gel- und Acrylnägel. Pflegehinweise und Kontaktinformationen.', typ: 'vorlage', seiten: 1, downloads: 267 },
  { id: '8', titel: 'Erstgespräch-Bogen Kosmetikberatung', beschreibung: 'Strukturierter Bogen für die Kundenberatung. Anamnese, Kontraindikationen und Wunschbehandlung.', typ: 'vorlage', seiten: 2, downloads: 203 },
]
const LABELS: Record<string, string> = { checkliste: 'Checkliste', vorlage: 'Vorlage', info: 'Infoblatt', gesetz: 'Gesetz' }
const BG: Record<string, string> = { checkliste: '#E8F5E9', vorlage: '#E3F2FD', info: '#FFF3E0', gesetz: '#FFEBEE' }

export default function DokumentePage() {
  const router = useRouter()
  const [typ, setTyp] = useState('alle')
  const [search, setSearch] = useState('')
  const [av, setAv] = useState('M')
  const [detail, setDetail] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
      else { const n = data.session.user.user_metadata?.name || data.session.user.email || 'M'; setAv(n[0].toUpperCase()) }
    })
  }, [router])

  const filtered = DOCS.filter(d => (typ === 'alle' || d.typ === typ) && (!search || d.titel.toLowerCase().includes(search.toLowerCase())))

  return (
    <AppShell>
      <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-[#F0EAE0] sticky top-0 z-40">
        <h1 className="font-serif text-2xl font-bold text-[#1A1A2E]">BeautyHub</h1>
        <button onClick={() => router.push('/profil')} className="w-9 h-9 rounded-full bg-[#b8924a] flex items-center justify-center text-white text-sm font-semibold">{av}</button>
      </div>
      <div className="m-4 rounded-2xl bg-[#f5f0eb] border border-[#EBD9B8] px-6 py-7 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#b8924a] mb-2">Dokumente &amp; Gesetzestexte</h2>
        <p className="text-sm text-[#6B6B6B] max-w-md mx-auto leading-relaxed">Hier werden offizielle Dokumente und Gesetzestexte abgelegt.</p>
      </div>
      <div className="bg-white border-b border-[#F0EAE0] px-4 py-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Dokumente suchen..."
          className="w-full px-4 py-2.5 rounded-xl border-[1.5px] border-[#E8E0D5] bg-[#faf8f5] text-sm outline-none focus:border-[#b8924a]"/>
      </div>
      <div className="px-4 py-3.5 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 whitespace-nowrap">
          {['alle','checkliste','vorlage','info','gesetz'].map(t => (
            <button key={t} onClick={() => setTyp(t)} className={`px-4 py-2 rounded-full text-xs font-medium border-[1.5px] transition-all ${typ === t ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]' : 'bg-white text-[#6B6B6B] border-[#E8E0D5]'}`}>
              {t === 'alle' ? 'Alle' : LABELS[t]}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 pb-4 space-y-2">
        {filtered.map(doc => (
          <div key={doc.id} onClick={() => setDetail(doc)} className="bg-white rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: BG[doc.typ] || '#F5F0EA' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth={2}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1A1A2E] truncate mb-1">{doc.titel}</p>
              <div className="flex items-center gap-2 text-xs text-[#9A9A9A]">
                <span className="text-[#b8924a] font-medium">{LABELS[doc.typ]}</span>
                <span>{doc.seiten} Seiten</span>
                <span>{doc.downloads}x</span>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b8924a" strokeWidth={2}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-16 text-sm text-[#9A9A9A]">Keine Dokumente gefunden</div>}
      </div>
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={e => { if (e.target === e.currentTarget) setDetail(null) }}>
          <div className="bg-white rounded-t-3xl w-full max-w-xl p-6 pb-10">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: BG[detail.typ] || '#F5F0EA' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth={2}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <h2 className="font-serif text-xl font-bold text-[#1A1A2E] text-center mb-2">{detail.titel}</h2>
            <p className="text-sm text-[#767676] text-center leading-relaxed mb-4">{detail.beschreibung}</p>
            <div className="flex gap-2 justify-center flex-wrap mb-5">
              <span className="text-xs bg-[#F5EFE8] text-[#b8924a] px-3 py-1 rounded-full font-medium">{LABELS[detail.typ]}</span>
              <span className="text-xs bg-[#F5EFE8] text-[#6B6B6B] px-3 py-1 rounded-full">{detail.seiten} Seiten</span>
              <span className="text-xs bg-[#F5EFE8] text-[#6B6B6B] px-3 py-1 rounded-full">{detail.downloads}x heruntergeladen</span>
            </div>
            <button onClick={() => alert('Download folgt in Kürze!')} className="w-full py-4 bg-[#b8924a] text-white rounded-xl font-medium flex items-center justify-center gap-2 mb-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Herunterladen
            </button>
            <button onClick={() => setDetail(null)} className="w-full py-3 rounded-xl border-[1.5px] border-[#E8E0D5] text-[#6B6B6B] text-sm">Schliessen</button>
          </div>
        </div>
      )}
    </AppShell>
  )
                                    }
