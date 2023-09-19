import { APCAcontrast, displayP3toY, sRGBtoY } from "apca-w3";
import { clampChroma, inGamut, parse } from "culori";
import {
  converter,
  formatCss,
  formatHex,
  formatRgb,
  modeOklch,
  modeP3,
  useMode,
} from "culori/fn";
import { hex } from "wcag-contrast";

useMode(modeP3);
useMode(modeOklch);

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
        contrastConfig,
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

function cssToApcach(color, antagonist) {
  if (color === undefined) {
    throw new Error("Color is undefined");
  }

  if ("bg" in antagonist || "fg" in antagonist) {
    let colorOklch = converter("oklch")(parse(color));
    let fgColor = antagonist.fg !== undefined ? antagonist.fg : color;
    let bgColor = antagonist.bg !== undefined ? antagonist.bg : color;
    let crFunction = antagonist.fg !== undefined ? crToFg : crToBg;
    let antagonistColor =
      antagonist.fg !== undefined ? antagonist.fg : antagonist.bg;
    let contrast = parseFloat(Math.abs(calcApca(fgColor, bgColor)).toFixed(6));
    return apcach(
      crFunction(antagonistColor, contrast),
      colorOklch.c,
      colorOklch.h ?? 0,
      colorOklch.alpha ?? 1
    );
  } else {
    throw new Error("antagonist color is not provided");
  }
}

function crToBg(bgColor, cr, contrastModel = "apca") {
  return {
    bgColor: stringToColor(bgColor),
    contrastModel,
    cr,
    fgColor: "apcach",
  };
}

function crTo(bgColor, cr, contrastModel = "apca") {
  return crToBg(bgColor, cr, contrastModel);
}

function crToBgWhite(cr, contrastModel = "apca") {
  return crToBg("white", cr, contrastModel);
}

function crToBgBlack(cr, contrastModel = "apca") {
  return crToBg("black", cr, contrastModel);
}

function crToFg(fgColor, cr, contrastModel = "apca") {
  return {
    bgColor: "apcach",
    contrastModel,
    cr,
    fgColor: stringToColor(fgColor),
  };
}

function crToFgWhite(cr, contrastModel = "apca") {
  return crToFg("white", cr, contrastModel);
}

function crToFgBlack(cr, contrastModel = "apca") {
  return crToFg("black", cr, contrastModel);
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
    colorInApcach.alpha
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
    colorInApcach.alpha
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
    colorInApcach.alpha
  );
}

function maxChroma(chromaCap = 0.4) {
  return function (contrastConfig, hue, alpha, colorSpace) {
    let checkingChroma = chromaCap;
    let searchPatch = 0.2;
    let color;
    let colorIsValid = false;
    let chromaFound = false;
    let iteration = 0;
    while (!chromaFound && iteration < 30) {
      iteration++;
      let oldChroma = checkingChroma;
      let newPatchedChroma = oldChroma + searchPatch;
      checkingChroma = Math.min(newPatchedChroma, chromaCap);
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
        return color;
      } else if (
        (Math.abs(searchPatch) <= 0.001 || checkingChroma === chromaCap) &&
        colorIsValid
      ) {
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
      return formatRgb(parse(apcachToCss(color, "oklch")));
    case "hex":
      return formatHex(parse(apcachToCss(color, "oklch")));
    case "p3": {
      let p3 = converter("p3");
      return p3(apcachToCss(color, "oklch"));
    }
    case "figma-p3": {
      let p3Parsed = apcachToCss(color, "p3");
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
  switch (contrastModel) {
    case "apca":
      return calcApca(fgColor, bgColor, colorSpace);
    case "wcag":
      return calcWcag(fgColor, bgColor, colorSpace);
    default:
      throw new Error(
        'Invalid contrast model. Suported models: "apca", "wcag"'
      );
  }
}

function inColorSpace(color, colorSpace = "p3") {
  colorSpace = colorSpace === "srgb" ? "rgb" : colorSpace;
  if (isValidApcach(color)) {
    let cssColor = apcachToCss(color, "oklch");
    return inGamut(colorSpace)(cssColor);
  } else {
    return inGamut(colorSpace)(color);
  }
}

// Private

function isValidApcach(el) {
  return (
    "contrastConfig" in el &&
    "alpha" in el &&
    "chroma" in el &&
    "hue" in el &&
    "lightness" in el
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
      return anyColorCssToOklch(str);
  }
}

function calcApca(fgColorInCssFormat, bgColorInCssFormat, colorSpace = "p3") {
  switch (colorSpace) {
    case "p3": {
      let fgColor = securedP3Color(fgColorInCssFormat);
      let bgColor = securedP3Color(bgColorInCssFormat);
      let fgY = displayP3toY([fgColor.r, fgColor.g, fgColor.b]);
      let bgY = displayP3toY([bgColor.r, bgColor.g, bgColor.b]);
      return APCAcontrast(fgY, bgY);
    }

    case "srgb": {
      let fgColor = parse(formatRgb(fgColorInCssFormat));
      let bgColor = parse(formatRgb(bgColorInCssFormat));
      let fgY = sRGBtoY([
        fgColor.r * 255,
        fgColor.g * 255,
        fgColor.b * 255,
        1.0,
      ]);
      let bgY = sRGBtoY([
        bgColor.r * 255,
        bgColor.g * 255,
        bgColor.b * 255,
        1.0,
      ]);
      return APCAcontrast(fgY, bgY);
    }

    default:
      throw new Error('Invalid color space. Supported formats: "p3", "srgb".');
  }
}

function calcWcag(fgColorInCssFormat, bgColorInCssFormat) {
  let fgColorHex = formatHex(clampChroma(fgColorInCssFormat, "oklch"));
  let bgColorHex = formatHex(clampChroma(bgColorInCssFormat, "oklch"));
  let wcag = hex(fgColorHex, bgColorHex);
  return wcag;
}

function anyColorCssToOklch(srt) {
  let olkch = converter("oklch");
  return formatCss(olkch(parse(srt)));
}

function colorIsLighterThenAnother(fgColor, bgColor) {
  let fgColorComponents = parse(fgColor);
  let bgColorComponents = parse(bgColor);
  return fgColorComponents.l > bgColorComponents.l;
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
  let apcachIsOnBgPosition = contrastConfig.bgColor === "apcach";
  let deltaContrast = 0;
  let lightness = 0;
  let lightnessPatch = 0.5;
  let factLightness = 0;
  let iteration = 0;
  while (Math.abs(lightnessPatch) > 0.0001 && iteration < 20) {
    iteration++;
    lightness += lightnessPatch;
    lightness = Math.max(Math.min(lightness, 1), 0);
    let checkingColor = formatCss({
      c: chroma,
      h: hue,
      l: lightness,
      mode: "oklch",
    });

    let fgColor =
      contrastConfig.fgColor === "apcach"
        ? checkingColor
        : contrastConfig.fgColor;
    let bgColor =
      contrastConfig.bgColor === "apcach"
        ? checkingColor
        : contrastConfig.bgColor;
    let calcedContrast = Math.abs(
      calcContrast(fgColor, bgColor, contrastConfig.contrastModel, colorSpace)
    );
    let newDeltaContrast = contrastConfig.cr - calcedContrast;

    // Save valid lightness–the one giving fact contrast higher than the desired one
    // It's needed to avoid returning lightness that gives contrast lower than the requested
    let floatingPoints = contrastConfig.contrastModel === "apca" ? 0 : 1;
    if (
      roundToDP(calcedContrast, floatingPoints) >=
      roundToDP(contrastConfig.cr, floatingPoints)
    ) {
      factLightness = lightness;
    }

    let apcachIsLighter = apcachIsOnBgPosition
      ? colorIsLighterThenAnother(bgColor, fgColor)
      : colorIsLighterThenAnother(fgColor, bgColor);
    // Flip the search Patch
    if (
      iteration === 1 &&
      ((apcachIsLighter && newDeltaContrast < 0) ||
        (!apcachIsLighter && newDeltaContrast > 0))
    ) {
      lightnessPatch *= -1;
    }
    // Flip the search Patch
    if (
      deltaContrast !== 0 &&
      signOf(newDeltaContrast) !== signOf(deltaContrast)
    ) {
      lightnessPatch = -lightnessPatch / 2;
    }
    deltaContrast = newDeltaContrast;
  }
  return Math.min(Math.max(factLightness, 0), 100);
}

function lightnessFromAntagonist(contrastConfig) {
  let antagonist;
  if (contrastConfig.fgColor === "apcach") {
    antagonist = contrastConfig.bgColor;
  } else {
    antagonist = contrastConfig.fgColor;
  }
  return converter("oklch")(parse(antagonist)).l;
}

function signOf(number) {
  return number / Math.abs(number);
}

function roundToDP(number, dp) {
  return Math.floor(number * 10 ** dp) / 10 ** dp;
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
    (cr >= 8 && contrastModel === "apca") ||
    (cr >= 1 && contrastModel === "wcag")
  );
}

function floatingPointToHex(float) {
  return Math.round(255 * float)
    .toString(16)
    .padStart(2, "0");
}

function securedP3Color(colorInCssFormat) {
  let oklch = converter("oklch")(parse(colorInCssFormat));
  oklch.l = oklch.l === undefined ? 0 : roundToDP(oklch.l, 7);
  oklch.c = oklch.c === undefined ? 0 : roundToDP(oklch.c, 16);
  oklch.h = oklch.h === undefined ? 0 : roundToDP(oklch.h, 16);
  let oklchCss = formatCss(oklch);
  if (inGamut("p3")(oklchCss)) {
    let p3Color = converter("p3")(oklch);
    return p3Color;
  } else {
    let clampedOklch = clampChroma(oklch, "oklch");
    if (clampedOklch.c === undefined) {
      clampedOklch.c = 0;
    }
    let p3Color = converter("p3")(clampedOklch);
    return p3Color;
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
