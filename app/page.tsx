'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      router.replace(data.session ? '/feed' : '/login')
    })
  }, [router])
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#faf8f5]">
      <p className="text-[#b8924a]">Wird geladen...</p>
    </div>
  )
}
