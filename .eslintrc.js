module.exports = {
  "env": {
    "browser": true,
    "es6": true
  },
  "plugins": ["react-hooks"],
  "extends": ["eslint:recommended", "plugin:react-hooks/recommended"],
  "parserOptions": {
    "sourceType": "module"
  },
  "globals": {
    "chrome": 1,
    "Bacon": 1,
    "require": 1
  },

  "rules": {
    "indent": [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "double"
    ],
    "semi": [
      "error",
      "always"

    ],
    // "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
    // "react-hooks/exhaustive-deps": "warn" // Checks effect dependencies
  }
};
