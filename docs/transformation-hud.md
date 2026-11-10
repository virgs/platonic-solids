# Transformation-first HUD

The primary task is discovering and understanding relationships between solids.
Solid properties support that task rather than dominating the interface.

## Implemented clarity improvements

- Enabled actions use filled buttons and name the destination.
- Unsupported stellation reads “No regular stellation”.
- Status badges and the general “choose a transformation” / unlock messages
  were removed at the user's request. Endpoints are named directly on the player.
- Playing progress does not report 100% before the endpoint is reached.
- The stage fills remaining viewport space using Bootstrap utilities.
- All nine completed dual endpoints have browser coverage for action availability.

## Implemented exploration controls

1. **Relationship map:** a dialog shows all nine solids, with distinct dual and
   stellation edges, the current node, and the player route. Selecting a node
   inspects it; its available route list starts transformations. A native solid
   selector also makes the map usable on small screens and by keyboard.
2. **Stellation destination menu:** the dodecahedron has multiple regular star
   stellations. Replace its single preferred route with explicit destination
   choices. Implemented routes are selectable; the two missing D12 paths are
   explicitly marked Planned and disabled until their animations exist.
3. **Geometric explanation:** the player's information button pauses playback
   and opens a short description of the current operation and progress region.
4. **Player milestones:** named endpoints, start/end jumps, and 1% forward/back
   steps support teaching. The cuboctahedron is marked at 50% on the cube-origin
   path and 75% on the octahedron-origin path, matching the actual corner cuts.
5. **Route history:** up to 30 session stops retain the reached geometry and
   camera view. Back/forward and direct selection restore these snapshots;
   browser tests compare the rendered canvas before and after restoration.
6. **Compact display settings:** opacity is collapsible under Display, and that
   preference is persisted. Camera controls stay centered, with the color picker
   immediately after Reset view, as explicitly requested. Actions have a separate
   full-width row so destination names stay on one line.

The user explicitly excluded the proposed before/after property comparison.
No such panel is implemented.

## Current route inventory

All dual relationships are implemented, including the tetrahedron's self-dual
path. Reversible stellation paths currently implemented are:

- Dodecahedron ↔ small stellated dodecahedron
- Icosahedron ↔ great icosahedron
- Great dodecahedron ↔ great stellated dodecahedron

The direct dodecahedron → great dodecahedron and dodecahedron → great stellated
dodecahedron animations are still missing. The map shows these as planned,
not as mathematical impossibilities. See [the dodecahedron stellation family](https://mathworld.wolfram.com/DodecahedronStellations.html).
