import type { ContrastConfig_WTF } from "../contrastConfig";

import { convertToOklch_orThrow } from "../culoriUtils";
import { log } from "../utils/log";

export function antagonistColorLightness(contrastConfig: ContrastConfig_WTF) {
  let oklch = convertToOklch_orThrow(contrastConfig.colorAntagonist);
  log("culori > convertToOklch /// antagonistColorLightness");
  return oklch.l;
}
