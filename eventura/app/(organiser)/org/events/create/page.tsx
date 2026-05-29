"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { eventsApi } from "@/lib/api/events.api";
import { useAuthStore } from "@/lib/store/authStore";

type Step = 1 | 2 | 3 | 4 | 5;

const steps = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Logistics" },
  { id: 3, label: "Tickets & Pricing" },
  { id: 4, label: "Review" },
  { id: 5, label: "Checklist" },
];

export default function EventCreatorWizardPage() {
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [colleges, setColleges] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const router = useRouter();
  const { collegeId } = useAuthStore();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    clubId: "",
    description: "",
    visibility: "ONLY_MY_COLLEGE" as 'ONLY_MY_COLLEGE' | 'SELECTED_COLLEGES' | 'ALL_PLATFORM' | 'PUBLIC',
    venue: "",
    onlineLink: "",
    format: "In-Person",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    maxCapacity: "",
    ticketPrice: "0",
    ticketName: "General Admission",
    selectedCollegeIds: [] as string[],
  });

  const updateField = (key: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Fetch clubs for organiser's college
  useEffect(() => {
    const fetchClubs = async () => {
      if (!collegeId) return;
      try {
        const response = await eventsApi.getClubsByCollege(collegeId);
        setClubs(response.data.data);
      } catch (err) {
        console.error('Failed to fetch clubs', err);
      }
    };
    fetchClubs();
  }, [collegeId]);

  // Fetch colleges when SELECTED_COLLEGES visibility is chosen
  useEffect(() => {
    if (formData.visibility === 'SELECTED_COLLEGES') {
      eventsApi.getApprovedColleges()
        .then(res => setColleges(res.data.data))
        .catch(console.error);
    }
  }, [formData.visibility]);

  const pctProgress = ((step - 1) / (steps.length - 1)) * 100;

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Build startDate and endDate ISO strings
      const startDateISO = formData.startDate && formData.startTime
        ? new Date(`${formData.startDate}T${formData.startTime}`).toISOString()
        : formData.startDate
        ? new Date(formData.startDate).toISOString()
        : new Date().toISOString();

      const endDateISO = formData.endDate && formData.endTime
        ? new Date(`${formData.endDate}T${formData.endTime}`).toISOString()
        : formData.endDate
        ? new Date(formData.endDate).toISOString()
        : startDateISO;

      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        clubId: formData.clubId || undefined,
        visibility: formData.visibility,
        category: formData.category || undefined,
        format: formData.format || undefined,
        venue: formData.venue || undefined,
        onlineLink: formData.onlineLink || undefined,
        startDate: startDateISO,
        endDate: endDateISO,
        maxCapacity: formData.maxCapacity ? Number(formData.maxCapacity) : undefined,
        ticketPrice: formData.ticketPrice ? Number(formData.ticketPrice) : 0,
        selectedCollegeIds: formData.selectedCollegeIds,
        sessions: [],
      };
      const response = await eventsApi.createEvent(payload);
      const eventId = response.data.data.id;
      router.push(`/org/events/${eventId}/readiness`);
    } catch (err: any) {
      const message = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to create event';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col">
      {/* Minimal Header */}
      <header className="bg-surface w-full px-margin-mobile md:px-margin-desktop h-16 flex items-center border-b border-outline-variant shrink-0">
        <div className="flex items-center gap-md">
          <span className="font-headline-md text-headline-md font-bold text-primary">Eventura</span>
          <span className="text-on-surface-variant text-body-md font-body-md hidden sm:inline-block pl-4 border-l border-outline-variant">Event Creator</span>
        </div>
        <div className="ml-auto">
          <Link href="/org/dashboard" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs">
            <span className="material-symbols-outlined text-[20px]">close</span>
            <span className="font-label-sm text-label-sm uppercase hidden sm:inline-block">Exit Builder</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center py-xl px-margin-mobile md:px-margin-desktop bg-surface-container-low">
        {/* Stepper */}
        <div className="w-full max-w-4xl mb-xl">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-outline-variant z-0"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary z-0 transition-all duration-500" style={{ width: `${pctProgress}%` }}></div>
            {steps.map((s) => {
              const done = s.id < step;
              const active = s.id === step;
              return (
                <div key={s.id} className="relative z-10 flex flex-col items-center gap-sm bg-surface-container-low px-xs">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-label-sm text-label-sm font-bold shadow-sm transition-all ${done ? "bg-primary text-on-primary" : active ? "bg-primary text-on-primary" : "bg-surface border-2 border-outline-variant text-on-surface-variant"}`}>
                    {done ? <span className="material-symbols-outlined text-[16px]">check</span> : s.id}
                  </div>
                  <span className={`font-label-sm text-label-sm uppercase absolute top-10 whitespace-nowrap ${active || done ? "text-primary" : "text-on-surface-variant"}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-3xl bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <div className="p-lg border-b border-outline-variant bg-surface-container-lowest">
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Basic Information</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Start by providing the fundamental details of your institutional event.</p>
              </div>
              <div className="p-lg flex flex-col gap-lg bg-surface">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide" htmlFor="event-title">Event Title <span className="text-error">*</span></label>
                  <input id="event-title" type="text" placeholder="e.g., Annual Tech Symposium 2026" value={formData.title} onChange={(e) => updateField("title", e.target.value)} className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide" htmlFor="event-category">Category <span className="text-error">*</span></label>
                    <select id="event-category" value={formData.category} onChange={(e) => updateField("category", e.target.value)} className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                      <option value="">Select Category</option>
                      <option value="Technical">Technical</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Academic">Academic</option>
                      <option value="Career">Career</option>
                      <option value="Social">Social</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide" htmlFor="event-club">Club (Optional)</label>
                    <select id="event-club" value={formData.clubId} onChange={(e) => updateField("clubId", e.target.value)} className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                      <option value="">No Club / Independent</option>
                      {clubs.map((club) => (
                        <option key={club.id} value={club.id}>{club.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Description <span className="text-error">*</span></label>
                  <textarea rows={5} placeholder="Provide a comprehensive overview of the event..." value={formData.description} onChange={(e) => updateField("description", e.target.value)} className="w-full p-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-y placeholder:text-outline"></textarea>
                </div>
                <div className="flex flex-col gap-md pt-sm border-t border-outline-variant">
                  <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Visibility & Access</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    {[
                      { value: "ONLY_MY_COLLEGE", label: "My College Only", desc: "Restricted to students and faculty at your college." },
                      { value: "ALL_PLATFORM", label: "All Platform", desc: "Visible to all users on Eventura." },
                      { value: "PUBLIC", label: "Public Access", desc: "Open to general public. External registration permitted." },
                      { value: "SELECTED_COLLEGES", label: "Selected Colleges", desc: "Visible to specific colleges you choose." },
                    ].map((opt) => (
                      <label key={opt.value} className={`flex cursor-pointer rounded-lg border p-4 shadow-sm transition-colors ${formData.visibility === opt.value ? "border-primary bg-primary-container/10" : "border-outline-variant hover:bg-surface-container-lowest"}`}>
                        <div className="flex w-full items-start gap-4">
                          <div className="flex items-center h-5">
                            <input type="radio" name="visibility" value={opt.value} checked={formData.visibility === opt.value} onChange={() => updateField("visibility", opt.value)} className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <span className="font-title-md text-title-md text-on-surface">{opt.label}</span>
                            <p className="font-body-md text-body-md text-on-surface-variant mt-1">{opt.desc}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* College multi-select for SELECTED_COLLEGES */}
                  {formData.visibility === 'SELECTED_COLLEGES' && colleges.length > 0 && (
                    <div className="flex flex-col gap-xs mt-2">
                      <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Select Colleges</label>
                      <div className="border border-outline-variant rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                        {colleges.map((college) => (
                          <label key={college.id} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.selectedCollegeIds.includes(college.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  updateField("selectedCollegeIds", [...formData.selectedCollegeIds, college.id]);
                                } else {
                                  updateField("selectedCollegeIds", formData.selectedCollegeIds.filter((id) => id !== college.id));
                                }
                              }}
                              className="h-4 w-4 text-primary"
                            />
                            <span className="font-body-md text-body-md text-on-surface">{college.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 2: Logistics */}
          {step === 2 && (
            <>
              <div className="p-lg border-b border-outline-variant bg-surface-container-lowest">
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Logistics</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Set the date, time, venue and capacity for your event.</p>
              </div>
              <div className="p-lg flex flex-col gap-lg bg-surface">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Format <span className="text-error">*</span></label>
                    <select value={formData.format} onChange={(e) => updateField("format", e.target.value)} className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary">
                      <option value="In-Person">In-Person</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Venue / Location <span className="text-error">*</span></label>
                    <input type="text" placeholder="e.g., Main Auditorium" value={formData.venue} onChange={(e) => updateField("venue", e.target.value)} className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary placeholder:text-outline" />
                  </div>
                  {(formData.format === 'Online' || formData.format === 'Hybrid') && (
                    <div className="flex flex-col gap-xs md:col-span-2">
                      <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Online Link</label>
                      <input type="url" placeholder="https://meet.google.com/..." value={formData.onlineLink} onChange={(e) => updateField("onlineLink", e.target.value)} className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary placeholder:text-outline" />
                    </div>
                  )}
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Start Date <span className="text-error">*</span></label>
                    <input type="date" value={formData.startDate} onChange={(e) => updateField("startDate", e.target.value)} className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Start Time</label>
                    <input type="time" value={formData.startTime} onChange={(e) => updateField("startTime", e.target.value)} className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">End Date <span className="text-error">*</span></label>
                    <input type="date" value={formData.endDate} onChange={(e) => updateField("endDate", e.target.value)} className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">End Time</label>
                    <input type="time" value={formData.endTime} onChange={(e) => updateField("endTime", e.target.value)} className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex flex-col gap-xs md:col-span-2">
                    <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Capacity <span className="text-error">*</span></label>
                    <input type="number" placeholder="e.g., 350" min="1" value={formData.maxCapacity} onChange={(e) => updateField("maxCapacity", e.target.value)} className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary placeholder:text-outline" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Tickets */}
          {step === 3 && (
            <>
              <div className="p-lg border-b border-outline-variant bg-surface-container-lowest">
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Tickets & Pricing</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Configure ticket tiers and pricing for your event.</p>
              </div>
              <div className="p-lg flex flex-col gap-lg bg-surface">
                <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-title-md text-title-md text-on-surface">Ticket Tier 1</h3>
                    <span className="font-label-sm text-label-sm bg-primary-container/20 text-primary px-2 py-1 rounded">Default</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Ticket Name</label>
                      <input type="text" value={formData.ticketName} onChange={(e) => updateField("ticketName", e.target.value)} className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary" />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Price (₹) — 0 for Free</label>
                      <input type="number" min="0" value={formData.ticketPrice} onChange={(e) => updateField("ticketPrice", e.target.value)} className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-primary font-label-sm text-label-sm border border-primary/30 px-4 py-2 rounded-lg hover:bg-primary-container/10 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">add</span>Add Ticket Tier
                </button>
              </div>
            </>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <>
              <div className="p-lg border-b border-outline-variant bg-surface-container-lowest">
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Review Your Event</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Review all the details before submitting your event.</p>
              </div>
              <div className="p-lg flex flex-col gap-md bg-surface">
                {[
                  { label: "Title", value: formData.title || "Not set" },
                  { label: "Category", value: formData.category || "Not set" },
                  { label: "Club", value: clubs.find(c => c.id === formData.clubId)?.name || "None" },
                  { label: "Format", value: formData.format || "Not set" },
                  { label: "Venue", value: formData.venue || "Not set" },
                  { label: "Start Date", value: formData.startDate ? `${formData.startDate} ${formData.startTime || ''}`.trim() : "Not set" },
                  { label: "End Date", value: formData.endDate ? `${formData.endDate} ${formData.endTime || ''}`.trim() : "Not set" },
                  { label: "Capacity", value: formData.maxCapacity || "Not set" },
                  { label: "Ticket Price", value: `₹${formData.ticketPrice}` },
                  { label: "Visibility", value: formData.visibility },
                ].map((field) => (
                  <div key={field.label} className="flex justify-between py-2 border-b border-outline-variant/50">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">{field.label}</span>
                    <span className="font-body-md text-body-md text-on-surface">{field.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Step 5: Submit */}
          {step === 5 && (
            <>
              <div className="p-lg border-b border-outline-variant bg-surface-container-lowest">
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Create Event</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Your event will be created as a draft. You can then publish it from the readiness checklist.</p>
              </div>
              <div className="p-lg flex flex-col gap-lg bg-surface">
                <div className="flex items-start gap-md p-md rounded-lg border border-[#c6e5ca] bg-[#f0f9f1]">
                  <span className="material-symbols-outlined text-[24px] text-[#2e7d32] mt-1 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <div>
                    <span className="font-title-md text-title-md text-on-surface">All details filled</span>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">Your event details look complete. Submit to create a draft event.</p>
                  </div>
                </div>
                <div className="flex items-start gap-md p-md rounded-lg border border-[#c6e5ca] bg-[#f0f9f1]">
                  <span className="material-symbols-outlined text-[24px] text-[#2e7d32] mt-1 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <div>
                    <span className="font-title-md text-title-md text-on-surface">Draft → Publish workflow</span>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">After creating, you&apos;ll be taken to the readiness checklist to review before publishing.</p>
                  </div>
                </div>
                {error && (
                  <div className="flex items-start gap-md p-md rounded-lg border border-error-container bg-[#fff5f5]">
                    <span className="material-symbols-outlined text-[24px] text-error mt-1 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                    <div>
                      <span className="font-title-md text-title-md text-on-surface">Error</span>
                      <p className="font-body-md text-body-md text-error mt-1">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="p-lg border-t border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-center gap-md">
            <button
              onClick={() => setStep((prev) => Math.max(1, prev - 1) as Step)}
              disabled={step === 1}
              className="w-full sm:w-auto h-10 px-lg bg-surface border border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase rounded-lg hover:bg-surface-variant transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === 1 ? "Save Draft" : "Back"}
            </button>
            <div className="flex gap-md w-full sm:w-auto">
              {step < 5 ? (
                <button
                  id="wizard-next-btn"
                  onClick={() => setStep((prev) => Math.min(5, prev + 1) as Step)}
                  className="w-full sm:w-auto h-10 px-lg bg-primary text-on-primary font-label-sm text-label-sm uppercase rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-sm"
                >
                  Continue
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : (
                <button
                  id="wizard-submit-btn"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full sm:w-auto h-10 px-lg bg-primary text-on-primary font-label-sm text-label-sm uppercase rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'Create Event'}
                  <span className="material-symbols-outlined text-[18px]">publish</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-surface border-t border-outline-variant py-md px-margin-mobile text-center">
        <p className="font-label-sm text-label-sm text-on-surface-variant">© 2024 Eventura. Institutional Grade Event Management.</p>
      </footer>
    </div>
  );
}
