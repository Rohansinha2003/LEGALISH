"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Scale,
  PhoneCall,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  MapPin,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { guidanceV3Api, LegalAidResourceItem } from "@/lib/api";
import toast from "react-hot-toast";

export default function LegalAidPage() {
  const [state, setState] = useState("Karnataka");
  const [annualIncome, setAnnualIncome] = useState<string>("200000");
  const [isWomanOrChild, setIsWomanOrChild] = useState(false);
  const [results, setResults] = useState<LegalAidResourceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const data = await guidanceV3Api.discoverLegalAid({
        state,
        income: annualIncome ? parseInt(annualIncome, 10) : undefined,
        is_woman_or_child: isWomanOrChild,
      });
      setResults(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to query legal aid directory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#E6DFD5] pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D23] bg-[#E6C687]/20 px-2.5 py-0.5 rounded-full">
            Legal Services Authorities Act, 1987
          </span>
          <span className="text-[11px] text-[#706E6B]">
            Free Legal Services Discovery
          </span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#1A2B49]">
          Can I Get Free Legal Help?
        </h1>
        <p className="text-xs text-[#706E6B] max-w-2xl leading-relaxed">
          In India, eligible citizens have a statutory right to free legal aid from government-appointed advocates through the National, State, and District Legal Services Authorities (NALSA / SLSA / DLSA).
        </p>
      </div>

      {/* Distinction Alert Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { title: "AI Information", desc: "LegalSaathi explains documents and statutory rules in plain language.", badge: "AI Assistant" },
          { title: "Official Legal Aid", desc: "NALSA / SLSA assign free advocates for eligible citizens.", badge: "Statutory Free Help" },
          { title: "Private Advocate", desc: "Independent lawyers chosen and paid by client for representation.", badge: "Private Counsel" },
          { title: "Government Authority", desc: "Courts, Rent Controllers, and Labour Commissioners who adjudicate.", badge: "Judicial / Tribunal" },
        ].map((item, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-white border border-[#E6DFD5] space-y-1">
            <span className="text-[10px] font-bold uppercase text-[#8C6D23] bg-[#F7F2E8] px-2 py-0.5 rounded">
              {item.badge}
            </span>
            <h4 className="font-serif text-sm font-bold text-[#1A2B49] mt-2">{item.title}</h4>
            <p className="text-[11px] text-[#706E6B]">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Eligibility Calculator Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E6DFD5] shadow-xs space-y-5">
        <h3 className="font-serif text-lg font-bold text-[#1A2B49] flex items-center gap-2">
          <Scale className="w-5 h-5 text-[#8C6D23]" />
          <span>Check Your Legal Aid Eligibility (Section 12 Criteria)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-[#55524E] mb-1.5">
              Your State / Union Territory
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-xs text-[#1A2B49] focus:outline-none"
            >
              {["Karnataka", "Delhi", "Maharashtra", "Tamil Nadu", "West Bengal", "Uttar Pradesh", "Telangana", "Gujarat", "Kerala"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#55524E] mb-1.5">
              Annual Household Income (INR)
            </label>
            <input
              type="number"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(e.target.value)}
              placeholder="e.g. 250000"
              className="w-full p-2.5 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-xs text-[#1A2B49] focus:outline-none"
            />
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E6DFD5] bg-[#FAF7F2] cursor-pointer text-xs font-medium text-[#1A2B49]">
              <input
                type="checkbox"
                checked={isWomanOrChild}
                onChange={(e) => setIsWomanOrChild(e.target.checked)}
                className="rounded text-[#1A2B49]"
              />
              <span>Woman or Child (Section 12(c) Unconditional)</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleCheck}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-[#1A2B49] text-white hover:bg-[#111C30] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          {loading ? "Checking Statutory Criteria..." : "Check Free Legal Aid Eligibility"}
        </button>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#1A2B49]">
            Legal Services Authorities Available For You
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {results.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-[#E6DFD5] p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif text-base font-bold text-[#1A2B49]">
                      {res.authority_name}
                    </h4>
                    {res.eligible ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Eligible
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                        Review Needed
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#706E6B] leading-relaxed">
                    {res.eligibility_reason}
                  </p>

                  <div className="text-xs text-[#55524E] space-y-1 pt-2 border-t border-[#F2ECE3]">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#8C6D23]" />
                      <span>{res.address || `${res.district}, ${res.state}`}</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-bold text-[#1A2B49]">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                      <span>National Toll-Free Helpline: {res.toll_free_number}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F2ECE3] flex items-center justify-between">
                  <span className="text-[11px] text-[#8C7A63]">Official Legal Aid Portal</span>
                  {res.portal_url && (
                    <a
                      href={res.portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#8C6D23] hover:text-[#1A2B49] flex items-center gap-1 underline"
                    >
                      <span>Visit Authority Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
