'use strict';

$(function () {
  const CATEGORIES = [
    { value: 'all', label: 'All courses' },
    { value: 'new', label: 'New drivers' },
    { value: 'returning', label: 'Returning drivers' },
  ];
  const FADE_MS = 300;

  const $cards = $('#course-results').find('.course-item');
  const $status = $('#course-results-status');
  const $table = $('#course-comparison-table');
  let activeCategory = 'all';

  function collectText($elements) {
    return $elements.map(function () {
      return $(this).text();
    }).get().join(' ');
  }

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

  $('#course-search-form, #course-empty-state').remove();

  const $search = $('<input>', {
    type: 'search',
    id: 'course-search',
    class: 'form-control',
    placeholder: 'For example: intensive, parking, 6 weeks',
    autocomplete: 'off',
  });

  const $filters = $('<div>', {
    id: 'filters',
    class: 'd-flex flex-wrap gap-2',
    role: 'group',
    'aria-labelledby': 'filters-label',
  });

  $.each(CATEGORIES, function (index, category) {
    $('<button>', {
      type: 'button',
      class: 'btn btn-outline-primary filter-btn',
      'data-category': category.value,
      'aria-pressed': 'false',
      text: category.label,
    }).appendTo($filters);
  });

  $filters.children().first().addClass('active').attr('aria-pressed', 'true');

  const $searchColumn = $('<div>', { class: 'col-12 col-lg-6' }).append(
    $('<label>', { for: 'course-search', class: 'form-label fw-semibold', text: 'Search courses' }),
    $search,
  );
  const $filterColumn = $('<div>', { class: 'col-12 col-lg-6' }).append(
    $('<p>', { id: 'filters-label', class: 'form-label fw-semibold', text: 'Who is the course for?' }),
    $filters,
  );

  $('<div>', { id: 'course-controls', class: 'bg-white rounded-4 shadow-sm p-3 p-md-4 mb-4' })
    .append($('<div>', { class: 'row g-3 align-items-end' }).append($searchColumn, $filterColumn))
    .insertBefore($status);

  function toggleEmptyMessage(isEmpty) {
    const $message = $('#course-no-results');
    if (!isEmpty) {
      $message.stop(true).fadeOut(FADE_MS, function () {
        $(this).remove();
      });
    } else if ($message.length > 0) {
      $message.stop(true).fadeIn(FADE_MS);
    } else {
      $('<p>', {
        id: 'course-no-results',
        class: 'status-message text-center',
        role: 'status',
        text: 'No courses found. Try another word or choose “All courses”.',
      })
        .hide()
        .insertAfter('#course-results')
        .fadeIn(FADE_MS);
    }
  }

  function applyFilters() {
    const query = $search.val().trim().toLowerCase();

    const $matching = $cards.filter(function () {
      const $card = $(this);
      const inCategory = activeCategory === 'all' || $card.data('audience') === activeCategory;
      return inCategory && $card.data('search').includes(query);
    });

    $cards.not($matching).stop(true).fadeOut(FADE_MS);
    $matching.stop(true).fadeIn(FADE_MS);

    $status.text($matching.length === $cards.length
      ? `Showing all ${$cards.length} Category B courses.`
      : `Showing ${$matching.length} of ${$cards.length} courses.`);
    toggleEmptyMessage($matching.length === 0);
  }

  $filters.on('click', '.filter-btn:not(.active)', function () {
    const $button = $(this);
    activeCategory = $button.data('category');

    $button
      .addClass('active')
      .attr('aria-pressed', 'true')
      .siblings('.filter-btn')
      .removeClass('active')
      .attr('aria-pressed', 'false');

    applyFilters();
  });

  $search.on('input', applyFilters);
});
