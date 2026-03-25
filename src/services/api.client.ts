import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import { BASE_URL } from './api.environments';
import { store } from '../Redux/store';
import { logout } from '../Redux/Slices/authSlice';

const createClient = (withAuth: boolean = true): AxiosInstance => {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  } as AxiosRequestConfig);

  // ── Request interceptor ──────────────────────────────────
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      if (withAuth) {
        const state = store.getState();
        const token = state.auth?.token;
        const uid = state.auth?.uid;

        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
          config.headers['mob-auth-token'] = token;
        }
        if (uid) {
          config.headers['uid'] = uid;
        }
      }
      return config;
    },
    error => Promise.reject(error),
  );

  // ── Response interceptor ─────────────────────────────────
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    error => {
      if (error.response?.status === 401) {
        // Token expired — force logout
        store.dispatch(logout());
      }
      return Promise.reject(error);
    },
  );

  return client;
};

/** Authenticated API client — use for all protected endpoints */
export const apiClient = createClient(true);

/** Public API client — use for auth endpoints (no token needed) */
export const publicClient = createClient(false);
