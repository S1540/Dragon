# Dragon Media

A single cinematic hero in Next.js App Router, JavaScript/JSX and Tailwind CSS, with custom CSS for composition and a dynamically loaded Three.js Earth.

## Run

- `npm install`
- `npm run dev`
- `npm run build` for a production build
- `npm start` to serve that build

The page contains only a floating glass header and a viewport-fitted cinematic horizon hero. A fine-pointer cursor follower and a non-interactive-area click ripple accompany a brief Earth-light pulse. These effects respect reduced motion. The service CTA opens an accessible native dialog. Start a Project opens a local brief editor and downloads the result; it does not submit inquiries to a backend.

## Rendering

`src/components/Earth.jsx` owns the WebGL lifecycle. It uses a textured sphere, custom lighting shader, atmosphere, land-masked luminous points, drifting stars and soft bokeh particles. Geometry and pixel ratio are reduced on mobile. Rendering is skipped offscreen and in hidden tabs. Reduced motion, pause and low-power devices receive a static 3D view. A local rendered poster handles unavailable or lost WebGL contexts. Textures, geometry, materials, observers and renderer are disposed on unmount.

The desktop surface is 2048 pixels wide; the mobile surface and water map are 1024. The mobile maps total approximately 95 KB. No post-processing pipeline or animation framework is required.

## Validation

`node scripts/check-hero.cjs` runs the local Chrome browser checks at desktop, tablet and mobile sizes, checks rotation/pause/reduced motion, opens both CTA dialogs and verifies a brief download. It assumes the development server is running on localhost:3000 and Chrome is installed at the Windows path in the script. Screenshots and results are written to `artifacts/`.

## Assets

Earth source maps come from the Three.js example planet textures:
- https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg
- https://threejs.org/examples/textures/planets/earth_specular_2048.jpg

Optimized WebP derivatives are served locally from `public/textures`. `reference-hero.png` is the user-provided visual reference. The hero intentionally does not include its monitor enclosure.

