import React from 'react';
import { useTranslation } from 'react-i18next';

export default function App() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const professions = [
    'electrician',
    'plumber',
    'carpenter',
    'painter',
    'mason',
    'tiles_flooring',
    'welder',
    'roofer',
    'house_cleaning',
    'construction_labourer'
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-900 flex items-center justify-center font-bold text-xl shadow-sm">
              KC
            </div>
            <div>
              <span className="font-bold text-xl text-stone-900 tracking-tight">KaamConnect AI</span>
              <span className="ml-2 text-xs bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">v1.0 Ready</span>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg border border-stone-200">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                i18n.resolvedLanguage === 'en'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => changeLanguage('hi')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                i18n.resolvedLanguage === 'hi'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => changeLanguage('te')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                i18n.resolvedLanguage === 'te'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              తెలుగు
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            {t('common.tagline')}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight mb-4">
            {t('landing.heroTitle')}
          </h1>
          <p className="text-lg text-stone-600 leading-relaxed">
            {t('landing.heroSubtitle')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold shadow-md transition-all">
              {t('landing.ctaCustomer')}
            </button>
            <button className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-md transition-all">
              {t('landing.ctaWorker')}
            </button>
          </div>
        </div>

        {/* 10 Professions Grid Preview */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-stone-800 mb-6 text-center">
            {t('landing.popularCategories')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {professions.map((profKey) => (
              <div
                key={profKey}
                className="bg-white border border-stone-200 hover:border-amber-400 p-4 rounded-xl shadow-sm hover:shadow transition-all text-center group cursor-pointer"
              >
                <div className="w-12 h-12 mx-auto rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg mb-2 group-hover:scale-110 transition-transform">
                  🛠️
                </div>
                <div className="text-sm font-semibold text-stone-800">
                  {t(`professions.${profKey}`)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Steps Section */}
        <div className="mt-16 bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-stone-900 text-center mb-8">
            {t('landing.howItWorks')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
              <div className="font-bold text-amber-600 mb-2">{t('landing.step1Title')}</div>
              <p className="text-sm text-stone-600">{t('landing.step1Desc')}</p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
              <div className="font-bold text-amber-600 mb-2">{t('landing.step2Title')}</div>
              <p className="text-sm text-stone-600">{t('landing.step2Desc')}</p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
              <div className="font-bold text-amber-600 mb-2">{t('landing.step3Title')}</div>
              <p className="text-sm text-stone-600">{t('landing.step3Desc')}</p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
              <div className="font-bold text-amber-600 mb-2">{t('landing.step4Title')}</div>
              <p className="text-sm text-stone-600">{t('landing.step4Desc')}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-6 border-t border-stone-800 text-center text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 KaamConnect AI. Empowering local skilled workers with transparent technology.</p>
        </div>
      </footer>
    </div>
  );
}
