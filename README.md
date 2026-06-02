# AI Image Generator

A full-stack AI image generation application built with React, Node.js, and Hugging Face's Stable Diffusion API.

## 🚀 Features

- **Text-to-Image:** Generate high-quality images from text prompts.
- **Styles & Ratios:** Customize your art with predefined styles and aspect ratios.
- **Gallery History:** Keep track of your creations during your session.
- **Production Ready:** Includes caching, rate limiting (validation), and robust error handling.

## 🛠 Tech Stack

- **Frontend:** React (Vite), TypeScript, Tailwind CSS.
- **Backend:** Node.js, Express, Axios.
- **AI API:** Hugging Face (Stable Diffusion v1.5).

## ⚙️ Setup Instructions

### Backend

1. Navigate to `/backend`.
2. Install dependencies: `npm install`.
3. Create a `.env` file with your Hugging Face Token:
   ```
   HF_TOKEN=your_hugging_face_token_here
   PORT=5000
   ```
4. Build and start: `npm run build && npm start`.

### Frontend

1. Navigate to `/frontend`.
2. Install dependencies: `npm install`.
3. Create a `.env` file:
   ```
   VITE_API_URL=http://localhost:5000
   ```
4. Start development server: `npm run dev`.

## 🌐 Deployment

- **Frontend:** Deploy on **Vercel**. Set `VITE_API_URL` to your backend URL.
- **Backend:** Deploy on **Render**. Set `HF_TOKEN` in the environment variables.

## 🧪 Testing

Run the end-to-end verification script:
```bash
python3 /home/jules/verification/verify_gen.py
```
