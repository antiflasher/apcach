import type { ColorSpace, ColorInCSSFormat } from "../types";

import { clampChroma } from "culori";
import { convertToOklch_orThrow, inP3, inSrgb, toP3 } from "../culoriUtils";
import { log } from "./log";
import { healOklch } from "./misc";

// ----------------------------------------------------------------------

export function clampColorToSpace(
  //
  colorInCssFormat: ColorInCSSFormat,
  colorSpace: ColorSpace
) {
  if (colorSpace === "p3") {
    log("culori > inP3 /// clampColorToSpace");
    if (inP3(colorInCssFormat)) {
      return colorInCssFormat;
    } else {
      let oklch;
      if (colorInCssFormat.slice(4) === "oklch") {
        oklch = colorInCssFormat;
      } else {
        oklch = convertToOklch_orThrow(colorInCssFormat);
        log("culori > convertToOklch /// 394");
        oklch = healOklch(oklch);
      }
      // Clamp color to p3 gamut
      log("culori > toGamut(p3)");
      return toP3(oklch);
    }
  } else {
    // eslint-disable-next-line no-lonely-if
    log("culori > inSrgb /// clampColorToSpace");
    if (inSrgb(colorInCssFormat)) {
      return colorInCssFormat;
    } else {
      let oklch = convertToOklch_orThrow(colorInCssFormat);
      log("culori > convertToOklch /// 407");
      oklch = clampChroma(oklch, "oklch");
      log("culori > clampChroma /// 409");
      return oklch;
    }
  }
}
