import {readdirSync, statSync} from "fs"
import { fileURLToPath } from 'url'
import {join, dirname} from "path"
import * as esbuild from "esbuild";
const __filename = fileURLToPath(import.meta.url)

async function buildDir(dir) {
    const entries = readdirSync(dir);
    for (let i = 0; i < entries.length; i++) {
        const entryDir = join(dir, entries[i]);
        if (statSync(entryDir).isDirectory()) await buildDir(entryDir);
        if (entryDir.endsWith('.ts')) {
            await esbuild.build({
                entryPoints: [entryDir],
                bundle: true,
                platform: "node",
                target: ["node12"],
                outfile: entryDir.replace('.ts', '.js'),
                sourcemap: true,
            });
        }

    }
}

await buildDir(join(dirname(__filename), 'src/exercises'));
