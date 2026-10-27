/* ============================================================
   Headless reel capture. `?reel=<id>` renders one reel cropped to
   the surfaces themselves — the browser window, the phone, nothing
   else — on the same white the case-study page uses, so the clip
   reads as the product rather than as a prototype on a stage.

   Nothing moves until __startReel() is called, which is what makes
   a virtual-time capture reproducible frame for frame.
   ============================================================ */
import type { View } from '../stage/scenes'

/** the design box each view lays out in, before any artboard padding */
const DESIGN: Record<View, { w: number; h: number }> = {
  split: { w: 1420, h: 900 },
  client: { w: 1280, h: 820 },
  driver: { w: 424, h: 896 },
}

/** Room for the frames' drop shadows, and — on the landscape artboards — for
    the narration line beneath. A phone reel runs at 270px on the case-study
    page, where any caption inside the clip would be unreadable, so it gets the
    device alone and the page's own caption does the narrating. */
const PAD_X = 30
const PAD_TOP = 26
const padBottom = (view: View) => (view === 'driver' ? 30 : 50)

export const hasCaption = (view: View) => view !== 'driver'

export interface ReelShot {
  view: View
  w: number
  h: number
}

/** Every reel stays on one surface for its whole run, so the artboard can be
    fixed before the first step has set the view. */
const REEL_VIEW: Record<string, View> = {
  reserve: 'client',
  filters: 'client',
  handoff: 'split',
  driver: 'driver',
  portal: 'driver',
}

export const REEL_SHOTS: Record<string, ReelShot> = Object.fromEntries(
  Object.entries(REEL_VIEW).map(([id, view]) => [
    id,
    { view, w: DESIGN[view].w + PAD_X * 2, h: DESIGN[view].h + PAD_TOP + padBottom(view) },
  ]),
)

/* ?cover renders the 16:10 plate the portfolio uses as this project's
   thumbnail: both surfaces, nothing else. */
export const COVER = new URLSearchParams(location.search).has('cover')
export const COVER_SIZE = { w: 1000, h: 625 }
if (COVER) document.documentElement.dataset.cover = '1'

export const REEL_ID = new URLSearchParams(location.search).get('reel')
export const REEL_SHOT = REEL_ID ? REEL_SHOTS[REEL_ID] : undefined
if (REEL_SHOT) document.documentElement.dataset.reel = '1'

declare global {
  interface Window {
    __startReel?: () => void
    __reelDone?: boolean
    __reelReady?: boolean
    __preloadImages?: () => Promise<number>
  }
}
