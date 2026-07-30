"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

export type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    } else {
      applyTheme("system");
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (
      newTheme === "dark" ||
      (newTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-1 p-1 bg-stone-200/60 dark:bg-stone-800/80 rounded-xl border border-stone-300/60 dark:border-stone-700/60 shadow-inner">
      <button
        type="button"
        onClick={() => handleThemeChange("light")}
        className={`p-1.5 rounded-lg transition-all text-xs flex items-center gap-1 cursor-pointer ${
          theme === "light"
            ? "bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 font-semibold shadow-sm"
            : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
        }`}
        title="Tema Claro"
      >
        <Sun size={14} />
      </button>

      <button
        type="button"
        onClick={() => handleThemeChange("dark")}
        className={`p-1.5 rounded-lg transition-all text-xs flex items-center gap-1 cursor-pointer ${
          theme === "dark"
            ? "bg-stone-900 text-amber-300 font-semibold shadow-sm"
            : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
        }`}
        title="Tema Escuro"
      >
        <Moon size={14} />
      </button>

      <button
        type="button"
        onClick={() => handleThemeChange("system")}
        className={`p-1.5 rounded-lg transition-all text-xs flex items-center gap-1 cursor-pointer ${
          theme === "system"
            ? "bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 font-semibold shadow-sm"
            : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
        }`}
        title="Tema do Sistema"
      >
        <Laptop size={14} />
      </button>
    </div>
  );
}
