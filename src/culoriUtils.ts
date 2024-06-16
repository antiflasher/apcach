import type { ConvertFn } from "culori/src/converter";

import { differenceEuclidean, inGamut, toGamut } from "culori";
import { converter, modeOklch, modeP3, useMode } from "culori/fn";

useMode(modeP3);
useMode(modeOklch);

export const convertToOklch: ConvertFn<"oklch"> = converter("oklch");
export const convertToP3: ConvertFn<"p3"> = converter("p3");
export const convertToRgb: ConvertFn<"rgb"> = converter("rgb");

export type GamutCheck = (color: string) => boolean;
export const inP3: GamutCheck = inGamut("p3");
export const inSrgb: GamutCheck = inGamut("rgb");
export const toP3 = toGamut("p3", "oklch", differenceEuclidean("oklch"), 0);
