import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";

// Determine app version at build time.
// Prefer APP_VERSION env (set by CI), fall back to package.json version.
// eslint-disable-next-line no-undef
let appVersion = process.env.APP_VERSION;
try {
  if (!appVersion) {
    const pkg = JSON.parse(
      readFileSync(new URL("./package.json", import.meta.url)),
    );
    appVersion = pkg.version;
  }
} catch {
  appVersion = "0.0.0";
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "offline-app-shell",
      apply: "build",
      generateBundle(_options, bundle) {
        const assets = [
          "/index.html",
          ...Object.keys(bundle)
            .filter((name) => name.endsWith(".js") || name.endsWith(".css"))
            .map((name) => `/${name}`),
        ];
        const source = readFileSync(
          new URL("./src/service-worker.js", import.meta.url),
          "utf8",
        ).replace("__PRECACHE_MANIFEST__;", `${JSON.stringify(assets)};`);
        this.emitFile({ type: "asset", fileName: "sw.js", source });
      },
    },
  ],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
});
