import {
  type ContrastConfig,
  type ContrastConfig_Ext,
} from "../contrast/contrastConfig";
import { contrastToConfig } from "../contrast/contrastToConfig";
import type { ColorSpace, ChromaExpr, Maybe } from "../types";
import { contrastIsLegal } from "../contrast/contrastIsLegal";
import { lightnessFromAntagonist } from "../light/lightnessFromAntagonist";
import { calcLightness } from "../scoring/calcLightness";
import { prepareContrastConfig } from "../contrast/prepareContrastConfig";

export type Apcach = {
  lightness: number;
  chroma: number;
  hue: number;
  //
  alpha: number;
  //
  contrastConfig: ContrastConfig;
  colorSpace: ColorSpace;
};

export function apcach(
  //
  contrast: ContrastConfig_Ext,
  chroma: ChromaExpr,
  hue?: Maybe<number | string>,
  alpha: number = 100,
  colorSpace: ColorSpace = "p3"
): Apcach {
  // 💬 2024-06-16 rvion:
  // | checking if something is either null or undefined should be done
  // | in one go by doing `hue == null` (two equal sign).
  // | (almost the only case when one want to use `==` instead of `===`).

  // 💬 2024-06-16 rvion:
  // | not sure if parseFloat is guaranteed to accept number
  // | probably better to only pass strings to it

  // Check for hue
  hue =
    hue == null //
      ? 0
      : typeof hue === "number"
      ? hue
      : parseFloat(hue);

  // Compose contrast config
  const contrastConfig: ContrastConfig = contrastToConfig(contrast);

  if (typeof chroma === "function") {
    // Max chroma case
    return chroma(contrastConfig, hue, alpha, colorSpace);
  } else {
    // Constant chroma case
    let lightness;
    if (contrastIsLegal(contrastConfig.cr, contrastConfig.contrastModel)) {
      lightness = calcLightness(
        prepareContrastConfig(contrastConfig, colorSpace),
        parseFloat(chroma),
        parseFloat(hue),
        colorSpace
      );
    } else {
      // APCA has a cut off at the value about 8
      lightness = lightnessFromAntagonist(contrastConfig);
    }

    return {
      lightness,
      chroma,
      hue,
      //
      alpha,
      //
      colorSpace,
      contrastConfig,
    };
  }
}
