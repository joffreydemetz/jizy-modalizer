import { Modal } from './Modal.js';
import { Layer } from './Layer.js';
const Modalizer = new Modal();
Modalizer.isShown = function () {
  return this.shown;
};
Modalizer.addLayer = function (name, config, replace) {
  if (replace) {
    this.layers.pop().destroy();
  }
  const layer = new Layer(name);
  layer.setSize(config.size || '').setTheme(config.theme || '').setHeader(config.header || '').setContent(config.content || '').setFooter(config.footer || '').setCloseText(config.closeText || this.closeButtonText).setFooterCloseButton(config.footerCloseButton).setAriaTitle(config.ariaTitle || '').setAriaDescription(config.ariaDescription || '');
  if (config.onShow) {
    layer.setOnShow(config.onShow);
  }
  if (config.onHide) {
    layer.setOnHide(config.onHide);
  }
  this.show(layer);
  return layer;
};
export default Modalizer;