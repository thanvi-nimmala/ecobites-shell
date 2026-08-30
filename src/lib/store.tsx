/* ============================================================
   EcoBites — shared store. This is the whole thesis of the
   prototype: an order placed on the client website surfaces as a
   route in the driver app, and the driver's progress flows back
   into the client's tracking view. One state, two surfaces.
   ============================================================ */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { DRIVER, listing as findListing } from './data'
import type { CartLine, Fulfillment, Order, OrderLine, Toast } from './types'

interface PlaceDetails {
  method: Fulfillment
  address: string
  window: string
  name: string
}

interface StoreValue {
  orders: Order[]
  cart: CartLine[]
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
      toast('New delivery route sent to the Driver app', { icon: 'truck', action: 'driver' })
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

    /* one neighbouring route, so "available routes" is a list rather than an
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
  }, [])

  const value = useMemo<StoreValue>(() => {
    const availableRoutes = orders.filter((o) => o.method === 'delivery' && !o.driverAccepted && o.stage !== 'delivered')
    const myRoutes = orders.filter((o) => o.method === 'delivery' && o.driverAccepted && o.stage !== 'delivered')
    return {
      orders, cart, toasts, toast,
      cartQty, setCartQty, cartCount, clearCart,
      placeOrder, advance,
      acceptRoute, driverPicked, driverEnroute, driverDelivered,
      availableRoutes, myRoutes, activeOrder: orders[0] ?? null,
      resetDemo, seedRoute,
    }
  }, [orders, cart, toasts, toast, cartQty, setCartQty, cartCount, clearCart, placeOrder, advance,
      acceptRoute, driverPicked, driverEnroute, driverDelivered, resetDemo, seedRoute])

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const v = useContext(StoreCtx)
  if (!v) throw new Error('useStore must be used inside <StoreProvider>')
  return v
}
