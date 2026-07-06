import React, { useEffect, useState } from "react";
import { safeJson } from "../utils";
import { 
  FileText, 
  Download, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles,
  Printer,
  ChevronRight,
  Eye,
  X
} from "lucide-react";

interface GeneratedReport {
  id: string;
  title: string;
  reportType: string;
  format: string;
  createdAt: string;
  data: any;
  aiSummary?: string;
}

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [reportType, setReportType] = useState("prompt_performance");
  const [format, setFormat] = useState("csv");

  // Success trigger
  const [successMsg, setSuccessMsg] = useState("");

  // PDF Preview modal state
  const [selectedPdfReport, setSelectedPdfReport] = useState<GeneratedReport | null>(null);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await safeJson(res);
      if (data.success) {
        setReports(data.reports);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setGenerating(true);
    setSuccessMsg("");
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, reportType, format })
      });
      const data = await safeJson(res);
      if (data.success) {
        setReports(prev => [data.report, ...prev]);
        setSuccessMsg(`Compiled report "${title}" generated!`);
        setTitle("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const triggerDownload = (report: GeneratedReport) => {
    if (report.format === "pdf") {
      // PDF is rendered in high-fidelity view screen modal
      setSelectedPdfReport(report);
    } else {
      // Stream file directly via browser download
      window.open(`/api/reports/download/${report.id}`, "_blank");
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case "prompt_performance": return "Prompt Quality Performance Audit";
      case "model_benchmark": return "AI Model Speed & Cost Benchmark";
      default: return "Workspace Usage & Token Analytics";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#8FAF9B]/15 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#2F3A33] flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#8FAF9B]" />
            <span>SaaS Intelligence Reports</span>
          </h1>
          <p className="text-xs text-[#2F3A33]/60 mt-1">
            Generate and download exportable prompt quality audits, regulatory parameters tracking, and model latency benchmarks.
          </p>
        </div>
        <button 
          onClick={fetchReports}
          className="p-2.5 rounded-lg border border-[#8FAF9B]/25 hover:bg-[#FAF8F3] text-[#2F3A33]/70 transition-all cursor-pointer ml-auto sm:ml-0"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - History list */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-[#8FAF9B]/15 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#2F3A33] uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-[#8FAF9B]" />
              <span>Report Compiled Archive</span>
            </h3>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-[#8FAF9B] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] uppercase tracking-wider text-[#2F3A33]/45">Retrieving compiled list...</span>
              </div>
            ) : reports.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#2F3A33]/45">
                No reports compiled yet. Configure the compiler on the right to start generating reports.
              </div>
            ) : (
              <div className="divide-y divide-[#8FAF9B]/10 space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono font-bold text-[#2F3A33]/40 block">{report.id}</span>
                      <span className="font-bold text-xs text-[#2F3A33]">{report.title}</span>
                      <p className="text-[10px] text-[#2F3A33]/55">
                        {getReportTypeLabel(report.reportType)} • Generated on {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3.5">
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#FAF8F3] text-[#2F3A33]/65 border border-[#8FAF9B]/15">
                        {report.format.toUpperCase()}
                      </span>
                      <button
                        onClick={() => triggerDownload(report)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#8FAF9B]/15 hover:bg-[#8FAF9B]/25 text-[#2F3A33] font-bold text-[10px] flex items-center space-x-1.5 cursor-pointer transition-all border border-[#8FAF9B]/10"
                      >
                        {report.format === "pdf" ? <Eye className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                        <span>{report.format === "pdf" ? "Preview PDF" : "Download"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Generation Config Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-[#8FAF9B]/15 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#2F3A33] uppercase tracking-wider flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-[#8FAF9B]" />
              <span>Compile Executive Report</span>
            </h3>

            <p className="text-[11px] text-[#2F3A33]/65 leading-relaxed">
              Dynamically parse, validate, and aggregate workspace metrics into safe static structures.
            </p>

            <form onSubmit={handleGenerate} className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-[#2F3A33]/60 mb-1.5 uppercase">Report Title</label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Q2 Core Prompt Quality Audit"
                  className="w-full text-xs px-3 py-2.5 bg-[#FAF8F3] border border-[#8FAF9B]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8FAF9B]/35"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#2F3A33]/60 mb-1.5 uppercase">Audit Model Template</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-[#FAF8F3] border border-[#8FAF9B]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8FAF9B]/35"
                >
                  <option value="prompt_performance">Prompt Performance Audit Report</option>
                  <option value="model_benchmark">AI Provider Speed & Cost Benchmark</option>
                  <option value="usage_analytics">Workspace Token & Pricing Analytics</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#2F3A33]/60 mb-1.5 uppercase">Output Export Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-[#FAF8F3] border border-[#8FAF9B]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8FAF9B]/35"
                >
                  <option value="csv">CSV Spreadsheet file (.csv)</option>
                  <option value="json">Raw JSON Document (.json)</option>
                  <option value="pdf">Printable PDF Layout (.pdf)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={generating || !title}
                className="w-full py-2.5 rounded-xl bg-[#8FAF9B] hover:bg-[#8FAF9B]/90 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Compiling Metrics...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generate Report Structure</span>
                  </>
                )}
              </button>
            </form>

            {successMsg && (
              <div className="p-3 bg-green-500/5 text-green-700 border border-green-500/10 rounded-xl text-[10px] font-medium leading-relaxed">
                ✓ {successMsg}
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#8FAF9B]/15 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#2F3A33] uppercase tracking-wider">Regulatory Compliance standards</h3>
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl border border-[#8FAF9B]/10 bg-[#FAF8F3] space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#2F3A33]/45 block">Active Guardrails v1.2</span>
                <p className="text-[10px] text-[#2F3A33]/70 leading-relaxed">Flags open-ended programmatic vulnerabilities and sensitive variable disclosures.</p>
              </div>

              <div className="p-3 rounded-xl border border-[#8FAF9B]/10 bg-[#FAF8F3]/50 space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#2F3A33]/45 block">Privacy Compliance</span>
                <p className="text-[10px] text-[#2F3A33]/70 leading-relaxed">Automatic regex filters scrub personally identifiable metadata variables.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable / View PDF Modal (Phase 2) */}
      {selectedPdfReport && (
        <div className="fixed inset-0 bg-[#2F3A33]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#8FAF9B]/25 w-full max-w-2xl shadow-xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-[#8FAF9B]/15 flex justify-between items-center bg-[#FAF8F3]/60">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#8FAF9B]" />
                <h3 className="font-bold text-sm text-[#2F3A33]">Printable Report Workspace</h3>
              </div>
              <button 
                onClick={() => setSelectedPdfReport(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-gray-400 hover:text-[#2F3A33] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document body (printable view) */}
            <div className="p-8 overflow-y-auto space-y-6 text-xs text-[#2F3A33] font-sans" id="printable-pdf-area">
              <div className="flex justify-between items-start border-b-2 border-[#8FAF9B] pb-5">
                <div>
                  <h1 className="text-lg font-extrabold tracking-tight">PROMPTSCOPE QUALITY ASSURANCE</h1>
                  <p className="text-[#2F3A33]/65 text-[10px]">Security, Latency, and Cost Compliance Metrics</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-mono block text-[#2F3A33]/40">Report Hash</span>
                  <span className="font-mono text-[10px] font-bold text-[#8FAF9B]">{selectedPdfReport.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#FAF8F3] p-4 rounded-xl border border-[#8FAF9B]/10">
                <div>
                  <span className="text-[9px] uppercase font-mono text-[#2F3A33]/45 block">Document Name</span>
                  <span className="font-bold text-xs">{selectedPdfReport.title}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono text-[#2F3A33]/45 block">Compiled Timestamp</span>
                  <span className="font-mono text-xs">{new Date(selectedPdfReport.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-extrabold text-[11px] uppercase tracking-wider border-b border-slate-100 pb-1">Aggregated Workspace Results</h4>
                
                {selectedPdfReport.reportType === "prompt_performance" ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2.5 text-center">
                      <div className="p-2.5 bg-[#FAF8F3] rounded-lg border border-[#8FAF9B]/10">
                        <span className="block text-[18px] font-bold text-[#8FAF9B] font-mono">{selectedPdfReport.data.totalAnalyzed}</span>
                        <span className="text-[9px] text-[#2F3A33]/55">Prompts Audited</span>
                      </div>
                      <div className="p-2.5 bg-[#FAF8F3] rounded-lg border border-[#8FAF9B]/10">
                        <span className="block text-[18px] font-bold text-[#8FAF9B] font-mono">{selectedPdfReport.data.averageScore}%</span>
                        <span className="text-[9px] text-[#2F3A33]/55">Average Score</span>
                      </div>
                      <div className="p-2.5 bg-[#FAF8F3] rounded-lg border border-[#8FAF9B]/10">
                        <span className="block text-[18px] font-bold text-red-600 font-mono">{selectedPdfReport.data.vulnerabilitiesFlagged}</span>
                        <span className="text-[9px] text-red-600 font-bold">PII Flagged</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#2F3A33]/65 leading-relaxed bg-amber-50/20 border border-amber-500/10 p-3 rounded-lg mt-3">
                      {selectedPdfReport.aiSummary || "💡 Analysis Findings: The workspace prompts exhibit exceptional structural clarity, but minor context gaps remain when defining targeted variable schemas. Ensure developer templates specify JSON output formats explicitly to bypass pipeline failures."}
                    </p>
                  </div>
                ) : Array.isArray(selectedPdfReport.data) ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-200 font-bold text-[9px] uppercase pb-2">
                          <th className="pb-2">Target Model</th>
                          <th className="pb-2">Average Speed</th>
                          <th className="pb-2">Cost/1M Tokens</th>
                          <th className="pb-2 text-right">Alignment Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPdfReport.data.map((row: any, idx: number) => (
                          <tr key={idx} className="border-b border-slate-100">
                            <td className="py-2.5 font-bold">{row.model}</td>
                            <td className="py-2.5">{row.avgLatencyMs}ms</td>
                            <td className="py-2.5 font-mono text-[#8FAF9B]">{row.costPerMillion}</td>
                            <td className="py-2.5 text-right font-mono font-bold">{row.alignmentScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(selectedPdfReport.data || {}).map(([key, val]: any, idx: number) => (
                      <div key={idx} className="flex justify-between py-2 border-b border-slate-100">
                        <span className="font-bold capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-mono text-right">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-dashed border-[#8FAF9B]/40 pt-5 text-center text-[10px] text-[#2F3A33]/45">
                <span className="block font-bold">✓ End of Document</span>
                <span className="block">PromptScope Compliance Engine • Automated Verification Hub</span>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 border-t border-[#8FAF9B]/15 bg-[#FAF8F3]/60 flex justify-end space-x-2">
              <button 
                onClick={() => setSelectedPdfReport(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-[#FAF8F3] font-bold text-xs cursor-pointer transition-all"
              >
                Close View
              </button>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#8FAF9B] hover:bg-[#8FAF9B]/90 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-all shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
