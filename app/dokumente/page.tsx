'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'

export default function DokumentePage() {
  const router = useRouter()
  const [av, setAv] = useState('M')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
      else { const n = data.session.user.user_metadata?.name || data.session.user.email || 'M'; setAv(n[0].toUpperCase()) }
    })
  }, [router])

  return (
    <AppShell>
      <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-[#f0ece6] sticky top-0 z-40">
        <h1 className="font-serif text-2xl font-bold text-[#1a1a1a]">BeautyHub</h1>
        <button onClick={() => router.push('/profil')} className="w-9 h-9 rounded-full bg-[#b8924a] flex items-center justify-center text-white text-sm font-semibold">{av}</button>
      </div>

      <div className="p-4">
        <div className="rounded-xl bg-[#fdf6ec] border border-[#f0ece6] px-6 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#f0ece6] flex items-center justify-center mx-auto mb-5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b8924a" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#1c2b4a] mb-3">Dokumente &amp; Gesetzestexte</h2>
          <p className="text-sm text-[#6b7280] max-w-md mx-auto leading-relaxed">Offizielle Schweizer Gesetzestexte und Behördendokumente für Beauty-Profis.</p>
          <span className="inline-block mt-6 text-xs font-medium text-[#b8924a] bg-white border border-[#EBD9B8] rounded-full px-4 py-1.5">In Kürze verfügbar</span>
        </div>
      </div>
    </AppShell>
  )
}
