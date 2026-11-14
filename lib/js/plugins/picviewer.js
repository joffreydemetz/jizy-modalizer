/**
 * Picture viewer — an OPTIONAL Modalizer plugin: a full-viewport image lightbox
 * with a prev/next slider. Not part of the core dist.
 *
 * Adds `Modalizer.picviewer(items, index, params)` to a Modalizer instance; the
 * lightbox itself is the `PicviewerLayer` class (../Layers/Picviewer.js), which
 * documents the item shapes, live sources and the `onChange` hook. Two deliveries:
 *
 * - ES module: `import { installPicviewer } from 'jizy-modalizer'` then
 *   `installPicviewer(modalizer)`.
 * - Raw script: `dist/js/plugins/picviewer.js` (built by `npm run jpack:dist`),
 *   loaded AFTER the core dist, which exposes the global `Modalizer` instance —
 *   it installs itself on it. Selected per-site via `modalizerPlugins: [picviewer]`;
 *   jizy-builder concatenates it + ships dist/css/plugins/picviewer.css. The
 *   jizy-dom `picviewer` plugin is an optional proxy that gathers
 *   [data-zoom] / [data-gallery] images and hands them here.
 *
 *   Modalizer.picviewer({ src: '/big.jpg', alt: 'A photo' });
 *   Modalizer.picviewer([{ src, alt, caption }, …], 2);                 // gallery, start at #2
 *   Modalizer.picviewer(document.querySelectorAll('[data-gallery] img')); // from the DOM
 *   Modalizer.picviewer(() => wall.querySelectorAll('img[data-zoom]'), 4, { onChange });
 *
 * Returns the layer, or null when there is no picture to show.
 */
import PicviewerLayer from '../Layers/Picviewer.js';

export function installPicviewer(modalizer) {
    modalizer.picviewer = function (items, index, params) {
        const layer = new PicviewerLayer(items, index, params);
        if (!layer.getTotal()) {
            return null;
        }
        return this.addLayer(layer);
    };
    return modalizer;
}

if (typeof Modalizer !== 'undefined' && Modalizer && typeof Modalizer.addLayer === 'function') {
    installPicviewer(Modalizer);
}
