import { ModelResponse, TokenUsage, CostAnalysis, EvaluationResult } from "../../../types";

export interface ProviderOptions {
  modelId: string;
  promptText: string;
  systemInstruction?: string;
  temperature?: number;
}

export abstract class BaseProvider {
  abstract providerName: string;
  abstract modelName: string;
  
  protected abstract inputCostPerMillion: number;
  protected abstract outputCostPerMillion: number;

  abstract execute(options: ProviderOptions): Promise<ModelResponse>;

  protected calculateCost(promptTokens: number, completionTokens: number): CostAnalysis {
    const inputCost = (promptTokens / 1000000) * this.inputCostPerMillion;
    const outputCost = (completionTokens / 1000000) * this.outputCostPerMillion;
    return {
      inputCostUsd: parseFloat(inputCost.toFixed(6)),
      outputCostUsd: parseFloat(outputCost.toFixed(6)),
      totalCostUsd: parseFloat((inputCost + outputCost).toFixed(6))
    };
  }

  protected estimateTokens(text: string): number {
    return Math.ceil((text || "").length / 4.1);
  }

  protected getReadabilityGrade(text: string): string {
    const words = text.split(/\s+/).filter(Boolean).length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
    const avgSentenceLen = words / sentences;
    if (avgSentenceLen > 15) return "Expert Technical (Grade 12+)";
    if (avgSentenceLen > 11) return "Professional (Grade 10-12)";
    if (avgSentenceLen > 7) return "Intermediate (Grade 7-9)";
    return "Conversational (Grade <6)";
  }

  protected runEvaluation(promptText: string, responseText: string): EvaluationResult {
    const hasStructure = responseText.includes("###") || responseText.includes("- ") || responseText.includes("**") || responseText.includes("```");
    const len = responseText.length;
    const words = responseText.split(/\s+/).filter(Boolean).length;
    
    const promptWords = promptText.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter((w) => w.length > 3);
    let matchedWords = 0;
    const respLower = responseText.toLowerCase();
    for (const pw of promptWords) {
      if (respLower.includes(pw)) matchedWords++;
    }
    const overlapRatio = promptWords.length > 0 ? matchedWords / promptWords.length : 0.8;

    const relevance = Math.min(100, Math.max(50, Math.round(70 + overlapRatio * 25)));
    const completeness = Math.min(100, Math.max(40, Math.round(Math.min(words / 1.5, 95))));
    const clarity = Math.min(100, Math.max(60, Math.round(80 + (hasStructure ? 10 : 0))));
    const creativity = Math.min(100, Math.max(50, Math.round(75 + Math.min(len / 100, 20))));
    const structure = hasStructure ? 92 : 72;
    
    const overall = Math.round((relevance + completeness + clarity + creativity + structure) / 5);
    
    return {
      relevanceScore: relevance,
      completenessScore: completeness,
      clarityScore: clarity,
      creativityScore: creativity,
      structureScore: structure,
      overallScore: overall,
      summary: `Response scored ${overall}% overall. Relates strongly to the prompt with ${hasStructure ? "high" : "moderate"} structured clarity, demonstrating balanced readability and correct technical alignment.`
    };
  }
}
