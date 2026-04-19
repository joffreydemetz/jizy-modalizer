/**
 * Modal host: owns the backdrop and the shared container
 * that Layer elements are mounted into. One instance per page.
 */
export default class Modal {
    constructor() {
        this.$backdrop = null;
        this.$element = null;
        this.shown = false;
        this.ignoreBackdropClick = false;
    }

    setIgnoreBackdropClick(v) {
        this.ignoreBackdropClick = !!v;
        return this;
    }

    getBackdrop() {
        if (!this.$backdrop) {
            this.$backdrop = document.createElement('div');
            this.$backdrop.classList.add('modalizer-backdrop');
            document.body.append(this.$backdrop);
        }
        return this.$backdrop;
    }

    getElement() {
        if (!this.$element) {
            this.$element = document.createElement('div');
            this.$element.classList.add('modalizer');
            this.$element.setAttribute('tabindex', '-1');
            this.$element.setAttribute('role', 'dialog');
            this.getBackdrop().before(this.$element);
        }
        return this.$element;
    }

    /**
     * Mount a Layer into the host and trigger its show().
     * `onHideAll` is called when the user dismisses the final layer.
     */
    show(layer, onHideAll) {
        layer.modal = this;

        if (!this.shown) {
            document.body.classList.add('modalizer-open');
            this.getBackdrop().classList.add('in');
            this._bindCloseHandler(onHideAll);
        }

        this.getElement().append(layer.getElement());
        this.getElement().classList.add('in');
        this.shown = true;

        layer.show(false);
    }

    _bindCloseHandler(onHideAll) {
        if (this._closeBound) return;
        this._closeBound = true;

        this.getElement().addEventListener('click', (e) => {
            let close = false;
            const target = e.target;

            if (target.classList.contains('modalizer') && target.classList.contains('in')) {
                if (this.ignoreBackdropClick) return;
                close = true;
            } else if (target.classList.contains('modalizer-close')) {
                close = true;
            } else {
                const closer = target.closest && target.closest('.modalizer-close');
                if (closer) close = true;
            }

            if (close) {
                e.preventDefault();
                if (typeof onHideAll === 'function') onHideAll();
            }
        });
    }

    reset() {
        if (this.$element) this.$element.remove();
        if (this.$backdrop) this.$backdrop.remove();
        document.body.classList.remove('modalizer-open');
        this.$element = null;
        this.$backdrop = null;
        this.shown = false;
        this._closeBound = false;
    }
}
