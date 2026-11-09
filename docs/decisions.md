# Decisions and open questions

## Accepted direction

- The project is an educational, static GitHub Pages application.
- The first release covers five Platonic solids and four Kepler–Poinsot
  polyhedra.
- React, TypeScript, and Vite form the application foundation.
- React Three Fiber and Three.js provide 3D rendering.
- React Bootstrap, one Bootswatch theme, and Lucide React provide the visual UI.
- Bootswatch will be the sole stylesheet; the project will author no CSS in any
  form.
- Mathematical data and geometry are separated from UI components.
- Duality and stellation are presented as mathematical relationships, not
  arbitrary mesh effects.
- Every solid is normalized to the same circumradius.
- Zooming moves the camera rather than scaling solid geometry.
- Camera panning is disabled; orbit, zoom, reset, and optional auto-rotation
  keep the solid centered.
- The HUD uses a grouped solid selector at the upper-left, camera actions at the
  upper-right, relationship actions below the scene, and a property panel below
  the stage at every breakpoint.
- Relationship actions use contextual text labels such as **Show dual**,
  **Stellate**, and **Return to convex form**.

## Decisions needed before implementation

1. **Public name:** Keep “Platonic Solids Explorer” or choose a more distinctive
   title?
2. **Repository name:** Use `platonic-solids`?
3. **Visibility:** Public is assumed because the target is GitHub Pages.
4. **Theme:** Choose the Bootswatch theme. `Darkly`, `Cyborg`, and `Solar` are
   strong candidates for a 3D exhibit; a lighter theme may read more like an
   educational reference.
5. **Default solid:** Tetrahedron is the simplest introduction; dodecahedron is
   more visually distinctive.
6. **Visual treatment:** Solid faces plus edge lines, translucent faces, or an
   optional toggle between treatments?
7. **Stellation scope:** Which exact convex-to-star relationships should the
   first release animate, and what geometric construction should the animation
   teach?
8. **Property depth:** Show advanced properties by default or place them in a
   collapsible “More details” section?
9. **Language:** English only for version 1, or design data for later
   localization immediately?
10. **Licensing:** Select a source-code license before accepting contributions.

## Recommended defaults

Unless changed during review:

- Repository: `platonic-solids`, public
- Theme: Bootswatch Darkly
- Default solid: tetrahedron
- Rendering: opaque faces with a contrasting edge overlay
- Properties: essential facts visible, advanced facts collapsed
- Language: English with data structures that do not prevent later translation
- URL state: `?solid=<slug>`

## Definition-phase exit criteria

Implementation can begin when:

- Product scope and terminology are approved
- The Bootswatch theme and initial visual treatment are chosen
- Mathematical conventions for star-polyhedron counts are documented
- Initial stellation mappings are approved or explicitly deferred
- Repository visibility and license are selected
- Version 1 success criteria are accepted
