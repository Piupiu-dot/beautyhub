'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'

const DEMO = [
  { id: '1', titel: 'IPL Geraet Lumenis M22 - Top Zustand', beschreibung: 'Wenig benutzt, alle Handtuecker vorhanden. Serviciert 2024.', preis: 4800, kategorie: 'geraete', zustand: 'gebraucht', standort: 'Zuerich' },
  { id: '2', titel: 'Nagelfraeeser Dremel Professional', beschreibung: 'Komplettes Set mit 12 Bits, kaum benutzt.', preis: 120, kategorie: 'geraete', zustand: 'neu', standort: 'Bern' },
  { id: '3', titel: 'Profi-Kosmetikliege klappbar weiss', beschreibung: 'Stabile Liege mit Memory-Foam Polster. 2 Jahre alt.', preis: 350, kategorie: 'mobel', zustand: 'gebraucht', standort: 'Basel' },
  { id: '4', titel: 'PMU Kurs Grundlagen fuer Anfaenger', beschreibung: '2-taegiger Intensivkurs in Zuerich. Material inklusive.', preis: 480, kategorie: 'kurse', zustand: 'neu', standort: 'Zuerich' },
]
const KATS = ['alle','geraete','produkte','mobel','kurse','sonstiges']

export default function MarktplatzPage() {
  const router = useRouter()
  const [inserate, setInserate] = useState<any[]>(DEMO)
  const [kat, setKat] = useState('alle')
  const [av, setAv] = useState('M')
  const [detail, setDetail] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ titel: '', beschreibung: '', preis: '', kategorie: 'geraete', zustand: 'gebraucht', standort: '' })
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
      else { const n = data.session.user.user_metadata?.name || data.session.user.email || 'M'; setAv(n[0].toUpperCase()); setUser(data.session.user) }
    })
    supabase.from('inserate').select('*').eq('aktiv', true).order('erstellt_am', { ascending: false }).then(({ data }) => { if (data?.length) setInserate(data) })
  }, [router])

  const filtered = kat === 'alle' ? inserate : inserate.filter(i => i.kategorie === kat)
  const ic = 'w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E8E0D5] bg-[#faf8f5] text-sm outline-none focus:border-[#b8924a]'

  return (
    <AppShell>
      <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-[#F0EAE0] sticky top-0 z-40">
        <h1 className="font-serif text-2xl font-bold text-[#1A1A2E]">Marktplatz</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowForm(true)} className="bg-[#b8924a] text-white text-xs font-medium px-3 py-2 rounded-xl">+ Inserieren</button>
          <button onClick={() => router.push('/profil')} className="w-9 h-9 rounded-full bg-[#b8924a] flex items-center justify-center text-white text-sm font-semibold">{av}</button>
        </div>
      </div>
      <div className="bg-white border-b border-[#F0EAE0] px-4 py-3.5 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 whitespace-nowrap">
          {KATS.map(k => (<button key={k} onClick={() => setKat(k)} className={`px-4 py-2 rounded-full text-xs font-medium border-[1.5px] transition-all ${kat === k ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]' : 'bg-white text-[#6B6B6B] border-[#E8E0D5]'}`}>{k === 'alle' ? 'Alle' : k.charAt(0).toUpperCase() + k.slice(1)}</button>))}
        </div>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {filtered.map(ins => (
          <div key={ins.id} onClick={() => setDetail(ins)} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer">
            <div className="h-32 bg-[#F5EFE8] flex items-center justify-center relative">
              <svg width="40" height="40" viewBox="0 0 50 50" fill="none"><rect x="8" y="12" width="34" height="26" rx="4" stroke="#8a7055" strokeWidth="1.5"/><path d="M8 20h34" stroke="#8a7055" strokeWidth="1.5"/><circle cx="16" cy="16" r="2" stroke="#8a7055" strokeWidth="1.2"/></svg>
              <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-lg ${ins.zustand === 'neu' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF3E0] text-[#E65100]'}`}>{ins.zustand === 'neu' ? 'Neu' : 'Gebraucht'}</span>
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-[#1A1A2E] line-clamp-2 mb-1">{ins.titel}</p>
              <p className="font-serif text-lg font-bold text-[#b8924a]">CHF {Number(ins.preis).toLocaleString('de-CH')}</p>
              <p className="text-xs text-[#9A9A9A] mt-0.5">{ins.standort}</p>
            </div>
          </div>
        ))}
      </div>
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={e => { if (e.target === e.currentTarget) setDetail(null) }}>
          <div className="bg-white rounded-t-3xl w-full max-w-xl p-6 pb-10">
            <h2 className="font-serif text-2xl font-bold text-[#1A1A2E] mb-2">{detail.titel}</h2>
            <p className="font-serif text-3xl font-bold text-[#b8924a] mb-4">CHF {Number(detail.preis).toLocaleString('de-CH')}</p>
            <p className="text-sm text-[#5A5A5A] leading-relaxed mb-5">{detail.beschreibung}</p>
            <button onClick={() => alert('Kontakt folgt!')} className="w-full py-4 bg-[#b8924a] text-white rounded-xl font-medium mb-2">Verkaeuferin kontaktieren</button>
            <button onClick={() => setDetail(null)} className="w-full py-3 rounded-xl border-[1.5px] border-[#E8E0D5] text-[#6B6B6B] text-sm">Schliessen</button>
          </div>
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="bg-white rounded-t-3xl w-full max-w-xl p-6 pb-10 max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-xl font-bold text-[#1A1A2E] mb-5">Inserat erstellen</h2>
            <div className="space-y-3">
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Titel</label><input className={ic} value={form.titel} onChange={e => setForm({...form, titel: e.target.value}) } placeholder="z.B. IPL Geraet"/></div>
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Beschreibung</label><textarea className={ic + ' resize-none h-20'} value={form.beschreibung} onChange={e => setForm({...form, beschreibung: e.target.value})}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Preis (CHF)</label><input type="number" className={ic} value={form.preis} onChange={e => setForm({...form, preis: e.target.value})} placeholder="0"/></div>
                <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Standort</label><input className={ic} value={form.standort} onChange={e => setForm({...form, standort: e.target.value})} placeholder="z.B. Zuerich"/></div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border-[1.5px] border-[#E8E0D5] text-[#6B6B6B] text-sm">Abbrechen</button>
              <button onClick={async () => { if (!user || !form.titel || !form.preis) return; await supabase.from('inserate').insert({...form, preis: parseFloat(form.preis), verkaeuferin_id: user.id, aktiv: true}); setShowForm(false); }} className="flex-[2] py-3 rounded-xl bg-[#b8924a] text-white text-sm font-medium">Veroeffentlichen</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
        }
