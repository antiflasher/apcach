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
    "oklch(55.908203125% 0.15 150)"
  );
});

// Explicit white bg
test("#5", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("white", 70), 0.15, 300, 100, "srgb")),
    "oklch(59.08203125% 0.15 300)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("white", 70, "apca", "auto"), 0.15, 300, 100, "srgb")
    ),
    "oklch(59.08203125% 0.15 300)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToBg("white", 70, "apca", "darker"), 0.15, 300, 100, "srgb")
    ),
    "oklch(59.08203125% 0.15 300)"
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
    "oklch(79.19921875% 0.2 150)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("black", 70, "apca", "auto"), 0.2, 150, 100, "srgb")
    ),
    "oklch(79.19921875% 0.2 150)"
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
    "oklch(79.19921875% 0.2 150)"
  );
});

// Light gray bg
test("#7", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(
      apcach(crToBg("oklch(90.06% 0 89.88)", 70), 0.1, 150, 100, "srgb")
    ),
    "oklch(40.5226025390625% 0.1 150)"
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
    "oklch(40.5226025390625% 0.1 150)"
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
    "oklch(40.5226025390625% 0.1 150)"
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
    "oklch(82.10986039682078% 0.1 50)"
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
    "oklch(82.10986039682078% 0.1 50)"
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
    "oklch(82.10986039682078% 0.1 50)"
  );
});

// Mid gray bg
test("#9", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("#7D7D7D", 20), 0, 0, 100, "srgb")),
    "oklch(40.94584633096483% 0 0)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("#7D7D7D", 20, "apca", "auto"), 0, 0, 100, "srgb")
    ),
    "oklch(40.94584633096483% 0 0)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToBg("#7D7D7D", 20, "apca", "darker"), 0, 0, 100, "srgb")
    ),
    "oklch(40.94584633096483% 0 0)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToBg("#7D7D7D", 20, "apca", "lighter"), 0, 0, 100, "srgb")
    ),
    "oklch(72.59406577409274% 0 0)"
  );
});

// Mid gray bg
test("#10", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("#434343", 20), 0, 0, 100, "srgb")),
    "oklch(57.075712663324786% 0 0)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("#434343", 20, "apca", "auto"), 0, 0, 100, "srgb")
    ),
    "oklch(57.075712663324786% 0 0)"
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
    "oklch(57.075712663324786% 0 0)"
  );
});

// Mid gray bg, high contrast
test("#11", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("#7D7D7D", 70), 0, 0, 100, "srgb")),
    "oklch(98.30112170638053% 0 0)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("#7D7D7D", 70, "apca", "auto"), 0, 0, 100, "srgb")
    ),
    "oklch(98.30112170638053% 0 0)"
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
    "oklch(98.31717947735658% 0 0)"
  );
});

// Colored bg
test("#12", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("#03F59E", 70), 0.14, 300, 100, "srgb")),
    "oklch(39.208282988813544% 0.14 300)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("#03F59E", 70, "apca", "auto"), 0.14, 300, 100, "srgb")
    ),
    "oklch(39.208282988813544% 0.14 300)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToBg("#03F59E", 70, "apca", "darker"), 0.14, 300, 100, "srgb")
    ),
    "oklch(39.208282988813544% 0.14 300)"
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
    "oklch(88.49225894375617% 0.2 120)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToBg("#5E4192", 70, "apca", "auto"), 0.2, 120, 100, "srgb")
    ),
    "oklch(88.49225894375617% 0.2 120)"
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
    "oklch(88.49225894375617% 0.2 120)"
  );
});

// White fg
test("#14", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("white", 65), 0.15, 150, 100, "srgb")),
    "oklch(63.18359375% 0.15 150)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("white", 65, "apca", "auto"), 0.15, 150, 100, "srgb")
    ),
    "oklch(63.18359375% 0.15 150)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToFg("white", 65, "apca", "darker"), 0.15, 150, 100, "srgb")
    ),
    "oklch(63.18359375% 0.15 150)"
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
    "oklch(78.515625% 0.2 150)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("black", 70, "apca", "auto"), 0.2, 150, 100, "srgb")
    ),
    "oklch(78.515625% 0.2 150)"
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
    "oklch(78.515625% 0.2 150)"
  );
});

// Light gray fg
test("#16", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(
      apcach(crToFg("oklch(90.06% 0 89.88)", 70), 0.1, 150, 100, "srgb")
    ),
    "oklch(43.183066406250006% 0.1 150)"
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
    "oklch(43.183066406250006% 0.1 150)"
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
    "oklch(43.183066406250006% 0.1 150)"
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
    "oklch(82.17814337240543% 0.1 50)"
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
    "oklch(82.17814337240543% 0.1 50)"
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
    "oklch(82.17814337240543% 0.1 50)"
  );
});

// Mid gray fg
test("#18", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("#7D7D7D", 20), 0, 0, 100, "srgb")),
    "oklch(41.118613615061726% 0 0)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("#7D7D7D", 20, "apca", "auto"), 0, 0, 100, "srgb")
    ),
    "oklch(41.118613615061726% 0 0)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToFg("#7D7D7D", 20, "apca", "darker"), 0, 0, 100, "srgb")
    ),
    "oklch(41.118613615061726% 0 0)"
  );

  // LIGHTER
  assert.is(
    apcachToCss(
      apcach(crToFg("#7D7D7D", 20, "apca", "lighter"), 0, 0, 100, "srgb")
    ),
    "oklch(73.55567750131756% 0 0)"
  );
});

// Mid gray fg
test("#19", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("#434343", 20), 0, 0, 100, "srgb")),
    "oklch(57.000380463716716% 0 0)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("#434343", 20, "apca", "auto"), 0, 0, 100, "srgb")
    ),
    "oklch(57.000380463716716% 0 0)"
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
    "oklch(57.000380463716716% 0 0)"
  );
});

// Mid gray fg, high contrast
test("#20", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("#7D7D7D", 60), 0, 0, 100, "srgb")),
    "oklch(95.82479063432494% 0 0)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("#7D7D7D", 60, "apca", "auto"), 0, 0, 100, "srgb")
    ),
    "oklch(95.82479063432494% 0 0)"
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
    "oklch(95.83301584869245% 0 0)"
  );
});

// Colored fg
test("#21", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToFg("#03F59E", 70), 0.14, 300, 100, "srgb")),
    "oklch(41.42131706592443% 0.14 300)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("#03F59E", 70, "apca", "auto"), 0.14, 300, 100, "srgb")
    ),
    "oklch(41.42131706592443% 0.14 300)"
  );

  // DARKER
  assert.is(
    apcachToCss(
      apcach(crToFg("#03F59E", 70, "apca", "darker"), 0.14, 300, 100, "srgb")
    ),
    "oklch(41.42131706592443% 0.14 300)"
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
    "oklch(89.97452067231217% 0.2 120)"
  );

  // AUTO
  assert.is(
    apcachToCss(
      apcach(crToFg("#5E4192", 70, "apca", "auto"), 0.2, 120, 100, "srgb")
    ),
    "oklch(89.97452067231217% 0.2 120)"
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
    "oklch(89.97452067231217% 0.2 120)"
  );
});

// High contrast
test("#23", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(70, 0.4, 150, 100, "srgb")),
    "oklch(55.859375% 0.4 150)"
  );
});

// White bg, maxChroma
test("#24", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(apcach(crToBg("#FFFFFF", 70), maxChroma(), 200, 100, "srgb")),
    "oklch(56.44531213161228% 0.09531250000000001 200)"
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
    "oklch(56.44531213161228% 0.09531250000000001 200)"
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
    "oklch(56.44531213161228% 0.09531250000000001 200)"
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
    "oklch(81.28662109375% 0.1 100)"
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
    "oklch(81.28662109375% 0.1 100)"
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
    "oklch(81.28662109375% 0.1 100)"
  );
});

// Almost too high contrast, maxChroma
test("#26", () => {
  // Implicit search direction
  assert.is(
    apcachToCss(
      apcach(crToBg("#A1A1A1", 50), maxChroma(0.2), 300, 100, "srgb")
    ),
    "oklch(25.652766604368725% 0.13593750000000002 300)"
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
    "oklch(25.652766604368725% 0.13593750000000002 300)"
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
    "oklch(25.652766604368725% 0.13593750000000002 300)"
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
    "oklch(97.55605083461731% 0.012500000000000004 300)"
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
