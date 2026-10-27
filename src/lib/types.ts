export type Fulfillment = 'pickup' | 'delivery'
export type CategoryId = 'produce' | 'bakery' | 'pantry' | 'dairy' | 'prepared'

export type ProviderKind = 'Food Bank' | 'Community Pantry' | 'Mobile Market' | 'Meal Program' | 'Soup Kitchen'

export interface Provider {
  id: string
  name: string
  kind: ProviderKind
  dist: number
  rating: number
  addr: string
  open: boolean
  blurb: string
  fulfillment: Fulfillment[]
  category: CategoryId
  /* ── directory fields ──
     What a person needs before they travel. The order matters: `bring` comes
     first in the UI because "what will they ask me for" is the question that
     stops people walking through the door. */
  bring: string
  phone: string
  /** 0 = Sunday, matching Date#getDay; null is closed that day */
  hours: (string | null)[]
  services: string[]
  languages: string[]
  /** step-free entry, and whether a bus route reaches it */
  stepFree: boolean
  transit?: string
}

export interface Listing {
  id: string
  provider: string
  name: string
  category: CategoryId
  desc: string
  qtyLeft: number
  /** what the provider started the day with — the denominator for the stock bar */
  qtyTotal: number
  unit: string
  diet: string[]
  waitlist: number
}

export type StageKey = 'reserved' | 'preparing' | 'assigned' | 'pickup' | 'enroute' | 'delivered'

export interface OrderStage {
  key: StageKey
  label: string
  client: string
}

export interface CartLine { listingId: string; qty: number }
export interface OrderLine extends CartLine { listing: Listing }

export interface Order {
  id: string
  code: string
  items: OrderLine[]
  providerId: string
  method: Fulfillment
  address: string
  window: string
  name: string
  stage: StageKey
  placedAt: number
  driverAccepted: boolean
  driver?: string
  eta: number
  deliveredAt?: number
  /** background routes so the driver's list reads as a marketplace, not a demo */
  ambient?: boolean
}

export interface Toast {
  id: number
  msg: string
  icon?: string
  /** which surface the message is *about* — tints the toast dot */
  action?: 'client' | 'driver'
}
