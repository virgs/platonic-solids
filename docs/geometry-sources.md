# Kepler–Poinsot geometry

Vertex coordinates and ordered face indices follow David McCooey's mathematical
polyhedron definitions:

- [Small stellated dodecahedron](https://dmccooey.com/polyhedra/SmallStellatedDodecahedron.txt)
- [Great dodecahedron](https://dmccooey.com/polyhedra/GreatDodecahedron.txt)
- [Great stellated dodecahedron](https://dmccooey.com/polyhedra/GreatStellatedDodecahedron.txt)
- [Great icosahedron](https://dmccooey.com/polyhedra/GreatIcosahedron.txt)

The coordinates are normalized to unit circumradius. The face counts refer to
whole mathematical pentagrams, pentagons, or triangles. Crossings do not create
additional vertices or edges in the catalog.

Pentagram faces are filled as five tips and a central pentagon. This avoids
overlapping triangles within each face and fills the central region once.
Line segments use the original face boundaries rather than inferred mesh
creases, preserving edges through intersections. All faces are two-sided.

The tests check counts, coplanarity, shared edges, and unit circumradius. Star
dihedral angles remain explicitly unlisted pending a separate content review.

Convex corner clipping is restricted to Platonic solids. Star duals use polar
reciprocation to construct their endpoints, then split each incident vertex-face
pair into a moving corner. Original faces shrink, vertex faces open, and edge
quadrilaterals keep the surface connected. The endpoints have the reviewed
regular face and edge counts. Self-intersecting faces are tessellated with
libtess using the nonzero winding rule, filling pentagram centers once.

Pentagonal stellation extends each face's edges into a pentagram, retaining its
central pentagon and opening five tips. The supported reversible paths are
dodecahedron ↔ small stellated dodecahedron and great dodecahedron ↔ great
stellated dodecahedron. The geometry at an endpoint is retained when a different
operation starts, preserving its orientation across chained transformations.

Construction reference: [Ghent University: the four regular non-convex polyhedra](https://cage.ugent.be/~hs/polyhedra/keplerpoinsot.html).
