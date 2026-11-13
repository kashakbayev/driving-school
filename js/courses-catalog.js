'use strict';

// Plain JavaScript: builds the course cards and the comparison table on
// courses.html from the PROGRAMS array in js/data.js. No course markup is
// written in the HTML. buildElement, formatKzt, pluralize and
// calculatePayments come from js/courses-installment.js, loaded before this file.

const COURSE_CATEGORY = 'B (car)';

function getEnrollLink(program) {
  return `index.html?program=${program.id}#enrollment-form`;
}

function getDetailsLink(program) {
  return program.detailsPage !== null ? program.detailsPage : `#compare-${program.id}`;
}

function getMonthlyText(program) {
  const payments = calculatePayments(program.price, program.maxMonths);
  return `or ${pluralize(program.maxMonths, 'payment')} from ${formatKzt(payments[0])}`;
}

function createFact(term, value) {
  const fact = buildElement('div', { class: 'col-4' });
  fact.append(buildElement('dt', {}, term), buildElement('dd', {}, value));
  return fact;
}

function createCourseCard(program) {
  const column = buildElement('div', {
    class: 'col-12 col-md-6 col-lg-4 course-item',
    id: `course-${program.id}`,
    'data-course': program.id,
    'data-audience': program.audience,
  });
  const article = buildElement('article', {
    class: program.featured ? 'card course-card featured-course h-100 border-0' : 'card course-card h-100 border-0',
    'aria-labelledby': `course-${program.id}-title`,
  });
  const body = buildElement('div', { class: 'card-body p-4 d-flex flex-column' });

  const facts = buildElement('dl', { class: 'course-facts row g-2 mt-1 mb-4' });
  facts.append(
    createFact('Category', COURSE_CATEGORY),
    createFact('Duration', pluralize(program.weeks, 'week')),
    createFact('Hours', String(program.hours)),
  );

  const price = buildElement('p', { class: 'course-price mt-auto mb-1' }, `${formatKzt(program.price)}`);
  // Opens this course's plan in the installment calculator (delegated handler
  // in js/courses-installment.js).
  const monthly = buildElement('button', {
    type: 'button',
    class: 'btn btn-link btn-sm p-0 mb-3 align-self-start text-start',
    'data-installment': program.id,
  }, `${getMonthlyText(program)} — see schedule`);

  const actions = buildElement('div', { class: 'd-grid gap-2' });
  actions.append(
    buildElement('a', { class: 'btn btn-primary', id: `course-${program.id}-details`, href: getDetailsLink(program) }, program.detailsText),
    buildElement('a', { class: 'btn btn-outline-primary', id: `course-${program.id}-enroll`, href: getEnrollLink(program) }, `Enroll in ${program.shortName}`),
  );

  body.append(
    buildElement('span', { class: 'course-label align-self-start mb-3' }, program.label),
    buildElement('h3', { class: 'h3', id: `course-${program.id}-title` }, program.name),
    buildElement('p', { class: 'text-body-secondary' }, program.summary),
    facts,
    price,
    monthly,
    actions,
  );
  article.append(body);
  column.append(article);
  return column;
}

// One table row: a header cell, then one cell per program made by getCell.
function createComparisonRow(label, getCell) {
  const row = buildElement('tr');
  row.append(buildElement('th', { scope: 'row' }, label));
  PROGRAMS.forEach((program) => {
    row.append(getCell(program));
  });
  return row;
}

function createNextStepCell(program) {
  const cell = buildElement('td');
  // A course with its own page links there; the others go straight to enrollment.
  if (program.detailsPage !== null) {
    cell.append(buildElement('a', { class: 'btn btn-primary btn-sm', id: `compare-${program.id}-details`, href: program.detailsPage }, `${program.shortName} details`));
  } else {
    cell.append(buildElement('a', { class: 'btn btn-outline-primary btn-sm', id: `compare-${program.id}-enroll`, href: getEnrollLink(program) }, `Enroll in ${program.shortName}`));
  }
  return cell;
}

function renderCourseCatalog(cardsContainer, table, status) {
  PROGRAMS.forEach((program) => {
    cardsContainer.append(createCourseCard(program));
  });

  // The count is calculated from the data, so a new course updates it automatically.
  const audiences = new Set(PROGRAMS.map((program) => program.audience));
  status.textContent = `Showing all ${pluralize(PROGRAMS.length, 'Category B course')} for ${pluralize(audiences.size, 'type')} of driver.`;

  const headRow = table.querySelector('thead tr');
  PROGRAMS.forEach((program) => {
    headRow.append(buildElement('th', { scope: 'col', id: `compare-${program.id}` }, program.name));
  });

  table.querySelector('tbody').append(
    createComparisonRow('Price', (program) => buildElement('td', { class: 'fw-bold' }, formatKzt(program.price))),
    createComparisonRow('Monthly payments', (program) => buildElement('td', {}, getMonthlyText(program))),
    createComparisonRow('Duration', (program) => buildElement('td', {}, pluralize(program.weeks, 'week'))),
    createComparisonRow('Academic hours', (program) => buildElement('td', {}, String(program.hours))),
    createComparisonRow('Hours per week', (program) => buildElement('td', {}, `about ${Math.round(program.hours / program.weeks)}`)),
    createComparisonRow('What the training includes', (program) => buildElement('td', {}, program.includes)),
    createComparisonRow('Who it is for', (program) => buildElement('td', {}, program.forWhom)),
    createComparisonRow('Next step', createNextStepCell),
  );
}

const courseCards = document.getElementById('course-results');
const comparisonTable = document.getElementById('course-comparison-table');
const courseStatus = document.getElementById('course-results-status');

if (courseCards && comparisonTable && courseStatus) {
  renderCourseCatalog(courseCards, comparisonTable, courseStatus);
}
