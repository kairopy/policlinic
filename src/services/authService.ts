export const GOOGLE_CONNECTED_KEY = 'google_connected';
export const GOOGLE_ACCESS_TOKEN_KEY = 'google_access_token';
export const SHEETS_ID_KEY = 'google_sheets_id';

export const isGoogleLinked = () => 
  !!localStorage.getItem(GOOGLE_CONNECTED_KEY) || !!localStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY);

export const syncLoginStatusWithBackend = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/token');
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, data.access_token);
      localStorage.setItem(GOOGLE_CONNECTED_KEY, 'true');
      return true;
    }
  } catch {
    // Ignore errors, backend might be down or no token present
  }
  return false;
};

export const callGoogleApi = async (url: string, method: string = 'GET', body?: unknown) => {
  let token = localStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY);

  // If we don't have a token, try to grab a fresh one from the backend
  if (!token) {
    try {
      const tokenRes = await fetch('http://localhost:3001/api/token');
      if (tokenRes.ok) {
        const data = await tokenRes.json();
        token = data.access_token as string;
        localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, token);
        localStorage.setItem(GOOGLE_CONNECTED_KEY, 'true');
      } else {
        localStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY);
        localStorage.removeItem(GOOGLE_CONNECTED_KEY);
        return null;
      }
    } catch (e) {
      throw new Error('Backend token provider unreachable: ' + e);
    }
  }

  const makeRequest = async (currentToken: string) => {
    return fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  let response = await makeRequest(token as string);

  if (response.status === 401) {
    // Token expired, attempt refresh
    try {
      const tokenRes = await fetch('http://localhost:3001/api/token');
      if (tokenRes.ok) {
        const data = await tokenRes.json();
        token = data.access_token as string;
        localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, token);
        localStorage.setItem(GOOGLE_CONNECTED_KEY, 'true');
        
        // Retry the request ONCE with the new token
        response = await makeRequest(token);
        if (response.status === 401) {
          localStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY);
          localStorage.removeItem(GOOGLE_CONNECTED_KEY);
          return null;
        }
      } else {
        localStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY);
        localStorage.removeItem(GOOGLE_CONNECTED_KEY);
        return null;
      }
    } catch (e) {
      throw new Error('Failed to retry with fresh token: ' + e);
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Google API error: ${response.statusText}`, errorData);
  }

  if (response.status === 204) {
    return { success: true };
  }
  
  const text = await response.text();
  if (!text) return {};
  
  try {
    return JSON.parse(text);
  } catch {
    return { success: true, text };
  }
};
