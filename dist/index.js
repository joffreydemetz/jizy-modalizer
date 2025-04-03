import { Layer } from './lib/Layer';
import { Modal } from './lib/Modal';
import { Modalizer } from './lib/Modalizer';
import { DOM, jDOM, jDOMcreate, extendDOMAttributes, extendDOMManipulation, extendDOMAccess, extendDOMMisc, extendDOMContents } from '@jizy/jizy-dom';

// Extend DOM functionality
extendDOMAttributes(DOM);
extendDOMManipulation(DOM);
extendDOMAccess(DOM);
extendDOMMisc(DOM);
extendDOMContents(DOM);

// Export individual components and extensions
export { Layer, Modal, Modalizer, jDOM, jDOMcreate };

// Default export for convenience
export default {
  Layer,
  Modal,
  Modalizer,
  jDOM,
  jDOMcreate
};