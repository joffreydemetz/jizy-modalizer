export default class Component {
    constructor(name, jsonUrl, trackerPath, config) {
        this.name = name;
        this.jsonUrl = jsonUrl;
        this.trackerPath = trackerPath; // path for Tracker
        this.config = config;

        if (typeof this.config.onDisplayError !== 'function') {
            this.config.onDisplayError = false;
        }

        // COMPAT 1.5
        //this.deprecated = () => false; 
        //this.parser = () => false; 
        this.deprecated = typeof this.config.deprecated === 'function' ? this.config.deprecated : (this.config.deprecated || false);
        this.parser = typeof this.config.parser === 'function' ? this.config.parser : null;

        this.hashVars = [this.name];
        if (typeof this.config.otherHashes !== 'undefined') {
            for (let i = 0, n = this.config.otherHashes.length; i < n; i++) {
                this.hashVars.push(this.config.otherHashes[i]);
            }
        }
    }

    trigger(hash) {
        for (let i = 0, n = this.hashVars.length; i < n; i++) {
            if (typeof hash[this.hashVars[i]] === 'undefined' || '' === hash[this.hashVars[i]]) {
                continue;
            }

            hash.hashVar = hash[this.hashVars[i]];
            break;
        }

        hash.config = this.config;

        if (hash.hashVar) {
            hash.value = hash.hashVar;
            hash.type = this.name;
            hash.replace = false;
            hash.deprecated = this.deprecated || false;
            hash.parser = this.parser || null;
            hash.onDisplayError = this.config.onDisplayError || false;
            hash.url = this.jsonUrl + hash.hashVar + '/';
            hash.userData = this.parseUserData();
            return hash;
        }

        return false;
    }

    findValueByUrl(url) {
        const reg = new RegExp('^' + this.jsonUrl + '([^\/]+)\/.*$');
        const res = reg.exec(url);
        return res && res[1] ? res[1] : false;
    }

    parseUserData() {
        const userData = {};
        if (this.config.userData) {
            for (const key in this.config.userData) {
                if (this.config.userData.hasOwnProperty(key)) {
                    userData[key] = this.config.userData[key];
                }
            }
        }
        return userData;
    }

    setConfigValue(key, value) {
        this.config[key] = value;
    }

    isDeprecated(fn) {
        if (typeof fn === 'function') {
            this.deprecated = fn;
        }
    }
}

