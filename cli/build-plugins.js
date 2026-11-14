/**
 * Build the OPTIONAL plugins that are deliberately excluded from the core dist.
 *
 * JS: each ES module lib/js/plugins/<name>.js (which imports its Layer subclass
 * from lib/js/Layers/) is bundled by rollup into a flat, self-installing
 * dist/js/plugins/<name>.js. The core `Layer` class stays EXTERNAL and is read
 * off the global `Modalizer.Layer`, so the script just needs to be loaded after
 * the core dist (which sets the `Modalizer` instance) — no second copy of Layer,
 * `instanceof Layer` holds. Left unminified: jizy-builder minifies the
 * `modalizerPlugins:` sections itself when it concatenates a site bundle.
 *
 * CSS: each self-contained lib/less/plugins/<name>.less compiles to a standalone,
 * minified dist/css/plugins/<name>.css (modalizer.less no longer imports them).
 *
 * Runs after `jpack:dist` (the core build) — see package.json. jizy-packer's
 * pipeline is tied to the core entry graph, so the opt-in plugins are built here.
 */
import less from 'less';
import { rollup } from 'rollup';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---- JS ----
const jsSrcDir = join(root, 'lib', 'js', 'plugins');
const jsOutDir = join(root, 'dist', 'js', 'plugins');
const isLayerModule = (id) => /(^|[\\/])Layer\.js$/.test(id);

mkdirSync(jsOutDir, { recursive: true });

for (const file of readdirSync(jsSrcDir).filter((f) => f.endsWith('.js'))) {
    const name = file.replace(/\.js$/, '');
    const bundle = await rollup({
        input: join(jsSrcDir, file),
        external: isLayerModule,
        onwarn(warning, warn) {
            if (warning.code === 'MISSING_GLOBAL_NAME') return;
            warn(warning);
        }
    });
    await bundle.write({
        file: join(jsOutDir, `${name}.js`),
        format: 'iife',
        name: 'ModalizerPlugins',
        extend: true,
        globals: (id) => (isLayerModule(id) ? 'Modalizer.Layer' : undefined),
        banner: '/*! Modalizer Plugin: ' + name + ' */'
    });
    await bundle.close();
    console.log(`  plugin js  → dist/js/plugins/${name}.js`);
}

// ---- CSS ----
const cssSrcDir = join(root, 'lib', 'less', 'plugins');
const cssOutDir = join(root, 'dist', 'css', 'plugins');

mkdirSync(cssOutDir, { recursive: true });

for (const file of readdirSync(cssSrcDir).filter((f) => f.endsWith('.less'))) {
    const name = file.replace(/\.less$/, '');
    const input = readFileSync(join(cssSrcDir, file), 'utf8');
    const result = await less.render('/*! Modalizer Plugin: ' + name + ' */\n' + input, { filename: join(cssSrcDir, file), compress: true });
    writeFileSync(join(cssOutDir, `${name}.css`), result.css, 'utf8');
    console.log(`  plugin css → dist/css/plugins/${name}.css`);
}
