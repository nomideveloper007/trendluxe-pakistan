// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv, type Plugin } from "vite";

const SUPABASE_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
] as const;

// Must run at module load — before Lovable's defineConfig loadEnv — or empty
// IDE-injected KEY placeholders blank out real .env values permanently in define.
for (const key of SUPABASE_KEYS) {
  if (process.env[key] === "") delete process.env[key];
}

/**
 * Local (non-Lovable) Supabase env fix:
 * Vite's loadEnv will not override process.env keys that already exist — even if they are "".
 * Some IDEs inject empty SUPABASE_*_KEY placeholders, which then blank out real .env values.
 */
function supabaseLocalEnvPlugin(): Plugin {
  return {
    name: "supabase-local-env",
    config(_, { mode }) {
      for (const key of SUPABASE_KEYS) {
        if (process.env[key] === "") delete process.env[key];
      }

      const env = loadEnv(mode, process.cwd(), "");
      const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
      const publishable = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
      const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY || "";

      if (url) {
        process.env.SUPABASE_URL = url;
        process.env.VITE_SUPABASE_URL = url;
      }
      if (publishable) {
        process.env.SUPABASE_PUBLISHABLE_KEY = publishable;
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY = publishable;
      }
      if (serviceRole) {
        process.env.SUPABASE_SERVICE_ROLE_KEY = serviceRole;
      }

      return {
        define: {
          "process.env.SUPABASE_URL": JSON.stringify(url),
          "process.env.SUPABASE_PUBLISHABLE_KEY": JSON.stringify(publishable),
          "process.env.SUPABASE_SERVICE_ROLE_KEY": JSON.stringify(serviceRole),
          "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(url),
          "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(publishable),
        },
      };
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [supabaseLocalEnvPlugin()],
  },
});
