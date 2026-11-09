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

## Status

No application code has been started yet. The next step is to resolve the open
questions in the project documents and approve the first implementation
milestone.
