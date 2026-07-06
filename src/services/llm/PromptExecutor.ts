import { ModelResponse, PromptExecution } from "../../types";
import { ModelFactory } from "./ModelFactory";

export interface ExecuteOptions {
  userId: string;
  promptText: string;
  systemInstruction?: string;
  category: string;
  selectedModels: string[];
}

export class PromptExecutor {
  static async executeMultiModel(options: ExecuteOptions): Promise<PromptExecution> {
    const { userId, promptText, systemInstruction, category, selectedModels } = options;
    const startTime = Date.now();
    
    // Launch all model providers in parallel
    const promises = selectedModels.map(async (modelId) => {
      const provider = ModelFactory.getProvider(modelId);
      try {
        const response = await provider.execute({
          modelId,
          promptText,
          systemInstruction,
        });
        return response;
      } catch (err: any) {
        const mockModel = ModelFactory.getModelById(modelId);
        return {
          modelId,
          modelName: mockModel ? mockModel.name : modelId,
          provider: mockModel ? mockModel.provider : "Unknown",
          responseText: `Error during model execution: ${err.message || String(err)}`,
          latencyMs: Date.now() - startTime,
          tokenUsage: { prompt: 0, completion: 0, total: 0 },
          costAnalysis: { inputCostUsd: 0, outputCostUsd: 0, totalCostUsd: 0 },
          readabilityGrade: "N/A",
          confidenceScore: 0,
          evaluation: {
            relevanceScore: 0,
            completenessScore: 0,
            clarityScore: 0,
            creativityScore: 0,
            structureScore: 0,
            overallScore: 0,
            summary: `Execution failed. Details: ${err.message || String(err)}`,
          },
          isError: true,
        };
      }
    });

    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    const validResponses = responses.filter((r) => !r.isError);
    const averageLatencyMs = validResponses.length > 0
      ? Math.round(validResponses.reduce((sum, r) => sum + r.latencyMs, 0) / validResponses.length)
      : duration;

    const totalTokens = responses.reduce((sum, r) => sum + r.tokenUsage.total, 0);
    const totalCostUsd = parseFloat(
      responses.reduce((sum, r) => sum + r.costAnalysis.totalCostUsd, 0).toFixed(6)
    );

    return {
      id: "exec_" + Math.random().toString(36).substring(2, 11),
      userId,
      promptText,
      systemInstruction: systemInstruction || "",
      category,
      timestamp: new Date().toISOString(),
      modelsUsed: selectedModels,
      responses,
      averageLatencyMs,
      totalTokens,
      totalCostUsd,
    };
  }
}
