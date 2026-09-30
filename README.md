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
- `Modalizer.hide()`: close the current layer and return to the previous one, or close the modalizer if it was the last
- `Modalizer.hideAll()`: close every layer
- `Modalizer.addComponent(name, type)`: register a component (`content`, `json`, `html`) opened from `[data-mdzr-path]` links and `#!name=value` URLs; `.setLayerConfig({...})` sets its layers' config
- `Modalizer.ready()`: bind the link delegation and open a deep-linked layer

Layers opened by a component push a `#!name=value` history entry; `hide()` / `hideAll()` step back through them, so the URL and the back button stay in step.

## Escape key

Escape closes the top layer, like its close button — only that one when layers are stacked. Two layer config keys (`addLayer` config, `setLayerConfig`, or the `picviewer` / `confirm` plugin params) change that:

| Key | Default | Effect |
|---|---|---|
| `closeOnEscape` | `true` | `false`: Escape does nothing while this layer is on top — only an explicit action closes it |
| `closeAllOnEscape` | `false` | `true`: Escape on this layer closes the whole stack |

An Escape already handled inside the layer (`event.preventDefault()`, e.g. by an open dropdown) is left alone. On a `confirm` dialog, Escape is the cancel button: the callback is not called.
