// Section: Domain Checker — controleert .nl, .com en .net tegelijk via Promise.all
document.addEventListener('DOMContentLoaded', function () {

    var TLDS    = ['.nl', '.com', '.net'];
    var PRIJZEN = { '.nl': String.fromCharCode(8364) + '7,00/jr', '.com': String.fromCharCode(8364) + '16,00/jr', '.net': String.fromCharCode(8364) + '17,00/jr' };

    var form       = document.getElementById('domainForm');
    var input      = document.getElementById('domainInput');
    var resultGrid = document.getElementById('domainResult');
    var checkBtn   = document.getElementById('checkButton');
    // // Sectie: Geselecteerde domeinen (array)
    window.ttCheckedDomains = [];

    if (!form || !input || !resultGrid || !checkBtn) return;

    // Section: Centrale checkfunctie — aanroepbaar via submit en via onclick
    function voerCheckUit() {
        var naam = input.value.trim().toLowerCase();
        if (!naam) {
            input.focus();
            return;
        }

        // Section: Reset selectie
        window.ttCheckedDomain = '';
        window.ttCheckedDomains = [];

        // Section: Reset — leeg grid, knop uitschakelen
        resultGrid.innerHTML = '';
        resultGrid.className = 'domain-results-grid hidden';
        checkBtn.textContent = 'Controleert...';
        checkBtn.disabled    = true;

        // Section: Skelet-rijen — directe visuele feedback per TLD
        TLDS.forEach(function (tld) {
            var row = bouwRij(naam + tld, 'loading', null, tld);
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
            var allesFout = results.every(function (r) { return r.fout; });

            results.forEach(function (r) {
                var status = r.available === true  ? 'available'
                           : r.available === false ? 'taken' : 'error';
                var prijs  = r.available === true  ? PRIJZEN[r.tld] : null;
                var nieuw  = bouwRij(r.full, status, prijs, r.tld);
                nieuw.id   = 'dr-' + r.tld.slice(1);
                var oud    = document.getElementById('dr-' + r.tld.slice(1));
                if (oud) resultGrid.replaceChild(nieuw, oud);
            });

            // Section: Checkbox listeners — alleen voor beschikbare domeinen
            results.forEach(function (r) {
                if (r.available === true) {
                    var cb = document.querySelector('.dr-check[data-tld="' + r.tld + '"]');
                    if (cb) {
                        cb.addEventListener('change', function () {
                            if (cb.checked) {
                                if (!window.ttCheckedDomains.includes(r.full)) window.ttCheckedDomains.push(r.full);
                            } else {
                                window.ttCheckedDomains = window.ttCheckedDomains.filter(function (d) { return d !== r.full; });
                            }
                            // Altijd laatste geselecteerde als hoofd-domein
                            window.ttCheckedDomain = window.ttCheckedDomains.length ? window.ttCheckedDomains[window.ttCheckedDomains.length-1] : '';
                        });
                    }
                }
            });

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

    // Section: bouwRij — CSS Grid rij: icoon | naam | prijs
    // // Sectie: Bouw een resultaat-rij met checkbox
    function bouwRij(domainFull, status, prijs, tld) {
        var isAvailable = status === 'available';
        var isTaken     = status === 'taken';

        var row = document.createElement('div');
        row.className = 'dr-row ' + (isAvailable ? 'dr-vrij' : isTaken ? 'dr-bezet' : 'dr-laden');

        // Kolom 1 — checkbox (indien beschikbaar, anders leeg)
        var colCheck = document.createElement('span');
        if (isAvailable) {
            var cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.className = 'dr-check';
            cb.setAttribute('data-tld', tld);
            cb.setAttribute('aria-label', 'Selecteer domein ' + domainFull);
            colCheck.appendChild(cb);
        }

        // Kolom 2 — icoon
        var icoon = document.createElement('span');
        icoon.className = 'dr-icoon';
        if (isAvailable) {
            icoon.textContent = '';
        } else {
            icoon.textContent = isTaken ? '\u2715' : '\u00B7\u00B7\u00B7';
            icoon.setAttribute('aria-hidden', 'true');
        }

        // Kolom 3 — domeinnaam
        var naam = document.createElement('span');
        naam.className   = 'dr-naam';
        naam.textContent = domainFull;

        // Kolom 4 — prijs
        var prijsEl = document.createElement('span');
        prijsEl.className   = 'dr-prijs';
        prijsEl.textContent = (isAvailable && prijs) ? prijs : '';

        row.appendChild(colCheck);
        row.appendChild(icoon);
        row.appendChild(naam);
        row.appendChild(prijsEl);

        return row;
    }
});