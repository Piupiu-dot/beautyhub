'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import PostCard from '@/components/PostCard'
import { supabase, Post } from '@/lib/supabase'

const NISCHEN = ['alle','laser','gesicht','nagel','pmu','wimpern','haar','med']
const NISCHEN_LABELS: Record<string, string> = { alle:'Alle', laser:'Laser & IPL', gesicht:'Gesicht & Haut', nagel:'Nails', pmu:'PMU', wimpern:'Lashes & Brows', haar:'Haare', med:'Medizinisch' }
const SORTS = [{ key:'neu',label:'Aktuell'},{key:'beliebt',label:'Beliebt'},{key:'gesetz',label:'Gesetze'},{key:'trend',label:'Trends'}]
const DEMO: Post[] = [
  {id:'1',titel:'Neue Laserklassen-Vorschriften 2026',zusammenfassung:'Das Gesundheitsamt hat aktualisierte Richtlinien für Lasergeräte ab Klasse 3B erlassen. Ab Juli 2026 ist eine erweiterte Zertifizierung erforderlich.',typ:'gesetz',nischen:'laser',quelle_name:'BAG Schweiz',likes:24,ist_agent:true},
  {id:'2',titel:'PMU-Pigmente: EU-Richtlinie jetzt relevant',zusammenfassung:'Die REACH-Verordnung schränkt weitere Pigmentfarben ein. Betroffen sind Blau- und Grüntöne für permanentes Make-up.',typ:'gesetz',nischen:'pmu',quelle_name:'Swissmedic',likes:18,ist_agent:true},
  {id:'3',titel:'Bio-Fermentation: Der grösste Beauty-Trend 2026',zusammenfassung:'Fermentierte Wirkstoffe verbessern die Bioverfügbarkeit von Vitaminen und stärken die Hautbarriere messbar.',typ:'trend',nischen:'gesicht',quelle_name:'Cosmetica Suisse',likes:41,ist_agent:true},
  {id:'4',titel:'Neue Erkenntnisse zu Gel-Systemen bei Nägeln',zusammenfassung:'Pausen zwischen Gel-Applikationen reduzieren Schäden um 60 Prozent.',typ:'news',nischen:'nagel',quelle_name:'SDKF',likes:35,ist_agent:false},
]

export default function FeedPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [nische, setNische] = useState('alle')
  const [sort, setSort] = useState('neu')
  const [loading, setLoading] = useState(true)
  const [avatar, setAvatar] = useState('M')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
      else { const n = data.session.user.user_metadata?.name || data.session.user.email || 'M'; setAvatar(n[0].toUpperCase()) }
    })
  }, [router])

  useEffect(() => { loadFeed() }, [nische, sort])

  async function loadFeed() {
    setLoading(true)
    try {
      let q = supabase.from('posts').select('*').not('typ','eq','community').order('erstellt_am',{ascending:false}).limit(20)
      if (nische !== 'alle') q = q.ilike('nischen', `%${nische}%`)
      if (sort === 'gesetz') q = q.eq('typ','gesetz')
      if (sort === 'trend') q = q.eq('typ','trend')
      if (sort === 'beliebt') q = supabase.from('posts').select('*').order('likes',{ascending:false}).limit(20)
      const { data, error } = await q
      setPosts(error || !data?.length ? DEMO.filter(p => nische==='alle' || p.nischen?.includes(nische)) : data)
    } catch { setPosts(DEMO) }
    setLoading(false)
  }

  return (
    <AppShell>
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-[#F0EAE0] sticky top-0 z-40">
        <h1 className="font-serif text-2xl font-bold text-[#1A1A2E]">BeautyHub</h1>
        <button onClick={() => router.push('/profil')} className="w-9 h-9 rounded-full bg-[#b8924a] flex items-center justify-center text-white text-sm font-semibold">{avatar}</button>
      </div>
      <div className="bg-white border-b border-[#F0EAE0] px-4 py-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 whitespace-nowrap">
          {NISCHEN.map(n => (
            <button key={n} onClick={() => setNische(n)}
              className={`px-4 py-2 rounded-full text-xs font-medium border-[1.5px] transition-all flex-shrink-0 ${nische===n ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]' : 'bg-white text-[#6B6B6B] border-[#E8E0D5]'}`}>
              {NISCHEN_LABELS[n] || n}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 py-3 flex gap-4 border-b border-[#F0EAE0] overflow-x-auto no-scrollbar">
        {SORTS.map(s => (
          <button key={s.key} onClick={() => setSort(s.key)}
            className={`text-sm font-medium py-1 border-b-2 whitespace-nowrap transition-all ${sort===s.key ? 'text-[#b8924a] border-[#b8924a]' : 'text-[#9A9A9A] border-transparent'}`}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="p-4 space-y-3">
        {loading ? (
          <><div className="skeleton h-52"/><div className="skeleton h-52"/></>
        ) : posts.map(p => <PostCard key={p.id} post={p}/>)}
      </div>
    </AppShell>
  )
        }
