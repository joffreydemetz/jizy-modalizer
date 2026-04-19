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
- `Modalizer.show(layer)`: add a new modal layer
- `Modalizer.hide()`: hide the current modal layer and return to the previous one or close the modalizer if no more layers
- `Modalizer.addLayer(layer)`: add a new modal layer (optionally replacing the current one)
- `Modalizer.replaceLayer(layer)`: same as `addLayer` but always replaces the current layer
- `Modalizer.LayerDomData(element)`: Retrieve layer config from a DOM element
