import { defineConfig, PluginOption } from "vite";
import path from "path";

// Safely import React plugin
let react: PluginOption | null = null;
try {
  react = require("@vitejs/plugin-react-swc").default;
  console.log("✅ Successfully loaded @vitejs/plugin-react-swc");
} catch (e) {
  console.warn("⚠️ Failed to load @vitejs/plugin-react-swc, using fallback");
  try {
    // Try to load regular React plugin as fallback
    react = require("@vitejs/plugin-react").default;
    console.log("✅ Using fallback @vitejs/plugin-react");
  } catch (e) {
    console.error("❌ No React plugin available. Build may fail.");
    // Create a minimal plugin to avoid errors
    react = {
      name: 'minimal-react-plugin',
      transform(code, id) {
        if (id.endsWith('.jsx') || id.endsWith('.tsx')) {
          return { code, map: null };
        }
      }
    };
  }
}

// Dev‑only component tagger (optional)
let componentTagger: PluginOption | undefined;
if (process.env.NODE_ENV === "development") {
  try {
    const taggerPkg = require("lovable-tagger");
    if (typeof taggerPkg.componentTagger === "function") {
      componentTagger = taggerPkg.componentTagger();
    }
  } catch {
    console.warn("⚠️ Optional dependency 'lovable-tagger' not found - component tagging disabled");
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: false,
  },
  preview: {
    host: "0.0.0.0",
    port: 8080,
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
