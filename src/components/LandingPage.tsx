import React from "react";
import { motion } from "motion/react";
import { Sparkles, Zap, ShieldCheck, Activity, ChevronRight, MessageSquare, ListCollapse, Layers2, FileText } from "lucide-react";

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onGoogleSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onGoogleSignIn }) => {
  return (
    <div className="bg-[#FAF8F3] text-[#2F3A33] min-h-screen selection:bg-[#8FAF9B]/20 selection:text-[#2F3A33]">
      {/* Navbar */}
      <nav className="border-b border-[#8FAF9B]/15 bg-[#FAF8F3]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                className="w-9 h-9 rounded-xl bg-[#8FAF9B] flex items-center justify-center text-white shadow-sm"
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              <div>
                <span className="text-xl font-bold tracking-tight text-[#2F3A33]">PromptScope</span>
                <span className="block text-[9px] text-[#8FAF9B] font-medium tracking-widest uppercase -mt-1">
                  AI Prompt Intelligence
                </span>
              </div>
            </div>
            <div className="hidden md:flex space-x-8 text-sm font-medium">
              <a href="#features" className="text-[#2F3A33]/70 hover:text-[#2F3A33] transition-colors">Features</a>
              <a href="#benefits" className="text-[#2F3A33]/70 hover:text-[#2F3A33] transition-colors">Benefits</a>
              <a href="#pricing" className="text-[#2F3A33]/70 hover:text-[#2F3A33] transition-colors">Pricing Hub</a>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onNavigate("login")}
                className="text-xs font-semibold px-4 py-2 text-[#2F3A33]/85 hover:text-[#2F3A33] transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => onNavigate("register")}
                className="text-xs font-semibold px-5 py-2.5 rounded-lg bg-[#8FAF9B] hover:bg-[#8FAF9B]/90 text-[#FAF8F3] shadow-sm hover:shadow transition-all"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Subtle decorative canvas */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#8FAF9B]/5 blur-3xl -z-10" />
        <div className="absolute top-1/3 right-10 w-96 h-96 rounded-full bg-[#D8B56A]/5 blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#8FAF9B]/10 border border-[#8FAF9B]/20 text-xs font-semibold text-[#2F3A33]/85 mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D8B56A]" />
            <span>The Premier Enterprise Prompt Engineering Suite</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-bold text-[#2F3A33] tracking-tight leading-none mb-6"
          >
            Understand. Evaluate. <br />
            <span className="text-[#8FAF9B]">Optimize AI Prompts.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-[#2F3A33]/70 max-w-2xl mx-auto mb-10 leading-relaxed font-sans"
          >
            Empower your developers, product teams, and AI researchers with PromptScope's robust visual testing environment. Track execution latency, grade alignment scores, and slice prompt costs in half.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16"
          >
            <button
              onClick={() => onNavigate("register")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#8FAF9B] hover:bg-[#8FAF9B]/95 text-white font-semibold text-sm shadow-md shadow-[#8FAF9B]/10 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
            >
              <span>Start Optimizing Your Prompts</span>
              <ChevronRight className="w-4 h-4 animate-pulse" />
            </button>
            <button
              onClick={onGoogleSignIn}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-[#8FAF9B]/25 hover:border-[#8FAF9B]/45 bg-[#FAF8F3]/50 hover:bg-[#FAF8F3] text-sm text-[#2F3A33] font-semibold transition-all flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>Sign in with Google</span>
            </button>
          </motion.div>

          {/* Interactive Core Mock Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative mx-auto max-w-4xl rounded-2xl border border-[#8FAF9B]/20 shadow-xl overflow-hidden bg-white"
          >
            <div className="bg-[#8FAF9B]/10 px-4 py-3 flex items-center justify-between border-b border-[#8FAF9B]/15">
              <div className="flex space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400/85 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400/85 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-400/85 inline-block" />
              </div>
              <div className="text-[10px] font-mono tracking-tight text-[#2F3A33]/60 bg-white/65 px-4 py-1 rounded-md border border-[#8FAF9B]/10">
                PROMPT INTENSITY OPTIMIZER ACTIVE
              </div>
              <div className="w-4 h-4" />
            </div>
            <div className="p-4 sm:p-6 text-left grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FAF8F3]/40">
              <div className="space-y-4">
                <div className="text-xs font-bold text-[#2F3A33]/70 uppercase tracking-wider">Before Optimizer</div>
                <div className="bg-white p-4 rounded-xl border border-[#8FAF9B]/15 text-xs text-[#2F3A33]/80 font-mono min-h-[110px] shadow-sm">
                  <p className="text-red-600/70 line-through">"Write code for a login page in python or something."</p>
                  <p className="mt-2 text-xs italic text-[#2F3A33]/40">Critique: Highly ambiguous, lacks architectural guidance, missing token counts and standard schema directives.</p>
                </div>
                <div className="flex items-center space-x-2 text-xs text-red-700/60 font-medium bg-red-500/5 px-2.5 py-1 rounded border border-red-500/10">
                  <span>Clarity Score: 32% (Unusable)</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-xs font-bold text-[#8FAF9B] uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3 h-3 text-[#D8B56A]" />
                  <span>After PromptScope Suite</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#8FAF9B]/20 text-xs text-[#2F3A33]/90 font-mono min-h-[110px] shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#D8B56A]/10 text-[#D8B56A] text-[8px] font-bold px-2 py-0.5 rounded-bl">96% CLARITY</div>
                  <p className="text-[#2F3A33] font-medium">"Act as a Principal SecOps Architect. Generate a secure Flask authentication mechanism using hashed bcrypt passwords with SQLite database migrations..."</p>
                </div>
                <div className="flex items-center space-x-2 text-xs text-green-800/80 font-medium bg-green-500/5 px-2.5 py-1 rounded border border-green-500/15">
                  <Zap className="w-3.5 h-3.5 text-[#D8B56A]" />
                  <span>Improvement Rate: +200% (Enterprise Ready)</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid Features */}
      <section id="features" className="py-20 bg-white border-t border-b border-[#8FAF9B]/15 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[#2F3A33]">
              High-Fidelity Prompt Intelligence Suite
            </h2>
            <p className="mt-4 text-[#2F3A33]/70 font-sans">
              Stop guessing if your prompts are ready for production. Standardize prompt lifecycle management on our fully integrated stack.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-[#8FAF9B]/15 bg-[#FAF8F3]/30 hover:bg-[#FAF8F3]/60 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#8FAF9B]/15 flex items-center justify-center text-[#8FAF9B] mb-5">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#2F3A33] mb-2">Real-Time Prompt Analytics</h3>
              <p className="text-sm text-[#2F3A33]/70 leading-relaxed">
                Analyze specificity, context richness, and clarity instantly. Receive recommendations formatted with token estimates and cost projections before deploying.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#8FAF9B]/15 bg-[#FAF8F3]/30 hover:bg-[#FAF8F3]/60 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#8FAF9B]/15 flex items-center justify-center text-[#8FAF9B] mb-5">
                <Zap className="w-5 h-5 text-[#D8B56A]" />
              </div>
              <h3 className="text-lg font-bold text-[#2F3A33] mb-2">Dual-Engine Optimizer</h3>
              <p className="text-sm text-[#2F3A33]/70 leading-relaxed">
                Repackage dry, simple instructions into high-compliance prompts using proprietary LLM optimization queries optimized for Gemini and open-source models.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#8FAF9B]/15 bg-[#FAF8F3]/30 hover:bg-[#FAF8F3]/60 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#8FAF9B]/15 flex items-center justify-center text-[#8FAF9B] mb-5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#2F3A33] mb-2">Secure API Vault</h3>
              <p className="text-sm text-[#2F3A33]/70 leading-relaxed">
                Connect your workspace parameters, restrict token budgets, and secure third-party model keys with cloud-native environment variable proxies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Content */}
      <section id="benefits" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            <div className="lg:col-span-5 mb-12 lg:mb-0">
              <h2 className="text-3xl font-bold tracking-tight text-[#2F3A33] mb-6">
                Why product teams standardized on PromptScope
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8FAF9B]/25 flex items-center justify-center text-[#2F3A33] font-semibold text-xs mt-1">✓</div>
                  <div className="ml-4">
                    <h4 className="font-bold text-[#2F3A33]">92% Alignment Score Compliance</h4>
                    <p className="text-xs text-[#2F3A33]/70 mt-0.5">Ensure your generative LLM calls conform to raw schemas, reducing json parser faults.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8FAF9B]/25 flex items-center justify-center text-[#2F3A33] font-semibold text-xs mt-1">✓</div>
                  <div className="ml-4">
                    <h4 className="font-bold text-[#2F3A33]">Cost Reductions</h4>
                    <p className="text-xs text-[#2F3A33]/70 mt-0.5">Truncate excessive system instructions while retaining specificity to slash billing overheads.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8FAF9B]/25 flex items-center justify-center text-[#2F3A33] font-semibold text-xs mt-1">✓</div>
                  <div className="ml-4">
                    <h4 className="font-bold text-[#2F3A33]">Playground Benchmarking</h4>
                    <p className="text-xs text-[#2F3A33]/70 mt-0.5">Test prompts side-by-side on live models with latency logging and latency charts.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#8FAF9B]/15 shadow-md">
              <div className="flex items-center justify-between pb-4 border-b border-[#8FAF9B]/10 mb-6">
                <span className="font-bold text-sm tracking-wide text-[#2F3A33]">HISTORIC OPTIMIZATION PROGRESS</span>
                <span className="text-[10px] text-[#8FAF9B] font-mono tracking-widest uppercase">AUTO REPORT DAILY</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#2F3A33]/70 mb-1.5">
                    <span>Average Specificity improvement rate</span>
                    <span className="text-[#8FAF9B]">88%</span>
                  </div>
                  <div className="w-full bg-[#FAF8F3] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#8FAF9B] h-2 rounded-full" style={{ width: "88%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#2F3A33]/70 mb-1.5">
                    <span>Token Overhead Optimization</span>
                    <span className="text-[#D8B56A]">45%</span>
                  </div>
                  <div className="w-full bg-[#FAF8F3] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#D8B56A] h-2 rounded-full" style={{ width: "45%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#2F3A33]/70 mb-1.5">
                    <span>Accuracy Stability Index</span>
                    <span className="text-[#8FAF9B]">94%</span>
                  </div>
                  <div className="w-full bg-[#FAF8F3] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#8FAF9B] h-2 rounded-full" style={{ width: "94%" }} />
                  </div>
                </div>
              </div>
              <div className="bg-[#FAF8F3] mt-6 p-4 rounded-xl text-xs border border-[#8FAF9B]/10 text-[#2F3A33]/70 leading-relaxed font-mono">
                💡 "A structured 3-shot prompt with context limits provides up to 34% better accuracy than lengthy paragraph prompts."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section Placeholder */}
      <section id="pricing" className="py-20 bg-white border-t border-[#8FAF9B]/15">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#2F3A33] mb-4">Enterprise Grade Pricing Model</h2>
          <p className="text-sm text-[#2F3A33]/70 max-w-xl mx-auto mb-12">
            No credit card setup required for our standard research tier. Pay only as you scale to higher prompt testing velocities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free/Dev tier */}
            <div className="border border-[#8FAF9B]/20 rounded-2xl p-8 bg-[#FAF8F3]/20 relative flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#8FAF9B] uppercase bg-[#8FAF9B]/10 px-3 py-1 rounded-full">Explorer</span>
                <h3 className="text-xl font-bold mt-4 text-[#2F3A33]">Standard Workspace</h3>
                <p className="text-sm mt-2 text-[#2F3A33]/60 mb-6">Excellent choice for researchers and independent developers.</p>
                <div className="my-4">
                  <span className="text-4xl font-bold text-[#2F3A33]">$0</span>
                  <span className="text-sm text-[#2F3A33]/60"> / forever free</span>
                </div>
                <ul className="text-xs text-left text-[#2F3A33]/85 space-y-3 border-t border-[#8FAF9B]/10 pt-6">
                  <li className="flex items-center space-x-2">
                    <span className="text-[#8FAF9B] font-bold">✓</span>
                    <span>100 Analyzed Prompts / month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-[#8FAF9B] font-bold">✓</span>
                    <span>Standard Playground Access</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-[#8FAF9B] font-bold">✓</span>
                    <span>Basic Dual Optimizer Engine</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate("register")}
                className="mt-8 w-full py-3 rounded-xl border border-[#8FAF9B]/35 hover:-translate-y-0.5 text-[#2F3A33] font-semibold text-xs bg-white text-center transition-all shadow-sm"
              >
                Get Started
              </button>
            </div>

            {/* Paid tier */}
            <div className="border border-[#8FAF9B]/30 rounded-2xl p-8 bg-white relative flex flex-col justify-between shadow-md">
              <div className="absolute -top-3 right-5 bg-[#D8B56A] text-[#FAF8F3] text-[9px] font-bold tracking-widest px-3 py-1 rounded-full uppercase shadow">
                Most Popular
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#D8B56A] uppercase bg-[#D8B56A]/15 px-3 py-1 rounded-full">Startup</span>
                <h3 className="text-xl font-bold mt-4 text-[#2F3A33]">Scale Platform</h3>
                <p className="text-sm mt-2 text-[#2F3A33]/60 mb-6">High intensity dual testing pipeline for scaling startups.</p>
                <div className="my-4">
                  <span className="text-4xl font-bold text-[#2F3A33]">$49</span>
                  <span className="text-sm text-[#2F3A33]/60"> / monthly billing</span>
                </div>
                <ul className="text-xs text-left text-[#2F3A33]/85 space-y-3 border-t border-[#8FAF9B]/10 pt-6">
                  <li className="flex items-center space-x-2">
                    <span className="text-[#8FAF9B] font-bold">✓</span>
                    <span>Unlimited Prompt Evaluations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-[#8FAF9B] font-bold">✓</span>
                    <span>Side-by-Side latency comparison charts</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-[#8FAF9B] font-bold">✓</span>
                    <span>Dedicated Team Organization shared library</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate("register")}
                className="mt-8 w-full py-3 rounded-xl bg-[#8FAF9B] hover:bg-[#8FAF9B]/95 text-white font-semibold text-xs text-center transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Unlock Platform Scale
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Primary CTA */}
      <section className="py-24 bg-[#8FAF9B]/10 text-center relative border-t border-[#8FAF9B]/15">
        <div className="max-w-4xl mx-auto px-4 z-10 relative">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2F3A33] mb-4">
            Maximize your Generative AI output fidelity today
          </h2>
          <p className="text-sm sm:text-base text-[#2F3A33]/70 mb-10 max-w-2xl mx-auto font-sans">
            Start modeling, refining, and tracking compliance across model groups with single sign-on security.
          </p>
          <button
            onClick={() => onNavigate("register")}
            className="px-10 py-4 rounded-xl bg-[#8FAF9B] hover:bg-[#8FAF9B]/95 text-white font-semibold text-sm shadow-md shadow-[#8FAF9B]/10 transition-all hover:scale-[1.02]"
          >
            Start Optimizing Your Prompts Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2F3A33] text-[#FAF8F3]/65 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs">
          <p className="font-semibold text-[#FAF8F3]/90 mb-2">PromptScope - Commercial Prompt Intelligence Platform</p>
          <p className="font-mono">© 2026 PromptScope Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
