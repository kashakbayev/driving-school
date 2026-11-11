'use strict';

// FAQ on courseDetail.html: questions come from an array, open one at a time with a slide, and can be searched. jQuery.

$(function () {
  const SLIDE_MS = 250;
  const FADE_MS = 200;
  const PHONE_TEXT = '+7 (705) 844 4848';
  const FAQ = [
    {
      id: 'transmission',
      question: 'Can I switch from manual to automatic during the course?',
      answer: 'Yes, with instructor approval before week 3.',
    },
    {
      id: 'final-test',
      question: 'What happens if I fail the final test?',
      answer: 'You get two free retake lessons before the next exam attempt.',
    },
    {
      id: 'age',
      question: 'How old do I need to be?',
      answer: 'You can start the course at 17. The license is issued from age 18.',
    },
    {
      id: 'documents',
      question: 'Which documents do I need?',
      answer: 'A valid medical certificate and two passport-style photos.',
    },
    {
      id: 'theory',
      question: 'Do I have to come to the office for theory?',
      answer: 'No. Theory classes are online on Tuesdays at 5 PM and 7 PM.',
    },
    {
      id: 'installments',
      question: 'Can I pay for the course in parts?',
      answer: 'The installment calculator on the Courses page shows a 3- or 6-month plan. '
        + 'Please confirm the terms with the school before you apply.',
    },
    {
      id: 'practice',
      question: 'When are the practical lessons?',
      answer: 'By appointment on Monday and Wednesday–Friday, 10 AM–9 PM, at a time that suits you and your instructor.',
    },
    {
      id: 'bilingual',
      question: 'Is there a theory class with a bilingual instructor?',
      answer: 'Yes. The online theory class on Tuesday at 7 PM is taught by a bilingual instructor.',
    },
  ];

  const $faqList = $('#faq-list');

  $.each(FAQ, function (index, item) {
    $('<details>', { class: 'faq-item border-bottom p-3 p-md-4', id: `faq-${item.id}` })
      .append(
        $('<summary>', { class: 'fw-bold', text: item.question }),
        $('<p>', { class: 'text-body-secondary mt-2 mb-0', text: item.answer }),
      )
      .appendTo($faqList);
  });
  const $items = $faqList.children('.faq-item');
  $items.last().removeClass('border-bottom');

  const $search = $('<input>', {
    type: 'search', class: 'form-control', id: 'faq-search', autocomplete: 'off',
    placeholder: 'Search the questions, for example: pay, age, documents',
  });
  $('<div>', { class: 'mb-3' })
    .append($('<label>', { class: 'visually-hidden', for: 'faq-search', text: 'Search the questions' }), $search)
    .insertBefore($faqList);

  const $empty = $('<p>', { class: 'status-message mb-3', id: 'faq-empty', role: 'status' })
    .text(`No question matches. Call ${PHONE_TEXT} and we will answer it.`)
    .hide()
    .insertBefore($faqList);

  // Slides the answers up; <details> is closed only after the effect, or the answer would vanish at once
  function closeAnswers($details) {
    $details.children('p').stop(true, true).slideUp(SLIDE_MS, function () {
      $(this).parent().prop('open', false);
    });
  }

  // Delegated on the list, so it works for every question built above
  $faqList.on('click', '.faq-item summary', function (event) {
    event.preventDefault();
    const $item = $(this).closest('.faq-item');

    if ($item.prop('open')) {
      closeAnswers($item);
      return;
    }
    closeAnswers($item.siblings('[open]'));
    $item.prop('open', true).children('p').hide().slideDown(SLIDE_MS);
  });

  $search.on('input', function () {
    const query = $(this).val().trim().toLowerCase();
    const $matching = $items.filter(function () {
      return $(this).text().toLowerCase().includes(query);
    });
    const $hidden = $items.not($matching);

    closeAnswers($hidden.filter('[open]'));
    $hidden.stop(true, true).fadeOut(FADE_MS);
    $matching.stop(true, true).fadeIn(FADE_MS);

    $items.addClass('border-bottom');
    $matching.last().removeClass('border-bottom');

    if ($matching.length === 0) {
      $empty.stop(true).fadeIn(FADE_MS);
    } else {
      $empty.stop(true).fadeOut(FADE_MS);
    }
  });
});
