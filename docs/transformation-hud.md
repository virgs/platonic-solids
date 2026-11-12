# Transformation-first HUD

The main task is discovering and understanding relationships between solids.
The public title is Polyhedra Explorer; the repository and Pages path remain
`platonic-solids`.

## Current collection and actions

The grouped selector contains five Platonic solids, four Kepler–Poinsot
polyhedra, and five Archimedean solids: two rectified and three truncated. The summary follows the completed endpoint.
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

The Faces, Edges, and Vertices counts toggle one highlight mode at a time.
Adjacent mathematical faces use distinct colors; edges thicken and vertex
markers identify actual catalog elements. Star intersections and tessellation
seams do not create extra markers. Active counts use a pressed state. Highlights
clear on playback or scrubbing and counts disable between endpoints. The last
highlight mode is saved locally along with the other display preferences.

Truncate stops the corner cuts at the uniform-edge endpoint; Untruncate restores
the exact parent and orientation. Its three paths connect tetrahedron, cube,
and octahedron to their corresponding truncated solids. Unavailable stellation
buttons are hidden to keep the mobile operation row compact. The truncated
summaries list both dihedral angles, with face-pair detail in the tooltip;
all solids reserve two dihedral value lines to prevent layout shifts.

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

## Mobile layout

Below the large-screen breakpoint, the summary shows Faces, Edges, and Vertices.
A chevron button reveals or collapses the remaining properties; the reserved
line slots remain consistent while switching solids in either mode. The solid
picker, map, history, camera actions, and GitHub link use icons with accessible
names and tooltips. Opacity and duration continue showing their current values.
Camera controls occupy a centered row beneath the picker/map/history row.
Transformation buttons show only the operation icon and name; destination
choices and player endpoint labels retain the solid names. Desktop controls
retain their text labels and full property summary. The GitHub link uses a
filled success color at every size.

## Transformation map

All fourteen nodes and eighteen links are shown. Selecting a node inspects its
solid; the route list starts an operation to an explicit destination.

- Dual: solid line and diamond.
- Stellation: dashed line and star.
- Rectification: dash-dot line and scissors.
- Truncation: short dashes and a blade icon.

Color is supplemental. Every link has arrowheads at both ends. The nodes form
two planar groups, with no crossing links. All operation symbols are Lucide SVG
icons rather than emoji characters. The map dialog expands on smaller screens,
and the native solid selector and route list provide a readable mobile fallback.

## Scope

The user excluded the before/after property-comparison panel. Status badges,
generic midpoint links, and endpoint-unlock messages remain removed.

The broader Archimedean/Catalan collection, face tracking, and shareable scene
state remain future work. The two rectified solids, three uniform truncations, count-based highlighting,
and simpler stellation animations are implemented.
