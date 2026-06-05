import Component from '../Component.js';

export default class ContentComponent extends Component {
    trigger(hash, override = {}) {
        const data = this.checkHashData(hash);
        if (!data) return false;
        this.showLayer(data, override);
        return data;
    }

    showLayer(hash, override = {}) {
        const contentSelector = '#' + hash.value;
        const $el = document.querySelector(contentSelector);

        if (!$el) {
            throw new Error('No content found for selector ' + contentSelector);
        }

        const title = $el.getAttribute('data-mdzr-title') || '';
        const size = $el.getAttribute('data-mdzr-size') || '';

        const layerConfig = {
            ...this.layerConfig,
            content: $el.innerHTML,
            ariaTitle: title,
            size: size,
            header: title ? '<p>' + title + '</p>' : '',
            closeIcon: true,
            onShowTimeout: 100,
            // per-link overrides (data-mdzr-size / data-mdzr-noheader) win.
            ...override,
        };

        return window.Modalizer.openComponentLayer(hash.type, hash.value, layerConfig, !!hash.replace);
    }
}
