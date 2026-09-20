# GitHub Pagesへの公開

公開先は https://tomtomyoung.github.io/MBR/ です。ゲームはブラウザ内で動作し、サーバー側の処理やAPIキーは不要です。セーブは使用しているブラウザに保存されます。ローカル開発版のセーブを移す場合は「手引き・保存」の書出し・読込みを使ってください。

## 公開元の設定

リポジトリの Settings → Pages → Build and deployment → Source は「GitHub Actions」にします。mainのルートをそのまま公開すると、Vite用の開発HTMLが配信され、ゲーム本体を読み込めません。公開するのは npm run build が生成する dist の内容です。

GitHubの設定画面: https://github.com/TomTomYoung/MBR/settings/pages

## 自動公開

.github/workflows/check.yml が次の順に処理します。

1. Node.js 22で npm ci を実行します。
2. 進行・データ検査、生成資料の一致、製品ビルド、Chromiumの操作検査を実行します。
3. mainの更新またはmainに対する手動実行に限り、検査済みの dist をPages用アーティファクトとして保存します。
4. github-pages環境へデプロイします。PRと他ブランチでは検査だけを行います。

ビルドは相対パスを使用します。画像・日本語フォント・Phaserを同梱するため、/MBR/配下でも外部CDNへの接続なしで起動できます。地点移動はページ内で行い、サーバー側のURL書換えは必要ありません。

## 再公開と確認

Actions → Validate and deploy investigation → Run workflowでmainを選ぶと再公開できます。失敗した実行は原因を直してからRe-run failed jobsで再実行します。PagesのSourceを変更した直後も、このワークフローを実行してください。

deployジョブの成功と公開URLを確認してください。画面では「調査を始める」から正門の資料を調べ、地図で解放済みの場所へ移動できることを確認します。公開HTMLが /src/main.js を参照している場合は、ビルド前のファイルが配信されています。正しい公開HTMLは ./assets/ 内のビルド済みJavaScriptとCSSを参照します。

既存のセーブは公開更新で削除しません。再調査を始めたい場合は、手引きの操作を利用してください。

## 公式資料

[GitHub Pagesのカスタムワークフロー](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)と[Viteの静的公開](https://vite.dev/guide/static-deploy.html#github-pages)を参照してください。
