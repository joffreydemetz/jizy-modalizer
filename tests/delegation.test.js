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

describe('click delegation on [data-mdzr-path]', () => {
    test('link clicked at document root triggers the component', () => {
        document.body.innerHTML = '<div id="one"><p>hi</p></div><a data-mdzr-path="/mdzr/content/one/" href="#">open</a>';
        Modalizer.addComponent('content').setBasePath('/mdzr/content/');
        Modalizer.ready();

        const link = document.querySelector('a[data-mdzr-path]');
        link.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));

        expect(Modalizer.layers.hasLayers()).toBe(true);
    });

    test('link injected after ready() still triggers', () => {
        document.body.innerHTML = '<div id="one"><p>hi</p></div>';
        Modalizer.addComponent('content').setBasePath('/mdzr/content/');
        Modalizer.ready();

        const wrap = document.createElement('div');
        wrap.innerHTML = '<a data-mdzr-path="/mdzr/content/one/" href="#">open</a>';
        document.body.appendChild(wrap);

        wrap.querySelector('a').dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
        expect(Modalizer.layers.hasLayers()).toBe(true);
    });

    test('link inside an opened layer opens a second layer', () => {
        document.body.innerHTML = `
            <div id="one">
              <p>hello <a data-mdzr-path="/mdzr/content/two/" href="#">nested</a></p>
            </div>
            <div id="two"><p>second</p></div>
        `;
        Modalizer.addComponent('content').setBasePath('/mdzr/content/');
        Modalizer.ready();

        Modalizer.getComponent('content').trigger({ value: 'one' });
        expect(Modalizer.layers.layers.length).toBe(1);

        const nested = document.querySelector('.layer a[data-mdzr-path]');
        expect(nested).not.toBeNull();
        nested.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));

        expect(Modalizer.layers.layers.length).toBe(2);
        expect(Modalizer.layers.getCurrent().name).toBe('content.two');
    });

    test('click inside a descendant of a [data-mdzr-path] bubbles up and triggers', () => {
        document.body.innerHTML = '<div id="one"><p>hi</p></div><a data-mdzr-path="/mdzr/content/one/" href="#"><strong>open</strong></a>';
        Modalizer.addComponent('content').setBasePath('/mdzr/content/');
        Modalizer.ready();

        const strong = document.querySelector('strong');
        strong.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
        expect(Modalizer.layers.hasLayers()).toBe(true);
    });

    test('ctrl+click does not open a layer (preserves new-tab behavior)', () => {
        document.body.innerHTML = '<div id="one"><p>hi</p></div><a data-mdzr-path="/mdzr/content/one/" href="#">open</a>';
        Modalizer.addComponent('content').setBasePath('/mdzr/content/');
        Modalizer.ready();

        const link = document.querySelector('a[data-mdzr-path]');
        link.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }));
        expect(Modalizer.layers.hasLayers()).toBe(false);
    });

    test('click on a non-mdzr link does nothing', () => {
        document.body.innerHTML = '<a href="/other" id="x">other</a>';
        Modalizer.addComponent('content').setBasePath('/mdzr/content/');
        Modalizer.ready();

        document.getElementById('x').dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
        expect(Modalizer.layers.hasLayers()).toBe(false);
    });

    test('calls preventDefault so href="#" does not navigate', () => {
        document.body.innerHTML = '<div id="one"><p>hi</p></div><a data-mdzr-path="/mdzr/content/one/" href="#">open</a>';
        Modalizer.addComponent('content').setBasePath('/mdzr/content/');
        Modalizer.ready();

        const link = document.querySelector('a[data-mdzr-path]');
        const event = new window.MouseEvent('click', { bubbles: true, cancelable: true });
        link.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
    });
});
