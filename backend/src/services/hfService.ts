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

  public async generateImage(prompt: string, negativePrompt?: string, width: number = 512, height: number = 512, retries = 3): Promise<Buffer> {
    if (!HF_TOKEN) {
      throw new Error('HF_TOKEN is not configured');
    }

    let lastError: any;

    for (let i = 0; i <= retries; i++) {
      try {
        const startTime = Date.now();
        const payload: any = {
          inputs: prompt,
          parameters: {
            negative_prompt: negativePrompt,
            width: width,
            height: height
          }
        };

        const response = await axios.post(
          `https://api-inference.huggingface.co/models/${MODEL_ID}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${HF_TOKEN}`,
              'Content-Type': 'application/json',
            },
            responseType: 'arraybuffer',
            timeout: 90000, // Increased to 90s timeout
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
          if (body.error) {
            throw new Error(`HF API Error: ${body.error}`);
          }
        }

        const buffer = Buffer.from(response.data, 'binary');
        if (buffer.length === 0) {
          throw new Error('Received empty response from HF API');
        }

        return buffer;
      } catch (error: any) {
        lastError = error;
        const status = error.response?.status;
ai-image-generator-improvements-8591800724981460221
        const errorData = error.response?.data instanceof Buffer
          ? JSON.parse(error.response.data.toString())
          : error.response?.data;

        const message = errorData?.error || error.message;

        const message = error.response?.data?.toString() || error.message;
 main
        const isRetryable = status === 503 || status === 429 || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';

        console.error(`[${new Date().toISOString()}] HF API Error (Attempt ${i + 1}): status=${status}, message="${message}"`);

        if (i < retries && isRetryable) {
 ai-image-generator-improvements-8591800724981460221
          // Exponential backoff with jitter
          const delay = Math.pow(2, i) * 2000 + Math.random() * 1000;
          console.log(`HF API retryable error (${status || error.code}: ${message}). Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${retries})`);

          const delay = Math.pow(2, i) * 1000;
          console.log(`[${new Date().toISOString()}] HF API busy. Retrying in ${delay}ms...`);
 main
          await this.sleep(delay);
          continue;
        }

        console.error(`HF Generation failed on attempt ${i + 1}: ${message}`);
        break;
      }
    }

    // Format the error message to be more user friendly
    let finalMessage = 'Failed to generate image. ';
    if (lastError.code === 'ECONNABORTED') finalMessage += 'Request timed out.';
    else if (lastError.response?.status === 503) finalMessage += 'AI model is currently loading, please try again in a moment.';
    else if (lastError.response?.status === 429) finalMessage += 'Too many requests, please slow down.';
    else finalMessage += lastError.message || 'Unknown error';

    throw new Error(finalMessage);
  }
}

export const hfService = HFService.getInstance();
