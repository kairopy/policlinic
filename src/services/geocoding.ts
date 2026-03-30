/**
 * Geocoding service for home-visit route planning.
 *
 * Strategy (in priority order):
 * 1. Extract lat/lng directly from a Google Maps URL   → zero network call
 * 2. Geocode a free-text address via Nominatim (OSM)   → single GET request
 *
 * Results are cached in sessionStorage keyed by the raw input string to
 * avoid redundant API hits while the user navigates between pages.
 */

const CACHE_KEY_PREFIX = 'geo_cache_';

/** Returns cached [lat, lng] or null */
const getFromCache = (key: string): [number, number] | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + encodeURIComponent(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as [number, number];
    if (Array.isArray(parsed) && parsed.length === 2) return parsed;
  } catch {
    // ignore parse errors
  }
  return null;
};

/** Persists [lat, lng] to localStorage */
const setCache = (key: string, coords: [number, number]): void => {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + encodeURIComponent(key), JSON.stringify(coords));
  } catch {
    // storage quota issues are non-fatal
  }
};

/**
 * Attempts to extract lat/lng coordinates directly from various Google Maps URL formats.
 *
 * Supported patterns:
 *  - `?q=LAT,LNG`
 *  - `/@LAT,LNG,`  (standard share URL)
 *  - `!3dLAT!4dLNG` (embedded maps)
 *
 * Returns `[lat, lng]` or `null` if the URL is not recognizable.
 */
export const extractCoordsFromGoogleMapsUrl = (url: string): [number, number] | null => {
  if (!url || !url.includes('google.com/maps') && !url.includes('maps.google.com') && !url.includes('goo.gl')) {
    return null;
  }

  // Pattern: ?q=-25.28,-57.63 or ?q=-25.28%2C-57.63
  const qPattern = /[?&]q=(-?\d+\.?\d*)[,%2C]+(-?\d+\.?\d*)/i;
  const qMatch = url.match(qPattern);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }

  // Pattern: /@-25.28,-57.63,17z (standard share URL)
  const atPattern = /\/@(-?\d+\.?\d*),(-?\d+\.?\d*),/;
  const atMatch = url.match(atPattern);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }

  // Pattern: !3d-25.28!4d-57.63 (embedded/place URLs)
  const embeddedPattern = /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/;
  const embeddedMatch = url.match(embeddedPattern);
  if (embeddedMatch) {
    const lat = parseFloat(embeddedMatch[1]);
    const lng = parseFloat(embeddedMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }

  return null;
};

/**
 * Geocodes a free-text address using the Nominatim API (OpenStreetMap).
 * Biased towards Paraguay (countrycodes=py) to improve accuracy for local addresses.
 *
 * Returns `[lat, lng]` or `null` on failure.
 */
const geocodeWithNominatim = async (address: string): Promise<[number, number] | null> => {
  try {
    const encoded = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=py`;
    const response = await fetch(url, {
      headers: { 'Accept-Language': 'es' },
    });
    if (!response.ok) return null;
    const data = await response.json() as Array<{ lat: string; lon: string }>;
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch {
    // network or parse error — non-fatal
  }
  return null;
};

/**
 * Sanitizes and validates a Google Maps URL to prevent XSS.
 * Only allows known Google Maps domains.
 */
export const sanitizeGoogleMapsUrl = (url: string): string | null => {
  try {
    const trimmed = url.trim();
    // Reject javascript: and data: URIs
    if (/^(javascript|data|vbscript):/i.test(trimmed)) return null;
    const parsed = new URL(trimmed);
    const allowed = ['maps.google.com', 'www.google.com', 'google.com', 'goo.gl'];
    if (!allowed.some(d => parsed.hostname === d || parsed.hostname.endsWith('.' + d))) return null;
    return trimmed;
  } catch {
    return null;
  }
};

/**
 * Main geocoding function — resolves a patient's `location` string to [lat, lng].
 *
 * Strategy:
 * 1. Check sessionStorage cache (instant, no network)
 * 2. If the URL already contains coordinates (long Google Maps URL), extract them directly
 * 3. Send to backend /api/resolve-location which:
 *    - Follows short URL (maps.app.goo.gl) redirects server-side to bypass CORS
 *    - Extracts coordinates from the resolved full URL
 *    - Falls back to Nominatim geocoding for plain text addresses
 *
 * @param location - Google Maps URL (short or full) or free-text address
 * @returns {Promise<[number, number] | null>} [latitude, longitude] or null
 */
export const geocodeLocation = async (location: string): Promise<[number, number] | null> => {
  if (!location?.trim()) return null;

  const trimmed = location.trim();

  // 1. Check cache first
  const cached = getFromCache(trimmed);
  if (cached) return cached;

  // 2. Fast path: if this is a full Google Maps URL with coords already embedded, extract inline
  const fromUrl = extractCoordsFromGoogleMapsUrl(trimmed);
  if (fromUrl) {
    setCache(trimmed, fromUrl);
    return fromUrl;
  }

  // 3. Send to backend to resolve (handles short URLs + text addresses)
  try {
    const res = await fetch('http://localhost:3001/api/resolve-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: trimmed }),
      signal: AbortSignal.timeout(15000),
    });

    if (res.ok) {
      const data = await res.json() as { lat: number | null; lng: number | null };
      if (data.lat !== null && data.lng !== null && !isNaN(data.lat) && !isNaN(data.lng)) {
        const coords: [number, number] = [data.lat, data.lng];
        setCache(trimmed, coords);
        return coords;
      }
    }
  } catch {
    // Backend unavailable — try Nominatim directly as last resort
    const fromNominatim = await geocodeWithNominatim(trimmed);
    if (fromNominatim) {
      setCache(trimmed, fromNominatim);
      return fromNominatim;
    }
  }

  return null;
};


