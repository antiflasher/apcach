import type { ContrastRatio, ContrastModel, SearchDirection } from "../types";
import type { ContrastConfig } from "./contrastConfig";

/** TODO */
export function crToBg(
  bgColor: string,
  cr: ContrastRatio,
  contrastModel: ContrastModel = "apca",
  searchDirection: SearchDirection = "auto"
): ContrastConfig {
  return {
    fgColor: "apcach",
    bgColor: _stringToColor(bgColor),
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
    fgColor: _stringToColor(fgColor),
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

function _stringToColor(str: string): string {
  switch (str) {
    case "black":
      return "oklch(0 0 0)";
    case "white":
      return "oklch(1 0 0)";
    default:
      return str;
  }
}
