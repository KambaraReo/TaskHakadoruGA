import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskHakadoruGA - タスク管理アプリ",
  description: "遺伝的アルゴリズムによる最適タスク優先順位提案アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 6000,
              style: {
                background: "var(--card)",
                color: "var(--card-foreground)",
                border: "1px solid var(--border)",
                fontSize: "12px",
                fontWeight: "500",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
