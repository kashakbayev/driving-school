# Assignment 4 jQuery Checklist

This is a repository checklist for Aidos's three pages. The live defense, source
comments and working interface remain the primary evidence.

## Freeze and loading

- `index.html`, `schedule.html` and `enrollment.html` load jQuery 3.7.1 from the
  official CDN before the deferred project scripts.
- All active scripts use `$(function () { ... })`; there is no inline JavaScript.
- No CSS rules were added. New fields, controls, rows and checklist items are
  created in JavaScript.
- `js/old-js-version.js` is not linked and preserves the three plain-JavaScript
  implementations for comparison.

## Required jQuery coverage

- Selectors: ID, class, element, attribute, `:first` and `:checked`.
- Traversal: `.find()`, `.closest()`, `.parent()`, `.siblings()` and `.each()`.
- DOM and values: `.text()`, safe `.html()`, `.val()`, `.attr()`, `.prop()`,
  `.append()`, `.appendTo()` and `.empty()`.
- Classes: `.addClass()`, `.removeClass()`, `.toggleClass()` and `.hasClass()`.
- Events: every active handler uses `.on()`; input, change, click, submit,
  reset and keydown are represented, with delegated schedule selection.
- Effects: `.fadeIn()`, `.fadeOut()`, `.slideToggle()` and `.slideDown()` have
  visitor-facing purposes, durations and completion callbacks.
- Validation: the main form trims values, validates name, email, phone, age,
  date, program, transmission and agreement, clears repaired errors, focuses
  the first invalid field, shows success only when valid and resets afterward.

## Defense preparation

- Explain why delegated `.on()` continues working after schedule rows are rebuilt.
- Explain `.text()` versus `.html()` and `.attr()` versus `.prop()`.
- Compare each rewritten feature with its function in `js/old-js-version.js`.
- Run all three pages in a browser and confirm the console contains no errors.
