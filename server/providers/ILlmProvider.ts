export interface GenerateOptions {
  modelId: string;
  promptText: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface CostEstimate {
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
}

export interface ProviderResponse {
  provider: string; // e.g. "Google", "OpenAI", "Anthropic"
  model: string;    // e.g. "gemini-3.6-flash", "gpt-4o", "claude-3-5-sonnet"
  response: string;
  latency: number;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: CostEstimate;
  finishReason: string; // e.g. "STOP", "MAX_TOKENS", "ERROR", "DISABLED"
  confidence: number;   // 0 - 100
  alignment: number;    // 0 - 100
  readabilityGrade?: string;
  evaluation?: any;
  error?: string;
  isError?: boolean;
}

export interface ILlmProvider {
  providerName: string;
  supportedModels: string[];

  generate(options: GenerateOptions): Promise<ProviderResponse>;
  estimateCost(inputTokens: number, outputTokens: number, modelId?: string): CostEstimate;
  countTokens(text: string): number;
  healthCheck(): Promise<boolean>;
}
