"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Clock,
  BookOpen,
} from "lucide-react";
import { guidanceV3Api, ProceduralExplainerItem } from "@/lib/api";

export default function ProceduresPage() {
  const [procedures, setProcedures] = useState<{ slug: string; title: string; category: string; summary: string }[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("legal-notice-response");
  const [activeProcedure, setActiveProcedure] = useState<ProceduralExplainerItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const listRes = await guidanceV3Api.listProcedures();
        setProcedures(listRes.procedures);
        if (listRes.procedures.length > 0) {
          const detail = await guidanceV3Api.getProcedure(listRes.procedures[0].slug);
          setActiveProcedure(detail);
        }
      } catch (e) {
        console.error("Failed to load procedural guides", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectProcedure = async (slug: string) => {
    setSelectedSlug(slug);
    setLoading(true);
    try {
      const detail = await guidanceV3Api.getProcedure(slug);
      setActiveProcedure(detail);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#E6DFD5] pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D23] bg-[#E6C687]/20 px-2.5 py-0.5 rounded-full">
            Indian Procedural Explainer
          </span>
          <span className="text-[11px] text-[#706E6B]">
            Plain-Language Step-by-Step Guidance
          </span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#1A2B49]">
          How Indian Legal Processes Actually Work
        </h1>
        <p className="text-xs text-[#706E6B] max-w-2xl leading-relaxed">
          Clear, structured guides explaining what steps to take, critical timeframes, evidence to preserve, and pitfalls to avoid when facing legal disputes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Selector */}
        <div className="space-y-3 bg-white rounded-3xl p-4 border border-[#E6DFD5] shadow-xs">
          <span className="text-xs font-bold text-[#1A2B49] px-2 block uppercase tracking-wider">
            Available Guides
          </span>
          <div className="space-y-1.5">
            {procedures.map((p) => (
              <button
                key={p.slug}
                onClick={() => selectProcedure(p.slug)}
                className={`w-full text-left p-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                  selectedSlug === p.slug
                    ? "bg-[#1A2B49] text-white shadow-xs"
                    : "text-[#55524E] hover:bg-[#F7F2E8] hover:text-[#1A2B49]"
                }`}
              >
                <span className="line-clamp-1">{p.title}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0 ml-1 opacity-70" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {activeProcedure && (
            <div className="bg-white rounded-3xl p-8 border border-[#E6DFD5] shadow-xs space-y-8">
              {/* Title & Summary */}
              <div className="space-y-3 border-b border-[#F2ECE3] pb-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D23] bg-[#F7F2E8] px-2.5 py-0.5 rounded">
                  {activeProcedure.category.toUpperCase()}
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#1A2B49]">
                  {activeProcedure.title}
                </h2>
                <p className="text-xs text-[#706E6B] leading-relaxed">
                  {activeProcedure.summary}
                </p>
              </div>

              {/* Step by Step Timeline */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#1A2B49]">
                  Recommended Procedural Steps
                </h3>
                <div className="space-y-4">
                  {activeProcedure.steps.map((st) => (
                    <div
                      key={st.step_number}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D5] flex items-start gap-4"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#1A2B49] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {st.step_number}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-serif text-sm font-bold text-[#1A2B49]">
                            {st.title}
                          </h4>
                          {st.timeframe && (
                            <span className="text-[11px] font-semibold text-[#8C6D23] bg-[#EFE8DD] px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {st.timeframe}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#706E6B] leading-relaxed">
                          {st.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* What to Do / What NOT to Do */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>What You Should Do</span>
                  </div>
                  <p className="text-xs text-emerald-950 leading-relaxed">
                    {activeProcedure.what_to_do}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                    <XCircle className="w-4 h-4 text-rose-700" />
                    <span>What You Must Avoid</span>
                  </div>
                  <p className="text-xs text-rose-950 leading-relaxed">
                    {activeProcedure.what_not_to_do}
                  </p>
                </div>
              </div>

              {/* FAQs */}
              {activeProcedure.faqs.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-[#F2ECE3]">
                  <h3 className="font-serif text-base font-bold text-[#1A2B49] flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#8C6D23]" />
                    <span>Frequently Asked Questions</span>
                  </h3>
                  <div className="space-y-3">
                    {activeProcedure.faqs.map((faq, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#FDFAF5] border border-[#E6DFD5] space-y-1">
                        <p className="text-xs font-bold text-[#1A2B49]">Q: {faq.q}</p>
                        <p className="text-xs text-[#706E6B] leading-relaxed">A: {faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contextual Legal Disclaimer */}
              <div className="p-4 rounded-2xl bg-[#F7F2E8] border border-[#DDD0BC] text-[11px] text-[#706E6B] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#8C6D23] shrink-0 mt-0.5" />
                <p>{activeProcedure.disclaimer}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
