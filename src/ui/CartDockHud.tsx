import { GAMES, type GameId } from "../theme";

export function CartDockHud({
  plugged,
  loading,
  onPlug,
  onPowerOn,
}: {
  plugged: GameId | null;
  loading: boolean;
  onPlug: (id: GameId) => void;
  onPowerOn: () => void;
}) {
  return (
    <div className="desk-bar">
      {GAMES.map((game) => {
        const seated = plugged === game.id;
        return (
          <button
            key={game.id}
            type="button"
            className="cart-btn"
            onClick={() => onPlug(game.id)}
          >
            <strong>{game.title}</strong>
            <span>
              {game.subtitle} · {seated ? "Unplug" : "Plug in"}
            </span>
          </button>
        );
      })}
      <button
        type="button"
        className="power-on"
        onClick={onPowerOn}
        disabled={loading || !plugged}
      >
        POWER ON
      </button>
    </div>
  );
}
