import Component from '../Component.js';

export default class HtmlComponent extends Component {
    async trigger(hash, override = {}) {
        const data = this.checkHashData(hash);
        if (!data) return false;

        const url = this.getFetchUrl(data.value);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('HTTP ' + response.status + ' ' + response.statusText);
            }
            const html = await response.text();
            this.showLayer(data, html, override);
        } catch (e) {
            console.error('[Modalizer] HtmlComponent fetch failed: ' + url, e);
            this.showLayer(data, '<p>Failed to load <code>' + url + '</code></p><p>' + (e && e.message) + '</p>', override);
        }

        return data;
    }

    showLayer(hash, html, override = {}) {
        const layerConfig = {
            ...this.layerConfig,
            content: html || '',
            closeIcon: true,
            onShowTimeout: 100,
            // per-link overrides (data-mdzr-size / data-mdzr-noheader) win.
            ...override,
        };

        return window.Modalizer.openComponentLayer(hash.type, hash.value, layerConfig, !!hash.replace);
    }
}
