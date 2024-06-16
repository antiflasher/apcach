import type {
  ContrastRatio,
  ContrastModel,
  SearchDirection,
  PreparedColor,
} from "../types";

// 1. ------------------------------------------------------------
/** extended way to specify a contrast config */
export type ContrastConfig_Ext = number | ContrastConfig;

// 2. ------------------------------------------------------------
/** before preparation */
export type ContrastConfig = {
  bgColor: string;
  fgColor: string;
  cr: ContrastRatio;
  contrastModel: ContrastModel;
  searchDirection: SearchDirection;
};

// 3. ------------------------------------------------------------
/** normalized and prepared contrast config */
export type ContrastConfig_WTF = {
  bgColor: string;
  fgColor: string;
  cr: ContrastRatio;
  contrastModel: ContrastModel;
  searchDirection: SearchDirection;
  // --------------------------
  /* ❓ */ apcachIsOnFg: boolean;
  /* ❓ */ colorAntagonist: PreparedColor;
};
