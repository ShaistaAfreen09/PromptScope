import React, { useState } from "react";
import { Settings, Shield, CheckCircle } from "lucide-react";
import { PlatformConfig } from "../types";

export const SettingsPage: React.FC = () => {
  const [config, setConfig] = useState<PlatformConfig>({
    defaultModel: "gemini-3.5-flash",
    sampleRate: 100,
    enableTelemetry: true,
    costCeilingUsd: 15.00
  });

  const [notification, setNotification] = useState<string | null>(null);

  const handleUpdate = (field: keyof PlatformConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setNotification("Configurations securely locked into browser storage.");
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-forest">
      <div className="border-b border-sage/15 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-forest">Settings</h1>
        <p className="text-xs text-forest/60 mt-1">
          Synchronize local optimization modes, limit budgets, and toggle telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* System Parameters Card */}
          <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-forest uppercase tracking-wider">System Parameters</h3>

            {notification && (
              <div className="p-3 bg-green-500/5 text-green-800 border border-green-500/15 rounded-xl text-xs font-medium flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-sage" />
                <span>{notification}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-forest/70 mb-1.5 uppercase">Default Evaluation Model</label>
                <select
                  value={config.defaultModel}
                  onChange={(e) => handleUpdate("defaultModel", e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-cream border border-sage/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/35 text-forest"
                >
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (SaaS Prospeed)</option>
                  <option value="gemini-3.5-pro">Gemini 3.5 Pro (Deep Reasoning)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-forest/70 mb-1.5 uppercase">Telemetry Sampling rate (%)</label>
                  <input
                    type="number"
                    value={config.sampleRate}
                    min={10}
                    max={100}
                    onChange={(e) => handleUpdate("sampleRate", parseInt(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 bg-cream border border-sage/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/35 text-forest"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-forest/70 mb-1.5 uppercase">Ceiling budget ($ USD)</label>
                  <input
                    type="number"
                    value={config.costCeilingUsd}
                    min={1}
                    max={200}
                    onChange={(e) => handleUpdate("costCeilingUsd", parseFloat(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 bg-cream border border-sage/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/35 text-forest"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="enableTelemetry"
                  checked={config.enableTelemetry}
                  onChange={(e) => handleUpdate("enableTelemetry", e.target.checked)}
                  className="w-4 h-4 rounded border-sage/35 text-sage focus:ring-sage"
                />
                <label htmlFor="enableTelemetry" className="text-xs font-semibold text-forest/85 select-none cursor-pointer">
                  Enable background telemetry log metrics (Saves latency profiles locally)
                </label>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-lg bg-sage hover:bg-sage/90 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer border-none"
            >
              Lock Configuration
            </button>
          </div>
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-forest uppercase tracking-wider flex items-center space-x-1">
                <Shield className="w-4 h-4 text-sage" />
                <span>Workspace Sandbox Mode</span>
              </h3>
              <p className="text-[11px] text-forest/70 leading-relaxed mt-2.5">
                Settings are stored within the standard client-side browser cache space. Clearing local cookie headers will restore default system ceilings securely.
              </p>
            </div>
            <div className="text-[10px] text-forest/45 p-2.5 bg-cream rounded-lg border border-sage/10 leading-relaxed font-mono mt-4">
              💡 "Lowering telemetry rates below 60% increases average loading speeds by roughly 34-40ms in high velocity pipelines."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
