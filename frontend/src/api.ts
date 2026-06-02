import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface GenerateImageResponse {
  success: boolean;
  imageUrl: string;
  message?: string;
}

export const generateImage = async (prompt: string, style: string, aspectRatio: string): Promise<GenerateImageResponse> => {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_URL is not defined. Please check your environment variables.');
  }

  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const url = `${baseUrl}/api/generate-image`;
  
  const response = await axios.post<GenerateImageResponse>(url, {
    prompt,
    style,
    aspectRatio,
  });
  return response.data;
};
