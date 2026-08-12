"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  const [started, setStarted] = useState(false);
  const duration = toast.duration || 4000;

  useEffect(() => {
    // Start CSS progress bar animation after mount
    const animFrame = requestAnimationFrame(() => {
      setStarted(true);
    });

    // Auto-dismiss timer
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(timer);
    };
  }, [toast.id, duration, onDismiss]);

  const config = {
    success: {
      bg: "bg-[#1E2923] text-emerald-100 border border-emerald-700/50 shadow-emerald-950/20",
      iconBg: "bg-emerald-500/20 text-emerald-400",
      progressBg: "bg-emerald-400",
      icon: CheckCircle2,
    },
    error: {
      bg: "bg-[#291E1E] text-rose-100 border border-rose-700/50 shadow-rose-950/20",
      iconBg: "bg-rose-500/20 text-rose-400",
      progressBg: "bg-rose-400",
      icon: AlertCircle,
    },
    warning: {
      bg: "bg-[#29251E] text-amber-100 border border-amber-700/50 shadow-amber-950/20",
      iconBg: "bg-amber-500/20 text-amber-400",
      progressBg: "bg-amber-400",
      icon: AlertTriangle,
    },
    info: {
      bg: "bg-[#1E1C1A] text-neutral-100 border border-[#C49A82]/40 shadow-black/30",
      iconBg: "bg-[#C49A82]/20 text-[#C49A82]",
      progressBg: "bg-[#C49A82]",
      icon: Info,
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-2xl p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-toast-in flex items-start gap-3.5 ${config.bg}`}
    >
      <div className={`p-2 rounded-xl shrink-0 ${config.iconBg}`}>
        <Icon size={18} />
      </div>

      <div className="flex-1 min-w-0 pr-2 pt-0.5">
        <h4 className="text-xs font-semibold leading-tight tracking-wide">{toast.title}</h4>
        {toast.description && (
          <p className="text-[11px] opacity-80 mt-1 leading-normal">{toast.description}</p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 shrink-0 cursor-pointer"
      >
        <X size={14} />
      </button>

      {/* Progress Bar with Pure CSS Transition */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/30">
        <div
          className={`h-full ${config.progressBg}`}
          style={{
            width: started ? "0%" : "100%",
            transition: started ? `width ${duration}ms linear` : "none",
          }}
        />
      </div>
    </div>
  );
}
