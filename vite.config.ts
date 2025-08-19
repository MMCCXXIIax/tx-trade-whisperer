// vite.config.ts
import { defineConfig, PluginOption } from "vite";
import path from "path";

// Attempt to load prod plugin with a friendly warning if missing
function safeRequire<T>(pkg: string, fallback: T): T {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(pkg);
  } catch {
    console.warn(`⚠️  Missing dependency "${pkg}" — install it with: yarn add ${pkg}`);
    return fallback;
  }
}

// Core React plugin for both dev & prod
const react = safeRequire<PluginOption>("@vitejs/plugin-react-swc", () => ({}));

// Dev‑only component tagger
const componentTagger = safeRequire<PluginOption>("lovable-tagger", () => ({})).componentTagger;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger?.(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
