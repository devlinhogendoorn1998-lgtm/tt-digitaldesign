// Section: Netlify Function — check-domain
// Controleert via DNS of een domeinnaam in gebruik is.
// DNS-lookup: geen resultaat = waarschijnlijk vrij, resultaat = bezet.
// Endpoint: /.netlify/functions/check-domain?domain=jouwbedrijf.nl

const dns = require('dns').promises;

// Section: CORS headers — Netlify functions vereisen expliciete headers
const HEADERS = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
};

exports.handler = async function (event) {
    // Section: Input validatie — alleen GET toegestaan, domein verplicht
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    var domain = (event.queryStringParameters && event.queryStringParameters.domain) || '';
    domain = domain.trim().toLowerCase();

    // Section: Sanitize — alleen toegestane tekens (letters, cijfers, koppelteken, punt)
    if (!domain || !/^[a-z0-9][a-z0-9\-.]{1,61}[a-z0-9]\.[a-z]{2,}$/.test(domain)) {
        return {
            statusCode: 400,
            headers: HEADERS,
            body: JSON.stringify({ error: 'Ongeldig domein opgegeven.' })
        };
    }

    // Section: DNS check — A-record opvragen; NXDOMAIN = waarschijnlijk vrij
    try {
        await dns.resolve(domain, 'A');
        // Domein lost op → bezet
        return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ available: false, domain: domain }) };
    } catch (err) {
        if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
            // Geen DNS record gevonden → waarschijnlijk vrij
            return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ available: true, domain: domain }) };
        }
        // Netwerk- of serverfout → geef geen false-positief terug
        return {
            statusCode: 502,
            headers: HEADERS,
            body: JSON.stringify({ error: 'DNS-lookup mislukt, probeer het opnieuw.' })
        };
    }
};
