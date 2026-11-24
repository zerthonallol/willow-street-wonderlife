<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Keep browser-only Three.js scenes dynamically imported by the client-only game route; this prevents SSR evaluation of canvas APIs.
- Use shared story eligibility helpers for dialogue and ending gates; UI and game state must enforce the same conditions.
- Ship pre-generated voice audio as static game assets; gameplay must not require credentials or live inference.
- Keep apartment departure in the existing client-only scene and gate its ordered elevator/street/car stages through shared departure rules; main-game callbacks must wait for engine startup completion.
- Spawn pickups inside wall-mounted cabinets (props.ts) rather than on the floor; on touch devices keep point lights minimal and use Lambert materials for the bear so shaders compile on phone GPUs.
- Build all prologue exterior scenery (window courtyard and street) from shared helpers in src/game/exterior.ts and notice texts in src/game/notices.ts; floor-specific stairwell props swap in updateFloorSigns via hallFeature so the modelled single storey stays consistent.
- Keep domestic canvas surface textures in retroInterior.ts and preserve apartment interaction coordinates when rebuilding furnishings, so visual revisions do not break story progression.
- Use car-panel-rules.ts for upward bonnet/boot angles and triangle distance; the visible placement guide and interaction must derive from the same car-local point.
- The dev-only window.__apt exposes the live prologue for verification; its existing spots, position, camera and updateRoad methods allow scene checks without a second Three.js instance.
