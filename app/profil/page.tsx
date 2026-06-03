'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'

const NISCHEN = ['laser','gesicht','nagel','pmu','wimpern','haar','med','aesthetik']
const FARBEN = ['#b8924a','#2D6A4F','#1A1A2E','#C0392B','#6A1B9A','#1565C0','#E65100','#00838F']
const KANTONE = ['AG','AI','AR','BE','BL','BS','FR','GE','GL','GR','JU','LU','NE','NW','OW','SG','SH','SO','SZ','TG','TI','UR','VD','VS','ZG','ZH']

export default function ProfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [nischen, setNischen] = useState<string[]>([])
  const [farbe, setFarbe] = useState('#b8924a')
  const [showEdit, setShowEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({name:'',unternehmen:'',berufsbezeichnung:'',kanton:'',mitarbeiter:'',website:'',bio:''})

  useEffect(() => {
    supabase.auth.getSession().then(({data}) => {
      if (!data.session) router.push('/login')
      else {
        const u = data.session.user; setUser(u)
        const m = u.user_metadata||{}
        setFarbe(m.avatar_farbe||'#b8924a')
        setForm({name:m.name||'',unternehmen:m.unternehmen||'',berufsbezeichnung:m.berufsbezeichnung||'',kanton:m.kanton||'',mitarbeiter:m.mitarbeiter||'',website:m.website||'',bio:m.bio||''})
        if (m.nischen) setNischen(Array.isArray(m.nischen)?m.nischen:m.nischen.split(',').filter(Boolean))
      }
    })
  }, [router])

  async function save() {
    setSaving(true)
    await supabase.auth.updateUser({data:{...form,avatar_farbe:farbe,nischen,mitarbeiter:parseInt(form.mitarbeiter)||1}})
    if (user) await supabase.from('profiles').upsert({id:user.id,...form,avatar_farbe:farbe,nischen,mitarbeiter:parseInt(form.mitarbeiter)||1}).select()
    setSaving(false); setShowEdit(false)
    const {data} = await supabase.auth.getUser()
    if (data.user) setUser(data.user)
  }

  const name = form.name||user?.email||'Nutzer'
  const ic = 'w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E8E0D5] bg-[#faf8f5] text-sm text-[#1A1A2E] outline-none focus:border-[#b8924a]'

  return (
    <AppShell>
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-[#F0EAE0] sticky top-0 z-40">
        <h1 className="font-serif text-2xl font-bold text-[#1A1A2E]">Profil</h1>
        <button onClick={()=>setShowEdit(true)} className="text-sm text-[#b8924a] font-semibold">Bearbeiten</button>
      </div>

      <div className="bg-white pb-6 border-b border-[#F0EAE0] text-center px-5 pt-8">
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center font-serif text-3xl font-bold text-white" style={{background:farbe}}>
            {name[0]?.toUpperCase()}
          </div>
          <button onClick={()=>setShowEdit(true)} className="absolute bottom-0 right-0 w-7 h-7 bg-[#b8924a] rounded-full flex items-center justify-center border-2 border-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#1A1A2E]">{name}</h2>
        {form.berufsbezeichnung && <p className="text-sm text-[#b8924a] font-medium mt-1">{form.berufsbezeichnung}</p>}
        {form.unternehmen && <p className="text-sm text-[#6B6B6B] mt-0.5">{form.unternehmen}</p>}
        <div className="flex items-center justify-center gap-3 mt-2 text-xs text-[#9A9A9A] flex-wrap">
          {form.kanton && <span>📍 {form.kanton}</span>}
          {form.mitarbeiter && <span>👥 {form.mitarbeiter} Mitarbeitende</span>}
        </div>
        {form.bio && <p className="text-sm text-[#5A5A5A] mt-3 leading-relaxed max-w-xs mx-auto">{form.bio}</p>}
        {form.website && <a href={form.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[#b8924a] mt-2 block">{form.website}</a>}
      </div>

      {nischen.length > 0 && (
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F5F0EA]"><p className="text-xs font-semibold text-[#9A9A9A] uppercase tracking-widest">Meine Nischen</p></div>
          <div className="p-4 flex flex-wrap gap-2">{nischen.map(n=><span key={n} className="px-3.5 py-2 rounded-full text-xs font-medium bg-[#1A1A2E] text-white">{n}</span>)}</div>
        </div>
      )}

      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#F5F0EA]"><p className="text-xs font-semibold text-[#9A9A9A] uppercase tracking-widest">Avatar Farbe</p></div>
        <div className="p-4 flex gap-3 flex-wrap">
          {FARBEN.map(c=>(
            <button key={c} onClick={async()=>{setFarbe(c);await supabase.auth.updateUser({data:{avatar_farbe:c}})}}
              className={`w-10 h-10 rounded-full transition-all ${farbe===c?'ring-2 ring-offset-2 ring-[#1A1A2E] scale-110':''}`} style={{background:c}}/>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-3 rounded-2xl overflow-hidden" style={{background:'linear-gradient(135deg,#1A1A2E,#2D2D4E)'}}>
        <div className="p-5">
          <h3 className="font-serif text-lg font-bold text-white mb-2">App installieren</h3>
          <p className="text-xs text-white/70 mb-3">Fuege BeautyHub zum Homescreen hinzu.</p>
          <p className="text-sm text-white/80"><span className="text-[#b8924a] font-semibold">iPhone:</span> Safari &rarr; Teilen &rarr; Zum Home-Bildschirm</p>
          <p className="text-sm text-white/80 mt-1"><span className="text-[#b8924a] font-semibold">Android:</span> Chrome &rarr; App installieren</p>
        </div>
      </div>

      <button onClick={async()=>{await supabase.auth.signOut();router.push('/login')}}
        className="mx-4 mt-3 mb-6 w-[calc(100%-2rem)] py-3.5 rounded-2xl bg-white border-[1.5px] border-red-200 text-red-500 text-sm font-medium shadow-sm">
        Abmelden
      </button>

      {showEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={e=>{if(e.target===e.currentTarget)setShowEdit(false)}}>
          <div className="bg-white rounded-t-3xl w-full max-w-xl p-6 pb-8 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-1 bg-[#E0D8D0] rounded-full mx-auto mb-5"/>
            <h2 className="font-serif text-xl font-bold text-[#1A1A2E] mb-5">Profil bearbeiten</h2>
            <div className="space-y-3">
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className={ic}/></div>
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Berufsbezeichnung</label><input value={form.berufsbezeichnung} onChange={e=>setForm({...form,berufsbezeichnung:e.target.value})} placeholder="z.B. Kosmetikerin" className={ic}/></div>
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Unternehmensname</label><input value={form.unternehmen} onChange={e=>setForm({...form,unternehmen:e.target.value})} placeholder="z.B. Ivory Beauty" className={ic}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Kanton</label>
                  <select value={form.kanton} onChange={e=>setForm({...form,kanton:e.target.value})} className={ic}><option value="">Kanton</option>{KANTONE.map(k=><option key={k} value={k}>{k}</option>)}</select></div>
                <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Mitarbeitende</label><input type="number" value={form.mitarbeiter} onChange={e=>setForm({...form,mitarbeiter:e.target.value})} placeholder="1" className={ic}/></div>
              </div>
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Website</label><input type="url" value={form.website} onChange={e=>setForm({...form,website:e.target.value})} placeholder="https://..." className={ic}/></div>
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Bio</label><textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} rows={3} className={ic+' resize-none'}/></div>
              <div>
                <label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-2">Meine Nischen</label>
                <div className="flex flex-wrap gap-2">{NISCHEN.map(n=>(<button key={n} onClick={()=>setNischen(prev=>prev.includes(n)?prev.filter(x=>x!==n):[...prev,n])} className={`px-3 py-1.5 rounded-full text-xs font-medium border-[1.5px] transition-all ${nischen.includes(n)?'bg-[#1A1A2E] text-white border-[#1A1A2E]':'bg-white text-[#6B6B6B] border-[#E8E0D5]'}`}>{n}</button>))}</div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={()=>setShowEdit(false)} className="flex-1 py-3 rounded-xl border-[1.5px] border-[#E8E0D5] text-[#6B6B6B] text-sm">Abbrechen</button>
              <button onClick={save} disabled={saving} className="flex-[2] py-3 rounded-xl bg-[#b8924a] text-white text-sm font-medium disabled:opacity-50">{saving?'Speichern...':'Speichern'}</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
      }
