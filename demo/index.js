import {
  apcach,
  apcachToCss,
  inP3,
  maxChroma,
  p3contrast,
  setChroma,
  setContrast,
  setHue,
} from "../index.js";

const inputApcach = document.getElementById("inputApcach");
const submitButton = document.getElementById("submitButton");

const increaseCrButton = document.getElementById("increaseContrastButton");
const decreaseCrButton = document.getElementById("decreaseContrastButton");
const increaseChButton = document.getElementById("increaseChromaButton");
const decreaseChButton = document.getElementById("decreaseChromaButton");
const increaseHueButton = document.getElementById("increaseHueButton");
const decreaseHueButton = document.getElementById("decreaseHueButton");
const restoreButton = document.getElementById("restoreButton");
const maxChromaButton = document.getElementById("maxChromaButton");
const hueSlider = document.getElementById("hueSlider");
const contrastSlot = document.getElementById("contrastSlot");

hueSlider.addEventListener("input", () => {
  let hue = hueSlider.value;
  color = apcach(color.contrastConfig, maxChroma(), hue);
  colorSlot.style.background = apcachToCss(color);
  colorSlot.textContent = apcachToCss(color);
  let apca = calcFactContrast(color);
  contrastSlot.textContent =
    "contrast: " + color.contrastConfig.cr + " / fact: " + apca;
});

const colorSlot = document.getElementById("colorSlot");

submitButton.addEventListener("click", () => {
  generateColor(inputApcach.value);
});

maxChromaButton.addEventListener("click", () => {
  maximizeChroma();
});

// Contrast
increaseCrButton.addEventListener("click", () => {
  changeContrast(1);
});

decreaseCrButton.addEventListener("click", () => {
  changeContrast(-1);
});

// Chroma
increaseChButton.addEventListener("click", () => {
  changeChroma(0.01);
});

decreaseChButton.addEventListener("click", () => {
  changeChroma(-0.01);
});

// Hue
increaseHueButton.addEventListener("click", () => {
  changeHue(10);
});

decreaseHueButton.addEventListener("click", () => {
  changeHue(-10);
});

restoreButton.addEventListener("click", () => {
  generateColor(inputApcach.value);
});

let color;

function generateColor(rawApcach) {
  try {
    // TODO: consider other options, since eval is quite unsafe
    // eslint-disable-next-line no-eval
    color = eval(rawApcach);
    let colorCss = apcachToCss(color, "oklch");
    colorSlot.style.background = colorCss;
    colorSlot.style.background = inP3(color) ? colorCss : "rgba(0, 0, 0, 0)";
    colorSlot.textContent = colorCss;
    contrastSlot.textContent = color.contrastConfig.cr;
    let apca = calcFactContrast(color);
    contrastSlot.textContent =
      "contrast: " + color.contrastConfig.cr + " / fact: " + apca;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("An error occurred:", error.message);
  }
}

function changeContrast(value) {
  color = setContrast(color, (cr) => cr + value);
  let colorCss = apcachToCss(color, "oklch");
  colorSlot.style.background = colorCss;
  colorSlot.style.background = inP3(color) ? colorCss : "rgba(0, 0, 0, 0)";
  colorSlot.textContent = colorCss;
  let apca = calcFactContrast(color);
  contrastSlot.textContent =
    "contrast: " + color.contrastConfig.cr + " / fact: " + apca;
}

function changeChroma(value) {
  color = setChroma(color, (c) => c + value);
  let colorCss = apcachToCss(color, "oklch");
  colorSlot.style.background = colorCss;
  colorSlot.style.background = inP3(color) ? colorCss : "rgba(0, 0, 0, 0)";
  colorSlot.textContent = colorCss;
  let apca = calcFactContrast(color);
  contrastSlot.textContent =
    "contrast: " + color.contrastConfig.cr + " / fact: " + apca;
}

function changeHue(value) {
  color = setHue(color, (h) => h + value);
  let colorCss = apcachToCss(color, "oklch");
  colorSlot.style.background = colorCss;
  colorSlot.style.background = inP3(color) ? colorCss : "rgba(0, 0, 0, 0)";
  colorSlot.textContent = colorCss;
  let apca = calcFactContrast(color);
  contrastSlot.textContent =
    "contrast: " + color.contrastConfig.cr + " / fact: " + apca;
}

function maximizeChroma() {
  color = apcach(color.contrastConfig, maxChroma(), color.hue, color.alpha);
  let colorCss = apcachToCss(color, "oklch");
  colorSlot.style.background = colorCss;
  colorSlot.style.background = inP3(color) ? colorCss : "rgba(0, 0, 0, 0)";
  colorSlot.textContent = colorCss;
  let apca = calcFactContrast(color);
  contrastSlot.textContent =
    "contrast: " + color.contrastConfig.cr + " / fact: " + apca;
}

function calcFactContrast(c) {
  let fgColor =
    c.contrastConfig.fgColor === "apcach"
      ? apcachToCss(color)
      : c.contrastConfig.fgColor;
  let bgColor =
    c.contrastConfig.bgColor === "apcach"
      ? apcachToCss(color)
      : c.contrastConfig.bgColor;
  return Math.abs(p3contrast(fgColor, bgColor)).toFixed(4);
}
