# Decisions and next scope

## Accepted product direction

- Public name: Polyhedra Explorer.
- Repository and GitHub Pages path remain `platonic-solids`.
- Static educational application; no accounts, backend, or database.
- Current collection: five Platonic, four Kepler–Poinsot, and two rectified solids.
- Transformation-first experience: Dual, Stellate/Unstellate, Rectify/Unrectify,
  a scrub-capable player, a relationship map, and geometry-preserving history.
- Every displayed model and intermediate surface has the same circumradius.
- Orbit and zoom move the camera; panning is disabled and rotation defaults off.
- Mathematical counts are independent of surface-mesh subdivisions.
- The two added solids are Archimedean, but the full family and its Catalan duals
  are deferred for a separate scope discussion.
- The Catalan dual names of the two rectified solids are shown in their properties;
  unsupported dual actions are not offered.

## Technical direction

- React, TypeScript, Vite, React Three Fiber, Three.js, and Drei.
- React Bootstrap, Bootswatch Darkly, and Lucide React.
- Bootswatch is the sole stylesheet. No authored CSS/SCSS, CSS Modules,
  CSS-in-JS, or inline DOM style overrides.
- SVG drawing attributes and WebGL configuration are rendering data.
- Geometry and mathematical definitions are separated from UI components.
- Vitest checks geometry/data; Playwright checks desktop and mobile interaction.
- GitHub Actions tests and publishes the site.
- Default solid: tetrahedron. Default color: Darkly info blue. Default opacity: 85%.
- User settings are persisted locally. Explicit solid URLs override saved selection.

## Animation decisions

The small stellated dodecahedron uses growing pentagonal pyramids. The other
stellation pairs use a connected exterior reshape. This replaces literal plane
extension, whose overlapping sheets were difficult to follow.

The mathematical endpoints remain exact to numerical tolerance. The information
dialog describes the chosen motion and separates visible patches from full
mathematical faces. Forward and reverse controls preserve endpoint orientation.

Rectification moves edge points to their midpoints. Both parents of each new
rectified solid are explicit destinations.

## Future discussion

- Broader Archimedean and Catalan catalogs and additional operations.
- Face/vertex tracking through transformations.
- Shareable URLs containing route, progress, appearance, and camera state.
- Export formats and further educational detail.
- Source-code licensing before outside contributions.
