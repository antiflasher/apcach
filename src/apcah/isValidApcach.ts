import { Apcach } from "./apcach";

// 💬 2024-06-16 rvion
// | probably not a good way to do things here.
// | we should really move toward using proper classes
export function isValidApcach(el: Apcach): el is Apcach {
  return (
    el.contrastConfig !== undefined &&
    el.alpha !== undefined &&
    el.chroma !== undefined &&
    el.hue !== undefined &&
    el.lightness !== undefined
  );
}
