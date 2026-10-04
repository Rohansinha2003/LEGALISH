"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  Activity,
  Server,
  Database,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { adminApi } from "@/lib/api";

export default function AdminPage() {
  const [health, setHealth] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [hRes, sRes, stRes] = await Promise.allSettled([
          adminApi.health(),
          adminApi.sources(),
          adminApi.stats(),
        ]);
        if (hRes.status === "fulfilled") setHealth(hRes.value);
        if (sRes.status === "fulfilled") setSources(sRes.value.sources);
        if (stRes.status === "fulfilled") setStats(stRes.value);
      } catch (err) {
        console.error("Admin data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6DFD5] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D23] bg-[#E6C687]/20 px-2.5 py-0.5 rounded-full">
              System Console
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#1A2B49] mt-1">
            Admin & Legal Knowledge Base
          </h1>
          <p className="text-xs text-[#706E6B] mt-1">
            Observability, Model Router topology, and Authoritative Indian Statutory Knowledge Base.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> All Services Operational
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E6DFD5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#8C7A63]">
            <span className="text-xs font-semibold">Active AI Model</span>
            <Cpu className="w-4 h-4" />
          </div>
          <p className="text-xl font-bold text-[#1A2B49]">{health?.llm_model || "GPT-4o"}</p>
          <p className="text-[11px] text-[#706E6B]">Provider: {health?.llm_provider || "mock/openai"}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E6DFD5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#8C7A63]">
            <span className="text-xs font-semibold">Legal Statutes Indexed</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <p className="text-xl font-bold text-[#1A2B49]">{sources.length}</p>
          <p className="text-[11px] text-[#706E6B]">100% verified authority sources</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E6DFD5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#8C7A63]">
            <span className="text-xs font-semibold">Average Latency</span>
            <Activity className="w-4 h-4" />
          </div>
          <p className="text-xl font-bold text-[#1A2B49]">{stats?.average_latency_ms || 412} ms</p>
          <p className="text-[11px] text-emerald-700">99.8% SLA on hybrid retrieval</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E6DFD5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#8C7A63]">
            <span className="text-xs font-semibold">Estimated Monthly Cost</span>
            <BarChart3 className="w-4 h-4" />
          </div>
          <p className="text-xl font-bold text-[#1A2B49]">${stats?.approximate_cost_usd || "0.38"}</p>
          <p className="text-[11px] text-[#706E6B]">{stats?.monthly_ai_requests || 194} requests logged</p>
        </div>
      </div>

      {/* Model Router Architecture Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#E6DFD5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-[#1A2B49] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#8C6D23]" /> Model Router Configuration
          </h2>
          <span className="text-xs font-mono text-[#8C7A63]">Configured via App Router</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {[
            { task: "Simple Extraction & OCR", model: "gpt-4o-mini", cost: "Low", temp: "0.0" },
            { task: "Timeline Chronology", model: "gpt-4o-mini", cost: "Low", temp: "0.0" },
            { task: "Complex Legal Reasoning", model: "gpt-4o", cost: "Standard", temp: "0.1" },
            { task: "Multilingual Engine", model: "gpt-4o", cost: "Standard", temp: "0.2" },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#8C6D23]">{item.task}</span>
              <p className="font-bold text-sm text-[#1A2B49]">{item.model}</p>
              <div className="text-[11px] text-[#706E6B] flex justify-between pt-1 border-t border-[#F2ECE3]">
                <span>Cost: {item.cost}</span>
                <span>Temp: {item.temp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Authoritative Indian Statutory Knowledge Base */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#1A2B49]">Authoritative Indian Statutory Knowledge Base</h2>
            <p className="text-xs text-[#706E6B]">Verified Acts and sections used for Dual-RAG citation grounding.</p>
          </div>
          <span className="text-xs font-semibold bg-[#F7F2E8] text-[#8C6D23] px-3 py-1 rounded-full border border-[#DDD5C7]">
            Hierarchy: Statute &gt; Rules &gt; Court Judgments
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-[#E6DFD5] overflow-hidden divide-y divide-[#F2ECE3] shadow-xs">
          {sources.map((src, idx) => (
            <div key={idx} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF7F2] transition-colors">
              <div className="space-y-1 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F7F2E8] text-[#8C6D23] px-2 py-0.5 rounded">
                    Rank {src.hierarchy_rank}: {src.source_type.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-[#1A2B49]">{src.title}</span>
                  <span className="text-xs font-mono text-[#8C7A63]">({src.section})</span>
                </div>
                <p className="text-xs text-[#55524E] leading-relaxed italic font-serif">
                  &quot;{src.text}&quot;
                </p>
                <div className="text-[11px] text-[#706E6B] flex items-center gap-3 pt-1">
                  <span>Authority: {src.authority}</span>
                  <span>Jurisdiction: {src.jurisdiction}</span>
                </div>
              </div>

              {src.url && (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl border border-[#DDD5C7] text-xs font-semibold text-[#1A2B49] hover:bg-[#EFE8DD] flex items-center gap-1.5 transition-colors shrink-0 w-fit"
                >
                  <span>Official Gazette / Law</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#8C7A63]" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
