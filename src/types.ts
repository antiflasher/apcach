// TEMPORARY TYPES -------------------------------

import type { ContrastConfigV1 } from "./crToFg";

export type Maybe<T> = T | null | undefined;
export type ContrastModel = "apca" | "wcag";
export type ColorSpace = "p3" | "rgb";
export type ColorInCSSFormat = string;

export type Oklch = {
  l: number;
  c: number;
  h: number;
  alpha: number;
};
// prettier-ignore

export type HueExpr = number |
  string |
  ((hue: number) => number);

export type ChromaExpr =
  | number
  | string
  | ((
      contrastConfig: ContrastConfigV1,
      hue: number,
      alpha: number,
      colorSpace: ColorSpace
    ) => number);

export type ChromaExpr2 =
  | number
  | ((contrastConfig: ContrastConfigV1) => number);

export type ContrastRatio = number;

export type SearchDirection = "auto" | "lighter" | "darker";

export type Apcach = {
  lightness: number;
  chroma: number;
  hue: number;
  //
  alpha: number;
  //
  contrastConfig: ContrastConfigV1;
  colorSpace: ColorSpace;
};
