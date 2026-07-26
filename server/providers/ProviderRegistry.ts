import { ILlmProvider, GenerateOptions, ProviderResponse } from "./ILlmProvider.js";
import { GeminiProvider } from "./GeminiProvider.js";
import { OpenAIProvider } from "./OpenAIProvider.js";
import { ClaudeProvider } from "./ClaudeProvider.js";

export class ProviderRegistry {
  private geminiProvider: GeminiProvider;
  private openAIProvider: OpenAIProvider;
  private claudeProvider: ClaudeProvider;

  constructor() {
    this.geminiProvider = new GeminiProvider();
    this.openAIProvider = new OpenAIProvider();
    this.claudeProvider = new ClaudeProvider();
  }

  public updateProviderKey(providerName: string, apiKey: string) {
    const cleanProvider = providerName.toLowerCase();
    if (cleanProvider.includes("google") || cleanProvider.includes("gemini")) {
      this.geminiProvider.setApiKey(apiKey);
    } else if (cleanProvider.includes("openai") || cleanProvider.includes("gpt")) {
      this.openAIProvider.setApiKey(apiKey);
    } else if (cleanProvider.includes("anthropic") || cleanProvider.includes("claude")) {
      this.claudeProvider.setApiKey(apiKey);
    }
  }

  public getProviderForModel(modelId: string): ILlmProvider {
    const lower = (modelId || "").toLowerCase();
    if (lower.startsWith("gpt") || lower.includes("openai")) {
      return this.openAIProvider;
    }
    if (lower.startsWith("claude") || lower.includes("anthropic")) {
      return this.claudeProvider;
    }
    return this.geminiProvider;
  }

  public getProviderByName(providerName: string): ILlmProvider | null {
    const lower = (providerName || "").toLowerCase();
    if (lower.includes("google") || lower.includes("gemini")) return this.geminiProvider;
    if (lower.includes("openai") || lower.includes("gpt")) return this.openAIProvider;
    if (lower.includes("anthropic") || lower.includes("claude")) return this.claudeProvider;
    return null;
  }

  public async getHealthStatuses(): Promise<Record<string, boolean>> {
    const [googleHealth, openAIHealth, claudeHealth] = await Promise.all([
      this.geminiProvider.healthCheck(),
      this.openAIProvider.healthCheck(),
      this.claudeProvider.healthCheck()
    ]);

    return {
      Google: googleHealth,
      OpenAI: openAIHealth,
      Anthropic: claudeHealth
    };
  }

  public async executeConcurrentComparison(
    modelIds: string[],
    options: GenerateOptions
  ): Promise<ProviderResponse[]> {
    if (!modelIds || modelIds.length === 0) {
      modelIds = ["gemini-3.6-flash"];
    }

    // Run all provider requests concurrently using Promise.all()
    const promises = modelIds.map(async (modelId): Promise<ProviderResponse> => {
      const provider = this.getProviderForModel(modelId);
      const isHealthy = await provider.healthCheck();

      if (!isHealthy) {
        return {
          provider: provider.providerName,
          model: modelId,
          response: "",
          latency: 0,
          tokens: { prompt: 0, completion: 0, total: 0 },
          cost: { inputCostUsd: 0, outputCostUsd: 0, totalCostUsd: 0 },
          finishReason: "DISABLED",
          confidence: 0,
          alignment: 0,
          error: `Provider '${provider.providerName}' is disabled or API key is not configured.`,
          isError: true
        };
      }

      const startTime = Date.now();
      try {
        const response = await provider.generate({ ...options, modelId });
        return response;
      } catch (err: any) {
        const latency = Date.now() - startTime;
        return {
          provider: provider.providerName,
          model: modelId,
          response: "",
          latency,
          tokens: { prompt: 0, completion: 0, total: 0 },
          cost: { inputCostUsd: 0, outputCostUsd: 0, totalCostUsd: 0 },
          finishReason: "ERROR",
          confidence: 0,
          alignment: 0,
          error: err.message || `Failed to execute request with ${provider.providerName}.`,
          isError: true
        };
      }
    });

    return await Promise.all(promises);
  }
}

export const globalProviderRegistry = new ProviderRegistry();
