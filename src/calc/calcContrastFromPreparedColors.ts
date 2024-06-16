import { ColorSpace, type ContrastModel, type PreparedColor } from "../types";
import { calcApcaP3 } from "./calcApcaP3";
import { calcApcaSrgb } from "./calcApcaSrgb";
import { calcWcag } from "./calcWcag";

export function calcContrastFromPreparedColors(
  fgColor: PreparedColor,
  bgColor: PreparedColor,
  contrastModel: ContrastModel,
  colorSpace: ColorSpace
) {
  switch (contrastModel) {
    case "apca": {
      if (colorSpace === "p3") {
        return calcApcaP3(fgColor, bgColor);
      } else {
        return calcApcaSrgb(fgColor, bgColor);
      }
    }
    case "wcag":
      return calcWcag(fgColor, bgColor);
    default:
      throw new Error(
        'Invalid contrast model. Suported models: "apca", "wcag"'
      );
  }
}
