'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'

const BADGE: Record<string, { label: string; cls: string }> = {
  gesetz: { label: 'Gesetz', cls: 'bg-[#E8F5E9] text-[#2E7D32]' },
  trend: { label: 'Trend', cls: 'bg-[#F3E5F5] text-[#6A1B9A]' },
  news: { label: 'News', cls: 'bg-[#FFF3E0] text-[#E65100]' },
  community: { label: 'Community', cls: 'bg-[#E3F2FD] text-[#1565C0]' },
}

function tAgo(d: string) {
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000)
  if (h < 1) return 'Gerade eben'; if (h < 24) return `vor ${h}h`; return `vor ${Math.floor(h/24)} Tagen`
}

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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    if (id) { loadPost(); loadKommentare() }
  }, [id])

  async function loadPost() {
    const { data } = await supabase.from('posts').select('*').eq('id', id).single()
    if (data) { setPost(data); setLikeCount(data.likes || 0) }
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

  const badge = post ? (BADGE[post.typ] || BADGE.news) : BADGE.news
  const nische = post?.nischen?.split(',')[0]?.trim()

  return (
    <AppShell>
      <div className="bg-white px-4 py-3.5 flex items-center gap-3 border-b border-[#F0EAE0] sticky top-0 z-40">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[#b8924a] text-sm font-semibold">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="15 18 9 12 15 6"/></svg>
          Zurueck
        </button>
        <span className="font-serif text-base font-bold text-[#1A1A2E] truncate">{post?.titel || 'Artikel'}</span>
      </div>
      {post && (
        <div className="bg-white">
          <div className="w-full h-48 bg-[#F5EFE8] flex items-center justify-center">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="28" stroke="#8a7055" strokeWidth="1.5"/>
              <path d="M28 40 Q40 24 52 40 Q40 56 28 40Z" stroke="#8a7055" strokeWidth="1.5" fill="none"/>
              <circle cx="40" cy="40" r="6" stroke="#8a7055" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${badge.cls}`}>{badge.label}</span>
              {nische && <span className="text-[11px] text-[#b8924a] font-medium bg-[#FFF8F0] px-2.5 py-1 rounded-full">{nische}</span>}
              {post.ist_agent && <span className="text-[11px] text-[#1565C0] bg-[#E3F2FD] px-2.5 py-1 rounded-full font-medium">KI</span>}
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#1A1A2E] leading-tight mb-3">{post.titel}</h1>
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE0] mb-4">
              <div className="flex items-center gap-2 text-xs text-[#9A9A9A]">
                <span className="w-1.5 h-1.5 bg-[#b8924a] rounded-full"/>
                <span>{post.quelle_name || 'BeautyHub'}</span>
              </div>
              {post.erstellt_am && <span className="text-xs text-[#C0B0A0]">{new Date(post.erstellt_am).toLocaleDateString('de-CH')}</span>}
            </div>
            <div className="text-base text-[#3A3A3A] leading-relaxed space-y-3 mb-5">
              {(post.zusammenfassung || '').split('\n').filter(Boolean).map((p: string, i: number) => <p key={i}>{p}</p>)}
            </div>
            <div className="flex items-center gap-3 py-4 border-t border-b-2 border-[#F0EAE0]">
              <button onClick={() => { setLiked(!liked); setLikeCount(c => c + (liked ? -1 : 1)) }}
                className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl transition-colors ${liked ? 'text-[#b8924a] bg-[#FFF8F0]' : 'text-[#6B6B6B] hover:bg-[#faf8f5]'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill={liked ? 'currentColor' : 'none'} strokeWidth={1.8}>
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                {likeCount}
              </button>
              <button onClick={() => document.getElementById('cInput')?.focus()}
                className="flex items-center gap-1.5 text-sm text-[#6B6B6B] px-3 py-2 rounded-xl hover:bg-[#faf8f5]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                {kommentare.length} Kommentare
              </button>
              {post.quelle_url && (
                <a href={post.quelle_url} target="_blank" rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-1.5 text-sm text-[#b8924a] font-semibold bg-[#FFF8F0] px-3 py-2 rounded-xl border border-[#F0E0C0]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Quelle
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between py-5">
          <h2 className="font-serif text-xl font-bold text-[#1A1A2E]">Diskussion</h2>
          <span className="bg-[#F0EAE0] text-[#b8924a] text-xs font-bold px-2.5 py-1 rounded-full">{kommentare.length}</span>
        </div>
        {user ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex gap-2.5 mb-2.5">
              <div className="w-9 h-9 rounded-full bg-[#b8924a] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {(user.user_metadata?.name || user.email || 'M')[0].toUpperCase()}
              </div>
              <textarea id="cInput" value={kommentar} onChange={e => setKommentar(e.target.value)}
                placeholder="Dein Kommentar..." rows={3}
                className="flex-1 border-[1.5px] border-[#E8E0D5] rounded-xl px-3 py-2.5 text-sm bg-[#faf8f5] resize-none outline-none focus:border-[#b8924a] focus:bg-white"/>
            </div>
            <button onClick={submitKommentar} disabled={submitting || !kommentar.trim()}
              className="w-full py-3 bg-[#b8924a] text-white rounded-xl font-medium text-sm hover:bg-[#a07a3a] disabled:opacity-50 transition-colors">
              {submitting ? 'Wird veroeffentlicht...' : 'Kommentar veroeffentlichen'}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 text-center text-sm text-[#9A9A9A] mb-4 shadow-sm">
            <button onClick={() => router.push('/login')} className="text-[#b8924a] font-semibold">Anmelden</button> um zu kommentieren
          </div>
        )}
        {kommentare.length === 0 ? (
          <div className="text-center py-10 text-[#9A9A9A] text-sm">Noch keine Kommentare. Sei die Erste!</div>
        ) : (
          <div className="space-y-3">
            {kommentare.map((k: any) => (
              <div key={k.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#E8DDD0] flex items-center justify-center text-[#b8924a] text-sm font-bold">
                    {(k.autor_name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A2E]">{k.autor_name || 'Anonym'}</p>
                  </div>
                  <span className="ml-auto text-xs text-[#C0B0A0]">{k.erstellt_am ? tAgo(k.erstellt_am) : ''}</span>
                </div>
                <p className="text-sm text-[#5A5A5A] leading-relaxed mb-2">{k.inhalt}</p>
                <button onClick={() => setKommentar(`@${k.autor_name} `)} className="text-xs text-[#b8924a] font-semibold">Antworten</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
                                 }
