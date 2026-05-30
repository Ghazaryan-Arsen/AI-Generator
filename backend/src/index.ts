import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL_ID = "runwayml/stable-diffusion-v1-5";

app.post('/generate-image', async (req, res) => {
  try {
    const { prompt, style, aspectRatio } = req.body;
    console.log(`Generating image for: "${prompt}", Style: ${style}, Aspect: ${aspectRatio}`);

    if (!HF_TOKEN) {
      console.log("No HF_TOKEN found, falling back to mock.");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const mockImageUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt || 'default')}/800/600`;
      return res.status(200).json({ success: true, imageUrl: mockImageUrl });
    }

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${MODEL_ID}`,
      { inputs: `${prompt}, ${style} style` },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    res.status(200).json({ success: true, imageUrl });
  } catch (error: any) {
    console.error('Error generating image:', error.response?.data?.toString() || error.message);
    res.status(500).json({ success: false, message: 'Failed to generate image' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
