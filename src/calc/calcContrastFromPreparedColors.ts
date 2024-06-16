import { ColorSpace, type ContrastModel, type PreparedColor } from "../types";
import { ASSERT_EXAUSTED } from "../utils/assert";
import { calcApcaP3 } from "./calcApcaP3";
import { calcApcaSrgb } from "./calcApcaSrgb";
import { calcWcag } from "./calcWcag";

export function calcContrastFromPreparedColors(
  fgColor: PreparedColor,
  bgColor: PreparedColor,
  contrastModel: ContrastModel,
  colorSpace: ColorSpace
) {
  // apca
  if (contrastModel === "apca") {
    if (colorSpace === "p3") return calcApcaP3(fgColor, bgColor);
    if (colorSpace === "rgb") return calcApcaSrgb(fgColor, bgColor);
    return ASSERT_EXAUSTED(colorSpace, "unknown colorSpace");
  }

  // wcag
  // 💬 2024-06-17 rvion:
  // | is it the same scale as the one used in the APCA ?
  if (contrastModel === "wcag") return calcWcag(fgColor, bgColor);

  //
  return ASSERT_EXAUSTED(
    contrastModel,
    'Invalid contrast model. Suported models: "apca", "wcag"'
  );
}
