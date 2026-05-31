"use client";

import {
  Calendar,
  FileText,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";

interface MaterialCard {
  title: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

const CARDS: MaterialCard[] = [
  {
    title: "Essays",
    icon: FileText,
    iconBg: "#EEEDFE",
    iconColor: "#4F46E5",
  },
  {
    title: "Recommendation Letters",
    icon: Users,
    iconBg: "#E1F5EE",
    iconColor: "#0F6E56",
  },
  {
    title: "Application Timeline",
    icon: Calendar,
    iconBg: "#FAEEDA",
    iconColor: "#854F0B",
  },
  {
    title: "Activities & Leadership",
    icon: Star,
    iconBg: "#FBEAF0",
    iconColor: "#993556",
  },
];

export function ApplicationMaterialsSection() {
  return (
    <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
      {CARDS.map((c) => (
        <MaterialPlaceholder key={c.title} card={c} />
      ))}
    </div>
  );
}

function MaterialPlaceholder({ card }: { card: MaterialCard }) {
  const Icon = card.icon;
  return (
    <div
      className="relative bg-white"
      style={{
        border: "1px solid #EFECE2",
        borderRadius: 16,
        padding: 18,
        opacity: 0.75,
      }}
    >
      <span
        className="absolute right-3 top-3 rounded-full font-semibold uppercase"
        style={{
          fontSize: 9,
          letterSpacing: "0.08em",
          backgroundColor: "#EFECE2",
          color: "#6B6B7B",
          padding: "3px 8px",
        }}
      >
        Coming Soon
      </span>
      <div
        className="flex items-center justify-center rounded-xl"
        style={{
          width: 40,
          height: 40,
          backgroundColor: card.iconBg,
        }}
      >
        <Icon size={18} color={card.iconColor} strokeWidth={2} />
      </div>
      <div
        className="font-semibold"
        style={{ fontSize: 14, marginTop: 12, color: "#1F1F2E" }}
      >
        {card.title}
      </div>
    </div>
  );
}
