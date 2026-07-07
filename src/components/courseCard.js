// Returns HTML string for a single course card.
export function courseCardHtml(course) {
  const subjectIcon = course.subject?.icon || 'bi-journal-bookmark';
  const subjectName = course.subject?.name || 'General';
  const teacherName = course.teacher?.full_name || 'Petrion Academy';
  const price = Number(course.price_per_lesson).toFixed(2);

  return `
    <div class="col-md-6 col-lg-4">
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <div class="d-flex align-items-center mb-2">
            <i class="bi ${subjectIcon} text-cyan fs-4 me-2"></i>
            <span class="badge bg-elevated text-cyan border border-secondary">${subjectName}</span>
          </div>
          <h5 class="card-title">${course.title}</h5>
          <p class="card-text text-secondary small flex-grow-1">
            ${course.description ? course.description.slice(0, 110) : ''}
          </p>
          <div class="mt-2 mb-3 small text-secondary">
            <i class="bi bi-person me-1"></i> ${teacherName}
            ${course.level ? `· <span class="text-tan">${course.level}</span>` : ''}
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <span class="fw-bold text-cyan">£${price}<span class="small text-secondary">/lesson</span></span>
            <a href="course.html?id=${course.id}" class="btn btn-petrion btn-sm">
              View <i class="bi bi-arrow-right ms-1"></i>
            </a>
          </div>
        </div>
      </div>
    </div>`;
}
