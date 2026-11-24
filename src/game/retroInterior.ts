// Browser-only, hand-painted domestic surfaces; no runtime downloads.
import * as THREE from "three";

export function domesticTexture(kind: "wallpaper" | "rug" | "newspaper" | "lace") {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("Domestic texture canvas unavailable");
  if (kind === "wallpaper") {
    g.fillStyle = "#c2c4ae"; g.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 64) for (let x = 0; x < 512; x += 64) {
      const cx = x + 32, cy = y + 32;
      g.strokeStyle = "#89917a"; g.lineWidth = 1;
      g.beginPath(); g.moveTo(cx, cy + 24); g.bezierCurveTo(cx - 12, cy, cx + 12, cy, cx, cy - 24); g.stroke();
      for (const s of [-1, 1]) {
        g.fillStyle = "#939980"; g.beginPath(); g.ellipse(cx + s * 6, cy + s * 8, 3, 8, s * 0.7, 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = "#b29887";
      for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; g.beginPath(); g.ellipse(cx + Math.cos(a) * 4, cy - 8 + Math.sin(a) * 4, 3, 4, a, 0, Math.PI * 2); g.fill(); }
    }
    g.fillStyle = "#747965"; g.globalAlpha = 0.08;
    for (let i = 0; i < 8000; i++) g.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
  } else if (kind === "rug") {
    g.fillStyle = "#632c37"; g.fillRect(0, 0, 512, 512);
    for (let inset = 12; inset <= 64; inset += 13) { g.strokeStyle = inset % 2 ? "#b69a6c" : "#303c42"; g.lineWidth = 6; g.strokeRect(inset, inset, 512 - inset * 2, 512 - inset * 2); }
    for (let y = 92; y < 460; y += 82) for (let x = 92; x < 460; x += 82) {
      for (const size of [30, 22, 10]) {
        g.fillStyle = size === 22 ? "#344648" : "#c5a37b";
        g.beginPath(); g.moveTo(x, y - size); g.lineTo(x + size, y); g.lineTo(x, y + size); g.lineTo(x - size, y); g.closePath(); g.fill();
      }
    }
    g.globalAlpha = 0.12; g.strokeStyle = "#e5d1a3"; g.lineWidth = 1;
    for (let y = 0; y < 512; y += 3) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
  } else if (kind === "newspaper") {
    g.fillStyle = "#d2ccb2"; g.fillRect(0, 0, 512, 512);
    g.fillStyle = "#383c38"; g.font = "bold 48px Georgia"; g.fillText("ВЕЧЕРНИЕ ВЕСТИ", 20, 65);
    g.fillRect(20, 79, 472, 3); g.font = "18px Georgia"; g.fillText("НОЯБРЬ • 1996                  № 214", 20, 105);
    for (let col = 0; col < 3; col++) for (let y = 140; y < 490; y += 12) g.fillRect(20 + col * 162, y, 132 - (y % 5) * 5, 2);
    g.fillStyle = "#838a80"; g.fillRect(20, 142, 132, 94);
  } else {
    g.clearRect(0, 0, 512, 512); g.strokeStyle = "#ebe4ce"; g.lineWidth = 2;
    for (let y = 0; y < 512; y += 32) for (let x = 0; x < 512; x += 32) {
      g.strokeRect(x, y, 32, 32); g.beginPath(); g.arc(x + 16, y + 16, 9, 0, Math.PI * 2); g.stroke();
    }
  }
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}