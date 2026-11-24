
(function () {
  function initializeTravelFilters() {
    const timeline = document.querySelector('.travel-timeline');
    const filterBar = document.querySelector('.travel-filters');

    if (!timeline || !filterBar) return;

    const entries = Array.from(
      timeline.querySelectorAll('.travel-entry')
    );

    const years = Array.from(
      timeline.querySelectorAll('.travel-year')
    );

    const buttons = Array.from(
      filterBar.querySelectorAll('.travel-filter')
    );

    // Identify each trip using its existing tag
    function getCategory(entry) {
      const tag = entry.querySelector('.travel-tag');

      if (!tag) return 'other';

      const label = tag.textContent.trim().toLowerCase();

      if (label.includes('research visit')) return 'research';
      if (label.includes('conference')) return 'conference';
      if (label.includes('workshop')) return 'workshop';
      if (label.includes('school')) return 'school';

      return 'other';
    }

    function applyFilter(category) {

      // Filter travel entries
      entries.forEach(entry => {
        const matches =
          category === 'all' ||
          getCategory(entry) === category;

        entry.hidden = !matches;
        entry.style.display = matches ? '' : 'none';
      });

      // Hide years with no matching trips
      years.forEach(year => {
        let next = year.nextElementSibling;
        let hasVisibleTrips = false;

        while (
          next &&
          !next.classList.contains('travel-year')
        ) {
          if (
            next.classList.contains('travel-entry') &&
            !next.hidden
          ) {
            hasVisibleTrips = true;
          }

          next = next.nextElementSibling;
        }

        year.hidden = !hasVisibleTrips;
        year.style.display = hasVisibleTrips ? '' : 'none';
        year.classList.remove('is-first-visible');
      });

      // Remove extra spacing from the first visible year
      const firstYear = years.find(year => !year.hidden);

      if (firstYear) {
        firstYear.classList.add('is-first-visible');
      }

      // Update active filter button
      buttons.forEach(button => {
        const active = button.dataset.filter === category;

        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }

    // Handle clicks on the filter bar
    filterBar.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-filter]');

      if (!button || !filterBar.contains(button)) return;

      applyFilter(button.dataset.filter);
    });

    // Show all entries initially
    applyFilter('all');
  }

  // Run once the HTML page is ready
  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      initializeTravelFilters
    );
  } else {
    initializeTravelFilters();
  }
})();
