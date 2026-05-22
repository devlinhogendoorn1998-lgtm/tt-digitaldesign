// Section: Domain Checker — koppeling met Netlify function check-domain
document.getElementById('domainForm').addEventListener('submit', function (e) {
    e.preventDefault();

    var domainName = document.getElementById('domainInput').value.trim();
    var tld        = document.getElementById('tldSelect').value;
    var fullDomain = domainName + tld;

    var resultDiv   = document.getElementById('domainResult');
    var checkButton = document.getElementById('checkButton');

    // Section: Reset — wis vorig resultaat voor nieuwe check
    resultDiv.className = 'domain-status-msg hidden';
    resultDiv.style.color = '';
    resultDiv.textContent = '';
    checkButton.textContent = 'Systeem controleert...';
    checkButton.disabled = true;

    // Section: Fetch — aanroep naar Netlify serverside function
    fetch('/.netlify/functions/check-domain?domain=' + encodeURIComponent(fullDomain))
        .then(function (response) {
            if (!response.ok) { throw new Error('Netlify function reageert niet'); }
            return response.json();
        })
        .then(function (data) {
            resultDiv.classList.remove('hidden');

            // Section: Resultaat injectie — via textContent + DOM nodes (geen innerHTML met user-input)
            var strong = document.createElement('strong');
            strong.textContent = fullDomain;

            var msg = document.createElement('span');

            if (data.available === true) {
                resultDiv.style.color = '#3fb950';
                msg.textContent = '\uD83C\uDF89 ';
                resultDiv.appendChild(msg);
                resultDiv.appendChild(strong);
                var rest = document.createElement('span');
                rest.textContent = ' is nog vrij! Neem direct contact op om hem te claimen.';
                resultDiv.appendChild(rest);
            } else {
                resultDiv.style.color = '#f85149';
                msg.textContent = '\u274C Helaas, ';
                resultDiv.appendChild(msg);
                resultDiv.appendChild(strong);
                var rest2 = document.createElement('span');
                rest2.textContent = ' is al bezet. Probeer een andere naam.';
                resultDiv.appendChild(rest2);
            }
        })
        .catch(function (error) {
            resultDiv.classList.remove('hidden');
            resultDiv.style.color = '#f85149';
            resultDiv.textContent = 'Er ging iets mis bij het controleren. Probeer het opnieuw.';
            console.error('Domain check error:', error);
        })
        .finally(function () {
            checkButton.textContent = 'Controleer beschikbaarheid';
            checkButton.disabled = false;
        });
});
