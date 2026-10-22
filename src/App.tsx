import { lazy, Suspense, useCallback, useState } from "react";
import { useArcade } from "./app/useArcade";
import { GameShell } from "./games/GameShell";
import { CartDockHud } from "./ui/CartDockHud";
import { HeroHud } from "./ui/HeroHud";
import { Letterbox } from "./ui/Letterbox";

const ArcadeScene = lazy(async () => {
  const mod = await import("./scene/ArcadeScene");
  return { default: mod.ArcadeScene };
});

export default function App() {
  const arcade = useArcade();
  const [loading, setLoading] = useState(true);

  const onLoad = useCallback(
    (note: string, fallback: boolean) => {
      setLoading(false);
      arcade.setLoadNote(note);
      arcade.setUsingFallback(fallback);
    },
    [arcade.setLoadNote, arcade.setUsingFallback],
  );

  return (
    <div className={`app is-${arcade.view}`}>
      <Letterbox />
      <div className="stage">
        <Suspense fallback={null}>
          <ArcadeScene
            view={arcade.view}
            plugged={arcade.plugged}
            reducedMotion={arcade.reducedMotion}
            onPowerOn={arcade.powerOn}
            onPowerComplete={arcade.onPowerComplete}
            onExitComplete={arcade.onExitComplete}
            onPlug={arcade.plug}
            onLoad={onLoad}
          />
        </Suspense>
      </div>
      <HeroHud
        view={arcade.view}
        plugged={arcade.plugged}
        loading={loading}
        loadNote={arcade.loadNote}
        onBack={arcade.backToDesk}
      />
      {arcade.view === "hero" && (
        <CartDockHud
          plugged={arcade.plugged}
          loading={loading}
          onPlug={arcade.plug}
          onPowerOn={arcade.powerOn}
        />
      )}
      {arcade.game && (arcade.view === "game" || arcade.view === "exiting") && (
        <GameShell
          id={arcade.game}
          leaving={arcade.view === "exiting"}
          onBack={arcade.backToDesk}
        />
      )}
    </div>
  );
}
