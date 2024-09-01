# Scroll-Timeline-Polyfill
A Polyfill for Scroll-Timelines (Animation-Timeline), that works down to IE11.

## Usage
At the moment, the Polyfill can only be used in a `<style>`-tag. The rest of the CSS code (including the animation) can be stored in an external file. Only the `animation-timeline` and the `scroll-timeline-name` need to be defined in a `<style>`-tag directly in the HTML.

```
<style>
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
</style>
```

## Requirements
- Internet Explorer 11, Google Chrome 70, Firefox 70, Opera 70, Microsoft Edge 12 or another browser on the same feature level.

## Attention!
This polyfill is in an early development stage. There are still a lot of known limitations.
- At the moment the code can only be used in `<style>`-tags. External files and inline statements are not supported.
- Media queries are not supported at the moment for the `scroll-timeline-name` and `animation-timeline`
- Keyframes are not supported at the moment for the `scroll-timeline-name` and `animation-timeline`
- Dynamic changing CSS code is not supported at the moment
- At the moment there is only support for one declaration of `scroll-timeline-name` or `animation-timeline` per HTML-Element. 
