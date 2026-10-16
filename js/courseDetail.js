'use strict';

const NAME_MAX_LENGTH = 60;

const NAME_PATTERN = /^\p{L}[\p{L}\p{M}]*(?:(?:[ '’-]|\. ?)\p{L}[\p{L}\p{M}]*)*\.?$/u;

const PHONE_CHARACTERS_PATTERN = /^\+?[\d\s()-]+$/;

const KZ_PHONE_PATTERN = /^(?:\+7|8|7)(7\d{9})$/;
const PHONE_EXAMPLE = '+7 (701) 123-45-67';

const PHONE_MASK_TEMPLATE = '+7 (7__) ___-__-__';
const PHONE_SLOT_POSITIONS = Array.from(PHONE_MASK_TEMPLATE)
  .flatMap((char, index) => (char === '_' ? [index] : []));
const PHONE_MASK_PREFIX = PHONE_MASK_TEMPLATE.slice(0, PHONE_SLOT_POSITIONS[0]);

const MAX_MONTHS_AHEAD = 12;

function normalizeSpaces(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function validateName(value) {
  const name = normalizeSpaces(value);
  if (name === '') {
    return 'Enter your first and last name.';
  }
  const letterCount = (name.match(/\p{L}/gu) || []).length;
  if (letterCount < 2) {
    return 'The name must contain at least 2 letters.';
  }
  if (name.length > NAME_MAX_LENGTH) {
    return `The name must be ${NAME_MAX_LENGTH} characters or fewer.`;
  }
  if (!NAME_PATTERN.test(name)) {
    return 'Use only letters, spaces, hyphens and apostrophes.';
  }
  return '';
}

function compactPhone(value) {
  return value.trim().replace(/[\s()-]/g, '');
}

function validatePhone(value) {
  const phone = value.replace(/_/g, '').trim();
  if (phone === '' || value === PHONE_MASK_TEMPLATE) {
    return 'Enter a phone number we can call you on.';
  }
  if (!PHONE_CHARACTERS_PATTERN.test(phone)) {
    return 'Use digits only; spaces, brackets and hyphens are allowed.';
  }
  const digitCount = phone.replace(/\D/g, '').length;
  if (digitCount < 11) {
    return `The number is incomplete. Example: ${PHONE_EXAMPLE}.`;
  }
  if (digitCount > 11) {
    return `The number has too many digits. Example: ${PHONE_EXAMPLE}.`;
  }
  if (!KZ_PHONE_PATTERN.test(compactPhone(phone))) {
    return `Enter a Kazakhstan number, for example ${PHONE_EXAMPLE}.`;
  }
  return '';
}

function formatPhone(value) {
  const nationalNumber = compactPhone(value).match(KZ_PHONE_PATTERN)[1];
  return renderPhoneMask(nationalNumber.slice(1));
}

function renderPhoneMask(digits) {
  const chars = Array.from(PHONE_MASK_TEMPLATE);
  Array.from(digits).forEach((digit, index) => {
    chars[PHONE_SLOT_POSITIONS[index]] = digit;
  });
  return chars.join('');
}

function readMaskDigits(value) {
  return PHONE_SLOT_POSITIONS
    .map((position) => value.charAt(position))
    .filter((char) => /\d/.test(char))
    .join('');
}

function isPhoneMask(value) {
  return value === renderPhoneMask(readMaskDigits(value));
}

function getMaskDigitsFromText(text) {
  const digits = text.replace(/\D/g, '');

  const hasCountryCode = text.trim().startsWith('+7') || (digits.length === 11 && /^[78]/.test(digits));
  const nationalNumber = hasCountryCode ? digits.slice(1) : digits;
  if (nationalNumber.length > 10 || (nationalNumber.length === 10 && !nationalNumber.startsWith('7'))) {
    return null;
  }

  const isWrittenInFull = hasCountryCode || nationalNumber.length === 10;
  return isWrittenInFull && nationalNumber.startsWith('7') ? nationalNumber.slice(1) : nationalNumber;
}

function getSlotIndex(position) {
  return PHONE_SLOT_POSITIONS.filter((slot) => slot < position).length;
}

function getCaretPosition(slotIndex) {
  return slotIndex < PHONE_SLOT_POSITIONS.length ? PHONE_SLOT_POSITIONS[slotIndex] : PHONE_MASK_TEMPLATE.length;
}

function initPhoneMask(input) {
  let valueOnFocus = '';

  function showDigits(digits, caretSlot) {
    input.value = renderPhoneMask(digits);
    if (document.activeElement === input) {
      const caret = getCaretPosition(caretSlot);
      input.setSelectionRange(caret, caret);
    }
  }

  function editDigits(event) {
    const type = event.inputType;
    const digits = readMaskDigits(input.value);
    const start = Math.min(getSlotIndex(input.selectionStart), digits.length);
    const end = Math.min(getSlotIndex(input.selectionEnd), digits.length);

    if (type.startsWith('insert')) {
      const text = event.data || (event.dataTransfer ? event.dataTransfer.getData('text/plain') : '');
      const typed = text.replace(/\D/g, '');
      if (typed === '') {
        return null;
      }
      if (typed.length >= 10 || text.trim().startsWith('+')) {
        const newDigits = getMaskDigitsFromText(text);
        return newDigits === null ? null : { digits: newDigits, caret: newDigits.length };
      }
      const newDigits = (digits.slice(0, start) + typed + digits.slice(end)).slice(0, PHONE_SLOT_POSITIONS.length);
      return { digits: newDigits, caret: Math.min(start + typed.length, newDigits.length) };
    }

    let from = start;
    let to = end;
    if (from === to) {
      if (type === 'deleteContentBackward') {
        from = Math.max(from - 1, 0);
      } else if (type === 'deleteContentForward') {
        to = Math.min(to + 1, digits.length);
      } else if (type.endsWith('Backward')) {
        from = 0;
      } else if (type.endsWith('Forward')) {
        to = digits.length;
      }
    }
    return { digits: digits.slice(0, from) + digits.slice(to), caret: from };
  }

  input.placeholder = PHONE_MASK_TEMPLATE;

  input.addEventListener('focus', () => {
    valueOnFocus = input.value;
    if (input.value === '') {
      showDigits('', 0);
    }
  });

  input.addEventListener('blur', () => {
    if (input.value === PHONE_MASK_TEMPLATE) {
      input.value = '';
    }
  
    if (input.value !== valueOnFocus) {
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  input.addEventListener('beforeinput', (event) => {
    const type = event.inputType;
    const isEdit = type.startsWith('insert') || type.startsWith('delete');
    const isMasked = input.value === '' || isPhoneMask(input.value);
    if (!event.cancelable || !isMasked || !(isEdit || type.startsWith('history'))) {
      return;
    }

    event.preventDefault();
    const result = isEdit ? editDigits(event) : null;
    if (result !== null) {
      showDigits(result.digits, result.caret);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  input.addEventListener('input', () => {
    const { value } = input;
    if (value === '' || isPhoneMask(value)) {
      return;
    }
    const digits = value.startsWith(PHONE_MASK_PREFIX)
      ? value.slice(PHONE_MASK_PREFIX.length).replace(/\D/g, '').slice(0, PHONE_SLOT_POSITIONS.length)
      : getMaskDigitsFromText(value);
    
    if (digits !== null) {
      showDigits(digits, digits.length);
    }
  });
}

function toIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseIsoDate(value) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!parts) {
    return null;
  }
  const [year, month, day] = parts.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  const isRealDay = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isRealDay ? date : null;
}

function getDateLimits() {
  const today = new Date();
  const latest = new Date(today.getFullYear(), today.getMonth() + MAX_MONTHS_AHEAD, today.getDate());
  return { min: toIsoDate(today), max: toIsoDate(latest) };
}

function validateStartDate(value, isIncomplete) {
  if (isIncomplete) {
    return 'Enter the full date: day, month and year.';
  }
  if (value === '') {
    return '';
  }
  if (parseIsoDate(value) === null) {
    return 'Enter a valid date.';
  }
  const limits = getDateLimits();
  
  if (value < limits.min) {
    return 'The start date cannot be in the past.';
  }
  if (value > limits.max) {
    return `Choose a date within the next ${MAX_MONTHS_AHEAD} months.`;
  }
  return '';
}

function formatDate(isoDate) {
  return parseIsoDate(isoDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function validateChoice(select, errorText) {
  const option = select.options[select.selectedIndex];
  return option && !option.disabled && option.value !== '' ? '' : errorText;
}

function getSelectedText(select) {
  return select.options[select.selectedIndex].textContent.trim();
}

function getStateClasses(control) {
  return control.tagName === 'SELECT'
    ? { error: 'is-invalid', success: 'is-valid' }
    : { error: 'is-error', success: 'is-success' };
}

function showFieldResult(field, errorText) {
  const { control, message } = field;
  const stateClasses = getStateClasses(control);
  const isValid = errorText === '';
  control.classList.toggle(stateClasses.error, !isValid);
  control.classList.toggle(stateClasses.success, isValid && control.type !== 'checkbox' && control.value !== '');
  control.setAttribute('aria-invalid', String(!isValid));
  if (!isValid) {
    message.textContent = errorText;
  }
  message.classList.toggle('is-hidden', isValid);
}

function clearFieldResult(field) {
  const stateClasses = getStateClasses(field.control);
  field.control.classList.remove(stateClasses.error, stateClasses.success);
  field.control.removeAttribute('aria-invalid');
  field.message.classList.add('is-hidden');
}

function renderSummary(container, entries) {
  const title = document.createElement('p');
  title.classList.add('fw-semibold', 'mb-2');
  title.textContent = 'Your application';

  const list = document.createElement('dl');
  list.classList.add('row', 'mb-0');
  entries.forEach(([term, value]) => {
    const termElement = document.createElement('dt');
    termElement.classList.add('col-sm-4');
    termElement.textContent = term;
    const valueElement = document.createElement('dd');
    valueElement.classList.add('col-sm-8');
    valueElement.textContent = value;
    list.append(termElement, valueElement);
  });

  container.replaceChildren(title, list);
}

function initBookingForm(form) {
  const byId = (id) => document.getElementById(id);
  const nameInput = byId('booking-name');
  const phoneInput = byId('booking-phone');
  const courseSelect = byId('booking-course');
  const timeSelect = byId('booking-time');
  const dateInput = byId('booking-date');
  const consentInput = byId('booking-consent');
  const errorStatus = byId('booking-error');
  const successStatus = byId('booking-success');
  const resultBox = byId('booking-result');

  const fields = [
    { control: nameInput, message: byId('booking-name-error'), validate: () => validateName(nameInput.value) },
    { control: phoneInput, message: byId('booking-phone-error'), validate: () => validatePhone(phoneInput.value) },
    { control: courseSelect, message: byId('booking-course-error'), validate: () => validateChoice(courseSelect, 'Choose a course.') },
    { control: timeSelect, message: byId('booking-time-error'), validate: () => validateChoice(timeSelect, 'Choose a preferred lesson time.') },
    { control: dateInput, message: byId('booking-date-error'), validate: () => validateStartDate(dateInput.value, dateInput.validity.badInput) },
    {
      control: consentInput,
      message: byId('booking-consent-error'),
      validate: () => (consentInput.checked ? '' : 'Your consent is required to send the application.'),
    },
  ];
  const validatedControls = new Set();

  function showStatus(type) {
    errorStatus.classList.toggle('is-hidden', type !== 'error');
    successStatus.classList.toggle('is-hidden', type !== 'success');
    resultBox.classList.toggle('is-hidden', type !== 'success');
    if (type !== 'success') {
      resultBox.replaceChildren();
    }
  }

  function validateField(field) {
    const errorText = field.validate();
    showFieldResult(field, errorText);
    validatedControls.add(field.control);
    // The general error goes away once every highlighted field is fixed.
    if (!fields.some((item) => item.control.getAttribute('aria-invalid') === 'true')) {
      errorStatus.classList.add('is-hidden');
    }
    return errorText === '';
  }

  function collectSummary() {
    const transmission = form.querySelector('input[name="transmission"]:checked');
    return [
      ['Name', normalizeSpaces(nameInput.value)],
      ['Phone', formatPhone(phoneInput.value)],
      ['Course', getSelectedText(courseSelect)],
      ['Lesson time', getSelectedText(timeSelect)],
      ['Start date', dateInput.value === '' ? 'To be agreed by phone' : formatDate(dateInput.value)],
      ['Transmission', transmission ? transmission.labels[0].textContent.trim() : 'Not specified'],
    ];
  }

  form.noValidate = true;

  initPhoneMask(phoneInput);

  const dateLimits = getDateLimits();
  dateInput.min = dateLimits.min;
  dateInput.max = dateLimits.max;

  const requestedCourse = new URLSearchParams(window.location.search).get('course');
  const hasRequestedCourse = Array.from(courseSelect.options)
    .some((option) => option.value === requestedCourse && !option.disabled);
  if (hasRequestedCourse) {
    courseSelect.value = requestedCourse;
  }

  fields.forEach((field) => {
    field.control.addEventListener('change', () => validateField(field));
    
    field.control.addEventListener('input', () => {
      if (validatedControls.has(field.control)) {
        validateField(field);
      }
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const invalidFields = fields.filter((field) => !validateField(field));
    if (invalidFields.length > 0) {
      showStatus('error');
      invalidFields[0].control.focus();
      return;
    }

    const summary = collectSummary();

    form.reset();
    renderSummary(resultBox, summary);
    showStatus('success');
  });

  form.addEventListener('reset', () => {
    fields.forEach(clearFieldResult);
    validatedControls.clear();
    showStatus(null);
  });
}

const bookingForm = document.getElementById('course-booking-form');
if (bookingForm) {
  initBookingForm(bookingForm);
}
