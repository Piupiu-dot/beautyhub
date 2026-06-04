'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'
import { formatDatum } from '@/lib/demo'
import { NISCHEN, nischeLabel } from '@/lib/nischen'
import { useRole } from '@/lib/roles'

const TYP: Record<string, { label: string; bg: string; text: string }> = {
  gesetz: { label: 'Gesetz', bg: '#fdf6ec', text: '#b8924a' },
  news:   { label: 'News',   bg: '#f0f4ff', text: '#1c2b4a' },
  trend:  { label: 'Trend',  bg: '#f0faf5', text: '#2d6a4f' },
  ki:     { label: 'KI',     bg: '#f5f0fa', text: '#6b4c8b' },
  community: { label: 'Community', bg: '#f0f4ff', text: '#1c2b4a' },
}
const typOf = (p: any) => TYP[p.ist_agent ? 'ki' : (TYP[p.typ] ? p.typ : 'news')]
const TABS = [{ key: 'ausstehend', label: 'Ausstehend' }, { key: 'genehmigt', label: 'Genehmigt' }, { key: 'abgelehnt', label: 'Abgelehnt' }]

export default function FreigabenPage() {
  const router = useRouter()
  const { isAdmin, isTester, loading: roleLoading } = useRole()
  const [tab, setTab] = useState('ausstehend')
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [user, setUser] = useState<any>(null)

  // Bestätigungs-/Dialog-State
  const [freigebenPost, setFreigebenPost] = useState<any>(null)
  const [ablehnenPost, setAblehnenPost] = useState<any>(null)
  const [grund, setGrund] = useState('')
  const [editPost, setEditPost] = useState<any>(null)
  const [eTitel, setETitel] = useState('')
  const [eZusf, setEZusf] = useState('')
  const [eNischen, setENischen] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUser(data.user)) }, [])
  useEffect(() => { if (!roleLoading && !isAdmin && !isTester) router.replace('/feed') }, [roleLoading, isAdmin, isTester, router])

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('posts').select('*').eq('status', tab).order('erstellt_am', { ascending: false })
    setPosts(data || [])
    setLoading(false)
    const { count: c } = await supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'ausstehend')
    setCount(c || 0)
  }, [tab])

  useEffect(() => { if (!roleLoading && (isAdmin || isTester)) load() }, [roleLoading, isAdmin, isTester, load])

  async function freigeben() {
    if (!freigebenPost) return
    setBusy(true)
    await supabase.from('posts').update({ status: 'publiziert', freigegeben_von: user?.id, freigabe_datum: new Date().toISOString() }).eq('id', freigebenPost.id)
    setBusy(false); setFreigebenPost(null); load()
  }

  async function ablehnen() {
    if (!ablehnenPost || !grund.trim()) return
    setBusy(true)
    await supabase.from('posts').update({ status: 'abgelehnt', freigabe_kommentar: grund, freigegeben_von: user?.id, freigabe_datum: new Date().toISOString() }).eq('id', ablehnenPost.id)
    setBusy(false); setAblehnenPost(null); setGrund(''); load()
  }

  function openEdit(p: any) {
    setEditPost(p); setETitel(p.titel || ''); setEZusf(p.zusammenfassung || '')
    setENischen((p.nischen || '').split(',').map((x: string) => x.trim()).filter(Boolean))
  }
  async function saveEdit(publish: boolean) {
    if (!editPost) return
    setBusy(true)
    const patch: any = { titel: eTitel, zusammenfassung: eZusf, nischen: eNischen.join(',') }
    if (publish) { patch.status = 'publiziert'; patch.freigegeben_von = user?.id; patch.freigabe_datum = new Date().toISOString() }
    await supabase.from('posts').update(patch).eq('id', editPost.id)
    setBusy(false); setEditPost(null); load()
  }
  const toggleNische = (k: string) => setENischen(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])

  if (roleLoading || (!isAdmin && !isTester)) return (
    <AppShell><div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[#b8924a] border-t-transparent rounded-full animate-spin" /></div></AppShell>
  )

  return (
    <AppShell>
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-[#f0ece6] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl font-bold text-[#1a1a1a]">Freigaben</h1>
          {count > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{count} ausstehend</span>}
        </div>
      </div>

      <div className="bg-white border-b border-[#f0ece6] px-4 flex gap-5 overflow-x-auto no-scrollbar">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${tab === t.key ? 'text-[#b8924a] border-[#b8924a]' : 'text-[#9A9A9A] border-transparent'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        {loading ? (
          <><div className="skeleton h-48" /><div className="skeleton h-48" /></>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-sm text-[#6b7280]">Keine Beiträge in dieser Kategorie.</div>
        ) : posts.map(p => {
          const t = typOf(p)
          const nischen = (p.nischen || '').split(',').map((x: string) => x.trim()).filter(Boolean)
          return (
            <div key={p.id} className="card p-4">
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide" style={{ background: t.bg, color: t.text }}>{t.label}</span>
                {p.erstellt_am && <span className="text-xs text-[#6b7280]">{formatDatum(p.erstellt_am)}</span>}
                {p.relevanz_score != null && <span className="ml-auto text-xs font-semibold text-[#b8924a]">Relevanz: {p.relevanz_score}/10</span>}
              </div>
              <h3 className="text-[18px] font-semibold text-[#1a1a1a] leading-snug mb-1.5">{p.titel}</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed line-clamp-3 mb-2.5">{p.zusammenfassung}</p>
              {p.pexels_bild_url && <img src={p.pexels_bild_url} alt="" className="h-20 w-full object-cover rounded-lg mb-2.5" />}
              {nischen.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {nischen.map((n: string) => <span key={n} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#fdf6ec] text-[#8a6d35]">{nischeLabel(n)}</span>)}
                </div>
              )}
              {p.quelle_url && (
                <a href={p.quelle_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[#b8924a] font-medium mb-3 hover:underline break-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>
                  Quelle: {p.quelle_name || p.quelle_url}
                </a>
              )}
              {tab === 'ausstehend' ? (
                <div className="flex gap-2 pt-3 border-t border-[#f0ece6]">
                  <button onClick={() => setFreigebenPost(p)} className="flex-1 py-2.5 rounded-xl bg-[#b8924a] text-white text-sm font-medium hover:bg-[#a07a3a] transition-colors">✅ Freigeben</button>
                  <button onClick={() => openEdit(p)} className="flex-1 py-2.5 rounded-xl border border-[#f0ece6] text-[#6b7280] text-sm font-medium hover:bg-[#faf8f5] transition-colors">✏️ Bearbeiten</button>
                  <button onClick={() => { setAblehnenPost(p); setGrund('') }} className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">❌ Ablehnen</button>
                </div>
              ) : p.freigabe_kommentar ? (
                <p className="pt-3 border-t border-[#f0ece6] text-xs text-[#6b7280]"><span className="font-semibold">Grund:</span> {p.freigabe_kommentar}</p>
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Freigeben-Dialog */}
      {freigebenPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5" onClick={e => { if (e.target === e.currentTarget) setFreigebenPost(null) }}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <h2 className="font-serif text-xl font-bold text-[#1a1a1a] mb-2">Beitrag wirklich freigeben?</h2>
            <p className="text-sm text-[#6b7280] mb-6">Der Beitrag wird sofort im Feed für alle User sichtbar.</p>
            <div className="flex gap-2">
              <button onClick={() => setFreigebenPost(null)} className="flex-1 py-3 rounded-xl border border-[#f0ece6] text-[#6b7280] text-sm font-medium">Abbrechen</button>
              <button onClick={freigeben} disabled={busy} className="flex-1 py-3 rounded-xl bg-[#b8924a] text-white text-sm font-medium disabled:opacity-50">{busy ? '...' : 'Freigeben'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Ablehnen-Dialog */}
      {ablehnenPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5" onClick={e => { if (e.target === e.currentTarget) setAblehnenPost(null) }}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h2 className="font-serif text-xl font-bold text-[#1a1a1a] mb-3">Beitrag ablehnen</h2>
            <label className="block text-[11px] font-medium text-[#6b7280] uppercase tracking-wider mb-1.5">Grund für Ablehnung *</label>
            <textarea value={grund} onChange={e => setGrund(e.target.value)} rows={3} placeholder="Warum wird der Beitrag abgelehnt?" className="w-full border border-[#f0ece6] rounded-xl px-3 py-2.5 text-sm bg-[#faf8f5] outline-none focus:border-[#b8924a] focus:ring-2 focus:ring-[#b8924a] resize-none mb-4" />
            <div className="flex gap-2">
              <button onClick={() => setAblehnenPost(null)} className="flex-1 py-3 rounded-xl border border-[#f0ece6] text-[#6b7280] text-sm font-medium">Abbrechen</button>
              <button onClick={ablehnen} disabled={busy || !grund.trim()} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50">{busy ? '...' : 'Ablehnen'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Bearbeiten-Modal */}
      {editPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={e => { if (e.target === e.currentTarget) setEditPost(null) }}>
          <div className="bg-white rounded-t-3xl w-full max-w-xl p-6 pb-8 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-1 bg-[#E0D8D0] rounded-full mx-auto mb-5" />
            <h2 className="font-serif text-xl font-bold text-[#1a1a1a] mb-5">Beitrag bearbeiten</h2>
            <div className="space-y-3">
              <div><label className="block text-[11px] font-medium text-[#6b7280] uppercase tracking-wider mb-1.5">Titel</label>
                <input value={eTitel} onChange={e => setETitel(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#f0ece6] bg-[#faf8f5] text-sm outline-none focus:border-[#b8924a] focus:ring-2 focus:ring-[#b8924a]" /></div>
              <div><label className="block text-[11px] font-medium text-[#6b7280] uppercase tracking-wider mb-1.5">Zusammenfassung</label>
                <textarea value={eZusf} onChange={e => setEZusf(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-[#f0ece6] bg-[#faf8f5] text-sm outline-none focus:border-[#b8924a] focus:ring-2 focus:ring-[#b8924a] resize-none" /></div>
              <div><label className="block text-[11px] font-medium text-[#6b7280] uppercase tracking-wider mb-2">Nischen</label>
                <div className="flex flex-wrap gap-2">{NISCHEN.map(n => (
                  <button key={n.key} onClick={() => toggleNische(n.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium border-[1.5px] transition-colors ${eNischen.includes(n.key) ? 'bg-[#b8924a] text-white border-[#b8924a]' : 'bg-white text-[#6b7280] border-[#E8E0D5]'}`}>{n.label}</button>
                ))}</div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => saveEdit(false)} disabled={busy} className="flex-1 py-3 rounded-xl border border-[#f0ece6] text-[#6b7280] text-sm font-medium disabled:opacity-50">Speichern</button>
              <button onClick={() => saveEdit(true)} disabled={busy} className="flex-1 py-3 rounded-xl bg-[#b8924a] text-white text-sm font-medium disabled:opacity-50">{busy ? '...' : 'Speichern & Freigeben'}</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
