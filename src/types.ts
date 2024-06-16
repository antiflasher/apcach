// TEMPORARY TYPES -------------------------------

export type Maybe<T> = T | null | undefined;
export type ContrastModel = "apca" | "wcag";
export type ColorSpace = "p3" | "rgb";

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
      contrastConfig: ContrastConfig,
      hue: number,
      alpha: number,
      colorSpace: ColorSpace
    ) => number);

export type ContrastRatio = number;

export type SearchDirection = "auto" | "lighter" | "darker";
/** extended way to specify a contrast config */

export type RawContrastConfig = number | ContrastConfig;
/** a normalized contrast config */

export type ContrastConfig = {
  bgColor: string;
  fgColor: string;
  cr: ContrastRatio;
  contrastModel: ContrastModel;
  searchDirection: SearchDirection;
  apcachIsOnFg: boolean;
  colorAntagonist: Oklch;
};
/** TODO */

export type Apcach = {
  //
  contrastConfig: ContrastConfig;
  //
  lightness: number;
  chroma: number;
  hue: number;
  //
  alpha: number;
  //
  colorSpace: ColorSpace;
};
