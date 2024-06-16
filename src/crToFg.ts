import type { Oklch } from "culori";
import type { ContrastRatio, ContrastModel, SearchDirection } from "./types";

/** extended way to specify a contrast config */
export type RawContrastConfig = number | ContrastConfigV1;

export type ContrastConfigV1 = {
  bgColor: string;
  fgColor: string;
  cr: ContrastRatio;
  contrastModel: ContrastModel;
  searchDirection: SearchDirection;
};

/** a normalized contrast config */
export type ContrastConfigV2 = {
  bgColor: string;
  fgColor: string;
  cr: ContrastRatio;
  contrastModel: ContrastModel;
  searchDirection: SearchDirection;
  // --------------------------
  /* ❓ */ apcachIsOnFg: boolean;
  /* ❓ */ colorAntagonist: Oklch;
};
/** TODO */

export function crToBg(
  bgColor: string,
  cr: ContrastRatio,
  contrastModel: ContrastModel = "apca",
  searchDirection: SearchDirection = "auto"
): ContrastConfigV1 {
  return {
    fgColor: "apcach",
    bgColor: stringToColor(bgColor),
    cr,
    contrastModel,
    searchDirection,
  };
}

export function crToFg(
  fgColor: string,
  cr: ContrastRatio,
  contrastModel: ContrastModel = "apca",
  searchDirection: SearchDirection = "auto"
): ContrastConfigV1 {
  return {
    fgColor: stringToColor(fgColor),
    bgColor: "apcach",
    cr,
    contrastModel,
    searchDirection,
  };
}

// aliasa `crTo` to `crToBg  --------------------------------------------------------------

export function crTo(
  bgColor: string,
  cr: ContrastRatio,
  contrastModel: ContrastModel = "apca",
  searchDirection: SearchDirection = "auto"
): ContrastConfigV1 {
  return crToBg(bgColor, cr, contrastModel, searchDirection);
}

// misc presets --------------------------------------------------------------

export function crToBgWhite(
  cr: ContrastRatio,
  contrastModel: ContrastModel = "apca",
  searchDirection: SearchDirection = "auto"
): ContrastConfigV1 {
  return crToBg("white", cr, contrastModel, searchDirection);
}

export function crToBgBlack(
  cr: ContrastRatio,
  contrastModel: ContrastModel = "apca",
  searchDirection: SearchDirection = "auto"
): ContrastConfigV1 {
  return crToBg("black", cr, contrastModel, searchDirection);
}

export function crToFgWhite(
  cr: ContrastRatio,
  contrastModel: ContrastModel = "apca",
  searchDirection: SearchDirection = "auto"
) {
  return crToFg("white", cr, contrastModel, searchDirection);
}

export function crToFgBlack(
  cr: ContrastRatio,
  contrastModel: ContrastModel = "apca",
  searchDirection: SearchDirection = "auto"
) {
  return crToFg("black", cr, contrastModel, searchDirection);
}

// ----------------------------------------------------------------------
// TODO: rename that function
export function contrastToConfig(
  rawContrast: RawContrastConfig
): ContrastConfigV1 {
  if (typeof rawContrast === "number") return crToBg("white", rawContrast);
  if (_isValidContrastConfig(rawContrast)) return rawContrast;
  throw new Error("Invalid contrast format");
}

// ----------------------------------------------------------------------

function stringToColor(str: string): string {
  switch (str) {
    case "black":
      return "oklch(0 0 0)";
    case "white":
      return "oklch(1 0 0)";
    default:
      return str;
  }
}

function _isValidContrastConfig(el: object): el is ContrastConfigV1 {
  return (
    "bgColor" in el && //
    "fgColor" in el &&
    "cr" in el &&
    "contrastModel" in el
  );
}
