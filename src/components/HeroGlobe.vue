<script setup lang="ts">
/**
 * The prologue's background globe.
 *
 * Loaded only when: motion is allowed, WebGL is available, and the browser is
 * idle. Everything is generated or built from open outlines — there is no
 * texture to download and nothing to licence. The parent renders a static SVG
 * in its place when this never mounts.
 *
 * What is on it, and why each thing is there:
 *
 *   the coastlines, so that it is the Earth rather than a sphere. A bare
 *   latitude/longitude cage could be any ball; once the land is on it the
 *   arcs run to places instead of to points;
 *
 *   Uzbekistan, in gold — the one shape the page is about, and the same shape
 *   chapter IV opens out into a map four screens down;
 *
 *   a sparse graticule, every thirty degrees. The cage used to be a 36x24
 *   wireframe, which was the only thing giving the sphere its volume. With
 *   coastlines on it that density is noise, so it steps back to a frame;
 *
 *   the corridors out of Tashkent, each ending in a marker, each carrying a
 *   light that runs its length;
 *
 *   a rim of gold at the edge, which is what reads as atmosphere.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue';
// Types only. The runtime import is dynamic, further down, so three.js stays
// out of the entry chunk; these are erased at compile time.
import type { Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Vector3 } from 'three';

const canvas = ref<HTMLCanvasElement | null>(null);
let dispose: (() => void) | null = null;

/** Tashkent, and a handful of destinations the corridors actually run to. */
const TASHKENT = { lat: 41.3, lon: 69.24 };
const DESTINATIONS = [
  { lat: 51.5, lon: -0.13 }, // London
  { lat: 39.9, lon: 116.4 }, // Beijing
  { lat: 25.2, lon: 55.27 }, // Dubai
  { lat: 55.75, lon: 37.62 }, // Moscow
  { lat: 28.61, lon: 77.21 }, // Delhi
  { lat: 41.01, lon: 28.98 }, // Istanbul
];

/** Outlines built by scripts/build-globe.mjs; see its header for the sources. */
const GLOBE_URL = 'geo/globe.json';
type GlobeOutlines = { land: number[][]; uz: number[][] };

onMounted(async () => {
  const el = canvas.value;
  if (!el) return;

  // The outlines are 9 kB over the wire and three.js is the slow half of this
  // pair, so they are fetched together rather than one after the other. A
  // globe with no coastlines is still a globe, so a failed fetch is not fatal.
  const [THREE, outlines] = await Promise.all([
    import('three'),
    fetch(GLOBE_URL)
      .then((res) => (res.ok ? (res.json() as Promise<GlobeOutlines>) : null))
      .catch(() => null),
  ]);

  const radius = 1;
  const toVector = (lat: number, lon: number, r = radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
    );
  };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.35, 3.1);
  camera.lookAt(0, 0, 0);

  /**
   * A phone is drawing this on a battery, behind a CPU several times slower
   * than a laptop's, at a device pixel ratio of two and a half. Left at the
   * desktop settings the globe cost a fifty-millisecond task every few frames
   * — measurably, under throttling — and the title card, which is the first
   * thing anybody sees, ran at about twenty frames a second because of it.
   *
   * Two caps fix it, and neither is visible: the back buffer stops at 1.5
   * rather than 2 device pixels, which is a little over half the pixels, and
   * the globe is drawn thirty times a second rather than sixty. A wireframe
   * turning a fifth of a degree a frame has nothing in it that thirty frames
   * cannot carry.
   */
  const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.5 : 2));

  const world = new THREE.Group();
  /**
   * Aimed so that Uzbekistan faces the camera, right of the title column.
   *
   * The old value was set when there was nothing on the sphere but a wire
   * cage, where one side was as good as another. With the land on it the aim
   * is a composition: Tashkent lands about halfway out towards the right
   * limb and well above the middle, which is clear of the type, and the
   * corridors fan out from there across the empty half of the card.
   */
  /**
   * A portrait screen sees a narrow strip of the globe, not the globe.
   *
   * The camera has a 38-degree vertical field, and on a phone the viewport is
   * about half as wide as it is tall — so horizontally it shows barely half
   * the sphere, cropped either side. Aimed for a laptop, Uzbekistan sits
   * towards the right limb and falls straight off the edge of that strip,
   * which leaves a phone with a hero full of anonymous coastline.
   *
   * So the aim is a function of the shape of the window: on a wide screen the
   * country sits right of the title column, on a tall one it comes round to
   * the middle, where the strip can see it.
   */
  const box = el.parentElement?.getBoundingClientRect();
  const portrait = box ? box.width / Math.max(1, box.height) < 0.9 : false;
  // Tilted less on a phone as well, which lifts the country into the gap
  // between the national colours and the forum's emblem instead of leaving it
  // directly behind the emblem.
  const tiltX = portrait ? 0.06 : 0.25;
  world.rotation.x = tiltX;
  world.rotation.y = portrait ? -2.62 : -2.15;
  scene.add(world);

  const gold = new THREE.Color('#E4BB7D');
  const bronze = new THREE.Color('#C18429');

  /** Flat [lon, lat, …] rings -> one LineSegments, one draw call for the lot. */
  const ringsToSegments = (rings: number[][], r: number, material: LineBasicMaterial) => {
    const positions: number[] = [];
    for (const ring of rings) {
      const count = ring.length / 2;
      for (let i = 0; i < count; i++) {
        const next = (i + 1) % count;
        const a = toVector(ring[i * 2 + 1]!, ring[i * 2]!, r);
        const b = toVector(ring[next * 2 + 1]!, ring[next * 2]!, r);
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return new THREE.LineSegments(geometry, material);
  };

  // The cage. Every thirty degrees, drawn in whole circles rather than as a
  // sphere's wireframe so the spacing is a decision rather than a side effect
  // of how many segments a SphereGeometry happens to have.
  const graticule: number[][] = [];
  for (let lat = -60; lat <= 60; lat += 30) {
    const ring: number[] = [];
    for (let lon = -180; lon < 180; lon += 5) ring.push(lon, lat);
    graticule.push(ring);
  }
  for (let lon = -180; lon < 180; lon += 30) {
    const ring: number[] = [];
    // A meridian is drawn as a closed ring down one side and up the other.
    for (let lat = -90; lat <= 90; lat += 5) ring.push(lon, lat);
    for (let lat = 90; lat >= -90; lat -= 5) ring.push(lon + 180, lat);
    graticule.push(ring);
  }
  world.add(
    ringsToSegments(
      graticule,
      radius,
      new THREE.LineBasicMaterial({ color: bronze, transparent: true, opacity: 0.1 }),
    ),
  );

  // Faint solid sphere so the far-side lines read as "behind".
  world.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.995, 48, 32),
      new THREE.MeshBasicMaterial({ color: new THREE.Color('#141A42'), transparent: true, opacity: 0.86 }),
    ),
  );

  if (outlines?.land?.length) {
    world.add(
      ringsToSegments(
        outlines.land,
        radius * 1.001,
        new THREE.LineBasicMaterial({ color: bronze, transparent: true, opacity: 0.4 }),
      ),
    );
  }

  if (outlines?.uz?.length) {
    // Lifted a touch further off the surface than the coastlines so it is
    // never half-swallowed by them where the border follows a shoreline, and
    // drawn twice a hair apart: WebGL line width is one pixel on every
    // platform that matters, and one pixel of gold is not enough weight for
    // the one shape on the globe that the page is about.
    for (const r of [1.004, 1.0055]) {
      world.add(
        ringsToSegments(
          outlines.uz,
          radius * r,
          new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.9 }),
        ),
      );
    }
  }

  /**
   * The atmosphere.
   *
   * A second sphere a little larger than the globe, drawn inside-out and
   * added to what is behind it, lit only where its surface turns away from
   * the camera. That is a rim: bright at the edge of the disc, nothing in the
   * middle, which is how a lit atmosphere looks from outside it. Twelve lines
   * of shader and no texture.
   */
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.05, 32, 20),
    new THREE.ShaderMaterial({
      uniforms: { uColor: { value: gold } },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 eye = modelViewMatrix * vec4(position, 1.0);
          vView = normalize(-eye.xyz);
          gl_Position = projectionMatrix * eye;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          float rim = 1.0 - abs(dot(vNormal, vView));
          gl_FragColor = vec4(uColor, pow(rim, 3.0) * 0.5);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  );
  world.add(atmosphere);

  // Origin marker.
  const origin = toVector(TASHKENT.lat, TASHKENT.lon, radius * 1.01);
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.0095, 16, 16),
    new THREE.MeshBasicMaterial({ color: gold }),
  );
  marker.position.copy(origin);
  world.add(marker);

  // Great-circle arcs, lifted off the surface by their own length so long
  // routes bow higher than short ones. Each ends in a marker of its own — an
  // arc that stops in mid-air is a line, not a route — and carries a light
  // that runs from Tashkent to that marker.
  const arcs: Line[] = [];
  const curves: { getPointAt: (t: number) => Vector3 }[] = [];
  const travellers: Mesh[] = [];
  const dots: Mesh[] = [];
  // Small. These are the ends of lines, not pins on a map — at the size they
  // started they read as beads strung round the limb.
  const dotGeometry = new THREE.SphereGeometry(0.0055, 10, 10);
  const sparkGeometry = new THREE.SphereGeometry(0.0065, 10, 10);

  for (const dest of DESTINATIONS) {
    const end = toVector(dest.lat, dest.lon, radius * 1.01);
    const angle = origin.angleTo(end);
    const mid = origin.clone().add(end).normalize().multiplyScalar(radius * (1 + angle * 0.28));
    const curve = new THREE.QuadraticBezierCurve3(origin.clone(), mid, end);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(64));
    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0 }),
    );
    arcs.push(line);
    curves.push(curve);
    world.add(line);

    const dot = new THREE.Mesh(
      dotGeometry,
      new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0 }),
    );
    dot.position.copy(end);
    dots.push(dot);
    world.add(dot);

    const spark = new THREE.Mesh(
      sparkGeometry,
      new THREE.MeshBasicMaterial({
        color: gold,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    travellers.push(spark);
    world.add(spark);
  }

  const resize = () => {
    const parent = el.parentElement;
    if (!parent) return;
    const { width, height } = parent.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
  };
  resize();
  const observer = new ResizeObserver(resize);
  if (el.parentElement) observer.observe(el.parentElement);

  /**
   * The globe leans a little towards the pointer.
   *
   * Two degrees at the most, and eased rather than followed, so it reads as
   * the thing noticing you rather than as a control. Only where there is a
   * mouse: on a touch screen there is no pointer to lean towards, and the
   * listener would run through every scroll.
   */
  const lean = { x: 0, y: 0, toX: 0, toY: 0 };
  const LEAN = 0.035; // radians, about two degrees
  const onPointerMove = (event: PointerEvent) => {
    lean.toY = ((event.clientX / window.innerWidth) * 2 - 1) * LEAN;
    lean.toX = ((event.clientY / window.innerHeight) * 2 - 1) * LEAN;
  };
  if (!coarse) window.addEventListener('pointermove', onPointerMove, { passive: true });

  let frame = 0;
  let running = true;
  const started = performance.now();

  /**
   * The shortest gap between two drawings.
   *
   * Thirty a second everywhere now, not just on a phone. The globe used to be
   * a wire cage and could be drawn for almost nothing; with the coastlines,
   * the markers and the lit rim on it, drawing it sixty times a second cost
   * five times the frame budget it had and put fourteen long tasks into a
   * scroll that used to have two. A sphere turning one degree a second has
   * nothing in it that thirty frames cannot carry, and the measurement after
   * the change is the one it had before any of this was added.
   */
  const minGap = 1000 / 30;
  /**
   * Radians a second, rather than radians a frame.
   *
   * Slower than it was. The globe used to turn far enough in ten seconds to
   * carry Uzbekistan off the lit side, which is the one thing on it that has
   * to stay findable — a reader arriving at the title card should be able to
   * see the country the page is about without waiting a minute and a half
   * for it to come round again. At this rate it drifts about twenty degrees
   * in the time anybody spends on a hero, and Central Asia stays in view.
   */
  const SPIN = 0.018;
  /** How long a light takes to run one corridor, in seconds. */
  const TRAVEL = 3.4;
  let lastDraw = 0;

  const tick = (now: number) => {
    if (!running) return;
    frame = requestAnimationFrame(tick);

    // The first call always draws: there is no previous frame to be too close
    // to, and a globe that waits for one never appears at all.
    const since = lastDraw ? now - lastDraw : 16.7;
    if (lastDraw && since < minGap) return;
    lastDraw = now;

    // Turned by the clock, not by the frame, so capping the rate above slows
    // the drawing down and not the globe. Clamped, because a tab that was in
    // the background comes back with a gap of several seconds.
    const step = Math.min(since, 100) * 0.001;
    world.rotation.y += SPIN * step;

    // Eased towards the pointer at a rate that does not depend on the frame
    // rate, and left at zero on a touch screen.
    lean.x += (lean.toX - lean.x) * Math.min(1, step * 3);
    lean.y += (lean.toY - lean.y) * Math.min(1, step * 3);
    world.rotation.x = tiltX + lean.x;
    world.rotation.z = lean.y;

    // Arcs fade in one after another, then hold.
    const elapsed = (now - started) / 1000;
    arcs.forEach((arc, i) => {
      const material = arc.material as LineBasicMaterial;
      const local = Math.min(1, Math.max(0, (elapsed - 0.5 - i * 0.28) / 1.1));
      material.opacity = local * 0.75;

      // The marker at the far end arrives just behind its own arc.
      const dotMaterial = dots[i]!.material as MeshBasicMaterial;
      dotMaterial.opacity = Math.min(1, Math.max(0, (elapsed - 0.9 - i * 0.28) / 1.1)) * 0.85;

      // The light sets off once its own arc has finished drawing, and each
      // corridor is offset from the next so they never run in formation.
      const spark = travellers[i]!;
      const sparkMaterial = spark.material as MeshBasicMaterial;
      if (local < 1) {
        sparkMaterial.opacity = 0;
      } else {
        const t = (((elapsed - 1.6 - i * 0.55) / TRAVEL) % 1 + 1) % 1;
        spark.position.copy(curves[i]!.getPointAt(t));
        // Out at both ends, so it leaves Tashkent and arrives rather than
        // appearing and vanishing.
        sparkMaterial.opacity = Math.sin(t * Math.PI) * 0.7;
      }
    });

    renderer.render(scene, camera);
  };
  frame = requestAnimationFrame(tick);

  // Stop rendering entirely once the hero scrolls away — a spinning globe in a
  // background tab or three screens up is pure battery drain.
  const visibility = new IntersectionObserver(
    ([entry]) => {
      const visible = entry?.isIntersecting ?? false;
      if (visible && !running) {
        running = true;
        frame = requestAnimationFrame(tick);
      } else if (!visible && running) {
        running = false;
        cancelAnimationFrame(frame);
      }
    },
    { threshold: 0 },
  );
  if (el.parentElement) visibility.observe(el.parentElement);

  dispose = () => {
    running = false;
    cancelAnimationFrame(frame);
    observer.disconnect();
    visibility.disconnect();
    if (!coarse) window.removeEventListener('pointermove', onPointerMove);
    scene.traverse((object) => {
      if (
        object instanceof THREE.Mesh ||
        object instanceof THREE.Line ||
        object instanceof THREE.LineSegments
      ) {
        object.geometry.dispose();
        const material = object.material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material.dispose();
      }
    });
    renderer.dispose();
  };
});

onBeforeUnmount(() => {
  dispose?.();
  dispose = null;
});
</script>

<template>
  <canvas ref="canvas" class="globe" aria-hidden="true" />
</template>

<style scoped>
.globe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
