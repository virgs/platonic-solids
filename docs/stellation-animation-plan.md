# Simpler stellation animations

The current release uses planar face extension. It is mathematically explicit,
but the overlapping sheets are difficult to follow visually. The next animation
revision should prioritize a connected exterior and choose a motion for each
pair, rather than require every intermediate face to stay in its original plane.

## Selected direction for each existing pair

| Pair | Preferred visual construction |
| --- | --- |
| Dodecahedron ↔ small stellated dodecahedron | Grow one pentagonal pyramid from each face, moving its central apex outward. |
| Dodecahedron ↔ great dodecahedron | Sculpt the exterior toward its twelve target tips and intervening indentations. |
| Dodecahedron ↔ great stellated dodecahedron | Sculpt between the twenty existing vertex directions to expose the star shape. |
| Great dodecahedron ↔ great stellated dodecahedron | Reshape the exterior between the twelve-tip and twenty-tip arrangements. |
| Icosahedron ↔ great icosahedron | Reshape the exterior toward the target triangular regions; ordinary face pyramids would produce a different polyhedron. |

The first pair has a direct physical pyramid construction. The other rows are
visual morph choices, not claims that all Kepler–Poinsot solids arise from the
same extrusion. Their exact surface correspondences still need implementation
and verification. Existing animations remain in place until replacements meet
the criteria below.

## Acceptance criteria

- Start with the small stellated dodecahedron pyramid construction.
- Render one connected exterior throughout, without loose growing sheets.
- Preserve the endpoint orientation, constant circumradius, scrubbing, and exact
  reverse playback.
- Retain the catalog's mathematical face, vertex, and edge counts. An exterior
  triangulation must not be presented as additional mathematical faces.
- Resolve the difference between a physical exterior and the full intersecting
  mathematical faces before replacing the endpoint renderer. Transparency must
  not reveal an abrupt geometry swap at the endpoint.
- Apply the same Solid opacity setting to faces, edges, and any future vertex
  markers. There are no separately rendered vertex markers at present.

Construction references:

- [Small stellated dodecahedron: pentagonal pyramid construction](https://mathworld.wolfram.com/SmallStellatedDodecahedron.html)
- [Ghent University: constructions of all four regular non-convex polyhedra](https://cage.ugent.be/~hs/polyhedra/keplerpoinsot.html)
