import { FlowWaves } from "@/components/FlowWaves";

export function DashboardBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <pattern
            id="beacon-grid-dash"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="#4F46E5"
              strokeOpacity="0.1"
              strokeWidth="0.75"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#beacon-grid-dash)" />
      </svg>
      <FlowWaves variant="ambient" />
    </div>
  );
}
