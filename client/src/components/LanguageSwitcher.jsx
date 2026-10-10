import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ variant = 'default' }) {
  const { i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('kaamconnect_lang', lang);
  };

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिंदी', short: 'हि' },
    { code: 'te', label: 'తెలుగు', short: 'తె' }
  ];

  return (
    <div className="flex items-center gap-1 bg-stone-100/80 backdrop-blur-md p-1 rounded-xl border border-stone-200 shadow-sm">
      <Globe className="w-3.5 h-3.5 text-stone-400 ml-1.5 mr-0.5" />
      {languages.map((lng) => {
        const isActive = (i18n.resolvedLanguage || i18n.language)?.startsWith(lng.code);
        return (
          <button
            key={lng.code}
            onClick={() => changeLanguage(lng.code)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
            title={lng.label}
          >
            {variant === 'compact' ? lng.short : lng.label}
          </button>
        );
      })}
    </div>
  );
}
