/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import fs from 'node:fs';

// The plugin is a raw global-using script that extends whatever `Modalizer`
// instance exists when it runs — evaluate it against each fresh instance.
const PLUGIN = fs.readFileSync(new URL('../lib/js/plugins/picviewer.js', import.meta.url), 'utf8');

let Modalizer;

beforeEach(async () => {
    jest.useFakeTimers();
    jest.resetModules();
    document.body.innerHTML = '';
    document.body.className = '';
    delete window.Modalizer;
    const Cls = (await import('../lib/js/Modalizer.js')).default;
    Modalizer = new Cls();
    window.Modalizer = Modalizer;
    new Function(PLUGIN)();
});

afterEach(() => {
    jest.useRealTimers();
});

const pics = (...names) => names.map(n => ({ src: '/' + n + '.jpg', alt: n }));
const shownSrc = () => document.querySelector('.modalizer section figure img').getAttribute('src');
const key = (k) => document.dispatchEvent(new window.KeyboardEvent('keydown', { key: k, bubbles: true }));

describe('picviewer', () => {
    test('is attached to the Modalizer instance', () => {
        expect(typeof Modalizer.picviewer).toBe('function');
    });

    test('a static list slides and wraps; onChange reports every move', () => {
        const seen = [];
        Modalizer.picviewer(pics('a', 'b', 'c'), 1, { onChange: (i, total) => seen.push([i, total]) });
        jest.advanceTimersByTime(1000);

        expect(shownSrc()).toBe('/b.jpg');
        key('ArrowRight');
        expect(shownSrc()).toBe('/c.jpg');
        key('ArrowRight');
        expect(shownSrc()).toBe('/a.jpg');
        key('ArrowLeft');
        expect(shownSrc()).toBe('/c.jpg');

        expect(seen).toEqual([[1, 3], [2, 3], [0, 3], [2, 3]]);
    });

    test('a live source picks up pictures appended while open', () => {
        const wall = pics('a', 'b');
        const seen = [];
        Modalizer.picviewer(() => wall, 1, { onChange: (i, total) => seen.push([i, total]) });
        jest.advanceTimersByTime(1000);

        expect(seen).toEqual([[1, 2]]);
        wall.push(...pics('c', 'd'));   // "load more" while the viewer is open

        key('ArrowRight');
        expect(shownSrc()).toBe('/c.jpg');
        key('ArrowRight');
        expect(shownSrc()).toBe('/d.jpg');
        expect(seen).toEqual([[1, 2], [2, 4], [3, 4]]);
    });

    test('a live source keeps the current picture by src when the list shifts', () => {
        let wall = pics('a', 'b', 'c');
        Modalizer.picviewer(() => wall, 1);
        jest.advanceTimersByTime(1000);

        wall = pics('z', 'a', 'b', 'c');   // something inserted before the current one
        key('ArrowRight');
        expect(shownSrc()).toBe('/c.jpg');
    });

    test('a single picture gets no arrows and no key navigation', () => {
        const seen = [];
        Modalizer.picviewer({ src: '/solo.jpg', alt: 'solo' }, 0, { onChange: (i, total) => seen.push([i, total]) });
        jest.advanceTimersByTime(1000);

        expect(document.querySelector('.modalizer section .next')).toBeNull();
        key('ArrowRight');
        expect(shownSrc()).toBe('/solo.jpg');
        expect(seen).toEqual([[0, 1]]);
    });
});
