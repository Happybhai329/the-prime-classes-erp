import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  // 1. Global Ignores
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/node_modules/**",
      "**/.next/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/postcss.config.js",
      "**/tailwind.config.ts",
      "**/vite.config.ts",
      "**/vitest.config.ts"
    ]
  },
  // 2. Base recommendations
  js.configs.recommended,
  // 3. API & Shared Types (Node.js & Jest)
  {
    files: [
      "apps/api/**/*.ts",
      "packages/shared-types/**/*.ts"
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      },
      globals: {
        ...globals.node,
        ...globals.jest,
        Express: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "no-empty": "warn",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_"
        }
      ]
    }
  },
  // 4. Web & Mobile (Browser & React/React Native)
  {
    files: [
      "apps/web/**/*.ts",
      "apps/web/**/*.tsx",
      "apps/mobile/**/*.ts",
      "apps/mobile/**/*.tsx"
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "no-empty": "warn",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_"
        }
      ]
    }
  }
];
