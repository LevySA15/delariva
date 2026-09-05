import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Código Deno das edge functions do Supabase — roda fora do projeto
    // TypeScript do Next.js (npm: imports, globais do Deno).
    "supabase/functions/**",
  ]),
]);

export default eslintConfig;
