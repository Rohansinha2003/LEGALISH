"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ShieldCheck,
  MapPin,
  Briefcase,
  Star,
  CheckCircle2,
  Lock,
  ArrowRight,
  Filter,
  MessageSquare,
  Clock,
  Sparkles,
} from "lucide-react";
import { lawyersV3Api, casesApi, LawyerProfile, CaseSummary } from "@/lib/api";
import toast from "react-hot-toast";

export default function LawyersPage() {
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("");
  const [practiceFilter, setPracticeFilter] = useState("");

  // Consultation Modal State
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerProfile | null>(null);
  const [userCases, setUserCases] = useState<CaseSummary[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [sharedScopes, setSharedScopes] = useState<string[]>(["summary", "timeline", "documents", "evidence"]);
  const [consultNote, setConsultNote] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookedSuccess, setBookedSuccess] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const [lawyersRes, casesRes] = await Promise.allSettled([
          lawyersV3Api.list(),
          casesApi.list(),
        ]);
        if (lawyersRes.status === "fulfilled") setLawyers(lawyersRes.value);
        if (casesRes.status === "fulfilled") {
          setUserCases(casesRes.value);
          if (casesRes.value.length > 0) setSelectedCaseId(casesRes.value[0].id);
        }
      } catch (e) {
        console.error("Failed to load lawyers", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleFilter = async () => {
    setLoading(true);
    try {
      const filtered = await lawyersV3Api.list({
        state: stateFilter || undefined,
        practice_area: practiceFilter || undefined,
      });
      setLawyers(filtered);
    } catch (e) {
      toast.error("Failed to apply filters");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestConsultation = async () => {
    if (!selectedLawyer || !selectedCaseId) {
      toast.error("Please select a case to share with counsel.");
      return;
    }
    setBookingLoading(true);
    try {
      const res = await lawyersV3Api.requestConsultation(
        selectedCaseId,
        selectedLawyer.id,
        sharedScopes,
        consultNote || "Client requested case review and advocate consultation."
      );
      setBookedSuccess(res);
      toast.success("Consultation requested! Structured brief sent to counsel.");
    } catch (e: any) {
      toast.error(e.message || "Consultation request failed.");
    } finally {
      setBookingLoading(false);
    }
  };

  const toggleScope = (scope: string) => {
    setSharedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="border-b border-[#E6DFD5] pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D23] bg-[#E6C687]/20 px-2.5 py-0.5 rounded-full">
            Advocate Network Foundation
          </span>
          <span className="text-[11px] text-[#706E6B] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Bar Council Verified Advocates
          </span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#1A2B49]">
          Connect with a Verified Advocate
        </h1>
        <p className="text-xs text-[#706E6B] max-w-2xl leading-relaxed">
          Find practicing lawyers specialized in your specific issue across Indian states. Securely share your structured case brief, timeline, and documents with selective granular permissions.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-[#E6DFD5] flex flex-wrap gap-4 items-center justify-between shadow-xs">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <div className="relative min-w-[200px]">
            <MapPin className="w-4 h-4 text-[#8C6D23] absolute left-3 top-3" />
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-xs text-[#1A2B49] focus:outline-none"
            >
              <option value="">All States</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="West Bengal">West Bengal</option>
            </select>
          </div>

          <div className="relative min-w-[220px]">
            <Briefcase className="w-4 h-4 text-[#8C6D23] absolute left-3 top-3" />
            <select
              value={practiceFilter}
              onChange={(e) => setPracticeFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-xs text-[#1A2B49] focus:outline-none"
            >
              <option value="">All Practice Areas</option>
              <option value="Rent & Tenancy">Rent & Tenancy</option>
              <option value="Property">Property</option>
              <option value="Employment">Employment & Labour</option>
              <option value="Consumer">Consumer Disputes</option>
              <option value="Cheque Bounce">Cheque Bounce (§138 NI Act)</option>
            </select>
          </div>

          <button
            onClick={handleFilter}
            className="px-4 py-2 rounded-xl bg-[#1A2B49] text-white hover:bg-[#111C30] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>

        <div className="text-xs text-[#706E6B]">
          Showing <span className="font-bold text-[#1A2B49]">{lawyers.length}</span> Verified Advocates
        </div>
      </div>

      {/* Lawyers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lawyers.map((lawyer) => (
          <div
            key={lawyer.id}
            className="bg-white rounded-2xl border border-[#E6DFD5] hover:border-[#C8B99A] hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1A2B49]">
                    {lawyer.full_name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Bar Council Verified ({lawyer.bar_council_id})</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#8C6D23] bg-[#F7F2E8] px-2 py-0.5 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-[#8C6D23]" />
                  <span>{lawyer.rating}</span>
                  <span className="text-[#8C7A63] font-normal text-[10px]">({lawyer.review_count})</span>
                </div>
              </div>

              <p className="text-xs text-[#706E6B] leading-relaxed line-clamp-3">
                {lawyer.bio}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {lawyer.practice_areas.map((p, idx) => (
                  <span key={idx} className="text-[10px] font-semibold bg-[#F7F2E8] text-[#55524E] px-2 py-0.5 rounded-full">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#F2ECE3]">
              <div className="flex items-center justify-between text-xs text-[#706E6B]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#8C6D23]" />
                  {lawyer.city}, {lawyer.state}
                </span>
                <span className="font-bold text-[#1A2B49]">
                  {lawyer.consultation_fee === 0 ? "Pro Bono / Legal Aid" : `₹${lawyer.consultation_fee.toLocaleString()}`}
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedLawyer(lawyer);
                  setBookedSuccess(null);
                }}
                className="w-full py-2.5 rounded-xl bg-[#1A2B49] text-white hover:bg-[#111C30] text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Request Case Review</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E6C687]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Consultation Booking Modal */}
      {selectedLawyer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#DDD5C7] shadow-xl space-y-5">
            <div className="flex items-start justify-between border-b border-[#E6DFD5] pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1A2B49]">
                  Request Review by {selectedLawyer.full_name}
                </h3>
                <p className="text-xs text-[#706E6B] mt-0.5">
                  Enrollment: {selectedLawyer.bar_council_id} • {selectedLawyer.state_bar_council}
                </p>
              </div>
              <button
                onClick={() => setSelectedLawyer(null)}
                className="text-[#706E6B] hover:text-[#1A2B49] text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {bookedSuccess ? (
              <div className="space-y-4 py-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-base font-bold text-[#1A2B49]">
                  Review Request Dispatched!
                </h4>
                <p className="text-xs text-[#706E6B] leading-relaxed max-w-sm mx-auto">
                  A structured case brief has been compiled and sent to counsel. You can communicate securely through the case-bound consultation room.
                </p>
                <div className="p-3 bg-[#FAF7F2] rounded-xl text-xs text-[#8C6D23] font-mono">
                  Room: {bookedSuccess.meeting_link}
                </div>
                <button
                  onClick={() => setSelectedLawyer(null)}
                  className="px-5 py-2 rounded-xl bg-[#1A2B49] text-white text-xs font-semibold cursor-pointer"
                >
                  Return to Directory
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Select Case */}
                <div>
                  <label className="block font-semibold text-[#1A2B49] mb-1.5">
                    Select Case to Share
                  </label>
                  {userCases.length > 0 ? (
                    <select
                      value={selectedCaseId}
                      onChange={(e) => setSelectedCaseId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-xs text-[#1A2B49] focus:outline-none"
                    >
                      {userCases.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.issue_type})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[#8C6D23]">
                      No active cases found. <Link href="/cases/new" className="underline font-bold">Start a case first</Link>.
                    </p>
                  )}
                </div>

                {/* Granular Selective Sharing Scopes */}
                <div className="space-y-2">
                  <label className="block font-semibold text-[#1A2B49]">
                    Selective Case Permissions (You control what counsel sees)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "summary", label: "AI Case Brief & Facts" },
                      { id: "timeline", label: "Chronological Timeline" },
                      { id: "documents", label: "Uploaded Agreements" },
                      { id: "evidence", label: "Evidence Locker" },
                      { id: "notes", label: "Personal Notes" },
                    ].map((scope) => (
                      <label
                        key={scope.id}
                        className="flex items-center gap-2 p-2 rounded-xl border border-[#E6DFD5] bg-[#FAF7F2] cursor-pointer hover:bg-[#F2ECE3] text-[11px]"
                      >
                        <input
                          type="checkbox"
                          checked={sharedScopes.includes(scope.id)}
                          onChange={() => toggleScope(scope.id)}
                          className="rounded text-[#1A2B49]"
                        />
                        <span>{scope.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brief Note */}
                <div>
                  <label className="block font-semibold text-[#1A2B49] mb-1.5">
                    Specific Questions for Counsel (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={consultNote}
                    onChange={(e) => setConsultNote(e.target.value)}
                    placeholder="e.g. Can the landlord deduct repainting without GST bills under Section 108 TPA?"
                    className="w-full p-2.5 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-xs text-[#1A2B49] focus:outline-none"
                  />
                </div>

                {/* Fee and Submission */}
                <div className="pt-3 border-t border-[#E6DFD5] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#706E6B] block">Consultation Fee</span>
                    <span className="font-serif text-sm font-bold text-[#1A2B49]">
                      {selectedLawyer.consultation_fee === 0 ? "Pro Bono" : `₹${selectedLawyer.consultation_fee.toLocaleString()}`}
                    </span>
                  </div>

                  <button
                    onClick={handleRequestConsultation}
                    disabled={bookingLoading || !selectedCaseId}
                    className="px-5 py-2.5 rounded-xl bg-[#1A2B49] text-white hover:bg-[#111C30] text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {bookingLoading ? "Compiling Brief..." : "Submit Consultation Request"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
