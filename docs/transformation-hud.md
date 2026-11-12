# Transformation-first HUD

The main task is discovering and understanding relationships between solids.
The public title is Polyhedra Explorer; the repository and Pages path remain
`platonic-solids`.

## Current collection and actions

The title picker contains five Platonic solids, four Kepler–Poinsot
polyhedra, and seven Archimedean solids (two rectified and five truncated), plus their seven
Catalan duals. The summary follows the completed endpoint.
Property rows and the title reserve consistent line slots across all solids,
including mixed face descriptions and long dual names, so changing the solid
does not resize the summary. These slots use Bootstrap utilities only.

Cuboctahedron and icosidodecahedron summaries include their mixed face counts,
per-face angles, vertex configuration, dihedral angle, and named Catalan dual.
Every Archimedean entry exposes its playable Catalan Dual, and Catalan entries
expose the inverse. Catalan summaries derive counts, face angles, dihedral
angles, and vertex incidence from the actual polar model.

Rectify cuts corners to edge midpoints. Its menu also exposes reverse choices,
including both parents for each newly added solid. Tetrahedron ↔ octahedron is
included. Every operation is disabled while playing or held between endpoints.

Dual and Stellate/Unstellate use short operation labels; menus and the player
name their destinations. Star duals now reshape one connected exterior through
stable planar regions, without the old moving-sheet projection. The information
dialog explains this visual motion separately from the exact polar endpoint.
Stellation retains its direct surfaces or explicit pentagonal pyramids.

The Faces, Edges, and Vertices counts toggle one highlight mode at a time.
Adjacent mathematical faces use distinct colors; edges thicken and vertex
markers identify actual catalog elements. Star intersections and tessellation
seams do not create extra markers. Active counts use a pressed state. Highlights
clear on playback or scrubbing and counts disable between endpoints. The last
highlight mode is saved locally along with the other display preferences.

Truncate stops the corner cuts at the uniform-edge endpoint; Untruncate restores
the exact parent and orientation. Its five paths connect every Platonic solid to its corresponding uniform
truncation. Every truncated solid also exposes Rectify to continue its existing
cuts to the edge midpoints. The rectified destination menu includes both
original and truncated parents. Unavailable stellation
buttons are hidden to keep the mobile operation row compact. The truncated
summaries list both dihedral angles, with face-pair detail in the tooltip;
all solids reserve two dihedral value lines to prevent layout shifts.

## Player and view controls

- View controls occupy the far left of one toolbar; transformations occupy
  the far right. Both groups share the same small-button height.
- View controls retain zoom out, zoom in, color, and Solid opacity at every
  screen size. Auto-rotate and Reset view always live in the navbar menu.
- The color picker is a palette button with the primary background and the
  native color input, including keyboard activation.
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

Summary count buttons use Bootstrap padding in both their active and inactive
states, preserving layout while highlighting. The compact summary uses an info
icon to reveal extra properties and a close icon to collapse them.

The current title doubles as the solid picker, with a chevron and a React
Bootstrap menu. Standard headers group its items by family, and the active item
identifies the selected solid. Internal scrolling in a menu half the viewport
height keeps all 23 entries reachable without growing the HUD.
The title retains heading semantics, and Escape/selection restores focus.
The family caption and symbol share the line above it. Reserved title slots
and property slots keep the summary height stable across selections.

The far-right navbar hamburger opens Map, History, and a GitHub link using
the same menu styling, separated by a divider, with the current version badge.
It also contains Auto-rotate and Reset view at every screen size. Navigation
closes before opening a dialog and restores focus to the menu trigger afterward.

Below 992px the toolbar buttons show icons only, with accessible names and
tooltips. Opacity and duration retain their values. View tools and all four
available transformations fit a single row even at 320px and 100% opacity.
Destination arrows appear only when there is more than one choice. Desktop
retains the operation text and full property summary. Popups use fixed
positioning so the compact header does not clip their contents.

The canvas takes the remaining height. Its projection keeps the base field of
view on the shorter dimension, preventing a tall portrait canvas from cropping
the default unit-radius solid. Zoom continues to change camera distance, and
resizing does not overwrite the saved camera position. All layout uses only
Bootswatch/Bootstrap components and utilities.

## Transformation map

All twenty-three nodes and thirty-two links are shown. Selecting a node inspects its
solid; the route list starts an operation to an explicit destination.

- Dual: solid line and diamond.
- Stellation: dashed line and star.
- Rectification: dash-dot line and scissors.
- Truncation: short dashes and a blade icon.

Color is supplemental. Every link has arrowheads at both ends. The nodes form
two planar groups, with no crossing links. All operation symbols are Lucide SVG
icons rather than emoji characters. Each node includes a text family label
and a corresponding border color. The legend, selected-family badge, and
family-grouped inspection menu make classification explicit on every viewport.
The graph uses the full dialog width, with inspection/actions beneath it. The map dialog expands on smaller screens,
and the native solid selector and route list provide a readable mobile fallback.

## Scope

The user excluded the before/after property-comparison panel. Status badges,
generic midpoint links, and endpoint-unlock messages remain removed.

The broader Archimedean/Catalan collection, face tracking, and shareable scene
state remain future work. The two rectified solids, five uniform truncations, seven Catalan duals,
continuation routes, count-based highlighting, and simpler stellation animations
are implemented. Highlight tracking during playback remains deferred.
