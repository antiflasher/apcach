import type { ContrastConfig_PREPARED } from "../contrast/contrastConfig";
import { calcContrastFromPreparedColors } from "../calc/calcContrastFromPreparedColors";
import { ColorSpace, type PreparedColor } from "../types";
import { blendCompColors } from "../utils/misc";

export function getContrastScoreForObjective(
  /** color you want to s core */
  color: PreparedColor,

  /** target objective */
  contrastConfig: ContrastConfig_PREPARED,

  colorSpace: ColorSpace
) {
  // Deside the position of the color
  let fgColor: PreparedColor;
  let bgColor: PreparedColor;
  if (contrastConfig.apcachIsOnFg) {
    bgColor = contrastConfig.colorAntagonist;
    fgColor = blendCompColors(color, bgColor);
  } else {
    fgColor = contrastConfig.colorAntagonist;
    bgColor = color;
  }

  // Caclulate contrast
  const contrast = calcContrastFromPreparedColors(
    fgColor,
    bgColor,
    contrastConfig.contrastModel,
    colorSpace
  );

  return Math.abs(contrast);
}
