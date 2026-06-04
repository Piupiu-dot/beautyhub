'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'
import { NISCHEN, nischeLabel } from '@/lib/nischen'
import { useRole } from '@/lib/roles'

const NISCHEN_OPT = [{ key: 'alle', label: 'Alle' }, ...NISCHEN]

export default function QuellenPage() {
  const router = useRouter()
  const { isAdmin, isTester, loading: roleLoading } = useRole()
  const [user, setUser] = useState<any>(null)
  const [genehmigt, setGenehmigt] = useState<any[]>([])
  const [vorschlaege, setVorschlaege] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(''); const [err, setErr] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ url: '', name: '', beschreibung: '', rss_feed: '' })
  const [nischen, setNischen] = useState<string[]>([])

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUser(data.user)) }, [])
  useEffect(() => { if (!roleLoading && !isAdmin && !isTester) router.replace('/feed') }, [roleLoading, isAdmin, isTester, router])

  const load = useCallback(async () => {
    setLoading(true)
    const { data: g } = await supabase.from('quellen').select('*').eq('genehmigt', true).order('name')
    setGenehmigt(g || [])
    if (isAdmin) {
      const { data: v } = await supabase.from('quellen').select('*').eq('genehmigt', false).order('erstellt_am', { ascending: false })
      setVorschlaege(v || [])
    }
    setLoading(false)
  }, [isAdmin])

  useEffect(() => { if (!roleLoading && (isAdmin || isTester)) load() }, [roleLoading, isAdmin, isTester, load])

  const toggleN = (k: string) => setNischen(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])

  async function submit() {
    if (!form.url.trim() || !form.name.trim()) { setErr(true); return setMsg('URL und Name sind Pflichtfelder.') }
    setBusy(true); setMsg('')
    const { error } = await supabase.from('quellen').insert({
      url: form.url.trim(), name: form.name.trim(), beschreibung: form.beschreibung || null,
      nischen: nischen.length ? nischen : null, rss_feed: form.rss_feed || null,
      vorgeschlagen_von: user?.id, genehmigt: false,
    })
    setBusy(false)
    if (error) { setErr(true); setMsg(error.message) }
    else { setErr(false); setMsg('Quelle vorgeschlagen – wartet auf Admin-Freigabe.'); setForm({ url: '', name: '', beschreibung: '', rss_feed: '' }); setNischen([]); load() }
  }

  async function genehmige(q: any) {
    await supabase.from('quellen').update({ genehmigt: true, genehmigt_von: user?.id, genehmigt_am: new Date().toISOString() }).eq('id', q.id)
    load()
  }
  async function lehneAb(q: any) {
    await supabase.from('quellen').delete().eq('id', q.id)
    load()
  }

  const ic = 'w-full px-4 py-3 rounded-xl border border-[#f0ece6] bg-[#faf8f5] text-sm outline-none focus:border-[#b8924a] focus:ring-2 focus:ring-[#b8924a]'

  if (roleLoading || (!isAdmin && !isTester)) return (
    <AppShell><div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[#b8924a] border-t-transparent rounded-full animate-spin" /></div></AppShell>
  )

  return (
    <AppShell>
      <div className="bg-white px-4 py-4 flex items-center border-b border-[#f0ece6] sticky top-0 z-40">
        <h1 className="font-serif text-2xl font-bold text-[#1a1a1a]">Quellen</h1>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Neue Quelle vorschlagen */}
        <div className="card p-5">
          <h2 className="font-serif text-lg font-bold text-[#1a1a1a] mb-4">Neue Quelle vorschlagen</h2>
          {msg && <div className={`mb-3 p-3 rounded-xl text-sm ${err ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>}
          <div className="space-y-3">
            <div><label className="block text-[11px] font-medium text-[#6b7280] uppercase tracking-wider mb-1.5">URL *</label>
              <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." className={ic} /></div>
            <div><label className="block text-[11px] font-medium text-[#6b7280] uppercase tracking-wider mb-1.5">Name der Quelle *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="z.B. BAG Schweiz" className={ic} /></div>
            <div><label className="block text-[11px] font-medium text-[#6b7280] uppercase tracking-wider mb-1.5">Beschreibung</label>
              <textarea value={form.beschreibung} onChange={e => setForm({ ...form, beschreibung: e.target.value })} rows={2} className={ic + ' resize-none'} /></div>
            <div><label className="block text-[11px] font-medium text-[#6b7280] uppercase tracking-wider mb-1.5">RSS-Feed URL (empfohlen)</label>
              <input value={form.rss_feed} onChange={e => setForm({ ...form, rss_feed: e.target.value })} placeholder="https://.../feed.rss" className={ic} /></div>
            <div><label className="block text-[11px] font-medium text-[#6b7280] uppercase tracking-wider mb-2">Nischen</label>
              <div className="flex flex-wrap gap-2">{NISCHEN_OPT.map(n => (
                <button key={n.key} onClick={() => toggleN(n.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium border-[1.5px] transition-colors ${nischen.includes(n.key) ? 'bg-[#b8924a] text-white border-[#b8924a]' : 'bg-white text-[#6b7280] border-[#E8E0D5]'}`}>{n.label}</button>
              ))}</div>
            </div>
            <button onClick={submit} disabled={busy} className="w-full py-3.5 rounded-xl bg-[#b8924a] text-white font-medium hover:bg-[#a07a3a] disabled:opacity-50 transition-colors">{busy ? 'Wird gesendet...' : 'Quelle vorschlagen'}</button>
          </div>
        </div>

        {/* Admin: Vorgeschlagene Quellen */}
        {isAdmin && (
          <div className="card p-5">
            <h2 className="font-serif text-lg font-bold text-[#1a1a1a] mb-1">Vorgeschlagene Quellen</h2>
            <p className="text-xs text-[#6b7280] mb-4">Warten auf Genehmigung</p>
            {vorschlaege.length === 0 ? <p className="text-sm text-[#9A9A9A]">Keine offenen Vorschläge.</p> : (
              <div className="space-y-3">{vorschlaege.map(q => (
                <div key={q.id} className="border border-[#f0ece6] rounded-xl p-3">
                  <p className="text-sm font-semibold text-[#1a1a1a]">{q.name}</p>
                  <a href={q.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#b8924a] hover:underline break-all">{q.url}</a>
                  {q.beschreibung && <p className="text-xs text-[#6b7280] mt-1">{q.beschreibung}</p>}
                  {q.nischen?.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{q.nischen.map((n: string) => <span key={n} className="px-2 py-0.5 rounded-full text-[11px] bg-[#fdf6ec] text-[#8a6d35]">{nischeLabel(n)}</span>)}</div>}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => genehmige(q)} className="flex-1 py-2 rounded-lg bg-[#b8924a] text-white text-xs font-medium">Genehmigen</button>
                    <button onClick={() => lehneAb(q)} className="flex-1 py-2 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50">Ablehnen</button>
                  </div>
                </div>
              ))}</div>
            )}
          </div>
        )}

        {/* Genehmigte Quellen (schreibgeschützt) */}
        <div className="card p-5">
          <h2 className="font-serif text-lg font-bold text-[#1a1a1a] mb-4">Genehmigte Quellen</h2>
          {loading ? <div className="skeleton h-24" /> : genehmigt.length === 0 ? <p className="text-sm text-[#9A9A9A]">Noch keine genehmigten Quellen.</p> : (
            <div className="space-y-3">{genehmigt.map(q => (
              <div key={q.id} className="border border-[#f0ece6] rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#1a1a1a]">{q.name}</p>
                  {q.rss_feed && <span className="text-[10px] font-bold text-[#2d6a4f] bg-[#f0faf5] px-2 py-0.5 rounded-full">RSS</span>}
                </div>
                <a href={q.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#b8924a] hover:underline break-all">{q.url}</a>
                {q.beschreibung && <p className="text-xs text-[#6b7280] mt-1">{q.beschreibung}</p>}
                {q.nischen?.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{q.nischen.map((n: string) => <span key={n} className="px-2 py-0.5 rounded-full text-[11px] bg-[#fdf6ec] text-[#8a6d35]">{nischeLabel(n)}</span>)}</div>}
              </div>
            ))}</div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
