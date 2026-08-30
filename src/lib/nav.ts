/* Both surfaces are routed from the top so the scene rail and the
   autoplay reels can drive them the same way a person would. */

export type ClientRouteName = 'onboard' | 'home' | 'browse' | 'detail' | 'checkout' | 'confirm' | 'track'

export interface ClientRoute {
  name: ClientRouteName
  id?: string
  cat?: string
  q?: string
  orderId?: string
}

export type DriverScreenName = 'login' | 'routes' | 'detail' | 'active' | 'done' | 'impact'

export interface DriverRoute {
  name: DriverScreenName
  orderId?: string
}

export type GoClient = (name: ClientRouteName, params?: Omit<ClientRoute, 'name'>) => void
export type GoDriver = (name: DriverScreenName, orderId?: string) => void
