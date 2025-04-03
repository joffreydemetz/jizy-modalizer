import { jDOMcreate } from '../index.js';

let currentLayer = 0;

function getAvailableUID() {
	let id = '';
	do {
		id += ~~(Math.random() * 1000000);
	} while (document.getElementById('Layer-' + id));

	return id;
}

class Layer {
	constructor(name) {
		this.name = name;
		this.elevation = ++currentLayer;
		this.id = getAvailableUID();
		this.closeText = 'Close';

		this.$element = null;
		this.modal = null;
		this.header = null;
		this.content = '';
		this.footer = null;
		this.size = '';
		this.theme = '';
		this.closeIcon = false;
		this.middle = false;
		this.visible = false;
		this.onShowTimeout = 500;

		this.data = { alias: this.name, elevation: this.elevation };
		this.aria = { title: '', description: '' };

		// Event handlers
		this.onBeforeShow = null;
		this.onShow = null;
		this.onUpdate = null;
		this.onHide = null;
	}

	setCloseText(str) { this.closeText = str; return this; }
	withCloseIcon(closeIcon) { this.closeIcon = closeIcon; return this; }
	setFooterCloseButton() { return this.setFooter('<button type="button" class="btn btn-primary modalizer-close">' + this.closeText + '</button>'); }
	setHeader(header) { this.header = header; return this; }
	setContent(content) { this.content = content; return this; }
	setData(key, value) { this.data[key] = value; return this; }
	setAriaTitle(title) { this.aria.title = title; return this; }
	setAriaDescription(description) { this.aria.description = description; return this; }
	setFooter(footer) { this.footer = footer; return this; }
	setSize(size) { this.size = size; return this; }
	setTheme(theme) { this.theme = theme; return this; }
	withMiddle() { this.middle = true; return this; }
	setOnBeforeShow(onBeforeShow) { this.onBeforeShow = onBeforeShow; return this; }
	setOnShow(onShow) { this.onShow = onShow; return this; }
	setOnUpdate(onUpdate) { this.onUpdate = onUpdate; return this; }
	setOnShowTimeout(onShowTimeout) { this.onShowTimeout = onShowTimeout; return this; }
	setOnHide(onHide) { this.onHide = onHide; return this; }

	getElement() {
		if (!this.$element) {
			const newElementAttrs = {
				className: 'layer',
				id: 'Layer-' + this.id,
				role: 'dialog',
			};
			for (let key in this.data) { newElementAttrs['data-' + key] = this.data[key]; }
			if (this.aria.title) { newElementAttrs['aria-title'] = this.aria.title; }
			if (this.aria.description) { newElementAttrs['aria-description'] = this.aria.description; }

			this.$element = jDOMcreate('div', newElementAttrs);

			let html = '';
			if (this.closeIcon) {
				html += '<button type="button" class="closer modalizer-close"><span aria-hidden="true">&times;</span><span class="sr-only">' + this.closeText + '</span></button>';
			}
			if (this.header) { html += '<header>' + this.header + '</header>'; }
			html += '<section>' + this.content + '</section>';
			if (this.footer) { html += '<footer>' + this.footer + '</footer>'; }
			this.$element.html(html);

			if (this.size) { this.$element.addClass('layer-' + this.size); }
			if (this.theme) { this.$element.addClass('layer-' + this.theme); }
		}

		return this.$element;
	}

	show(again) {
		if (!this.visible) {
			if (this.middle) { this.modal.getElement().addClass('middle'); }

			if (this.onBeforeShow) { this.onBeforeShow(this); }

			if (!again) {
				this.getElement().addClass("in").removeClass("out");

				if (this.onShow) {
					setTimeout(() => { this.onShow(this); }, this.onShowTimeout);
				}
			} else {
				if (this.onUpdate) { this.onUpdate(this); }
				this.getElement().addClass("back-in").removeClass("out");
			}
		}
		this.visible = true;
	}

	hide() {
		if (this.middle) { this.modal.getElement().removeClass('middle'); }
		if (this.visible) { this.getElement().removeClass("in").addClass("out"); }
		this.visible = false;
	}

	destroy() {
		this.hide();
		if (this.onHide) { this.onHide(this); }
		setTimeout(() => { this.getElement().remove(); }, 550);
	}

	addData(data) {
		this.data = { ...this.data, ...data };
	}

	resize(size) {
		if (this.$element) {
			if (this.size && this.size !== size) { this.$element.removeClass('layer-' + this.size); }
			if (size) { this.$element.addClass('layer-' + size); }
		}
		this.size = size;
		return this;
	}
}

export default Layer;
