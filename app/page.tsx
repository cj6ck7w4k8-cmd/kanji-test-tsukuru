import Script from "next/script";

export default function Home() {
  return (
    <>
      <main id="kanji-app" aria-live="polite">
        <div className="boot-card">
          <span className="boot-mark">字</span>
          <p>小テスト作成画面を準備しています…</p>
        </div>
      </main>
      <Script src="/app.js" strategy="afterInteractive" />
    </>
  );
}
