'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import PostCard from '@/components/PostCard'
import { supabase, Post } from '@/lib/supabase'
import { DEMO_POSTS } from '@/lib/demo'

const TYPEN = [
  { key: 'alle', label: 'Alle' },
  { key: 'gesetz', label: 'Gesetze' },
  { key: 'news', label: 'News' },
  { key: 'trend', label: 'Trends' },
  { key: 'ki', label: 'KI' },
]
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

export default function FeedPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [typ, setTyp] = useState('alle')
  const [nische, setNische] = useState('alle')
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [loading, setLoading] = useState(true)
  const [avatar, setAvatar] = useState('M')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
      else { const n = data.session.user.user_metadata?.name || data.session.user.email || 'M'; setAvatar(n[0].toUpperCase()) }
    })
  }, [router])

  useEffect(() => { loadFeed() }, [])

  async function loadFeed() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('posts').select('*').not('typ', 'eq', 'community').order('erstellt_am', { ascending: false }).limit(100)
      setPosts(error || !data?.length ? DEMO_POSTS : data)
    } catch { setPosts(DEMO_POSTS) }
    setLoading(false)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return posts.filter(p => {
      const matchTyp = typ === 'alle' || (typ === 'ki' ? p.ist_agent : p.typ === typ)
      const matchNische = nische === 'alle' || p.nischen?.includes(nische)
      const matchSearch = !q || `${p.titel} ${p.zusammenfassung || ''} ${p.inhalt || ''}`.toLowerCase().includes(q)
      return matchTyp && matchNische && matchSearch
    })
  }, [posts, typ, nische, search])

  function resetFilters() { setTyp('alle'); setNische('alle'); setSearch(''); setShowSearch(false) }

  const railBtn = (active: boolean) => `w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'bg-[#fdf6ec] text-[#b8924a]' : 'text-[#6B6B6B] hover:bg-[#faf8f5]'}`
  const pill = (active: boolean) => `px-4 py-2 rounded-full text-xs font-medium border-[1.5px] transition-all flex-shrink-0 ${active ? 'bg-[#b8924a] text-white border-[#b8924a]' : 'bg-white text-[#6B6B6B] border-[#E8E0D5]'}`
  const searchInput = 'w-full px-4 py-2.5 rounded-xl border-[1.5px] border-[#E8E0D5] bg-[#faf8f5] text-sm outline-none focus:border-[#b8924a] focus:ring-2 focus:ring-[#b8924a]'

  return (
    <AppShell>
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-[#F0EAE0] sticky top-0 z-40">
        <h1 className="font-serif text-2xl font-bold text-[#1A1A2E]">BeautyHub</h1>
        <div className="flex items-center gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Beiträge durchsuchen..." className={`hidden md:block w-64 ${searchInput}`} />
          <button onClick={() => setShowSearch(s => !s)} aria-label="Suche" className="md:hidden w-9 h-9 rounded-full bg-[#faf8f5] flex items-center justify-center text-[#6B6B6B]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </button>
          <button onClick={() => router.push('/profil')} className="w-9 h-9 rounded-full bg-[#b8924a] flex items-center justify-center text-white text-sm font-semibold">{avatar}</button>
        </div>
      </div>

      {showSearch && (
        <div className="md:hidden bg-white px-4 py-3 border-b border-[#F0EAE0]">
          <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Beiträge durchsuchen..." className={searchInput} />
        </div>
      )}

      {/* Mobile-Filter: Content-Typ Tabs */}
      <div className="md:hidden bg-white border-b border-[#F0EAE0] px-4 flex gap-5 overflow-x-auto no-scrollbar">
        {TYPEN.map(t => (
          <button key={t.key} onClick={() => setTyp(t.key)}
            className={`py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${typ === t.key ? 'text-[#b8924a] border-[#b8924a]' : 'text-[#9A9A9A] border-transparent'}`}>
            {t.label}
          </button>
        ))}
      </div>
      {/* Mobile-Filter: Nischen-Pills */}
      <div className="md:hidden bg-white border-b border-[#F0EAE0] px-4 py-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 whitespace-nowrap">
          {NISCHEN.map(n => <button key={n.key} onClick={() => setNische(n.key)} className={pill(nische === n.key)}>{n.label}</button>)}
        </div>
      </div>

      <div className="md:flex md:items-start">
        {/* Desktop-Filter-Rail */}
        <aside className="hidden md:block w-56 shrink-0 border-r border-[#e8e0d5] p-4 sticky top-[73px]">
          <p className="text-[10px] font-bold text-[#9A9A9A] uppercase tracking-widest mb-2 px-3">Inhalt</p>
          <div className="space-y-1 mb-6">
            {TYPEN.map(t => <button key={t.key} onClick={() => setTyp(t.key)} className={railBtn(typ === t.key)}>{t.label}</button>)}
          </div>
          <p className="text-[10px] font-bold text-[#9A9A9A] uppercase tracking-widest mb-2 px-3">Nische</p>
          <div className="space-y-1">
            {NISCHEN.map(n => <button key={n.key} onClick={() => setNische(n.key)} className={railBtn(nische === n.key)}>{n.label}</button>)}
          </div>
        </aside>

        <div className="flex-1 p-4 space-y-3 min-w-0">
          {loading ? (
            <><div className="skeleton h-40" /><div className="skeleton h-40" /></>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-[#9A9A9A]">Keine Beiträge für diese Auswahl gefunden.</p>
              <button onClick={resetFilters} className="mt-3 text-[#b8924a] font-semibold text-sm hover:underline">Filter zurücksetzen</button>
            </div>
          ) : filtered.map(p => <PostCard key={p.id} post={p} />)}
        </div>
      </div>
    </AppShell>
  )
}
