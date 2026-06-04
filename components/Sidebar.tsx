'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRole } from '@/lib/roles'

const ICONS = {
  feed: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  community: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  markt: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  doku: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  profil: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  freigaben: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  quellen: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  admin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
}

export default function Sidebar() {
  const path = usePathname()
  const router = useRouter()
  const { isAdmin, isTester } = useRole()
  const [name, setName] = useState('')
  const [farbe, setFarbe] = useState('#b8924a')
  const [showLogout, setShowLogout] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user
      if (u) { setName(u.user_metadata?.name || u.email || 'Nutzer'); setFarbe(u.user_metadata?.avatar_farbe || '#b8924a') }
    })
  }, [])

  useEffect(() => {
    if (!isTester && !isAdmin) return
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'ausstehend').then(({ count: c }) => setCount(c || 0))
  }, [isTester, isAdmin, path])

  const nav: { href: string; label: string; icon: JSX.Element; badge?: number }[] = [
    { href: '/feed', label: 'Feed', icon: ICONS.feed },
    { href: '/community', label: 'Community', icon: ICONS.community },
    { href: '/marktplatz', label: 'Marktplatz', icon: ICONS.markt },
    { href: '/dokumente', label: 'Dokumente', icon: ICONS.doku },
    ...(isTester || isAdmin ? [{ href: '/freigaben', label: 'Freigaben', icon: ICONS.freigaben, badge: count }] : []),
    ...(isTester || isAdmin ? [{ href: '/quellen', label: 'Quellen', icon: ICONS.quellen }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: ICONS.admin }] : []),
    { href: '/profil', label: 'Profil', icon: ICONS.profil },
  ]

  return (
    <>
      <aside className="hidden lg:flex flex-col w-[220px] bg-white border-r border-[#f0ece6] fixed top-0 left-0 h-full z-50 py-7">
        <div className="px-6 pb-6 mb-4 border-b border-[#f0ece6]">
          <h1 className="font-serif text-3xl font-bold text-[#1c2b4a] leading-none">BeautyHub</h1>
          <span className="text-[11px] tracking-[0.15em] uppercase text-[#b8924a] mt-1.5 block">Schweiz</span>
        </div>
        <nav className="flex flex-col gap-1.5 px-3 overflow-y-auto">
          {nav.map(item => {
            const active = path.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                className={`relative flex items-center gap-3 h-11 px-4 rounded-lg text-sm font-medium transition-all ${active ? 'bg-[#fdf6ec] text-[#b8924a]' : 'text-[#6b7280] hover:bg-[#faf8f5]'}`}>
                {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[#b8924a]" />}
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto px-3">
          <div className="flex items-center gap-3 px-2 pt-4 border-t border-[#f0ece6]">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0" style={{ background: farbe }}>{(name[0] || 'N').toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#1a1a1a] truncate">{name || 'Nutzer'}</p>
              <button onClick={() => setShowLogout(true)} className="text-xs text-[#b8924a] hover:underline">Abmelden</button>
            </div>
          </div>
        </div>
      </aside>

      {showLogout && (
        <div className="hidden lg:flex fixed inset-0 bg-black/50 z-[60] items-center justify-center p-5" onClick={e => { if (e.target === e.currentTarget) setShowLogout(false) }}>
          <div className="bg-white rounded-2xl w-full max-w-xs p-6 text-center">
            <h2 className="font-serif text-xl font-bold text-[#1a1a1a] mb-2">Wirklich abmelden?</h2>
            <p className="text-sm text-[#6b7280] mb-6">Du wirst von BeautyHub abgemeldet.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowLogout(false)} className="flex-1 py-3 rounded-xl border border-[#f0ece6] text-[#6b7280] text-sm font-medium">Abbrechen</button>
              <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">Abmelden</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
