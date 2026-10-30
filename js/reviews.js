
'use strict';

$(function () {
    const $form = $('#review-form');
    const $list = $('#reviews-list');

    if (!$form.length || !$list.length) return;

    const $search = $('#review-search');
    const $filter = $('#review-filter');
    const $results = $('#reviews-results');
    const $empty = $('#reviews-empty');

    const $success = $('#review-form-success');
    const $generalError = $('#review-form-error');
    const $preview = $('#review-preview');
    const $submit = $('#review-submit');
    const $counter = $('#review-character-count');
    const $formNote = $('#review-form-note');

    let reviews = [];
    let nextId = 1;
    let editingId = null;
    let attempted = false;

    $form.attr('novalidate', 'novalidate');
    $submit.attr('type', 'submit');

    const $phoneGroup = $('<div>', {
        class: 'col-12 col-md-6'
    });

    const $phone = $('<input>', {
        type: 'tel',
        id: 'reviewer-phone',
        name: 'reviewer-phone',
        class: 'form-control',
        autocomplete: 'tel',
        required: true,
        maxlength: 25,
        placeholder: '+7 (705) 123-4567'
    });

    $phoneGroup.append(
        $('<label>', {
            for: 'reviewer-phone',
            class: 'form-label fw-semibold'
        }).text('Phone number'),
        $phone,
        $('<div>', {
            id: 'reviewer-phone-error',
            class: 'invalid-feedback'
        }).text('Please enter a valid phone number.')
    );

    $('#reviewer-email').closest('.col-12').after($phoneGroup);

    $formNote.text(
        'Reviews are stored only while this page is open. ' +
        'No data is sent to a server or published online. ' +
        'Reloading removes demonstration reviews.'
    );

    const courseNames = {};

    $('#course-reviewed option').each(function () {
        const value = $(this).val();

        if (value) {
            courseNames[value] = $(this).text().trim();
        }
    });

    const $original = $('#review-zhanna');

    if ($original.length) {
        reviews.push({
            id: 'zhanna',
            name: $original.find('cite').text().trim(),
            title: $original.find('h3').text().trim(),
            text: $original.find('blockquote p').text().trim(),
            rating: null,
            course: '',
            recommend: '',
            date: '',
            dateLabel: 'March 2026',
            local: false
        });
    }

    function createReviewCard(review) {
        const $column = $('<div>', {
            class: 'col-12 col-lg-6'
        });

        const $card = $('<article>', {
            class: 'card review-item border-0 shadow-sm h-100',
            'data-review-id': review.id
        });

        const $body = $('<div>', {
            class: 'card-body p-4'
        });

        const $title = $('<h3>', {
            class: 'h5 fw-bold mb-3'
        }).text(review.title);

        const $stars = $('<p>', {
            class: 'review-stars'
        });

        if (review.rating === null) {
            $stars.text('Rating not provided');
        } else {
            $stars.html(
                '&#9733;'.repeat(review.rating) +
                '&#9734;'.repeat(5 - review.rating)
            );

            $stars.attr('aria-label', review.rating + ' out of 5 stars');
        }

        const $reviewText = $('<p>').text(review.text);

        const $author = $('<p>', {
            class: 'small text-body-secondary'
        }).text(review.name + ' · ');

        const $time = $('<time>').text(review.dateLabel);

        if (review.date) {
            $time.attr('datetime', review.date);
        }

        $author.append($time);

        $body.append($title, $stars, $reviewText, $author);

        if (review.course) {
            $body.append(
                $('<p>', { class: 'small' }).text(
                    'Course: ' + courseNames[review.course] +
                    '. Recommends school: ' +
                    (review.recommend === 'yes' ? 'Yes' : 'No')
                )
            );
        }

        if (review.local) {
            $body.append(
                $('<p>', {
                    class: 'small text-body-secondary'
                }).text(
                    'Local demonstration review. ' +
                    'It disappears when the page reloads.'
                )
            );

            const $edit = $('<button>', {
                type: 'button',
                class: 'btn btn-outline-primary me-2',
                'data-review-action': 'edit'
            }).text('Edit my review');

            const $remove = $('<button>', {
                type: 'button',
                class: 'btn btn-outline-danger',
                'data-review-action': 'remove'
            }).text('Remove my review');

            $body.append($edit, $remove);
        }

        $card.append($body);
        $column.append($card);

        return $column;
    }

    function renderReviews() {
        const query = $.trim($search.val()).toLowerCase();
        const selectedRating = $filter.val();

        const matches = reviews.filter(function (review) {
            const searchable = (
                review.name + ' ' +
                review.title + ' ' +
                review.text
            ).toLowerCase();

            const matchesText = searchable.includes(query);

            const matchesRating =
                selectedRating === 'all' ||
                String(review.rating) === selectedRating;

            return matchesText && matchesRating;
        });

        $list.empty();

        $.each(matches, function (index, review) {
            $list.append(createReviewCard(review));
        });

        if (matches.length === 0) {
            if (!$empty.is(':visible')) {
                $empty
                    .removeClass('is-hidden')
                    .hide()
                    .fadeIn(250);
            }
        } else {
            if ($empty.is(':visible')) {
                $empty.fadeOut(200, function () {
                    $(this).addClass('is-hidden');
                });
            }
        }

        $results
            .text(
                matches.length + ' of ' + reviews.length +
                ' reviews shown. Unrated reviews appear ' +
                'under All ratings only.'
            )
            .removeClass('is-hidden');
    }

    const $resetFilters = $('<button>', {
        type: 'button',
        class: 'btn btn-outline-secondary mt-3'
    }).text('Reset review filters');

    $search.closest('.review-tools').append($resetFilters);

    $search.on('input', function () {
        renderReviews();
    });

    $filter.on('change', function () {
        renderReviews();
    });

    $resetFilters.on('click', function () {
        $search.val('');
        $filter.val('all');
        renderReviews();
        $search.trigger('focus');
    });

    function readForm() {
        return {
            name: $.trim($('#reviewer-name').val()),
            email: $.trim($('#reviewer-email').val()),
            phone: $.trim($phone.val()),
            rating: Number($('#rating').val()),
            course: $('#course-reviewed').val(),
            recommend: $form
                .find('input[name="recommend"]:checked')
                .val() || '',
            text: $.trim($('#review-text').val()),
            consent: $('#publish-consent').prop('checked')
        };
    }

    function validateReview(values) {
        const errors = {};

        if (values.name.length < 2 || values.name.length > 80) {
            errors['reviewer-name'] =
                'Enter a name between 2 and 80 characters.';
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailPattern.test(values.email) ||
            values.email.length > 120
        ) {
            errors['reviewer-email'] =
                'Enter a valid email, for example name@example.com.';
        }

        const phoneDigits = values.phone.replace(/\D/g, '');
        const allowedPhoneCharacters = /^\+?[\d\s()-]+$/;

        if (
            !allowedPhoneCharacters.test(values.phone) ||
            phoneDigits.length < 10 ||
            phoneDigits.length > 15
        ) {
            errors['reviewer-phone'] =
                'Enter a valid phone number with 10–15 digits.';
        }

        if (
            !Number.isInteger(values.rating) ||
            values.rating < 1 ||
            values.rating > 5
        ) {
            errors.rating = 'Choose a rating from 1 to 5.';
        }

        if (!Object.prototype.hasOwnProperty.call(
            courseNames, values.course
        )) {
            errors['course-reviewed'] = 'Please select a course.';
        }

        if (
            values.recommend !== 'yes' &&
            values.recommend !== 'no'
        ) {
            errors.recommend = 'Choose Yes or No.';
        }

        if (
            values.text.length < 20 ||
            values.text.length > 1200
        ) {
            errors['review-text'] =
                'Write between 20 and 1200 characters.';
        }

        if (
            values.email &&
            values.text.toLowerCase().includes(
                values.email.toLowerCase()
            )
        ) {
            errors['review-text'] =
                'Do not include your email address in the review.';
        }

        if (!values.consent) {
            errors['publish-consent'] =
                'You must agree before displaying your review.';
        }

        return errors;
    }

    const fieldKeys = [
        'reviewer-name',
        'reviewer-email',
        'reviewer-phone',
        'rating',
        'course-reviewed',
        'recommend',
        'review-text',
        'publish-consent'
    ];

    function displayErrors(errors) {
        $.each(fieldKeys, function (index, key) {
            const $field = key === 'recommend'
                ? $form.find('input[name="recommend"]')
                : $('#' + key);

            const $message = $('#' + key + '-error');
            const invalid = Boolean(errors[key]);

            $field
                .toggleClass('is-invalid', invalid)
                .attr('aria-invalid', String(invalid));

            if ($message.length) {
                if (invalid) {
                    $message.text(errors[key]);
                }

                $message.toggleClass('is-hidden', !invalid);

                const describedBy = (
                    $field.first().attr('aria-describedby') || ''
                ).split(/\s+/).filter(Boolean);

                if (!describedBy.includes(key + '-error')) {
                    describedBy.push(key + '-error');
                }

                $field.attr(
                    'aria-describedby',
                    describedBy.join(' ')
                );
            }
        });
    }

    function updateCounter() {
        const value = $('#review-text').val();

        $counter.text(
            value.length + ' / 1200 characters. ' +
            $.trim(value).length +
            ' excluding surrounding spaces. Minimum: 20.'
        );
    }

    function hideFeedback() {
        $success
            .stop(true, true)
            .hide()
            .addClass('is-hidden');

        $generalError
            .stop(true, true)
            .hide()
            .addClass('is-hidden');

        $preview
            .stop(true, true)
            .hide()
            .addClass('is-hidden');
    }

    $form.on('input change', 'input, select, textarea', function () {
        const $changedField = $(this);

        if ($changedField.is('#review-text')) {
            updateCounter();
        }

        hideFeedback();

        if (attempted) {
            const errors = validateReview(readForm());
            displayErrors(errors);
        }
    });

    $form.on('reset', function () {
        editingId = null;
        attempted = false;

        displayErrors({});
        hideFeedback();

        $preview.empty();
        $submit.text('Submit review');

        $counter.text(
            '0 / 1200 characters. 0 excluding surrounding spaces. ' +
            'Minimum: 20.'
        );

        $formNote.text(
            'Reviews are stored only while this page is open. ' +
            'No data is sent to a server or published online. ' +
            'Reloading removes demonstration reviews.'
        );
    });

    $list.on('click', 'button[data-review-action]', function () {
        const $button = $(this);
        const $card = $button.closest('.review-item');

        const id = $card.attr('data-review-id');
        const action = $button.attr('data-review-action');

        if (action === 'edit') {
            editReview(id);
        } else if (action === 'remove') {
            removeReview(id);
        }
    });

    function editReview(id) {
        const review = reviews.find(function (item) {
            return item.id === id && item.local;
        });

        if (!review) return;

        editingId = id;
        attempted = false;

        $('#reviewer-name').val(review.name);
        $('#reviewer-email').val('');
        $phone.val('');
        $('#rating').val(String(review.rating));
        $('#course-reviewed').val(review.course);
        $('#review-text').val(review.text);

        $('#recommend-yes').prop(
            'checked',
            review.recommend === 'yes'
        );

        $('#recommend-no').prop(
            'checked',
            review.recommend === 'no'
        );

        $('#publish-consent').prop('checked', false);

        displayErrors({});
        hideFeedback();

        $submit.text('Save review changes');

        $formNote.text(
            'Editing your local review. Enter your email and phone ' +
            'again, and renew consent. Clear form cancels editing.'
        );

        updateCounter();

        $('html, body').animate({
            scrollTop: $form.offset().top - 30
        }, 350, function () {
            $('#reviewer-name').trigger('focus');
        });
    }

    function removeReview(id) {
        const index = reviews.findIndex(function (review) {
            return review.id === id && review.local;
        });

        if (index === -1) return;

        reviews.splice(index, 1);

        if (editingId === id) {
            $form.trigger('reset');
        }

        renderReviews();

        $formNote.text(
            'Your local demonstration review was removed. ' +
            'No server data was changed.'
        );
    }

    $form.on('submit', function (event) {
        event.preventDefault();

        attempted = true;
        hideFeedback();

        const values = readForm();
        const errors = validateReview(values);

        displayErrors(errors);

        if (Object.keys(errors).length > 0) {
            $generalError
                .text('Correct the marked fields before submitting.')
                .removeClass('is-hidden')
                .hide()
                .fadeIn(200);

            const firstKey = fieldKeys.find(function (key) {
                return Boolean(errors[key]);
            });

            const $firstInvalid = firstKey === 'recommend'
                ? $('#recommend-yes')
                : $('#' + firstKey);

            $firstInvalid.trigger('focus');
            return;
        }

        const now = new Date();
        const wasEditing = editingId !== null;

        const review = {
            id: wasEditing ? editingId : 'local-' + nextId++,
            name: values.name,
            title: 'Feedback about ' + courseNames[values.course],
            text: values.text,
            rating: values.rating,
            course: values.course,
            recommend: values.recommend,
            date: now.toISOString(),
            dateLabel: now.toLocaleString(),
            local: true
        };

        const existingIndex = reviews.findIndex(function (item) {
            return item.id === review.id;
        });

        if (existingIndex === -1) {
            reviews.unshift(review);
        } else {
            reviews[existingIndex] = review;
        }

        $form.trigger('reset');

        $search.val('');
        $filter.val('all');
        renderReviews();

        const action = wasEditing ? 'updated' : 'added';

        $success
            .text(
                'Your local demonstration review was ' + action +
                ' successfully. No data was sent to a server.'
            )
            .removeClass('is-hidden')
            .hide()
            .fadeIn(300, function () {
                $(this)
                    .attr('tabindex', '-1')
                    .trigger('focus');
            });

        $preview.empty().append(
            $('<h3>', {
                class: 'h5'
            }).text('Your submitted review'),

            $('<p>').text(
                review.name + ' · ' +
                courseNames[review.course] + ' · ' +
                review.rating + '/5 · Recommends: ' +
                (review.recommend === 'yes' ? 'Yes' : 'No')
            ),

            $('<p>').text(review.text)
        );

        $preview
            .removeClass('is-hidden')
            .hide()
            .slideDown(250);
    });

    updateCounter();
    renderReviews();
});
