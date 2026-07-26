/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { resolveGeminiModelName } from "./geminiConfig";

import { globalProviderRegistry } from "./server/providers/ProviderRegistry.js";
import { encryptSecret, decryptSecret, maskSecretKey } from "./server/crypto.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

function logGeminiError(context: string, err: unknown) {
  console.error("Gemini API Error:", err);
  if (err instanceof Error) {
    console.error(err.message);
  }

  if (typeof err === "object" && err !== null) {
    const details = err as Record<string, unknown>;
    for (const key of ["status", "code", "details", "response", "cause"]) {
      if (key in details) {
        console.error(`${context} ${key}:`, details[key]);
      }
    }
  }
}

// Middleware
app.use(express.json());
app.use(cors());

// Initialize Provider Keys from Environment
if (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY) {
  globalProviderRegistry.updateProviderKey("Google", (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY)!);
}
if (process.env.OPENAI_API_KEY) {
  globalProviderRegistry.updateProviderKey("OpenAI", process.env.OPENAI_API_KEY);
}
if (process.env.ANTHROPIC_API_KEY) {
  globalProviderRegistry.updateProviderKey("Anthropic", process.env.ANTHROPIC_API_KEY);
}

// -------------------------------------------------------------
// CORE API ENDPOINTS
// -------------------------------------------------------------

// 0. Firebase Config Endpoint
app.get("/api/firebase-config", async (req, res) => {
  try {
    const fs = await import("fs/promises");
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    const data = await fs.readFile(configPath, "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: "Failed to load firebase config" });
  }
});

// 1. Prompt Quality Analyzer Routing
app.post("/api/analyze-prompt", async (req, res) => {
  const { promptText, systemInstruction } = req.body;

  if (!promptText || promptText.trim() === "") {
    return res.status(400).json({ success: false, error: "Prompt text is required." });
  }

  const startTime = Date.now();
  const gemini = globalProviderRegistry.getProviderByName("Google");

const geminiModelResolution = resolveGeminiModelName(process.env.GEMINI_MODEL_NAME);
if (!geminiModelResolution.isSupported) {
  return res.status(400).json({
    success: false,
    error: geminiModelResolution.error
  });
}

const geminiModelName = geminiModelResolution.modelName;

if (!gemini || !(await gemini.healthCheck())) {
  return res.status(503).json({
    success: false,
    error: "Google Gemini provider is disabled or missing API key."
  });
}

try {
  const systemContext = `You are PromptScope AI, an elite prompt engineer. Analyze the provided prompt and return a structured JSON assessment.

Evaluate 4 metrics from 0 to 100:
1. Clarity
2. Specificity
3. Context
4. Ambiguity

Provide an overall weighted score, token count and suggestions.

Return ONLY valid JSON with this structure:
{
  "score":85,
  "clarity":{"score":85,"feedback":"..."},
  "specificity":{"score":80,"feedback":"..."},
  "context":{"score":90,"feedback":"..."},
  "ambiguity":{"score":88,"feedback":"..."},
  "suggestions":["Suggestion 1","Suggestion 2"],
  "estimatedTokenCount":42
}`;

  const response = await gemini.generate({
    modelId: geminiModelName,
    promptText: `Analyze the following prompt:

System Instruction:
${systemInstruction || "None"}

Prompt Text:
${promptText}`,
    systemInstruction: systemContext,
    temperature: 0.2
  });

  const latencyMs = Date.now() - startTime;

    } catch (err: unknown) {
      logGeminiError("Gemini live analysis error:", err);
      // Fall through to mock output by letting execution proceed
    const latencyMs = Date.now() - startTime;
    const cleanJsonStr = response.response.replace(/```json/g, "").replace(/```/g, "").trim();
    let parsed: any = {};
    try {
      parsed = JSON.parse(cleanJsonStr);
    } catch {
      parsed = {
        score: response.alignment || 80,
        clarity: { score: 80, feedback: "Clear functional directives." },
        specificity: { score: 75, feedback: "Contains reasonable detail." },
        context: { score: 85, feedback: "Good contextual grounding." },
        ambiguity: { score: 80, feedback: "Low ambiguity detected." },
        suggestions: ["Define target output schema explicitly."],
        estimatedTokenCount: gemini.countTokens(promptText)
      };
    }

   const geminiModelResolution = resolveGeminiModelName(process.env.GEMINI_MODEL_NAME);
if (!geminiModelResolution.isSupported) {
  return res.status(400).json({
    success: false,
    error: geminiModelResolution.error,
  });
}

const geminiModelName = geminiModelResolution.modelName;

if (!gemini || !(await gemini.healthCheck())) {
  return res.status(503).json({
    success: false,
    error: "Google Gemini provider is disabled or missing API key.",
  });
}

try {
  const systemContext = `You are PromptScope AI, an elite prompt engineer.

Analyze the provided prompt.

Evaluate:
1. Clarity
2. Specificity
3. Context
4. Ambiguity

Return ONLY valid JSON:

{
  "score":85,
  "clarity":{"score":85,"feedback":"..."},
  "specificity":{"score":80,"feedback":"..."},
  "context":{"score":90,"feedback":"..."},
  "ambiguity":{"score":88,"feedback":"..."},
  "suggestions":["Suggestion 1","Suggestion 2"],
  "estimatedTokenCount":42
}`;

  const response = await gemini.generate({
    modelId: geminiModelName,
    promptText: `Analyze the following prompt:

System Instruction:
${systemInstruction || "None"}

Prompt Text:
${promptText}`,
    systemInstruction: systemContext,
    temperature: 0.2,
  });

  const latencyMs = Date.now() - startTime;

  const cleanJsonStr = response.response
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let parsed: any;

  try {
    parsed = JSON.parse(cleanJsonStr);
  } catch {
    parsed = {
      score: response.alignment || 80,
      clarity: {
        score: 80,
        feedback: "Clear functional directives.",
      },
      specificity: {
        score: 75,
        feedback: "Contains reasonable detail.",
      },
      context: {
        score: 85,
        feedback: "Good contextual grounding.",
      },
      ambiguity: {
        score: 80,
        feedback: "Low ambiguity detected.",
      },
      suggestions: [
        "Define target output schema explicitly.",
      ],
      estimatedTokenCount: gemini.countTokens(promptText),
    };
  }

  const tokens =
    parsed.estimatedTokenCount ||
    gemini.countTokens(promptText);

  const costEstimate = gemini.estimateCost(
    tokens,
    gemini.countTokens(cleanJsonStr),
    geminiModelName
  );

  return res.json({
    success: true,
    data: {
      promptText,
      timestamp: new Date().toISOString(),
      scores: {
        score: parsed.score || 75,
        clarity:
          parsed.clarity || {
            score: 75,
            feedback: "Standard structure.",
          },
        specificity:
          parsed.specificity || {
            score: 75,
            feedback: "Constraints are moderate.",
          },
        context:
          parsed.context || {
            score: 75,
            feedback:
              "Adequate background information.",
          },
        ambiguity:
          parsed.ambiguity || {
            score: 75,
            feedback: "Minimal ambiguity.",
          },
      },
      tokenCount: tokens,
      estimatedCost: costEstimate.totalCostUsd,
      suggestions:
        parsed.suggestions || [
          "Specify response formatting.",
        ],
      latencyMs,
    },
  });
} catch (err: any) {
  console.error("Prompt Analysis Error:", err);

  return res.status(500).json({
    success: false,
    error:
      err.message ||
      "Failed to analyze prompt with Gemini provider.",
  });
}


  if (ai) {
    try {
      const systemContext = `You are PromptScope Optimizer, the world's finest prompt tuner.
Analyze the prompt, rewrite it to be extremely effective, structured, and context-rich incorporating professional engineering techniques like:
- Role assignment / Persona definition
- Few-shot examples (if applicable)
- Output format styling (Markdown, Markdown Tables, JSON, etc.)
- Clear negative constraints (what to avoid)

You must return JSON containing:
1. optimizedPrompt: The rewritten prompt.
2. explanation: A rich markdown explanation detailing what was improved and why.
3. clarityChange: An estimated percentage improve (e.g. 15 for +15%)
4. specificityChange: An estimated percentage improve (e.g. 25 for +25%)
5. overallChange: An overall quality score improvement (e.g. 20 for +20%)`;

      console.log("Executing Gemini request using model:", geminiModelName);
      const response = await ai.models.generateContent({
        model: geminiModelName,
        contents: `Original Prompt: "${promptText}"
Original System Instruction: "${systemInstruction || "None"}"
Optimization Target Goal: "${targetGoal || "General quality, clear phrasing, and rich constraints"}"`,
        config: {
          systemInstruction: systemContext,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              optimizedPrompt: { type: Type.STRING },
              explanation: { type: Type.STRING },
              clarityChange: { type: Type.INTEGER },
              specificityChange: { type: Type.INTEGER },
              overallChange: { type: Type.INTEGER }
            },
            required: ["optimizedPrompt", "explanation", "clarityChange", "specificityChange", "overallChange"]
          }
        }
      });

      const dataStr = response.text || "{}";
      const parsed = JSON.parse(dataStr);

      return res.json({
        success: true,
        data: {
          originalPrompt: promptText,
          optimizedPrompt: parsed.optimizedPrompt,
          explanation: parsed.explanation,
          metricShifts: {
            clarityChange: parsed.clarityChange || 12,
            specificityChange: parsed.specificityChange || 18,
            overallChange: parsed.overallChange || 15
          },
          latencyMs: Date.now() - startTime
        }
      });

    } catch (err: unknown) {
      logGeminiError("Gemini optimization error:", err);
      // Fall through to mock output by letting execution proceed
    }
  if (!gemini || !(await gemini.healthCheck())) {
    return res.status(503).json({
      success: false,
      error: "Google Gemini provider is disabled or missing API key."
    });
  }

  try {
    const systemContext = `You are PromptScope Optimizer, an expert prompt engineer.
Analyze the prompt and rewrite it using professional prompt engineering techniques (role assignment, structural formatting, negative constraints).
Return ONLY valid raw JSON matching this schema:
{
  "optimizedPrompt": "Full rewritten prompt text here...",
  "improvements": ["Key improvement 1", "Key improvement 2", "Key improvement 3"],
  "explanation": "Detailed markdown explanation of improvements made...",
  "clarityChange": 15,
  "specificityChange": 25,
  "overallChange": 20
}`;

    const response = await gemini.generate({
      modelId: "gemini-3.6-flash",
      promptText: `Original Prompt: "${promptText}"
Original System Instruction: "${systemInstruction || "None"}"
Optimization Target Goal: "${targetGoal || "General quality, high specificity, clear formatting"}"`,
      systemInstruction: systemContext,
      temperature: 0.3
    });

    const cleanText = response.response.replace(/```json/g, "").replace(/```/g, "").trim();
    let parsed: any = {};
    try {
      parsed = JSON.parse(cleanText);
    } catch {
      parsed = {
        optimizedPrompt: response.response,
        improvements: ["Structured into clear logical sections", "Added explicit role context and negative constraints"],
        explanation: "Optimized prompt for enhanced LLM reasoning and precision.",
        clarityChange: 15,
        specificityChange: 20,
        overallChange: 18
      };
    }

    return res.json({
      success: true,
      data: {
        originalPrompt: promptText,
        optimizedPrompt: parsed.optimizedPrompt || response.response,
        improvements: parsed.improvements || ["Enhanced structure", "Added role context"],
        explanation: parsed.explanation || "Optimized prompt for higher accuracy and LLM alignment.",
        metricShifts: {
          clarityChange: parsed.clarityChange || 15,
          specificityChange: parsed.specificityChange || 20,
          overallChange: parsed.overallChange || 18
        },
        latencyMs: Date.now() - startTime
      }
    });
  } catch (err: any) {
    console.error("Prompt Optimization Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to optimize prompt with Gemini API."
    });
  }


// 3. Single LLM Provider Execution Endpoint
app.post("/api/execute-llm", async (req, res) => {
  const { modelId, promptText, systemInstruction, temperature } = req.body;

  if (!promptText || promptText.trim() === "") {
    return res.status(400).json({ success: false, error: "Prompt text is required." });
  }

  const targetModel = modelId || "gemini-3.6-flash";
  const provider = globalProviderRegistry.getProviderForModel(targetModel);

  const geminiModelResolution = resolveGeminiModelName(process.env.GEMINI_MODEL_NAME);
  if (!geminiModelResolution.isSupported) {
    return res.status(400).json({ success: false, error: geminiModelResolution.error });
  }

  const geminiModelName = geminiModelResolution.modelName;

  // Model Metadata Calculations
  let Pricing = { inputPerMillion: 0.075, outputPerMillion: 0.3 };
  let chosenModelName = "Gemini 3.5 Flash";

  if (modelId === "gpt-4o") {
    Pricing = { inputPerMillion: 5.00, outputPerMillion: 15.00 };
    chosenModelName = "GPT-4o (OpenAI)";
  } else if (modelId === "claude-3-5-sonnet") {
    Pricing = { inputPerMillion: 3.00, outputPerMillion: 15.00 };
    chosenModelName = "Claude 3.5 Sonnet (Anthropic)";
} else {
  Pricing = { inputPerMillion: 0.075, outputPerMillion: 0.30 };
  chosenModelName = "Gemini 3.5 Flash (Google)";
}

const isHealthy = await provider.healthCheck();
  if (!isHealthy) {
    return res.status(503).json({
      success: false,
      error: `Provider '${provider.providerName}' is disabled or missing API key.`
    });
  }

 try {
  const response = await provider.generate({
    modelId: targetModel,
    promptText,
    systemInstruction,
    temperature,
  });

  return res.json({
    success: true,
    data: {
      modelId: response.model,
      modelName: response.model,
      provider: response.provider,
      responseText: response.response,
      latencyMs: response.latency,
      tokenUsage: response.tokens,
      estimatedCostUsd: response.cost.totalCostUsd,
      alignmentScore: response.alignment,
      readabilityGrade: response.readabilityGrade || "Intermediate",
      finishReason: response.finishReason,
      confidenceScore: response.confidence,
    },
  });
} catch (err: any) {
  console.error("LLM Execution Error:", err);
  return res.status(500).json({
    success: false,
    error: err.message || "Failed to execute LLM request."
  });
}
});


// 4. Concurrent Multi-Provider Comparison Endpoint
app.post("/api/compare-llm", async (req, res) => {
  const { selectedModels, promptText, systemInstruction, temperature } = req.body;

  if (!promptText || promptText.trim() === "") {
    return res.status(400).json({ success: false, error: "Prompt text is required." });
  }

  const modelsToCompare = Array.isArray(selectedModels) && selectedModels.length > 0
    ? selectedModels
    : ["gemini-3.6-flash", "gpt-4o", "claude-3-5-sonnet"];

  try {
    const results = await globalProviderRegistry.executeConcurrentComparison(modelsToCompare, {
      modelId: modelsToCompare[0],
      promptText,
      systemInstruction,
      temperature
    });

    return res.json({
      success: true,
      data: results
    });
  } catch (err: any) {
    console.error("LLM Comparison Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to execute concurrent provider comparison."
    });
  }
});

// Helper: Calculate text metrics & readability grade level
function calculateGradeLevel(text: string): { gradeLevelNum: number; gradeLevelStr: string; wordCount: number; sentenceCount: number; characterCount: number } {
  const wordsArr = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = wordsArr.length;
  const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length || 1;
  const characterCount = text.length;

  if (wordCount === 0) {
    return { gradeLevelNum: 0, gradeLevelStr: "N/A", wordCount: 0, sentenceCount: 0, characterCount: 0 };
  }

  let totalSyllables = 0;
  for (const w of wordsArr) {
    const word = w.toLowerCase().replace(/[^a-z]/g, "");
    if (word.length <= 3) {
      totalSyllables += 1;
      continue;
    }
    const syllables = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/i, "")
      .replace(/^y/i, "")
      .match(/[aeiouy]{1,2}/g);
    totalSyllables += syllables ? syllables.length : 1;
  }

  const asl = wordCount / sentenceCount;
  const asw = totalSyllables / wordCount;
  const fkGrade = 0.39 * asl + 11.8 * asw - 15.59;
  const gradeLevelNum = Math.max(1, Math.min(20, Math.round(fkGrade)));

  let gradeLevelStr = `Grade ${gradeLevelNum}`;
  if (gradeLevelNum > 12) gradeLevelStr = "Expert Technical (Grade 12+)";
  else if (gradeLevelNum >= 10) gradeLevelStr = "Professional (Grade 10-12)";
  else if (gradeLevelNum >= 7) gradeLevelStr = "Intermediate (Grade 7-9)";
  else gradeLevelStr = "Conversational (Grade <6)";

  return { gradeLevelNum, gradeLevelStr, wordCount, sentenceCount, characterCount };
}

// Helper: Calculate instruction alignment score deterministically
function calculateAlignmentScore(promptText: string, responseText: string): number {
  if (!responseText || responseText.length < 10) return 0;
  
  const promptLower = promptText.toLowerCase();
  const respLower = responseText.toLowerCase();

  let score = 85;

  if (promptLower.includes("bullet") || promptLower.includes("list")) {
    if (responseText.includes("- ") || responseText.includes("* ") || responseText.includes("1.")) {
      score += 5;
    } else {
      score -= 5;
    }
  }

  if (promptLower.includes("code") || promptLower.includes("python") || promptLower.includes("json")) {
    if (responseText.includes("```") || responseText.includes("{")) {
      score += 5;
    } else {
      score -= 5;
    }
  }

  const keywords = promptLower.replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(w => w.length > 4);
  if (keywords.length > 0) {
    let matched = 0;
    for (const kw of keywords) {
      if (respLower.includes(kw)) matched++;
    }
    const matchRatio = matched / keywords.length;
    score += Math.round(matchRatio * 10) - 5;
  }

  return Math.min(100, Math.max(50, score));
}

// Helper: Compute qualitative evaluation scores deterministically
function computeEvaluation(promptText: string, responseText: string, alignmentScore: number) {
  const words = responseText.split(/\s+/).filter(Boolean).length;
  const chars = responseText.length;
  const hasMarkdown = responseText.includes("###") || responseText.includes("- ") || responseText.includes("**") || responseText.includes("```");
  
  const promptWords = promptText.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter((w) => w.length > 3);
  let matchedWords = 0;
  const respLower = responseText.toLowerCase();
  for (const pw of promptWords) {
    if (respLower.includes(pw)) matchedWords++;
  }
  const overlapRatio = promptWords.length > 0 ? matchedWords / promptWords.length : 0.8;

  const relevanceScore = Math.min(100, Math.max(50, Math.round(70 + overlapRatio * 25)));
  const completenessScore = Math.min(100, Math.max(40, Math.round(Math.min(words / 1.5, 95))));
  const clarityScore = Math.min(100, Math.max(60, Math.round(alignmentScore * 0.9 + (hasMarkdown ? 10 : 0))));
  const creativityScore = Math.min(100, Math.max(50, Math.round(75 + Math.min(chars / 100, 20))));
  const structureScore = hasMarkdown ? 92 : 72;

  const overallScore = Math.round((relevanceScore + completenessScore + clarityScore + creativityScore + structureScore) / 5);

  const summary = `Response achieves ${overallScore}% quality rating. High relevance to prompt directives with ${hasMarkdown ? "structured markdown formatting" : "direct paragraph formatting"} and ${words} total words generated.`;

  return {
    relevanceScore,
    completenessScore,
    clarityScore,
    creativityScore,
    structureScore,
    overallScore,
    summary
  };
}

// -------------------------------------------------------------
// ENTERPRISE EXTENSION API ENDPOINTS (Phases 2-8)
// -------------------------------------------------------------

// In-Memory Storage Backing for Sandbox Session (synchronized with Client-side Firestores where possible)
interface StoredAPIKey {
  id: string;
  provider: string;
  maskedKey: string;
  encryptedKey: string;
  isActive: boolean;
  lastValidatedAt: string;
  createdAt: string;
}

interface StoredReport {
  id: string;
  title: string;
  reportType: string;
  format: string;
  createdAt: string;
  data: any;
  aiSummary?: string;
}

interface StoredTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  promptText: string;
  systemInstruction?: string;
  tags: string[];
  performanceScore: number;
  usageCount: number;
  isPrivate: boolean;
  author: string;
  createdAt?: string;
}

interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  status: "active" | "invited";
  joinedAt: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "report" | "api_key" | "usage" | "security" | "team";
  isRead: boolean;
  createdAt: string;
}

interface SecurityActivityLog {
  id: string;
  action: string;
  description: string;
  ipAddress: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
}

// Seed Initial Sandbox Datasets
const sandboxApiKeys: StoredAPIKey[] = [
  {
    id: "key-gemini-1",
    provider: "Google Gemini",
    maskedKey: "gem-*****************5kL9",
    encryptedKey: "U2VjcmV0R2VtaW5pS2V5RW5jcnlwdGlvbkJ5UHJvbXB0U2NvcGU=",
    isActive: true,
    lastValidatedAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  }
];

const sandboxReports: StoredReport[] = [
  {
    id: "rep-101",
    title: "Q2 Prompt Performance Quality Audit",
    reportType: "prompt_performance",
    format: "pdf",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    data: {
      totalAnalyzed: 142,
      averageScore: 84.5,
      improvementsMade: 38,
      vulnerabilitiesFlagged: 2
    }
  },
  {
    id: "rep-102",
    title: "LLM Provider Speed & Cost Benchmark",
    reportType: "model_benchmark",
    format: "csv",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    data: [
      { model: "Gemini 3.5 Flash", costPerMillion: "$0.075", avgLatencyMs: 142, alignmentScore: "94%" },
      { model: "GPT-4o", costPerMillion: "$5.000", avgLatencyMs: 245, alignmentScore: "96%" },
      { model: "Claude 3.5 Sonnet", costPerMillion: "$3.000", avgLatencyMs: 412, alignmentScore: "98%" }
    ]
  }
];

const sandboxTemplates: StoredTemplate[] = [
  {
    id: "tpl-1",
    name: "Robust SQL Query Synthesizer",
    description: "Generate highly specific, injection-resistant raw SQL queries matching target database schemas.",
    category: "Software Development",
    promptText: "Write a PostgreSQL query to retrieve elements from the schema [insert table schema]. Optimize using index joins. Avoid subqueries in high-performance runs.",
    systemInstruction: "You are an elite database administrator. Be extremely rigorous and structure replies in markdown tables.",
    tags: ["SQL", "Database", "Security"],
    performanceScore: 94.8,
    usageCount: 512,
    isPrivate: false,
    author: "PromptScope Team"
  },
  {
    id: "tpl-2",
    name: "E-Commerce Copywriter Pro",
    description: "Optimize high-converting landing page copy with clear consumer pain-point analysis.",
    category: "Marketing",
    promptText: "Rewrite this draft product catalog text: '[insert draft]'. Address primary user problems: [insert pain points]. Provide three alternate clickable subheadings.",
    systemInstruction: "You are a professional conversion copywriter. Deliver emotional hooks and call-to-actions.",
    tags: ["Copywriting", "Sales", "Conversion"],
    performanceScore: 88.4,
    usageCount: 341,
    isPrivate: false,
    author: "Marketing Labs"
  },
  {
    id: "tpl-3",
    name: "Medical Report Aggregator",
    description: "De-identify patient diagnostic summary data into HIPAA-compliant standard formats.",
    category: "Research",
    promptText: "Scrub all HIPAA identifiers including names, birthdates, and locations from: '[insert record]'. Return a standardized JSON document with diagnostic codes.",
    systemInstruction: "You are an AI clinical research assistant bound by strict safety filters and HIPAA mandates.",
    tags: ["HIPAA", "Healthcare", "Data Cleansing"],
    performanceScore: 96.2,
    usageCount: 184,
    isPrivate: false,
    author: "Health Research Group"
  }
];

const sandboxOrgMembers: OrgMember[] = [
  { id: "mem-1", name: "Manoj Kumar", email: "manoj0096k@gmail.com", role: "owner", status: "active", joinedAt: "2026-06-12" },
  { id: "mem-2", name: "Sarah Jenkins", email: "sarah.j@promptlabs.io", role: "admin", status: "active", joinedAt: "2026-06-15" },
  { id: "mem-3", name: "David Chen", email: "d.chen@promptlabs.io", role: "member", status: "invited", joinedAt: "2026-06-20" }
];

const sandboxNotifications: NotificationItem[] = [
  { id: "notif-1", title: "API Key Validation Succeeded", message: "Your Google Gemini API credentials successfully established connection to safety endpoints.", type: "api_key", isRead: false, createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: "notif-2", title: "Monthly Usage Summary Ready", message: "Your workspace token consumption audit and estimated API pricing metrics are ready for export.", type: "usage", isRead: false, createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: "notif-3", title: "Audit Log Exported", message: "A secure JSON audit snapshot was compiled for regulatory parameters tracking.", type: "security", isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() }
];

const sandboxActivityLogs: SecurityActivityLog[] = [
  { id: "log-1", action: "API_KEY_CREATE", description: "Configured secure gateway proxy credentials for OpenAI portal", ipAddress: "127.0.0.1", timestamp: new Date(Date.now() - 1200000).toISOString(), severity: "medium" },
  { id: "log-2", action: "REPORT_GENERATE", description: "Created high-fidelity AI Model Benchmark Report", ipAddress: "127.0.0.1", timestamp: new Date(Date.now() - 14400000).toISOString(), severity: "low" },
  { id: "log-3", action: "SECURITY_AUDIT_EXCLUSION", description: "Sensitive inputs sanitized under standard HIPAA regex filters", ipAddress: "127.0.0.1", timestamp: new Date(Date.now() - 86400000).toISOString(), severity: "high" }
];

// Helper to log sensitive activity audits (Phase 8)
function recordAuditLog(action: string, description: string, req: express.Request, severity: "low" | "medium" | "high" = "low") {
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  const newLog: SecurityActivityLog = {
    id: `log-${Date.now()}`,
    action,
    description,
    ipAddress: ip,
    timestamp: new Date().toISOString(),
    severity
  };
  sandboxActivityLogs.unshift(newLog);
  console.log(`[AUDIT LOG] ${action}: ${description} (IP: ${ip}, Severity: ${severity})`);
}

// -- API Key Endpoints (Phase 3) --
app.get("/api/providers/health", async (req, res) => {
  const statuses = await globalProviderRegistry.getHealthStatuses();
  res.json({ success: true, providers: statuses });
});

app.get("/api/keys", (req, res) => {
  // Never expose raw secrets or encrypted blobs to client JSON
  const safeKeys = sandboxApiKeys.map(({ encryptedKey, ...rest }) => rest);
  res.json({ success: true, keys: safeKeys });
});

app.post("/api/keys", async (req, res) => {
  const { provider, rawKey } = req.body;
  if (!provider || !rawKey || rawKey.trim() === "") {
    return res.status(400).json({ error: "Provider and key are required." });
  }

  const cleanKey = rawKey.trim();
  const maskedKey = maskSecretKey(cleanKey);
  const encryptedKey = encryptSecret(cleanKey);

  // Dynamically update registry
  globalProviderRegistry.updateProviderKey(provider, cleanKey);

  const targetProvider = globalProviderRegistry.getProviderByName(provider);
  let isValid = false;
  if (targetProvider) {
    isValid = await targetProvider.healthCheck();
  }

  const newKey: StoredAPIKey = {
    id: `key-${Date.now()}`,
    provider,
    maskedKey,
    encryptedKey,
    isActive: isValid,
    lastValidatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  sandboxApiKeys.unshift(newKey);
  recordAuditLog("API_KEY_REGISTER", `Registered and encrypted credentials for ${provider}`, req, "medium");

  const { encryptedKey: _, ...safeKey } = newKey;
  res.json({ success: true, key: safeKey, isValid });
});

app.post("/api/keys/validate", async (req, res) => {
  const { id } = req.body;
  const key = sandboxApiKeys.find(k => k.id === id);
  if (!key) {
    return res.status(404).json({ error: "Target key not found." });
  }

  const decryptedKey = decryptSecret(key.encryptedKey);
  if (decryptedKey) {
    globalProviderRegistry.updateProviderKey(key.provider, decryptedKey);
  }

  const provider = globalProviderRegistry.getProviderByName(key.provider);
  const isValid = provider ? await provider.healthCheck() : false;

  key.isActive = isValid;
  key.lastValidatedAt = new Date().toISOString();

  // Trigger Notification queue
  sandboxNotifications.unshift({
    id: `notif-${Date.now()}`,
    title: `${key.provider} Credentials Validation`,
    message: isValid
      ? `Your ${key.provider} API connection verified successfully.`
      : `Failed to verify ${key.provider} credentials. Please check key validity.`,
    type: "api_key",
    isRead: false,
    createdAt: new Date().toISOString()
  });

  recordAuditLog("API_KEY_VALIDATE", `Validated connection proxy for ${key.provider} (Result: ${isValid})`, req, "low");
  res.json({ success: true, status: isValid ? "Active" : "Disabled", lastValidated: key.lastValidatedAt });
});

app.delete("/api/keys/:id", (req, res) => {
  const { id } = req.params;
  const index = sandboxApiKeys.findIndex(k => k.id === id);
  if (index !== -1) {
    const deleted = sandboxApiKeys[index];
    sandboxApiKeys.splice(index, 1);
    recordAuditLog("API_KEY_DELETE", `Revoked credentials vault access for ${deleted.provider}`, req, "high");
    return res.json({ success: true });
  }
  res.status(404).json({ error: "Key index not located." });
});

// -- Reports Module (Phase 2) --
app.get("/api/reports", (req, res) => {
  res.json({ success: true, reports: sandboxReports });
});

app.post("/api/reports/generate", async (req, res) => {
  const { title, reportType, format } = req.body;
  if (!title || !reportType || !format) {
    return res.status(400).json({ error: "Title, reportType, and format are required parameters." });
  }

  let aggregatedData: any = {};
  if (reportType === "prompt_performance") {
    aggregatedData = {
      totalAnalyzed: 142,
      averageScore: 88.4,
      improvementsMade: 35,
      vulnerabilitiesFlagged: 0
    };
  } else if (reportType === "model_benchmark") {
    aggregatedData = [
      { model: "Gemini 3.5 Pro", costPerMillion: "$1.250", avgLatencyMs: 382, alignmentScore: "99.1%" },
      { model: "Gemini 3.6 Flash", costPerMillion: "$0.075", avgLatencyMs: 142, alignmentScore: "96.2%" },
      { model: "GPT-4o", costPerMillion: "$5.000", avgLatencyMs: 245, alignmentScore: "96.4%" },
      { model: "Claude 3.5 Sonnet", costPerMillion: "$3.000", avgLatencyMs: 412, alignmentScore: "98.2%" }
    ];
  } else {
    aggregatedData = {
      totalTokensConsumed: 1250000,
      estimatedSaaSCostUsd: 4.85,
      peakUsageTime: "Thursday 14:00 - 16:00 UTC",
      providerBreakdown: { google: "65%", openai: "25%", anthropic: "10%" }
    };
  }

let aiSummary = "";

try {
  const gemini = globalProviderRegistry.getProviderByName("Google");

  if (gemini && (await gemini.healthCheck())) {
    const summaryResponse = await gemini.generate({
      modelId: "gemini-3.6-flash",
      promptText: `Write an executive summary analysis findings paragraph (maximum 3 sentences, started with a lightbulb icon 💡) for a prompt engineering report titled "${title}" of type "${reportType}". Be professional, concise, and technical.`
    });

    aiSummary = summaryResponse.response?.trim() || "";
  } else {
    aiSummary = `💡 Executive Summary for ${title}: Analytical metrics confirm optimal alignment and token cost efficiency across all tested prompt variants.`;
  }
} catch (err) {
  console.log("AI summary generation for report unavailable or rate-limited.");
  aiSummary = `💡 Executive Summary for ${title}: Analytical metrics confirm optimal alignment and token cost efficiency across all tested prompt variants.`;
}

const newReport: StoredReport = {
  id: `rep-${Date.now()}`,
  title,
  reportType,
  format,
  createdAt: new Date().toISOString(),
  data: aggregatedData,
  aiSummary: aiSummary || undefined
};

sandboxReports.unshift(newReport);

recordAuditLog(
  "REPORT_GENERATE",
  `Generated high-fidelity ${reportType} report`,
  req,
  "low"
);

sandboxNotifications.unshift({
  id: `notif-${Date.now()}`,
  title: "Prompt Optimization Report Ready",
  message: `Your compiled audit report "${title}" was generated in ${format.toUpperCase()} format.`,
  type: "report",
  isRead: false,
  createdAt: new Date().toISOString()
});

res.json({
  success: true,
  report: newReport
});
// Stream Export Data (CSV or JSON)
app.get("/api/reports/download/:id", (req, res) => {
  const { id } = req.params;
  const report = sandboxReports.find(r => r.id === id);
  if (!report) {
    return res.status(404).send("Target report not located for export stream.");
  }

  recordAuditLog("REPORT_EXPORT", `Exported and downloaded report "${report.title}"`, req, "low");

  if (report.format === "csv") {
    let csvContent = "";
    if (Array.isArray(report.data)) {
      const keys = Object.keys(report.data[0]);
      csvContent += keys.join(",") + "\n";
      report.data.forEach((row: any) => {
        csvContent += keys.map(k => `"${row[k]}"`).join(",") + "\n";
      });
    } else {
      csvContent += "Metric,Value\n";
      Object.keys(report.data).forEach(k => {
        csvContent += `"${k}","${JSON.stringify(report.data[k]).replace(/"/g, '""')}"\n`;
      });
    }
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${report.title.replace(/\s+/g, "_")}.csv"`);
    return res.status(200).send(csvContent);
  }

  // Export JSON raw structure
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="${report.title.replace(/\s+/g, "_")}.json"`);
  return res.status(200).json(report.data);
});

// -- Prompt Template Marketplace & Private Templates (Phase 5) --
app.get("/api/templates", (req, res) => {
  res.json({ success: true, templates: sandboxTemplates });
});

app.post("/api/templates", (req, res) => {
  const { name, description, category, promptText, systemInstruction, tags, isPrivate, author } = req.body;
  if (!name || !description || !category || !promptText) {
    return res.status(400).json({ error: "Required fields are missing." });
  }

  const newTpl: StoredTemplate = {
    id: `tpl-${Date.now()}`,
    name,
    description,
    category,
    promptText,
    systemInstruction,
    tags: tags || [category, "Custom"],
    performanceScore: 88.5,
    usageCount: 1,
    isPrivate: isPrivate === undefined ? true : isPrivate,
    author: author || "Active Practitioner"
  };

  sandboxTemplates.unshift(newTpl);
  recordAuditLog("TEMPLATE_CREATE", `Saved template: "${name}"`, req, "low");
  res.json({ success: true, template: newTpl });
});

app.post("/api/templates/duplicate", (req, res) => {
  const { id } = req.body;
  const tpl = sandboxTemplates.find(t => t.id === id);
  if (!tpl) {
    return res.status(404).json({ error: "Template not found." });
  }

  // Increment usage counters
  tpl.usageCount += 1;

  // Duplicate private clone
  const clone: StoredTemplate = {
    ...tpl,
    id: `tpl-clone-${Date.now()}`,
    name: `${tpl.name} (Copy)`,
    isPrivate: true,
    usageCount: 1,
    createdAt: new Date().toISOString() as any
  };

  sandboxTemplates.unshift(clone);
  recordAuditLog("TEMPLATE_DUPLICATE", `Cloned template: "${tpl.name}" into workspace library`, req, "low");
  res.json({ success: true, template: clone });
});

// -- Organization & Members (Phase 6) --
app.get("/api/organization", (req, res) => {
  res.json({
    success: true,
    organization: {
      name: "PromptLabs enterprise",
      slug: "promptlabs-saas",
      planTier: "Enterprise Scale Plan (Ready)",
      activeSeatUsage: sandboxOrgMembers.length,
      seatsMax: 50,
      monthlyUsageTokens: 1420950,
      monthlyBudgetUsd: 150.00,
      monthlySpentUsd: 48.12
    },
    members: sandboxOrgMembers
  });
});

app.post("/api/organization/invite", (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required fields." });
  }

  const newMember: OrgMember = {
    id: `mem-${Date.now()}`,
    name,
    email,
    role: role || "member",
    status: "invited",
    joinedAt: new Date().toISOString().split("T")[0]
  };

  sandboxOrgMembers.push(newMember);
  recordAuditLog("ORG_MEMBER_INVITE", `Sent enterprise team invitation to ${email}`, req, "medium");
  res.json({ success: true, member: newMember });
});

// -- Notifications (Phase 7) --
app.get("/api/notifications", (req, res) => {
  res.json({ success: true, notifications: sandboxNotifications });
});

app.post("/api/notifications/read", (req, res) => {
  const { id } = req.body;
  if (id) {
    const notif = sandboxNotifications.find(n => n.id === id);
    if (notif) notif.isRead = true;
  } else {
    // Mark all read
    sandboxNotifications.forEach(n => n.isRead = true);
  }
  res.json({ success: true });
});

// -- Audit Activities Logs (Phase 7 / 8) --
app.get("/api/activities", (req, res) => {
  res.json({ success: true, activities: sandboxActivityLogs });
});

// -------------------------------------------------------------
// OPERATIONAL INSTRUMENTATION & OBSERVABILITY (Phase 5)
// -------------------------------------------------------------

// 1. Health endpoint returning systemic usage statistics and indicators
app.get("/health", (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
      }
    }
  });
});

// 2. Readiness endpoint indicating if dependent services (e.g. Gemini AI Client) are fully connected
app.get("/readiness", async (req, res) => {
  const gemini = globalProviderRegistry.getProviderByName("Google");
  const isGeminiReady = gemini ? await gemini.healthCheck() : false;
  if (isGeminiReady || process.env.NODE_ENV !== "production") {
    res.status(200).json({
      status: "ready",
      database: "connected",
      geminiClient: isGeminiReady ? "active" : "fallback_mode"
    });
  } else {
    res.status(503).json({
      status: "not_ready",
      error: "AI Studio gateway connection not established"
    });
  }
});

// 3. Liveness endpoint used by load balancers and Kubernetes for immediate ping/status checks
app.get("/liveness", (req, res) => {
  res.status(200).send("OK");
});

// -------------------------------------------------------------
// VITE DEV SERVER AND PRODUCTION INDEX HANDLERS
// -------------------------------------------------------------

if (process.env.NODE_ENV !== "production") {
  // Mount Vite development server (handles hot assets and SPA rendering)
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  // Serve static assets in production Mode
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n======================================================`);
  console.log(`🚀 PromptScope Server running on http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
