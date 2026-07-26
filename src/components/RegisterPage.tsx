import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Mail, Lock, User, AlertCircle, ArrowLeft, Loader2, Compass } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useAuth } from "../contexts/AuthContext";

interface RegisterPageProps {
  onNavigate: (tab: string) => void;
  onSuccess: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithGoogle, signInAsGuest } = useAuth();

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill out all input fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update display name
      await updateProfile(userCredential.user, {
        displayName: name
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed") {
        setError("Email/Password registration is disabled in Firebase Console. Enable Email/Password in Authentication > Sign-in method, or use Guest Mode below.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email address is already in use.");
      } else {
        setError(err.message || "E-mail registration failed. Please check details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed") {
        setError("Google Sign-In is disabled in Firebase Console. Enable Google under Authentication > Sign-in method, or use Guest Mode.");
      } else {
        setError("Google authentication failed. Please try again or use Guest Mode.");
      }
    }
  };

  const handleGuestRegister = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInAsGuest();
      onSuccess();
    } catch (err: any) {
      console.error(err);
      onSuccess();
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
          onClick={() => onNavigate("landing")}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-[#2F3A33]/70 hover:text-[#2F3A33] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
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
          Create your account
        </h2>
        <p className="mt-1.5 text-center text-xs text-[#2F3A33]/60 font-sans">
          Join PromptScope. Start optimizing and tracking prompt quality scores.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-[#8FAF9B]/15 shadow-md rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleEmailRegister}>
            {error && (
              <div className="rounded-xl bg-red-500/5 p-4 border border-red-500/10 text-xs text-red-700 font-medium flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-xs font-bold text-[#2F3A33]/80 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-[#2F3A33]/45" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#FAF8F3] border border-[#8FAF9B]/20 rounded-xl text-sm placeholder-[#2F3A33]/40 focus:outline-none focus:ring-2 focus:ring-[#8FAF9B]/55 focus:border-[#8FAF9B] transition-all"
                  placeholder="Manoj Kumar"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#2F3A33]/80 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#2F3A33]/45" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#FAF8F3] border border-[#8FAF9B]/20 rounded-xl text-sm placeholder-[#2F3A33]/40 focus:outline-none focus:ring-2 focus:ring-[#8FAF9B]/55 focus:border-[#8FAF9B] transition-all"
                  placeholder="name@organization.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#2F3A33]/80 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#2F3A33]/45" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#FAF8F3] border border-[#8FAF9B]/20 rounded-xl text-sm placeholder-[#2F3A33]/40 focus:outline-none focus:ring-2 focus:ring-[#8FAF9B]/55 focus:border-[#8FAF9B] transition-all"
                  placeholder="Min. 6 characters"
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
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#8FAF9B]/15" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-[#2F3A33]/50">Or sign up with</span>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <button
                type="button"
                onClick={handleGoogleRegister}
                className="w-full flex items-center justify-center py-2.5 px-4 border border-[#8FAF9B]/25 rounded-xl bg-[#FAF8F3]/50 hover:bg-[#FAF8F3] text-sm text-[#2F3A33] font-semibold transition-all cursor-pointer space-x-2.5"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.81-2.61-.81-5.63 0-8.24z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Account</span>
              </button>

              <button
                type="button"
                onClick={handleGuestRegister}
                className="w-full flex items-center justify-center py-2.5 px-4 border border-[#8FAF9B]/30 rounded-xl bg-white hover:bg-[#8FAF9B]/10 text-sm text-[#2F3A33] font-semibold transition-all cursor-pointer space-x-2 shadow-xs"
              >
                <Compass className="w-4 h-4 text-[#8FAF9B]" />
                <span>Continue as Guest Practitioner</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#2F3A33]/70 font-sans">
              Already have an account?{" "}
              <button
                onClick={() => onNavigate("login")}
                className="font-bold text-[#8FAF9B] hover:text-[#8FAF9B]/85 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
