"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageContext";

const NAV = [
  {
    href: "/",
    ar: "الرئيسية",
    en: "Home",
    icon: "home",
  },
  {
    href: "/requests",
    ar: "الطلبات",
    en: "Requests",
    icon: "requests",
  },
];

function Icon({
  type,
  active = false,
}: {
  type: string;
  active?: boolean;
}) {
  const stroke = active ? "#f2a51a" : "currentColor";

  if (type === "home") {
    return (
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 10.8 12 3l9 7.8" />
        <path d="M5.5 9.5V21h13V9.5" />
        <path d="M9.5 21v-6h5v6" />
      </svg>
    );
  }

  if (type === "requests") {
    return (
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="3" width="16" height="18" rx="2.5" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </svg>
    );
  }

  return null;
}

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { language, toggleLanguage } = useLanguage();

  const ar = language === "ar";

  return (
    <div
      className={`app-shell min-h-screen ${
        ar ? "rtl" : "ltr"
      }`}
      dir={ar ? "rtl" : "ltr"}
    >
      {/* Background */}
      <div className="app-background-image" />
      <div className="app-background-overlay" />

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="desktop-sidebar">
        <div className="sidebar-brand">
          <div className="brand-row">
            <div className="brand-mark">
              <span>ED</span>
            </div>

            <div>
              <div className="brand-title">
                Engineering Dimensions
              </div>

              <div className="brand-subtitle">
                أبعاد الهندسة للمقاولات
              </div>
            </div>
          </div>

          <div className="sidebar-product">
            <div className="sidebar-product-label">
              CRAFTSMAN AI
            </div>

            <div className="sidebar-product-text">
              Smart service operations
            </div>
          </div>
        </div>

        <nav className="sidebar-navigation">
          <div className="sidebar-section-title">
            {ar ? "القائمة الرئيسية" : "MAIN MENU"}
          </div>

          <div className="sidebar-links">
            {NAV.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${
                    active ? "active" : ""
                  }`}
                >
                  <span className="sidebar-icon">
                    <Icon type={item.icon} active={active} />
                  </span>

                  <span>
                    {ar ? item.ar : item.en}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={toggleLanguage}
            className="sidebar-language"
            type="button"
          >
            <span>
              {ar ? "English" : "العربية"}
            </span>

            <span className="language-badge">
              {ar ? "EN" : "AR"}
            </span>
          </button>

          <div className="sidebar-copyright">
            © Engineering Dimensions
          </div>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="app-main">
        {/* ================= HEADER ================= */}
        <header className="app-header">
          <div className="header-inner">
            {/* Mobile brand */}
            <div className="mobile-header-brand">
              <div className="mobile-brand-mark">
                ED
              </div>

              <div>
                <div className="mobile-brand-name">
                  CRAFTSMAN AI
                </div>

                <div className="mobile-brand-subtitle">
                  {ar
                    ? "إدارة خدمات الصيانة بذكاء"
                    : "Intelligent service operations"}
                </div>
              </div>
            </div>

            {/* Desktop title */}
            <div className="desktop-header-title">
              <div className="header-eyebrow">
                CRAFTSMAN AI
              </div>

              <div className="header-description">
                {ar
                  ? "إدارة خدمات الصيانة بذكاء"
                  : "Intelligent service operations"}
              </div>
            </div>

            {/* Header actions */}
            <div className="header-actions">
              <button
                onClick={toggleLanguage}
                type="button"
                className="header-language"
              >
                <span>
                  {ar ? "English" : "العربية"}
                </span>

                <span className="header-language-badge">
                  {ar ? "EN" : "AR"}
                </span>
              </button>

              <div className="header-ed">
                ED
              </div>
            </div>
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <div className="app-content">
          {children}
        </div>
      </main>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-nav-inner">
          {NAV.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-nav-item ${
                  active ? "active" : ""
                }`}
              >
                <span className="mobile-nav-icon">
                  <Icon
                    type={item.icon}
                    active={active}
                  />
                </span>

                <span className="mobile-nav-label">
                  {ar ? item.ar : item.en}
                </span>
              </Link>
            );
          })}

          {/* Language */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="mobile-nav-item mobile-language-button"
          >
            <span className="mobile-nav-icon language-icon">
              {ar ? "EN" : "ع"}
            </span>

            <span className="mobile-nav-label">
              {ar ? "English" : "العربية"}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}