module.exports = {
  extends: [
    "plugin:react/recommended"
  ],
  plugins: ["react"],
  settings: {
    react: {
      version: "detect"
    }
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    "react/jsx-key": "off",
    "react/prop-types": "off",
    "react/no-unknown-property": "off",
    "react/no-unescaped-entities": "off"
  }
};
