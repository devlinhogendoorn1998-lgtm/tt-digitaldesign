// Section: Domain Checker — controleert .nl, .com en .net tegelijk via Promise.all
document.addEventListener('DOMContentLoaded', function () {

    var TLDS    = ['.nl', '.com', '.net'];
    var PRIJZEN = { '.nl': String.fromCharCode(8364) + '7,00/jr', '.com': String.fromCharCode(8364) + '16,00/jr', '.net': String.fromCharCode(8364) + '17,00/jr' };

    var form       = document.getElementById('domainForm');
    var input      = document.getElementById('domainInput');
    var resultGrid = document.getElementById('domainResult');
    var checkBtn   = document.getElementById('checkButton');

    if (!form || !input || !resultGrid || !checkBtn) return;

    // Section: Centrale checkfunctie — aanroepbaar via submit en via onclick
    function voerCheckUit() {
        var naam = input.value.trim().toLowerCase();
        if (!naam) {
            input.focus();
            return;
        }

        // Section: Reset — leeg grid, knop uitschakelen
        resultGrid.innerHTML = '';
        resultGrid.className = 'domain-results-grid hidden';
        checkBtn.textContent = 'Controleert...';
        checkBtn.disabled    = true;

        // Section: Skelet-rijen — directe visuele feedback per TLD
        TLDS.forEach(function (tld) {
            var row = bouwRij(naam + tld, 'loading', null);
            row.id  = 'dr-' + tld.slice(1);
            resultGrid.appendChild(row);
        });
        resultGrid.classList.remove('hidden');

        // Section: Promise.all — alle drie TLDs simultaan checken via Netlify function
        var checks = TLDS.map(function (tld) {
            var full = naam + tld;
            return fetch(
                '/.netlify/functions/check-domain?domain=' + encodeURIComponent(full),
                { cache: 'no-store' }
            )
                .then(function (res) {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.json();
                })
                .then(function (data) {
                    return { tld: tld, full: full, available: data.available };
                })
                .catch(function (err) {
                    return { tld: tld, full: full, available: null, fout: true };
                });
        });

        Promise.all(checks).then(function (results) {
            // Section: Resultaten — skelet-rijen vervangen door definitieve rijen
            var allesFout = results.every(function (r) { return r.fout; });

            results.forEach(function (r) {
                var status = r.available === true  ? 'available'
                           : r.available === false ? 'taken' : 'error';
                var prijs  = r.available === true  ? PRIJZEN[r.tld] : null;
                var nieuw  = bouwRij(r.full, status, prijs);
                nieuw.id   = 'dr-' + r.tld.slice(1);
                var oud    = document.getElementById('dr-' + r.tld.slice(1));
                if (oud) resultGrid.replaceChild(nieuw, oud);
            });

            // Section: Netlify function fout — toon melding als alle calls mislukken
            if (allesFout) {
                resultGrid.innerHTML = '';
                var foutRij = document.createElement('p');
                foutRij.className = 'domain-error-msg';
                foutRij.textContent = 'Kan de check niet uitvoeren. Probeer het opnieuw of neem contact op.';
                resultGrid.appendChild(foutRij);
            }
        }).then(function () {
            checkBtn.textContent = 'Controleer beschikbaarheid';
            checkBtn.disabled    = false;
            input.focus();
        });
    }

    // Section: Form submit — vangt Enter en knopklik op
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        voerCheckUit();
    });

    // Section: Onclick backup op de knop — extra zekerheid naast form submit
    checkBtn.addEventListener('click', function (e) {
        if (e.type === 'click' && checkBtn.type !== 'submit') return;
        // submit-event wordt al afgevangen, dit is alleen fallback
    });

    // Section: bouwRij — puur DOM-constructie, nooit innerHTML met user-input
    function bouwRij(domainFull, status, prijs) {
        var badgeTxt = status === 'available' ? 'Vrij'
                     : status === 'taken'     ? 'Bezet' : '...';
        var badgeCls = status === 'available' ? 'vrij'
                     : status === 'taken'     ? 'bezet' : 'laden';
        var rowCls   = status === 'available' ? 'available'
                     : status === 'taken'     ? 'taken'  : 'loading';

        var row = document.createElement('div');
        row.className = 'domain-result-row ' + rowCls;

        var left  = document.createElement('div');
        left.className = 'dr-left';

        var badge = document.createElement('span');
        badge.className   = 'dr-badge ' + badgeCls;
        badge.textContent = badgeTxt;

        var naamEl = document.createElement('span');
        naamEl.className   = 'dr-name';
        naamEl.textContent = domainFull;

        left.appendChild(badge);
        left.appendChild(naamEl);
        row.appendChild(left);

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
});