'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, SignupDto } from '@/lib/api/auth.api';
import CollegeSearch from '@/components/ui/CollegeSearch';

type RoleKey = 'ATTENDEE' | 'COLLEGE_ADMIN' | 'CLUB_PRESIDENT';

const roles = [
  {
    id: 'ATTENDEE' as RoleKey,
    icon: 'person',
    title: 'Student / Attendee',
    description: 'Discover and register for campus events, earn co-curricular credits and blockchain-verified certificates.',
    features: ['Browse & register for events', 'Collect verified certificates', 'Track co-curricular progress', 'QR-code entry tickets'],
    cta: 'Join as Attendee',
  },
  {
    id: 'CLUB_PRESIDENT' as RoleKey,
    icon: 'groups',
    title: 'Club President',
    description: 'Manage your club, create events, and track attendance for your college club.',
    features: ['Create club events', 'Live QR scanner & check-in', 'Club member management', 'Event analytics'],
    cta: 'Join as Club President',
    badge: 'Requires Approval',
  },
  {
    id: 'COLLEGE_ADMIN' as RoleKey,
    icon: 'business_center',
    title: 'College Admin',
    description: 'Administer your college on Eventura — approve clubs, manage events, and oversee the platform.',
    features: ['Multi-step event creator', 'Club approval & management', 'Revenue & payout dashboard', 'Real-time analytics'],
    cta: 'Join as College Admin',
    badge: 'Requires Approval',
  },
];


export default function SignupPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleKey | null>(null);

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
      if (!collegeName.trim()) errs.collegeName = 'College name is required';
      if (!collegeDomain.trim()) errs.collegeDomain = 'College domain is required';
    }
    if (selectedRole === 'CLUB_PRESIDENT') {
      if (!clubName.trim()) errs.clubName = 'Club name is required';
      if (!collegeId) errs.collegeId = 'Please select your college';
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
        {!selectedRole ? (
          <>
            <div className="text-center mb-xl max-w-2xl">
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
          <div className="w-full max-w-lg">
            <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-lg border-b border-outline-variant bg-surface-container-lowest">
                <button
                  onClick={() => setSelectedRole(null)}
                  className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface mb-3 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Back to role selection
                </button>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">Create your account</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Signing up as <span className="text-primary font-semibold">{roles.find(r => r.id === selectedRole)?.title}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-lg flex flex-col gap-md">
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
                  <label htmlFor="email" className={labelClass}>Institutional Email</label>
                  <input id="email" type="email" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
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
                      <label htmlFor="collegeName" className={labelClass}>College Name</label>
                      <input id="collegeName" type="text" placeholder="Woxsen University" value={collegeName} onChange={e => setCollegeName(e.target.value)} className={inputClass} />
                      {errors.collegeName && <p className="font-body-sm text-body-sm text-error">{errors.collegeName}</p>}
                    </div>
                    <div className={fieldClass}>
                      <label htmlFor="collegeDomain" className={labelClass}>College Domain</label>
                      <input id="collegeDomain" type="text" placeholder="university.edu" value={collegeDomain} onChange={e => setCollegeDomain(e.target.value)} className={inputClass} />
                      {errors.collegeDomain && <p className="font-body-sm text-body-sm text-error">{errors.collegeDomain}</p>}
                    </div>
                  </>
                )}

                {selectedRole === 'CLUB_PRESIDENT' && (
                  <>
                    <div className={fieldClass}>
                      <label htmlFor="collegeSearch" className={labelClass}>Your College</label>
                      <CollegeSearch
                        value={collegeId}
                        onChange={(id, name) => {
                          setCollegeId(id);
                          setCollegeName(name);
                        }}
                        placeholder="Search your college (e.g. IIT Bombay, Woxsen...)"
                      />
                      {errors.collegeId && <p className="font-body-sm text-body-sm text-error">{errors.collegeId}</p>}
                    </div>
                    <div className={fieldClass}>
                      <label htmlFor="clubName" className={labelClass}>Club Name</label>
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
