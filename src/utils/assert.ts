export const ASSERT_NUMBER = (x: unknown): number => {
  if (typeof x !== "number") throw new Error("expected a number");
  if (isNaN(x)) throw new Error("expected a number, got NaN");
  return x;
};

export const ASSERT_EXAUSTED = (
  /**
   * having never here allow to properly make sure we handle all cases
   * magic typescript stuff there
   * */
  x: never,
  errMsg: string
): never => {
  throw new Error(`Unexpected value: ${x}; ${errMsg}`);
};