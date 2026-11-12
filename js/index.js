'use strict';

// Programs, lessons, instructors and extra hours come from js/data.js.

const currencyFormatter = new Intl.NumberFormat('en-KZ', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0
});

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

function createTemporaryReference() {
    return 'PSD-' + String(Math.floor(100000 + Math.random() * 900000));
}

function validateEnrollmentValues(values, earliestDate) {
    const errors = {};
    const program = findById(PROGRAMS, values.programId);
    const session = findById(SCHEDULE_SESSIONS, values.sessionId);
    const instructor = findById(INSTRUCTORS, values.instructorId);
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

    if (!EXTRA_HOURS_OPTIONS.includes(values.extraHours)) {
        errors['extra-hours'] = 'Choose how many extra practice hours you want.';
    }

    if (values.sessionId !== '' && !session) {
        errors['preferred-session'] = 'Choose a lesson time from the list.';
    }

    if (values.instructorId !== '' && !instructor) {
        errors.instructor = 'Choose an instructor from the list.';
    } else if (
        session && instructor && session.instructorId !== null &&
        session.instructorId !== instructor.id
    ) {
        // A practical lesson is always taught by one instructor, so the two
        // choices must agree. Theory lessons accept any practical instructor.
        errors.instructor = session.day + ' ' + session.time + ' is taught by ' +
            session.instructor + '. Choose ' + session.instructor +
            ' or “No preference”.';
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

// The single enrollment form of the site. Choices made on the Courses, Course
// detail, Schedule and Instructors pages arrive here through js/data.js storage.
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
        'extra-hours',
        'preferred-session',
        'instructor',
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

    $programSelect.empty().append(
        $('<option>', {
            value: '',
            text: 'Choose a program',
            disabled: true,
            selected: true
        })
    );

    $.each(PROGRAMS, function (index, program) {
        $('<option>', {
            value: program.id,
            text: program.name + ' — ' + currencyFormatter.format(program.price)
        }).appendTo($programSelect);
    });

    // Builds one labelled select with its own error message under it.
    function createSelectGroup(id, label, options) {
        const $select = $('<select>', {
            class: 'form-select',
            id: id,
            name: id,
            'aria-describedby': id + '-error'
        });

        $.each(options, function (index, option) {
            $('<option>', {
                value: option.value,
                text: option.text,
                selected: index === 0
            }).appendTo($select);
        });

        return $('<div>', { class: 'col-12 col-md-6' }).append(
            $('<label>', { class: 'form-label fw-semibold', for: id, text: label }),
            $select,
            $('<small>', { class: 'field-message is-hidden', id: id + '-error' })
        );
    }

    const $hoursGroup = createSelectGroup(
        'extra-hours',
        'Extra practice hours',
        $.map(EXTRA_HOURS_OPTIONS, function (hours) {
            return {
                value: String(hours),
                text: hours === 0 ? 'No extra hours' : hours + ' extra hours'
            };
        })
    );
    const $sessionGroup = createSelectGroup(
        'preferred-session',
        'Preferred lesson time',
        [{ value: '', text: 'No preference — Prestige will suggest a time' }].concat(
            $.map(SCHEDULE_SESSIONS, function (session) {
                return { value: session.id, text: describeSession(session) };
            })
        )
    );
    const $instructorGroup = createSelectGroup(
        'instructor',
        'Instructor',
        [{ value: '', text: 'No preference' }].concat(
            $.map(INSTRUCTORS, function (instructor) {
                return { value: instructor.id, text: instructor.name };
            })
        )
    );

    $programSelect
        .closest('.col-12')
        .after($hoursGroup, $sessionGroup, $instructorGroup);

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
            'data-summary-schedule': ''
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
            extraHours: Number($('#extra-hours').val()),
            sessionId: String($('#preferred-session').val() || ''),
            instructorId: String($('#instructor').val() || ''),
            transmission: String(
                $('input[name="transmission"]:checked').val() || ''
            ),
            agreement: $('#agreement').prop('checked')
        };
    }

    // Fill the form with what the visitor already chose on other pages.
    // A ?program= link from the Courses page wins over an older stored choice.
    function applySavedChoices() {
        const choices = loadEnrollmentChoices();
        const requestedProgram = new URLSearchParams(window.location.search).get('program');
        const programId = findById(PROGRAMS, requestedProgram)
            ? requestedProgram
            : choices.programId;

        if (findById(PROGRAMS, programId)) {
            $programSelect.val(programId);
            saveEnrollmentChoice('programId', programId);
        }

        if (EXTRA_HOURS_OPTIONS.includes(choices.extraHours)) {
            $('#extra-hours').val(String(choices.extraHours));
        }

        if (findById(SCHEDULE_SESSIONS, choices.sessionId)) {
            $('#preferred-session').val(choices.sessionId);
        }

        if (findById(INSTRUCTORS, choices.instructorId)) {
            $('#instructor').val(choices.instructorId);
        }
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

    function describeLesson(values) {
        const session = findById(SCHEDULE_SESSIONS, values.sessionId);
        const instructor = findById(INSTRUCTORS, values.instructorId);
        const lesson = session
            ? session.day + ' at ' + session.time + ' (' + session.type.toLowerCase() + ')'
            : 'a time suggested by Prestige';
        const teacher = instructor ? instructor.name : 'any available instructor';

        return 'Lesson: ' + lesson + ', instructor: ' + teacher + '.';
    }

    function updateSummary() {
        const values = readValues();
        const program = findById(PROGRAMS, values.programId);
        const $detail = $summary.find('[data-summary-detail]');

        if (!program) {
            $detail.text('Choose a program to see its duration and price.');
        } else {
            const extraHours = EXTRA_HOURS_OPTIONS.includes(values.extraHours)
                ? values.extraHours
                : 0;
            const weeklyHours = (program.hours + extraHours) / program.weeks;
            const transmission = values.transmission || 'not selected';
            const extraText = extraHours === 0
                ? ''
                : ' + ' + extraHours + ' extra hours × ' +
                    currencyFormatter.format(EXTRA_HOUR_PRICE);

            // .html() is safe here because every inserted value comes from the
            // fixed data arrays, never from visitor-entered text.
            $detail.html(
                '<strong>' + program.name + '</strong>: ' +
                currencyFormatter.format(program.price) + extraText +
                ' = <strong>' +
                currencyFormatter.format(calculateProgramTotal(program, extraHours)) +
                '</strong>. ' + program.weeks + ' week' +
                (program.weeks === 1 ? '' : 's') + ', about ' +
                weeklyHours.toFixed(1) + ' hours per week. Transmission: ' +
                transmission + '.'
            );
        }

        $summary.find('[data-summary-schedule]').text(describeLesson(values));
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

    // Remember choices made in the form too, so going to the Schedule or
    // Instructors page and back does not lose them.
    $form.on('change', '#category, #extra-hours, #preferred-session, #instructor', function () {
        const values = readValues();
        saveEnrollmentChoice('programId', values.programId);
        saveEnrollmentChoice('extraHours', values.extraHours);
        saveEnrollmentChoice('sessionId', values.sessionId);
        saveEnrollmentChoice('instructorId', values.instructorId);
    });

    $form.on('submit', function (event) {
        // Without preventDefault(), the browser would navigate to the form action
        // and the visitor would lose the on-page validation and confirmation.
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

        const program = findById(PROGRAMS, values.programId);
        const extraText = values.extraHours === 0
            ? ''
            : ' with ' + values.extraHours + ' extra practice hours';
        const confirmationText = 'Thank you, ' + values.fullName +
            '! Request ' + createTemporaryReference() + ': ' + program.name +
            extraText + ', total ' +
            currencyFormatter.format(calculateProgramTotal(program, values.extraHours)) +
            ', starting ' + formatLocalDate(values.startDate) + ', ' +
            values.transmission + ' transmission. ' + describeLesson(values) +
            ' Prestige will call ' + values.phone +
            ' to confirm the plan. (This website has no server, so the request ' +
            'stays in your browser.)';

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

    // Clearing the form also forgets the choices brought from other pages.
    $form.on('reset', function () {
        clearEnrollmentChoices();

        window.setTimeout(function () {
            attemptedSubmit = false;
            clearFieldStates();
            $generalError.stop(true, true).addClass('is-hidden');
            $confirmation.stop(true, true).addClass('is-hidden');
            updateSummary();
        }, 0);
    });

    $confirmation.attr('tabindex', '-1');
    applySavedChoices();
    updateSummary();
});
