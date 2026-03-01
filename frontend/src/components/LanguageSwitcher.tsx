'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage, translations } = useLanguage();

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'es' | 'fr')}
        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
      >
        <option value="en" className="bg-slate-800">English</option>
        <option value="hi" className="bg-slate-800">हिंदी</option>
        <option value="es" className="bg-slate-800">Español</option>
        <option value="fr" className="bg-slate-800">Français</option>
      </select>
    </div>
  );
}

