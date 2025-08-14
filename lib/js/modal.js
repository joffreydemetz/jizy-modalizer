import Layer from './layer.js';
import Hasher from './hasher.js';
import State from './state.js';

export default class Modal {
    constructor() {
        this.closeButtonText = 'Close';
        this.ignoreBackdropClick = false;
        this.layers = [];
        this.shown = false;

        this.$backdrop = null;
        this.$element = null;

        this.hasher = new Hasher();
    }

    ready() {
        // load hash from current URL (direct access or refresh)
        this.loadHashFromCurrentUrl();

        // parse DOM for data-hasher-url links
        this.parseDomForHashes();
    }

    setCloseButtonText(value) {
        this.closeButtonText = value;
        return this;
    }

    setIgnoreBackdropClick(ignoreBackdropClick) {
        this.ignoreBackdropClick = ignoreBackdropClick;
        return this;
    }

    getBackdrop() {
        if (!this.$backdrop) {
            this.$backdrop = document.createElement('div');
            this.$backdrop.className = 'modalizer-backdrop';
            document.body.insertAdjacentElement('beforeend', this.$backdrop);
        }

        return this.$backdrop;
    }

    getElement() {
        if (!this.$element) {
            this.$element = document.createElement('div');
            this.$element.className = 'modalizer';
            this.$element.setAttribute('tabindex', '-1');
            this.$element.setAttribute('role', 'dialog');

            this.getBackdrop().insertAdjacentElement('beforebegin', this.$element);
        }

        return this.$element;
    }

    getCurrentLayer() {
        return this.layers[this.layers.length - 1];
    }

    getLayer(name) {
        for (let i = this.layers.length - 1; i >= 0; i--) {
            if (this.layers[i].name === name) {
                return this.layers[i];
            }
        }
        return false;
    }

    show(layer) {
        const bodyIsOverflowing = document.body.clientWidth < window.innerWidth;

        this.getElement().scrollTop(0);

        if (this.layers.length > 0) {
            for (let i = 0, n = this.layers.length; i < n; i++) {
                this.layers[i].style.display = 'none';
            }
        }
        else {
            document.body.classList.add("modalizer-open");

            if (bodyIsOverflowing) {
                document.body.classList.add("modalizer-overflowing");
            }

            this.getBackdrop().classList.add("in");

            window.addEventListener("resize", () => {
                this.onResize();
            });

            this.getElement().addEventListener("click", (e) => {
                let closeMe = false;

                if (e.target.classList.contains("modalizer") && e.target.classList.contains("in")) {
                    if (true === this.ignoreBackdropClick) {
                        return;
                    }

                    e.preventDefault();
                    closeMe = true;
                }
                else if (e.target.classList.contains("modalizer-close")) {
                    e.preventDefault();
                    closeMe = true;
                }
                else if (e.target.closest("a, button").classList.contains("modalizer-close")) {
                    e.preventDefault();
                    closeMe = true;
                }

                if (true === closeMe) {
                    this.hide();
                }
            });
        }

        layer.setModal(this);
        this.layers.push(layer);

        this.getElement().append(layer.getElement());
        this.getElement().classList.add("in");

        this.shown = true;

        layer.show(false);
    }

    hide() {
        if (this.layers.length <= 1) {
            this.destroy();
            return;
        }

        this.layers.pop().destroy();
        this.layers[this.layers.length - 1].show(true);
    }

    destroy() {
        if (false === this.shown) {
            return;
        }

        if (this.layers.length > 0) {
            do {
                this.layers.pop().destroy();
            } while (this.layers.length);
        }

        this.$element.classList.remove("in");
        this.$backdrop.classList.remove("in");
        document.body.classList.remove("modalizer-open", "modalizer-overflowing");

        setTimeout(() => { this.reset(); }, 300);
    }

    reset() {
        this.getElement().remove();
        this.getBackdrop().remove();

        this.layers = [];
        this.shown = false;
        this.ignoreBackdropClick = false;
        this.$backdrop = null;
        this.$element = null;
    }

    onResize() {
    }

    isShown() {
        return true === this.shown;
    }

    addLayer(name, config, replace) {
        if (replace) {
            this.layers.pop().destroy();
        }

        const layer = new Layer(name, config);

        this.show(layer);

        return layer;
    }

    replaceLayer(name, config) {
        this.layers.pop().destroy();
        this.addLayer(name, config, true);
    }

    LayerDomData(el) {
        if (!(el instanceof Element)) {
            throw new Error("Layer: Invalid element");
        }

        let layer = {
            noheader: false,
            nofooter: false,
            sm: false,
            lg: false,
            normal: true,
            closeIcon: true,
            middle: false,
            title: '',
            footer: '',
            theme: '',
            size: '',
        };

        const json = el.getAttr('data-layer') || '';

        if (json) {
            try {
                layer = Object.assign({}, layer, JSON.parse(json));
            } catch (e) {
                console.error("Layer: Error parsing data-layer attribute ..", e);
            }
        }

        if ('sm' === layer.size) {
            layer.sm = true;
            layer.lg = false;
            layer.normal = false;
        }
        else if ('lg' === layer.size) {
            layer.sm = false;
            layer.lg = true;
            layer.normal = false;
        }
        else if ('normal' === layer.size) {
            layer.sm = false;
            layer.lg = false;
            layer.normal = true;
        }

        if (el.getAttr("data-middle")) {
            layer.middle = true;
        }

        if (el.getAttr("data-theme")) {
            layer.theme = el.getAttr("data-theme");
        }

        if (el.classList.contains("hh")) {
            layer.noheader = true;
        }

        if (el.classList.contains("hf")) {
            layer.nofooter = true;
        }

        if (el.classList.contains("middle")) {
            layer.middle = true;
        }

        if (el.classList.contains("sm")) {
            layer.normal = false;
            layer.sm = true;
            layer.lg = false;
        }
        else if (el.classList.contains("lg")) {
            layer.normal = false;
            layer.sm = false;
            layer.lg = true;
        }
        else if (el.classList.contains("normal")) {
            layer.normal = true;
            layer.sm = false;
            layer.lg = false;
        }

        if (true === layer.sm) {
            layer.lg = false;
            layer.normal = false;
        }
        else if (true === layer.lg) {
            layer.sm = false;
            layer.normal = false;
        }
        else if (true === layer.normal) {
            layer.sm = false;
            layer.lg = false;
        }

        if (layer.sm) {
            layer.size = 'sm';
        }
        else if (layer.lg) {
            layer.size = 'lg';
        }
        else {
            layer.size = '';
        }

        return layer;
    }

    //
    // HASHER
    //

    getHasher() {
        return this.hasher;
    }

    loadHashFromCurrentUrl() {
        // load hash from current URL (direct access or refresh)
        let hashbang = location.hash && location.hash.replace(/^#!(.*)$/, "$1");
        if ('' !== hashbang) {
            let state = new State(location.pathname.replace(/^\/*(.*)\/*$/, "$1") + location.search, hashbang);
            const result = this.hasher.trigger(state.url);
            this.onJsonRequest(result.hash, result.config);
        }
    }

    parseDomForHashes() {
        // parse DOM for data-hasher-url links
        document.querySelectorAll("[data-hasher-url]").forEach((el) => {
            el.addEventListener("click", (e) => {
                e.preventDefault();

                const hash = {};
                const config = {};
                // populate hash with data-hasher-* attributes
                hash.url = el.getAttribute("data-hasher-url");

                if (!hash.url) {
                    console.debug('Hasher: No URL found in data-hasher-url attribute');
                    return;
                }

                if (el.getAttribute("data-hasher-replace") === 'true') {
                    hash.replace = true;
                }

                if (el.getAttribute("data-hasher-type")) {
                    hash.type = el.getAttribute("data-hasher-type");
                }

                if (el.getAttribute("data-hasher-value")) {
                    hash.value = el.getAttribute("data-hasher-value");
                }

                if (el.getAttribute("data-middle")) {
                    config.middle = true;
                }

                if (el.classList.contains("hh")) {
                    config.noheader = true;
                }

                if (el.classList.contains("hf")) {
                    config.nofooter = true;
                }

                if (el.classList.contains("middle")) {
                    config.middle = true;
                }

                if (el.classList.contains("sm")) {
                    config.normal = false;
                    config.sm = true;
                    config.lg = false;
                }
                else if (el.classList.contains("lg")) {
                    config.normal = false;
                    config.sm = false;
                    config.lg = true;
                }
                else if (el.classList.contains("normal")) {
                    config.normal = true;
                    config.sm = false;
                    config.lg = false;
                }

                if (true === config.sm) {
                    config.lg = false;
                    config.normal = false;
                }
                else if (true === config.lg) {
                    config.sm = false;
                    config.normal = false;
                }
                else if (true === config.normal) {
                    config.sm = false;
                    config.lg = false;
                }

                this.loadHash(url, hash, config);
            });
        });
    }

    loadHash(url, hash, config) {
        // find component by URL
        const component = this.hasher.findComponentByUrl(url);
        if (!component) {
            console.debug('Hasher: No component found for URL: ' + url);
            return;
        }

        hash = Object.assign({}, {
            url: url,
            replace: false,
            type: 'url',
            value: ''
        }, hash || {});

        // trigger the component to load the data
        const result = component.trigger(hash);
        if (!result) {
            console.debug('Hasher: No result returned from component trigger for URL: ' + hash.url);
            return;
        }

        this.onJsonRequest(result.hash, Object.assign({}, result, config));
    }

    updateState(hash, data) {
        const hashVars = {};
        hashVars[hash.type] = hash.value;

        const hashbang = Object.entries(hashVars)
            .filter(([key, value]) => key && value !== undefined && value !== null && value !== '')
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');

        const state = new State(location.pathname.replace(/^\/*(.*)\/*$/, "$1") + location.search, hashbang);
        if (data.title) {
            state.title = data.title;
        }

        const hashData = this.hasher.parseHashData(hashVars);
        for (let k in hashData) {
            state[k] = hashData[k];
        }

        if (true === hash.replace) {
            this.hasher.replaceHistory(state);
        }
        else {
            this.hasher.addHistory(state);
        }
    }

    //
    // JSON
    //

    onJsonRequest(hash, config) {
        if (hash.deprecated) {
            if (typeof hash.deprecated === 'function') {
                hash.deprecated = hash.deprecated();
            }

            if (hash.deprecated) {
                // console.error('deprecated');
                return;
            }
        }

        if (hash.userData) {
            const parts = [];

            // Helper to add a key-value pair to the parts array
            parts.add = function (key, value) {
                value = typeof value === 'function' ? value() : value;
                value = value == null ? '' : value;
                this.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            };

            // Recursively build key-value pairs for nested objects/arrays
            function buildParams(obj, prefix) {
                if (prefix) {
                    if (Array.isArray(obj)) {
                        for (let i = 0; i < obj.length; i++) buildParams(obj[i], prefix + '[]');
                    } else if (typeof obj === 'object') {
                        for (const key in obj) buildParams(obj[key], prefix + '[' + key + ']');
                    } else {
                        parts.add(prefix, obj);
                    }
                } else {
                    if (Array.isArray(obj)) {
                        for (let i = 0; i < obj.length; i++) buildParams(obj[i].value, obj[i].name);
                    } else if (typeof obj === 'object') {
                        for (const key in obj) buildParams(obj[key], key);
                    } else {
                        parts.add(prefix, obj);
                    }
                }
                return parts;
            }

            const userData = buildParams(config.userData, '').join('&').replace(/%20/g, '+');

            if (userData) {
                hash.url = (hash.url + '&' + userData).replace(/[&?]{1,2}/, '?');
            }
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        let result = {
            type: hash.type,
            point: hash.value,
            replace: hash.replace,
            url: hash.url,
            exception: '',
            ok: false,
            status: 0,
            statusText: '',
        };

        const response = fetch(hash.url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            signal: controller.signal
        }).then(response => {
            clearTimeout(timeoutId);

            result.ok = response.ok;
            result.status = response.status;
            result.statusText = response.statusText;

            if (!response.ok) {
                result.exception = 'HTTP Error: ' + response.status + ' - ' + response.statusText;
            }

            return response.json();
        }).catch(e => {
            clearTimeout(timeoutId);

            if (e.name === 'AbortError') {
                result.exception = 'Hasher: AJAX Request timeout for URL: ' + result.url;
            } else {
                result.exception = 'Hasher: ' + (e.message || 'AJAX Request failed') + ' for URL: ' + hash.url;
            }

            const response = {};
            return response;
        });

        // handle the response
        console.dir('Hasher response ..', response);

        const data = Object.assign({}, result, response);

        if (data.exception) {
            console.debug('Hasher Exception for URL: ' + hash.url, data.exception);
            if (typeof config.onDisplayException === 'function') {
                // Callback should return the data object
                // data can be updated in the callback
                data = config.onDisplayException(data);
            } else {
                data.ok = false;
            }
            return data;
        }

        if (data.error) {
            console.debug('Hasher Error for URL: ' + hash.url, data.error);
            if (typeof config.onDisplayError === 'function') {
                // Callback should return the data object
                // data can be updated in the callback
                data = config.onDisplayError(data);
            } else {
                data.ok = false;
                data.content = '<p>An error occured while loading the page.</p><p>Error: ' + data.error + '</p>';
                alert('Error: ' + data.error);
            }
            return data;
        }

        this.buildLayerFromJsonResponse(hash, data, config);
    }

    buildLayerFromJsonResponse(hash, data, layerConfig) {
        if (!data.ok) {
            // data.content = '';
            // @todo make sure not to load an empty layer
            return;
        }

        layerConfig = Object.assign({}, {
            theme: 'hasher',
            type: hash.type,
            point: hash.value,
            footer: '',
            ariaTitle: '',
            ariaDescription: '',
            closeText: this.closeButtonText
        }, layerConfig, data || {});

        if ('' !== layerConfig.title) {
            if ('' === layerConfig.ariaTitle) {
                layerConfig.ariaTitle = layerConfig.title;
            }

            if (false === layerConfig.noheader) {
                layerConfig.header = '<p>' + layerConfig.title + '</p>';
            }
        }

        if (false === layerConfig.nofooter) {
            if ('' === layerConfig.footer) {
                layerConfig.footerCloseButton = true;
            }
        }

        if (data.error) {
            layerConfig.content = '<p>An error occured while loading the page.</p><p>Error: ' + data.error + '</p>';
            // hash.replace = false;
        }
        else if (!layerConfig.content) {
            layerConfig.content = '<p>An error occured while loading the page.</p><p>Error: No content found for this URL</p>';
            // hash.replace = false;
        }

        if (true === layerConfig.sm) {
            layerConfig.size = 'sm';
        } else if (true === layerConfig.lg) {
            layerConfig.size = 'lg';
        }

        layerConfig.data = {
            type: layerConfig.type,
            point: layerConfig.point
        };

        layerConfig.onAfterShow = (layer) => {
            this.updateState(hash, data);

            if (typeof layerConfig.trackPageView === 'function') {
                const component = this.findComponentByUrl(url);
                if (component) {
                    const route = component.trackerPath + '/' + component.findValueByUrl(data.url) + '/';
                    layerConfig.trackPageView(route, data.title);
                }
            }
        };

        layerConfig.onHide = (layer) => {
            this.hasher.back();
        };

        this.addLayer('hasher', layerConfig, hash.replace);
    }
};

