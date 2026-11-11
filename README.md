# Prestige Driving School

Project for Web Technologies I by Aidos, Merey and Baygali from SE-2531.

## Pages

- `index.html` - home page
- `courses.html` - Category B course list and price table
- `coursedetail.html` - Category B course details and booking form
- `schedule.html` - weekly schedule
- `enrollment.html` - registration form and contact details
- `instructors.html` - instructor information
- `reviews.html` - student reviews and feedback form

The website uses HTML, CSS (Bootstrap 5.3.8), plain JavaScript and jQuery 3.7.1.

## Endterm: JavaScript and jQuery features (Merey)

| Feature | Page | JS or jQuery | File | Added since the last defense |
| --- | --- | --- | --- | --- |
| Course cards and comparison table built from the `COURSES` array | courses.html | JS | js/courses.js | Rewritten from jQuery to plain JS; the cards and the table rows are no longer in the HTML; new "price per academic hour" computed for every course |
| Course search and audience filter with "no courses found" state | courses.html | JS | js/courses.js | Rewritten to plain JS: `submit` with `preventDefault`, `input`, delegated `change` on the form (`event.target`) |
| Highlight of a course column in the comparison table | courses.html | JS | js/courses.js | Delegated `click` on `#course-results`; also works when the page is opened with a `#compare-...` link |
| Installment calculator and plan request form with validation | courses.html | jQuery | js/courses-installment.js | Payment schedule now shows the real calendar months, starting from the current month; the confirmation names the first payment month |
| Requirements list built from the `REQUIREMENTS` array | courseDetail.html | JS | js/course-planner.js | New |
| Start planner: age on the start date, earliest start, final test date, license date, document checklist | courseDetail.html | JS | js/course-planner.js | New: delegated `input` and `change` handlers, errors next to the date fields, Sunday and past dates rejected |
| FAQ: questions built from the `FAQ` array, slide open one at a time, search with "no question matches" state | courseDetail.html | jQuery | js/courseDetail.js | All 8 questions now come from the array (none in the HTML); new search box with fade effects and empty state |
