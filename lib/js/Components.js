import Component from './Component.js';
import JsonComponent from './Components/JsonComponent.js';
import ContentComponent from './Components/ContentComponent.js';
import HtmlComponent from './Components/HtmlComponent.js';

/**
 * Manage modalizer components
 */
export default class Components {
    constructor() {
        this.components = {};
    }

    add(name, type = null) {
        if (typeof this.components[name] !== 'undefined') {
            return this.components[name];
        }

        let component = null;
        if (type === 'json') {
            component = new JsonComponent(name);
        } else if (type === 'html') {
            component = new HtmlComponent(name);
        } else {
            component = new ContentComponent(name);
        }

        return this.addComponent(component);
    }

    /**
     * Add a Component instance to the manager
     */
    addComponent(component) {
        if (!(component instanceof Component)) {
            console.warn('Components.addComponent() argument is not an instance of Component');
            return false;
        }

        if (typeof this.components[component.name] !== 'undefined') {
            return this.components[component.name];
        }

        this.components[component.name] = component;

        return component;
    }

    get(name) {
        return this.components[name] || false;
    }

    /**
     * Trigger a component by its URL
     * @param {*} hash 
     * @param {*} config 
     * @returns 
     */
    trigger(hash, layerConfig) {
        const component = this.getByPath(hash.path);

        if (!component) {
            throw new Error("No component found for Path " + hash.path);
        }

        // check the component hash data
        const queryHash = component.checkHashData(hash);
        if (!queryHash) {
            throw new Error("No valid hash data found for Path " + hash.path);
        }

        if (true === this.isDeprecated(hash)) {
            return;
        }


        component.setLayerConfig(layerConfig);
        component.trigger(queryHash);
    }

    /**
     * Check if hash data contains any known component hashVars
     * and return the enriched hash data
     * or false if no component matches
     */
    parseHashData(hashData) {
        let data = false;
        for (const key in hashData) {
            for (const component of Object.values(this.components)) {
                if (!component.checkHashVar(key)) {
                    // no hashvar matches
                    continue;
                }
                data = component.checkHashData(hashData);
                break;
            }
        }
        return data;
    }

    /**
     * Determine which component matches the given path
     */
    getByPath(path) {
        for (const name in this.components) {
            if (!this.components[name].checkPath(path)) {
                continue;
            }

            if (false !== this.components[name].parseHashVars(path)) {
                return this.components[name];
            }
        }

        return false;
    }
};
