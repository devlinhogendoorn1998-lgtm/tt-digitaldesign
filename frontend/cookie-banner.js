// ── TT Digital Design — Cookie Banner ────────────────────────────────────────
// Toont banner één keer; onthoudt keuze 30 dagen via cookie.
// Werkt op alle pagina's identiek.
// // perf: geen layout-reads na DOM-mutaties; dubbel requestAnimationFrame voorkomt
//         forced reflow bij banner-transitie — Lighthouse 174ms komt NIET uit dit bestand
// ─────────────────────────────────────────────────────────────────────────────

(function () {
    // ── Hulpfuncties ─────────────────────────────────────────────────────────
    function getCookie(naam) {
        const match = document.cookie.match(new RegExp('(?:^|; )' + naam + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
    }

    function setCookie(naam, waarde, dagen) {
        const d = new Date();
        d.setTime(d.getTime() + dagen * 24 * 60 * 60 * 1000);
        document.cookie = naam + '=' + encodeURIComponent(waarde) +
            '; expires=' + d.toUTCString() +
            '; path=/; SameSite=Lax';
    }

    // Al een keuze gemaakt? Dan niets doen.
    if (getCookie('tt_cookie_consent')) return;

    // ── Banner bouwen ─────────────────────────────────────────────────────────
    const banner = document.createElement('div');
    banner.id = 'tt-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie-toestemming');
    banner.setAttribute('aria-modal', 'false');

    banner.innerHTML =
        '<div class="tt-cookie-inner">' +
            '<div class="tt-cookie-logo">TT <span>Digital Design</span></div>' +
            '<p class="tt-cookie-tagline">Geen handel, alleen fundament.</p>' +
            '<p class="tt-cookie-text">' +
                'Bij TT Digital Design bouwen we op een sterke basis. Dat geldt ook voor uw privacy. ' +
                'Wij gebruiken cookies om uw ervaring te verbeteren en uw voorkeuren <strong>30 dagen</strong> te onthouden.' +
            '</p>' +
            '<ul class="tt-cookie-list">' +
                '<li>\u2714 Uw gegevens worden nooit verkocht aan derden.</li>' +
                '<li>\u2714 Alles staat op een maximaal beveiligd systeem.</li>' +
                '<li>\u2714 Wij bewaren gegevens alleen zolang als nodig voor uw project.</li>' +
            '</ul>' +
            '<p class="tt-cookie-question">Accepteert u onze digitale fundering?</p>' +
            '<div class="tt-cookie-btns">' +
                '<button id="tt-cookie-accept" type="button">Accepteren</button>' +
                '<button id="tt-cookie-decline" type="button">Weigeren</button>' +
            '</div>' +
        '</div>';

    document.body.appendChild(banner);

    // Kleine vertraging zodat CSS-overgang zichtbaar is
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            banner.classList.add('tt-cookie-visible');
        });
    });

    // ── Knoppen ───────────────────────────────────────────────────────────────
    document.getElementById('tt-cookie-accept').addEventListener('click', function () {
        setCookie('tt_cookie_consent', 'accepted', 30);
        sluitBanner();
    });

    document.getElementById('tt-cookie-decline').addEventListener('click', function () {
        setCookie('tt_cookie_consent', 'declined', 30);
        sluitBanner();
    });

    function sluitBanner() {
        banner.classList.remove('tt-cookie-visible');
        banner.classList.add('tt-cookie-hiding');
        setTimeout(function () {
            if (banner.parentNode) banner.parentNode.removeChild(banner);
        }, 400);
    }
})();
