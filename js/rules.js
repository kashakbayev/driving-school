'use strict';

// Plain rules shared by the pages: dates, enrollment validation, timetable
// filtering and sorting. No DOM code here, so the jQuery files only handle
// the page and these functions can be tested and explained on their own.

// Converts '2:00 PM' into minutes after midnight (840) so times sort correctly.
function toMinutes(time) {
    const [clock, period] = time.split(' ');
    const [hours, minutes] = clock.split(':').map(Number);
    const hours24 = (hours % 12) + (period === 'PM' ? 12 : 0);
    return hours24 * 60 + minutes;
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
            case 'time':
                return toMinutes(first.time) - toMinutes(second.time) ||
                    first.dayOrder - second.dayOrder;
            case 'day':
            default:
                return first.dayOrder - second.dayOrder ||
                    toMinutes(first.time) - toMinutes(second.time);
        }
    });
}
