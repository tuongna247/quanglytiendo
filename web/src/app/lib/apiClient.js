'use client';

const API_BASE = 'http://localhost:5015';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('qlTD_token');
}

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('qlTD_token');
      localStorage.removeItem('qlTD_user');
      window.location.href = '/auth/auth1/login';
    }
    return null;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const apiClient = {
  get: (url, params) => {
    let fullUrl = url;
    if (params) {
      const qs = new URLSearchParams(params).toString();
      fullUrl = `${url}?${qs}`;
    }
    return apiFetch(fullUrl);
  },
  post: (url, data) =>
    apiFetch(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url, data) =>
    apiFetch(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (url) => apiFetch(url, { method: 'DELETE' }),
};

export const get = (url, params) => apiClient.get(url, params);
export const post = (url, data) => apiClient.post(url, data);
export const put = (url, data) => apiClient.put(url, data);
export const del = (url) => apiClient.delete(url);

export default apiClient;
