/* ============================================================
   Autoplay reels. Recruiters will not click through a prototype;
   they will watch a 30-second clip. Each reel drives the real UI
   with a synthetic pointer so the recording is the product, not
   a video of a video.
   ============================================================ */
import type { GoClient, GoClientPhone, GoDriver, PhoneSide } from '../lib/nav'
import type { Theme } from '../lib/theme'
import type { SceneId, View } from '../stage/scenes'

export interface DemoCtx {
  scene: (id: SceneId) => void
  client: GoClient
  driver: GoDriver
  /** the phone's client side */
  phone: GoClientPhone
  side: (s: PhoneSide) => void
  view: (v: View) => void
  set: <K extends keyof Theme>(k: K, v: Theme[K]) => void
  reset: () => void
}

export interface Step {
  /** data-demo attribute to move the pointer to and click */
  target?: string
  caption?: string
  /** ms to hold after the step */
  hold?: number
  act?: (c: DemoCtx) => void
}

export interface Reel {
  id: string
  label: string
  note: string
  seconds: number
  loop?: boolean
  steps: Step[]
}

export const REELS: Reel[] = [
  {
    id: 'reserve',
    label: 'Reserve a box',
    note: 'Client website, landing → confirmation',
    seconds: 26,
    steps: [
      { act: (c) => { c.reset(); c.scene('landing') }, caption: 'Amara needs food this week. No account wall.', hold: 2000 },
      { target: 'c-find', caption: 'A ZIP code and a household size', hold: 1400 },
      { target: 'c-signup-attest', caption: 'One declaration, taken at its word', hold: 1600 },
      { target: 'c-signup-submit', caption: 'No documents, and no waiting to be approved', hold: 1500 },
      { target: 'c-cat-produce', caption: 'Browsing by what she can actually cook', hold: 1600 },
      { target: 'c-listing-l1', caption: 'A produce box from the food bank 1.4 miles away', hold: 1900 },
      { target: 'c-reserve', caption: 'Stock and waitlist stated before she commits', hold: 1700 },
      { target: 'c-method-delivery', caption: 'Pickup, or a volunteer driver — both free', hold: 1500 },
      { target: 'c-place', caption: 'Placing the order', hold: 2400 },
      { caption: 'Total: $0.00. And a route is now live for drivers.', hold: 2600 },
    ],
  },
  {
    id: 'handoff',
    label: 'Order → route',
    note: 'Both surfaces, one order — the thesis reel',
    seconds: 40,
    steps: [
      { act: (c) => { c.reset(); c.view('split'); c.client('detail', { id: 'l1' }); c.driver('routes') }, caption: 'One order, two surfaces, side by side', hold: 2200 },
      { target: 'c-reserve', caption: 'She reserves on the website…', hold: 1500 },
      { target: 'c-method-delivery', caption: '…and asks for delivery', hold: 1400 },
      { target: 'c-place', caption: 'The order is placed', hold: 2600 },
      { caption: 'The driver’s phone already has the route', hold: 2000 },
      { target: 'd-route-first', caption: 'Two stops, distance, cargo — before accepting', hold: 2000 },
      { target: 'd-accept', caption: 'Accepted', hold: 1400 },
      { act: (c) => c.client('track'), caption: 'Her tracking view updates in the same instant', hold: 2600 },
      { target: 'd-check-0', caption: 'Cargo verified at the pantry', hold: 1200 },
      { target: 'd-confirm-pickup', hold: 1600 },
      { target: 'd-start', caption: 'On the road', hold: 1800 },
      { target: 'd-arrived', caption: 'At the door', hold: 1500 },
      { target: 'd-complete', caption: 'Delivered — and she is told, without asking', hold: 3000 },
    ],
  },
  {
    id: 'driver',
    label: 'Driver run',
    note: 'Driver app, sign-in → impact',
    seconds: 32,
    steps: [
      { act: (c) => { c.reset(); c.view('driver'); c.driver('login') }, caption: 'Volunteers, not gig workers', hold: 2000 },
      { target: 'd-login', hold: 1400 },
      { act: (c) => c.scene('dRoutes'), caption: 'Open routes, posted by the website', hold: 1900 },
      { target: 'd-route-first', hold: 1700 },
      { target: 'd-accept', caption: 'Accepting commits to a person, not a fare', hold: 1600 },
      { target: 'd-check-0', caption: 'Every box checked before it leaves', hold: 900 },
      { target: 'd-check-1', hold: 1100 },
      { target: 'd-confirm-pickup', hold: 1500 },
      { target: 'd-start', hold: 1600 },
      { target: 'd-arrived', hold: 1400 },
      { target: 'd-complete', caption: 'Proof of delivery, then the reward screen', hold: 2400 },
      { target: 'd-impact', caption: 'Measured in meals — never in dollars', hold: 2800 },
    ],
  },
  {
    id: 'portal',
    label: 'Client portal',
    note: 'The phone app, from the other side',
    seconds: 30,
    steps: [
      { act: (c) => { c.reset(); c.view('driver'); c.side('gate') }, caption: 'Most people who need food relief are phone-only', hold: 2400 },
      { target: 'p-gate-client', caption: 'So the driver app has a second front door', hold: 1800 },
      { target: 'p-login-guest', caption: 'No eligibility check, no paperwork', hold: 1900 },
      { target: 'p-cat-produce', caption: 'The same shelf the website shows', hold: 1800 },
      { target: 'p-listing-l1', caption: 'A produce box 1.4 miles away', hold: 1900 },
      { target: 'p-method-delivery', caption: 'Pickup or a volunteer driver — both free', hold: 1800 },
      { target: 'p-reserve', caption: 'Reserved. Total: $0.00', hold: 2400 },
      { target: 'p-track', caption: 'And the route is now live for drivers', hold: 2600 },
      { caption: 'One order, one app, whichever device she has', hold: 2800 },
    ],
  },
  {
    id: 'filters',
    label: 'Find what fits',
    note: 'Narrowing until nothing matches, and back',
    seconds: 24,
    steps: [
      { act: (c) => { c.reset(); c.view('client'); c.client('browse') }, caption: 'Food relief has to respect what people can eat', hold: 1900 },
      { target: 'c-diet-Halal', caption: 'Halal — six boxes become two', hold: 1700 },
      { target: 'c-diet-Halal', hold: 800 },
      { target: 'c-diet-Vegan', caption: 'Vegan', hold: 1600 },
      { target: 'c-fulfil-delivery', caption: 'Delivery only — she has no car', hold: 1900 },
      { target: 'c-diet-Gluten-free', caption: 'Narrow it past what exists…', hold: 2200 },
      { target: 'c-fulfil-any', caption: '…and it says so, instead of showing an empty grid', hold: 2600 },
    ],
  },
  {
    id: 'pickup',
    label: 'Pickup instead',
    note: 'The other half of the model — no driver at all',
    seconds: 24,
    steps: [
      { act: (c) => { c.reset(); c.view('client'); c.client('detail', { id: 'l1' }) }, caption: 'Not everyone wants a stranger at the door', hold: 2000 },
      { target: 'c-reserve', caption: 'Same reservation…', hold: 1600 },
      { target: 'c-method-pickup', caption: '…different fork: pickup names the place, the hours and the map', hold: 2600 },
      { target: 'c-place', caption: 'Placed — and no route is created, because none is needed', hold: 2600 },
      { target: 'c-track', caption: 'The timeline drops the two stages that no longer apply', hold: 3000 },
    ],
  },
  {
    id: 'empty',
    label: 'When nothing’s there',
    note: 'Empty states on both surfaces',
    seconds: 18,
    steps: [
      { act: (c) => { c.reset(); c.view('client'); c.client('checkout') }, caption: 'A basket with nothing in it still has to say something', hold: 2400 },
      { target: 'c-empty-basket', caption: 'So it points somewhere', hold: 1800 },
      { act: (c) => c.client('track'), caption: 'No orders yet — an invitation, not an error', hold: 2400 },
      { act: (c) => { c.view('driver'); c.driver('routes') }, caption: 'And on the driver’s side, no routes is a normal state', hold: 2600 },
      { caption: 'Every empty screen reassures rather than gatekeeps', hold: 2600 },
    ],
  },
  {
    id: 'stock',
    label: 'What’s left',
    note: 'The service stated, then the shelf itself',
    seconds: 20,
    steps: [
      { act: (c) => { c.reset(); c.view('client'); c.client('about') }, caption: 'The food already exists — the service just moves it', hold: 2600 },
      { target: 'c-about-browse', caption: 'So what is actually on the shelf right now?', hold: 1900 },
      { target: 'c-view-list', caption: 'The list leads with what is left, not with a photo', hold: 2800 },
      { target: 'c-row-l4', caption: 'Scarcity is the real constraint, so it is the first thing you see', hold: 2800 },
    ],
  },
  {
    id: 'tokens',
    label: 'One system',
    note: 'Retheming both surfaces from the token panel',
    seconds: 22,
    steps: [
      { act: (c) => { c.view('split'); c.client('home'); c.driver('routes') }, caption: 'Both surfaces read the same tokens', hold: 1800 },
      { target: 'tok-primary-2f7d6b', caption: 'Change the primary once', hold: 1800 },
      { target: 'tok-font-Newsreader', caption: 'Swap the display face', hold: 1900 },
      { target: 'tok-img-pattern', caption: 'Drop photography for pantries that have none', hold: 2200 },
      { target: 'tok-img-photo', hold: 1200 },
      { target: 'tok-font-Libre', hold: 1000 },
      { target: 'tok-primary-3f6b3d', caption: 'Nothing downstream had to know', hold: 2400 },
    ],
  },
]
