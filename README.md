# Scroll-Timeline-Polyfill
A Polyfill for Scroll-Timelines (Animation-Timeline), that works down to IE11.

## Usage
```
 #container {
    scroll-timeline-name: --foo;
 }

 #animation-element{
    animation: test linear forwards;
 }

 @keyframes test{
    from: {
        ...
    }
    to: {
        ...
    }
 }
```

## Requirements
- Internet Explorer 11, Google Chrome 70, Firefox 70, Opera 70, Microsoft Edge 12 or another browser on the same feature level.

## Attention!
This polyfill is in an early development stage. There are still a lot of known limitations.
