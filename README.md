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

The website uses semantic HTML, page-specific CSS, Bootstrap 5.3.8 and deferred
JavaScript. There is no server or database; form confirmations and saved choices
are front-end demonstrations only.

## Assignment 4–5 Functionality Plan

| Page | Visitor goal | Planned function | Expected result | Student |
| --- | --- | --- | --- | --- |
| `index.html` | Choose a realistic training program and apply | Populate program choices, calculate price and weekly workload, validate the enrollment form and create a temporary reference | Field-level errors for invalid data; an accessible summary stating that no data was sent and no real booking was created | Aidos |
| `schedule.html` | Find and choose a suitable lesson time | Render six schedule objects, search, filter, sort, reset and save one preference for the application | Result count, empty state, selected-session feedback and a next action to enrollment | Aidos |
| `enrollment.html` | Check preparation before applying | Render an interactive document-readiness checklist and calculate completion | Persistent tab-only progress, reset support and clear ready/not-ready feedback | Aidos |
| Shared on Aidos pages | Use mobile navigation with keyboard support | Synchronize the prepared navigation toggle, close it after selection and support Escape | Accurate `aria-expanded` state and predictable keyboard behavior | Aidos |

## Midterm correction used

Before this JavaScript assignment, the enrollment form was moved from
`enrollment.html` to `index.html`, and the related enrollment links were updated.
The JavaScript work starts from that current interface and claims no assignment
points for the correction itself. In accordance with the HTML/CSS freeze, this
assignment adds only deferred script links to the three HTML pages and does not
change CSS rules.
