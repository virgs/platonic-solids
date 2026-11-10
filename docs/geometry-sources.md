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
dihedral angles follow McCooey's definitions: small stellated dodecahedron
116.565051177°, great dodecahedron and great stellated dodecahedron
63.434948823°, and great icosahedron 41.810314896°. The HUD rounds to two
decimal places. Source metric pages:

- [Small stellated dodecahedron](https://dmccooey.com/polyhedra/SmallStellatedDodecahedron.html)
- [Great dodecahedron](https://dmccooey.com/polyhedra/GreatDodecahedron.html)
- [Great stellated dodecahedron](https://dmccooey.com/polyhedra/GreatStellatedDodecahedron.html)
- [Great icosahedron](https://dmccooey.com/polyhedra/GreatIcosahedron.html)

Convex corner clipping is restricted to Platonic solids. Star duals use polar
reciprocation to construct their endpoints, then split each incident vertex-face
pair into a moving corner. Original faces shrink, vertex faces open, and edge
quadrilaterals keep the surface connected. The endpoints have the reviewed
regular face and edge counts. Self-intersecting faces are tessellated with
libtess using the nonzero winding rule, filling pentagram centers once.

## Direct face-extension animation

All five stellation paths animate growing face regions in their original planes:
dodecahedron ↔ each of its three regular stellations, great dodecahedron ↔ great
stellated dodecahedron, and icosahedron ↔ great icosahedron.

The exact endpoint coordinates are constructed using the existing pentagram,
polar-dual, and triangular constructions. Those operations determine geometry
only; no dualization stage is played within a stellation animation. Each target
face is matched to a source face by its outward plane normal, then uniformly
rescaled into that source plane before animation.

At the start, each face region is bounded by its original convex polygon.
The polygon's edge bounds expand within the plane, revealing the target contour
until its intersections are reached. Sutherland–Hodgman clipping preserves the
target's contour winding; libtess fills the nonzero-winding region, including
pentagram centers. There is one face region per original plane throughout.
The construction can pass through open or self-intersecting configurations;
intermediate shapes are not claimed to be regular closed polyhedra.

A uniform scale at every sample preserves unit circumradius, so face planes
keep their directions while their offsets scale together. Reverse playback
retracts the exact same face regions. Completed endpoint geometry is retained
when another operation starts, preserving orientation across chained actions.

Tests cover all five paths, including rotated sources, coplanarity, a common
plane-offset scale, unit radius, finite tessellation, exact endpoint counts and
edge lengths, continuous rendered area and edge positions at both endpoints, and matching forward
and reverse samples. Browser tests exercise all five routes on desktop and
mobile, including progress scrubbing and reverse playback.

Construction references:

- [MathWorld: stellation](https://mathworld.wolfram.com/Stellation.html)
- [MathWorld: dodecahedron stellations](https://mathworld.wolfram.com/DodecahedronStellations.html)
- [MathWorld: icosahedron stellations](https://mathworld.wolfram.com/IcosahedronStellations.html)
- [Ghent University: the four regular non-convex polyhedra](https://cage.ugent.be/~hs/polyhedra/keplerpoinsot.html)
