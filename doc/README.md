# MBR 制作資料

『白鐘学園・最終出席簿』の仕様と本文です。初期選択は第2版です。確定仕様は design/SPEC.md、検証状況は STATUS.md を参照してください。

- [第2版の改稿方針・モデル参照元・本文レビュー](scenario/EDITION_2.md)
- [第2版・全40事件](scenario/PLAYABLE_CASES_V2.md)、[41地点](scenario/NODES_V2.md)、[導入・結末・共通資料](scenario/NARRATIVE_V2.md)
- [初版・全40事件](scenario/PLAYABLE_CASES.md)、[41地点](scenario/NODES.md)

初版の正本を編集せず、第2版の本文は `src/data/case-text-v2.js` と `world-text-v2.js` を変更します。版別の生成資料は `npm run docs` で同時に更新します。

GitHub Pagesの公開設定と復旧手順は[DEPLOYMENT.md](DEPLOYMENT.md)を参照してください。

scenario/ORIGINAL_40.md と original-40.json は会話で作成した40人の原案です。死亡者・加害者・凶器・トリックの基礎資料として保存します。原案の「死亡瞬間の記録」「記録名の入力」「時間帯別探索」は現行の探索仕様ではありません。原案をそのままプレイヤーに表示しません。

仕様の優先順位は、最新のユーザー指定、design/SPEC.md、現在の src/data、旧原案です。Notionの原本は変更しません。

本文の修正は src/data の正本へ反映し、npm run docs で実装本文の資料を再生成します。生成資料だけを書き換えないでください。

素材の現状は[配置記録](../inbox/ASSET_PLACEMENT.md)と[不足素材一覧](../inbox/MISSING_ASSETS.md)を参照してください。

音素材は全47点を配置済みで、[試聴ページ](../assets/audio/preview.html)から確認できます。現在の実装には全41地点のPNGがあります。初版・第2版で同じ画像と音を使います。
