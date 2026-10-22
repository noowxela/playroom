import type { ArcadeView } from "../app/useArcade";
import { gameById, type GameId } from "../theme";

type Props = {
  view: ArcadeView;
  plugged: GameId | null;
  loading: boolean;
  loadNote: string;
  onBack: () => void;
};

export function HeroHud({
  view,
  plugged,
  loading,
  loadNote,
  onBack,
}: Props) {
  const hero = view === "hero";
  const seated = plugged ? gameById(plugged) : null;
  return (
    <>
      {view !== "game" && (
      <header className="hud hud-top">
        <div className="brand">
          <p className="kicker">Editorial arcade · CT-2005SB</p>
          <h1>Playroom</h1>
        </div>
        <nav className="nav" aria-label="Arcade">
          {hero ? (
            <span data-on="true">Desk</span>
          ) : (
            <button type="button" className="nav-back" onClick={onBack}>
              {view === "exiting" ? "Skip" : "← Desk"}
            </button>
          )}
          <span data-on={view === "powering" ? "true" : "false"}>Boot</span>
          <span>Play</span>
        </nav>
      </header>
      )}
      {hero && (
        <aside className="callouts" aria-hidden>
          <span className="callout">Panasonic CT-2005SB · 20 in · 4:3</span>
          <span className="callout">
            {seated ? `Slot · ${seated.title} seated` : "Slot · empty"}
          </span>
          <span className="callout">Click a cart to plug or unplug</span>
        </aside>
      )}
      {loading && (
        <>
          <div className="loading-line" aria-hidden>
            <span />
          </div>
          <p className="load-note">{loadNote || "Loading hardware…"}</p>
        </>
      )}
      {!loading && loadNote && <p className="load-note">{loadNote}</p>}
    </>
  );
}
