// netlify/functions/fpl-proxy.js
//
// Server-side proxy for the FPL API. Deployed on your own Netlify site,
// this avoids relying on public CORS proxies, which are unreliable and
// occasionally rate-limited or blocked.
//
// Usage from the browser (same-origin, no CORS issue):
//   /.netlify/functions/fpl-proxy?path=/leagues-h2h/1307844/standings/

export async function handler(event) {
  const path = event.queryStringParameters && event.queryStringParameters.path;

  if (!path || !path.startsWith('/')) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing or invalid "path" query parameter' }),
    };
  }

  try {
    const upstream = await fetch(`https://fantasy.premierleague.com/api${path}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; fpl-proxy/1.0)' },
    });
    const body = await upstream.text();

    return {
      statusCode: upstream.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60',
      },
      body,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Upstream fetch failed: ' + err.message }),
    };
  }
}
