import DOM from 'jizy-dom';

export default class Layer {
  private id: string;
  private properties: Map<string, any> = new Map();
  private name: string;
  private elevation: number;
  private closeText: string = 'Close';
  private size: string = '';
  private theme: string = '';
  private visible: boolean = false;
  private onShowTimeout: number = 500;
  private data: Record<string, any> = {};
  private aria: { title: string; description: string } = { title: '', description: '' };
  private onBeforeShow: ((layer: Layer) => void) | null = null;
  private onShow: ((layer: Layer) => void) | null = null;
  private onUpdate: ((layer: Layer) => void) | null = null;
  private onHide: ((layer: Layer) => void) | null = null;
  private $element: DOM | null = null;
  private closeIcon: boolean = false;
  private header: string = '';
  private content: string = '';
  private footer: string = '';

  constructor(id: string, name: string, elevation: number) {
    this.id = id;
    this.name = name;
    this.elevation = elevation;
  }

  getId(): string {
    return this.id;
  }

  setId(id: string): void {
    this.id = id;
  }

  addProperty(key: string, value: any): void {
    this.properties.set(key, value);
  }

  getProperty(key: string): any {
    return this.properties.get(key);
  }

  removeProperty(key: string): boolean {
    return this.properties.delete(key);
  }

  setCloseText(str: string): this {
    this.closeText = str;
    return this;
  }

  setSize(size: string): this {
    this.size = size;
    return this;
  }

  setTheme(theme: string): this {
    this.theme = theme;
    return this;
  }

  setData(key: string, value: any): this {
    this.data[key] = value;
    return this;
  }

  setAriaTitle(title: string): this {
    this.aria.title = title;
    return this;
  }

  setAriaDescription(description: string): this {
    this.aria.description = description;
    return this;
  }

  setOnBeforeShow(callback: (layer: Layer) => void): this {
    this.onBeforeShow = callback;
    return this;
  }

  setOnShow(callback: (layer: Layer) => void): this {
    this.onShow = callback;
    return this;
  }

  setOnUpdate(callback: (layer: Layer) => void): this {
    this.onUpdate = callback;
    return this;
  }

  setOnHide(callback: (layer: Layer) => void): this {
    this.onHide = callback;
    return this;
  }

  show(): this {
    if (!this.visible) {
      if (this.onBeforeShow) {
        this.onBeforeShow(this);
      }
      this.visible = true;
      if (this.onShow) {
        setTimeout(() => this.onShow!(this), this.onShowTimeout);
      }
    }
    return this;
  }

  hide(): this {
    if (this.visible) {
      this.visible = false;
      if (this.onHide) {
        this.onHide(this);
      }
    }
    return this;
  }

  addData(data: Record<string, any>): this {
    this.data = { ...this.data, ...data };
    return this;
  }

  resize(size: string): this {
    this.size = size;
    return this;
  }

  destroy(): void {
    this.hide();
    if (this.onHide) {
      this.onHide(this);
    }
    setTimeout(() => {
      this.getElement().remove();
    }, 550);
  }

  withCloseIcon(): this {
    this.closeIcon = true;
    return this;
  }

  setFooterCloseButton(closeText: string = ''): this {
    if ( '' === closeText ){
        closeText = this.closeText;
    }
    return this.setFooter('<button type="button" class="btn btn-primary modalizer-close">' + closeText + '</button>');
  }

  setHeader(header: string): this {
    this.header = header;
    return this;
  }

  setContent(content: string): this {
    this.content = content;
    return this;
  }

  setFooter(footer: string): this {
    this.footer = footer;
    return this;
  }

  withMiddle(): this {
    const element = this.getElement();
    this.getElement().addClass('layer-middle');
    return this;
  }

  setOnShowTimeout(timeout: number): this {
    this.onShowTimeout = timeout;
    return this;
  }

  getElement(): DOM {
    if (!this.$element) {
      const newElementAttrs: Record<string, string> = {
        class: 'layer',
        id: 'Layer-' + this.id,
        role: 'dialog',
      };

      for (const key in this.data) {
        newElementAttrs['data-' + key] = this.data[key];
      }

      if (this.aria.title) {
        newElementAttrs['aria-title'] = this.aria.title;
      }
      if (this.aria.description) {
        newElementAttrs['aria-description'] = this.aria.description;
      }

      this.$element = DOM.create('div', newElementAttrs);

      let html = '';
      if (this.closeIcon) {
        html += `<button type="button" class="closer modalizer-close">
                    <span aria-hidden="true">&times;</span>
                    <span class="sr-only">${this.closeText}</span>
                 </button>`;
      }
      if (this.header) {
        html += `<header>${this.header}</header>`;
      }
      html += `<section>${this.content}</section>`;
      if (this.footer) {
        html += `<footer>${this.footer}</footer>`;
      }
      this.$element.html(html);

      if (this.size) {
        this.$element.addClass('layer-' + this.size);
      }
      if (this.theme) {
        this.$element.addClass('layer-' + this.theme);
      }
    }

    return this.$element;
  }
}