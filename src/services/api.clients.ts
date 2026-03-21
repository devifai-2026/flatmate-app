import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import { enviornment, URLs } from './api.enviroments';
import { store } from '../Redux/store'; // Redux store import

// Axios base config
const axiosConfig: AxiosRequestConfig = {
  baseURL: URLs[enviornment].apiURL,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create axios instances
export const baseClient: AxiosInstance = axios.create(axiosConfig);
export const authClient: AxiosInstance = axios.create(axiosConfig);

// Interceptor setup
const applyInterceptors = (client: AxiosInstance, withAuth: boolean = false) => {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      if (withAuth) {
        const state = store.getState(); // Access Redux state directly
        const token = state.auth.token;
        const uid = state.auth.uid;

        if (token) {
          config.headers['mob-auth-token'] = token;
        }
        if (uid) {
          config.headers['uid'] = uid;
        }
      }

      // Logging
      console.log('📤 [REQUEST]');
      console.log(`➡️ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      console.log('Headers:', config.headers);
      if (config.data) {
        console.log('Payload:', config.data);
      }

      return config;
    },
    (error: AxiosError) => {
      console.error('🛑 [REQUEST ERROR]', error);
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log('✅ [RESPONSE]');
      console.log(`⬅️ ${response.status} ${response.config.url}`);
      console.log('Response:', response.data);
      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        console.error('❌ [ERROR RESPONSE]', {
          url: error.config?.url,
          status: error.response.status,
          data: error.response.data,
        });

        if (error.response.status === 401) {
          console.warn('⚠️ Unauthorized (401)');
        }

      } else if (error.request) {
        console.error('⚠️ [NO RESPONSE]', error.request);
      } else {
        console.error('🚨 [REQUEST SETUP ERROR]', error.message);
      }

      return Promise.reject(error);
    }
  );
};

// Apply to both clients
applyInterceptors(baseClient, true);
applyInterceptors(authClient, true);

// Export
export default {
  baseClient,
  authClient,
};
