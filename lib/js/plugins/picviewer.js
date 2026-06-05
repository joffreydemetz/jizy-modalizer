import Modalizer from '../Modalizer.js';

/**
 * Picture viewer — a full-viewport image lightbox with an optional prev/next
 * slider, callable from the built bundle as `Modalizer.picviewer(items, index, params)`.
 *
 * Self-contained: no jDOM, no icon font. It builds the .big-pic / figure / .prev /
 * .next markup that the plugin's LESS styles (arrows are pure-CSS triangles), and
 * wires click + keyboard + touch-swipe navigation. Navigation is in-place — the
 * image is swapped inside the open layer; the `.big-pic` shrinks to the picture via
 * flexbox, so the absolutely-positioned arrows always hug the image.
 *
 * The jizy-dom `picviewer` plugin is now just an optional proxy that gathers
 * [data-zoom] / [data-gallery] images and hands them here.
 *
 *   Modalizer.picviewer({ src: '/big.jpg', alt: 'A photo' });
 *   Modalizer.picviewer([{ src, alt, caption }, …], 2);                 // gallery, start at #2
 *   Modalizer.picviewer(document.querySelectorAll('[data-gallery] img')); // from the DOM
 */
function pvClamp(n, min, max) {
    return n < min ? min : (n > max ? max : n);
}

function pvEscAttr(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function pvToItem(it) {
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

function pvNormalize(input) {
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
        const item = pvToItem(arr[i]);
        if (item && item.src) {
            out.push(item);
        }
    }
    return out;
}

Modalizer.prototype.picviewer = function (items, index = 0, params = {}) {
    const self = this;
    const cfg = { theme: 'pic-viewer', ...params };

    const list = pvNormalize(items);
    if (!list.length) {
        return null;
    }

    let current = pvClamp(index | 0, 0, list.length - 1);
    const many = list.length > 1;
    let keyHandler = null;

    function prevIndex() { return (current - 1 + list.length) % list.length; }
    function nextIndex() { return (current + 1) % list.length; }

    function render(root) {
        const figure = root.querySelector('.big-pic figure');
        if (!figure) return;

        const item = list[current];
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
    }

    function goTo(idx, root) {
        current = idx;
        render(root);
    }

    function makeArrow(dir, root) {
        const el = document.createElement('div');
        el.className = dir;
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', dir === 'prev' ? (cfg.prevLabel || 'Previous') : (cfg.nextLabel || 'Next'));
        el.addEventListener('click', function (e) {
            e.preventDefault();
            goTo(dir === 'prev' ? prevIndex() : nextIndex(), root);
        });
        return el;
    }

    function buildNav(root) {
        const bigpic = root.querySelector('.big-pic');
        if (!bigpic) return;

        bigpic.insertBefore(makeArrow('prev', root), bigpic.firstChild);
        bigpic.appendChild(makeArrow('next', root));

        // Touch swipe — the only navigation on small screens, where the CSS hides the arrows.
        let startX = null;
        bigpic.addEventListener('touchstart', function (e) {
            startX = e.touches[0].clientX;
        }, { passive: true });
        bigpic.addEventListener('touchend', function (e) {
            if (startX === null) return;
            const dx = e.changedTouches[0].clientX - startX;
            startX = null;
            if (Math.abs(dx) < 50) return;
            goTo(dx > 0 ? prevIndex() : nextIndex(), root);
        }, { passive: true });

        keyHandler = function (e) {
            if (e.key === 'ArrowLeft' || e.keyCode === 37) {
                e.preventDefault();
                goTo(prevIndex(), root);
            }
            else if (e.key === 'ArrowRight' || e.keyCode === 39) {
                e.preventDefault();
                goTo(nextIndex(), root);
            }
        };
        document.addEventListener('keydown', keyHandler);
    }

    const first = list[current];
    let figureHtml = '<figure><img src="' + pvEscAttr(first.src) + '" alt="' + pvEscAttr(first.alt) + '" />';
    if (first.caption) {
        figureHtml += '<figcaption>' + first.caption + '</figcaption>';
    }
    figureHtml += '</figure>';

    return self.addLayer('picture', {
        content: '<div class="big-pic">' + figureHtml + '</div>',
        theme: cfg.theme,
        ariaTitle: first.alt || '',
        middle: true,
        closeIcon: true,
        onShowTimeout: 50,
        onShow: function (layer) {
            if (many) {
                buildNav(layer.getElement());
            }
            if (typeof cfg.onShow === 'function') {
                cfg.onShow(layer);
            }
        },
        onHide: function (layer) {
            if (keyHandler) {
                document.removeEventListener('keydown', keyHandler);
                keyHandler = null;
            }
            if (typeof cfg.onHide === 'function') {
                cfg.onHide(layer);
            }
        }
    });
};
