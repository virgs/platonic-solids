# Transformation-first HUD

The main task is discovering and understanding relationships between solids.
The public title is Polyhedra Explorer; the repository and Pages path remain
`platonic-solids`.

## Current collection and actions

The grouped selector contains five Platonic solids, four Kepler–Poinsot
polyhedra, and two rectified solids. The summary follows the completed endpoint.
Property rows and the title reserve consistent line slots across all solids,
including mixed face descriptions and long dual names, so changing the solid
does not resize the summary. These slots use Bootstrap utilities only.

Cuboctahedron and icosidodecahedron summaries include their mixed face counts,
per-face angles, vertex configuration, dihedral angle, and named Catalan dual.
The Catalan duals are outside the rendered collection, so these two entries
expose their unrectification paths rather than an unavailable Dual action.

Rectify cuts corners to edge midpoints. Its menu also exposes reverse choices,
including both parents for each newly added solid. Tetrahedron ↔ octahedron is
included. Every operation is disabled while playing or held between endpoints.

Dual and Stellate/Unstellate retain their destination labels. The simple
stellation constructions use a connected exterior; the information dialog
explains the distinction between mathematical faces and visible patches.

## Player and view controls

- Camera actions remain centered: zoom out, zoom in, gap, auto-rotate, reset view,
  color picker, and Solid opacity.
- The color picker uses the primary button background.
- The half-filled-circle button always displays the opacity percentage.
  Its vertical popup adjusts faces and edges from 20% to 100% in 1% steps.
- Rear edges use a separate depth mask and opacity × transparency, avoiding
  their abrupt appearance immediately below 100%.
- The player has start/end jumps, 1% steps, play/pause, and progress scrubbing.
- The clock beside Play opens the vertical 0.5–10-second duration control.
- The info button pauses playback and explains the current operation.
- Session history retains up to 30 endpoint geometry and camera snapshots.
- All buttons, menu actions, modal close controls, and map nodes have tooltips.
- Layout uses only Bootswatch/Bootstrap components and utilities.

## Transformation map

All eleven nodes and fifteen links are shown. Selecting a node inspects its
solid; the route list starts an operation to an explicit destination.

- Dual: solid line and diamond.
- Stellation: dashed line and star.
- Rectification: dash-dot line and scissors.

Color is supplemental. Every link has arrowheads at both ends. The nodes form
two planar groups, with no crossing links. All operation symbols are Lucide SVG
icons rather than emoji characters. The map dialog expands on smaller screens,
and the native solid selector and route list provide a readable mobile fallback.

## Scope

The user excluded the before/after property-comparison panel. Status badges,
generic midpoint links, and endpoint-unlock messages remain removed.

The broader Archimedean/Catalan collection, face tracking, and shareable scene
state remain future work. The two rectified intermediates and the simpler
stellation animations are implemented.
