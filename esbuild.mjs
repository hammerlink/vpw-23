import {readdirSync, statSync, readFileSync} from "fs"
import {fileURLToPath} from 'url'
import {dirname, join, resolve} from "path"
import {build} from "esbuild";
import aliasPath from "esbuild-plugin-alias-path";

const __filename = fileURLToPath(import.meta.url);
const targetDir = join(dirname(__filename), 'dist/exercises');
const srcDir = join(dirname(__filename), 'src/exercises');
const tsConfig = JSON.parse(readFileSync(join(dirname(__filename),'./tsconfig.json')).toString()
    .replace(/\/\*[^\n]+\*\//g, '').replace(/\/\/[^\n]+/g, ''));
const alias = tsConfig.compilerOptions.paths;
Object.keys(alias).forEach((key) => {
    alias[key] = resolve(dirname(__filename), alias[key][0].replace(/\*$/, ''));
});
console.log(alias);

async function buildDir(dir) {
    const entries = readdirSync(dir);
    for (let i = 0; i < entries.length; i++) {
        const entryDir = join(dir, entries[i]);
        if (statSync(entryDir).isDirectory()) await buildDir(entryDir);
        if (entryDir.endsWith('.ts') && !entryDir.endsWith('.spec.ts')) {
            await build({
                entryPoints: [entryDir],
                bundle: true,
                treeShaking: true,
                minify: false,
                platform: "node",
                target: ["node12"],
                plugins: [
                    aliasPath({ alias, }),
                ],
                outfile: entryDir
                    .replace('.ts', '.js')
                    .replace(srcDir, targetDir),
                sourcemap: false,
            });
        }

    }
}

await buildDir(srcDir);
