'use strict';

$(function () {
  const COURSES = {
    'category-b': { title: 'Category B', price: 145000, hours: 56 },
    intensive: { title: 'Intensive Category B', price: 165000, hours: 56 },
    refresher: { title: 'Defensive Driving', price: 45000, hours: 10 },
  };
  const EXTRA_HOURS = [0, 2, 4, 6];
  const FADE_MS = 300;
  const MESSAGE_MS = 5000;
  const TOTAL_HINT = 'Choose a course and extra hours to see your estimated total.';
  const kztFormat = new Intl.NumberFormat('en-US');

  const $form = $('#course-booking-form');
  const $name = $('#booking-name');
  const $course = $('#booking-course');
  const $consent = $('#booking-consent');
  const $submit = $('#booking-submit');
  const $error = $('#booking-error');
  const $success = $('#booking-success');

  function formatKzt(amount) {
    return `${kztFormat.format(amount)} KZT`;
  }

  function hourRate(course) {
    return Math.round(course.price / course.hours);
  }

  function calculateTotal(course, extraHours) {
    return course.price + extraHours * hourRate(course);
  }

  function readValue($field) {
    return ($field.val() || '').trim();
  }

  const $hours = $('<select>', {
    id: 'booking-hours',
    name: 'extra-hours',
    class: 'form-select',
    'aria-describedby': 'booking-hours-error',
  }).append($('<option>', { value: '', text: 'Choose extra hours' }));

  $.each(EXTRA_HOURS, function (index, hours) {
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

  const $checkedFields = $('#booking-name, #booking-phone, #booking-course, #booking-hours');

  const RULES = {
    'booking-name': { message: 'Enter your first and last name.', isValid: (value) => value !== '' },
    'booking-phone': { message: 'Enter a phone number we can call you on.', isValid: (value) => value !== '' },
    'booking-course': { message: 'Choose a course.', isValid: (value) => Object.hasOwn(COURSES, value) },
    'booking-hours': {
      message: 'Choose how many extra hours you want (no extra hours is fine).',
      isValid: (value) => value !== '' && EXTRA_HOURS.includes(Number(value)),
    },
  };

  $error.add($success).hide().removeClass('is-hidden');

  function updateTotal() {
    const course = COURSES[readValue($course)];
    const hoursValue = readValue($hours);
    const isReady = course !== undefined && hoursValue !== '';

    $total.toggleClass('is-success', isReady);
    if (!isReady) {
      $total.text(TOTAL_HINT);
      return;
    }

    const extraHours = Number(hoursValue);
    const details = extraHours === 0
      ? `${course.title}, no extra hours`
      : `${course.title} ${formatKzt(course.price)} + ${extraHours} h × ${formatKzt(hourRate(course))}`;
    $total.text(`Estimated total: ${formatKzt(calculateTotal(course, extraHours))} (${details})`);
  }

  function setFieldError($field, message) {
    const hasError = message !== '';
    const $message = $field.closest('.col-12').find('.form-message');
    $field.toggleClass('is-error', hasError).attr('aria-invalid', String(hasError));
    $message.text(message).toggleClass('is-hidden', !hasError);
  }

  function validateField($field) {
    const rule = RULES[$field.attr('id')];
    const isValid = rule.isValid(readValue($field));
    setFieldError($field, isValid ? '' : rule.message);
    return isValid;
  }

  const requestedCourse = new URLSearchParams(window.location.search).get('course');
  if (requestedCourse !== null && Object.hasOwn(COURSES, requestedCourse)) {
    $course.val(requestedCourse);
  }
  updateTotal();

  $course.add($hours).on('change', updateTotal);

  $consent.on('change', function () {
    $submit.prop('disabled', !$(this).prop('checked'));
  });
  $consent.trigger('change');

  $form.on('input change', '.is-error', function () {
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
      $success.stop(true).hide();
      $error.stop(true).fadeIn(FADE_MS);
      $invalid.first().trigger('focus');
      return;
    }

    const course = COURSES[readValue($course)];
    const total = calculateTotal(course, Number(readValue($hours)));

    $success.html('<strong>Thank you!</strong> Your application has been received.');
    $('<span>', { class: 'd-block mt-1' })
      .text(`${readValue($name)}, Prestige will call you to confirm ${course.title}. Estimated total: ${formatKzt(total)}.`)
      .appendTo($success);

    $error.stop(true).hide();
    $submit.prop('disabled', true);

    $success.stop(true).fadeIn(FADE_MS).delay(MESSAGE_MS).fadeOut(FADE_MS, function () {
      $form.trigger('reset');
    });
  });

  $form.on('reset', function () {
    $checkedFields.each(function () {
      setFieldError($(this), '');
    });
    $error.add($success).stop(true).hide();
    $total.removeClass('is-success').text(TOTAL_HINT);
    $submit.prop('disabled', true);
  });
});
