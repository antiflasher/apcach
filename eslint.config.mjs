import loguxTsConfig from "@logux/eslint-config/ts";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ["dist"] },
  ...loguxTsConfig,
  {
    files: ["**/*.ts"],
    rules: {
      "import/extensions": "off",
    },
  },
];
