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
        id: 'contact',
        label: 'Reachable phone and email',
        detail: 'Prestige uses these details to discuss availability.',
        required: true
    }
];

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
    const requiredItems = ENROLLMENT_REQUIREMENTS.filter(function (requirement) {
        return requirement.required;
    });
    const completed = requiredItems.filter(function (requirement) {
        return selectedIds.has(requirement.id);
    }).length;

    return {
        completed: completed,
        required: requiredItems.length,
        percentage: Math.round((completed / requiredItems.length) * 100),
        ready: completed === requiredItems.length
    };
}

// Rewritten feature 3: jQuery creation, .appendTo(), :checked, .each() and
// effects replace createElement/querySelectorAll. The rendering is more compact.
$(function () {
    const $enrollmentColumn = $('#enrollment-section > .col-12.col-lg-8');

    if (!$enrollmentColumn.length) {
        return;
    }

    $('.application-cta').find('p:first').text(
        'The application is on the home page and asks for a phone number and email.'
    );

    const selectedIds = loadSavedRequirements();
    const $card = $('<section>', {
        class: 'card border-0 shadow-sm detail-card mt-4',
        'aria-labelledby': 'readiness-title'
    }).appendTo($enrollmentColumn);
    const $body = $('<div>', {
        class: 'card-body p-4 p-md-5'
    }).appendTo($card);
    $('<h3>', {
        class: 'h4',
        id: 'readiness-title',
        text: 'Check your enrollment readiness'
    }).appendTo($body);
    $('<p>', {
        class: 'text-body-secondary',
        text: 'Mark what you have. This stays in this browser tab and sends no data.'
    }).appendTo($body);
    const $list = $('<div>', {
        class: 'row g-3'
    }).appendTo($body);

    $.each(ENROLLMENT_REQUIREMENTS, function (index, requirement) {
        const inputId = 'readiness-' + requirement.id;
        const $wrapper = $('<div>', {
            class: 'form-check border rounded-3 p-3 ps-5 h-100 bg-white'
        });

        $('<input>', {
            class: 'form-check-input',
            type: 'checkbox',
            id: inputId,
            value: requirement.id
        }).prop('checked', selectedIds.has(requirement.id)).appendTo($wrapper);
        $('<label>', {
            class: 'form-check-label fw-semibold',
            for: inputId,
            text: requirement.label
        }).appendTo($wrapper);
        $('<small>', {
            class: 'd-block text-body-secondary mt-1',
            text: requirement.detail
        }).appendTo($wrapper);
        $('<div>', {
            class: 'col-12 col-md-6'
        }).append($wrapper).appendTo($list);
    });

    const $progress = $('<progress>', {
        class: 'w-100 mt-4',
        max: ENROLLMENT_REQUIREMENTS.length
    }).appendTo($body);
    const $status = $('<p>', {
        class: 'alert alert-info mt-3 mb-3',
        role: 'status',
        'aria-live': 'polite'
    }).appendTo($body);
    const $reset = $('<button>', {
        class: 'btn btn-outline-secondary',
        type: 'button',
        text: 'Clear checklist'
    }).appendTo($body);
    let firstRender = true;

    function updateStatusContent(readiness) {
        $status
            .toggleClass('alert-info', !readiness.ready)
            .toggleClass('alert-success', readiness.ready)
            .text(
                readiness.ready
                    ? 'Ready: all ' + readiness.required +
                        ' preparation items are checked.'
                    : readiness.completed + ' of ' + readiness.required +
                        ' items checked (' + readiness.percentage + '%).'
            );
    }

    function renderReadiness() {
        const readiness = calculateReadiness(selectedIds);
        $progress.val(readiness.completed);

        if (firstRender) {
            updateStatusContent(readiness);
            firstRender = false;
            return;
        }

        $status.stop(true, true).fadeOut(120, function () {
            updateStatusContent(readiness);
            $(this).fadeIn(200);
        });
    }

    $list.on('change', 'input[type="checkbox"]', function () {
        selectedIds.clear();

        $list.find('input[type="checkbox"]:checked').each(function () {
            selectedIds.add($(this).val());
        });

        saveRequirements(selectedIds);
        renderReadiness();
    });

    $reset.on('click', function () {
        selectedIds.clear();
        $list.find('input[type="checkbox"]').prop('checked', false);
        saveRequirements(selectedIds);
        renderReadiness();
        $list.find('input:first').trigger('focus');
    });

    renderReadiness();
});
