# jizy-modalizer

Modal layer manager for web applications. It provides a simple API to manage modal dialogs, including opening, closing, and customizing modals.

## Installation

```sh
npm install jizy-modalizer
```

## Features

- Multiple modal layers
- Customizable content, header, footer, and close button
- Keyboard and accessibility support
- Easy API for showing/hiding modals

## Useful methods

It is easy to interact with the Modalizer manager programmatically. Here are some useful methods:
- `Modalizer.addLayer(name, config, replace)`: open a layer (optionally replacing the current one)
- `Modalizer.addLayer(layer, replace)`: open a `Layer` subclass instance you built yourself (see *Custom layers*)
- `Modalizer.hide()`: close the current layer and return to the previous one, or close the modalizer if it was the last
- `Modalizer.hideAll()`: close every layer
- `Modalizer.addComponent(name, type)`: register a component (`content`, `json`, `html`) opened from `[data-mdzr-path]` links and `#!name=value` URLs; `.setLayerConfig({...})` sets its layers' config
- `Modalizer.ready()`: bind the link delegation and open a deep-linked layer

Layers opened by a component push a `#!name=value` history entry; `hide()` / `hideAll()` step back through them, so the URL and the back button stay in step.

## Custom layers

A layer with its own markup and behaviour is a subclass of `Layer`: build the config in the constructor, wire the DOM once in `getElement()`, hook `show(again)` / `destroy()` when needed, and call `this.close()` to pop the layer through the facade (history-aware). `addLayer()` accepts the instance.

```js
import { Modalizer, Layer } from 'jizy-modalizer';

class CounterLayer extends Layer {
    constructor(start) {
        super('counter', { content: '<button class="plus">+</button><output>' + start + '</output>', size: 'sm' });
        this.count = start;
    }
    getElement() {
        const build = !this.$element;
        const $el = super.getElement();
        if (build) $el.querySelector('.plus').addEventListener('click', () => { $el.querySelector('output').textContent = ++this.count; });
        return $el;
    }
}

const modalizer = new Modalizer();
modalizer.addLayer(new CounterLayer(2));
```

Once opened, a layer knows its `modalizer` (the facade) and its `modal` (the host: backdrop + container). A plugin delivered as a raw script reaches the base class through the global instance: `Modalizer.Layer`.

The two bundled layers, `ConfirmLayer` (`lib/js/Layers/Confirm.js`) and `PicviewerLayer` (`lib/js/Layers/Picviewer.js`), are written that way and exported by the package.

## Plugins

`confirm` and `picviewer` are opt-in: they add `Modalizer.confirm(element, params)` and `Modalizer.picviewer(items, index, params)` to an instance and ship their own stylesheet. Two deliveries:

- ES module — `import { Modalizer, installConfirm, installPicviewer } from 'jizy-modalizer'`, then `installConfirm(modalizer)` / `installPicviewer(modalizer)`; styles from `lib/less/plugins/<name>.less`.
- Raw script — `dist/js/plugins/<name>.js` loaded after the core dist (it installs itself on the global `Modalizer`), plus `dist/css/plugins/<name>.css`. That is what jizy-builder concatenates for a `modalizerPlugins: ['confirm', 'picviewer']` site bundle.

```js
Modalizer.confirm(null, { content: 'Sure?', okText: 'Yes', koText: 'No', callback: () => doIt() });
Modalizer.confirm(linkEl);   // question/header from data-confirm-question / data-confirm-header, OK follows linkEl.href
Modalizer.picviewer([{ src, alt, caption }, …], 2, { onChange: (index, total, layer) => {} });
```

`npm run jpack:dist` builds the core dist and both plugin dists (`cli/build-plugins.js`: rollup for the JS, with `Layer` kept external and read off `Modalizer.Layer`; less for the CSS).

## Escape key

Escape closes the top layer, like its close button — only that one when layers are stacked. Two layer config keys (`addLayer` config, `setLayerConfig`, or the `picviewer` / `confirm` plugin params) change that:

| Key | Default | Effect |
|---|---|---|
| `closeOnEscape` | `true` | `false`: Escape does nothing while this layer is on top — only an explicit action closes it |
| `closeAllOnEscape` | `false` | `true`: Escape on this layer closes the whole stack |

An Escape already handled inside the layer (`event.preventDefault()`, e.g. by an open dropdown) is left alone. On a `confirm` dialog, Escape is the cancel button: the callback is not called.
