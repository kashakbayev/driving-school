'use strict';

// Programs, lessons, instructors and extra hours come from js/data.js;
// validation and date rules come from js/rules.js. This file only handles the page.

const currencyFormatter = new Intl.NumberFormat('en-KZ', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0
});

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

    // Start date: the earliest allowed day is two days from today. The column
    // is widened (age needs less room) so the whole date and the calendar icon
    // fit, and a click anywhere in the field opens the calendar, not only the icon.
    const $startDate = $('#start-date');
    $startDate.attr('min', toDateInputValue(earliestDate));
    $('#age').closest('.col-6').removeClass('col-md-3').addClass('col-md-2');
    $startDate.closest('.col-6').removeClass('col-md-3').addClass('col-md-4');

    $startDate.on('click', function () {
        try {
            this.showPicker();
        } catch (error) {
            // Older browsers have no showPicker(); their calendar icon still works.
        }
    });
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

    // Phone mask for Kazakhstan mobile numbers: +7 (7XX) XXX-XX-XX.
    // "+7 (7" is fixed; the visitor fills the nine underscores with digits.
    const PHONE_TEMPLATE = '+7 (7__) ___-__-__';
    const PHONE_PREFIX = '+7 (7';
    const PHONE_DIGITS = 9;
    const PHONE_MESSAGE = 'Enter the full number: +7 (7XX) XXX-XX-XX.';
    const $phone = $('#phone');

    // Positions of the underscores, so the caret can jump to the next free one.
    const phoneSlots = $.map(PHONE_TEMPLATE.split(''), function (character, index) {
        return character === '_' ? index : null;
    });

    // Takes the visitor's nine digits out of whatever is in the field:
    // typed text inside the mask, or a pasted/autofilled number such as
    // +77011234567 or 87011234567.
    function getPhoneDigits(value) {
        if (value.indexOf(PHONE_PREFIX) === 0) {
            return value.slice(PHONE_PREFIX.length).replace(/\D/g, '').slice(0, PHONE_DIGITS);
        }

        let digits = value.replace(/\D/g, '');

        if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) {
            digits = digits.slice(1);
        }

        if (digits[0] === '7') {
            digits = digits.slice(1);
        }

        return digits.slice(0, PHONE_DIGITS);
    }

    function formatPhone(digits) {
        let result = PHONE_TEMPLATE;

        $.each(digits.split(''), function (index, digit) {
            const slot = phoneSlots[index];
            result = result.slice(0, slot) + digit + result.slice(slot + 1);
        });

        return result;
    }

    // Caret position right after the last typed digit (or at the end when full).
    function getPhoneCaret(digitCount) {
        return digitCount < PHONE_DIGITS ? phoneSlots[digitCount] : PHONE_TEMPLATE.length;
    }

    function setPhone(digits, caretAfterDigits) {
        const input = $phone.get(0);
        $phone.val(formatPhone(digits));

        if (document.activeElement === input) {
            const caret = getPhoneCaret(caretAfterDigits);
            input.setSelectionRange(caret, caret);
        }
    }

    // No maxlength: the mask is always full length, so the browser would block
    // every new digit. getPhoneDigits() already keeps at most nine digits.
    $phone.attr('placeholder', PHONE_TEMPLATE);
    $('#phone-error').text(PHONE_MESSAGE);
    setPhone('', 0);

    // How many of the visitor's digits stand before the caret.
    function countDigitsBeforeCaret(input) {
        const value = $(input).val();

        if (value.indexOf(PHONE_PREFIX) !== 0) {
            return getPhoneDigits(value).length;
        }

        return getPhoneDigits(PHONE_PREFIX + value.slice(PHONE_PREFIX.length, input.selectionStart)).length;
    }

    // Every change (typing, pasting, autofill) is rebuilt into the mask,
    // and the caret stays right after the digit that was just typed.
    $phone.on('input', function () {
        setPhone(getPhoneDigits($(this).val()), countDigitsBeforeCaret(this));
    });

    // Backspace removes the digit before the caret, not a bracket or dash,
    // and never deletes the fixed +7 (7 part.
    $phone.on('keydown', function (event) {
        const input = this;

        if (event.key !== 'Backspace' || input.selectionStart !== input.selectionEnd) {
            return;
        }

        event.preventDefault();
        const digits = getPhoneDigits($(this).val());
        const before = countDigitsBeforeCaret(input);

        if (before === 0) {
            return;
        }

        setPhone(digits.slice(0, before - 1) + digits.slice(before), before - 1);
        // Let the form update its summary and live validation.
        $(this).trigger('change');
    });

    // Keep the caret out of the fixed prefix: clicking or tabbing into the
    // field puts it at the first empty place.
    $phone.on('focus click', function () {
        const input = this;
        const digits = getPhoneDigits($(this).val());

        if (input.selectionStart < PHONE_PREFIX.length || input.selectionStart > getPhoneCaret(digits.length)) {
            const caret = getPhoneCaret(digits.length);
            window.setTimeout(function () {
                input.setSelectionRange(caret, caret);
            }, 0);
        }
    });

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
        } else {
            // No instructor chosen yet: take the one who teaches the saved lesson.
            selectSessionInstructor();
        }
    }

    // A practical lesson is always taught by one instructor, so choosing the
    // lesson time also chooses the instructor. Theory lessons (instructorId
    // null) and "No preference" leave the instructor as it is.
    function selectSessionInstructor() {
        const session = findById(SCHEDULE_SESSIONS, $('#preferred-session').val());

        if (session && session.instructorId !== null) {
            $('#instructor').val(session.instructorId);
        }
    }

    // Bound directly on the select, so it runs before the form's delegated
    // handlers; they then save and summarise the updated instructor too.
    $('#preferred-session').on('change', selectSessionInstructor);

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

        // The rule only says the number is incomplete; tell the visitor the mask format.
        if (errors.phone) {
            errors.phone = PHONE_MESSAGE;
        }

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
            setPhone('', 0);
            $generalError.stop(true, true).addClass('is-hidden');
            $confirmation.stop(true, true).addClass('is-hidden');
            updateSummary();
        }, 0);
    });

    $confirmation.attr('tabindex', '-1');
    applySavedChoices();
    updateSummary();
});
