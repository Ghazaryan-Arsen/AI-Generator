import axios from 'axios';
import type { ApiResponse, Job } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const baseUrl = API_BASE_URL.replace(/\/$/, '');

const api = axios.create({
  baseURL: baseUrl || undefined,
  timeout: 10000,
});

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
