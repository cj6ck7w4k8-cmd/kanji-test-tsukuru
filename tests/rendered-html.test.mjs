import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("漢字小テスト作成画面のシェルを配信する", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>漢字こつこつ｜小テスト作成<\/title>/);
  assert.match(html, /id="kanji-app"/);
  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  assert.match(page, /src="\/app\.js"/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview/);
});

test("主要な要件をクライアント実装と印刷CSSに含む", async () => {
  const [script, css] = await Promise.all([
    readFile(new URL("public/app.js", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);
  assert.match(script, /MAX_QUESTIONS = 20/);
  assert.match(script, /すべてひらがな/);
  assert.match(script, /小テストに表示する漢字は何年生までか/);
  assert.match(script, /localStorage/);
  assert.match(script, /parseCSV/);
  assert.match(script, /validateRows/);
  assert.match(script, /サンプルスプレッドシートを書き出す/);
  assert.match(script, /function exportSampleSheet/);
  assert.match(script, /kanji-sample-\$\{visitorId\(\)\}\.csv/);
  assert.match(script, /VISITOR_KEY/);
  assert.match(css, /writing-mode:vertical-rl/);
  assert.match(css, /@page \{ size:A4 landscape/);
});
