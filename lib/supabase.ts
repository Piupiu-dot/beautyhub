import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Post = {
  id: string
  titel: string
  zusammenfassung?: string
  inhalt?: string
  typ: 'news' | 'gesetz' | 'trend' | 'community'
  nischen?: string
  autor_id?: string
  autor_name?: string
  ist_agent?: boolean
  quelle_name?: string
  quelle_url?: string
  likes?: number
  kommentare_count?: number
  erstellt_am?: string
}

export type Kommentar = {
  id: string
  post_id: string
  autor_id: string
  inhalt: string
  likes?: number
  erstellt_am?: string
  autor_name?: string
}

export type Inserat = {
  id: string
  titel: string
  beschreibung?: string
  preis: number
  kategorie?: string
  zustand?: string
  standort?: string
  verkaeuferin_id?: string
  aktiv?: boolean
  erstellt_am?: string
}
