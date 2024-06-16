export const ASSERT_NUMBER = (x: unknown): number => {
  if (typeof x !== "number") throw new Error("expected a number");
  if (isNaN(x)) throw new Error("expected a number, got NaN");
  return x;
};
