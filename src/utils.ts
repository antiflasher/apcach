import { Oklch, ContrastModel } from "./types";

export function healOklch(oklch: Oklch): Oklch {
  oklch.l = oklch.l === undefined ? 0 : roundToDP(oklch.l, 7);
  oklch.c = oklch.c === undefined ? 0 : roundToDP(oklch.c, 16);
  oklch.h = oklch.h === undefined ? 0 : roundToDP(oklch.h, 16);
  oklch.alpha = oklch.alpha === undefined ? 1 : roundToDP(oklch.alpha, 4);
  return oklch;
}
/** round to decimal places */

export function roundToDP(number: number, dp: number): number {
  return Math.floor(number * 10 ** dp) / 10 ** dp;
}

export function signOf(number: number): 1 | -1 {
  return number >= 0 ? 1 : -1;
  // 2024-06-16: this seems to be dangerous (divide by 0?)
  // return number / Math.abs(number);
}

export function clipContrast(cr: number): number {
  return Math.max(Math.min(cr, 108), 0);
}

export function clipChroma(c: number): number {
  return Math.max(Math.min(c, 0.37), 0);
}

export function clipHue(h: number): number {
  return Math.max(Math.min(h, 360), 0);
}

export function contrastIsLegal(
  cr: number,
  contrastModel: ContrastModel
): boolean {
  return (
    (Math.abs(cr) >= 8 && contrastModel === "apca") ||
    (Math.abs(cr) >= 1 && contrastModel === "wcag")
  );
}

export function floatingPointToHex(float: number): string {
  return Math.round(255 * float)
    .toString(16)
    .padStart(2, "0");
}

export function blendCompColors(fgCompColor, bgCompColor) {
  if (fgCompColor.alpha === undefined || fgCompColor.alpha === 1) {
    return fgCompColor;
  }

  // Blend color with the bg
  return {
    b: blendChannel(fgCompColor.b, bgCompColor.b, fgCompColor.alpha),
    g: blendChannel(fgCompColor.g, bgCompColor.g, fgCompColor.alpha),
    r: blendChannel(fgCompColor.r, bgCompColor.r, fgCompColor.alpha),
  };
}

export function blendChannel(
  channelFg: number,
  channelBg: number,
  alpha: number
): number {
  return channelBg + (channelFg - channelBg) * alpha;
}
