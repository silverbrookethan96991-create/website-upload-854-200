(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var activeIndex = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === activeIndex);
        });
      }

      function startTimer() {
        timer = window.setInterval(function () {
          showSlide(activeIndex + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          window.clearInterval(timer);
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          startTimer();
        });
      });

      showSlide(0);
      startTimer();
    }

    var grid = document.querySelector("[data-movie-grid]");
    if (grid) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var searchInput = document.querySelector("[data-search-input]");
      var regionFilter = document.querySelector("[data-region-filter]");
      var yearFilter = document.querySelector("[data-year-filter]");
      var typeFilter = document.querySelector("[data-type-filter]");

      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : "";
      }

      function applyFilters() {
        var keyword = valueOf(searchInput);
        var region = valueOf(regionFilter);
        var year = valueOf(yearFilter);
        var type = valueOf(typeFilter);

        cards.forEach(function (card) {
          var searchable = (card.getAttribute("data-search") || "").toLowerCase();
          var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
          var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
          var cardType = (card.getAttribute("data-type") || "").toLowerCase();
          var matched = true;

          if (keyword && searchable.indexOf(keyword) === -1) {
            matched = false;
          }
          if (region && cardRegion !== region) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          if (type && cardType !== type) {
            matched = false;
          }

          card.classList.toggle("hidden", !matched);
        });
      }

      [searchInput, regionFilter, yearFilter, typeFilter].forEach(function (element) {
        if (element) {
          element.addEventListener("input", applyFilters);
          element.addEventListener("change", applyFilters);
        }
      });
    }
  });
})();
