/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';

let Modalizer;
let ConfirmLayer;

beforeEach(async () => {
    jest.useFakeTimers();
    jest.resetModules();
    document.body.innerHTML = '';
    document.body.className = '';
    delete window.Modalizer;
    const Cls = (await import('../lib/js/Modalizer.js')).default;
    Modalizer = new Cls();
    window.Modalizer = Modalizer;
    ConfirmLayer = (await import('../lib/js/Layers/Confirm.js')).default;
    await import('../lib/js/plugins/confirm.js');   // installs itself on window.Modalizer
});

afterEach(() => {
    jest.useRealTimers();
});

const names = () => Modalizer.layers.layers.map(l => l.name);
const okButton = () => document.querySelector('.modalizer .layer-confirm .confirm-button');
const cancelButton = () => document.querySelector('.modalizer .layer-confirm .modalizer-close');
const click = (el) => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));

describe('confirm plugin', () => {
    test('Modalizer.confirm() opens a ConfirmLayer with the question and both buttons', () => {
        const layer = Modalizer.confirm(null, { content: 'Sure?', okText: 'Oui', koText: 'Non' });

        expect(layer).toBeInstanceOf(ConfirmLayer);
        expect(layer).toBeInstanceOf(Modalizer.Layer);
        expect(names()).toEqual(['confirm']);
        expect(document.querySelector('.layer-confirm .confirm-message').textContent).toBe('Sure?');
        expect(okButton().textContent).toBe('Oui');
        expect(cancelButton().textContent).toBe('Non');
    });

    test('OK calls the callback with the layer, then closes it', () => {
        const callback = jest.fn();
        const layer = Modalizer.confirm(null, { content: 'Sure?', callback });

        click(okButton());

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(layer);
        expect(names()).toEqual([]);
    });

    test('Cancel closes without calling back', () => {
        const callback = jest.fn();
        Modalizer.confirm(null, { content: 'Sure?', callback });

        click(cancelButton());

        expect(callback).not.toHaveBeenCalled();
        expect(names()).toEqual([]);
    });

    test('an element provides the question, the header and (without callback) the href to follow', () => {
        const link = document.createElement('a');
        link.setAttribute('href', '/delete/12');
        link.setAttribute('data-confirm-question', 'Delete #12?');
        link.setAttribute('data-confirm-header', 'Deletion');
        document.body.appendChild(link);

        const layer = Modalizer.confirm(link);
        const el = layer.getElement();
        expect(el.querySelector('header').textContent).toBe('Deletion');
        expect(el.querySelector('.confirm-message').textContent).toBe('Delete #12?');

        // No callback → OK follows the element's href. jsdom cannot navigate and
        // reports it on the console: silence that, check the wiring and the close.
        const quiet = jest.spyOn(console, 'error').mockImplementation(() => {});
        expect(layer.callback).toBeNull();
        expect(layer.element).toBe(link);
        click(okButton());
        expect(names()).toEqual([]);
        expect(quiet.mock.calls.some(args => String(args[0]).includes('navigation'))).toBe(true);
        quiet.mockRestore();
    });

    test('the backdrop is ignored while the confirm is open, and honoured again afterwards', () => {
        Modalizer.confirm(null, { content: 'Sure?' });
        const modal = Modalizer.layers.modal;
        expect(modal.ignoreBackdropClick).toBe(true);

        click(cancelButton());
        expect(modal.ignoreBackdropClick).toBe(false);

        Modalizer.addLayer('plain', { content: 'after' });
        expect(names()).toEqual(['plain']);
        click(document.querySelector('.modalizer.in'));   // a backdrop click closes a normal layer again
        expect(names()).toEqual([]);
    });
});
