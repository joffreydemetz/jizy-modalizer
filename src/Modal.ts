import DOM from 'jizy-dom';
import Layer from './Layer.js';

export default class Modal {
  closeButtonText: string;
  ignoreBackdropClick: boolean;
  layers: Layer[];
  shown: boolean;
  $body: DOM | null;
  $backdrop: DOM | null;
  $element: DOM | null;

  constructor() {
    this.closeButtonText = 'Close';
    this.ignoreBackdropClick = false;
    this.layers = [];
    this.shown = false;
    this.$body = null;
    this.$backdrop = null;
    this.$element = null;
  }

  setCloseButtonText(value: string): this {
    this.closeButtonText = value;
    return this;
  }

  setIgnoreBackdropClick(ignoreBackdropClick: boolean): this {
    this.ignoreBackdropClick = ignoreBackdropClick;
    return this;
  }

  getBackdrop(): DOM {
    if (!this.$backdrop) {
      this.$backdrop = DOM.create('div', { className: 'modalizer-backdrop' });
      this.$body?.append(this.$backdrop);
    }
    return this.$backdrop;
  }

  getElement(): DOM {
    if (!this.$element) {
        this.$element = DOM.create('div', { className: 'modalizer', tabindex: '-1', role: 'dialog' });
        this.getBackdrop().before(this.$element);
    }
    return this.$element;
  }

  show(layer: any): void {
    this.$body = DOM.instance("body");

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

  hide(): void {
    if (this.layers.length <= 1) {
      this.destroy();
      return;
    }

    this.layers.pop()?.destroy();
    this.layers[this.layers.length - 1]?.show();
  }

  destroy(): void {
    if (!this.shown) return;

    while (this.layers.length) {
      this.layers.pop()?.destroy();
    }

    this.$element?.removeClass("in");
    this.$backdrop?.removeClass("in");
    this.$body?.removeClass("modalizer-open modalizer-overflowing");

    setTimeout(() => { this.reset(); }, 300);
  }

  reset(): void {
    this.$element?.remove();
    this.$backdrop?.remove();
    this.layers = [];
    this.shown = false;
    this.ignoreBackdropClick = false;
    this.$backdrop = null;
    this.$element = null;
  }

  onResize(): void {}
}
