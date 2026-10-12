import { getFirebaseAuth } from '../core/firebase';
import { OperationResult } from '../types/common.types';

export interface AiPromptOptions {
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
  attachments?: Array<{ mimeType: string; data: string }>;
}

/**
 * Client service interacting with the secure /api/ai Cloudflare Edge proxy.
 */
export class AiService {
  private readonly endpoint = '/api/ai';

  /**
   * Generates AI completions via the server-side Gemini API proxy.
   *
   * @param {string} prompt - Prompt instructions for Gemini.
   * @param {AiPromptOptions} options - Additional generation configurations.
   */
  public async generateText(
    prompt: string,
    options: AiPromptOptions = {}
  ): Promise<OperationResult<string>> {
    try {
      const auth = getFirebaseAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'User must be authenticated to invoke AI services' };
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          prompt,
          attachments: options.attachments,
          options: {
            temperature: options.temperature,
            maxOutputTokens: options.maxOutputTokens,
            responseMimeType: options.responseMimeType,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: (errorData as { error?: string }).error || `AI proxy error (${response.status})`,
        };
      }

      const data = await response.json();
      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        return { success: false, error: 'Empty AI response received' };
      }

      return { success: true, data: candidateText };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'AI request failed unexpectedly',
      };
    }
  }
}

export const aiService = new AiService();
