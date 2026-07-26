import { GoogleGenAI } from "@google/genai";
import { ILlmProvider, GenerateOptions, ProviderResponse, CostEstimate } from "./ILlmProvider.js";

export class GeminiProvider implements ILlmProvider {
  providerName = "Google";
  supportedModels = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
  ];

  private customApiKey?: string;

  constructor(customKey?: string) {
    this.customApiKey = customKey;
  }

  public setApiKey(key: string) {
    this.customApiKey = key;
  }

  private getApiKey(): string | null {
    if (this.customApiKey && this.customApiKey.trim() !== "") {
      return this.customApiKey;
    }
    const envKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (envKey && envKey.trim() !== "" && envKey !== "MY_GEMINI_API_KEY") {
      return envKey;
    }
    return null;
  }

  async healthCheck(): Promise<boolean> {
    const key = this.getApiKey();
    return Boolean(key && key.length > 5);
  }

  countTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  estimateCost(inputTokens: number, outputTokens: number, modelId?: string): CostEstimate {
    const isPro = modelId?.includes("pro");
    const inputRate = isPro ? 1.25 : 0.075; // per million
    const outputRate = isPro ? 5.00 : 0.30; // per million

    const inputCostUsd = parseFloat(((inputTokens / 1000000) * inputRate).toFixed(6));
    const outputCostUsd = parseFloat(((outputTokens / 1000000) * outputRate).toFixed(6));
    const totalCostUsd = parseFloat((inputCostUsd + outputCostUsd).toFixed(6));

    return { inputCostUsd, outputCostUsd, totalCostUsd };
  }

  async generate(options: GenerateOptions): Promise<ProviderResponse> {
    const key = this.getApiKey();
    if (!key) {
      throw new Error("Google Gemini provider disabled: GOOGLE_API_KEY environment variable missing.");
    }

    const startTime = Date.now();
    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });

    const modelToUse = options.modelId.startsWith("gemini") ? "gemini-3.6-flash" : "gemini-3.6-flash";
    const promptText = options.promptText;
    const systemInstruction = options.systemInstruction;

    let response: any;
    let retries = 2;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: modelToUse,
          contents: promptText,
          config: {
            systemInstruction: systemInstruction || undefined,
            temperature: options.temperature ?? 0.7,
            maxOutputTokens: options.maxTokens ?? undefined
          }
        });
        break;
      } catch (err: any) {
        const isRateLimit =
          err?.status === 429 ||
          err?.message?.includes("429") ||
          err?.message?.includes("RESOURCE_EXHAUSTED") ||
          err?.status === 503;
        if (isRateLimit && attempt < retries) {
          await new Promise((res) => setTimeout(res, 1200 * (attempt + 1)));
        } else {
          throw err;
        }
      }
    }

    const latency = Date.now() - startTime;
    const responseText = response?.text || "No content returned.";
    const usage = response?.usageMetadata;

    const promptTokens = usage?.promptTokenCount || this.countTokens(promptText + (systemInstruction || ""));
    const completionTokens = usage?.candidatesTokenCount || this.countTokens(responseText);
    const totalTokens = usage?.totalTokenCount || (promptTokens + completionTokens);

    const cost = this.estimateCost(promptTokens, completionTokens, options.modelId);
    const finishReason = response?.candidates?.[0]?.finishReason || "STOP";

    const alignment = this.calculateAlignmentScore(promptText, responseText);
    const confidence = Math.min(100, Math.max(60, alignment));

    return {
      provider: this.providerName,
      model: options.modelId || "gemini-3.6-flash",
      response: responseText,
      latency,
      tokens: {
        prompt: promptTokens,
        completion: completionTokens,
        total: totalTokens
      },
      cost,
      finishReason,
      confidence,
      alignment,
      readabilityGrade: this.calculateGradeLevel(responseText)
    };
  }

  private calculateAlignmentScore(promptText: string, responseText: string): number {
    if (!responseText || responseText.length < 10) return 0;
    let score = 85;
    const promptLower = promptText.toLowerCase();
    const respLower = responseText.toLowerCase();

    if (promptLower.includes("bullet") || promptLower.includes("list")) {
      if (respLower.includes("- ") || respLower.includes("* ") || respLower.includes("1.")) score += 5;
      else score -= 5;
    }
    if (promptLower.includes("code") || promptLower.includes("json") || promptLower.includes("python")) {
      if (respLower.includes("```") || respLower.includes("{")) score += 5;
      else score -= 5;
    }
    return Math.min(100, Math.max(50, score));
  }

  private calculateGradeLevel(text: string): string {
    const words = text.split(/\s+/).filter(Boolean).length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
    const avgLen = words / sentences;

    if (avgLen > 15) return "Expert Technical (Grade 12+)";
    if (avgLen > 11) return "Professional (Grade 10-12)";
    if (avgLen > 7) return "Intermediate (Grade 7-9)";
    return "Conversational (Grade <6)";
  }
}
