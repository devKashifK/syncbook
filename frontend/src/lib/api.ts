const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8092/api';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = new Headers(options.headers);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errData = await response.json();
      errorMsg = errData.error || errData.message || errorMsg;
    } catch {
      // Fallback if not JSON
    }
    throw new Error(errorMsg);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : ({} as T);
  } catch {
    return text as any;
  }
}
