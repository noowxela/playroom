export const PALETTE = {
  studio: "#e7e1d6",
  studioDim: "#d4cdc2",
  ivory: "#d8cbb6",
  ivoryDark: "#c4b49a",
  charcoal: "#2b2724",
  charcoalSoft: "#4a453f",
  sage: "#7d8c73",
  sageDeep: "#5d6b55",
  terracotta: "#b07a5c",
  terracottaDeep: "#8c5d45",
  blue: "#6a7d90",
  blueDeep: "#4f6173",
  cable: "#3a3835",
  screen: "#141a12",
  yellowT: "#e6c54a",
  whiteV: "#f4f1ea",
  led: "#9a3a32",
  panasonic: "#6e7276",
} as const;

export type GameId = "snake" | "breakout" | "blocks";

export const GAMES: {
  id: GameId;
  title: string;
  subtitle: string;
  color: string;
  deep: string;
  catalog: string;
  howTo: string;
}[] = [
  {
    id: "snake",
    title: "SNAKE",
    subtitle: "贪吃蛇",
    color: PALETTE.sage,
    deep: PALETTE.sageDeep,
    catalog: "PR-01",
    howTo: "Eat chain foods in order for a combo. Grab the timed fruit. Arrows / WASD.",
  },
  {
    id: "breakout",
    title: "BREAKOUT",
    subtitle: "打砖块",
    color: PALETTE.terracotta,
    deep: PALETTE.terracottaDeep,
    catalog: "PR-02",
    howTo: "Break every brick. Catch wide-paddle and multi-ball pickups. Arrows / A D or drag.",
  },
  {
    id: "blocks",
    title: "BLOCKS",
    subtitle: "方块",
    color: PALETTE.blue,
    deep: PALETTE.blueDeep,
    catalog: "PR-03",
    howTo: "Clear lines. Ghost shows the drop. Next piece is on the right. Arrows rotate and move.",
  },
];

export function gameById(id: GameId) {
  const found = GAMES.find((g) => g.id === id);
  if (!found) throw new Error(`Unknown game ${id}`);
  return found;
}
