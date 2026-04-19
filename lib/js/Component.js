/**
 * Base Component class
 *
 * Subclasses (ContentComponent, JsonComponent, HtmlComponent) implement
 * `trigger(hash)` and `showLayer(hash)` to route a parsed hash into a Layer.
 *
 * Configuration uses fluent setters so a Component can be created via
 * `Modalizer.addComponent(name, type)` and then customized:
 *
 *   Modalizer.addComponent('json', 'json')
 *     .setBasePath('/mdzr/json/')
 *     .setTrackerPath('/json/')
 *     .setOtherHashes(['mp'])
 *     .setLayerConfig({ lg: true });
 */
export default class Component {
    constructor(name) {
        this.name = name;
        this.basePath = '/mdzr/' + name + '/';
        this.trackerPath = '/' + name + '/';
        this.fetchBase = null;
        this.fetchExt = '';
        this.hashVars = [name];
        this.layerConfig = {};
        this.deprecated = false;
        this.parser = null;
        this.onDisplayError = false;
    }

    setBasePath(path) {
        this.basePath = path;
        return this;
    }

    setFetchBase(path) {
        this.fetchBase = path;
        return this;
    }

    setFetchExt(ext) {
        this.fetchExt = ext;
        return this;
    }

    getFetchUrl(value) {
        const base = this.fetchBase != null ? this.fetchBase : this.basePath;
        return base + value + this.fetchExt;
    }

    setTrackerPath(path) {
        this.trackerPath = path;
        return this;
    }

    setOtherHashes(hashes) {
        if (!Array.isArray(hashes)) {
            throw new Error('Component.setOtherHashes expects an array');
        }
        this.hashVars = [this.name, ...hashes];
        return this;
    }

    setLayerConfig(config) {
        this.layerConfig = { ...this.layerConfig, ...(config || {}) };
        return this;
    }

    setConfigValue(key, value) {
        this.layerConfig[key] = value;
        return this;
    }

    isDeprecated(fn) {
        if (typeof fn === 'function') {
            this.deprecated = fn;
        }
        return this;
    }

    /**
     * Does the given URL path belong to this component?
     */
    checkPath(path) {
        if (!path) return false;
        return path.indexOf(this.basePath) === 0;
    }

    /**
     * Does this component respond to the given hashVar key?
     */
    checkHashVar(key) {
        return this.hashVars.indexOf(key) !== -1;
    }

    /**
     * Extract the value segment from a path that matched checkPath().
     * e.g. basePath '/mdzr/json/' + path '/mdzr/json/page2/' -> 'page2'
     */
    parseHashVars(path) {
        if (!this.checkPath(path)) return false;
        const tail = path.slice(this.basePath.length).replace(/^\/+|\/+$/g, '');
        if (!tail) return false;
        const value = tail.split('/')[0];
        return { [this.name]: value, value, type: this.name };
    }

    /**
     * Validate a hash payload and return an enriched copy, or false.
     */
    checkHashData(hash) {
        if (!hash) return false;
        const data = { ...hash };

        if (!data.value) {
            for (const key of this.hashVars) {
                if (data[key]) {
                    data.value = data[key];
                    break;
                }
            }
        }

        if (!data.value) return false;

        data.type = this.name;
        data.path = data.path || this.basePath + data.value + '/';
        return data;
    }

    /**
     * Subclass hook: open a layer for the given hash. Default is no-op.
     */
    trigger(hash) {
        return this.checkHashData(hash);
    }
}
