<script setup lang="ts">
/**
 * The prologue's background globe.
 *
 * Loaded only when: motion is allowed, WebGL is available, and the browser is
 * idle. Everything is generated — a latitude/longitude wireframe, a marker over
 * Tashkent and great-circle arcs out to the trading regions — so there is no
 * texture to download and nothing to licence.
 *
 * The parent renders a static SVG in its place when this never mounts.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue';
// Types only. The runtime import is dynamic, further down, so three.js stays
// out of the entry chunk; these are erased at compile time.
import type { Line, LineBasicMaterial } from 'three';

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

onMounted(async () => {
  const el = canvas.value;
  if (!el) return;

  const THREE = await import('three');

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

  const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const world = new THREE.Group();
  // Tilt so Central Asia faces the camera at rest.
  world.rotation.x = 0.25;
  world.rotation.y = -1.25;
  scene.add(world);

  const teal = new THREE.Color('#00AA95');
  const blue = new THREE.Color('#006FB9');

  // Wireframe shell.
  const shell = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(radius, 36, 24)),
    new THREE.LineBasicMaterial({ color: blue, transparent: true, opacity: 0.16 }),
  );
  world.add(shell);

  // Faint solid sphere so the far-side wireframe reads as "behind".
  world.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.995, 48, 32),
      new THREE.MeshBasicMaterial({ color: new THREE.Color('#05070A'), transparent: true, opacity: 0.86 }),
    ),
  );

  // Origin marker.
  const origin = toVector(TASHKENT.lat, TASHKENT.lon, radius * 1.01);
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 16, 16),
    new THREE.MeshBasicMaterial({ color: teal }),
  );
  marker.position.copy(origin);
  world.add(marker);

  // Great-circle arcs, lifted off the surface by their own length so long
  // routes bow higher than short ones.
  const arcs: Line[] = [];
  for (const dest of DESTINATIONS) {
    const end = toVector(dest.lat, dest.lon, radius * 1.01);
    const angle = origin.angleTo(end);
    const mid = origin.clone().add(end).normalize().multiplyScalar(radius * (1 + angle * 0.28));
    const curve = new THREE.QuadraticBezierCurve3(origin.clone(), mid, end);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(64));
    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: teal, transparent: true, opacity: 0 }),
    );
    arcs.push(line);
    world.add(line);
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

  let frame = 0;
  let running = true;
  const started = performance.now();

  const tick = () => {
    if (!running) return;
    const elapsed = (performance.now() - started) / 1000;
    world.rotation.y += 0.0012;

    // Arcs fade in one after another, then hold.
    arcs.forEach((arc, i) => {
      const material = arc.material as LineBasicMaterial;
      const local = Math.min(1, Math.max(0, (elapsed - 0.5 - i * 0.28) / 1.1));
      material.opacity = local * 0.75;
    });

    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
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
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.LineSegments) {
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
