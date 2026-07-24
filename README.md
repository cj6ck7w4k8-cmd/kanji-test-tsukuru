# 漢字こつこつ

小学校向けの縦書き漢字小テスト作成Webアプリです。現行の学年別漢字配当表1,026字を収録し、書き問題・読み問題を個別に選んでA4横1枚に印刷できます。

## 開発

Node.js 22.13以降を使用します。

```bash
pnpm install
pnpm dev
pnpm test
```

## Googleスプレッドシート連携

Google Cloud Consoleで「ウェブ アプリケーション」のOAuthクライアントを作成し、利用するURLを「承認済みのJavaScript生成元」に登録します。Google Sheets APIも有効にしてください。

`.env.local` またはVercelのEnvironment Variablesに次を設定します。

```text
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
```

アプリは `drive.file` スコープだけを要求します。「専用スプレッドシートを作成」を押した利用者ごとに、その利用者のGoogleドライブへ別ファイルを作り、接続中は30秒ごとに編集内容を読み直します。アクセストークンはブラウザのメモリにだけ保持し、`localStorage` には保存しません。

## データ出典

- 漢字と配当学年: 文部科学省「学年別漢字配当表」（1,026字）
- 初期読みデータ: Electronic Dictionary Research and Development Group の KANJIDIC2

サンプル例文は、正確な読みとアプリの記法を満たす共通形式で自動生成しています。作成されたGoogleスプレッドシート上で、授業に適した例文へ自由に編集できます。
