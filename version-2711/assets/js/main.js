(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    function initCardFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

        panels.forEach(function (panel) {
            var scope = panel.parentElement;
            var searchInput = panel.querySelector('[data-card-search]');
            var typeSelect = panel.querySelector('[data-card-type]');
            var yearSelect = panel.querySelector('[data-card-year]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var emptyState = scope.querySelector('[data-empty-state]');

            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }

            function applyFilter() {
                var keyword = normalize(searchInput && searchInput.value);
                var typeValue = normalize(typeSelect && typeSelect.value);
                var yearValue = normalize(yearSelect && yearSelect.value);
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre')
                    ].join(' '));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchesType = !typeValue || cardType.indexOf(typeValue) !== -1;
                    var matchesYear = !yearValue || (yearValue === '2022' ? Number(cardYear) <= 2022 : cardYear === yearValue);
                    var isVisible = matchesKeyword && matchesType && matchesYear;

                    card.hidden = !isVisible;
                    if (isVisible) {
                        visibleCount += 1;
                    }
                });

                if (emptyState) {
                    emptyState.hidden = visibleCount > 0;
                }
            }

            [searchInput, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilter);
                    control.addEventListener('change', applyFilter);
                }
            });
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

        players.forEach(function (player) {
            var source = player.getAttribute('data-src');
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var message = player.querySelector('[data-player-message]');
            var hlsInstance = null;
            var initialized = false;

            function setMessage(text) {
                if (message) {
                    message.textContent = text;
                }
            }

            function playVideo() {
                if (!video || !source) {
                    setMessage('播放源暂不可用。');
                    return;
                }

                if (!initialized) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = source;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                setMessage('播放加载失败，请稍后重试或更换浏览器。');
                            }
                        });
                    } else {
                        setMessage('当前浏览器不支持 HLS 播放。');
                        return;
                    }
                    initialized = true;
                }

                if (button) {
                    button.classList.add('is-hidden');
                }

                video.play().then(function () {
                    setMessage('正在播放高清片源。');
                }).catch(function () {
                    setMessage('浏览器阻止了自动播放，请再次点击视频播放。');
                });
            }

            if (button) {
                button.addEventListener('click', playVideo);
            }

            if (video) {
                video.addEventListener('play', function () {
                    if (button) {
                        button.classList.add('is-hidden');
                    }
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function initGlobalSearch() {
        var input = document.getElementById('globalSearchInput');
        var select = document.getElementById('globalTypeSelect');
        var button = document.getElementById('globalSearchButton');
        var results = document.getElementById('searchResults');
        var count = document.getElementById('searchCount');

        if (!input || !results) {
            return;
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function cardTemplate(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            var oneLine = movie.oneLine || '';
            if (oneLine.length > 72) {
                oneLine = oneLine.slice(0, 71) + '…';
            }

            return [
                '<article class="movie-card">',
                '    <a class="poster-wrap" href="movies/' + escapeHtml(movie.id) + '.html">',
                '        <img src="./' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '        <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
                '        <span class="poster-play">▶</span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <div class="movie-meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
                '        <h3><a href="movies/' + escapeHtml(movie.id) + '.html">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(oneLine) + '</p>',
                '        <div class="tag-list">' + tags + '</div>',
                '    </div>',
                '</article>'
            ].join('');
        }

        function render(movies) {
            results.innerHTML = movies.map(cardTemplate).join('');
            if (count) {
                count.textContent = '找到 ' + movies.length + ' 部影片';
            }
        }

        function applySearch(movies) {
            var keyword = normalize(input.value);
            var typeValue = normalize(select && select.value);
            var filtered = movies.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' '));
                var typeMatches = !typeValue || normalize(movie.type).indexOf(typeValue) !== -1;
                var keywordMatches = !keyword || haystack.indexOf(keyword) !== -1;
                return typeMatches && keywordMatches;
            }).slice(0, 240);

            render(filtered);
        }

        window.fetch('./assets/data/movies.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (movies) {
                var params = new URLSearchParams(window.location.search);
                var query = params.get('q');
                if (query) {
                    input.value = query;
                }
                applySearch(movies);

                input.addEventListener('input', function () {
                    applySearch(movies);
                });

                if (select) {
                    select.addEventListener('change', function () {
                        applySearch(movies);
                    });
                }

                if (button) {
                    button.addEventListener('click', function () {
                        applySearch(movies);
                    });
                }
            })
            .catch(function () {
                if (count) {
                    count.textContent = '搜索数据加载失败，请从分类页继续浏览。';
                }
            });
    }

    initHero();
    initCardFilters();
    initPlayers();
    initGlobalSearch();
})();
