# Transformation-first HUD proposal

The primary task is discovering and understanding relationships between solids.
Solid properties support that task rather than dominating the interface.

## Implemented clarity improvements

- Enabled actions use filled buttons and name the destination.
- Unsupported stellation reads “No regular stellation”.
- Ready, Playing, Paused, and Complete are explicit states.
- The route and operation remain visible after completion, including direction
  when reversing a path.
- Playing progress does not report 100% before the endpoint is reached.
- The stage fills remaining viewport space using Bootstrap utilities.
- All nine completed dual endpoints have browser coverage for action availability.

## Recommended next improvements

1. **Relationship map:** show all nine solids, with distinct dual and stellation
   edges. Highlight the current node and traversed edge. Distinguish implemented
   routes from planned routes; selecting a destination starts an available path.
2. **Stellation destination menu:** the dodecahedron has multiple regular star
   stellations. Replace its single preferred route with explicit destination
   choices once the extra animations are implemented.
3. **Source/target comparison:** display vertex, edge, and face counts as
   `8 → 6`, `12 → 12`, and `6 → 8` for cube to octahedron. Keep endpoint facts
   distinct from the intermediate mesh, whose regular-solid properties do not
   apply.
4. **Geometric explanation:** a short operation-specific caption, such as
   “Corners split; original edges collapse” or “Face regions extend within
   their planes”, synchronized with meaningful stages of playback.
5. **Player milestones:** label both ends with solid names, mark the midpoint
   where informative, and add step-back/step-forward controls for teaching.
6. **Route history:** let users retrace their exploration while preserving
   geometry orientation and camera view.
7. **Compact display settings:** group color, opacity, auto-rotation, and camera
   controls in a collapsible display panel, particularly on mobile, so the map,
   player, and solid receive most of the available space.

## Current route inventory

All dual relationships are implemented, including the tetrahedron's self-dual
path. Reversible stellation paths currently implemented are:

- Dodecahedron ↔ small stellated dodecahedron
- Icosahedron ↔ great icosahedron
- Great dodecahedron ↔ great stellated dodecahedron

The direct dodecahedron → great dodecahedron and dodecahedron → great stellated
dodecahedron animations are still missing. The map should show these as planned,
not as mathematical impossibilities. See [the dodecahedron stellation family](https://mathworld.wolfram.com/DodecahedronStellations.html).
