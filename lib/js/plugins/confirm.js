/**
 * Confirmation modal — an OPTIONAL Modalizer plugin. Not part of the core dist.
 *
 * Delivered as a raw script loaded AFTER the core jizy-modalizer dist (which
 * exposes the global `Modalizer` instance), so it extends that instance directly
 * — no import, no bundling. Selected per-site via `modalizerPlugins: [confirm]`;
 * jizy-builder concatenates this file + ships dist/css/plugins/confirm.css.
 *
 * Works programmatically or driven by an element's `data-confirm` /
 * `data-confirm-question` / `data-confirm-header` attributes:
 *
 *   Modalizer.confirm(null, { content: 'Sure?', callback: () => doIt() });
 *   Modalizer.confirm(linkEl, { okText: 'Oui', koText: 'Non' }); // navigates to linkEl.href on OK
 */
(function () {
    'use strict';

    if (typeof Modalizer === 'undefined') {
        return;
    }

    Modalizer.confirm = function (element, params) {
        var self = this;
        var cfg = Object.assign({
            content: '',
            header: '',
            theme: 'confirm',
            size: 'sm',
            okText: 'Confirm',
            koText: 'Cancel',
            callback: null
        }, params || {});

        var el = (element && element.nodeType === 1) ? element : null;
        var content = cfg.content
            || (el && (el.getAttribute('data-confirm-question') || el.getAttribute('data-confirm')))
            || '';
        var header = cfg.header
            || (el && el.getAttribute('data-confirm-header'))
            || '';

        var html =
            '<div class="confirm-message">' + content + '</div>' +
            '<div class="confirm-buttons">' +
            '<button type="button" class="btn btn-default modalizer-close">' + cfg.koText + '</button>' +
            '<button type="button" class="btn btn-success confirm-button">' + cfg.okText + '</button>' +
            '</div>';

        var layer = this.addLayer('confirm', {
            header: header,
            content: html,
            theme: cfg.theme,
            size: cfg.size,
            closeIcon: false,
            onShow: function (lyr) {
                var okBtn = lyr.getElement().querySelector('.confirm-button');
                if (okBtn) {
                    okBtn.addEventListener('click', function () {
                        if (typeof cfg.callback === 'function') {
                            cfg.callback();
                        }
                        else if (el && el.getAttribute('href')) {
                            window.location.href = el.getAttribute('href');
                        }
                        self.layers.hide();
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
})();
