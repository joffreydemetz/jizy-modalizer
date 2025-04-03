import { Layer } from './lib/Layer';
import { Modal } from './lib/Modal';
import { Modalizer } from './lib/Modalizer';

import { 
    // jDOM, 
    // Selector, 
    // domUtils, 
    DOM,
    jDOM,
    // jDOMplugin,
    jDOMcreate,
    extendDOMAttributes, extendDOMManipulation, extendDOMAccess, 
	extendDOMMisc, extendDOMContents
    // , 
	// extendDOMTraversal, extendDOMEvents, 
    // extendDOMAnimations, extendDOMSwipe 
} from 'jizy-dom';

extendDOMAttributes(DOM);
extendDOMManipulation(DOM);
extendDOMAccess(DOM);
extendDOMMisc(DOM);
// extendDOMTraversal(DOM);
extendDOMContents(DOM);
// extendDOMEvents(DOM);
// extendDOMAnimations(DOM);
// extendDOMSwipe(DOM);

const JizyModalizer = {
	Modalizer: Modalizer,
	Modal: Modal,
	Layer: Layer,
	jDOM: jDOM,
	jDOMcreate: jDOMcreate
};

export default JizyModalizer;
