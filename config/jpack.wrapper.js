(function (global) {
    "use strict";

    if (typeof global !== "object" || !global || !global.document) {
        throw new Error("Modalizer requires a window with a document");
    }

    if (typeof global.Modalizer !== "undefined") {
        throw new Error("Modalizer is already defined");
    }

    // @CODE 

    global.Modalizer = new Modalizer();

})(typeof window !== "undefined" ? window : this);