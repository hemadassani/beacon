"use client";

import Link from "next/link";
import {
  Calendar,
  FileText,
  Home,
  Lock,
  School,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  alwaysUnlocked?: boolean;
}

const NAV: NavItem[] = [
  { id: "dashboard", label: "dashboard", href: "/dashboard", icon: Home, alwaysUnlocked: true },
  { id: "profile", label: "profile", href: "/profile", icon: User },
  { id: "universities", label: "universities", href: "/universities", icon: School },
  { id: "essays", label: "essays", href: "/essays", icon: FileText },
  { id: "deadlines", label: "deadlines", href: "/deadlines", icon: Calendar },
];

interface UserIdentity {
  displayName: string;
  subtitle: string;
}

interface SidebarProps {
  userIdentity: UserIdentity;
  isAnonymous: boolean;
}

export function Sidebar({ userIdentity, isAnonymous }: SidebarProps) {
  const initial =
    userIdentity.displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <aside className="hidden md:flex md:w-[220px] md:shrink-0 md:flex-col md:rounded-3xl md:bg-white md:p-6">
      <div
        className="font-display font-medium tracking-tight text-[#4F46E5]"
        style={{ fontSize: 22 }}
      >
        beacon.
      </div>

      <div className="my-4 h-px w-full bg-[#EFECE2]" />

      <div className="flex flex-col items-center pb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4F46E5] font-display text-xl font-medium text-white">
          {initial}
        </div>
        <div
          className="mt-3 font-medium text-neutral-900"
          style={{ fontSize: 14 }}
        >
          {userIdentity.displayName}
        </div>
        <div className="text-[#6B6B7B]" style={{ fontSize: 11 }}>
          {userIdentity.subtitle}
        </div>
      </div>

      <div className="mb-4 h-px w-full bg-[#EFECE2]" />

      <nav className="flex flex-col gap-1 text-sm">
        {NAV.map((item) => (
          <NavRow
            key={item.id}
            item={item}
            active={item.id === "dashboard"}
            locked={isAnonymous && !item.alwaysUnlocked}
          />
        ))}
      </nav>

      <div className="mt-auto pt-4">
        <div className="mb-3 h-px w-full bg-[#EFECE2]" />
        <NavRow
          item={{
            id: "settings",
            label: "settings",
            href: "/settings",
            icon: Settings,
          }}
          active={false}
          locked={isAnonymous}
        />
      </div>
    </aside>
  );
}

function NavRow({
  item,
  active,
  locked,
}: {
  item: NavItem;
  active: boolean;
  locked: boolean;
}) {
  const Icon = item.icon;
  const base =
    "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition";
  const variant = active
    ? "bg-[#EEEDFE] text-[#4F46E5] font-medium"
    : locked
      ? "text-[#A8A8B3] cursor-not-allowed"
      : "text-[#6B6B7B] hover:bg-neutral-50";

  const inner = (
    <>
      <span className="flex items-center gap-2">
        <Icon size={16} aria-hidden />
        {item.label}
      </span>
      {locked ? <Lock size={12} aria-hidden /> : null}
    </>
  );

  if (locked) {
    return (
      <span aria-disabled className={`${base} ${variant}`}>
        {inner}
      </span>
    );
  }
  return (
    <Link href={item.href} className={`${base} ${variant}`}>
      {inner}
    </Link>
  );
}
