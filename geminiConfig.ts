export const SUPPORTED_GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro'
] as const;

export type SupportedGeminiModel = (typeof SUPPORTED_GEMINI_MODELS)[number];

export function resolveGeminiModelName(configuredModel?: string): { modelName: SupportedGeminiModel; isSupported: true } | { modelName: SupportedGeminiModel; isSupported: false; error: string } {
  const requestedModel = configuredModel?.trim();
  const defaultModel: SupportedGeminiModel = 'gemini-2.5-flash';

  if (!requestedModel) {
    return { modelName: defaultModel, isSupported: true };
  }

  if ((SUPPORTED_GEMINI_MODELS as readonly string[]).includes(requestedModel)) {
    return { modelName: requestedModel as SupportedGeminiModel, isSupported: true };
  }

  return {
    modelName: defaultModel,
    isSupported: false,
    error: `The configured Gemini model "${requestedModel}" is unavailable. Please use one of: ${SUPPORTED_GEMINI_MODELS.join(', ')}`
  };
}
