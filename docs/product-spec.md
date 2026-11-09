# Product specification

## Working title

Platonic Solids Explorer

The title is intentionally descriptive and can be replaced before the first
release.

## Product statement

Platonic Solids Explorer is a static educational web application that lets a
visitor inspect, compare, and transform the five Platonic solids and four
Kepler–Poinsot polyhedra in an interactive 3D scene.

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

## Core experience

The page opens with one solid centered in a 3D stage. A visitor can:

- Rotate/orbit the camera by dragging
- Zoom with the wheel, trackpad, or equivalent touch gesture
- Pan the camera where the input method supports it
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
- Solid selector suitable for keyboard and small screens
- Main 3D stage
- A compact toolbar for camera and transformation actions
- Property panel beside the stage on wide screens and below it on narrow
  screens
- Optional explanatory text for the active transformation
- Footer with source and reference links

The active solid should be represented in the URL so a view can be bookmarked
or shared. A query parameter such as `?solid=icosahedron` avoids requiring a
client-side routing fallback on GitHub Pages.

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

- Desktop: stage and property panel use a two-column layout
- Tablet: proportions tighten while preserving the two-column layout when
  practical
- Mobile: stage, controls, and property panel stack vertically
- Camera controls support pointer, touch, wheel, and trackpad input

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

- All nine solids can be selected and rendered accurately
- Each solid has reviewed property data and a reference link
- Camera controls work with mouse, keyboard-supported controls, and touch
- All dual relationships can be demonstrated
- Approved stellation relationships can be demonstrated without misleading
  labels
- The page works at its GitHub Pages URL after a direct visit or refresh
- Automated checks cover data integrity, key UI interactions, and deployment
- The application is usable at common mobile and desktop sizes
