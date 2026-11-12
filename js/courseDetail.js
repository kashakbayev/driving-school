'use strict';

// Course cost estimate: the visitor picks a course and extra practice hours,
// sees the calculated total, then continues to the single enrollment form on
// index.html with both choices already filled in. Data comes from js/data.js.
$(function () {
  const FADE_MS = 300;
  const TOTAL_HINT = 'Choose a course and extra hours to see your estimated total.';
  const kztFormat = new Intl.NumberFormat('en-US');

  const $form = $('#course-booking-form');

  if (!$form.length) {
    return;
  }

  const $course = $('#booking-course');
  const $error = $('#booking-error');
  const choices = loadEnrollmentChoices();

  function formatKzt(amount) {
    return `${kztFormat.format(amount)} KZT`;
  }

  function readValue($field) {
    return ($field.val() || '').trim();
  }

  // Course options are built from the shared PROGRAMS array, so prices here
  // always match the Courses page and the enrollment form.
  $course.empty().append($('<option>', { value: '', text: 'Choose a course', disabled: true }));
  $.each(PROGRAMS, function (index, program) {
    $('<option>', {
      value: program.id,
      text: `${program.name} (${formatKzt(program.price)})`,
      selected: program.id === 'category-b',
    }).appendTo($course);
  });

  const $hours = $('<select>', {
    id: 'booking-hours',
    name: 'extra-hours',
    class: 'form-select',
    'aria-describedby': 'booking-hours-error',
  }).append($('<option>', { value: '', text: 'Choose extra hours', selected: true }));

  $.each(EXTRA_HOURS_OPTIONS, function (index, hours) {
    $('<option>', { value: hours, text: hours === 0 ? 'No extra hours' : `${hours} extra hours` }).appendTo($hours);
  });

  const $hoursColumn = $('<div>', { class: 'col-12 col-md-6' })
    .append(
      $('<label>', { for: 'booking-hours', class: 'form-label fw-semibold', text: 'Extra practice hours' }),
      $hours,
      $('<small>', { id: 'booking-hours-error', class: 'form-message is-hidden' }),
    )
    .insertAfter($course.closest('.col-12'));

  const $total = $('<p>', { id: 'booking-total', class: 'status-message mt-0 mb-0', 'aria-live': 'polite' });
  $('<div>', { class: 'col-12' }).append($total).insertAfter($hoursColumn);

  const $checkedFields = $course.add($hours);

  const RULES = {
    'booking-course': {
      message: 'Choose a course.',
      isValid: ($field) => findById(PROGRAMS, readValue($field)) !== null,
    },
    'booking-hours': {
      message: 'Choose how many extra hours you want (no extra hours is fine).',
      isValid: ($field) => readValue($field) !== '' && EXTRA_HOURS_OPTIONS.includes(Number(readValue($field))),
    },
  };

  $error.hide().removeClass('is-hidden');

  function updateTotal() {
    const program = findById(PROGRAMS, readValue($course));
    const hoursValue = readValue($hours);
    const isReady = program !== null && hoursValue !== '';

    $total.toggleClass('is-success', isReady);
    if (!isReady) {
      $total.text(TOTAL_HINT);
      return;
    }

    const extraHours = Number(hoursValue);
    const details = extraHours === 0
      ? `${program.name}, no extra hours`
      : `${program.name} ${formatKzt(program.price)} + ${extraHours} h × ${formatKzt(EXTRA_HOUR_PRICE)}`;
    $total.text(`Estimated total: ${formatKzt(calculateProgramTotal(program, extraHours))} (${details})`);
  }

  function setFieldError($field, message) {
    const hasError = message !== '';
    const $message = $field.closest('.col-12').find('.form-message');
    $field.toggleClass('is-error', hasError).attr('aria-invalid', String(hasError));
    $message.text(message).toggleClass('is-hidden', !hasError);
  }

  function validateField($field) {
    const rule = RULES[$field.attr('id')];
    const isValid = rule.isValid($field);
    setFieldError($field, isValid ? '' : rule.message);
    return isValid;
  }

  // Restore what the visitor already chose in this tab.
  if (findById(PROGRAMS, choices.programId)) {
    $course.val(choices.programId);
  }
  if (EXTRA_HOURS_OPTIONS.includes(choices.extraHours)) {
    $hours.val(String(choices.extraHours));
  }
  updateTotal();

  $checkedFields.on('change', updateTotal);

  // Delegated to the form: fields only get .is-error after a failed submit,
  // so this handler clears each error as soon as the visitor fixes it.
  $form.on('change', '.is-error', function () {
    if (validateField($(this)) && $checkedFields.filter('.is-error').length === 0) {
      $error.stop(true).fadeOut(FADE_MS);
    }
  });

  $form.on('submit', function (event) {
    event.preventDefault();

    const $invalid = $checkedFields.filter(function () {
      return !validateField($(this));
    });

    if ($invalid.length > 0) {
      $error.stop(true).fadeIn(FADE_MS);
      $invalid.first().trigger('focus');
      return;
    }

    saveEnrollmentChoice('programId', readValue($course));
    saveEnrollmentChoice('extraHours', Number(readValue($hours)));
    window.location.href = 'index.html#enrollment-form';
  });

  $form.on('reset', function () {
    $checkedFields.each(function () {
      setFieldError($(this), '');
    });
    $error.stop(true).hide();
    // Form values are restored only after the reset event, so recalculate afterwards.
    setTimeout(updateTotal, 0);
  });
});
