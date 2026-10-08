const API_BASE = '/api';

function getAuthHeaders(isFormData = false) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const headers = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.id) headers['X-User-Id'] = user.id.toString();
      if (user.role) headers['X-User-Role'] = user.role;
      if (user.name) headers['X-User-Name'] = user.name;
      if (user.email) headers['X-User-Email'] = user.email;
    } catch (e) {
      // ignore
    }
  }

  return headers;
}

async function handleResponse(response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    let errorMsg = data?.message || data?.error;
    if (!errorMsg) {
      if (response.status === 401) {
        errorMsg = 'Session expired. Please log in again.';
      } else if (response.status === 403) {
        errorMsg = 'Access denied. You do not have permission to view or perform this action.';
      } else {
        errorMsg = `Request failed with status ${response.status}`;
      }
    }
    throw new Error(errorMsg);
  }
  return data;
}

export const authAPI = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },
};

export const userAPI = {
  getProfile: async () => {
    const res = await fetch(`${API_BASE}/users/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  updateProfile: async (data) => {
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  changePassword: async (data) => {
    const res = await fetch(`${API_BASE}/users/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getAllUsers: async () => {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

export const itemAPI = {
  getItems: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'ALL') query.append('type', params.type);
    if (params.category && params.category !== 'ALL') query.append('category', params.category);
    if (params.location && params.location !== 'ALL') query.append('location', params.location);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.color) query.append('color', params.color);
    if (params.brand) query.append('brand', params.brand);
    if (params.keyword) query.append('keyword', params.keyword);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/items${qs}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getItemById: async (id) => {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getMyItems: async () => {
    const res = await fetch(`${API_BASE}/items/my`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  reportLost: async (data) => {
    const res = await fetch(`${API_BASE}/items/lost`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  reportFound: async (data) => {
    const res = await fetch(`${API_BASE}/items/found`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateItem: async (id, data) => {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteItem: async (id) => {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getStats: async () => {
    const res = await fetch(`${API_BASE}/items/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/items/upload-image`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },
};

export const matchingAPI = {
  getMatchesForItem: async (itemId) => {
    const res = await fetch(`${API_BASE}/matching/${itemId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getAllMatches: async () => {
    const res = await fetch(`${API_BASE}/matching/all`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

export const claimAPI = {
  submitClaim: async (data) => {
    const res = await fetch(`${API_BASE}/claims`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getMyClaims: async () => {
    const res = await fetch(`${API_BASE}/claims/my`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getAllClaims: async (status) => {
    const qs = status && status !== 'ALL' ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/claims${qs}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getClaimById: async (id) => {
    const res = await fetch(`${API_BASE}/claims/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  approveClaim: async (id, adminComment) => {
    const res = await fetch(`${API_BASE}/claims/${id}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ adminComment }),
    });
    return handleResponse(res);
  },

  rejectClaim: async (id, adminComment) => {
    const res = await fetch(`${API_BASE}/claims/${id}/reject`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ adminComment }),
    });
    return handleResponse(res);
  },
};

export const notificationAPI = {
  getNotifications: async (unreadOnly = false) => {
    const res = await fetch(`${API_BASE}/notifications?unreadOnly=${unreadOnly}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getUnreadCount: async () => {
    const res = await fetch(`${API_BASE}/notifications/unread-count`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  markAsRead: async (id) => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  markAllAsRead: async () => {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};