import Layer from '../Layer.js';

/**
 * Confirmation layer — a Layer subclass: a question, a Cancel button and an OK
 * button. The OK action is a callback, or navigating to the element's href.
 *
 * Programmatic, or driven by an element's `data-confirm` /
 * `data-confirm-question` / `data-confirm-header` attributes:
 *
 *   Modalizer.addLayer(new ConfirmLayer(null, { content: 'Sure?', callback: () => doIt() }));
 *   Modalizer.addLayer(new ConfirmLayer(linkEl, { okText: 'Oui', koText: 'Non' })); // navigates to linkEl.href on OK
 *
 * `Modalizer.confirm(element, params)` (plugins/confirm.js) is the one-liner for that.
 */
export default class ConfirmLayer extends Layer {
    constructor(element, params) {
        const cfg = Object.assign({
            content: '',
            header: '',
            theme: 'confirm',
            size: 'sm',
            okText: 'Confirm',
            koText: 'Cancel',
            callback: null
        }, params || {});

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

        super('confirm', {
            header: header,
            content: html,
            theme: cfg.theme,
            size: cfg.size,
            closeIcon: false,
            // Escape = the Cancel button (the callback is not called).
            closeOnEscape: cfg.closeOnEscape,
            closeAllOnEscape: cfg.closeAllOnEscape,
            onBeforeShow: cfg.onBeforeShow,
            onShow: cfg.onShow,
            onHide: cfg.onHide
        });

        this.element = el;
        this.callback = typeof cfg.callback === 'function' ? cfg.callback : null;
    }

    getElement() {
        const build = !this.$element;
        const $el = super.getElement();
        if (build) {
            const okBtn = $el.querySelector('.confirm-button');
            if (okBtn) {
                okBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.confirm();
                });
            }
        }
        return $el;
    }

    /** The OK action: the callback, else the element's href; then close. */
    confirm() {
        if (this.callback) {
            this.callback(this);
        }
        else if (this.element && this.element.getAttribute('href')) {
            window.location.href = this.element.getAttribute('href');
        }
        this.close();
        return this;
    }

    show(again) {
        // An accidental backdrop click must not dismiss a confirmation.
        if (this.modal && typeof this.modal.setIgnoreBackdropClick === 'function') {
            this.modal.setIgnoreBackdropClick(true);
        }
        super.show(again);
    }

    destroy() {
        if (this.modal && typeof this.modal.setIgnoreBackdropClick === 'function') {
            this.modal.setIgnoreBackdropClick(false);
        }
        super.destroy();
    }
}
