// src/contrast/contrastConfig.ts
var TO_FIND = Symbol("TO_FIND");

// src/culori-utils/culoriUtils.ts
import {
  differenceEuclidean,
  inGamut,
  toGamut
} from "culori";
import { converter, modeOklch, modeP3, useMode } from "culori/fn";
useMode(modeP3);
useMode(modeOklch);
var convertToOklch_orNull = converter("oklch");
var convertToOklch_orThrow = (color) => {
  const oklch = convertToOklch_orNull(color);
  if (!oklch)
    throw new Error("Could not convert to oklch");
  return oklch;
};
var convertToP3 = converter("p3");
var convertToRgb = converter("rgb");
var inP3 = inGamut("p3");
var toP3 = toGamut("p3", "oklch", differenceEuclidean("oklch"), 0);
var inSrgb = inGamut("rgb");
var toSrgb = toGamut("rgb", "oklch", differenceEuclidean("oklch"), 0);

// src/contrast/crTo.ts
function crToBg(bgColor, cr, contrastModel = "apca", searchDirection = "auto") {
  return {
    fgColor: TO_FIND,
    bgColor: _stringToColor(bgColor),
    cr,
    contrastModel,
    searchDirection
  };
}
function crToFg(fgColor, cr, contrastModel = "apca", searchDirection = "auto") {
  return {
    fgColor: _stringToColor(fgColor),
    bgColor: TO_FIND,
    cr,
    contrastModel,
    searchDirection
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
function crToFgWhite(cr, contrastModel = "apca", searchDirection = "auto") {
  return crToFg("white", cr, contrastModel, searchDirection);
}
function crToFgBlack(cr, contrastModel = "apca", searchDirection = "auto") {
  return crToFg("black", cr, contrastModel, searchDirection);
}
function _stringToColor(str) {
  switch (str) {
    case "black":
      return { mode: "oklch", l: 0, c: 0, h: 0 };
    case "white":
      return { mode: "oklch", l: 1, c: 0, h: 0 };
    default:
      return convertToOklch_orThrow(str);
  }
}

// src/contrast/contrastToConfig.ts
function contrastToConfig(rawContrast) {
  if (typeof rawContrast === "number")
    return crToBg("white", rawContrast);
  if (_isValidContrastConfig(rawContrast))
    return rawContrast;
  throw new Error("Invalid contrast format");
}
function _isValidContrastConfig(el) {
  return "bgColor" in el && "fgColor" in el && "cr" in el && "contrastModel" in el;
}

// src/contrast/isValidContrast.ts
function isValidContrast(cr, contrastModel) {
  return Math.abs(cr) >= 8 && contrastModel === "apca" || Math.abs(cr) >= 1 && contrastModel === "wcag";
}

// src/utils/assert.ts
var ASSERT_NUMBER = (x) => {
  if (typeof x !== "number")
    throw new Error("expected a number");
  if (isNaN(x))
    throw new Error("expected a number, got NaN");
  return x;
};
var ASSERT_EXAUSTED = (x, errMsg) => {
  throw new Error(`Unexpected value: ${x}; ${errMsg}`);
};

// src/utils/log.ts
var LOG_ON = false;
function log(srt) {
  if (LOG_ON) {
    console.log(srt);
  }
}

// src/clamp/_clampColorToP3.ts
function clampColorToP3(color) {
  log("culori > inP3 /// clampColorToSpace");
  if (inP3(color))
    return color;
  log("culori > toGamut(p3)");
  return toP3(color);
}

// src/clamp/_clampColorToSRGB.ts
function clampColorToSRGB(color) {
  log("culori > inSrgb /// clampColorToSpace");
  if (inSrgb(color))
    return color;
  return toSrgb(color);
}

// src/clamp/clampColorToSpace.ts
function clampColorToSpace(colorInCssFormat, colorSpace) {
  if (colorSpace === "p3")
    return clampColorToP3(colorInCssFormat);
  if (colorSpace === "rgb")
    return clampColorToSRGB(colorInCssFormat);
  if (colorSpace === "srgb")
    return clampColorToSRGB(colorInCssFormat);
  return ASSERT_EXAUSTED(colorSpace, "unknown colorSpace");
}

// src/culori-utils/colorToComps.ts
function colorToComps(color, contrastModel, colorSpace) {
  if (contrastModel === "apca" && colorSpace === "p3") {
    log("culori > convertToP3 /// colorToComps");
    return convertToP3(color);
  } else {
    log("culori > convertToRgb /// colorToComps");
    return convertToRgb(color);
  }
}

// src/contrast/prepareContrastConfig.ts
function prepareContrastConfig(contrastConfig, colorSpace) {
  const { bgColor, fgColor, contrastModel, searchDirection } = contrastConfig;
  const apcachIsOnFg = fgColor === TO_FIND;
  const colorAntagonistOriginal = apcachIsOnFg ? bgColor : fgColor;
  const colorAntagonistClamped = clampColorToSpace(colorAntagonistOriginal, colorSpace);
  const colorAntagonist = colorToComps(colorAntagonistClamped, contrastModel, colorSpace);
  if (apcachIsOnFg)
    colorAntagonist.alpha = 1;
  const config = {
    cr: contrastConfig.cr,
    contrastModel,
    searchDirection,
    apcachIsOnFg,
    colorAntagonist
  };
  return config;
}

// src/light/lightnessFromAntagonist.ts
function lightnessFromAntagonist(contrastConfig) {
  const antagonist = contrastConfig.fgColor === TO_FIND ? contrastConfig.bgColor : contrastConfig.fgColor;
  log("culori > convertToOklch /// lightnessFromAntagonist");
  const oklch = convertToOklch_orNull(antagonist);
  if (!oklch)
    throw new Error("Could not convert to oklch");
  return oklch.l;
}

// src/calc/calcApcaP3.ts
import { APCAcontrast, displayP3toY } from "apca-w3";
function calcApcaP3(fgP3, bgP3) {
  let fgY = displayP3toY([
    Math.max(fgP3.r, 0),
    Math.max(fgP3.g, 0),
    Math.max(fgP3.b, 0)
  ]);
  let bgY = displayP3toY([
    Math.max(bgP3.r, 0),
    Math.max(bgP3.g, 0),
    Math.max(bgP3.b, 0)
  ]);
  return ASSERT_NUMBER(APCAcontrast(fgY, bgY));
}

// src/calc/calcApcaSrgb.ts
import { APCAcontrast as APCAcontrast2, sRGBtoY } from "apca-w3";
function calcApcaSrgb(fgRgb, bgGrb) {
  let fgY = sRGBtoY([
    Math.round(Math.max(fgRgb.r * 255, 0)),
    Math.round(Math.max(fgRgb.g * 255, 0)),
    Math.round(Math.max(fgRgb.b * 255, 0))
  ]);
  let bgY = sRGBtoY([
    Math.round(Math.max(bgGrb.r * 255, 0)),
    Math.round(Math.max(bgGrb.g * 255, 0)),
    Math.round(Math.max(bgGrb.b * 255, 0))
  ]);
  return ASSERT_NUMBER(APCAcontrast2(fgY, bgY));
}

// src/calc/calcWcag.ts
import { rgb } from "wcag-contrast";

// src/utils/rgb1to256.ts
function rgb1to256(value) {
  return Math.round(parseFloat(value.toFixed(4)) * 255);
}

// src/calc/calcWcag.ts
function calcWcag(fgRgb, bgRgb) {
  const fgArray = [
    rgb1to256(fgRgb.r),
    rgb1to256(fgRgb.g),
    rgb1to256(fgRgb.b)
  ];
  const bgArray = [
    rgb1to256(bgRgb.r),
    rgb1to256(bgRgb.g),
    rgb1to256(bgRgb.b)
  ];
  return rgb(fgArray, bgArray);
}

// src/calc/calcContrastFromPreparedColors.ts
function calcContrastFromPreparedColors(fgColor, bgColor, contrastModel, colorSpace) {
  if (contrastModel === "apca") {
    if (colorSpace === "p3")
      return calcApcaP3(fgColor, bgColor);
    if (colorSpace === "rgb")
      return calcApcaSrgb(fgColor, bgColor);
    if (colorSpace === "srgb")
      return calcApcaSrgb(fgColor, bgColor);
    return ASSERT_EXAUSTED(colorSpace, "unknown colorSpace");
  }
  if (contrastModel === "wcag")
    return calcWcag(fgColor, bgColor);
  return ASSERT_EXAUSTED(contrastModel, 'Invalid contrast model. Suported models: "apca", "wcag"');
}

// src/utils/misc.ts
function signOf(number) {
  return number >= 0 ? 1 : -1;
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
function floatingPointToHex(float) {
  return Math.round(255 * float).toString(16).padStart(2, "0");
}
function blendCompColors(fgCompColor, bgCompColor) {
  if (fgCompColor.alpha == null || fgCompColor.alpha === 1) {
    return fgCompColor;
  }
  if (fgCompColor.r > 1 || bgCompColor.r > 1 || fgCompColor.g > 1 || bgCompColor.g > 1 || fgCompColor.b > 1 || bgCompColor.b > 1) {
    console.log(`[\u{1F920}] `, fgCompColor, bgCompColor);
  }
  return {
    b: _blendChannel(fgCompColor.b, bgCompColor.b, fgCompColor.alpha),
    g: _blendChannel(fgCompColor.g, bgCompColor.g, fgCompColor.alpha),
    r: _blendChannel(fgCompColor.r, bgCompColor.r, fgCompColor.alpha)
  };
}
function _blendChannel(channelFg, channelBg, alpha) {
  return channelBg + (channelFg - channelBg) * alpha;
}

// src/scoring/getContrastScoreForObjective.ts
function getContrastScoreForObjective(color, contrastConfig, colorSpace) {
  let fgColor;
  let bgColor;
  if (contrastConfig.apcachIsOnFg) {
    bgColor = contrastConfig.colorAntagonist;
    fgColor = blendCompColors(color, bgColor);
  } else {
    fgColor = contrastConfig.colorAntagonist;
    bgColor = color;
  }
  const contrast = calcContrastFromPreparedColors(fgColor, bgColor, contrastConfig.contrastModel, colorSpace);
  return Math.abs(contrast);
}

// src/light/antagonistColorLightness.ts
function antagonistColorLightness(contrastConfig) {
  let oklch = convertToOklch_orThrow(contrastConfig.colorAntagonist);
  log("culori > convertToOklch /// antagonistColorLightness");
  return oklch.l;
}

// src/utils/chromaLimits.ts
function chromaLimits(contrastConfig) {
  if (contrastConfig.searchDirection === "auto") {
    return { lower: 0, upper: 1 };
  }
  let pairColorLightness = antagonistColorLightness(contrastConfig);
  let upper = contrastConfig.searchDirection === "lighter" ? 1 : pairColorLightness;
  let lower = contrastConfig.searchDirection === "lighter" ? pairColorLightness : 0;
  return { lower, upper };
}

// src/light/lightnessAndPatch.ts
function lightnessAndPatch(contrastConfig) {
  let antagonistLightness = convertToOklch_orThrow(contrastConfig.colorAntagonist).l;
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
      throw new Error("Invalid lightness search region. Supported values: 'auto', 'lighter', 'darker'");
  }
  return { lightness, lightnessPatch };
}

// src/scoring/calcLightness.ts
function calcLightness(contrastConfig, chroma, hue, colorSpace) {
  let deltaContrast = 0;
  let { lightness, lightnessPatch } = lightnessAndPatch(contrastConfig);
  let factContrast = 1e3;
  let factLightness = 0;
  let iteration = 0;
  let lightnessFound = false;
  let chromaRange = chromaLimits(contrastConfig);
  let searchWindow = { low: 0, top: 1 };
  while (!lightnessFound && iteration < 20) {
    iteration++;
    log("--- ITERATION: " + iteration);
    let newLightness = lightness;
    if (iteration > 1) {
      newLightness += lightnessPatch;
    }
    newLightness = Math.max(Math.min(newLightness, chromaRange.upper), chromaRange.lower);
    let checkingColor = { mode: "oklch", l: newLightness, c: chroma, h: hue };
    let checkingColorClamped = clampColorToSpace(checkingColor, colorSpace);
    let checkingColorComps = colorToComps(checkingColorClamped, contrastConfig.contrastModel, colorSpace);
    let calcedContrast = getContrastScoreForObjective(checkingColorComps, contrastConfig, colorSpace);
    let newDeltaContrast = contrastConfig.cr - calcedContrast;
    if (iteration === 1 && calcedContrast < contrastConfig.cr && contrastConfig.searchDirection !== "auto") {
      factLightness = lightness;
      lightnessFound = true;
    }
    if (calcedContrast >= contrastConfig.cr && calcedContrast < factContrast) {
      factContrast = calcedContrast;
      factLightness = newLightness;
    }
    if (deltaContrast !== 0 && signOf(newDeltaContrast) !== signOf(deltaContrast)) {
      if (lightnessPatch > 0) {
        searchWindow.top = newLightness;
      } else {
        searchWindow.low = newLightness;
      }
      lightnessPatch = -lightnessPatch / 2;
    } else if (newLightness + lightnessPatch === searchWindow.low || newLightness + lightnessPatch === searchWindow.top) {
      lightnessPatch = lightnessPatch / 2;
    }
    if (searchWindow.top - searchWindow.low < 1e-3 || iteration > 1 && newLightness === lightness) {
      lightnessFound = true;
    }
    deltaContrast = newDeltaContrast;
    lightness = newLightness;
  }
  return Math.min(Math.max(factLightness, 0), 100);
}

// src/apcach/apcach.ts
function apcach(contrast, chroma, hue = 0, alpha = 100, colorSpace = "p3") {
  hue = typeof hue === "number" ? hue : parseFloat(hue);
  const contrastConfig = contrastToConfig(contrast);
  if (typeof chroma === "function")
    return chroma(contrastConfig, hue, alpha, colorSpace);
  const validContrast = isValidContrast(contrastConfig.cr, contrastConfig.contrastModel);
  const lightness = validContrast ? calcLightness(prepareContrastConfig(contrastConfig, colorSpace), chroma, hue, colorSpace) : lightnessFromAntagonist(contrastConfig);
  return { lightness, chroma, hue, alpha, colorSpace, contrastConfig };
}

// src/culori-utils/inColorSpace.ts
import { inGamut as inGamut2 } from "culori";

// src/apcach/isValidApcach.ts
function isValidApcach(el) {
  if (typeof el === "string")
    return false;
  return el.contrastConfig != null && el.alpha != null && el.chroma != null && el.hue != null && el.lightness != null;
}

// src/convert/apcachToCss.ts
import { parse } from "culori";
import { formatCss, formatHex, formatRgb } from "culori/fn";
function apcachToCss(color, format) {
  switch (format) {
    case "oklch":
      return "oklch(" + color.lightness * 100 + "% " + color.chroma + " " + color.hue + ")";
    case "rgb":
      return formatRgb(apcachToCss(color, "oklch"));
    case "hex":
      return formatHex(apcachToCss(color, "oklch"));
    case "p3": {
      log("culori > convertToP3 /// apcachToCss");
      return formatCss(convertToP3(apcachToCss(color, "oklch")));
    }
    case "figma-p3": {
      const p3Str = apcachToCss(color, "p3");
      if (p3Str == null)
        throw new Error("\u274C Expected a valid color");
      const p3Parsed = parse(p3Str);
      if (p3Parsed == null)
        throw new Error("\u274C Expected valid p3 string");
      if (p3Parsed.mode !== "p3")
        throw new Error("\u274C Expected p3 color");
      return floatingPointToHex(p3Parsed.r) + floatingPointToHex(p3Parsed.g) + floatingPointToHex(p3Parsed.b);
    }
  }
  return apcachToCss(color, "oklch");
}

// src/culori-utils/inColorSpace.ts
function inColorSpace(color, colorSpace = "p3") {
  colorSpace = colorSpace === "srgb" ? "rgb" : colorSpace;
  if (isValidApcach(color)) {
    let colorCopy = Object.assign({}, color);
    colorCopy.lightness = colorCopy.lightness === 1 ? 0.9999999 : colorCopy.lightness;
    let cssColor = apcachToCss(colorCopy, "oklch");
    return inGamut2(colorSpace)(cssColor);
  } else {
    let oklch = convertToOklch_orThrow(color);
    log("culori > convertToOklch /// 307");
    oklch.l = oklch.l === 1 ? 0.9999999 : oklch.l;
    return inGamut2(colorSpace)(oklch);
  }
}

// src/apcach/maxChroma.ts
function maxChroma(chromaCap = 0.4) {
  return function(contrastConfig, hue, alpha, colorSpace) {
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
      let newColorIsValid = inColorSpace(color, colorSpace);
      if (iteration === 1 && !newColorIsValid) {
        searchPatch *= -1;
      } else if (newColorIsValid !== colorIsValid) {
        searchPatch /= -2;
      }
      colorIsValid = newColorIsValid;
      if (checkingChroma <= 0 && !colorIsValid) {
        color.chroma = 0;
        return color;
      } else if ((Math.abs(searchPatch) <= 1e-3 || checkingChroma === chromaCap) && colorIsValid) {
        if (checkingChroma <= 0) {
          color.chroma = 0;
        }
        chromaFound = true;
      }
    }
    return color;
  };
}

// src/apcach/setHue.ts
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
  return apcach(colorInApcach.contrastConfig, colorInApcach.chroma, newHue, colorInApcach.alpha, colorInApcach.colorSpace);
}

// src/apcach/setChroma.ts
function setChroma(apc, c) {
  let newChroma;
  if (typeof c === "number") {
    newChroma = clipChroma(c);
  } else if (typeof c === "function") {
    let newRawChroma = c(apc.chroma);
    newChroma = clipChroma(newRawChroma);
  } else {
    throw new Error("Invalid format of chroma value");
  }
  return apcach(apc.contrastConfig, newChroma, apc.hue, apc.alpha, apc.colorSpace);
}

// src/apcach/setContrast.ts
function setContrast(apc, cr) {
  let newContrastConfig = apc.contrastConfig;
  if (typeof cr === "number") {
    newContrastConfig.cr = clipContrast(cr);
  } else if (typeof cr === "function") {
    let newCr = cr(newContrastConfig.cr);
    newContrastConfig.cr = clipContrast(newCr);
  } else {
    throw new Error("Invalid format of contrast value");
  }
  return apcach(newContrastConfig, apc.chroma, apc.hue, apc.alpha, apc.colorSpace);
}

// src/convert/cssToApcach.ts
import { parse as parse2 } from "culori";

// src/scoring/calcContrast.ts
function calcContrast(fgColor, bgColor, contrastModel = "apca", colorSpace = "p3") {
  let bgColorClamped = clampColorToSpace(bgColor, colorSpace);
  let bgColorComps = colorToComps(bgColorClamped, contrastModel, colorSpace);
  let fgColorClamped = clampColorToSpace(fgColor, colorSpace);
  let fgColorComps = colorToComps(fgColorClamped, contrastModel, colorSpace);
  fgColorComps = blendCompColors(fgColorComps, bgColorComps);
  const contrast = calcContrastFromPreparedColors(fgColorComps, bgColorComps, contrastModel, colorSpace);
  return Math.abs(contrast);
}

// src/convert/cssToApcach.ts
function cssToApcach(colorStr, antagonist, colorSpace = "p3", contrastModel = "apca") {
  var _a, _b;
  if (colorStr == null)
    throw new Error("Color is undefined");
  const color = parse2(colorStr);
  if (color == null)
    throw new Error("Color is invalid");
  const fg_raw = antagonist.fg;
  const bg_raw = antagonist.bg;
  if (fg_raw == null && bg_raw == null)
    throw new Error("antagonist color is not provided");
  if (fg_raw != null && bg_raw != null)
    throw new Error("antagonist can't be both fb and bg");
  const fg = fg_raw != null ? parse2(fg_raw) : void 0;
  const bg = bg_raw != null ? parse2(bg_raw) : void 0;
  const fgColor = clampColorToSpace(fg != null ? fg : color, colorSpace);
  const bgColor = clampColorToSpace(bg != null ? bg : color, colorSpace);
  const crFunction = fg != null ? crToFg : crToBg;
  const antagonistColor = fg_raw != null ? fg_raw : bg_raw;
  const contrast = calcContrast(fgColor, bgColor, contrastModel, colorSpace);
  const colorClamped = clampColorToSpace(color, colorSpace);
  const colorComp = convertToOklch_orThrow(colorClamped);
  const antagonistColorOklch = convertToOklch_orThrow(antagonistColor);
  const isColorLighter = colorComp.l > antagonistColorOklch.l;
  const searchDirection = isColorLighter ? "lighter" : "darker";
  const contrastConfigXX = crFunction(antagonistColor, contrast, contrastModel, searchDirection);
  return apcach(contrastConfigXX, colorComp.c, (_a = colorComp.h) != null ? _a : 0, (_b = colorComp.alpha) != null ? _b : 1, colorSpace);
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
  setHue
};
