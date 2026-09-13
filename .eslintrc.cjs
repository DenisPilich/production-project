// .eslintrc.cjs
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:i18next/recommended",
    // "plugin:storybook/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: [
    "react",
    "@typescript-eslint",
    "react-hooks",
    "i18next", // Добавьте, если используете i18next
    // 'import', // Закомментируйте, пока не установите плагин
  ],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/jsx-filename-extension": [1, { extensions: [".tsx", ".ts"] }],
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "warn",
    "i18next/no-literal-string": [
      "error",
      {
        markupOnly: true,
        ignoreAttribute: [
          "data-testid",
          "to",
          "target",
          "justify",
          "align",
          "direction",
          "gap",
          "role",
          "as",
          // Презентационные атрибуты — не текст для перевода
          "width",
          "height",
          "border",
          "size",
          "type",
          "min",
          "max",
          "theme",
          "view",
          "textAlign",
          "colSpan",
          "rowSpan",
        ],
      },
    ], // Настройка для i18next
    // Отключаем правила import, так как нет плагина
    "import/no-extraneous-dependencies": "off",
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "import/prefer-default-export": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
    "no-param-resign": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
