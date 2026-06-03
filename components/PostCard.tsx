import Link from 'next/link'
import { Post } from '@/lib/supabase'
import { formatDatum } from '@/lib/demo'

const TYP: Record<string, { label: string; color: string }> = {
  gesetz:    { label: 'Gesetz', color: '#b8924a' },
  trend:     { label: 'Trend',  color: '#2d6a4f' },
  news:      { label: 'News',   color: '#1c2b4a' },
  ki:        { label: 'KI',     color: '#6b4c8b' },
  community: { label: 'Community', color: '#1c2b4a' },
}

export default function PostCard({ post }: { post: Post }) {
  const nische = post.nischen?.split(',')[0]?.trim()
  const key = post.ist_agent ? 'ki' : (TYP[post.typ] ? post.typ : 'news')
  const t = TYP[key]
  return (
    <Link href={`/feed/${post.id}`}
      className="block bg-white rounded-2xl p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer w-full">
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide text-white" style={{ background: t.color }}>{t.label}</span>
        {nische && <span className="text-[11px] text-[#b8924a] font-medium">{nische}</span>}
        {post.erstellt_am && <span className="ml-auto text-[11px] text-[#9A9A9A]">{formatDatum(post.erstellt_am)}</span>}
      </div>
      <h3 className="font-serif text-xl font-semibold text-[#1A1A2E] leading-snug mb-1.5">{post.titel}</h3>
      <p className="text-sm text-[#5A5A5A] leading-relaxed line-clamp-3">{post.zusammenfassung}</p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F5F0EA]">
        <span className="text-xs text-[#b8924a] font-medium">{post.quelle_name || 'BeautyHub'}</span>
        <span className="text-xs text-[#9A9A9A]">♥ {post.likes || 0}</span>
      </div>
    </Link>
  )
}
