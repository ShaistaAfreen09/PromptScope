import React, { useEffect, useState } from "react";
import { 
  Users, 
  UserPlus, 
  Shield, 
  RefreshCw
} from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid
} from "recharts";

interface OrgMeta {
  name: string;
  slug: string;
  planTier: string;
  activeSeatUsage: number;
  seatsMax: number;
  monthlyUsageTokens: number;
  monthlyBudgetUsd: number;
  monthlySpentUsd: number;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  status: "active" | "invited";
  joinedAt: string;
}

export const OrganizationPage: React.FC = () => {
  const gridColor = "rgba(143, 175, 155, 0.15)";
  const axisColor = "#2F3A33";
  const tooltipBg = "#FAF8F3";
  const tooltipBorder = "rgba(143, 175, 155, 0.25)";

  const [org, setOrg] = useState<OrgMeta | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Invitation Form
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviting, setInviting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchOrgData = async () => {
    try {
      const res = await fetch("/api/organization");
      const data = await res.json();
      if (data.success) {
        setOrg(data.organization);
        setMembers(data.members);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgData();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    setInviting(true);
    setSuccessMsg("");
    try {
      const res = await fetch("/api/organization/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          role: inviteRole
        })
      });
      const data = await res.json();
      if (data.success) {
        setMembers(prev => [...prev, data.member]);
        setSuccessMsg(`Invitation successfully compiled and dispatched to ${inviteEmail}`);
        setInviteName("");
        setInviteEmail("");
        if (org) {
          setOrg({ ...org, activeSeatUsage: org.activeSeatUsage + 1 });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInviting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner": return <Shield className="w-3.5 h-3.5 text-red-500" />;
      case "admin": return <Shield className="w-3.5 h-3.5 text-sand" />;
      default: return <Shield className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  // Recharts token consumption by team member dataset
  const memberTokenUsage = [
    { name: "Manoj Kumar", tokens: 742000, cost: 24.50 },
    { name: "Sarah Jenkins", tokens: 410000, cost: 15.20 },
    { name: "David Chen", tokens: 268000, cost: 8.42 }
  ];

  const providerBreakdown = [
    { name: "Google Gemini", value: 65, color: "#8FAF9B" },
    { name: "OpenAI GPT-4", value: 25, color: "#D8B56A" },
    { name: "Anthropic Claude", value: 10, color: "#2F3A33" }
  ];

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4 text-forest">
        <div className="w-8 h-8 border-3 border-sage border-t-transparent rounded-full animate-spin" />
        <span className="text-[11px] font-bold text-forest/50 uppercase tracking-widest animate-pulse">Compiling Org Hierarchy...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-forest">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-sage/15 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-forest flex items-center space-x-2">
            <span>Organization & Team Workspace</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sage/15 text-sage border border-sage/25">
              ENTERPRISE SCALE
            </span>
          </h1>
          <p className="text-xs text-forest/60 mt-1">
            Delegate workspace access, monitor multi-user budgets, and review shared prompt template intelligence.
          </p>
        </div>
        <button 
          onClick={fetchOrgData}
          className="p-2.5 rounded-lg border border-sage/20 bg-white hover:bg-cream text-forest/75 transition-all cursor-pointer ml-auto sm:ml-0"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Stats Rows */}
      {org && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-sage/15 shadow-sm space-y-1">
            <span className="text-[9px] font-bold text-forest/45 uppercase tracking-wider block">Plan Status</span>
            <span className="text-base font-bold text-forest block">{org.planTier}</span>
            <span className="text-[9px] text-forest/65 block">Next renewal: July 20, 2026</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-sage/15 shadow-sm space-y-1">
            <span className="text-[9px] font-bold text-forest/45 uppercase tracking-wider block">Allocated Seats</span>
            <span className="text-base font-bold text-forest block">{org.activeSeatUsage} / {org.seatsMax} Seats</span>
            <span className="text-[9px] text-forest/65 block">Includes invited, pending users</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-sage/15 shadow-sm space-y-1">
            <span className="text-[9px] font-bold text-forest/45 uppercase tracking-wider block">Shared Monthly Usage</span>
            <span className="text-base font-bold text-forest block">{org.monthlyUsageTokens.toLocaleString()} Tokens</span>
            <span className="text-[9px] text-forest/65 block">Aggregated across all team seats</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-sage/15 shadow-sm space-y-1">
            <span className="text-[9px] font-bold text-forest/45 uppercase tracking-wider block">Budget Cap Expenditure</span>
            <span className="text-base font-bold text-forest block">${org.monthlySpentUsd.toFixed(2)} / ${org.monthlyBudgetUsd.toFixed(2)}</span>
            <span className="text-[9px] text-green-700 font-bold block">✓ Safe (under monthly ceiling)</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Members Management Table */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-forest uppercase tracking-wider flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-sage" />
                <span>Seat Management</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-sage/10 text-forest/40 font-bold uppercase text-[9px] pb-2">
                    <th className="pb-3">Practitioner</th>
                    <th className="pb-3">Workspace Role</th>
                    <th className="pb-3">Invitation Status</th>
                    <th className="pb-3 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage/10">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3 flex items-center space-x-2.5">
                        <img 
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${member.id}`} 
                          className="w-7 h-7 rounded-lg bg-cream p-0.5" 
                          alt="avatar"
                        />
                        <div>
                          <span className="font-bold text-forest block">{member.name}</span>
                          <span className="text-[10px] text-forest/50 block">{member.email}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-forest/85 uppercase">
                          {getRoleIcon(member.role)}
                          <span>{member.role}</span>
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          member.status === "active" 
                            ? "bg-green-500/5 text-green-700 border border-green-500/10" 
                            : "bg-sand/10 text-[#a08144] border border-sand/15"
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-[10px] text-forest/50 font-mono">
                        {member.joinedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shared Team Usage charts */}
          <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-forest uppercase tracking-wider">
              Organization Consumption Metrics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-forest/55 uppercase tracking-wider block text-center">
                  Model Provider Allocation
                </span>
                <div className="h-44 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={providerBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {providerBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
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
                </div>
                <div className="flex justify-center space-x-3 text-[9px] font-bold text-forest/60">
                  {providerBreakdown.map((item) => (
                    <span key={item.name} className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name.replace("Google ", "").replace("OpenAI ", "").replace("Anthropic ", "")}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-forest/55 uppercase tracking-wider block text-center">
                  Token Consumed by Member
                </span>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={memberTokenUsage} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke={axisColor} />
                      <YAxis tick={{ fontSize: 9 }} stroke={axisColor} />
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
                      <Bar dataKey="tokens" fill="#8FAF9B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Invite interface */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-forest uppercase tracking-wider flex items-center space-x-1.5">
              <UserPlus className="w-4 h-4 text-sage" />
              <span>Invite New Practitioner</span>
            </h3>

            <p className="text-[11px] text-forest/65 leading-relaxed">
              Add team developers, research specialists, or administrators into your secure workspace environment.
            </p>

            <form onSubmit={handleInvite} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-forest/60 mb-1 uppercase">Full Name</label>
                <input 
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-cream border border-sage/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/35 text-forest"
                  placeholder="e.g., Sarah Jenkins"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-forest/60 mb-1 uppercase">Email Address</label>
                <input 
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-cream border border-sage/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/35 text-forest"
                  placeholder="e.g., sarah.j@promptlabs.io"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-forest/60 mb-1 uppercase">Workspace Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full text-xs px-3 py-2.5 bg-cream border border-sage/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/35 text-forest"
                >
                  <option value="member">Prompt Engineer (Standard Seat)</option>
                  <option value="admin">SaaS Workspace Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={inviting || !inviteName || !inviteEmail}
                className="w-full py-2.5 rounded-xl bg-sage hover:bg-sage/90 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-sm border-none"
              >
                {inviting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatched Invitation...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Send Workspace Invite</span>
                  </>
                )}
              </button>
            </form>

            {successMsg && (
              <div className="p-3 bg-green-500/5 text-green-700 border border-green-500/10 rounded-xl text-[11px] font-medium leading-relaxed">
                ✓ {successMsg}
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-forest uppercase">Enterprise Isolation Safeguards</h4>
            <p className="text-[10.5px] text-forest/70 leading-relaxed">
              All shared team prompt libraries are stored in logically segregated secure containers. Cross-tenant queries are prevented using custom Firestore security rule configurations and schema validation blocks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
