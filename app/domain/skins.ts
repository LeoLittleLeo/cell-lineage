export const CELL_SKIN_IDS = ["cell", "jelly", "petri", "yolk", "ink", "moss"] as const;
export type CellSkinId = (typeof CELL_SKIN_IDS)[number];
export type SkinSelection = CellSkinId | "random";

export interface CellSkin {
  id: CellSkinId;
  name: string;
  description: string;
  membraneStyle: string;
  cytoplasmStyle: string;
  nucleusStyle: string;
  motionPreset: { duration: number; scale: number; squash: number };
  divisionPreset: { duration: number; stretch: number; wobble: number; elasticity: number };
  variables: Record<`--${string}`, string>;
  locked?: boolean;
  unlockCondition?: string;
  rarity?: string;
  source?: string;
}

export const CELL_SKINS: readonly CellSkin[] = [
  {
    id: "cell", name: "原生", description: "安静、柔和，保持今天的完整感。",
    membraneStyle: "translucent soft membrane", cytoplasmStyle: "warm milky fluid", nucleusStyle: "diffuse central nucleus",
    motionPreset: { duration: 5800, scale: 1.015, squash: 1 }, divisionPreset: { duration: 1320, stretch: 1, wobble: 0.08, elasticity: 0.35 },
    variables: {
      "--skin-cell-bg": "radial-gradient(circle at 34% 28%, rgba(255,255,255,.66), transparent 27%), radial-gradient(circle at 68% 72%, rgba(98,122,94,.09), transparent 31%), rgba(210,220,199,.50)",
      "--skin-border": "rgba(71,97,76,.34)", "--skin-inner-border": "rgba(80,106,83,.14)", "--skin-membrane-width": "1px",
      "--skin-radius": "53% 47% 50% 50% / 48% 53% 47% 52%", "--skin-inner-radius": "48% 52% 54% 46% / 51% 49% 47% 53%",
      "--skin-nucleus": "rgba(110,132,104,.09)", "--skin-nucleus-size": "51%", "--skin-division-nucleus-size": "76px", "--skin-nucleus-blur": "5px",
      "--skin-texture": "none", "--skin-texture-opacity": "0", "--skin-shadow": "inset 0 0 35px rgba(65,90,68,.07), 0 20px 52px rgba(40,56,44,.07)",
      "--skin-breathe-scale": "1.009", "--skin-breathe-y": "1.009", "--skin-breathe-squash": "1", "--skin-breathe-duration": "6.5s",
      "--skin-division-mid": "330px", "--skin-division-final": "410px", "--skin-division-height": "180px", "--skin-division-filter": "none",
      "--skin-mature-bg": "rgba(198,210,188,.43)", "--skin-mature-opacity": "1", "--skin-cell-ink": "#243029",
    }, source: "core",
  },
  {
    id: "jelly", name: "凝胶", description: "透明、缓慢，像凝胶一样回应呼吸。",
    membraneStyle: "thick refractive gel", cytoplasmStyle: "clear viscous fluid", nucleusStyle: "blurred floating nucleus",
    motionPreset: { duration: 4700, scale: 1.025, squash: 0.975 }, divisionPreset: { duration: 1320, stretch: 1.12, wobble: 0.18, elasticity: 0.7 },
    variables: {
      "--skin-cell-bg": "radial-gradient(circle at 28% 22%, rgba(255,255,255,.82), transparent 18%), radial-gradient(ellipse at 72% 68%, rgba(151,186,184,.20), transparent 40%), rgba(199,222,218,.36)",
      "--skin-border": "rgba(82,132,130,.43)", "--skin-inner-border": "rgba(255,255,255,.46)", "--skin-membrane-width": "2px",
      "--skin-radius": "57% 43% 54% 46% / 45% 58% 42% 55%", "--skin-inner-radius": "44% 56% 47% 53% / 55% 43% 57% 45%",
      "--skin-nucleus": "rgba(91,139,141,.12)", "--skin-nucleus-size": "55%", "--skin-division-nucleus-size": "84px", "--skin-nucleus-blur": "10px",
      "--skin-texture": "radial-gradient(circle, rgba(255,255,255,.48) 0 1px, transparent 1.8px)", "--skin-texture-opacity": ".22", "--skin-shadow": "inset 0 0 18px rgba(255,255,255,.52), inset 0 -22px 38px rgba(87,137,137,.09), 0 24px 60px rgba(48,91,89,.08)",
      "--skin-breathe-scale": "1.022", "--skin-breathe-y": ".997", "--skin-breathe-squash": ".976", "--skin-breathe-duration": "4.8s",
      "--skin-division-mid": "360px", "--skin-division-final": "448px", "--skin-division-height": "172px", "--skin-division-filter": "saturate(.9)",
      "--skin-mature-bg": "rgba(186,213,208,.38)", "--skin-mature-opacity": ".92", "--skin-cell-ink": "#28413f",
    }, source: "core",
  },
  {
    id: "petri", name: "培养皿", description: "细腻、克制，像培养皿中的微观生命。",
    membraneStyle: "hairline microscope membrane", cytoplasmStyle: "fine translucent grain", nucleusStyle: "small precise nucleus",
    motionPreset: { duration: 7200, scale: 1.008, squash: 1 }, divisionPreset: { duration: 1320, stretch: 0.94, wobble: 0.03, elasticity: 0.15 },
    variables: {
      "--skin-cell-bg": "radial-gradient(circle at 42% 38%, rgba(248,246,224,.72), transparent 36%), rgba(211,216,187,.34)",
      "--skin-border": "rgba(93,104,67,.28)", "--skin-inner-border": "rgba(93,104,67,.10)", "--skin-membrane-width": ".75px",
      "--skin-radius": "51% 49% 50% 50% / 50% 51% 49% 50%", "--skin-inner-radius": "50% 50% 49% 51% / 51% 49% 51% 49%",
      "--skin-nucleus": "rgba(102,109,68,.18)", "--skin-nucleus-size": "31%", "--skin-division-nucleus-size": "58px", "--skin-nucleus-blur": "1px",
      "--skin-texture": "radial-gradient(circle, rgba(75,87,51,.24) 0 .7px, transparent 1px)", "--skin-texture-opacity": ".30", "--skin-shadow": "inset 0 0 28px rgba(92,104,67,.055), 0 14px 44px rgba(53,59,38,.055)",
      "--skin-breathe-scale": "1.006", "--skin-breathe-y": "1.006", "--skin-breathe-squash": "1", "--skin-breathe-duration": "7.2s",
      "--skin-division-mid": "314px", "--skin-division-final": "392px", "--skin-division-height": "184px", "--skin-division-filter": "contrast(.98)",
      "--skin-mature-bg": "rgba(203,209,180,.36)", "--skin-mature-opacity": ".9", "--skin-cell-ink": "#303426",
    }, source: "core",
  },
  {
    id: "yolk", name: "卵黄", description: "温暖、饱满，保留初生组织的生命感。",
    membraneStyle: "supple rounded membrane", cytoplasmStyle: "warm amber body", nucleusStyle: "prominent glowing nucleus",
    motionPreset: { duration: 5400, scale: 1.018, squash: 0.99 }, divisionPreset: { duration: 1320, stretch: 1.02, wobble: 0.1, elasticity: 0.48 },
    variables: {
      "--skin-cell-bg": "radial-gradient(circle at 34% 26%, rgba(255,250,220,.78), transparent 23%), radial-gradient(circle at 55% 58%, rgba(207,151,53,.13), transparent 48%), rgba(229,194,112,.43)",
      "--skin-border": "rgba(151,107,37,.33)", "--skin-inner-border": "rgba(255,238,182,.34)", "--skin-membrane-width": "1.5px",
      "--skin-radius": "50% 50% 48% 52% / 48% 51% 49% 52%", "--skin-inner-radius": "52% 48% 50% 50% / 49% 52% 48% 51%",
      "--skin-nucleus": "radial-gradient(circle at 38% 32%, rgba(255,239,174,.9), rgba(193,132,41,.24) 72%)", "--skin-nucleus-size": "58%", "--skin-division-nucleus-size": "82px", "--skin-nucleus-blur": "2px",
      "--skin-texture": "radial-gradient(circle, rgba(151,105,37,.15) 0 .8px, transparent 1.4px)", "--skin-texture-opacity": ".16", "--skin-shadow": "inset 0 0 34px rgba(171,117,35,.10), 0 22px 54px rgba(108,76,28,.09)",
      "--skin-breathe-scale": "1.014", "--skin-breathe-y": "1.006", "--skin-breathe-squash": ".992", "--skin-breathe-duration": "5.4s",
      "--skin-division-mid": "336px", "--skin-division-final": "418px", "--skin-division-height": "184px", "--skin-division-filter": "saturate(.95)",
      "--skin-mature-bg": "rgba(220,187,111,.42)", "--skin-mature-opacity": ".94", "--skin-cell-ink": "#49381e",
    }, source: "core",
  },
  {
    id: "ink", name: "水墨", description: "沉静、流动，像一滴墨在水中展开。",
    membraneStyle: "diffused ink edge", cytoplasmStyle: "smoky off-black wash", nucleusStyle: "irregular dark bloom",
    motionPreset: { duration: 6400, scale: 1.014, squash: 0.994 }, divisionPreset: { duration: 1320, stretch: 1.07, wobble: 0.22, elasticity: 0.42 },
    variables: {
      "--skin-cell-bg": "radial-gradient(ellipse at 40% 34%, rgba(255,255,255,.38), transparent 27%), radial-gradient(circle at 63% 62%, rgba(38,41,39,.23), transparent 42%), rgba(113,117,113,.34)",
      "--skin-border": "rgba(31,36,33,.48)", "--skin-inner-border": "rgba(24,29,26,.16)", "--skin-membrane-width": "1px",
      "--skin-radius": "58% 42% 46% 54% / 43% 57% 41% 59%", "--skin-inner-radius": "43% 57% 55% 45% / 59% 40% 60% 41%",
      "--skin-nucleus": "radial-gradient(ellipse at 44% 42%, rgba(27,31,29,.36), rgba(48,52,49,.08) 70%)", "--skin-nucleus-size": "58%", "--skin-division-nucleus-size": "80px", "--skin-nucleus-blur": "8px",
      "--skin-texture": "radial-gradient(ellipse, rgba(25,30,27,.22) 0 .8px, transparent 2px)", "--skin-texture-opacity": ".24", "--skin-shadow": "inset 0 0 42px rgba(20,25,22,.16), 0 23px 64px rgba(26,30,28,.11), 0 0 14px rgba(36,42,38,.08)",
      "--skin-breathe-scale": "1.012", "--skin-breathe-y": "1.002", "--skin-breathe-squash": ".99", "--skin-breathe-duration": "6.4s",
      "--skin-division-mid": "350px", "--skin-division-final": "438px", "--skin-division-height": "174px", "--skin-division-filter": "grayscale(.72) contrast(1.06)",
      "--skin-mature-bg": "rgba(103,108,104,.28)", "--skin-mature-opacity": ".84", "--skin-cell-ink": "#202522",
    }, source: "core",
  },
  {
    id: "moss", name: "苔藓", description: "缓慢、坚韧，像苔藓一样安静地生长。",
    membraneStyle: "thick earthy tissue", cytoplasmStyle: "mottled vegetal body", nucleusStyle: "organic tissue cluster",
    motionPreset: { duration: 8200, scale: 1.01, squash: 1 }, divisionPreset: { duration: 1320, stretch: 0.98, wobble: 0.07, elasticity: 0.24 },
    variables: {
      "--skin-cell-bg": "radial-gradient(circle at 30% 24%, rgba(245,241,211,.54), transparent 24%), radial-gradient(ellipse at 66% 70%, rgba(58,91,58,.18), transparent 44%), rgba(128,151,106,.42)",
      "--skin-border": "rgba(56,82,52,.48)", "--skin-inner-border": "rgba(60,91,54,.24)", "--skin-membrane-width": "2px",
      "--skin-radius": "49% 51% 45% 55% / 54% 46% 57% 43%", "--skin-inner-radius": "54% 46% 51% 49% / 46% 55% 45% 54%",
      "--skin-nucleus": "radial-gradient(circle at 42% 35%, rgba(97,121,75,.38), rgba(55,83,54,.11) 68%)", "--skin-nucleus-size": "48%", "--skin-division-nucleus-size": "70px", "--skin-nucleus-blur": "3px",
      "--skin-texture": "radial-gradient(circle, rgba(40,72,42,.27) 0 1px, transparent 1.5px)", "--skin-texture-opacity": ".28", "--skin-shadow": "inset 0 0 40px rgba(48,80,46,.13), 0 20px 58px rgba(42,63,39,.1)",
      "--skin-breathe-scale": "1.007", "--skin-breathe-y": "1.007", "--skin-breathe-squash": "1", "--skin-breathe-duration": "8.2s",
      "--skin-division-mid": "323px", "--skin-division-final": "400px", "--skin-division-height": "186px", "--skin-division-filter": "saturate(.82)",
      "--skin-mature-bg": "rgba(112,138,93,.40)", "--skin-mature-opacity": ".9", "--skin-cell-ink": "#283624",
    }, source: "core",
  },
] as const;

export const DEFAULT_SKIN_ID: CellSkinId = "cell";
export const DEFAULT_SKIN_SELECTION: SkinSelection = DEFAULT_SKIN_ID;
export const isCellSkinId = (value: unknown): value is CellSkinId => typeof value === "string" && CELL_SKIN_IDS.includes(value as CellSkinId);
export const isSkinSelection = (value: unknown): value is SkinSelection => value === "random" || isCellSkinId(value);
export const getCellSkin = (id: CellSkinId) => CELL_SKINS.find((skin) => skin.id === id) ?? CELL_SKINS[0];
export const resolveSkinSelection = (selection: SkinSelection, random = Math.random): CellSkinId => {
  if (selection !== "random") return selection;
  return CELL_SKIN_IDS[Math.floor(random() * CELL_SKIN_IDS.length)] ?? DEFAULT_SKIN_ID;
};
