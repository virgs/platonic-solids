# Technical design

## Architecture

The project will be a client-only single-page application built as static
assets and deployed to GitHub Pages.

### UI layer

- **React + TypeScript** for components and application state
- **Vite** for local development and static production builds
- **React Bootstrap** for layout, controls, overlays, and responsive behavior
- **Bootswatch** for the complete Bootstrap theme
- **Lucide React** for icons

Bootswatch will be the application's sole stylesheet. Its packaged CSS is
imported directly from the dependency. The project will not contain CSS or
SCSS files, CSS Modules, CSS-in-JS, styled components, component-level style
blocks, inline DOM style overrides, or a custom design-token layer. Components
must use React Bootstrap props and the classes and utilities already supplied
by Bootstrap and the chosen Bootswatch theme.

Values intrinsic to WebGL—mesh materials, lights, colors, coordinates, and
renderer settings—are scene data rather than page styling and may be configured
through Three.js APIs. Canvas dimensions and surrounding layout must still use
Bootstrap facilities rather than authored CSS.

### 3D layer

- **Three.js** as the rendering engine
- **@react-three/fiber** as the React renderer for Three.js
- **@react-three/drei** for established helpers such as orbit controls,
  environment setup, labels, and bounds fitting

Geometry definitions should be deterministic and separated from scene
components. Built-in Three.js Platonic geometries may be used after verifying
their topology and orientation. Kepler–Poinsot meshes will likely require
reviewed vertex/face datasets or explicit construction algorithms.

Every completed geometry is centered at the origin and normalized to a unit
circumradius. The normalization uses the greatest distance from the origin to
any vertex, including the outermost vertices of a star polyhedron. Runtime
selection and camera interaction must not change the mesh scale.

### State model

The initial state is small enough for React state and context:

- Active solid identifier
- Camera/control state that must survive a transformation
- Current transformation and animation progress
- UI preferences such as property-detail level

A global state library should be added only if implementation demonstrates a
clear need. The active solid is synchronized with a URL query parameter.

### Data model

Each solid has a stable slug and a typed record containing display metadata,
mathematical properties, citations, dual relationships, geometry source, and
allowed transformations. Geometry and educational metadata remain separate so
each can be tested independently.

Numeric properties should record units and representation explicitly. For
example, face and dihedral angles may have exact display text plus a numeric
degree value used for comparison.

## Animation approach

A transformation is a semantic sequence, not an assumption that two arbitrary
meshes have matching vertices.

Candidate techniques include:

- Constructing the dual from animated face-center points
- Coordinated scale/opacity transitions between overlaid meshes
- Purpose-built interpolation for topology-compatible geometry
- Animated face-plane extension for an approved stellation demonstration

The design should prefer mathematical legibility over a visually smooth but
incorrect vertex morph. React Three Fiber's frame loop and Three.js math tools
are sufficient initially; an animation dependency should be introduced only
if it materially simplifies orchestration or accessibility.

## Rendering defaults

- Perspective camera with bounded zoom distance
- Orbit controls with damping
- Pan disabled and the orbit target fixed at the solid's center
- Wheel and trackpad zoom implemented as camera dolly movement
- One-finger touch orbit and two-finger pinch zoom
- Reset action that restores the standard target, distance, and orientation
- Explicit auto-rotate toggle, paused during direct manipulation
- Neutral lighting that keeps faces and edges readable
- Optional edge overlay with adequate contrast
- Device pixel ratio capped to protect performance on dense displays
- Paused or reduced animation when the document is not visible

Final colors, Bootswatch theme, and material treatment are product decisions,
not yet fixed.

## Testing

- **Vitest** for data, geometry helpers, and state logic
- **React Testing Library** for accessible UI behavior
- **Playwright** for selection, URL sharing, responsive layout, and deployment
  smoke tests
- Geometry integrity checks for expected vertex, edge, and face counts
- Geometry normalization checks asserting a common circumradius
- Interaction checks asserting that zoom changes the camera rather than mesh
  scale

Canvas pixel snapshots should be used sparingly because they are brittle across
renderers. Prefer topology checks and user-observable behavior.

## Quality tools

- ESLint with TypeScript and React rules
- Prettier for formatting
- TypeScript strict mode
- Dependency lockfile committed to the repository
- CI checks for types, lint, unit tests, and build

## Deployment

GitHub Actions builds the Vite app and deploys its output with the official
GitHub Pages actions. Vite's base path must match the repository name. The
workflow will use least-privilege Pages permissions and a concurrency group to
avoid overlapping deployments.

Using a query parameter for solid selection keeps deep links compatible with
static hosting. No secrets or runtime environment variables should be needed.

## Proposed implementation milestones

These milestones begin only after the definition phase is approved.

1. **Foundation:** Vite app, dependencies, theme, quality checks, CI, and Pages
   deployment.
2. **Data and shell:** typed solid catalog, selector, responsive layout, and
   property panel.
3. **3D inspection:** Platonic geometry, camera controls, reset/fit, and
   accessible fallback.
4. **Star polyhedra:** reviewed Kepler–Poinsot geometry and validated metadata.
5. **Relationships:** dual demonstrations and approved stellation sequences.
6. **Hardening:** reduced motion, mobile interaction, performance, browser
   testing, and content review.

## Principal risks

- Self-intersecting polyhedra need careful face ordering, normals, and edge
  rendering.
- Counts and Euler characteristics for star polyhedra depend on clearly stated
  conventions.
- Naive mesh interpolation can be mathematically misleading.
- Transparent overlapping meshes can produce depth-sorting artifacts.
- WebGL tests can be inconsistent in headless environments.
- A Bootswatch-only visual system prohibits bespoke CSS fixes; React Bootstrap
  composition and existing Bootstrap utilities are a deliberate constraint.
