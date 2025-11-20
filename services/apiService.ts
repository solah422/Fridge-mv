// import { store } from '../store'; // This line is removed to break the circular dependency

const getApiBaseUrl = () => {
  // In a real build, this could be configured via environment variables
  return '/api'; 
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Dynamically import the store here to prevent a circular dependency
  // during the initial module loading process.
  const { store } = await import('../store');
  const state = store.getState();
  const token = state.auth.user?.token; // Assuming token is stored in user state

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An API error occurred');
  }

  // Handle responses with no content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
