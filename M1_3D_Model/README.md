# ARTEMIS Vet Technologies

A small React / Vite / React Three Fiber proof of concept using the existing German shepherd GLB. No backend or clinical functionality is included.

## Run locally

Install the project's dependencies once:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. In Windows PowerShell, if script execution blocks `npm.ps1`, use `npm.cmd install` and `npm.cmd run dev` instead. You do not need to change your execution policy.

The requested 3D dependency command is `npm install three @react-three/fiber @react-three/drei`; these packages are already listed in package.json. `npm install` also installs React and Vite.

`npm run build` creates a production build in `dist/`; `npm run preview` serves that build locally.

## Files

- `index.html`: page shell and React entry point.
- `src/main.jsx`: mounts React and loads the stylesheet.
- `src/App.jsx`: page layout, selected mesh state, controls guide, and Reset View button.
- `src/DogViewer.jsx`: Canvas, camera, OrbitControls, lighting, ground reference, loading state, and error handling.
- `src/DogModel.jsx`: loads the dog, measures and centers it, handles mesh clicks, and temporarily highlights the selection.
- `src/styles.css`: responsive medical-style interface.
- `vite.config.js`: enables Vite's React plugin.
- `package.json` / `package-lock.json`: commands and reproducible dependencies.

## Loading the existing GLB

`DogModel.jsx` imports `../low-poly-german-shepherd-dog-3d-model-free/source/German shepherd_glb.glb?url`. Vite converts that import into an asset URL and includes the asset in production builds. Drei's `useGLTF` loads and caches the model. Its texture is embedded in the GLB, so the separate JPEG is not needed by this viewer. The source files are not moved or modified.

The asset contains one mesh named `Model`. Its entire exterior highlights when selected; it has no separate organs or anatomical layers.

A Three.js `Box3` measures the loaded scene. We translate its center to the origin and uniformly scale its bounding sphere to radius 1.5. The ground disk is placed just below the lowest point. This avoids hard-coding the source model's units.

## Canvas and lighting

React Three Fiber's `Canvas` creates the Three.js renderer, scene, default camera, and rendering loop. Inside Canvas, JSX such as `mesh` and `directionalLight` describes Three.js objects instead of HTML. A `primitive` inserts the loaded GLB scene. Drei's `Html` renders an ordinary loading message above the canvas while React Suspense waits for the asset.

Ambient light lights every surface, with two directional lights adding shape. The ground disk gives a subtle spatial reference. No remote environment maps or other model assets are used.

## Camera and OrbitControls

The perspective camera has a 42-degree vertical field of view. The starting distance is calculated from the dog's normalized bounding sphere and the viewer's aspect ratio, so narrow screens also fit the dog. `near` and `far` define clipping planes, not zoom limits.

Drei's `OrbitControls` changes the camera around a target: left drag rotates, wheel or middle drag zooms, and right drag pans. Damping smooths movement. `minDistance` prevents getting too close and `maxDistance` limits zooming out. Pan is limited to 0.65 world units around the center; combined with a minimum distance of 2.6 and model radius of 1.5, this keeps the camera outside the dog even after panning. Vertical rotation is limited to keep the view above the ground.

Reset View remounts the controls and restores the initial camera position and target, discarding residual damping movement. Selection is preserved. Resizing to a different aspect ratio also refits the camera.

## Selection and highlighting

R3F raycasts pointer events against scene objects. `event.object` is the mesh that was hit. We store its UUID and display name in App, and ignore clicks with substantial drag movement. `stopPropagation()` prevents selecting objects behind the hit mesh. Canvas `onPointerMissed` clears selection when a left click misses the model. The ground disk ignores raycasts so it counts as empty space.

The GLB scene is cloned before use. On selection, only the selected mesh's material is cloned and tinted teal with a small emissive accent. Clearing or changing selection restores the exact original material and disposes the temporary copy. The cache's materials and textures remain unchanged. Multiple-material meshes are supported too.

## Manual verification

1. Start the dev server and confirm the textured dog loads centered above the disk.
2. Rotate, zoom to both limits, and right-drag to pan. Try zooming after panning; the camera should stay outside the dog.
3. Select the dog: `Model` should appear and the surface should turn teal.
4. Click blank space or Clear selection: the original texture/material should return.
5. Rotate, pan, and zoom, then Reset View: the original camera view should return.
6. Resize to a narrow window; confirm the model fits and the panels stack.

## Next steps for anatomy and diseases

Start with an anatomically appropriate, licensed model containing separately named meshes such as skin, skeleton, heart, and lungs. The current exterior mesh cannot reveal internal anatomy that was never modeled. Verify future medical assets with a veterinary subject-matter expert.

Then add a small mesh-name-to-anatomy metadata map and layer visibility toggles. Keep selected anatomy separate from disease state so a temporary selection highlight does not overwrite disease coloring. Whole-organ conditions can use material copies; local lesions need authored masks, submeshes, or surface overlays. Establish those interactions with local sample data before adding application services.

References: [R3F Canvas](https://r3f.docs.pmnd.rs/api/canvas), [R3F pointer events](https://r3f.docs.pmnd.rs/api/events), [Drei controls](https://drei.docs.pmnd.rs/controls/introduction).
