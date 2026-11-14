/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';

let Modalizer;
let Layer;
let CounterLayer;

// A subclass with the three usual overrides: constructor config, DOM wiring in
// getElement(), a show() hook. Defined per test because Layer is re-imported.
const defineCounterLayer = (Base) => class CounterLayer extends Base {
    constructor(start) {
        super('counter', { content: '<button type="button" class="plus">+</button><output>' + start + '</output>', size: 'sm' });
        this.count = start;
        this.shows = 0;
    }

    getElement() {
        const build = !this.$element;
        const $el = super.getElement();
        if (build) {
            $el.querySelector('.plus').addEventListener('click', () => {
                this.count++;
                $el.querySelector('output').textContent = String(this.count);
            });
        }
        return $el;
    }

    show(again) {
        this.shows++;
        super.show(again);
    }
};

beforeEach(async () => {
    jest.useFakeTimers();
    jest.resetModules();
    document.body.innerHTML = '';
    document.body.className = '';
    delete window.Modalizer;
    const Cls = (await import('../lib/js/Modalizer.js')).default;
    Layer = (await import('../lib/js/Layer.js')).default;
    CounterLayer = defineCounterLayer(Layer);
    Modalizer = new Cls();
    window.Modalizer = Modalizer;
});

afterEach(() => {
    jest.useRealTimers();
});

const names = () => Modalizer.layers.layers.map(l => l.name);

describe('Layer subclasses', () => {
    test('Modalizer.Layer is the base class and index.js exports the bundled layers + installers', async () => {
        expect(Modalizer.Layer).toBe(Layer);
        const index = await import('../lib/index.js');
        expect(index.Layer).toBe(Layer);
        expect(typeof index.Modalizer).toBe('function');
        expect(Object.getPrototypeOf(index.ConfirmLayer)).toBe(Layer);
        expect(Object.getPrototypeOf(index.PicviewerLayer)).toBe(Layer);
        expect(typeof index.installConfirm).toBe('function');
        expect(typeof index.installPicviewer).toBe('function');
    });

    test('addLayer(instance) mounts the subclass, wires modalizer + modal, and its overrides run', () => {
        const layer = Modalizer.addLayer(new CounterLayer(2));

        expect(layer).toBeInstanceOf(CounterLayer);
        expect(layer.modalizer).toBe(Modalizer);
        expect(layer.modal).toBe(Modalizer.layers.modal);
        expect(names()).toEqual(['counter']);
        expect(layer.shows).toBe(1);
        expect(document.querySelector('.modalizer .layer.layer-sm output').textContent).toBe('2');

        document.querySelector('.modalizer .plus').click();
        expect(layer.count).toBe(3);
        expect(document.querySelector('.modalizer output').textContent).toBe('3');
    });

    test('addLayer(instance, true) replaces the top layer; addLayer(name, config) still builds a plain Layer', () => {
        const plain = Modalizer.addLayer('first', { content: 'one' });
        expect(plain.constructor).toBe(Layer);
        expect(plain.modalizer).toBe(Modalizer);

        Modalizer.addLayer(new CounterLayer(0), true);
        expect(names()).toEqual(['counter']);
    });

    test('close() pops the layer through the facade; without a facade it just destroys itself', () => {
        Modalizer.addLayer('below', { content: 'b' });
        const top = Modalizer.addLayer(new CounterLayer(0));
        expect(names()).toEqual(['below', 'counter']);

        top.close();
        expect(names()).toEqual(['below']);

        const orphan = new CounterLayer(0);
        orphan.visible = true;
        expect(() => orphan.close()).not.toThrow();
        expect(orphan.visible).toBe(false);
    });

    test('openComponentLayer() also wires modalizer on the layer it builds', () => {
        const layer = Modalizer.openComponentLayer('content', 'x', { content: 'c' });
        expect(layer.modalizer).toBe(Modalizer);
        expect(layer.historyPushed).toBe(true);
    });
});
