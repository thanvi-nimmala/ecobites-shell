/* ============================================================
   The case-study index. Every screen worth putting in a deck is
   a scene: it knows which surface to show, where each app should
   be, and how far along the order has to be to make sense.
   ============================================================ */
import type { ClientPhoneRoute, ClientRoute, DriverRoute, PhoneSide } from '../lib/nav'

export type SceneId =
  | 'landing' | 'signup' | 'home' | 'about' | 'directory' | 'browse' | 'detail' | 'checkout' | 'confirm' | 'track'
  | 'dLogin' | 'dRoutes' | 'dDetail' | 'dPickup' | 'dDeliver' | 'dDone' | 'dImpact'
  | 'pGate' | 'pLogin' | 'pBrowse' | 'pDetail' | 'pConfirm' | 'pTrack' | 'pOrders'
  | 'trackDone' | 'handoff' | 'tracked'

export type View = 'split' | 'client' | 'driver'

/** how far the demo order must have progressed for a scene to read correctly */
export type OrderLevel = 'none' | 'placed' | 'accepted' | 'picked' | 'enroute' | 'delivered'

export interface Scene {
  id: SceneId
  label: string
  note: string
  group: 'Client website' | 'Driver app' | 'Client portal' | 'The handoff'
  view: View
  client?: ClientRoute
  driver?: DriverRoute
  needs?: OrderLevel
  /** the screen only reads correctly with something in the basket */
  cart?: boolean
  /** which half of the phone app this scene wants on screen */
  side?: PhoneSide
  phone?: ClientPhoneRoute
}

export const SCENES: Scene[] = [
  { id: 'landing',  label: 'Landing',        note: 'no account wall',      group: 'Client website', view: 'client', client: { name: 'onboard' } },
  { id: 'signup',   label: 'Sign-up',        note: 'self-attested, instant', group: 'Client website', view: 'client', client: { name: 'signup' } },
  { id: 'home',     label: 'Home',           note: 'search + categories',  group: 'Client website', view: 'client', client: { name: 'home' } },
  { id: 'about',    label: 'About',          note: 'the service, stated',  group: 'Client website', view: 'client', client: { name: 'about' } },
  { id: 'directory', label: 'Directory',      note: 'the places themselves', group: 'Client website', view: 'client', client: { name: 'directory' } },
  { id: 'browse',   label: 'Browse',         note: 'filters that matter',  group: 'Client website', view: 'client', client: { name: 'browse' } },
  { id: 'detail',   label: 'Food detail',    note: 'stock + waitlist',     group: 'Client website', view: 'client', client: { name: 'detail', id: 'l1' } },
  { id: 'checkout', label: 'Checkout',       note: 'pickup or delivery',   group: 'Client website', view: 'client', client: { name: 'checkout' }, cart: true },
  { id: 'confirm',  label: 'Confirmation',   note: 'always $0.00',         group: 'Client website', view: 'client', client: { name: 'confirm' }, needs: 'placed' },
  { id: 'track',    label: 'Tracking',       note: 'six-stage timeline',   group: 'Client website', view: 'client', client: { name: 'track' }, needs: 'placed' },
  { id: 'trackDone', label: 'Delivered',     note: 'the loop closes',      group: 'Client website', view: 'client', client: { name: 'track' }, needs: 'delivered' },

  { id: 'dLogin',   label: 'Driver sign-in', note: 'volunteer, not gig',   group: 'Driver app', view: 'driver', driver: { name: 'login' } },
  { id: 'dRoutes',  label: 'Open routes',    note: 'live from the website', group: 'Driver app', view: 'driver', driver: { name: 'routes' }, needs: 'placed' },
  { id: 'dDetail',  label: 'Route details',  note: 'two stops, one screen', group: 'Driver app', view: 'driver', driver: { name: 'detail' }, needs: 'placed' },
  { id: 'dPickup',  label: 'Item check',     note: 'cargo verification',    group: 'Driver app', view: 'driver', driver: { name: 'active' }, needs: 'accepted' },
  { id: 'dDeliver', label: 'Out for delivery', note: 'live to the door',    group: 'Driver app', view: 'driver', driver: { name: 'active' }, needs: 'enroute' },
  { id: 'dDone',    label: 'Complete',       note: 'impact, not earnings',  group: 'Driver app', view: 'driver', driver: { name: 'done' }, needs: 'delivered' },
  { id: 'dImpact',  label: 'My impact',      note: 'meals, trips, rating',  group: 'Driver app', view: 'driver', driver: { name: 'impact' } },

  { id: 'pGate',    label: 'One app, two jobs', note: 'driver or client',   group: 'Client portal', view: 'driver', side: 'gate' },
  { id: 'pLogin',   label: 'Client sign-in',  note: 'no eligibility check',  group: 'Client portal', view: 'driver', side: 'client', phone: { name: 'login' } },
  { id: 'pBrowse',  label: 'Near you',        note: 'the shelf, on a phone', group: 'Client portal', view: 'driver', side: 'client', phone: { name: 'browse' } },
  { id: 'pDetail',  label: 'Reserve',         note: 'stock, then the fork',  group: 'Client portal', view: 'driver', side: 'client', phone: { name: 'detail', id: 'l1' } },
  { id: 'pConfirm', label: 'Confirmed',       note: 'always $0.00',          group: 'Client portal', view: 'driver', side: 'client', phone: { name: 'confirm' }, needs: 'placed' },
  { id: 'pTrack',   label: 'Following it',    note: 'the same timeline',     group: 'Client portal', view: 'driver', side: 'client', phone: { name: 'track' }, needs: 'enroute' },
  { id: 'pOrders',  label: 'My orders',       note: 'everything reserved',   group: 'Client portal', view: 'driver', side: 'client', phone: { name: 'orders' }, needs: 'placed' },

  { id: 'handoff',  label: 'Order → route',  note: 'the whole thesis',      group: 'The handoff', view: 'split', client: { name: 'checkout' }, driver: { name: 'routes' } },
  { id: 'tracked',  label: 'Route → tracking', note: 'driver moves the map', group: 'The handoff', view: 'split', client: { name: 'track' }, driver: { name: 'active' }, needs: 'enroute' },
]

export const GROUPS = ['Client website', 'Driver app', 'Client portal', 'The handoff'] as const

export const sceneById = (id: SceneId) => SCENES.find((s) => s.id === id)!
