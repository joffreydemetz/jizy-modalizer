/**
 * Build the OPTIONAL plugin stylesheets that are deliberately excluded from the
 * core dist (modalizer.less no longer imports them). Each self-contained
 * lib/less/plugins/<name>.less compiles to a standalone, minified
 * dist/css/plugins/<name>.css, shipped for consumers that opt into the plugin
 * (selected per-site via `modalizerPlugins:` and bundled by jizy-builder
 * alongside the raw lib/js/plugins/<name>.js).
 *
 * Runs after `jpack:dist` (the core build) — see package.json. jizy-packer's CSS
 * pipeline is tied to the JS entry graph, so the opt-in plugin CSS is built here.
 */
import less from 'less';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'lib', 'less', 'plugins');
const outDir = join(root, 'dist', 'css', 'plugins');

mkdirSync(outDir, { recursive: true });

const files = readdirSync(srcDir).filter((f) => f.endsWith('.less'));
for (const file of files) {
    const name = file.replace(/\.less$/, '');
    const input = readFileSync(join(srcDir, file), 'utf8');
    const result = await less.render(input, { filename: join(srcDir, file), compress: true });
    writeFileSync(join(outDir, `${name}.css`), result.css, 'utf8');
    console.log(`  plugin css → dist/css/plugins/${name}.css`);
}
