/* Stroke line icons on a 24×24 grid — the prototype's whole icon set. */
import type { CSSProperties, ReactNode } from 'react'

export interface IconProps {
  name: string
  size?: number
  stroke?: string
  sw?: number
  fill?: string
  style?: CSSProperties
}

export function Icon({ name, size = 22, stroke = 'currentColor', sw = 1.8, fill = 'none', style }: IconProps) {
  const P = { fill, stroke, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const paths: Record<string, ReactNode> = {
    leaf: <><path d="M11 20A7 7 0 0 1 18 4h3v3a7 7 0 0 1-10 13Z" {...P} /><path d="M11 20c0-5 2-8 7-11" {...P} /></>,
    search: <><circle cx="11" cy="11" r="7" {...P} /><path d="m20 20-3.5-3.5" {...P} /></>,
    filter: <path d="M3 5h18M7 12h10M10 19h4" {...P} />,
    pin: <><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" {...P} /><circle cx="12" cy="10" r="2.5" {...P} /></>,
    clock: <><circle cx="12" cy="12" r="8.5" {...P} /><path d="M12 7.5V12l3 2" {...P} /></>,
    cart: <><circle cx="9" cy="20" r="1.4" {...P} /><circle cx="18" cy="20" r="1.4" {...P} /><path d="M2.5 3h2.2l2 12.5h11l1.8-9H6.2" {...P} /></>,
    truck: <><path d="M2 6.5h11v9H2zM13 9h4l3 3v3.5h-7z" {...P} /><circle cx="7" cy="17.5" r="1.6" {...P} /><circle cx="17" cy="17.5" r="1.6" {...P} /></>,
    check: <path d="M4 12.5 9.5 18 20 6.5" {...P} />,
    checkCircle: <><circle cx="12" cy="12" r="9" {...P} /><path d="m8 12.2 2.6 2.6L16 9" {...P} /></>,
    plus: <path d="M12 5v14M5 12h14" {...P} />,
    minus: <path d="M5 12h14" {...P} />,
    arrowRight: <path d="M5 12h14M13 6l6 6-6 6" {...P} />,
    arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" {...P} />,
    chevR: <path d="m9 6 6 6-6 6" {...P} />,
    chevD: <path d="m6 9 6 6 6-6" {...P} />,
    x: <path d="M6 6l12 12M18 6 6 18" {...P} />,
    user: <><circle cx="12" cy="8" r="3.6" {...P} /><path d="M5 20c1.2-3.8 4-5 7-5s5.8 1.2 7 5" {...P} /></>,
    heart: <path d="M12 20S4 14.5 4 8.8A4.3 4.3 0 0 1 12 6a4.3 4.3 0 0 1 8 2.8C20 14.5 12 20 12 20Z" {...P} />,
    star: <path d="M12 3.5 14.6 9l6 .7-4.5 4 1.3 5.9L12 16.7 6.6 19.6 7.9 13.7 3.4 9.7 9.4 9Z" {...P} />,
    /* a deep tapered bucket with a hoop over it reads as a waste bin, which is
       the last thing a food-relief app should put next to "I need food" —
       this is a tote: shallow taper, rounded base, handle posts off the rim */
    bag: <><path d="M5.7 8h12.6l-1.05 11.1a1.8 1.8 0 0 1-1.79 1.63H8.54a1.8 1.8 0 0 1-1.79-1.63Z" {...P} /><path d="M9.3 8V6.6a2.7 2.7 0 0 1 5.4 0V8" {...P} /></>,
    box: <><path d="M12 3 4 7v10l8 4 8-4V7Z" {...P} /><path d="M4 7l8 4 8-4M12 11v10" {...P} /></>,
    phone: <><path d="M6 4h12v16H6zM10 18h4" {...P} /></>,
    nav: <path d="M12 2 22 22 12 17 2 22Z" {...P} />,
    bell: <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" {...P} /><path d="M10 20a2 2 0 0 0 4 0" {...P} /></>,
    home: <path d="M4 11 12 4l8 7M6 9.5V20h12V9.5" {...P} />,
    list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" {...P} />,
    wallet: <><path d="M3 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" {...P} /><path d="M3 7V6a2 2 0 0 1 2-2h11M16 13h2" {...P} /></>,
    route: <><circle cx="6" cy="6" r="2.4" {...P} /><circle cx="18" cy="18" r="2.4" {...P} /><path d="M8.4 6H14a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6.6" {...P} /></>,
    camera: <><path d="M3 8.5h4l1.5-2h7L17 8.5h4v11H3Z" {...P} /><circle cx="12" cy="13.5" r="3.4" {...P} /></>,
    calendar: <><rect x="4" y="5.5" width="16" height="15" rx="2.5" {...P} /><path d="M4 10h16M8 3.5v4M16 3.5v4" {...P} /></>,
    sprout: <><path d="M12 21v-7" {...P} /><path d="M12 14c0-3-2-5-6-5 0 3 2 5 6 5ZM12 12c0-3 2-5 6-5 0 3-2 5-6 5Z" {...P} /></>,
    handHeart: <><path d="M3 13l4-1 5 2 6-2a1.5 1.5 0 0 1 1 2.8L12 19l-5-1H3Z" {...P} /><path d="M11 8.5c0-1.6 2.2-2.3 3-.8.8-1.5 3-.8 3 .8C17 10.3 14 12 14 12s-3-1.7-3-3.5Z" {...P} /></>,
    info: <><circle cx="12" cy="12" r="9" {...P} /><path d="M12 11v5M12 7.5h.01" {...P} /></>,
    gift: <><rect x="4" y="9" width="16" height="11" rx="1.5" {...P} /><path d="M4 13h16M12 9v11M12 9S10 4 7.5 5.5 9 9 12 9ZM12 9s2-5 4.5-3.5S15 9 12 9Z" {...P} /></>,
    play: <path d="M8 5.5v13l11-6.5Z" {...P} />,
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="2" {...P} /><rect x="13.5" y="3.5" width="7" height="7" rx="2" {...P} /><rect x="3.5" y="13.5" width="7" height="7" rx="2" {...P} /><rect x="13.5" y="13.5" width="7" height="7" rx="2" {...P} /></>,
    monitor: <><rect x="3" y="4.5" width="18" height="12.5" rx="2" {...P} /><path d="M9 20.5h6M12 17v3.5" {...P} /></>,
    refresh: <><path d="M20 12a8 8 0 1 1-2.6-5.9" {...P} /><path d="M20.5 4v4.5H16" {...P} /></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      {paths[name] ?? null}
    </svg>
  )
}
