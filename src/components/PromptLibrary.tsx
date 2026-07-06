import React, { useEffect, useState } from "react";
import { safeJson } from "../utils";
import { 
  Search, 
  Plus, 
  Copy, 
  Check, 
  RefreshCw, 
  BookOpen, 
  Share2
} from "lucide-react";

interface StoredTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  promptText: string;
  systemInstruction?: string;
  tags: string[];
  performanceScore: number;
  usageCount: number;
  isPrivate: boolean;
  author: string;
}

export const PromptLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<StoredTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTpl, setSelectedTpl] = useState<StoredTemplate | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // New Template Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Software Development");
  const [newPrompt, setNewPrompt] = useState("");
  const [newSystem, setNewSystem] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [newTags, setNewTags] = useState("");
  const [adding, setAdding] = useState(false);

  // Success indicators
  const [successMsg, setSuccessMsg] = useState("");
  const [copyState, setCopyState] = useState(false);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      const data = await safeJson(res);
      if (data.success) {
        setTemplates(data.templates);
        if (data.templates.length > 0 && !selectedTpl) {
          setSelectedTpl(data.templates[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyState(true);
    setTimeout(() => setCopyState(false), 2000);
  };

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrompt.trim()) return;

    setAdding(true);
    setSuccessMsg("");
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          category: newCategory,
          promptText: newPrompt,
          systemInstruction: newSystem || undefined,
          isPrivate,
          tags: newTags ? newTags.split(",").map(t => t.trim()) : undefined
        })
      });
      const data = await safeJson(res);
      if (data.success) {
        setTemplates(prev => [data.template, ...prev]);
        setSelectedTpl(data.template);
        setNewName("");
        setNewDesc("");
        setNewPrompt("");
        setNewSystem("");
        setNewTags("");
        setShowAddForm(false);
        setSuccessMsg(`"${newName}" template successfully compiled and added!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch("/api/templates/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await safeJson(res);
      if (data.success) {
        setTemplates(prev => [data.template, ...prev]);
        setSelectedTpl(data.template);
        setSuccessMsg("Public marketplace template successfully duplicated into private workspace!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ["All", "Software Development", "Marketing", "Research", "Business", "Education", "Data Science"];

  const filtered = templates.filter((tpl) => {
    const matchesSearch = 
      tpl.name.toLowerCase().includes(search.toLowerCase()) || 
      tpl.description.toLowerCase().includes(search.toLowerCase()) ||
      tpl.promptText.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || tpl.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in text-forest">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-sage/15 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-forest">SaaS Prompt Marketplace & Presets</h1>
          <p className="text-xs text-forest/60 mt-1">
            Browse corporate presets, share custom prompts, or duplicate high-performance templates into your private catalog.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchTemplates}
            className="p-2.5 rounded-lg border border-sage/25 bg-white hover:bg-cream text-forest/70 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 rounded-lg bg-sage hover:bg-sage/90 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm border-none"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Template</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddTemplate} className="bg-white p-5 rounded-2xl border border-sage/20 shadow-sm space-y-4 animate-fade-in transition-colors">
          <h3 className="text-xs font-bold text-forest uppercase tracking-wider">New Custom Template Parameters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-forest/60 mb-1 uppercase">Template Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-cream border border-sage/20 text-forest rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/35 transition-colors"
                placeholder="e.g. RobustSQLSynthesizer"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-forest/60 mb-1 uppercase">Category Group</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-cream border border-sage/20 text-forest rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/35 transition-colors"
              >
                {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-forest/60 mb-1 uppercase">Isolation Scope</label>
              <select
                value={isPrivate ? "private" : "public"}
                onChange={(e) => setIsPrivate(e.target.value === "private")}
                className="w-full text-xs px-3 py-2.5 bg-cream border border-sage/20 text-forest rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/35 transition-colors"
              >
                <option value="private">Private Workspace Template</option>
                <option value="public">Shared Organization Template</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-forest/60 mb-1 uppercase">Short Description / Purpose</label>
            <input
              type="text"
              required
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-cream border border-sage/20 text-forest rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/35 transition-colors"
              placeholder="e.g., Scrub patient credentials and diagnostic markers"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-forest/60 mb-1 uppercase">Model System Persona Directive</label>
            <input
              type="text"
              value={newSystem}
              onChange={(e) => setNewSystem(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-cream border border-sage/20 text-forest rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/35 transition-colors"
              placeholder="e.g., You are an expert DB administrator..."
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-forest/60 mb-1 uppercase">Core Prompt Instructions</label>
            <textarea
              required
              rows={4}
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              className="w-full text-xs p-3 bg-cream border border-sage/20 text-forest rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/35 font-mono transition-colors"
              placeholder="e.g. Retrieve elements from the table matching..."
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-forest/60 mb-1 uppercase">Comma-Separated Tags (Optional)</label>
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-cream border border-sage/20 text-forest rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/35 transition-colors"
              placeholder="e.g. SQL, Postgres, Audit"
            />
          </div>

          <div className="flex space-x-3 text-xs font-semibold">
            <button 
              type="submit" 
              disabled={adding}
              className="px-4 py-2 bg-sage text-white rounded-lg hover:bg-sage/90 cursor-pointer shadow-sm border-none"
            >
              {adding ? "Saving preset..." : "Save Presets"}
            </button>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="px-4 py-2 bg-cream border border-sage/15 text-forest/70 rounded-lg cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {successMsg && (
        <div className="p-3 bg-green-500/5 text-green-700 border border-green-500/10 rounded-xl text-xs font-medium">
          ✓ {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left list columns */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-sm space-y-3.5 transition-colors">
            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-forest/45">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-cream border border-sage/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/35 text-forest transition-colors"
                placeholder="Search preset templates..."
              />
            </div>

            {/* Categories sliding tags list */}
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none border-b border-sage/10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] uppercase font-bold shrink-0 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-sage border-sage text-white"
                      : "bg-cream border-sage/15 text-forest/65 hover:border-sage/35"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Main Template cards list */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto">
              {loading ? (
                <div className="py-12 text-center text-xs text-forest/40">Loading catalog...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8 text-[11px] text-forest/55 italic">
                  No templates match selection.
                </div>
              ) : (
                filtered.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTpl(tpl)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedTpl && selectedTpl.id === tpl.id
                        ? "bg-sage/10 border-sage"
                        : "bg-white border-sage/15 hover:border-sage/35"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-forest">{tpl.name}</h4>
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        tpl.isPrivate 
                          ? "bg-cream border border-sage/15 text-forest/60" 
                          : "bg-blue-500/5 border border-blue-500/10 text-blue-600"
                      }`}>
                        {tpl.isPrivate ? "Private" : "Marketplace"}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-forest/60 line-clamp-2 mt-1.5 leading-normal">
                      {tpl.description}
                    </p>
                    <div className="mt-2.5 flex justify-between text-[8px] font-bold text-sage uppercase font-mono">
                      <span>{tpl.category}</span>
                      <span>Score: {tpl.performanceScore}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Details Column */}
        <div className="lg:col-span-7">
          {selectedTpl ? (
            <div className="bg-white rounded-2xl border border-sage/15 shadow-sm p-5 space-y-4 transition-colors">
              <div className="flex items-start justify-between border-b border-sage/10 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] uppercase font-bold text-sage bg-sage/10 px-2.5 py-0.5 rounded-full">
                      {selectedTpl.category}
                    </span>
                    <span className="text-[9px] font-mono text-forest/45 font-bold">
                      Performance Rating: {selectedTpl.performanceScore}%
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-forest mt-2 leading-tight">{selectedTpl.name}</h3>
                  <p className="text-[11px] text-forest/60 mt-1 leading-normal">{selectedTpl.description}</p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCopy(selectedTpl.promptText)}
                    className="p-2 border border-sage/20 bg-white hover:bg-cream hover:border-sage/40 rounded-lg flex items-center justify-center text-forest transition-all cursor-pointer"
                    title="Copy prompt text"
                  >
                    {copyState ? <Check className="w-4 h-4 text-sage" /> : <Copy className="w-4 h-4 text-forest/70" />}
                  </button>

                  {!selectedTpl.isPrivate && (
                    <button
                      onClick={() => handleDuplicate(selectedTpl.id)}
                      className="px-3 py-1 bg-sage/15 hover:bg-sage/25 text-forest border border-sage/20 rounded-lg font-bold text-[10px] uppercase flex items-center space-x-1 cursor-pointer transition-all"
                      title="Duplicate to private workspace"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Duplicate</span>
                    </button>
                  )}
                </div>
              </div>

              {selectedTpl.systemInstruction && (
                <div className="space-y-1.5">
                  <span className="block text-[10px] uppercase font-bold text-forest/55">Model system instruction directive</span>
                  <div className="p-3 rounded-lg bg-cream border border-sage/10 text-forest font-mono text-xs transition-colors">
                    {selectedTpl.systemInstruction}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <span className="block text-[10px] uppercase font-bold text-forest/55">Main Prompt instructions</span>
                <div className="p-4 rounded-xl bg-cream/50 border border-sage/15 font-mono text-xs leading-relaxed whitespace-pre-wrap font-bold border-l-4 border-sage text-forest transition-colors">
                  {selectedTpl.promptText}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-sage/10">
                {selectedTpl.tags?.map((tag) => (
                  <span key={tag} className="text-[9px] bg-cream border border-sage/15 text-forest/70 font-semibold px-2 py-0.5 rounded-lg uppercase transition-colors">
                    #{tag}
                  </span>
                ))}
                <span className="text-[9px] text-forest/45 ml-auto font-mono self-center">
                  Total executions: {selectedTpl.usageCount} times
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-sage/15 shadow-sm min-h-[380px] flex flex-col items-center justify-center text-center space-y-2 transition-colors">
              <BookOpen className="w-10 h-10 text-sage/35" />
              <div className="text-xs font-bold text-forest">No template selected.</div>
              <p className="text-[10px] text-forest/55 max-w-xs leading-relaxed">
                Click on any catalog entry in the list to reveal its core instructions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
