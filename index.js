import { calcAPCA } from "apca-w3";
import { parse } from "culori";
import {
  converter,
  formatCss,
  formatHex,
  formatRgb,
  inGamut,
  modeOklch,
  modeP3,
  useMode,
} from "culori/fn";

useMode(modeP3);
useMode(modeOklch);

// API

function apcach(contrast, chroma, hue, alpha = 100) {
  // Check for hue
  hue = hue === undefined || hue === null ? 0 : parseFloat(hue);
  // Compose contrast config
  let contrastConfig = contrastToConfig(contrast);
  if (typeof chroma === "function") {
    // Max chroma case
    return chroma(contrastConfig, hue, alpha);
  } else {
    // Constant chroma case
    let lightness = calcLightness(
      contrastConfig,
      parseFloat(chroma),
      parseFloat(hue)
    );
    return {
      alpha,
      chroma,
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
    let contrast = Math.abs(p3contrast(fgColor, bgColor)).toFixed(6);
    return apcach(
      crFunction(antagonistColor, contrast),
      colorOklch.c,
      colorOklch.h,
      colorOklch.alpha ?? 1
    );
  } else {
    throw new Error("antagonist color is not provided");
  }
}

function crToBg(bgColor, cr) {
  return { bgColor: stringToColor(bgColor), cr, fgColor: "apcach" };
}

function crTo(bgColor, cr) {
  return crToBg(bgColor, cr);
}

function crToBlack(cr) {
  return crToBg("black", cr);
}

function crToFg(fgColor, cr) {
  return { bgColor: "apcach", cr, fgColor: stringToColor(fgColor) };
}

function crToFgWhite(cr) {
  return crToFg("white", cr);
}

function crToFgBlack(cr) {
  return crToFg("black", cr);
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
  return function (contrastConfig, hue, alpha) {
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
      color = apcach(contrastConfig, checkingChroma, hue, alpha);
      // Check if the new color is valid
      let newColorIsValid = inP3(color);
      if (iteration === 1 && !newColorIsValid) {
        searchPatch *= -1;
      } else if (newColorIsValid !== colorIsValid) {
        // Over shooot
        searchPatch /= -2;
      }
      colorIsValid = newColorIsValid;
      if (
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

function p3contrast(fgColorInCssFormat, bgColorInCssFormat) {
  let inGamutP3 = inGamut("p3");
  let p3 = converter("p3");
  let fgColorP3 = p3(fgColorInCssFormat);
  let bgColorP3 = p3(bgColorInCssFormat);
  let fgColor = inGamutP3(fgColorInCssFormat)
    ? formatCss(fgColorP3)
    : formatHex(fgColorInCssFormat);
  let bgColor = inGamutP3(bgColorInCssFormat)
    ? formatCss(bgColorP3)
    : formatHex(bgColorInCssFormat);
  return calcAPCA(fgColor, bgColor);
}

function inP3(color) {
  let inGamutP3 = inGamut("p3");
  return inGamutP3(apcachToCss(color, "oklch"));
}

// Private

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
  } else if (
    "bgColor" in rawContrast &&
    "fgColor" in rawContrast &&
    "cr" in rawContrast
  ) {
    return rawContrast;
  } else {
    throw new Error("Invalid raw contrast string");
  }
}

function calcLightness(contrastConfig, chroma, hue) {
  let apcachIsOnBgPosition = contrastConfig.bgColor === "apcach";
  let factContrast = 0;
  let deltaContrast = 0;
  let lightness = 0.5;
  let lightnessPatch = 0.5;
  let iteration = 0;
  while (Math.abs(lightnessPatch) > 0.001 && iteration < 20) {
    iteration++;
    let oldLightness = lightness;
    let checkingColor = formatCss({
      c: chroma,
      h: hue,
      l: oldLightness,
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
    factContrast = Math.abs(p3contrast(fgColor, bgColor));
    let newDeltaContrast = contrastConfig.cr - factContrast;

    let apcachIsLighter = apcachIsOnBgPosition
      ? colorIsLighterThenAnother(bgColor, fgColor)
      : colorIsLighterThenAnother(fgColor, bgColor);
    if (
      iteration === 1 &&
      ((apcachIsLighter && newDeltaContrast < 0) ||
        (!apcachIsLighter && newDeltaContrast > 0))
    ) {
      lightnessPatch *= -1;
    }
    if (
      deltaContrast !== 0 &&
      signOf(newDeltaContrast) !== signOf(deltaContrast)
    ) {
      lightnessPatch = -lightnessPatch / 2;
    }
    deltaContrast = newDeltaContrast;
    lightness += lightnessPatch;
    lightness = Math.max(Math.min(lightness, 0.9999), 0);
    bgColor = formatCss({ c: chroma, h: hue, l: lightness, mode: "oklch" });
    factContrast = p3contrast(fgColor, bgColor);
  }
  return lightness;
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

function floatingPointToHex(float) {
  return Math.round(255 * float)
    .toString(16)
    .padStart(2, "0");
}

export {
  apcach,
  apcachToCss,
  crTo,
  crToBg,
  crToBlack,
  crToFg,
  crToFgBlack,
  crToFgWhite,
  cssToApcach,
  inP3,
  maxChroma,
  p3contrast,
  setChroma,
  setContrast,
  setHue,
};
