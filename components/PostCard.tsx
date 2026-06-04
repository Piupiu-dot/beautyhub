import Link from 'next/link'
import { Post } from '@/lib/supabase'
import { formatDatum } from '@/lib/demo'

const TYP: Record<string, { label: string; bg: string; text: string }> = {
  gesetz:    { label: 'Gesetz', bg: '#fdf6ec', text: '#b8924a' },
  news:      { label: 'News',   bg: '#f0f4ff', text: '#1c2b4a' },
  trend:     { label: 'Trend',  bg: '#f0faf5', text: '#2d6a4f' },
  ki:        { label: 'KI',     bg: '#f5f0fa', text: '#6b4c8b' },
  community: { label: 'Community', bg: '#f0f4ff', text: '#1c2b4a' },
}

export default function PostCard({ post }: { post: Post }) {
  const nische = post.nischen?.split(',')[0]?.trim()
  const key = post.ist_agent ? 'ki' : (TYP[post.typ] ? post.typ : 'news')
  const t = TYP[key]
  return (
    <Link href={`/feed/${post.id}`}
      className="card block p-4 hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer w-full">
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide" style={{ background: t.bg, color: t.text }}>{t.label}</span>
        {post.erstellt_am && <span className="text-xs text-[#6b7280]">{formatDatum(post.erstellt_am)}</span>}
        {nische && <span className="ml-auto text-[11px] text-[#b8924a] font-medium">{nische}</span>}
      </div>
      <h3 className="text-[18px] font-semibold text-[#1a1a1a] leading-snug mb-1.5">{post.titel}</h3>
      <p className="text-sm text-[#6b7280] leading-relaxed line-clamp-2">{post.zusammenfassung}</p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f0ece6]">
        <span className="text-xs text-[#b8924a] font-medium">{post.quelle_name || 'BeautyHub'}</span>
        <span className="text-xs text-[#6b7280]">♥ {post.likes || 0}</span>
      </div>
    </Link>
  )
}
