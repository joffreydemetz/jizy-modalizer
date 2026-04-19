let currentLayerElevation = 0;

function extend() {
    const result = {};
    for (let i = 0; i < arguments.length; i++) {
        const attributes = arguments[i];
        for (const key in attributes) {
            result[key] = attributes[key];
        }
    }
    return result;
}

const LAYER_DEFAULTS = {
    size: '',
    theme: '',
    header: '',
    footer: '',
    content: '',
    ariaTitle: '',
    ariaDescription: '',
    closeText: '',
    closeIcon: false,
    middle: false,
    footerCloseButton: false,
    data: null,
    onBeforeShow: null,
    onShow: null,
    onShowTimeout: 500,
    onHide: null,
    params: null
};

export default class Layer {
    constructor(name, config) {
        config = extend(LAYER_DEFAULTS, config || {});

        this.name = name;
        this.elevation = ++currentLayerElevation;
        this.id = Layer.getAvailableUID();

        this.$element = null;

        this.modal = null;
        this.header = config.header || '';
        this.title = config.title || '';
        this.content = config.content || '';
        this.footer = config.footer || null;
        this.size = config.size || '';
        this.theme = config.theme || '';
        this.closeText = config.closeText || 'Close';
        this.closeIcon = config.closeIcon || false;
        this.middle = config.middle || false;
        this.visible = config.visible || false;
        this.onShowTimeout = config.onShowTimeout || 500;
        this.onBeforeShow = config.onBeforeShow || null;
        this.onAfterShow = config.onAfterShow || null;
        this.onShow = config.onShow || null;
        this.onUpdate = config.onUpdate || null;
        this.onHide = config.onHide || null;
        // this.onBackdropClose = config.onBackdropClose || null;

        this.aria = {
            title: config.ariaTitle || config.title || '',
            description: config.ariaDescription || ''
        };

        this.data = {
            alias: this.name,
            elevation: this.elevation
        };

        if (config.data) {
            this.data = extend({}, this.data, config.data);
        }

        if (config.params) {
            for (const key in config.params) {
                this.data[key] = config.params[key];
            }
        }

        if (config.footerCloseButton) {
            this.footer = '<button type="button" class="btn btn-primary modalizer-close">' + this.closeText + '</button>';
        }
    }

    static getAvailableUID() {
        let id = '';
        do {
            id += ~~(Math.random() * 1000000);
        }
        while (document.getElementById('Layer-' + id));

        return id;
    }

    setData(key, value) {
        this.data[key] = value;
        return this;
    }

    getElement() {
        if (!this.$element) {
            this.$element = document.createElement('div');
            this.$element.className = 'layer';
            this.$element.id = 'Layer-' + this.id;
            this.$element.setAttribute('role', 'dialog');
            for (const key in this.data) {
                this.$element.setAttribute('data-' + key, this.data[key]);
            }
            if ('' !== this.aria.title) {
                this.$element.setAttribute('aria-title', this.aria.title);
            }
            if ('' !== this.aria.description) {
                this.$element.setAttribute('aria-description', this.aria.description);
            }

            let html = '';
            if (true === this.closeIcon) {
                html += '<a href="#" class="closer modalizer-close" role="button" aria-label="' + this.closeText + '">';
                html += ' <span aria-hidden="true">&times;</span>';
                html += ' <span class="sr-only">' + this.closeText + '</span>';
                html += '</a>';
            }
            if (this.header) {
                html += ' <header>' + this.header + '</header>';
            }
            html += ' <section>' + this.content + '</section>';
            if (this.footer) {
                html += ' <footer>' + this.footer + '</footer>';
            }
            this.$element.innerHTML = html;

            if ('' !== this.size) {
                this.$element.classList.add('layer-' + this.size);
            }

            if ('' !== this.theme) {
                this.$element.classList.add('layer-' + this.theme);
            }
        }

        return this.$element;
    }

    show(again) {
        if (false === this.visible) {
            if (true === this.middle) {
                this.modal.getElement().classList.add('middle');
            }

            if (null !== this.onBeforeShow) {
                this.onBeforeShow(this);
            }

            if (false === again) {
                this.getElement().classList.add("in");
                this.getElement().classList.remove("out");

                if (null !== this.onShow) {
                    setTimeout(() => { this.onShow(this); }, this.onShowTimeout);
                }
            }
            else {
                if (null !== this.onUpdate) {
                    this.onUpdate(this);
                }
                this.getElement().classList.add("back-in");
                this.getElement().classList.remove("out");
            }

            if (null !== this.onAfterShow) {
                this.onAfterShow(this);
            }
        }

        this.visible = true;
    }

    addData(data) {
        this.data = extend({}, this.data, data);
    }

    hide() {
        if (true === this.middle) {
            this.modal.getElement().classList.remove('middle');
        }

        if (true === this.visible) {
            this.getElement().classList.remove("in");
            this.getElement().classList.add("out");
        }

        this.visible = false;
    }

    destroy() {
        this.hide();
        if (this.onHide) {
            this.onHide(this);
        }
        setTimeout(() => { this.getElement().remove(); }, 550);
    }

    resize(size) {
        if (this.$element) {
            if ('' !== this.size && this.size !== size) {
                this.$element.classList.remove('layer-' + this.size);
            }

            if (size) {
                this.$element.classList.add('layer-' + size);
            }
        }

        this.size = size;

        return this;
    }
};
