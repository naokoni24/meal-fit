"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/favorites", label: "お気に入り", icon: "♥" },
  { href: "/history", label: "履歴", icon: "🕘" },
  { href: "/shopping", label: "買い物リスト", icon: "🛒" },
];

export function SavedNav() {
  const pathname = usePathname();
  return (
    <nav className="mb-7 flex gap-2">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex-1 rounded-full px-2 py-2.5 text-center text-[13px] font-medium transition ${
              active
                ? "bg-coral text-white shadow-soft"
                : "border border-line bg-surface text-ink hover:border-coral/40"
            }`}
          >
            <span className="mr-1">{t.icon}</span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
