// Decorative band inspired by Nubian house patterns; drawn in CSS (see .nubian-strip).
export default function NubianStrip({ className = "" }: { className?: string }) {
  return <div className={`nubian-strip ${className}`} aria-hidden="true" />;
}
