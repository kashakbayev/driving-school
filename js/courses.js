'use strict';

// Course catalog, comparison table and search on courses.html. Plain JavaScript, no jQuery.

const COURSES = [
  {
    id: 'category-b',
    title: 'Category B',
    label: 'Most complete',
    featured: true,
    audience: 'new',
    audienceText: 'New drivers who want full training',
    summary: 'Full training for new drivers.',
    includes: 'Theory (traffic rules, road signs, first aid basics) and practice (vehicle control, parking, city driving)',
    price: 145000,
    weeks: 6,
    hours: 56,
    detailsHref: 'courseDetail.html',
    detailsText: 'View Category B details',
  },
  {
    id: 'intensive',
    title: 'Intensive Category B',
    label: 'Faster pace',
    featured: false,
    audience: 'new',
    audienceText: 'New drivers who want a faster pace',
    summary: 'The same core hours in a shorter schedule.',
    includes: 'The same core hours as Category B in a shorter schedule',
    price: 165000,
    weeks: 3,
    hours: 56,
    detailsHref: '#compare-intensive',
    detailsText: 'Compare intensive details',
  },
  {
    id: 'refresher',
    title: 'Defensive Driving',
    label: 'Skill refresh',
    featured: false,
    audience: 'returning',
    audienceText: 'Returning drivers who want to refresh their skills',
    summary: 'Focused practice for returning drivers.',
    includes: 'Focused driving practice',
    price: 45000,
    weeks: 1,
    hours: 10,
    detailsHref: '#compare-refresher',
    detailsText: 'Compare refresher details',
  },
];

const ENROLL_HREF = 'index.html#enrollment-form';

// Rows of the comparison table: a label and how to get the value from a course
const COMPARISON_ROWS = [
  { label: 'Price', bold: true, value: (course) => formatKzt(course.price) },
  { label: 'Duration', value: (course) => pluralize(course.weeks, 'week') },
  { label: 'Academic hours', value: (course) => String(course.hours) },
  { label: 'Price per academic hour', value: (course) => `about ${formatKzt(pricePerHour(course))}` },
  { label: 'What the training includes', value: (course) => course.includes },
  { label: 'Who it is for', value: (course) => course.audienceText },
];

const numberFormat = new Intl.NumberFormat('en-US');

const searchForm = document.getElementById('course-search-form');
const searchInput = document.getElementById('course-search-input');
const results = document.getElementById('course-results');
const status = document.getElementById('course-results-status');
const emptyState = document.getElementById('course-empty-state');
const table = document.getElementById('course-comparison-table');

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function formatKzt(amount) {
  return `${numberFormat.format(amount)} KZT`;
}

function pluralize(count, word) {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

// Price divided by academic hours, so courses of different length can be compared
function pricePerHour(course) {
  return Math.round(course.price / course.hours);
}

function createLink(href, className, text) {
  const link = createElement('a', className, text);
  link.href = href;
  return link;
}

function createFact(term, value) {
  const column = createElement('div', 'col-4');
  column.append(createElement('dt', '', term), createElement('dd', '', value));
  return column;
}

function createHeading(text, scope, id) {
  const heading = createElement('th', '', text);
  heading.scope = scope;
  if (id) {
    heading.id = id;
  }
  return heading;
}

function buildCard(course) {
  const column = createElement('div', 'col-12 col-md-6 col-lg-4 course-item');
  column.id = `course-${course.id}`;
  column.dataset.course = course.id;

  const card = createElement('article', `card course-card h-100 border-0${course.featured ? ' featured-course' : ''}`);
  card.setAttribute('aria-labelledby', `course-${course.id}-title`);
  const body = createElement('div', 'card-body p-4 d-flex flex-column');

  const title = createElement('h3', 'h3', course.title);
  title.id = `course-${course.id}-title`;

  const facts = createElement('dl', 'course-facts row g-2 mt-1 mb-4');
  facts.append(
    createFact('Category', 'B (car)'),
    createFact('Duration', pluralize(course.weeks, 'week')),
    createFact('Hours', String(course.hours)),
  );

  const price = createElement('p', 'course-price mt-auto mb-1', `${numberFormat.format(course.price)} `);
  price.append(createElement('small', '', 'KZT'));

  const buttons = createElement('div', 'd-grid gap-2');
  buttons.append(
    createLink(course.detailsHref, 'btn btn-primary', course.detailsText),
    createLink(ENROLL_HREF, 'btn btn-outline-primary', `Enroll in ${course.title}`),
  );

  body.append(
    createElement('span', 'course-label align-self-start mb-3', course.label),
    title,
    createElement('p', 'text-body-secondary', course.summary),
    facts,
    price,
    createElement('p', 'small text-body-secondary mb-3', `about ${formatKzt(pricePerHour(course))} per academic hour`),
    buttons,
  );
  card.append(body);
  column.append(card);
  return column;
}

function buildTable(courses) {
  const headRow = createElement('tr');
  headRow.append(createHeading('Criteria', 'col'));
  courses.forEach((course) => {
    headRow.append(createHeading(course.title, 'col', `compare-${course.id}`));
  });
  table.tHead.append(headRow);

  COMPARISON_ROWS.forEach((row) => {
    const tableRow = createElement('tr');
    tableRow.append(createHeading(row.label, 'row'));
    courses.forEach((course) => {
      tableRow.append(createElement('td', row.bold ? 'fw-bold' : '', row.value(course)));
    });
    table.tBodies[0].append(tableRow);
  });

  // Last row: a link to the details page when there is one, otherwise straight to enrollment
  const stepRow = createElement('tr');
  stepRow.append(createHeading('Next step', 'row'));
  courses.forEach((course) => {
    const cell = createElement('td');
    if (course.detailsHref.startsWith('#')) {
      cell.append(createLink(ENROLL_HREF, 'btn btn-outline-primary btn-sm', `Enroll in ${course.title}`));
    } else {
      cell.append(createLink(course.detailsHref, 'btn btn-primary btn-sm', `${course.title} details`));
    }
    stepRow.append(cell);
  });
  table.tBodies[0].append(stepRow);
}

function searchText(course) {
  return [course.title, course.label, course.summary, course.includes, course.audienceText,
    pluralize(course.weeks, 'week'), `${course.hours} hours`].join(' ').toLowerCase();
}

function courseMatches(course, query, audience) {
  const forAudience = audience === 'all' || course.audience === audience;
  return forAudience && searchText(course).includes(query);
}

// Hides the cards that do not match and returns how many are left
function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const audience = searchForm.elements.audience.value;
  let shown = 0;

  COURSES.forEach((course) => {
    const matches = courseMatches(course, query, audience);
    document.getElementById(`course-${course.id}`).classList.toggle('is-hidden', !matches);
    if (matches) {
      shown += 1;
    }
  });

  status.textContent = shown === COURSES.length
    ? `Showing all ${COURSES.length} Category B courses.`
    : `Showing ${shown} of ${COURSES.length} courses.`;
  emptyState.classList.toggle('is-hidden', shown > 0);
  return shown;
}

// Highlights one course's column in the comparison table
function highlightColumn(courseId) {
  const heading = document.getElementById(`compare-${courseId}`);
  if (heading === null) {
    return false;
  }
  table.querySelectorAll('tr').forEach((row) => {
    Array.from(row.children).forEach((cell, index) => {
      cell.classList.toggle('table-warning', index === heading.cellIndex);
    });
  });
  return true;
}

COURSES.forEach((course) => {
  results.append(buildCard(course));
});
buildTable(COURSES);
applyFilters();

// Enter or the Search button: the form must not reload the page
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  applyFilters();
});

searchInput.addEventListener('input', applyFilters);

// One handler on the form catches a change of any audience radio
searchForm.addEventListener('change', (event) => {
  if (event.target.name === 'audience') {
    applyFilters();
  }
});

// One handler on the results list catches clicks on every "Compare ..." button, including ones added later
results.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#compare-"]');
  if (link !== null) {
    highlightColumn(link.getAttribute('href').replace('#compare-', ''));
  }
});

// The visitor may arrive on a #compare-... link from another page
if (location.hash.startsWith('#compare-')) {
  highlightColumn(location.hash.replace('#compare-', ''));
}
