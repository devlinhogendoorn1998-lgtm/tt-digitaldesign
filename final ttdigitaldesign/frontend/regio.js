// Section: Whitelist — alle geldige steden en hun nette weergavenaam
var REGIO_STEDEN = {
    // Baarn-cluster
    'baarn':                   'Baarn',
    'eembrugge':               'Eembrugge',
    'lage-vuursche':           'Lage Vuursche',

    // Soest-cluster
    'soest':                   'Soest',
    'soesterberg':             'Soesterberg',

    // Amersfoort-cluster
    'amersfoort':              'Amersfoort',
    'hoogland':                'Hoogland',
    'hoevelaken':              'Hoevelaken',

    // Hilversum-cluster
    'hilversum':               'Hilversum',
    'laren':                   'Laren',
    'blaricum':                'Blaricum',

    // Bunschoten-Spakenburg
    'bunschoten-spakenburg':   'Bunschoten-Spakenburg',

    // Maarssen-cluster (brede dekking)
    'maarssen':                'Maarssen',
    'maarssen-dorp':           'Maarssen-Dorp',
    'maarssenbroek':           'Maarssenbroek',
    'utrecht':                 'Utrecht',
    'vleuten':                 'Vleuten',
    'de-meern':                'De Meern',
    'oud-zuilen':              'Oud-Zuilen'
};

// Section: Fallback — gebruikt wanneer geen of onbekende stad is meegegeven
var FALLBACK_NAAM = 'Midden-Nederland';

// Section: URL-parameter uitlezen — veilig: geen eval, alleen whitelist-lookup
(function initRegio() {
    var params  = new URLSearchParams(window.location.search);
    var rawStad = params.get('stad');

    // Sanitize: lowercase, trim — nooit direct in DOM injecteren zonder whitelist-check
    var sleutel = rawStad ? rawStad.toLowerCase().trim() : '';
    var stadNaam = REGIO_STEDEN[sleutel] || FALLBACK_NAAM;
    var isFallback = !REGIO_STEDEN[sleutel];

    // Section: DOM-injectie — tekstnodes, nooit innerHTML met user-input
    var naamSpan    = document.getElementById('regio-naam');
    var introEl     = document.getElementById('regio-intro');
    var uspNaamEl   = document.getElementById('regio-usp-naam');
    var ctaNaamEl   = document.getElementById('regio-cta-naam');

    if (naamSpan)  naamSpan.textContent  = stadNaam;
    if (uspNaamEl) uspNaamEl.textContent = stadNaam;
    if (ctaNaamEl) ctaNaamEl.textContent = stadNaam;

    // Section: Introductietekst — aangepaste zin per stad of fallback
    if (introEl) {
        if (isFallback) {
            introEl.textContent =
                'TT Digital Design levert high-performance websites en slimme automatiseringen '
                + 'aan ondernemers in Midden-Nederland. Snel, conversiegericht en altijd online.';
        } else {
            introEl.textContent =
                'TT Digital Design levert high-performance websites en slimme automatiseringen '
                + 'aan ondernemers in ' + stadNaam + ' en de directe omgeving. '
                + 'Lokaal gevonden worden begint met een razendsnel, professioneel fundament.';
        }
    }

    // Section: Meta-title — dynamisch voor Google-indexering per locatie
    var titleEl = document.getElementById('page-title');
    if (titleEl) {
        titleEl.textContent = isFallback
            ? 'TT Digital Design | Webdesign in Midden-Nederland'
            : 'TT Digital Design | Webdesign & Automatisering in ' + stadNaam;
    }

    // Section: Meta-description — dynamisch bijwerken voor snippet in Google
    var metaDesc = document.getElementById('meta-description');
    if (metaDesc) {
        metaDesc.setAttribute('content', isFallback
            ? 'TT Digital Design — high-end websites en AI-automatisering voor ondernemers in Midden-Nederland. Vraag vandaag een offerte aan.'
            : 'TT Digital Design — high-end websites en AI-automatisering voor ondernemers in ' + stadNaam + '. Snel, veilig en lokaal gevonden. Vraag vandaag een offerte aan.'
        );
    }

    // Section: Canonical URL — voorkomt duplicate-content penalty bij Google
    var canonicalEl = document.getElementById('canonical-link');
    if (canonicalEl && !isFallback) {
        canonicalEl.setAttribute('href',
            'https://ttdigitaldesign.nl/regio.html?stad=' + encodeURIComponent(sleutel)
        );
    }
}());
