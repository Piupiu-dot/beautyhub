'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'
import { findDemoPost } from '@/lib/demo'

export default function DetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [post, setPost] = useState<any>(null)
  const [kommentare, setKommentare] = useState<any[]>([])
  const [kommentar, setKommentar] = useState('')
  const [user, setUser] = useState<any>(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    if (id) { loadPost(); loadKommentare() }
  }, [id])

  async function loadPost() {
    setLoading(true)
    // UUID-Spalten lehnen Demo-IDs wie '1'/'c1' ab → Query in try/catch und auf Demo-Daten zurückfallen
    let found: any = null
    try {
      const { data } = await supabase.from('posts').select('*').eq('id', id).maybeSingle()
      if (data) found = data
    } catch { /* ignoriert – Fallback unten */ }
    if (!found) found = findDemoPost(id)
    if (found) { setPost(found); setLikeCount(found.likes || 0) }
    setLoading(false)
  }

  async function loadKommentare() {
    const { data } = await supabase.from('kommentare').select('*').eq('post_id', id).order('erstellt_am', { ascending: false })
    setKommentare(data || [])
  }

  async function submitKommentar() {
    if (!kommentar.trim() || !user) return
    setSubmitting(true)
    const name = user.user_metadata?.name || user.email || 'Nutzer'
    await supabase.from('kommentare').insert({ post_id: id, autor_id: user.id, inhalt: kommentar, likes: 0, autor_name: name })
    setKommentar(''); loadKommentare(); setSubmitting(false)
  }

  const BADGE_MAP: Record<string, string> = {
    gesetz: 'bg-[#E8F5E9] text-[#2E7D32]',
    trend: 'bg-[#F3E5F5] text-[#6A1B9A]',
    news: 'bg-[#FFF3E0] text-[#E65100]',
    community: 'bg-[#E3F2FD] text-[#1565C0]',
  }
  const BADGE_LABEL: Record<string, string> = { gesetz:'Gesetz', trend:'Trend', news:'News', community:'Community' }
  const TYP: Record<string, { label: string; color: string }> = {
    gesetz:    { label: 'Gesetz', color: '#b8924a' },
    trend:     { label: 'Trend',  color: '#2d6a4f' },
    news:      { label: 'News',   color: '#1c2b4a' },
    ki:        { label: 'KI',     color: '#6b4c8b' },
    community: { label: 'Community', color: '#1c2b4a' },
  }
  const badgeCls = post ? (BADGE_MAP[post.typ] || BADGE_MAP.news) : ''
  const badgeLabel = post ? (BADGE_LABEL[post.typ] || 'News') : ''
  const head = post ? (TYP[post.ist_agent ? 'ki' : (TYP[post.typ] ? post.typ : 'news')]) : TYP.news
  const nische = post?.nischen?.split(',')[0]?.trim()

  if (loading) return (
    <AppShell>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#b8924a] border-t-transparent rounded-full animate-spin"/>
      </div>
    </AppShell>
  )

  if (!post) return (
    <AppShell>
      <div className="flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="w-24 h-24 rounded-full bg-[#F5EFE8] flex items-center justify-center mb-6">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#b8924a" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#1A1A2E] mb-2">Beitrag nicht gefunden</h2>
        <p className="text-sm text-[#9A9A9A] max-w-xs mb-6">Dieser Beitrag existiert nicht mehr oder wurde entfernt.</p>
        <button onClick={() => router.push('/feed')} className="px-6 py-3.5 bg-[#b8924a] text-white rounded-xl font-medium hover:bg-[#a07a3a] transition-colors">Zurück zum Feed</button>
      </div>
    </AppShell>
  )

  return (
    <AppShell>
      <div className="bg-white px-4 py-3.5 flex items-center gap-3 border-b border-[#f0ece6] sticky top-0 z-40">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[#b8924a] text-sm font-semibold flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="15 18 9 12 15 6"/></svg>
          Zurück
        </button>
        <span className="font-serif text-base font-bold text-[#1A1A2E] truncate">{post.titel}</span>
      </div>
      <div className="bg-white">
        <div className="w-full h-32 flex items-center justify-center" style={{ background: head.color }}>
          <span className="font-serif text-3xl font-bold text-white uppercase tracking-[0.15em]">{head.label}</span>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${badgeCls}`}>{badgeLabel}</span>
            {nische && <span className="text-[11px] text-[#b8924a] font-medium bg-[#fdf6ec] px-2.5 py-1 rounded-full">{nische}</span>}
            {post.ist_agent && <span className="text-[11px] text-[#1565C0] bg-[#E3F2FD] px-2.5 py-1 rounded-full">KI</span>}
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#1A1A2E] leading-tight mb-3">{post.titel}</h1>
          <div className="flex items-center justify-between pb-4 border-b border-[#f0ece6] mb-4">
            <span className="text-xs text-[#9A9A9A]">{post.quelle_name || 'BeautyHub'}</span>
            {post.erstellt_am && <span className="text-xs text-[#C0B0A0]">{new Date(post.erstellt_am).toLocaleDateString('de-CH')}</span>}
          </div>
          <div className="text-base text-[#3A3A3A] leading-relaxed space-y-3 mb-5">
            {(post.inhalt || post.zusammenfassung || '').split('\n').filter(Boolean).map((p: string, i: number) => <p key={i}>{p}</p>)}
          </div>
          <div className="flex items-center gap-3 py-4 border-t border-[#f0ece6]">
            <button onClick={() => { setLiked(!liked); setLikeCount(c => c + (liked ? -1 : 1)) }}
              className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl ${liked ? 'text-[#b8924a] bg-[#fdf6ec]' : 'text-[#6B6B6B]'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill={liked ? 'currentColor' : 'none'} strokeWidth={1.8}>
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              {likeCount}
            </button>
            <span className="text-sm text-[#6B6B6B] px-3 py-2">{kommentare.length} Kommentare</span>
            {post.quelle_url && <a href={post.quelle_url} target="_blank" rel="noopener noreferrer" className="ml-auto text-sm text-[#b8924a] font-semibold bg-[#fdf6ec] px-3 py-2 rounded-xl border border-[#F0E0C0]">Quelle</a>}
          </div>
        </div>
      </div>
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between py-4">
          <h2 className="font-serif text-xl font-bold text-[#1A1A2E]">Diskussion</h2>
          <span className="bg-[#f0ece6] text-[#b8924a] text-xs font-bold px-2.5 py-1 rounded-full">{kommentare.length}</span>
        </div>
        {user ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <textarea id="cInput" value={kommentar} onChange={e => setKommentar(e.target.value)}
              placeholder="Dein Kommentar..." rows={3}
              className="w-full border-[1.5px] border-[#E8E0D5] rounded-xl px-3 py-2.5 text-sm bg-[#faf8f5] resize-none outline-none focus:border-[#b8924a] mb-2"/>
            <button onClick={submitKommentar} disabled={submitting || !kommentar.trim()}
              className="w-full py-3 bg-[#b8924a] text-white rounded-xl font-medium text-sm disabled:opacity-50">
              {submitting ? 'Wird gespeichert...' : 'Kommentar veröffentlichen'}
            </button>
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-[#9A9A9A] mb-4">
            <button onClick={() => router.push('/login')} className="text-[#b8924a] font-semibold">Anmelden</button> um zu kommentieren
          </div>
        )}
        <div className="space-y-3">
          {kommentare.map((k: any) => (
            <div key={k.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#E8DDD0] flex items-center justify-center text-[#b8924a] font-bold text-sm">{(k.autor_name||'?')[0].toUpperCase()}</div>
                <p className="text-sm font-semibold text-[#1A1A2E]">{k.autor_name||'Anonym'}</p>
              </div>
              <p className="text-sm text-[#5A5A5A] leading-relaxed">{k.inhalt}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
                             }
