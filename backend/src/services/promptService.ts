export class PromptService {
  private static instance: PromptService;

  private stylePresets: Record<string, { positive: string; negative: string }> = {
    'Realistic': {
      positive: 'highly detailed, photorealistic, 8k, masterpiece, realistic lighting, sharp focus',
      negative: 'cartoon, anime, sketches, worst quality, low quality, blurry'
    },
    'Digital Art': {
      positive: 'vibrant colors, clean lines, professional digital illustration, trending on artstation',
      negative: 'photo, realistic, sketches, low quality'
    },
    'Oil Painting': {
      positive: 'classic oil painting style, visible brushstrokes, rich textures, canvas texture, museum quality',
      negative: 'photograph, digital, anime, cartoon'
    },
    'Anime': {
      positive: 'modern anime style, high quality cel shading, vivid colors, aesthetic, studio ghibli inspired',
      negative: 'realistic, photograph, 3d render, worst quality'
    },
    'Cyberpunk': {
      positive: 'neon lights, futuristic city, dark moody atmosphere, cinematic lighting, synthwave aesthetic',
      negative: 'nature, pastoral, bright daylight, old fashioned'
    }
  };

  private constructor() {}

  public static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService();
    }
    return PromptService.instance;
  }

  public enhancePrompt(prompt: string, style: string = 'Realistic'): string {
    const preset = this.stylePresets[style] || this.stylePresets['Realistic'];

    // Sanitize prompt: trim, remove multiple spaces, and limit length
    let sanitized = prompt.trim().replace(/\s+/g, ' ').substring(0, 500);

    // Basic sanitization: remove potential script tags or dangerous characters
    sanitized = sanitized.replace(/[<>]/g, '');

    if (!sanitized) return preset.positive;

    // Add quality keywords
    const enhanced = `${sanitized}, ${preset.positive}`;

    return enhanced;
  }

  public getNegativePrompt(style: string = 'Realistic'): string {
    const preset = this.stylePresets[style] || this.stylePresets['Realistic'];
    return preset.negative;
  }
}

export const promptService = PromptService.getInstance();
