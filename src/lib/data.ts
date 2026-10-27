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
    bring: 'Nothing. No ID, no proof of address, no appointment.',
    phone: '(908) 355-3663',
    hours: [null, '9:00 AM – 4:00 PM', '9:00 AM – 4:00 PM', '9:00 AM – 7:00 PM', '9:00 AM – 4:00 PM', '9:00 AM – 4:00 PM', '10:00 AM – 2:00 PM'],
    services: ['Groceries', 'Fresh produce', 'SNAP sign-up help', 'Baby formula'],
    languages: ['English', 'Spanish', 'Portuguese', 'Haitian Creole'],
    stepFree: true, transit: '62 bus · Hillside Ave',
  },
  {
    id: 'harvest', name: 'Harvest Hands Pantry', kind: 'Community Pantry',
    dist: 2.1, rating: 4.8, addr: '88 Maple Ave, Newark', open: true,
    blurb: 'Neighborhood pantry rescuing surplus produce and bakery goods from local grocers every morning.',
    fulfillment: ['pickup', 'delivery'], category: 'bakery',
    bring: 'Nothing. Your first visit is the same as every other one.',
    phone: '(973) 555-0148',
    hours: [null, '10:00 AM – 2:00 PM', null, '10:00 AM – 2:00 PM', null, '10:00 AM – 6:00 PM', '9:00 AM – 12:00 PM'],
    services: ['Groceries', 'Bakery', 'Fresh produce', 'Pet food'],
    languages: ['English', 'Spanish'],
    stepFree: true, transit: '13 bus · Maple Ave',
  },
  {
    id: 'sprout', name: 'Sprout Mobile Market', kind: 'Mobile Market',
    dist: 3.4, rating: 4.7, addr: 'Rotating · Essex County', open: true,
    blurb: 'A market on wheels bringing fresh fruit and vegetables to neighborhoods with limited grocery access.',
    fulfillment: ['pickup'], category: 'produce',
    bring: 'Nothing. Turn up at the stop — the schedule is posted weekly.',
    phone: '(973) 555-0192',
    hours: [null, '11:00 AM – 1:00 PM', '11:00 AM – 1:00 PM', null, '11:00 AM – 1:00 PM', '11:00 AM – 3:00 PM', null],
    services: ['Fresh produce', 'Nutrition advice'],
    languages: ['English', 'Spanish'],
    stepFree: false, transit: 'Stops rotate — call for this week’s',
  },
  {
    id: 'graceful', name: 'Graceful Plate Kitchen', kind: 'Meal Program',
    dist: 4.0, rating: 4.9, addr: '210 Springfield Ave, Newark', open: false,
    blurb: 'Prepared, ready-to-eat meals cooked from rescued ingredients for families and seniors.',
    fulfillment: ['pickup', 'delivery'], category: 'prepared',
    bring: 'Nothing. Meals are handed out until they run out.',
    phone: '(973) 555-0107',
    hours: ['12:00 PM – 2:00 PM', null, '4:00 PM – 7:00 PM', null, '4:00 PM – 7:00 PM', '4:00 PM – 7:00 PM', '12:00 PM – 3:00 PM'],
    services: ['Hot meals', 'Ready-to-heat meals', 'Senior delivery'],
    languages: ['English', 'Spanish', 'Portuguese'],
    stepFree: true, transit: '25 bus · Springfield Ave',
  },
  {
    id: 'ironbound', name: 'Ironbound Community Table', kind: 'Soup Kitchen',
    dist: 2.6, rating: 4.8, addr: '417 Ferry St, Newark', open: true,
    blurb: 'A sit-down dinner every weekday evening, cooked by volunteers from the neighborhood it feeds.',
    fulfillment: ['pickup'], category: 'prepared',
    bring: 'Nothing. Sit down and eat — no questions at the door.',
    phone: '(973) 555-0163',
    hours: [null, '5:00 PM – 7:00 PM', '5:00 PM – 7:00 PM', '5:00 PM – 7:00 PM', '5:00 PM – 7:00 PM', '5:00 PM – 7:00 PM', null],
    services: ['Hot meals', 'Takeaway containers', 'Winter clothing'],
    languages: ['English', 'Portuguese', 'Spanish'],
    stepFree: true, transit: '1 bus · Ferry St',
  },
  {
    id: 'weequahic', name: 'Weequahic Park Pantry', kind: 'Community Pantry',
    dist: 3.0, rating: 4.6, addr: '1 Thomas Carmichael Dr, Newark', open: false,
    blurb: 'Weekend pantry run out of a converted park field house, with a children’s weekend-bag program.',
    fulfillment: ['pickup', 'delivery'], category: 'pantry',
    bring: 'Nothing. Bring a bag if you have one — we have spares if not.',
    phone: '(973) 555-0175',
    hours: ['10:00 AM – 1:00 PM', null, null, null, null, '3:00 PM – 6:00 PM', '10:00 AM – 2:00 PM'],
    services: ['Groceries', 'Children’s weekend bags', 'Diapers'],
    languages: ['English', 'Spanish'],
    stepFree: true, transit: '24 bus · Elizabeth Ave',
  },
  {
    id: 'northend', name: 'North End Faith Pantry', kind: 'Community Pantry',
    dist: 1.9, rating: 4.7, addr: '62 Bloomfield Ave, Newark', open: true,
    blurb: 'Open-door pantry attached to a congregation hall, serving anyone who walks in regardless of faith.',
    fulfillment: ['pickup'], category: 'pantry',
    bring: 'Nothing. You do not have to be a member of anything.',
    phone: '(973) 555-0129',
    hours: ['1:00 PM – 3:00 PM', '9:00 AM – 12:00 PM', '9:00 AM – 12:00 PM', '9:00 AM – 12:00 PM', '9:00 AM – 12:00 PM', '9:00 AM – 12:00 PM', null],
    services: ['Groceries', 'Halal shelf', 'Toiletries'],
    languages: ['English', 'Spanish', 'Arabic'],
    stepFree: false, transit: '27 bus · Bloomfield Ave',
  },
  {
    id: 'riverbank', name: 'Riverbank Fresh Stop', kind: 'Mobile Market',
    dist: 4.6, rating: 4.5, addr: 'Riverbank Park · Van Buren St', open: false,
    blurb: 'A Saturday-morning produce stop in the park, run with growers from the South Ward.',
    fulfillment: ['pickup'], category: 'produce',
    bring: 'Nothing. Arrive early — it is busiest in the first hour.',
    phone: '(973) 555-0184',
    hours: [null, null, null, null, null, null, '8:00 AM – 11:00 AM'],
    services: ['Fresh produce', 'Seedlings in spring'],
    languages: ['English', 'Spanish', 'Portuguese'],
    stepFree: true, transit: '11 bus · Van Buren St',
  },
]

export const LISTINGS: Listing[] = [
  { id: 'l1', provider: 'cfbnj', name: 'Fresh Produce Box', category: 'produce',
    desc: 'Seasonal mix of vegetables and fruit — carrots, greens, apples, potatoes and more.',
    qtyLeft: 18, qtyTotal: 24, unit: 'box', diet: ['Vegetarian', 'Vegan'], waitlist: 6 },
  { id: 'l2', provider: 'harvest', name: 'Artisan Bread & Bakery', category: 'bakery',
    desc: 'Day-end loaves, rolls and pastries rescued from neighborhood bakeries.',
    qtyLeft: 24, qtyTotal: 30, unit: 'bag', diet: ['Vegetarian'], waitlist: 3 },
  { id: 'l3', provider: 'cfbnj', name: 'Pantry Staples Kit', category: 'pantry',
    desc: 'Rice, pasta, canned beans, peanut butter and cooking oil — a week of essentials.',
    qtyLeft: 40, qtyTotal: 48, unit: 'kit', diet: ['Vegetarian', 'Halal'], waitlist: 2 },
  { id: 'l4', provider: 'graceful', name: 'Ready Meals — Family', category: 'prepared',
    desc: 'Four freshly prepared, ready-to-heat dinners for a family of four.',
    qtyLeft: 9, qtyTotal: 20, unit: 'pack', diet: ['Halal'], waitlist: 11 },
  { id: 'l5', provider: 'sprout', name: 'Fruit & Veg Bundle', category: 'produce',
    desc: 'A generous bundle of in-season fruit and vegetables from the mobile market.',
    qtyLeft: 15, qtyTotal: 20, unit: 'bundle', diet: ['Vegan', 'Gluten-free'], waitlist: 0 },
  { id: 'l6', provider: 'harvest', name: 'Dairy & Eggs Pack', category: 'dairy',
    desc: 'Milk, eggs, yogurt and cheese — refrigerated essentials for the week.',
    qtyLeft: 12, qtyTotal: 24, unit: 'pack', diet: ['Vegetarian'], waitlist: 4 },
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

/* Documentary food photography, Pexels licence: free for commercial use, no
   attribution required. Named for what they actually show. */
export const PHOTO = {
  produceCrate:   `${BASE}photos/produce-crate.jpeg`,
  breadLoaves:    `${BASE}photos/bread-loaves.jpeg`,
  pantryJars:     `${BASE}photos/pantry-jars.jpeg`,
  preparedMeals:  `${BASE}photos/prepared-meals.jpeg`,
  marketStall:    `${BASE}photos/market-stall.jpeg`,
  dairyEggs:      `${BASE}photos/dairy-eggs.jpeg`,
  communityTable: `${BASE}photos/community-table.jpeg`,
  crateWarehouse: `${BASE}photos/crate-warehouse.jpeg`,
  peppersApples:  `${BASE}photos/peppers-apples.jpeg`,
  springOnions:   `${BASE}photos/spring-onions.jpeg`,
}

const LISTING_PHOTOS: Record<string, string> = {
  l1: PHOTO.produceCrate,   // Fresh Produce Box
  l2: PHOTO.breadLoaves,    // Artisan Bread & Bakery
  l3: PHOTO.pantryJars,     // Pantry Staples Kit
  l4: PHOTO.preparedMeals,  // Ready Meals — Family
  l5: PHOTO.marketStall,    // Fruit & Veg Bundle
  l6: PHOTO.dairyEggs,      // Dairy & Eggs Pack
}

export const listingPhoto = (l?: Listing | null) => (l && LISTING_PHOTOS[l.id]) || PHOTO.produceCrate

export const listingGallery = (l?: Listing | null) => {
  const main = listingPhoto(l)
  const pool = [PHOTO.marketStall, PHOTO.peppersApples, PHOTO.springOnions, PHOTO.breadLoaves, PHOTO.produceCrate]
  return [main, ...pool.filter((p) => p !== main).slice(0, 2)]
}

export const provider = (id: string) => PROVIDERS.find((p) => p.id === id)!
export const listing = (id: string) => LISTINGS.find((l) => l.id === id)!
export const stageIndex = (key: string) => ORDER_STAGES.findIndex((s) => s.key === key)

/** "box" pluralises to "boxes", not "boxs" — the units are author-entered, so guard it */
export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** The prototype has no clock to be wrong about, so "today" is fixed. */
export const TODAY = 3

export const PROVIDER_KINDS = ['Food Bank', 'Community Pantry', 'Mobile Market', 'Meal Program', 'Soup Kitchen'] as const

export const plural = (n: number, unit: string) =>
  n === 1 ? unit : unit + (/(s|x|z|ch|sh)$/.test(unit) ? 'es' : 's')
