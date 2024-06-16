import { parse } from "culori";
import { formatCss, formatHex, formatRgb } from "culori/fn";
import { Apcach } from "../apcach/apcach";
import { convertToP3 } from "../utils/culoriUtils";
import { log } from "../utils/log";
import { floatingPointToHex } from "../utils/misc";

export function apcachToCss(
  color: Apcach,
  format?: "oklch" | "rgb" | "hex" | "p3" | "figma-p3"
) {
  switch (format) {
    case "oklch":
      return (
        "oklch(" +
        color.lightness * 100 +
        "% " +
        color.chroma +
        " " +
        color.hue +
        ")"
      );
    case "rgb":
      return formatRgb(apcachToCss(color, "oklch"));
    case "hex":
      return formatHex(apcachToCss(color, "oklch"));
    case "p3": {
      log("culori > convertToP3 /// apcachToCss");
      return formatCss(convertToP3(apcachToCss(color, "oklch")));
    }
    case "figma-p3": {
      let p3Parsed = parse(apcachToCss(color, "p3"));
      return (
        floatingPointToHex(p3Parsed.r) +
        floatingPointToHex(p3Parsed.g) +
        floatingPointToHex(p3Parsed.b)
      );
    }
  }
  return apcachToCss(color, "oklch");
}
