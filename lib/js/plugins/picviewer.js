/**
 * Picture viewer — an OPTIONAL Modalizer plugin: a full-viewport image lightbox
 * with a prev/next slider. Not part of the core dist.
 *
 * Delivered as a raw script loaded AFTER the core jizy-modalizer dist (which
 * exposes the global `Modalizer` instance), so it extends that instance directly
 * — no import, no bundling. Selected per-site via `modalizerPlugins: [picviewer]`;
 * jizy-builder concatenates this file + ships dist/css/plugins/picviewer.css.
 * The jizy-dom `picviewer` plugin is an optional proxy that gathers
 * [data-zoom] / [data-gallery] images and hands them here.
 *
 * Self-contained: no jDOM, no icon font (arrows are pure-CSS triangles).
 * Navigation is in-place — the image is swapped inside the open layer; the figure
 * sits directly in the layer's `<section>` (position:relative) so the absolute
 * arrows always hug the image.
 *
 *   Modalizer.picviewer({ src: '/big.jpg', alt: 'A photo' });
 *   Modalizer.picviewer([{ src, alt, caption }, …], 2);                 // gallery, start at #2
 *   Modalizer.picviewer(document.querySelectorAll('[data-gallery] img')); // from the DOM
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
(function () {
    'use strict';

    if (typeof Modalizer === 'undefined') {
        return;
    }

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

    Modalizer.picviewer = function (items, index, params) {
        const cfg = Object.assign({ theme: 'pic-viewer' }, params || {});

        // A function is a live source, re-read before every move.
        const source = typeof items === 'function' ? items : null;
        let list = pvNormalize(source ? source() : items);
        if (!list.length) {
            return null;
        }

        let current = pvClamp(parseInt(index, 10) || 0, 0, list.length - 1);
        const many = list.length > 1;
        let keyHandler = null;
        let shown = null;

        // Re-read a live source, keeping the current picture: in place when the
        // list only grew (the usual "load more"), else found again by its src.
        function sync() {
            if (!source) return;
            const src = list[current].src;
            const fresh = pvNormalize(source());
            if (!fresh.length) return;
            list = fresh;
            if (list[current] && list[current].src === src) return;
            for (let i = 0; i < list.length; i++) {
                if (list[i].src === src) {
                    current = i;
                    return;
                }
            }
            current = pvClamp(current, 0, list.length - 1);
        }

        function changed() {
            if (shown && typeof cfg.onChange === 'function') {
                cfg.onChange(current, list.length, shown);
            }
        }

        function prevIndex() { sync(); return (current - 1 + list.length) % list.length; }
        function nextIndex() { sync(); return (current + 1) % list.length; }

        function render(root) {
            const figure = root.querySelector('section figure');
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
            changed();
        }

        function makeArrow(dir, root) {
            const el = document.createElement('div');
            el.className = dir;
            el.setAttribute('role', 'button');
            el.setAttribute('aria-label', dir === 'prev' ? (cfg.prevLabel || 'Previous') : (cfg.nextLabel || 'Next'));
            el.addEventListener('click', (e) =>  {
                e.preventDefault();
                goTo(dir === 'prev' ? prevIndex() : nextIndex(), root);
            });
            return el;
        }

        function buildNav(root) {
            const section = root.querySelector('section');
            if (!section) return;

            section.insertBefore(makeArrow('prev', root), section.firstChild);
            section.appendChild(makeArrow('next', root));

            // Touch swipe — the only navigation on small screens, where the CSS hides the arrows.
            let startX = null;
            section.addEventListener('touchstart', function (e) {
                startX = e.touches[0].clientX;
            }, { passive: true });
            section.addEventListener('touchend', function (e) {
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

        return this.addLayer('picture', {
            content: figureHtml,
            theme: cfg.theme,
            ariaTitle: first.alt || '',
            middle: true,
            closeIcon: true,
            closeOnEscape: cfg.closeOnEscape,
            closeAllOnEscape: cfg.closeAllOnEscape,
            onShowTimeout: 50,
            onShow: function (layer) {
                shown = layer;
                if (many) {
                    buildNav(layer.getElement());
                }
                if (typeof cfg.onShow === 'function') {
                    cfg.onShow(layer);
                }
                changed();
            },
            onHide: function (layer) {
                if (keyHandler) {
                    document.removeEventListener('keydown', keyHandler);
                    keyHandler = null;
                }
                if (typeof cfg.onHide === 'function') {
                    cfg.onHide(layer);
                }
                shown = null;
            }
        });
    };
})();
