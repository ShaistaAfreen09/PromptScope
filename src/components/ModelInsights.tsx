import React from "react";
import { Clock, Award, DollarSign } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export const ModelInsights: React.FC = () => {
  const gridColor = "#E1EAE4";
  const axisColor = "#6B7C72";
  const tooltipBg = "#FAF8F3";
  const tooltipBorder = "rgba(143, 175, 155, 0.25)";

  const modelStats = [
    { name: "Gemini 3.5 Flash", latency: 220, cost: 0.15, compliance: 94 },
    { name: "Gemini 3.5 Pro", latency: 740, cost: 1.25, compliance: 98 },
    { name: "Llama3 8B (v2)", latency: 180, cost: 0.08, compliance: 82 },
    { name: "Claude 3.5 Sonnet", latency: 510, cost: 1.50, compliance: 96 }
  ];

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
          <h3 className="text-sm font-bold text-forest">Llama3 8B (v2)</h3>
          <p className="text-xs font-mono font-bold text-sage flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Avg 180ms response speed</span>
          </p>
        </div>

        {/* Highest compliance model */}
        <div className="bg-white p-4 rounded-xl border border-sage/15 shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-forest/50 uppercase block">Structure Compliance</span>
          <h3 className="text-sm font-bold text-forest">Gemini 3.5 Pro</h3>
          <p className="text-xs font-mono font-bold text-sage flex items-center space-x-1">
            <Award className="w-3 h-3" />
            <span>98% Schema compliance rating</span>
          </p>
        </div>

        {/* High efficiency pro */}
        <div className="bg-white p-4 rounded-xl border border-sage/15 shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-forest/50 uppercase block">Most Cost-Efficient</span>
          <h3 className="text-sm font-bold text-forest">Gemini 3.5 Flash</h3>
          <p className="text-xs font-mono font-bold text-sand flex items-center space-x-0.5">
            <DollarSign className="w-3 h-3" />
            <span>$0.15/1M tokens (Highly Scalable)</span>
          </p>
        </div>

        {/* Total models logged */}
        <div className="bg-white p-4 rounded-xl border border-sage/15 shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-forest/50 uppercase block">Connected Models</span>
          <h3 className="text-sm font-bold text-forest">5 Engaged Groups</h3>
          <p className="text-xs font-sans text-forest/60">Gemini, Claude, Llama series</p>
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
