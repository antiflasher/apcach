import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/**/!(*.test).@(ts|js)"],
  format: ["esm"],
  outDir: "dist",
  splitting: false,
  treeshake: true,
});
