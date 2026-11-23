import { useEffect, useRef, useState } from "react";
import type { Game } from "@/game/Game";
import { Button } from "@/components/ui/button";
import { CONTROL_IMAGES } from "./media";
import { L } from "@/game/i18n";

type Props = { game: React.MutableRefObject<Game | null>; prompt: string; flashlight: boolean; onInventory: () => void };

const R = 56; // joystick radius in px

export function TouchControls({ game, prompt, flashlight, onInventory }: Props) {
  const stickId = useRef<number | null>(null);
  const lookId = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });
  const last = useRef({ x: 0, y: 0 });
  const [knob, setKnob] = useState<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [sprint, setSprint] = useState(false);

  // Release stuck input when the controls unmount or the app loses focus (e.g. scene changes).
  useEffect(() => {
    const reset = () => {
      stickId.current = null; lookId.current = null; setKnob(null);
      const g = game.current; if (g) { g.touch.mx = g.touch.my = g.touch.lookX = g.touch.lookY = 0; }
    };
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    return () => { window.removeEventListener("blur", reset); document.removeEventListener("visibilitychange", reset); reset(); };
  }, [game]);

  const onStart = (e: React.TouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      if (t.clientX < window.innerWidth * 0.45 && stickId.current === null) {
        stickId.current = t.identifier;
        origin.current = { x: t.clientX, y: t.clientY };
        setKnob({ x: 0, y: 0, ox: t.clientX, oy: t.clientY });
      } else if (lookId.current === null) {
        lookId.current = t.identifier;
        last.current = { x: t.clientX, y: t.clientY };
      }
    }
  };
  const onMove = (e: React.TouchEvent) => {
    const g = game.current;
    if (!g) return;
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === stickId.current) {
        let dx = t.clientX - origin.current.x, dy = t.clientY - origin.current.y;
        const d = Math.hypot(dx, dy);
        if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R; }
        // Dead zone + smooth response curve: small thumb drift no longer moves the player.
        const mag = Math.hypot(dx, dy) / R;
        const eased = mag < 0.12 ? 0 : Math.pow((mag - 0.12) / 0.88, 1.4);
        const k = mag > 0 ? eased / mag : 0;
        g.touch.mx = (dx / R) * k;
        g.touch.my = (-dy / R) * k;
        setKnob((k) => (k ? { ...k, x: dx, y: dy } : k));
      } else if (t.identifier === lookId.current) {
        // Speed-adaptive look: precise when slow, quick turns on fast swipes.
        const ddx = t.clientX - last.current.x, ddy = t.clientY - last.current.y;
        const boost = 1.1 + Math.min(1.2, Math.hypot(ddx, ddy) / 40);
        g.touch.lookX += ddx * boost;
        g.touch.lookY += ddy * boost * 0.85;
        last.current = { x: t.clientX, y: t.clientY };
      }
    }
  };
  const onEnd = (e: React.TouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === stickId.current) {
        stickId.current = null;
        setKnob(null);
        if (game.current) { game.current.touch.mx = 0; game.current.touch.my = 0; }
      } else if (t.identifier === lookId.current) lookId.current = null;
    }
  };

  const tap = (fn: () => void) => (e: React.TouchEvent) => { e.stopPropagation(); e.preventDefault(); fn(); };
  const toggleSprint = () => {
    const v = !sprint;
    setSprint(v);
    if (game.current) game.current.touch.sprint = v;
  };

  return (
    <div className="touch-layer absolute inset-0 select-none" onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd} onTouchCancel={onEnd}>
      {knob ? (
        <div className="touch-stick" style={{ left: knob.ox - R, top: knob.oy - R, width: R * 2, height: R * 2 }}>
          <div className="touch-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
        </div>
      ) : (
        <div className="touch-stick touch-stick-hint" style={{ left: 40, bottom: 40, width: R * 2, height: R * 2 }}>
          <div className="touch-knob" />
        </div>
      )}
      <div className="absolute bottom-5 right-5 flex flex-col items-end gap-3">
        <div className="flex gap-3">
        <Button variant="ghost" className="touch-btn" aria-label={L("Инвентарь", "Inventory")} onTouchStart={tap(onInventory)} onClick={onInventory}><img src={CONTROL_IMAGES.bag} alt="" /></Button>
        <Button variant="ghost" className={`touch-btn ${flashlight ? "touch-btn-on" : ""}`} aria-label={L("Фонарик", "Flashlight")} onTouchStart={tap(() => game.current?.toggleFlash())}><img src={CONTROL_IMAGES.flashlight} alt="" /></Button>
        </div>
        <div className="flex items-end gap-3">
          <Button variant="ghost" className={`touch-btn ${sprint ? "touch-btn-on" : ""}`} aria-label={L("Бег", "Sprint")} onTouchStart={tap(toggleSprint)}><img src={CONTROL_IMAGES.run} alt="" /></Button>
          <Button variant="ghost" className={`touch-btn touch-btn-lg ${prompt ? "touch-btn-on" : ""}`} aria-label={L("Действие", "Interact")} onTouchStart={tap(() => game.current?.interact())}><img src={CONTROL_IMAGES.hand} alt="" /></Button>
        </div>
      </div>
    </div>
  );
}
