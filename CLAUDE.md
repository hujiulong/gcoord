# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trip Planner is a web frontend for planning and viewing trips on a map. Users can input trip itineraries (as free-form text or structured markdown), have locations extracted via LLM or manual parsing, geocode them via Tianditu API, and visualize waypoints on a Tianditu map. The app also supports importing GPS track data from Garmin FIT binary files, Google Earth KML, and GPX format.

The project is built on top of **gcoord**, a geographic coordinate transformation library that handles conversions between WGS84, GCJ02 (Amap), BD09 (Baidu), BD09MC, and EPSG3857.

## Development Commands

```bash
npm install                          # Install dependencies
npm run build                        # Build gcoord library (required before webui)
npm run webui                        # Start Express dev server on port 3000 (nodemon auto-reload)
npm run test                         # Run all tests with coverage (Jest + ts-jest)
npm run test -- GCJ02                # Run tests matching a pattern
npm run lint                         # ESLint check
npm run format                       # Prettier auto-format TypeScript
```

**To develop the Trip Planner:** `npm run build && npm run webui`, then open `http://localhost:3000/trip-planner.html`

The coordinate converter tool is at `http://localhost:3000/` (index.html).

## Architecture

### Web UI (src/webui/)

**`server.js`** — Minimal Express server. Serves static files from `public/` and the built gcoord library from `dist/`. No API endpoints; all logic is client-side.

**`public/trip-planner.html`** — Three-panel layout (left sidebar: tree view, center: map, right sidebar: editor with tabs for Input Plan / Markdown / Settings).

**`public/trip-planner.js`** — Main application (~1334 lines, vanilla JS IIFE). Key sections:

| Section | Purpose |
|---|---|
| Configuration & State | `CONFIG` (map center, marker colors, geocode API URL), `state` (map instance, markers array, tripData, settings) |
| Settings Management | Load/save to `localStorage`, applies Tianditu API key and LLM provider config |
| Map Functions | Dynamic Tianditu API loading, marker management with SVG icons, `fitBounds()`, visibility toggling |
| Geocoding | `geocodeLocation()` calls Tianditu geocoder API, `geocodeAllLocations()` batch-processes with 200ms rate limiting |
| LLM Integration | `extractLocationsWithLLM()` sends trip text to OpenAI-compatible endpoint (e.g. LiteLLM proxy), returns structured JSON. Falls back to `extractLocationsManually()` (regex-based) |
| Tree View | Renders trip as nested day→location tree with checkboxes for marker visibility, click-to-pan |
| Markdown | `generateMarkdown()` and `parseMarkdown()` for round-trip serialization. Coordinates embedded as `*(lon, lat)*` |
| File Operations | Save as `.md` download, load `.md` files with auto-geocoding for locations missing coordinates |

**`public/trip-planner.css`** — CSS variables, dark mode via `prefers-color-scheme`, responsive breakpoints at 1024px and 768px, collapsible sidebars.

**`public/index.html` + `main.js`** — Separate coordinate converter tool (WGS84→GCJ02/BD09) with SRT file upload for GPS track polygons. Uses both Tianditu and Amap.

**`public/map-key.js`** — Dynamically loads Tianditu and Amap script tags (gitignored, contains API keys).

### Trip Data Model

```
tripData = {
  title: string,
  days: [{
    title: string,
    date: string | null,
    locations: [{
      name: string,           // Chinese name for geocoding (e.g. "沈阳故宫,沈阳")
      datetime: string,
      description: string,
      coordinates: [lon, lat] | null,
      geocodeError: boolean
    }]
  }]
}
```

### Markdown Format

The app reads and writes a specific markdown format for trip persistence:
- `# Title` — trip title
- `## 第N天 - Description` — day header
- `*Date: YYYY-MM-DD*` — optional date
- `**时间** - 地点,城市 *(lon, lat)*` — location with time
- `- 地点,城市 *(lon, lat)*` — location without time
- Indented lines after a location are treated as description

Coordinates are optional in markdown. When loading, locations with coordinates skip geocoding; locations without get geocoded via Tianditu.

### GPS Track Data Support

**Garmin FIT** — The `fit-javascript-sdk/` directory contains the Garmin FIT JavaScript SDK (v21.194.0). `@garmin/fitsdk` is listed as a dependency. The SDK provides `Decoder`, `Encoder`, `Stream`, and `Profile` classes for reading/writing FIT binary files. Sample FIT files are in `test/Activities/`.

**SRT (DJI drone tracks)** — `src/srt_process.ts` parses SRT subtitle files containing GPS coordinates (`[latitude: X] [longitude: Y] [altitude: Z]`). Exported as `gcoord.parseSrtLocus()`.

**KML and GPX** — Target import formats for waypoint data (Google Earth KML and GPS Exchange Format).

### Coordinate Transformation Library (src/)

**`transform.ts`** — `transform(input, fromCRS, toCRS)` accepts `[lng, lat]` arrays, GeoJSON objects, or JSON strings. Mutates GeoJSON in-place.

**`src/crs/`** — Each CRS module defines transformation functions. Complex routes use `compose()` from `helper.ts`:
- `GCJ02.ts` — Most complex; polynomial transforms with `isInChinaBbox()` guard, iterative inverse
- `BD09MC.ts` — Piecewise polynomial lookup tables across 6 latitude bands
- Routes: e.g. WGS84→BD09 = compose(GCJ02→BD09, WGS84→GCJ02)

**`helper.ts`** — `coordEach()` recursively traverses GeoJSON geometries; `compose()` for function chaining; type validators.

### Build System

Rollup produces 6 bundles from the gcoord library: ESM-bundler, ESM-browser, CJS, and IIFE (dev+prod each). The trip planner HTML loads `dist/gcoord.global.prod.js` as a `<script>` tag exposing the global `gcoord` object.

### External APIs

- **Tianditu Geocoder** — `https://api.tianditu.gov.cn/geocoder?ds={keyWord}&tk={apiKey}`. Location names must be in Chinese for best results.
- **Tianditu Map** — `https://api.tianditu.gov.cn/api?v=4.0&tk={key}` loads `window.T` (map, markers, controls).
- **LLM (OpenAI-compatible)** — Defaults to `http://localhost:4000/v1/chat/completions` (LiteLLM proxy). Configurable in Settings tab.

### LLM Setup

The trip planner uses LiteLLM as a proxy to any LLM backend. See `src/webui/TRIP_PLANNER.md` for full setup:
1. `pip install litellm[proxy]`
2. Create `litellm_config.yaml` mapping model names to backends (e.g. Gemini)
3. `litellm --config litellm_config.yaml --port 4000`
4. Configure URL and model in Settings tab, test with Ping button

## Code Style

- TypeScript strict mode for library code; vanilla JS for frontend
- Semicolons, single quotes, 80-char width (Prettier)
- Pre-commit hooks via yorkie: lint-staged runs ESLint + Prettier
- `@typescript-eslint/no-explicit-any` is disabled
