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
  let contrastConfig = contrastToConfig(contrast);
  if (typeof chroma === "function") {
    // Max chroma case
    return chroma(contrastConfig, parseFloat(hue), alpha);
  } else {
    // Constant chroma case
    let lightness = calcLightess(
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

function adjustContrast(colorInApcach, crDiff) {
  let newContrastConfig = colorInApcach.contrastConfig;
  newContrastConfig.cr += crDiff;
  return apcach(
    newContrastConfig,
    colorInApcach.chroma,
    colorInApcach.hue,
    colorInApcach.alpha
  );
}

function adjustChroma(colorInApcach, chromaDiff) {
  return apcach(
    colorInApcach.contrastConfig,
    colorInApcach.chroma + chromaDiff,
    colorInApcach.hue,
    colorInApcach.alpha
  );
}

function adjustHue(colorInApcach, hueDiff) {
  return apcach(
    colorInApcach.contrastConfig,
    colorInApcach.chroma,
    colorInApcach.hue + hueDiff,
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
        searchPatch = searchPatch / 2;
        searchPatch *= -1;
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
        "oklch(" + color.lightness + " " + color.chroma + " " + color.hue + ")"
      );
    case "rgb":
      return formatRgb(parse(apcachToCss(color, "oklch")));
    case "hex":
      return formatHex(parse(apcachToCss(color, "oklch")));
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

function сolorIsLighterThenAnother(fgColor, bgColor) {
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

function calcLightess(contrastConfig, chroma, hue) {
  let apcachIsOnBgPosition = contrastConfig.fgColor === "apcach";
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
      ? сolorIsLighterThenAnother(bgColor, fgColor)
      : сolorIsLighterThenAnother(fgColor, bgColor);
    if (iteration === 1 && !apcachIsLighter && newDeltaContrast < 0) {
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
    lightness = Math.max(Math.min(lightness, 1), 0);
    bgColor = formatCss({ c: chroma, h: hue, l: lightness, mode: "oklch" });
    factContrast = p3contrast(fgColor, bgColor);
  }
  return lightness;
}
/*
function calcMaxValidChroma(color, desiredChroma) {
  let chroma = 0.4;
  let searchPatch = 0.2;
  let validColor = false;
  let chromaFound = false;
  let iteration = 0;
  while (!chromaFound && iteration < 30) {
    iteration++;
    let oldChroma = chroma;
    let newPatchedChroma = oldChroma + searchPatch;
    chroma = Math.min(newPatchedChroma, desiredChroma);
    let newColor = apcach(color.contrast, chroma, color.hue, color.fgIsBlack);
    // Check if the new color is valid
    let newValidColor = inP3(newColor);
    if (iteration === 1) {
      if (!newValidColor) {
        searchPatch *= -1;
      }
    } else if (newValidColor !== validColor) {
      // Over shooot
      searchPatch = searchPatch / 2;
      searchPatch *= -1;
    }
    validColor = newValidColor;
    if (
      (Math.abs(searchPatch) <= 0.001 || chroma === desiredChroma) &&
      validColor
    ) {
      chromaFound = true;
    }
  }
  return chroma;
}*/

function signOf(number) {
  return number / Math.abs(number);
}

export {
  adjustChroma,
  adjustContrast,
  adjustHue,
  apcach,
  apcachToCss,
  crTo,
  crToBg,
  crToBlack,
  crToFg,
  crToFgBlack,
  crToFgWhite,
  inP3,
  maxChroma,
  p3contrast,
};
