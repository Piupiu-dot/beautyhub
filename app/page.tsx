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
      <div className="w8 h-8 border-2 border-[#b8924a] border-t-transparent rounded-full animate-spin"/>
    </div>
  )
}
