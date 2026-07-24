import Script from "next/script";

export default function Home() {
  return (
    <>
      <meta name="google-oauth-client-id" content={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""} />
      <main id="kanji-app" aria-live="polite">
        <div className="boot-card">
          <span className="boot-mark">字</span>
          <p>小テスト作成画面を準備しています…</p>
        </div>
      </main>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <Script src="/app.js" strategy="afterInteractive" />
    </>
  );
}
