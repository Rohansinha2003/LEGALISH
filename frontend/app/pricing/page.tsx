"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  Zap,
  Shield,
  Building,
  CreditCard,
  Sparkles,
  ArrowRight,
  Loader2,
  Lock,
  Layers,
  HelpCircle,
} from "lucide-react";
import { billingV3Api, PlanItem } from "@/lib/api";
import toast from "react-hot-toast";

export default function PricingPage() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [creatingOrg, setCreatingOrg] = useState(false);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await billingV3Api.plans();
        setPlans(res.plans || []);
      } catch (err: any) {
        // Fallback default plans if backend is unreachable
        setPlans([
          {
            id: "free",
            name: "Citizen Free",
            price_inr_monthly: 0,
            document_limit: 3,
            ai_requests_limit: 15,
            voice_minutes_limit: 5,
            features: [
              "3 Document analyses & OCR",
              "15 AI Legal Q&A queries",
              "5 Minutes voice assistance",
              "NALSA / SLSA Legal Aid Locator",
              "Step-by-step procedural guides",
              "Multilingual Legal Glossary",
            ],
          },
          {
            id: "plus",
            name: "Citizen Plus",
            price_inr_monthly: 299,
            document_limit: 25,
            ai_requests_limit: 100,
            voice_minutes_limit: 30,
            features: [
              "25 Document analyses",
              "100 Multi-agent orchestrator runs",
              "30 Minutes voice-first translation",
              "Contract Redlining & Clause Diff",
              "Neutral Discrepancy & Fact Store",
              "Direct Verified Advocate Consultations",
            ],
          },
          {
            id: "pro",
            name: "Pro / Advocate",
            price_inr_monthly: 999,
            document_limit: 100,
            ai_requests_limit: 500,
            voice_minutes_limit: 120,
            features: [
              "100 Documents & Evidence lockers",
              "500 Multi-agent queries",
              "120 Minutes voice translation",
              "Comprehensive Case Dossier Exports",
              "Statutory Limitation & Deadline Engine",
              "Bar Council verified advocate directory listing",
            ],
          },
          {
            id: "business",
            name: "Legal Clinic & NGO",
            price_inr_monthly: 2499,
            document_limit: 500,
            ai_requests_limit: 2000,
            voice_minutes_limit: 500,
            features: [
              "Multi-tenant NGO / Clinic organization",
              "Unlimited team member seats",
              "Section 12 Legal Aid bulk matching",
              "Priority multi-agent orchestration",
              "Dedicated DPDP compliance & audit logs",
              "24/7 priority operational support",
            ],
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  const handleCheckout = async (plan: PlanItem) => {
    if (plan.price_inr_monthly === 0) {
      toast.success("You are on the Citizen Free tier. Enjoy unrestricted access to legal aid discovery and guides!");
      return;
    }

    setSelectedPlan(plan);
    setCheckingOut(true);
    try {
      const res = await billingV3Api.checkout({
        payment_type: "subscription",
        plan_id: plan.id,
        amount_inr: plan.price_inr_monthly,
      });

      toast.success(`Subscription activated! Transaction ID: ${res.transaction_id}`);
      setSelectedPlan(null);
    } catch (err: any) {
      toast.error(err.message || "Payment simulation failed.");
    } finally {
      setCheckingOut(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !orgEmail) {
      toast.error("Please provide organization name and contact email.");
      return;
    }
    setCreatingOrg(true);
    try {
      await billingV3Api.createOrg({
        name: orgName,
        slug: orgSlug || orgName.toLowerCase().replace(/\s+/g, "-"),
        contact_email: orgEmail,
        org_type: "ngo",
      });
      toast.success("Organization workspace registered successfully!");
      setShowOrgModal(false);
      setOrgName("");
      setOrgEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create organization.");
    } finally {
      setCreatingOrg(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E6C687]/30 text-[#8C6D23] border border-[#E6C687]/50">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent, Accessible Legal Access
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1A2B49] tracking-tight">
            Plans for Citizens, Advocates & NGOs
          </h1>
          <p className="text-sm sm:text-base text-[#55524E] leading-relaxed">
            Essential legal aid discovery, statutory procedural guidance, and glossary terms remain 100% free forever. Upgrade for multi-agent case intelligence, contract redlining, and dossier exports.
          </p>
        </div>

        {/* Pricing Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#8C6D23]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const isPopular = plan.id === "plus";
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl bg-[#FDFBF7] p-6 flex flex-col justify-between transition-all ${
                    isPopular
                      ? "border-2 border-[#8C6D23] shadow-md relative"
                      : "border border-[#E6DFD5] shadow-xs hover:border-[#D5CCBE]"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#1A2B49] text-[#FAF7F2] text-[10px] font-bold uppercase tracking-wider shadow-xs">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#1A2B49]">{plan.name}</h3>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-[#1A2B49] font-serif">
                          ₹{plan.price_inr_monthly}
                        </span>
                        <span className="text-xs text-[#706E6B]">/month</span>
                      </div>
                    </div>

                    <div className="py-2 border-y border-[#EAE2D5] space-y-1 text-xs text-[#55524E]">
                      <div className="flex justify-between">
                        <span>Documents:</span>
                        <strong className="text-[#1A2B49]">{plan.document_limit} files</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>AI Requests:</span>
                        <strong className="text-[#1A2B49]">{plan.ai_requests_limit} calls</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Voice Minutes:</span>
                        <strong className="text-[#1A2B49]">{plan.voice_minutes_limit} min</strong>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2.5 pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#706E6B]">
                        What&apos;s Included:
                      </span>
                      <ul className="space-y-2 text-xs text-[#55524E]">
                        {plan.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#EAE2D5]">
                    <button
                      onClick={() => handleCheckout(plan)}
                      disabled={checkingOut}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                        isPopular
                          ? "bg-[#1A2B49] hover:bg-[#111C30] text-white shadow-xs"
                          : plan.price_inr_monthly === 0
                          ? "bg-[#F3EDE3] hover:bg-[#EAE2D5] text-[#1A2B49]"
                          : "border border-[#1A2B49] text-[#1A2B49] hover:bg-[#F3EDE3]"
                      }`}
                    >
                      {checkingOut && selectedPlan?.id === plan.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Processing...
                        </>
                      ) : plan.price_inr_monthly === 0 ? (
                        "Current Plan"
                      ) : (
                        `Upgrade to ${plan.name}`
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* NGO / Organization Multi-Tenant Section */}
        <div className="bg-[#1A2B49] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-lg">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF7F2]/10 text-[#E6C687] border border-[#E6C687]/30">
              <Building className="w-3.5 h-3.5" />
              Institutions & Non-Profits
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF7F2]">
              Are you a Legal Aid Clinic, NGO, or Pro-Bono Foundation?
            </h2>
            <p className="text-xs sm:text-sm text-[#D5CCBE] leading-relaxed">
              We provide subsidized and grant-funded multi-seat licenses for registered legal aid clinics, state legal service volunteers, and civil society organizations in India.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => setShowOrgModal(true)}
                className="px-5 py-2.5 rounded-xl bg-[#E6C687] hover:bg-[#D9B56F] text-[#1A2B49] text-xs font-bold transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                Register Organization Workspace
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <Link
                href="/legal-aid"
                className="px-5 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs font-semibold transition-colors"
              >
                View Section 12 NALSA Criteria
              </Link>
            </div>
          </div>
        </div>

        {/* Org Creation Modal */}
        {showOrgModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-[#FAF7F2] rounded-2xl border border-[#E6DFD5] p-6 max-w-md w-full shadow-xl space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#1A2B49]">
                Register NGO or Legal Clinic
              </h3>
              <p className="text-xs text-[#55524E]">
                Create a shared workspace for your caseworkers, legal fellows, and advocates.
              </p>
              <form onSubmit={handleCreateOrg} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#1A2B49] mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nyaya Sahayata Foundation"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD5C7] bg-[#FDFBF7] text-xs text-[#1A2B49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A2B49] mb-1">
                    Official Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@nyayasahayata.org"
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD5C7] bg-[#FDFBF7] text-xs text-[#1A2B49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A2B49] mb-1">
                    Workspace URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="nyaya-sahayata"
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD5C7] bg-[#FDFBF7] text-xs text-[#1A2B49]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowOrgModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#DDD5C7] text-xs text-[#55524E] hover:bg-[#EFE8DD]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingOrg}
                    className="px-4 py-2 rounded-xl bg-[#1A2B49] text-white text-xs font-semibold hover:bg-[#111C30]"
                  >
                    {creatingOrg ? "Creating..." : "Create Organization"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
