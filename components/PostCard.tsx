import Link from 'next/link'
import { Post } from '@/lib/supabase'

const BADGE: Record<string, { label: string; className: string }> = {
  gesetz: { label: 'Gesetz', className: 'bg-[#E8F5E9] text-[#2E7D32]' },
  trend:  { label: 'Trend',  className: 'bg-[#F3E5F5] text-[#6A1B9A]' },
  news:   { label: 'News',   className: 'bg-[#FFF3E0] text-[#E65100]' },
  community: { label: 'Community', className: 'bg-[#E3F2FD] text-[#1565C0]' },
}

function SketchIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="30" r="22" stroke="#8a7055" strokeWidth="1.5"/>
      <path d="M22 30 Q30 18 38 30 Q30 42 22 30Z" stroke="#8a7055" strokeWidth="1.5" fill="none"/>
      <circle cx="30" cy="30" r="4" stroke="#8a7055" strokeWidth="1.5"/>
    </svg>
  )
}

export default function PostCard({ post }: { post: Post }) {
  const badge = BADGE[post.typ] || BADGE.news
  const nische = post.nischen?.split(',')[0]?.trim()

  return (
    <Link href={`/feed/${post.id}`}
      className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 cursor-pointer">
      <div className="h-32 bg-[#F5EFE8] flex items-center justify-center">
        <SketchIcon />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${badge.className}`}>
            {badge.label}
          </span>
          {nische && <span className="text-[11px] text-[#b8924a] font-medium">{nische}</span>}
          {post.ist_agent && <span className="text-[11px] text-[#1565C0] font-medium bg-[#E3F2FD] px-2 rounded-full">KI</span>}
        </div>
        <h3 className="font-serif text-lg font-semibold text-[#1A1A2E] leading-tight mb-2">{post.titel}</h3>
        <p className="text-sm text-[#767676] leading-relaxed line-clamp-3">{post.zusammenfassung}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F5F0EA]">
          <span className="text-xs text-[#b8924a] font-medium">{post.quelle_name || 'BeautyHub'}</span>
          <div className="flex items-center gap-1 text-xs text-[#9A9A9A]">
            <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            {post.likes || 0}
          </div>
        </div>
      </div>
    </Link>
  )
}
