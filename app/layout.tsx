import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "漢字こつこつ｜小テスト作成",
  description: "Googleスプレッドシートの例文から、縦書き漢字小テストと模範解答を作成します。",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "漢字こつこつ",
    description: "縦書き小テストを、かんたん作成。",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "漢字こつこつ" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}

