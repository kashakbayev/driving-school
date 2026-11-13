'use strict';

// Plain JavaScript: the enrollment readiness checklist on enrollment.html.
// The visitor ticks what they already have; the page counts the progress,
// lists exactly what is still missing and where to get it, and opens the way
// to the enrollment form once everything required is ready.

const ENROLLMENT_REQUIREMENTS = [
    {
        id: 'identity',
        label: 'Identification document',
        detail: 'Have a valid national ID or passport ready.',
        whereToGet: 'your national ID card or passport',
        required: true
    },
    {
        id: 'medical',
        label: 'Medical certificate',
        detail: 'Prepare a valid driver medical certificate.',
        whereToGet: 'a driver medical certificate from a licensed clinic',
        required: true
    },
    {
        id: 'photos',
        label: 'Two passport-style photos',
        detail: 'Bring two recent passport-style photographs.',
        whereToGet: 'two 3×4 photos from any photo studio',
        required: true
    },
    {
        id: 'schedule',
        label: 'Preferred weekly schedule',
        detail: 'Choose realistic theory and practical lesson times.',
        whereToGet: 'a lesson time from the Schedule page',
        required: true
    },
    {
        id: 'contact',
        label: 'Reachable phone and email',
        detail: 'Prestige uses these details to discuss availability.',
        whereToGet: 'a phone number and email you check every day',
        required: true
    }
];

const READINESS_STORAGE_KEY = 'prestigeEnrollmentReadiness';

function loadSavedRequirements() {
    try {
        const saved = JSON.parse(sessionStorage.getItem(READINESS_STORAGE_KEY) || '[]');
        return Array.isArray(saved) ? new Set(saved) : new Set();
    } catch (error) {
        return new Set();
    }
}

function saveRequirements(selectedIds) {
    try {
        sessionStorage.setItem(READINESS_STORAGE_KEY, JSON.stringify([...selectedIds]));
    } catch (error) {
        return false;
    }

    return true;
}

function getRequiredItems() {
    return ENROLLMENT_REQUIREMENTS.filter(function (requirement) {
        return requirement.required;
    });
}

function getMissingItems(selectedIds) {
    return getRequiredItems().filter(function (requirement) {
        return !selectedIds.has(requirement.id);
    });
}

function calculateReadiness(selectedIds) {
    const required = getRequiredItems().length;
    const completed = required - getMissingItems(selectedIds).length;

    return {
        completed: completed,
        required: required,
        percentage: Math.round((completed / required) * 100),
        ready: completed === required
    };
}

function createElementWith(tagName, attributes, text) {
    const element = document.createElement(tagName);

    Object.keys(attributes).forEach(function (name) {
        element.setAttribute(name, attributes[name]);
    });

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

function createRequirementItem(requirement, checked) {
    const inputId = 'readiness-' + requirement.id;
    const column = createElementWith('div', { class: 'col-12 col-md-6' });
    const wrapper = createElementWith('div', {
        class: 'form-check border rounded-3 p-3 ps-5 h-100 bg-white'
    });
    const input = createElementWith('input', {
        class: 'form-check-input',
        type: 'checkbox',
        id: inputId,
        value: requirement.id
    });

    input.checked = checked;
    wrapper.append(
        input,
        createElementWith('label', { class: 'form-check-label fw-semibold', for: inputId }, requirement.label),
        createElementWith('small', { class: 'd-block text-body-secondary mt-1' }, requirement.detail)
    );
    column.append(wrapper);
    return column;
}

function initReadinessChecklist(column) {
    const selectedIds = loadSavedRequirements();
    const card = createElementWith('section', {
        class: 'card border-0 shadow-sm detail-card mt-4',
        'aria-labelledby': 'readiness-title'
    });
    const body = createElementWith('div', { class: 'card-body p-4 p-md-5' });
    const list = createElementWith('div', { class: 'row g-3' });
    const progress = createElementWith('progress', {
        class: 'w-100 mt-4',
        max: String(getRequiredItems().length),
        'aria-label': 'Enrollment readiness'
    });
    const status = createElementWith('p', {
        class: 'alert alert-info mt-3 mb-2',
        role: 'status',
        'aria-live': 'polite'
    });
    const missingList = createElementWith('ul', { class: 'small text-body-secondary mb-3' });
    const actions = createElementWith('div', { class: 'd-flex flex-wrap gap-2' });
    const resetButton = createElementWith('button', {
        class: 'btn btn-outline-secondary',
        type: 'button'
    }, 'Clear checklist');
    const formLink = createElementWith('a', {
        class: 'btn btn-primary is-hidden',
        href: 'index.html#enrollment-form'
    }, 'Everything is ready: open the enrollment form');

    ENROLLMENT_REQUIREMENTS.forEach(function (requirement) {
        list.append(createRequirementItem(requirement, selectedIds.has(requirement.id)));
    });

    actions.append(formLink, resetButton);
    body.append(
        createElementWith('h3', { class: 'h4', id: 'readiness-title' }, 'Check your enrollment readiness'),
        createElementWith('p', { class: 'text-body-secondary' }, 'Mark what you have. This stays in this browser tab and sends no data.'),
        list,
        progress,
        status,
        missingList,
        actions
    );
    card.append(body);
    column.append(card);

    function renderReadiness() {
        const readiness = calculateReadiness(selectedIds);
        const missing = getMissingItems(selectedIds);

        progress.value = readiness.completed;
        status.classList.toggle('alert-info', !readiness.ready);
        status.classList.toggle('alert-success', readiness.ready);
        status.textContent = readiness.ready
            ? 'Ready: all ' + readiness.required + ' preparation items are checked.'
            : readiness.completed + ' of ' + readiness.required + ' items checked (' +
                readiness.percentage + '%). Still needed:';

        missingList.replaceChildren();
        missing.forEach(function (requirement) {
            missingList.append(createElementWith('li', {}, requirement.label + ': ' + requirement.whereToGet + '.'));
        });
        missingList.classList.toggle('is-hidden', missing.length === 0);
        formLink.classList.toggle('is-hidden', !readiness.ready);
    }

    // Delegated: one listener on the list handles every checkbox inside it,
    // including ones added to ENROLLMENT_REQUIREMENTS later.
    list.addEventListener('change', function (event) {
        const checkbox = event.target;

        if (!checkbox.matches('input[type="checkbox"]')) {
            return;
        }

        if (checkbox.checked) {
            selectedIds.add(checkbox.value);
        } else {
            selectedIds.delete(checkbox.value);
        }

        saveRequirements(selectedIds);
        renderReadiness();
    });

    resetButton.addEventListener('click', function () {
        selectedIds.clear();
        list.querySelectorAll('input[type="checkbox"]').forEach(function (checkbox) {
            checkbox.checked = false;
        });
        saveRequirements(selectedIds);
        renderReadiness();
        list.querySelector('input').focus();
    });

    renderReadiness();
}

const applicationNote = document.querySelector('.application-cta p');
const enrollmentColumn = document.querySelector('#enrollment-section > .col-12.col-lg-8');

if (applicationNote) {
    applicationNote.textContent = 'The application is on the home page and asks for a phone number and email.';
}

if (enrollmentColumn) {
    initReadinessChecklist(enrollmentColumn);
}
