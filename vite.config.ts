// vite.config.ts
import { defineConfig, PluginOption } from "vite";
import path from "path";

/**
 * Safe require helper — avoids hard crashes if a package is missing.
 * Logs a friendly warning instead.
 */
function safeRequire<T>(pkg: string, fallback: T): T {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(pkg);
  } catch {
    console.warn(`⚠️  Missing dependency "${pkg}" — install it with: yarn add -D ${pkg}`);
    return fallback;
  }
}

// Core React plugin (required for both dev & prod)
const react = safeRequire<() => PluginOption>("@vitejs/plugin-react-swc", () => () => ({}));

// Dev‑only component tagger (optional)
const taggerPkg = safeRequire<any>("lovable-tagger", {});
const componentTagger = typeof taggerPkg.componentTagger === "function"
  ? taggerPkg.componentTagger
  : undefined;

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
