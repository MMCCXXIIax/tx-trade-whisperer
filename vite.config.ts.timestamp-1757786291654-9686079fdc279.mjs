// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import path from "path";
var __vite_injected_original_dirname = "/home/project";
var react = null;
try {
  const { default: reactSwc } = await import("file:///home/project/node_modules/@vitejs/plugin-react-swc/index.js");
  react = reactSwc();
  console.log("\u2705 Successfully loaded @vitejs/plugin-react-swc");
} catch (e) {
  console.warn("\u26A0\uFE0F Failed to load @vitejs/plugin-react-swc, using fallback");
  try {
    const { default: reactPlugin } = await import("@vitejs/plugin-react");
    react = reactPlugin();
    console.log("\u2705 Using fallback @vitejs/plugin-react");
  } catch (e2) {
    console.error("\u274C No React plugin available. Build may fail.");
    react = {
      name: "minimal-react-plugin",
      transform(code, id) {
        if (id.endsWith(".jsx") || id.endsWith(".tsx")) {
          return { code, map: null };
        }
      }
    };
  }
}
var componentTagger;
if (process.env.NODE_ENV === "development") {
  try {
    const { componentTagger: tagger } = await import("file:///home/project/node_modules/lovable-tagger/dist/index.js");
    if (typeof tagger === "function") {
      componentTagger = tagger();
    }
  } catch {
    console.warn("\u26A0\uFE0F Optional dependency 'lovable-tagger' not found - component tagging disabled");
  }
}
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: false
  },
  preview: {
    host: "0.0.0.0",
    port: 8080
  },
  plugins: [
    react,
    mode === "development" && componentTagger
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-tabs", "@radix-ui/react-dialog", "@radix-ui/react-select"],
          charts: ["recharts", "lightweight-charts"]
        }
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIFBsdWdpbk9wdGlvbiB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG4vLyBJbXBvcnQgUmVhY3QgcGx1Z2lucyB1c2luZyBFUyBtb2R1bGVzXG5sZXQgcmVhY3Q6IFBsdWdpbk9wdGlvbiB8IG51bGwgPSBudWxsO1xudHJ5IHtcbiAgY29uc3QgeyBkZWZhdWx0OiByZWFjdFN3YyB9ID0gYXdhaXQgaW1wb3J0KFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCIpO1xuICByZWFjdCA9IHJlYWN0U3djKCk7XG4gIGNvbnNvbGUubG9nKFwiXHUyNzA1IFN1Y2Nlc3NmdWxseSBsb2FkZWQgQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCIpO1xufSBjYXRjaCAoZSkge1xuICBjb25zb2xlLndhcm4oXCJcdTI2QTBcdUZFMEYgRmFpbGVkIHRvIGxvYWQgQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djLCB1c2luZyBmYWxsYmFja1wiKTtcbiAgdHJ5IHtcbiAgICAvLyBUcnkgdG8gbG9hZCByZWd1bGFyIFJlYWN0IHBsdWdpbiBhcyBmYWxsYmFja1xuICAgIGNvbnN0IHsgZGVmYXVsdDogcmVhY3RQbHVnaW4gfSA9IGF3YWl0IGltcG9ydChcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCIpO1xuICAgIHJlYWN0ID0gcmVhY3RQbHVnaW4oKTtcbiAgICBjb25zb2xlLmxvZyhcIlx1MjcwNSBVc2luZyBmYWxsYmFjayBAdml0ZWpzL3BsdWdpbi1yZWFjdFwiKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJcdTI3NEMgTm8gUmVhY3QgcGx1Z2luIGF2YWlsYWJsZS4gQnVpbGQgbWF5IGZhaWwuXCIpO1xuICAgIC8vIENyZWF0ZSBhIG1pbmltYWwgcGx1Z2luIHRvIGF2b2lkIGVycm9yc1xuICAgIHJlYWN0ID0ge1xuICAgICAgbmFtZTogJ21pbmltYWwtcmVhY3QtcGx1Z2luJyxcbiAgICAgIHRyYW5zZm9ybShjb2RlLCBpZCkge1xuICAgICAgICBpZiAoaWQuZW5kc1dpdGgoJy5qc3gnKSB8fCBpZC5lbmRzV2l0aCgnLnRzeCcpKSB7XG4gICAgICAgICAgcmV0dXJuIHsgY29kZSwgbWFwOiBudWxsIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG5cbi8vIERldlx1MjAxMW9ubHkgY29tcG9uZW50IHRhZ2dlciAob3B0aW9uYWwpXG5sZXQgY29tcG9uZW50VGFnZ2VyOiBQbHVnaW5PcHRpb24gfCB1bmRlZmluZWQ7XG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwiZGV2ZWxvcG1lbnRcIikge1xuICB0cnkge1xuICAgIGNvbnN0IHsgY29tcG9uZW50VGFnZ2VyOiB0YWdnZXIgfSA9IGF3YWl0IGltcG9ydChcImxvdmFibGUtdGFnZ2VyXCIpO1xuICAgIGlmICh0eXBlb2YgdGFnZ2VyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGNvbXBvbmVudFRhZ2dlciA9IHRhZ2dlcigpO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgY29uc29sZS53YXJuKFwiXHUyNkEwXHVGRTBGIE9wdGlvbmFsIGRlcGVuZGVuY3kgJ2xvdmFibGUtdGFnZ2VyJyBub3QgZm91bmQgLSBjb21wb25lbnQgdGFnZ2luZyBkaXNhYmxlZFwiKTtcbiAgfVxufVxuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCIwLjAuMC4wXCIsXG4gICAgcG9ydDogODA4MCxcbiAgICBzdHJpY3RQb3J0OiBmYWxzZSxcbiAgfSxcbiAgcHJldmlldzoge1xuICAgIGhvc3Q6IFwiMC4wLjAuMFwiLFxuICAgIHBvcnQ6IDgwODAsXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCxcbiAgICBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyLFxuICBdLmZpbHRlcihCb29sZWFuKSBhcyBQbHVnaW5PcHRpb25bXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIHZlbmRvcjogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcbiAgICAgICAgICB1aTogWydAcmFkaXgtdWkvcmVhY3QtdGFicycsICdAcmFkaXgtdWkvcmVhY3QtZGlhbG9nJywgJ0ByYWRpeC11aS9yZWFjdC1zZWxlY3QnXSxcbiAgICAgICAgICBjaGFydHM6IFsncmVjaGFydHMnLCAnbGlnaHR3ZWlnaHQtY2hhcnRzJ10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFrQztBQUNwUSxPQUFPLFVBQVU7QUFEakIsSUFBTSxtQ0FBbUM7QUFJekMsSUFBSSxRQUE2QjtBQUNqQyxJQUFJO0FBQ0YsUUFBTSxFQUFFLFNBQVMsU0FBUyxJQUFJLE1BQU0sT0FBTyxxRUFBMEI7QUFDckUsVUFBUSxTQUFTO0FBQ2pCLFVBQVEsSUFBSSxxREFBZ0Q7QUFDOUQsU0FBUyxHQUFHO0FBQ1YsVUFBUSxLQUFLLHNFQUE0RDtBQUN6RSxNQUFJO0FBRUYsVUFBTSxFQUFFLFNBQVMsWUFBWSxJQUFJLE1BQU0sT0FBTyxzQkFBc0I7QUFDcEUsWUFBUSxZQUFZO0FBQ3BCLFlBQVEsSUFBSSw0Q0FBdUM7QUFBQSxFQUNyRCxTQUFTQSxJQUFHO0FBQ1YsWUFBUSxNQUFNLG1EQUE4QztBQUU1RCxZQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sSUFBSTtBQUNsQixZQUFJLEdBQUcsU0FBUyxNQUFNLEtBQUssR0FBRyxTQUFTLE1BQU0sR0FBRztBQUM5QyxpQkFBTyxFQUFFLE1BQU0sS0FBSyxLQUFLO0FBQUEsUUFDM0I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjtBQUdBLElBQUk7QUFDSixJQUFJLFFBQVEsSUFBSSxhQUFhLGVBQWU7QUFDMUMsTUFBSTtBQUNGLFVBQU0sRUFBRSxpQkFBaUIsT0FBTyxJQUFJLE1BQU0sT0FBTyxnRUFBZ0I7QUFDakUsUUFBSSxPQUFPLFdBQVcsWUFBWTtBQUNoQyx3QkFBa0IsT0FBTztBQUFBLElBQzNCO0FBQUEsRUFDRixRQUFRO0FBQ04sWUFBUSxLQUFLLDBGQUFnRjtBQUFBLEVBQy9GO0FBQ0Y7QUFHQSxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxFQUNkO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1A7QUFBQSxJQUNBLFNBQVMsaUJBQWlCO0FBQUEsRUFDNUIsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsVUFDN0IsSUFBSSxDQUFDLHdCQUF3QiwwQkFBMEIsd0JBQXdCO0FBQUEsVUFDL0UsUUFBUSxDQUFDLFlBQVksb0JBQW9CO0FBQUEsUUFDM0M7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogWyJlIl0KfQo=
