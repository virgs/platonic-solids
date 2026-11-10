# Polyhedra Explorer

An interactive guide to eleven polyhedra and their transformations: five
Platonic solids, four Kepler–Poinsot polyhedra, and two rectified solids.

[Open the explorer](https://virgs.github.io/platonic-solids/)

## Stack

React and TypeScript, Vite, Three.js through React Three Fiber and Drei,
React Bootstrap, Bootswatch Darkly, and Lucide React. Vitest covers the geometry
and data; Playwright covers Chromium and a Pixel 7 viewport. GitHub Actions
tests and deploys the static application to GitHub Pages.

Bootswatch is the sole stylesheet. Layout uses Bootstrap utilities and React
Bootstrap components. There are no authored CSS/SCSS files, CSS Modules,
CSS-in-JS, or inline page-style overrides. WebGL geometry/material settings and
SVG drawing attributes are rendering data.

## Development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```

Install the test browser with `npx playwright install chromium` if needed.

## Solids and operations

Every solid and intermediate surface has unit circumradius. Zooming moves the
camera; mouse, touch, wheel, and pinch gestures orbit and zoom the centered model.

- **Dual:** progressive corner cuts connect Platonic pairs. Polar reciprocity
  determines the Kepler–Poinsot dual endpoints; their connected exterior follows
  the corner-splitting construction.
- **Stellate / Unstellate:** dodecahedron ↔ each of its three regular stellations,
  great dodecahedron ↔ great stellated dodecahedron, and icosahedron ↔ great
  icosahedron. Twelve pentagonal pyramids grow for the small stellated
  dodecahedron. Other pairs use a direct connected exterior reshape, with
  planar patches, retained orientation, and exact reverse playback.
- **Rectify / Unrectify:** cut corners to the original edge midpoints.
  Tetrahedron → octahedron; cube and octahedron → cuboctahedron; dodecahedron and
  icosahedron → icosidodecahedron. The destination menu and map expose each
  reverse parent choice.

The cuboctahedron has 8 triangles and 6 squares. The icosidodecahedron has
20 triangles and 12 pentagons. Their summaries show face-type counts, angles,
vertex patterns, dihedral angles, and their named Catalan duals. Those duals
are outside this collection; broader Archimedean/Catalan expansion is deferred.

The catalog counts full mathematical faces, edges, and vertices. The connected
exterior used to display a star solid has extra surface patches at face
intersections; those patches do not change its catalog counts.
See [geometry sources and constructions](docs/geometry-sources.md).

## Controls

The centered player supports play, pause, direct progress scrubbing, start/end
jumps, and 1% steps. Scrubbing pauses at the chosen shape. Its clock button opens
a vertical transformation-time slider (0.5–10 seconds).

The half-filled-circle button beside the color picker always shows Solid opacity.
Its vertical slider ranges from 20% to 100% in 1% steps. Faces and edges follow
that setting; rear edges fade in with transparency. The default is 85% opacity
and Bootswatch Darkly's info blue (`#3498db`). Saved colors are preserved.
There are no separate vertex markers.

The map shows all eleven solids and fifteen reversible relationships.
Solid lines/diamonds identify duals, dashed lines/stars identify stellation,
and dash-dot lines/scissors identify rectification. All links have arrowheads
at both ends, and every listed route is playable.

“How it works” explains the current operation. Session history retains up to
30 endpoint geometry/view snapshots. All buttons and menu actions have short
native tooltips. No before/after property-comparison panel is included.

Color, opacity, transformation time, auto-rotation, the last completed solid,
camera position, and opacity-popup state are saved locally. An explicit
`?solid=<slug>` takes precedence over the saved solid. Corrupt or unavailable
storage falls back to defaults. Reloading opens the last completed solid.

## Project documents

- [Product specification](docs/product-spec.md)
- [Technical design](docs/technical-design.md)
- [Decisions and next scope](docs/decisions.md)
- [Stellation constructions](docs/stellation-animation-plan.md)
- [Transformation HUD](docs/transformation-hud.md)
