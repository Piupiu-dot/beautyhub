'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !pw) return setMsg('Bitte alle Felder ausfullen.')
    setLoading(true); setMsg('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    setLoading(false)
    if (error) { setErr(true); setMsg(error.message) }
    else { setErr(false); router.push('/feed') }
  }

  async function handleRegister() {
    if (!name || !email || !pw) return setMsg('Bitte alle Felder ausfullen.')
    setLoading(true); setMsg('')
    const { error } = await supabase.auth.signUp({ email, password: pw, options: { data: { name } } })
    setLoading(false)
    if (error) { setErr(true); setMsg(error.message) }
    else { setErr(false); setMsg('Konto erstellt! Bitte E-Mail bestatigen.') }
  }

  const ic = 'w-full px-4 py-3.5 rounded-xl border-[1.5px] border-[#E8E0D5] bg-[#faf8f5] text-[#1A1A2E] text-sm outline-none focus:border-[#b8924a] focus:bg-white transition-colors'

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif text-5xl font-bold text-[#1A1A2E]">BeautyHub</h1>
          <p className="text-[#b8924a] text-xs tracking-[3px] uppercase mt-1">Schweiz</p>
        </div>
        <div className="bg-white rounded-2xl p-9 shadow-sm">
          <div className="flex bg-[#faf8f5] rounded-xl p-1 gap-1 mb-7">
            {(['login','register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setMsg('') }}
                className={`flex-1 py-2.5 rounded-[10px] text-sm font-medium transition-all ${tab===t ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#9A9A9A]'}`}>
                {t === 'login' ? 'Anmelden' : 'Registrieren'}
              </button>
            ))}
          </div>
          {msg && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${err ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>
          )}
          {tab === 'login' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">E-Mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="deine@email.ch" className={ic}/>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Passwort</label>
                <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Passwort eingeben" className={ic}/>
              </div>
              <button onClick={handleLogin} disabled={loading}
                className="w-full py-4 bg-[#b8924a] text-white rounded-xl font-medium text-base hover:bg-[#a07a3a] disabled:opacity-50 transition-colors mt-1">
                {loading ? 'Anmelden...' : 'Anmelden'}
              </button>
            </div>
          )}
          {tab === 'register' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Dein Name" className={ic}/>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">E-Mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="deine@email.ch" className={ic}/>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Passwort</label>
                <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Min. 8 Zeichen" className={ic}/>
              </div>
              <button onClick={handleRegister} disabled={loading}
                className="w-full py-4 bg-[#b8924a] text-white rounded-xl font-medium text-base hover:bg-[#a07a3a] disabled:opacity-50 transition-colors mt-1">
                {loading ? 'Wird erstellt...' : 'Konto erstellen'}
              </button>
            </div>
          )}
          <p className="text-center text-xs text-[#C0B0A0] mt-5">BeautyHub Schweiz</p>
        </div>
      </div>
    </div>
  )
                  }
