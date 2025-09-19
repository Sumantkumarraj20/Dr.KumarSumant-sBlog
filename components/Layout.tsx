import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from 'next-i18next' 

import {
  HomeIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  UserCircleIcon,
  EnvelopeIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation("nav");
  
  const router = useRouter();

  const changeLanguage = (lng: string) => {
    router.push(router.asPath, router.asPath, { locale: lng });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-2xl text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <GlobeAltIcon className="w-7 h-7 text-blue-600" />
              Dr. Kumar Sumant
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link
                href="/"
                className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <HomeIcon className="w-5 h-5" />
                {t("home")}
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <UserCircleIcon className="w-5 h-5" />
                {t("about")}
              </Link>
              <Link
                href="/blog"
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                {t("blog")}
              </Link>
              <Link
                href="/chat"
                className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
                {t("chat")}
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <EnvelopeIcon className="w-5 h-5" />
                {t("contact")}
              </Link>
            </nav>

            {/* Language Switch (3-stop pill) */}
            <div className="ml-4 flex items-center">
              <div className="flex rounded-full bg-gray-100 dark:bg-gray-700 p-1">
                {["en", "hi", "ru"].map((lng) => {
                  const isActive = router.locale === lng;
                  return (
                    <button
                      key={lng}
                      onClick={() => changeLanguage(lng)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
                        isActive
                          ? "bg-blue-600 text-white shadow"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {lng === "en" ? "EN" : lng === "hi" ? "हिंदी" : "RU"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
          © {new Date().getFullYear()} Dr. Kumar Sumant · Evidence-based patient
          education
        </div>
      </footer>
    </div>
  );
}
