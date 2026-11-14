/**
 * Confirmation modal — an OPTIONAL Modalizer plugin. Not part of the core dist.
 *
 * Adds `Modalizer.confirm(element, params)` to a Modalizer instance; the dialog
 * itself is the `ConfirmLayer` class (../Layers/Confirm.js). Two deliveries:
 *
 * - ES module: `import { installConfirm } from 'jizy-modalizer'` then
 *   `installConfirm(modalizer)`.
 * - Raw script: `dist/js/plugins/confirm.js` (built by `npm run jpack:dist`),
 *   loaded AFTER the core dist, which exposes the global `Modalizer` instance —
 *   it installs itself on it. Selected per-site via `modalizerPlugins: [confirm]`;
 *   jizy-builder concatenates it + ships dist/css/plugins/confirm.css.
 *
 * Works programmatically or driven by an element's `data-confirm` /
 * `data-confirm-question` / `data-confirm-header` attributes:
 *
 *   Modalizer.confirm(null, { content: 'Sure?', callback: () => doIt() });
 *   Modalizer.confirm(linkEl, { okText: 'Oui', koText: 'Non' }); // navigates to linkEl.href on OK
 *
 * Escape is the Cancel button (the callback is not called); `closeOnEscape` /
 * `closeAllOnEscape` params as for any layer.
 */
import ConfirmLayer from '../Layers/Confirm.js';

export function installConfirm(modalizer) {
    modalizer.confirm = function (element, params) {
        return this.addLayer(new ConfirmLayer(element, params));
    };
    return modalizer;
}

if (typeof Modalizer !== 'undefined' && Modalizer && typeof Modalizer.addLayer === 'function') {
    installConfirm(Modalizer);
}
