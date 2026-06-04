'use client'
import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export type Role = { isAdmin: boolean; isTester: boolean; loading: boolean }

// Rollen via SECURITY-DEFINER-RPCs ermitteln (tester_rollen ist per RLS nur für Admins lesbar)
export function useRole(): Role {
  const [role, setRole] = useState<Role>({ isAdmin: false, isTester: false, loading: true })
  useEffect(() => {
    let active = true
    Promise.all([supabase.rpc('is_admin'), supabase.rpc('is_tester')]).then(([a, t]) => {
      if (active) setRole({ isAdmin: !!a.data, isTester: !!t.data, loading: false })
    })
    return () => { active = false }
  }, [])
  return role
}
