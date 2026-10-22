import { useCallback, useEffect, useRef, useState } from "react";
import type { GameId } from "../theme";

export type ArcadeView = "hero" | "powering" | "game" | "exiting";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

export function useArcade() {
  const reducedMotion = useReducedMotion();
  const [view, setView] = useState<ArcadeView>("hero");
  const [plugged, setPlugged] = useState<GameId | null>("snake");
  const [game, setGame] = useState<GameId | null>(null);
  const [loadNote, setLoadNote] = useState("Loading hardware…");
  const [usingFallback, setUsingFallback] = useState(false);
  const pluggedRef = useRef(plugged);
  const viewRef = useRef(view);
  pluggedRef.current = plugged;
  viewRef.current = view;

  const plug = useCallback((id: GameId) => {
    if (viewRef.current !== "hero") return;
    setPlugged((current) => (current === id ? null : id));
  }, []);

  const powerOn = useCallback(() => {
    if (viewRef.current !== "hero" || !pluggedRef.current) return;
    setView("powering");
  }, []);

  const onPowerComplete = useCallback(() => {
    if (viewRef.current !== "powering") return;
    const id = pluggedRef.current;
    if (!id) {
      setGame(null);
      setView("hero");
      return;
    }
    setGame(id);
    setView("game");
  }, []);

  const landOnDesk = useCallback(() => {
    setGame(null);
    setView("hero");
  }, []);

  const backToDesk = useCallback(() => {
    const current = viewRef.current;
    if (current === "hero") return;
    if (current === "exiting") {
      landOnDesk();
      return;
    }
    setView("exiting");
  }, [landOnDesk]);

  const onExitComplete = useCallback(() => {
    if (viewRef.current !== "exiting") return;
    landOnDesk();
  }, [landOnDesk]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (viewRef.current === "hero") return;
      backToDesk();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [backToDesk]);

  return {
    view,
    plugged,
    game,
    reducedMotion,
    loadNote,
    usingFallback,
    setLoadNote,
    setUsingFallback,
    plug,
    powerOn,
    onPowerComplete,
    onExitComplete,
    backToDesk,
  };
}
