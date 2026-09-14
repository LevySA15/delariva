"use client";

import { usePopup } from "./popup-provider";

export function PopupTrigger({
  title,
  href,
  content,
  children,
}: {
  title: string;
  href?: string;
  content: React.ReactNode;
  children: React.ReactNode;
}) {
  const { push } = usePopup();

  return (
    <button
      type="button"
      onClick={() => push({ title, href, content })}
      className="block w-full text-left transition hover:-translate-y-0.5"
    >
      {children}
    </button>
  );
}
