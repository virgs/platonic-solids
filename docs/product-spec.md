# Product specification

## Public name

Polyhedra Explorer

The broader title covers the regular and Archimedean polyhedra in the collection.

## Product statement

Polyhedra Explorer is a static educational web application that lets a
visitor inspect, compare, and transform the five Platonic solids and four
Kepler–Poinsot polyhedra, plus five Archimedean solids, in an
interactive 3D scene.

It should make the relationships between these solids understandable without
requiring prior geometry knowledge, while retaining enough mathematical detail
to be useful as a reference.

## Audience

- Curious visitors exploring geometry
- Students and teachers
- Designers, artists, and developers interested in polyhedra
- Mathematics enthusiasts who want a concise visual reference

## Included solids

### Platonic solids

1. Tetrahedron
2. Cube (regular hexahedron)
3. Octahedron
4. Dodecahedron
5. Icosahedron

### Kepler–Poinsot polyhedra

1. Small stellated dodecahedron
2. Great dodecahedron
3. Great stellated dodecahedron
4. Great icosahedron

### Rectified solids

1. Cuboctahedron: rectification of the cube or octahedron
2. Icosidodecahedron: rectification of the dodecahedron or icosahedron

The Archimedean group also includes truncated tetrahedron, truncated cube,
and truncated octahedron. Their Truncate/Untruncate routes preserve orientation
and stop at regular equal-edge endpoints. The rest of the family and the
Catalan duals remain outside the current milestone. Their summaries list mixed face
types and angles, vertex configuration, and the names of their external duals.

### Rectification and simpler stellation

Rectify cuts vertices back to edge midpoints; Unrectify reverses toward the
chosen parent. Tetrahedron ↔ octahedron is also supported. All five paths are
playable from the toolbar and map.

Stellation animations use one connected exterior. Dodecahedron ↔ small stellated
dodecahedron grows/retracts pentagonal pyramids. The other pairs use direct
surface reshaping with planar patches and exact mathematical endpoints. Their
intermediate frames are visual morphs, not literal fixed-plane stellations.

### Element highlighting

Tapping the Faces, Edges, or Vertices count toggles a single highlight mode.
Faces have distinct colors across shared edges, edges are emphasized, and
vertices receive markers. Star crossings do not create extra elements.
Highlighting is available at endpoints and clears on playback or scrubbing.

## Core experience

The page opens with one solid centered in a 3D stage. A visitor can:

- Rotate/orbit the camera by dragging
- Zoom by moving the camera with the wheel, trackpad, or a two-finger pinch
- Use a one-finger drag to orbit on touch devices
- Reset the camera to a useful default view
- Select any supported solid
- Read its most important properties without leaving the page
- Follow an external link for deeper reading
- Trigger a transformation to the solid's dual
- Trigger a stellation-related transformation where one is mathematically and
  visually meaningful
- Pause, replay, or skip a transformation animation

The information panel and controls must remain understandable when animation
is disabled or unavailable.

All solids use the same circumradius: the distance from the center to the
outermost vertex. Changing solids therefore preserves a mathematically
consistent scale. Zooming changes camera distance and never changes the solid's
geometry or normalized radius. Panning is disabled so the solid remains
centered and cannot be accidentally lost outside the viewport.

## Solid information

Each solid record should support:

- Common name and alternate name
- Family: Platonic or Kepler–Poinsot
- Short description
- Schläfli symbol
- Number of vertices, edges, and faces
- Face shape or star polygon
- Number of faces meeting at each vertex
- Face interior angle
- Dihedral angle, explicitly labeled so it is not confused with face angle
- Dual solid
- Convexity and self-intersection status
- Symmetry group, as an advanced property
- Euler characteristic, with a note where star-polyhedron conventions matter
- Wikipedia or another reputable reference link

Values should be stored as structured data, not embedded in presentation
components. Exact forms and friendly approximations may both be shown when
useful.

## Transformations

### Dual transformation

The control label should be **Show dual** rather than simply **Dual**. The
animation should explain the relationship: face centers of the current solid
become vertices of the target solid, with the original and target briefly
visible together when practical.

Platonic dual pairs are:

- Tetrahedron ↔ tetrahedron
- Cube ↔ octahedron
- Dodecahedron ↔ icosahedron

Kepler–Poinsot dual pairs are:

- Small stellated dodecahedron ↔ great dodecahedron
- Great stellated dodecahedron ↔ great icosahedron

### Stellation-related transformation

The proposed label is **Stellate** in one direction and **Return to convex
form** in the other. “Star/unstar” can remain informal project language, but is
less precise as interface copy.

This must not imply that every Platonic solid has a unique Kepler–Poinsot
counterpart. The first implementation should expose only explicitly defined,
mathematically defensible mappings. The animation design and mappings require
a separate review before implementation.

## Navigation and layout

The first release is a single-page experience:

- Header with project title, theme-aware navigation, and About access
- Grouped solid selector at the upper-left of the stage, suitable for keyboard
  and small screens
- Main 3D stage
- Compact camera controls at the upper-right of the stage
- Relationship actions centered below the stage
- Property panel below the stage on desktop and mobile
- Optional explanatory text for the active transformation
- Footer with source and reference links

The active solid should be represented in the URL so a view can be bookmarked
or shared. A query parameter such as `?solid=icosahedron` avoids requiring a
client-side routing fallback on GitHub Pages.

## HUD and controls

The HUD is divided into three predictable zones so the solid remains the visual
focus.

### Solid selector

The upper-left selector displays the active solid and groups its options under
**Platonic solids** and **Kepler–Poinsot polyhedra**. A dropdown is preferred to
nine permanently visible buttons, especially on smaller screens.

### Camera controls

The upper-right camera group provides:

- **Reset view** to restore the default camera position and target
- **Auto-rotate** as an explicit on/off control
- Accessible zoom-out and zoom-in buttons where they improve keyboard and
  touch operation

Pointer, trackpad, touch, and keyboard interaction remain available even when
the equivalent visible control is not shown. Important actions use text labels;
Lucide icons support those labels rather than replacing them.

### Relationship actions

The primary relationship actions appear below the scene:

- **Show dual** changes to a return label appropriate to the original solid
- **Stellate** changes to **Return to convex form** in the reverse direction

Actions are contextual. An unavailable or mathematically undefined
transformation is hidden or disabled with a concise explanation. While a
transformation runs, conflicting controls are disabled and **Pause** and **Skip
animation** are available.

### Property panel

The property panel sits below the scene at all breakpoints. Essential facts are
immediately visible: name, Schläfli symbol, faces, edges, vertices, face type,
face angle, dihedral angle, and dual. **More details** expands the description,
symmetry group, vertex configuration, Euler-characteristic notes, convexity or
self-intersection status, and external references.

## Accessibility

- Every icon button has a visible label or accessible name and tooltip
- All selection and transformation controls are keyboard operable
- Focus remains visible using Bootstrap's standard focus treatment
- Information conveyed by color is also conveyed by text or shape
- Motion respects `prefers-reduced-motion`; transformations become immediate
  or use a minimal cross-fade
- The canvas has a useful accessible label and a nearby text equivalent
- Touch targets are comfortably sized
- Content remains usable if WebGL is unavailable

## Responsive behavior

- Desktop: the stage receives the available width and the property panel sits
  below it
- Tablet: the same hierarchy is retained with tighter spacing
- Mobile: selector, stage, camera control row, relationship actions, and
  property panel stack vertically
- Camera controls support pointer, touch, wheel, and trackpad input
- Mobile controls do not obscure the lower portion of the solid

## Out of scope for the first release

- User accounts or saved collections
- A backend or database
- Free-form geometry construction
- Arbitrary morphing between every pair of solids
- Augmented or virtual reality
- Custom shaders whose only purpose is decorative
- Any project-authored CSS or stylesheet-based customization
- Full mathematical proofs

## Success criteria for version 1

- All fourteen solids can be selected and rendered accurately
- Each solid has reviewed property data and a reference link
- Camera controls work with mouse, keyboard-supported controls, and touch
- All dual relationships with both endpoints in the catalog can be demonstrated
- Both rectified solids expose their two parent paths and mixed-face properties
- Approved stellation relationships can be demonstrated without misleading
  labels
- The page works at its GitHub Pages URL after a direct visit or refresh
- Automated checks cover data integrity, key UI interactions, and deployment
- The application is usable at common mobile and desktop sizes
