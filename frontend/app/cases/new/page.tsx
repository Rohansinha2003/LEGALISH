"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  MapPin,
  HelpCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { casesApi } from "@/lib/api";
import { VoiceInputButton } from "@/components/VoiceHelper";
import toast from "react-hot-toast";

const ISSUE_CATEGORIES = [
  { id: "Rent/tenant", label: "Rent & Tenant", desc: "Security deposit, eviction notice, rent increase, repairs" },
  { id: "Employment", label: "Salary & Employment", desc: "Delayed wages, sudden termination, PF, notice period" },
  { id: "Property", label: "Property & Land", desc: "Ownership boundary, builder delay, registry, inheritance" },
  { id: "Consumer complaint", label: "Consumer & Services", desc: "Defective goods, refund refusal, misleading warranty" },
  { id: "Loan/debt", label: "Loan & Debt Recovery", desc: "Harassment by recovery agents, EMI dispute, cheque bounce" },
  { id: "Contract", label: "Contract & Agreement", desc: "Breach of commercial or freelance agreement terms" },
  { id: "Family", label: "Family & Matrimonial", desc: "Maintenance, custody, partition of ancestral assets" },
  { id: "Other", label: "Other Legal Issue", desc: "General civil issue, police complaint, or unknown legal notice" },
];

const OUTCOME_OPTIONS = [
  "Get money or security deposit back",
  "Respond to a legal notice received",
  "Understand my statutory rights before taking action",
  "Resolve dispute through settlement or mediation",
  "Generate a formal legal draft or agreement",
  "Prepare a package to consult an advocate",
];

const INDIAN_STATES = [
  "Karnataka", "Maharashtra", "Delhi (NCR)", "Tamil Nadu", "Telangana",
  "Uttar Pradesh", "West Bengal", "Gujarat", "Kerala", "Rajasthan",
  "Madhya Pradesh", "Punjab", "Haryana", "Bihar", "Andhra Pradesh", "Other State"
];

export default function NewCaseWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Wizard state
  const [issueType, setIssueType] = useState("Rent/tenant");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState("Karnataka");
  const [city, setCity] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [incidentDateApprox, setIncidentDateApprox] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState(OUTCOME_OPTIONS[0]);

  const handleNext = () => {
    if (step === 1 && !issueType) {
      toast.error("Please select an issue category.");
      return;
    }
    if (step === 2 && description.trim().length < 10) {
      toast.error("Please provide a brief description of what happened.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const caseTitle = title.trim() || `${issueType} Issue (${city || state || "India"})`;
    try {
      const res = await casesApi.create({
        title: caseTitle,
        issue_type: issueType,
        description,
        state,
        city,
        incident_date: incidentDate || undefined,
        incident_date_approx: incidentDateApprox || undefined,
        desired_outcome: desiredOutcome,
      });

      toast.success("Case created and analyzed successfully!");
      router.push(`/cases/${res.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create case.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Wizard Header */}
      <div className="text-center space-y-2 mb-8">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D23] bg-[#E6C687]/20 px-3 py-1 rounded-full">
          Step {step} of 5
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A2B49]">
          Start a New Case
        </h1>
        <p className="text-xs text-[#706E6B] max-w-lg mx-auto">
          We will organize your documents, calculate your timeline, detect urgency, and ground everything in Indian law.
        </p>

        {/* Progress bar */}
        <div className="w-full bg-[#E6DFD5] h-1.5 rounded-full overflow-hidden mt-4">
          <div
            className="bg-[#1A2B49] h-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Wizard Steps Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6DFD5] shadow-md space-y-6">
        {/* Step 1: Issue Category */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#1A2B49]">
              What is your issue or dispute about?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ISSUE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setIssueType(cat.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    issueType === cat.id
                      ? "border-[#1A2B49] bg-[#F7F2E8] shadow-xs"
                      : "border-[#EAE2D5] bg-white hover:border-[#C8B99A]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-[#1A2B49]">{cat.label}</span>
                    {issueType === cat.id && <CheckCircle2 className="w-4 h-4 text-[#8C6D23]" />}
                  </div>
                  <p className="text-xs text-[#706E6B]">{cat.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: What happened? */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#1A2B49]">
                  What happened?
                </h2>
                <p className="text-xs text-[#706E6B]">
                  Describe in your own everyday words. No legal terminology needed.
                </p>
              </div>
              <VoiceInputButton
                onTranscript={(txt) => setDescription((prev) => prev ? `${prev} ${txt}` : txt)}
              />
            </div>

            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., I was renting a 2BHK flat in Indiranagar, Bangalore. I vacated on 31st December after giving 30 days notice. The landlord has refused to return my Rs 45,000 security deposit claiming painting costs without showing any bills or invoices..."
              className="w-full p-4 rounded-2xl border border-[#DDD5C7] bg-[#FDFAF5] text-sm text-[#1A2B49] focus:outline-none focus:border-[#1A2B49] placeholder-[#9C9488]"
            />

            <div>
              <label className="block text-xs font-semibold text-[#55524E] mb-1">
                Optional: Give this case a nickname
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Indiranagar Flat Security Deposit Dispute"
                className="w-full p-3 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-sm text-[#1A2B49] focus:outline-none focus:border-[#1A2B49]"
              />
            </div>
          </div>
        )}

        {/* Step 3: Location / Jurisdiction */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#1A2B49] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#8C6D23]" /> Where did this happen?
            </h2>
            <p className="text-xs text-[#706E6B]">
              State laws vary across India (e.g. Rent Control Acts, Stamp Acts, Shop & Establishment Acts).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#55524E] mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-sm text-[#1A2B49] focus:outline-none focus:border-[#1A2B49]"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#55524E] mb-1">City or District (Optional)</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Bangalore Urban / Mumbai Suburban"
                  className="w-full p-3 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-sm text-[#1A2B49] focus:outline-none focus:border-[#1A2B49]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Dates & Timeline */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#1A2B49] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#8C6D23]" /> When did this happen or start?
            </h2>
            <p className="text-xs text-[#706E6B]">
              Helps us assess statutory limitation periods and notice deadlines.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#55524E] mb-1">Exact Date (if known)</label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-sm text-[#1A2B49] focus:outline-none focus:border-[#1A2B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#55524E] mb-1">Or Approximate Period</label>
                <input
                  type="text"
                  value={incidentDateApprox}
                  onChange={(e) => setIncidentDateApprox(e.target.value)}
                  placeholder="e.g., Early January 2026 or around Diwali"
                  className="w-full p-3 rounded-xl border border-[#DDD5C7] bg-[#FDFAF5] text-sm text-[#1A2B49] focus:outline-none focus:border-[#1A2B49]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Desired Outcome */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#1A2B49]">
              What outcome are you hoping for?
            </h2>
            <div className="space-y-2">
              {OUTCOME_OPTIONS.map((outcome) => (
                <button
                  key={outcome}
                  type="button"
                  onClick={() => setDesiredOutcome(outcome)}
                  className={`w-full p-3.5 rounded-xl border text-left text-sm transition-all flex items-center justify-between cursor-pointer ${
                    desiredOutcome === outcome
                      ? "border-[#1A2B49] bg-[#F7F2E8] font-semibold text-[#1A2B49]"
                      : "border-[#EAE2D5] bg-white text-[#55524E] hover:border-[#C8B99A]"
                  }`}
                >
                  <span>{outcome}</span>
                  {desiredOutcome === outcome && <CheckCircle2 className="w-4 h-4 text-[#8C6D23]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#F2ECE3]">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#55524E] hover:bg-[#F2ECE3] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#1A2B49] text-white hover:bg-[#111C30] text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              Next Step <ArrowRight className="w-4 h-4 text-[#E6C687]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8C6D23] text-white hover:bg-[#73581B] text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Case Situation...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Case & Run AI Analysis
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
