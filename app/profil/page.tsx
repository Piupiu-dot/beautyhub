'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'

const FARBEN = ['#b8924a','#2D6A4F','#1A1A2E','#C0392B','#6A1B9A','#1565C0']
const NISCHEN = ['laser','gesicht','nagel','pmu','wimpern','haar','med']

export default function ProfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [nischen, setNischen] = useState<string[]>([])
  const [farbe, setFarbe] = useState('#b8924a')
  const [editName, setEditName] = useState('')
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
      else {
        setUser(data.session.user)
        setEditName(data.session.user.user_metadata?.name || '')
        setFarbe(data.session.user.user_metadata?.avatar_farbe || '#b8924a')
      }
    })
  }, [router])

  const name = user?.user_metadata?.name || user?.email || 'Nutzer'
  const ic = 'w-full px-4 py-3 rounded-xl border-[1.5px] border-[#E8E0D5] bg-[#faf8f5] text-sm outline-none focus:border-[#b8924a]'

  return (
    <AppShell>
      <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-[#F0EAE0] sticky top-0 z-40">
        <h1 className="font-serif text-2xl font-bold text-[#1A1A2E]">Profil</h1>
        <button onClick={() => setShowEdit(true)} className="text-sm text-[#b8924a] font-semibold">Bearbeiten</button>
      </div>
      <div className="bg-white pb-6 border-b border-[#F0EAE0] text-center px-5 pt-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center font-serif text-3xl font-bold text-white mx-auto mb-4"
          style={{ background: farbe }}>{name[0]?.toUpperCase()}</div>
        <h2 className="font-serif text-2xl font-bold text-[#1A1A2E]">{name}</h2>
        <p className="text-sm text-[#9A9A9A] mt-1">{user?.email}</p>
      </div>
      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#F5F0EA]">
          <p className="text-xs font-semibold text-[#9A9A9A] uppercase tracking-widest">Meine Nischen</p>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {NISCHEN.map(n => (
            <button key={n}
              onClick={() => setNischen(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])}
              className={`px-3.5 py-2 rounded-full text-xs font-medium border-[1.5px] transition-all ${nischen.includes(n) ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]' : 'bg-white text-[#6B6B6B] border-[#E8E0D5]'}`}>{n}</button>
          ))}
        </div>
      </div>
      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#F5F0EA]">
          <p className="text-xs font-semibold text-[#9A9A9A] uppercase tracking-widest">Avatar Farbe</p>
        </div>
        <div className="p-4 flex gap-3">
          {FARBEN.map(c => (
            <button key={c}
              onClick={async () => { setFarbe(c); await supabase.auth.updateUser({ data: { avatar_farbe: c } }) }}
              className={`w-10 h-10 rounded-full ${farbe === c ? 'ring-2 ring-offset-2 ring-[#1A1A2E]' : ''}`}
              style={{ background: c }}/>
          ))}
        </div>
      </div>
      <div className="mx-4 mt-3 rounded-2xl p-5" style={{ background: 'linear-gradient(135deg,#1A1A2E,#2D2D4E)' }}>
        <h3 className="font-serif text-lg font-bold text-white mb-2">App installieren</h3>
        <p className="text-sm text-white/80">iPhone: Safari &rarr; Teilen &rarr; Zum Home-Bildschirm</p>
        <p className="text-sm text-white/80 mt-1">Android: Chrome &rarr; App installieren</p>
      </div>
      <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
        className="mx-4 mt-3 mb-6 w-[calc(100%-2rem)] py-3.5 rounded-2xl bg-white border-[1.5px] border-red-200 text-red-600 text-sm font-medium shadow-sm">
        Abmelden
      </button>
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
          onClick={e => { if (e.target === e.currentTarget) setShowEdit(false) }}>
          <div className="bg-white rounded-t-3xl w-full max-w-xl p-6 pb-10">
            <h2 className="font-serif text-xl font-bold text-[#1A1A2E] mb-5">Profil bearbeiten</h2>
            <div>
              <label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Name</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} className={ic}/>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowEdit(false)} className="flex-1 py-3 rounded-xl border-[1.5px] border-[#E8E0D5] text-[#6B6B6B] text-sm">Abbrechen</button>
              <button onClick={async () => { await supabase.auth.updateUser({ data: { name: editName, avatar_farbe: farbe } }); setShowEdit(false) }}
                className="flex-[2] py-3 rounded-xl bg-[#b8924a] text-white text-sm font-medium">Speichern</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
    }
