import { jDOM, jDOMcreate } from '../index.js';

class Modal {
  constructor() {
    this.closeButtonText = 'Close';
    this.ignoreBackdropClick = false;
    this.layers = [];
    this.shown = false;
    this.$body = null;
    this.$backdrop = null;
    this.$element = null;
  }

  setCloseButtonText(value) {
    this.closeButtonText = value;
    return this;
  }

  setIgnoreBackdropClick(ignoreBackdropClick) {
    this.ignoreBackdropClick = ignoreBackdropClick;
    return this;
  }

  getBackdrop() {
    if (!this.$backdrop) {
      this.$backdrop = jDOMcreate('div', { className: 'modalizer-backdrop' });
      this.$body.append(this.$backdrop);
    }
    return this.$backdrop;
  }

  getElement() {
    if (!this.$element) {
      this.$element = jDOMcreate('div', { className: 'modalizer', tabindex: '-1', 'role': 'dialog' });
      this.getBackdrop().before(this.$element);
    }
    return this.$element;
  }

  show(layer) {
    this.$body = jDOM("body");

    const bodyIsOverflowing = document.body.clientWidth < window.innerWidth;
    this.getElement().scrollTop(0);

    if (this.layers.length > 0) {
      this.layers.forEach(layer => layer.hide());
    } else {
      this.$body.addClass("modalizer-open");
      if (bodyIsOverflowing) { this.$body.addClass("modalizer-overflowing"); }
      this.getBackdrop().addClass("in");

      window.addEventListener("resize", () => { this.onResize(); });
    }

    layer.setModal(this);
    this.layers.push(layer);
    this.getElement().append(layer.getElement());
    this.getElement().addClass("in");

    this.shown = true;
    layer.show(false);
  }

  hide() {
    if (this.layers.length <= 1) {
      this.destroy();
      return;
    }

    this.layers.pop().destroy();
    this.layers[this.layers.length - 1].show(true);
  }

  destroy() {
    if (!this.shown) return;

    if (this.layers.length > 0) {
      while (this.layers.length) {
        this.layers.pop().destroy();
      }
    }

    this.$element.removeClass("in");
    this.$backdrop.removeClass("in");
    this.$body.removeClass("modalizer-open modalizer-overflowing");

    setTimeout(() => { this.reset(); }, 300);
  }

  reset() {
    this.getElement().remove();
    this.getBackdrop().remove();
    this.layers = [];
    this.shown = false;
    this.ignoreBackdropClick = false;
    this.$backdrop = null;
    this.$element = null;
  }

  onResize() {}
}

export default Modal;
