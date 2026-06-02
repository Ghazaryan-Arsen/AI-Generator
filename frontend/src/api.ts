import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface GenerateImageResponse {
  success: boolean;
  imageUrl: string;
  message?: string;
}

export const generateImage = async (prompt: string, style: string, aspectRatio: string): Promise<GenerateImageResponse> => {
  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const url = baseUrl ? `${baseUrl}/api/generate-image` : '/api/generate-image';
  
  const response = await axios.post<GenerateImageResponse>(url, {
    prompt,
    style,
    aspectRatio,
  }, {
    timeout: 30000, // 30 seconds
  });
  return response.data;
};
