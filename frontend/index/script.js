// ============================================================
// script.js — index pagina JavaScript
// Bevat: menu, domain checker, Google reviews, legal modals
// ============================================================

// ── Sectie: Hamburger Menu ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    var menuBtn = document.getElementById('menu-btn');
    var navMenu = document.getElementById('nav-menu');

    if (!menuBtn || !navMenu) return;

    function openMenu() {
        navMenu.classList.add('active');
        menuBtn.classList.add('open');
        menuBtn.setAttribute('aria-expanded', 'true');
        menuBtn.setAttribute('aria-label', 'Sluit navigatiemenu');
    }

    function closeMenu() {
        navMenu.classList.remove('active');
        menuBtn.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Open navigatiemenu');
    }

    menuBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        navMenu.classList.contains('active') ? closeMenu() : openMenu();
    });

    navMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (e) {
        if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && e.target !== menuBtn) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
    });
});

// ── Sectie: Domain Checker ────────────────────────────────────────────────────
document.getElementById('domainForm').addEventListener('submit', function (e) {
    e.preventDefault();

    var domainName  = document.getElementById('domainInput').value.trim();
    var tld         = document.getElementById('tldSelect').value;
    var fullDomain  = domainName + tld;
    var resultDiv   = document.getElementById('domainResult');
    var checkButton = document.getElementById('checkButton');

    // Reset vorig resultaat
    resultDiv.className        = 'domain-status-msg hidden';
    resultDiv.style.color      = '';
    resultDiv.textContent      = '';
    checkButton.textContent    = 'Systeem controleert...';
    checkButton.disabled       = true;

    fetch('/.netlify/functions/check-domain?domain=' + encodeURIComponent(fullDomain))
        .then(function (response) {
            if (!response.ok) throw new Error('Netlify function reageert niet');
            return response.json();
        })
        .then(function (data) {
            resultDiv.classList.remove('hidden');

            var strong = document.createElement('strong');
            strong.textContent = fullDomain;

            var msg = document.createElement('span');

            if (data.available === true) {
                resultDiv.style.color = '#3fb950';
                msg.textContent = '🎉 ';
                resultDiv.appendChild(msg);
                resultDiv.appendChild(strong);
                var rest = document.createElement('span');
                rest.textContent = ' is nog vrij! Neem direct contact op om hem te claimen.';
                resultDiv.appendChild(rest);
            } else {
                resultDiv.style.color = '#f85149';
                msg.textContent = '❌ Helaas, ';
                resultDiv.appendChild(msg);
                resultDiv.appendChild(strong);
                var rest2 = document.createElement('span');
                rest2.textContent = ' is al bezet. Probeer een andere naam.';
                resultDiv.appendChild(rest2);
            }
        })
        .catch(function (error) {
            resultDiv.classList.remove('hidden');
            resultDiv.style.color  = '#f85149';
            resultDiv.textContent  = 'Er ging iets mis bij het controleren. Probeer het opnieuw.';
            console.error('Domain check error:', error);
        })
        .finally(function () {
            checkButton.textContent = 'Controleer beschikbaarheid';
            checkButton.disabled    = false;
        });
});

// ── Sectie: Google Review Badge — live score ophalen ─────────────────────────
(function syncReviews() {
    var scoreEl = document.getElementById('live-score');
    var countEl = document.getElementById('live-count');

    var ctrl  = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 5000);

    fetch('/.netlify/functions/get-reviews', {
        signal: ctrl.signal,
        cache:  'no-store'
    })
        .then(function (res) {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(function (data) {
            if (scoreEl && !isNaN(parseFloat(data.score)))
                scoreEl.textContent = parseFloat(data.score).toFixed(1);
            if (countEl && !isNaN(parseInt(data.count, 10)))
                countEl.textContent = parseInt(data.count, 10);
        })
        .catch(function () { /* fallback-waarden blijven in de HTML staan */ })
        .finally(function () { clearTimeout(timer); });
})();

// ── Sectie: Legal Modals — privacy & algemene voorwaarden ────────────────────
function openModal(id) {
    var overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    var overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.remove('modal-open');
    document.body.style.overflow = '';
}

// Sluit modal bij klik op de overlay (buiten het modal-venster)
document.querySelectorAll('.legal-modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal(overlay.id);
    });
});

// Sluit modal met Escape-toets
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.legal-modal-overlay.modal-open').forEach(function (overlay) {
            closeModal(overlay.id);
        });
    }
});
