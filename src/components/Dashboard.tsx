import React from "react";
import { motion } from "motion/react";
import {
  Activity,
  Award,
  Zap,
  TrendingUp,
  DollarSign,
  Clock,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface DashboardProps {
  onNavigate: (tab: string) => void;
  userName: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, userName }) => {
  const gridColor = "#E1EAE4";
  const axisColor = "#6B7C72";
  const tooltipBg = "#FAF8F3";
  const tooltipBorder = "rgba(143, 175, 155, 0.25)";

  // Analytical Dataset
  const trendData = [
    { day: "Mon", score: 62, cost: 0.12, tokens: 2400 },
    { day: "Tue", score: 65, cost: 0.15, tokens: 3100 },
    { day: "Wed", score: 71, cost: 0.08, tokens: 1900 },
    { day: "Thu", score: 78, cost: 0.19, tokens: 4200 },
    { day: "Fri", score: 84, cost: 0.11, tokens: 2800 },
    { day: "Sat", score: 86, cost: 0.05, tokens: 1200 },
    { day: "Sun", score: 91, cost: 0.04, tokens: 950 }
  ];

  const modelData = [
    { name: "Gemini 3.5 Flash", effectiveness: 94, share: 60 },
    { name: "Gemini 3.5 Pro", effectiveness: 98, share: 25 },
    { name: "Open-Source Llama3", effectiveness: 81, share: 15 }
  ];

  const COLORS = ["#8FAF9B", "#D8B56A", "#2F3A33"];

  const recentActivities = [
    {
      id: 1,
      type: "optimization",
      title: "Optimized SqlQueryBuilder template",
      time: "12 mins ago",
      impact: "+48% Clarity Score",
      description: "Standardized subquery extraction and query parameter controls for PostgreSQL dialect."
    },
    {
      id: 2,
      type: "analysis",
      title: "Evaluated MedicalResumeSummarizer",
      time: "2 hours ago",
      impact: "92% Score (High Quality)",
      description: "Identified low specificity in medical jargon categorization and suggested tabular constraints."
    },
    {
      id: 3,
      type: "comparison",
      title: "Compared Gemini-v2 vs Anthropic-v3",
      time: "1 day ago",
      impact: "-34% Cost Savings",
      description: "Side-by-side prompt output latency analysis confirmed 120ms improvement."
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-forest">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-sage/15 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-forest">
            Welcome back, {userName}
          </h1>
          <p className="text-xs text-forest/60 mt-1 font-sans">
            Here's the prompt intelligence dashboard summarizing your workspace parameters.
          </p>
        </div>
        <div className="flex space-x-3 text-xs">
          <button
            onClick={() => onNavigate("optimizer")}
            className="px-4 py-2.5 rounded-lg bg-sage hover:bg-sage/90 text-white font-semibold transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-sand" />
            <span>Optimize a Prompt</span>
          </button>
          <button
            onClick={() => onNavigate("playground")}
            className="px-4 py-2.5 rounded-lg border border-sage/25 hover:border-sage/45 text-forest bg-white font-semibold transition-all shadow-sm cursor-pointer"
          >
            Open Playground
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm col-span-1 sm:col-span-1 lg:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-forest/55 uppercase tracking-wider">Analyzed</span>
            <div className="w-7 h-7 rounded-lg bg-sage/10 flex items-center justify-center text-sage">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-forest">1,482</h3>
            <span className="text-[10px] font-medium text-green-700 bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10 mt-1 inline-block">
              +12.4% MoM
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm col-span-1 sm:col-span-1 lg:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-forest/55 uppercase tracking-wider">Avg Quality</span>
            <div className="w-7 h-7 rounded-lg bg-sage/10 flex items-center justify-center text-sage">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-forest">84.2%</h3>
            <span className="text-[10px] font-medium text-green-700 bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10 mt-1 inline-block">
              +4.8% growth
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm col-span-1 sm:col-span-1 lg:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-forest/55 uppercase tracking-wider">Optimized Shift</span>
            <div className="w-7 h-7 rounded-lg bg-sage/10 flex items-center justify-center text-sage">
              <Zap className="w-4 h-4 text-sand" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-forest">+142%</h3>
            <span className="text-[10px] font-medium text-green-700 bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10 mt-1 inline-block">
              Avg gain index
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm col-span-1 sm:col-span-1 lg:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-forest/55 uppercase tracking-wider">Token Cap</span>
            <div className="w-7 h-7 rounded-lg bg-sage/10 flex items-center justify-center text-sage">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-forest">3.4M</h3>
            <span className="text-[10px] font-medium text-red-700 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10 mt-1 inline-block">
              65% of limits
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm col-span-1 sm:col-span-1 lg:col-span-2 flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-forest/55 uppercase tracking-wider">Cost Preserved</span>
            <div className="w-7 h-7 rounded-lg bg-sage/10 flex items-center justify-center text-sage">
              <DollarSign className="w-4 h-4 text-sand" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-forest">$1,248.50</h3>
            <span className="text-[10px] font-medium text-green-700 bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10 mt-1 inline-block">
              Saved via smart compression
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Hub & Connected Models Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Area Chart */}
        <div className="bg-white p-6 rounded-2xl border border-sage/15 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-sm font-bold text-forest">Prompt Performance & Cost Trends</h2>
              <p className="text-[10px] text-forest/50">Evaluations of quality score trends against API costs over time</p>
            </div>
            <div className="flex space-x-4 text-[10px] font-semibold text-forest/70">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#8FAF9B] inline-block" />
                <span>Quality Score (%)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#D8B56A] inline-block" />
                <span>Cost Saving index</span>
              </span>
            </div>
          </div>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8FAF9B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8FAF9B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="costColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D8B56A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#D8B56A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="day" stroke={axisColor} fontSize={10} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={10} tickLine={false} />
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
                <Area type="monotone" dataKey="score" stroke="#8FAF9B" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" name="Avg Quality" />
                <Area type="monotone" dataKey="tokens" stroke="#D8B56A" strokeWidth={1.5} fillOpacity={0.8} fill="url(#costColor)" name="Token Load" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Effectiveness Radial Ring */}
        <div className="bg-white p-6 rounded-2xl border border-sage/15 shadow-sm col-span-1 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-forest">Active Connected Models</h2>
            <p className="text-[10px] text-forest/50">Model effectiveness score vs query load distribution share</p>
          </div>
          <div className="my-3 h-[140px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="share"
                >
                  {modelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: "8px",
                    fontFamily: "ui-sans-serif",
                    color: "#2F3A33"
                  }}
                  itemStyle={{
                    color: "#2F3A33"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-[9px] uppercase tracking-wider text-forest/55 font-bold block">Top Model</span>
              <span className="text-xs font-bold text-sage">Gemini 3.5</span>
            </div>
          </div>
          <div className="space-y-2">
            {modelData.map((model, i) => (
              <div key={model.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[i] }} />
                  <span className="font-semibold text-xs text-forest/90">{model.name}</span>
                </div>
                <div className="text-[10px] font-bold text-forest/50 flex items-center space-x-1.5">
                  <span>Eff: {model.effectiveness}%</span>
                  <span className="bg-cream px-2 py-0.5 rounded border border-sage/10">{model.share}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Logs & Optimization Insights split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-2xl border border-sage/15 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-sm font-bold text-forest">Recent Activity Feed</h2>
              <p className="text-[10px] text-forest/50">Continuous log of analyzed prompts and test iterations</p>
            </div>
            <button
              onClick={() => onNavigate("library")}
              className="text-xs font-bold text-sage hover:text-sage/85 flex items-center space-x-1 cursor-pointer"
            >
              <span>View Library</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((act) => (
              <div key={act.id} className="p-4 rounded-xl bg-cream/50 border border-sage/10 hover:border-sage/25 transition-all text-xs">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-forest">{act.title}</div>
                  <span className="text-[10px] text-forest/45">{act.time}</span>
                </div>
                <p className="text-forest/70 mt-1">{act.description}</p>
                <div className="mt-2.5 flex items-center justify-between text-[10px] font-bold text-sage">
                  <span className="px-2 py-0.5 rounded bg-sage/10 uppercase tracking-widest text-[9px]">{act.type}</span>
                  <span className="text-sand italic bg-sand/10 px-2 py-0.5 rounded">{act.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical advice / insights */}
        <div className="bg-white p-6 rounded-2xl border border-sage/15 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-forest">Active Suggestion Insights</h2>
            <p className="text-[10px] text-forest/50">Proactive diagnostics compiled by model-based evaluation routines</p>
          </div>
          <div className="space-y-4 my-4 flex-1 justify-center flex flex-col">
            <div className="flex items-start space-x-3.5 bg-sage/5 p-4 rounded-xl border border-sage/10">
              <div className="w-8 h-8 rounded-lg bg-sage/20 flex items-center justify-center shrink-0 text-forest">
                <Sparkles className="w-4 h-4 text-sand" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-forest">Reduce redundant pre-ambles</h4>
                <p className="text-[11px] text-forest/75 mt-0.5 leading-relaxed">
                  "Please be extremely cautious as you evaluate the query..." is chewing up an average of 18 input tokens. Switch to direct declarative directives like "Evaluate query with constraints...".
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 bg-sand/5 p-4 rounded-xl border border-sand/10">
              <div className="w-8 h-8 rounded-lg bg-sand/20 flex items-center justify-center shrink-0 text-sand">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-forest">Peak latency threshold detected</h4>
                <p className="text-[11px] text-forest/75 mt-0.5 leading-relaxed">
                  Dual execution latency spikes between 2 PM and 4 PM. We advise configuring system caching for standard static prompt lookups to save 400ms.
                </p>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-forest/45 p-3 rounded-lg border border-sage/10 bg-cream font-mono leading-relaxed">
            💡 TIP: Standardizing model schema compliance prevents JSON parsing errors in 99.4% of high-volume pipeline runs.
          </div>
        </div>
      </div>
    </div>
  );
};
