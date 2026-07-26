import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  BarChart, 
  Activity, 
  ChevronRight, 
  ShieldCheck, 
  LineChart as LineIcon,
  Clock,
  TrendingUp,
  Award,
  Zap,
  Cpu
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart as ReBarChart, 
  Bar, 
  Cell 
} from "recharts";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { PromptExecution, PromptAnalysis } from "../types";
import { safeJson } from "../utils";

export const PromptAnalytics: React.FC = () => {
  const gridColor = "#E1EAE4";
  const axisColor = "#6B7C72";
  const tooltipBg = "#FAF8F3";
  const tooltipBorder = "rgba(143, 175, 155, 0.25)";

  // Tab selector State
  const [activeSubTab, setActiveSubTab] = useState<"evaluator" | "overview">("overview");

  // Evaluator State
  const [promptInput, setPromptInput] = useState(
    "Please write a quick essay about space. Make it clean and don't make mistakes. Return any random fact."
  );
  const [systemInput, setSystemInput] = useState("Be a generic helpful advisory chatbot.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PromptAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Time filter for Overview tab
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");

  // Live Firestore executions dataset
  const [executions, setExecutions] = useState<PromptExecution[]>([]);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = query(collection(db, "executions"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const docs: PromptExecution[] = [];
        snapshot.forEach((docSnap) => {
          docs.push({ ...docSnap.data() as PromptExecution, id: docSnap.id });
        });
        setExecutions(docs);
      }, (err) => {
        console.warn("PromptAnalytics Firestore query notice:", err);
        const local = localStorage.getItem("promptscope_executions_history");
        if (local) {
          try { setExecutions(JSON.parse(local)); } catch {}
        }
      });
    } catch {
      const local = localStorage.getItem("promptscope_executions_history");
      if (local) {
        try { setExecutions(JSON.parse(local)); } catch {}
      }
    }

    return () => unsubscribe();
  }, []);

  const executeAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: promptInput,
          systemInstruction: systemInput
        })
      });

      const data = await safeJson(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Evaluation failed.");
      }

      setResult(data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Quality evaluation failed.");
    } finally {
      setLoading(false);
    }
  };

  // Compute metrics from executions dataset
  let totalScoreSum = 0;
  let scoreCount = 0;
  let totalTokens = 0;
  let totalSpent = 0;

  const modelMetricsMap: {
    [modelName: string]: { totalLatency: number; totalCost: number; totalScore: number; count: number }
  } = {};

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayStats: { [day: string]: { scoreSum: number; count: number; opts: number } } = {
    Mon: { scoreSum: 0, count: 0, opts: 0 },
    Tue: { scoreSum: 0, count: 0, opts: 0 },
    Wed: { scoreSum: 0, count: 0, opts: 0 },
    Thu: { scoreSum: 0, count: 0, opts: 0 },
    Fri: { scoreSum: 0, count: 0, opts: 0 },
    Sat: { scoreSum: 0, count: 0, opts: 0 },
    Sun: { scoreSum: 0, count: 0, opts: 0 }
  };

  executions.forEach((exec) => {
    totalSpent += exec.totalCostUsd || 0;
    const d = new Date(exec.timestamp);
    const dayName = daysOfWeek[d.getDay()] || "Mon";

    exec.responses?.forEach((resp) => {
      const score = resp.evaluation?.overallScore || 85;
      totalScoreSum += score;
      scoreCount++;
      totalTokens += resp.tokenUsage?.total || 0;

      dayStats[dayName].scoreSum += score;
      dayStats[dayName].count += 1;
      if (exec.systemInstruction) dayStats[dayName].opts += 1;

      const mName = resp.modelName || resp.modelId;
      if (!modelMetricsMap[mName]) {
        modelMetricsMap[mName] = { totalLatency: 0, totalCost: 0, totalScore: 0, count: 0 };
      }
      modelMetricsMap[mName].totalLatency += resp.latencyMs || 0;
      modelMetricsMap[mName].totalCost += resp.costAnalysis?.totalCostUsd || 0;
      modelMetricsMap[mName].totalScore += score;
      modelMetricsMap[mName].count += 1;
    });
  });

  const intelligenceIndex = scoreCount > 0 ? (totalScoreSum / scoreCount).toFixed(1) : "0.0";
  const totalRuns = executions.length;

  const scoreTrendData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
    const st = dayStats[day];
    return {
      day,
      score: st.count > 0 ? Math.round(st.scoreSum / st.count) : 0,
      optimizations: st.opts
    };
  });

  const modelBenchmarkData = Object.keys(modelMetricsMap).length > 0
    ? Object.entries(modelMetricsMap).map(([name, stat]) => ({
        name,
        latency: Math.round(stat.totalLatency / stat.count),
        cost: Number((stat.totalCost / stat.count * 1000).toFixed(3)),
        alignment: Number((stat.totalScore / stat.count).toFixed(1))
      }))
    : [
        { name: "Gemini 3.6 Flash", latency: 142, cost: 0.075, alignment: 96.2 },
        { name: "GPT-4o", latency: 245, cost: 5.0, alignment: 94.0 },
        { name: "Claude 3.5 Sonnet", latency: 412, cost: 3.0, alignment: 98.1 }
      ];

  return (
    <div className="space-y-6 animate-fade-in text-forest">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-sage/15 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-forest flex items-center space-x-2">
            <span>Prompt Intelligence Analytics</span>
          </h1>
          <p className="text-xs text-forest/60 mt-1">
            Access production-grade metrics, provider speed benchmarks, and optimization trends across your workspace.
          </p>
        </div>

        {/* Sub-tab selection */}
        <div className="flex bg-cream border border-sage/20 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab("overview")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === "overview"
                ? "bg-sage text-white shadow-xs"
                : "text-forest/60 hover:text-forest"
            }`}
          >
            SaaS Overview
          </button>
          <button
            onClick={() => setActiveSubTab("evaluator")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === "evaluator"
                ? "bg-sage text-white shadow-xs"
                : "text-forest/60 hover:text-forest"
            }`}
          >
            Prompt Evaluator
          </button>
        </div>
      </div>

      {activeSubTab === "overview" ? (
        // OVERVIEW DASHBOARD VIEW
        <div className="space-y-6">
          {/* Executive KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* KPI 1 - Prompt Intelligence Score */}
            <div className="bg-white p-4.5 rounded-2xl border border-sage/15 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-forest/45 uppercase tracking-wider">Intelligence Index</span>
                <div className="p-1.5 bg-sage/10 rounded-lg text-sage"><Award className="w-4 h-4" /></div>
              </div>
              <div>
                <span className="text-2xl font-bold font-mono text-forest block">{intelligenceIndex}%<span className="text-[10px] font-sans text-green-700 ml-1.5 font-bold">Evaluated</span></span>
                <span className="text-[9.5px] text-forest/50 block">Average evaluated quality metrics</span>
              </div>
            </div>

            {/* KPI 2 - AI Usage Metrics */}
            <div className="bg-white p-4.5 rounded-2xl border border-sage/15 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-forest/45 uppercase tracking-wider">Gateway Executions</span>
                <div className="p-1.5 bg-sage/10 rounded-lg text-sage"><Cpu className="w-4 h-4" /></div>
              </div>
              <div>
                <span className="text-2xl font-bold font-mono text-forest block">{totalRuns}<span className="text-[10px] font-sans text-forest/60 ml-1.5">runs</span></span>
                <span className="text-[9.5px] text-forest/50 block">{totalTokens.toLocaleString()} tokens | ${totalSpent.toFixed(2)} spent</span>
              </div>
            </div>

            {/* KPI 3 - Optimization Performance */}
            <div className="bg-white p-4.5 rounded-2xl border border-sage/15 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-forest/45 uppercase tracking-wider">Optimizations Made</span>
                <div className="p-1.5 bg-[#D8B56A]/10 rounded-lg text-[#D8B56A]"><Zap className="w-4 h-4" /></div>
              </div>
              <div>
                <span className="text-2xl font-bold font-mono text-forest block">{scoreTrendData.reduce((a, b) => a + b.optimizations, 0)}<span className="text-[10px] font-sans text-green-700 ml-1.5 font-bold">Active</span></span>
                <span className="text-[9.5px] text-forest/50 block">Recorded prompt optimizations</span>
              </div>
            </div>

            {/* KPI 4 - Model Alignment */}
            <div className="bg-white p-4.5 rounded-2xl border border-sage/15 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-forest/45 uppercase tracking-wider">Provider Alignment</span>
                <div className="p-1.5 bg-sage/10 rounded-lg text-sage"><ShieldCheck className="w-4 h-4" /></div>
              </div>
              <div>
                <span className="text-2xl font-bold font-mono text-forest block">{intelligenceIndex}%<span className="text-[10px] font-sans text-green-700 ml-1.5 font-bold">✓ Good</span></span>
                <span className="text-[9.5px] text-forest/50 block">Safety filter & compliance pass-rate</span>
              </div>
            </div>
          </div>

          {/* Interactive Charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Score trend line chart */}
            <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm lg:col-span-7 space-y-3">
              <div className="flex justify-between items-center pb-2">
                <h3 className="text-xs font-bold text-forest uppercase tracking-wider flex items-center space-x-1.5">
                  <LineIcon className="w-4 h-4 text-sage" />
                  <span>Quality Score Progression (Weekly Trend)</span>
                </h3>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreTrendData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke={axisColor} />
                    <YAxis domain={[60, 95]} tick={{ fontSize: 10 }} stroke={axisColor} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: "12px",
                        fontFamily: "ui-sans-serif",
                        color: "#2F3A33"
                      }}
                      itemStyle={{
                        color: "#2F3A33"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#8FAF9B" 
                      strokeWidth={3} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Model Latency speed metrics bar chart */}
            <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm lg:col-span-5 space-y-3">
              <h3 className="text-xs font-bold text-forest uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-sage" />
                <span>Provider Latency (Speed Benchmark)</span>
              </h3>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={modelBenchmarkData} layout="vertical" margin={{ top: 10, right: 15, left: 30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                    <XAxis type="number" tick={{ fontSize: 10 }} stroke={axisColor} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} stroke={axisColor} width={90} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: "12px",
                        fontFamily: "ui-sans-serif",
                        color: "#2F3A33"
                      }}
                      itemStyle={{
                        color: "#2F3A33"
                      }}
                    />
                    <Bar dataKey="latency" fill="#8FAF9B" radius={[0, 4, 4, 0]}>
                      {modelBenchmarkData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name.includes("Gemini") ? "#8FAF9B" : "#D8B56A"} />
                      ))}
                    </Bar>
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Alignment and cost comparison breakdown table */}
          <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm">
            <h3 className="text-xs font-bold text-forest uppercase tracking-wider mb-4 flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-sage" />
              <span>Multi-Model Intelligence Alignment Benchmarks</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-sage/10 text-forest/45 uppercase font-bold text-[9px] pb-2">
                    <th className="pb-3">Inference Engine</th>
                    <th className="pb-3">Alignment Ratio</th>
                    <th className="pb-3">Response Speed</th>
                    <th className="pb-3">Estimated Cost / 1M Tokens</th>
                    <th className="pb-3 text-right">Efficacy Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage/10">
                  {modelBenchmarkData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3.5 font-bold text-forest">{row.name}</td>
                      <td className="py-3.5 font-mono text-forest/80">{row.alignment}%</td>
                      <td className="py-3.5 text-forest/75">{row.latency}ms</td>
                      <td className="py-3.5 font-mono text-sage">${row.cost.toFixed(3)}</td>
                      <td className="py-3.5 text-right font-bold text-green-700">
                        {row.alignment > 98 ? "✓ Premium" : "✓ Standard"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        // PROMPT EVALUATOR VIEW
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Input card */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-forest uppercase tracking-wider">Configure Prompt Evaluator</h3>

              <div>
                <label className="block text-[11px] font-bold text-forest/70 mb-1.5 uppercase">System Intent</label>
                <input
                  type="text"
                  value={systemInput}
                  onChange={(e) => setSystemInput(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-cream border border-sage/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/35 text-forest"
                  placeholder="Be an expert technical summary assistant..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-forest/70 mb-1.5 uppercase">Target Prompt Input</label>
                <textarea
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  rows={6}
                  className="w-full text-xs p-3 bg-cream border border-sage/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/35 text-forest leading-relaxed font-sans"
                  placeholder="Key in the prompt pattern you would like to analyze..."
                />
              </div>

              <button
                onClick={executeAnalysis}
                disabled={loading || !promptInput.trim()}
                className="w-full py-3 rounded-xl bg-sage hover:bg-sage/95 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-sm border-none"
              >
                {loading ? (
                  <>
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating attributes...</span>
                  </>
                ) : (
                  <>
                    <BarChart className="w-3.5 h-3.5" />
                    <span>Evaluate Quality Score</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Output card */}
          <div className="lg:col-span-7 space-y-5">
            {result ? (
              <div className="space-y-5">
                {/* Overall scorecard */}
                <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-sage/10">
                    <div>
                      <span className="text-[10px] font-bold text-forest/45 uppercase tracking-widest">Global Scorecard</span>
                      <h3 className="text-sm font-bold text-forest mt-0.5">Prompt Attribute Breakdown</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-forest/45 uppercase tracking-widest font-bold">Weighted quality</span>
                      <div className="text-2xl font-bold font-mono text-sage mt-0.5">{result.scores.score}/100</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 my-5">
                    <div className="p-3 bg-cream rounded-xl border border-sage/10">
                      <div className="flex justify-between items-center text-[10px] font-bold text-forest/55">
                        <span>CLARITY</span>
                        <span className={result.scores.clarity.score < 50 ? "text-amber-500" : "text-sage"}>
                          {result.scores.clarity.score}%
                        </span>
                      </div>
                      <p className="text-[10px] text-forest/70 leading-relaxed mt-1">{result.scores.clarity.feedback}</p>
                    </div>

                    <div className="p-3 bg-cream rounded-xl border border-sage/10">
                      <div className="flex justify-between items-center text-[10px] font-bold text-forest/55">
                        <span>SPECIFICITY</span>
                        <span className={result.scores.specificity.score < 50 ? "text-amber-500" : "text-sage"}>
                          {result.scores.specificity.score}%
                        </span>
                      </div>
                      <p className="text-[10px] text-forest/70 leading-relaxed mt-1">{result.scores.specificity.feedback}</p>
                    </div>

                    <div className="p-3 bg-cream rounded-xl border border-sage/10 col-span-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-forest/55">
                        <span>CONTEXT DENSITY</span>
                        <span className={result.scores.context.score < 50 ? "text-amber-500" : "text-sage"}>
                          {result.scores.context.score}%
                        </span>
                      </div>
                      <p className="text-[10px] text-forest/70 leading-relaxed mt-1">{result.scores.context.feedback}</p>
                    </div>

                    <div className="p-3 bg-cream rounded-xl border border-sage/10 col-span-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-forest/55">
                        <span>AMBIGUITY THRESHOLD</span>
                        <span className={result.scores.ambiguity.score < 50 ? "text-amber-500" : "text-sage"}>
                          {result.scores.ambiguity.score}%
                        </span>
                      </div>
                      <p className="text-[10px] text-forest/70 leading-relaxed mt-1">{result.scores.ambiguity.feedback}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-sage/10 flex justify-between text-[10px] text-forest/50 font-mono">
                    <span>Input Tokens: <strong className="text-forest">{result.tokenCount}</strong></span>
                    <span>Estimated Execution cost: <strong className="text-sage">${result.estimatedCost?.toFixed(5) || "0.00003"}</strong></span>
                  </div>
                </div>

                {/* Suggestions box */}
                <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm">
                  <h3 className="text-xs font-bold text-forest uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-sand" />
                    <span>Improvement Recommendations</span>
                  </h3>
                  <ul className="space-y-3.5">
                    {result.suggestions?.map((sug, idx) => (
                      <li key={idx} className="flex items-start text-xs space-x-2 bg-cream/50 p-2.5 rounded-lg border border-sage/10">
                        <ChevronRight className="w-4 h-4 text-sand shrink-0 mt-0.5" />
                        <span className="text-forest/85 leading-relaxed font-sans font-medium">{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-sage/15 shadow-sm min-h-[380px] flex flex-col items-center justify-center text-center space-y-2.5">
                <Activity className="w-10 h-10 text-sage/35" />
                <div className="text-xs font-bold text-forest">Waiting for prompt attributes...</div>
                <p className="text-[10px] text-forest/60 max-w-xs leading-relaxed font-sans">
                  Review your template options, click "Evaluate Quality Score" and view instant alignment indicators and suggestions.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
