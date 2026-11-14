'use strict';

$(function () {
  const FADE_MS = 300;

  const $form = $('#course-search-form');
  const $search = $('#course-search-input');
  const $cards = $('#course-results').find('.course-item');
  const $status = $('#course-results-status');
  const $empty = $('#course-empty-state');
  const $table = $('#course-comparison-table');
  const initialStatus = $status.text();

  if (!$form.length || !$cards.length) {
    return;
  }

  function collectText($elements) {
    return $elements.map(function () {
      return $(this).text();
    }).get().join(' ');
  }

  // Each card remembers its own text plus its column of the comparison table,
  // so a search for "parking" also finds the course whose table cell mentions it.
  const $tableCells = $table.find('tbody td:not(:has(a))');
  $cards.each(function () {
    const $card = $(this);
    const column = $('#compare-' + $card.data('course')).index();
    const $columnCells = $tableCells.filter(function () {
      return $(this).index() === column;
    });
    const text = collectText($card.find('.course-label, h3, p, dd')) + ' ' + collectText($columnCells);
    $card.data('search', text.toLowerCase());
  });

  function getAudience() {
    return $form.find('input[name="audience"]:checked').val() || 'all';
  }

  function applyFilters() {
    const query = $search.val().trim().toLowerCase();
    const audience = getAudience();

    const $matching = $cards.filter(function () {
      const $card = $(this);
      const inAudience = audience === 'all' || $card.data('audience') === audience;
      return inAudience && $card.data('search').includes(query);
    });

    $cards.not($matching).stop(true).fadeOut(FADE_MS);
    $matching.stop(true).fadeIn(FADE_MS);

    $status.text($matching.length === $cards.length
      ? initialStatus
      : `Showing ${$matching.length} of ${$cards.length} courses.`);

    if ($matching.length === 0) {
      // Chain: stop old effects, unhide the prepared empty state, then fade it in.
      $empty.stop(true, true).removeClass('is-hidden').hide().fadeIn(FADE_MS);
    } else if (!$empty.hasClass('is-hidden')) {
      $empty.stop(true, true).fadeOut(FADE_MS, function () {
        $(this).addClass('is-hidden');
      });
    }
  }

  // The form still works without JavaScript (it reloads with ?q=...); with
  // JavaScript the page filters in place instead of reloading.
  $form.on('submit', function (event) {
    event.preventDefault();
    applyFilters();
  });

  $form.on('change', 'input[name="audience"]', applyFilters);

  // Course selection: clicking a card (or a button inside it) moves the
  // orange outline from the previously chosen card to this one.
  const $courseCards = $cards.find('.course-card');
  $courseCards.filter('.is-selected').attr('aria-current', 'true');

  $('#course-results').on('click', '.course-card', function () {
    $courseCards.removeClass('is-selected').removeAttr('aria-current');
    $(this).addClass('is-selected').attr('aria-current', 'true');
  });

  $search.on('input', applyFilters);

  // Respect a search that came from the URL (the no-JavaScript fallback).
  const params = new URLSearchParams(window.location.search);
  const requestedAudience = params.get('audience');
  $search.val(params.get('q') || '');
  if (requestedAudience) {
    $form.find('input[name="audience"]').filter(function () {
      return $(this).val() === requestedAudience;
    }).prop('checked', true);
  }
  if ($search.val() !== '' || getAudience() !== 'all') {
    applyFilters();
  }
});
