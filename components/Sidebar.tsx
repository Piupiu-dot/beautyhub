'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/feed', label: 'Feed', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: '/community', label: 'Community', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> },
  { href: '/marktplatz', label: 'Marktplatz', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
  { href: '/dokumente', label: 'Dokumente', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { href: '/profil', label: 'Profil', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w5 h-5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-[#e8e0d5] fixed top-0 left-0 h-full z-50 py-8">
      <div className="px-7 pb-7 border-b border-[#e8e0d5] mb-4">
        <h1 className="font-serif text-3xl font-bold text-[#1A1A2E] leading-none">BeautyHub</h1>
        <span className="text-[11px] tracking-[0.25em] uppercase text-[#b8924a] mt-1.5 block">Schweiz</span>
      </div>
      <nav className="flex flex-col gap-2 px-3">
        {NAV.map(item => {
          const active = path.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-[#fdf6ec] text-[#b8924a]' : 'text-[#6B6B6B] hover:bg-[#faf8f5]'}`}>
              {item.icon}{item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
