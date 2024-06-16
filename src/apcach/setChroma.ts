import { Apcach, apcach } from "./apcach";
import { clipChroma } from "../utils/misc";

export function setChroma(
  //
  colorInApcach: Apcach,
  c: number | ((chroma: number) => number)
): Apcach {
  let newChroma: number;
  if (typeof c === "number") {
    newChroma = clipChroma(c);
  } else if (typeof c === "function") {
    let newRawChroma = c(colorInApcach.chroma);
    newChroma = clipChroma(newRawChroma);
  } else {
    throw new Error("Invalid format of chroma value");
  }

  return apcach(
    colorInApcach.contrastConfig,
    newChroma,
    colorInApcach.hue,
    colorInApcach.alpha,
    colorInApcach.colorSpace
  );
}
