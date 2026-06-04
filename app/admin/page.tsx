'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'
import { formatDatum } from '@/lib/demo'
import { NISCHEN, nischeLabel } from '@/lib/nischen'
import { useRole } from '@/lib/roles'

const SCAN_BADGE: Record<string, { label: string; cls: string }> = {
  erfolg: { label: 'Erfolg', cls: 'bg-[#dcfce7] text-[#166534]' },
  fehler: { label: 'Fehler', cls: 'bg-red-50 text-red-600' },
  keine_neuen_inhalte: { label: 'Keine neuen', cls: 'bg-[#f0ece6] text-[#6b7280]' },
}

export default function AdminPage() {
  const router = useRouter()
  const { isAdmin, loading: roleLoading } = useRole()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [tester, setTester] = useState<any[]>([])
  const [vorschlaege, setVorschlaege] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [neueNischen, setNeueNischen] = useState<string[]>([])
  const [msg, setMsg] = useState(''); const [err, setErr] = useState(false)

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUser(data.user)) }, [])
  useEffect(() => { if (!roleLoading && !isAdmin) router.replace('/feed') }, [roleLoading, isAdmin, router])

  const load = useCallback(async () => {
    setLoading(true)
    const [s, t, v, l] = await Promise.all([
      supabase.rpc('admin_stats'),
      supabase.rpc('admin_list_tester'),
      supabase.from('quellen').select('*').eq('genehmigt', false).order('erstellt_am', { ascending: false }),
      supabase.from('scan_logs').select('*, quellen(name)').order('scan_zeitpunkt', { ascending: false }).limit(10),
    ])
    setStats(s.data); setTester(t.data || []); setVorschlaege(v.data || []); setLogs(l.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { if (!roleLoading && isAdmin) load() }, [roleLoading, isAdmin, load])

  async function addTester() {
    if (!email.trim()) { setErr(true); return setMsg('E-Mail ist erforderlich.') }
    const { error } = await supabase.rpc('admin_add_tester', { p_email: email.trim(), p_nischen: neueNischen })
    if (error) { setErr(true); setMsg(error.message) }
    else { setErr(false); setMsg('Tester hinzugefügt.'); setEmail(''); setNeueNischen([]); load() }
  }
  const toggleNeu = (k: string) => setNeueNischen(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])

  async function toggleTesterNische(t: any, k: string) {
    const next = (t.nischen || []).includes(k) ? t.nischen.filter((x: string) => x !== k) : [...(t.nischen || []), k]
    await supabase.from('tester_rollen').update({ nischen: next }).eq('id', t.id); load()
  }
  async function toggleAktiv(t: any) {
    await supabase.from('tester_rollen').update({ aktiv: !t.aktiv }).eq('id', t.id); load()
  }
  async function genehmige(q: any) {
    await supabase.from('quellen').update({ genehmigt: true, genehmigt_von: user?.id, genehmigt_am: new Date().toISOString() }).eq('id', q.id); load()
  }

  if (roleLoading || !isAdmin) return (
    <AppShell><div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-[#b8924a] border-t-transparent rounded-full animate-spin" /></div></AppShell>
  )

  const stat = (label: string, value: any) => (
    <div className="card p-4 text-center">
      <p className="font-serif text-3xl font-bold text-[#b8924a]">{value ?? '–'}</p>
      <p className="text-xs text-[#6b7280] mt-1">{label}</p>
    </div>
  )

  return (
    <AppShell>
      <div className="bg-white px-4 py-4 flex items-center border-b border-[#f0ece6] sticky top-0 z-40">
        <h1 className="font-serif text-2xl font-bold text-[#1a1a1a]">Admin</h1>
      </div>

      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        {/* Statistiken */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stat('User', stats?.users)}
          {stat('Aktive Tester', stats?.tester)}
          {stat('Ausstehend', stats?.ausstehend)}
          {stat('Scans heute', stats?.scans_heute)}
        </div>

        {/* Tester verwalten */}
        <div className="card p-5">
          <h2 className="font-serif text-lg font-bold text-[#1a1a1a] mb-4">Tester verwalten</h2>
          {msg && <div className={`mb-3 p-3 rounded-xl text-sm ${err ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>}
          <div className="bg-[#faf8f5] border border-[#f0ece6] rounded-xl p-3 mb-4">
            <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">Neuen Tester hinzufügen</p>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@beispiel.ch" className="w-full px-4 py-2.5 rounded-xl border border-[#f0ece6] bg-white text-sm outline-none focus:border-[#b8924a] focus:ring-2 focus:ring-[#b8924a] mb-2" />
            <div className="flex flex-wrap gap-2 mb-3">{NISCHEN.map(n => (
              <button key={n.key} onClick={() => toggleNeu(n.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium border-[1.5px] transition-colors ${neueNischen.includes(n.key) ? 'bg-[#b8924a] text-white border-[#b8924a]' : 'bg-white text-[#6b7280] border-[#E8E0D5]'}`}>{n.label}</button>
            ))}</div>
            <button onClick={addTester} className="w-full py-2.5 rounded-xl bg-[#b8924a] text-white text-sm font-medium hover:bg-[#a07a3a]">Hinzufügen</button>
          </div>
          {loading ? <div className="skeleton h-20" /> : tester.length === 0 ? <p className="text-sm text-[#9A9A9A]">Noch keine Tester.</p> : (
            <div className="space-y-3">{tester.map(t => (
              <div key={t.id} className="border border-[#f0ece6] rounded-xl p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-[#1a1a1a] truncate">{t.email}</p>
                  <button onClick={() => toggleAktiv(t)} className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${t.aktiv ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#f0ece6] text-[#6b7280]'}`}>{t.aktiv ? 'Aktiv' : 'Inaktiv'}</button>
                </div>
                <div className="flex flex-wrap gap-1.5">{NISCHEN.map(n => (
                  <button key={n.key} onClick={() => toggleTesterNische(t, n.key)} className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${(t.nischen || []).includes(n.key) ? 'bg-[#b8924a] text-white border-[#b8924a]' : 'bg-white text-[#6b7280] border-[#E8E0D5]'}`}>{n.label}</button>
                ))}</div>
              </div>
            ))}</div>
          )}
        </div>

        {/* Quellen genehmigen */}
        <div className="card p-5">
          <h2 className="font-serif text-lg font-bold text-[#1a1a1a] mb-4">Quellen genehmigen</h2>
          {vorschlaege.length === 0 ? <p className="text-sm text-[#9A9A9A]">Keine offenen Vorschläge.</p> : (
            <div className="space-y-3">{vorschlaege.map(q => (
              <div key={q.id} className="border border-[#f0ece6] rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a] truncate">{q.name}</p>
                  <a href={q.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#b8924a] hover:underline break-all">{q.url}</a>
                </div>
                <button onClick={() => genehmige(q)} className="flex-shrink-0 py-2 px-4 rounded-lg bg-[#b8924a] text-white text-xs font-medium">Genehmigen</button>
              </div>
            ))}</div>
          )}
        </div>

        {/* Scan-Logs */}
        <div className="card p-5">
          <h2 className="font-serif text-lg font-bold text-[#1a1a1a] mb-4">Letzte Scans</h2>
          {loading ? <div className="skeleton h-20" /> : logs.length === 0 ? <p className="text-sm text-[#9A9A9A]">Noch keine Scan-Logs.</p> : (
            <div className="space-y-2">{logs.map(l => {
              const b = SCAN_BADGE[l.status] || SCAN_BADGE.keine_neuen_inhalte
              return (
                <div key={l.id} className="flex items-center justify-between gap-2 py-2 border-b border-[#f0ece6] last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">{l.quellen?.name || 'Unbekannt'}</p>
                    <p className="text-xs text-[#6b7280]">{formatDatum(l.scan_zeitpunkt)} · {l.gefundene_artikel} gefunden · {l.weitergeleitete_artikel} weitergeleitet</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${b.cls}`}>{b.label}</span>
                </div>
              )
            })}</div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
