export default function VerifyPage() {
  return (
    <div className="container-app py-16 fade-in">
      <div className="max-w-xl mx-auto text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-[var(--color-heading)] mb-3">
          Verify Certificate
        </h1>
        <p className="text-[var(--color-muted)] mb-8">
          Enter a certificate ID to verify its authenticity. No account required.
        </p>

        {/* Search form placeholder */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter Certificate ID"
              className="flex-1 px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-sm text-[var(--color-heading)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-transparent transition-shadow"
              disabled
            />
            <button className="btn btn-primary" disabled>
              Verify
            </button>
          </div>
          <p className="mt-4 text-xs text-[var(--color-muted)]">
            Verification will be connected to the backend in a future update.
          </p>
        </div>
      </div>
    </div>
  )
}
