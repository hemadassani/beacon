import { ArrowRight, Languages, Star, TrendingUp, type LucideIcon } from "lucide-react";

type IconType = "trending" | "language" | "star";

const ICON_BY_TYPE: Record<IconType, LucideIcon> = {
  trending: TrendingUp,
  language: Languages,
  star: Star,
};

const SWATCH: Record<IconType, { bg: string; fg: string }> = {
  trending: { bg: "#EEEDFE", fg: "#4F46E5" },
  language: { bg: "#E1F5EE", fg: "#0F6E56" },
  star: { bg: "#FAEEDA", fg: "#854F0B" },
};

interface RecommendationRowProps {
  recommendation: string;
  iconType: IconType;
}

export function RecommendationRow({
  recommendation,
  iconType,
}: RecommendationRowProps) {
  const Icon = ICON_BY_TYPE[iconType];
  const swatch = SWATCH[iconType];

  return (
    <div
      className="flex items-center gap-[14px] rounded-2xl border bg-white"
      style={{ borderColor: "#EFECE2", padding: "16px 22px" }}
    >
      <div
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: swatch.bg, color: swatch.fg }}
      >
        <Icon size={18} />
      </div>
      <div
        className="flex-1 font-medium text-neutral-900"
        style={{ fontSize: 14 }}
      >
        {recommendation}
      </div>
      <ArrowRight size={16} className="shrink-0 text-[#4F46E5]" />
    </div>
  );
}
