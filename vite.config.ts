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
const react = safeRequire<PluginOption>(
  "@vitejs/plugin-react-swc",
  { name: "noop-react-plugin" } // valid plugin object fallback
);

// Dev‑only component tagger (optional)
let componentTagger: PluginOption | undefined;
if (process.env.NODE_ENV === "development") {
  const taggerPkg = safeRequire<any>("lovable-tagger", {});
  if (typeof taggerPkg.componentTagger === "function") {
    componentTagger = taggerPkg.componentTagger();
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: false,
  },
  preview: {
    host: "0.0.0.0",
    port: 5000,
  },
  plugins: [
    react,
    mode === "development" && componentTagger,
  ].filter(Boolean) as PluginOption[],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-tabs', '@radix-ui/react-dialog', '@radix-ui/react-select'],
          charts: ['recharts', 'lightweight-charts'],
        },
      },
    },
  },
}));
