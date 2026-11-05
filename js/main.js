'use strict';

function setNavigationState(toggle, button, expanded) {
    toggle.checked = expanded;
    button.setAttribute('aria-expanded', String(expanded));
}

function initialiseNavigation() {
    const toggle = document.querySelector('.nav-toggle');
    const button = document.querySelector('label[for="' + toggle?.id + '"]');
    const navigation = document.querySelector('.main-navigation');

    if (!toggle || !button || !navigation) {
        return;
    }

    if (navigation.id) {
        button.setAttribute('aria-controls', navigation.id);
    }

    setNavigationState(toggle, button, toggle.checked);

    toggle.addEventListener('change', function () {
        setNavigationState(toggle, button, toggle.checked);
    });

    navigation.addEventListener('click', function (event) {
        if (event.target.closest('a') && window.innerWidth < 768) {
            setNavigationState(toggle, button, false);
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && toggle.checked) {
            setNavigationState(toggle, button, false);
            button.focus();
        }
    });
}

initialiseNavigation();
