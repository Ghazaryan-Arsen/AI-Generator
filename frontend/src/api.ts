import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface GenerateImageResponse {
  success: boolean;
  imageUrl: string;
  message?: string;
}

export const generateImage = async (prompt: string, style: string, aspectRatio: string): Promise<GenerateImageResponse> => {
  const response = await axios.post<GenerateImageResponse>(`${API_BASE_URL}/generate-image`, {
    prompt,
    style,
    aspectRatio,
  });
  return response.data;
};
