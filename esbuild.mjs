import {readdirSync, statSync} from "fs"
import { fileURLToPath } from 'url'
import {join, dirname} from "path"
import * as esbuild from "esbuild";
const __filename = fileURLToPath(import.meta.url);
const targetDir = join(dirname(__filename), 'dist/exercises');
const srcDir = join(dirname(__filename), 'src/exercises');

async function buildDir(dir) {
    const entries = readdirSync(dir);
    for (let i = 0; i < entries.length; i++) {
        const entryDir = join(dir, entries[i]);
        if (statSync(entryDir).isDirectory()) await buildDir(entryDir);
        if (entryDir.endsWith('.ts') && !entryDir.endsWith('.spec.ts')) {
            await esbuild.build({
                entryPoints: [entryDir],
                bundle: true,
                platform: "node",
                target: ["node12"],
                outfile: entryDir
                    .replace('.ts', '.js')
                    .replace(srcDir, targetDir),
                sourcemap: false,
            });
        }

    }
}

await buildDir(srcDir);
