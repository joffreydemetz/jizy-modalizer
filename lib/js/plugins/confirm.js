import Modalizer from '../Modalizer.js';

/**
 * Confirmation modal — an extension of Modalizer, callable from the built bundle as
 * `Modalizer.confirm(element, params)`. Works programmatically or driven by an element's
 * `data-confirm` / `data-confirm-question` / `data-confirm-header` attributes.
 *
 *   Modalizer.confirm(null, { content: 'Sure?', callback: () => doIt() });
 *   Modalizer.confirm(linkEl, { okText: 'Oui', koText: 'Non' }); // navigates to linkEl.href on OK
 */
Modalizer.prototype.confirm = function (element, params = {}) {
    const cfg = {
        content: '',
        header: '',
        theme: 'confirm',
        size: 'sm',
        okText: 'Confirm',
        koText: 'Cancel',
        callback: null,
        ...params
    };

    const el = (element && element.nodeType === 1) ? element : null;
    const content = cfg.content
        || (el && (el.getAttribute('data-confirm-question') || el.getAttribute('data-confirm')))
        || '';
    const header = cfg.header
        || (el && el.getAttribute('data-confirm-header'))
        || '';

    const html =
        '<div class="confirm-message">' + content + '</div>' +
        '<div class="confirm-buttons">' +
        '<button type="button" class="btn btn-default modalizer-close">' + cfg.koText + '</button>' +
        '<button type="button" class="btn btn-success confirm-button">' + cfg.okText + '</button>' +
        '</div>';

    const layer = this.addLayer('confirm', {
        header: header,
        content: html,
        theme: cfg.theme,
        size: cfg.size,
        closeIcon: false,
        onShow: (lyr) => {
            const okBtn = lyr.getElement().querySelector('.confirm-button');
            if (okBtn) {
                okBtn.addEventListener('click', () => {
                    if (typeof cfg.callback === 'function') {
                        cfg.callback();
                    }
                    else if (el && el.getAttribute('href')) {
                        window.location.href = el.getAttribute('href');
                    }
                    this.layers.hide();
                });
            }
        }
    });

    // Prevent an accidental backdrop click from dismissing a confirmation.
    if (layer.modal && typeof layer.modal.setIgnoreBackdropClick === 'function') {
        layer.modal.setIgnoreBackdropClick(true);
    }

    return layer;
};
