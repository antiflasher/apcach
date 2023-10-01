#!/usr/bin/env node

import benchmark from "benchmark";

import { apcach, maxChroma } from "./index.js";

let suite = new benchmark.Suite();

suite
  .add("create", () => {
    apcach(70, 0.1, 200);
  })
  .on("cycle", (event) => {
    process.stdout.write(String(event.target));
  })
  .on("error", (event) => {
    process.stderr.write(event.target.error.toString() + "\n");
    process.exit(1);
  })
  .run();
