import React, { useState } from "react";
import { User, Shield, Briefcase, Mail, Building, Sparkles, LogOut, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const UserProfilePage: React.FC = () => {
  const { profile, logout, updateUserProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || "Manoj Kumar");
  const [organization, setOrganization] = useState(profile?.organization || "PromptLabs SaaS");
  const [role, setRole] = useState(profile?.role || "Prompt Engineer");
  const [bio, setBio] = useState(profile?.bio || "AI Researcher specialized in commercial prompting architectures and output evaluations.");
  const [avatarSeed, setAvatarSeed] = useState(profile?.uid || "manoj");

  const [notif, setNotif] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotif(null);
    try {
      await updateUserProfile({
        displayName,
        organization,
        role,
        bio,
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`
      });
      setNotif("Profile successfully synchronized.");
      setTimeout(() => setNotif(null), 3000);
    } catch (err) {
      console.error(err);
      setNotif("Profile update failed.");
    }
  };

  const handleRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(randomSeed);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-[#8FAF9B]/15 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-[#2F3A33]">User Profile</h1>
        <p className="text-xs text-[#2F3A33]/60 mt-1">
          Review display parameters, organize credentials, and secure your session.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side picture and session card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#8FAF9B]/15 shadow-sm text-center space-y-4 flex flex-col items-center">
            <div className="relative">
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`}
                alt="Avatar"
                className="w-24 h-24 rounded-2xl bg-[#8FAF9B]/10 border border-[#8FAF9B]/15 p-2 shadow-inner"
              />
              <button
                type="button"
                onClick={handleRandomAvatar}
                className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-[#8FAF9B] hover:bg-[#8FAF9B]/90 text-white shadow text-[9px] font-bold uppercase transition-all cursor-pointer"
              >
                random
              </button>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#2F3A33]">{profile?.displayName || displayName}</h3>
              <p className="text-[10px] text-[#2F3A33]/55 font-mono">{profile?.email || "manoj0096k@gmail.com"}</p>
            </div>

            <div className="w-full border-t border-[#8FAF9B]/10 pt-4 flex justify-around text-xs font-semibold text-[#2F3A33]/70">
              <div className="text-center">
                <span className="text-[9px] font-bold text-[#2F3A33]/45 block">Group Role</span>
                <span className="text-xs mt-0.5 block">{profile?.role || role}</span>
              </div>
              <div className="text-center border-l border-[#8FAF9B]/10 pl-6">
                <span className="text-[9px] font-bold text-[#2F3A33]/45 block">Usage limits</span>
                <span className="text-xs mt-0.5 block">1,000 runs</span>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="w-full py-2.5 rounded-xl border border-red-500/25 hover:border-red-500/45 hover:bg-red-500/5 text-xs text-red-600 font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer mt-4"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out securely</span>
            </button>
          </div>
        </div>

        {/* Right edit details card */}
        <div className="lg:col-span-8">
          <div className="bg-white p-5 rounded-2xl border border-[#8FAF9B]/15 shadow-sm">
            <h3 className="text-xs font-bold text-[#2F3A33] uppercase tracking-wider mb-4">Edit Profile details</h3>

            {notif && (
              <div className="p-3 bg-green-500/5 text-green-800 border border-green-500/15 rounded-xl text-xs font-medium flex items-center space-x-1.5 mb-4">
                <CheckCircle2 className="w-4 h-4 text-[#8FAF9B]" />
                <span>{notif}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#2F3A33]/70 mb-1.5 uppercase">Display Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#2F3A33]/45">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      className="w-full text-xs pl-10 pr-3 py-2.5 bg-[#FAF8F3] border border-[#8FAF9B]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8FAF9B]/35 focus:border-[#8FAF9B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2F3A33]/70 mb-1.5 uppercase">Organization</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#2F3A33]/45">
                      <Building className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      required
                      className="w-full text-xs pl-10 pr-3 py-2.5 bg-[#FAF8F3] border border-[#8FAF9B]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8FAF9B]/35 focus:border-[#8FAF9B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2F3A33]/70 mb-1.5 uppercase">Role Title</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#2F3A33]/45">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                      className="w-full text-xs pl-10 pr-3 py-2.5 bg-[#FAF8F3] border border-[#8FAF9B]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8FAF9B]/35 focus:border-[#8FAF9B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2F3A33]/70 mb-1.5 uppercase">Email Address (Read-only)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#2F3A33]/45">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={profile?.email || "manoj0096k@gmail.com"}
                      disabled
                      className="w-full text-xs pl-10 pr-3 py-2.5 bg-[#FAF8F3]/50 text-[#2F3A33]/50 border border-[#8FAF9B]/10 rounded-xl cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2F3A33]/70 mb-1.5 uppercase">Bio & Practitioner Info</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-3 bg-[#FAF8F3] border border-[#8FAF9B]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8FAF9B]/35 focus:border-[#8FAF9B] leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#8FAF9B] hover:bg-[#8FAF9B]/90 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer border-none"
                >
                  Save Profile Details
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
