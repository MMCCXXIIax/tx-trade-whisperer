import { defineConfig, PluginOption } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";

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
