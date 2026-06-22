const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  const json = await res.json();
  if (!res.ok) {
    const error = new Error(json.message || 'Request failed');
    error.status = res.status;
    throw error;
  }
  return json;
};

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`, { headers: getHeaders() });
    const json = await handleResponse(res);
    return json.data;
  },
  post: async (endpoint, data) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const json = await handleResponse(res);
    return json.data;
  },
  put: async (endpoint, data) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const json = await handleResponse(res);
    return json.data;
  },
  patch: async (endpoint, data) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const json = await handleResponse(res);
    return json.data;
  },
  delete: async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const json = await handleResponse(res);
    return json.data;
  }
};

// ==================== SUMBER DANA API ====================

export const sumberDanaApi = {
  getAll: () => api.get('/sumber-dana'),
  create: (data) => api.post('/sumber-dana', data),
  update: (id, data) => api.put(`/sumber-dana/${id}`, data),
  delete: (id) => api.delete(`/sumber-dana/${id}`),
};

// ==================== USER MANAGEMENT API ====================

export const userApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggle: (id) => api.patch(`/users/${id}/toggle`),
};
