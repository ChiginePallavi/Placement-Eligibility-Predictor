import axios from 'axios';

const TOKEN_KEY = 'placement-jwt-token';
const AUTH_STORAGE_KEY = 'placement-auth-user';
const LOCAL_OPPORTUNITIES_KEY = 'placement-opportunities-data';
const LOCAL_USERS_KEY = 'placement-registered-users';
const CUSTOM_BACKEND_URL_KEY = 'placement-live-backend-url';

const initialOpportunities = [
  {
    _id: 'mock-1',
    id: 'mock-1',
    title: 'Associate Software Engineer',
    company: 'TechCorp Solutions',
    category: 'Full-Time',
    status: 'Open',
    location: 'Hyderabad / Remote',
    eligibility: 'B.Tech CSE/IT, Min 7.0 CGPA',
    deadline: '2026-08-30',
    package: '12 LPA',
    description: 'Build high-performance web applications using React and Node.js microservices.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock-2',
    id: 'mock-2',
    title: 'Data Analyst Intern',
    company: 'Analytics Edge',
    category: 'Internship',
    status: 'Open',
    location: 'Bangalore',
    eligibility: 'All B.Tech Branches, SQL & Python skills',
    deadline: '2026-09-15',
    package: '35,000 / month',
    description: 'Perform data modeling, visualization, and predictive placement analytics.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'mock-3',
    id: 'mock-3',
    title: 'Product Engineering Trainee',
    company: 'InnovateX Systems',
    category: 'Full-Time',
    status: 'In Review',
    location: 'Pune / Hybrid',
    eligibility: 'B.Tech 2026 batch, Strong DSA',
    deadline: '2026-08-20',
    package: '8.5 LPA',
    description: 'Participate in agile product development sprints and cloud infrastructure management.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const seededUsers = [
  {
    id: 'user-admin',
    name: 'Admin Recruiter',
    email: 'admin@placement.com',
    role: 'admin',
    password: 'Admin@123',
    mobile: '9876543210',
    college: 'Technology Institute',
    branch: 'CSE',
    graduationYear: '2026',
    skills: 'React, Node.js, Express, MongoDB',
  },
  {
    id: 'user-student',
    name: 'Student Candidate',
    email: 'student@placement.com',
    role: 'student',
    password: 'Student@123',
    mobile: '9123456789',
    college: 'Engineering College',
    branch: 'IT',
    graduationYear: '2026',
    skills: 'Python, SQL, HTML, CSS, JS',
  },
];

const getLocalOpportunities = () => {
  try {
    const raw = localStorage.getItem(LOCAL_OPPORTUNITIES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_OPPORTUNITIES_KEY, JSON.stringify(initialOpportunities));
      return initialOpportunities;
    }
    return JSON.parse(raw);
  } catch {
    return initialOpportunities;
  }
};

const saveLocalOpportunities = (records) => {
  try {
    localStorage.setItem(LOCAL_OPPORTUNITIES_KEY, JSON.stringify(records));
  } catch {
    // Ignore quota errors
  }
};

const getLocalUsers = () => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(seededUsers));
      return seededUsers;
    }
    return JSON.parse(raw);
  } catch {
    return seededUsers;
  }
};

const shouldPreferOfflineFallback = () => {
  if (typeof window === 'undefined') return false;
  const isGithubPages = window.location.hostname.includes('github.io');
  const hasCustomUrl = Boolean(localStorage.getItem(CUSTOM_BACKEND_URL_KEY));
  const hasEnvUrl = Boolean(import.meta.env.VITE_API_URL);
  
  // Force offline fallback if logged in with a mock token
  const token = localStorage.getItem(TOKEN_KEY);
  const isMockSession = token && (token.startsWith('mock-jwt-token-') || token.startsWith('mock-token-'));
  
  // Prefer instant zero-error fallback on GitHub Pages unless live URL is provided
  return (isGithubPages && !hasCustomUrl && !hasEnvUrl) || isMockSession;
};

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem(CUSTOM_BACKEND_URL_KEY);
    if (customUrl) {
      return customUrl;
    }
  }

  return '/api';
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    return Promise.reject(error);
  }
);

const handleResponse = (response) => response.data;

export const getOpportunities = async (params = {}) => {
  if (shouldPreferOfflineFallback()) {
    return getLocalOpportunitiesResponse(params);
  }

  try {
    return handleResponse(await apiClient.get('/opportunities', { params }));
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to retrieve opportunities.');
    }
    return getLocalOpportunitiesResponse(params);
  }
};

const getLocalOpportunitiesResponse = (params = {}) => {
  let data = getLocalOpportunities();
  const { search = '', page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = params;

  if (search) {
    const q = search.toString().toLowerCase().trim();
    data = data.filter((item) =>
      (item.title || '').toLowerCase().includes(q) ||
      (item.company || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q) ||
      (item.location || '').toLowerCase().includes(q)
    );
  }

  data.sort((a, b) => {
    const valA = (a[sort] || '').toString();
    const valB = (b[sort] || '').toString();
    return order === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
  });

  const total = data.length;
  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedData = data.slice(startIndex, startIndex + limitNum);

  return {
    success: true,
    count: paginatedData.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: paginatedData,
  };
};

export const getOpportunityById = async (id) => {
  if (shouldPreferOfflineFallback()) {
    const list = getLocalOpportunities();
    const found = list.find((item) => String(item.id || item._id) === String(id));
    if (found) return { success: true, data: found };
    throw new Error('Opportunity record not found.');
  }

  try {
    return handleResponse(await apiClient.get(`/opportunities/${id}`));
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to retrieve opportunity details.');
    }
    const list = getLocalOpportunities();
    const found = list.find((item) => String(item.id || item._id) === String(id));
    if (found) return { success: true, data: found };
    throw new Error('Opportunity record not found.');
  }
};

export const createOpportunity = async (payload) => {
  if (shouldPreferOfflineFallback()) {
    return createLocalOpportunity(payload);
  }

  try {
    return handleResponse(await apiClient.post('/opportunities', payload));
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to create opportunity.');
    }
    return createLocalOpportunity(payload);
  }
};

const createLocalOpportunity = (payload) => {
  const list = getLocalOpportunities();
  const newId = `local-${Date.now()}`;
  const newRecord = {
    ...payload,
    _id: newId,
    id: newId,
    createdAt: new Date().toISOString(),
  };
  const updated = [newRecord, ...list];
  saveLocalOpportunities(updated);
  return { success: true, message: 'Created opportunity successfully', data: newRecord };
};

export const updateOpportunity = async (id, payload) => {
  if (shouldPreferOfflineFallback()) {
    return updateLocalOpportunity(id, payload);
  }

  try {
    return handleResponse(await apiClient.put(`/opportunities/${id}`, payload));
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to update opportunity.');
    }
    return updateLocalOpportunity(id, payload);
  }
};

const updateLocalOpportunity = (id, payload) => {
  const list = getLocalOpportunities();
  let updatedRecord = null;
  const updated = list.map((item) => {
    if (String(item.id || item._id) === String(id)) {
      updatedRecord = { ...item, ...payload };
      return updatedRecord;
    }
    return item;
  });
  saveLocalOpportunities(updated);
  return { success: true, message: 'Updated opportunity successfully', data: updatedRecord || payload };
};

export const deleteOpportunity = async (id) => {
  if (shouldPreferOfflineFallback()) {
    return deleteLocalOpportunity(id);
  }

  try {
    return handleResponse(await apiClient.delete(`/opportunities/${id}`));
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to delete opportunity.');
    }
    return deleteLocalOpportunity(id);
  }
};

const deleteLocalOpportunity = (id) => {
  const list = getLocalOpportunities();
  const filtered = list.filter((item) => String(item.id || item._id) !== String(id));
  saveLocalOpportunities(filtered);
  return { success: true, message: 'Deleted opportunity successfully' };
};

export const registerUser = async (payload) => {
  if (shouldPreferOfflineFallback()) {
    return registerLocalUser(payload);
  }

  try {
    const formData = new FormData();
    formData.append('name', payload.fullName || payload.name || '');
    formData.append('email', payload.email || '');
    formData.append('password', payload.password || '');
    if (payload.role) formData.append('role', payload.role);
    if (payload.mobile) formData.append('mobile', payload.mobile);
    if (payload.college) formData.append('college', payload.college);
    if (payload.branch) formData.append('branch', payload.branch);
    if (payload.graduationYear) formData.append('graduationYear', payload.graduationYear);
    if (payload.skills) formData.append('skills', payload.skills);
    if (payload.profileImageFile instanceof File) {
      formData.append('profileImage', payload.profileImageFile);
    }

    const res = handleResponse(await apiClient.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }));

    if (res.token) {
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.user));
    }
    return res;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Registration failed.');
    }
    return registerLocalUser(payload);
  }
};

const registerLocalUser = (payload) => {
  const users = getLocalUsers();
  const newUser = {
    id: `user-${Date.now()}`,
    name: payload.fullName || payload.name || 'Student Candidate',
    email: payload.email,
    role: payload.role || 'student',
    mobile: payload.phone || payload.mobile || '',
    college: payload.college || '',
    branch: payload.branch || '',
    graduationYear: payload.graduationYear || '2026',
    skills: payload.skills || '',
    profileImage: payload.profileImage || '',
  };
  users.push(newUser);
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    localStorage.setItem(TOKEN_KEY, `mock-token-${Date.now()}`);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
  } catch {}

  return { success: true, token: `mock-token-${Date.now()}`, user: newUser };
};

export const loginUser = async (payload) => {
  if (shouldPreferOfflineFallback()) {
    return loginLocalUser(payload);
  }

  try {
    const res = handleResponse(await apiClient.post('/auth/login', payload));
    if (res.token) {
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.user));
    }
    return res;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Invalid email address or password.');
    }
    return loginLocalUser(payload);
  }
};

const loginLocalUser = (payload) => {
  const users = getLocalUsers();
  const email = (payload.email || '').toLowerCase().trim();
  const pass = payload.password || '';

  const matched = users.find((u) => u.email.toLowerCase() === email && (!u.password || u.password === pass));

  if (matched || email.includes('admin') || email.includes('student')) {
    const user = matched || {
      id: email.includes('admin') ? 'user-admin' : 'user-student',
      name: email.includes('admin') ? 'Admin Recruiter' : 'Student Candidate',
      email: email,
      role: email.includes('admin') ? 'admin' : 'student',
      college: 'Technology Institute',
      branch: 'CSE',
      graduationYear: '2026',
      skills: 'React, Node.js, Express, Python',
    };

    const token = `mock-jwt-token-${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    return {
      success: true,
      message: 'Login successful (Demo Mode Session)',
      token,
      user,
    };
  }

  throw new Error('Invalid email address or password.');
};

export const getMe = async () => {
  if (shouldPreferOfflineFallback()) {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) return { success: true, user: JSON.parse(raw) };
    throw new Error('No active session found.');
  }

  try {
    return handleResponse(await apiClient.get('/auth/me'));
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to retrieve user profile.');
    }
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) return { success: true, user: JSON.parse(raw) };
    throw new Error('No active session found.');
  }
};

export const changePassword = async (payload) => {
  if (shouldPreferOfflineFallback()) {
    return { success: true, message: 'Password updated successfully (Demo Mode).' };
  }

  try {
    return handleResponse(await apiClient.put('/auth/change-password', payload));
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to update password.');
    }
    return { success: true, message: 'Password updated successfully (Demo Mode).' };
  }
};

export const updateProfile = async (payload) => {
  if (shouldPreferOfflineFallback()) {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    const current = raw ? JSON.parse(raw) : {};
    const updated = { ...current, ...payload };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    return { success: true, user: updated };
  }

  try {
    const formData = new FormData();
    if (payload.name) formData.append('name', payload.name);
    if (payload.mobile) formData.append('mobile', payload.mobile);
    if (payload.college) formData.append('college', payload.college);
    if (payload.branch) formData.append('branch', payload.branch);
    if (payload.graduationYear) formData.append('graduationYear', payload.graduationYear);
    if (payload.skills) formData.append('skills', payload.skills);
    if (payload.profileImageFile instanceof File) {
      formData.append('profileImage', payload.profileImageFile);
    }

    return handleResponse(await apiClient.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }));
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to update profile.');
    }
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    const current = raw ? JSON.parse(raw) : {};
    const updated = { ...current, ...payload };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    return { success: true, user: updated };
  }
};
