/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';

let Modalizer;

beforeEach(async () => {
    jest.resetModules();
    jest.restoreAllMocks();
    document.body.innerHTML = '';
    document.body.className = '';
    delete window.Modalizer;
    window.history.replaceState(null, '', '/');
    const Cls = (await import('../lib/js/Modalizer.js')).default;
    Modalizer = new Cls();
    window.Modalizer = Modalizer;
});

afterEach(() => {
    // Every instance keeps its document keydown listener: leave this one with
    // nothing open, so it ignores the Escapes of the next tests.
    Modalizer.layers.hideAll();
    jest.restoreAllMocks();
});

const escape = (init = {}) => {
    const e = new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true, ...init });
    document.dispatchEvent(e);
    return e;
};
const names = () => Modalizer.layers.layers.map((l) => l.name);

describe('Escape on plain layers', () => {
    test('closes the top layer only, then the last one', () => {
        Modalizer.addLayer('a', { content: 'a' });
        Modalizer.addLayer('b', { content: 'b' });

        const e = escape();
        expect(e.defaultPrevented).toBe(true);
        expect(names()).toEqual(['a']);

        escape();
        expect(names()).toEqual([]);
        expect(document.body.classList.contains('modalizer-open')).toBe(false);
    });

    test('closeOnEscape: false keeps the layer (and the ones below) open', () => {
        Modalizer.addLayer('a', { content: 'a' });
        Modalizer.addLayer('b', { content: 'b', closeOnEscape: false });

        const e = escape();
        expect(e.defaultPrevented).toBe(false);
        expect(names()).toEqual(['a', 'b']);

        Modalizer.hide();          // an explicit close still works…
        escape();                  // …and Escape applies again to the layer below
        expect(names()).toEqual([]);
    });

    test('closeAllOnEscape: true on the top layer closes the whole stack', () => {
        Modalizer.addLayer('a', { content: 'a' });
        Modalizer.addLayer('b', { content: 'b' });
        Modalizer.addLayer('c', { content: 'c', closeAllOnEscape: true });

        escape();
        expect(names()).toEqual([]);
    });

    test('ignores other keys, consumed Escapes and an empty stack', () => {
        Modalizer.addLayer('a', { content: 'a' });

        document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(names()).toEqual(['a']);

        const inner = document.createElement('input');
        Modalizer.layers.getCurrent().getElement().append(inner);
        inner.addEventListener('keydown', (e) => e.preventDefault());
        inner.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
        expect(names()).toEqual(['a']);

        Modalizer.layers.hideAll();
        expect(() => escape()).not.toThrow();
    });

    test('the confirm dialog: Escape cancels without calling back', async () => {
        const fs = await import('node:fs');
        new Function(fs.readFileSync(new URL('../lib/js/plugins/confirm.js', import.meta.url), 'utf8'))();
        const callback = jest.fn();

        Modalizer.confirm(null, { content: 'Sure?', callback });
        escape();

        expect(names()).toEqual([]);
        expect(callback).not.toHaveBeenCalled();
    });
});

describe('Escape on component layers (history)', () => {
    const setup = (layerConfig = {}) => {
        document.body.innerHTML = '<div id="one"><p>1</p></div><div id="two"><p>2</p></div>';
        Modalizer.addComponent('content').setBasePath('/mdzr/content/').setLayerConfig(layerConfig);
        Modalizer.ready();
    };

    test('steps back one entry and closes just the top layer', () => {
        setup();
        Modalizer.getComponent('content').trigger({ value: 'one' });
        Modalizer.getComponent('content').trigger({ value: 'two' });
        const back = jest.spyOn(window.history, 'back').mockImplementation(() => {});

        escape();
        expect(back).toHaveBeenCalledTimes(1);
        escape();                                  // back already on its way: ignored
        expect(back).toHaveBeenCalledTimes(1);

        window.dispatchEvent(new window.PopStateEvent('popstate', {
            state: { modalizer: true, key: 'content', value: 'one' },
        }));
        expect(names()).toEqual(['content.one']);
    });

    test('closeAllOnEscape unwinds every pushed entry at once', () => {
        setup({ closeAllOnEscape: true });
        Modalizer.getComponent('content').trigger({ value: 'one' });
        Modalizer.getComponent('content').trigger({ value: 'two' });
        const go = jest.spyOn(window.history, 'go').mockImplementation(() => {});

        escape();
        expect(go).toHaveBeenCalledWith(-2);

        // Even landing on a modalizer state, the requested close-all wins.
        window.dispatchEvent(new window.PopStateEvent('popstate', {
            state: { modalizer: true, key: 'content', value: 'zero' },
        }));
        expect(names()).toEqual([]);
    });

    test('a deep-linked layer (no pushed entry) closes in place and drops the hash', () => {
        document.body.innerHTML = '<div id="one"><p>1</p></div>';
        window.history.replaceState(null, '', '/page?x=1#!content=one');
        Modalizer.addComponent('content').setBasePath('/mdzr/content/');
        Modalizer.ready();
        expect(names()).toEqual(['content.one']);
        const back = jest.spyOn(window.history, 'back');

        escape();
        expect(back).not.toHaveBeenCalled();
        expect(names()).toEqual([]);
        expect(window.location.hash).toBe('');
        expect(window.location.pathname + window.location.search).toBe('/page?x=1');
    });

    test('closeOnEscape: false via setLayerConfig', () => {
        setup({ closeOnEscape: false });
        Modalizer.getComponent('content').trigger({ value: 'one' });
        const back = jest.spyOn(window.history, 'back').mockImplementation(() => {});

        escape();
        expect(back).not.toHaveBeenCalled();
        expect(names()).toEqual(['content.one']);
    });
});
