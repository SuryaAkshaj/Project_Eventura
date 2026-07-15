'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, SignupDto } from '@/lib/api/auth.api';
import CollegeSearch from '@/components/ui/CollegeSearch';

type RoleKey = 'ATTENDEE' | 'COLLEGE_ADMIN' | 'CLUB_PRESIDENT';

// Organisation types — shown as the very first step
const ORG_TYPES = [
  {
    value: 'UNIVERSITY',
    icon: '🎓',
    label: 'University / College',
    description: 'Techfests, culturals, clubs, sports meets',
    examples: 'IIT Bombay, Woxsen, VIT',
  },
  {
    value: 'COMPANY',
    icon: '🏢',
    label: 'Company / Enterprise',
    description: 'Town halls, product launches, HR events',
    examples: 'Google, Razorpay, Zepto',
  },
  {
    value: 'COMMUNITY',
    icon: '👥',
    label: 'Community / Club',
    description: 'Hackathons, meetups, tech talks',
    examples: 'GDG Hyderabad, FOSS United',
  },
  {
    value: 'CREATOR',
    icon: '🎨',
    label: 'Creator / Individual',
    description: 'Workshops, masterclasses, fan events',
    examples: 'YouTubers, coaches, artists',
  },
  {
    value: 'NGO',
    icon: '🤝',
    label: 'NGO / Nonprofit',
    description: 'Fundraisers, awareness drives, volunteer events',
    examples: 'CRY, Teach for India',
  },
  {
    value: 'SPORTS',
    icon: '🏆',
    label: 'Sports Organisation',
    description: 'Tournaments, marathons, fitness events',
    examples: 'Run clubs, sports leagues',
  },
  {
    value: 'ENTERTAINMENT',
    icon: '🎭',
    label: 'Entertainment / Media',
    description: 'Concerts, comedy shows, exhibitions',
    examples: 'Open mics, art galleries',
  },
  {
    value: 'GOVERNMENT',
    icon: '🏛️',
    label: 'Government / Public Sector',
    description: 'Public hearings, civic events, awareness campaigns',
    examples: 'Municipal corps, PSUs',
  },
];

const roles = [
  {
    id: 'ATTENDEE' as RoleKey,
    icon: 'person',
    title: 'Attendee',
    description: 'Discover and register for events, earn co-curricular credits and blockchain-verified certificates.',
    features: ['Browse & register for events', 'Collect verified certificates', 'Track co-curricular progress', 'QR-code entry tickets'],
    cta: 'Join as Attendee',
  },
  {
    id: 'CLUB_PRESIDENT' as RoleKey,
    icon: 'groups',
    title: 'Team Admin',
    description: 'Manage your team, create events, and track attendance for your organisation.',
    features: ['Create team events', 'Live QR scanner & check-in', 'Team member management', 'Event analytics'],
    cta: 'Join as Team Admin',
    badge: 'Requires Approval',
  },
  {
    id: 'COLLEGE_ADMIN' as RoleKey,
    icon: 'business_center',
    title: 'Organisation Admin',
    description: 'Administer your organisation on Eventura — approve teams, manage events, and oversee the platform.',
    features: ['Multi-step event creator', 'Team approval & management', 'Revenue & payout dashboard', 'Real-time analytics'],
    cta: 'Join as Organisation Admin',
    badge: 'Requires Approval',
  },
];


export default function SignupPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleKey | null>(null);

  // Org type selector state
  const [orgType, setOrgType] = useState<string | null>(null);
  const [orgTypeSelected, setOrgTypeSelected] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [collegeDomain, setCollegeDomain] = useState('');
  const [clubName, setClubName] = useState('');
  const [collegeId, setCollegeId] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'First name is required';
    if (!lastName.trim()) errs.lastName = 'Last name is required';
    if (!email.trim()) errs.email = 'Email is required';
    if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) errs.password = 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(password)) errs.password = 'Password must contain a number';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (selectedRole === 'COLLEGE_ADMIN') {
      if (!collegeName.trim()) errs.collegeName = 'Organisation name is required';
      if (!collegeDomain.trim()) errs.collegeDomain = 'Website domain is required';
    }
    if (selectedRole === 'CLUB_PRESIDENT') {
      if (!clubName.trim()) errs.clubName = 'Team name is required';
      if (!collegeId) errs.collegeId = 'Please select your organisation';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate() || !selectedRole) return;
    setIsLoading(true);

    const dto: SignupDto = {
      email, password, firstName, lastName,
      requestedRole: selectedRole,
      orgCategory: orgType || 'UNIVERSITY',
      ...(selectedRole === 'COLLEGE_ADMIN' && { collegeName, collegeDomain }),
      ...(selectedRole === 'CLUB_PRESIDENT' && { clubName, collegeId }),
    };

    try {
      const res = await authApi.signup(dto);
      const userId = res.data.data?.user?.id;
      router.push(`/signup/verify-email?userId=${userId}`);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Signup failed. Please try again.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = 'w-full h-10 px-md border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline';
  const labelClass = 'font-label-sm text-label-sm text-on-surface uppercase tracking-wide';
  const fieldClass = 'flex flex-col gap-xs';

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col">
      <header className="bg-surface border-b border-outline-variant px-margin-mobile md:px-margin-desktop h-16 flex items-center">
        <Link href="/" className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_activity</span>
          Eventura
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-margin-mobile py-xl">
        {/* Step 1: Organisation Type Selector */}
        {!orgTypeSelected ? (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="font-display-lg text-display-lg text-on-surface text-center mb-2">
              What best describes you?
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant text-center mb-8">
              Eventura adapts to your organisation type
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ORG_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => {
                    setOrgType(type.value);
                    setOrgTypeSelected(true);
                    if (type.value !== 'UNIVERSITY') {
                      setSelectedRole('ATTENDEE');
                    }
                  }}
                  className="p-4 bg-surface border-2 border-outline-variant rounded-xl text-left hover:border-primary hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <p className="font-semibold text-on-surface group-hover:text-primary text-sm">
                        {type.label}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{type.description}</p>
                      <p className="text-xs text-outline mt-1">{type.examples}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-lg font-body-md text-body-md text-on-surface-variant text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        ) : !selectedRole ? (
          <>
            {/* Step 2: Role Selection */}
            <div className="text-center mb-xl max-w-2xl">
              <button
                onClick={() => setOrgTypeSelected(false)}
                className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface mb-6 mx-auto transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Change organisation type
              </button>
              <h1 className="font-display-lg text-display-lg text-on-surface mb-3">Choose your role</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Select how you&apos;ll primarily use Eventura. You can always switch roles later.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter w-full max-w-4xl">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary transition-all group flex flex-col cursor-pointer"
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="p-lg border-b border-outline-variant bg-surface-container-lowest">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-primary-container text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{role.icon}</span>
                      </div>
                      {role.badge && (
                        <span className="font-label-sm text-label-sm bg-tertiary-fixed text-on-tertiary-fixed px-2 py-1 rounded-sm uppercase tracking-wider">
                          {role.badge}
                        </span>
                      )}
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">{role.title}</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-2">{role.description}</p>
                  </div>
                  <div className="p-lg flex-1 flex flex-col">
                    <ul className="space-y-2 mb-lg flex-1">
                      {role.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2 font-body-md text-body-md text-on-surface">
                          <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      id={`signup-${role.id.toLowerCase()}-btn`}
                      className="w-full bg-primary text-on-primary font-label-sm text-label-sm py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      {role.cta}
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-lg font-body-md text-body-md text-on-surface-variant">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </>
        ) : (
          /* Step 3: Registration Form */
          <div className="w-full max-w-lg">
            <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-lg border-b border-outline-variant bg-surface-container-lowest">
                <button
                  onClick={() => {
                    if (orgType !== 'UNIVERSITY') {
                      setOrgTypeSelected(false);
                      setOrgType(null);
                      setSelectedRole(null);
                    } else {
                      setSelectedRole(null);
                    }
                  }}
                  className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface mb-3 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  {orgType !== 'UNIVERSITY' ? 'Back to organisation type' : 'Back to role selection'}
                </button>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">Create your account</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  {orgType !== 'UNIVERSITY' 
                    ? 'Get instant access to Eventura'
                    : <>Signing up as <span className="text-primary font-semibold">{roles.find(r => r.id === selectedRole)?.title}</span></>
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-lg flex flex-col gap-md">
                {/* Google Sign Up */}
                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                  <>
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/auth/google?orgType=${orgType || 'UNIVERSITY'}`}
                      className="w-full flex items-center justify-center gap-3 border border-outline-variant rounded-lg py-3 font-body-md text-body-md text-on-surface hover:bg-surface-container-lowest transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      </svg>
                      Continue with Google
                    </a>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-outline-variant"></div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">or sign up with email</span>
                      <div className="flex-1 h-px bg-outline-variant"></div>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-2 gap-md">
                  <div className={fieldClass}>
                    <label htmlFor="firstName" className={labelClass}>First Name</label>
                    <input id="firstName" type="text" placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} className={inputClass} />
                    {errors.firstName && <p className="font-body-sm text-body-sm text-error">{errors.firstName}</p>}
                  </div>
                  <div className={fieldClass}>
                    <label htmlFor="lastName" className={labelClass}>Last Name</label>
                    <input id="lastName" type="text" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} className={inputClass} />
                    {errors.lastName && <p className="font-body-sm text-body-sm text-error">{errors.lastName}</p>}
                  </div>
                </div>

                <div className={fieldClass}>
                  <label htmlFor="email" className={labelClass}>Email</label>
                  <input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
                  {errors.email && <p className="font-body-sm text-body-sm text-error">{errors.email}</p>}
                </div>

                <div className={fieldClass}>
                  <label htmlFor="password" className={labelClass}>Password</label>
                  <input id="password" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
                  {errors.password && <p className="font-body-sm text-body-sm text-error">{errors.password}</p>}
                </div>

                <div className={fieldClass}>
                  <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
                  <input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} />
                  {errors.confirmPassword && <p className="font-body-sm text-body-sm text-error">{errors.confirmPassword}</p>}
                </div>

                {selectedRole === 'COLLEGE_ADMIN' && (
                  <>
                    <div className={fieldClass}>
                      <label htmlFor="collegeName" className={labelClass}>Organisation Name</label>
                      <input id="collegeName" type="text" placeholder="Woxsen University" value={collegeName} onChange={e => setCollegeName(e.target.value)} className={inputClass} />
                      {errors.collegeName && <p className="font-body-sm text-body-sm text-error">{errors.collegeName}</p>}
                    </div>
                    <div className={fieldClass}>
                      <label htmlFor="collegeDomain" className={labelClass}>Website Domain</label>
                      <input id="collegeDomain" type="text" placeholder="yourorg.com" value={collegeDomain} onChange={e => setCollegeDomain(e.target.value)} className={inputClass} />
                      {errors.collegeDomain && <p className="font-body-sm text-body-sm text-error">{errors.collegeDomain}</p>}
                    </div>
                  </>
                )}

                {selectedRole === 'CLUB_PRESIDENT' && (
                  <>
                    <div className={fieldClass}>
                      <label htmlFor="collegeSearch" className={labelClass}>Your Organisation</label>
                      <CollegeSearch
                        value={collegeId}
                        onChange={(id, name) => {
                          setCollegeId(id);
                          setCollegeName(name);
                        }}
                        placeholder="Search your organisation (e.g. IIT Bombay, Google, GDG...)"
                      />
                      {errors.collegeId && <p className="font-body-sm text-body-sm text-error">{errors.collegeId}</p>}
                    </div>
                    <div className={fieldClass}>
                      <label htmlFor="clubName" className={labelClass}>Team / Club Name</label>
                      <input id="clubName" type="text" placeholder="Robotics Club" value={clubName} onChange={e => setClubName(e.target.value)} className={inputClass} />
                      {errors.clubName && <p className="font-body-sm text-body-sm text-error">{errors.clubName}</p>}
                    </div>
                  </>
                )}

                {apiError && (
                  <p className="font-body-sm text-body-sm text-error bg-error-container rounded-lg px-md py-sm">{apiError}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-on-primary font-label-sm text-label-sm py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create Account
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>

                <p className="text-center font-body-md text-body-md text-on-surface-variant">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
                </p>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-surface border-t border-outline-variant py-md px-margin-mobile text-center">
        <p className="font-label-sm text-label-sm text-on-surface-variant">© 2024 Eventura.</p>
      </footer>
    </div>
  );
}
