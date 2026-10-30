
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
