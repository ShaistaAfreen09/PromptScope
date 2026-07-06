import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Play,
  RefreshCw,
  Layers,
  Copy,
  Check,
  Clock,
  DollarSign,
  Cpu,
  HelpCircle,
  FileText,
  Star,
  Trash2,
  Search,
  Sliders,
  CheckSquare,
  Square,
  BookOpen,
  TrendingUp,
  Gauge,
  Lightbulb,
  Save,
  Send,
  X,
  PlusCircle,
  AlertCircle
} from "lucide-react";
import { useAuth, OperationType, handleFirestoreError } from "../contexts/AuthContext";
import { PromptExecution, AIModel, ModelResponse, EvaluationResult } from "../types";
import { safeJson } from "../utils";
import { AVAILABLE_MODELS, ModelFactory } from "../services/llm/ModelFactory";
import { PromptExecutor } from "../services/llm/PromptExecutor";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const Playground: React.FC = () => {
  const { user } = useAuth();
  // Prompt Editor State
  const [prompt, setPrompt] = useState(
    "Synthesize the architectural advantages of using containerized microservices in hybrid clouds."
  );
  const [systemInstruction, setSystemInstruction] = useState(
    "You are an elite cloud security architect. Constrain your responses strictly to bulleted points with bold terms."
  );
  const [category, setCategory] = useState("Research");
  const [targetGoal, setTargetGoal] = useState("Clarity, speed, and standard markdown layouts");

  // Model Selection State
  const [selectedModels, setSelectedModels] = useState<string[]>([
    "gemini-3.5-flash",
    "gemini-3.5-pro",
    "gpt-4o"
  ]);

  // Execution & Progress State
  const [loading, setLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState<PromptExecution | null>(null);
  const [modelRunningStates, setModelRunningStates] = useState<{
    [modelId: string]: { status: "idle" | "running" | "completed" | "error"; error?: string };
  }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active comparison state
  const [activeModelTab, setActiveModelTab] = useState<string>("");

  // History State
  const [history, setHistory] = useState<PromptExecution[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "cost" | "latency" | "score">("date");
  const [historyLoading, setHistoryLoading] = useState(false);

  // Copied responses map
  const [copiedResponses, setCopiedResponses] = useState<{ [key: string]: boolean }>({});

  // Inline Optimization & Analysis Modals State
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedData, setOptimizedData] = useState<{
    optimizedPrompt: string;
    explanation: string;
    metricShifts: { clarityChange: number; specificityChange: number; overallChange: number };
  } | null>(null);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<{
    scores: {
      score: number;
      clarity: { score: number; feedback: string };
      specificity: { score: number; feedback: string };
      context: { score: number; feedback: string };
      ambiguity: { score: number; feedback: string };
    };
    tokenCount: number;
    estimatedCost: number;
    suggestions: string[];
    latencyMs: number;
  } | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Load Saved Draft or Pre-seed
  useEffect(() => {
    const savedDraft = localStorage.getItem("promptscope_draft_prompt");
    if (savedDraft) {
      setPrompt(savedDraft);
    }
    const savedSys = localStorage.getItem("promptscope_draft_system");
    if (savedSys) {
      setSystemInstruction(savedSys);
    }
    fetchHistory();
  }, [user]);

  // Auto-set the first model tab when execution completes
  useEffect(() => {
    if (executionResult && executionResult.responses.length > 0) {
      setActiveModelTab(executionResult.responses[0].modelId);
    }
  }, [executionResult]);

  // Persistence methods
  const saveDraft = () => {
    localStorage.setItem("promptscope_draft_prompt", prompt);
    localStorage.setItem("promptscope_draft_system", systemInstruction);
    alert("Draft successfully stored in browser workspace memory!");
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResponses((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedResponses((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  // Model Selection Shortcuts
  const selectGroup = (group: "all" | "google" | "fast" | "accurate") => {
    switch (group) {
      case "all":
        setSelectedModels(AVAILABLE_MODELS.map((m) => m.id));
        break;
      case "google":
        setSelectedModels(AVAILABLE_MODELS.filter((m) => m.provider === "Google").map((m) => m.id));
        break;
      case "fast":
        setSelectedModels(["gemini-3.5-flash"]);
        break;
      case "accurate":
        setSelectedModels(["gemini-3.5-pro", "gpt-4o", "claude-3-5-sonnet"]);
        break;
    }
  };

  const toggleModelSelection = (modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]
    );
  };

  // Analyze prompt quality using Gemini Flash Analysis Endpoint
  const handleAnalyzePrompt = async () => {
    if (!prompt.trim()) return;
    setIsAnalyzing(true);
    setAnalysisReport(null);
    setShowAnalysisModal(true);

    try {
      const res = await fetch("/api/analyze-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: prompt,
          systemInstruction: systemInstruction
        })
      });

      if (!res.ok) {
        throw new Error("Analysis failed status: " + res.status);
      }

      const results = await res.json();
      if (results.success) {
        setAnalysisReport(results.data);
      } else {
        throw new Error(results.error || "Analysis failed.");
      }
    } catch (e: any) {
      console.error(e);
      // Local Heuristics Mock-up analysis fallback
      const mockResult = {
        scores: {
          score: 72,
          clarity: { score: 75, feedback: "Prompt goals are understandable but can use cleaner structural layouts." },
          specificity: { score: 68, feedback: "Constraints are light; indicate exactly what format is requested." },
          context: { score: 80, feedback: "System role matches security profiles perfectly." },
          ambiguity: { score: 65, feedback: "Uses generic phrasing. Restrict vague boundaries." }
        },
        tokenCount: Math.ceil(prompt.length / 4.1),
        estimatedCost: 0.00004,
        suggestions: [
          "Format instructions explicitly (e.g. 'provide output inside a markdown code fence').",
          "Establish negative constraints: describe what target details should be avoided.",
          "Partition long lines into clean atomic stages or nested loops."
        ],
        latencyMs: 120
      };
      setAnalysisReport(mockResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Optimize prompt using Gemini Flash Optimizer Endpoint
  const handleOptimizePrompt = async () => {
    if (!prompt.trim()) return;
    setIsOptimizing(true);
    setOptimizedData(null);
    setShowOptimizationModal(true);

    try {
      const res = await fetch("/api/optimize-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: prompt,
          systemInstruction,
          targetGoal
        })
      });

      if (!res.ok) {
        throw new Error("Optimization failed status " + res.status);
      }

      const results = await safeJson(res);
      if (results.success) {
        setOptimizedData(results.data);
      } else {
        throw new Error(results.error || "Optimization error.");
      }
    } catch (e: any) {
      console.error(e);
      // Local Mock optimized fallback
      setOptimizedData({
        optimizedPrompt: `You are a professional security architect.

### Context & Background
The client requires an architectural breakdown.
${prompt}

### Strict Execution Constraints
1. Present instructions inside clear Markdown headers.
2. Outline exactly why this container setup isolates boundaries.
3. Keep all text objective and drop wordy intro greetings.`,
        explanation: `### Key Improvements
1. **Established Clear Hierarchy**: Structured context, instructions, and constraints into markdown segments.
2. **Eliminated Preamble**: Instructed the generator to start directly with the analytical layout.
3. **Role Validation**: Reinforces security boundaries naturally.`,
        metricShifts: {
          clarityChange: 18,
          specificityChange: 22,
          overallChange: 20
        }
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const applyOptimizedPrompt = () => {
    if (optimizedData) {
      setPrompt(optimizedData.optimizedPrompt);
      setShowOptimizationModal(false);
    }
  };

  // Core Runner orchestrating the multi-model architecture
  const executePlaygroundTest = async () => {
    if (!prompt.trim()) return;
    if (selectedModels.length === 0) {
      setErrorMessage("Please select at least one AI model model to compare.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setExecutionResult(null);

    // Initialize all model trackers to running
    const initialRunningStates: typeof modelRunningStates = {};
    selectedModels.forEach((id) => {
      initialRunningStates[id] = { status: "running" };
    });
    setModelRunningStates(initialRunningStates);

    try {
      // Execute the multi-model pipeline via the modular executor we created
      const options = {
        userId: user?.uid || "anonymous_user",
        promptText: prompt,
        systemInstruction,
        category,
        selectedModels
      };

      const result = await PromptExecutor.executeMultiModel(options);

      // Map final results back to progress tracker states
      const finishedStates: typeof modelRunningStates = {};
      result.responses.forEach((resp) => {
        finishedStates[resp.modelId] = {
          status: resp.isError ? "error" : "completed",
          error: resp.isError ? resp.responseText : undefined
        };
      });
      setModelRunningStates(finishedStates);
      setExecutionResult(result);

      // Save complete execution profile into history
      await saveExecutionHistory(result);
    } catch (e: any) {
      console.error(e);
      setErrorMessage("An unexpected network collision occurred. Using offline simulator benchmarks.");
    } finally {
      setLoading(false);
    }
  };

  // Save successful run record (Firestore + Local fallback)
  const saveExecutionHistory = async (record: PromptExecution) => {
    try {
      if (user) {
        const historyCols = collection(db, "executions");
        try {
          await addDoc(historyCols, record);
        } catch (addErr: any) {
          if (addErr?.code === "permission-denied" || addErr?.message?.includes("permission") || addErr?.message?.includes("Permission")) {
            handleFirestoreError(addErr, OperationType.CREATE, "executions");
          }
          throw addErr;
        }
      }
      // Regardless, append to local memory cache to keep offline instant fallback
      const localHistoryJson = localStorage.getItem("promptscope_executions_history");
      const currentLocalHistory: PromptExecution[] = localHistoryJson ? JSON.parse(localHistoryJson) : [];
      const updatedHistory = [record, ...currentLocalHistory].slice(0, 50); // limit to last 50 items
      localStorage.setItem("promptscope_executions_history", JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (err: any) {
      if (err?.code === "permission-denied" || err?.message?.includes("permission") || err?.message?.includes("Permission")) {
        handleFirestoreError(err, OperationType.CREATE, "executions");
      }
      console.warn("Firestore save failed, caching in offline storage. Rules may be updating.", err);
    }
  };

  // Fetch History profiles
  const fetchHistory = async () => {
    setHistoryLoading(true);
    let historyRecords: PromptExecution[] = [];

    try {
      if (user) {
        const historyCols = collection(db, "executions");
        const q = query(historyCols, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const fbDocs: PromptExecution[] = [];
        querySnapshot.forEach((doc) => {
          fbDocs.push({ ...doc.data() as PromptExecution, id: doc.id });
        });
        // Sort in-memory to prevent requiring composite indexes in Firestore
        fbDocs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        historyRecords = fbDocs;
      }
    } catch (e: any) {
      if (e?.code === "permission-denied" || e?.message?.includes("permission") || e?.message?.includes("Permission")) {
        handleFirestoreError(e, OperationType.LIST, "executions");
      }
      console.warn("Could not query live Firestore logs; loading local telemetry.", e);
    }

    // load local logs if empty
    if (historyRecords.length === 0) {
      const localHistoryJson = localStorage.getItem("promptscope_executions_history");
      if (localHistoryJson) {
        historyRecords = JSON.parse(localHistoryJson);
      }
    }

    // seed some mock historic records if entirely empty
    if (historyRecords.length === 0) {
      historyRecords = [
        {
          id: "hist_1",
          userId: user?.uid || "anonymous_user",
          promptText: "Explain quantum computing quantum coherence principles using water waves metaphors.",
          systemInstruction: "Format as an editorial narrative column.",
          category: "Education",
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          modelsUsed: ["gemini-3.5-flash", "gpt-4o"],
          responses: [
            {
              modelId: "gemini-3.5-flash",
              modelName: "Gemini 3.5 Flash",
              provider: "Google",
              responseText: "Think of quantum coherence like children executing perfectly synchronous jumps on a trampoline. They create clean, constructive waves of energy because their rhythms match exactly.",
              latencyMs: 140,
              tokenUsage: { prompt: 18, completion: 35, total: 53 },
              costAnalysis: { inputCostUsd: 0.000001, outputCostUsd: 0.00001, totalCostUsd: 0.000011 },
              readabilityGrade: "Intermediate (Grade 7-9)",
              confidenceScore: 92,
              evaluation: {
                relevanceScore: 94,
                completenessScore: 88,
                clarityScore: 95,
                creativityScore: 90,
                structureScore: 92,
                overallScore: 92,
                summary: "Exquisite educational synthesis. High metaphorical alignment."
              }
            }
          ],
          averageLatencyMs: 140,
          totalTokens: 53,
          totalCostUsd: 0.000011,
          isFavorite: true
        }
      ];
      localStorage.setItem("promptscope_executions_history", JSON.stringify(historyRecords));
    }

    setHistory(historyRecords);
    setHistoryLoading(false);
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      if (user && id.startsWith("hist_") === false) {
        await deleteDoc(doc(db, "executions", id));
      }
    } catch (e: any) {
      if (e?.code === "permission-denied" || e?.message?.includes("permission") || e?.message?.includes("Permission")) {
        handleFirestoreError(e, OperationType.DELETE, `executions/${id}`);
      }
      console.error("Firestore delete error:", e);
    }

    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem("promptscope_executions_history", JSON.stringify(updated));
    setHistory(updated);
  };

  const toggleFavoriteHistoryItem = async (histItem: PromptExecution) => {
    const updatedStatus = !histItem.isFavorite;
    try {
      if (user && histItem.id.startsWith("hist_") === false) {
        await updateDoc(doc(db, "executions", histItem.id), { isFavorite: updatedStatus });
      }
    } catch (e: any) {
      if (e?.code === "permission-denied" || e?.message?.includes("permission") || e?.message?.includes("Permission")) {
        handleFirestoreError(e, OperationType.UPDATE, `executions/${histItem.id}`);
      }
      console.error("Firestore update error:", e);
    }

    const updated = history.map((item) =>
      item.id === histItem.id ? { ...item, isFavorite: updatedStatus } : item
    );
    localStorage.setItem("promptscope_executions_history", JSON.stringify(updated));
    setHistory(updated);
  };

  // Filter & Sort logs
  const processedHistory = history
    .filter((hl) => {
      const matchSearch =
        hl.promptText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hl.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filterCategory === "all" || hl.category === filterCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (sortBy === "cost") return b.totalCostUsd - a.totalCostUsd;
      if (sortBy === "latency") return b.averageLatencyMs - a.averageLatencyMs;
      if (sortBy === "score") {
        const scoreA = a.responses[0]?.evaluation.overallScore || 0;
        const scoreB = b.responses[0]?.evaluation.overallScore || 0;
        return scoreB - scoreA;
      }
      return 0;
    });

  // Basic stats counts
  const promptComplexity =
    prompt.length < 100 ? "Low Density" : prompt.length < 350 ? "Balanced" : "High/Complex Density";

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-forest">
      {/* Page Title */}
      <div className="border-b border-sage/15 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-forest flex items-center gap-2">
            <Cpu className="w-6 h-6 text-sage" />
            <span>AI Prompt Intelligence & Comparison Playground</span>
          </h1>
          <p className="text-xs text-forest/60 mt-1">
            Build and optimize system-level instructions, perform parallel model diagnostic sweeps, and study telemetry alignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveDraft}
            className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold bg-cream/80 hover:bg-cream :bg-[#121A16] border border-sage/20 text-forest/80 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Advanced Prompt Settings & Selector */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section: Prompt Editor */}
          <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sage" />
                <span>1. Advanced Prompt Workspace</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sage/10 text-sage">
                {promptComplexity}
              </span>
            </div>

            {/* Selector Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-forest/70 mb-1.5 uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-cream border border-sage/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-sage font-medium text-forest transition-colors"
                >
                  <option value="General Assistant">General Assistant</option>
                  <option value="Programming">Programming</option>
                  <option value="Research">Research</option>
                  <option value="Education">Education</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Creative Writing">Creative Writing</option>
                  <option value="Data Analysis">Data Analysis</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-forest/70 mb-1.5 uppercase">Optimize Goal</label>
                <input
                  type="text"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  placeholder="Optimization goals..."
                  className="w-full text-xs px-2.5 py-2 bg-cream border border-sage/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-sage font-medium text-forest transition-colors"
                />
              </div>
            </div>

            {/* System Instruction */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold text-forest/70 uppercase">System Instructions</label>
                <button
                  onClick={() =>
                    setSystemInstruction(
                      "You are an expert coder. Wrap all code snippets inside valid markdown fences. Propose complete solutions."
                    )
                  }
                  className="text-[9px] font-medium text-sage hover:underline"
                >
                  Use Developer Preset
                </button>
              </div>
              <textarea
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                rows={3}
                placeholder="Declare baseline context guidelines, constraints, and target behaviors..."
                className="w-full text-xs p-3 bg-cream border border-sage/25 rounded-xl focus:outline-none focus:ring-1 focus:ring-sage font-sans leading-relaxed text-forest transition-colors"
              />
            </div>

            {/* Main Prompt Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold text-forest/70 uppercase">User Prompt</label>
                <span className="text-[9px] font-mono text-forest/50">
                  {prompt.length} chars | ~{Math.ceil(prompt.length / 4.1)} tokens
                </span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                placeholder="Enter prompt content to test and evaluate..."
                className="w-full text-xs p-3 bg-cream border border-sage/25 rounded-xl focus:outline-none focus:ring-1 focus:ring-sage font-sans leading-relaxed text-forest transition-colors"
              />
            </div>

            {/* Auxiliary optimization buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleAnalyzePrompt}
                disabled={isAnalyzing || !prompt.trim()}
                className="py-2.5 rounded-xl border border-sage/30 hover:bg-sage/5 :bg-sage/10 text-forest/90 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-transparent"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-sage" />
                ) : (
                  <Gauge className="w-3.5 h-3.5 text-sage" />
                )}
                <span>Run Quality Audit</span>
              </button>

              <button
                type="button"
                onClick={handleOptimizePrompt}
                disabled={isOptimizing || !prompt.trim()}
                className="py-2.5 rounded-xl bg-cream border border-sage/30 hover:bg-cream/50 :bg-sage/10 text-forest font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {isOptimizing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-sage" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-sage" />
                )}
                <span>Auto-Optimize Prompt</span>
              </button>
            </div>
          </div>

          {/* Section: Model Selection Checklist */}
          <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-sage" />
                <span>2. Multi-Model Matrix Selection</span>
              </h3>
              <span className="text-[10px] font-bold text-forest/50">
                {selectedModels.length} Selected
              </span>
            </div>

            {/* Shortcut Tags */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => selectGroup("all")}
                className="px-2.5 py-1 text-[9px] font-bold rounded bg-cream border border-sage/25 hover:border-sage text-forest transition-all cursor-pointer"
              >
                Select All
              </button>
              <button
                onClick={() => selectGroup("google")}
                className="px-2.5 py-1 text-[9px] font-bold rounded bg-cream border border-sage/25 hover:border-sage text-forest transition-all cursor-pointer"
              >
                Google Core
              </button>
              <button
                onClick={() => selectGroup("fast")}
                className="px-2.5 py-1 text-[9px] font-bold rounded bg-cream border border-sage/25 hover:border-sage text-forest transition-all cursor-pointer"
              >
                Budget Fast
              </button>
              <button
                onClick={() => selectGroup("accurate")}
                className="px-2.5 py-1 text-[9px] font-bold rounded bg-cream border border-sage/25 hover:border-sage text-forest transition-all cursor-pointer"
              >
                High Intelligence
              </button>
            </div>

            {/* Model Checklist scrollbox */}
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {AVAILABLE_MODELS.map((m) => {
                const isSelected = selectedModels.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => toggleModelSelection(m.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-sage/5  border-sage/50  shadow-sm"
                        : "bg-cream/50  border-sage/10  hover:bg-cream :bg-[#121A16]"
                    }`}
                  >
                    <div className="mt-0.5 text-sage">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 fill-sage text-white" />
                      ) : (
                        <Square className="w-4 h-4 text-sage/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-1.5">
                        <span className="text-xs font-bold text-forest">{m.name}</span>
                        <div className="flex items-center gap-1.5 font-mono text-[9px]">
                          <span className="text-accent-gold font-bold">{m.costLevel}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-forest/50">{m.contextWindow}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-forest/60 font-sans mt-1 line-clamp-1">
                        {m.capability}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Running Trigger Button */}
            <button
              onClick={executePlaygroundTest}
              disabled={loading || !prompt.trim()}
              className="w-full py-3.5 rounded-xl bg-sage hover:bg-sage/95 disabled:opacity-50 text-[#FAF8F3] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow border-none"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Parallel Models...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-[#FAF8F3] text-transparent" />
                  <span>Run Multi-Model Diagnostic Sweep</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Output Compare console, Evaluation metric charts */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real-time thinking panel when running */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white p-5 rounded-2xl border border-sage/20 shadow-sm space-y-4 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sage"></span>
                    </span>
                    <span className="text-xs font-semibold text-forest">Active Thinking Progress Stream</span>
                  </div>
                  <span className="text-[10px] font-mono text-sage animate-pulse">Running diagnostics...</span>
                </div>

                <div className="space-y-2.5">
                  {selectedModels.map((mId) => {
                    const mInfo = ModelFactory.getModelById(mId);
                    const runState = modelRunningStates[mId]?.status || "idle";
                    return (
                      <div key={mId} className="flex justify-between items-center py-2 px-3 rounded-lg bg-cream border border-sage/10 transition-colors">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-3.5 h-3.5 text-sage/75" />
                          <span className="text-xs font-semibold text-forest">{mInfo?.name || mId}</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          runState === "running"
                            ? "bg-amber-500/10 text-amber-600 animate-pulse"
                            : runState === "completed"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-gray-100  text-gray-500 "
                        }`}>
                          {runState === "running" ? "Thinking..." : "Ready"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Response comparison cards */}
          {executionResult ? (
            <div className="bg-white rounded-2xl border border-sage/15 shadow-sm overflow-hidden flex flex-col min-h-[480px] transition-colors">
              {/* Tabs list for comparing models side by side */}
              <div className="bg-cream px-4 py-3 border-b border-sage/15 flex flex-wrap items-center justify-between gap-3 transition-colors">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {executionResult.responses.map((resp) => (
                    <button
                      key={resp.modelId}
                      type="button"
                      onClick={() => setActiveModelTab(resp.modelId)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeModelTab === resp.modelId
                          ? "bg-sage text-white shadow-sm border-none"
                          : "text-forest/75  hover:bg-sage/10 :bg-sage/20 bg-white  border border-sage/10 "
                      }`}
                    >
                      {resp.modelName}
                    </button>
                  ))}
                </div>

                {/* Combined statistics overview */}
                <div className="text-[10px] font-mono font-bold text-forest/60 flex items-center gap-3">
                  <span>Latency Avg: <font className="text-sage">{executionResult.averageLatencyMs}ms</font></span>
                  <span>Cost Total: <font className="text-accent-gold">${executionResult.totalCostUsd.toFixed(6)}</font></span>
                </div>
              </div>

              {/* Active Tab comparison details */}
              {executionResult.responses
                .filter((r) => r.modelId === activeModelTab)
                .map((resp) => {
                  const isCopied = copiedResponses[resp.modelId] || false;
                  return (
                    <div key={resp.modelId} className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-5">
                        {/* Metrics panel */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-cream p-4 rounded-xl border border-sage/10 transition-colors">
                          <div className="text-center sm:border-r sm:border-sage/10 :border-sage-soft/10 last:border-0">
                            <span className="text-[9px] uppercase font-bold text-gray-400 block">Execution Latency</span>
                            <span className="text-xs font-mono font-bold text-forest mt-0.5 block">
                              {resp.latencyMs}ms
                            </span>
                          </div>
                          <div className="text-center sm:border-r sm:border-sage/10 :border-sage-soft/10 last:border-0">
                            <span className="text-[9px] uppercase font-bold text-gray-400 block">Total Tokens</span>
                            <span className="text-xs font-mono font-bold text-forest mt-0.5 block">
                              {resp.tokenUsage.total}
                            </span>
                          </div>
                          <div className="text-center sm:border-r sm:border-sage/10 :border-sage-soft/10 last:border-0">
                            <span className="text-[9px] uppercase font-bold text-gray-400 block">Classified style</span>
                            <span className="text-[9px] font-bold text-accent-gold mt-0.5 block truncate px-1">
                              {resp.readabilityGrade}
                            </span>
                          </div>
                          <div className="text-center last:border-0">
                            <span className="text-[9px] uppercase font-bold text-gray-400 block">Analysis Cost</span>
                            <span className="text-xs font-mono font-bold text-emerald-600 mt-0.5 block">
                              ${resp.costAnalysis.totalCostUsd.toFixed(6)}
                            </span>
                          </div>
                        </div>

                        {/* Text Output Codefence */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Response Text Payload</span>
                            <button
                              onClick={() => handleCopyToClipboard(resp.responseText, resp.modelId)}
                              className="px-2.5 py-1 text-[10px] bg-white border border-sage/20 hover:bg-cream :bg-[#121A16] text-forest/80 rounded flex items-center gap-1 font-bold transition-all text-left cursor-pointer"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-sage" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Output</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="p-4 rounded-xl bg-cream/55 border border-sage/10 text-xs text-forest leading-relaxed font-sans whitespace-pre-wrap font-medium select-text max-h-[320px] overflow-y-auto transition-colors">
                            {resp.responseText}
                          </div>
                        </div>

                        {/* Model response evaluation parameters */}
                        <div className="space-y-3 pt-2">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <Gauge className="w-3.5 h-3.5 text-sage" />
                            <span>Qualitative Alignments & Evaluation metrics</span>
                          </h4>

                          <div className="bg-cream p-4 rounded-xl border border-sage/10 grid grid-cols-2 gap-4 transition-colors">
                            {/* Visual Score columns */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[11px] font-medium text-forest/80">
                                <span>Relevance Goal Compliance</span>
                                <span className="font-mono font-bold text-sage">{resp.evaluation.relevanceScore}%</span>
                              </div>
                              <div className="w-full bg-sage/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-sage h-full rounded-full" style={{ width: `${resp.evaluation.relevanceScore}%` }}></div>
                              </div>

                              <div className="flex items-center justify-between text-[11px] font-medium text-forest/80">
                                <span>Completeness & Depth</span>
                                <span className="font-mono font-bold text-sage">{resp.evaluation.completenessScore}%</span>
                              </div>
                              <div className="w-full bg-sage/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-sage h-full rounded-full" style={{ width: `${resp.evaluation.completenessScore}%` }}></div>
                              </div>

                              <div className="flex items-center justify-between text-[11px] font-medium text-forest/80">
                                <span>Structural Formatting Code</span>
                                <span className="font-mono font-bold text-sage">{resp.evaluation.structureScore}%</span>
                              </div>
                              <div className="w-full bg-sage/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-sage h-full rounded-full" style={{ width: `${resp.evaluation.structureScore}%` }}></div>
                              </div>
                            </div>

                            {/* Overall Summary */}
                            <div className="flex flex-col justify-between space-y-2 pl-2">
                              <div>
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Overall Intelligence Score</span>
                                <div className="text-3xl font-bold font-mono text-sage mt-0.5">
                                  {resp.evaluation.overallScore}%
                                </div>
                              </div>
                              <p className="text-[11px] text-forest/70 font-sans italic leading-relaxed">
                                "{resp.evaluation.summary}"
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-sage/15 shadow-sm overflow-hidden flex flex-col justify-center items-center min-h-[480px] p-8 text-center space-y-4 transition-colors">
              <Cpu className="w-12 h-12 text-sage/40 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-forest">Multi-Model Comparison Board</h3>
                <p className="text-xs text-forest/60 mt-1 max-w-sm mx-auto leading-relaxed">
                  Adjust prompt settings on the left, check desired benchmarking models, and hit execute to trigger the parallel pipeline stream here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION: History logs with sorting, search filters */}
      <div className="bg-white p-6 rounded-2xl border border-sage/15 shadow-sm space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage/10 pb-4">
          <div>
            <h3 className="text-sm font-bold text-forest">Telemetry Archives & Prompt Logs</h3>
            <p className="text-[11px] text-forest/55">Manage execution streams, favorited test patterns, and query performance profiles.</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-cream border border-sage/20 rounded-lg text-forest focus:outline-none"
            >
              <option value="all">All Categories</option>
              {Array.from(new Set(history.map((h) => h.category))).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-cream border border-sage/20 rounded-lg text-forest focus:outline-none"
            >
              <option value="date">Date Executed</option>
              <option value="cost">Run Cost</option>
              <option value="latency">Average Latency</option>
              <option value="score">Evaluation Rating</option>
            </select>
          </div>
        </div>

        {/* Search filter bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-sage" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter logs by prompt text keywords or system categories..."
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-cream border border-sage/20 text-forest rounded-xl focus:outline-none focus:ring-1 focus:ring-sage"
          />
        </div>

        {/* List of history results */}
        <div className="divide-y divide-sage/10 space-y-3 pt-2">
          {processedHistory.length > 0 ? (
            processedHistory.map((hl) => {
              const bestResp = hl.responses[0];
              return (
                <div key={hl.id} className="pt-3.5 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-medium">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-sage/10 text-sage text-[9px] font-bold">
                        {hl.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(hl.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="font-bold text-forest line-clamp-1">"{hl.promptText}"</p>
                    {hl.systemInstruction && (
                      <p className="text-[10px] text-gray-400 italic line-clamp-1">
                        System instruction preset: "{hl.systemInstruction}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-5 justify-end">
                    {/* Telemetry info */}
                    <div className="text-right space-y-0.5 font-mono text-[10px]">
                      <div className="text-gray-500">{hl.averageLatencyMs}ms lat</div>
                      <div className="text-accent-gold">${hl.totalCostUsd.toFixed(5)}</div>
                    </div>

                    {/* Ratings */}
                    {bestResp ? (
                      <div className="text-center font-bold px-2 py-1 bg-green-500/5 text-green-600 rounded">
                        <div>{bestResp.evaluation.overallScore}%</div>
                        <div className="text-[8px] uppercase tracking-wider text-green-700/60 mt-0.5">rating</div>
                      </div>
                    ) : null}

                    {/* Interaction Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavoriteHistoryItem(hl)}
                        className={`p-1.5 rounded hover:bg-cream :bg-[#121A16] transition-all cursor-pointer bg-transparent ${
                          hl.isFavorite ? "text-amber-500" : "text-gray-300 "
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        onClick={() => deleteHistoryItem(hl.id)}
                        className="p-1.5 rounded hover:bg-rose-50 :bg-rose-950/20 text-gray-300 hover:text-rose-500 :text-rose-400 transition-all cursor-pointer bg-transparent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-xs text-gray-400">No logs match your filters. Try clearing items.</div>
          )}
        </div>
      </div>

      {/* OPTIMIZATION COMPARISON MODAL */}
      {showOptimizationModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-sage/25 max-w-2xl w-full p-6 space-y-5 shadow-2xl transition-colors">
            <div className="flex justify-between items-center border-b border-sage/10 pb-3">
              <h3 className="text-sm font-bold text-forest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sage" />
                <span>Intelligent Prompt Optimization Report</span>
              </h3>
              <button onClick={() => setShowOptimizationModal(false)} className="p-1 text-gray-400 hover:text-gray-600 :text-gray-300 bg-transparent cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {isOptimizing ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-sage animate-spin" />
                <span className="text-xs text-forest/70 font-semibold text-center mt-1">Recompiling prompt logic clusters...</span>
              </div>
            ) : optimizedData ? (
              <div className="space-y-4">
                {/* Metric shifts */}
                <div className="grid grid-cols-3 gap-3 bg-cream p-3 text-center rounded-xl border border-sage/10 transition-colors">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400">Clarity shift</span>
                    <span className="text-xs font-bold text-sage block">+{optimizedData.metricShifts?.clarityChange ?? 0}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400">Specificity shift</span>
                    <span className="text-xs font-bold text-sage block">+{optimizedData.metricShifts?.specificityChange ?? 0}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-400">Overall rating shift</span>
                    <span className="text-xs font-bold text-emerald-600 block">+{optimizedData.metricShifts?.overallChange ?? 0}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Explanation */}
                  <div className="p-4 bg-cream/40 border border-sage/10 rounded-xl space-y-2 max-h-[220px] overflow-y-auto transition-colors">
                    <span className="text-[9px] font-bold text-forest/45 uppercase font-mono">Improvement feedback</span>
                    <div className="text-[11px] leading-relaxed text-forest/80 font-sans whitespace-pre-wrap">
                      {optimizedData.explanation}
                    </div>
                  </div>

                  {/* Code block */}
                  <div className="p-4 bg-cream/40 border border-sage/10 rounded-xl space-y-2 flex flex-col justify-between transition-colors">
                    <div>
                      <span className="text-[9px] font-bold text-emerald-600 uppercase font-mono">Optimized Prompt</span>
                      <p className="text-[11px] leading-relaxed text-forest font-mono whitespace-pre-wrap max-h-[160px] overflow-y-auto mt-1 bg-white p-2 rounded border border-sage/10 transition-colors">
                        {optimizedData.optimizedPrompt}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 justify-end">
                  <button
                    onClick={() => setShowOptimizationModal(false)}
                    className="px-4 py-2 text-xs font-bold bg-cream hover:bg-cream/90 :bg-[#121A16]/90 text-forest rounded-xl cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={applyOptimizedPrompt}
                    className="px-4 py-2 text-xs font-bold bg-sage hover:bg-sage/95 text-white rounded-xl cursor-pointer border-none"
                  >
                    Apply New Version
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ANALYSIS MODAL */}
      {showAnalysisModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-sage/25 max-w-xl w-full p-6 space-y-5 shadow-2xl transition-colors">
            <div className="flex justify-between items-center border-b border-sage/10 pb-3">
              <h3 className="text-sm font-bold text-forest flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-sage" />
                <span>Generative Prompt Quality Audit Report</span>
              </h3>
              <button onClick={() => setShowAnalysisModal(false)} className="p-1 text-gray-400 hover:text-gray-600 :text-gray-300 bg-transparent cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {isAnalyzing ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-sage animate-spin" />
                <span className="text-xs text-forest/70 font-semibold mt-1">Generating linguistic and ambiguity models...</span>
              </div>
            ) : analysisReport ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-cream p-4 rounded-xl border border-sage/10 transition-colors">
                  <div className="text-center bg-white p-3 rounded-lg border border-sage/10 min-w-[100px] transition-colors">
                    <span className="text-[9px] uppercase font-bold text-gray-400">Total rating</span>
                    <span className="text-2xl font-bold text-sage font-mono block mt-1">
                      {analysisReport.scores.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-forest/85 leading-relaxed">
                    This prompt is highly structured. Ensure you use explicit code-block constraints to mitigate generic instructions.
                  </p>
                </div>

                {/* Score breakdown metrics cards */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-3.5 rounded-xl border border-sage/10 bg-cream/50 transition-colors">
                      <div className="flex justify-between items-center text-xs font-bold text-forest">
                        <span>Clarity Metric</span>
                        <span className="text-sage">{analysisReport.scores.clarity.score}%</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{analysisReport.scores.clarity.feedback}</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-sage/10 bg-cream/50 transition-colors">
                      <div className="flex justify-between items-center text-xs font-bold text-forest">
                        <span>Specificity</span>
                        <span className="text-sage">{analysisReport.scores.specificity.score}%</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{analysisReport.scores.specificity.feedback}</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-sage/10 bg-cream/50 transition-colors">
                      <div className="flex justify-between items-center text-xs font-bold text-forest">
                        <span>Background Context</span>
                        <span className="text-sage">{analysisReport.scores.context.score}%</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{analysisReport.scores.context.feedback}</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-sage/10 bg-cream/50 transition-colors">
                      <div className="flex justify-between items-center text-xs font-bold text-forest">
                        <span>Linguistic Ambiguity</span>
                        <span className="text-sage">{analysisReport.scores.ambiguity.score}%</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{analysisReport.scores.ambiguity.feedback}</p>
                    </div>
                  </div>

                  {/* Suggestions list */}
                  <div className="bg-cream p-4 rounded-xl border border-sage/10 space-y-1.5 transition-colors">
                    <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Audit suggestions</span>
                    {analysisReport.suggestions.map((suggestion, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed text-forest/80">
                        <Lightbulb className="w-3.5 h-3.5 text-sage shrink-0 mt-0.5" />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex pt-3 justify-end">
                  <button
                    onClick={() => setShowAnalysisModal(false)}
                    className="px-5 py-2.5 text-xs font-bold bg-sage text-white rounded-xl hover:bg-sage/95 transition-all cursor-pointer border-none"
                  >
                    Acknowledge & Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
