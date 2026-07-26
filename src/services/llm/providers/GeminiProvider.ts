import { ModelResponse } from "../../../types";
import { BaseProvider, ProviderOptions } from "./BaseProvider";

export class GeminiProvider extends BaseProvider {
  providerName = "Google" as const;
  modelName: string;
  protected inputCostPerMillion: number;
  protected outputCostPerMillion: number;

  constructor(modelId: string) {
    super();
    if (modelId.includes("pro")) {
      this.modelName = "Gemini 3.5 Pro";
      this.inputCostPerMillion = 1.25;
      this.outputCostPerMillion = 5.00;
    } else {
      this.modelName = "Gemini 3.6 Flash";
      this.inputCostPerMillion = 0.075;
      this.outputCostPerMillion = 0.30;
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
        throw new Error(`Gemini remote execution error: status ${response.status}`);
      }

      const resJson = await response.json();
      if (!resJson.success) {
        throw new Error(resJson.error || "Gemini API failure");
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
        confidenceScore: data.alignmentScore || 90,
        evaluation: this.runEvaluation(options.promptText, data.responseText)
      };
    } catch (err: any) {
      console.log("GeminiProvider execution notice:", err.message || err);
      throw err;
    }
  }
}
