'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { supabase, Inserat } from '@/lib/supabase'

const KATEGORIEN = ['alle','geraete','produkte','mobel','kurse','sonstiges']

const DEMO: Inserat[] = [
  { id: '1', titel: 'IPL Gerät Lumenis M22 - Top Zustand', beschreibung: 'Wenig benutzt, alle Handtücke vorhanden. Ideal für Haarentfernung und Gefässbehandlung. Serviciert 2024.', preis: 4800, kategorie: 'geraete', zustand: 'gebraucht', standort: 'Zürich' },
  { id: '2', titel: 'Nagelfräser Dremel Professional Set', beschreibung: 'Komplettes Set mit 12 Bits, kaum benutzt.', preis: 120, kategorie: 'geraete', zustand: 'neu', standort: 'Bern' },
  { id: '3', titel: 'Profi-Kosmetikliege klappbar weiss', beschreibung: 'Stabile Liege mit Memory-Foam Polster. 2 Jahre alt, sehr guter Zustand.', preis: 350, kategorie: 'mobel', zustand: 'gebraucht', standort: 'Basel' },
  { id: '4', titel: 'PMU Kurs Grundlagen für Anfänger', beschreibung: '2-tägiger Intensivkurs in Zürich. Theorie und Praxis, Material inklusive.', preis: 480, kategorie: 'kurse', zustand: 'neu', standort: 'Zürich' },
]

export default function MarktplatzPage() {
  const router = useRouter()
  const [inserate, setInserate] = useState<Inserat[]>([])
  const [kat, setKat] = useState('alle')
  const [sort, setSort] = useState('neu')
  const [loading, setLoading] = useState(true)
  const [avatar, setAvatar] = useState('M')
  const [showModal, setShowModal] = useState(false)
  const [detail, setDetail] = useState<Inserat | null>(null)
  const [form, setForm] = useState({ titel: '', beschreibung: '', preis: '', kategorie: 'geraete', zustand: 'gebraucht', standort: '' })
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
      else { const n = data.session.user.user_metadata?.name || data.session.user.email || 'M'; setAvatar(n[0].toUpperCase()); setUser(data.session.user) }
    })
  }, [router])

  useEffect(() => { load() }, [kat, sort])

  async function load() {
    setLoading(true)
    try {
      let q = supabase.from('inserate').select('*').eq('aktiv', true)
      if (kat !== 'alle') q = q.eq('kategorie', kat)
      q = sort === 'preis_auf' ? q.order('preis', { ascending: true }) : sort === 'preis_ab' ? q.order('preis', { ascending: false }) : q.order('erstellt_am', { ascending: false })
      const { data, error } = await q
      setInserate(error || !data?.length ? DEMO.filter(d => kat === 'alle' || d.kategorie === kat) : data)
    } catch { setInserate(DEMO) }
    setLoading(false)
  }

  async function submitInserat() {
    if (!form.titel || !form.preis || !user) return
    const { error } = await supabase.from('inserate').insert({ ...form, preis: parseFloat(form.preis), verkaeuferin_id: user.id, aktiv: true })
    if (!error) { setShowModal(false); setForm({ titel: '', beschreibung: '', preis: '', kategorie: 'geraete', zustand: 'gebraucht', standort: '' }); load() }
  }

  const inputCls = "w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E8E0D5] bg-[#faf8f5] text-sm text-[#1A1A2E] outline-none focus:border-[#b8924a] focus:bg-white"

  return (
    <AppShell>
      <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-[#F0EAE0] sticky top-0 z-40">
        <h1 className="font-serif text-2xl font-bold text-[#1A1A2E]">Marktplatz</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowModal(true)} className="bg-[#b8924a] text-white text-xs font-medium px-3 py-2 rounded-xl">+ Inserieren</button>
          <button onClick={() => router.push('/profil')} className="w-9 h-9 rounded-full bg-[#b8924a] flex items-center justify-center text-white text-sm font-semibold">{avatar}</button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border-b border-[#F0EAE0] px-4 py-3.5 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 whitespace-nowrap">
          {KATEGORIEN.map(k => (
            <button key={k} onClick={() => setKat(k)}
              className={`px-4 py-2 rounded-full text-xs font-medium border-[1.5px] transition-all ${kat===k ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]' : 'bg-white text-[#6B6B6B] border-[#E8E0D5]'}`}>
              {k === 'alle' ? 'Alle' : k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {loading ? <><div className="skeleton h-48"/><div className="skeleton h-48"/><div className="skeleton h-48"/><div className="skeleton h-48"/></> : inserate.map(ins => (
          <div key={ins.id} onClick={() => setDetail(ins)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer">
            <div className="h-32 bg-[#F5EFE8] flex items-center justify-center relative">
              <svg width="40" height="40" viewBox="0 0 50 50" fill="none"><rect x="8" y="12" width="34" height="26" rx="4" stroke="#8a7055" strokeWidth="1.5"/><path d="M8 20h34" stroke="#8a7055" strokeWidth="1.5"/><circle cx="16" cy="16" r="2" stroke="#8a7055" strokeWidth="1.2"/></svg>
              <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-lg ${ins.zustand === 'neu' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF3E0] text-[#E65100]'}`}>{ins.zustand === 'neu' ? 'Neu' : 'Gebraucht'}</span>
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-[#1A1A2E] leading-tight line-clamp-2 mb-1">{ins.titel}</p>
              <p className="font-serif text-lg font-bold text-[#b8924a]">CHF {Number(ins.preis).toLocaleString('de-CH')}</p>
              <p className="text-xs text-[#9A9A9A] mt-0.5">{ins.standort}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={e => { if (e.target === e.currentTarget) setDetail(null) }}>
          <div className="bg-white rounded-t-3xl w-full max-w-xl p-6 pb-10">
            <div className="h-44 bg-[#F5EFE8] rounded-2xl flex items-center justify-center mb-5">
              <svg width="60" height="60" viewBox="0 0 50 50" fill="none"><rect x="8" y="12" width="34" height="26" rx="4" stroke="#8a7055" strokeWidth="1.5"/><path d="M8 20h34" stroke="#8a7055" strokeWidth="1.5"/><circle cx="16" cy="16" r="2" stroke="#8a7055" strokeWidth="1.2"/></svg>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1A1A2E] mb-2">{detail.titel}</h2>
            <p className="font-serif text-3xl font-bold text-[#b8924a] mb-4">CHF {Number(detail.preis).toLocaleString('de-CH')}</p>
            <div className="flex gap-2 mb-4">
              {detail.kategorie && <span className="text-xs bg-[#F5EFE8] text-[#6B6B6B] px-3 py-1 rounded-full">{detail.kategorie}</span>}
              {detail.zustand && <span className="text-xs bg-[#F5EFE8] text-[#6B6B6B] px-3 py-1 rounded-full">{detail.zustand}</span>}
              {detail.standort && <span className="text-xs bg-[#F5EFE8] text-[#6B6B6B] px-3 py-1 rounded-full">{detail.standort}</span>}
            </div>
            <p className="text-sm text-[#5A5A5A] leading-relaxed mb-5">{detail.beschreibung}</p>
            <button onClick={() => alert('Kontaktfunktion folgt!')} className="w-full py-4 bg-[#b8924a] text-white rounded-xl font-medium mb-2">Verkäuferin kontaktieren</button>
            <button onClick={() => setDetail(null)} className="w-full py-3 rounded-xl border-[1.5px] border-[#E8E0D5] text-[#6B6B6B] text-sm">Schliessen</button>
          </div>
        </div>
      )}

      {/* New inserat modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="bg-white rounded-t-3xl w-full max-w-xl p-6 pb-10 max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-xl font-bold text-[#1A1A2E] mb-5">Inserat erstellen</h2>
            <div className="space-y-3">
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Titel</label><input className={inputCls} value={form.titel} onChange={e => setForm({...form, titel: e.target.value})} placeholder="z.B. IPL Gerät Lumenis"/></div>
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Beschreibung</label><textarea className={inputCls + ' resize-none h-20'} value={form.beschreibung} onChange={e => setForm({...form, beschreibung: e.target.value})} placeholder="Zustand, Alter, Zubehör..."/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Preis (CHF)</label><input type="number" className={inputCls} value={form.preis} onChange={e => setForm({...form, preis: e.target.value})} placeholder="0"/></div>
                <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Kategorie</label><select className={inputCls} value={form.kategorie} onChange={e => setForm({...form, kategorie: e.target.value})}><option value="geraete">Geräte</option><option value="produkte">Produkte</option><option value="mobel">Möbel</option><option value="kurse">Kurse</option><option value="sonstiges">Sonstiges</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Zustand</label><select className={inputCls} value={form.zustand} onChange={e => setForm({...form, zustand: e.target.value})}><option value="neu">Neu</option><option value="gebraucht">Gebraucht</option></select></div>
                <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Standort</label><input className={inputCls} value={form.standort} onChange={e => setForm({...form, standort: e.target.value})} placeholder="z.B. Zürich"/></div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border-[1.5px] border-[#E8E0D5] text-[#6B6B6B] text-sm">Abbrechen</button>
              <button onClick={submitInserat} className="flex-[2] py-3 rounded-xl bg-[#b8924a] text-white text-sm font-medium">Veröffentlichen</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
