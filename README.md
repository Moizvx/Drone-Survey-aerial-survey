# Aerial Survey Flight — mission planning & mine analysis

A browser workspace for drone (UAV) aerial survey over an open-pit mine: plan a
LiDAR / photogrammetry mission, then analyse the resulting surface — terrain and
road profiles, cut-and-fill volumetrics, epoch-to-epoch volume comparison,
drill-hole stratigraphy, and live fleet positioning.

React 18 · Vite 5 · Tailwind CSS 3. No backend, no map tiles, no API keys.

![Terrain Profile Analysis](docs/terrain-profile.jpg)

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:5178
```

```bash
pnpm build        # production bundle -> dist/
pnpm preview      # serve the built bundle
pnpm verify       # geometry + flight-path checks (15 assertions)
pnpm bundle       # single-file preview build -> .preview/
```

## The two halves

### Mission console

The original planner: draw a survey area on the map, then tune the mission.

- Draw / measure tools with free, 90° and 45° snapping
- LiDAR parameter panel: swath width, line spacing, ground sampling interval,
  point density, emission frequency, side / forward overlap, FOV
- Project editor: task list, device parameters, waypoint list entry, datum
  elevation, minimum turning radius, expansion / buffer distance
- Generated flight grid with numbered waypoints, and simulation of the flight
  (clock, airspeed, ground speed, altitude, link distance)
- Live statistics: flight distance, survey area, image count, estimated time

### Analysis workspace

An **Analysis** tab holding six "Operation Records" modules. Each keeps its own
saved records, reports everything live as you edit, and lets you drag its
geometry directly on the map.

| Module | Deep link | Reports |
| --- | --- | --- |
| Terrain Profile Analysis | `#Analysis/terrain-profile` | Elevation along a section, over dipping 15 m / 16 m reference layers |
| Road Profile Analysis | `#Analysis/road-profile` | Road length, average / max / min slope, cumulative gentle / moderate / steep lengths |
| Cut-and-Fill Analysis | `#Analysis/cut-and-fill` | Fill and excavation volume, footprint and area against a design elevation |
| Volume Comparison | `#Analysis/volume-comparison` | Excavation / unchanged / fill volume and area between two survey epochs |
| Drill-Hole Stratigraphy | `#Analysis/drill-holes` | Collar plan, 15-band stratigraphic column, collar and current-position elevation |
| Fleet & Personnel Positioning | `#Analysis/fleet` | Shift production, online equipment, parking-area groups, live unit markers |

Every view is deep-linkable through the URL hash, so a module can be shared as a
link: `#Analysis/cut-and-fill`.

Things worth trying: drag the red endpoints to move a section line, drag the
polygon vertices to reshape a cut-and-fill footprint, scroll to zoom the map,
hover the elevation chart to walk a live marker along the section.

## Why there is no map data

There are no tiles and no external services. `src/lib/terrain.js` generates the
quarry procedurally — noise, nested pit shells, bench terracing, haul roads,
stockpiles, flooding, plant buildings — and renders it to an orthophoto by
hill-shading the elevation grid it just built.

The important consequence: **one heightfield drives both the picture and the
numbers**. Profiles, cut-and-fill volumes and drill-hole collars are all sampled
from the same grid that produced the raster, so a read-out always agrees with
the imagery underneath it. The previous survey epoch is modelled as a
material-removal delta over the current surface, which is what makes the volume
comparison show a genuinely untouched region rather than "everything changed".

The map frame is **474 × 266 m** at `1 m = 3.53 px`, matching the planner's
`SCALE.pxPerM` in `src/lib/geometry.js`.

## Project layout

```
src/
  App.jsx                  mission console (planner + flight execution)
  analysis/
    index.js               module registry
    AnalysisWorkspace.jsx  shell: module rail, record form, map, chart dock
    terrainProfile.jsx     ┐
    roadProfile.jsx        │ one descriptor per module: default fields,
    cutAndFill.jsx         │ analyze(), plus its Panel / Overlay / Dock parts
    volumeComparison.jsx   │
    drillHoles.jsx         │
    fleet.jsx              ┘
    shared.jsx             draggable map handles, section line
  components/
    AnalysisMap.jsx        cover-fitted map stage, GIS chrome, mask layers
    AnalysisUI.jsx         record-form primitives
    ElevationProfileChart.jsx
    DistributionPies.jsx
    StratigraphyColumn.jsx
    Icons.jsx
  lib/
    terrain.js             procedural quarry + heightfield + survey epochs
    elevation.js           profiles, slope classes, cut-and-fill, volume comparison
    masks.js               per-pixel region masks (fill / excavation, change heat-map)
    drillholes.js          15-layer stratigraphy, 27-hole collar database
    equipment.js           fleet and personnel data
    geometry.js            shared geometry + the px/metre scale
    flightPath.js          flight-grid generation and sensor maths
    placeholderMap.js      fallback terrain raster
    geo.js                 map-frame pixel -> lat/lon
scripts/
  verify-geometry.mjs      15 geometry / flight-path assertions
  build-preview.mjs        single-file preview bundle
  preview-entry.jsx        entry for that bundle
  check-identifiers.mjs    static undefined-identifier check (see Known issues)
```

### Adding a module

A module is one descriptor object — `defaultFields`, `analyze(fields, terrains)`,
and any of `Panel`, `Overlay`, `Dock`, `Cards`, `masks`, `splitView`. Register it
in `src/analysis/index.js` and it appears in the rail, gets records, a map layer
and (optionally) a chart dock. See `terrainProfile.jsx` for the smallest complete
example.

## Known issues

- `pnpm check:ids` reports false positives. `scripts/check-identifiers.mjs`
  strips string literals before it tries to match `import … from '<module>'`, so
  imports are never collected, and it has no awareness of JSX text or attributes.
  It needs a real parser to be useful. The site is unaffected; `pnpm verify` is
  the meaningful check and passes.
- `src/lib/placeholderMap.js` is only used as a fallback when no orthophoto is
  available.

## Notes

Everything is client-side and deterministic: a fixed seed produces the same site
on every load, so screenshots and reported figures are reproducible.
