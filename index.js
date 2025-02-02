import { APCAcontrast, displayP3toY, sRGBtoY } from "apca-w3";
import {
  clampChroma,
  differenceEuclidean,
  inGamut,
  parse,
  toGamut,
} from "culori";
import {
  converter,
  formatCss,
  formatHex,
  formatRgb,
  modeOklch,
  modeP3,
  useMode,
} from "culori/fn";
import { rgb } from "wcag-contrast";

useMode(modeP3);
useMode(modeOklch);

const LOG_ON = false;

const convertToOklch = converter("oklch");
const convertToP3 = converter("p3");
const convertToRgb = converter("rgb");
const inP3 = inGamut("p3");
const inSrgb = inGamut("rgb");
const toP3 = toGamut("p3", "oklch", differenceEuclidean("oklch"), 0);

// API

function apcach(contrast, chroma, hue, alpha = 100, colorSpace = "p3") {
  // Check for hue
  hue = hue === undefined || hue === null ? 0 : parseFloat(hue);
  // Compose contrast config
  let contrastConfig = contrastToConfig(contrast);
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
      alpha,
      chroma,
      colorSpace,
      contrastConfig,
      hue,
      lightness,
    };
  }
}

function cssToApcach(
  color,
  antagonist,
  colorSpace = "p3",
  contrastModel = "apca"
) {
  if (color === undefined) {
    throw new Error("Color is undefined");
  }

  if ("bg" in antagonist || "fg" in antagonist) {
    let fgColor = antagonist.fg !== undefined ? antagonist.fg : color;
    fgColor = clapmColorToSpace(fgColor, colorSpace);
    let bgColor = antagonist.bg !== undefined ? antagonist.bg : color;
    bgColor = clapmColorToSpace(bgColor, colorSpace);

    let crFunction = antagonist.fg !== undefined ? crToFg : crToBg;
    let antagonistColor =
      antagonist.fg !== undefined ? antagonist.fg : antagonist.bg;
    let contrast;
    contrast = calcContrast(fgColor, bgColor, contrastModel, colorSpace);

    // Compose apcach
    let colorClamped = clapmColorToSpace(color, colorSpace);
    let colorComp = convertToOklch(colorClamped);
    let antagonistColorOklch = convertToOklch(antagonistColor);
    let isColorLighter = colorComp.l > antagonistColorOklch.l;
    let searchDirection = isColorLighter ? "lighter" : "darker";
    return apcach(
      crFunction(antagonistColor, contrast, contrastModel, searchDirection),
      colorComp.c,
      colorComp.h ?? 0,
      colorComp.alpha ?? 1,
      colorSpace
    );
  } else {
    throw new Error("antagonist color is not provided");
  }
}

function crToBg(bgColor, cr, contrastModel = "apca", searchDirection = "auto") {
  return {
    bgColor: stringToColor(bgColor),
    contrastModel,
    cr,
    fgColor: "apcach",
    searchDirection,
  };
}

function crTo(bgColor, cr, contrastModel = "apca", searchDirection = "auto") {
  return crToBg(bgColor, cr, contrastModel, searchDirection);
}

function crToBgWhite(cr, contrastModel = "apca", searchDirection = "auto") {
  return crToBg("white", cr, contrastModel, searchDirection);
}

function crToBgBlack(cr, contrastModel = "apca", searchDirection = "auto") {
  return crToBg("black", cr, contrastModel, searchDirection);
}

function crToFg(fgColor, cr, contrastModel = "apca", searchDirection = "auto") {
  return {
    bgColor: "apcach",
    contrastModel,
    cr,
    fgColor: stringToColor(fgColor),
    searchDirection,
  };
}

function crToFgWhite(cr, contrastModel = "apca", searchDirection = "auto") {
  return crToFg("white", cr, contrastModel, searchDirection);
}

function crToFgBlack(cr, contrastModel = "apca", searchDirection = "auto") {
  return crToFg("black", cr, contrastModel, searchDirection);
}

function setContrast(colorInApcach, cr) {
  let newContrastConfig = colorInApcach.contrastConfig;
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

function setChroma(colorInApcach, c) {
  let newChroma;
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

function setHue(colorInApcach, h) {
  let newHue;
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
    case "figma-p3": {
      let p3Parsed = parse(apcachToCss(color, "p3"));
      return (
        floatingPointToHex(p3Parsed.r) +
        floatingPointToHex(p3Parsed.g) +
        floatingPointToHex(p3Parsed.b)
      );
    }
    case "hex":
      return formatHex(apcachToCss(color, "oklch"));
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
    case "p3": {
      log("culori > convertToP3 /// apcachToCss");
      return formatCss(convertToP3(apcachToCss(color, "oklch")));
    }
    case "rgb":
      return formatRgb(apcachToCss(color, "oklch"));
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

function internalContrastConfig(contrastConfig, colorSpace) {
  let config = {
    contrastModel: contrastConfig.contrastModel,
    cr: contrastConfig.cr,
  };
  config.apcachIsOnFg = contrastConfig.fgColor === "apcach";
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

function isValidApcach(el) {
  return (
    el.contrastConfig !== undefined &&
    el.alpha !== undefined &&
    el.chroma !== undefined &&
    el.hue !== undefined &&
    el.lightness !== undefined
  );
}

function isValidContrastConfig(el) {
  return (
    "bgColor" in el && "fgColor" in el && "cr" in el && "contrastModel" in el
  );
}

function stringToColor(str) {
  switch (str) {
    case "black":
      return "oklch(0 0 0)";
    case "white":
      return "oklch(1 0 0)";
    default:
      return str;
  }
}

function clapmColorToSpace(colorInCssFormat, colorSpace) {
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

function contrastFromConfig(color, contrastConfig, colorSpace) {
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

function contrastToConfig(rawContrast) {
  if (typeof rawContrast === "number") {
    return crToBg("white", rawContrast);
  } else if (isValidContrastConfig(rawContrast)) {
    return rawContrast;
  } else {
    throw new Error("Invalid contrast format");
  }
}

function calcLightness(contrastConfig, chroma, hue, colorSpace) {
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
    case "darker": {
      lightness = 0;
      lightnessPatch = (antagonistLightness - lightness) / 2;
      break;
    }
    case "lighter": {
      lightness = 1;
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

function lightnessFromAntagonist(contrastConfig) {
  let antagonist;
  if (contrastConfig.fgColor === "apcach") {
    antagonist = contrastConfig.bgColor;
  } else {
    antagonist = contrastConfig.fgColor;
  }
  log("culori > convertToOklch /// lightnessFromAntagonist");
  return convertToOklch(antagonist).l;
}

function healOklch(oklch) {
  oklch.l = oklch.l === undefined ? 0 : roundToDP(oklch.l, 7);
  oklch.c = oklch.c === undefined ? 0 : roundToDP(oklch.c, 16);
  oklch.h = oklch.h === undefined ? 0 : roundToDP(oklch.h, 16);
  oklch.alpha = oklch.alpha === undefined ? 1 : roundToDP(oklch.alpha, 4);
  return oklch;
}

function roundToDP(number, dp) {
  return Math.floor(number * 10 ** dp) / 10 ** dp;
}

function signOf(number) {
  return number / Math.abs(number);
}

function clipContrast(cr) {
  return Math.max(Math.min(cr, 108), 0);
}

function clipChroma(c) {
  return Math.max(Math.min(c, 0.37), 0);
}

function clipHue(h) {
  return Math.max(Math.min(h, 360), 0);
}

function contrastIsLegal(cr, contrastModel) {
  return (
    (Math.abs(cr) >= 8 && contrastModel === "apca") ||
    (Math.abs(cr) >= 1 && contrastModel === "wcag")
  );
}

function floatingPointToHex(float) {
  return Math.round(255 * float)
    .toString(16)
    .padStart(2, "0");
}

function blendCompColors(fgCompColor, bgCompColor) {
  if (fgCompColor.alpha === undefined || fgCompColor.alpha === 1) {
    return fgCompColor;
  }

  // Blend color with the bg
  return {
    b: blendChannel(fgCompColor.b, bgCompColor.b, fgCompColor.alpha),
    g: blendChannel(fgCompColor.g, bgCompColor.g, fgCompColor.alpha),
    r: blendChannel(fgCompColor.r, bgCompColor.r, fgCompColor.alpha),
  };
}

function blendChannel(channelFg, channelBg, alpha) {
  return channelBg + (channelFg - channelBg) * alpha;
}

function log(srt) {
  if (LOG_ON) {
    // eslint-disable-next-line no-console
    console.log(srt);
  }
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
