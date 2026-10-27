/* ============================================================
   EcoBites — shared store. This is the whole thesis of the
   prototype: an order placed on the client website surfaces as a
   route in the driver app, and the driver's progress flows back
   into the client's tracking view. One state, two surfaces.
   ============================================================ */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { CLIENT, DRIVER, listing as findListing } from './data'
import type { CartLine, Fulfillment, Order, OrderLine, Toast } from './types'

interface PlaceDetails {
  method: Fulfillment
  address: string
  window: string
  name: string
}

/* ── fair share ──
   The scarce thing is not food, it is a volunteer willing to drive. So the
   limit sits on deliveries, it is stated openly on the screen rather than
   enforced quietly, and pickup is never capped — anyone can always come and
   collect. This is how you answer "is the right person getting this" without
   asking anyone to prove anything. */
export const DELIVERY_LIMIT = 2

/** What someone volunteers about their situation. Nothing is verified, and
    nothing here can disqualify you — it only orders the delivery queue. */
export interface NeedSignals {
  noCar: boolean
  noTransit: boolean
  mobility: boolean
  children: boolean
}

export const NO_NEEDS: NeedSignals = { noCar: false, noTransit: false, mobility: false, children: false }

export interface Household {
  name: string
  zip: string
  size: number
  /** the declaration — self-attested, never checked */
  attested: boolean
  needs: NeedSignals
}

interface StoreValue {
  orders: Order[]
  cart: CartLine[]
  household: Household
  setHousehold: (patch: Partial<Household>) => void
  /** deliveries this household has already used this week */
  deliveriesUsed: number
  deliveriesLeft: number
  toasts: Toast[]
  toast: (msg: string, opts?: Partial<Toast> & { duration?: number }) => void
  cartQty: (listingId: string) => number
  setCartQty: (listingId: string, qty: number) => void
  cartCount: number
  clearCart: () => void
  placeOrder: (details: PlaceDetails) => Order
  advance: (orderId: string, stage: Order['stage']) => void
  acceptRoute: (orderId: string) => void
  driverPicked: (orderId: string) => void
  driverEnroute: (orderId: string) => void
  driverDelivered: (orderId: string) => void
  availableRoutes: Order[]
  myRoutes: Order[]
  activeOrder: Order | null
  resetDemo: () => void
  /** drops a ready-made delivery into the driver queue, for a cold-start demo */
  seedRoute: () => Order
}

const StoreCtx = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [cart, setCart] = useState<CartLine[]>([])
  const [household, setHouseholdState] = useState<Household>({
    name: CLIENT.name, zip: '07102', size: 3, attested: false, needs: NO_NEEDS,
  })
  const setHousehold = useCallback(
    (patch: Partial<Household>) => setHouseholdState((h) => ({ ...h, ...patch })), [])
  const [toasts, setToasts] = useState<Toast[]>([])
  const tid = useRef(1)
  const oid = useRef(1)
  const timers = useRef<number[]>([])

  const orderCode = () => `EB-${1740 + oid.current++}`

  const toast = useCallback<StoreValue['toast']>((msg, opts = {}) => {
    const id = tid.current++
    const { duration = 4200, ...rest } = opts
    setToasts((t) => [...t, { id, msg, ...rest }])
    const h = window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration)
    timers.current.push(h)
  }, [])

  const cartQty = useCallback((listingId: string) => cart.find((c) => c.listingId === listingId)?.qty ?? 0, [cart])

  const setCartQty = useCallback((listingId: string, qty: number) => {
    setCart((c) => {
      const next = c.filter((x) => x.listingId !== listingId)
      if (qty > 0) next.push({ listingId, qty })
      return next
    })
  }, [])

  const cartCount = cart.reduce((n, c) => n + c.qty, 0)
  const clearCart = useCallback(() => setCart([]), [])

  const advance = useCallback((orderId: string, stage: Order['stage']) => {
    setOrders((o) => o.map((x) => (x.id === orderId ? { ...x, stage } : x)))
  }, [])

  const buildOrder = useCallback((lines: CartLine[], details: PlaceDetails): Order => {
    const items: OrderLine[] = lines.map((c) => ({ ...c, listing: findListing(c.listingId) }))
    return {
      id: `o${Date.now()}${oid.current}`,
      code: orderCode(),
      items,
      providerId: items[0]?.listing.provider ?? 'cfbnj',
      method: details.method,
      address: details.address,
      window: details.window,
      name: details.name,
      stage: 'reserved',
      placedAt: Date.now(),
      driverAccepted: false,
      eta: 12 + Math.floor(Math.random() * 8),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const placeOrder = useCallback((details: PlaceDetails) => {
    const order = buildOrder(cart, details)
    setOrders((o) => [order, ...o])
    setCart([])
    if (details.method === 'delivery') {
      toast('New delivery route sent to nearby drivers', { icon: 'truck', action: 'driver' })
    }
    // the pantry starts packing on its own — the client should never watch a dead screen
    const h = window.setTimeout(() => advance(order.id, 'preparing'), 1600)
    timers.current.push(h)
    return order
  }, [cart, buildOrder, toast, advance])

  const seededAmbient = useRef(false)

  const seedRoute = useCallback(() => {
    const order = buildOrder([{ listingId: 'l1', qty: 2 }, { listingId: 'l3', qty: 1 }], {
      method: 'delivery',
      address: '142 Halsey St, Apt 3B, Newark NJ',
      window: 'Today · 4:00–6:00 PM',
      name: 'Amara',
    })
    order.stage = 'preparing'

    /* one neighboring route, so "available routes" is a list rather than an
       announcement — seeded once, and never picked up by the demo flows */
    const ambient: Order[] = []
    if (!seededAmbient.current) {
      seededAmbient.current = true
      const other = buildOrder([{ listingId: 'l2', qty: 1 }, { listingId: 'l6', qty: 1 }], {
        method: 'delivery',
        address: '19 Sussex Ave, Newark NJ',
        window: 'Today · 6:00–8:00 PM',
        name: 'Devon',
      })
      other.stage = 'preparing'
      other.ambient = true
      ambient.push(other)
    }

    setOrders((o) => [order, ...ambient, ...o])
    return order
  }, [buildOrder])

  const acceptRoute = useCallback((orderId: string) => {
    setOrders((o) => o.map((x) => (x.id === orderId ? { ...x, stage: 'assigned', driverAccepted: true, driver: DRIVER.name } : x)))
    toast('Route accepted — client notified', { icon: 'check', action: 'client' })
  }, [toast])

  const driverPicked = useCallback((orderId: string) => {
    setOrders((o) => o.map((x) => (x.id === orderId ? { ...x, stage: 'pickup' } : x)))
    toast('Pickup confirmed', { icon: 'check' })
  }, [toast])

  const driverEnroute = useCallback((orderId: string) => {
    setOrders((o) => o.map((x) => (x.id === orderId ? { ...x, stage: 'enroute' } : x)))
  }, [])

  const driverDelivered = useCallback((orderId: string) => {
    setOrders((o) => o.map((x) => (x.id === orderId ? { ...x, stage: 'delivered', deliveredAt: Date.now() } : x)))
    toast('Delivery complete — client tracking updated', { icon: 'checkCircle', action: 'client' })
  }, [toast])

  const resetDemo = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    seededAmbient.current = false
    setOrders([])
    setCart([])
    setToasts([])
    setHouseholdState({ name: CLIENT.name, zip: '07102', size: 3, attested: false, needs: NO_NEEDS })
  }, [])

  const value = useMemo<StoreValue>(() => {
    const availableRoutes = orders.filter((o) => o.method === 'delivery' && !o.driverAccepted && o.stage !== 'delivered')
    const myRoutes = orders.filter((o) => o.method === 'delivery' && o.driverAccepted && o.stage !== 'delivered')
    /* ambient routes belong to other households, so they never count against
       this one's allowance */
    const deliveriesUsed = orders.filter((o) => o.method === 'delivery' && !o.ambient).length
    return {
      orders, cart, toasts, toast,
      household, setHousehold,
      deliveriesUsed, deliveriesLeft: Math.max(0, DELIVERY_LIMIT - deliveriesUsed),
      cartQty, setCartQty, cartCount, clearCart,
      placeOrder, advance,
      acceptRoute, driverPicked, driverEnroute, driverDelivered,
      availableRoutes, myRoutes, activeOrder: orders[0] ?? null,
      resetDemo, seedRoute,
    }
  }, [orders, cart, toasts, toast, household, setHousehold, cartQty, setCartQty, cartCount, clearCart,
      placeOrder, advance, acceptRoute, driverPicked, driverEnroute, driverDelivered, resetDemo, seedRoute])

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const v = useContext(StoreCtx)
  if (!v) throw new Error('useStore must be used inside <StoreProvider>')
  return v
}
