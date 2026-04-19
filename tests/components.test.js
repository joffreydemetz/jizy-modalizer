/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';

let Modalizer;

beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    delete window.Modalizer;
    global.fetch = jest.fn();
    const Cls = (await import('../lib/js/Modalizer.js')).default;
    Modalizer = new Cls();
    window.Modalizer = Modalizer;
});

describe('ContentComponent', () => {
    test('renders content from a DOM element by id', () => {
        document.body.innerHTML = '<div id="page-1" data-mdzr-title="Page 1"><p>hello</p></div>';

        const c = Modalizer.addComponent('content').setBasePath('/mdzr/content/');
        c.trigger({ value: 'page-1' });

        const layer = Modalizer.layers.getCurrent();
        expect(layer).toBeTruthy();
        expect(layer.content).toBe('<p>hello</p>');
        expect(layer.aria.title).toBe('Page 1');
    });

    test('throws when the target element does not exist', () => {
        const c = Modalizer.addComponent('content');
        expect(() => c.trigger({ value: 'missing' })).toThrow(/No content found/);
    });
});

describe('JsonComponent', () => {
    test('fetches fetchBase + value + fetchExt and shows a layer', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ title: 'JSON Title', content: '<p>json-body</p>' }),
        });

        const c = Modalizer.addComponent('json', 'json')
            .setBasePath('/mdzr/json/')
            .setFetchBase('./json/')
            .setFetchExt('.json');
        await c.trigger({ value: 'page2' });

        expect(global.fetch).toHaveBeenCalledWith('./json/page2.json');
        const layer = Modalizer.layers.getCurrent();
        expect(layer.content).toBe('<p>json-body</p>');
        expect(layer.aria.title).toBe('JSON Title');
    });

    test('falls back to basePath when fetchBase not set', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ content: '<p>ok</p>' }),
        });

        const c = Modalizer.addComponent('json', 'json').setBasePath('/mdzr/json/');
        await c.trigger({ value: 'page2' });

        expect(global.fetch).toHaveBeenCalledWith('/mdzr/json/page2');
    });
});

describe('HtmlComponent', () => {
    test('fetches HTML and uses it as layer content', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            text: async () => '<section>hello html</section>',
        });

        const c = Modalizer.addComponent('html', 'html')
            .setBasePath('/mdzr/html/')
            .setFetchBase('./html/')
            .setFetchExt('.html');
        await c.trigger({ value: 'page3' });

        expect(global.fetch).toHaveBeenCalledWith('./html/page3.html');
        const layer = Modalizer.layers.getCurrent();
        expect(layer.content).toBe('<section>hello html</section>');
    });
});

describe('Component.getFetchUrl', () => {
    test('uses basePath when fetchBase is null', () => {
        const c = Modalizer.addComponent('json', 'json').setBasePath('/a/');
        expect(c.getFetchUrl('x')).toBe('/a/x');
    });

    test('uses fetchBase + fetchExt when set', () => {
        const c = Modalizer.addComponent('json', 'json')
            .setBasePath('/a/')
            .setFetchBase('./b/')
            .setFetchExt('.json');
        expect(c.getFetchUrl('x')).toBe('./b/x.json');
    });
});
