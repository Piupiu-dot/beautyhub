'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'

const TYPEN = ['alle','checkliste','vorlage','info','gesetz']

const DEMO = [
  { id: '1', titel: 'Hygiene-Checkliste Kosmetikstudio (CH)', beschreibung: 'Vollständige Checkliste für die tägliche, wöchentliche und monatliche Hygiene. Konform mit Schweizer Gesundheitsvorschriften.', typ: 'checkliste', nischen: 'alle', seiten: 2, downloads: 234 },
  { id: '2', titel: 'Einwilligungsformular Laser-Behandlung', beschreibung: 'Rechtssicheres Einwilligungsformular für Laserbehandlungen nach Schweizer Recht. Inkl. Aufklärung über Risiken und Nachsorge.', typ: 'vorlage', nischen: 'laser', seiten: 3, downloads: 189 },
  { id: '3', titel: 'Einwilligungsformular PMU / Permanent Make-up', beschreibung: 'Vollständiges Einwilligungsformular für PMU-Behandlungen. REACH-Konformität und Nachsorgehinweise inklusive.', typ: 'vorlage', nischen: 'pmu', seiten: 4, downloads: 312 },
  { id: '4', titel: 'Kosmetikverordnung Schweiz - Zusammenfassung', beschreibung: 'Kompakte Zusammenfassung der wichtigsten Punkte der Schweizer Kosmetikverordnung. Aktualisiert April 2026.', typ: 'gesetz', nischen: 'alle', seiten: 6, downloads: 456 },
  { id: '5', titel: 'Laserklassen Übersicht - Zulassungspflichten CH', beschreibung: 'Infoblatt zu den Laserklassen 1-4 und den jeweiligen Zulassungspflichten in der Schweiz.', typ: 'info', nischen: 'laser', seiten: 2, downloads: 178 },
  { id: '6', titel: 'Nachsorgeblatt Nageldesign / Gel', beschreibung: 'Professionelles Nachsorgeblatt für Gel- und Acrylnägel. Pflegehinweise, Haltbarkeit und Kontaktinformationen.', typ: 'vorlage', nischen: 'nagel', seiten: 1, downloads: 267 },
  { id: '7', titel: 'REACH-konforme Pigmente - Verbotsliste 2026', beschreibung: 'Aktuelle Liste der verbotenen Pigmente für PMU und Tattoos. Stand: Januar 2026.', typ: 'gesetz', nischen: 'pmu', seiten: 3, downloads: 389 },
  { id: '8', titel: 'Erstgespräch-Bogen Kosmetikberatung', beschreibung: 'Strukturierter Erstgesprächsbogen für die Kundenberatung. Anamnese, Kontraindikationen und Wunschbehandlung.', typ: 'vorlage', nischen: 'alle', seiten: 2, downloads: 203 },
]

const ICONS: Record<string, { bg: string; color: string; svg: React.ReactNode }> = {
  checkliste: { bg: '#F0FFF4', color: '#2E7D32', svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth={2}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
  vorlage:    { bg: '#F0F4FF', color: '#1565C0', svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth={2}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  info:       { bg: '#FFF8F0', color: '#E65100', svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  gesetz:     { bg: '#FFF0F0', color: '#C0392B', svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
}

const TYP_LABEL: Record<string, string> = { checkliste: 'Checkliste', vorlage: 'Vorlage', info: 'Infoblatt', gesetz: 'Gesetz' }

export default function DokumentePage() {
  const router = useRouter()
  const [docs, setDocs] = useState(DEMO)
  const [typ, setTyp] = useState('alle')
  const [search, setSearch] = useState('')
  const [avatar, setAvatar] = useState('M')
  const [detail, setDetail] = useState<typeof DEMO[0] | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
      else { const n = data.session.user.user_metadata?.name || data.session.user.email || 'M'; setAvatar(n[0].toUpperCase()) }
    })
  }, [router])

  const filtered = docs.filter(d => {
    const matchTyp = typ === 'alle' || d.typ === typ
    const matchSearch = !search || d.titel.toLowerCase().includes(search.toLowerCase()) || d.beschreibung.toLowerCase().includes(search.toLowerCase())
    return matchTyp && matchSearch
  })

  const grouped = TYPEN.filter(t => t !== 'alle').map(t => ({ typ: t, items: filtered.filter(d => d.typ === t) })).filter(g => g.items.length > 0)

  return (
    <AppShell>
      <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-[#F0EAE0] sticky top-0 z-40">
        <h1 className="font-serif text-2xl font-bold text-[#1A1A2E]">Dokumente</h1>
        <button onClick={() => router.push('/profil')} className="w-9 h-9 rounded-full bg-[#b8924a] flex items-center justify-center text-white text-sm font-semibold">{avatar}</button>
      </div>

      {/* Search */}
      <div className="bg-white border-b border-[#F0EAE0] px-4 py-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A9A]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Dokumente suchen..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border-[1.5px] border-[#E8E0D5] bg-[#faf8f5] text-sm outline-none focus:border-[#b8924a]"/>
        </div>
      </div>

      {/* Filter */}
      <div className="px-4 py-3.5 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 whitespace-nowrap">
          {TYPEN.map(t => (
            <button key={t} onClick={() => setTyp(t)}
              className={`px-4 py-2 rounded-full text-xs font-medium border-[1.5px] transition-all ${typ===t ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]' : 'bg-white text-[#6B6B6B] border-[#E8E0D5]'}`}>
              {t === 'alle' ? 'Alle' : TYP_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Docs */}
      <div className="px-4 pb-4">
        {typ === 'alle' ? grouped.map(g => (
          <div key={g.typ}>
            <h3 className="text-xs font-semibold text-[#9A9A9A] uppercase tracking-widest mb-2 mt-2">{TYP_LABEL[g.typ]}en</h3>
            <div className="space-y-2">{g.items.map(d => <DocCard key={d.id} doc={d} onOpen={() => setDetail(d)} />)}</div>
          </div>
        )) : <div className="space-y-2 mt-2">{filtered.map(d => <DocCard key={d.id} doc={d} onOpen={() => setDetail(d)} />)}</div>}
        {filtered.length === 0 && <div className="text-center py-16 text-sm text-[#9A9A9A]">Keine Dokumente gefunden</div>}
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={e => { if (e.target === e.currentTarget) setDetail(null) }}>
          <div className="bg-white rounded-t-3xl w-full max-w-xl p-6 pb-10">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: ICONS[detail.typ]?.bg }}>
              {ICONS[detail.typ]?.svg}
            </div>
            <h2 className="font-serif text-xl font-bold text-[#1A1A2E] text-center mb-2">{detail.titel}</h2>
            <p className="text-sm text-[#767676] text-center leading-relaxed mb-4">{detail.beschreibung}</p>
            <div className="flex gap-2 justify-center flex-wrap mb-5">
              <span className="text-xs bg-[#F5EFE8] text-[#b8924a] px-3 py-1 rounded-full font-medium">{TYP_LABEL[detail.typ]}</span>
              {detail.nischen !== 'alle' && <span className="text-xs bg-[#F5EFE8] text-[#b8924a] px-3 py-1 rounded-full font-medium">{detail.nischen}</span>}
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

function DocCard({ doc, onOpen }: { doc: any; onOpen: () => void }) {
  const icon = ICONS[doc.typ] || ICONS.info
  return (
    <div onClick={onOpen} className="bg-white rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: icon.bg }}>{icon.svg}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1A1A2E] leading-tight mb-1 truncate">{doc.titel}</p>
        <div className="flex items-center gap-2 text-xs text-[#9A9A9A]">
          <span className="text-[#b8924a] font-medium">{TYP_LABEL[doc.typ]}</span>
          {doc.nischen !== 'alle' && <span className="text-[#b8924a]">{doc.nischen}</span>}
          <span>{doc.seiten} S.</span>
          <span>{doc.downloads}x</span>
        </div>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b8924a" strokeWidth={2}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    </div>
  )
}
