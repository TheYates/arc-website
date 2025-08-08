"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface BottomNavItem {
  label: string;
  href: string;
  icon: ReactNode;
  isActive?: boolean;
}

interface MobileBottomNavProps {
  items: BottomNavItem[];
  className?: string;
}

export function MobileBottomNav({ items, className }: MobileBottomNavProps) {
  const pathname = usePathname();

  if (!items || items.length === 0) return null;

  const cols = items.length || 1;

  return (
    <nav
      className={cn(
        "fixed bottom-0 inset-x-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden",
        "safe-area-inset-bottom",
        className
      )}
      aria-label="Primary"
    >
      <ul
        className={cn("grid gap-1 px-2 py-1")}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const active =
            typeof item.isActive === "boolean"
              ? item.isActive
              : pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center rounded-md px-3 py-2 text-xs transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "mb-1 inline-flex h-6 w-6 items-center justify-center rounded-md",
                    active ? "" : "opacity-80"
                  )}
                >
                  {item.icon}
                </span>
                <span className="leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
