import { cn } from '@/lib/utils'

/**
 * Başlık kademesi bölümün sayfadaki önem derecesini taşır:
 * - primary: ana argüman bölümleri
 * - secondary: destekleyici bölümler
 * - tertiary: giriş / bağlam bölümleri
 */
type HeadingLevel = 'primary' | 'secondary' | 'tertiary'

type SectionHeadingProps = {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  inverse?: boolean
  level?: HeadingLevel
  className?: string
}

const titleSizeByLevel: Record<HeadingLevel, string> = {
  primary: 'text-3xl sm:text-4xl lg:text-[44px]',
  secondary: 'text-2xl sm:text-3xl lg:text-[34px]',
  tertiary: 'text-xl sm:text-2xl lg:text-[26px]',
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  inverse = false,
  level = 'primary',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' && 'mx-auto text-center', className)}>
      <div className={cn('mb-4 flex items-center gap-3', align === 'center' && 'justify-center')}>
        <span className={cn('h-px w-8 bg-[#0f766e]', inverse && 'bg-[#5eead4]')} />
        <span className={cn('text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0f766e]', inverse && 'text-[#99f6e4]')}>
          {eyebrow}
        </span>
      </div>
      <h2
        className={cn(
          'text-balance font-bold leading-[1.08] tracking-[-0.035em] text-[#102a43]',
          titleSizeByLevel[level],
          inverse && 'text-white',
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn('mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-600 sm:text-lg sm:leading-8', align === 'center' && 'mx-auto', inverse && 'text-white/68')}>
          {description}
        </p>
      )}
    </div>
  )
}
