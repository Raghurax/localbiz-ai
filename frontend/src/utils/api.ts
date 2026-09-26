const API_BASE = '/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('localbiz_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('localbiz_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('localbiz_token');
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', 'Bearer ' + token);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const url = API_BASE + endpoint;
  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDetail = 'API Request Failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('application/zip') || contentType.includes('image/') || contentType.includes('video/'))) {
    return response.blob();
  }

  return response.json();
}
