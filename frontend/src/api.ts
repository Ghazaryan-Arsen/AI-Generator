import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface GenerateImageResponse {
  success: boolean;
  imageUrl: string;
  message?: string;
}

export const generateImage = async (prompt: string, style: string, aspectRatio: string): Promise<GenerateImageResponse> => {
  const url = API_BASE_URL.endsWith('/') ? `${API_BASE_URL}generate-image` : `${API_BASE_URL}/generate-image`;
  const response = await axios.post<GenerateImageResponse>(url, {
    prompt,
    style,
    aspectRatio,
  });
  return response.data;
};
