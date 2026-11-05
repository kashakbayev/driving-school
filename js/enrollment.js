'use strict';

const ENROLLMENT_REQUIREMENTS = [
    {
        id: 'identity',
        label: 'Identification document',
        detail: 'Have a valid national ID or passport ready.',
        required: true
    },
    {
        id: 'medical',
        label: 'Medical certificate',
        detail: 'Prepare a valid driver medical certificate.',
        required: true
    },
    {
        id: 'photos',
        label: 'Two passport-style photos',
        detail: 'Bring two recent passport-style photographs.',
        required: true
    },
    {
        id: 'schedule',
        label: 'Preferred weekly schedule',
        detail: 'Choose realistic theory and practical lesson times.',
        required: true
    },
    {
        id: 'phone',
        label: 'Reachable telephone number',
        detail: 'Prestige uses the number to discuss availability.',
        required: true
    }
];

function createReadinessElement(tagName, text, className) {
    const element = document.createElement(tagName);
    element.textContent = text;

    if (className) {
        element.className = className;
    }

    return element;
}

function loadSavedRequirements() {
    try {
        const saved = JSON.parse(
            sessionStorage.getItem('prestigeEnrollmentReadiness') || '[]'
        );

        return Array.isArray(saved) ? new Set(saved) : new Set();
    } catch (error) {
        return new Set();
    }
}

function saveRequirements(selectedIds) {
    try {
        sessionStorage.setItem(
            'prestigeEnrollmentReadiness',
            JSON.stringify([...selectedIds])
        );
    } catch (error) {
        return false;
    }

    return true;
}

function calculateReadiness(selectedIds) {
    const completed = ENROLLMENT_REQUIREMENTS.filter(function (requirement) {
        return requirement.required && selectedIds.has(requirement.id);
    }).length;
    const required = ENROLLMENT_REQUIREMENTS.filter(function (requirement) {
        return requirement.required;
    }).length;

    return {
        completed: completed,
        required: required,
        percentage: Math.round((completed / required) * 100),
        ready: completed === required
    };
}

function initialiseReadinessChecklist() {
    const enrollmentColumn = document.querySelector(
        '#enrollment-section > .col-12.col-lg-8'
    );

    if (!enrollmentColumn) {
        return;
    }

    const selectedIds = loadSavedRequirements();
    const card = createReadinessElement(
        'section',
        '',
        'card border-0 shadow-sm detail-card mt-4'
    );
    card.setAttribute('aria-labelledby', 'readiness-title');
    const body = createReadinessElement('div', '', 'card-body p-4 p-md-5');
    const title = createReadinessElement(
        'h3',
        'Check your enrollment readiness',
        'h4'
    );
    title.id = 'readiness-title';
    const introduction = createReadinessElement(
        'p',
        'Mark what you already have. This checklist stays only in this browser tab and does not send data.',
        'text-body-secondary'
    );
    const list = createReadinessElement('div', '', 'row g-3');
    const progress = document.createElement('progress');
    progress.className = 'w-100 mt-4';
    progress.max = ENROLLMENT_REQUIREMENTS.length;
    const status = createReadinessElement(
        'p',
        '',
        'alert alert-info mt-3 mb-3'
    );
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const reset = createReadinessElement(
        'button',
        'Clear checklist',
        'btn btn-outline-secondary'
    );
    reset.type = 'button';

    for (const requirement of ENROLLMENT_REQUIREMENTS) {
        const column = createReadinessElement('div', '', 'col-12 col-md-6');
        const wrapper = createReadinessElement(
            'div',
            '',
            'form-check border rounded-3 p-3 ps-5 h-100 bg-white'
        );
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'form-check-input';
        checkbox.id = 'readiness-' + requirement.id;
        checkbox.value = requirement.id;
        checkbox.checked = selectedIds.has(requirement.id);
        const label = createReadinessElement(
            'label',
            requirement.label,
            'form-check-label fw-semibold'
        );
        label.htmlFor = checkbox.id;
        const detail = createReadinessElement(
            'small',
            requirement.detail,
            'd-block text-body-secondary mt-1'
        );
        wrapper.append(checkbox, label, detail);
        column.append(wrapper);
        list.append(column);
    }

    function renderReadiness() {
        const readiness = calculateReadiness(selectedIds);
        progress.value = readiness.completed;
        status.classList.toggle('alert-info', !readiness.ready);
        status.classList.toggle('alert-success', readiness.ready);
        status.textContent = readiness.ready
            ? 'Ready: all ' + readiness.required +
                ' preparation items are checked. You can open the application form.'
            : readiness.completed + ' of ' + readiness.required +
                ' items checked (' + readiness.percentage +
                '%). You may still apply and ask Prestige about missing documents.';
    }

    list.addEventListener('change', function (event) {
        const checkbox = event.target.closest('input[type="checkbox"]');

        if (!checkbox) {
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

    reset.addEventListener('click', function () {
        selectedIds.clear();

        for (const checkbox of list.querySelectorAll('input[type="checkbox"]')) {
            checkbox.checked = false;
        }

        saveRequirements(selectedIds);
        renderReadiness();
        list.querySelector('input')?.focus();
    });

    body.append(title, introduction, list, progress, status, reset);
    card.append(body);
    enrollmentColumn.append(card);
    renderReadiness();
}

initialiseReadinessChecklist();
