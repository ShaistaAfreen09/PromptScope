import React, { useEffect, useState } from "react";
import { safeJson } from "../utils";
import { motion } from "motion/react";
import { 
  Bell, 
  ShieldAlert, 
  FileText, 
  Key, 
  Users, 
  Activity, 
  Check, 
  CheckCheck,
  RefreshCw, 
  Clock, 
  AlertTriangle,
  Settings,
  Eye
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "report" | "api_key" | "usage" | "security" | "team";
  isRead: boolean;
  createdAt: string;
}

interface ActivityLogItem {
  id: string;
  action: string;
  description: string;
  ipAddress: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefReport, setPrefReport] = useState(true);
  const [prefKeys, setPrefKeys] = useState(true);
  const [prefSecurity, setPrefSecurity] = useState(true);

  const fetchNotificationCenterData = async () => {
    setLoading(true);
    try {
      const [notifRes, actRes] = await Promise.all([
        fetch("/api/notifications"),
        fetch("/api/activities")
      ]);
      const notifData = await safeJson(notifRes);
      const actData = await safeJson(actRes);
      if (notifData.success) setNotifications(notifData.notifications);
      if (actData.success) setActivities(actData.activities);
    } catch (e) {
      console.error("Failed to fetch notifications info", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationCenterData();
  }, []);

  const handleMarkAsRead = async (id?: string) => {
    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        if (id) {
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } else {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "report": return <FileText className="w-4 h-4 text-[#8FAF9B]" />;
      case "api_key": return <Key className="w-4 h-4 text-[#D8B56A]" />;
      case "team": return <Users className="w-4 h-4 text-blue-500" />;
      case "security": return <ShieldAlert className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "high": return <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-600 uppercase border border-red-500/20">High Severity</span>;
      case "medium": return <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#D8B56A]/10 text-[#a08144] uppercase border border-[#D8B56A]/20">Medium</span>;
      default: return <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#8FAF9B]/10 text-[#2F3A33]/70 uppercase border border-[#8FAF9B]/20">Standard Audit</span>;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#8FAF9B]/15 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#2F3A33] flex items-center space-x-2">
            <span>Notification & Audit Center</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-xs text-[#2F3A33]/60 mt-1">
            Real-time compliance alerts, secure provider connection feedback, and sensitive action logging logs.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchNotificationCenterData}
            className="p-2.5 rounded-lg border border-[#8FAF9B]/25 hover:bg-[#FAF8F3] text-[#2F3A33]/70 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {unreadCount > 0 && (
            <button 
              onClick={() => handleMarkAsRead()}
              className="px-4 py-2 rounded-lg bg-[#8FAF9B]/15 hover:bg-[#8FAF9B]/25 text-[#2F3A33] font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-all border border-[#8FAF9B]/20"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column - Notifications */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-[#8FAF9B]/15 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#2F3A33] uppercase tracking-wider flex items-center space-x-1.5">
              <Bell className="w-4 h-4 text-[#8FAF9B]" />
              <span>Active Notifications</span>
            </h3>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-[#8FAF9B] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] uppercase tracking-wider text-[#2F3A33]/40">Syncing alerts...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#2F3A33]/45">
                No active notifications or alerts in the history queue.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                      item.isRead 
                        ? "bg-white border-slate-100 opacity-75" 
                        : "bg-[#FAF8F3]/70 border-[#8FAF9B]/30 shadow-xs"
                    }`}
                  >
                    <div className="p-2 bg-[#FAF8F3] border border-[#8FAF9B]/15 rounded-lg">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-[#2F3A33]">{item.title}</span>
                        <span className="text-[9px] text-[#2F3A33]/40 font-mono">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-[#2F3A33]/70 leading-relaxed">{item.message}</p>
                    </div>
                    {!item.isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(item.id)}
                        className="p-1 rounded bg-[#8FAF9B]/10 hover:bg-[#8FAF9B]/20 text-[#2F3A33]/70 cursor-pointer transition-all"
                        title="Mark read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Logs section */}
          <div className="bg-white p-5 rounded-2xl border border-[#8FAF9B]/15 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#2F3A33] uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-[#8FAF9B]" />
              <span>Real-time Workspace Audit Logs</span>
            </h3>

            {loading ? (
              <div className="py-12 text-center text-[10px] uppercase tracking-wider text-[#2F3A33]/40">Syncing logs...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left">
                  <thead>
                    <tr className="border-b border-[#8FAF9B]/10 text-[#2F3A33]/40 uppercase text-[9px] font-bold">
                      <th className="pb-2.5">Event</th>
                      <th className="pb-2.5">Audit Trail Detail</th>
                      <th className="pb-2.5">Origin IP</th>
                      <th className="pb-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activities.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-mono font-bold text-[#2F3A33]/80">{log.action}</td>
                        <td className="py-3 text-[#2F3A33]/70 leading-normal max-w-xs">{log.description}</td>
                        <td className="py-3 font-mono text-[#2F3A33]/45">{log.ipAddress}</td>
                        <td className="py-3 text-right">{getSeverityBadge(log.severity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Preferences */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-[#8FAF9B]/15 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#2F3A33] uppercase tracking-wider flex items-center space-x-1.5">
              <Settings className="w-4 h-4 text-[#8FAF9B]" />
              <span>Notification Preferences</span>
            </h3>

            <p className="text-[11px] text-[#2F3A33]/60 leading-relaxed">
              Toggle webhook triggers, administrative delivery settings, and email summary limits.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#2F3A33] block">Report Completions</span>
                  <span className="text-[10px] text-[#2F3A33]/50 block">Alert when a PDF compliance or benchmark summary completes</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={prefReport} 
                  onChange={(e) => setPrefReport(e.target.checked)} 
                  className="w-4 h-4 rounded text-[#8FAF9B] focus:ring-[#8FAF9B]/40"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div>
                  <span className="text-xs font-bold text-[#2F3A33] block">API Proxy Connection Triggers</span>
                  <span className="text-[10px] text-[#2F3A33]/50 block">Notify immediately upon provider key tests and validation changes</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={prefKeys} 
                  onChange={(e) => setPrefKeys(e.target.checked)} 
                  className="w-4 h-4 rounded text-[#8FAF9B] focus:ring-[#8FAF9B]/40"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div>
                  <span className="text-xs font-bold text-[#2F3A33] block">HIPAA & PII Sanitizer Alerts</span>
                  <span className="text-[10px] text-[#2F3A33]/50 block">Audit logs flagged when sensitive regex triggers scrub variables</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={prefSecurity} 
                  onChange={(e) => setPrefSecurity(e.target.checked)} 
                  className="w-4 h-4 rounded text-[#8FAF9B] focus:ring-[#8FAF9B]/40"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/5 text-xs text-red-700 space-y-2">
            <h4 className="font-bold flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>PII Security Protocol Active</span>
            </h4>
            <p className="text-[10.5px] leading-relaxed">
              GDPR, HIPAA compliance monitors actively sanitizing prompt outputs. External API headers are audited in real-time under security monitoring hooks to prevent developer API leakages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
