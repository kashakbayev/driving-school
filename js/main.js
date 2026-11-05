'use strict';

// jQuery 3.7.1 is loaded by each page. The ready wrapper waits until the frozen
// HTML is available before selectors, attributes and event handlers are used.
$(function () {
    const $toggle = $('.nav-toggle:first');
    const $button = $('label[for="' + $toggle.attr('id') + '"]');
    const $navigation = $('.main-navigation:first');

    if (!$toggle.length || !$button.length || !$navigation.length) {
        return;
    }

    function setNavigationState(expanded) {
        $toggle.prop('checked', expanded);
        $button.attr('aria-expanded', String(expanded));
    }

    if ($navigation.attr('id')) {
        $button.attr('aria-controls', $navigation.attr('id'));
    }

    $button.attr({
        role: 'button',
        tabindex: '0'
    });

    setNavigationState($toggle.prop('checked'));

    $toggle.on('change', function () {
        setNavigationState($(this).prop('checked'));
    });

    $navigation.on('click', 'a', function () {
        if (window.innerWidth < 768) {
            setNavigationState(false);
        }
    });

    $button.on('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setNavigationState(!$toggle.prop('checked'));
        }
    });

    $(document).on('keydown', function (event) {
        if (event.key === 'Escape' && $toggle.prop('checked')) {
            setNavigationState(false);
            $button.trigger('focus');
        }
    });
});
