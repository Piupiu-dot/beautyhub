'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'

const DEMO = [
  {id:'1',titel:'IPL Gerät Lumenis M22',beschreibung:'Wenig benutzt, alle Handtücher vorhanden. Serviciert 2024.',preis:4800,kategorie:'geraete',zustand:'gebraucht',standort:'Zürich'},
  {id:'2',titel:'Nagelfräser Dremel Set',beschreibung:'Komplettes Set mit 12 Bits, kaum benutzt.',preis:120,kategorie:'geraete',zustand:'neu',standort:'Bern'},
  {id:'3',titel:'Profi-Kosmetikliege weiss',beschreibung:'Memory-Foam Polster, 2 Jahre alt, sehr guter Zustand.',preis:350,kategorie:'mobel',zustand:'gebraucht',standort:'Basel'},
  {id:'4',titel:'PMU Kurs Grundlagen',beschreibung:'2-tägiger Intensivkurs. Zertifikat wird ausgestellt.',preis:480,kategorie:'kurse',zustand:'neu',standort:'Zürich'},
]
const KATS = ['alle','geraete','produkte','mobel','kurse','sonstiges']
const KAT_LABELS: Record<string, string> = { alle:'Alle', geraete:'Geräte', produkte:'Produkte', mobel:'Möbel', kurse:'Kurse', sonstiges:'Sonstiges' }

export default function MarktplatzPage() {
  const router = useRouter()
  const [inserate, setInserate] = useState<any[]>(DEMO)
  const [kat, setKat] = useState('alle')
  const [av, setAv] = useState('M')
  const [detail, setDetail] = useState<any>(null)
  const [chat, setChat] = useState(false)
  const [msg, setMsg] = useState('')
  const [history, setHistory] = useState<{von:'ich'|'sie',text:string}[]>([])
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({titel:'',beschreibung:'',preis:'',kategorie:'geraete',zustand:'gebraucht',standort:''})

  useEffect(() => {
    supabase.auth.getSession().then(({data}) => {
      if (!data.session) router.push('/login')
      else { const n=data.session.user.user_metadata?.name||data.session.user.email||'M'; setAv(n[0].toUpperCase()); setUser(data.session.user) }
    })
    supabase.from('inserate').select('*').eq('aktiv',true).order('erstellt_am',{ascending:false}).then(({data}) => { if (data?.length) setInserate(data) })
  }, [router])

  const filtered = kat==='alle' ? inserate : inserate.filter(i=>i.kategorie===kat)
  const ic = 'w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E8E0D5] bg-[#faf8f5] text-sm outline-none focus:border-[#b8924a]'

  function sendMsg() {
    if (!msg.trim()) return
    setHistory(h=>[...h,{von:'ich',text:msg}])
    setMsg('')
    setTimeout(()=>setHistory(h=>[...h,{von:'sie',text:'Danke! Ich melde mich bald.'}]),800)
  }

  return (
    <AppShell>
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-[#f0ece6] sticky top-0 z-40">
        <h1 className="font-serif text-2xl font-bold text-[#1A1A2E]">BeautyHub</h1>
        <div className="flex items-center gap-2">
          <button onClick={()=>setShowForm(true)} className="bg-[#b8924a] text-white text-xs font-medium px-3 py-2 rounded-xl">+ Inserat erstellen</button>
          <button onClick={()=>router.push('/profil')} className="w-9 h-9 rounded-full bg-[#b8924a] flex items-center justify-center text-white text-sm font-semibold">{av}</button>
        </div>
      </div>
      <div className="bg-white border-b border-[#f0ece6] px-4 py-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 whitespace-nowrap">
          {KATS.map(k=>(<button key={k} onClick={()=>setKat(k)} className={`px-4 py-2 rounded-full text-xs font-medium border-[1.5px] flex-shrink-0 transition-all ${kat===k?'bg-[#1A1A2E] text-white border-[#1A1A2E]':'bg-white text-[#6B6B6B] border-[#E8E0D5]'}`}>{KAT_LABELS[k]||k}</button>))}
        </div>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {filtered.map(ins=>(
          <div key={ins.id} onClick={()=>{setDetail(ins);setChat(false);setHistory([])}} className="card overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer">
            <div className="h-28 bg-[#faf8f5] flex items-center justify-center relative px-3">
              <span className="font-serif text-lg font-semibold text-[#b8924a] text-center leading-tight">{KAT_LABELS[ins.kategorie]||ins.kategorie}</span>
              <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-lg ${ins.zustand==='neu'?'bg-[#dcfce7] text-[#166534]':'bg-[#f0ece6] text-[#6b7280]'}`}>{ins.zustand==='neu'?'Neu':'Gebraucht'}</span>
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-[#1a1a1a] line-clamp-2 mb-1 leading-tight">{ins.titel}</p>
              <p className="text-base font-semibold text-[#b8924a]">CHF {Number(ins.preis).toLocaleString('de-CH')}</p>
              <p className="text-[13px] text-[#6b7280]">{ins.standort}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={e=>{if(e.target===e.currentTarget){setDetail(null);setChat(false)}}}>
          <div className="bg-white rounded-t-3xl w-full max-w-xl max-h-[85vh] flex flex-col">
            {!chat ? (
              <div className="overflow-y-auto p-5 pb-6">
                <div className="w-12 h-1 bg-[#E0D8D0] rounded-full mx-auto mb-4"/>
                <div className="h-36 bg-[#faf8f5] rounded-2xl flex items-center justify-center mb-4 px-4">
                  <span className="font-serif text-2xl font-semibold text-[#b8924a] text-center">{KAT_LABELS[detail.kategorie]||detail.kategorie}</span>
                </div>
                <h2 className="font-serif text-xl font-bold text-[#1A1A2E] mb-1">{detail.titel}</h2>
                <p className="font-serif text-3xl font-bold text-[#b8924a] mb-3">CHF {Number(detail.preis).toLocaleString('de-CH')}</p>
                <div className="flex gap-2 flex-wrap mb-3">
                  {detail.zustand && <span className={`text-xs px-3 py-1 rounded-full ${detail.zustand==='neu'?'bg-[#dcfce7] text-[#166534]':'bg-[#f0ece6] text-[#6b7280]'}`}>{detail.zustand==='neu'?'Neu':'Gebraucht'}</span>}
                  {detail.standort && <span className="text-xs bg-[#F5EFE8] text-[#6B6B6B] px-3 py-1 rounded-full">📍 {detail.standort}</span>}
                </div>
                <p className="text-sm text-[#5A5A5A] leading-relaxed mb-5">{detail.beschreibung}</p>
                <button onClick={()=>setChat(true)} className="w-full py-4 bg-[#b8924a] text-white rounded-xl font-medium flex items-center justify-center gap-2 mb-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  Verkäuferin kontaktieren
                </button>
                <button onClick={()=>setDetail(null)} className="w-full py-3 rounded-xl border-[1.5px] border-[#E8E0D5] text-[#6B6B6B] text-sm">Schliessen</button>
              </div>
            ) : (
              <div className="flex flex-col h-[70vh]">
                <div className="p-4 border-b border-[#f0ece6] flex items-center gap-3 flex-shrink-0">
                  <button onClick={()=>setChat(false)} className="text-[#b8924a]"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="15 18 9 12 15 6"/></svg></button>
                  <div className="w-8 h-8 rounded-full bg-[#E8DDD0] flex items-center justify-center text-[#b8924a] font-bold text-sm">V</div>
                  <div><p className="text-sm font-semibold text-[#1A1A2E]">Verkäuferin</p><p className="text-xs text-[#9A9A9A] truncate max-w-[180px]">{detail.titel}</p></div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {history.length===0 && <p className="text-center text-xs text-[#9A9A9A] py-4">Schreibe deine erste Nachricht</p>}
                  {history.map((m,i)=>(
                    <div key={i} className={`flex ${m.von==='ich'?'justify-end':'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${m.von==='ich'?'bg-[#b8924a] text-white rounded-br-sm':'bg-white text-[#1A1A2E] shadow-sm rounded-bl-sm'}`}>{m.text}</div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-[#f0ece6] flex gap-2 flex-shrink-0">
                  <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMsg()} placeholder="Nachricht..." className="flex-1 px-4 py-3 rounded-xl border-[1.5px] border-[#E8E0D5] bg-[#faf8f5] text-sm outline-none focus:border-[#b8924a] min-w-0"/>
                  <button onClick={sendMsg} className="w-11 h-11 bg-[#b8924a] rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inserat Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={e=>{if(e.target===e.currentTarget)setShowForm(false)}}>
          <div className="bg-white rounded-t-3xl w-full max-w-xl p-6 pb-8 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-1 bg-[#E0D8D0] rounded-full mx-auto mb-5"/>
            <h2 className="font-serif text-xl font-bold text-[#1A1A2E] mb-5">Inserat erstellen</h2>
            <div className="space-y-3">
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Titel</label><input className={ic} value={form.titel} onChange={e=>setForm({...form,titel:e.target.value})} placeholder="z.B. IPL Gerät"/></div>
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Beschreibung</label><textarea className={ic+' resize-none h-20'} value={form.beschreibung} onChange={e=>setForm({...form,beschreibung:e.target.value})}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Preis CHF</label><input type="number" className={ic} value={form.preis} onChange={e=>setForm({...form,preis:e.target.value})}/></div>
                <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Standort</label><input className={ic} value={form.standort} onChange={e=>setForm({...form,standort:e.target.value})} placeholder="z.B. Zürich"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Kategorie</label>
                  <select className={ic} value={form.kategorie} onChange={e=>setForm({...form,kategorie:e.target.value})}>
                    <option value="geraete">Geräte</option><option value="produkte">Produkte</option><option value="mobel">Möbel</option><option value="kurse">Kurse</option><option value="sonstiges">Sonstiges</option>
                  </select></div>
                <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Zustand</label>
                  <select className={ic} value={form.zustand} onChange={e=>setForm({...form,zustand:e.target.value})}>
                    <option value="neu">Neu</option><option value="gebraucht">Gebraucht</option>
                  </select></div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={()=>setShowForm(false)} className="flex-1 py-3 rounded-xl border-[1.5px] border-[#E8E0D5] text-[#6B6B6B] text-sm">Abbrechen</button>
              <button onClick={async()=>{if(!user||!form.titel||!form.preis)return;await supabase.from('inserate').insert({...form,preis:parseFloat(form.preis),verkaeuferin_id:user.id,aktiv:true});setShowForm(false)}} className="flex-[2] py-3 rounded-xl bg-[#b8924a] text-white text-sm font-medium">Veröffentlichen</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
  }
