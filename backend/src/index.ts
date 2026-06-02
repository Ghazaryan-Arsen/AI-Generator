import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { body, validationResult } from 'express-validator';
import NodeCache from 'node-cache';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Cache for 1 hour, check for expired items every 2 minutes
const imageCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL_ID = "runwayml/stable-diffusion-v1-5";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function queryHF(inputs: string, retries = 2): Promise<Buffer> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${MODEL_ID}`,
        { inputs },
        {
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
          timeout: 55000, // 55s timeout for HF
        }
      );
      return Buffer.from(response.data, 'binary');
    } catch (error: any) {
      const isRetryable = error.response?.status === 503 || error.code === 'ECONNABORTED';
      if (i < retries && isRetryable) {
        console.log(`HF API Busy or Timed out. Retrying in 2s... (Attempt ${i + 1}/${retries})`);
        await sleep(2000);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Failed to generate image after retries');
}

app.post('/api/generate-image', 
  [
    body('prompt').isString().trim().notEmpty().withMessage('Prompt is required').isLength({ max: 500 }).withMessage('Prompt too long'),
    body('style').optional().isString(),
    body('aspectRatio').optional().isString()
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
      const { prompt, style, aspectRatio } = req.body;
      const cacheKey = `${prompt}_${style}_${aspectRatio}`;
      
      const cachedImage = imageCache.get(cacheKey);
      if (cachedImage) {
        console.log('Serving from cache:', prompt);
        return res.status(200).json({ success: true, imageUrl: cachedImage });
      }

      console.log(`Generating: "${prompt}", Style: ${style}`);

      if (!HF_TOKEN) {
        console.log("No HF_TOKEN found, falling back to mock.");
        await sleep(1500);
        const mockImageUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/600`;
        imageCache.set(cacheKey, mockImageUrl);
        return res.status(200).json({ success: true, imageUrl: mockImageUrl });
      }

      const buffer = await queryHF(`${prompt}, ${style || 'Realistic'} style`);
      const base64Image = buffer.toString('base64');
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;

      imageCache.set(cacheKey, imageUrl);
      res.status(200).json({ success: true, imageUrl });

    } catch (error: any) {
      console.error('Backend Error:', error.message);
      
      let status = 500;
      let message = 'AI Model failed to respond. Please try again later.';
      
      if (error.response?.status === 503) {
        message = 'AI Model is currently loading. Please wait a moment and try again.';
        status = 503;
      } else if (error.code === 'ECONNABORTED') {
        message = 'Request timed out. Please try a simpler prompt or try again.';
        status = 408;
      }

      res.status(status).json({ success: false, message });
    }
  }
);

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  app.get('{*path}', (req: any, res: any) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
