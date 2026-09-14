"use client";

import { usePopup } from "./popup-provider";
import { StatCard } from "@/components/stat-card";
import type { LucideIcon } from "lucide-react";

export function PopupStatCard({
  label,
  value,
  hint,
  icon,
  title,
  href,
  content,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  title: string;
  href?: string;
  content: React.ReactNode;
}) {
  const { push } = usePopup();

  return (
    <button
      type="button"
      onClick={() => push({ title, href, content })}
      className="block w-full text-left transition hover:-translate-y-0.5"
    >
      <StatCard label={label} value={value} hint={hint} icon={icon} />
    </button>
  );
}
