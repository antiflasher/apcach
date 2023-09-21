# apcach()

JS color calculator for composing colors with consistent APCA contrast ratio.

<img src="img/cover.png" alt="apcach = apca + oklch">

## Install

```bash
npm install apcach
```

## API

<img src="img/api-composing.png" alt="composing colors using apcach">

### Color on a white background

For composing a color that you are going to use as a foreground color (for text or icons) on white background, use a short notation:

```js
import { apcach } from "apcach";
apcach(60, 0.2, 145); // oklch(62.5% 0.2 145)
```

Parameters are:

- desired contrast ratio (the same with APCA 0...108)
- chroma (the same with oklch 0...0.37)
- hue (the same with oklch 0...360)

(Follow to [Apcach color conversion to CSS](#apcach-color-conversion-to-CSS) section to see how to convert apcach to a CSS color)

### Color on a black background

For composing a foreground color on black background, use `crToBlack()` function:

```js
import { apcach, crToBgBlack } from "apcach";
apcach(crToBgBlack(60), 0.2, 145); // oklch(73.8% 0.2 145)
```

### Color on a custom background

For custom composing a foreground color on a custom background, use `crToBg()` function:

```js
import { apcach, crToBg } from "apcach";
apcach(crToBg("#E8E8E8", 60), 0.2, 145); // oklch(52.71% 0.2 145)
```

Parameters in `crToBg()` function are:

- background color (opaque colors only in one of these formats: `oklch`, `oklab`, `display-p3`, `lch`, `lab`, `hex`, `rgb`, `hsl`, `p3`)
- desired contrast ratio (the same with APCA 0...108)

> Pro tip: When working in Firma with `display-p3` profile use colors in `display-p3` format instead of `hex`.

### Background color

APCA calculates contrast differently depending on color position – on the background or in the foreground. So if you want to compose a color and use in on background, use `crToFg()` function:

```js
import { apcach, crToFg } from "apcach";
apcach(crToFg("white", 60), 0.2, 145); // oklch(66.02% 0.2 145)
```

Parameters in `crToFg()` function are:

- foreground color (opaque colors only in one of these formats: `oklch`, `oklab`, `display-p3`, `lch`, `lab`, `hex`, `rgb`, `hsl`, `p3`)
- desired contrast ratio (the same with APCA 0...108)

> Pro tip: When working in Firma with `display-p3` profile use colors in `display-p3` format instead of `hex`.

### Maximum chroma

Use `maxChroma()` function instead of a static value for finding the most saturated color with given hue and contrast ratio:

```js
import { apcach, maxChroma } from "apcach";
apcach(crToFg("white", 60), maxChroma(), 145); // oklch(65.01% 0.28 145)
```

The `maxChroma()` accepts a value for limiting the highest possible value:

```js
import { apcach, maxChroma } from "apcach";
apcach(crToFg("white", 60), maxChroma(0.25), 145); // oklch(65.43% 0.25 145)
apcach(crToFg("white", 60), maxChroma(0.25), 200); // oklch(66.14% 0.15 200)
```

### Color manipulations

Having a color in apcach format, you can adjust its contrast, chroma, or hue by using these functions:

**Contrast**

```js
import { apcach, setContrast } from "apcach";
let color = apcach(60, 0.2, 145); // oklch(62.5% 0.2 145)
// Absolute value
setContrast(color, 70); // oklch(55.42% 0.2 145)
// Relative value
setContrast(color, (cr) => cr + 10); // oklch(55.42% 0.2 145)
```

Parameters in `setContrast()` function are:

- color you want to adjust
- contrast value:
  - Absolute: `Number` 0...108
  - Relative: `cr => cr + DELTA`. The resulting value will be auto-clipped by range 0...108

**Chroma**

```js
import { apcach, setChroma } from "apcach";
let color = apcach(60, 0.2, 145); // oklch(62.5% 0.2 145)
// Absolute value
setChroma(color, 0.1); // oklch(63.62% 0.1 145)
// Relative value
setChroma(color, (c) => c - 0.1); // oklch(63.62% 0.1 145)
```

Parameters in `setChroma()` function are:

- color you want to adjust
- chroma value:
  - Absolute: `Number` 0...0.37
  - Relative: `c => c + DELTA`. The resulting value will be auto-clipped by range 0...0.37

**Hue**

```js
import { apcach, setHue } from "apcach";
let color = apcach(60, 0.2, 145); // oklch(62.5% 0.2 145)
// Absolute value
setHue(color, 300); // oklch(66.6% 0.2 300)
// Relative value
setHue(color, (h) => h + 155); // oklch(66.6% 0.2 300)
```

Parameters in `setHue()` function are:

- color you want to adjust
- hue value
  - Absolute: `Number` 0...360
  - Relative: `h => h + DELTA`. The resulting value will be auto-clipped by range 0...360

### apcach color conversion to CSS

Once the color is composed, convert it into one of the CSS formats and use it as usual:

```js
import { apcach, apcachToCss } from "apcach";
let color = apcach(60, 0.2, 145);
apcachToCss(color, "oklch"); // oklch(62.5% 0.2 145)
apcachToCss(color, "hex"); // #00a529
apcachToCss(color, "p3"); // color(display-p3 0.2787 0.6353 0.2398)
apcachToCss(color, "figma-p3"); // #47a23d
```

Parameters in `apcachToCss()` function are:

- color in the apcach format you want to convert
- format (supported: `oklch`, `rgb`, `hex`, `p3`, `firma-p3`)

> Pro tip: When working in Firma with `display-p3` profile convert apcach to `figma-p3` which basically is `hex` stretch to p3 space.

### CSS color conversion to apcach

The apcach format can be restored from color in CSS format using the function `cssToApcach()`:

```js
import { apcach, cssToApcach } from "apcach";
let cssColor = "oklch(70% 0.1 200)";
let comparingColor = "#fff";
let apcachColor = cssToApcach(cssColor, { bg: comparingColor });
apcachToCss(apcachColor, "oklch"); // oklch(69.99% 0.1 200)
```

Parameters in `cssToApcach()` function are:

- color in CSS format that you want to convert to apcach format
- commaring color:
  - if it's on the background position: `bg : comparingColor` (supported formats: `oklch`, `oklab`, `display-p3`, `lch`, `lab`, `hex`, `rgb`, `hsl`, `p3`)
  - if it's in the foreground position: `fg : comparingColor`

### APCA vs WCAG

All contrast functions accept contrast model as a parameter. When not specified, APCA is used. Use this parameter to specify the contrast model that apcach will use for color composition.

```js
import { apcach, crToBg } from "apcach";
apcach(crToBg("#E8E8E8", 60, "apca"), 0.2, 145); // oklch(52.71% 0.2 145)
```

So if you need a color calculated based on WCAG, use `wcag` keyword:

```js
import { apcach, crToBg } from "apcach";
apcach(crToBg("#E8E8E8", 4.5, "wcag"), 0.2, 145); // oklch(50.5% 0.2 145)
```

Supported values: `apca`, `wcag`

> Pro tip: Don't forget to adjust the contrast amount. APCA's scale goes from 8 to 108, WCAG scale goes from 1 to 21

### Search direction

You can specify if you need a color lighter or darker then the comparing one (bg or fg color you provide for calculation). Default value is `auto` whihc means apcach will try to find find either darker of lighter color with desired contrast ratio.

Lighter color search:

```js
import { apcach, crToBg } from "apcach";
apcach(crToBg("#00A3FF", 40, "apca", "lighter"), 0.2, 145, 100, "p3"); // oklch(89.62% 0.2 145)
```

Darker color search:

```js
import { apcach, crToBg } from "apcach";
apcach(crToBg("#00A3FF", 40, "apca", "darker"), 0.2, 145, 100, "p3"); // oklch(35.28% 0.2 145)
```

Supported values: `lighter`, `darker`, `auto`

### SRGB vs P3 colors

You can specify if you need a color in `P3` or `SRGB` color space. Default value is `p3`.

```js
import { apcach, crToBg } from "apcach";
apcach(crToBg("color(display-p3 0.000 0.639 1.000)", 40), 0.1, 145, 100, "p3"); // oklch(35.17% 0.1 145)
```

```js
import { apcach, crToBg } from "apcach";
apcach(crToBg("#00A3FF", 40), 0.1, 145, 100, "srgb"); // oklch(35.82% 0.1 145)
```

> Pro tip: When working in Firma with `display-p3` profile use colors in `display-p3` format instead of `hex`.
