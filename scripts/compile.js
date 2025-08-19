import * as esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
import { copyFileSync, rmSync, mkdirSync, readdirSync, statSync } from "node:fs";
import * as path from "node:path";

const watch = process.argv.includes("--watch");

function copyRecursive(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const file of readdirSync(src)) {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    if (statSync(srcFile).isDirectory()) {
      copyRecursive(srcFile, destFile);
    } else {
      copyFileSync(srcFile, destFile);
    }
  }
}

function copyStatic() {
  rmSync("dist", { recursive: true, force: true });
  mkdirSync("dist", { recursive: true });

  copyFileSync("manifest.json", "dist/manifest.json");
  copyRecursive("public", "dist");
}

async function build() {
  copyStatic();

  let context = await esbuild.context({
    entryPoints: {
      "popup/main": "src/popup/main.js",
      background: "src/background.js",
    },
    bundle: true,
    platform: "browser",
    outdir: "dist",
    format: "iife",
    plugins: [
      sveltePlugin({
        preprocess: sveltePreprocess(),
      }),
    ],
  });

  if(watch) {
    build = await context.watch()
    // build = await esbuild.watch(context);
    console.log("Watching for changes...");
  }
  else {
    build = await context.rebuild()
    console.log("Building...");
  }
  // return context.build();
    // watch: watch && {
    //   onRebuild(error) {
    //     if (error) console.error("Build failed:", error);
    //     else {
    //       copyStatic();
    //       console.log("Rebuilt successfully");
    //     }
    //   },
    // },
}

build().then(() => console.log("Build complete."));
