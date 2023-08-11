import { formatCss, formatHex, inGamut } from "https://cdn.skypack.dev/culori";
import { calcAPCA } from "https://cdn.skypack.dev/apca-w3";

function apcach(contrast, chroma, hue, alpha = 100, fgIsBlack = true) {
  let lightness = composeLightess(
    parseFloat(contrast),
    parseFloat(chroma),
    parseFloat(hue),
    fgIsBlack
  );
  return {
    contrast: contrast,
    lightness: lightness,
    chroma: chroma,
    hue: hue,
    alpha: alpha,
    fgIsBlack: fgIsBlack,
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
  }
}

function composeLightess(targetContrast, chroma, hue, fgIsBlack) {
  const fgColor = fgIsBlack ? "oklch(0,0,0)" : "oklch(100%,0,0)";
  var factContrast = 0;
  var deltaContrast = 0;
  var lightness = fgIsBlack
    ? targetContrast / 100
    : (100 - targetContrast) / 100;
  var lightnessPatch = 0.5;
  var iteration = 0;
  while (Math.abs(factContrast - targetContrast) > 0.01 && iteration < 20) {
    iteration++;
    let oldLightness = lightness;
    var bgColor = formatCss({
      mode: "oklch",
      l: oldLightness,
      c: chroma,
      h: hue,
    });
    factContrast = APCAcontrast(fgColor, bgColor);
    let newDeltaContrast = targetContrast - factContrast;
    if (iteration == 1 && fgIsBlack && newDeltaContrast < 0) {
      lightnessPatch *= -1;
    }
    if (
      deltaContrast != 0 &&
      signOf(newDeltaContrast) != signOf(deltaContrast)
    ) {
      lightnessPatch = -lightnessPatch / 2;
    }
    deltaContrast = newDeltaContrast;
    lightness += lightnessPatch;
    bgColor = formatCss({ mode: "oklch", l: lightness, c: chroma, h: hue });
    factContrast = APCAcontrast(fgColor, bgColor);
  }
  return Math.min(lightness, 1);
}

function APCAcontrast(fgColor, bgColor) {
  return calcAPCA(formatHex(fgColor), formatHex(bgColor));
}

function inP3(color) {
  const inGamutP3 = inGamut("p3");
  return inGamutP3(apcachToCss(color, "oklch"));
}

function signOf(number) {
  return number / Math.abs(number);
}

export { apcach, apcachToCss, APCAcontrast, inP3 };
