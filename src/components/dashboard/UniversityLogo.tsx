"use client";

import { useState } from "react";

interface UniversityLogoProps {
  domain?: string;
  schoolName?: string;
  size?: number;
}

export function UniversityLogo({
  domain,
  schoolName,
  size = 48,
}: UniversityLogoProps) {
  const token = process.env.NEXT_PUBLIC_LOGOS_DEV_TOKEN;
  const [failed, setFailed] = useState(false);

  const showFallback = !domain || !token || failed;

  if (showFallback) {
    return (
      <div
        aria-hidden
        className="shrink-0 rounded-xl bg-neutral-200"
        style={{ width: size, height: size }}
      />
    );
  }

  const url = `https://img.logo.dev/${domain}?token=${token}&size=${size * 2}&format=png`;
  const alt = schoolName ? `${schoolName} logo` : `${domain} logo`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className="shrink-0 rounded-xl bg-white object-contain"
      style={{ width: size, height: size }}
    />
  );
}
