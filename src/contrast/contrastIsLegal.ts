import type { ContrastModel } from "../types";

export function contrastIsLegal(
  cr: number,
  contrastModel: ContrastModel
): boolean {
  return (
    (Math.abs(cr) >= 8 && contrastModel === "apca") ||
    (Math.abs(cr) >= 1 && contrastModel === "wcag")
  );
}
