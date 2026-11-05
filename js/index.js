'use strict';

const TRAINING_PROGRAMS = [
    {
        id: 'category-b',
        name: 'Category B',
        price: 145000,
        weeks: 6,
        hours: 56,
        minimumAge: 17
    },
    {
        id: 'intensive',
        name: 'Intensive Category B',
        price: 165000,
        weeks: 3,
        hours: 56,
        minimumAge: 17
    },
    {
        id: 'refresher',
        name: 'Defensive Driving',
        price: 45000,
        weeks: 1,
        hours: 10,
        minimumAge: 18
    }
];

const currencyFormatter = new Intl.NumberFormat('en-KZ', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0
});

function findProgram(programId) {
    return TRAINING_PROGRAMS.find(function (program) {
        return program.id === programId;
    }) || null;
}

function getEarliestStartDate() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 2);
    return date;
}

function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

function formatLocalDate(dateValue) {
    return new Intl.DateTimeFormat('en-KZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date(dateValue + 'T00:00:00'));
}

function getStoredScheduleChoice() {
    try {
        const saved = sessionStorage.getItem('prestigeScheduleChoice');
        const choice = saved ? JSON.parse(saved) : null;

        if (
            choice &&
            typeof choice.day === 'string' &&
            typeof choice.time === 'string' &&
            typeof choice.type === 'string'
        ) {
            return choice;
        }
    } catch (error) {
        return null;
    }

    return null;
}

function createTemporaryReference() {
    return 'PSD-' + String(Math.floor(100000 + Math.random() * 900000));
}

function validateEnrollmentValues(values, earliestDate) {
    const errors = {};
    const program = findProgram(values.programId);
    const phoneDigits = values.phone.replace(/\D/g, '');
    const phonePattern = /^\+?[\d\s()-]+$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const selectedDate = values.startDate
        ? new Date(values.startDate + 'T00:00:00')
        : null;

    if (values.fullName.length < 2 || values.fullName.length > 80) {
        errors['full-name'] = 'Enter a full name between 2 and 80 characters.';
    }

    if (
        !phonePattern.test(values.phone) ||
        phoneDigits.length < 10 ||
        phoneDigits.length > 15
    ) {
        errors.phone = 'Enter a valid phone number with 10–15 digits.';
    }

    if (!emailPattern.test(values.email)) {
        errors.email = 'Enter a valid email address, such as name@example.com.';
    }

    if (!Number.isInteger(values.age) || values.age < 16 || values.age > 100) {
        errors.age = 'Enter an age from 16 to 100.';
    }

    if (!program) {
        errors.category = 'Choose a training program.';
    } else if (Number.isInteger(values.age) && values.age < program.minimumAge) {
        errors.age = program.name + ' is available from age ' +
            program.minimumAge + '.';
    }

    if (!selectedDate || Number.isNaN(selectedDate.getTime())) {
        errors['start-date'] = 'Choose your preferred start date.';
    } else if (selectedDate < earliestDate) {
        errors['start-date'] = 'Choose a date at least two days from today.';
    }

    if (
        values.transmission !== 'automatic' &&
        values.transmission !== 'manual'
    ) {
        errors.transmission = 'Choose automatic or manual transmission.';
    }

    if (!values.agreement) {
        errors.agreement = 'Confirm that the information is correct.';
    }

    return errors;
}

// Rewritten feature 1: jQuery selectors, .val(), .prop(), traversal and effects
// replace querySelector/FormData/classList. This version is shorter at event sites.
$(function () {
    const $form = $('#enrollment-form');

    if (!$form.length) {
        return;
    }

    const earliestDate = getEarliestStartDate();
    const $programSelect = $('#category');
    const $generalError = $('#enrollment-error');
    const $confirmation = $('#enrollment-confirmation');
    const fieldOrder = [
        'full-name',
        'phone',
        'email',
        'age',
        'start-date',
        'category',
        'transmission',
        'agreement'
    ];
    let attemptedSubmit = false;

    // The required attributes remain useful browser/documentation safeguards,
    // but client-side checks can never replace validation on a real server.
    $form.attr('novalidate', 'novalidate');
    $('#start-date').attr('min', toDateInputValue(earliestDate));
    $('label[for="category"]').text('Training program');
    $('#category-error').text('Choose a training program.');

    const $emailGroup = $('<div>', {
        class: 'col-12 col-md-6'
    });
    $('<label>', {
        class: 'form-label fw-semibold',
        for: 'email',
        text: 'Email'
    }).appendTo($emailGroup);
    $('<input>', {
        class: 'form-control',
        type: 'email',
        id: 'email',
        name: 'email',
        placeholder: 'student@example.com',
        autocomplete: 'email',
        'aria-describedby': 'email-error',
        required: 'required'
    }).appendTo($emailGroup);
    $('<small>', {
        class: 'field-message is-hidden',
        id: 'email-error',
        text: 'Enter a valid email address.'
    }).appendTo($emailGroup);
    $('#phone').closest('.col-12').after($emailGroup);
    $programSelect
        .closest('.col-12')
        .removeClass('col-md-6')
        .addClass('col-md-12');

    $programSelect.empty().append(
        $('<option>', {
            value: '',
            text: 'Choose a program',
            disabled: true,
            selected: true
        })
    );

    $.each(TRAINING_PROGRAMS, function (index, program) {
        $('<option>', {
            value: program.id,
            text: program.name + ' — ' + currencyFormatter.format(program.price)
        }).appendTo($programSelect);
    });

    const $summary = $('<section>', {
        class: 'col-12 status-message bg-white',
        'aria-live': 'polite'
    }).append(
        $('<h3>', { class: 'h5', text: 'Your training estimate' }),
        $('<p>', {
            class: 'mb-2',
            'data-summary-detail': '',
            text: 'Choose a program to see its duration and price.'
        }),
        $('<p>', {
            class: 'small text-body-secondary mb-0',
            'data-summary-schedule': '',
            text: 'No schedule preference saved yet.'
        })
    );
    $('#enrollment-submit').parent().before($summary);

    function readValues() {
        return {
            fullName: String($('#full-name').val() || '').trim(),
            phone: String($('#phone').val() || '').trim(),
            email: String($('#email').val() || '').trim(),
            age: Number($('#age').val()),
            startDate: String($('#start-date').val() || ''),
            programId: String($programSelect.val() || ''),
            transmission: String(
                $('input[name="transmission"]:checked').val() || ''
            ),
            agreement: $('#agreement').prop('checked')
        };
    }

    function getControls(fieldName) {
        if (fieldName === 'transmission') {
            return $('input[name="transmission"]');
        }

        return $('#' + fieldName);
    }

    function setFieldState(fieldName, message) {
        const $controls = getControls(fieldName);
        const $message = $('#' + fieldName + '-error');
        const invalid = message !== '';

        $controls
            .toggleClass('is-error', invalid)
            .toggleClass('is-success', !invalid)
            .attr('aria-invalid', String(invalid));

        if (invalid) {
            // Chain: choose the message, stop queued effects, replace its text,
            // remove the hiding class, then reveal the current field error.
            $message
                .stop(true, true)
                .text(message)
                .removeClass('is-hidden')
                .fadeIn(150);
        } else {
            $message.stop(true, true).fadeOut(100, function () {
                $(this).addClass('is-hidden');
            });
        }
    }

    function clearFieldStates() {
        $.each(fieldOrder, function (index, fieldName) {
            getControls(fieldName)
                .removeClass('is-error is-success')
                .removeAttr('aria-invalid');
            $('#' + fieldName + '-error').stop(true, true).addClass('is-hidden');
        });
    }

    function updateSummary() {
        const values = readValues();
        const program = findProgram(values.programId);
        const schedule = getStoredScheduleChoice();
        const $detail = $summary.find('[data-summary-detail]');

        if (!program) {
            $detail.text('Choose a program to see its duration and price.');
        } else {
            const weeklyHours = program.hours / program.weeks;
            const transmission = values.transmission || 'not selected';

            // .html() is safe here because every inserted value comes from the
            // fixed program array, never from visitor-entered text.
            $detail.html(
                '<strong>' + program.name + '</strong>: ' +
                currencyFormatter.format(program.price) + ', ' +
                program.weeks + ' week' + (program.weeks === 1 ? '' : 's') +
                ', about ' + weeklyHours.toFixed(1) +
                ' hours per week. Transmission: ' + transmission + '.'
            );
        }

        $summary.find('[data-summary-schedule]').text(
            schedule
                ? 'Preferred schedule: ' + schedule.day + ' at ' +
                    schedule.time + ' (' + schedule.type + ').'
                : 'No schedule preference saved yet. Choose one on the Schedule page.'
        );
    }

    function refreshValidation() {
        const errors = validateEnrollmentValues(readValues(), earliestDate);

        $.each(fieldOrder, function (index, fieldName) {
            setFieldState(fieldName, errors[fieldName] || '');
        });

        return errors;
    }

    $form.on('input change', 'input, select, textarea', function () {
        updateSummary();

        if (attemptedSubmit) {
            refreshValidation();
        }
    });

    $form.on('submit', function (event) {
        // Without preventDefault(), the browser would navigate to the form action
        // and the visitor would lose the on-page validation and demo confirmation.
        event.preventDefault();
        attemptedSubmit = true;

        const values = readValues();
        const errors = refreshValidation();
        const firstInvalid = fieldOrder.find(function (fieldName) {
            return Object.prototype.hasOwnProperty.call(errors, fieldName);
        });

        if (firstInvalid) {
            $confirmation.stop(true, true).fadeOut(100, function () {
                $(this).addClass('is-hidden');
            });
            $generalError
                .stop(true, true)
                .text('Please correct the highlighted fields before submitting.')
                .removeClass('is-hidden')
                .fadeIn(200);
            getControls(firstInvalid).filter(':first').trigger('focus');
            return;
        }

        const program = findProgram(values.programId);
        const confirmationText = 'Demonstration request ' +
            createTemporaryReference() + ': ' + values.fullName +
            ' selected ' + program.name + ' starting ' +
            formatLocalDate(values.startDate) + '. No data was sent to a server ' +
            'and no real booking was created.';

        $generalError.stop(true, true).fadeOut(100, function () {
            $(this).addClass('is-hidden');
        });
        $form.trigger('reset');

        window.setTimeout(function () {
            $confirmation
                .stop(true, true)
                .text(confirmationText)
                .removeClass('is-hidden')
                .fadeIn(300, function () {
                    $(this).trigger('focus');
                });
        }, 0);
    });

    $form.on('reset', function () {
        window.setTimeout(function () {
            attemptedSubmit = false;
            clearFieldStates();
            $generalError.stop(true, true).addClass('is-hidden');
            $confirmation.stop(true, true).addClass('is-hidden');
            updateSummary();
        }, 0);
    });

    $confirmation.attr('tabindex', '-1');
    updateSummary();
});
