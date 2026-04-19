import Component from '../Component.js';

export default class ContentComponent extends Component {
    trigger(hash) {
        const data = this.checkHashData(hash);
        if (!data) return false;
        this.showLayer(data);
        return data;
    }

    showLayer(hash) {
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
        };

        return window.Modalizer.openComponentLayer(hash.type, hash.value, layerConfig, !!hash.replace);
    }
}
