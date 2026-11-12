# Polyhedra Explorer

An interactive guide to twenty-three polyhedra and their transformations: five
Platonic solids, four Kepler–Poinsot polyhedra, and seven Archimedean solids (two rectified and five truncated),
and their seven Catalan duals.

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
  determines the Kepler–Poinsot dual endpoints; their connected exteriors
  reshape directly through stable planar regions, without switching between
  moving self-intersecting sheets. Archimedean ↔ Catalan pairs use polar
  dual endpoints and a closed convex corner/face/edge construction, with exact
  reverse playback and no internal sheets.
- **Stellate / Unstellate:** dodecahedron ↔ each of its three regular stellations,
  great dodecahedron ↔ great stellated dodecahedron, and icosahedron ↔ great
  icosahedron. Twelve pentagonal pyramids grow for the small stellated
  dodecahedron. Other pairs use a direct connected exterior reshape, with
  planar patches, retained orientation, and exact reverse playback.
- **Rectify / Unrectify:** cut corners to the original edge midpoints.
  Tetrahedron → octahedron; cube and octahedron → cuboctahedron; dodecahedron and
  icosahedron → icosidodecahedron. The destination menu and map expose each
  reverse parent choice. Each uniform truncated solid can also continue its
  existing cuts to the rectified endpoint, then reverse to the truncated shape.
- **Truncate / Untruncate:** all five Platonic solids connect to their
  uniform truncated solids. The cut stops when all endpoint edges have equal
  length, before reaching their midpoints. Reverse playback restores the parent
  without an orientation jump.

The Archimedean group includes cuboctahedron, icosidodecahedron, and the five
uniform truncations of Platonic solids, including the football-shaped truncated
icosahedron. Every one has a selectable, playable Catalan dual: rhombic
dodecahedron, rhombic triacontahedron, triakis tetrahedron, triakis octahedron,
tetrakis hexahedron, triakis icosahedron, and pentakis dodecahedron.

All summaries include counts, face types and angles, vertex incidence, dihedral
angles, and duals. Catalan metrics come from the actual polar geometry; their
faces are congruent but not necessarily regular, and their vertices can have
different radii. The maximum radius stays one for every model.

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
Tap Faces, Edges, or Vertices in the summary to toggle element highlighting.
Faces use distinct colors for adjacent mathematical faces; edges thicken and
vertices gain markers. Markers and highlighted edges follow solid opacity.
Tap the active count to clear; starting or scrubbing a transformation clears
highlighting. Star crossings are never counted or marked as extra vertices.

The current solid title is also its picker: click it to open the grouped
catalog, using themed React Bootstrap menu items and family headers. The navbar hamburger contains Map, History, and GitHub with the
release version, plus Auto-rotate and Reset view at every screen size.

View tools sit left and transformations sit right on a single row, using the
same button height. Smaller screens show icons, with opacity and duration
values retained. Destination arrows appear only when there are alternatives.
The summary starts with padded Faces, Edges, and Vertices buttons; its info button reveals the
rest. Every control retains an accessible name and tooltip. The canvas uses
the remaining height and keeps the default model uncropped on portrait screens;
zoom and the saved camera distance remain under user control.

The map shows all twenty-three solids and thirty-two reversible relationships.
Solid lines/diamonds identify duals, dashed lines/stars identify stellation,
dash-dot lines/scissors identify rectification, and short dashes/blade icons
identify truncation. All links have arrowheads
at both ends, and every listed route is playable. Each node names its family
(Platonic, Kepler–Poinsot, Archimedean, or Catalan); family badges and grouped
inspection options provide the same information without relying on color.

“How it works” explains the current operation. Session history retains up to
30 endpoint geometry/view snapshots. All buttons and menu actions have short
native tooltips. No before/after property-comparison panel is included.

Color, opacity, transformation time, auto-rotation, the last completed solid,
camera position, element highlight mode, and opacity-popup state are saved locally. An explicit
`?solid=<slug>` takes precedence over the saved solid. Corrupt or unavailable
storage falls back to defaults. Reloading opens the last completed solid.

## Project documents

- [Product specification](docs/product-spec.md)
- [Technical design](docs/technical-design.md)
- [Decisions and next scope](docs/decisions.md)
- [Stellation constructions](docs/stellation-animation-plan.md)
- [Transformation HUD](docs/transformation-hud.md)
