import Component from '../Component.js';

export default class HtmlComponent extends Component {
    async trigger(hash) {
        const data = this.checkHashData(hash);
        if (!data) return false;

        const url = this.getFetchUrl(data.value);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('HTTP ' + response.status + ' ' + response.statusText);
            }
            const html = await response.text();
            this.showLayer(data, html);
        } catch (e) {
            console.error('[Modalizer] HtmlComponent fetch failed: ' + url, e);
            this.showLayer(data, '<p>Failed to load <code>' + url + '</code></p><p>' + (e && e.message) + '</p>');
        }

        return data;
    }

    showLayer(hash, html) {
        const layerConfig = {
            ...this.layerConfig,
            content: html || '',
            closeIcon: true,
            onShowTimeout: 100,
        };

        return window.Modalizer.openComponentLayer(hash.type, hash.value, layerConfig, !!hash.replace);
    }
}
