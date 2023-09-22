import { test } from "uvu";
import * as assert from "uvu/assert";

import { apcach, apcachToCss, crToBg, crToFg, maxChroma } from "../index.js";

// ----------------------------------------
// CONTRAST BELOW THRESHOLD
// ----------------------------------------

// White bg, gray
test("#0", () => {
  assert.is(
    apcachToCss(apcach(crToBg("white", 0.2, "wcag"), 0, 0)),
    "oklch(100% 0 0)"
  );
});

// Black bg, low chroma
test("#1", () => {
  assert.is(
    apcachToCss(apcach(crToBg("black", 0.2, "wcag"), 0.05, 200)),
    "oklch(0% 0.05 200)"
  );
});

// Gray fg, high chroma
test("#2", () => {
  assert.is(
    apcachToCss(apcach(crToFg("#7D7D7D", 0.2, "wcag"), 3, 100)),
    "oklch(58.97123297174118% 3 100)"
  );
});

// Colored fg, gray
test("#3", () => {
  assert.is(
    apcachToCss(apcach(crToBg("#00FF94", 0.2, "wcag"), 0, 70)),
    "oklch(87.82585371306136% 0 70)"
  );
});

// ----------------------------------------
// CREATION
// ----------------------------------------

// Implicit white bg
test("#4", () => {
  assert.is(
    apcachToCss(apcach(crToBg("white", 4.5, "wcag"), 0.15, 150, 100, "srgb")),
    "oklch(55.2978515625% 0.15 150)"
  );
});

// Explicit white bg
test("#5", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("white", 4.5, "wcag"), 0.15, 300, 100, "srgb")),
    "oklch(58.2275390625% 0.15 300)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("white", 4.5, "wcag", "auto"), 0.15, 300, 100, "srgb")
    ),
    "oklch(58.2275390625% 0.15 300)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToBg("white", 4.5, "wcag", "darker"), 0.15, 300, 100, "srgb")
    ),
    "oklch(58.2275390625% 0.15 300)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToBg("white", 4.5, "wcag", "lighter"), 0.15, 300, 100, "srgb")
    ),
    "oklch(100% 0.15 300)"
  );
});

// Black bg
test("#6", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("black", 4.5, "wcag"), 0.14, 150, 100, "srgb")),
    "oklch(54.43115234375% 0.14 150)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("black", 4.5, "wcag", "auto"), 0.14, 150, 100, "srgb")
    ),
    "oklch(54.43115234375% 0.14 150)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToBg("black", 4.5, "wcag", "darker"), 0.14, 150, 100, "srgb")
    ),
    "oklch(0% 0.14 150)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToBg("black", 4.5, "wcag", "lighter"), 0.14, 150, 100, "srgb")
    ),
    "oklch(54.43115234375% 0.14 150)"
  );
});

// Light gray bg
test("#7", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(
      apcach(
        crToBg("oklch(90.06% 0 89.88)", 4.5, "wcag"),
        0.1,
        150,
        100,
        "srgb"
      )
    ),
    "oklch(48.81181640625% 0.1 150)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(
        crToBg("oklch(90.06% 0 89.88)", 4.5, "wcag", "auto"),
        0.1,
        150,
        100,
        "srgb"
      )
    ),
    "oklch(48.81181640625% 0.1 150)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("oklch(90.06% 0 89.88)", 4.5, "wcag", "darker"),
        0.1,
        150,
        100,
        "srgb"
      )
    ),
    "oklch(48.81181640625% 0.1 150)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("oklch(90.06% 0 89.88)", 4.5, "wcag", "lighter"),
        0.1,
        150,
        100,
        "srgb"
      )
    ),
    "oklch(100% 0.1 150)"
  );
});

// Dark gray bg
test("#8", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(
      apcach(crToBg("hsl(223.81 0% 18%)", 4.5, "wcag"), 0.1, 50, 100, "srgb")
    ),
    "oklch(67.66801106066657% 0.1 50)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(
        crToBg("hsl(223.81 0% 18%)", 4.5, "wcag", "auto"),
        0.1,
        50,
        100,
        "srgb"
      )
    ),
    "oklch(67.66801106066657% 0.1 50)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("hsl(223.81 0% 18%)", 4.5, "wcag", "darker"),
        0.1,
        50,
        100,
        "srgb"
      )
    ),
    "oklch(0% 0.1 50)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("hsl(223.81 0% 18%)", 4.5, "wcag", "lighter"),
        0.1,
        50,
        100,
        "srgb"
      )
    ),
    "oklch(67.66801106066657% 0.1 50)"
  );
});

// Mid gray bg
test("#9", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("#7D7D7D", 2, "wcag"), 0, 0, 100, "srgb")),
    "oklch(42.572738256210606% 0 0)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("#7D7D7D", 2, "wcag", "auto"), 0, 0, 100, "srgb")
    ),
    "oklch(42.572738256210606% 0 0)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToBg("#7D7D7D", 2, "wcag", "darker"), 0, 0, 100, "srgb")
    ),
    "oklch(42.572738256210606% 0 0)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToBg("#7D7D7D", 2, "wcag", "lighter"), 0, 0, 100, "srgb")
    ),
    "oklch(77.16172147841064% 0 0)"
  );
});

// Mid gray bg
test("#10", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("#434343", 2, "wcag"), 0, 0, 100, "srgb")),
    "oklch(54.710281595631535% 0 0)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("#434343", 2, "wcag", "auto"), 0, 0, 100, "srgb")
    ),
    "oklch(54.710281595631535% 0 0)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToBg("#434343", 2, "wcag", "darker"), 0, 0, 100, "srgb")
    ),
    "oklch(14.713157938381253% 0 0)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToBg("#434343", 2, "wcag", "lighter"), 0, 0, 100, "srgb")
    ),
    "oklch(54.710281595631535% 0 0)"
  );
});

// Mid gray bg, high contrast
test("#11", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("#7D7D7D", 4.5, "wcag"), 0, 0, 100, "srgb")),
    "oklch(18.889223061260854% 0 0)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("#7D7D7D", 4.5, "wcag", "auto"), 0, 0, 100, "srgb")
    ),
    "oklch(18.889223061260854% 0 0)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToBg("#7D7D7D", 4.5, "wcag", "darker"), 0, 0, 100, "srgb")
    ),
    "oklch(18.889223061260854% 0 0)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToBg("#7D7D7D", 4.5, "wcag", "lighter"), 0, 0, 100, "srgb")
    ),
    "oklch(100% 0 0)"
  );
});

// Colored bg
test("#12", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("#03F59E", 4.5, "wcag"), 0.14, 300, 100, "srgb")),
    "oklch(49.63668413519927% 0.14 300)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("#03F59E", 4.5, "wcag", "auto"), 0.14, 300, 100, "srgb")
    ),
    "oklch(49.63668413519927% 0.14 300)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToBg("#03F59E", 4.5, "wcag", "darker"), 0.14, 300, 100, "srgb")
    ),
    "oklch(49.63668413519927% 0.14 300)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToBg("#03F59E", 4.5, "wcag", "lighter"), 0.14, 300, 100, "srgb")
    ),
    "oklch(100% 0.14 300)"
  );
});

// Colored dark bg
test("#13", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("#5E4192", 4.5, "wcag"), 0.18, 120, 100, "srgb")),
    "oklch(80.64974688903266% 0.18 120)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("#5E4192", 4.5, "wcag", "auto"), 0.18, 120, 100, "srgb")
    ),
    "oklch(80.64974688903266% 0.18 120)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToBg("#5E4192", 4.5, "wcag", "darker"), 0.18, 120, 100, "srgb")
    ),
    "oklch(0% 0.18 120)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToBg("#5E4192", 4.5, "wcag", "lighter"), 0.18, 120, 100, "srgb")
    ),
    "oklch(80.64974688903266% 0.18 120)"
  );
});

// White fg
test("#14", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("white", 4.5, "wcag"), 0.15, 150, 100, "srgb")),
    "oklch(55.2978515625% 0.15 150)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("white", 4.5, "wcag", "auto"), 0.15, 150, 100, "srgb")
    ),
    "oklch(55.2978515625% 0.15 150)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToFg("white", 4.5, "wcag", "darker"), 0.15, 150, 100, "srgb")
    ),
    "oklch(55.2978515625% 0.15 150)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToFg("white", 4.5, "wcag", "lighter"), 0.15, 150, 100, "srgb")
    ),
    "oklch(100% 0.15 150)"
  );
});

// Black fg
test("#15", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("black", 4.5, "wcag"), 0.14, 150, 100, "srgb")),
    "oklch(54.43115234375% 0.14 150)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("black", 4.5, "wcag", "auto"), 0.14, 150, 100, "srgb")
    ),
    "oklch(54.43115234375% 0.14 150)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToFg("black", 4.5, "wcag", "darker"), 0.14, 150, 100, "srgb")
    ),
    "oklch(0% 0.14 150)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToFg("black", 4.5, "wcag", "lighter"), 0.14, 150, 100, "srgb")
    ),
    "oklch(54.43115234375% 0.14 150)"
  );
});

// Light gray fg
test("#16", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(
      apcach(
        crToFg("oklch(90.06% 0 89.88)", 4.5, "wcag"),
        0.1,
        150,
        100,
        "srgb"
      )
    ),
    "oklch(48.81181640625% 0.1 150)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(
        crToFg("oklch(90.06% 0 89.88)", 4.5, "wcag", "auto"),
        0.1,
        150,
        100,
        "srgb"
      )
    ),
    "oklch(48.81181640625% 0.1 150)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(
        crToFg("oklch(90.06% 0 89.88)", 4.5, "wcag", "darker"),
        0.1,
        150,
        100,
        "srgb"
      )
    ),
    "oklch(48.81181640625% 0.1 150)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(
        crToFg("oklch(90.06% 0 89.88)", 4.5, "wcag", "lighter"),
        0.1,
        150,
        100,
        "srgb"
      )
    ),
    "oklch(100% 0.1 150)"
  );
});

// Dark gray fg
test("#17", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(
      apcach(crToFg("hsl(223.81 0% 18%)", 4.5, "wcag"), 0.1, 50, 100, "srgb")
    ),
    "oklch(67.66801106066657% 0.1 50)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(
        crToFg("hsl(223.81 0% 18%)", 4.5, "wcag", "auto"),
        0.1,
        50,
        100,
        "srgb"
      )
    ),
    "oklch(67.66801106066657% 0.1 50)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(
        crToFg("hsl(223.81 0% 18%)", 4.5, "wcag", "darker"),
        0.1,
        50,
        100,
        "srgb"
      )
    ),
    "oklch(0% 0.1 50)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(
        crToFg("hsl(223.81 0% 18%)", 4.5, "wcag", "lighter"),
        0.1,
        50,
        100,
        "srgb"
      )
    ),
    "oklch(67.66801106066657% 0.1 50)"
  );
});

// Mid gray fg
test("#18", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("#7D7D7D", 3, "wcag"), 0, 0, 100, "srgb")),
    "oklch(32.69620851533793% 0 0)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("#7D7D7D", 3, "wcag", "auto"), 0, 0, 100, "srgb")
    ),
    "oklch(32.69620851533793% 0 0)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToFg("#7D7D7D", 3, "wcag", "darker"), 0, 0, 100, "srgb")
    ),
    "oklch(32.69620851533793% 0 0)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToFg("#7D7D7D", 3, "wcag", "lighter"), 0, 0, 100, "srgb")
    ),
    "oklch(89.30206953462397% 0 0)"
  );
});

// Mid gray fg
test("#19", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("#434343", 2, "wcag"), 0, 0, 100, "srgb")),
    "oklch(54.710281595631535% 0 0)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("#434343", 2, "wcag", "auto"), 0, 0, 100, "srgb")
    ),
    "oklch(54.710281595631535% 0 0)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToFg("#434343", 2, "wcag", "darker"), 0, 0, 100, "srgb")
    ),
    "oklch(14.713157938381253% 0 0)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToFg("#434343", 2, "wcag", "lighter"), 0, 0, 100, "srgb")
    ),
    "oklch(54.710281595631535% 0 0)"
  );
});

// Mid gray fg, high contrast
test("#20", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("#7D7D7D", 4, "wcag"), 0, 0, 100, "srgb")),
    "oklch(24.129830678866757% 0 0)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("#7D7D7D", 4, "wcag", "auto"), 0, 0, 100, "srgb")
    ),
    "oklch(24.129830678866757% 0 0)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToFg("#7D7D7D", 4, "wcag", "darker"), 0, 0, 100, "srgb")
    ),
    "oklch(24.129830678866757% 0 0)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToFg("#7D7D7D", 4, "wcag", "lighter"), 0, 0, 100, "srgb")
    ),
    "oklch(98.95825396217315% 0 0)"
  );
});

// Colored fg
test("#21", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("#03F59E", 4.5, "wcag"), 0.14, 300, 100, "srgb")),
    "oklch(49.63668413519927% 0.14 300)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("#03F59E", 4.5, "wcag", "auto"), 0.14, 300, 100, "srgb")
    ),
    "oklch(49.63668413519927% 0.14 300)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToFg("#03F59E", 4.5, "wcag", "darker"), 0.14, 300, 100, "srgb")
    ),
    "oklch(49.63668413519927% 0.14 300)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToFg("#03F59E", 4.5, "wcag", "lighter"), 0.14, 300, 100, "srgb")
    ),
    "oklch(100% 0.14 300)"
  );
});

// Colored dark fg
test("#22", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("#5E4192", 4.5, "wcag"), 0.18, 120, 100, "srgb")),
    "oklch(80.64974688903266% 0.18 120)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("#5E4192", 4.5, "wcag", "auto"), 0.18, 120, 100, "srgb")
    ),
    "oklch(80.64974688903266% 0.18 120)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToFg("#5E4192", 4.5, "wcag", "darker"), 0.18, 120, 100, "srgb")
    ),
    "oklch(0% 0.18 120)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToFg("#5E4192", 4.5, "wcag", "lighter"), 0.18, 120, 100, "srgb")
    ),
    "oklch(80.64974688903266% 0.18 120)"
  );
});

// High contrast
test("#23", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("white", 4.5, "wcag"), 0.4, 150, 100, "srgb")),
    "oklch(55.21240234375% 0.4 150)"
  );
});

// White bg, maxChroma
test("#24", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(
      apcach(crToBg("#FFFFFF", 4.5, "wcag"), maxChroma(), 200, 100, "srgb")
    ),
    "oklch(55.71289026139235% 0.09453125000000001 200)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#FFFFFF", 4.5, "wcag", "auto"),
        maxChroma(),
        200,
        100,
        "srgb"
      )
    ),
    "oklch(55.71289026139235% 0.09453125000000001 200)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#FFFFFF", 4.5, "wcag", "darker"),
        maxChroma(),
        200,
        100,
        "srgb"
      )
    ),
    "oklch(55.71289026139235% 0.09453125000000001 200)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#FFFFFF", 4.5, "wcag", "lighter"),
        maxChroma(),
        200,
        100,
        "srgb"
      )
    ),
    "oklch(100% 0 200)"
  );
});

// White bg, maxChroma capped
test("#25", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(
      apcach(crToBg("#000000", 4.5, "wcag"), maxChroma(0.1), 100, 100, "srgb")
    ),
    "oklch(55.712890625% 0.1 100)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#000000", 4.5, "wcag", "auto"),
        maxChroma(0.1),
        100,
        100,
        "srgb"
      )
    ),
    "oklch(55.712890625% 0.1 100)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#000000", 4.5, "wcag", "darker"),
        maxChroma(0.1),
        100,
        100,
        "srgb"
      )
    ),
    "oklch(0% 0 100)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#000000", 4.5, "wcag", "lighter"),
        maxChroma(0.1),
        100,
        100,
        "srgb"
      )
    ),
    "oklch(55.712890625% 0.1 100)"
  );
});

// Almost too high contrast, maxChroma
test("#26", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(
      apcach(crToBg("#A1A1A1", 7, "wcag"), maxChroma(0.2), 300, 100, "srgb")
    ),
    "oklch(21.7234966858858% 0.11484375000000002 300)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#A1A1A1", 7, "wcag", "auto"),
        maxChroma(0.2),
        300,
        100,
        "srgb"
      )
    ),
    "oklch(21.7234966858858% 0.11484375000000002 300)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#A1A1A1", 7, "wcag", "darker"),
        maxChroma(0.2),
        300,
        100,
        "srgb"
      )
    ),
    "oklch(21.7234966858858% 0.11484375000000002 300)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#A1A1A1", 2, "wcag", "lighter"),
        maxChroma(0.1),
        300,
        100,
        "srgb"
      )
    ),
    "oklch(91.77298507699662% 0.04609375 300)"
  );
});

// Too high contrast, maxChroma
test("#27", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(
      apcach(crToBg("#A1A1A1", 14, "wcag"), maxChroma(0.2), 300, 100, "srgb")
    ),
    "oklch(0% 0 300)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#A1A1A1", 14, "wcag", "auto"),
        maxChroma(0.2),
        300,
        100,
        "srgb"
      )
    ),
    "oklch(0% 0 300)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#A1A1A1", 14, "wcag", "darker"),
        maxChroma(0.2),
        300,
        100,
        "srgb"
      )
    ),
    "oklch(0% 0 300)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#A1A1A1", 14, "wcag", "lighter"),
        maxChroma(0.2),
        300,
        100,
        "srgb"
      )
    ),
    "oklch(100% 0 300)"
  );
});

test.run();
