'use strict';

const installmentCourses = [
  { id: 'category-b', title: 'Category B', price: 145000, weeks: 6, hours: 56, maxMonths: 6 },
  { id: 'intensive', title: 'Intensive Category B', price: 165000, weeks: 3, hours: 56, maxMonths: 6 },
  { id: 'refresher', title: 'Defensive Driving', price: 45000, weeks: 1, hours: 10, maxMonths: 3 },
];
const INSTALLMENT_TERMS = [3, 6];

const HINT_TEXT = 'Choose a course and an installment term.';
const NOTE_TEXT = 'This is a sample calculation. Please confirm the installment terms with the driving school. '
  + 'No data is sent anywhere, and this is not a contract.';

const kztFormat = new Intl.NumberFormat('en-US');

function formatKzt(amount) {
  return `${kztFormat.format(amount)} KZT`;
}

function pluralize(count, word) {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

function calculatePayments(price, months) {
  const payment = Math.round(price / months);
  const lastPayment = price - payment * (months - 1);
  return Array.from({ length: months }, (_, index) => (index === months - 1 ? lastPayment : payment));
}

function validateInstallment(course, months) {
  const errors = { course: '', months: '' };
  if (course === undefined) {
    errors.course = 'Error: choose a course.';
  }
  if (!INSTALLMENT_TERMS.includes(months)) {
    errors.months = 'Error: choose an installment term.';
  } else if (course !== undefined && months > course.maxMonths) {
    errors.months = `Error: ${course.title} can be paid over ${course.maxMonths} months at most.`;
  }
  return errors;
}

function buildElement(tagName, attributes = {}, text = '') {
  const element = document.createElement(tagName);
  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });
  if (text !== '') {
    element.textContent = text;
  }
  return element;
}

function createScheduleList(payments) {
  const list = buildElement('ul', { class: 'mb-2', id: 'installment-schedule' });
  payments.forEach((payment, index) => {
    list.append(buildElement('li', {}, `Month ${index + 1} — ${formatKzt(payment)}`));
  });
  return list;
}

function renderPlan(container, course, months) {
  const payments = calculatePayments(course.price, months);
  const firstPayment = payments[0];
  const lastPayment = payments[payments.length - 1];
  const monthlyText = firstPayment === lastPayment
    ? formatKzt(firstPayment)
    : `${formatKzt(firstPayment)} (last payment ${formatKzt(lastPayment)})`;
  const total = payments.reduce((sum, payment) => sum + payment, 0);

  const facts = buildElement('dl', { class: 'row mb-0' });
  [
    ['Course', `${course.title}: ${pluralize(course.weeks, 'week')}, ${course.hours} academic hours`],
    ['Full price', formatKzt(course.price)],
    ['Term', pluralize(months, 'month')],
    ['Monthly payment', monthlyText],
  ].forEach(([term, value]) => {
    facts.append(buildElement('dt', { class: 'col-sm-4' }, term), buildElement('dd', { class: 'col-sm-8' }, value));
  });

  container.replaceChildren(
    buildElement('p', { class: 'fw-bold mb-2' }, 'Your installment plan'),
    facts,
    buildElement('p', { class: 'fw-semibold mb-1' }, 'Payment schedule'),
    createScheduleList(payments),
    buildElement('p', { class: 'small mb-0' }, `Total: ${formatKzt(total)}, the same as the course price.`),
  );
}

function buildSelectField(id, labelText, placeholder, options) {
  const errorId = `${id}-error`;
  const group = buildElement('div', { class: 'rounded-3 p-2' });
  const select = buildElement('select', { class: 'form-select', id, name: id, 'aria-describedby': errorId });
  select.append(buildElement('option', { value: '' }, placeholder));
  options.forEach((option) => {
    select.append(buildElement('option', { value: option.value }, option.text));
  });
  const message = buildElement('p', { class: 'small mt-1 mb-0 is-hidden', id: errorId });
  group.append(buildElement('label', { class: 'form-label fw-semibold', for: id }, labelText), select, message);
  return { group, select, message };
}

function showFieldError(field, errorText) {
  const hasError = errorText !== '';
  field.group.classList.toggle('is-error', hasError);
  field.select.setAttribute('aria-invalid', String(hasError));
  field.message.textContent = errorText;
  field.message.classList.toggle('is-hidden', !hasError);
}

function initInstallmentCalculator(comparisonSection) {
  const section = buildElement('section', { class: 'pb-5', id: 'installment-calculator', 'aria-labelledby': 'installment-title' });
  const heading = buildElement('div', { class: 'text-center mx-auto section-heading mb-4' });
  heading.append(
    buildElement('p', { class: 'eyebrow fw-bold text-uppercase mb-2' }, 'Pay in parts'),
    buildElement('h2', { class: 'display-6 fw-bold mb-2', id: 'installment-title' }, 'Installment calculator'),
    buildElement('p', { class: 'text-body-secondary mb-0' },
      `Split the course price into ${INSTALLMENT_TERMS.join(' or ')} monthly payments with no overpayment.`),
  );

  const courseField = buildSelectField('installment-course', 'Course', 'Choose a course',
    installmentCourses.map((course) => ({ value: course.id, text: `${course.title} (${formatKzt(course.price)})` })));
  const monthsField = buildSelectField('installment-months', 'Installment term', 'Choose a term',
    INSTALLMENT_TERMS.map((months) => ({ value: String(months), text: pluralize(months, 'month') })));

  const fieldsRow = buildElement('div', { class: 'row g-2' });
  [courseField, monthsField].forEach((field) => {
    const column = buildElement('div', { class: 'col-12 col-md-6' });
    column.append(field.group);
    fieldsRow.append(column);
  });

  const buttons = buildElement('div', { class: 'd-flex flex-wrap gap-2 mt-2 px-2' });
  buttons.append(
    buildElement('button', { type: 'submit', class: 'btn btn-primary', id: 'installment-submit' }, 'Calculate'),
    buildElement('button', { type: 'reset', class: 'btn btn-outline-secondary', id: 'installment-reset' }, 'Reset'),
  );

  const result = buildElement('div', { class: 'status-message', id: 'installment-result', 'aria-live': 'polite' }, HINT_TEXT);
  const note = buildElement('p', { class: 'small text-body-secondary mt-3 mb-0', id: 'installment-note' }, NOTE_TEXT);

  const form = buildElement('form', { class: 'bg-white rounded-4 shadow-sm p-3 p-md-4', id: 'installment-form', 'aria-describedby': 'installment-note' });
  form.append(fieldsRow, buttons, result, note);
  section.append(heading, form);
  comparisonSection.after(section);

  let wasSubmitted = false;

  function showHint() {
    result.classList.remove('is-success');
    result.textContent = HINT_TEXT;
  }

  function update(isSubmit) {
    const course = installmentCourses.find((item) => item.id === courseField.select.value);
    const months = Number(monthsField.select.value);
    const errors = validateInstallment(course, months);
    wasSubmitted = wasSubmitted || isSubmit;

    showFieldError(courseField, wasSubmitted || courseField.select.value !== '' ? errors.course : '');
    showFieldError(monthsField, wasSubmitted || monthsField.select.value !== '' ? errors.months : '');

    if (errors.course !== '' || errors.months !== '') {
      showHint();
      if (isSubmit) {
        const firstInvalid = errors.course !== '' ? courseField : monthsField;
        firstInvalid.select.focus();
      }
      return;
    }

    renderPlan(result, course, months);
    result.classList.add('is-success');
  }

  courseField.select.addEventListener('change', () => update(false));
  monthsField.select.addEventListener('change', () => update(false));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    update(true);
  });

  form.addEventListener('reset', () => {
    wasSubmitted = false;
    showFieldError(courseField, '');
    showFieldError(monthsField, '');
    showHint();
  });
}

const comparisonSection = document.getElementById('course-comparison');
if (comparisonSection) {
  initInstallmentCalculator(comparisonSection);
}
