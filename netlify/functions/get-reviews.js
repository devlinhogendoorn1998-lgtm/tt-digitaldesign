// netlify/functions/get-reviews.js
// Haalt live Google-rating en review-aantal op via de Places API (server-side).
// Omgevingsvariabelen instellen in Netlify dashboard → Site settings → Environment variables:
//   GOOGLE_PLACES_API_KEY  → jouw Google Cloud API-sleutel
//   GOOGLE_PLACE_ID        → jouw Place ID (bv. ChIJ... of de ID uit Google Maps)

const FALLBACK = { score: 5.0, count: 4 };
const CACHE_TTL = 3600; // seconden — Netlify CDN cachet de response 1 uur

exports.handler = async function () {
    const apiKey  = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    if (!apiKey || !placeId) {
        return respond(FALLBACK);
    }

    const url =
        'https://maps.googleapis.com/maps/api/place/details/json' +
        '?place_id=' + encodeURIComponent(placeId) +
        '&fields=rating%2Cuser_ratings_total' +
        '&key=' + apiKey;

    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) return respond(FALLBACK);

        const json = await res.json();
        const result = json.result;

        if (!result || json.status !== 'OK') return respond(FALLBACK);

        const score = typeof result.rating             === 'number' ? result.rating             : FALLBACK.score;
        const count = typeof result.user_ratings_total === 'number' ? result.user_ratings_total : FALLBACK.count;

        return respond({ score, count });
    } catch {
        return respond(FALLBACK);
    }
};

function respond(data) {
    return {
        statusCode: 200,
        headers: {
            'Content-Type':  'application/json',
            'Cache-Control': 'public, s-maxage=' + CACHE_TTL + ', stale-while-revalidate=600',
        },
        body: JSON.stringify({ score: data.score, count: data.count }),
    };
}
