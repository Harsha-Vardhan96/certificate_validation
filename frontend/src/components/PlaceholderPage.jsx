/**
 * Reusable placeholder page component for routes that are not yet implemented.
 * Shows a consistent, professional placeholder UI across all portals.
 */
export default function PlaceholderPage({ title, description }) {
  return (
    <div className="fade-in">
      <div className="card text-center py-16">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-100)] text-[var(--color-primary-500)] flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
            <path fillRule="evenodd" d="M2.25 6a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V6Zm3.97.97a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 0 1 0-1.06Zm4.28 4.28a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-heading)] mb-2">{title}</h1>
        <p className="text-[var(--color-muted)] max-w-md mx-auto">
          {description || 'This page will be implemented in a future update.'}
        </p>
      </div>
    </div>
  )
}
