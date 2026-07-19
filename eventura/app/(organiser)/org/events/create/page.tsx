"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { eventsApi } from "@/lib/api/events.api";
import { useAuthStore } from "@/lib/store/authStore";

type Step = 1 | 2 | 3 | 4 | 5;
type EventType = 'FEST' | 'COMPETITION' | 'WORKSHOP' | 'SEMINAR' | 'OTHER';

const steps = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Logistics" },
  { id: 3, label: "Tickets & Pricing" },
  { id: 4, label: "Review" },
  { id: 5, label: "Checklist" },
];

const typeConfig: Record<EventType, { icon: string; label: string; color: string; hoverBorder: string; checkColor: string; tags: string[]; examples: string[]; tagBg: string; tagText: string }> = {
  FEST: {
    icon: '🎪', label: 'Fest / Cultural Event', color: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300', hoverBorder: 'hover:border-indigo-400',
    checkColor: 'text-indigo-400', tags: ['Multi-day', 'Sub-events', 'Accommodation', 'Sponsors'],
    examples: ['Techfest, Mood Indigo, Saarang', 'Sports meets, Cultural nights', 'Has sub-events inside'],
    tagBg: 'bg-indigo-50 dark:bg-indigo-950', tagText: 'text-indigo-600 dark:text-indigo-400',
  },
  COMPETITION: {
    icon: '🏆', label: 'Competition', color: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300', hoverBorder: 'hover:border-amber-400',
    checkColor: 'text-amber-400', tags: ['Prize Pool', 'Team Size', 'Rules', 'Judging'],
    examples: ['Hackathons, Debates, Case Studies', 'Coding contests, Robotics', 'Has prizes and team sizes'],
    tagBg: 'bg-amber-50 dark:bg-amber-950', tagText: 'text-amber-600 dark:text-amber-400',
  },
  WORKSHOP: {
    icon: '🛠️', label: 'Workshop', color: 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300', hoverBorder: 'hover:border-green-400',
    checkColor: 'text-green-400', tags: ['Sessions', 'Certificate', 'Hands-on', 'Trainer'],
    examples: ['AI/ML workshops, Design sprints', 'Coding bootcamps', 'Certificate provided'],
    tagBg: 'bg-green-50 dark:bg-green-950', tagText: 'text-green-600 dark:text-green-400',
  },
  SEMINAR: {
    icon: '🎤', label: 'Seminar / Talk', color: 'bg-purple-50 text-purple-700 dark:text-purple-300', hoverBorder: 'hover:border-purple-400',
    checkColor: 'text-purple-400', tags: ['Speaker', 'Q&A', 'Free entry', 'Networking'],
    examples: ['Guest lectures, Panel discussions', 'Industry talks, TED-style', 'Usually free to attend'],
    tagBg: 'bg-purple-50', tagText: 'text-purple-600',
  },
  OTHER: {
    icon: '📅', label: 'Other Event', color: 'bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300', hoverBorder: 'hover:border-gray-400',
    checkColor: 'text-gray-400 dark:text-gray-500', tags: ['Flexible', 'General'],
    examples: ['Any other type of event'],
    tagBg: 'bg-gray-50 dark:bg-gray-950', tagText: 'text-gray-600 dark:text-gray-400',
  },
};

function EventCreatorWizardContent() {
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [colleges, setColleges] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const { collegeId } = useAuthStore();

  // Event type state
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [typeSelected, setTypeSelected] = useState(false);

  // Derived helpers
  const isFest = eventType === 'FEST';
  const isCompetition = eventType === 'COMPETITION';

  // Handle ?parentId query param (creating sub-event from fest manage page)
  const parentId = searchParams.get('parentId');
  const parentTitle = searchParams.get('parentTitle');

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
    prizePool: "",
    registrationDeadline: "",
    teamSizeMin: "",
    teamSizeMax: "",
    parentEventId: "",
    // Fest-specific
    accommodation: false,
    accommodationInfo: "",
    guestPerformers: "",
    sponsorNames: "",
    festEdition: "",
    // Competition-specific
    competitionRules: "",
    judgingCriteria: "",
    submissionFormat: "",
  });

  const updateField = (key: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // If parentId in URL — skip type selector, default to COMPETITION, pre-fill parentEventId
  useEffect(() => {
    if (parentId) {
      setEventType('COMPETITION');
      setTypeSelected(true);
      setFormData(p => ({ ...p, parentEventId: parentId }));
    }
  }, [parentId]);

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

  // Per-step validation
  const validateStep = (stepNumber: number): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    if (stepNumber === 1) {
      if (!formData.title?.trim()) errors.title = 'Event title is required';
      else if (formData.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
      if (!formData.description?.trim()) errors.description = 'Description is required';
      if (!formData.category) errors.category = 'Please select a category';
    }
    if (stepNumber === 2) {
      if (!formData.startDate) errors.startDate = 'Start date is required';
      if (!formData.endDate) errors.endDate = 'End date is required';
      if (formData.startDate && formData.endDate) {
        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
          errors.endDate = 'End date must be after start date';
        }
      }
      if (!formData.venue && !formData.onlineLink) {
        errors.venue = 'Please provide a venue or online link';
      }
    }
    if (stepNumber === 3) {
      if (formData.ticketPrice === undefined || formData.ticketPrice === '') {
        errors.ticketPrice = 'Please set a price (0 for free)';
      }
    }
    return { valid: Object.keys(errors).length === 0, errors };
  };

  const handleContinue = () => {
    const { valid, errors } = validateStep(step);
    if (!valid) {
      setStepErrors(errors);
      return;
    }
    setStepErrors({});
    setStep(s => Math.min(5, s + 1) as Step);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
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
        registrationDeadline: formData.registrationDeadline
          ? new Date(formData.registrationDeadline).toISOString()
          : undefined,
        selectedCollegeIds: formData.selectedCollegeIds,
        sessions: [],
        // Event type system
        eventType: eventType || 'OTHER',
        parentEventId: formData.parentEventId || undefined,
        // Fest-specific
        accommodation: isFest ? formData.accommodation : undefined,
        accommodationInfo: isFest ? formData.accommodationInfo || undefined : undefined,
        guestPerformers: isFest ? formData.guestPerformers || undefined : undefined,
        sponsorNames: isFest ? formData.sponsorNames || undefined : undefined,
        festEdition: isFest && formData.festEdition ? Number(formData.festEdition) : undefined,
        // Competition-specific
        prizePool: isCompetition && formData.prizePool ? Number(formData.prizePool) : undefined,
        teamSizeMin: isCompetition && formData.teamSizeMin ? Number(formData.teamSizeMin) : undefined,
        teamSizeMax: isCompetition && formData.teamSizeMax ? Number(formData.teamSizeMax) : undefined,
        competitionRules: isCompetition ? formData.competitionRules || undefined : undefined,
        judgingCriteria: isCompetition ? formData.judgingCriteria || undefined : undefined,
        submissionFormat: isCompetition ? formData.submissionFormat || undefined : undefined,
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

  // ─── Event Type Selector Screen ───────────────────────────────────────────
  if (!typeSelected) {
    return (
      <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col">
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

        <main className="flex-grow flex flex-col items-center justify-center py-xl px-margin-mobile md:px-margin-desktop bg-surface-container-low">
          <div className="max-w-2xl w-full mx-auto">
            <h1 className="text-2xl font-bold text-on-surface mb-2 text-center">What are you creating?</h1>
            <p className="text-on-surface-variant text-center mb-8 font-body-md">
              Choose the type of event to get a customised creation experience
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['FEST', 'COMPETITION', 'WORKSHOP', 'SEMINAR'] as EventType[]).map(type => {
                const cfg = typeConfig[type];
                return (
                  <button
                    key={type}
                    id={`event-type-${type.toLowerCase()}`}
                    onClick={() => { setEventType(type); setTypeSelected(true); }}
                    className={`p-6 bg-surface border-2 border-outline-variant rounded-xl text-left ${cfg.hoverBorder} hover:shadow-md transition-all group`}
                  >
                    <div className="text-3xl mb-3">{cfg.icon}</div>
                    <h3 className="text-lg font-bold text-on-surface group-hover:text-primary mb-1">{cfg.label}</h3>
                    <div className="space-y-1 mb-3">
                      {cfg.examples.map(t => (
                        <p key={t} className={`text-xs text-on-surface-variant flex items-center gap-1`}>
                          <span className={cfg.checkColor}>✓</span> {t}
                        </p>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cfg.tags.map(tag => (
                        <span key={tag} className={`text-xs ${cfg.tagBg} ${cfg.tagText} px-2 py-0.5 rounded-full`}>{tag}</span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        <footer className="bg-surface border-t border-outline-variant py-md px-margin-mobile text-center">
          <p className="font-label-sm text-label-sm text-on-surface-variant">© 2024 Eventura. Institutional Grade Event Management.</p>
        </footer>
      </div>
    );
  }

  // ─── Main Wizard (after type is selected) ────────────────────────────────
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
        {/* Type indicator + change type */}
        <div className="w-full max-w-3xl flex items-center gap-2 mb-4">
          {!parentId && (
            <button
              onClick={() => { setTypeSelected(false); setEventType(null); }}
              className="text-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1"
            >
              ← Change type
            </button>
          )}
          {eventType && (
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${typeConfig[eventType].color}`}>
              {typeConfig[eventType].icon} {typeConfig[eventType].label}
            </span>
          )}
          {parentId && parentTitle && (
            <span className="text-sm text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 px-3 py-1 rounded-full">
              Adding to: <strong>{decodeURIComponent(parentTitle)}</strong>
            </span>
          )}
        </div>

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
                  <input
                    id="event-title"
                    type="text"
                    placeholder="e.g., Annual Tech Symposium 2026"
                    value={formData.title}
                    onChange={(e) => {
                      updateField("title", e.target.value);
                      if (stepErrors.title) setStepErrors(p => ({ ...p, title: '' }));
                    }}
                    className={`w-full h-10 px-md border rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:ring-1 placeholder:text-outline ${
                      stepErrors.title ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-outline-variant focus:border-primary focus:ring-primary'
                    }`}
                  />
                  {stepErrors.title && (
                    <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>⚠</span> {stepErrors.title}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide" htmlFor="event-category">Category <span className="text-error">*</span></label>
                    <select
                      id="event-category"
                      value={formData.category}
                      onChange={(e) => {
                        updateField("category", e.target.value);
                        if (stepErrors.category) setStepErrors(p => ({ ...p, category: '' }));
                      }}
                      className={`w-full h-10 px-md border rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:ring-1 ${
                        stepErrors.category ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-outline-variant focus:border-primary focus:ring-primary'
                      }`}
                    >
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
                    {stepErrors.category && (
                      <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>⚠</span> {stepErrors.category}</p>
                    )}
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
                  <textarea
                    rows={5}
                    placeholder="Provide a comprehensive overview of the event..."
                    value={formData.description}
                    onChange={(e) => {
                      updateField("description", e.target.value);
                      if (stepErrors.description) setStepErrors(p => ({ ...p, description: '' }));
                    }}
                    className={`w-full p-md border rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:ring-1 resize-y placeholder:text-outline ${
                      stepErrors.description ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-outline-variant focus:border-primary focus:ring-primary'
                    }`}
                  />
                  {stepErrors.description && (
                    <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>⚠</span> {stepErrors.description}</p>
                  )}
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
                    <input
                      type="text"
                      placeholder="e.g., Main Auditorium"
                      value={formData.venue}
                      onChange={(e) => {
                        updateField("venue", e.target.value);
                        if (stepErrors.venue) setStepErrors(p => ({ ...p, venue: '' }));
                      }}
                      className={`w-full h-10 px-md border rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:ring-1 placeholder:text-outline ${
                        stepErrors.venue ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-outline-variant focus:border-primary focus:ring-primary'
                      }`}
                    />
                    {stepErrors.venue && (
                      <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>⚠</span> {stepErrors.venue}</p>
                    )}
                  </div>
                  {(formData.format === 'Online' || formData.format === 'Hybrid') && (
                    <div className="flex flex-col gap-xs md:col-span-2">
                      <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Online Link</label>
                      <input type="url" placeholder="https://meet.google.com/..." value={formData.onlineLink} onChange={(e) => updateField("onlineLink", e.target.value)} className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary placeholder:text-outline" />
                    </div>
                  )}
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Start Date <span className="text-error">*</span></label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => {
                        updateField("startDate", e.target.value);
                        if (stepErrors.startDate) setStepErrors(p => ({ ...p, startDate: '' }));
                      }}
                      className={`w-full h-10 px-md border rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:ring-1 ${
                        stepErrors.startDate ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-outline-variant focus:border-primary focus:ring-primary'
                      }`}
                    />
                    {stepErrors.startDate && (
                      <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>⚠</span> {stepErrors.startDate}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Start Time</label>
                    <input type="time" value={formData.startTime} onChange={(e) => updateField("startTime", e.target.value)} className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">End Date <span className="text-error">*</span></label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => {
                        updateField("endDate", e.target.value);
                        if (stepErrors.endDate) setStepErrors(p => ({ ...p, endDate: '' }));
                      }}
                      className={`w-full h-10 px-md border rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:ring-1 ${
                        stepErrors.endDate ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-outline-variant focus:border-primary focus:ring-primary'
                      }`}
                    />
                    {stepErrors.endDate && (
                      <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><span>⚠</span> {stepErrors.endDate}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">End Time</label>
                    <input type="time" value={formData.endTime} onChange={(e) => updateField("endTime", e.target.value)} className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex flex-col gap-xs md:col-span-2">
                    <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Capacity <span className="text-error">*</span></label>
                    <input type="number" placeholder="e.g., 350" min="1" value={formData.maxCapacity} onChange={(e) => updateField("maxCapacity", e.target.value)} className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary placeholder:text-outline" />
                  </div>

                  {/* Registration Deadline */}
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Registration Deadline</label>
                    <input
                      type="datetime-local"
                      value={formData.registrationDeadline}
                      onChange={(e) => updateField("registrationDeadline", e.target.value)}
                      className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary"
                    />
                    <p className="text-xs text-on-surface-variant">Leave blank to use event start date as deadline</p>
                  </div>

                  {/* Prize Pool — only for COMPETITION */}
                  {isCompetition && (
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Total Prize Pool (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.prizePool}
                        onChange={(e) => updateField("prizePool", e.target.value)}
                        placeholder="e.g. 50000"
                        className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary placeholder:text-outline"
                      />
                    </div>
                  )}

                  {/* Team Size — only for COMPETITION */}
                  {isCompetition && (
                    <>
                      <div className="flex flex-col gap-xs">
                        <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Min Team Size</label>
                        <input type="number" min="1" value={formData.teamSizeMin} onChange={(e) => updateField("teamSizeMin", e.target.value)} placeholder="1" className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary placeholder:text-outline" />
                      </div>
                      <div className="flex flex-col gap-xs">
                        <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Max Team Size</label>
                        <input type="number" min="1" value={formData.teamSizeMax} onChange={(e) => updateField("teamSizeMax", e.target.value)} placeholder="4" className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary placeholder:text-outline" />
                      </div>
                    </>
                  )}
                </div>

                {/* Competition-specific fields */}
                {isCompetition && (
                  <div className="flex flex-col gap-lg border-t border-outline-variant pt-lg">
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Rules & Regulations</label>
                      <textarea
                        value={formData.competitionRules}
                        onChange={(e) => updateField("competitionRules", e.target.value)}
                        rows={4}
                        placeholder="Enter competition rules, eligibility criteria, submission guidelines..."
                        className="w-full p-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary resize-y placeholder:text-outline"
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Judging Criteria</label>
                      <textarea
                        value={formData.judgingCriteria}
                        onChange={(e) => updateField("judgingCriteria", e.target.value)}
                        rows={3}
                        placeholder="How will entries be judged?"
                        className="w-full p-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary resize-y placeholder:text-outline"
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Submission Format</label>
                      <input
                        type="text"
                        value={formData.submissionFormat}
                        onChange={(e) => updateField("submissionFormat", e.target.value)}
                        placeholder="e.g., GitHub repo + 2-page PDF writeup"
                        className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary placeholder:text-outline"
                      />
                    </div>
                  </div>
                )}

                {/* Fest-specific fields */}
                {isFest && (
                  <div className="flex flex-col gap-lg border-t border-outline-variant pt-lg">
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Fest Edition (Optional)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.festEdition}
                        onChange={(e) => updateField("festEdition", e.target.value)}
                        placeholder="e.g. 15 for '15th Edition'"
                        className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary placeholder:text-outline"
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">Guest Performers / Speakers (Optional)</label>
                      <input
                        type="text"
                        value={formData.guestPerformers}
                        onChange={(e) => updateField("guestPerformers", e.target.value)}
                        placeholder="e.g. Arijit Singh, Zakir Khan (comma separated)"
                        className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary placeholder:text-outline"
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.accommodation}
                          onChange={(e) => updateField("accommodation", e.target.checked)}
                          className="w-4 h-4 text-primary rounded"
                        />
                        <span className="text-sm font-medium text-on-surface">Accommodation available for outstation participants</span>
                      </label>
                      {formData.accommodation && (
                        <textarea
                          value={formData.accommodationInfo}
                          onChange={(e) => updateField("accommodationInfo", e.target.value)}
                          rows={2}
                          placeholder="Describe accommodation arrangements, cost, booking process..."
                          className="mt-2 w-full p-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary resize-y placeholder:text-outline"
                        />
                      )}
                    </div>
                  </div>
                )}
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
                  { label: "Event Type", value: eventType ? `${typeConfig[eventType].icon} ${typeConfig[eventType].label}` : 'Not set' },
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
                  ...(isCompetition && formData.prizePool ? [{ label: "Prize Pool", value: `₹${formData.prizePool}` }] : []),
                  ...(isFest && formData.festEdition ? [{ label: "Fest Edition", value: `${formData.festEdition}th Edition` }] : []),
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
                  onClick={handleContinue}
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

export default function EventCreatorWizardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-container-low flex items-center justify-center"><p className="text-on-surface-variant">Loading...</p></div>}>
      <EventCreatorWizardContent />
    </Suspense>
  );
}
