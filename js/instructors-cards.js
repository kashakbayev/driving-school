'use strict';

// Plain JavaScript: builds the instructor profiles on instructors.html from the
// INSTRUCTORS array in js/data.js, so no profile markup is written in the HTML.
// js/instructors.js (jQuery) then adds search, filters and the "Choose" buttons.

function createElementWith(tagName, attributes, text) {
  const element = document.createElement(tagName);

  Object.keys(attributes).forEach((name) => {
    element.setAttribute(name, attributes[name]);
  });

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function getFirstName(instructor) {
  return instructor.name.split(' ')[0];
}

function createSpecialtyList(instructor) {
  const list = createElementWith('div', {
    class: 'd-flex flex-wrap gap-2 mb-4',
    'aria-label': `${getFirstName(instructor)}'s specialties`,
  });

  instructor.specialties.forEach((specialty) => {
    list.append(createElementWith('span', { class: 'specialty-badge' }, specialty.label));
  });

  return list;
}

function createInstructorCard(instructor) {
  const column = createElementWith('div', { class: 'col-12 col-md-6', id: `${instructor.id}-profile` });
  const article = createElementWith('article', {
    class: 'card instructor-card h-100 border-0 shadow-sm overflow-hidden',
    'data-instructor': instructor.id,
    'data-specialty': instructor.specialties.map((specialty) => specialty.id).join(' '),
  });
  const body = createElementWith('div', { class: 'card-body p-4 d-flex flex-column' });

  body.append(
    createElementWith('span', { class: 'role-label align-self-start' }, instructor.role),
    createElementWith('h3', { class: 'h2 mt-3 mb-2', id: `${instructor.id}-name` }, instructor.name),
    createElementWith('p', { class: 'text-body-secondary' }, instructor.description),
    createSpecialtyList(instructor),
  );

  article.append(
    createElementWith('img', {
      class: 'card-img-top instructor-photo',
      id: `${instructor.id}-photo`,
      src: instructor.photo,
      alt: `${instructor.name}, driving instructor`,
      loading: 'lazy',
    }),
    body,
  );
  column.append(article);
  return column;
}

// Total number of specialties the team covers, shown in the section summary.
function countSpecialties(instructors) {
  return instructors.reduce((total, instructor) => total + instructor.specialties.length, 0);
}

function renderInstructors(container, summary) {
  INSTRUCTORS.forEach((instructor) => {
    container.append(createInstructorCard(instructor));
  });

  const names = INSTRUCTORS.map(getFirstName).join(' and ');
  summary.textContent = INSTRUCTORS.length === 0
    ? 'Instructor profiles are being updated. Please call the school.'
    : `${names} cover ${countSpecialties(INSTRUCTORS)} teaching specialties between them. Learn about their focus before choosing a course.`;
}

const instructorList = document.getElementById('instructors-list');
const teamSummary = document.querySelector('#instructor-team .section-heading p:last-child');

if (instructorList && teamSummary) {
  renderInstructors(instructorList, teamSummary);
}
