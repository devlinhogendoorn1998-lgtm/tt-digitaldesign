// extra.js — email verplicht, extra's optioneel, EmailJS versturen

(function () {
    var EMAILJS_SERVICE       = 'service_8dd8z15';
    var EMAILJS_TEMPLATE_JOUW = 'template_unpav1f';  // mail naar jou (TT Digital Design)
    var EMAILJS_TEMPLATE_KLANT = 'template_f547kxa'; // bevestigingsmail naar klant
    var EMAILJS_PUBKEY        = 'WmdbKABruq6DF33lp';

    document.addEventListener('DOMContentLoaded', function () {
        // // Sectie: EmailJS init — pas initialiseren als SDK geladen is
        if (typeof emailjs !== 'undefined') {
            emailjs.init({ publicKey: EMAILJS_PUBKEY });
        }
        var checkboxes  = document.querySelectorAll('.extra-check');
        var totalEl     = document.getElementById('extras-total');
        var payBtn      = document.getElementById('pay-btn');
        var statusEl    = document.getElementById('email-status');
        var emailInput  = document.getElementById('klant-email');

        var urlParams  = new URLSearchParams(window.location.search);
        var pakketNaam = urlParams.get('pakket') || 'Niet opgegeven';
        var domeinNaam = urlParams.get('domein') || 'Niet opgegeven';

        // ---- Knop: actief als email geldig is (extras zijn optioneel) ----
        function updateBtn() {
            var emailOk = emailInput.value.trim() !== '' && emailInput.validity.valid;
            payBtn.disabled = !emailOk;
            if (emailOk) {
                payBtn.removeAttribute('aria-disabled');
            } else {
                payBtn.setAttribute('aria-disabled', 'true');
            }
        }

        // ---- Totaal bijwerken ----
        function updateTotal() {
            var total    = 0;
            var selected = [];

            checkboxes.forEach(function (cb) {
                if (cb.checked) {
                    var parts = cb.value.split('|');
                    total += parseInt(parts[1], 10);
                    selected.push(parts[0] + ' (\u20AC' + parts[1] + ',-)');
                }
            });

            totalEl.textContent     = '\u20AC' + total.toLocaleString('nl-NL') + ',-';
            payBtn.dataset.extras   = selected.length > 0 ? selected.join('\n') : 'Geen extra\u2019s geselecteerd';
            payBtn.dataset.totaal   = selected.length > 0 ? '\u20AC' + total.toLocaleString('nl-NL') + ',-' : '\u20AC0,-';
        }

        // ---- Versturen ----
        payBtn.addEventListener('click', function () {
            // Dubbele check: email moet nog steeds geldig zijn
            if (!emailInput.validity.valid || emailInput.value.trim() === '') {
                emailInput.focus();
                return;
            }

            payBtn.disabled    = true;
            payBtn.textContent = 'Bezig met versturen...';
            showStatus('', 'loading');

            // // Sectie: EmailJS guard — fallback als SDK niet geladen is
            if (typeof emailjs === 'undefined') {
                showStatus('\u26A0 Er ging iets mis. Probeer het opnieuw of mail naar marketing@ttdigitaldesign.nl', 'error');
                payBtn.disabled    = false;
                payBtn.removeAttribute('aria-disabled');
                payBtn.textContent = '\u2756 Verstuur Aanvraag';
                return;
            }

            // // Sectie: EmailJS versturen — jouw mail + bevestiging naar klant tegelijk
            var mailData = {
                pakket:      pakketNaam,
                domein:      domeinNaam,
                email:       emailInput.value.trim(),
                extras:      payBtn.dataset.extras  || 'Geen extra\u2019s geselecteerd',
                totaal:      payBtn.dataset.totaal   || '\u20AC0,-',
                aanbetaling: '\u20AC50,-'
            };

            Promise.all([
                emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE_JOUW,  mailData),
                emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE_KLANT, mailData)
            ])
            .then(function () {
                showStatus('\u2714 Uw aanvraag is verstuurd! Wij nemen zo snel mogelijk contact op via ' + emailInput.value.trim(), 'success');
                payBtn.textContent = '\u2714 Verstuurd';
                checkboxes.forEach(function (cb) { cb.disabled = true; });
                emailInput.disabled = true;
            })
            .catch(function (err) {
                showStatus('\u26A0 Er ging iets mis. Probeer het opnieuw of mail naar marketing@ttdigitaldesign.nl', 'error');
                payBtn.disabled    = false;
                payBtn.removeAttribute('aria-disabled');
                payBtn.textContent = '\u2756 Verstuur Aanvraag';
                console.error('EmailJS fout:', err);
            });
        });

        // ---- Status tonen ----
        function showStatus(msg, type) {
            statusEl.style.display = msg ? 'block' : 'none';
            statusEl.textContent   = msg;
            if (type === 'success') {
                statusEl.style.background = 'rgba(0,200,100,0.12)';
                statusEl.style.border     = '1px solid rgba(0,200,100,0.4)';
                statusEl.style.color      = '#4ade80';
            } else if (type === 'error') {
                statusEl.style.background = 'rgba(220,50,50,0.12)';
                statusEl.style.border     = '1px solid rgba(220,50,50,0.4)';
                statusEl.style.color      = '#f87171';
            } else {
                statusEl.style.background = 'rgba(212,175,55,0.08)';
                statusEl.style.border     = '1px solid rgba(212,175,55,0.3)';
                statusEl.style.color      = '#d4af37';
            }
        }

        // ---- Luister ----
        emailInput.addEventListener('input', updateBtn);
        emailInput.addEventListener('change', updateBtn);
        checkboxes.forEach(function (cb) {
            cb.addEventListener('change', updateTotal);
        });

        // Init totaal
        updateTotal();
    });
})();
