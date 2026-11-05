
'use strict';

function oldMatchesInstructor(instructor, query, specialty) {
    const searchable = [
        instructor.name,
        instructor.description,
        ...instructor.specialties
    ].join(' ').toLowerCase();

    const matchesSearch = searchable.includes(
        query.trim().toLowerCase()
    );

    const matchesSpecialty =
        specialty === 'all' ||
        instructor.specialties.includes(specialty);

    return matchesSearch && matchesSpecialty;
}

function oldRenderInstructorResults(
    instructors,
    searchInput,
    specialtySelect,
    resultsElement
) {
    const matches = instructors.filter(instructor =>
        oldMatchesInstructor(
            instructor,
            searchInput.value,
            specialtySelect.value
        )
    );

    for (const instructor of instructors) {
        instructor.profile.classList.toggle(
            'is-hidden',
            !matches.includes(instructor)
        );
    }

    resultsElement.classList.remove('is-hidden');

    resultsElement.textContent =
        `${matches.length} instructor` +
        `${matches.length === 1 ? '' : 's'} found.`;
}

function oldCreateElement(tag, content, classes = '') {
    const element = document.createElement(tag);
    element.textContent = content;
    element.className = classes;
    return element;
}

function oldRenderReview(review, courseNames) {
    const column = oldCreateElement(
        'div',
        '',
        'col-12 col-lg-6'
    );

    const card = oldCreateElement(
        'article',
        '',
        'card review-item border-0 shadow-sm h-100'
    );

    const body = oldCreateElement(
        'div',
        '',
        'card-body p-4'
    );

    const ratingLabel = review.rating === null
        ? 'Rating not provided'
        : `${review.rating} out of 5 stars`;

    body.append(
        oldCreateElement(
            'h3',
            review.title,
            'h5 fw-bold'
        ),
        oldCreateElement(
            'p',
            ratingLabel,
            'review-stars'
        ),
        oldCreateElement(
            'p',
            review.text
        )
    );

    const author = oldCreateElement(
        'p',
        `${review.name} · `,
        'small text-body-secondary'
    );

    const time = oldCreateElement(
        'time',
        review.dateLabel
    );

    if (review.date !== null) {
        time.dateTime = review.date;
    }

    author.append(time);
    body.append(author);

    if (review.course !== '') {
        body.append(oldCreateElement(
            'p',
            `Course: ${courseNames.get(review.course)}. ` +
            `Recommends school: ${
                review.recommend === 'yes' ? 'Yes' : 'No'
            }.`,
            'small'
        ));
    }

    card.append(body);
    column.append(card);

    return column;
}

function oldValidateReview(values, courseNames) {
    const errors = {};

    if (values.name.length < 2 || values.name.length > 80) {
        errors['reviewer-name'] =
            'Enter a name between 2 and 80 characters.';
    }

    const validEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email);

    if (!validEmail || values.email.length > 120) {
        errors['reviewer-email'] =
            'Enter a valid email address.';
    }

    if (
        !Number.isInteger(values.rating) ||
        values.rating < 1 ||
        values.rating > 5
    ) {
        errors.rating = 'Choose a rating from 1 to 5.';
    }

    if (!courseNames.has(values.course)) {
        errors['course-reviewed'] = 'Choose a course.';
    }

    if (values.recommend === '') {
        errors.recommend = 'Choose Yes or No.';
    }

    if (
        values.text.length < 20 ||
        values.text.length > 1200
    ) {
        errors['review-text'] =
            'Write between 20 and 1200 characters.';
    }

    if (!values.consent) {
        errors['publish-consent'] = 'Consent is required.';
    }

    return errors;
}

function oldDisplayErrors(fields, errors) {
    for (const field of fields) {
        const key = field.name === 'recommend'
            ? 'recommend'
            : field.id;

        const message = document.getElementById(`${key}-error`);
        const invalid = Object.hasOwn(errors, key);

        field.classList.toggle('is-invalid', invalid);
        field.setAttribute('aria-invalid', String(invalid));

        if (message) {
            if (invalid) {
                message.textContent = errors[key];
            }

            message.classList.toggle('is-hidden', !invalid);
        }
    }
}

// Comparison snapshot only. This file is intentionally not linked from HTML.
// It preserves the three plain-JavaScript approaches used before Assignment 4.

const LEGACY_SCHEDULE_SESSIONS = [
    { id: 'mon-highway', day: 'Monday', time: '10:00 AM', type: 'Practical' },
    { id: 'tue-theory-17', day: 'Tuesday', time: '5:00 PM', type: 'Theory' },
    { id: 'tue-theory-19', day: 'Tuesday', time: '7:00 PM', type: 'Theory' },
    { id: 'wed-city', day: 'Wednesday', time: '2:00 PM', type: 'Practical' },
    { id: 'thu-facility', day: 'Thursday', time: '11:00 AM', type: 'Practical' },
    { id: 'fri-city', day: 'Friday', time: '4:00 PM', type: 'Practical' }
];

const LEGACY_REQUIREMENTS = [
    { id: 'identity', label: 'Identification document' },
    { id: 'medical', label: 'Medical certificate' },
    { id: 'photos', label: 'Two passport-style photos' },
    { id: 'schedule', label: 'Preferred weekly schedule' },
    { id: 'contact', label: 'Reachable phone and email' }
];

function legacyCreateElement(tagName, text, className) {
    const element = document.createElement(tagName);
    element.textContent = text;

    if (className) {
        element.className = className;
    }

    return element;
}

// Old feature 1: form validation with getElementById, classList and
// addEventListener. Compare this with js/index.js.
function initialiseLegacyEnrollmentValidation() {
    const form = document.getElementById('enrollment-form');

    if (!form) {
        return;
    }

    const fieldNames = [
        'full-name',
        'phone',
        'email',
        'age',
        'start-date',
        'category',
        'transmission',
        'agreement'
    ];

    function readValues() {
        const checkedTransmission = document.querySelector(
            'input[name="transmission"]:checked'
        );

        return {
            fullName: document.getElementById('full-name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            age: Number(document.getElementById('age').value),
            startDate: document.getElementById('start-date').value,
            category: document.getElementById('category').value,
            transmission: checkedTransmission ? checkedTransmission.value : '',
            agreement: document.getElementById('agreement').checked
        };
    }

    function validate(values) {
        const errors = {};
        const phoneDigits = values.phone.replace(/\D/g, '');

        if (values.fullName.length < 2) {
            errors['full-name'] = 'Enter your full name.';
        }

        if (phoneDigits.length < 10 || phoneDigits.length > 15) {
            errors.phone = 'Enter a phone number with 10–15 digits.';
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
            errors.email = 'Enter a valid email address.';
        }

        if (!Number.isInteger(values.age) || values.age < 16) {
            errors.age = 'Enter a valid age.';
        }

        if (!values.startDate) {
            errors['start-date'] = 'Choose a start date.';
        }

        if (!values.category) {
            errors.category = 'Choose a program.';
        }

        if (!values.transmission) {
            errors.transmission = 'Choose a transmission.';
        }

        if (!values.agreement) {
            errors.agreement = 'Confirm the information.';
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
            control.setAttribute('aria-invalid', String(invalid));
        }

        if (error) {
            error.textContent = message;
            error.classList.toggle('is-hidden', !invalid);
        }
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const errors = validate(readValues());

        for (const fieldName of fieldNames) {
            setFieldState(fieldName, errors[fieldName] || '');
        }
    });
}

// Old feature 2: schedule rows created with createElement and replaced with
// replaceChildren. Compare this with js/schedule.js.
function initialiseLegacySchedule() {
    const tableBody = document.getElementById('schedule-table-body');
    const status = document.getElementById('schedule-status');

    if (!tableBody || !status) {
        return;
    }

    function createRow(session) {
        const row = document.createElement('tr');
        row.dataset.sessionId = session.id;
        const day = legacyCreateElement('th', session.day, '');
        day.scope = 'row';
        const time = legacyCreateElement(
            'td',
            session.time + ', ' + session.type.toLowerCase(),
            ''
        );
        const action = legacyCreateElement('td', '', 'text-center');
        const button = legacyCreateElement(
            'button',
            'Choose',
            'btn btn-sm btn-outline-primary'
        );
        button.type = 'button';
        button.dataset.chooseSession = session.id;
        action.append(button);
        row.append(day, time, action);
        return row;
    }

    function render(sessions) {
        tableBody.replaceChildren();

        for (const session of sessions) {
            tableBody.append(createRow(session));
        }

        status.textContent = sessions.length + ' sessions shown.';
        status.classList.remove('is-hidden');
    }

    tableBody.addEventListener('click', function (event) {
        const button = event.target.closest('button[data-choose-session]');

        if (!button) {
            return;
        }

        for (const row of tableBody.querySelectorAll('tr')) {
            row.classList.toggle(
                'is-selected',
                row.dataset.sessionId === button.dataset.chooseSession
            );
        }
    });

    render(LEGACY_SCHEDULE_SESSIONS);
}

// Old feature 3: readiness items built with createElement and updated through
// querySelectorAll. Compare this with js/enrollment.js.
function initialiseLegacyReadinessChecklist() {
    const column = document.querySelector('#enrollment-section > .col-12.col-lg-8');

    if (!column) {
        return;
    }

    const card = legacyCreateElement(
        'section',
        '',
        'card border-0 shadow-sm detail-card mt-4'
    );
    const body = legacyCreateElement('div', '', 'card-body p-4 p-md-5');
    const list = legacyCreateElement('div', '', 'row g-3');
    const status = legacyCreateElement('p', '', 'alert alert-info mt-3 mb-0');

    for (const requirement of LEGACY_REQUIREMENTS) {
        const wrapper = legacyCreateElement('div', '', 'col-12 col-md-6');
        const input = document.createElement('input');
        const label = legacyCreateElement('label', requirement.label, 'form-check-label');
        input.type = 'checkbox';
        input.value = requirement.id;
        input.id = 'legacy-' + requirement.id;
        label.htmlFor = input.id;
        wrapper.append(input, label);
        list.append(wrapper);
    }

    function update() {
        const completed = list.querySelectorAll('input:checked').length;
        status.textContent = completed + ' of ' +
            LEGACY_REQUIREMENTS.length + ' items checked.';
    }

    list.addEventListener('change', update);
    body.append(
        legacyCreateElement('h3', 'Check your enrollment readiness', 'h4'),
        list,
        status
    );
    card.append(body);
    column.append(card);
    update();
}
