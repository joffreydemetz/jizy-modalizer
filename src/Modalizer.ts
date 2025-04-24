import Modal from './Modal.js';
import Layer from './Layer.js';

interface LayerConfig {
  size?: string;
  theme?: string;
  header?: string;
  content?: string;
  footer?: string;
  closeText?: string;
  footerCloseButton?: string;
  ariaTitle?: string;
  ariaDescription?: string;
  onShow?: () => void;
  onHide?: () => void;
}

class Modalizer extends Modal {
  closeButtonText: string = '';
  private uidCounter: number = 0; // Counter for generating unique IDs
    
  isShown(): boolean {
    return this.shown;
  }

  addLayer(name: string, config: LayerConfig, replace: boolean): Layer {
    if (replace && this.layers.length > 0) {
      this.layers.pop()?.destroy();
    }

    const layerId = `layer-${++this.uidCounter}`; 
    const layer = new Layer(layerId, name, this.layers.length + 1);

    layer.setSize(config.size || '')
      .setTheme(config.theme || '')
      .setHeader(config.header || '')
      .setContent(config.content || '')
      .setFooter(config.footer || '')
      .setCloseText(config.closeText || this.closeButtonText)
      .setFooterCloseButton(config.footerCloseButton || '')
      .setAriaTitle(config.ariaTitle || '')
      .setAriaDescription(config.ariaDescription || '');

    if (config.onShow) {
      layer.setOnShow(config.onShow);
    }
    if (config.onHide) {
      layer.setOnHide(config.onHide);
    }

    this.show(layer);
    return layer;
  }
}

export default Modalizer;
