export class PromptService {
  private static instance: PromptService;

  private stylePresets: Record<string, { positive: string; negative: string }> = {
    'Realistic': {
      positive: 'photorealistic, highly detailed, 8k resolution, masterpiece, sharp focus, realistic lighting, cinematic composition',
      negative: 'cartoon, anime, sketches, worst quality, low quality, blurry, distorted, deformed, watermark'
    },
    'Anime': {
      positive: 'modern anime style, high quality cel shading, vivid colors, aesthetic, studio ghibli inspired, detailed background, sharp lines',
      negative: 'realistic, photograph, 3d render, worst quality, low quality, blurry, distorted, sketch'
    },
    'Cyberpunk': {
      positive: 'neon lights, futuristic city, dark moody atmosphere, cinematic lighting, synthwave aesthetic, ultra detailed, glowing elements',
      negative: 'nature, pastoral, bright daylight, old fashioned, realistic, blurry, low quality'
    },
    'Fantasy': {
      positive: 'ethereal fantasy style, magical atmosphere, intricate details, epic composition, digital painting, trending on artstation, mythical',
      negative: 'modern, sci-fi, realistic, photograph, low quality, blurry, distorted'
    },
    '3D Render': {
      positive: 'unreal engine 5 render, octan render, ray tracing, ultra detailed, 4k, volumetric lighting, pixar style, smooth textures',
      negative: '2d, flat, sketch, anime, worst quality, low quality, blurry, photograph'
    },
    'Pixel Art': {
      positive: 'high quality pixel art, 8-bit style, vibrant colors, clean pixels, retro aesthetic, detailed sprite art',
      negative: 'photograph, 3d, realistic, blurry, smooth, gradient, low quality'
    },
    'Digital Art': {
      positive: 'professional digital illustration, clean lines, vibrant colors, trending on artstation, masterpiece, detailed',
      negative: 'photograph, realistic, sketches, low quality, blurry, worst quality'
    }
  };

  private defaultNegative = "blurry, low quality, deformed, duplicate, cropped, watermark, distorted face, ugly, bad anatomy, bad proportions, extra limbs, fused fingers, too many fingers, lowres, error, missing fingers, extra digit, fewer digits, jpeg artifacts, signature, username, blurry";

  private constructor() {}

  public static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService();
    }
    return PromptService.instance;
  }

  public enhancePrompt(prompt: string, style: string = 'Realistic'): string {
    const preset = this.stylePresets[style] || this.stylePresets['Realistic'];

 ai-image-generator-improvements-8591800724981460221
    // Sanitize prompt
    let enhanced = prompt.trim();

    // Simple enhancement: if the prompt is very short, add some descriptive words
    if (enhanced.split(' ').length < 5) {
      enhanced = `A beautiful ${enhanced}`;
    }

    // Add style-specific positive keywords
    enhanced = `${enhanced}, ${preset.positive}`;

    // Sanitize prompt: trim, remove multiple spaces, and limit length
    let sanitized = prompt.trim().replace(/\s+/g, ' ').substring(0, 500);

    // Basic sanitization: remove potential script tags or dangerous characters
    sanitized = sanitized.replace(/[<>]/g, '');

    if (!sanitized) return preset.positive;

    // Add quality keywords
    const enhanced = `${sanitized}, ${preset.positive}`;
 main

    return enhanced;
  }

  public getNegativePrompt(style: string = 'Realistic'): string {
    const preset = this.stylePresets[style] || this.stylePresets['Realistic'];
    return `${this.defaultNegative}, ${preset.negative}`;
  }

  public getAvailableStyles(): string[] {
    return Object.keys(this.stylePresets);
  }
}

export const promptService = PromptService.getInstance();
