import type { ContrastConfig_WTF } from "../contrastConfig";

import { antagonistColorLightness } from "../aaa/antagonistColorLightness";

export function chromaLimits(
  //
  contrastConfig: ContrastConfig_WTF
): {
  lower: number;
  upper: number;
} {
  if (contrastConfig.searchDirection === "auto") {
    return { lower: 0, upper: 1 };
  }
  let pairColorLightness = antagonistColorLightness(contrastConfig);

  let upper =
    contrastConfig.searchDirection === "lighter" //
      ? 1
      : pairColorLightness;

  let lower =
    contrastConfig.searchDirection === "lighter" //
      ? pairColorLightness
      : 0;

  return { lower, upper };
}
