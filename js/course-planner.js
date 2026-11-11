'use strict';

// Start planner on courseDetail.html: age check, finish date and a document checklist. Plain JavaScript, no jQuery.

const COURSE = { title: 'Category B', weeks: 6, startAge: 17, licenseAge: 18 };

const REQUIREMENTS = [
  { id: 'age', text: 'Minimum age: 17 (license issued at 18)' },
  { id: 'medical', text: 'Valid medical certificate', question: 'I have a valid medical certificate' },
  { id: 'photos', text: 'Two passport-style photos', question: 'I have two passport-style photos' },
];

const CLOSED_DAYS = [0]; // Sunday
const HINT_TEXT = 'Enter your date of birth and a start date to see your plan.';
const DATE_FORMAT = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };

const requirementsList = document.querySelector('#requirements .requirements-list');
const overview = document.getElementById('course-overview');

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

function pluralize(count, word) {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

// "2026-11-17" from a date input, or null when the field is empty or not a full date
function parseDate(value) {
  const parts = value.split('-').map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part)) || parts[0] < 1000) {
    return null;
  }
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Full years from one date to another, like an age
function yearsBetween(from, to) {
  let years = to.getFullYear() - from.getFullYear();
  if (to.getMonth() < from.getMonth()
    || (to.getMonth() === from.getMonth() && to.getDate() < from.getDate())) {
    years -= 1;
  }
  return years;
}

// The day a person born on `birth` turns `years`
function birthdayAt(birth, years) {
  return new Date(birth.getFullYear() + years, birth.getMonth(), birth.getDate());
}

function formatDate(date) {
  return date.toLocaleDateString('en-GB', DATE_FORMAT);
}

function toInputValue(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function today() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function buildDateField(id, labelText) {
  const column = createElement('div', 'col-12 col-md-6');
  const label = createElement('label', 'form-label fw-semibold', labelText);
  label.htmlFor = id;
  const input = createElement('input', 'form-control');
  input.type = 'date';
  input.id = id;
  input.setAttribute('aria-describedby', `${id}-error`);
  const error = createElement('small', 'field-message is-hidden');
  error.id = `${id}-error`;
  column.append(label, input, error);
  return column;
}

function buildCheckbox(item) {
  const wrapper = createElement('div', 'form-check');
  const input = createElement('input', 'form-check-input');
  input.type = 'checkbox';
  input.id = `planner-${item.id}`;
  input.value = item.id;
  const label = createElement('label', 'form-check-label', item.question);
  label.htmlFor = input.id;
  wrapper.append(input, label);
  return wrapper;
}

function buildRows(container, rows) {
  container.replaceChildren();
  rows.forEach((row) => {
    container.append(createElement('dt', 'col-sm-5', row[0]), createElement('dd', 'col-sm-7', row[1]));
  });
  return container;
}

// Requirements card: the list items come from the same array as the checklist
REQUIREMENTS.forEach((item) => {
  requirementsList.append(createElement('li', '', item.text));
});

// Planner section, inserted after the overview row
const planner = createElement('section', 'bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-5');
planner.id = 'start-planner';
planner.setAttribute('aria-labelledby', 'planner-title');

const plannerTitle = createElement('h2', 'h2 mb-3', 'Can I start, and when will I finish?');
plannerTitle.id = 'planner-title';

const fields = createElement('div', 'row g-3');
fields.id = 'planner-fields';
const checklist = createElement('div', 'd-flex flex-column gap-2');
checklist.id = 'planner-checklist';
REQUIREMENTS.filter((item) => item.question).forEach((item) => {
  checklist.append(buildCheckbox(item));
});
const checklistColumn = createElement('div', 'col-12');
checklistColumn.append(createElement('p', 'fw-semibold mb-2', 'Documents you already have'), checklist);

const result = createElement('div', 'status-message mt-0', HINT_TEXT);
result.id = 'planner-result';
result.setAttribute('aria-live', 'polite');
const resultColumn = createElement('div', 'col-12');
resultColumn.append(result);

const resetButton = createElement('button', 'btn btn-outline-secondary', 'Start over');
resetButton.type = 'button';
resetButton.id = 'planner-reset';
const buttonColumn = createElement('div', 'col-12');
buttonColumn.append(resetButton);

fields.append(
  buildDateField('planner-birth', 'Your date of birth'),
  buildDateField('planner-start', 'Preferred start date'),
  checklistColumn,
  resultColumn,
  buttonColumn,
);
planner.append(
  createElement('p', 'eyebrow fw-bold text-uppercase mb-2', 'Plan your start'),
  plannerTitle,
  createElement('p', 'text-body-secondary mb-4',
    `The ${COURSE.title} course takes ${pluralize(COURSE.weeks, 'week')}. Enter two dates and tick the documents you have; `
    + 'the result is an estimate that Prestige will confirm with you.'),
  fields,
);
overview.after(planner);

const birthInput = document.getElementById('planner-birth');
const startInput = document.getElementById('planner-start');
startInput.min = toInputValue(today());

function showFieldError(input, message) {
  const hasError = message !== '';
  input.classList.toggle('is-error', hasError);
  input.setAttribute('aria-invalid', String(hasError));
  const error = document.getElementById(`${input.id}-error`);
  error.textContent = message;
  error.classList.toggle('is-hidden', !hasError);
  return !hasError;
}

function birthMessage(birth) {
  if (birth === null) {
    return '';
  }
  if (birth > today() || yearsBetween(birth, today()) > 100) {
    return 'Enter a real date of birth.';
  }
  return '';
}

function startMessage(start) {
  if (start === null) {
    return '';
  }
  if (start < today()) {
    return 'Choose today or a later date.';
  }
  if (CLOSED_DAYS.includes(start.getDay())) {
    return 'Prestige is closed on Sunday. Choose a day from Monday to Saturday.';
  }
  return '';
}

function readyDocuments() {
  return Array.from(checklist.querySelectorAll('input:checked')).map((input) => input.value);
}

// Rows for the result and whether the visitor can start on the chosen date
function buildPlan(birth, start, ready) {
  const documents = REQUIREMENTS.filter((item) => item.question);
  const missing = documents.filter((item) => !ready.includes(item.id)).map((item) => item.text.toLowerCase());
  const ageAtStart = yearsBetween(birth, start);
  const finish = addDays(start, COURSE.weeks * 7);
  const licenseFrom = birthdayAt(birth, COURSE.licenseAge);
  const oldEnough = ageAtStart >= COURSE.startAge;

  const rows = [['Age on the start date', pluralize(ageAtStart, 'year')]];
  if (oldEnough) {
    rows.push(['Course start', formatDate(start)], ['Final test by', formatDate(finish)]);
  } else {
    rows.push(['Earliest start', `${formatDate(birthdayAt(birth, COURSE.startAge))}, when you turn ${COURSE.startAge}`]);
  }
  rows.push(['License', licenseFrom <= finish
    ? 'Can be issued right after the final test'
    : `Issued from ${formatDate(licenseFrom)}, when you turn ${COURSE.licenseAge}`]);
  rows.push(['Documents', `${ready.length} of ${documents.length} ready`
    + (missing.length > 0 ? `; still needed: ${missing.join(', ')}` : '')]);

  return { rows: rows, oldEnough: oldEnough, complete: oldEnough && missing.length === 0 };
}

function renderPlan() {
  const birth = parseDate(birthInput.value);
  const start = parseDate(startInput.value);
  const birthOk = showFieldError(birthInput, birthMessage(birth));
  const startOk = showFieldError(startInput, startMessage(start));

  result.classList.remove('is-success', 'is-error');
  if (birth === null || start === null || !birthOk || !startOk) {
    result.textContent = HINT_TEXT;
    return false;
  }

  const plan = buildPlan(birth, start, readyDocuments());
  result.replaceChildren(
    createElement('p', 'fw-bold mb-2', plan.oldEnough ? 'Your plan' : 'Not yet, but soon'),
    buildRows(createElement('dl', 'row mb-0'), plan.rows),
  );
  if (plan.complete) {
    result.classList.add('is-success');
  } else if (!plan.oldEnough) {
    result.classList.add('is-error');
  }
  return true;
}

// One handler on the row of fields reacts to both date inputs
fields.addEventListener('input', (event) => {
  if (event.target.type === 'date') {
    renderPlan();
  }
});

// One handler on the checklist reacts to every checkbox
checklist.addEventListener('change', (event) => {
  if (event.target.type === 'checkbox') {
    renderPlan();
  }
});

resetButton.addEventListener('click', () => {
  birthInput.value = '';
  startInput.value = '';
  checklist.querySelectorAll('input').forEach((input) => { input.checked = false; });
  renderPlan();
  birthInput.focus();
});
