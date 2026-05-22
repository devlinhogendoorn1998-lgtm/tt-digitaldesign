// Section: Domain Checker — controleert .nl, .com en .net tegelijk via Promise.all
(function () {
    var TLDS    = ['.nl', '.com', '.net'];
    var PRIJZEN = { '.nl': '\u20ac7,00/jr', '.com': '\u20ac16,00/jr', '.net': '\u20ac17,00/jr' };

    var form       = document.getElementById('domainForm');
    var input      = document.getElementById('domainInput');
    var resultGrid = document.getElementById('domainResult');
    var checkBtn   = document.getElementById('checkButton');

    // Section: Form submit — werkt via Enter en via klik op knop
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var naam = input.value.trim().toLowerCase();
        if (!naam) return;

        // Section: Reset — leeg grid, knop uitschakelen
        resultGrid.innerHTML = '';
        resultGrid.className = 'domain-results-grid hidden';
        checkBtn.textContent = 'Controleert...';
        checkBtn.disabled    = true;

        // Section: Skelet-rijen — toon laadstatus per TLD
        TLDS.forEach(function (tld) {
            var row = bouwRij(naam + tld, 'loading', null);
            row.id  = 'dr-' + tld.slice(1);
            resultGrid.appendChild(row);
        });
        resultGrid.classList.remove('hidden');

        // Section: Promise.all — alle drie TLDs simultaan checken
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