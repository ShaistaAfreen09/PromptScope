import React, { useState } from "react";
import { Sparkles, Mail, AlertCircle, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebase";

interface ForgotPasswordPageProps {
  onNavigate: (tab: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please key in your email address.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("A password reset link has been dispatched to your email inbox.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to transmit password reset email. Check standard config.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-[#8FAF9B]/5 blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#D8B56A]/5 blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={() => onNavigate("login")}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-[#2F3A33]/70 hover:text-[#2F3A33] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </button>

        <div className="flex items-center justify-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-[#8FAF9B] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#2F3A33]">PromptScope</span>
            <span className="block text-[9px] text-[#8FAF9B] font-medium tracking-widest uppercase -mt-1">
              AI Prompt Intelligence
            </span>
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-[#2F3A33]">
          Reset your password
        </h2>
        <p className="mt-1.5 text-center text-xs text-[#2F3A33]/60 font-sans">
          Provide your enterprise email below and we'll dispatch a link to securely recover your credentials.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-[#8FAF9B]/15 shadow-md rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleResetPassword}>
            {error && (
              <div className="rounded-xl bg-red-500/5 p-4 border border-red-500/10 text-xs text-red-700 font-medium flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-green-500/5 p-4 border border-green-500/15 text-xs text-green-800 font-medium flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#8FAF9B]" />
                <span>{success}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#2F3A33]/80 uppercase tracking-wider mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#2F3A33]/45" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#FAF8F3] border border-[#8FAF9B]/20 rounded-xl text-sm placeholder-[#2F3A33]/40 focus:outline-none focus:ring-2 focus:ring-[#8FAF9B]/55 focus:border-[#8FAF9B] transition-all"
                  placeholder="name@organization.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-[#8FAF9B] hover:bg-[#8FAF9B]/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8FAF9B] disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transmitting link...</span>
                </div>
              ) : (
                "Transmit Reset Link"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
