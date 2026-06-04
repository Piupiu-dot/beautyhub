'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRole } from '@/lib/roles'

const ICONS = {
  feed: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  community: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  markt: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  freigaben: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  quellen: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  admin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
}

export default function BottomNav() {
  const path = usePathname()
  const { isAdmin, isTester } = useRole()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isTester && !isAdmin) return
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'ausstehend').then(({ count: c }) => setCount(c || 0))
  }, [isTester, isAdmin, path])

  const nav: { href: string; label: string; icon: JSX.Element; badge?: number }[] = [
    { href: '/feed', label: 'Feed', icon: ICONS.feed },
    { href: '/community', label: 'Community', icon: ICONS.community },
    { href: '/marktplatz', label: 'Markt', icon: ICONS.markt },
    ...(isTester || isAdmin ? [{ href: '/freigaben', label: 'Freigaben', icon: ICONS.freigaben, badge: count }] : []),
    ...(isTester || isAdmin ? [{ href: '/quellen', label: 'Quellen', icon: ICONS.quellen }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: ICONS.admin }] : []),
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#f0ece6] flex pb-safe">
      {nav.map(item => {
        const active = path.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href}
            className={`relative flex-1 flex flex-col items-center justify-center h-[60px] gap-0.5 transition-all ${active ? 'text-[#b8924a]' : 'text-[#9A9A9A]'}`}>
            {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[2px] rounded-full bg-[#b8924a]" />}
            <div className="relative">
              {item.icon}
              {item.badge ? (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">{item.badge}</span>
              ) : null}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
