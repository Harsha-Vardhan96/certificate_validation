import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="fade-in">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary-50)] via-white to-[var(--color-primary-100)]">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[var(--color-primary-200)]/30 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-[var(--color-primary-300)]/20 blur-3xl" />
        </div>

        <div className="container-app relative py-24 md:py-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] text-sm font-medium slide-up" style={{ animationDelay: '0.1s' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
            </svg>
            Trusted by Universities Worldwide
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--color-heading)] leading-tight slide-up" style={{ animationDelay: '0.2s' }}>
            CertiVerify Global
          </h1>

          {/* Tagline */}
          <p className="mt-4 text-lg md:text-xl text-[var(--color-primary-700)] font-medium slide-up" style={{ animationDelay: '0.3s' }}>
            Secure Digital Certificates. Simple Online Verification.
          </p>

          {/* Description */}
          <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-[var(--color-body)] leading-relaxed slide-up" style={{ animationDelay: '0.4s' }}>
            A comprehensive platform for universities and educational institutions to issue,
            manage, and verify digital certificates — giving students and employers instant,
            tamper-proof credential verification.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 slide-up" style={{ animationDelay: '0.5s' }}>
            <Link to="/verify" className="btn btn-primary text-base px-8 py-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
              </svg>
              Verify Certificate
            </Link>
            <Link to="/login" className="btn btn-outline text-base px-8 py-3">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="py-20 bg-white">
        <div className="container-app">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[var(--color-heading)] mb-4">
            Why CertiVerify Global?
          </h2>
          <p className="text-center text-[var(--color-muted)] mb-12 max-w-xl mx-auto">
            A modern credential engine designed for educational institutions of every size.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card text-center slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Tamper-Proof Security</h3>
              <p className="text-sm text-[var(--color-muted)]">
                Every certificate is digitally secured, ensuring authenticity that employers and institutions can trust.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card text-center slide-up" style={{ animationDelay: '0.35s' }}>
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Zm10.28-4.72a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59Z" />
                  <path d="M12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM3.22 7.28a.75.75 0 0 1 1.06 0l1.59 1.591a.75.75 0 1 1-1.06 1.06L3.22 8.342a.75.75 0 0 1 0-1.06ZM21 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 21 12ZM7.28 20.78a.75.75 0 0 1-1.06 0l-1.59-1.59a.75.75 0 0 1 1.06-1.06l1.59 1.59a.75.75 0 0 1 0 1.06ZM3 12a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12ZM16.72 20.78a.75.75 0 0 0 1.06 0l1.59-1.59a.75.75 0 0 0-1.06-1.06l-1.59 1.59a.75.75 0 0 0 0 1.06Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Verification</h3>
              <p className="text-sm text-[var(--color-muted)]">
                Anyone can verify a certificate in seconds with a unique certificate ID — no account required.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card text-center slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.949 49.949 0 0 0-9.902 3.912l-.003.002-.34.18a.75.75 0 0 1-.707 0A50.009 50.009 0 0 0 7.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.129 56.129 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
                  <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 0 1-.46.71 47.878 47.878 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.205 47.205 0 0 0-1.346-.808c-.349-.21-.734-.432-1.146-.661-.39-.217-.78-.428-1.17-.63a.75.75 0 0 1-.41-.67c.035-1.442.12-2.87.255-4.285a48.456 48.456 0 0 1 5.293 1Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Built for Education</h3>
              <p className="text-sm text-[var(--color-muted)]">
                Purpose-built workflows for students, institutions, and administrators — from application to issuance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
