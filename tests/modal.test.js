/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';

let Modalizer;

beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    document.body.className = '';
    delete window.Modalizer;
    const Cls = (await import('../lib/js/Modalizer.js')).default;
    Modalizer = new Cls();
    window.Modalizer = Modalizer;
});

describe('Modal host', () => {
    test('addLayer mounts layer element into .modalizer container', () => {
        const layer = Modalizer.addLayer('foo', { content: '<p>hi</p>' });
        const host = document.querySelector('.modalizer');
        const backdrop = document.querySelector('.modalizer-backdrop');

        expect(host).not.toBeNull();
        expect(backdrop).not.toBeNull();
        expect(host.contains(layer.getElement())).toBe(true);
        expect(document.body.classList.contains('modalizer-open')).toBe(true);
    });

    test('stacks multiple layers without recreating host', () => {
        Modalizer.addLayer('a', { content: 'a' });
        Modalizer.addLayer('b', { content: 'b' });
        const hosts = document.querySelectorAll('.modalizer');
        expect(hosts.length).toBe(1);
        expect(Modalizer.layers.layers.length).toBe(2);
    });

    test('opening a second layer hides the previous one (.out class)', () => {
        const a = Modalizer.addLayer('a', { content: 'a' });
        const b = Modalizer.addLayer('b', { content: 'b' });
        expect(a.getElement().classList.contains('out')).toBe(true);
        expect(a.getElement().classList.contains('in')).toBe(false);
        expect(b.getElement().classList.contains('in')).toBe(true);
    });

    test('Layers.hide() pops top and reveals previous', () => {
        const a = Modalizer.addLayer('a', { content: 'a' });
        Modalizer.addLayer('b', { content: 'b' });
        Modalizer.layers.hide();
        expect(Modalizer.layers.getCurrent()).toBe(a);
        expect(a.getElement().classList.contains('out')).toBe(false);
        expect(a.getElement().classList.contains('back-in')).toBe(true);
    });

    test('clicking backdrop (.modalizer.in) closes all layers and resets host', () => {
        Modalizer.addLayer('a', { content: 'a' });
        const host = document.querySelector('.modalizer');
        host.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        expect(Modalizer.layers.layers.length).toBe(0);
        expect(document.body.classList.contains('modalizer-open')).toBe(false);
    });

    test('picture viewer: noheader + nofooter + closeIcon render correctly', () => {
        Modalizer.addLayer('pic', {
            content: '<figure><img alt="x"/></figure>',
            size: 'fs',
            noheader: true,
            nofooter: true,
            closeIcon: true,
        });
        const layerEl = document.querySelector('.layer');
        expect(layerEl).not.toBeNull();
        expect(layerEl.querySelector('header')).toBeNull();
        expect(layerEl.querySelector('footer')).toBeNull();
        expect(layerEl.querySelector('.modalizer-close')).not.toBeNull();
        expect(layerEl.querySelector('figure img')).not.toBeNull();
        expect(layerEl.classList.contains('layer-fs')).toBe(true);
    });

    test('clicking a .modalizer-close button closes', () => {
        Modalizer.addLayer('a', { content: 'a', closeIcon: true });
        const closer = document.querySelector('.modalizer-close');
        expect(closer).not.toBeNull();
        closer.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        expect(Modalizer.layers.layers.length).toBe(0);
    });
});
