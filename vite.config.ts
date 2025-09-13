import { defineConfig, PluginOption } from "vite";
import path from "path";

// Import React plugins using ES modules
let react: PluginOption | null = null;
try {
  const { default: reactSwc } = await import("@vitejs/plugin-react-swc");
  react = reactSwc();
  console.log("✅ Successfully loaded @vitejs/plugin-react-swc");
} catch (e) {
  console.warn("⚠️ Failed to load @vitejs/plugin-react-swc, using fallback");
  try {
    // Try to load regular React plugin as fallback
    const { default: reactPlugin } = await import("@vitejs/plugin-react");
    react = reactPlugin();
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
    const { componentTagger: tagger } = await import("lovable-tagger");
    if (typeof tagger === "function") {
      componentTagger = tagger();
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