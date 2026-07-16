"use client";

import { Sparkles, ArrowLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserAvatarDropdown } from "./UserAvatarDropdown";
import { siteConfig, ACCENT } from "@/config/constants";
import type { UserProfile } from "@/types";

export interface Breadcrumb {
  label: string;
  active?: boolean;
  done?: boolean;
}

interface AppHeaderProps {
  userProfile: UserProfile | null;
  onSignOut: () => void;
  backHref?: string;
  backLabel?: string;
  breadcrumbs?: Breadcrumb[];
  maxWidth?: string;
}

export function AppHeader({
  userProfile,
  onSignOut,
  backHref,
  backLabel,
  breadcrumbs,
  maxWidth = "max-w-7xl",
}: AppHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100 px-6 py-4 md:px-10">
      <div className={`${maxWidth} mx-auto flex items-center justify-between`}>
        {/* Left: Back button + Logo */}
        <div className="flex items-center gap-4">
          {backHref && (
            <>
              <button
                id="btn-back"
                onClick={() => router.push(backHref)}
                className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors group cursor-pointer"
              >
                <ArrowLeft
                  size={15}
                  className="group-hover:-translate-x-0.5 transition-transform"
                />
                {backLabel && (
                  <span className="hidden sm:inline">{backLabel}</span>
                )}
              </button>
              <div className="w-px h-5 bg-neutral-200" />
            </>
          )}

          <div className="flex items-center gap-3 shrink-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: ACCENT }}
            >
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1
                className="text-lg leading-tight text-neutral-900"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 600,
                }}
              >
                {siteConfig.name}
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">
                Estética &amp; Bem-estar
              </p>
            </div>
          </div>
        </div>

        {/* Center: Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.label} className="flex items-center gap-2">
                {i > 0 && <ChevronRight size={11} className="opacity-40" />}
                <span
                  className={
                    crumb.active
                      ? "text-neutral-800 font-semibold"
                      : crumb.done
                        ? "line-through opacity-40"
                        : ""
                  }
                  style={crumb.active ? { color: ACCENT } : undefined}
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Right: Avatar */}
        <UserAvatarDropdown
          userProfile={userProfile}
          onSignOut={onSignOut}
        />
      </div>
    </header>
  );
}
