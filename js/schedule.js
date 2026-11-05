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

function createScheduleElement(tagName, text, className) {
    const element = document.createElement(tagName);
    element.textContent = text;

    if (className) {
        element.className = className;
    }

    return element;
}

function createSelectOption(value, label) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    return option;
}

function matchesScheduleFilters(session, query, type) {
    const searchable = [
        session.day,
        session.time,
        session.type,
        session.instructor,
        session.location,
        session.mode
    ].join(' ').toLowerCase();
    const matchesQuery = searchable.includes(query.trim().toLowerCase());
    const matchesType = type === 'all' || session.type === type;

    return matchesQuery && matchesType;
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
    const choice = {
        id: session.id,
        day: session.day,
        time: session.time,
        type: session.type,
        instructor: session.instructor,
        location: session.location
    };

    try {
        sessionStorage.setItem(
            'prestigeScheduleChoice',
            JSON.stringify(choice)
        );
    } catch (error) {
        return false;
    }

    return true;
}

function initialiseSchedule() {
    const table = document.getElementById('weekly-schedule-table');
    const tableBody = document.getElementById('schedule-table-body');
    const panel = document.getElementById('timetable');
    const status = document.getElementById('schedule-status');

    if (!table || !tableBody || !panel || !status) {
        return;
    }

    let selectedSessionId = '';

    const tableContainer = table.closest('.table-responsive');
    const headerRow = table.querySelector('thead tr');
    const actionHeading = createScheduleElement('th', 'Choose', 'text-center');
    actionHeading.scope = 'col';
    headerRow.append(actionHeading);

    const controls = createScheduleElement(
        'section',
        '',
        'bg-white border rounded-4 p-3 p-md-4 mb-4'
    );
    controls.setAttribute('aria-label', 'Schedule search and filters');

    const controlsRow = createScheduleElement('div', '', 'row g-3 align-items-end');
    const searchGroup = createScheduleElement('div', '', 'col-12 col-lg-5');
    const typeGroup = createScheduleElement('div', '', 'col-12 col-md-5 col-lg-3');
    const sortGroup = createScheduleElement('div', '', 'col-12 col-md-4 col-lg-2');
    const resetGroup = createScheduleElement('div', '', 'col-12 col-md-3 col-lg-2 d-grid');
    const search = createScheduleElement('input', '', 'form-control');
    const type = createScheduleElement('select', '', 'form-select');
    const sort = createScheduleElement('select', '', 'form-select');
    const reset = createScheduleElement('button', 'Reset', 'btn btn-outline-secondary');

    search.id = 'schedule-search';
    search.type = 'search';
    search.placeholder = 'Search day, instructor or location';
    search.autocomplete = 'off';
    type.id = 'schedule-type';
    type.append(
        createSelectOption('all', 'All lesson types'),
        createSelectOption('Theory', 'Theory'),
        createSelectOption('Practical', 'Practical')
    );
    sort.id = 'schedule-sort';
    sort.append(
        createSelectOption('day', 'Day and time'),
        createSelectOption('availability', 'Most availability')
    );
    reset.type = 'button';

    const searchLabel = createScheduleElement(
        'label',
        'Search schedule',
        'form-label fw-semibold'
    );
    searchLabel.htmlFor = search.id;
    const typeLabel = createScheduleElement(
        'label',
        'Lesson type',
        'form-label fw-semibold'
    );
    typeLabel.htmlFor = type.id;
    const sortLabel = createScheduleElement(
        'label',
        'Sort by',
        'form-label fw-semibold'
    );
    sortLabel.htmlFor = sort.id;

    searchGroup.append(searchLabel, search);
    typeGroup.append(typeLabel, type);
    sortGroup.append(sortLabel, sort);
    resetGroup.append(reset);
    controlsRow.append(searchGroup, typeGroup, sortGroup, resetGroup);
    controls.append(controlsRow);
    tableContainer.before(controls);

    const selection = createScheduleElement(
        'section',
        '',
        'status-message bg-white is-hidden'
    );
    selection.setAttribute('aria-live', 'polite');
    selection.append(
        createScheduleElement('h3', 'Your preferred lesson', 'h5'),
        createScheduleElement('p', '', 'mb-2'),
        createScheduleElement(
            'p',
            'Availability must be confirmed by Prestige. Selecting a row does not create a booking.',
            'small text-body-secondary mb-3'
        )
    );
    const continueLink = createScheduleElement(
        'a',
        'Continue to enrollment',
        'btn btn-primary'
    );
    continueLink.href = 'index.html#enrollment-form';
    selection.append(continueLink);
    status.after(selection);

    function createScheduleRow(session) {
        const row = document.createElement('tr');
        row.dataset.sessionId = session.id;
        row.classList.toggle('is-selected', session.id === selectedSessionId);

        const day = createScheduleElement('th', session.day, '');
        day.scope = 'row';
        const timeCell = createScheduleElement(
            'td',
            session.time + ', ' + session.type.toLowerCase(),
            ''
        );
        const instructor = createScheduleElement(
            'td',
            session.instructor,
            'd-none d-md-table-cell'
        );
        const location = document.createElement('td');
        const locationLabel = createScheduleElement(
            'span',
            session.location,
            session.mode === 'Online' ? 'badge text-bg-success' : ''
        );
        location.append(locationLabel);

        const action = createScheduleElement('td', '', 'text-center');
        const choose = createScheduleElement(
            'button',
            'Choose',
            'btn btn-sm btn-outline-primary'
        );
        choose.type = 'button';
        choose.dataset.chooseSession = session.id;
        choose.setAttribute(
            'aria-pressed',
            String(session.id === selectedSessionId)
        );
        choose.setAttribute(
            'aria-label',
            'Choose ' + session.day + ' at ' + session.time
        );
        action.append(choose);
        row.append(day, timeCell, instructor, location, action);
        return row;
    }

    function renderSchedule() {
        const matches = sortScheduleSessions(
            SCHEDULE_SESSIONS.filter(function (session) {
                return matchesScheduleFilters(session, search.value, type.value);
            }),
            sort.value
        );

        tableBody.replaceChildren();

        if (matches.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = createScheduleElement(
                'td',
                'No sessions match these filters. Reset the controls to see all times.',
                'text-center text-body-secondary p-4'
            );
            emptyCell.colSpan = 5;
            emptyRow.append(emptyCell);
            tableBody.append(emptyRow);
        } else {
            for (const session of matches) {
                tableBody.append(createScheduleRow(session));
            }
        }

        status.textContent = matches.length + ' of ' +
            SCHEDULE_SESSIONS.length + ' sessions shown.';
        status.classList.remove('is-hidden', 'is-success');
        status.classList.toggle('is-error', matches.length === 0);
    }

    search.addEventListener('input', renderSchedule);
    type.addEventListener('change', renderSchedule);
    sort.addEventListener('change', renderSchedule);

    reset.addEventListener('click', function () {
        search.value = '';
        type.value = 'all';
        sort.value = 'day';
        renderSchedule();
        search.focus();
    });

    tableBody.addEventListener('click', function (event) {
        const button = event.target.closest('button[data-choose-session]');

        if (!button) {
            return;
        }

        const session = SCHEDULE_SESSIONS.find(function (item) {
            return item.id === button.dataset.chooseSession;
        });

        if (!session) {
            return;
        }

        for (const row of tableBody.querySelectorAll('tr')) {
            const selected = row.dataset.sessionId === session.id;
            row.classList.toggle('is-selected', selected);
            row.querySelector('button[data-choose-session]')?.setAttribute(
                'aria-pressed',
                String(selected)
            );
        }

        selectedSessionId = session.id;
        saveScheduleChoice(session);
        selection.children[1].textContent = session.day + ' at ' +
            session.time + ': ' + session.type + ' with ' +
            session.instructor + ' at ' + session.location + '. ' +
            session.durationHours + ' academic hours; ' + session.seats +
            ' demonstration place' + (session.seats === 1 ? '' : 's') +
            ' shown.';
        selection.classList.remove('is-hidden');
        selection.classList.add('is-success');
        selection.focus();
    });

    selection.tabIndex = -1;
    renderSchedule();
}

initialiseSchedule();
