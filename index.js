import { calcAPCA } from "apca-w3";
import {
  converter,
  formatCss,
  formatHex,
  formatRgb,
  inGamut,
  modeOklch,
  modeP3,
  parse,
  useMode,
} from "culori/fn";

useMode(modeP3);
useMode(modeOklch);

// API

function apcach(contrast, chroma, hue, alpha = 100, fgIsBlack = true) {
  let lightness = calcLightess(
    parseFloat(contrast),
    parseFloat(chroma),
    parseFloat(hue),
    fgIsBlack
  );
  return {
    alpha,
    chroma,
    contrast,
    fgIsBlack,
    hue,
    lightness,
  };
}

function maxChroma(color, chromaCap = 0.4) {
  let fgColor = color.fgIsBlack ? "oklch(0% 0 0)" : "oklch(100% 0 0)";
  let allSetUp = false;
  let checkingColor = color;
  let iteration = 0;
  while (!allSetUp && iteration < 20) {
    iteration++;
    // Calculate max valid chroma
    let chroma = calcMaxValidChroma(checkingColor, chromaCap);
    checkingColor = apcach(
      checkingColor.contrast,
      chroma,
      checkingColor.hue,
      checkingColor.alpha,
      checkingColor.fgIsBlack
    );
    // Check the contrast ration
    let factContrast = p3contrast(fgColor, apcachToCss(checkingColor, "oklch"));
    let contrastDiff = color.contrast - factContrast;
    if (Math.abs(contrastDiff) <= 0.01) {
      allSetUp = true;
    }
  }
  return checkingColor;
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
  return color;
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

function calcLightess(targetContrast, chroma, hue, fgIsBlack) {
  let fgColor = fgIsBlack ? "oklch(0% 0 0)" : "oklch(100% 0 0)";
  let factContrast = 0;
  let deltaContrast = 0;
  let lightness = 0.5;
  let lightnessPatch = 0.5;
  let iteration = 0;
  while (Math.abs(lightnessPatch) > 0.001 && iteration < 20) {
    iteration++;
    let oldLightness = lightness;
    let bgColor = formatCss({
      c: chroma,
      h: hue,
      l: oldLightness,
      mode: "oklch",
    });

    factContrast = p3contrast(fgColor, bgColor);
    let newDeltaContrast = targetContrast - factContrast;
    if (iteration === 1 && fgIsBlack && newDeltaContrast < 0) {
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
}

function signOf(number) {
  return number / Math.abs(number);
}

export { apcach, apcachToCss, inP3, maxChroma, p3contrast };
