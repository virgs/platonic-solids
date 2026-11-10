# Platonic Solids Explorer

An interactive, browser-based guide to the five Platonic solids and the four
Kepler–Poinsot polyhedra.

The project is currently in its **definition phase**. The product scope,
technical direction, and open design questions are documented before feature
implementation begins.

## Project documents

- [Product specification](docs/product-spec.md)
- [Technical design](docs/technical-design.md)
- [Decisions and open questions](docs/decisions.md)

## Proposed stack

- React and TypeScript
- Vite
- Three.js through React Three Fiber and Drei
- React Bootstrap with a Bootswatch theme
- Lucide React icons
- Vitest, React Testing Library, and Playwright
- GitHub Actions and GitHub Pages

The application will contain no authored stylesheet. Bootswatch will be the
sole CSS theme, and layout will use React Bootstrap components and Bootstrap
utilities. There will be no project CSS/SCSS files, CSS Modules, CSS-in-JS, or
component style overrides. WebGL material and scene configuration is geometry
and rendering data, not page CSS.

## Development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm test
npm run build
```

## Status

All five Platonic solids and four Kepler–Poinsot polyhedra can be inspected at
the same circumradius. Platonic dual transformations use progressive corner
cuts, with a configurable duration of 0.5–10 seconds. Both Kepler–Poinsot dual
pairs are animated. All five stellation paths use direct face extension:
dodecahedron ↔ each of its three regular stellations, great dodecahedron ↔ great
stellated dodecahedron, and icosahedron ↔ great icosahedron. Original face regions
grow within their planes toward the target intersections, without dualization
stages. All routes listed in the map are playable in both directions.

The centered transformation player supports play, pause, and direct progress
scrubbing. Dragging progress pauses playback and preserves the intermediate
surface. Face opacity defaults to 85% and can be adjusted from 20% to 100%.

The Map dialog shows all nine solids with arrowheads at both ends of reversible
links. Solid lines/diamonds identify duals, dashed lines/stars identify
stellations. Select a node to inspect it, then choose a route. The player has
named endpoints, 1% steps, and a clock button that opens a vertical timing slider. “How it
works”, in the player toolbar, opens an explanation. Session history
stores up to 30 endpoint geometry/view snapshots, so retracing a route preserves
the reached orientation. The half-filled circle beside the color picker opens a vertical opacity slider; its open state
is remembered. No before/after property-comparison panel is included.

The color picker changes face color. Color, opacity, transformation time,
auto-rotation, the last completed solid, and the camera position (including zoom
and orbit angle) are saved in local storage. An explicit solid in the URL takes
precedence over the saved selection. Corrupt or unavailable storage falls back
to defaults without interrupting the viewer. Reloading returns to the last
completed solid rather than resuming an intermediate transformation.

Star models use explicit face definitions; see [geometry sources](docs/geometry-sources.md).
