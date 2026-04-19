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
    jest.restoreAllMocks();
});

describe('URL fragment history', () => {
    test('opening a component layer pushes #!name=value', () => {
        document.body.innerHTML = '<div id="one"><p>hi</p></div>';
        Modalizer.addComponent('content').setBasePath('/mdzr/content/');
        Modalizer.ready();

        const pushSpy = jest.spyOn(window.history, 'pushState');
        Modalizer.getComponent('content').trigger({ value: 'one' });

        expect(pushSpy).toHaveBeenCalled();
        const [state, , url] = pushSpy.mock.calls[0];
        expect(state).toEqual({ modalizer: true, key: 'content', value: 'one' });
        expect(url).toMatch(/#!content=one$/);
    });

    test('direct load of #!content=one triggers the component and replaces state', () => {
        document.body.innerHTML = '<div id="one"><p>hi</p></div>';
        window.history.replaceState(null, '', '/#!content=one');

        Modalizer.addComponent('content').setBasePath('/mdzr/content/');
        Modalizer.ready();

        expect(Modalizer.layers.hasLayers()).toBe(true);
        const layer = Modalizer.layers.getCurrent();
        expect(layer.name).toBe('content.one');
    });

    test('user close calls history.back when on modalizer state', () => {
        document.body.innerHTML = '<div id="one"><p>hi</p></div>';
        Modalizer.addComponent('content').setBasePath('/mdzr/content/');
        Modalizer.ready();
        Modalizer.getComponent('content').trigger({ value: 'one' });

        const backSpy = jest.spyOn(window.history, 'back');
        const host = document.querySelector('.modalizer');
        host.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        expect(backSpy).toHaveBeenCalled();
    });

    test('popstate to an older modalizer state pops just the top layer', () => {
        document.body.innerHTML = '<div id="one"><p>1</p></div><div id="two"><p>2</p></div>';
        Modalizer.addComponent('content').setBasePath('/mdzr/content/');
        Modalizer.ready();

        Modalizer.getComponent('content').trigger({ value: 'one' });
        Modalizer.getComponent('content').trigger({ value: 'two' });
        expect(Modalizer.layers.layers.length).toBe(2);

        window.dispatchEvent(new window.PopStateEvent('popstate', {
            state: { modalizer: true, key: 'content', value: 'one' },
        }));

        expect(Modalizer.layers.layers.length).toBe(1);
        expect(Modalizer.layers.getCurrent().name).toBe('content.one');
    });

    test('popstate to non-modalizer state closes all layers', () => {
        document.body.innerHTML = '<div id="one"><p>1</p></div>';
        Modalizer.addComponent('content').setBasePath('/mdzr/content/');
        Modalizer.ready();
        Modalizer.getComponent('content').trigger({ value: 'one' });
        expect(Modalizer.layers.hasLayers()).toBe(true);

        window.dispatchEvent(new window.PopStateEvent('popstate', { state: null }));
        expect(Modalizer.layers.hasLayers()).toBe(false);
    });

    test('addLayer (custom, not component-driven) does not push state', () => {
        const pushSpy = jest.spyOn(window.history, 'pushState');
        Modalizer.addLayer('picture', { content: '<figure/>', noheader: true, nofooter: true });
        expect(pushSpy).not.toHaveBeenCalled();
    });
});
