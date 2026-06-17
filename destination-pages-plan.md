# Destination Detail Pages — Implementation Plan

**GitHub Issue:** #32
**Branch:** `demo/destination-pages`

## Overview

Add per-destination pages at `/destinations/:slug` that show static facts about each celestial body alongside a live "Flights departing soon" list filtered from the existing `/flights` API.

The feature touches four areas:
1. A new static data file that holds facts per destination
2. A new page component that renders those facts + live flights
3. Route registration in the app router
4. A featured-destinations row on the homepage, plus destination links wired into flight cards

The 7 destinations in the seed data are: **Earth, Mars, Moon, Venus, Jupiter, Europa, Pluto**.

---

## Content Reference (`destinations_content.xlsx`)

All destination copy has been defined by the content team. The data below is the authoritative source — use it verbatim when populating `destinations.ts`.

### Destinations

| Slug | Display Name | Tagline | Body Type | Gravity (g) | Distance (AU) | Transit (days) | Atmosphere | Temp Min °C | Temp Max °C | Hazard Level | Hazards | Fun Fact | Emoji |
|------|-------------|---------|-----------|-------------|---------------|----------------|------------|-------------|-------------|-------------|---------|---------|-------|
| `earth` | Earth | Where it all began — and where your journey ends. | Planet | 1.0 | 0 | 0 | Nitrogen-oxygen | -88 | 58 | 1 | Weather variability | Earth is the only known body in the universe confirmed to harbour life — for now. | 🌍 |
| `moon` | Moon | One giant leap, now a two-hour commute. | Moon | 0.17 | 0.0026 | 0.17 | Negligible (exosphere) | -173 | 127 | 2 | Micrometeorites, radiation, vacuum | The Moon is slowly drifting away from Earth at roughly 3.8 cm per year. | 🌕 |
| `mars` | Mars | Red, rusty, and ready for settlers. | Planet | 0.38 | 1.52 | 8 | Thin CO2 (0.6% Earth pressure) | -125 | 20 | 3 | Dust storms, radiation, low pressure | Olympus Mons on Mars is the tallest volcano in the solar system at ~21 km. | 🔴 |
| `venus` | Venus | Glamorous from afar, scorching up close. | Planet | 0.91 | 0.72 | 5 | Dense CO2 with sulfuric acid clouds | 462 | 465 | 5 | Acid rain, extreme heat, crushing pressure | Venus rotates so slowly that a day on Venus is longer than its year. | 🟡 |
| `jupiter` | Jupiter | King of planets — bring a pressure suit. | Planet | 2.53 | 5.2 | 30 | Hydrogen and helium — no solid surface | -145 | null | 4 | Radiation belts, no solid surface, storms | Jupiter's Great Red Spot is a storm that has raged for at least 350 years. | 🟠 |
| `europa` | Europa | An ocean world hiding secrets under the ice. | Moon | 0.13 | 5.2 | 32 | Thin oxygen (trace) | -160 | -160 | 4 | Radiation, ice fissures, tidal flexing | Europa is believed to harbour a liquid water ocean beneath its icy crust — a prime candidate for extraterrestrial life. | 🧊 |
| `pluto` | Pluto | Demoted from planet, elevated to legend. | Dwarf Planet | 0.063 | 39.48 | 330 | Thin nitrogen with methane traces | -233 | -218 | 5 | Extreme cold, radiation, micro-gravity | Pluto has a heart-shaped nitrogen-ice plain called Tombaugh Regio, visible from orbit. | 💜 |

### Hazard Level Colour Mapping

| Level | Label | Description | Hex |
|-------|-------|-------------|-----|
| 1 | Safe | Standard tourist destination. No special gear needed. | `#4CAF50` |
| 2 | Low Risk | Minor hazards. Basic precautions advised. | `#8BC34A` |
| 3 | Moderate | Significant environmental hazards. Guided tours only. | `#FFC107` |
| 4 | High Risk | Dangerous conditions. Specialised suits required. | `#FF5722` |
| 5 | Extreme | Life-threatening. Research missions only. | `#D32F2F` |

---

## Sub-Tasks

---

### Sub-Task 1 — Static Destination Data

**Intent**
Create a single source of truth for destination metadata. All other sub-tasks depend on having this data available. Keeping it static (no backend call) means the page works even when no flights exist for a destination.

**Expected Outcomes**
- A new file `booking_system_frontend/src/data/destinations.ts` exists
- It exports a typed array covering all 7 seeded destinations, populated with the exact values from the content table above
- A `Destination` TypeScript interface is exported from `booking_system_frontend/src/types/index.ts` with the following shape (per Engineering Notes in the spreadsheet):

```ts
interface Destination {
  slug: string;                                    // URL key: /destinations/:slug
  display_name: string;                            // Human-readable name shown in headings
  tagline: string;                                 // Short marketing line, max ~60 chars
  body_type: 'Planet' | 'Moon' | 'Dwarf Planet';  // Badge label in the UI
  gravity_g: number;                               // Relative to Earth (1.0)
  distance_au: number;                             // Average distance from Earth in AU
  transit_days: number;                            // One-way trip duration in Earth days
  atmosphere: string;                              // Brief composition description
  surface_temp_min: number | null;                 // °C — null if no solid surface
  surface_temp_max: number | null;                 // °C — null if no solid surface
  hazard_level: 1 | 2 | 3 | 4 | 5;               // Drives badge colour
  hazards: string[];                               // Split on ', ' from spreadsheet
  fun_fact: string;                                // Single sentence for card footer
  emoji: string;                                   // Decorative only, not an accessible label
}
```

**Todo List**
1. Add the `Destination` interface above to `booking_system_frontend/src/types/index.ts`
2. Create `booking_system_frontend/src/data/destinations.ts`, export a `destinations: Destination[]` array, and populate it with all 7 rows from the content table above — use exact slugs, display names, taglines, and numeric values as specified
3. Note: `jupiter`'s `surface_temp_max` is `null` (no solid surface); `hazards` must be split from the comma-separated string into a `string[]`

**Relevant Context**
- Types live in [`booking_system_frontend/src/types/index.ts`](booking_system_frontend/src/types/index.ts)
- No `src/data/` directory exists yet — create it
- Hazard badge colours are defined in the Hazard Level Colour Mapping table above — apply them inline as a `hazardColour` helper or a lookup map in the same file

**Status:** [x] done

---

### Sub-Task 2 — `DestinationDetail` Page Component

**Intent**  
Build the page that users land on when they navigate to `/destinations/:slug`. It reads the static data for the matched destination and fetches live flights filtered by that destination name.

**Expected Outcomes**
- New file `booking_system_frontend/src/pages/DestinationDetail.tsx` renders:
  - **Hero section** — `emoji` (large, decorative), `display_name`, `tagline`, `body_type` badge
  - **Facts block** — gravity (`gravity_g`×g), distance (`distance_au` AU), transit time (`transit_days` days), atmosphere, temperature range (`surface_temp_min`/`surface_temp_max`, handle `null` with "No solid surface")
  - **Hazard banner** — coloured badge using the Hazard Level Colour Mapping (level label + description), followed by the `hazards` list
  - **Fun fact callout** — `fun_fact` string displayed in a highlighted card
  - **"Flights departing soon"** section — calls `getFlights({ destination: destination.display_name })` and renders `FlightCard` components (or a spinner / empty state)
- If the `:slug` does not match any entry in `destinations.ts`, a friendly not-found message is shown (no redirect)
- The page reuses `Card`, `Button`, `FlightCard`, `LoadingSpinner` from existing components
- Framer Motion entrance animations consistent with the rest of the app

**Todo List**
1. Create `booking_system_frontend/src/pages/DestinationDetail.tsx`
2. Use `useParams` from `react-router-dom` to read `:slug`
3. Look up the destination in `destinations.ts` by `slug`; render not-found state if missing
4. Render hero, facts, hazard banner, and fun-fact sections using `.glass-card` and existing Tailwind tokens; use the Hazard Level Colour Mapping hex values for the hazard badge colour
5. Call `getFlights({ destination: destination.display_name })` in a `useEffect`; render `FlightCard` grid with `LoadingSpinner` while loading, empty-state message when no flights found
6. Wire the "Book" button on `FlightCard` — reuse the same booking modal pattern from `Flights.tsx` (open `UserIdentification` → `BookingModal`)

**Relevant Context**
- Existing page pattern: [`booking_system_frontend/src/pages/Flights.tsx`](booking_system_frontend/src/pages/Flights.tsx)
- `getFlights` accepts `{ destination: string }` filter — no new API work needed
- Reuse: `Card`, `Button`, `LoadingSpinner` from [`booking_system_frontend/src/components/`](booking_system_frontend/src/components/)
- Reuse: `FlightCard` from [`booking_system_frontend/src/components/FlightCard.tsx`](booking_system_frontend/src/components/FlightCard.tsx)
- Animations: follow Framer Motion pattern in [`booking_system_frontend/src/pages/Home.tsx`](booking_system_frontend/src/pages/Home.tsx)
- Layout wrapper is handled by `Layout.tsx` — the page itself only needs to return its inner content

**Status:** [x] done

---

### Sub-Task 3 — Router Registration

**Intent**  
Make `/destinations/:slug` a valid route in the React Router config so the new page is reachable by URL.

**Expected Outcomes**
- Navigating to `/destinations/mars` renders `DestinationDetail`
- The existing `/*` catch-all fallback to `<Home />` still works for truly unknown routes
- No other routes are changed

**Todo List**
1. Import `DestinationDetail` in [`booking_system_frontend/src/App.tsx`](booking_system_frontend/src/App.tsx)
2. Add `<Route path="/destinations/:slug" element={<DestinationDetail />} />` before the `/*` catch-all

**Relevant Context**
- Router setup in [`booking_system_frontend/src/App.tsx`](booking_system_frontend/src/App.tsx) uses React Router v6 `<Routes>` / `<Route>`

**Status:** [x] done

---

### Sub-Task 4 — Homepage Featured-Destinations Row

**Intent**  
Give users a discovery path to destination pages directly from the homepage, matching the acceptance criterion "Destination links from the homepage work".

**Expected Outcomes**
- A new "Explore Destinations" section appears on the homepage below the existing features grid
- It renders a card per destination (7 total) arranged in a responsive grid
- Each card shows the destination name, tagline, and a "Explore" link that routes to `/destinations/:slug`
- Styled consistently with the rest of the homepage (`.glass-card`, Framer Motion, existing tokens)

**Todo List**
1. In [`booking_system_frontend/src/pages/Home.tsx`](booking_system_frontend/src/pages/Home.tsx), import `destinations` from `../data/destinations` and `Link` from `react-router-dom`
2. Add a new section after the features grid: heading "Explore Destinations", then a `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` grid of destination cards
3. Each card: destination name as heading, tagline as subtext, "Explore →" `Link` to `/destinations/${dest.slug}`
4. Wrap with Framer Motion `whileInView` animation matching the existing feature-card pattern

**Relevant Context**
- Homepage: [`booking_system_frontend/src/pages/Home.tsx`](booking_system_frontend/src/pages/Home.tsx)
- Destination data: `booking_system_frontend/src/data/destinations.ts` (created in Sub-Task 1)
- Follow the existing 4-column feature-card grid pattern for layout

**Status:** [x] done

---

### Sub-Task 5 — Destination Links on Flight Cards

**Intent**  
Complete the last acceptance criterion: "Destination links from flight cards … work". Clicking the destination name on a `FlightCard` navigates to that destination's page.

**Expected Outcomes**
- In `FlightCard`, the destination name in the route header (`{flight.origin} → {flight.destination}`) becomes a clickable `Link`
- Only the **destination** name is linked (not origin), since destination pages are what exist
- The link routes to `/destinations/${slugify(flight.destination)}` where slugify lowercases the name
- Visual treatment: subtle underline-on-hover; does not break the existing card layout

**Todo List**
1. In [`booking_system_frontend/src/components/FlightCard.tsx`](booking_system_frontend/src/components/FlightCard.tsx), import `Link` from `react-router-dom`
2. Wrap `{flight.destination}` in a `<Link to={/destinations/${flight.destination.toLowerCase()}`}>` with `hover:underline` and `hover:text-cosmic-purple` styling
3. Add `e.stopPropagation()` if needed so the link click does not trigger any parent card click handler (check if card has one — currently it does not, so likely not needed)

**Relevant Context**
- [`booking_system_frontend/src/components/FlightCard.tsx`](booking_system_frontend/src/components/FlightCard.tsx) — destination is currently plain text in the `<h3>` route header
- Slugs are just the lowercase destination name (e.g. `"Jupiter"` → `"jupiter"`) — matches the `slug` field in the data file

**Status:** [x] done

---

## Validation

After all sub-tasks are complete:
- [ ] `npm run lint` passes with no new errors (`cd booking_system_frontend && npm run lint`)
- [ ] Manually verify: navigate to `/destinations/mars`, `/destinations/europa`, `/destinations/unknown-slug`
- [ ] Verify flights section on destination page shows real data (requires backend running)
- [ ] Verify homepage featured-destinations row is present
- [ ] Verify flight card destination links route correctly
