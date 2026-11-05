# Prestige Driving School

Project for Web Technologies I by Aidos, Merey and Baygali from SE-2531.

## Pages

- `index.html` - home page
- `courses.html` - Category B course list and price table
- `courseDetail.html` - Category B course details
- `schedule.html` - searchable weekly schedule and lesson preference
- `enrollment.html` - enrollment process, readiness checklist and contact details
- `instructors.html` - instructor information
- `reviews.html` - student reviews and feedback form

The website uses semantic HTML, page-specific CSS, Bootstrap 5.3.8, jQuery 3.7.1
and deferred project scripts. There is no server or database; form confirmations
and saved choices are front-end demonstrations only.

## Assignment 4 jQuery Functionality Plan

| Page | Visitor goal | Planned function | Expected result | Student |
| --- | --- | --- | --- | --- |
| `index.html` | Choose a training program and apply | Build the email field and program options in jQuery, calculate an estimate, validate every field and reset after success | Field-level errors, effects, an accessible demo confirmation and no false booking claim | Aidos |
| `schedule.html` | Find and choose a suitable lesson time | Render six sessions, search, filter, sort, reset, show/hide filters and delegate selection clicks | Result count, empty state, effects, saved preference and a next action | Aidos |
| `enrollment.html` | Check preparation before applying | Build a jQuery readiness checklist from an array and calculate completion | Tab-only progress, animated feedback and reset support | Aidos |
| Shared on Aidos pages | Use mobile navigation with keyboard support | Use jQuery selectors, properties, attributes and delegated events | Accurate `aria-expanded` state and predictable keyboard behavior | Aidos |

## Freeze and comparison version

The midterm HTML/CSS freeze is preserved: the three HTML files only add the
jQuery CDN and deferred script links, while new controls and content are created
in code. No CSS rules were added. The form remains on `index.html`; its email
field is created dynamically to satisfy Assignment 4 validation requirements.

The earlier plain-JavaScript versions of form validation, schedule rendering and
the readiness checklist are preserved in `js/old-js-version.js`. That comparison
file is intentionally not linked from any page. The active implementations are
`js/index.js`, `js/schedule.js` and `js/enrollment.js`.
