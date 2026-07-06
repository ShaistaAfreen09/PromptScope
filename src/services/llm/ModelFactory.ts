import { AIModel } from "../../types";
import { BaseProvider } from "./providers/BaseProvider";
import { GeminiProvider } from "./providers/GeminiProvider";
import { OpenAIProvider } from "./providers/OpenAIProvider";
import { ClaudeProvider } from "./providers/ClaudeProvider";

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    provider: "Google",
    capability: "Superfast generation, high precision, large context window",
    contextWindow: "1,000,000 tokens",
    costLevel: "$",
    estimatedInputCostMillion: 0.075,
    estimatedOutputCostMillion: 0.30
  },
  {
    id: "gemini-3.5-pro",
    name: "Gemini 3.5 Pro",
    provider: "Google",
    capability: "Complex logical reasoning, coding, multi-turn dialogue",
    contextWindow: "2,000,000 tokens",
    costLevel: "$$",
    estimatedInputCostMillion: 1.25,
    estimatedOutputCostMillion: 5.00
  },
  {
    id: "gpt-4o",
    name: "GPT-4o (Omni)",
    provider: "OpenAI",
    capability: "Industry standard intelligence, high conversational flow",
    contextWindow: "128,000 tokens",
    costLevel: "$$$",
    estimatedInputCostMillion: 5.00,
    estimatedOutputCostMillion: 15.00
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    capability: "Exquisite system steering, dense structured markdown prose",
    contextWindow: "200,000 tokens",
    costLevel: "$$$",
    estimatedInputCostMillion: 3.00,
    estimatedOutputCostMillion: 15.00
  }
];

export class ModelFactory {
  static getModelById(modelId: string): AIModel | undefined {
    return AVAILABLE_MODELS.find((m) => m.id === modelId);
  }

  static getProvider(modelId: string): BaseProvider {
    const model = this.getModelById(modelId);
    if (!model) {
      // Fallback
      return new GeminiProvider("gemini-3.5-flash");
    }

    switch (model.provider) {
      case "Google":
        return new GeminiProvider(modelId);
      case "OpenAI":
        return new OpenAIProvider(modelId);
      case "Anthropic":
        return new ClaudeProvider(modelId);
      default:
        return new GeminiProvider("gemini-3.5-flash");
    }
  }
}
