import Component from '../Component.js';

export default class JsonComponent extends Component {
    async trigger(hash, override = {}) {
        const data = this.checkHashData(hash);
        if (!data) return false;

        const url = this.getFetchUrl(data.value);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('HTTP ' + response.status + ' ' + response.statusText);
            }
            const payload = await response.json();
            this.showLayer(data, payload, override);
        } catch (e) {
            console.error('[Modalizer] JsonComponent fetch failed: ' + url, e);
            this.showLayer(data, {
                title: 'Error',
                content: '<p>Failed to load <code>' + url + '</code></p><p>' + (e && e.message) + '</p>',
            }, override);
        }

        return data;
    }

    showLayer(hash, payload, override = {}) {
        const layerConfig = {
            ...this.layerConfig,
            content: (payload && payload.content) || '',
            ariaTitle: (payload && payload.title) || '',
            header: payload && payload.title ? '<p>' + payload.title + '</p>' : '',
            closeIcon: true,
            onShowTimeout: 100,
            // per-link overrides (data-mdzr-size / data-mdzr-noheader) win.
            ...override,
        };

        return window.Modalizer.openComponentLayer(hash.type, hash.value, layerConfig, !!hash.replace);
    }
}
