import {
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
} from "../index.js";

const inputApcach = document.getElementById("inputApcach");
const submitButton = document.getElementById("submitButton");

const increaseChromaButton = document.getElementById("increaseChromaButton");
const decreaseChromaButton = document.getElementById("decreaseChromaButton");
const increaseContrastButton = document.getElementById(
  "increaseContrastButton"
);
const decreaseContrastButton = document.getElementById(
  "decreaseContrastButton"
);
const restoreButton = document.getElementById("restoreButton");
const maxChromaButton = document.getElementById("maxChromaButton");
const contrastSlot = document.getElementById("contrastSlot");

const colorSlot = document.getElementById("colorSlot");

submitButton.addEventListener("click", () => {
  generateColor(inputApcach.value);
});

// Contrast
increaseContrastButton.addEventListener("click", () => {
  changeContrast(1);
});

decreaseContrastButton.addEventListener("click", () => {
  changeContrast(-1);
});

// Chroma
increaseChromaButton.addEventListener("click", () => {
  changeChroma(0.01);
});

decreaseChromaButton.addEventListener("click", () => {
  changeChroma(-0.01);
});

restoreButton.addEventListener("click", () => {
  generateColor(inputApcach.value);
});

maxChromaButton.addEventListener("click", () => {
  setMaxChroma();
});

let color;

function generateColor(rawApcach) {
  //   let color = apcach(70, 0.1, 200);
  //   console.log("color: " + apcachToCss(color));

  try {
    color = eval(rawApcach);
    let colorCss = apcachToCss(color, "oklch");
    colorSlot.style.background = colorCss;
    colorSlot.style.background = inP3(color) ? colorCss : "rgba(0, 0, 0, 0)";
    colorSlot.textContent = colorCss;
    contrastSlot.textContent = color.contrastConfig.cr;
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

function changeContrast(value) {
  color = adjustContrast(color, value);
  let colorCss = apcachToCss(color, "oklch");
  colorSlot.style.background = colorCss;
  colorSlot.style.background = inP3(color) ? colorCss : "rgba(0, 0, 0, 0)";
  colorSlot.textContent = colorCss;
  contrastSlot.textContent = color.contrastConfig.cr;
}

function changeChroma(value) {
  color = adjustChroma(color, value);
  let colorCss = apcachToCss(color, "oklch");
  colorSlot.style.background = colorCss;
  colorSlot.style.background = inP3(color) ? colorCss : "rgba(0, 0, 0, 0)";
  colorSlot.textContent = colorCss;
}

function setMaxChroma() {
  let testColor = maxChroma(apcach(70, 0.2, 25, 1, false), 0.3);

  // let rgb = converter("rgb");
  // let colorRgb = rgb(color);
  // colorRgb.r = Math.min(colorRgb.r, 1);
  // colorRgb.g = Math.min(colorRgb.g, 1);
  // colorRgb.b = Math.min(colorRgb.b, 1);
  console.log(
    "color: " +
      apcachToCss(testColor, "oklch") +
      " /// contrast: " +
      p3contrast("#ffffff", apcachToCss(testColor, "oklch"))
  );

  //redColor = maxChroma(redColor, 10);

  // redColor = maxChroma(apcach(50, 0.2, 200, 1, true), 0.2);
  // const redColorCss = apcachToCss(redColor, "oklch");
  // redSlot.style.background = inP3(redColor) ? redColorCss : "rgba(0, 0, 0, 0)";
  // redSlot.textContent = p3contrast("#000000", redColorCss) + "  /  " + apcachToCss(redColor, "oklch");

  // blueColor = maxChroma(blueColor);
  // const blueColorCss = apcachToCss(blueColor, "oklch");
  // blueSlot.style.background = inP3(blueColor) ? blueColorCss : "rgba(0, 0, 0, 0)";
  // blueSlot.textContent = p3contrast("#000000", blueColorCss) + "  /  " + apcachToCss(blueColor, "oklch");
}
