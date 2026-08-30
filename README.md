# EcoBites — frontend shell prototype

A standalone, backend-free build of the EcoBites food-relief concept, made to be
**driven, recorded and screenshotted for a case study**.

Imported from the Claude Design project *EcoBites* (`53d19d47-ef25-4fe8-8919-8329204628bb`,
`EcoBites - Prototype.html`) and rebuilt as React + Vite + TypeScript.

```bash
npm install
npm run dev     # http://localhost:5184
```

## What it is

Two surfaces on one order:

| Surface | What it is | Screens |
|---|---|---|
| **Client website** | desktop web, in browser chrome | landing · home · browse · detail · checkout · confirmation · tracking |
| **Driver app** | iPhone-sized, in a device frame | sign-in · open routes · route details · item check · proof of drop · complete · impact |

They share one store (`src/lib/store.tsx`). A delivery placed on the website appears
as an open route on the phone; the driver's progress moves the client's tracking
timeline. That handoff is the argument the case study is making, so the default
stage shows both at once.

## The stage

Everything around the product is case-study chrome, and all of it can be hidden.

- **Scene rail** (left) — every screen worth putting in a deck, grouped by surface.
  Picking a scene fabricates exactly as much order history as that screen needs.
- **Design controls** (right) — primary, accent, display face, corner radius and
  photography on/off. Each writes a CSS custom property that both surfaces read.
- **Reel bar** (bottom) — five autoplay reels. A synthetic pointer clicks real
  `data-demo` targets, so a recording is the product, not a video of a video.

| Reel | Runs |
|---|---|
| Reserve a box | client website, landing → confirmation |
| **Order → route** | both surfaces, one order — the thesis reel |
| Driver run | driver app, sign-in → impact |
| Find what fits | narrowing past what exists, and widening back |
| Pickup instead | the other fork — no driver, a shorter timeline |
| When nothing's there | empty states on both surfaces |
| One system | retheming both surfaces from the token panel |

A reel drives the real UI by clicking `data-demo` targets, so **any component that
sits between a target and the page has to keep a stable identity**. Declaring a
component inside another component's body (the `FilterGroup` / `MethodCard`
mistake) makes React rebuild the subtree on every render, and the runner ends up
clicking a detached node — the reel looks like it is playing while nothing
happens. The runner now re-queries each target immediately before clicking and
warns when one is missing, but keep components at module scope.

### Keys

| Key | |
|---|---|
| `←` `→` | step through scenes |
| `1` `2` `3` | split / client / driver |
| `C` | record mode — hides the rail and panel |
| `R` | reset demo data |
| `Esc` | stop a running reel |

## Capturing for the deck

- **Video** — press `C`, play a reel, screen-record. The chrome is gone and the
  reel bar fades out while it plays.
- **Stills** — `?shot=<sceneId>` renders one surface alone, unchromed, at its
  natural size (1280×820 for the website, 402×874 for the phone) with the order
  history already built:

  ```
  http://localhost:5184/?shot=track
  http://localhost:5184/?shot=dPickup
  ```

  Scene ids are in `src/stage/scenes.ts`. Add `&plate=1` to a driver scene to get
  the phone on a 16:10 field instead of a bare screen — the shape a slide or a
  landscape figure frame wants:

  ```
  http://localhost:5184/?shot=dRoutes&plate=1
  ```

## Layout

```
src/
  lib/        data · store · theme tokens · nav types
  components/ Icon · Mascot (SVG) · ui primitives · PhoneFrame · BrowserFrame
  client/     the website
  driver/     the phone app
  stage/      scene rail · design controls · reel bar · toasts · scene index
  demo/       reels · runner · synthetic cursor
```

## Notes on what changed from the design file

- **No backend, no localStorage.** State is in memory and resets on reload, so
  every recording starts from the same place.
- **The mascot is drawn, not a PNG** — an SVG burger that re-colours with the
  brand tokens like everything else does.
- Photography is the ten Cosmos stills from the design project, in `public/photos/`.
- Routing was lifted out of each app so the rail and the reels can drive both
  surfaces the way a person would.
- The driver's route list carries one **ambient** route alongside the demo order,
  so "available routes" reads as a marketplace rather than an announcement. The
  demo flows never touch it.
- Out-for-delivery is a full-bleed map with the ETA floating over it, and the map
  has a portrait variant — the original's 320x200 artwork sliced into a phone-shaped
  hole zoomed so far that the route stopped reading as a route.

## Where the stills are used

The EcoBites case study on my portfolio renders its screen plates straight from
`?shot=` — 920x720 for the website, 402x874 for the phone — so they never drift
from the prototype. Re-run the capture whenever a screen changes.
