import type { ContrastRatio, ContrastModel, SearchDirection } from "./types";

export type RelativeContrastSettings = {
  bgColor: string;
  fgColor: string;
  cr: ContrastRatio;
  contrastModel: ContrastModel;
  searchDirection: SearchDirection;
};

export function crToBg(
  bgColor: string,
  cr: ContrastRatio,
  contrastModel: ContrastModel = "apca",
  searchDirection: SearchDirection = "auto"
): RelativeContrastSettings {
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
): RelativeContrastSettings {
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
): RelativeContrastSettings {
  return crToBg(bgColor, cr, contrastModel, searchDirection);
}

// misc presets --------------------------------------------------------------

export function crToBgWhite(
  cr: ContrastRatio,
  contrastModel: ContrastModel = "apca",
  searchDirection: SearchDirection = "auto"
): RelativeContrastSettings {
  return crToBg("white", cr, contrastModel, searchDirection);
}

export function crToBgBlack(
  cr: ContrastRatio,
  contrastModel: ContrastModel = "apca",
  searchDirection: SearchDirection = "auto"
): RelativeContrastSettings {
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
