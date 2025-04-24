"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Layer: () => Layer,
  Modal: () => Modal,
  Modalizer: () => Modalizer_default,
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

// src/Layer.ts
var import_jizy_dom = __toESM(require("jizy-dom"));
var Layer = class {
  id;
  properties = /* @__PURE__ */ new Map();
  name;
  elevation;
  closeText = "Close";
  size = "";
  theme = "";
  visible = false;
  onShowTimeout = 500;
  data = {};
  aria = { title: "", description: "" };
  onBeforeShow = null;
  onShow = null;
  onUpdate = null;
  onHide = null;
  $element = null;
  closeIcon = false;
  header = "";
  content = "";
  footer = "";
  constructor(id, name, elevation) {
    this.id = id;
    this.name = name;
    this.elevation = elevation;
  }
  getId() {
    return this.id;
  }
  setId(id) {
    this.id = id;
  }
  addProperty(key, value) {
    this.properties.set(key, value);
  }
  getProperty(key) {
    return this.properties.get(key);
  }
  removeProperty(key) {
    return this.properties.delete(key);
  }
  setCloseText(str) {
    this.closeText = str;
    return this;
  }
  setSize(size) {
    this.size = size;
    return this;
  }
  setTheme(theme) {
    this.theme = theme;
    return this;
  }
  setData(key, value) {
    this.data[key] = value;
    return this;
  }
  setAriaTitle(title) {
    this.aria.title = title;
    return this;
  }
  setAriaDescription(description) {
    this.aria.description = description;
    return this;
  }
  setOnBeforeShow(callback) {
    this.onBeforeShow = callback;
    return this;
  }
  setOnShow(callback) {
    this.onShow = callback;
    return this;
  }
  setOnUpdate(callback) {
    this.onUpdate = callback;
    return this;
  }
  setOnHide(callback) {
    this.onHide = callback;
    return this;
  }
  show() {
    if (!this.visible) {
      if (this.onBeforeShow) {
        this.onBeforeShow(this);
      }
      this.visible = true;
      if (this.onShow) {
        setTimeout(() => this.onShow(this), this.onShowTimeout);
      }
    }
    return this;
  }
  hide() {
    if (this.visible) {
      this.visible = false;
      if (this.onHide) {
        this.onHide(this);
      }
    }
    return this;
  }
  addData(data) {
    this.data = { ...this.data, ...data };
    return this;
  }
  resize(size) {
    this.size = size;
    return this;
  }
  destroy() {
    this.hide();
    if (this.onHide) {
      this.onHide(this);
    }
    setTimeout(() => {
      this.getElement().remove();
    }, 550);
  }
  withCloseIcon() {
    this.closeIcon = true;
    return this;
  }
  setFooterCloseButton(closeText = "") {
    if ("" === closeText) {
      closeText = this.closeText;
    }
    return this.setFooter('<button type="button" class="btn btn-primary modalizer-close">' + closeText + "</button>");
  }
  setHeader(header) {
    this.header = header;
    return this;
  }
  setContent(content) {
    this.content = content;
    return this;
  }
  setFooter(footer) {
    this.footer = footer;
    return this;
  }
  withMiddle() {
    const element = this.getElement();
    this.getElement().addClass("layer-middle");
    return this;
  }
  setOnShowTimeout(timeout) {
    this.onShowTimeout = timeout;
    return this;
  }
  getElement() {
    if (!this.$element) {
      const newElementAttrs = {
        class: "layer",
        id: "Layer-" + this.id,
        role: "dialog"
      };
      for (const key in this.data) {
        newElementAttrs["data-" + key] = this.data[key];
      }
      if (this.aria.title) {
        newElementAttrs["aria-title"] = this.aria.title;
      }
      if (this.aria.description) {
        newElementAttrs["aria-description"] = this.aria.description;
      }
      this.$element = import_jizy_dom.default.create("div", newElementAttrs);
      let html = "";
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
        this.$element.addClass("layer-" + this.size);
      }
      if (this.theme) {
        this.$element.addClass("layer-" + this.theme);
      }
    }
    return this.$element;
  }
};

// src/Modal.ts
var import_jizy_dom2 = __toESM(require("jizy-dom"));
var Modal = class {
  closeButtonText;
  ignoreBackdropClick;
  layers;
  shown;
  $body;
  $backdrop;
  $element;
  constructor() {
    this.closeButtonText = "Close";
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
      this.$backdrop = import_jizy_dom2.default.create("div", { className: "modalizer-backdrop" });
      this.$body?.append(this.$backdrop);
    }
    return this.$backdrop;
  }
  getElement() {
    if (!this.$element) {
      this.$element = import_jizy_dom2.default.create("div", { className: "modalizer", tabindex: "-1", role: "dialog" });
      this.getBackdrop().before(this.$element);
    }
    return this.$element;
  }
  show(layer) {
    this.$body = import_jizy_dom2.default.instance("body");
    const bodyIsOverflowing = document.body.clientWidth < window.innerWidth;
    this.getElement().scrollTop(0);
    if (this.layers.length > 0) {
      this.layers.forEach((layer2) => layer2.hide());
    } else {
      this.$body.addClass("modalizer-open");
      if (bodyIsOverflowing) {
        this.$body.addClass("modalizer-overflowing");
      }
      this.getBackdrop().addClass("in");
      window.addEventListener("resize", () => {
        this.onResize();
      });
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
    this.layers.pop()?.destroy();
    this.layers[this.layers.length - 1]?.show(true);
  }
  destroy() {
    if (!this.shown) return;
    while (this.layers.length) {
      this.layers.pop()?.destroy();
    }
    this.$element?.removeClass("in");
    this.$backdrop?.removeClass("in");
    this.$body?.removeClass("modalizer-open modalizer-overflowing");
    setTimeout(() => {
      this.reset();
    }, 300);
  }
  reset() {
    this.$element?.remove();
    this.$backdrop?.remove();
    this.layers = [];
    this.shown = false;
    this.ignoreBackdropClick = false;
    this.$backdrop = null;
    this.$element = null;
  }
  onResize() {
  }
};

// src/Modalizer.ts
var Modalizer = class extends Modal {
  layers = [];
  closeButtonText = "";
  uidCounter = 0;
  // Counter for generating unique IDs
  isShown() {
    return this.shown;
  }
  addLayer(name, config, replace) {
    if (replace && this.layers.length > 0) {
      this.layers.pop()?.destroy();
    }
    const layerId = `layer-${++this.uidCounter}`;
    const layer = new Layer(layerId, name, this.layers.length + 1);
    layer.setSize(config.size || "").setTheme(config.theme || "").setHeader(config.header || "").setContent(config.content || "").setFooter(config.footer || "").setCloseText(config.closeText || this.closeButtonText).setFooterCloseButton(config.footerCloseButton || "").setAriaTitle(config.ariaTitle || "").setAriaDescription(config.ariaDescription || "");
    if (config.onShow) {
      layer.setOnShow(config.onShow);
    }
    if (config.onHide) {
      layer.setOnHide(config.onHide);
    }
    this.show(layer);
    return layer;
  }
};
var Modalizer_default = Modalizer;

// src/index.ts
var index_default = Modalizer_default;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Layer,
  Modal,
  Modalizer
});
