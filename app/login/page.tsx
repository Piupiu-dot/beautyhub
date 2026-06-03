'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const BEREICHE = ['Kosmetik & Ästhetik','Haare & Friseur','Nails','Lashes & Brows','Massage & Wellness','Permanent Make-up & Microblading','Medizinische Ästhetik','Andere']
const NISCHEN_GRUPPEN: { gruppe: string; nischen: string[] }[] = [
  { gruppe: 'Kosmetik & Ästhetik', nischen: ['Haarentfernung (Wachs/Zucker)','Chemische Peelinge','Microneedling','Solarium/UV','Intimbehandlungen'] },
  { gruppe: 'Medizinische Ästhetik', nischen: ['Haarentfernung (IPL/Laser)','Hyaluron/Filler','Körperformung/Kryolipolyse'] },
  { gruppe: 'Nails', nischen: ['Nageldesign/Gel','Nagelpflege/Maniküre','Pediküre'] },
  { gruppe: 'Lashes & Brows', nischen: ['Wimpernverlängerung/Lifting','Brow Styling/Lamination'] },
  { gruppe: 'Permanent Make-up & Microblading', nischen: ['Microblading','Lippen PMU','Augenbrauen PMU','Eyeliner PMU'] },
  { gruppe: 'Massage & Wellness', nischen: ['Massage klassisch','Lymphdrainage','Ayurveda/Ganzheitlich'] },
  { gruppe: 'Haare & Friseur', nischen: ['Colorationen/Blondierungen','Haarverlängerung','Haarpflege/Behandlungen'] },
]
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
  const [showRPw, setShowRPw] = useState(false)
  const [rAgb, setRAgb] = useState(false)

  const ic = 'w-full px-4 py-3.5 rounded-xl border-[1.5px] border-[#E8E0D5] bg-[#faf8f5] text-[#1A1A2E] text-sm outline-none focus:border-[#b8924a] focus:bg-white transition-colors'
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  async function handleLogin() {
    if (!email || !pw) return setMsg('Bitte alle Felder ausfullen.')
    setLoading(true); setMsg('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    setLoading(false)
    if (error) { setErr(true); setMsg('E-Mail oder Passwort falsch.') }
    else router.push('/feed')
  }

  async function step2() {
    if (!rVorname || !rNachname) { setErr(true); return setMsg('Dieses Feld ist erforderlich') }
    if (!rBereich) { setErr(true); return setMsg('Bitte einen Bereich auswählen') }
    if (rNischen.length === 0) { setErr(true); return setMsg('Bitte mindestens eine Nische auswählen') }
    if (!rAgb) { setErr(true); return setMsg('Bitte AGB und Datenschutzbestimmungen akzeptieren') }
    setLoading(true); setErr(false); setMsg('')
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
                <div className="relative">
                  <input type={showRPw ? 'text' : 'password'} value={rPw} onChange={e=>setRPw(e.target.value)} placeholder="••••••••" className={ic + ' pr-12'}/>
                  <button type="button" onClick={()=>setShowRPw(s=>!s)} aria-label={showRPw ? 'Passwort verbergen' : 'Passwort anzeigen'} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A9A] hover:text-[#6B6B6B]">
                    {showRPw ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div></div>
              <button onClick={() => { if(!rName||!rEmail||!rPw){setErr(true);return setMsg('Dieses Feld ist erforderlich')} if(!isValidEmail(rEmail)){setErr(true);return setMsg('Bitte eine gültige E-Mail-Adresse eingeben')} if(rPw.length<8){setErr(true);return setMsg('Passwort muss mindestens 8 Zeichen haben')} setErr(false); setMsg(''); setStep(2) }} className="w-full py-4 bg-[#b8924a] text-white rounded-xl font-medium">Weiter &rarr;</button>
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
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Bereich *</label>
                <select value={rBereich} onChange={e=>setRBereich(e.target.value)} className={ic}><option value="">Bereich auswählen...</option>{BEREICHE.map(b=><option key={b} value={b}>{b}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Kanton</label>
                  <select value={rKanton} onChange={e=>setRKanton(e.target.value)} className={ic}><option value="">Kanton</option>{KANTONE.map(k=><option key={k} value={k}>{k}</option>)}</select></div>
                <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1.5">Mitarbeitende</label>
                  <input type="number" min="1" value={rMitarbeiter} onChange={e=>setRMitarbeiter(e.target.value)} placeholder="1" className={ic}/></div>
              </div>
              <div><label className="block text-[11px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-2">Nischen * (mind. 1)</label>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">{NISCHEN_GRUPPEN.map(g=>(
                  <div key={g.gruppe}>
                    <p className="text-[10px] font-semibold text-[#b8924a] uppercase tracking-wider mb-1.5">{g.gruppe}</p>
                    <div className="flex flex-wrap gap-2">{g.nischen.map(n=>(
                      <button key={n} onClick={()=>toggle(n)} className={`px-3 py-1.5 rounded-full text-xs font-medium border-[1.5px] transition-colors ${rNischen.includes(n)?'bg-[#b8924a] text-white border-[#b8924a]':'bg-white text-[#6B6B6B] border-[#E8E0D5] hover:border-[#b8924a]'}`}>{n}</button>))}</div>
                  </div>))}</div>
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={rAgb} onChange={e=>setRAgb(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#b8924a] shrink-0"/>
                <span className="text-xs text-[#6B6B6B] leading-snug">Ich akzeptiere die <a href="/agb" target="_blank" className="text-[#b8924a] hover:underline">AGB</a> und <a href="/datenschutz" target="_blank" className="text-[#b8924a] hover:underline">Datenschutzbestimmungen</a></span>
              </label>
              <div className="flex gap-2">
                <button onClick={()=>{setStep(1);setMsg('')}} className="flex-1 py-3.5 rounded-xl border-[1.5px] border-[#E8E0D5] text-[#6B6B6B] text-sm">&larr; Zurueck</button>
                <button onClick={step2} disabled={loading} className="flex-[2] py-3.5 bg-[#b8924a] text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading && <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.37 0 0 5.37 0 12h4z"/></svg>}
                  {loading?'Erstellen...':'Konto erstellen'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
          }
