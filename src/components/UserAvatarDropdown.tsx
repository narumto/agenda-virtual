"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, CalendarDays } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { ACCENT } from "@/config/constants";
import type { UserProfile } from "@/types";

interface UserAvatarDropdownProps {
  userProfile: UserProfile | null;
  onSignOut: () => void;
}

export function UserAvatarDropdown({
  userProfile,
  onSignOut,
}: UserAvatarDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useClickOutside(dropdownRef, () => setOpen(false));

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        id="btn-avatar-menu"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center rounded-full cursor-pointer focus:outline-none group relative"
        aria-label="Menu do usuário"
      >
        {userProfile?.foto_url ? (
          <img
            src={userProfile.foto_url}
            alt="Avatar"
            className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-[#C49A82]/20 group-hover:ring-[#C49A82]/50 transition-all"
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm ring-2 ring-[#C49A82]/20 group-hover:ring-[#C49A82]/50 transition-all"
            style={{ background: ACCENT }}
          >
            {userProfile?.nome
              ? userProfile.nome.charAt(0).toUpperCase()
              : "U"}
          </div>
        )}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white transition-colors ${
            open ? "bg-[#C49A82]" : "bg-emerald-400"
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden animate-fade-in z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-neutral-50">
            <p className="text-xs text-neutral-400 mb-0.5">Logado como</p>
            <p className="text-sm font-semibold text-neutral-800 truncate">
              {userProfile?.nome || "Usuário"}
            </p>
          </div>

          {/* Options */}
          <div className="py-1.5">
            <button
              id="dropdown-minha-conta"
              onClick={() => {
                setOpen(false);
                router.push("/login");
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <User size={15} className="text-neutral-400" />
              Minha Conta
            </button>
            <button
              id="dropdown-meus-agendamentos"
              onClick={() => {
                setOpen(false);
                router.push("/meus-agendamentos");
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 transition-colors cursor-pointer"
              style={{ color: ACCENT }}
            >
              <CalendarDays size={15} style={{ color: ACCENT }} />
              Meus Agendamentos
            </button>
            <button
              id="dropdown-sair"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut size={15} className="text-rose-400" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
