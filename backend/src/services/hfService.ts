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
        console.log(`HF Generation successful in ${duration}ms`);

        if (String(response.headers['content-type']).includes('application/json')) {
          const body = JSON.parse(Buffer.from(response.data).toString());
          if (body.error && body.error.includes('loading')) {
            throw { response: { status: 503 }, message: body.error };
          }
        }

        return Buffer.from(response.data, 'binary');
      } catch (error: any) {
        lastError = error;
        const status = error.response?.status;
        const isRetryable = status === 503 || status === 429 || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';

        if (i < retries && isRetryable) {
          const delay = Math.pow(2, i) * 1000;
          console.log(`HF API busy (${status || error.code}). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
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
