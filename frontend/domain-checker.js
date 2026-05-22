// Section: Domain Checker — controleert geselecteerde TLDs tegelijk via Promise.all
(function () {
    var PRIJZEN = { '.nl': '€7,00/jr', '.com': '€16,00/jr', '.net': '€17,00/jr' };

    var form       = document.getElementById('domainForm');
    var input      = document.getElementById('domainInput');
    var resultGrid = document.getElementById('domainResult');
    var checkBtn   = document.getElementById('checkButton');

    // Section: TLD pills — aan/uit togglen
    document.querySelectorAll('.tld-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var actief = document.querySelectorAll('.tld-btn.active');
            // Minimaal 1 actief houden
            if (btn.classList.contains('active') && actief.length === 1) return;
            btn.classList.toggle('active');
        });
    });

    // Section: Form submit — werkt via Enter én via klik op knop
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var naam = input.value.trim().toLowerCase();
        var tlds = [];
        document.querySelectorAll('.tld-btn.active').forEach(function (btn) {
            tlds.push(btn.getAttribute('data-tld'));
        });

        if (!naam || tlds.length === 0) return;

        // Section: Reset — leeg grid, knop uitschakelen
        resultGrid.innerHTML = '';
        resultGrid.className = 'domain-results-grid hidden';
        checkBtn.textContent = 'Controleert...';
        checkBtn.disabled    = true;

        // Section: Skelet-rijen — toon laadstatus per geselecteerde TLD
        tlds.forEach(function (tld) {
            var row = bouwRij(naam + tld, 'loading', null);
            row.id  = 'dr-' + tld.slice(1);
            resultGrid.appendChild(row);
        });
        resultGrid.classList.remove('hidden');

        // Section: Promise.all — alle geselecteerde TLDs simultaan checken
        var checks = tlds.map(function (tld) {
            var full = naam + tld;
            return fetch(
                '/.netlify/functions/check-domain?domain=' + encodeURIComponent(full)
            )
                .then(function (res) {
                    if (!res.ok) throw new Error();
                    return res.json();
                })
                .then(function (data) {
                    return { tld: tld, full: full, available: data.available };
                })
                .catch(function () {
                    return { tld: tld, full: full, available: null };
                });
        });

        Promise.all(checks).then(function (results) {
            // Section: Resultaten invullen — skelet-rijen vervangen door definitieve rijen
            results.forEach(function (r) {
                var status = r.available === true  ? 'available'
                           : r.available === false ? 'taken' : 'error';
                var prijs  = r.available === true  ? PRIJZEN[r.tld] : null;
                var nieuw  = bouwRij(r.full, status, prijs);
                nieuw.id   = 'dr-' + r.tld.slice(1);
                var oud    = document.getElementById('dr-' + r.tld.slice(1));
                if (oud) resultGrid.replaceChild(nieuw, oud);
            });
        }).finally(function () {
            checkBtn.textContent = 'Controleer beschikbaarheid';
            checkBtn.disabled    = false;
            input.focus();
        });
    });

    // Section: bouwRij — puur DOM-constructie, nooit innerHTML met user-input
    function bouwRij(domainFull, status, prijs) {
        var row      = document.createElement('div');
        var badgeTxt = status === 'available' ? 'Vrij'
                     : status === 'taken'     ? 'Bezet' : '...';
        var badgeCls = status === 'available' ? 'vrij'
                     : status === 'taken'     ? 'bezet' : 'laden';
        var rowCls   = status === 'available' ? 'available'
                     : status === 'taken'     ? 'taken'  : 'loading';

        row.className = 'domain-result-row ' + rowCls;

        // -- Links: badge + domeinnaam
        var left  = document.createElement('div');
        left.className = 'dr-left';

        var badge = document.createElement('span');
        badge.className   = 'dr-badge ' + badgeCls;
        badge.textContent = badgeTxt;

        var naam = document.createElement('span');
        naam.className   = 'dr-name';
        naam.textContent = domainFull;

        left.appendChild(badge);
        left.appendChild(naam);
        row.appendChild(left);

        // -- Rechts: prijs + gratis-melding (alleen bij vrij domein)
        if (prijs) {
            var right  = document.createElement('div');
            right.className = 'dr-price';

            var sterk  = document.createElement('strong');
            sterk.textContent = prijs;

            var gratis = document.createElement('span');
            gratis.className   = 'gratis';
            gratis.textContent = 'Gratis bij hosting!';

            right.appendChild(sterk);
            right.appendChild(gratis);
            row.appendChild(right);
        }

        return row;
    }
})();

    var form       = document.getElementById('domainForm');
    var input      = document.getElementById('domainInput');
    var resultGrid = document.getElementById('domainResult');
    var checkBtn   = document.getElementById('checkButton');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var naam = input.value.trim().toLowerCase();

        // Section: Reset — leeg grid, knop uitschakelen
        resultGrid.innerHTML = '';
        resultGrid.className = 'domain-results-grid hidden';
        checkBtn.textContent = 'Systeem controleert...';
        checkBtn.disabled    = true;

        // Section: Skelet-rijen — toon laadstatus per TLD
        TLDS.forEach(function (tld) {
            var row = bouwRij(naam + tld, 'loading', null);
            row.id  = 'dr-' + tld.slice(1);
            resultGrid.appendChild(row);
        });
        resultGrid.classList.remove('hidden');

        // Section: Promise.all — één fetch per TLD, simultaan
        var checks = TLDS.map(function (tld) {
            var full = naam + tld;
            return fetch(
                '/.netlify/functions/check-domain?domain=' + encodeURIComponent(full)
            )
                .then(function (res) {
                    if (!res.ok) throw new Error();
                    return res.json();
                })
                .then(function (data) {
                    return { tld: tld, full: full, available: data.available };
                })
                .catch(function () {
                    return { tld: tld, full: full, available: null };
                });
        });

        Promise.all(checks).then(function (results) {
            // Section: Resultaten invullen — skelet-rijen vervangen door definitieve rijen
            results.forEach(function (r) {
                var status = r.available === true  ? 'available'
                           : r.available === false ? 'taken' : 'error';
                var prijs  = r.available === true  ? PRIJZEN[r.tld] : null;
                var nieuw  = bouwRij(r.full, status, prijs);
                nieuw.id   = 'dr-' + r.tld.slice(1);
                var oud    = document.getElementById('dr-' + r.tld.slice(1));
                resultGrid.replaceChild(nieuw, oud);
            });
        }).finally(function () {
            checkBtn.textContent = 'Controleer .nl \u00b7 .com \u00b7 .net';
            checkBtn.disabled    = false;
        });
    });

    // Section: bouwRij — puur DOM-constructie, nooit innerHTML met user-input
    function bouwRij(domainFull, status, prijs) {
        var row      = document.createElement('div');
        var badgeTxt = status === 'available' ? 'Vrij'
                     : status === 'taken'     ? 'Bezet' : '...';
        var badgeCls = status === 'available' ? 'vrij'
                     : status === 'taken'     ? 'bezet' : 'laden';
        var rowCls   = status === 'available' ? 'available'
                     : status === 'taken'     ? 'taken'  : 'loading';

        row.className = 'domain-result-row ' + rowCls;

        // -- Links: badge + domeinnaam
        var left = document.createElement('div');
        left.className = 'dr-left';

        var badge = document.createElement('span');
        badge.className   = 'dr-badge ' + badgeCls;
        badge.textContent = badgeTxt;

        var naam = document.createElement('span');
        naam.className   = 'dr-name';
        naam.textContent = domainFull;

        left.appendChild(badge);
        left.appendChild(naam);
        row.appendChild(left);

        // -- Rechts: prijs + gratis-melding (alleen bij vrij domein)
        if (prijs) {
            var right  = document.createElement('div');
            right.className = 'dr-price';

            var sterk = document.createElement('strong');
            sterk.textContent = prijs;

            var gratis = document.createElement('span');
            gratis.className   = 'gratis';
            gratis.textContent = 'Gratis bij hosting!';

            right.appendChild(sterk);
            right.appendChild(gratis);
            row.appendChild(right);
        }

        return row;
    }
})();
