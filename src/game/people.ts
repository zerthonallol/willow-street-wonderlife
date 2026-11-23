// Procedural seated people for car interiors: painted face, hair, textured clothing.
// Browser-only (three.js). Built facing -Z (the car's forward direction).
import * as THREE from "three";

const SKIN = ["#e9c4a6", "#d6a684", "#b98462", "#8a5a3c", "#f1d2bb"];
const HAIR = ["#1d1510", "#3a2416", "#6b4a2a", "#b08a52", "#8a8580", "#2a1a12"];
const TOPS = ["#2c3e5a", "#5a1e1e", "#2f4a34", "#3a3a3e", "#6b5434", "#40304a", "#1e2a2e"];

const cache = new Map<string, THREE.CanvasTexture>();
function canvas(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const hit = cache.get(key); if (hit) return hit;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  cache.set(key, t); return t;
}

/** Face painted onto the front half of a sphere UV (u 0.25..0.75 faces +Z after rotation). */
function faceTex(skin: string, hair: string, female: boolean) {
  return canvas(`face${skin}${hair}${female}`, 256, 128, (g) => {
    g.fillStyle = skin; g.fillRect(0, 0, 256, 128);
    // subtle shading
    const r = g.createRadialGradient(128, 70, 8, 128, 70, 90); r.addColorStop(0, "rgba(255,255,255,0.12)"); r.addColorStop(1, "rgba(0,0,0,0.18)");
    g.fillStyle = r; g.fillRect(0, 0, 256, 128);
    // hair cap on top / back
    g.fillStyle = hair; g.fillRect(0, 0, 256, female ? 40 : 34);
    g.fillRect(0, 0, 80, female ? 110 : 64); g.fillRect(176, 0, 80, female ? 110 : 64);
    g.beginPath(); g.ellipse(128, 34, 52, 14, 0, 0, Math.PI); g.fill();
    // brows, eyes
    for (const sx of [-1, 1]) {
      const x = 128 + sx * 16;
      g.strokeStyle = hair; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 7, 52); g.quadraticCurveTo(x, 48, x + 7, 52); g.stroke();
      g.fillStyle = "#f6f2ea"; g.beginPath(); g.ellipse(x, 60, 6, 3.4, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#3a2a1c"; g.beginPath(); g.arc(x, 60, 2.6, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#000"; g.beginPath(); g.arc(x, 60, 1.2, 0, Math.PI * 2); g.fill();
      if (female) { g.strokeStyle = "#111"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 6, 57); g.lineTo(x + 7, 57); g.stroke(); }
    }
    // nose + mouth
    g.strokeStyle = "rgba(90,50,30,0.5)"; g.lineWidth = 2; g.beginPath(); g.moveTo(128, 62); g.lineTo(126, 74); g.lineTo(131, 75); g.stroke();
    g.strokeStyle = female ? "#9a3a3a" : "rgba(110,50,40,0.8)"; g.lineWidth = female ? 3 : 2;
    g.beginPath(); g.moveTo(120, 85); g.quadraticCurveTo(128, 88, 136, 85); g.stroke();
    if (!female && Math.random() < 0.5) { g.fillStyle = hair; g.globalAlpha = 0.55; g.fillRect(114, 80, 28, 4); g.globalAlpha = 1; }
  });
}

/** Knit/jacket fabric with weave noise and seams. */
function clothTex(col: string) {
  return canvas(`cloth${col}`, 128, 128, (g) => {
    g.fillStyle = col; g.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 3) for (let x = 0; x < 128; x += 3) {
      g.fillStyle = Math.random() < 0.5 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.1)"; g.fillRect(x, y, 2, 2);
    }
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2; g.beginPath(); g.moveTo(64, 0); g.lineTo(64, 128); g.stroke();
    g.fillStyle = "rgba(220,220,220,0.5)"; for (let y = 16; y < 128; y += 26) { g.beginPath(); g.arc(68, y, 2, 0, 7); g.fill(); }
  });
}

function jeansTex() {
  return canvas("jeans", 64, 64, (g) => {
    g.fillStyle = "#2a3550"; g.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 64; i += 2) { g.strokeStyle = `rgba(160,180,220,${0.05 + Math.random() * 0.08})`; g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 8, 64); g.stroke(); }
  });
}

export function buildSeatedPerson(lite: boolean, seed = Math.random()) {
  const pick = <T,>(a: T[], k: number) => a[Math.floor(((seed * 9301 * (k + 1) + 49297) % 233280) / 233280 * a.length)] as T;
  const skin = pick(SKIN, 1), hair = pick(HAIR, 2), top = pick(TOPS, 3);
  const female = seed > 0.5;
  const M = (p: THREE.MeshStandardMaterialParameters) =>
    lite ? (new THREE.MeshLambertMaterial({ color: p.color ?? "#ffffff", map: p.map ?? null }) as unknown as THREE.MeshStandardMaterial) : new THREE.MeshStandardMaterial({ roughness: 0.85, ...p });
  const skinM = M({ color: skin, roughness: 0.6 });
  const faceM = M({ map: faceTex(skin, hair, female), roughness: 0.6 });
  const hairM = M({ color: hair, roughness: 0.8 });
  const topM = M({ map: clothTex(top) });
  const legM = M({ map: jeansTex() });
  const shoeM = M({ color: "#141210", roughness: 0.5 });
  const g = new THREE.Group();
  const seg = lite ? 8 : 14;

  // hips + thighs forward, shins down
  const hips = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.26), legM); hips.position.set(0, 0.07, 0.02); g.add(hips);
  for (const sx of [-1, 1]) {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.32, 4, seg), legM); thigh.rotation.x = Math.PI / 2; thigh.position.set(sx * 0.1, 0.08, -0.2); g.add(thigh);
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.16, 4, seg), legM); shin.position.set(sx * 0.1, -0.06, -0.38); shin.rotation.x = 0.2; g.add(shin);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.22), shoeM); shoe.position.set(sx * 0.1, -0.17, -0.44); g.add(shoe);
  }
  // torso leaning slightly back
  const torso = new THREE.Group(); torso.position.set(0, 0.12, 0.06); torso.rotation.x = 0.12; g.add(torso);
  const chest = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.24, 6, seg), topM); chest.scale.set(1.15, 1, 0.72); chest.position.y = 0.22; torso.add(chest);
  // arms reaching to the wheel
  for (const sx of [-1, 1]) {
    const up = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.22, 4, seg), topM); up.position.set(sx * 0.22, 0.3, -0.06); up.rotation.set(0.7, 0, sx * 0.1); torso.add(up);
    const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.043, 0.22, 4, seg), topM); fore.position.set(sx * 0.17, 0.28, -0.27); fore.rotation.set(1.35, 0, -sx * 0.35); torso.add(fore);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.042, seg, 8), skinM); hand.position.set(sx * 0.12, 0.3, -0.4); torso.add(hand);
  }
  // neck + head
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.08, seg), skinM); neck.position.y = 0.39; torso.add(neck);
  const head = new THREE.Group(); head.position.set(0, 0.5, -0.01); torso.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.1, lite ? 12 : 22, lite ? 10 : 16), faceM);
  skull.scale.set(0.92, 1.1, 1); skull.rotation.y = -Math.PI / 2; head.add(skull); // face texture centre -> -Z (forward)
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.106, lite ? 12 : 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.45), hairM);
  hairCap.scale.set(0.95, 1.1, 1.04); hairCap.position.set(0, 0.012, 0.01); head.add(hairCap);
  if (female) { const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.16, 4, seg), hairM); tail.position.set(0, -0.05, 0.1); tail.rotation.x = 0.3; head.add(tail); }
  for (const sx of [-1, 1]) { const ear = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), skinM); ear.scale.set(0.5, 1, 0.8); ear.position.set(sx * 0.093, 0, 0.005); head.add(ear); }

  return { group: g, head };
}
