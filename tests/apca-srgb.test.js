import { test } from "uvu";
import * as assert from "uvu/assert";

import { apcach, apcachToCss, crToBg, crToFg, maxChroma } from "../index.js";

// ----------------------------------------
// CONTRAST BELOW THRESHOLD
// ----------------------------------------

// White bg, gray
test("#0", () => {
  assert.is(apcachToCss(apcach(5, 0, 0, 100, "srgb")), "oklch(100% 0 0)");
});

// Black bg, low chroma
test("#1", () => {
  assert.is(
    apcachToCss(apcach(crToBg("black", 5), 0.05, 200, 100, "srgb")),
    "oklch(0% 0.05 200)"
  );
});

// Gray fg, high chroma
test("#2", () => {
  assert.is(
    apcachToCss(apcach(crToFg("#7D7D7D", 5), 3, 100, 100, "srgb")),
    "oklch(58.97123297174118% 3 100)"
  );
});

// Colored fg, gray
test("#3", () => {
  assert.is(
    apcachToCss(apcach(crToFg("#00FF94", 5), 0, 70, 100, "srgb")),
    "oklch(87.82585371306136% 0 70)"
  );
});

// ----------------------------------------
// CREATION
// ----------------------------------------

// Implicit white bg
test("#4", () => {
  assert.is(
    apcachToCss(apcach(70, 0.15, 150, 100, "srgb")),
    "oklch(55.615234375% 0.15 150)"
  );
});

// Explicit white bg
test("#5", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("white", 70), 0.15, 300, 100, "srgb")),
    "oklch(59.130859375% 0.15 300)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("white", 70, "apca", "auto"), 0.15, 300, 100, "srgb")
    ),
    "oklch(59.130859375% 0.15 300)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToBg("white", 70, "apca", "darker"), 0.15, 300, 100, "srgb")
    ),
    "oklch(59.130859375% 0.15 300)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToBg("white", 70, "apca", "lighter"), 0.15, 300, 100, "srgb")
    ),
    "oklch(100% 0.15 300)"
  );
});

// Black bg
test("#6", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("black", 70), 0.2, 150, 100, "srgb")),
    "oklch(78.9794921875% 0.2 150)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("black", 70, "apca", "auto"), 0.2, 150, 100, "srgb")
    ),
    "oklch(78.9794921875% 0.2 150)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToBg("black", 70, "apca", "darker"), 0.2, 150, 100, "srgb")
    ),
    "oklch(0% 0.2 150)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToBg("black", 70, "apca", "lighter"), 0.2, 150, 100, "srgb")
    ),
    "oklch(78.9794921875% 0.2 150)"
  );
});

// Light gray bg
test("#7", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(
      apcach(crToBg("oklch(90.06% 0 89.88)", 70), 0.1, 150, 100, "srgb")
    ),
    "oklch(40.34670410156251% 0.1 150)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(
        crToBg("oklch(90.06% 0 89.88)", 70, "apca", "auto"),
        0.1,
        150,
        100,
        "srgb"
      )
    ),
    "oklch(40.34670410156251% 0.1 150)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("oklch(90.06% 0 89.88)", 70, "apca", "darker"),
        0.1,
        150,
        100,
        "srgb"
      )
    ),
    "oklch(40.34670410156251% 0.1 150)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("oklch(90.06% 0 89.88)", 70, "apca", "lighter"),
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
    apcachToCss(apcach(crToBg("hsl(223.81 0% 18%)", 65), 0.1, 50, 100, "srgb")),
    "oklch(82.09278965292461% 0.1 50)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(
        crToBg("hsl(223.81 0% 18%)", 65, "apca", "auto"),
        0.1,
        50,
        100,
        "srgb"
      )
    ),
    "oklch(82.09278965292461% 0.1 50)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("hsl(223.81 0% 18%)", 65, "apca", "darker"),
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
        crToBg("hsl(223.81 0% 18%)", 65, "apca", "lighter"),
        0.1,
        50,
        100,
        "srgb"
      )
    ),
    "oklch(82.09278965292461% 0.1 50)"
  );
});

// Mid gray bg
test("#9", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("#7D7D7D", 20), 0, 0, 100, "srgb")),
    "oklch(41.08981906771224% 0 0)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("#7D7D7D", 20, "apca", "auto"), 0, 0, 100, "srgb")
    ),
    "oklch(41.08981906771224% 0 0)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToBg("#7D7D7D", 20, "apca", "darker"), 0, 0, 100, "srgb")
    ),
    "oklch(41.08981906771224% 0 0)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToBg("#7D7D7D", 20, "apca", "lighter"), 0, 0, 100, "srgb")
    ),
    "oklch(72.69423366234534% 0 0)"
  );
});

// Mid gray bg
test("#10", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("#434343", 20), 0, 0, 100, "srgb")),
    "oklch(57.105845543168% 0 0)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("#434343", 20, "apca", "auto"), 0, 0, 100, "srgb")
    ),
    "oklch(57.105845543168% 0 0)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToBg("#434343", 20, "apca", "darker"), 0, 0, 100, "srgb")
    ),
    "oklch(0% 0 0)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToBg("#434343", 20, "apca", "lighter"), 0, 0, 100, "srgb")
    ),
    "oklch(57.105845543168% 0 0)"
  );
});

// Mid gray bg, high contrast
test("#11", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("#7D7D7D", 70), 0, 0, 100, "srgb")),
    "oklch(98.38750534842896% 0 0)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("#7D7D7D", 70, "apca", "auto"), 0, 0, 100, "srgb")
    ),
    "oklch(98.38750534842896% 0 0)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToBg("#7D7D7D", 70, "apca", "darker"), 0, 0, 100, "srgb")
    ),
    "oklch(0% 0 0)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToBg("#7D7D7D", 70, "apca", "lighter"), 0, 0, 100, "srgb")
    ),
    "oklch(98.37728021030814% 0 0)"
  );
});

// Colored bg
test("#12", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("#03F59E", 70), 0.14, 300, 100, "srgb")),
    "oklch(39.54232586837746% 0.14 300)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("#03F59E", 70, "apca", "auto"), 0.14, 300, 100, "srgb")
    ),
    "oklch(39.54232586837746% 0.14 300)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToBg("#03F59E", 70, "apca", "darker"), 0.14, 300, 100, "srgb")
    ),
    "oklch(39.54232586837746% 0.14 300)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToBg("#03F59E", 70, "apca", "lighter"), 0.14, 300, 100, "srgb")
    ),
    "oklch(100% 0.14 300)"
  );
});

// Colored dark bg
test("#13", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("#5E4192", 70), 0.2, 120, 100, "srgb")),
    "oklch(88.37098298414708% 0.2 120)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("#5E4192", 70, "apca", "auto"), 0.2, 120, 100, "srgb")
    ),
    "oklch(88.37098298414708% 0.2 120)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToBg("#5E4192", 70, "apca", "darker"), 0.2, 120, 100, "srgb")
    ),
    "oklch(0% 0.2 120)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToBg("#5E4192", 70, "apca", "lighter"), 0.2, 120, 100, "srgb")
    ),
    "oklch(88.37098298414708% 0.2 120)"
  );
});

// White fg
test("#14", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("white", 65), 0.15, 150, 100, "srgb")),
    "oklch(63.00048828125% 0.15 150)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("white", 65, "apca", "auto"), 0.15, 150, 100, "srgb")
    ),
    "oklch(63.00048828125% 0.15 150)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToFg("white", 65, "apca", "darker"), 0.15, 150, 100, "srgb")
    ),
    "oklch(63.00048828125% 0.15 150)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToFg("white", 65, "apca", "lighter"), 0.15, 150, 100, "srgb")
    ),
    "oklch(100% 0.15 150)"
  );
});

// Black fg
test("#15", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("black", 70), 0.2, 150, 100, "srgb")),
    "oklch(78.38134765625% 0.2 150)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("black", 70, "apca", "auto"), 0.2, 150, 100, "srgb")
    ),
    "oklch(78.38134765625% 0.2 150)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToFg("black", 70, "apca", "darker"), 0.2, 150, 100, "srgb")
    ),
    "oklch(0% 0.2 150)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToFg("black", 70, "apca", "lighter"), 0.2, 150, 100, "srgb")
    ),
    "oklch(78.38134765625% 0.2 150)"
  );
});

// Light gray fg
test("#16", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(
      apcach(crToFg("oklch(90.06% 0 89.88)", 70), 0.1, 150, 100, "srgb")
    ),
    "oklch(42.963193359375005% 0.1 150)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(
        crToFg("oklch(90.06% 0 89.88)", 70, "apca", "auto"),
        0.1,
        150,
        100,
        "srgb"
      )
    ),
    "oklch(42.963193359375005% 0.1 150)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(
        crToFg("oklch(90.06% 0 89.88)", 70, "apca", "darker"),
        0.1,
        150,
        100,
        "srgb"
      )
    ),
    "oklch(42.963193359375005% 0.1 150)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(
        crToFg("oklch(90.06% 0 89.88)", 70, "apca", "lighter"),
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
    apcachToCss(apcach(crToFg("hsl(223.81 0% 18%)", 65), 0.1, 50, 100, "srgb")),
    "oklch(82.09278965292461% 0.1 50)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(
        crToFg("hsl(223.81 0% 18%)", 65, "apca", "auto"),
        0.1,
        50,
        100,
        "srgb"
      )
    ),
    "oklch(82.09278965292461% 0.1 50)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(
        crToFg("hsl(223.81 0% 18%)", 65, "apca", "darker"),
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
        crToFg("hsl(223.81 0% 18%)", 65, "apca", "lighter"),
        0.1,
        50,
        100,
        "srgb"
      )
    ),
    "oklch(82.09278965292461% 0.1 50)"
  );
});

// Mid gray fg
test("#18", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("#7D7D7D", 20), 0, 0, 100, "srgb")),
    "oklch(41.08981906771224% 0 0)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("#7D7D7D", 20, "apca", "auto"), 0, 0, 100, "srgb")
    ),
    "oklch(41.08981906771224% 0 0)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToFg("#7D7D7D", 20, "apca", "darker"), 0, 0, 100, "srgb")
    ),
    "oklch(41.08981906771224% 0 0)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToFg("#7D7D7D", 20, "apca", "lighter"), 0, 0, 100, "srgb")
    ),
    "oklch(73.6458286007449% 0 0)"
  );
});

// Mid gray fg
test("#19", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("#434343", 20), 0, 0, 100, "srgb")),
    "oklch(57.105845543168% 0 0)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("#434343", 20, "apca", "auto"), 0, 0, 100, "srgb")
    ),
    "oklch(57.105845543168% 0 0)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToFg("#434343", 20, "apca", "darker"), 0, 0, 100, "srgb")
    ),
    "oklch(0% 0 0)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToFg("#434343", 20, "apca", "lighter"), 0, 0, 100, "srgb")
    ),
    "oklch(57.105845543168% 0 0)"
  );
});

// Mid gray fg, high contrast
test("#20", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("#7D7D7D", 60), 0, 0, 100, "srgb")),
    "oklch(95.9687633710724% 0 0)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("#7D7D7D", 60, "apca", "auto"), 0, 0, 100, "srgb")
    ),
    "oklch(95.9687633710724% 0 0)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToFg("#7D7D7D", 60, "apca", "darker"), 0, 0, 100, "srgb")
    ),
    "oklch(0% 0 0)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToFg("#7D7D7D", 60, "apca", "lighter"), 0, 0, 100, "srgb")
    ),
    "oklch(95.97325089224611% 0 0)"
  );
});

// Colored fg
test("#21", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("#03F59E", 70), 0.14, 300, 100, "srgb")),
    "oklch(41.85974834535206% 0.14 300)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("#03F59E", 70, "apca", "auto"), 0.14, 300, 100, "srgb")
    ),
    "oklch(41.85974834535206% 0.14 300)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToFg("#03F59E", 70, "apca", "darker"), 0.14, 300, 100, "srgb")
    ),
    "oklch(41.85974834535206% 0.14 300)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToFg("#03F59E", 70, "apca", "lighter"), 0.14, 300, 100, "srgb")
    ),
    "oklch(100% 0.14 300)"
  );
});

// Colored dark fg
test("#22", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("#5E4192", 70), 0.2, 120, 100, "srgb")),
    "oklch(89.89367003257277% 0.2 120)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("#5E4192", 70, "apca", "auto"), 0.2, 120, 100, "srgb")
    ),
    "oklch(89.89367003257277% 0.2 120)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToFg("#5E4192", 70, "apca", "darker"), 0.2, 120, 100, "srgb")
    ),
    "oklch(0% 0.2 120)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToFg("#5E4192", 70, "apca", "lighter"), 0.2, 120, 100, "srgb")
    ),
    "oklch(89.89367003257277% 0.2 120)"
  );
});

// High contrast
test("#23", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(70, 0.4, 150, 100, "srgb")),
    "oklch(48.35205078125% 0.4 150)"
  );
});

// White bg, maxChroma
test("#24", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("#FFFFFF", 70), maxChroma(), 200, 100, "srgb")),
    "oklch(56.20117150820562% 0.09531250000000001 200)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#FFFFFF", 70, "apca", "auto"),
        maxChroma(),
        200,
        100,
        "srgb"
      )
    ),
    "oklch(56.20117150820562% 0.09531250000000001 200)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#FFFFFF", 70, "apca", "darker"),
        maxChroma(),
        200,
        100,
        "srgb"
      )
    ),
    "oklch(56.20117150820562% 0.09531250000000001 200)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#FFFFFF", 70, "apca", "lighter"),
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
      apcach(crToBg("#000000", 70), maxChroma(0.1), 100, 100, "srgb")
    ),
    "oklch(81.23779296875% 0.1 100)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#000000", 70, "apca", "auto"),
        maxChroma(0.1),
        100,
        100,
        "srgb"
      )
    ),
    "oklch(81.23779296875% 0.1 100)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#000000", 70, "apca", "darker"),
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
        crToBg("#000000", 70, "apca", "lighter"),
        maxChroma(0.1),
        100,
        100,
        "srgb"
      )
    ),
    "oklch(81.23779296875% 0.1 100)"
  );
});

// Almost too high contrast, maxChroma
test("#26", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(
      apcach(crToBg("#A1A1A1", 50), maxChroma(0.2), 300, 100, "srgb")
    ),
    "oklch(25.18540850833772% 0.13359375 300)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#A1A1A1", 50, "apca", "auto"),
        maxChroma(0.2),
        300,
        100,
        "srgb"
      )
    ),
    "oklch(25.18540850833772% 0.13359375 300)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#A1A1A1", 50, "apca", "darker"),
        maxChroma(0.2),
        300,
        100,
        "srgb"
      )
    ),
    "oklch(25.18540850833772% 0.13359375 300)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#A1A1A1", 50, "apca", "lighter"),
        maxChroma(0.1),
        300,
        100,
        "srgb"
      )
    ),
    "oklch(97.6413048752702% 0.012500000000000002 300)"
  );
});

// Too high contrast, maxChroma
test("#27", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(
      apcach(crToBg("#A1A1A1", 60), maxChroma(0.2), 300, 100, "srgb")
    ),
    "oklch(0% 0 300)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(
        crToBg("#A1A1A1", 60, "apca", "auto"),
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
        crToBg("#A1A1A1", 60, "apca", "darker"),
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
        crToBg("#A1A1A1", 60, "apca", "lighter"),
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
