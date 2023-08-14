import { apcach, apcachToCss } from "../index.js";

document.body.style.background = apcachToCss(apcach(10, 10, 10), "hex");
