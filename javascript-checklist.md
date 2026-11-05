# JavaScript Assignment 4–5 Checklist

This checklist maps Aidos's three pages to the submitted implementation. Line
references are based on the current repository files.

## Scope and HTML/CSS freeze

- `index.html:13–14` loads `js/main.js` and `js/index.js` with `defer`.
- `schedule.html:13–14` loads `js/main.js` and `js/schedule.js` with `defer`.
- `enrollment.html:13–14` loads `js/main.js` and `js/enrollment.js` with `defer`.
- No CSS rules were changed. All new controls, summaries, messages and state
  changes are created through the DOM or `classList`.

## Assignment 4 — JavaScript fundamentals

| Requirement | Evidence |
| --- | --- |
| Strict mode and block-scoped variables | `js/main.js:1`, `js/index.js:1`, `js/schedule.js:1`, `js/enrollment.js:1`; all modules use `const` by default and `let` only for changing state. |
| Array with at least six objects and at least four properties | `js/schedule.js:3–76` defines six lesson-session objects with ten properties each. |
| Array traversal, filtering, lookup, transformation and totals | `js/schedule.js:96–123` filters and sorts sessions; `js/schedule.js:347–349` finds a selected session; `js/index.js:50` finds a program; `js/enrollment.js:72–86` transforms stored IDs and totals completed items. |
| Four or more reusable parameterized functions that return values | `js/index.js:36–58`, `js/index.js:66–93`, `js/index.js:95–145`; `js/schedule.js:78–123`; `js/enrollment.js:36–86`. `validateEnrollment` calls the reusable date and lookup helpers. |
| Arithmetic and meaningful calculation | `js/index.js:66–77` calculates dates; `js/index.js:205–230` calculates weekly hours and price; `js/enrollment.js:72–86` calculates checklist completion. |
| Conditions, switch, logical operators and strict comparison | `js/index.js:95–145` validates with `if` conditions and logical operators; `js/schedule.js:111–123` uses a `switch`; strict comparisons are used throughout, including `js/index.js:50` and `js/schedule.js:347–349`. |
| Meaningful `Math.random` use | `js/index.js:232–234` creates a clearly labelled temporary demonstration reference; it does not claim a real booking. |

## Assignment 5 — DOM and interaction

| Requirement | Evidence |
| --- | --- |
| Repeated content rendered from data | `js/schedule.js:250–326` renders table rows from the six-session array; `js/enrollment.js:134–161` renders five readiness items. |
| Safe DOM updates | The modules use `createElement`, `append` and `textContent`; no user input is passed to `innerHTML`. See `js/index.js:36–45`, `js/schedule.js:78–87` and `js/enrollment.js:36–45`. |
| Search, filter, sort, count, no-results and reset | Controls are created at `js/schedule.js:165–224`, rendered at `js/schedule.js:296–326`, and handled at `js/schedule.js:328–338`. |
| Submit and click events plus input/change/keydown | Form events are at `js/index.js:324–377`; schedule events at `js/schedule.js:328–375`; readiness events at `js/enrollment.js:176–200`; keyboard navigation at `js/main.js:33–39`. |
| DOM creation/removal and class-based state | Dynamic elements are created in every page module. Schedule rows are replaced at `js/schedule.js:304–309`; state is updated with `classList` at `js/index.js:147–180`, `js/schedule.js:355–373` and `js/enrollment.js:166–174`. |
| Form with field-level validation and combined rule | `js/index.js:95–145` validates name, phone, age, program, date, transmission and agreement, including the selected program's minimum-age rule. Errors are applied at `js/index.js:147–180`; the first invalid control receives focus at `js/index.js:340–359`. |
| Live calculation and confirmation | `js/index.js:205–230` updates the program estimate; `js/index.js:367–374` displays a safe demo confirmation stating that nothing was sent and no booking was created. |
| Meaningful selection flow | `js/schedule.js:340–375` records a lesson preference and provides the next step; `js/index.js:185–203` reads the non-sensitive tab-only preference into the enrollment summary. |
| Additional project interaction | `js/enrollment.js:88–200` creates a document-readiness checklist with progress, tab-only persistence, completion feedback and reset. |
| Accessible shared navigation | `js/main.js:3–39` synchronizes `aria-expanded`, closes the menu after selection and supports Escape with focus restoration. |

## Verification evidence

- `node --check` passed for all four JavaScript modules.
- Focused scans found no `var`, loose equality, jQuery, inline event handlers,
  `document.write`, unsafe `innerHTML`, `eval` or direct style manipulation.
- Logic checks covered valid and invalid enrollment data, the temporary reference
  format, schedule search/filter/sort and 100% readiness calculation.
- Repository checks cover unique IDs, one `<h1>` per page, label targets, local
  links/assets and CSS brace balance.
- A local HTTP smoke test returned `200` for all three pages and all four new
  JavaScript modules.
- `git diff --check` passes, and the HTML diff is limited to the permitted
  deferred script tags.

## Manual review before submission

1. Serve the repository with `python3 -m http.server 8000`.
2. Test the three pages at desktop and narrow viewport widths, including keyboard
   focus, the schedule empty state and all enrollment validation messages.
3. Confirm that the browser console has no errors and that Bootstrap resources
   load in the submission environment.
4. Read and understand every function before the defense; be prepared to trace
   an input to its displayed result and make a small live change.
5. After the team has reviewed and committed the work, create the required
   `assignment-4` and `assignment-5` Git tags. No tags were created automatically.
