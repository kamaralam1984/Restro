'use client';

import { useTheme } from '@/context/ThemeContext';
import { Moon, SunMedium, Eye } from 'lucide-react';

export default function ThemeSwitcher() {
  const { theme, cycleTheme } = useTheme();

  const label =
    theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'Color-blind';

  const Icon =
    theme === 'dark' ? Moon : theme === 'light' ? SunMedium : Eye;

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800/70 border border-slate-700 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
      title="Toggle theme (Dark / Light / Color-blind)"
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

