# MBR 制作資料

『白鐘学園・最終出席簿』の仕様と本文です。確定仕様は design/SPEC.md、実装で使用する本文は scenario/PLAYABLE_CASES.md、全地点と解放条件は scenario/NODES.md、検証状況は STATUS.md を参照してください。

GitHub Pagesの公開設定と復旧手順は[DEPLOYMENT.md](DEPLOYMENT.md)を参照してください。

scenario/ORIGINAL_40.md と original-40.json は会話で作成した40人の原案です。死亡者・加害者・凶器・トリックの基礎資料として保存します。原案の「死亡瞬間の記録」「記録名の入力」「時間帯別探索」は現行の探索仕様ではありません。原案をそのままプレイヤーに表示しません。

仕様の優先順位は、最新のユーザー指定、design/SPEC.md、現在の src/data、旧原案です。Notionの原本は変更しません。

本文の修正は src/data の正本へ反映し、npm run docs で実装本文の資料を再生成します。生成資料だけを書き換えないでください。
