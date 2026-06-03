export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string;
  prompt: string;
  style?: string;
  aspectRatio?: string;
  status: JobStatus;
  progress: number;
  imageUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}
