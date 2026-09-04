import type { CapacitorConfig } from "@capacitor/cli";

// O app Android carrega o site já publicado (não um build estático) porque
// o DELARIVA usa Server Components, Server Actions e middleware de auth do
// Next.js — recursos que não existem em um `next export` estático.
// Troque a URL abaixo pela URL real de produção (Vercel, etc.) antes de gerar o APK.
const PRODUCTION_URL = "https://delarivasaj.vercel.app";

const config: CapacitorConfig = {
  appId: "br.com.delariva.saj",
  appName: "DELARIVA SAJ",
  webDir: "www",
  server: {
    url: PRODUCTION_URL,
    cleartext: false,
  },
};

export default config;
