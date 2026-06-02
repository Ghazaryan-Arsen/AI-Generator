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
            timeout: 90000,
          }
        );

        const duration = Date.now() - startTime;
        console.log(`HF Generation successful in ${duration}ms`);

        // Check if the response is actually JSON (meaning an error) despite being requested as arraybuffer
        const contentType = String(response.headers['content-type'] || '');
        if (contentType.includes('application/json')) {
          const body = JSON.parse(Buffer.from(response.data).toString());
          if (body.error && body.error.includes('loading')) {
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

        // If we already threw a custom error or 503, don't try to parse again
        if (error.response?.status === 503 || error.message.startsWith('HF API Error')) {
           // Fall through to retry logic
        } else if (error.response?.data instanceof Buffer) {
          try {
            const errorData = JSON.parse(error.response.data.toString());
            error.message = errorData.error || error.message;
          } catch (e) {
            // Not JSON, keep original error
          }
        }

        const status = error.response?.status;
        const message = error.message;
        const isRetryable = status === 503 || status === 429 || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';

        if (i < retries && isRetryable) {
          const delay = Math.pow(2, i) * 2000 + Math.random() * 1000;
          console.log(`HF API retryable error (${status || error.code}: ${message}). Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${retries})`);
          await this.sleep(delay);
          continue;
        }

        console.error(`HF Generation failed on attempt ${i + 1}: ${message}`);
        break;
      }
    }

    let finalMessage = 'Failed to generate image. ';
    if (lastError.code === 'ECONNABORTED') finalMessage += 'Request timed out.';
    else if (lastError.response?.status === 503) finalMessage += 'AI model is currently loading, please try again in a moment.';
    else if (lastError.response?.status === 429) finalMessage += 'Too many requests, please slow down.';
    else finalMessage += lastError.message || 'Unknown error';

    throw new Error(finalMessage);
  }
}

export const hfService = HFService.getInstance();
