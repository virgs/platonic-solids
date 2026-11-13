# Transformation simplicity audit

This is an investigation of alternatives, not a change to the production
animations. Counts below describe rendering geometry, not mathematical faces
or vertices in the catalog. No construction is claimed to be a proven minimum.

## Star transformations

The current exterior morph has a simple motion rule: interpolate reciprocal
distance along fixed directions, then normalize the complete surface. Its
general angular arrangement contains many subdivisions that remain coplanar
throughout playback. Those subdivisions increase mesh complexity without
representing additional visible transformation stages.

Temporary numerical prototypes found these alternatives:

| Relationship | Current intermediate triangles | Candidate triangles | Construction |
| --- | ---: | ---: | --- |
| Dodecahedron ↔ small stellated dodecahedron | 60 | 60 | Keep the existing twelve pentagonal pyramids. |
| Great dodecahedron ↔ great stellated dodecahedron | 720 | 60 | Twenty triangular dimples rise into pyramids on a shared icosahedral framework. |
| Small stellated dodecahedron ↔ great dodecahedron | 720 | 120 | A shared symmetry mesh with 62 vertices. |
| Dodecahedron ↔ great dodecahedron | 720 | 120 | The same symmetry mesh, with endpoint radii sampled from the actual models. |
| Dodecahedron ↔ great stellated dodecahedron | 720 | 120 | The same symmetry mesh. |
| Icosahedron ↔ great icosahedron | 5,520 | 240 | A 122-vertex template retaining the great icosahedron's additional ridges. |
| Great stellated dodecahedron ↔ great icosahedron | 6,840 | 240 | The same kind of compact template, aligned to the oriented endpoints. |

The 60-triangle construction uses twelve framework directions and twenty
face-center directions. Its face-center-to-framework radius ratio changes
from approximately 0.562777 to 2.383963. The dimples flatten into the
icosahedral boundary before becoming outward pyramids. A direct apex-height
interpolation would make this construction especially easy to explain;
reciprocal-radius interpolation can retain the existing sampled motion.

The broader star changes are primarily representation improvements. Reducing
the mesh alone should preserve what the user sees, rather than promising a
different-looking animation. It should reduce geometry allocation and
tessellation work, but frame-rate gains have not been benchmarked.

### Numerical evidence and limitations

- Endpoint comparisons used 1,200 deterministic spherical probe directions
  plus directions from the existing dense mesh.
- Intermediate comparisons used five or seven progress values per accepted
  candidate, including endpoint checks. Observed radial discrepancies were
  below 0.000001 of the unit circumradius.
- The compact small-star dual, pyramid path, and great-star dual prototypes
  had no open mesh edges. The great-star dual template was also aligned and
  reused successfully for the icosahedron → great icosahedron comparison.
- A universal 120-triangle replacement was rejected: the great icosahedron
  has additional ridges it misses, with sampled error near 0.20 of the unit
  circumradius.
- Naive automatic merging was also rejected as a general solution. Some
  routes produced mismatched boundary subdivisions or numerically unstable
  polygons. Explicit templates are a better implementation direction.
- These are sampled numerical results, not a proof of exact equivalence or
  global minimality. Production work still needs rotated-source, reverse,
  ridge-opacity, endpoint-continuity, and browser checks for the new code.

## Archimedean/Catalan duals

The current construction already moves every vertex/face incidence along
one straight interpolation from the source corner to its polar face vertex.
Source-face caps, target-face caps, and edge quadrilaterals keep the boundary
closed and convex. There is no staged route to eliminate.

A second prototype used one moving point per original vertex and per original
face. Original corners approach target face centroids; original face centers
approach target vertices. Their convex hull supplies the visible boundary.
This gives a face-peak/folding interpretation with fewer tracked points:

| Source | Current moving points | Candidate points | Current midpoint polygons | Candidate midpoint polygons |
| --- | ---: | ---: | ---: | ---: |
| Cuboctahedron | 48 | 26 | 50 | 48 |
| Icosidodecahedron | 120 | 62 | 122 | 120 |
| Truncated tetrahedron | 36 | 20 | 38 | 36 |
| Truncated cube | 72 | 38 | 74 | 72 |
| Truncated octahedron | 72 | 38 | 74 | 72 |
| Truncated dodecahedron | 180 | 92 | 182 | 180 |
| Truncated icosahedron | 180 | 92 | 182 | 180 |

The candidate hull sizes were sampled at 5%, 25%, 50%, 75%, and 95%.
Uniform circumradius normalization would not change these counts. The
endpoints follow from the hull containing the original corners and face
centers at the start, and the dual corners and face centroids at the end.
Forward and reverse point sets correspond by exchanging those two families.

Fewer moving points do not establish a clearer animation: the alternative
changes how faces crease and replaces the current corner-splitting visual
language with growing face peaks. Its visible polygon count is almost the
same, and it needs changing hull connectivity. Keep the current convex duals
unless a visual comparison establishes a preference for the alternative.

## Recommendation

Prioritize the explicit great-dodecahedron pyramid construction and compact
star templates. Keep the existing small-stellated pyramid animation and the
convex dual construction. Treat the face-peak convex dual as an optional
preview, not an automatic improvement.

The 31 existing tests for convex duals, star duals, stellation paths, and
surface motion passed during the audit. They validate the existing paths;
they do not substitute for tests of a future implementation of these
prototypes.

## References

The numerical comparisons use this repository's oriented endpoint models.
The following references corroborate the mathematical solids and pyramid
interpretations, rather than the prototype performance claims:

- [Ghent University: constructions of the four regular non-convex polyhedra](https://cage.ugent.be/~hs/polyhedra/keplerpoinsot.html)
- [McCooey: great stellated dodecahedron](https://dmccooey.com/polyhedra/GreatStellatedDodecahedron.html)
- [McCooey: great icosahedron](https://dmccooey.com/polyhedra/GreatIcosahedron.html)
- [McCooey: rhombic dodecahedron](https://dmccooey.com/polyhedra/RhombicDodecahedron.html)
- [McCooey: triakis tetrahedron](https://dmccooey.com/polyhedra/TriakisTetrahedron.html)
