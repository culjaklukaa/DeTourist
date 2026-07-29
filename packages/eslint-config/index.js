module.exports = {
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "prettier/prettier": "error",
  },
};
