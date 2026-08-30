export type Fulfillment = 'pickup' | 'delivery'
export type CategoryId = 'produce' | 'bakery' | 'pantry' | 'dairy' | 'prepared'

export interface Provider {
  id: string
  name: string
  kind: string
  dist: number
  rating: number
  addr: string
  open: boolean
  blurb: string
  fulfillment: Fulfillment[]
  category: CategoryId
}

export interface Listing {
  id: string
  provider: string
  name: string
  category: CategoryId
  desc: string
  qtyLeft: number
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
