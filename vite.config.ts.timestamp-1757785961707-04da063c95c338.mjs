var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import path from "path";
var __vite_injected_original_dirname = "/home/project";
var react = null;
try {
  react = __require("file:///home/project/node_modules/@vitejs/plugin-react-swc/index.js").default;
  console.log("\u2705 Successfully loaded @vitejs/plugin-react-swc");
} catch (e) {
  console.warn("\u26A0\uFE0F Failed to load @vitejs/plugin-react-swc, using fallback");
  try {
    react = __require("@vitejs/plugin-react").default;
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
    const taggerPkg = __require("file:///home/project/node_modules/lovable-tagger/dist/index.js");
    if (typeof taggerPkg.componentTagger === "function") {
      componentTagger = taggerPkg.componentTagger();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIFBsdWdpbk9wdGlvbiB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG4vLyBTYWZlbHkgaW1wb3J0IFJlYWN0IHBsdWdpblxubGV0IHJlYWN0OiBQbHVnaW5PcHRpb24gfCBudWxsID0gbnVsbDtcbnRyeSB7XG4gIHJlYWN0ID0gcmVxdWlyZShcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiKS5kZWZhdWx0O1xuICBjb25zb2xlLmxvZyhcIlx1MjcwNSBTdWNjZXNzZnVsbHkgbG9hZGVkIEB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiKTtcbn0gY2F0Y2ggKGUpIHtcbiAgY29uc29sZS53YXJuKFwiXHUyNkEwXHVGRTBGIEZhaWxlZCB0byBsb2FkIEB2aXRlanMvcGx1Z2luLXJlYWN0LXN3YywgdXNpbmcgZmFsbGJhY2tcIik7XG4gIHRyeSB7XG4gICAgLy8gVHJ5IHRvIGxvYWQgcmVndWxhciBSZWFjdCBwbHVnaW4gYXMgZmFsbGJhY2tcbiAgICByZWFjdCA9IHJlcXVpcmUoXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiKS5kZWZhdWx0O1xuICAgIGNvbnNvbGUubG9nKFwiXHUyNzA1IFVzaW5nIGZhbGxiYWNrIEB2aXRlanMvcGx1Z2luLXJlYWN0XCIpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihcIlx1Mjc0QyBObyBSZWFjdCBwbHVnaW4gYXZhaWxhYmxlLiBCdWlsZCBtYXkgZmFpbC5cIik7XG4gICAgLy8gQ3JlYXRlIGEgbWluaW1hbCBwbHVnaW4gdG8gYXZvaWQgZXJyb3JzXG4gICAgcmVhY3QgPSB7XG4gICAgICBuYW1lOiAnbWluaW1hbC1yZWFjdC1wbHVnaW4nLFxuICAgICAgdHJhbnNmb3JtKGNvZGUsIGlkKSB7XG4gICAgICAgIGlmIChpZC5lbmRzV2l0aCgnLmpzeCcpIHx8IGlkLmVuZHNXaXRoKCcudHN4JykpIHtcbiAgICAgICAgICByZXR1cm4geyBjb2RlLCBtYXA6IG51bGwgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbn1cblxuLy8gRGV2XHUyMDExb25seSBjb21wb25lbnQgdGFnZ2VyIChvcHRpb25hbClcbmxldCBjb21wb25lbnRUYWdnZXI6IFBsdWdpbk9wdGlvbiB8IHVuZGVmaW5lZDtcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJkZXZlbG9wbWVudFwiKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgdGFnZ2VyUGtnID0gcmVxdWlyZShcImxvdmFibGUtdGFnZ2VyXCIpO1xuICAgIGlmICh0eXBlb2YgdGFnZ2VyUGtnLmNvbXBvbmVudFRhZ2dlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBjb21wb25lbnRUYWdnZXIgPSB0YWdnZXJQa2cuY29tcG9uZW50VGFnZ2VyKCk7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICBjb25zb2xlLndhcm4oXCJcdTI2QTBcdUZFMEYgT3B0aW9uYWwgZGVwZW5kZW5jeSAnbG92YWJsZS10YWdnZXInIG5vdCBmb3VuZCAtIGNvbXBvbmVudCB0YWdnaW5nIGRpc2FibGVkXCIpO1xuICB9XG59XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjAuMC4wLjBcIixcbiAgICBwb3J0OiA4MDgwLFxuICAgIHN0cmljdFBvcnQ6IGZhbHNlLFxuICB9LFxuICBwcmV2aWV3OiB7XG4gICAgaG9zdDogXCIwLjAuMC4wXCIsXG4gICAgcG9ydDogODA4MCxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0LFxuICAgIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIsXG4gIF0uZmlsdGVyKEJvb2xlYW4pIGFzIFBsdWdpbk9wdGlvbltdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgdmVuZG9yOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgICAgIHVpOiBbJ0ByYWRpeC11aS9yZWFjdC10YWJzJywgJ0ByYWRpeC11aS9yZWFjdC1kaWFsb2cnLCAnQHJhZGl4LXVpL3JlYWN0LXNlbGVjdCddLFxuICAgICAgICAgIGNoYXJ0czogWydyZWNoYXJ0cycsICdsaWdodHdlaWdodC1jaGFydHMnXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7O0FBQXlOLFNBQVMsb0JBQWtDO0FBQ3BRLE9BQU8sVUFBVTtBQURqQixJQUFNLG1DQUFtQztBQUl6QyxJQUFJLFFBQTZCO0FBQ2pDLElBQUk7QUFDRixVQUFRLFVBQVEscUVBQTBCLEVBQUU7QUFDNUMsVUFBUSxJQUFJLHFEQUFnRDtBQUM5RCxTQUFTLEdBQUc7QUFDVixVQUFRLEtBQUssc0VBQTREO0FBQ3pFLE1BQUk7QUFFRixZQUFRLFVBQVEsc0JBQXNCLEVBQUU7QUFDeEMsWUFBUSxJQUFJLDRDQUF1QztBQUFBLEVBQ3JELFNBQVNBLElBQUc7QUFDVixZQUFRLE1BQU0sbURBQThDO0FBRTVELFlBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLFVBQVUsTUFBTSxJQUFJO0FBQ2xCLFlBQUksR0FBRyxTQUFTLE1BQU0sS0FBSyxHQUFHLFNBQVMsTUFBTSxHQUFHO0FBQzlDLGlCQUFPLEVBQUUsTUFBTSxLQUFLLEtBQUs7QUFBQSxRQUMzQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGO0FBR0EsSUFBSTtBQUNKLElBQUksUUFBUSxJQUFJLGFBQWEsZUFBZTtBQUMxQyxNQUFJO0FBQ0YsVUFBTSxZQUFZLFVBQVEsZ0VBQWdCO0FBQzFDLFFBQUksT0FBTyxVQUFVLG9CQUFvQixZQUFZO0FBQ25ELHdCQUFrQixVQUFVLGdCQUFnQjtBQUFBLElBQzlDO0FBQUEsRUFDRixRQUFRO0FBQ04sWUFBUSxLQUFLLDBGQUFnRjtBQUFBLEVBQy9GO0FBQ0Y7QUFHQSxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxFQUNkO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1A7QUFBQSxJQUNBLFNBQVMsaUJBQWlCO0FBQUEsRUFDNUIsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsVUFDN0IsSUFBSSxDQUFDLHdCQUF3QiwwQkFBMEIsd0JBQXdCO0FBQUEsVUFDL0UsUUFBUSxDQUFDLFlBQVksb0JBQW9CO0FBQUEsUUFDM0M7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogWyJlIl0KfQo=
