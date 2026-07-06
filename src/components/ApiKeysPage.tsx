import React, { useEffect, useState } from "react";
import { safeJson } from "../utils";
import { 
  Key, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  Check, 
  Trash2, 
  Plus, 
  Play, 
  Server, 
  Lock,
  Unlock,
  AlertTriangle
} from "lucide-react";

interface StoredKey {
  id: string;
  provider: string;
  maskedKey: string;
  isActive: boolean;
  lastValidatedAt: string;
  createdAt: string;
}

export const ApiKeysPage: React.FC = () => {
  const [keys, setKeys] = useState<StoredKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validatingId, setValidatingId] = useState<string | null>(null);

  // Form Inputs
  const [provider, setProvider] = useState("Google Gemini");
  const [rawKey, setRawKey] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/keys");
      const data = await safeJson(res);
      if (data.success) {
        setKeys(data.keys);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawKey.trim()) return;

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, rawKey })
      });
      const data = await safeJson(res);
      if (res.ok && data.success) {
        setKeys(prev => [data.key, ...prev]);
        setRawKey("");
        setSuccessMsg(`Secure API Key for ${provider} registered with AES Base64 masking!`);
      } else {
        setErrorMsg(data.error || "Failed to save secret key.");
      }
    } catch (err) {
      setErrorMsg("Failed to communicate with connection proxy.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidate = async (id: string) => {
    setValidatingId(id);
    try {
      const res = await fetch("/api/keys/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await safeJson(res);
      if (data.success) {
        setKeys(prev => prev.map(k => k.id === id ? { ...k, isActive: true, lastValidatedAt: data.lastValidated } : k));
        // Show success alert in UI
        const keyObj = keys.find(k => k.id === id);
        if (keyObj) {
          setSuccessMsg(`Gateway connection to ${keyObj.provider} verified and validated!`);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setValidatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this credential? Active prompt pipelines referencing this provider may fail.")) return;

    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setKeys(prev => prev.filter(k => k.id !== id));
        setSuccessMsg("Credential successfully revoked from secure database cluster.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#8FAF9B]/15 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#2F3A33] flex items-center space-x-2">
            <Key className="w-5 h-5 text-[#8FAF9B]" />
            <span>API Keys & Credentials Vault</span>
          </h1>
          <p className="text-xs text-[#2F3A33]/60 mt-1">
            Secure, validate, and audit third-party AI provider key environments used for proxying prompt executions.
          </p>
        </div>
        <button 
          onClick={fetchKeys}
          className="p-2.5 rounded-lg border border-[#8FAF9B]/25 hover:bg-[#FAF8F3] text-[#2F3A33]/70 transition-all cursor-pointer ml-auto sm:ml-0"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left - Managed Credentials list */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-[#8FAF9B]/15 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#2F3A33] uppercase tracking-wider flex items-center space-x-1.5">
              <Server className="w-4 h-4 text-[#8FAF9B]" />
              <span>Registered Gateway Credentials</span>
            </h3>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-[#8FAF9B] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-[#2F3A33]/40 tracking-wider">Loading vault...</span>
              </div>
            ) : keys.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#2F3A33]/45">
                No custom API keys registered. Add credentials on the right to establish custom execution routes.
              </div>
            ) : (
              <div className="space-y-3.5">
                {keys.map((key) => (
                  <div 
                    key={key.id} 
                    className="p-4 rounded-xl border border-[#8FAF9B]/15 bg-[#FAF8F3]/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${key.isActive ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
                        <h4 className="font-bold text-xs text-[#2F3A33]">{key.provider}</h4>
                      </div>
                      <div className="flex items-center space-x-1.5 font-mono text-[10px] text-[#2F3A33]/55">
                        <Lock className="w-3 h-3 text-[#2F3A33]/40" />
                        <span>{key.maskedKey}</span>
                      </div>
                      <p className="text-[9px] text-[#2F3A33]/40 font-mono">
                        Validated: {key.lastValidatedAt ? new Date(key.lastValidatedAt).toLocaleString() : "Never"}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleValidate(key.id)}
                        disabled={validatingId === key.id}
                        className="px-3 py-1.5 rounded-lg border border-[#8FAF9B]/25 hover:bg-white text-[#2F3A33] font-bold text-[10px] uppercase flex items-center space-x-1 cursor-pointer transition-all disabled:opacity-50"
                      >
                        {validatingId === key.id ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3" />
                            <span>Test Gateway</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(key.id)}
                        className="p-2 text-red-600 hover:bg-red-500/5 rounded-lg border border-red-500/10 cursor-pointer transition-all"
                        title="Revoke and Delete Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-[#8FAF9B]/5 rounded-xl border border-[#8FAF9B]/15 text-[11px] text-[#2F3A33]/70 space-y-2">
            <h4 className="font-bold text-xs flex items-center space-x-1.5 text-[#2F3A33]">
              <ShieldCheck className="w-4 h-4 text-[#8FAF9B]" />
              <span>AES-256 Envelope Database Encryption Active</span>
            </h4>
            <p className="leading-relaxed text-[10.5px]">
              Raw private keys are encrypted on the server layer before being saved to PostgreSQL storage using strong key envelops. Masked displays ensure developers never leak keys during visual recordings or team screen shares.
            </p>
          </div>
        </div>

        {/* Right - Secure Add Key form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-[#8FAF9B]/15 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#2F3A33] uppercase tracking-wider flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-[#8FAF9B]" />
              <span>Register Private Credential</span>
            </h3>

            <form onSubmit={handleCreateKey} className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-[#2F3A33]/60 mb-1 uppercase">AI Provider Platform</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-[#FAF8F3] border border-[#8FAF9B]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8FAF9B]/30"
                >
                  <option value="Google Gemini">Google Gemini (AI Studio)</option>
                  <option value="OpenAI GPT-4">OpenAI (GPT Portal)</option>
                  <option value="Anthropic Claude">Anthropic (Claude Developer)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#2F3A33]/60 mb-1 uppercase">Raw API Secret Key</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={rawKey}
                    onChange={(e) => setRawKey(e.target.value)}
                    placeholder="sk-or-gemini-key-..."
                    className="w-full text-xs px-3 py-2.5 bg-[#FAF8F3] border border-[#8FAF9B]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8FAF9B]/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !rawKey.trim()}
                className="w-full py-2.5 rounded-xl bg-[#8FAF9B] hover:bg-[#8FAF9B]/90 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Encrypting & Storing...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Encrypt & Vault Key</span>
                  </>
                )}
              </button>
            </form>

            {successMsg && (
              <div className="p-3 bg-green-500/5 text-green-700 border border-green-500/10 rounded-xl text-[10px] font-medium leading-relaxed">
                ✓ {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-500/5 text-red-700 border border-red-500/10 rounded-xl text-[10px] font-medium leading-relaxed">
                ✗ {errorMsg}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/5 text-xs text-red-800 space-y-2">
            <h4 className="font-bold flex items-center space-x-1 text-red-900">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Zero-Exposure Warning</span>
            </h4>
            <p className="text-[10px] leading-relaxed">
              Never share secret API keys in team public repositories or expose client-side headers. PromptScope provides server-mediated proxy endpoints that intercept prompt execution securely inside sandboxed modules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
