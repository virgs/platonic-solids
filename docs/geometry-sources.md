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

The truncated catalog uses the following definitions and metrics:

- [Truncated tetrahedron](https://dmccooey.com/polyhedra/TruncatedTetrahedron.html)
- [Truncated cube](https://dmccooey.com/polyhedra/TruncatedCube.html)
- [Truncated octahedron](https://dmccooey.com/polyhedra/TruncatedOctahedron.html)
- [Truncated dodecahedron](https://dmccooey.com/polyhedra/TruncatedDodecahedron.html)
- [Truncated icosahedron](https://dmccooey.com/polyhedra/TruncatedIcosahedron.html)

MathWorld also describes the uniform shapes and their duals:
[truncated tetrahedron](https://mathworld.wolfram.com/TruncatedTetrahedron.html),
[truncated cube](https://mathworld.wolfram.com/TruncatedCube.html),
[truncated octahedron](https://mathworld.wolfram.com/TruncatedOctahedron.html).
The rendered Catalan models are polar reciprocals of those seven Archimedean
models. Counts and dihedral angles are independently tested against McCooey:

| Model | Faces | Edges | Vertices | Dihedral |
| --- | --- | --- | --- | --- |
| [Rhombic dodecahedron](https://dmccooey.com/polyhedra/RhombicDodecahedron.html) | 12 | 24 | 14 | 120° |
| [Rhombic triacontahedron](https://dmccooey.com/polyhedra/RhombicTriacontahedron.html) | 30 | 60 | 32 | 144° |
| [Triakis tetrahedron](https://dmccooey.com/polyhedra/TriakisTetrahedron.html) | 12 | 18 | 8 | 129.52° |
| [Triakis octahedron](https://dmccooey.com/polyhedra/TriakisOctahedron.html) | 24 | 36 | 14 | 147.35° |
| [Tetrakis hexahedron](https://dmccooey.com/polyhedra/TetrakisHexahedron.html) | 24 | 36 | 14 | 143.13° |
| [Triakis icosahedron](https://dmccooey.com/polyhedra/TriakisIcosahedron.html) | 60 | 90 | 32 | 160.61° |
| [Pentakis dodecahedron](https://dmccooey.com/polyhedra/PentakisDodecahedron.html) | 60 | 90 | 32 | 156.72° |

Catalan vertex radii and some edge lengths vary. Their actual polar geometry is
normalized globally, never vertex-by-vertex. Face angle sets, vertex incidence,
and dihedral angles are computed from those coordinates. Face congruence is
verified without incorrectly requiring equilateral triangles.

## Uniform truncation and element highlights

Truncation shares the closed corner-cut construction with rectification, but
stops before the midpoints. For an original face with p sides and edge length L,
the retained original edge is (1 − 2t)L; the new corner edge is
2t cos(π/p)L. Equating these gives t = 1 / (2 + 2 cos(π/p)). Thus tetrahedron, octahedron, and icosahedron use 1/3; cube uses
1/(2 + √2), and dodecahedron uses 1/(2 + 2 cos(π/5)). Every frame is normalized uniformly.
The target retains its parent geometry for an exact inverse, including direct
selection, history restoration, and chaining after a dual operation.

Highlighting uses mathematical polygon tessellation with a nonzero winding
rule and distinct neighboring-face colors. Edge tubes and vertex markers come
from the catalog topology, not the connected star exterior subdivisions.
Both visible and hidden highlight passes respect solid opacity. Highlights
are intentionally limited to endpoints; in-flight subdivision counts are not
presented as catalog counts.

Tests verify closed surfaces, planarity, regular endpoint faces, equal edges,
computed dihedral angles, unit circumradius, endpoint continuity, and an exact
oriented reverse for all five truncations.

Each truncated endpoint continues to its parent's rectification by advancing
the same directed-edge cut fraction from the uniform value to 1/2. Reversal
stops at the uniform truncated solid. The original parent is retained; if
provenance is unavailable or stale, its orientation is recovered from corner
face centers before reconstructing the convex parent.

Archimedean/Catalan dual animations use one vertex per source vertex/face flag,
interpolating from the original corner to its polar face vertex. Source face
regions, target face regions, and edge quadrilaterals form a closed convex
boundary throughout. All seven pairs are tested for planarity, convexity,
constant circumradius, and pointwise agreement with reversed playback. The
original endpoint geometry/provenance is retained for exact chaining back into
truncation or rectification.

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
Shared boundary vertices are welded, while each cell keeps its own interior
triangulation point. This prevents thin cells from losing faces when their
centers nearly coincide with boundary vertices.

## Duality

Platonic duals retain their progressive corner-clipping animation. Star duals
use polar reciprocity for exact mathematical endpoints, then interpolate the
endpoint exteriors directly through stable planar regions. This uses the same
reciprocal-radius construction as the simple surface stellations. Every ray
has a fixed endpoint correspondence, and reverse playback reuses the identical
path and original endpoint geometry.

The previous star-dual animation projected a moving self-intersecting flag
construction onto an angular mesh. Changing outermost sheets introduced sharp
folds along thousands of subdivision edges that should have stayed planar,
producing a boiling appearance. Both star-dual pairs and both directions now
use the direct exterior path. The mathematical duals, endpoint orientation,
and common circumradius are unchanged.

The transformation audit covers all 32 relationships by construction family:
Platonic corner clipping, Archimedean/Catalan convex flag duality, truncation
and rectification cuts, explicit pyramids, and direct star-surface morphs. Only
the two star-dual pairs used the moving-sheet projection. The same audit found
thin-cell cracks in dodecahedron → great dodecahedron and dodecahedron → great
stellated dodecahedron; retaining separate cell centers repairs them.

libtess applies the nonzero winding rule when computing full mathematical
face regions, so pentagram centers are filled once. Exterior surface patches
are drawn separately from those mathematical face definitions.

## Verification and references

Tests check mathematical endpoint counts, equal endpoint edge lengths,
unit circumradius, closed exterior topology, Euler characteristic, outward
faces, finite tessellation, endpoint plane membership, continuity of visible
area and ridges, rotated starting geometry, and exact reverse samples.
Every star-dual and stellation route is checked in both directions: hidden
subdivision edges remain planar throughout, radial ratios have no repeated
reversals after cancelling uniform normalization, and every sampled surface
is closed with Euler characteristic two.

Browser coverage includes all five rectification sources, both reverse parents
of directly selected rectified solids, all five stellation pairs, route-map
actions, mixed-face summaries, persistent selection, history restoration,
and the 100%/99%/95% opacity transition.

- [Ghent University: constructions of the four regular non-convex polyhedra](https://cage.ugent.be/~hs/polyhedra/keplerpoinsot.html)
- [Small stellated dodecahedron: pyramid construction](https://mathworld.wolfram.com/SmallStellatedDodecahedron.html)
- [The icosidodecahedron](https://arxiv.org/abs/2309.15774)
