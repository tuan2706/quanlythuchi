import { useEffect, useId, useState } from 'react'
import { motion } from 'framer-motion'
import type { MascotExpression } from '@/lib/mascot-logic'

export interface MascotProps {
  expression?: MascotExpression
  size?: number
  /** Play a one-off trunk wave when it first appears. */
  wave?: boolean
  /** Continuous gentle bounce loop — used for celebratory contexts. */
  bounce?: boolean
  className?: string
}

// Trunk shape per expression — the elephant's trunk is its main expressive
// feature, curling differently depending on mood (instead of a separate mouth).
const TRUNK_PATHS: Record<MascotExpression, string> = {
  happy: 'M46,70 C44,82 41,89 45,94 C49,98 56,95 57,87 C58,82 55,79 52,81',
  excited: 'M46,69 C43,80 38,87 42,93 C47,99 57,95 58,85 C59,79 55,75 51,78',
  calm: 'M47,70 C45,82 44,90 48,95 C51,92 52,85 51,77',
  wink: 'M47,70 C45,82 44,90 48,95 C51,92 52,85 51,77',
  concerned: 'M47,70 C46,80 47,88 43,93 C41,90 40,84 42,77',
}

/**
 * An original, minimal elephant mascot — no borrowed characters or assets.
 * Pure SVG + Framer Motion so it stays crisp at any size and costs near
 * nothing on bundle size / performance. Same props/behavior as before, so
 * every screen that already uses <Mascot /> keeps working unchanged.
 */
export function Mascot({ expression = 'calm', size = 56, wave = false, bounce = false, className }: MascotProps) {
  const gradientId = useId()
  const [blinking, setBlinking] = useState(false)

  // Idle blink loop, small random interval so it doesn't feel mechanical.
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    const scheduleBlink = () => {
      const delay = 2800 + Math.random() * 3200
      timeout = setTimeout(() => {
        setBlinking(true)
        setTimeout(() => setBlinking(false), 140)
        scheduleBlink()
      }, delay)
    }
    scheduleBlink()
    return () => clearTimeout(timeout)
  }, [])

  const closedEyes = blinking || expression === 'wink'

  return (
    <motion.svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      initial={{ opacity: 0, scale: 0.7, y: 6 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: bounce ? [0, -4, 0] : 0,
      }}
      transition={
        bounce
          ? { y: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }, default: { type: 'spring', stiffness: 260, damping: 18 } }
          : { type: 'spring', stiffness: 260, damping: 18 }
      }
    >
      <defs>
        <linearGradient id={gradientId} x1="20%" y1="10%" x2="85%" y2="95%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--brand))' }} />
          <stop offset="100%" stopColor="#7C90A8" />
        </linearGradient>
      </defs>

      {/* ears — drawn first so the head overlaps their inner edge */}
      <ellipse cx="15" cy="46" rx="14" ry="18" fill="#E7EBF0" opacity="0.9" />
      <ellipse cx="85" cy="46" rx="14" ry="18" fill="#E7EBF0" opacity="0.9" />
      <ellipse cx="15" cy="46" rx="8" ry="11" fill="#FFFFFF" opacity="0.7" />
      <ellipse cx="85" cy="46" rx="8" ry="11" fill="#FFFFFF" opacity="0.7" />

      {/* trunk — behind the head so its top attaches cleanly */}
      <motion.path
        d={TRUNK_PATHS[expression]}
        stroke={`url(#${gradientId})`}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
        style={{ transformOrigin: '47px 70px' }}
        animate={wave ? { rotate: [0, 14, -6, 10, 0] } : { rotate: 0 }}
        transition={wave ? { duration: 1.1, delay: 0.3, ease: 'easeInOut' } : undefined}
      />

      {/* small tusks for a touch of character */}
      <path d="M42,76 Q37,80 39,85" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.85" />
      <path d="M58,76 Q63,80 61,85" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.85" />

      {/* head */}
      <ellipse cx="50" cy="48" rx="32" ry="30" fill={`url(#${gradientId})`} />
      {/* soft top-left highlight for a gentle 3D feel */}
      <ellipse cx="38" cy="34" rx="12" ry="8" fill="#FFFFFF" opacity="0.2" transform="rotate(-25 38 34)" />

      {/* face */}
      <ellipse cx="39" cy="52" rx="4" ry={closedEyes ? 0.6 : 5.5} fill="#12131A" style={{ transition: 'ry 0.1s' }} />
      <ellipse cx="61" cy="52" rx="4" ry={blinking ? 0.6 : 5.5} fill="#12131A" style={{ transition: 'ry 0.1s' }} />
    </motion.svg>
  )
}
