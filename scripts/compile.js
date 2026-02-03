import * as esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";
import { sveltePreprocess } from "svelte-preprocess";
import { copyFileSync, rmSync, mkdirSync, readdirSync, statSync } from "node:fs";
import * as path from "node:path";

import e from "child_process";

let exec = e.exec;

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

function copyStatic(basepath) {
  if (!basepath || basepath.length == 0) throw new Error("basepath is required");

  rmSync(basepath, { recursive: true, force: true });
  mkdirSync(basepath, { recursive: true });

  copyRecursive("tabist", basepath);
  copyFileSync("src/js/lib/utils.js", `${basepath}/lib/js/utils.js`);
  copyFileSync("src/js/background.js", `${basepath}/lib/js/background.js`);
  copyFileSync("dist/tabs.js", `${basepath}/tabs.js`);
  copyFileSync("dist/options.js", `${basepath}/options.js`);
  copyFileSync("dist/tabs.css", `${basepath}/tabs.css`);
}

function compileErb(templatePath, outputPath, isFirefox = true) {

  command = `ruby -e "require 'erb'; is_firefox = ${isFirefox};
             template = File.read('${templatePath}');
             renderer = ERB.new(template);
             File.write('${outputPath}', renderer.result(binding))"`;

function copyStatic() {
  exec(command, function (err, stdout, stderr) {
    if (err) {
      console.error("Error compiling ERB:", err);
      return;
    }
    console.log("Compiled ERB:", outputPath);
  });
}

async function build() {
  // Clean dynamic directory
  rmSync("dist", { recursive: true, force: true });
  mkdirSync("dist", { recursive: true });

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

  copyStatic("dist-firefox");
  copyStatic("dist-chrome");

  compileErb("manifest/manifest-firefox.json.erb", "dist-firefox/manifest.json", true);
  compileErb("./src/manifest/manifest-chrome.json.erb", "./dist-chrome/manifest.json", false);
}

build().then(() => {
  console.log("Build complete.")
  process.exit(0)
});
