import React, { useState } from "react";
import { AnimatePresence } from "motion/react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";

import { Dashboard } from "./components/Dashboard";
import { Playground } from "./components/Playground";
import { PromptAnalytics } from "./components/PromptAnalytics";
import { PromptOptimizer } from "./components/PromptOptimizer";
import { PromptLibrary } from "./components/PromptLibrary";
import { ModelInsights } from "./components/ModelInsights";
import { Reports } from "./components/Reports";
import { ApiKeysPage } from "./components/ApiKeysPage";
import { SettingsPage } from "./components/SettingsPage";
import { UserProfilePage } from "./components/UserProfilePage";
import { NotificationCenter } from "./components/NotificationCenter";
import { OrganizationPage } from "./components/OrganizationPage";

import {
  Sparkles,
  LayoutDashboard,
  Play,
  BarChart2,
  Zap,
  BookOpen,
  Cpu,
  FileText,
  Key,
  Settings,
  User,
  Menu,
  X,
  Bell,
  Users
} from "lucide-react";

function MainAppContent() {
  const { user, profile, loading, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-sage border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-forest/70 uppercase tracking-widest">
          Securing Access Gateway...
        </span>
      </div>
    );
  }

  // Handle redirect if not authenticated but trying to access protected routes
  const publicTabs = ["landing", "login", "register", "forgot-password"];
  const isPublic = publicTabs.includes(activeTab);

  if (!user && !isPublic) {
    // Force to login if not logged in
    return (
      <LoginPage
        onNavigate={(tab) => setActiveTab(tab)}
        onSuccess={() => setActiveTab("dashboard")}
      />
    );
  }

  if (user && isPublic && activeTab !== "landing") {
    // If logged in but on login/register/forgot pages, redirect to dashboard
    setActiveTab("dashboard");
  }

  // Render Public Landing Page
  if (activeTab === "landing") {
    return (
      <LandingPage
        onNavigate={(tab) => {
          if (user && (tab === "login" || tab === "register")) {
            setActiveTab("dashboard");
          } else {
            setActiveTab(tab);
          }
        }}
        onGoogleSignIn={async () => {
          try {
            await signInWithGoogle();
            setActiveTab("dashboard");
          } catch (e) {
            console.error("Google login failure:", e);
          }
        }}
      />
    );
  }

  if (activeTab === "login") {
    return (
      <LoginPage
        onNavigate={(tab) => setActiveTab(tab)}
        onSuccess={() => setActiveTab("dashboard")}
      />
    );
  }

  if (activeTab === "register") {
    return (
      <RegisterPage
        onNavigate={(tab) => setActiveTab(tab)}
        onSuccess={() => setActiveTab("dashboard")}
      />
    );
  }

  if (activeTab === "forgot-password") {
    return (
      <ForgotPasswordPage
        onNavigate={(tab) => setActiveTab(tab)}
      />
    );
  }

  // Side navigation links mapping
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "playground", label: "AI Playground", icon: Play },
    { id: "analytics", label: "Prompt Analytics", icon: BarChart2 },
    { id: "optimizer", label: "Prompt Optimizer", icon: Zap },
    { id: "library", label: "Prompt Library", icon: BookOpen },
    { id: "insights", label: "Model Insights", icon: Cpu },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "apikeys", label: "API Keys", icon: Key },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "organization", label: "Organization", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "profile", label: "User Profile", icon: User }
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-cream text-forest flex flex-col md:flex-row font-sans leading-normal tracking-normal selection:bg-sage/20 selection:text-forest transition-colors duration-200">
      {/* Mobile Top Header Bar */}
      <header className="md:hidden border-b border-sage/15 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between sticky top-0 z-40 transition-colors duration-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-sage flex items-center justify-center text-white">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-forest block">PromptScope</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded-md text-forest/70 hover:text-forest hover:bg-sage/5"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Main Sidebar Framework */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-sage/20 pt-5 pb-4 flex flex-col justify-between z-30 transition-all duration-300 transform md:translate-x-0 md:static md:h-screen shrink-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          <div className="px-6 flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sage flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-forest block">PromptScope</span>
              <span className="block text-[8px] text-sage font-bold tracking-widest uppercase -mt-1">
                SaaS Intelligence Hub
              </span>
            </div>
          </div>

          {/* Navigation Links Group */}
          <nav className="px-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-sage/15 text-forest border-l-4 border-l-sage pl-3.5"
                      : "text-forest/70 hover:text-forest hover:bg-sage/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-sage" : "text-forest/55"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account Quick Link footer */}
        <div className="px-3 border-t border-sage/10 pt-4 mt-auto space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-cream/70 rounded-xl border border-sage/10">
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.uid || "manoj"}`}
              className="w-8 h-8 rounded-lg bg-sage/10 p-1"
              alt="Avatar"
            />
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-forest truncate">
                {profile?.displayName || "Manoj Kumar"}
              </span>
              <span className="block text-[9px] text-forest/50 truncate">
                {profile?.role || "Engineer"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main workspace arena */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 md:max-h-screen relative">
        <AnimatePresence mode="wait">
          <div key={activeTab}>
            {activeTab === "dashboard" && <Dashboard onNavigate={(tab) => setActiveTab(tab)} userName={profile?.displayName || "Manoj"} />}
            {activeTab === "playground" && <Playground />}
            {activeTab === "analytics" && <PromptAnalytics />}
            {activeTab === "optimizer" && <PromptOptimizer />}
            {activeTab === "library" && <PromptLibrary />}
            {activeTab === "insights" && <ModelInsights />}
            {activeTab === "reports" && <Reports />}
            {activeTab === "apikeys" && <ApiKeysPage />}
            {activeTab === "notifications" && <NotificationCenter />}
            {activeTab === "organization" && <OrganizationPage />}
            {activeTab === "settings" && <SettingsPage />}
            {activeTab === "profile" && <UserProfilePage />}
          </div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
