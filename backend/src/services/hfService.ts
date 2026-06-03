import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL_ID = "runwayml/stable-diffusion-v1-5";

export class HFService {
  private static instance: HFService;

  private constructor() {}

  public static getInstance(): HFService {
    if (!HFService.instance) {
      HFService.instance = new HFService();
    }
    return HFService.instance;
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async generateImage(prompt: string, retries = 3): Promise<Buffer> {
    if (!HF_TOKEN) {
      throw new Error('HF_TOKEN is not configured');
    }

    let lastError: any;

    for (let i = 0; i <= retries; i++) {
      try {
        const startTime = Date.now();
        const response = await axios.post(
          `https://api-inference.huggingface.co/models/${MODEL_ID}`,
          { inputs: prompt },
          {
            headers: {
              Authorization: `Bearer ${HF_TOKEN}`,
              'Content-Type': 'application/json',
            },
            responseType: 'arraybuffer',
            timeout: 60000, // 60s timeout
          }
        );

        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] HF Generation successful in ${duration}ms`);

        if (String(response.headers['content-type']).includes('application/json')) {
          const body = JSON.parse(Buffer.from(response.data).toString());
          if (body.error && body.error.includes('loading')) {
            console.warn(`[${new Date().toISOString()}] HF Model still loading...`);
            throw { response: { status: 503 }, message: body.error };
          }
        }

        const buffer = Buffer.from(response.data, 'binary');

        // Basic buffer validation: check if it's a valid image (JPEG/PNG/WebP)
        // JPEG: FF D8 FF
        // PNG: 89 50 4E 47
        if (buffer.length < 4) {
          throw new Error('Generated image buffer is too small');
        }

        const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
        const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;

        if (!isJpeg && !isPng) {
          console.warn(`[${new Date().toISOString()}] Warning: Generated buffer may not be a standard image format.`);
        }

        return buffer;
      } catch (error: any) {
        lastError = error;
        const status = error.response?.status;
        const message = error.response?.data?.toString() || error.message;
        const isRetryable = status === 503 || status === 429 || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';

        console.error(`[${new Date().toISOString()}] HF API Error (Attempt ${i + 1}): status=${status}, message="${message}"`);

        if (i < retries && isRetryable) {
          const delay = Math.pow(2, i) * 1000;
          console.log(`[${new Date().toISOString()}] HF API busy. Retrying in ${delay}ms...`);
          await this.sleep(delay);
          continue;
        }
        break;
      }
    }

    throw lastError;
  }
}

export const hfService = HFService.getInstance();
