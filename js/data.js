'use strict';

// Shared Prestige data. Every page builds its programs, lessons and instructors
// from these arrays, so a price or a lesson time is changed in one place only.
// This file has no DOM code: it only stores data and small helper functions.

const PROGRAMS = [
    {
        id: 'category-b',
        name: 'Category B',
        price: 145000,
        weeks: 6,
        hours: 56,
        minimumAge: 17,
        maxMonths: 6
    },
    {
        id: 'intensive',
        name: 'Intensive Category B',
        price: 165000,
        weeks: 3,
        hours: 56,
        minimumAge: 17,
        maxMonths: 6
    },
    {
        id: 'refresher',
        name: 'Defensive Driving',
        price: 45000,
        weeks: 1,
        hours: 10,
        minimumAge: 18,
        maxMonths: 3
    }
];

const INSTRUCTORS = [
    { id: 'nurlan', name: 'Nurlan Idrisov' },
    { id: 'aliya', name: 'Aliya Sadykova' }
];

// instructorId is null for online theory: it is taught by the theory team.
const SCHEDULE_SESSIONS = [
    {
        id: 'mon-highway',
        day: 'Monday',
        dayOrder: 1,
        time: '10:00 AM',
        type: 'Practical',
        instructorId: 'nurlan',
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
        instructorId: null,
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
        instructorId: null,
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
        instructorId: 'aliya',
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
        instructorId: 'nurlan',
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
        instructorId: 'aliya',
        instructor: 'Aliya Sadykova',
        location: 'Right side of Astana',
        mode: 'On road',
        seats: 2,
        durationHours: 2
    }
];

const EXTRA_HOURS_OPTIONS = [0, 2, 4, 6];

// One extra practice hour costs the same for every program.
const EXTRA_HOUR_PRICE = 12000;

const CHOICES_STORAGE_KEY = 'prestigeEnrollmentChoices';

function findById(items, id) {
    return items.find(function (item) {
        return item.id === id;
    }) || null;
}

function calculateProgramTotal(program, extraHours) {
    return program.price + extraHours * EXTRA_HOUR_PRICE;
}

function describeSession(session) {
    return session.day + ' ' + session.time + ' — ' + session.type +
        ', ' + session.location;
}

// The visitor's choices (program, extra hours, lesson time, instructor) are
// collected on different pages and read by the enrollment form on index.html.
function loadEnrollmentChoices() {
    try {
        const saved = JSON.parse(sessionStorage.getItem(CHOICES_STORAGE_KEY));
        return saved && typeof saved === 'object' ? saved : {};
    } catch (error) {
        return {};
    }
}

function saveEnrollmentChoice(name, value) {
    const choices = loadEnrollmentChoices();

    if (value === '' || value === null || value === undefined) {
        delete choices[name];
    } else {
        choices[name] = value;
    }

    try {
        sessionStorage.setItem(CHOICES_STORAGE_KEY, JSON.stringify(choices));
    } catch (error) {
        return choices;
    }

    return choices;
}

function clearEnrollmentChoices() {
    try {
        sessionStorage.removeItem(CHOICES_STORAGE_KEY);
    } catch (error) {
        return false;
    }

    return true;
}
