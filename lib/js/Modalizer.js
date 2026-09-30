import Components from './Components.js';
import Layers from './Layers.js';

/**
 * Public Modalizer facade.
 *
 *   Modalizer.addComponent('content')
 *   Modalizer.addComponent('json', 'json').setBasePath(...).setLayerConfig({...})
 *   Modalizer.addLayer('foo', { content, size, ... }, replace)
 *   Modalizer.ready()
 *   Modalizer.hide()      // close the top layer (back to the one below)
 *   Modalizer.hideAll()   // close every layer
 *
 * Escape closes the top layer, like its close button. Per-layer config
 * (addLayer config, Component.setLayerConfig, plugin params):
 *   closeOnEscape: false     → Escape does nothing while this layer is on top
 *   closeAllOnEscape: true   → Escape on this layer closes the whole stack
 */
class Modalizer {
    constructor() {
        this.components = new Components();
        this.layers = new Layers();
        this.layers.onUserClose = () => this._closeFromUser();
        this._ready = false;
        this._suppressPush = false;
        // 'top' | 'all' while a history move started by hide()/hideAll() is in flight.
        this._popAction = null;

        if (typeof document !== 'undefined') {
            document.addEventListener('keydown', (e) => this._onKeydown(e));
        }
    }

    addComponent(name, type = null) {
        return this.components.add(name, type);
    }

    getComponent(name) {
        return this.components.get(name);
    }

    /**
     * Low-level layer open — no history side-effects.
     * Used for custom layers (e.g. picture viewer) that aren't tied to a component URL.
     */
    addLayer(name, config = {}, replace = false) {
        return this.layers.add(name, config, replace);
    }

    /**
     * Component-driven layer open: pushes `#!name=value` onto history, then mounts.
     * Called from ContentComponent/JsonComponent/HtmlComponent showLayer().
     */
    openComponentLayer(name, value, config = {}, replace = false) {
        const pushed = !this._suppressPush;
        if (pushed) {
            this._pushState(name, value);
        }
        const layer = this.layers.add(name + '.' + value, config, replace);
        layer.historyPushed = pushed;
        return layer;
    }

    /**
     * Close the top layer and come back to the one below (or close the
     * modalizer when it was the last). A layer that pushed a `#!` history entry
     * is closed by stepping back, so the URL and the back button stay in step.
     */
    hide() {
        const top = this.layers.getCurrent();
        if (!top) return this;

        if (top.historyPushed && this._onModalizerState()) {
            this._popAction = 'top';
            history.back();
        } else {
            this.layers.hide();
            this._clearHash();
        }
        return this;
    }

    /** Close every layer, unwinding the history entries they pushed. */
    hideAll() {
        const pushed = this.layers.layers.filter((l) => l.historyPushed).length;

        if (pushed > 0 && this._onModalizerState()) {
            this._popAction = 'all';
            history.go(-pushed);
        } else {
            this.layers.hideAll();
            this._clearHash();
        }
        return this;
    }

    _onKeydown(e) {
        if (e.key !== 'Escape' && e.key !== 'Esc') return;
        // Consumed by something inside the layer (an open dropdown, an editor…),
        // mid-IME composition, or a close already on its way.
        if (e.defaultPrevented || e.isComposing || this._popAction) return;

        const top = this.layers.getCurrent();
        if (!top || !top.closeOnEscape) return;

        e.preventDefault();
        if (top.closeAllOnEscape) {
            this.hideAll();
        } else {
            this.hide();
        }
    }

    _onModalizerState() {
        return typeof history !== 'undefined' && !!(history.state && history.state.modalizer);
    }

    /** Nothing left open but the URL still names a layer (a deep link): drop the hash. */
    _clearHash() {
        if (this.layers.hasLayers() || !this._onModalizerState()) return;
        history.replaceState(null, '', location.pathname + location.search);
    }

    ready() {
        if (this._ready) return this;
        this._ready = true;

        if (typeof window !== 'undefined') {
            window.addEventListener('popstate', (e) => this._onPopState(e));
        }
        if (typeof document !== 'undefined') {
            this._bindDelegation();
            this._loadFromUrl();
        }

        return this;
    }

    _bindDelegation() {
        document.addEventListener('click', (e) => {
            if (e.defaultPrevented) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            if (e.button !== undefined && e.button !== 0) return;

            const link = e.target && e.target.closest && e.target.closest('[data-mdzr-path]');
            if (!link) return;
            e.preventDefault();
            this._triggerPath(link.getAttribute('data-mdzr-path'), this._readLayerOverride(link));
        });
    }

    /**
     * Per-link layer overrides read off the clicked `[data-mdzr-path]` element:
     *   data-mdzr-size="sm|lg|…"  → layer size
     *   data-mdzr-noheader         → suppress the header (even if the payload has a title)
     */
    _readLayerOverride(link) {
        const override = {};
        if (link.dataset.mdzrSize) {
            override.size = link.dataset.mdzrSize;
        }
        if (link.hasAttribute('data-mdzr-noheader')) {
            override.header = '';
        }
        return override;
    }

    _loadFromUrl() {
        const hash = (typeof location !== 'undefined' && location.hash) || '';
        const m = hash.match(/^#!(.+)$/);
        if (!m) return;

        const params = {};
        m[1].split('&').forEach((pair) => {
            const [k, v = ''] = pair.split('=');
            if (k) params[decodeURIComponent(k)] = decodeURIComponent(v);
        });

        for (const [key, value] of Object.entries(params)) {
            const componentName = this._findComponentByHashVar(key);
            if (!componentName) continue;
            const component = this.components.get(componentName);
            this._suppressPush = true;
            try {
                const result = component.trigger({ ...params, value, type: componentName, [componentName]: value });
                if (result && typeof result.then === 'function') {
                    result.finally(() => { this._suppressPush = false; });
                } else {
                    this._suppressPush = false;
                }
            } catch (e) {
                this._suppressPush = false;
                throw e;
            }
            if (typeof history !== 'undefined') {
                history.replaceState({ modalizer: true, key: componentName, value }, '', location.pathname + location.search + '#!' + componentName + '=' + value);
            }
            return;
        }
    }

    _triggerPath(path, override = {}) {
        // console.debug('[Modalizer] triggerPath', path);
        const component = this.components.getByPath(path);
        if (!component) {
            console.warn('[Modalizer] no component matches path', path);
            return;
        }
        const hash = component.parseHashVars(path);
        if (!hash) {
            console.warn('[Modalizer] parseHashVars failed for', path);
            return;
        }
        component.trigger(hash, override);
    }

    _findComponentByHashVar(key) {
        const map = this.components.components;
        for (const name in map) {
            if (map[name].checkHashVar(key)) return name;
        }
        return null;
    }

    _pushState(key, value) {
        if (typeof history === 'undefined') return;
        const url = location.pathname + location.search + '#!' + key + '=' + value;
        history.pushState({ modalizer: true, key, value }, '', url);
    }

    _onPopState(e) {
        // A move started by hide()/hideAll() knows what it closes; a plain
        // back/forward is read off the state it lands on.
        const action = this._popAction;
        this._popAction = null;

        if (!this.layers.hasLayers()) return;

        const st = e && e.state;
        this._suppressPush = true;
        try {
            if ('all' === action || (!action && (!st || !st.modalizer))) {
                this.layers.hideAll();
            } else {
                this.layers.hide();
            }
        } finally {
            this._suppressPush = false;
        }

        if (action) {
            this._clearHash();
        }
    }

    _closeFromUser() {
        if (typeof history !== 'undefined' && history.state && history.state.modalizer) {
            history.back();
        } else {
            this.layers.hideAll();
        }
    }
}

export default Modalizer;
