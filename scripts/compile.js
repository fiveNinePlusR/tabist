import * as esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";
import { sveltePreprocess } from "svelte-preprocess";

async function build() {

  let context = await esbuild.context({
    entryPoints: {
      tabs: "src/js/tabs.js",
      options: "src/js/options.js",
    },
    bundle: true,
    platform: "browser",
    conditions: ["browser", "svelte"],
    outdir: "dist",
    format: "iife",
    plugins: [
      sveltePlugin({
        preprocess: sveltePreprocess(),
      }),
    ],
  });

  await context.rebuild()
}

build().then(() => {
  process.exit(0)
});
