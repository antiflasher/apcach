import { APCAcontrast, displayP3toY, sRGBtoY } from "apca-w3";
import {
  contrastToConfig,
  crTo,
  crToBgBlack,
  crToBgWhite,
  crToFgBlack,
  crToFgWhite,
  type ContrastConfig,
  type ContrastConfig_Ext,
} from "./contrastConfig";

// 🔴 todo: patch types
// @ts-ignore
import { clampChroma, inGamut, parse } from "culori";

import { formatCss, formatHex, formatRgb } from "culori/fn";
import { rgb } from "wcag-contrast";
import { lightnessFromAntagonist } from "./aaa/lightnessFromAntagonist";
import {
  convertToOklch,
  convertToP3,
  convertToRgb,
  inP3,
  inSrgb,
  toP3,
} from "./culoriUtils";
import { log } from "./utils/log";
import {
  Apcach,
  ChromaExpr,
  ColorSpace,
  HueExpr,
  Maybe,
  type ChromaExpr2,
  type ColorInCSSFormat,
  type ContrastRatio,
} from "./types";
import {
  blendCompColors,
  clipChroma,
  clipContrast,
  clipHue,
  contrastIsLegal,
  floatingPointToHex,
  healOklch,
  signOf,
} from "./utils/misc";

// API

function apcach(
  //
  contrast: ContrastConfig_Ext,
  chroma: ChromaExpr,
  hue?: Maybe<number | string>,
  alpha: number = 100,
  colorSpace: ColorSpace = "p3"
): Apcach {
  // 💬 2024-06-16 rvion:
  // | checking if something is either null or undefined should be done
  // | in one go by doing `hue == null` (two equal sign).
  // | (almost the only case when one want to use `==` instead of `===`).

  // 💬 2024-06-16 rvion:
  // | not sure if parseFloat is guaranteed to accept number
  // | probably better to only pass strings to it

  // Check for hue
  hue =
    hue == null //
      ? 0
      : typeof hue === "number"
      ? hue
      : parseFloat(hue);

  // Compose contrast config
  const contrastConfig: ContrastConfig = contrastToConfig(contrast);

  if (typeof chroma === "function") {
    // Max chroma case
    return chroma(contrastConfig, hue, alpha, colorSpace);
  } else {
    // Constant chroma case
    let lightness;
    if (contrastIsLegal(contrastConfig.cr, contrastConfig.contrastModel)) {
      lightness = calcLightness(
        internalContrastConfig(contrastConfig, colorSpace),
        parseFloat(chroma),
        parseFloat(hue),
        colorSpace
      );
    } else {
      // APCA has a cut off at the value about 8
      lightness = lightnessFromAntagonist(contrastConfig);
    }

    return {
      lightness,
      chroma,
      hue,
      //
      alpha,
      //
      colorSpace,
      contrastConfig,
    };
  }
}

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

function setHue(colorInApcach: Apcach, h: HueExpr) {
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
  fgColor,
  bgColor,
  contrastModel = "apca",
  colorSpace = "p3"
) {
  // Background color
  let bgColorClamped = clapmColorToSpace(bgColor, colorSpace);
  let bgColorComps = colorToComps(bgColorClamped, contrastModel, colorSpace);

  // Foreground color
  let fgColorClamped = clapmColorToSpace(fgColor, colorSpace);
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

function inColorSpace(color, colorSpace = "p3") {
  colorSpace = colorSpace === "srgb" ? "rgb" : colorSpace;
  if (isValidApcach(color)) {
    let colorCopy = Object.assign({}, color);
    colorCopy.lightness =
      colorCopy.lightness === 1 ? 0.9999999 : colorCopy.lightness; // Fixes wrons inGumut calculation
    let cssColor = apcachToCss(colorCopy, "oklch");
    return inGamut(colorSpace)(cssColor);
  } else {
    let oklch = convertToOklch(color);
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
  let colorAntagonistClamped = clapmColorToSpace(
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

function colorToComps(color, contrastModel, colorSpace) {
  if (contrastModel === "apca" && colorSpace === "p3") {
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

// ----------------------------------------------------------------------
export function clapmColorToSpace(
  //
  colorInCssFormat: ColorInCSSFormat,
  colorSpace: ColorSpace
) {
  if (colorSpace === "p3") {
    log("culori > inP3 /// clapmColorToSpace");
    if (inP3(colorInCssFormat)) {
      return colorInCssFormat;
    } else {
      let oklch;
      if (colorInCssFormat.slice(4) === "oklch") {
        oklch = colorInCssFormat;
      } else {
        oklch = convertToOklch(colorInCssFormat);
        log("culori > convertToOklch /// 394");
        oklch = healOklch(oklch);
      }
      // Clamp color to p3 gamut
      log("culori > toGamut(p3)");
      return toP3(oklch);
    }
  } else {
    // eslint-disable-next-line no-lonely-if
    log("culori > inSrgb /// clapmColorToSpace");
    if (inSrgb(colorInCssFormat)) {
      return colorInCssFormat;
    } else {
      let oklch = convertToOklch(colorInCssFormat);
      log("culori > convertToOklch /// 407");
      oklch = clampChroma(oklch, "oklch");
      log("culori > clampChroma /// 409");
      return oklch;
    }
  }
}

function contrastFromConfig(
  //
  color,
  contrastConfig,
  colorSpace
) {
  // Deside the position of the color
  let fgColor;
  let bgColor;
  if (contrastConfig.apcachIsOnFg) {
    bgColor = contrastConfig.colorAntagonist;
    fgColor = blendCompColors(color, bgColor);
  } else {
    fgColor = contrastConfig.colorAntagonist;
    bgColor = color;
  }

  // Caclulate contrast
  return Math.abs(
    calcContrastFromPreparedColors(
      fgColor,
      bgColor,
      contrastConfig.contrastModel,
      colorSpace
    )
  );
}

function calcContrastFromPreparedColors(
  fgColor,
  bgColor,
  contrastModel,
  colorSpace
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

function calcApcaP3(fgP3, bgP3) {
  // Calculate Y
  let fgY = displayP3toY([
    Math.max(fgP3.r, 0),
    Math.max(fgP3.g, 0),
    Math.max(fgP3.b, 0),
  ]);

  let bgY = displayP3toY([
    Math.max(bgP3.r, 0),
    Math.max(bgP3.g, 0),
    Math.max(bgP3.b, 0),
  ]);

  return APCAcontrast(fgY, bgY);
}

function calcApcaSrgb(fgRgb, bgGrb) {
  // Calculate Y
  let fgY = sRGBtoY([
    Math.round(Math.max(fgRgb.r * 255, 0)),
    Math.round(Math.max(fgRgb.g * 255, 0)),
    Math.round(Math.max(fgRgb.b * 255, 0)),
  ]);

  let bgY = sRGBtoY([
    Math.round(Math.max(bgGrb.r * 255, 0)),
    Math.round(Math.max(bgGrb.g * 255, 0)),
    Math.round(Math.max(bgGrb.b * 255, 0)),
  ]);

  return APCAcontrast(fgY, bgY);
}

function calcWcag(fgRgb, bgRgb) {
  // Compose arrays
  let fgArray = [rgb1to256(fgRgb.r), rgb1to256(fgRgb.g), rgb1to256(fgRgb.b)];
  let bgArray = [rgb1to256(bgRgb.r), rgb1to256(bgRgb.g), rgb1to256(bgRgb.b)];

  return rgb(fgArray, bgArray);
}

function rgb1to256(value) {
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
    let checkingColorClamped = clapmColorToSpace(checkingColor, colorSpace);

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

function antagonistColorLightness(contrastConfig) {
  let oklch = convertToOklch(contrastConfig.colorAntagonist);
  log("culori > convertToOklch /// antagonistColorLightness");
  return oklch.l;
}

function chromaLimits(contrastConfig) {
  if (contrastConfig.searchDirection === "auto") {
    return { lower: 0, upper: 1 };
  }
  let pairColorLightness = antagonistColorLightness(contrastConfig);
  let upper =
    contrastConfig.searchDirection === "lighter" ? 1 : pairColorLightness;
  let lower =
    contrastConfig.searchDirection === "lighter" ? pairColorLightness : 0;
  return { lower, upper };
}

function lightnessAndPatch(contrastConfig) {
  let antagonistLightness = convertToOklch(contrastConfig.colorAntagonist).l;
  log("culori > convertToOklch /// lightnessAndPatch");
  let lightness;
  let lightnessPatch;

  switch (contrastConfig.searchDirection) {
    case "auto": {
      if (antagonistLightness < 0.5) {
        lightnessPatch = (1 - antagonistLightness) / -2;
        lightness = 1;
      } else {
        lightnessPatch = antagonistLightness / 2;
        lightness = 0;
      }
      break;
    }
    case "lighter": {
      lightness = 1;
      lightnessPatch = (antagonistLightness - lightness) / 2;
      break;
    }
    case "darker": {
      lightness = 0;
      lightnessPatch = (antagonistLightness - lightness) / 2;
      break;
    }
    default:
      throw new Error(
        "Invalid lightness search region. Supported values: 'auto', 'lighter', 'darker'"
      );
  }

  return { lightness, lightnessPatch };
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
