import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Eventura — Event Management for Every Organisation",
  description: "The premier platform for events, certificates, and co-curricular management across organisations.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      {/* Navigation */}
      <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 max-w-7xl mx-auto">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_activity</span>
            Eventura
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/colleges" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Organisations</Link>
            <Link href="/events" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Events</Link>
            <a href="#features" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Features</a>
            <a href="#about" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant rounded-md px-4 py-2 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="font-label-sm text-label-sm bg-primary text-on-primary hover:bg-primary/90 rounded-md px-4 py-2 transition-colors shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop py-xl text-center relative overflow-hidden bg-gradient-to-b from-surface to-surface-container-low">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-tertiary rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-label-sm text-label-sm mb-6 border border-primary/20">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            Built for Every Organisation
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-6 leading-tight">
            Events for Every
            <span className="text-primary"> Organisation</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-8">
            The platform for discovering, managing, and certifying events —
            from college fests to corporate events, community meetups to creator workshops.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-primary text-on-primary font-title-md text-title-md px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 flex items-center gap-2 justify-center"
            >
              Start for Free
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <Link
              href="/events"
              className="bg-surface border-2 border-outline-variant text-on-surface font-title-md text-title-md px-8 py-4 rounded-xl hover:bg-surface-container-low transition-colors flex items-center gap-2 justify-center"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="py-xl px-margin-mobile md:px-margin-desktop bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-headline-lg text-headline-lg text-on-surface text-center mb-xl">
            Everything your organisation needs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {[
              { icon: "confirmation_number", title: "Smart Ticketing", desc: "QR-code tickets with real-time validation and attendance tracking.", color: "bg-primary-container" },
              { icon: "workspace_premium", title: "Blockchain Certificates", desc: "Tamper-proof co-curricular credentials issued automatically after events.", color: "bg-tertiary-fixed" },
              { icon: "insights", title: "Live Analytics", desc: "Real-time dashboards for organizers, administrators, and finance teams.", color: "bg-secondary-container" },
            ].map((feat) => (
              <div key={feat.title} className="bg-surface border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${feat.color} flex items-center justify-center mb-4`}>
                  <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{feat.icon}</span>
                </div>
                <h3 className="font-title-md text-title-md text-on-surface mb-2">{feat.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for — 4 cards */}
      <section className="py-xl px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-headline-lg text-headline-lg text-on-surface text-center mb-3">
            Built for every kind of organisation
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant text-center mb-10">
            Whether you run a college club or a corporate event team
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: '🎓',
                title: 'Universities & Colleges',
                desc: 'Techfests, culturals, workshops, club events',
                color: 'bg-primary-container/30 border-primary-container',
              },
              {
                icon: '🏢',
                title: 'Companies & Startups',
                desc: 'Town halls, product launches, offsites',
                color: 'bg-secondary-container/30 border-secondary-container',
              },
              {
                icon: '👥',
                title: 'Communities & Clubs',
                desc: 'Meetups, hackathons, open mics',
                color: 'bg-tertiary-fixed/30 border-tertiary-fixed',
              },
              {
                icon: '🎨',
                title: 'Creators & Educators',
                desc: 'Masterclasses, webinars, fan events',
                color: 'bg-primary-container/20 border-primary/20',
              },
            ].map(item => (
              <div
                key={item.title}
                className={`p-5 rounded-xl border ${item.color}`}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-on-surface mb-1 text-sm">{item.title}</h3>
                <p className="text-xs text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-xl px-margin-mobile md:px-margin-desktop bg-primary text-on-primary">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-gutter text-center">
          {[
            { value: '100+', label: 'Organisations' },
            { value: 'National', label: 'Coverage' },
            { value: 'Real-Time', label: 'QR Check-in' },
            { value: 'Verified', label: 'Certificates' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-display-lg text-display-lg text-on-primary">{stat.value}</div>
              <div className="font-label-sm text-label-sm text-primary-fixed-dim uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-xl px-margin-mobile md:px-margin-desktop bg-surface-container-low text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Ready to transform your events?</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
            Join hundreds of organisations already using Eventura to streamline their event ecosystem.
          </p>
          <Link
            href="/signup"
            className="bg-primary text-on-primary font-title-md text-title-md px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 inline-flex items-center gap-2"
          >
            Get Started Today
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-xl px-margin-mobile md:px-margin-desktop bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">About Eventura</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Eventura is built for organisations that want a modern, secure,
            and unified way to manage events — from registration to certificates.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-xl px-margin-mobile md:px-margin-desktop bg-surface-container-low text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Get in Touch</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">Have questions? We&apos;d love to hear from you.</p>
          <a
            href="mailto:support@eventura.app"
            className="inline-flex items-center gap-2 bg-primary text-on-primary font-title-md text-title-md px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container border-t border-outline-variant py-lg px-margin-mobile md:px-margin-desktop">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold text-primary text-[20px] flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_activity</span>
            Eventura
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="/terms" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary">Terms</a>
            <a href="/privacy" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary">Privacy</a>
            <a href="/refunds" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary">Refunds</a>
            <a href="mailto:support@eventura.app" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary">Support</a>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant">© 2024 Eventura. Event Management for Every Organisation.</p>
        </div>
      </footer>
    </div>
  );
}
