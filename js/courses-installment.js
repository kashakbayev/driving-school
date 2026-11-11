'use strict';

// Installment calculator and plan request on courses.html. jQuery; the whole section is built here.

$(function () {
  const COURSES = [
    { id: 'category-b', title: 'Category B', price: 145000, weeks: 6, hours: 56, maxMonths: 6 },
    { id: 'intensive', title: 'Intensive Category B', price: 165000, weeks: 3, hours: 56, maxMonths: 6 },
    { id: 'refresher', title: 'Defensive Driving', price: 45000, weeks: 1, hours: 10, maxMonths: 3 },
  ];
  const TERMS = [3, 6];
  const FADE_MS = 400;
  const HINT_TEXT = 'Choose a course and an installment term to see the payment schedule.';
  const NOTE_TEXT = 'This is a sample calculation. Please confirm the installment terms with the driving school. '
    + 'Nothing is sent anywhere yet, and this is not a contract.';

  const NAME_PATTERN = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;
  const PHONE_PATTERN = /^(?:\+7|8)7\d{9}$/; // Kazakhstan mobile, after spaces, brackets and hyphens are removed
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const kztFormat = new Intl.NumberFormat('en-US');

  function formatKzt(amount) {
    return `${kztFormat.format(amount)} KZT`;
  }

  function pluralize(count, word) {
    return `${count} ${count === 1 ? word : `${word}s`}`;
  }

  function findCourse(id) {
    return COURSES.find((course) => course.id === id);
  }

  // Equal monthly payments; the last one absorbs the rounding, so the total is exactly the price
  function calculatePayments(price, months) {
    const payment = Math.round(price / months);
    const lastPayment = price - payment * (months - 1);
    return Array.from({ length: months }, (_, index) => (index === months - 1 ? lastPayment : payment));
  }

  // The calendar month of a payment, counted from the current month
  function paymentMonth(index) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + index);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  function buildSelect(placeholder, options) {
    const $select = $('<select>', { class: 'form-select' })
      .append($('<option>', { value: '', text: placeholder }));
    $.each(options, function (index, option) {
      $('<option>', { value: option.value, text: option.text }).appendTo($select);
    });
    return $select;
  }

  // A label, the field and an empty <small> for its error message, in one grid column
  function buildField(id, labelText, $control, columnClass) {
    $control.attr({ id: id, name: id, required: true, 'aria-describedby': `${id}-error` });
    return $('<div>', { class: columnClass }).append(
      $('<label>', { class: 'form-label fw-semibold', for: id, text: labelText }),
      $control,
      $('<small>', { class: 'field-message is-hidden', id: `${id}-error` }),
    );
  }

  const $course = buildSelect('Choose a course', COURSES.map((course) => (
    { value: course.id, text: `${course.title} (${formatKzt(course.price)})` })));
  const $months = buildSelect('Choose a term', TERMS.map((months) => (
    { value: months, text: pluralize(months, 'month') })));
  const $name = $('<input>', { type: 'text', class: 'form-control', autocomplete: 'name', placeholder: 'First and last name' });
  const $phone = $('<input>', { type: 'tel', class: 'form-control', autocomplete: 'tel', inputmode: 'tel', placeholder: '+7 701 123 45 67' });
  const $email = $('<input>', { type: 'email', class: 'form-control', autocomplete: 'email', placeholder: 'name@example.com' });
  const $consent = $('<input>', {
    type: 'checkbox', class: 'form-check-input', id: 'installment-consent', name: 'installment-consent',
    required: true, 'aria-describedby': 'installment-consent-error',
  });

  const $result = $('<div>', { class: 'status-message mt-0', id: 'installment-result', 'aria-live': 'polite', text: HINT_TEXT });
  const $success = $('<p>', { class: 'status-message is-success mb-0', id: 'installment-success' }).hide();

  const $form = $('<form>', { class: 'bg-white rounded-4 shadow-sm p-3 p-md-4', id: 'installment-form', 'aria-describedby': 'installment-note' })
    .append(
      $('<div>', { class: 'row g-3' }).append(
        buildField('installment-course', 'Course', $course, 'col-12 col-md-6'),
        buildField('installment-months', 'Installment term', $months, 'col-12 col-md-6'),
        $('<div>', { class: 'col-12' }).append($result),
        $('<p>', { class: 'col-12 fw-semibold mb-0', text: 'Want this plan? Leave your contacts and Prestige will call you to confirm it.' }),
        buildField('installment-name', 'Full name', $name, 'col-12 col-lg-4'),
        buildField('installment-phone', 'Phone', $phone, 'col-12 col-md-6 col-lg-4'),
        buildField('installment-email', 'E-mail', $email, 'col-12 col-md-6 col-lg-4'),
        $('<div>', { class: 'col-12' }).append(
          $('<div>', { class: 'form-check' }).append(
            $consent,
            $('<label>', { class: 'form-check-label', for: 'installment-consent', text: 'Prestige may call or e-mail me about this installment plan.' }),
            $('<small>', { class: 'field-message is-hidden', id: 'installment-consent-error' }),
          ),
        ),
        $('<div>', { class: 'col-12 d-flex flex-wrap gap-2' }).append(
          $('<button>', { type: 'submit', class: 'btn btn-primary', id: 'installment-submit', text: 'Request this plan' }),
          $('<button>', { type: 'reset', class: 'btn btn-outline-secondary', id: 'installment-reset', text: 'Clear form' }),
        ),
      ),
      $('<div>', { role: 'status' }).append($success),
      $('<p>', { class: 'small text-body-secondary mt-3 mb-0', id: 'installment-note', text: NOTE_TEXT }),
    );

  $('<section>', { class: 'pb-5', id: 'installment-calculator', 'aria-labelledby': 'installment-title' })
    .append(
      $('<div>', { class: 'text-center mx-auto section-heading mb-4' }).append(
        $('<p>', { class: 'eyebrow fw-bold text-uppercase mb-2', text: 'Pay in parts' }),
        $('<h2>', { class: 'display-6 fw-bold mb-2', id: 'installment-title', text: 'Installment calculator' }),
        $('<p>', { class: 'text-body-secondary mb-0', text: `Split the course price into ${TERMS.join(' or ')} monthly payments with no overpayment.` }),
      ),
      $form,
    )
    .insertAfter('#course-comparison');

  function renderPlan(course, months) {
    const payments = calculatePayments(course.price, months);
    const first = payments[0];
    const last = payments[payments.length - 1];
    const total = payments.reduce((sum, payment) => sum + payment, 0);

    const $schedule = $('<ul>', { class: 'mb-2', id: 'installment-schedule' });
    $.each(payments, function (index, payment) {
      $('<li>').text(`${paymentMonth(index)} — ${formatKzt(payment)}`).appendTo($schedule);
    });

    const $facts = $('<dl>', { class: 'row mb-0' });
    $.each([
      ['Course', `${course.title}: ${pluralize(course.weeks, 'week')}, ${course.hours} academic hours`],
      ['Full price', formatKzt(course.price)],
      ['Term', `${pluralize(months, 'month')}, ${paymentMonth(0)} to ${paymentMonth(months - 1)}`],
      ['Monthly payment', first === last ? formatKzt(first) : `${formatKzt(first)} (last payment ${formatKzt(last)})`],
    ], function (index, row) {
      $facts.append($('<dt>', { class: 'col-sm-4', text: row[0] }), $('<dd>', { class: 'col-sm-8', text: row[1] }));
    });

    $result.empty().append(
      $('<p>', { class: 'fw-bold mb-2', text: 'Your installment plan' }),
      $facts,
      $('<p>', { class: 'fw-semibold mb-1', text: 'Payment schedule' }),
      $schedule,
      $('<p>', { class: 'small mb-0', text: `Total: ${formatKzt(total)}, the same as the course price.` }),
    );
  }

  function updatePlan() {
    const course = findCourse(fieldValue($course));
    const months = Number(fieldValue($months));
    if (course !== undefined && TERMS.includes(months) && months <= course.maxMonths) {
      renderPlan(course, months);
    } else {
      $result.text(HINT_TEXT);
    }
  }

  const RULES = {
    'installment-course': (id) => (findCourse(id) !== undefined ? '' : 'Choose a course.'),
    'installment-months': function (value) {
      const months = Number(value);
      const course = findCourse(fieldValue($course));
      if (!TERMS.includes(months)) {
        return 'Choose an installment term.';
      }
      if (course !== undefined && months > course.maxMonths) {
        return `${course.title} can be paid over ${course.maxMonths} months at most.`;
      }
      return '';
    },
    'installment-name': function (name) {
      if (name === '') {
        return 'Enter your first and last name.';
      }
      if (name.length < 2 || name.length > 60 || !NAME_PATTERN.test(name)) {
        return 'Use 2–60 letters; spaces, hyphens and apostrophes are allowed.';
      }
      return '';
    },
    'installment-phone': function (phone) {
      if (phone === '') {
        return 'Enter a phone number we can call you on.';
      }
      if (!PHONE_PATTERN.test(phone.replace(/[\s()-]/g, ''))) {
        return 'Enter a Kazakhstan mobile number, for example +7 701 123 45 67.';
      }
      return '';
    },
    'installment-email': function (email) {
      if (email === '') {
        return 'Enter your e-mail address.';
      }
      return EMAIL_PATTERN.test(email) ? '' : 'Enter an e-mail like name@example.com.';
    },
    'installment-consent': (isChecked) => (isChecked ? '' : 'Please agree to be contacted about this plan.'),
  };

  // Trimmed value of a field; for the checkbox, its live checked state
  function fieldValue($field) {
    if ($field.is(':checkbox')) {
      return $field.prop('checked');
    }
    return ($field.val() || '').trim().replace(/\s+/g, ' ');
  }

  function showFieldError($field, message) {
    const hasError = message !== '';
    $field
      .toggleClass('is-error', hasError)
      .attr('aria-invalid', String(hasError))
      .siblings('.field-message')
      .text(message)
      .toggleClass('is-hidden', !hasError);
  }

  function validateField($field) {
    const message = RULES[$field.attr('id')](fieldValue($field));
    showFieldError($field, message);
    return message === '';
  }

  const $fields = $form.find('[required]');

  // The browser's own pop-ups are off, so every wrong field gets its own message at once
  $form.prop('noValidate', true);

  // The term rule depends on the course, so the term is checked again when either select changes
  $course.add($months).on('change', function () {
    if ($months.hasClass('is-error') || fieldValue($months) !== '') {
      validateField($months);
    }
    updatePlan();
  });

  // Delegated: only fields that currently show an error are re-checked while the visitor fixes them
  $form.on('input change', '.is-error', function () {
    validateField($(this));
  });

  $form.on('input change', function () {
    $success.stop(true).fadeOut(FADE_MS);
  });

  $form.on('submit', function (event) {
    event.preventDefault();

    const $invalid = $fields.filter(function () {
      return !validateField($(this));
    });

    if ($invalid.length > 0) {
      $success.stop(true).hide();
      $invalid.first().trigger('focus');
      return;
    }

    const course = findCourse(fieldValue($course));
    const months = Number(fieldValue($months));
    const firstPayment = calculatePayments(course.price, months)[0];
    const name = fieldValue($name);
    const phone = fieldValue($phone);

    $form.trigger('reset');

    $success
      .html('<strong>Thank you!</strong> Your installment request has been received.')
      .append($('<span>', { class: 'd-block mt-1' }).text(`${name}, Prestige will call ${phone} to confirm `
        + `${course.title} in ${pluralize(months, 'monthly payment')} of about ${formatKzt(firstPayment)}, `
        + `starting in ${paymentMonth(0)}.`))
      .fadeIn(FADE_MS);
  });

  $form.on('reset', function () {
    $fields.each(function () {
      showFieldError($(this), '');
    });
    $result.text(HINT_TEXT);
    $success.stop(true).hide();
  });
});
