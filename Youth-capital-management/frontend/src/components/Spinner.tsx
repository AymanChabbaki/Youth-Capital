// Matches the live IYA site's loading indicator exactly: a circle with only
// its bottom edge colored, rotating — Tailwind's `animate-spin rounded-full
// border-b-2 border-primary` pattern, reproduced in plain CSS.

export function Spinner({ size = 48, className = "" }: { size?: number; className?: string }) {
  return <span className={`spinner ${className}`.trim()} style={{ width: size, height: size }} aria-hidden="true" />;
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <Spinner size={48} />
    </div>
  );
}
