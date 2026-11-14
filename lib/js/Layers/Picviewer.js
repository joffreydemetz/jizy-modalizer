import Layer from '../Layer.js';

/**
 * Picture viewer layer — a Layer subclass: a full-viewport image lightbox with
 * a prev/next slider (pure-CSS arrows, keyboard, touch swipe). Self-contained:
 * no jDOM, no icon font. Navigation is in-place — the image is swapped inside
 * the open layer; the figure sits directly in the layer's `<section>`
 * (position:relative) so the absolute arrows always hug the image.
 *
 *   Modalizer.addLayer(new PicviewerLayer({ src: '/big.jpg', alt: 'A photo' }));
 *   Modalizer.addLayer(new PicviewerLayer([{ src, alt, caption }, …], 2));                 // gallery, start at #2
 *   Modalizer.addLayer(new PicviewerLayer(document.querySelectorAll('[data-gallery] img'))); // from the DOM
 *
 * `Modalizer.picviewer(items, index, params)` (plugins/picviewer.js) is the
 * one-liner for that (and returns null when there is nothing to show).
 *
 * Live galleries (a page that loads more pictures while the viewer is open):
 * pass `items` as a FUNCTION returning any of the shapes above. It is re-read
 * before every move, so appended pictures join the slider; the current picture
 * is kept by its src. `params.onChange(index, total, layer)` fires once the
 * viewer is shown and after every move — the hook to follow the slider in the
 * page (scroll the thumb into view) or to fetch the next page near the end.
 *
 *   Modalizer.picviewer(() => wall.querySelectorAll('img[data-zoom]'), 4, {
 *       onChange: (index, total) => { if (index >= total - 3) loadMore(); }
 *   });
 */

function clamp(n, min, max) {
    return n < min ? min : (n > max ? max : n);
}

function escAttr(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function toItem(it) {
    if (!it) return null;
    if (it.nodeType === 1) {
        return {
            src: it.getAttribute('data-zoom') || it.getAttribute('src') || '',
            alt: it.getAttribute('alt') || '',
            caption: it.getAttribute('data-caption') || ''
        };
    }
    if (typeof it === 'string') {
        return { src: it, alt: '', caption: '' };
    }
    return { src: it.src || '', alt: it.alt || '', caption: it.caption || '' };
}

function normalize(input) {
    if (!input) return [];

    let arr;
    if (Array.isArray(input)) {
        arr = input;
    }
    else if (typeof input === 'object' && input.nodeType === undefined && typeof input.length === 'number') {
        arr = Array.prototype.slice.call(input); // NodeList / array-like
    }
    else {
        arr = [input];
    }

    const out = [];
    for (let i = 0; i < arr.length; i++) {
        const item = toItem(arr[i]);
        if (item && item.src) {
            out.push(item);
        }
    }
    return out;
}

export default class PicviewerLayer extends Layer {
    /** `{src, alt, caption}` list from an item, a list, a NodeList or a string — items without src dropped. */
    static normalize(input) {
        return normalize(input);
    }

    constructor(items, index, params) {
        const cfg = Object.assign({ theme: 'pic-viewer' }, params || {});

        // A function is a live source, re-read before every move.
        const source = typeof items === 'function' ? items : null;
        const list = normalize(source ? source() : items);
        const current = list.length ? clamp(parseInt(index, 10) || 0, 0, list.length - 1) : 0;
        const first = list[current] || null;

        let figureHtml = '';
        if (first) {
            figureHtml = '<figure><img src="' + escAttr(first.src) + '" alt="' + escAttr(first.alt) + '" />';
            if (first.caption) {
                figureHtml += '<figcaption>' + first.caption + '</figcaption>';
            }
            figureHtml += '</figure>';
        }

        super('picture', {
            content: figureHtml,
            theme: cfg.theme,
            ariaTitle: (first && first.alt) || '',
            middle: true,
            closeIcon: true,
            closeOnEscape: cfg.closeOnEscape,
            closeAllOnEscape: cfg.closeAllOnEscape,
            onShowTimeout: 50,
            onBeforeShow: cfg.onBeforeShow,
            onShow: cfg.onShow,
            onHide: cfg.onHide
        });

        this.source = source;
        this.list = list;
        this.current = current;
        this.onChange = typeof cfg.onChange === 'function' ? cfg.onChange : null;
        this.prevLabel = cfg.prevLabel || 'Previous';
        this.nextLabel = cfg.nextLabel || 'Next';
        this._keyHandler = null;
        this._navBuilt = false;
        this._opened = false;
    }

    /** Index of the picture on screen. */
    getIndex() {
        return this.current;
    }

    /** Number of pictures (after a live source re-read). */
    getTotal() {
        return this.list.length;
    }

    /** Only a gallery (2+ pictures) gets arrows, keys and swipe. */
    hasMany() {
        return this.list.length > 1;
    }

    /**
     * Re-read a live source, keeping the current picture: in place when the
     * list only grew (the usual "load more"), else found again by its src.
     */
    sync() {
        if (!this.source || !this.list.length) return this;
        const src = this.list[this.current].src;
        const fresh = normalize(this.source());
        if (!fresh.length) return this;
        this.list = fresh;
        if (this.list[this.current] && this.list[this.current].src === src) return this;
        for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].src === src) {
                this.current = i;
                return this;
            }
        }
        this.current = clamp(this.current, 0, this.list.length - 1);
        return this;
    }

    prevIndex() {
        this.sync();
        return (this.current - 1 + this.list.length) % this.list.length;
    }

    nextIndex() {
        this.sync();
        return (this.current + 1) % this.list.length;
    }

    /** Swap the picture (and caption) in the open figure. */
    render() {
        const figure = this.getElement().querySelector('section figure');
        const item = this.list[this.current];
        if (!figure || !item) return this;

        const img = figure.querySelector('img');
        if (img) {
            img.setAttribute('src', item.src);
            img.setAttribute('alt', item.alt || '');
        }

        let cap = figure.querySelector('figcaption');
        if (item.caption) {
            if (!cap) {
                cap = document.createElement('figcaption');
                figure.appendChild(cap);
            }
            cap.innerHTML = item.caption;
        }
        else if (cap) {
            cap.parentNode.removeChild(cap);
        }
        return this;
    }

    goTo(index) {
        if (!this.list.length) return this;
        this.current = clamp(parseInt(index, 10) || 0, 0, this.list.length - 1);
        this.render();
        this._changed();
        return this;
    }

    prev() {
        return this.hasMany() ? this.goTo(this.prevIndex()) : this;
    }

    next() {
        return this.hasMany() ? this.goTo(this.nextIndex()) : this;
    }

    _changed() {
        if (this.visible && this.onChange) {
            this.onChange(this.current, this.list.length, this);
        }
    }

    _makeArrow(dir) {
        const el = document.createElement('div');
        el.className = dir;
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', dir === 'prev' ? this.prevLabel : this.nextLabel);
        el.addEventListener('click', (e) => {
            e.preventDefault();
            if (dir === 'prev') this.prev(); else this.next();
        });
        return el;
    }

    /** Arrows, touch swipe and the ArrowLeft/ArrowRight keys. Once. */
    buildNav() {
        if (this._navBuilt) return this;
        this._navBuilt = true;

        const section = this.getElement().querySelector('section');
        if (!section) return this;

        section.insertBefore(this._makeArrow('prev'), section.firstChild);
        section.appendChild(this._makeArrow('next'));

        // Touch swipe — the only navigation on small screens, where the CSS hides the arrows.
        let startX = null;
        section.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });
        section.addEventListener('touchend', (e) => {
            if (startX === null) return;
            const dx = e.changedTouches[0].clientX - startX;
            startX = null;
            if (Math.abs(dx) < 50) return;
            if (dx > 0) this.prev(); else this.next();
        }, { passive: true });

        this._keyHandler = (e) => {
            if (e.key === 'ArrowLeft' || e.keyCode === 37) {
                e.preventDefault();
                this.prev();
            }
            else if (e.key === 'ArrowRight' || e.keyCode === 39) {
                e.preventDefault();
                this.next();
            }
        };
        document.addEventListener('keydown', this._keyHandler);
        return this;
    }

    show(again) {
        const opening = !this._opened;
        this._opened = true;
        super.show(again);
        if (opening) {
            if (this.hasMany()) {
                this.buildNav();
            }
            this._changed();
        }
    }

    destroy() {
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
        super.destroy();
    }
}
