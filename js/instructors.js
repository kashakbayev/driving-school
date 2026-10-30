
'use strict';

$(function () {
    const $list = $('#instructors-list');
    const $results = $('#instructors-results');

    if (!$list.length || !$results.length) return;

    const instructors = [];

    $list.children('div').each(function () {
        const $profile = $(this);
        const $article = $profile.find('article[data-instructor]:first');

        if (!$article.length) return;

        instructors.push({
            id: $article.attr('data-instructor'),
            name: $article.find('h3').first().text().trim(),
            description: $article.find('.card-body p').first().text().trim(),
            specialties: ($article.attr('data-specialty') || '').split(' '),
            $profile: $profile
        });
    });

    const $tools = $('<div>', {
        class: 'rounded-4 border bg-white p-3 p-md-4 mb-4'
    });

    const $search = $('<input>', {
        id: 'instructor-search',
        type: 'search',
        class: 'form-control mb-3',
        placeholder: 'Search by name or teaching focus'
    });

    const $specialty = $('<select>', {
        id: 'instructor-specialty',
        class: 'form-select mb-3'
    });

    const options = [
        ['all', 'All specialties'],
        ['highway', 'Highway driving'],
        ['night', 'Night driving'],
        ['winter', 'Winter conditions'],
        ['beginner', 'First-time or anxious drivers']
    ];

    $.each(options, function (index, option) {
        $specialty.append(
            $('<option>').val(option[0]).text(option[1])
        );
    });

    const $reset = $('<button>', {
        type: 'button',
        class: 'btn btn-outline-secondary'
    }).text('Reset filters');

    $tools.append(
        $('<label>', {
            for: 'instructor-search',
            class: 'form-label fw-semibold'
        }).text('Search instructors'),
        $search,
        $('<label>', {
            for: 'instructor-specialty',
            class: 'form-label fw-semibold'
        }).text('Teaching focus'),
        $specialty,
        $reset
    );

    $list.before($tools);

    const $selection = $('<section>', {
        class: 'rounded-4 border bg-white p-4 mt-4',
        'aria-label': 'Instructor preference'
    });

    const $summary = $('<p>', {
        role: 'status',
        'aria-live': 'polite'
    }).text('No instructor selected. Choose a preference from a profile.');

    const $clear = $('<button>', {
        type: 'button',
        class: 'btn btn-outline-secondary me-2'
    }).text('Clear preference').prop('disabled', true);

    const $enrollment = $('<a>', {
        href: 'enrollment.html',
        class: 'btn btn-primary is-hidden'
    }).text('Continue to enrollment');

    $selection.append(
        $('<h3>', { class: 'h5' }).text('Your instructor preference'),
        $summary,
        $('<p>', { class: 'small text-body-secondary' }).text(
            'This is a front-end demonstration. No real booking is created.'
        ),
        $clear,
        $enrollment
    );

    $results.after($selection);

    $.each(instructors, function (index, instructor) {
        const $button = $('<button>', {
            type: 'button',
            class: 'btn btn-primary mt-3 align-self-start',
            'data-preference': instructor.id,
            'aria-pressed': 'false'
        }).text('Choose ' + instructor.name);

        instructor.$profile.find('.card-body').append($button);
    });

    function renderResults() {
        const query = $.trim($search.val()).toLowerCase();
        const selectedSpecialty = $specialty.val();
        let count = 0;

        $.each(instructors, function (index, instructor) {
            const searchable = [
                instructor.name,
                instructor.description,
                ...instructor.specialties
            ].join(' ').toLowerCase();

            const matchesSearch = searchable.includes(query);
            const matchesSpecialty =
                selectedSpecialty === 'all' ||
                instructor.specialties.includes(selectedSpecialty);

            if (matchesSearch && matchesSpecialty) {
                count++;

                if (instructor.$profile.is(':hidden')) {
                    instructor.$profile
                        .stop(true, true)
                        .slideDown(200);
                }
            } else {
                if (instructor.$profile.is(':visible')) {
                    instructor.$profile
                        .stop(true, true)
                        .slideUp(200);
                }
            }
        });

        const message = count === 0
            ? 'No instructors match your search. Reset the filters.'
            : count + ' instructor' + (count === 1 ? '' : 's') + ' found.';

        $results.text(message);

        if ($results.hasClass('is-hidden')) {
            $results.removeClass('is-hidden').hide().fadeIn(200);
        }
    }

    $list.on('click', 'button[data-preference]', function () {
        const $button = $(this);
        const $card = $button.closest('article');
        const id = $card.attr('data-instructor');
        const selected = instructors.find(item => item.id === id);

        if (!selected) return;

        const $column = $card.parent();

        $column
            .siblings()
            .find('article')
            .removeClass('is-selected');

        $column
            .siblings()
            .find('button[data-preference]')
            .attr('aria-pressed', 'false');

        $card
            .addClass('is-selected')
            .find('button[data-preference]')
            .attr('aria-pressed', 'true');

        $summary
            .html('<strong>Selected instructor:</strong> ')
            .append($('<span>').text(
                selected.name + '. ' + selected.description +
                ' Availability must be confirmed with the school. ' +
                'Mention this instructor during enrollment.'
            ));

        $clear.prop('disabled', false);

        $enrollment
            .stop(true, true)
            .removeClass('is-hidden')
            .hide()
            .fadeIn(250);
    });

    $search.on('input', function () {
        renderResults();
    });

    $specialty.on('change', function () {
        renderResults();
    });

    $reset.on('click', function () {
        $search.val('');
        $specialty.val('all');
        renderResults();
        $search.trigger('focus');
    });

    $clear.on('click', function () {
        $list.find('article.is-selected').removeClass('is-selected');

        $list.find('button[data-preference]')
            .attr('aria-pressed', 'false');

        $summary.text('Preference cleared. Choose another instructor.');
        $clear.prop('disabled', true);

        $enrollment.stop(true, true).fadeOut(200, function () {
            $(this).addClass('is-hidden');
        });
    });

    renderResults();
});
