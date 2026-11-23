// Procedural sitting cat: lathe-shaped body, tabby fur texture, glossy eyes with slit pupils,
// pink inner ears, whiskers. Browser-only (three.js). Returns animatable head/tail/tip pivots.
import * as THREE from "three";

const furCache = new Map<string, THREE.CanvasTexture>();

function shade(hex: string, k: number) {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 }; c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l * k)));
  return `#${c.getHexString()}`;
}

/** Tabby fur: base tone, darker mackerel stripes and thousands of fine hair strokes. */
function furTexture(fur: string) {
  const cached = furCache.get(fur); if (cached) return cached;
  const c = document.createElement("canvas"); c.width = 256; c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, shade(fur, 0.85)); grad.addColorStop(0.5, fur); grad.addColorStop(1, shade(fur, 1.35));
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
  // stripes running around the body (u wraps around)
  g.strokeStyle = shade(fur, 0.45); g.lineCap = "round";
  for (let i = 0; i < 9; i++) {
    const y = 18 + i * 26 + Math.random() * 6;
    g.lineWidth = 5 + Math.random() * 6; g.globalAlpha = 0.55;
    g.beginPath();
    for (let x = -10; x <= 266; x += 16) g.lineTo(x, y + Math.sin(x * 0.05 + i) * 6 + (Math.random() - 0.5) * 4);
    g.stroke();
  }
  // fine hairs
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 256, y = Math.random() * 256, l = 2 + Math.random() * 5;
    g.globalAlpha = 0.18 + Math.random() * 0.2;
    g.strokeStyle = Math.random() < 0.5 ? shade(fur, 1.6) : shade(fur, 0.5);
    g.lineWidth = 0.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - 0.5) * 1.5, y + l); g.stroke();
  }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  furCache.set(fur, t);
  return t;
}

function eyeTexture(iris: string) {
  const c = document.createElement("canvas"); c.width = 64; c.height = 64;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 2, 32, 32, 32);
  r.addColorStop(0, "#f4f08a"); r.addColorStop(0.55, iris); r.addColorStop(1, "#3d4a12");
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  g.fillStyle = "#050505"; g.beginPath(); g.ellipse(32, 32, 5, 22, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.arc(24, 20, 5, 0, Math.PI * 2); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function buildCat(lite: boolean, fur = "#2b2724") {
  const M = (p: THREE.MeshStandardMaterialParameters) =>
    lite ? (new THREE.MeshLambertMaterial({ color: p.color ?? "#ffffff", map: p.map ?? null }) as unknown as THREE.MeshStandardMaterial) : new THREE.MeshStandardMaterial(p);
  const map = furTexture(fur);
  const m = M({ map, color: "#ffffff", roughness: 0.95 });
  const chest = M({ map, color: "#e8dccb", roughness: 1 }); // lighter bib and muzzle
  const pink = M({ color: "#c98a86", roughness: 0.7 });
  const nose = M({ color: "#7a4a48", roughness: 0.4 });
  const dark = M({ color: shade(fur, 0.4), roughness: 1 });
  const g = new THREE.Group();

  // Sitting body: lathe profile (radius, height) — wide haunches tapering to the shoulders.
  const prof = [[0, 0], [0.085, 0.004], [0.11, 0.03], [0.115, 0.07], [0.1, 0.13], [0.078, 0.19], [0.062, 0.235], [0.05, 0.26], [0, 0.27]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const bodyGeo = new THREE.LatheGeometry(prof, lite ? 12 : 22);
  const body = new THREE.Mesh(bodyGeo, m); body.scale.set(0.82, 1.05, 1.05); body.rotation.x = 0.12; body.position.z = -0.02; g.add(body);
  // haunches
  for (const sx of [-1, 1]) {
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), m); h.scale.set(0.8, 1, 1.35); h.position.set(sx * 0.07, 0.055, -0.04); g.add(h);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), m); foot.scale.set(1, 0.6, 1.7); foot.position.set(sx * 0.085, 0.012, 0.03); g.add(foot);
  }
  // chest bib
  const bib = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 10), chest); bib.scale.set(0.8, 1.5, 0.55); bib.position.set(0, 0.17, 0.05); g.add(bib);
  // front legs with paws
  for (const sx of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.019, 0.14, 4, 10), m); leg.position.set(sx * 0.035, 0.09, 0.075); leg.rotation.x = -0.08; g.add(leg);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 8), chest); paw.scale.set(1, 0.65, 1.3); paw.position.set(sx * 0.036, 0.014, 0.088); g.add(paw);
  }

  // Head pivot
  const head = new THREE.Group(); head.position.set(0, 0.29, 0.045); g.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.062, 20, 16), m); skull.scale.set(1.12, 0.95, 1); head.add(skull);
  for (const sx of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.034, 12, 10), m); cheek.position.set(sx * 0.036, -0.018, 0.022); head.add(cheek);
    // ears: outer fur cone + pink inner
    const ear = new THREE.Group(); ear.position.set(sx * 0.038, 0.048, -0.004); ear.rotation.set(-0.15, 0, -sx * 0.32); head.add(ear);
    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.055, 3), m); outer.position.y = 0.022; outer.rotation.y = Math.PI / 6; ear.add(outer);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.017, 0.04, 3), pink); inner.position.set(0, 0.018, 0.008); inner.rotation.y = Math.PI / 6; ear.add(inner);
    // eyes
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.0135, 14, 10), new THREE.MeshBasicMaterial({ map: eyeTexture("#b9c94a") }));
    eye.scale.set(1, 0.85, 0.6); eye.position.set(sx * 0.025, 0.008, 0.053); eye.rotation.y = sx * 0.3 - Math.PI / 2 + Math.PI / 2; head.add(eye);
    const lid = new THREE.Mesh(new THREE.TorusGeometry(0.0138, 0.0025, 6, 16), dark); lid.position.copy(eye.position); lid.position.z += 0.002; lid.scale.set(1, 0.85, 1); head.add(lid);
  }
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.026, 14, 10), chest); muzzle.scale.set(1.25, 0.8, 0.85); muzzle.position.set(0, -0.022, 0.05); head.add(muzzle);
  const nz = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.008, 3), nose); nz.rotation.set(Math.PI / 2 + Math.PI, 0, 0); nz.position.set(0, -0.009, 0.072); head.add(nz);
  if (!lite) {
    const wm = new THREE.LineBasicMaterial({ color: "#efe9df", transparent: true, opacity: 0.75 });
    const pts: THREE.Vector3[] = [];
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) {
      pts.push(new THREE.Vector3(sx * 0.02, -0.02 - i * 0.004, 0.066), new THREE.Vector3(sx * 0.1, -0.012 - i * 0.012 + 0.008, 0.05));
    }
    head.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), wm));
  }

  // Tail: curved tube, base pivot + tip pivot (animated)
  const tail = new THREE.Group(); tail.position.set(0, 0.03, -0.12); g.add(tail);
  const c1 = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.03, -0.015, -0.07), new THREE.Vector3(0.08, -0.02, -0.12), new THREE.Vector3(0.13, -0.015, -0.13)]);
  tail.add(new THREE.Mesh(new THREE.TubeGeometry(c1, 12, 0.018, 8), m));
  const tip = new THREE.Group(); tip.position.set(0.13, -0.015, -0.13); tail.add(tip);
  const c2 = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.05, 0.005, -0.0), new THREE.Vector3(0.09, 0.03, 0.04)]);
  tip.add(new THREE.Mesh(new THREE.TubeGeometry(c2, 10, 0.015, 8), dark));
  const end = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 6), dark); end.position.set(0.09, 0.03, 0.04); tip.add(end);

  g.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = !lite; });
  return { group: g, head, tail, tip };
}
