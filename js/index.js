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

function createElement(tagName, text, className) {
    const element = document.createElement(tagName);

    if (text !== '') {
        element.textContent = text;
    }

    if (className) {
        element.className = className;
    }

    return element;
}

function findProgram(programId) {
    return TRAINING_PROGRAMS.find(function (program) {
        return program.id === programId;
    }) || null;
}

function formatLocalDate(dateValue) {
    const date = new Date(dateValue + 'T00:00:00');

    return new Intl.DateTimeFormat('en-KZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
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

function readEnrollmentValues(form) {
    const data = new FormData(form);

    return {
        fullName: String(data.get('full-name') || '').trim(),
        phone: String(data.get('phone') || '').trim(),
        age: Number(data.get('age')),
        startDate: String(data.get('start-date') || ''),
        programId: String(data.get('category') || ''),
        transmission: String(data.get('transmission') || ''),
        notes: String(data.get('notes') || '').trim(),
        agreement: data.get('agreement') === 'on'
    };
}

function validateEnrollment(values, earliestDate) {
    const errors = {};
    const program = findProgram(values.programId);
    const phonePattern = /^\+?[\d\s()-]+$/;
    const phoneDigits = values.phone.replace(/\D/g, '');
    const startDate = values.startDate
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
        errors.phone = 'Enter a valid telephone number with 10–15 digits.';
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

    if (!startDate || Number.isNaN(startDate.getTime())) {
        errors['start-date'] = 'Choose your preferred start date.';
    } else if (startDate < earliestDate) {
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

function setFieldState(fieldName, message) {
    const controls = fieldName === 'transmission'
        ? document.querySelectorAll('input[name="transmission"]')
        : document.querySelectorAll('#' + fieldName);
    const error = document.getElementById(fieldName + '-error');
    const invalid = message !== '';

    for (const control of controls) {
        control.classList.toggle('is-error', invalid);
        control.classList.toggle('is-success', !invalid);
        control.setAttribute('aria-invalid', String(invalid));
    }

    if (error) {
        if (invalid) {
            error.textContent = message;
        }

        error.classList.toggle('is-hidden', !invalid);
    }
}

function clearFieldStates(fieldNames) {
    for (const fieldName of fieldNames) {
        const controls = fieldName === 'transmission'
            ? document.querySelectorAll('input[name="transmission"]')
            : document.querySelectorAll('#' + fieldName);
        const error = document.getElementById(fieldName + '-error');

        for (const control of controls) {
            control.classList.remove('is-error', 'is-success');
            control.removeAttribute('aria-invalid');
        }

        error?.classList.add('is-hidden');
    }
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

function updateCourseSummary(summary, values) {
    const program = findProgram(values.programId);
    const scheduleChoice = getStoredScheduleChoice();
    const detail = summary.querySelector('[data-summary-detail]');
    const schedule = summary.querySelector('[data-summary-schedule]');

    if (!program) {
        detail.textContent = 'Choose a program to see its duration and price.';
    } else {
        const weeklyHours = program.hours / program.weeks;
        const transmission = values.transmission
            ? values.transmission[0].toUpperCase() + values.transmission.slice(1)
            : 'Not selected';

        detail.textContent = program.name + ': ' +
            currencyFormatter.format(program.price) + ', ' +
            program.weeks + ' week' + (program.weeks === 1 ? '' : 's') +
            ', approximately ' + weeklyHours.toFixed(1) +
            ' academic hours per week. Transmission: ' + transmission + '.';
    }

    schedule.textContent = scheduleChoice
        ? 'Preferred schedule: ' + scheduleChoice.day + ' at ' +
            scheduleChoice.time + ' (' + scheduleChoice.type + ').'
        : 'No schedule preference saved yet. You can choose one on the Schedule page.';
}

function createTemporaryReference() {
    return 'PSD-' + String(Math.floor(100000 + Math.random() * 900000));
}

function initialiseEnrollmentForm() {
    const form = document.getElementById('enrollment-form');

    if (!form) {
        return;
    }

    const programSelect = document.getElementById('category');
    const programLabel = document.querySelector('label[for="category"]');
    const actionRow = document.getElementById('enrollment-submit').parentElement;
    const generalError = document.getElementById('enrollment-error');
    const confirmation = document.getElementById('enrollment-confirmation');
    const startDate = document.getElementById('start-date');
    const fieldOrder = [
        'full-name',
        'phone',
        'age',
        'start-date',
        'category',
        'transmission',
        'agreement'
    ];
    const earliestDate = getEarliestStartDate();
    let attemptedSubmit = false;

    form.noValidate = true;
    startDate.min = toDateInputValue(earliestDate);
    programLabel.textContent = 'Training program';
    document.getElementById('category-error').textContent =
        'Choose a training program.';

    const defaultOption = createElement('option', 'Choose a program', '');
    defaultOption.value = '';
    defaultOption.disabled = true;
    defaultOption.selected = true;

    const programOptions = TRAINING_PROGRAMS.map(function (program) {
        const option = createElement(
            'option',
            program.name + ' — ' + currencyFormatter.format(program.price),
            ''
        );
        option.value = program.id;
        return option;
    });

    programSelect.replaceChildren(defaultOption, ...programOptions);

    const summary = createElement(
        'section',
        '',
        'col-12 status-message bg-white'
    );
    summary.setAttribute('aria-live', 'polite');
    summary.append(
        createElement('h3', 'Your training estimate', 'h5'),
        createElement(
            'p',
            'Choose a program to see its duration and price.',
            'mb-2'
        ),
        createElement(
            'p',
            'No schedule preference saved yet. You can choose one on the Schedule page.',
            'small text-body-secondary mb-0'
        )
    );
    summary.children[1].dataset.summaryDetail = '';
    summary.children[2].dataset.summarySchedule = '';
    actionRow.before(summary);

    function refreshSummary() {
        updateCourseSummary(summary, readEnrollmentValues(form));
    }

    function refreshValidation() {
        const errors = validateEnrollment(
            readEnrollmentValues(form),
            earliestDate
        );

        for (const fieldName of fieldOrder) {
            setFieldState(fieldName, errors[fieldName] || '');
        }

        return errors;
    }

    form.addEventListener('input', function () {
        refreshSummary();

        if (attemptedSubmit) {
            refreshValidation();
        }
    });

    form.addEventListener('change', function () {
        refreshSummary();

        if (attemptedSubmit) {
            refreshValidation();
        }
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        attemptedSubmit = true;

        const values = readEnrollmentValues(form);
        const errors = refreshValidation();
        const firstInvalidField = fieldOrder.find(function (fieldName) {
            return Object.prototype.hasOwnProperty.call(errors, fieldName);
        });

        if (firstInvalidField) {
            generalError.textContent =
                'Please correct the highlighted fields before submitting.';
            generalError.classList.remove('is-hidden');
            confirmation.classList.add('is-hidden');

            const target = firstInvalidField === 'transmission'
                ? document.querySelector('input[name="transmission"]')
                : document.getElementById(firstInvalidField);
            target?.focus();
            return;
        }

        const program = findProgram(values.programId);
        const reference = createTemporaryReference();

        generalError.classList.add('is-hidden');
        confirmation.textContent = 'Demonstration request ' + reference +
            ': ' + values.fullName + ' selected ' + program.name +
            ' starting ' + formatLocalDate(values.startDate) + ', ' +
            values.transmission + ' transmission, estimated at ' +
            currencyFormatter.format(program.price) +
            '. No data was sent to a server and no real booking was created.';
        confirmation.classList.remove('is-hidden');
        confirmation.focus();
    });

    form.addEventListener('reset', function () {
        window.setTimeout(function () {
            attemptedSubmit = false;
            clearFieldStates(fieldOrder);
            generalError.classList.add('is-hidden');
            confirmation.classList.add('is-hidden');
            refreshSummary();
        }, 0);
    });

    confirmation.tabIndex = -1;
    refreshSummary();
}

initialiseEnrollmentForm();

