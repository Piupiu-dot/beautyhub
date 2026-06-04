'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import { supabase, Post } from '@/lib/supabase'
import { DEMO_COMMUNITY, formatDatum } from '@/lib/demo'

const NISCHEN = [
  { key: 'alle', label: 'Alle' },
  { key: 'laser', label: 'Laser & IPL' },
  { key: 'gesicht', label: 'Gesicht & Haut' },
  { key: 'nagel', label: 'Nails' },
  { key: 'pmu', label: 'PMU' },
  { key: 'wimpern', label: 'Lashes & Brows' },
  { key: 'haar', label: 'Haare' },
  { key: 'med', label: 'Medizinisch' },
]

export default function CommunityPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [nische, setNische] = useState('alle')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [txt, setTxt] = useState('')
  const [selN, setSelN] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)
  const [av, setAv] = useState('M')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
      else { const x = data.session.user.user_metadata?.name || data.session.user.email || 'M'; setAv(x[0].toUpperCase()); setUser(data.session.user) }
    })
  }, [router])

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('posts').select('*').eq('typ', 'community').order('erstellt_am', { ascending: false }).limit(50)
      setPosts(error || !data?.length ? DEMO_COMMUNITY : data)
    } catch { setPosts(DEMO_COMMUNITY) }
    setLoading(false)
  }

  const filtered = useMemo(() => posts.filter(p => nische === 'alle' || p.nischen?.includes(nische)), [posts, nische])

  async function sub() {
    if (!txt.trim() || !user) return
    await supabase.from('posts').insert({ titel: txt.substring(0, 80), inhalt: txt, typ: 'community', nischen: selN.join(','), autor_id: user.id, autor_name: user.user_metadata?.name || user.email, ist_agent: false, likes: 0, status: 'publiziert' })
    setModal(false); setTxt(''); setSelN([]); load()
  }

  const railBtn = (active: boolean) => `w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'bg-[#fdf6ec] text-[#b8924a]' : 'text-[#6B6B6B] hover:bg-[#faf8f5]'}`
  const pill = (active: boolean) => `px-4 py-2 rounded-full text-xs font-medium border-[1.5px] transition-all flex-shrink-0 ${active ? 'bg-[#b8924a] text-white border-[#b8924a]' : 'bg-white text-[#6B6B6B] border-[#E8E0D5]'}`

  return (
    <AppShell>
      <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-[#f0ece6] sticky top-0 z-40">
        <h1 className="font-serif text-2xl font-bold text-[#1A1A2E]">BeautyHub</h1>
        <button onClick={() => router.push('/profil')} className="w-9 h-9 rounded-full bg-[#b8924a] flex items-center justify-center text-white text-sm font-semibold">{av}</button>
      </div>

      <div className="card m-4 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#b8924a] flex items-center justify-center text-white font-semibold">{av}</div>
        <div onClick={() => setModal(true)} className="flex-1 bg-[#faf8f5] border border-[#f0ece6] rounded-xl px-4 py-3 text-sm text-[#6b7280] cursor-pointer">Frage stellen oder Erfahrung teilen...</div>
        <button onClick={() => setModal(true)} className="bg-[#b8924a] text-white text-sm font-medium px-4 py-2.5 rounded-xl flex-shrink-0">Posten</button>
      </div>

      {/* Mobile-Filter: Nischen-Pills */}
      <div className="md:hidden px-4 pb-3.5 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 whitespace-nowrap">
          {NISCHEN.map(x => <button key={x.key} onClick={() => setNische(x.key)} className={pill(nische === x.key)}>{x.label}</button>)}
        </div>
      </div>

      <div className="md:flex md:items-start">
        {/* Desktop-Filter-Rail */}
        <aside className="hidden md:block w-56 shrink-0 border-r border-[#f0ece6] p-4 sticky top-[73px]">
          <p className="text-[10px] font-bold text-[#9A9A9A] uppercase tracking-widest mb-2 px-3">Nische</p>
          <div className="space-y-1">
            {NISCHEN.map(x => <button key={x.key} onClick={() => setNische(x.key)} className={railBtn(nische === x.key)}>{x.label}</button>)}
          </div>
        </aside>

        <div className="flex-1 px-4 pb-4 space-y-3 min-w-0">
          {loading ? (
            <><div className="skeleton h-40" /><div className="skeleton h-40" /></>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-[#9A9A9A]">Keine Beiträge für diese Auswahl gefunden.</p>
              <button onClick={() => setNische('alle')} className="mt-3 text-[#b8924a] font-semibold text-sm hover:underline">Filter zurücksetzen</button>
            </div>
          ) : filtered.map(p => (
            <Link key={p.id} href={`/feed/${p.id}`} className="card block p-5 hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#E8DDD0] flex items-center justify-center text-[#b8924a] font-bold text-sm">{(p.autor_name || '?')[0].toUpperCase()}</div>
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{p.autor_name || 'Anonym'}</p>
                  <p className="text-xs text-[#6b7280]">{p.erstellt_am ? formatDatum(p.erstellt_am) : ''}</p>
                </div>
              </div>
              <h3 className="text-base font-semibold text-[#1a1a1a] leading-snug mb-2">{p.titel}</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed line-clamp-3">{p.inhalt}</p>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#f0ece6]">
                <span className="text-xs text-[#6b7280]">♥ {p.likes || 0}</span>
                <span className="text-xs text-[#6b7280]">💬 {p.kommentare_count || 0}</span>
                <span className="ml-auto text-xs text-[#b8924a] font-semibold">Lesen →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div className="bg-white rounded-t-3xl w-full max-w-xl p-6 pb-10">
            <h2 className="font-serif text-xl font-bold text-[#1A1A2E] mb-4">Neuer Beitrag</h2>
            <textarea value={txt} onChange={e => setTxt(e.target.value)} placeholder="Was möchtest du teilen?" rows={4} className="w-full border-[1.5px] border-[#E8E0D5] rounded-xl px-4 py-3 text-sm bg-[#faf8f5] outline-none focus:border-[#b8924a] resize-none" />
            <div className="flex gap-2 flex-wrap my-3">
              {NISCHEN.filter(x => x.key !== 'alle').map(x => (
                <button key={x.key} onClick={() => setSelN(prev => prev.includes(x.key) ? prev.filter(y => y !== x.key) : [...prev, x.key])} className={`px-3 py-1.5 rounded-full text-xs border-[1.5px] ${selN.includes(x.key) ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]' : 'bg-white text-[#6B6B6B] border-[#E8E0D5]'}`}>{x.label}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setModal(false)} className="flex-1 py-3 rounded-xl border-[1.5px] border-[#E8E0D5] text-[#6B6B6B] text-sm">Abbrechen</button>
              <button onClick={sub} className="flex-[2] py-3 rounded-xl bg-[#b8924a] text-white text-sm font-medium">Veröffentlichen</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
