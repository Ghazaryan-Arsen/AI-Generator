import axios from 'axios';
import type { ApiResponse, Job } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
export const BASE_URL = API_BASE_URL.replace(/\/$/, '');

const api = axios.create({
  baseURL: BASE_URL || undefined,
  timeout: 15000, // Increased timeout for slower connections
});

export const createJob = async (prompt: string, style: string, aspectRatio: string): Promise<ApiResponse<Job>> => {
  const response = await api.post<ApiResponse<Job>>('/api/generate-image', {
    prompt,
    style,
    aspectRatio,
  });
  return response.data;
};

export const getJobStatus = async (id: string): Promise<ApiResponse<Job>> => {
  const response = await api.get<ApiResponse<Job>>(`/api/job-status/${id}`);
  return response.data;
};

export const getAllJobs = async (): Promise<ApiResponse<Job[]>> => {
  const response = await api.get<ApiResponse<Job[]>>('/api/jobs');
  return response.data;
};
