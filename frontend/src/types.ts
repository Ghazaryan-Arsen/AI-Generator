export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:5' | '4:3' | '3:4';

export interface Job {
  id: string;
  prompt: string;
  style?: string;
  aspectRatio?: AspectRatio;
  status: JobStatus;
  progress: number;
  imageUrl?: string;
  error?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}
