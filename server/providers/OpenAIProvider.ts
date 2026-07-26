import OpenAI from "openai";
import { ILlmProvider, GenerateOptions, ProviderResponse, CostEstimate } from "./ILlmProvider.js";

export class OpenAIProvider implements ILlmProvider {
  providerName = "OpenAI";
  supportedModels = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"];

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
    const envKey = process.env.OPENAI_API_KEY;
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
    const isMini = modelId?.includes("mini") || modelId?.includes("3.5");
    const inputRate = isMini ? 0.15 : 5.00;   // per million
    const outputRate = isMini ? 0.60 : 15.00; // per million

    const inputCostUsd = parseFloat(((inputTokens / 1000000) * inputRate).toFixed(6));
    const outputCostUsd = parseFloat(((outputTokens / 1000000) * outputRate).toFixed(6));
    const totalCostUsd = parseFloat((inputCostUsd + outputCostUsd).toFixed(6));

    return { inputCostUsd, outputCostUsd, totalCostUsd };
  }

  async generate(options: GenerateOptions): Promise<ProviderResponse> {
    const key = this.getApiKey();
    if (!key) {
      throw new Error("OpenAI provider disabled: OPENAI_API_KEY environment variable missing.");
    }

    const startTime = Date.now();
    const client = new OpenAI({ apiKey: key });

    const targetModel = this.supportedModels.includes(options.modelId) ? options.modelId : "gpt-4o";

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    if (options.systemInstruction) {
      messages.push({ role: "system", content: options.systemInstruction });
    }
    messages.push({ role: "user", content: options.promptText });

    const completion = await client.chat.completions.create({
      model: targetModel,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? undefined
    });

    const latency = Date.now() - startTime;
    const choice = completion.choices[0];
    const responseText = choice?.message?.content || "No response received.";
    const usage = completion.usage;

    const promptTokens = usage?.prompt_tokens || this.countTokens(options.promptText + (options.systemInstruction || ""));
    const completionTokens = usage?.completion_tokens || this.countTokens(responseText);
    const totalTokens = usage?.total_tokens || (promptTokens + completionTokens);

    const cost = this.estimateCost(promptTokens, completionTokens, targetModel);
    const finishReason = choice?.finish_reason || "STOP";

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
    let score = 88;
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
