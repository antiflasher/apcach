import { type Color, type P3, type Rgb } from "culori";
import { ColorSpace, type ContrastModel } from "../types";
import { convertToP3, convertToRgb } from "../utils/culoriUtils";
import { log } from "../utils/log";

export function colorToComps(
  //
  color: Color,
  contrastModel: ContrastModel,
  colorSpace: ColorSpace
): P3 | Rgb {
  if (
    //
    contrastModel === "apca" &&
    colorSpace === "p3"
  ) {
    log("culori > convertToP3 /// colorToComps");
    return convertToP3(color);
  } else {
    log("culori > convertToRgb /// colorToComps");
    return convertToRgb(color);
  }
}
