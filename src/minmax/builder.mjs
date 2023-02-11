import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["index.ts"],
  bundle: true,
  platform: "node",
  target: ["node16"],
  outfile: "index.js",
  sourcemap: true,
});
