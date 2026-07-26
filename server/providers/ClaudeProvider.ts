import Anthropic from "@anthropic-ai/sdk";
import { ILlmProvider, GenerateOptions, ProviderResponse, CostEstimate } from "./ILlmProvider.js";

export class ClaudeProvider implements ILlmProvider {
  providerName = "Anthropic";
  supportedModels = ["claude-3-5-sonnet", "claude-3-5-haiku", "claude-3-opus", "claude-3-sonnet"];

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
    const envKey = process.env.ANTHROPIC_API_KEY;
    if (envKey && envKey.trim() !== "" && !envKey.includes("YOUR_")) {
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
    const isHaiku = modelId?.includes("haiku");
    const isOpus = modelId?.includes("opus");

    let inputRate = 3.00;   // default sonnet
    let outputRate = 15.00;

    if (isHaiku) {
      inputRate = 0.80;
      outputRate = 4.00;
    } else if (isOpus) {
      inputRate = 15.00;
      outputRate = 75.00;
    }

    const inputCostUsd = parseFloat(((inputTokens / 1000000) * inputRate).toFixed(6));
    const outputCostUsd = parseFloat(((outputTokens / 1000000) * outputRate).toFixed(6));
    const totalCostUsd = parseFloat((inputCostUsd + outputCostUsd).toFixed(6));

    return { inputCostUsd, outputCostUsd, totalCostUsd };
  }

  async generate(options: GenerateOptions): Promise<ProviderResponse> {
    const key = this.getApiKey();
    if (!key) {
      throw new Error("Anthropic Claude provider disabled: ANTHROPIC_API_KEY environment variable missing.");
    }

    const startTime = Date.now();
    const anthropic = new Anthropic({ apiKey: key });

    const targetModel = this.supportedModels.includes(options.modelId) ? options.modelId : "claude-3-5-sonnet";

    const message = await anthropic.messages.create({
      model: targetModel,
      max_tokens: options.maxTokens || 1024,
      system: options.systemInstruction || undefined,
      messages: [{ role: "user", content: options.promptText }],
      temperature: options.temperature ?? 0.7
    });

    const latency = Date.now() - startTime;
    let responseText = "";
    if (message.content && message.content.length > 0) {
      const firstBlock = message.content[0];
      if (firstBlock.type === "text") {
        responseText = firstBlock.text;
      }
    }

    const promptTokens = message.usage?.input_tokens || this.countTokens(options.promptText + (options.systemInstruction || ""));
    const completionTokens = message.usage?.output_tokens || this.countTokens(responseText);
    const totalTokens = promptTokens + completionTokens;

    const cost = this.estimateCost(promptTokens, completionTokens, targetModel);
    const finishReason = message.stop_reason || "end_turn";

    const alignment = this.calculateAlignmentScore(options.promptText, responseText);
    const confidence = Math.min(100, Math.max(60, alignment));

    return {
      provider: this.providerName,
      model: targetModel,
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
    let score = 90;
    const promptLower = promptText.toLowerCase();
    const respLower = responseText.toLowerCase();

    if (promptLower.includes("bullet") || promptLower.includes("list")) {
      if (respLower.includes("- ") || respLower.includes("* ") || respLower.includes("1.")) score += 5;
    }
    return Math.min(100, Math.max(50, score));
  }

  private calculateGradeLevel(text: string): string {
    const words = text.split(/\s+/).filter(Boolean).length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
    const avgLen = words / sentences;

    if (avgLen > 15) return "Expert Technical (Grade 12+)";
    if (avgLen > 11) return "Professional (Grade 10-12)";
    return "Conversational (Grade <6)";
  }
}
