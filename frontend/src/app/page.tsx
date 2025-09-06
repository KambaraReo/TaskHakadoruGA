"use client";

import { Header } from "@/components/Header";
import { MainContent } from "@/components/MainContent";
import { Footer } from "@/components/Footer";
import { AuthGuard } from "@/components/AuthGuard";
import { AuthPage } from "@/components/auth/AuthPage";

export default function Home() {
  return (
    <div className="min-h-screen app-container">
      <AuthGuard fallback={<AuthPage />}>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <MainContent />
          <Footer />
        </div>
      </AuthGuard>
    </div>
  );
}
