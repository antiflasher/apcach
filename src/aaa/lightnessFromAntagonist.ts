import type { ContrastConfig } from "../contrastConfig";
import type { Oklch } from "culori";

import { log } from "../utils/log";
import { convertToOklch } from "../culoriUtils";

export function lightnessFromAntagonist(contrastConfig: ContrastConfig) {
  const antagonist =
    contrastConfig.fgColor === "apcach"
      ? contrastConfig.bgColor
      : contrastConfig.fgColor;

  log("culori > convertToOklch /// lightnessFromAntagonist");
  const oklch: Oklch | undefined = convertToOklch(antagonist);
  if (!oklch) throw new Error("Could not convert to oklch");

  return oklch.l;
}
