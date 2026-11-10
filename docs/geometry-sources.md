# Geometry sources and constructions

## Mathematical catalog

Kepler–Poinsot vertex coordinates and ordered mathematical faces follow
David McCooey's definitions:

- [Small stellated dodecahedron](https://dmccooey.com/polyhedra/SmallStellatedDodecahedron.txt)
- [Great dodecahedron](https://dmccooey.com/polyhedra/GreatDodecahedron.txt)
- [Great stellated dodecahedron](https://dmccooey.com/polyhedra/GreatStellatedDodecahedron.txt)
- [Great icosahedron](https://dmccooey.com/polyhedra/GreatIcosahedron.txt)

Coordinates are normalized to unit circumradius. Counts refer to whole
mathematical pentagrams, pentagons, or triangles. Crossings and display-mesh
subdivisions do not add catalog vertices, edges, or faces.

Star dihedral angles follow McCooey: small stellated dodecahedron
116.565051177°, great dodecahedron and great stellated dodecahedron
63.434948823°, and great icosahedron 41.810314896°. The HUD rounds to two decimals.

The mixed-face catalog and metrics also follow McCooey:

- [Cuboctahedron](https://dmccooey.com/polyhedra/Cuboctahedron.html):
  12 vertices, 24 edges, 8 equilateral triangles, 6 squares;
  dihedral angle 125.264389683°; dual rhombic dodecahedron.
- [Icosidodecahedron](https://dmccooey.com/polyhedra/Icosidodecahedron.html):
  30 vertices, 60 edges, 20 equilateral triangles, 12 regular pentagons;
  dihedral angle 142.622631859°; dual rhombic triacontahedron.

Only the two rectified solids are added in this release. Their Catalan duals
are named but not added as rendered catalog entries.

## Rectification

For each original edge, two directed points move from its endpoints toward
its midpoint. Original face polygons retain their perimeter sections, and a
new polygon closes each clipped corner. At completion, coincident midpoint
vertices are welded. The resulting surface is closed throughout.

The operation supports all five Platonic sources:

- Tetrahedron → octahedron
- Cube or octahedron → cuboctahedron
- Dodecahedron or icosahedron → icosidodecahedron

Every sample is uniformly normalized to unit circumradius. Reverse playback
retraces the cut exactly. A rectified endpoint retains its original parent
geometry. When an intermediate solid is selected directly, its parent vertices
are reconstructed from the appropriate face centers; a convex hull recovers
the parent faces. The destination menu makes the two parent choices explicit.

## Connected stellation surfaces

Exact mathematical endpoints still use the reviewed pentagram, triangular,
and polar-dual constructions. These determine endpoint geometry only.

Dodecahedron ↔ small stellated dodecahedron grows twelve pentagonal pyramids:
each original face center moves outward to its apex while the original edge
boundary stays attached. Uniform normalization maintains the common radius.

The other four pairs reshape one closed exterior. An angular arrangement
splits directions at projected face boundaries and face-depth intersections.
The furthest face intersection gives each endpoint's exterior radius.
Interpolating reciprocal radius keeps cells that share endpoint planes on a
common moving plane, avoiding a faceted subdivision grid. Intermediate shapes
are visual surface morphs; they are not claimed to be regular polyhedra or
literal fixed-plane stellations.

Only the source and destination ridge networks are drawn during reshaping,
with a continuous opacity blend. Subdivision lines are hidden. Newly forming
pyramid ridges fade according to their crease angle.

Completed star solids consistently display the same cached exterior when
another operation starts or history restores them. Their full mathematical
definitions remain separate for catalog properties and subsequent operations.
The reverse constructor retains the original surface path when available.

## Duality

Platonic duals retain their progressive corner-clipping animation. Star duals
use polar reciprocity to obtain exact endpoints, then split incident
vertex/face corners while connecting edge quadrilaterals keep the construction
joined. The renderer samples that construction's exterior on a shared angular
mesh. Intermediate sampling is a visualization; completed mathematical
endpoints and their orientation are retained.

libtess applies the nonzero winding rule when computing full mathematical
face regions, so pentagram centers are filled once. Exterior surface patches
are drawn separately from those mathematical face definitions.

## Verification and references

Tests check mathematical endpoint counts, equal endpoint edge lengths,
unit circumradius, closed exterior topology, Euler characteristic, outward
faces, finite tessellation, endpoint plane membership, continuity of visible
area and ridges, rotated starting geometry, and exact reverse samples.

Browser coverage includes all five rectification sources, both reverse parents
of directly selected rectified solids, all five stellation pairs, route-map
actions, mixed-face summaries, persistent selection, history restoration,
and the 100%/99%/95% opacity transition.

- [Ghent University: constructions of the four regular non-convex polyhedra](https://cage.ugent.be/~hs/polyhedra/keplerpoinsot.html)
- [Small stellated dodecahedron: pyramid construction](https://mathworld.wolfram.com/SmallStellatedDodecahedron.html)
- [The icosidodecahedron](https://arxiv.org/abs/2309.15774)
