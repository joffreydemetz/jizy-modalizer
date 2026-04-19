/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';

let Modalizer;

beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    delete window.Modalizer;
    const Cls = (await import('../lib/js/Modalizer.js')).default;
    Modalizer = new Cls();
    window.Modalizer = Modalizer;
});

describe('Modalizer public facade', () => {
    test('addComponent returns a Component with fluent setters', () => {
        const c = Modalizer.addComponent('content');
        expect(typeof c.setBasePath).toBe('function');
        expect(typeof c.setTrackerPath).toBe('function');
        expect(typeof c.setOtherHashes).toBe('function');
        expect(typeof c.setLayerConfig).toBe('function');

        const ret = c.setBasePath('/x/').setTrackerPath('/y/').setLayerConfig({ lg: true });
        expect(ret).toBe(c);
        expect(c.basePath).toBe('/x/');
        expect(c.trackerPath).toBe('/y/');
        expect(c.layerConfig).toEqual({ lg: true });
    });

    test('addComponent registers content/json/html types', () => {
        const a = Modalizer.addComponent('content');
        const b = Modalizer.addComponent('json', 'json');
        const c = Modalizer.addComponent('html', 'html');
        expect(a.constructor.name).toBe('ContentComponent');
        expect(b.constructor.name).toBe('JsonComponent');
        expect(c.constructor.name).toBe('HtmlComponent');
    });

    test('addComponent is idempotent on the same name', () => {
        const a = Modalizer.addComponent('content');
        const b = Modalizer.addComponent('content');
        expect(a).toBe(b);
    });

    test('setOtherHashes appends to hashVars and validates input', () => {
        const c = Modalizer.addComponent('json', 'json').setOtherHashes(['mp']);
        expect(c.hashVars).toEqual(['json', 'mp']);
        expect(() => c.setOtherHashes('mp')).toThrow();
    });

    test('ready() is idempotent', () => {
        Modalizer.ready();
        Modalizer.ready();
        expect(Modalizer._ready).toBe(true);
    });
});

describe('Component path matching', () => {
    test('checkPath matches basePath prefix', () => {
        const c = Modalizer.addComponent('json', 'json').setBasePath('/mdzr/json/');
        expect(c.checkPath('/mdzr/json/page2/')).toBe(true);
        expect(c.checkPath('/mdzr/other/')).toBe(false);
    });

    test('parseHashVars extracts the value segment', () => {
        const c = Modalizer.addComponent('json', 'json').setBasePath('/mdzr/json/');
        expect(c.parseHashVars('/mdzr/json/page2/')).toMatchObject({ value: 'page2', json: 'page2' });
        expect(c.parseHashVars('/wrong/path/')).toBe(false);
    });
});

describe('addLayer', () => {
    test('creates and stacks a layer', () => {
        const layer = Modalizer.addLayer('foo', { content: '<p>hi</p>' });
        expect(layer.name).toBe('foo');
        expect(layer.content).toBe('<p>hi</p>');
        expect(Modalizer.layers.getCurrent()).toBe(layer);
    });

    test('replace=true swaps the top layer', () => {
        const a = Modalizer.addLayer('a', { content: 'a' });
        const b = Modalizer.addLayer('b', { content: 'b' }, true);
        expect(Modalizer.layers.getCurrent()).toBe(b);
        expect(Modalizer.layers.layers).not.toContain(a);
    });
});
