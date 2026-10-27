/* Both surfaces are routed from the top so the scene rail and the
   autoplay reels can drive them the same way a person would. */

export type ClientRouteName = 'onboard' | 'signup' | 'home' | 'about' | 'directory' | 'browse' | 'detail' | 'checkout' | 'confirm' | 'track'

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

/* The phone carries both halves of the service. A volunteer driver and a
   person who needs food open the same app and are sent to different sides of
   it, so the phone is routed by (side, screen) rather than by screen alone. */
export type PhoneSide = 'gate' | 'driver' | 'client'

export type ClientPhoneName = 'login' | 'browse' | 'detail' | 'confirm' | 'track' | 'orders' | 'places'

export interface ClientPhoneRoute {
  name: ClientPhoneName
  id?: string
  orderId?: string
}

export type GoClient = (name: ClientRouteName, params?: Omit<ClientRoute, 'name'>) => void
export type GoDriver = (name: DriverScreenName, orderId?: string) => void
export type GoClientPhone = (name: ClientPhoneName, params?: Omit<ClientPhoneRoute, 'name'>) => void
