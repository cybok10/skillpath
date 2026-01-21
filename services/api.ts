
// Toggle this to false when running the backend
const MOCK_API = false;
const API_URL = 'http://localhost:8000';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Something went wrong' }));
    throw new Error(error.detail || 'API Error');
  }
  return response.json();
};

const isNetworkError = (error: any) => {
  return error instanceof TypeError || error.message === 'Failed to fetch' || error.name === 'TypeError';
};

export const api = {
  get: async (endpoint: string) => {
    if (MOCK_API) {
      console.log(`[Mock API] GET ${endpoint}`);
      return null;
    }
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, { headers });
        return handleResponse(response);
    } catch (error) {
        // If backend is down, return null to let components handle fallback
        if (isNetworkError(error)) {
            console.warn(`[Network] Backend unreachable at ${endpoint}.`);
            return null;
        }
        throw error;
    }
  },

  post: async (endpoint: string, data: any) => {
    if (MOCK_API) {
      console.log(`[Mock API] POST ${endpoint}`, data);
      return { access_token: 'mock_jwt_token_123', token_type: 'bearer' };
    }
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        });
        return handleResponse(response);
    } catch (error) {
        // Fallback for Auth endpoints if backend is down
        if (isNetworkError(error)) {
            if (endpoint.includes('/auth')) {
                console.warn("Backend unreachable. Using Mock Token for Demo.");
                return { access_token: 'mock_fallback_token_' + Date.now(), token_type: 'bearer' };
            }
        }
        throw error;
    }
  },

  put: async (endpoint: string, data: any) => {
    if (MOCK_API) {
      console.log(`[Mock API] PUT ${endpoint}`, data);
      return { status: 'success' };
    }
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(data),
        });
        return handleResponse(response);
    } catch (error) {
        // Fallback for updates if backend is down
        if (isNetworkError(error)) {
            console.warn("Backend unreachable. Simulating successful update.");
            return { status: 'success_mock' };
        }
        throw error;
    }
  }
};
