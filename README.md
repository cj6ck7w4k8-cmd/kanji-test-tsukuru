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

作成するファイルには、`１年書き問題用`〜`６年読み問題用` の12シートを用意します。各シートは `id, grade, kanji, yomi, sentence` の5列で、`id` は学年ごとに1から始まります。旧形式の単一シートを接続した場合は、新しい12シートを作成し、旧データは非表示のバックアップとして残します。

## データ出典

- 漢字と配当学年: 文部科学省「学年別漢字配当表」（1,026字）
- 語例の基礎データ: [Kanji Alive language data](https://github.com/kanjialive/kanji-data-media)（CC BY 4.0）

サンプルは訓読みを優先した短い単語・熟語です。対象漢字と読みは `{{漢字[よみ]}}` で明示しており、送り仮名はマスの外に残ります。作成されたGoogleスプレッドシート上で、授業に合わせて語例を編集できます。
