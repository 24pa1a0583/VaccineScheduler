/**
 * API Client for VaccineScheduler
 * Communicates with the Express & MongoDB Backend
 */

const API_BASE = '/api';

const api = {
  TOKEN_KEY: 'vaccine_scheduler_token',
  USER_KEY: 'vaccine_scheduler_user',

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  setToken(token) {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  },

  getUser() {
    try {
      const data = localStorage.getItem(this.USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.USER_KEY);
    }
  },

  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error);
      throw error;
    }
  },

  // Auth Endpoints
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
    }
    return data;
  },

  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
    }
    return data;
  },

  async getMe() {
    const data = await this.request('/auth/me');
    if (data.user) {
      this.setUser(data.user);
    }
    return data;
  },

  async updateProfile(payload) {
    const data = await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    if (data.user) {
      this.setUser(data.user);
    }
    return data;
  },

  async seedDemo() {
    return this.request('/auth/seed-demo', {
      method: 'POST'
    });
  },

  // Clinical & Patient Data Endpoints
  async getPatients() {
    return this.request('/data/patients');
  },

  async recordDose(patientId) {
    return this.request('/data/patients/record-dose', {
      method: 'POST',
      body: JSON.stringify({ patientId })
    });
  },

  async scheduleNewVaccine(payload) {
    return this.request('/data/patients/schedule-new', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getPatientMe() {
    return this.request('/data/patient-me');
  },

  async getPatientChart(patientId) {
    return this.request(`/data/patients/${patientId}/chart`);
  },

  async administerChartVaccine(patientId, pendingVaccineId, lotNumber, siteRoute) {
    return this.request('/data/patients/administer-vaccine', {
      method: 'POST',
      body: JSON.stringify({ patientId, pendingVaccineId, lotNumber, siteRoute })
    });
  },

  async schedulePatientDose(payload) {
    return this.request('/data/patient-me/schedule', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async deletePatient(patientId) {
    return this.request(`/data/patients/${patientId}`, {
      method: 'DELETE'
    });
  },

  async deleteChartPendingDose(patientId, doseId) {
    return this.request(`/data/patients/${patientId}/pending-dose/${doseId}`, {
      method: 'DELETE'
    });
  },

  async deletePatientDose(doseId) {
    return this.request(`/data/patient-me/doses/${doseId}`, {
      method: 'DELETE'
    });
  },

  async updateChartPendingDose(patientId, doseId, payload) {
    return this.request(`/data/patients/${patientId}/pending-dose/${doseId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async updatePatientRosterSchedule(patientId, payload) {
    return this.request(`/data/patients/${patientId}/schedule`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async updatePatientDose(doseId, payload) {
    return this.request(`/data/patient-me/doses/${doseId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async administerPatientMeDose(doseId) {
    return this.request(`/data/patient-me/doses/${doseId}/administer`, {
      method: 'POST'
    });
  }
};

window.api = api;
