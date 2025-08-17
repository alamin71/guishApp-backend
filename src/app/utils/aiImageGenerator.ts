import { OpenAI } from 'openai';
import config from '../../app/config';

const openai = new OpenAI({
  apiKey: config.openai_api_key,
});

export const generateAIImage = async (prompt: string): Promise<string> => {
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      // n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    // Type-safe check
    const imageUrl = response?.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('Image URL not returned from OpenAI');
    }

    return imageUrl;
  } catch (error: any) {
    console.error('Error generating AI image:', error?.message || error);
    throw new Error('Failed to generate AI image');
  }
};
