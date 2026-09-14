import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Craftsman AI — Engineering Dimensions",
  description: "AI-powered service request triage for Engineering Dimensions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
