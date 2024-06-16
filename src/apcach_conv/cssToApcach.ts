import type { ColorSpace, ContrastModel } from "../types";
import type { ContrastConfig } from "../contrast/contrastConfig";

import { crToBg, crToFg } from "../contrast/crTo";
import { convertToOklch_orThrow } from "../utils/culoriUtils";
import { apcach } from "../index";
import { calcContrast } from "./calcContrast";
import { clampColorToSpace } from "../utils/clampColorToSpace";

/**
 * The apcach format can be restored from color in CSS format
 * using the function cssToApcach():
 */
export function cssToApcach(
  /** color in CSS format that you want to convert to apcach format */
  color: string,

  /** comparing color
   * if it's on the background position: { bg : comparingColor }
   * if it's in the foreground position: { fg : comparingColor }
   *
   * (supported formats: oklch, oklab, display-p3, lch, lab, hex, rgb, hsl, p3)
   */
  antagonist: { bg?: string; fg?: string },
  colorSpace: ColorSpace = "p3",
  contrastModel: ContrastModel = "apca"
) {
  // ensure color is defined
  if (color == null) throw new Error("Color is undefined");

  // ensure antagonist is specified
  if (antagonist.fg == null && antagonist.bg == null)
    throw new Error("antagonist color is not provided");

  // ensure antagonist is either fg xor bg, not both
  if (antagonist.fg != null && antagonist.bg != null)
    throw new Error("antagonist can't be both fb and bg");

  // fgcolor
  let fgColor = antagonist.fg !== undefined ? antagonist.fg : color;
  fgColor = clampColorToSpace(fgColor, colorSpace);

  // bgcolor
  let bgColor = antagonist.bg !== undefined ? antagonist.bg : color;
  bgColor = clampColorToSpace(bgColor, colorSpace);

  // get the contrast function
  const crFunction =
    antagonist.fg !== undefined //
      ? crToFg
      : crToBg;

  // get the antagonist color
  const antagonistColor = antagonist.fg ?? antagonist.bg!;

  const contrast = calcContrast(fgColor, bgColor, contrastModel, colorSpace);

  // Compose apcach
  const colorClamped = clampColorToSpace(color, colorSpace);
  const colorComp = convertToOklch_orThrow(colorClamped);
  const antagonistColorOklch = convertToOklch_orThrow(antagonistColor);
  const isColorLighter = colorComp.l > antagonistColorOklch.l;
  const searchDirection = isColorLighter ? "lighter" : "darker";

  const contrastConfigXX: ContrastConfig = crFunction(
    antagonistColor,
    contrast,
    contrastModel,
    searchDirection
  );

  return apcach(
    contrastConfigXX,
    colorComp.c,
    colorComp.h ?? 0,
    colorComp.alpha ?? 1,
    colorSpace
  );
}
