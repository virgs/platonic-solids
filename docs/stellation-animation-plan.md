# Simpler stellation animations

Initial implementation in v0.12.0; compact meshes and triangular dimples in v0.17.0. The animations prioritize a single connected exterior
and use a construction suited to each pair.

| Pair | Visual construction |
| --- | --- |
| Dodecahedron ↔ small stellated dodecahedron | Grow twelve pentagonal pyramids, moving each face center into its tip. |
| Dodecahedron ↔ great dodecahedron | Reshape the exterior toward the target tips and indentations. |
| Dodecahedron ↔ great stellated dodecahedron | Reshape between the twenty existing vertex directions to expose the star exterior. |
| Great dodecahedron ↔ great stellated dodecahedron | Unfold twenty triangular dimples through the icosahedral framework into pyramids. |
| Icosahedron ↔ great icosahedron | Reshape the exterior toward the target triangular regions. |

The small stellated pair grows pentagonal pyramids; the great-dodecahedron
pair unfolds triangular dimples into pyramids. The remaining pairs use connected
surface morphs with planar patches. Their compact symmetry meshes use 120 or
240 triangles; the explicit pyramid paths use 60. They are not presented as the
same extrusion or as literal face-plane extension during every intermediate
frame. Exact mathematical endpoint definitions determine the finished solids.

## Completed requirements

- One closed exterior, without loose growing face sheets.
- Constant circumradius, retained endpoint orientation, scrubbing, and reverse playback.
- Exact reuse of the previous path when reversing its retained endpoint.
- Mathematical counts remain separate from the displayed surface patches.
- A consistent exterior at completed star endpoints and history restores.
- Source and target ridge networks blend; the subdivision grid stays hidden.
- Solid opacity controls faces and ridges together, with gradual rear-edge visibility.

See [geometry sources](geometry-sources.md) for the constructions, numerical
conventions, and verification.

- [Small stellated dodecahedron: pentagonal pyramid construction](https://mathworld.wolfram.com/SmallStellatedDodecahedron.html)
- [Ghent University: the four regular non-convex polyhedra](https://cage.ugent.be/~hs/polyhedra/keplerpoinsot.html)
