(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  const scopes = document.querySelectorAll('[data-filter-scope]');

  scopes.forEach(function (scope) {
    const container = scope.parentElement;
    const input = scope.querySelector('[data-filter-input]');
    const year = scope.querySelector('[data-year-filter]');
    const type = scope.querySelector('[data-type-filter]');
    const category = scope.querySelector('[data-category-filter]');
    const cards = Array.from(container.querySelectorAll('[data-movie-card]'));
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      const queryValue = normalize(input ? input.value : '');
      const yearValue = year ? year.value : '';
      const typeValue = type ? type.value : '';
      const categoryValue = category ? category.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const matchQuery = !queryValue || normalize(card.dataset.search).includes(queryValue);
        const matchYear = !yearValue || card.dataset.year === yearValue;
        const matchType = !typeValue || card.dataset.type === typeValue;
        const matchCategory = !categoryValue || card.dataset.category === categoryValue;
        const matched = matchQuery && matchYear && matchType && matchCategory;

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      scope.classList.toggle('is-empty', visible === 0);
    }

    [input, year, type, category].forEach(function (field) {
      if (field) {
        field.addEventListener('input', applyFilters);
        field.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  });
}());
