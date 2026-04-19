import Layer from './Layer.js';
import Modal from './Modal.js';

/**
 * Manage modalizer layers (LIFO stack) inside a shared Modal host.
 */
export default class Layers {
    constructor() {
        this.layers = [];
        this.modal = new Modal();
        this.onUserClose = null;
    }

    hasLayers() {
        return this.layers.length > 0;
    }

    getCurrent() {
        return this.layers.length ? this.layers[this.layers.length - 1] : null;
    }

    get(name) {
        for (let i = this.layers.length - 1; i >= 0; i--) {
            if (this.layers[i].name === name) {
                return this.layers[i];
            }
        }
        return false;
    }

    add(name, config, replace) {
        if (replace && this.layers.length) {
            this.layers.pop().destroy();
        }

        const prev = this.getCurrent();

        const layer = new Layer(name, config);
        this.layers.push(layer);

        if (typeof document !== 'undefined') {
            if (prev) prev.hide();
            this.modal.show(layer, () => {
                if (typeof this.onUserClose === 'function') {
                    this.onUserClose();
                } else {
                    this.hideAll();
                }
            });
        }

        return layer;
    }

    replace(name, config) {
        return this.add(name, config, true);
    }

    hide() {
        if (this.layers.length <= 1) {
            this.hideAll();
            return;
        }
        this.layers.pop().destroy();
        const top = this.getCurrent();
        if (top && typeof document !== 'undefined') {
            top.show(true);
        }
    }

    hideAll() {
        while (this.layers.length) {
            this.layers.pop().destroy();
        }
        this.modal.reset();
    }

    hidePrevious() {
        if (!this.hasLayers()) return false;
        for (let i = 0, n = this.layers.length - 1; i < n; i++) {
            this.layers[i].hide();
        }
        return true;
    }
};
