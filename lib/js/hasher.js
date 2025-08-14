import State from './state.js';
import Component from './component.js';

/**
 * Manage fragmented urls, push them to history and update location
 */

export default class Hasher {
    constructor() {
        this.components = [];
        this.history = [];

        const url = location.pathname.replace(/^\/*(.*)\/*$/, "$1") + location.search;
        this.addHistory(new State(url));
    }

    //
    // COMPONENTS
    //

    addComponent(name, jsonUrl, trackerPath, config) {
        if (typeof this.components[name] !== 'undefined') {
            return this.components[name];
        }

        if (typeof config === 'undefined') {
            config = {};
        }

        this.components[name] = new Component(name, jsonUrl, trackerPath, config);

        return this.components[name];
    }

    updateComponentConfig(component, key, value) {
        if (typeof this.components[component] === 'undefined') {
            return;
        }

        this.components[component].setConfigValue(key, value);
        return this;
    }

    componentIsDeprecated(component, fn) {
        if (typeof fn !== 'function') {
            fn = (hash) => {
                if (typeof hash.deprecated === 'function' && true === hash.deprecated(hash)) {
                    return true;
                }

                window.location.href = '/notfound/';
                return;
            };
        }

        if (typeof this.components[component] === 'undefined') {
            return;
        }

        this.components[component].isDeprecated(fn);

        return this;
    }

    findComponentByUrl(url) {
        for (const name in this.components) {
            if (0 === url.indexOf(this.components[name].jsonUrl)) {
                return this.components[name];
            }
        }

        return false;
    }

    findComponentByHashVar(hashVar) {
        for (const name in this.components) {
            for (const i = 0, n = this.components[name].hashVars.length; i < n; i++) {
                if (hashVar === this.components[name].hashVars[i]) {
                    return this.components[name];
                }
            }
        }

        return false;
    }

    //
    // HISTORY
    //

    changeHistory(state, replace) {
        const fullUrl = '/' + state.url;

        if (state.hashbang) {
            fullUrl += '#!' + state.hashbang;
        }

        if (true === replace) {
            history.replaceState(state, '', fullUrl);
        }
        else {
            history.pushState(state, '', fullUrl);
        }

        document.title = state.pageTitle || state.title;
    }

    addHistory(state) {
        state.pageTitle = state.title;
        this.history.push(state);
        this.changeHistory(state, false);
    }

    replaceHistory(state) {
        state.pageTitle = state.title;
        this.history.push(state);
        this.changeHistory(state, true);
    }

    back() {
        if (this.history.length > 1) {
            this.history.pop();
            this.changeHistory(this.history[this.history.length - 1], true);
        } else {
            // if no history, just go to the homepage
            window.location.href = '/';
        }
    }

    //
    // CALLBACKS
    // 

    DomData(el) {
        if (!(el instanceof Element)) {
            throw new Error("Hasher: Invalid element");
        }

        let hash = {
            url: '',
            type: '',
            value: '',
            replace: false,
            deprecated: false,
            parseElement: null
        };

        const json = el.getAttr('data-hasher') || '{}';

        if (json) {
            try {
                hash = Object.assign({}, hash, JSON.parse(json));
            } catch (e) {
                console.error("Hasher: Error parsing data-hasher attribute ..", e);
            }
        }

        if (el.getAttr('data-hasher-type')) {
            hash.type = el.getAttr('data-hasher-type');
        }
        if (el.getAttr('data-hasher-value')) {
            hash.value = el.getAttr('data-hasher-value');
        }
        if (el.getAttr('data-hasher-url')) {
            hash.url = el.getAttr('data-hasher-url');
        }
        if (el.getAttr('data-hasher-replace')) {
            hash.replace = el.getAttr('data-hasher-replace') === 'true';
        }

        if (!hash.url) {
            throw new Error("Hasher: No URL specified for element");
        }

        const component = this.findComponentByUrl(hash.url);

        if (!component) {
            throw new Error(`Hasher: No component found for URL ${hash.url}`);
        }

        hash.type = component.name;
        hash.value = hash.value || component.findValueByUrl(hash.url);

        el.setAttr(`data-hasher-url`, hash.url);
        el.setAttr(`data-hasher-type`, hash.type);
        el.setAttr(`data-hasher-value`, hash.value);
        el.setAttr(`data-hasher-replace`, hash.replace);

        hash.deprecated = component.deprecated || false;
        hash.parser = component.parser || null;

        return hash;
    }

    parseHashData(hashData) {
        const data = {};
        for (const key in hashData) {
            for (const name in this.components) {
                for (let i = 0, n = this.components[name].hashVars.length; i < n; i++) {
                    if (key === this.components[name].hashVars[i]) {
                        data[name] = hashData[key];
                    }
                }
            }
        }
        return data;
    }

    trigger(state) {
        function stringToObject(str) {
            const o = {};

            const args = str.split(/&/);
            for (let i = 0, n = args.length; i < n; i++) {
                const arg = args[i].split(/=/);
                if (typeof arg[1] === 'undefined') {
                    arg[1] = '';
                }
                o[arg[0]] = arg[1];
            }

            return o;
        }

        const data = this.parseHashData(stringToObject(state.hashbang || ''));
        data.replace = state.replace || false;
        data.hashVar = '';

        this.components.forEach((item) => {
            const result = item.trigger(data);
            if (false !== result) {
                return result;
            }
        });

        return false;
    }
};
