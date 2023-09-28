import { test } from "uvu";
import * as assert from "uvu/assert";

import { calcContrast } from "../index.js";

// ----------------------------------------
// Black and white
// ----------------------------------------

// APCA, P3
test("#0", () => {
  // White over black, oklch
  assert.is(
    calcContrast("oklch(100% 0 0)", "oklch(0% 0 0)", "apca", "p3"),
    -107.88470520486138
  );

  // White over black, hex
  assert.is(
    calcContrast("#ffffff", "#000000", "apca", "p3"),
    -107.8847050997958
  );

  // Black over white, oklch
  assert.is(
    calcContrast("oklch(0% 0 0)", "oklch(100% 0 0)", "apca", "p3"),
    106.0406479420227
  );

  // Black over white, hex
  assert.is(
    calcContrast("#000000", "#ffffff", "apca", "p3"),
    106.04064784712475
  );
});

// APCA, SRGB
test("#1", () => {
  // White over black, oklch
  assert.is(
    calcContrast("oklch(100% 0 0)", "oklch(0% 0 0)", "apca", "srgb"),
    -107.8847054222055
  );

  // White over black, hex
  assert.is(
    calcContrast("#ffffff", "#000000", "apca", "srgb"),
    -107.88470548340592
  );

  // Black over white, oklch
  assert.is(
    calcContrast("oklch(0% 0 0)", "oklch(100% 0 0)", "apca", "srgb"),
    106.04064813833351
  );

  // Black over white, hex
  assert.is(
    calcContrast("#000000", "#ffffff", "apca", "srgb"),
    106.0406481936113
  );
});

// WCAG, P3
test("#2", () => {
  // White over black, oklch
  assert.is(calcContrast("oklch(100% 0 0)", "oklch(0% 0 0)", "wcag", "p3"), 21);

  // White over black, hex
  assert.is(calcContrast("#ffffff", "#000000", "wcag", "p3"), 21);

  // Black over white, oklch
  assert.is(calcContrast("oklch(0% 0 0)", "oklch(100% 0 0)", "wcag", "p3"), 21);

  // Black over white, hex
  assert.is(calcContrast("#000000", "#ffffff", "wcag", "p3"), 21);
});

// WCAG, SRGB
test("#3", () => {
  // White over black, oklch
  assert.is(
    calcContrast("oklch(100% 0 0)", "oklch(0% 0 0)", "wcag", "srgb"),
    21
  );

  // White over black, hex
  assert.is(calcContrast("#ffffff", "#000000", "wcag", "srgb"), 21);

  // Black over white, oklch
  assert.is(
    calcContrast("oklch(0% 0 0)", "oklch(100% 0 0)", "wcag", "srgb"),
    21
  );

  // Black over white, hex
  assert.is(calcContrast("#000000", "#ffffff", "wcag", "srgb"), 21);
});

// ----------------------------------------
// Violet over Green
// ----------------------------------------

// APCA, P3
test("#4", () => {
  // #0 Original oklch, only first color is in P3
  assert.is(
    calcContrast("oklch(40% 0.2 300)", "oklch(84% 0.25 162)", "apca", "p3"),
    68.33018303187613
  );

  // #1 Converted into display-p3 format
  // Value must be exactly* equal to #0
  assert.is(
    calcContrast(
      "color(display-p3 0.3294 0.0942 0.603)",
      "color(display-p3 0.0776 0.9594 0.6201)",
      "apca",
      "p3"
    ),
    68.33405340238411
  );

  // #3 Clamped to hex
  // Value must be different from #0
  assert.is(
    calcContrast("#5C11A0", "#00EEA5", "apca", "p3"),
    66.25589296860609
  );

  // #2 Converted to figma-p3 hex
  // Value must be different from #0
  assert.is(
    calcContrast("#54189A", "#14F59E", "apca", "p3"),
    70.53453161486236
  );

  // #3 Clamped hex converted into display-p3 format
  // Value must be exactly* equal to #3
  assert.is(
    calcContrast(
      "color(display-p3 0.3294 0.0942 0.603)",
      "color(display-p3 0.426 0.9195 0.6685)",
      "apca",
      "p3"
    ),
    66.25920699942
  );
});

// APCA, SRGB
test("#5", () => {
  // #0 Original oklch, only first color is in P3
  assert.is(
    calcContrast("oklch(40% 0.2 300)", "oklch(84% 0.25 162)", "apca", "srgb"),
    66.46435169150936
  );

  // #1 Converted into display-p3 format
  // Value must be exactly* equal to #0
  assert.is(
    calcContrast(
      "color(display-p3 0.3294 0.0942 0.603)",
      "color(display-p3 0.0776 0.9594 0.6201)",
      "apca",
      "srgb"
    ),
    66.4680344925335
  );

  // #3 Clamped to hex
  // Value must be be close to #0
  // Hex is more rough format and loses some accuracy
  assert.is(
    calcContrast("#5C11A0", "#00EEA5", "apca", "srgb"),
    66.25476116578164
  );

  // #2 Converted to figma-p3 hex
  // Value must be different from #0
  assert.is(
    calcContrast("#54189A", "#14F59E", "apca", "srgb"),
    70.53453161486236
  );

  // #3 Clamped hex converted into display-p3 format
  // Value must be exactly* equal to #3
  assert.is(
    calcContrast(
      "color(display-p3 0.3294 0.0942 0.603)",
      "color(display-p3 0.426 0.9195 0.6685)",
      "apca",
      "srgb"
    ),
    66.25920699942
  );
});

// WCAG, P3
test("#6", () => {
  // #0 Original oklch, only first color is in P3
  assert.is(
    calcContrast("oklch(40% 0.2 300)", "oklch(84% 0.25 162)", "wcag", "p3"),
    7.261025780390085
  );

  // #1 Converted into display-p3 format
  // Value must be exactly* equal to #0
  assert.is(
    calcContrast(
      "color(display-p3 0.3294 0.0942 0.603)",
      "color(display-p3 0.0776 0.9594 0.6201)",
      "wcag",
      "p3"
    ),
    7.261025780390085
  );

  // #3 Clamped to hex
  // Value must be different from #0
  assert.is(
    calcContrast("#5C11A0", "#00EEA5", "wcag", "p3"),
    6.742102558845356
  );

  // #2 Converted to figma-p3 hex
  // Value must be different from #0
  assert.is(
    calcContrast("#54189A", "#14F59E", "wcag", "p3"),
    7.387380536719613
  );

  // #3 Clamped hex converted into display-p3 format
  // Value must be exactly* equal to #3
  assert.is(
    calcContrast(
      "color(display-p3 0.3294 0.0942 0.603)",
      "color(display-p3 0.426 0.9195 0.6685)",
      "wcag",
      "p3"
    ),
    6.742102558845356
  );
});

// WCAG, SRGB
test("#7", () => {
  // #0 Original oklch, only first color is in P3
  assert.is(
    calcContrast("oklch(40% 0.2 300)", "oklch(84% 0.25 162)", "wcag", "srgb"),
    6.742102558845356
  );

  // #1 Converted into display-p3 format
  // Value must be exactly* equal to #0
  assert.is(
    calcContrast(
      "color(display-p3 0.3294 0.0942 0.603)",
      "color(display-p3 0.0776 0.9594 0.6201)",
      "wcag",
      "srgb"
    ),
    6.742102558845356
  );

  // #3 Clamped to hex
  // Value must be be close to #0
  // Hex is more rough format and loses some accuracy
  assert.is(
    calcContrast("#5C11A0", "#00EEA5", "wcag", "srgb"),
    6.742102558845356
  );

  // #2 Converted to figma-p3 hex
  // Value must be different from #0
  assert.is(
    calcContrast("#54189A", "#14F59E", "wcag", "srgb"),
    7.387380536719613
  );

  // #3 Clamped hex converted into display-p3 format
  // Value must be exactly* equal to #3
  assert.is(
    calcContrast(
      "color(display-p3 0.3294 0.0942 0.603)",
      "color(display-p3 0.426 0.9195 0.6685)",
      "wcag",
      "srgb"
    ),
    6.742102558845356
  );
});

// ----------------------------------------
// Yellow over Green
// ----------------------------------------

// APCA, P3
test("#6", () => {
  // #0 Original oklch, both colors are in P3
  assert.is(
    calcContrast("oklch(94% 0.23 107)", "oklch(55% 0.21 150)", "apca", "p3"),
    -63.94684474879767
  );

  // #1 Converted into display-p3 format
  // Value must be exactly* equal to #0
  assert.is(
    calcContrast(
      "color(display-p3 0.9904 0.9543 0.0946)",
      "color(display-p3 0.0124 0.5535 0.1858)",
      "apca",
      "p3"
    ),
    -63.94356999113734
  );

  // #3 Clamped to hex
  // Value must be different from #0
  assert.is(
    calcContrast("#FCF200", "#00893D", "apca", "p3"),
    -64.60734026891349
  );

  // #2 Converted to figma-p3 hex
  // Value must be different from #0
  assert.is(
    calcContrast("#FDF318", "#038D2F", "apca", "p3"),
    -63.82702572532345
  );

  // #3 Clamped hex converted into display-p3 format
  // Value must be exactly* equal to #3
  assert.is(
    calcContrast(
      "color(display-p3 0.9814 0.9504 0.315)",
      "color(display-p3 0.2332 0.529 0.2731)",
      "apca",
      "p3"
    ),
    -64.6096677192623
  );
});

// APCA, SRGB
test("#7", () => {
  // #0 Original oklch, both colors are in P3
  assert.is(
    calcContrast("oklch(94% 0.23 107)", "oklch(55% 0.21 150)", "apca", "srgb"),
    -65.02291774715515
  );

  // #1 Converted into display-p3 format
  // Value must be exactly* equal to #0
  assert.is(
    calcContrast(
      "color(display-p3 0.9904 0.9543 0.0946)",
      "color(display-p3 0.0124 0.5535 0.1858)",
      "apca",
      "srgb"
    ),
    -65.01965914068404
  );

  // #3 Clamped to hex
  // Value must be close to #0
  // Hex is more rough format and loses some accuracy
  assert.is(
    calcContrast("#FCF200", "#00893D", "apca", "srgb"),
    -64.60723290963203
  );

  // #2 Converted to figma-p3 hex
  // Value must be different from #0
  assert.is(
    calcContrast("#FDF318", "#038D2F", "apca", "srgb"),
    -63.82702572532345
  );

  // #3 Clamped hex converted into display-p3 format
  // Value must be exactly* equal to #3
  assert.is(
    calcContrast(
      "color(display-p3 0.9814 0.9504 0.315)",
      "color(display-p3 0.2332 0.529 0.2731)",
      "apca",
      "srgb"
    ),
    -64.61021377411443
  );
});

// WCAG, P3
test("#8", () => {
  // #0 Original oklch, both colors are in P3
  assert.is(
    calcContrast("oklch(94% 0.23 107)", "oklch(55% 0.21 150)", "wcag", "p3"),
    3.669016369740913
  );

  // #1 Converted into display-p3 format
  // Value must be exactly equal to #0
  assert.is(
    calcContrast(
      "color(display-p3 0.9904 0.9543 0.0946)",
      "color(display-p3 0.0124 0.5535 0.1858)",
      "wcag",
      "p3"
    ),
    3.669016369740913
  );

  // #3 Clamped to hex
  // Value must be different from #0
  assert.is(
    calcContrast("#FCF200", "#00893D", "wcag", "p3"),
    3.840140228749543
  );

  // #2 Converted to figma-p3 hex
  // Value must be different from #0
  assert.is(
    calcContrast("#FDF318", "#038D2F", "wcag", "p3"),
    3.709668307286619
  );

  // #3 Clamped hex converted into display-p3 format
  // Value must be exactly equal to #3
  assert.is(
    calcContrast(
      "color(display-p3 0.9814 0.9504 0.315)",
      "color(display-p3 0.2332 0.529 0.2731)",
      "wcag",
      "p3"
    ),
    3.840140228749543
  );
});

// WCAG, SRGB
test("#9", () => {
  // #0 Original oklch, both colors are in P3
  assert.is(
    calcContrast("oklch(94% 0.23 107)", "oklch(55% 0.21 150)", "wcag", "srgb"),
    3.865838374606475
  );

  // #1 Converted into display-p3 format
  // Value must be exactly equal to #0
  assert.is(
    calcContrast(
      "color(display-p3 0.9904 0.9543 0.0946)",
      "color(display-p3 0.0124 0.5535 0.1858)",
      "wcag",
      "srgb"
    ),
    3.865838374606475
  );

  // #3 Clamped to hex
  // Value must be close to #0
  // Hex is more rough format and loses some accuracy
  assert.is(
    calcContrast("#FCF200", "#00893D", "wcag", "srgb"),
    3.840140228749543
  );

  // #2 Converted to figma-p3 hex
  // Value must be different from #0
  assert.is(
    calcContrast("#FDF318", "#038D2F", "wcag", "srgb"),
    3.709668307286619
  );

  // #3 Clamped hex converted into display-p3 format
  // Value must be exactly equal to #3
  assert.is(
    calcContrast(
      "color(display-p3 0.9814 0.9504 0.315)",
      "color(display-p3 0.2332 0.529 0.2731)",
      "wcag",
      "srgb"
    ),
    3.840140228749543
  );
});

// ----------------------------------------
// Semitrasparent text color
// ----------------------------------------

// APCA, P3
test("#10", () => {
  // Semitransparent White over Black, oklch
  assert.is(
    calcContrast("oklch(100% 0 0 / 50%)", "oklch(0% 0 0)", "apca", "p3"),
    -21.81272905935699
  );

  // Semitransparent White over Black, rgba
  assert.is(
    calcContrast("rgba(255, 255, 255, 0.5)", "rgba(0, 0, 0)", "apca", "p3"),
    -34.52645528608647
  );

  // Semitransparent Black over White, oklch
  assert.is(
    calcContrast("oklch(0% 0 0 / 50%)", "oklch(100% 0 0)", "apca", "p3"),
    80.01735632976055
  );

  // Semitransparent Black over White, rgbs
  assert.is(
    calcContrast("rgba(0, 0, 0, 0.5)", "rgba(255, 255, 255)", "apca", "p3"),
    67.13319672423782
  );

  // White over Semitransparent Black, oklch
  assert.is(
    calcContrast("oklch(100% 0 0)", "oklch(0% 0 0 / 50%)", "apca", "p3"),
    -107.88470520486138
  );

  // White over Semitransparent Black, rgba
  assert.is(
    calcContrast("rgba(255, 255, 255)", "rgba(0, 0, 0, 0.5)", "apca", "p3"),
    -107.8847050997958
  );

  // Black over Semitransparent White, oklch
  assert.is(
    calcContrast("oklch(0% 0 0)", "oklch(100% 0 0 / 50%)", "apca", "p3"),
    106.0406479420227
  );

  // Black over Semitransparent White, rgbs
  assert.is(
    calcContrast("rgba(0, 0, 0)", "rgba(255, 255, 255, 0.5)", "apca", "p3"),
    106.04064784712475
  );
});

// APCA, SRGB
test("#11", () => {
  // Semitransparent White over Black, oklch
  assert.is(
    calcContrast("oklch(100% 0 0 / 50%)", "oklch(0% 0 0)", "apca", "srgb"),
    -21.81272905935699
  );

  // Semitransparent White over Black, rgba
  assert.is(
    calcContrast("rgba(255, 255, 255, 0.5)", "rgba(0, 0, 0)", "apca", "srgb"),
    -34.52645528608647
  );

  // Semitransparent Black over White, oklch
  assert.is(
    calcContrast("oklch(0% 0 0 / 50%)", "oklch(100% 0 0)", "apca", "srgb"),
    80.01735652607137
  );

  // Semitransparent Black over White, rgbs
  assert.is(
    calcContrast("rgba(0, 0, 0, 0.5)", "rgba(255, 255, 255)", "apca", "srgb"),
    67.13319707072439
  );

  // White over Semitransparent Black, oklch
  assert.is(
    calcContrast("oklch(100% 0 0)", "oklch(0% 0 0 / 50%)", "apca", "srgb"),
    -107.8847054222055
  );

  // White over Semitransparent Black, rgba
  assert.is(
    calcContrast("rgba(255, 255, 255)", "rgba(0, 0, 0, 0.5)", "apca", "srgb"),
    -107.88470548340592
  );

  // Black over Semitransparent White, oklch
  assert.is(
    calcContrast("oklch(0% 0 0)", "oklch(100% 0 0 / 50%)", "apca", "srgb"),
    106.04064813833351
  );

  // Black over Semitransparent White, rgbs
  assert.is(
    calcContrast("rgba(0, 0, 0)", "rgba(255, 255, 255, 0.5)", "apca", "srgb"),
    106.0406481936113
  );
});

// WCAG, P3
test("#12", () => {
  // Semitransparent White over Black, oklch
  assert.is(
    calcContrast("oklch(100% 0 0 / 50%)", "oklch(0% 0 0)", "wcag", "p3"),
    3.49543635121901
  );

  // Semitransparent White over Black, rgba
  assert.is(
    calcContrast("rgba(255, 255, 255, 0.5)", "rgba(0, 0, 0)", "wcag", "p3"),
    5.317210002277984
  );

  // Semitransparent Black over White, oklch
  assert.is(
    calcContrast("oklch(0% 0 0 / 50%)", "oklch(100% 0 0)", "wcag", "p3"),
    6.007833612154428
  );

  // Semitransparent Black over White, rgbs
  assert.is(
    calcContrast("rgba(0, 0, 0, 0.5)", "rgba(255, 255, 255)", "wcag", "p3"),
    3.9494396480491156
  );

  // White over Semitransparent Black, oklch
  assert.is(
    calcContrast("oklch(100% 0 0)", "oklch(0% 0 0 / 50%)", "wcag", "p3"),
    21
  );

  // White over Semitransparent Black, rgba
  assert.is(
    calcContrast("rgba(255, 255, 255)", "rgba(0, 0, 0, 0.5)", "wcag", "p3"),
    21
  );

  // Black over Semitransparent White, oklch
  assert.is(
    calcContrast("oklch(0% 0 0)", "oklch(100% 0 0 / 50%)", "wcag", "p3"),
    21
  );

  // Black over Semitransparent White, rgbs
  assert.is(
    calcContrast("rgba(0, 0, 0)", "rgba(255, 255, 255, 0.5)", "wcag", "p3"),
    21
  );
});

// WCAG, SRGB
test("#13", () => {
  // Semitransparent White over Black, oklch
  assert.is(
    calcContrast("oklch(100% 0 0 / 50%)", "oklch(0% 0 0)", "wcag", "srgb"),
    3.49543635121901
  );

  // Semitransparent White over Black, rgba
  assert.is(
    calcContrast("rgba(255, 255, 255, 0.5)", "rgba(0, 0, 0)", "wcag", "srgb"),
    5.317210002277984
  );

  // Semitransparent Black over White, oklch
  assert.is(
    calcContrast("oklch(0% 0 0 / 50%)", "oklch(100% 0 0)", "wcag", "srgb"),
    6.007833612154428
  );

  // Semitransparent Black over White, rgbs
  assert.is(
    calcContrast("rgba(0, 0, 0, 0.5)", "rgba(255, 255, 255)", "wcag", "srgb"),
    3.9494396480491156
  );

  // White over Semitransparent Black, oklch
  assert.is(
    calcContrast("oklch(100% 0 0)", "oklch(0% 0 0 / 50%)", "wcag", "srgb"),
    21
  );

  // White over Semitransparent Black, rgba
  assert.is(
    calcContrast("rgba(255, 255, 255)", "rgba(0, 0, 0, 0.5)", "wcag", "srgb"),
    21
  );

  // Black over Semitransparent White, oklch
  assert.is(
    calcContrast("oklch(0% 0 0)", "oklch(100% 0 0 / 50%)", "wcag", "srgb"),
    21
  );

  // Black over Semitransparent White, rgbs
  assert.is(
    calcContrast("rgba(0, 0, 0)", "rgba(255, 255, 255, 0.5)", "wcag", "srgb"),
    21
  );
});

test.run();
