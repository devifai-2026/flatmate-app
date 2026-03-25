export enum Environment {
  local = 'local',
  dev = 'dev',
  production = 'production',
}

/** Change this to switch the active environment */
export const activeEnvironment: Environment = Environment.local;

export const API_BASE_URLS: Record<Environment, string> = {
  [Environment.local]: 'http://192.168.1.142:8000/api',  // Replace IP with your machine's LAN IP (server runs on port 8000)
  [Environment.dev]: 'https://dev-api.flatmate.app/api',
  [Environment.production]: 'https://api.flatmate.app/api',
};

export const BASE_URL = API_BASE_URLS[activeEnvironment];
