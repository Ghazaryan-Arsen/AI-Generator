import axios from 'axios';
import type { ApiResponse, Job } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const baseUrl = API_BASE_URL.replace(/\/$/, '');

const api = axios.create({
  baseURL: baseUrl || undefined,
  timeout: 120000, // 120s timeout for production stability
});

// Response interceptor for better error classification and retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;

    if (!config || !config.retryCount) {
      if (config) config.retryCount = 0;
    }

    const shouldRetry =
      config &&
      config.retryCount < 2 &&
      (error.code === 'ECONNABORTED' || error.response?.status === 503 || error.response?.status === 429);

    if (shouldRetry) {
      config.retryCount += 1;
      const delay = Math.pow(2, config.retryCount) * 1000;
      console.warn(`Retrying request (${config.retryCount}/2) in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(config);
    }

    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out. The server might be under heavy load.');
    }
    return Promise.reject(error);
  }
);

export const createJob = async (prompt: string, style: string, aspectRatio: string, signal?: AbortSignal): Promise<ApiResponse<Job>> => {
  const response = await api.post<ApiResponse<Job>>('/api/generate-image', {
    prompt,
    style,
    aspectRatio,
  }, { signal });
  return response.data;
};

export const getJobStatus = async (id: string, signal?: AbortSignal): Promise<ApiResponse<Job>> => {
  const response = await api.get<ApiResponse<Job>>(`/api/job-status/${id}`, { signal });
  return response.data;
};

export const getAllJobs = async (signal?: AbortSignal): Promise<ApiResponse<Job[]>> => {
  const response = await api.get<ApiResponse<Job[]>>('/api/jobs', { signal });
  return response.data;
};
