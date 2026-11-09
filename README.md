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
cuts, with a configurable duration of 0.5–6 seconds. Star-polyhedron dual and
stellation animations are planned; their controls remain disabled until those
transformations are implemented.

Star models use explicit face definitions; see [geometry sources](docs/geometry-sources.md).
