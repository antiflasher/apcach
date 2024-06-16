import type { Oklch } from "culori";
import type { ContrastRatio, ContrastModel, SearchDirection } from "./types";

/** extended way to specify a contrast config */
export type ContrastConfig_Ext = number | ContrastConfig;

export type ContrastConfig = {
  bgColor: string;
  fgColor: string;
  cr: ContrastRatio;
  contrastModel: ContrastModel;
  searchDirection: SearchDirection;
};

/** a normalized contrast config */
export type ContrastConfig_WTF = {
  bgColor: string;
  fgColor: string;
  cr: ContrastRatio;
  contrastModel: ContrastModel;
  searchDirection: SearchDirection;
  // --------------------------
  /* ❓ */ apcachIsOnFg: boolean;
  /* ❓ */ colorAntagonist: string | Oklch;
};
/** TODO */

export function crToBg(
  bgColor: string,
  cr: ContrastRatio,
  contrastModel: ContrastModel = "apca",
  searchDirection: SearchDirection = "auto"
): ContrastConfig {
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
): ContrastConfig {
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
): ContrastConfig {
  return crToBg(bgColor, cr, contrastModel, searchDirection);
}

// misc presets --------------------------------------------------------------

export function crToBgWhite(
  cr: ContrastRatio,
  contrastModel: ContrastModel = "apca",
  searchDirection: SearchDirection = "auto"
): ContrastConfig {
  return crToBg("white", cr, contrastModel, searchDirection);
}

export function crToBgBlack(
  cr: ContrastRatio,
  contrastModel: ContrastModel = "apca",
  searchDirection: SearchDirection = "auto"
): ContrastConfig {
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
  rawContrast: ContrastConfig_Ext
): ContrastConfig {
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

function _isValidContrastConfig(el: object): el is ContrastConfig {
  return (
    "bgColor" in el && //
    "fgColor" in el &&
    "cr" in el &&
    "contrastModel" in el
  );
}
