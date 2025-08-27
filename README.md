# jizy-modalizer

Modal layer manager for web applications. It provides a simple API to manage modal dialogs, including opening, closing, and customizing modals.

## Installation

```sh
npm install jizy-modalizer
```

## Usage Example

```js
import Modalizer from 'jizy-modalizer';

// Show a simple modal layer
Modalizer.show({
  name: 'example',
  content: '<h2>Hello Modalizer!</h2><p>This is a modal dialog.</p>',
  header: 'My Modal',
  footerCloseButton: true
});

// Hide the current modal
Modalizer.hide();

// Customize close button text
Modalizer.setCloseButtonText('Dismiss');

// Prevent closing by clicking the backdrop
Modalizer.setIgnoreBackdropClick(true);
```

## Features

- Multiple modal layers
- Customizable content, header, footer, and close button
- Keyboard and accessibility support
- Easy API for showing/hiding modals
