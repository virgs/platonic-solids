# Decisions and next scope

## Accepted product direction

- Public name: Polyhedra Explorer.
- Repository and GitHub Pages path remain `platonic-solids`.
- Static educational application; no accounts, backend, or database.
- Current collection: five Platonic, four Kepler–Poinsot, seven Archimedean
  solids (two rectified, five truncated), and seven Catalan duals.
- Transformation-first experience: Dual, Stellate/Unstellate, Rectify/Unrectify, Truncate/Untruncate,
  a scrub-capable player, a relationship map, and geometry-preserving history.
- Every displayed model and intermediate surface has the same circumradius.
- Orbit and zoom move the camera; panning is disabled and rotation defaults off.
- Mathematical counts are independent of surface-mesh subdivisions.
- Every included Archimedean solid has its rendered Catalan dual. Remaining
  Archimedean/Catalan pairs are future scope.
- Catalan models use polar reciprocity, congruent nonregular faces, and varying
  vertex radii. Global circumradius remains normalized to one.
- The map labels all four families in text; color is supplemental.

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

## Layout decisions

- The solid title is the sole picker, with a bounded React Bootstrap menu grouped by family.
- Navbar hamburger: Map, History, GitHub, and release version. Auto-rotate and
  Reset view live there at every screen size.
- View controls align left and transformations align right on one row.
- All toolbar buttons share the small height; phone transformation text is
  hidden while opacity/duration values stay visible.
- Only operations with multiple destinations get a destination arrow.
- Portrait projection fits the shorter canvas dimension without changing
  the saved camera position or the solids' common circumradius.

## Animation decisions

The small stellated dodecahedron uses growing pentagonal pyramids. Great
dodecahedron ↔ great stellated dodecahedron unfolds twenty triangular dimples
into pyramids. The other stellation pairs use a connected exterior reshape. This replaces literal plane
extension, whose overlapping sheets were difficult to follow.

Both star-dual pairs use the same direct planar exterior morph as the simple
stellations. Reprojecting a moving self-intersecting construction is excluded:
its changing outer sheets caused spurious folds and a boiling appearance.
Compact symmetry meshes retain the required ridges with 60, 120, or 240
triangles. Icosahedral vertex, face-center, edge-midpoint, and golden-section
directions replace the dense global angular arrangement. Mathematical endpoint
models remain independent of these display subdivisions.

The mathematical endpoints remain exact to numerical tolerance. The information
dialog describes the chosen motion and separates visible patches from full
mathematical faces. Forward and reverse controls preserve endpoint orientation.

Rectification moves edge points to their midpoints. Both parents of each new
rectified solid are explicit destinations.

Uniform truncation cuts to equal endpoint edges, before rectification. The
exact parent is retained for reverse playback. Uniform truncated shapes can
continue to their rectified endpoints, with explicit reverse destination choices. Count-based highlights identify
mathematical elements at endpoints and clear on playback/scrubbing.

## Completion follow-ups

The current catalog has 23 solids and all 32 mapped relationships implemented.
Motion handling still needs reduced-motion preference support and explicit
pausing when the tab is hidden. The player currently measures elapsed frame
time, so resuming a backgrounded tab can jump playback forward.

## Future discussion

- Broader Archimedean and Catalan catalogs and additional operations.
- Face/vertex tracking through transformations.
- Shareable URLs containing route, progress, appearance, and camera state.
- Export formats and further educational detail.
- Source-code licensing before outside contributions.
