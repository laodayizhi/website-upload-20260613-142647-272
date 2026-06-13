(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var heroTimer;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  function startHero() {
    if (heroTimer || slides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      window.clearInterval(heroTimer);
      heroTimer = null;
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var rails = Array.prototype.slice.call(document.querySelectorAll('[data-rail]'));
  Array.prototype.slice.call(document.querySelectorAll('[data-rail-control]')).forEach(function (control) {
    control.addEventListener('click', function () {
      var target = document.querySelector(control.getAttribute('data-rail-control'));
      if (!target) {
        return;
      }

      var direction = control.getAttribute('data-direction') === 'left' ? -1 : 1;
      target.scrollBy({ left: direction * 340, behavior: 'smooth' });
    });
  });

  rails.forEach(function (rail) {
    rail.addEventListener('wheel', function (event) {
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        rail.scrollLeft += event.deltaY;
      }
    }, { passive: true });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
    var root = scope.parentElement || document;
    var input = scope.querySelector('[data-search-input]');
    var year = scope.querySelector('[data-year-filter]');
    var type = scope.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
    var empty = root.querySelector('[data-no-results]');

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-text') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }

        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }

        if (selectedType && cardType !== selectedType) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    if (year) {
      year.addEventListener('change', applyFilters);
    }

    if (type) {
      type.addEventListener('change', applyFilters);
    }
  });
})();
