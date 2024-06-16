import {
  type ContrastConfig,
  type ContrastConfig_Ext,
  type ContrastConfig_WTF,
} from "./contrast/contrastConfig";
import {
  crTo,
  crToBg,
  crToFg,
  crToBgBlack,
  crToBgWhite,
  crToFgBlack,
  crToFgWhite,
} from "./contrast/crTo";
import { contrastToConfig } from "./contrast/contrastToConfig";

// 🔴 todo: patch types
// @ts-ignore
import { inGamut, parse, type Color, type Oklch } from "culori";
import { formatCss, formatHex, formatRgb } from "culori/fn";
import { lightnessFromAntagonist } from "./light/lightnessFromAntagonist";
import {
  convertToOklch_orThrow,
  convertToP3,
  convertToRgb,
} from "./utils/culoriUtils";
import { log } from "./utils/log";
import {
  ChromaExpr,
  ColorSpace,
  HueExpr,
  Maybe,
  type ChromaExpr2,
  type ColorInCSSFormat,
  type ContrastModel,
  type ContrastRatio,
  type PreparedColor,
} from "./types";
import { Apcach, apcach } from "./apcah/apcach";
import {
  blendCompColors,
  clipChroma,
  clipContrast,
  clipHue,
  floatingPointToHex,
  signOf,
} from "./utils/misc";
import { contrastIsLegal } from "./contrast/contrastIsLegal";
import { clampColorToSpace } from "./utils/clampColorToSpace";
import { chromaLimits } from "./utils/chromaLimits";
import { lightnessAndPatch } from "./light/lightnessAndPatch";
import { cssToApcach } from "./apcah/cssToApcach";
import { calcContrastFromPreparedColors } from "./calc/calcContrastFromPreparedColors";

// API

function setContrast(
  //
  colorInApcach: Apcach,
  cr: ContrastRatio | ((cr: number) => number)
) {
  let newContrastConfig: ContrastConfig = colorInApcach.contrastConfig;
  if (typeof cr === "number") {
    newContrastConfig.cr = clipContrast(cr);
  } else if (typeof cr === "function") {
    let newCr = cr(newContrastConfig.cr);
    newContrastConfig.cr = clipContrast(newCr);
  } else {
    throw new Error("Invalid format of contrast value");
  }
  return apcach(
    newContrastConfig,
    colorInApcach.chroma,
    colorInApcach.hue,
    colorInApcach.alpha,
    colorInApcach.colorSpace
  );
}

function setChroma(colorInApcach, c: ChromaExpr2): Apcach {
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

function setHue(
  //
  colorInApcach: Apcach,
  h: HueExpr
) {
  let newHue: number;
  if (typeof h === "number") {
    newHue = clipHue(h);
  } else if (typeof h === "function") {
    let newRawHue = h(colorInApcach.hue);
    newHue = clipHue(newRawHue);
  } else {
    throw new Error("Invalid format of hue value");
  }
  return apcach(
    colorInApcach.contrastConfig,
    colorInApcach.chroma,
    newHue,
    colorInApcach.alpha,
    colorInApcach.colorSpace
  );
}

function maxChroma(chromaCap = 0.4) {
  return function (contrastConfig, hue, alpha, colorSpace) {
    let checkingChroma = chromaCap;
    let searchPatch = 0.4;
    let color;
    let colorIsValid = false;
    let chromaFound = false;
    let iteration = 0;
    while (!chromaFound && iteration < 30) {
      iteration++;
      let oldChroma = checkingChroma;
      let newPatchedChroma = oldChroma + searchPatch;
      checkingChroma = Math.max(Math.min(newPatchedChroma, chromaCap), 0);
      color = apcach(contrastConfig, checkingChroma, hue, alpha, colorSpace);

      // Check if the new color is valid
      let newColorIsValid = inColorSpace(color, colorSpace);
      if (iteration === 1 && !newColorIsValid) {
        searchPatch *= -1;
      } else if (newColorIsValid !== colorIsValid) {
        // Over shooot
        searchPatch /= -2;
      }
      colorIsValid = newColorIsValid;
      if (checkingChroma <= 0 && !colorIsValid) {
        // Contrast is too high, return invalid color
        color.chroma = 0;
        return color;
      } else if (
        (Math.abs(searchPatch) <= 0.001 || checkingChroma === chromaCap) &&
        colorIsValid
      ) {
        if (checkingChroma <= 0) {
          color.chroma = 0;
        }
        chromaFound = true;
      }
    }
    return color;
  };
}

function apcachToCss(color, format) {
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

function calcContrast(
  fgColor: ColorInCSSFormat,
  bgColor: ColorInCSSFormat,
  contrastModel: ContrastModel = "apca",
  colorSpace: ColorSpace = "p3"
) {
  // Background color
  let bgColorClamped = clampColorToSpace(bgColor, colorSpace);
  let bgColorComps = colorToComps(bgColorClamped, contrastModel, colorSpace);

  // Foreground color
  let fgColorClamped = clampColorToSpace(fgColor, colorSpace);
  let fgColorComps = colorToComps(fgColorClamped, contrastModel, colorSpace);
  fgColorComps = blendCompColors(fgColorComps, bgColorComps);

  // Caclulate contrast
  return Math.abs(
    calcContrastFromPreparedColors(
      fgColorComps,
      bgColorComps,
      contrastModel,
      colorSpace
    )
  );
}

function inColorSpace(
  //
  color,
  colorSpace = "p3"
) {
  colorSpace = colorSpace === "srgb" ? "rgb" : colorSpace;
  if (isValidApcach(color)) {
    let colorCopy = Object.assign({}, color);
    colorCopy.lightness =
      colorCopy.lightness === 1 ? 0.9999999 : colorCopy.lightness; // Fixes wrons inGumut calculation
    let cssColor = apcachToCss(colorCopy, "oklch");
    return inGamut(colorSpace)(cssColor);
  } else {
    let oklch = convertToOklch_orThrow(color);
    log("culori > convertToOklch /// 307");
    oklch.l = oklch.l === 1 ? 0.9999999 : oklch.l; // Fixes wrons inGumut calculation

    return inGamut(colorSpace)(oklch);
  }
}

// Private

function internalContrastConfig(
  contrastConfig: ContrastConfig,
  colorSpace: ColorSpace
): ContrastConfig {
  let config = {
    contrastModel: contrastConfig.contrastModel,
    cr: contrastConfig.cr,
    apcachIsOnFg: contrastConfig.fgColor === "apcach",
  };
  let colorAntagonistOriginal = config.apcachIsOnFg
    ? contrastConfig.bgColor
    : contrastConfig.fgColor;
  let colorAntagonistClamped = clampColorToSpace(
    colorAntagonistOriginal,
    colorSpace
  );
  let colorAntagonistPrepared = colorToComps(
    colorAntagonistClamped,
    contrastConfig.contrastModel,
    colorSpace
  );

  // Drop alpha if antagonist is on bg
  if (config.apcachIsOnFg) {
    colorAntagonistPrepared.alpha = 1;
  }
  config.colorAntagonist = colorAntagonistPrepared;
  config.searchDirection = contrastConfig.searchDirection;
  return config;
}

function colorToComps(
  //
  color: Color,
  contrastModel: ContrastModel,
  colorSpace: ColorSpace
) {
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

// ----------------------------------------------------------------------
// 💬 2024-06-16 rvion
// | probably not a good way to do things here.
// | we should really move toward using proper classes
function isValidApcach(el: Apcach): el is Apcach {
  return (
    el.contrastConfig !== undefined &&
    el.alpha !== undefined &&
    el.chroma !== undefined &&
    el.hue !== undefined &&
    el.lightness !== undefined
  );
}

function contrastFromConfig(
  //
  color: PreparedColor,
  contrastConfig: ContrastConfig_WTF,
  colorSpace: ColorSpace
) {
  // Deside the position of the color
  let fgColor: PreparedColor;
  let bgColor: PreparedColor;
  if (contrastConfig.apcachIsOnFg) {
    bgColor = contrastConfig.colorAntagonist;
    fgColor = blendCompColors(color, bgColor);
  } else {
    fgColor = contrastConfig.colorAntagonist;
    bgColor = color;
  }

  // Caclulate contrast
  const contrast = calcContrastFromPreparedColors(
    fgColor,
    bgColor,
    contrastConfig.contrastModel,
    colorSpace
  );

  return Math.abs(contrast);
}

export function rgb1to256(value) {
  return Math.round(parseFloat(value.toFixed(4)) * 255);
}

function calcLightness(
  //
  contrastConfig: ContrastConfig,
  chroma: number,
  hue: number,
  colorSpace: ColorSpace
) {
  // log(
  //   "CALC LIGHNTESS chroma: " +
  //     chroma +
  //     " colorSpace: " +
  //     colorSpace +
  //     " contrastConfig: " +
  //     JSON.stringify(contrastConfig)
  // );
  let deltaContrast = 0;
  let { lightness, lightnessPatch } = lightnessAndPatch(contrastConfig);
  let factContrast = 1000;
  let factLightness = 0;
  let iteration = 0;
  let lightnessFound = false;
  let chromaRange = chromaLimits(contrastConfig);
  let searchWindow = { low: 0, top: 1 };

  while (!lightnessFound && iteration < 20) {
    iteration++;
    log("--- ITERATION: " + iteration);
    // Calc new lightness to check
    let newLightness = lightness;
    if (iteration > 1) {
      newLightness += lightnessPatch;
    }

    // Cap new lightness
    newLightness = Math.max(
      Math.min(newLightness, chromaRange.upper),
      chromaRange.lower
    );

    // Compose color with the lightness to check
    let checkingColor =
      "oklch(" + newLightness + " " + chroma + " " + hue + ")";
    let checkingColorClamped = clampColorToSpace(checkingColor, colorSpace);

    let checkingColorComps = colorToComps(
      checkingColorClamped,
      contrastConfig.contrastModel,
      colorSpace
    );

    // Calculate contrast of this color
    let calcedContrast = contrastFromConfig(
      checkingColorComps,
      contrastConfig,
      colorSpace
    );
    let newDeltaContrast = contrastConfig.cr - calcedContrast;

    // Check for edge case
    if (
      iteration === 1 &&
      calcedContrast < contrastConfig.cr &&
      contrastConfig.searchDirection !== "auto"
    ) {
      factLightness = lightness;
      lightnessFound = true;
    }

    // log(
    //   "- CR wanted: " +
    //     contrastConfig.cr +
    //     " fact: " +
    //     calcedContrast +
    //     " delta: " +
    //     newDeltaContrast +
    //     " /// LIGHTNESS old: " +
    //     lightness +
    //     " patch: " +
    //     lightnessPatch +
    //     " new: " +
    //     newLightness +
    //     " in color space? " +
    //     inGamut(colorSpace === "p3" ? "p3" : "rgb")(checkingColor)
    // );

    // Save valid lightness–the one giving fact contrast higher than the desired one
    // It's needed to avoid returning lightness that gives contrast lower than the requested
    if (calcedContrast >= contrastConfig.cr && calcedContrast < factContrast) {
      factContrast = calcedContrast;
      factLightness = newLightness;
      // log(
      //   "+ lightness saved: " + factLightness + " contrast: " + calcedContrast
      // );
    }

    // Flip the search Patch
    if (
      deltaContrast !== 0 &&
      signOf(newDeltaContrast) !== signOf(deltaContrast)
    ) {
      // log("----- lightnessPatch switch");
      if (lightnessPatch > 0) {
        searchWindow.top = newLightness;
      } else {
        searchWindow.low = newLightness;
      }
      // log("searchWindow: " + searchWindow.low + " / " + searchWindow.top);
      lightnessPatch = -lightnessPatch / 2;
    } else if (
      newLightness + lightnessPatch === searchWindow.low ||
      newLightness + lightnessPatch === searchWindow.top
    ) {
      // log("----- lightnessPatch / 2");
      lightnessPatch = lightnessPatch / 2;
    }

    // Check if the lightness is found
    if (
      searchWindow.top - searchWindow.low < 0.001 ||
      (iteration > 1 && newLightness === lightness)
    ) {
      lightnessFound = true;
    }

    // Save valid chroma and deltacontrast
    deltaContrast = newDeltaContrast;

    lightness = newLightness;
  }
  // log(
  //   "LIGHTNESS FOUND in " +
  //     iteration +
  //     " iterations. Chroma " +
  //     chroma +
  //     " lightness " +
  //     factLightness +
  //     " contrast: " +
  //     factContrast +
  //     " wanted: " +
  //     contrastConfig.cr +
  //     " lightnessPatch: " +
  //     lightnessPatch
  // );
  return Math.min(Math.max(factLightness, 0), 100);
}

export {
  apcach,
  apcachToCss,
  calcContrast,
  crTo,
  crToBg,
  crToBgBlack,
  crToBgWhite,
  crToFg,
  crToFgBlack,
  crToFgWhite,
  cssToApcach,
  inColorSpace,
  maxChroma,
  setChroma,
  setContrast,
  setHue,
};
