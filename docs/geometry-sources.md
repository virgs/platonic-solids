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

Convex corner clipping is restricted to Platonic solids. The star models can be
selected and inspected; their dual and stellation animations require their own
construction and are not enabled yet.
