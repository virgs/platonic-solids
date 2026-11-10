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
   choices. All listed destinations are now selectable, including the two-stage
   and three-stage D12 routes with named intermediate checkpoints.
3. **Geometric explanation:** The info button in the player toolbar pauses playback
   and opens a short description of the current operation and progress region.
4. **Player checkpoints:** named endpoints, start/end jumps, and 1% forward/back
   steps support teaching. Only named intermediate solids on multi-step routes
   have checkpoint links; the generic midpoint link has been removed.
5. **Route history:** up to 30 session stops retain the reached geometry and
   camera view. Back/forward and direct selection restore these snapshots;
   browser tests compare the rendered canvas before and after restoration.
6. **Compact display settings:** opacity is collapsible from its button beside the color picker, and that
   preference is persisted. Camera controls stay centered, with the color picker
   immediately after Reset view, as explicitly requested. Actions have a separate
   centered full-width row so destination names stay on one line.

The clock button beside Play opens a vertical SVG timing slider from 0.5 to 10 seconds. It supports
mouse, touch, and keyboard interaction without a project-authored stylesheet.
Map links have arrowheads at both ends. Solid lines with diamonds identify duals;
dashed lines with stars identify stellation; dotted lines identify
composed routes. Stage counts remain in route descriptions rather than on the
map links. Color is an additional cue only.

The user explicitly excluded the proposed before/after property comparison.
No such panel is implemented.

## Current route inventory

All dual relationships are implemented, including the tetrahedron's self-dual
path. Reversible stellation paths currently implemented are:

- Dodecahedron ↔ small stellated dodecahedron
- Icosahedron ↔ great icosahedron
- Great dodecahedron ↔ great stellated dodecahedron

The additional D12 destinations are implemented as continuous staged routes:
dodecahedron → small stellated dodecahedron → great dodecahedron, with a further
stellation stage for the great stellated dodecahedron. Adjacent stages share
exact geometry. These are composed routes, not a claim that every stage is a
single face-extension operation. See [the dodecahedron stellation family](https://mathworld.wolfram.com/DodecahedronStellations.html).
