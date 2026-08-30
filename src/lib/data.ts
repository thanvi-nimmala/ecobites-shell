/* ============================================================
   EcoBites — mock data (no network, no backend: this is a shell)
   ============================================================ */
import type { CategoryId, Listing, OrderStage, Provider } from './types'

export const PROVIDERS: Provider[] = [
  {
    id: 'cfbnj', name: 'Community Food Bank of NJ', kind: 'Food Bank',
    dist: 1.4, rating: 4.9, addr: '31 Evans Terminal Rd, Hillside', open: true,
    blurb: 'New Jersey’s largest anti-hunger organization, distributing fresh and shelf-stable food to neighbors across the state.',
    fulfillment: ['pickup', 'delivery'], category: 'produce',
  },
  {
    id: 'harvest', name: 'Harvest Hands Pantry', kind: 'Community Pantry',
    dist: 2.1, rating: 4.8, addr: '88 Maple Ave, Newark', open: true,
    blurb: 'Neighborhood pantry rescuing surplus produce and bakery goods from local grocers every morning.',
    fulfillment: ['pickup', 'delivery'], category: 'bakery',
  },
  {
    id: 'sprout', name: 'Sprout Mobile Market', kind: 'Mobile Market',
    dist: 3.4, rating: 4.7, addr: 'Rotating · Essex County', open: true,
    blurb: 'A market on wheels bringing fresh fruit and vegetables to neighborhoods with limited grocery access.',
    fulfillment: ['pickup'], category: 'produce',
  },
  {
    id: 'graceful', name: 'Graceful Plate Kitchen', kind: 'Meal Program',
    dist: 4.0, rating: 4.9, addr: '210 Springfield Ave, Newark', open: false,
    blurb: 'Prepared, ready-to-eat meals cooked from rescued ingredients for families and seniors.',
    fulfillment: ['pickup', 'delivery'], category: 'prepared',
  },
]

export const LISTINGS: Listing[] = [
  { id: 'l1', provider: 'cfbnj', name: 'Fresh Produce Box', category: 'produce',
    desc: 'Seasonal mix of vegetables and fruit — carrots, greens, apples, potatoes and more.',
    qtyLeft: 18, unit: 'box', diet: ['Vegetarian', 'Vegan'], waitlist: 6 },
  { id: 'l2', provider: 'harvest', name: 'Artisan Bread & Bakery', category: 'bakery',
    desc: 'Day-end loaves, rolls and pastries rescued from neighborhood bakeries.',
    qtyLeft: 24, unit: 'bag', diet: ['Vegetarian'], waitlist: 3 },
  { id: 'l3', provider: 'cfbnj', name: 'Pantry Staples Kit', category: 'pantry',
    desc: 'Rice, pasta, canned beans, peanut butter and cooking oil — a week of essentials.',
    qtyLeft: 40, unit: 'kit', diet: ['Vegetarian', 'Halal'], waitlist: 2 },
  { id: 'l4', provider: 'graceful', name: 'Ready Meals — Family', category: 'prepared',
    desc: 'Four freshly prepared, ready-to-heat dinners for a family of four.',
    qtyLeft: 9, unit: 'pack', diet: ['Halal'], waitlist: 11 },
  { id: 'l5', provider: 'sprout', name: 'Fruit & Veg Bundle', category: 'produce',
    desc: 'A generous bundle of in-season fruit and vegetables from the mobile market.',
    qtyLeft: 15, unit: 'bundle', diet: ['Vegan', 'Gluten-free'], waitlist: 0 },
  { id: 'l6', provider: 'harvest', name: 'Dairy & Eggs Pack', category: 'dairy',
    desc: 'Milk, eggs, yogurt and cheese — refrigerated essentials for the week.',
    qtyLeft: 12, unit: 'pack', diet: ['Vegetarian'], waitlist: 4 },
]

export const CATEGORIES: { id: CategoryId | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'leaf' },
  { id: 'produce', label: 'Produce', icon: 'sprout' },
  { id: 'bakery', label: 'Bakery', icon: 'gift' },
  { id: 'pantry', label: 'Pantry', icon: 'box' },
  { id: 'dairy', label: 'Dairy', icon: 'bag' },
  { id: 'prepared', label: 'Prepared', icon: 'handHeart' },
]

export const DIETS = ['Vegetarian', 'Vegan', 'Halal', 'Gluten-free']

export const ORDER_STAGES: OrderStage[] = [
  { key: 'reserved',  label: 'Reserved',         client: 'Your order is confirmed' },
  { key: 'preparing', label: 'Preparing',        client: 'The pantry is packing your food' },
  { key: 'assigned',  label: 'Driver assigned',  client: 'A driver accepted your route' },
  { key: 'pickup',    label: 'Picked up',        client: 'Your food is with the driver' },
  { key: 'enroute',   label: 'Out for delivery', client: 'Your driver is on the way' },
  { key: 'delivered', label: 'Delivered',        client: 'Enjoy your food — delivered!' },
]

export const DRIVER = {
  name: 'Marcus R.', rating: 4.96, trips: 312,
  vehicle: 'Honda CR-V · Silver', initials: 'M',
}

export const CLIENT = { name: 'Amara', initial: 'A', zip: 'Newark, NJ 07102' }

/* ---- curated photography (warm editorial food stills) ---- */
/* string literals, not imports — Vite leaves these alone, so the base
   prefix has to be applied explicitly or they 404 on a subpath deploy */
const BASE = import.meta.env.BASE_URL

export const PHOTO = {
  communityTable: `${BASE}photos/community-table.jpeg`,
  abundance:      `${BASE}photos/abundance.jpeg`,
  citrusConcrete: `${BASE}photos/citrus-concrete.jpeg`,
  papayaOlive:    `${BASE}photos/papaya-olive.jpeg`,
  fruitFloat:     `${BASE}photos/fruit-float.jpeg`,
  pearsPlate:     `${BASE}photos/pears-plate.jpeg`,
  pearApple:      `${BASE}photos/pear-apple.jpeg`,
  vegArt:         `${BASE}photos/veg-art.jpeg`,
  gelDots:        `${BASE}photos/gel-dots.jpeg`,
  citrusStack:    `${BASE}photos/citrus-stack.jpeg`,
}

const LISTING_PHOTOS: Record<string, string> = {
  l1: PHOTO.papayaOlive,    // Fresh Produce Box
  l2: PHOTO.pearsPlate,     // Artisan Bread & Bakery
  l3: PHOTO.abundance,      // Pantry Staples Kit
  l4: PHOTO.vegArt,         // Ready Meals — Family
  l5: PHOTO.citrusConcrete, // Fruit & Veg Bundle
  l6: PHOTO.fruitFloat,     // Dairy & Eggs Pack
}

export const listingPhoto = (l?: Listing | null) => (l && LISTING_PHOTOS[l.id]) || PHOTO.papayaOlive

export const listingGallery = (l?: Listing | null) => {
  const main = listingPhoto(l)
  const pool = [PHOTO.citrusConcrete, PHOTO.pearApple, PHOTO.gelDots, PHOTO.pearsPlate, PHOTO.papayaOlive]
  return [main, ...pool.filter((p) => p !== main).slice(0, 2)]
}

export const provider = (id: string) => PROVIDERS.find((p) => p.id === id)!
export const listing = (id: string) => LISTINGS.find((l) => l.id === id)!
export const stageIndex = (key: string) => ORDER_STAGES.findIndex((s) => s.key === key)

/** "box" pluralises to "boxes", not "boxs" — the units are author-entered, so guard it */
export const plural = (n: number, unit: string) =>
  n === 1 ? unit : unit + (/(s|x|z|ch|sh)$/.test(unit) ? 'es' : 's')
