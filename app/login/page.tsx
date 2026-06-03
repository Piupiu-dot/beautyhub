'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const BEREICHE = ['Kosmetik & Ästhetik','Haare & Friseur','Nails','Lashes & Brows','Massage & Wellness','Permanent Make-up & Microblading','Medizinische Ästhetik','Andere']
const NISCHEN = BEREICHE
const KANTONE = ['AG','AI','AR','BE','BL','BS','FR','GE','GL','GR','JU','LU','NE','NW','OW','SG','SH','SO','SZ','TG','TI','UR','VD','VS','ZG','ZH']

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login'|'register'>('login')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState(false)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [rName, setRName] = useState('')
  const [rEmail, setREmail] = useState('')
  const [rPw, setRPw] = useState('')
  const [rVorname, setRVorname] = useState('')
  const [rNachname, setRNachname] = useState('')
  const [rBereich, setRBereich] = useState('')
  const [rUnternehmen, setRUnternehmen] = useState('')
  const [rMitarbeiter, setRMitarbeiter] = useState('')
  const [rKanton, setRKanton] = useState('')
  const [rNischen, setRNischen] = useState<string[]>([])

  const ic = 'w-full px-4 py-3.5 rounded-xl border-[1.5px] border-[#E8E0D5] bg-[#faf8f5] text-[#1A1A2E] text-sm outline-none focus:border-[#b8924a] focus:bg-white transition-colors'

  async function handleLogin() {
    if (!email || !pw) return setMsg('Bitte alle Felder ausfullen.')
    setLoading(true); setMsg('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    setLoading(false)
    if (error) { setErr(true); setMsg('E-Mail oder Passwort falsch.') }
    else router.push('/feed')
  }

  async function step2() {
    if (!rVorname || !rNachname || !rBereich || rNischen.length === 0) return setMsg('Bitte Vorname, Nachname, Bereich und mind. eine Nische waehlen.')
    setLoading(true); setMsg('')
    const { error } = await supabase.auth.signUp({ email: rEmail, password: rPw, options: { data: { name: rName, vorname: rVorname, nachname: rNachname, bereich: rBereich, unternehmen: rUnternehmen, kanton: rKanton, mitarbeiter: parseInt(rMitarbeiter)||1, nischen: rNischen } } })
    setLoading(false)
    if (error) { setErr(true); setMsg(error.message) }
    else { setErr(false); setMsg('Konto erstellt! Weiterleitung...'); setTimeout(() => router.push('/feed'), 1500) }
  }

  async function handleForgotPw() {
    if (!email) return setMsg('Bitte E-Mail eingeben fuer Passwort-Reset.')
    setLoading(true); setMsg('')
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    setLoading(false)
    if (error) { setErr(true); setMsg(error.message) }
    else { setErr(false); setMsg('E-Mail zum Zuruecksetzen wurde gesendet.') }
  }

  const toggle = (n: string) => setRNischen(prev => prev.includes(n) ? prev.filter(x=>x!==n) : [...prev,n])

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-5xl font-bold text-[#1A1A2E]">BeautyHub</h1>
          <p className="text-[#b8924a] text-xs tracking-[3px] uppercase mt-1">Schweiz</p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex bg-[#faf8f5] rounded-xl p-1 gap-1 mb-6">
            {(['login','register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setMsg(''); setStep(1) }}
                className={`flex-1 py-2.5 rounded-[10px] text-sm font-medium transition-all ${tab===t ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#9A9A9A]'}`}>
                {t === 'login' ? 'Anmelden' : 'Registrieren'}
              </button>
            ))}
          </div>
          {msg && <div className={`mb-4 p-3 rounded-xl text-sm ${err ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>}
          {tab === 'login' && (
            <div className="space-y-4">
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">E-Mail</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="deine@email.com" className={ic}/></div>
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Passwort</label>
                <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Passwort" className={ic}/></div>
              <div className="text-right -mt-1">
                <button onClick={handleForgotPw} className="text-xs font-medium text-[#b8924a] hover:underline">Passwort vergessen?</button>
              </div>
              <button onClick={handleLogin} disabled={loading} className="w-full py-4 bg-[#b8924a] text-white rounded-xl font-medium hover:bg-[#a07a3a] disabled:opacity-50">
                {loading ? 'Anmelden...' : 'Anmelden'}
              </button>
            </div>
          )}
          {tab === 'register' && step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-[#9A9A9A] text-center">Schritt 1 von 2 - Zugangsdaten</p>
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Name</label>
                <input value={rName} onChange={e=>setRName(e.target.value)} placeholder="z.B. Max Mustermann" className={ic}/></div>
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">E-Mail</label>
                <input type="email" value={rEmail} onChange={e=>setREmail(e.target.value)} placeholder="deine@email.com" className={ic}/></div>
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Passwort (min. 8 Zeichen)</label>
                <input type="password" value={rPw} onChange={e=>setRPw(e.target.value)} placeholder="••••••••" className={ic}/></div>
              <button onClick={() => { if(!rName||!rEmail||!rPw) return setMsg('Alle Felder ausfullen.'); if(rPw.length<8) return setMsg('Passwort min. 8 Zeichen.'); setMsg(''); setStep(2) }} className="w-full py-4 bg-[#b8924a] text-white rounded-xl font-medium">Weiter &rarr;</button>
            </div>
          )}
          {tab === 'register' && step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-[#9A9A9A] text-center">Schritt 2 von 2 - Dein Profil</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Vorname *</label>
                  <input value={rVorname} onChange={e=>setRVorname(e.target.value)} placeholder="Max" className={ic}/></div>
                <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Nachname *</label>
                  <input value={rNachname} onChange={e=>setRNachname(e.target.value)} placeholder="Mustermann" className={ic}/></div>
              </div>
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Unternehmensname</label>
                <input value={rUnternehmen} onChange={e=>setRUnternehmen(e.target.value)} placeholder="z.B. Beauty Studio" className={ic}/></div>
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-2">Bereich *</label>
                <div className="space-y-2">{BEREICHE.map(b=>(
                  <label key={b} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-[1.5px] cursor-pointer transition-colors ${rBereich===b?'border-[#b8924a] bg-[#faf8f5]':'border-[#E8E0D5] bg-white'}`}>
                    <input type="radio" name="bereich" value={b} checked={rBereich===b} onChange={e=>setRBereich(e.target.value)} className="accent-[#b8924a]"/>
                    <span className="text-sm text-[#1A1A2E]">{b}</span>
                  </label>))}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Kanton</label>
                  <select value={rKanton} onChange={e=>setRKanton(e.target.value)} className={ic}><option value="">Kanton</option>{KANTONE.map(k=><option key={k} value={k}>{k}</option>)}</select></div>
                <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Mitarbeitende</label>
                  <input type="number" min="1" value={rMitarbeiter} onChange={e=>setRMitarbeiter(e.target.value)} placeholder="1" className={ic}/></div>
              </div>
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-2">Nischen * (mind. 1)</label>
                <div className="flex flex-wrap gap-2">{NISCHEN.map(n=>(<button key={n} onClick={()=>toggle(n)} className={`px-3 py-1.5 rounded-full text-xs font-medium border-[1.5px] ${rNischen.includes(n)?'bg-[#1A1A2E] text-white border-[#1A1A2E]':'bg-white text-[#6B6B6B] border-[#E8E0D5]'}`}>{n}</button>))}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>{setStep(1);setMsg('')}} className="flex-1 py-3.5 rounded-xl border-[1.5px] border-[#E8E0D5] text-[#6B6B6B] text-sm">&larr; Zurueck</button>
                <button onClick={step2} disabled={loading} className="flex-[2] py-3.5 bg-[#b8924a] text-white rounded-xl font-medium disabled:opacity-50">{loading?'Erstellen...':'Konto erstellen'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
          }
