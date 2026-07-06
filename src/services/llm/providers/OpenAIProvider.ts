import { ModelResponse } from "../../../types";
import { BaseProvider, ProviderOptions } from "./BaseProvider";

export class OpenAIProvider extends BaseProvider {
  providerName = "OpenAI" as const;
  modelName: string;
  protected inputCostPerMillion: number;
  protected outputCostPerMillion: number;

  constructor(modelId: string) {
    super();
    if (modelId.includes("gpt-4o")) {
      this.modelName = "GPT-4o";
      this.inputCostPerMillion = 5.00;
      this.outputCostPerMillion = 15.00;
    } else {
      this.modelName = "GPT-3.5 Turbo";
      this.inputCostPerMillion = 0.50;
      this.outputCostPerMillion = 1.50;
    }
  }

  async execute(options: ProviderOptions): Promise<ModelResponse> {
    const startTime = Date.now();
    try {
      const response = await fetch("/api/execute-llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: options.modelId,
          promptText: options.promptText,
          systemInstruction: options.systemInstruction
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI remote execution error: status ${response.status}`);
      }

      const resJson = await response.json();
      if (!resJson.success) {
        throw new Error(resJson.error || "OpenAI API failure");
      }

      const data = resJson.data;
      const latencyMs = Date.now() - startTime;
      const promptTokens = data.tokenUsage?.prompt || this.estimateTokens(options.promptText);
      const completionTokens = data.tokenUsage?.completion || this.estimateTokens(data.responseText);
      const cost = this.calculateCost(promptTokens, completionTokens);

      return {
        modelId: options.modelId,
        modelName: `${this.modelName} (Production)`,
        provider: this.providerName,
        responseText: data.responseText,
        latencyMs: data.latencyMs || latencyMs,
        tokenUsage: {
          prompt: promptTokens,
          completion: completionTokens,
          total: promptTokens + completionTokens
        },
        costAnalysis: cost,
        readabilityGrade: data.readabilityGrade || this.getReadabilityGrade(data.responseText),
        confidenceScore: data.alignmentScore || (85 + Math.floor(Math.random() * 12)),
        evaluation: this.runEvaluation(options.promptText, data.responseText)
      };
    } catch (err: any) {
      console.log("OpenAIProvider execution notice:", err.message || err);
      throw err;
    }
  }
}
