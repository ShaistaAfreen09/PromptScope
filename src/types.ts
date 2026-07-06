/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  tags: string[];
  systemInstruction?: string;
  promptText: string;
  description: string;
  author: string;
}

export interface PromptVersion {
  versionId: string;
  promptId: string;
  versionNumber: number;
  promptText: string;
  systemInstruction?: string;
  changelog: string;
  createdAt: string;
}

export interface PromptItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  currentText: string;
  systemInstruction?: string;
  createdAt: string;
  updatedAt: string;
  versions: PromptVersion[];
  isFavorite?: boolean;
}

export interface PromptScoreBreakdown {
  score: number; // 0 - 100
  clarity: { score: number; feedback: string };
  specificity: { score: number; feedback: string };
  context: { score: number; feedback: string };
  ambiguity: { score: number; feedback: string };
}

export interface PromptAnalysis {
  promptText: string;
  timestamp: string;
  scores: PromptScoreBreakdown;
  tokenCount: number;
  estimatedCost: number; // USD cost for Gemini 3.5 Flash run
  suggestions: string[];
}

export interface PromptOptimization {
  originalPrompt: string;
  optimizedPrompt: string;
  explanation: string; // Markdown detailed explanation
  metricShifts: {
    clarityChange: number; // e.g. +15
    specificityChange: number; // e.g. +25
    overallChange: number; // e.g. +20
  };
}

export interface ModelResponseComparison {
  modelId: string;
  modelName: string;
  responseText: string;
  latencyMs: number;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  estimatedCostUsd: number;
  alignmentScore: number; // Score 0-100 of how well response complies with prompt instructions
  readabilityGrade: string; // Grade level or evaluation
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface CostAnalysis {
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
}

export interface EvaluationResult {
  relevanceScore: number; // 0 - 100
  completenessScore: number; // 0 - 100
  clarityScore: number; // 0 - 100
  creativityScore: number; // 0 - 100
  structureScore: number; // 0 - 100
  overallScore: number; // 0 - 100
  summary: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: "OpenAI" | "Google" | "Anthropic" | "Meta";
  capability: string;
  contextWindow: string;
  costLevel: "$" | "$$" | "$$$" | "$$$$";
  estimatedInputCostMillion: number;
  estimatedOutputCostMillion: number;
}

export interface ModelResponse {
  modelId: string;
  modelName: string;
  provider: string;
  responseText: string;
  latencyMs: number;
  tokenUsage: TokenUsage;
  costAnalysis: CostAnalysis;
  readabilityGrade: string;
  confidenceScore: number; // 0 - 100
  evaluation: EvaluationResult;
  isError?: boolean;
}

export interface PromptExecution {
  id: string;
  userId: string;
  promptText: string;
  systemInstruction?: string;
  category: string;
  timestamp: string;
  modelsUsed: string[];
  responses: ModelResponse[];
  averageLatencyMs: number;
  totalTokens: number;
  totalCostUsd: number;
  isFavorite?: boolean;
}

export interface PlatformConfig {
  defaultModel: string;
  sampleRate: number;
  enableTelemetry: boolean;
  costCeilingUsd: number;
}

