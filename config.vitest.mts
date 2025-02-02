import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/*.test.?(c|m)[jt]s?(x)"],
  },
});
