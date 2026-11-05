'use strict';

const SCHEDULE_SESSIONS = [
    {
        id: 'mon-highway',
        day: 'Monday',
        dayOrder: 1,
        time: '10:00 AM',
        type: 'Practical',
        instructor: 'Nurlan Idrisov',
        location: 'Astana–Burabay highway',
        mode: 'On road',
        seats: 2,
        durationHours: 2
    },
    {
        id: 'tue-theory-17',
        day: 'Tuesday',
        dayOrder: 2,
        time: '5:00 PM',
        type: 'Theory',
        instructor: 'Prestige theory instructor',
        location: 'Online classroom',
        mode: 'Online',
        seats: 12,
        durationHours: 2
    },
    {
        id: 'tue-theory-19',
        day: 'Tuesday',
        dayOrder: 2,
        time: '7:00 PM',
        type: 'Theory',
        instructor: 'Bilingual theory instructor',
        location: 'Online classroom',
        mode: 'Online',
        seats: 9,
        durationHours: 2
    },
    {
        id: 'wed-city',
        day: 'Wednesday',
        dayOrder: 3,
        time: '2:00 PM',
        type: 'Practical',
        instructor: 'Aliya Sadykova',
        location: 'Left side of Astana',
        mode: 'On road',
        seats: 1,
        durationHours: 2
    },
    {
        id: 'thu-facility',
        day: 'Thursday',
        dayOrder: 4,
        time: '11:00 AM',
        type: 'Practical',
        instructor: 'Nurlan Idrisov',
        location: 'Closed training facility',
        mode: 'Training ground',
        seats: 3,
        durationHours: 2
    },
    {
        id: 'fri-city',
        day: 'Friday',
        dayOrder: 5,
        time: '4:00 PM',
        type: 'Practical',
        instructor: 'Aliya Sadykova',
        location: 'Right side of Astana',
        mode: 'On road',
        seats: 2,
        durationHours: 2
    }
];

function matchesScheduleFilters(session, query, type) {
    const searchable = [
        session.day,
        session.time,
        session.type,
        session.instructor,
        session.location,
        session.mode
    ].join(' ').toLowerCase();

    return searchable.includes(query.trim().toLowerCase()) &&
        (type === 'all' || session.type === type);
}

function sortScheduleSessions(sessions, sortMode) {
    return [...sessions].sort(function (first, second) {
        switch (sortMode) {
            case 'availability':
                return second.seats - first.seats ||
                    first.dayOrder - second.dayOrder;
            case 'day':
            default:
                return first.dayOrder - second.dayOrder ||
                    first.time.localeCompare(second.time);
        }
    });
}

function saveScheduleChoice(session) {
    try {
        sessionStorage.setItem('prestigeScheduleChoice', JSON.stringify({
            id: session.id,
            day: session.day,
            time: session.time,
            type: session.type,
            instructor: session.instructor,
            location: session.location
        }));
    } catch (error) {
        return false;
    }

    return true;
}

// Rewritten feature 2: jQuery .empty(), .append(), .each() and delegated .on()
// replace createElement/replaceChildren/addEventListener and reduce repeated code.
$(function () {
    const $table = $('#weekly-schedule-table');
    const $tableBody = $('#schedule-table-body');
    const $panel = $('#timetable');
    const $status = $('#schedule-status');

    if (!$table.length || !$tableBody.length || !$panel.length || !$status.length) {
        return;
    }

    let selectedSessionId = '';
    const $headerRow = $table.find('thead tr:first');
    $('<th>', {
        class: 'text-center',
        scope: 'col',
        text: 'Choose'
    }).appendTo($headerRow);

    const $controls = $('<section>', {
        class: 'bg-white border rounded-4 p-3 p-md-4 mb-4',
        'aria-label': 'Schedule search and filters'
    });
    const $controlsHeading = $('<div>', {
        class: 'd-flex justify-content-between align-items-center gap-3 mb-3'
    }).appendTo($controls);
    $('<h3>', {
        class: 'h5 mb-0',
        text: 'Find a suitable session'
    }).appendTo($controlsHeading);
    const $toggleFilters = $('<button>', {
        class: 'btn btn-outline-secondary btn-sm',
        type: 'button',
        text: 'Hide filters',
        'aria-expanded': 'true'
    }).appendTo($controlsHeading);
    const $controlsRow = $('<div>', {
        class: 'row g-3 align-items-end',
        'data-filter-fields': ''
    }).appendTo($controls);

    function createControlGroup(columnClass, label, $control) {
        return $('<div>', { class: columnClass }).append(
            $('<label>', {
                class: 'form-label fw-semibold',
                for: $control.attr('id'),
                text: label
            }),
            $control
        );
    }

    const $search = $('<input>', {
        class: 'form-control',
        id: 'schedule-search',
        type: 'search',
        placeholder: 'Search day, instructor or location',
        autocomplete: 'off'
    });
    const $type = $('<select>', {
        class: 'form-select',
        id: 'schedule-type'
    }).append(
        $('<option>', { value: 'all', text: 'All lesson types' }),
        $('<option>', { value: 'Theory', text: 'Theory' }),
        $('<option>', { value: 'Practical', text: 'Practical' })
    );
    const $sort = $('<select>', {
        class: 'form-select',
        id: 'schedule-sort'
    }).append(
        $('<option>', { value: 'day', text: 'Day and time' }),
        $('<option>', { value: 'availability', text: 'Most availability' })
    );
    const $reset = $('<button>', {
        class: 'btn btn-outline-secondary',
        type: 'button',
        text: 'Reset'
    });

    $controlsRow.append(
        createControlGroup('col-12 col-lg-5', 'Search schedule', $search),
        createControlGroup('col-12 col-md-5 col-lg-3', 'Lesson type', $type),
        createControlGroup('col-12 col-md-4 col-lg-2', 'Sort by', $sort),
        $('<div>', { class: 'col-12 col-md-3 col-lg-2 d-grid' }).append($reset)
    );
    $table.closest('.table-responsive').before($controls);

    const $selection = $('<section>', {
        class: 'status-message bg-white is-hidden',
        'aria-live': 'polite',
        tabindex: '-1'
    }).append(
        $('<h3>', { class: 'h5', text: 'Your preferred lesson' }),
        $('<p>', { class: 'mb-2', 'data-selection-detail': '' }),
        $('<p>', {
            class: 'small text-body-secondary mb-3',
            text: 'Availability must be confirmed by Prestige. This is not a booking.'
        }),
        $('<a>', {
            class: 'btn btn-primary',
            href: 'index.html#enrollment-form',
            text: 'Continue to enrollment'
        })
    );
    $status.after($selection);

    function createScheduleRow(session) {
        const $row = $('<tr>', {
            'data-session-id': session.id
        }).toggleClass('is-selected', session.id === selectedSessionId);
        const $location = $('<span>').text(session.location);

        if (session.mode === 'Online') {
            $location.addClass('badge text-bg-success');
        }

        $row.append(
            $('<th>', { scope: 'row', text: session.day }),
            $('<td>').text(session.time + ', ' + session.type.toLowerCase()),
            $('<td>', {
                class: 'd-none d-md-table-cell',
                text: session.instructor
            }),
            $('<td>').append($location),
            $('<td>', { class: 'text-center' }).append(
                $('<button>', {
                    class: 'btn btn-sm btn-outline-primary',
                    type: 'button',
                    text: 'Choose',
                    'data-choose-session': session.id,
                    'aria-pressed': String(session.id === selectedSessionId),
                    'aria-label': 'Choose ' + session.day + ' at ' + session.time
                })
            )
        );

        return $row;
    }

    function renderSchedule() {
        const matches = sortScheduleSessions(
            SCHEDULE_SESSIONS.filter(function (session) {
                return matchesScheduleFilters(session, $search.val(), $type.val());
            }),
            $sort.val()
        );

        $tableBody.empty();

        if (matches.length === 0) {
            $('<tr>').append(
                $('<td>', {
                    class: 'text-center text-body-secondary p-4',
                    colspan: 5,
                    text: 'No sessions match. Reset the filters to see all times.'
                })
            ).appendTo($tableBody);
        } else {
            $.each(matches, function (index, session) {
                createScheduleRow(session).appendTo($tableBody);
            });
        }

        $status
            .text(matches.length + ' of ' + SCHEDULE_SESSIONS.length +
                ' sessions shown.')
            .removeClass('is-hidden is-success')
            .toggleClass('is-error', matches.length === 0);
    }

    $search.on('input', renderSchedule);
    $type.on('change', renderSchedule);
    $sort.on('change', renderSchedule);

    $toggleFilters.on('click', function () {
        const $button = $(this);
        const willCollapse = !$button.hasClass('is-active');

        $button
            .toggleClass('is-active', willCollapse)
            .attr('aria-expanded', String(!willCollapse))
            .text(willCollapse ? 'Show filters' : 'Hide filters');
        $controlsRow.stop(true, true).slideToggle(250);
    });

    $reset.on('click', function () {
        $search.val('');
        $type.val('all');
        $sort.val('day');
        renderSchedule();
        $search.trigger('focus');
    });

    // Delegation is required because the buttons are created again after every
    // filter. A direct .on('click') on the old buttons would miss the new ones.
    $tableBody.on('click', 'button[data-choose-session]', function () {
        const $button = $(this);
        const session = SCHEDULE_SESSIONS.find(function (item) {
            return item.id === $button.attr('data-choose-session');
        });

        if (!session) {
            return;
        }

        selectedSessionId = session.id;
        saveScheduleChoice(session);

        // Chain: move from the clicked button to its row, select that row, then
        // reach its sibling rows and remove their selected appearance.
        $button
            .closest('tr')
            .addClass('is-selected')
            .siblings()
            .removeClass('is-selected');
        $tableBody.find('button[data-choose-session]').attr('aria-pressed', 'false');
        $button.attr('aria-pressed', 'true');

        $selection.find('[data-selection-detail]').text(
            session.day + ' at ' + session.time + ': ' + session.type +
            ' with ' + session.instructor + ' at ' + session.location + '. ' +
            session.durationHours + ' academic hours; ' + session.seats +
            ' demonstration place' + (session.seats === 1 ? '' : 's') + '.'
        );
        $selection
            .removeClass('is-hidden')
            .addClass('is-success')
            .stop(true, true)
            .hide()
            .slideDown(250, function () {
                $(this).trigger('focus');
            });
    });

    renderSchedule();
});
