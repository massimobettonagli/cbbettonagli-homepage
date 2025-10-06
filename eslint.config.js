import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript"
  ),
  {
    rules: {
      // ✅ Migliorie consigliate:
      "no-console": ["warn", { allow: ["warn", "error"] }], // Permette console.warn/error ma avverte se lasci console.log
      "no-unused-vars": ["warn"],                          // Variabili dichiarate ma non usate ➔ warning
      "prefer-const": "warn",                               // Suggerisce usare const se non riassegni una variabile
      "eqeqeq": ["error", "always"],                        // Obbliga === invece di ==
      "no-empty-function": "warn",                          // Evita funzioni vuote senza logica
      "no-debugger": "error",                               // Vietato lasciare debugger nel codice in produzione
      "react-hooks/exhaustive-deps": "warn",                // Suggerisce correttamente le dipendenze nei React Hooks
    },
  },
];