import { cn } from '@/lib/utils'

type BrandMarkProps = {
  className?: string
  iconClassName?: string
  compact?: boolean
  inverse?: boolean
}

export function BrandMark({
  className,
  iconClassName,
  compact = false,
  inverse = false,
}: BrandMarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0f766e] text-white shadow-[0_8px_24px_rgba(15,118,110,0.18)]',
          iconClassName,
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 32" className="size-6" fill="none">
          <circle cx="16" cy="16" r="4.4" stroke="currentColor" strokeWidth="2.2" />
          <circle cx="8" cy="10" r="2.4" fill="currentColor" />
          <circle cx="24" cy="8" r="2.4" fill="currentColor" />
          <circle cx="24" cy="24" r="2.4" fill="currentColor" />
          <path d="M11 12.5 13 14M19.1 12.8l3.1-3M19.4 19.2l2.8 2.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>

      {!compact && (
        <span className="grid leading-none">
          <span className={cn('text-[17px] font-black tracking-[-0.03em] text-[#102a43]', inverse && 'text-white')}>
            VetCep
          </span>
          <span className={cn('mt-1 text-[8px] font-bold uppercase tracking-[0.23em] text-slate-500', inverse && 'text-white/58')}>
            Hayvan sağlığı platformu
          </span>
        </span>
      )}
    </span>
  )
}
