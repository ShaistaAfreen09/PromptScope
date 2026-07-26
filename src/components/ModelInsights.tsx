import React, { useState, useEffect } from "react";
import { Clock, Award, DollarSign } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { PromptExecution } from "../types";

export const ModelInsights: React.FC = () => {
  const gridColor = "#E1EAE4";
  const axisColor = "#6B7C72";
  const tooltipBg = "#FAF8F3";
  const tooltipBorder = "rgba(143, 175, 155, 0.25)";

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
        console.warn("ModelInsights Firestore query notice:", err);
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

  // Compute model stats dynamically from execution history
  const modelMetricsMap: {
    [modelName: string]: {
      totalLatency: number;
      totalCost: number;
      totalScore: number;
      count: number;
    }
  } = {};

  executions.forEach((exec) => {
    exec.responses?.forEach((resp) => {
      const name = resp.modelName || resp.modelId;
      if (!modelMetricsMap[name]) {
        modelMetricsMap[name] = { totalLatency: 0, totalCost: 0, totalScore: 0, count: 0 };
      }
      modelMetricsMap[name].totalLatency += resp.latencyMs || 0;
      modelMetricsMap[name].totalCost += resp.costAnalysis?.totalCostUsd || (exec.totalCostUsd / Math.max(1, exec.responses.length));
      modelMetricsMap[name].totalScore += resp.evaluation?.overallScore || 85;
      modelMetricsMap[name].count += 1;
    });
  });

  const modelStats = Object.keys(modelMetricsMap).length > 0
    ? Object.entries(modelMetricsMap).map(([name, m]) => ({
        name,
        latency: Math.round(m.totalLatency / m.count),
        cost: Number((m.totalCost / m.count * 1000).toFixed(3)), // Cost per 1k runs/tokens index
        compliance: Math.round(m.totalScore / m.count)
      }))
    : [
        { name: "Gemini 3.6 Flash", latency: 142, cost: 0.075, compliance: 96 },
        { name: "GPT-4o", latency: 245, cost: 5.0, compliance: 94 },
        { name: "Claude 3.5 Sonnet", latency: 412, cost: 3.0, compliance: 98 }
      ];

  // Derive highlight cards
  const sortedByLatency = [...modelStats].sort((a, b) => a.latency - b.latency);
  const sortedByCompliance = [...modelStats].sort((a, b) => b.compliance - a.compliance);
  const sortedByCost = [...modelStats].sort((a, b) => a.cost - b.cost);

  const fastestModel = sortedByLatency[0];
  const compliantModel = sortedByCompliance[0];
  const efficientModel = sortedByCost[0];

  return (
    <div className="space-y-6 animate-fade-in text-forest">
      <div className="border-b border-sage/15 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-forest">Model Insights</h1>
        <p className="text-xs text-forest/60 mt-1">
          Review empirical performance diagnostics, latency comparison metrics, and compliance indexes across LLMs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fast model card */}
        <div className="bg-white p-4 rounded-xl border border-sage/15 shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-forest/50 uppercase block">Shortest Latency</span>
          <h3 className="text-sm font-bold text-forest">{fastestModel?.name || "Gemini 3.6 Flash"}</h3>
          <p className="text-xs font-mono font-bold text-sage flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Avg {fastestModel?.latency || 140}ms response speed</span>
          </p>
        </div>

        {/* Highest compliance model */}
        <div className="bg-white p-4 rounded-xl border border-sage/15 shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-forest/50 uppercase block">Structure Compliance</span>
          <h3 className="text-sm font-bold text-forest">{compliantModel?.name || "Claude 3.5 Sonnet"}</h3>
          <p className="text-xs font-mono font-bold text-sage flex items-center space-x-1">
            <Award className="w-3 h-3" />
            <span>{compliantModel?.compliance || 98}% Schema compliance rating</span>
          </p>
        </div>

        {/* High efficiency pro */}
        <div className="bg-white p-4 rounded-xl border border-sage/15 shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-forest/50 uppercase block">Most Cost-Efficient</span>
          <h3 className="text-sm font-bold text-forest">{efficientModel?.name || "Gemini 3.6 Flash"}</h3>
          <p className="text-xs font-mono font-bold text-sand flex items-center space-x-0.5">
            <DollarSign className="w-3 h-3" />
            <span>${efficientModel?.cost || 0.075} index (Highly Scalable)</span>
          </p>
        </div>

        {/* Total models logged */}
        <div className="bg-white p-4 rounded-xl border border-sage/15 shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-forest/50 uppercase block">Connected Models</span>
          <h3 className="text-sm font-bold text-forest">{modelStats.length} Engaged Models</h3>
          <p className="text-xs font-sans text-forest/60">Google Gemini, OpenAI, Claude</p>
        </div>
      </div>

      {/* Latency Comparison Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm">
          <h3 className="text-xs font-bold text-forest uppercase tracking-wider mb-4">Model Latency Speeds (ms)</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={axisColor} fontSize={9} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: "12px",
                    fontFamily: "ui-sans-serif",
                    fontSize: "11px",
                    color: "#2F3A33"
                  }}
                  itemStyle={{
                    color: "#2F3A33"
                  }}
                />
                <Bar dataKey="latency" fill="#8FAF9B" radius={[5, 5, 0, 0]} name="Latency Ms" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm">
          <h3 className="text-xs font-bold text-forest uppercase tracking-wider mb-4">Alignment Compliance Rating (%)</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={axisColor} fontSize={9} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: "12px",
                    fontFamily: "ui-sans-serif",
                    fontSize: "11px",
                    color: "#2F3A33"
                  }}
                  itemStyle={{
                    color: "#2F3A33"
                  }}
                />
                <Bar dataKey="compliance" fill="#D8B56A" radius={[5, 5, 0, 0]} name="Compliance (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

