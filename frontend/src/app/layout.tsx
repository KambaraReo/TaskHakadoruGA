import type { Metadata } from "next";
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
        {children}
      </body>
    </html>
  );
}
