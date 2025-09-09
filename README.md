# Scroll-Timeline Polyfill

[![JavaScript](https://img.shields.io/badge/javascript-black?style=for-the-badge&logo=javascript)](https://github.com/marzeckm)  

A lightweight polyfill that brings support for CSS Scroll-Timelines and `animation-timeline` to legacy browsers – including **Internet Explorer 11**.

This enables scroll-driven animations using modern CSS syntax, even in environments that do not natively support these features.

---

## Quick Start

Include the polyfill in your HTML to activate scroll-timeline support:

```html
<script src="https://raw.githubusercontent.com/marzeckm/Scroll-Timeline-Polyfill/main/dist/scroll-timeline.min.js"></script>
```

## Usage 
The polyfill now supports `scroll-timeline`, `scroll-timeline-name`, `scroll-timeline-axis` and `animation-timeline` declared in:

- Inline styles (style attribute on HTML elements)
- External stylesheets (.css files)
- `<style>` blocks in HTML

### Minimal Example
```html
<style>
  #container {
    scroll-timeline-name: --scrollY;
    scroll-timeline-axis: block;
    overflow-y: scroll;
    height: 300px;
  }

  #animated-box {
    animation-name: fadeIn;
    animation-duration: 1ms;
    animation-timeline: --scrollY;
    animation-fill-mode: both;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>

<div id="container">
  <div id="animated-box">Scroll-Animated Content</div>
</div>
```

### Enabling Support for External CSS Files

To activate support for external CSS files, include the following `<meta>` tag in your HTML document.
This setting allows the polyfill to scan and apply scroll-timeline-related properties from linked stylesheets, not just inline styles or <style> blocks.

```html
<meta name="scroll-timeline-ext_css" content="TRUE">
```

Note: Enabling external CSS support may impact performance, especially in legacy browsers like IE11, due to sending REST requests, additional parsing and selector resolution overhead.

### Setup Guide

To create scroll-driven animations:
1. Define a scroll container with:
 - `scroll-timeline-name`
 - `scroll-timeline-axis`  (block | inline | x | y)
 - Scrollable overflow (overflow-x or overflow-y)

2. Assign the timeline name to your animated element using animation-timeline.
3. Define your animation using standard `@keyframes`.

### Example with horizontal Scroll

```css
.scroll-container {
  scroll-timeline-name: --scrollX;
  scroll-timeline-axis: inline;
  overflow-x: scroll;
}

.animated-element {
  animation-name: slideIn;
  animation-duration: 1ms;
  animation-timeline: --scrollX;
  animation-fill-mode: both;
}

@keyframes slideIn {
  from { transform: translateX(-100px); }
  to   { transform: translateX(0); }
}
```

## Build Instruction
To generate the distribution files, run the build script via Windows Script Host:

```
Cscript ./build.vbs
```

Make sure you're in the project root directory when executing the command.

## Requirements
This polyfill supports:
- Internet Explorer 11
- Google Chrome 50+
- Firefox 55+
- Opera 40+
- Microsoft Edge 12+ 
- Apple Safari 12+
- Vivaldi 1.0+
- Supermium 115+
- another browser on the same feature level.

## Supported Features

- Full support for:
   - `scroll-timeline`
   - `scroll-timeline-name`
   - `scroll-timeline-axis`
   - `animation-timeline`
- Works with:
   - Inline styles
   - External stylesheets
   - `<style>` blocks
- Selector specificity resolution (highest specificity wins)
- Animations without `animation-timeline` behave as standard CSS animations
- Scroll triggering works both horizontally and vertically

## Known Limitations

This polyfill has the following known limitations:
- CSS injected dynamically via JavaScript after initialization is not supported
- Functional timelines like `scroll()` or `view()` are not yet supported

## Contribute

If you want to contribute to the development of this project, feel free to submit pull requests or open issues. Let's make the Scroll-Timeline-Polyfill even better together!

## License

MIT License © Maximilian Marzeck
