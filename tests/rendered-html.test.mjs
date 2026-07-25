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
  assert.match(script, /function createPersonalSheet/);
  assert.match(script, /function getGoogleClientId/);
  assert.match(script, /https:\/\/www\.googleapis\.com\/auth\/drive\.file/);
  assert.match(script, /setInterval\(\(\) => syncFromSheet\(\{ silent: true \}\), 30000\)/);
  assert.match(script, /VISITOR_KEY/);
  assert.match(script, /\(2\)-1 書き問題を出題/);
  assert.match(script, /\(2\)-2 読み問題を出題/);
  assert.match(script, /panel\.scrollTop = panelScroll/);
  assert.match(css, /writing-mode:vertical-rl/);
  assert.match(css, /@page \{ size:A4 landscape/);
});

test("現行の学年別漢字1026字と訓読み優先の例文データを内蔵する", async () => {
  const [script, sampleText] = await Promise.all([
    readFile(new URL("public/app.js", root), "utf8"),
    readFile(new URL("public/kanji-sample-data.json", root), "utf8"),
  ]);
  const gradeMatches = [...script.matchAll(/^\s+([1-6]): "([^"]+)",$/gm)];
  assert.deepEqual(gradeMatches.map((match) => [...match[2]].length), [80, 160, 200, 202, 193, 191]);
  const all = gradeMatches.flatMap((match) => [...match[2]]);
  assert.equal(all.length, 1026);
  assert.equal(new Set(all).size, 1026);
  const samples = JSON.parse(sampleText);
  assert.equal(samples.length, 1026);
  assert.equal(new Set(samples.map((sample) => `${sample.grade}:${sample.id}`)).size, 1026);
  assert.ok(all.every((kanji) => samples.some((sample) => sample.kanji === kanji)));
  assert.ok(samples.every((sample) => /^[ぁ-ゖー]+$/.test(sample.yomi) && sample.sentence.includes(`{{${sample.kanji}[${sample.yomi}]}}`)));
  assert.match(script, /書き問題用/);
  assert.match(script, /読み問題用/);
  assert.match(script, /values:batchGet/);
});
