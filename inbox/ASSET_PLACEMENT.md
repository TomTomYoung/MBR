# 素材の配置記録

2026-09-21更新。救護廊下・小劇場・衣装庫の背景3点を追加し、現在は画像17点、音47点（OGGとWAV原本各47点）です。残る背景24地点は今回未確認・未配置です。以下の過去記録は各作業時点の状態です。

## 初回の画像

体育館：inbox/5e875439-ed3a-4256-9b44-0927ff941ec8.png → assets/scenes/gym.png
食堂：inbox/624183ab-beff-445d-9296-54e1bb933722.png → assets/scenes/cafeteria.png
中央広場：inbox/c1e4a1f1-f175-4b07-89ae-1f2212ae970b.png → assets/scenes/courtyard.png
保健室：inbox/c850d87c-f322-4fd4-b214-c5687cf5ea7a.png → assets/scenes/infirmary.png
温室・水路縁：inbox/d1111e98-1de3-43b2-95fb-1a2f45bfdfc6.png → assets/scenes/greenhouse.png
図書室：inbox/d1525c27-24e3-4a76-aab8-911d68d3f621.png → assets/scenes/library.png
校内スタジオ：inbox/e12ba298-1f90-4e8d-8f60-38c56826186c.png → assets/scenes/studio.png
正門：inbox/e7230fe7-aab5-4810-a703-1d998903df29.png → assets/scenes/gate.png

スタジオは録画内だけに幕が残る修正版を採用しました。旧版はassets/source/20260920/studio-before-banner-fix.pngへ保管しました。既存41枚のSVGは保持し、PNGが存在する地点はPNG、PNG未配置地点はSVGを読み込みます。

## 初回の音24点

001　残された校庭 → assets/audio/bgm/investigation.ogg（WAV原本：assets/audio/masters/bgm/investigation.wav）
002　焼き付いた事実 → assets/audio/bgm/reconstruction.ogg（WAV原本：assets/audio/masters/bgm/reconstruction.wav）
003　証言の継ぎ目 → assets/audio/bgm/deduction.ogg（WAV原本：assets/audio/masters/bgm/deduction.wav）
004　最終出席簿 → assets/audio/bgm/final-attendance.ogg（WAV原本：assets/audio/masters/bgm/final-attendance.wav）
005　島の風と遠い波 → assets/audio/ambience/island-wind.ogg（WAV原本：assets/audio/masters/ambience/island-wind.wav）
006　無人の校舎 → assets/audio/ambience/empty-school.ogg（WAV原本：assets/audio/masters/ambience/empty-school.wav）
007　カーソル → assets/audio/sfx/ui-cursor.ogg（WAV原本：assets/audio/masters/sfx/ui-cursor.wav）
008　決定 → assets/audio/sfx/ui-confirm.ogg（WAV原本：assets/audio/masters/sfx/ui-confirm.wav）
009　戻る → assets/audio/sfx/ui-back.ogg（WAV原本：assets/audio/masters/sfx/ui-back.wav）
010　手帳を開く → assets/audio/sfx/notebook-open.ogg（WAV原本：assets/audio/masters/sfx/notebook-open.wav）
011　証拠を記録 → assets/audio/sfx/evidence-record.ogg（WAV原本：assets/audio/masters/sfx/evidence-record.wav）
012　証言を記録 → assets/audio/sfx/testimony-record.ogg（WAV原本：assets/audio/masters/sfx/testimony-record.wav）
013　発見再現に入る → assets/audio/sfx/replay-enter.ogg（WAV原本：assets/audio/masters/sfx/replay-enter.wav）
014　発見再現から戻る → assets/audio/sfx/replay-exit.ogg（WAV原本：assets/audio/masters/sfx/replay-exit.wav）
015　三件のリポート確定 → assets/audio/sfx/report-confirm.ogg（WAV原本：assets/audio/masters/sfx/report-confirm.wav）
016　全件確定 → assets/audio/sfx/all-confirmed.ogg（WAV原本：assets/audio/masters/sfx/all-confirmed.wav）
017　校内の足音 → assets/audio/sfx/footsteps.ogg（WAV原本：assets/audio/masters/sfx/footsteps.wav）
018　扉とラッチ → assets/audio/sfx/door-latch.ogg（WAV原本：assets/audio/masters/sfx/door-latch.wav）
019　寝台を引く → assets/audio/sfx/bed-drag.ogg（WAV原本：assets/audio/masters/sfx/bed-drag.wav）
020　水滴 → assets/audio/sfx/water-drips.ogg（WAV原本：assets/audio/masters/sfx/water-drips.wav）
021　水面のしぶき → assets/audio/sfx/water-splash.ogg（WAV原本：assets/audio/masters/sfx/water-splash.wav）
022　放送スイッチと校内チャイム → assets/audio/sfx/broadcast-chime.ogg（WAV原本：assets/audio/masters/sfx/broadcast-chime.wav）
023　遠い発砲音 → assets/audio/sfx/distant-gunshot.ogg（WAV原本：assets/audio/masters/sfx/distant-gunshot.wav）
024　金属機構の作動と停止 → assets/audio/sfx/mechanism-stop.ogg（WAV原本：assets/audio/masters/sfx/mechanism-stop.wav）

音は初期無効です。切替後、探索・再現・手帳/リポート・結末のBGM、屋外/室内の環境音、UI音、証拠/証言記録、確定時の効果音を再生します。再現の現場音はsrc/data/media.jsの明示的な対応で客観描写の行だけへ割り当てます。再現中は通常探索の環境音を止めます。

broadcast-chimeとdistant-gunshotは配置済みの予備素材です。チャイムや銃声に触れた証言へ自動的に音を付けると事実と主張を混同するため、現在の再現へは割り当てていません。

assets/audio/preview.htmlで初回24点と追加23点を合わせた全47点を試聴できます。

## 破損素材の復旧

アップロードされたOGG 020・022・023・024、およびWAV 004はデコードに失敗しました。前回作成した正常な配布原本が残っていたため復旧し、配布時SHA256SUMSとの一致を確認しました。受領した破損データはassets/source/20260920/corruptに保管しています。

元の説明・生成コード・プロンプト・配布時チェックサムはassets/source/20260920に保管しました。ここにある旧README・catalog・SHA256SUMSは配布時の仮番号を記録した資料です。現行の配置先はassets/asset-manifest.jsonが正本です。

不足素材：[MISSING_ASSETS.md](MISSING_ASSETS.md)。

## 追加素材01：効果音22項目・23音源

受領時55ファイルのSHA256はすべて一致し、OGG23点・WAV23点をデコードできました。追加音源はすでに用途名が付いていたため、その名称を本番名として採用し、ディレクトリを移しました。

025　放送卓スイッチ

受領：inbox/audio_ogg/broadcast-switch.ogg、inbox/audio_wav/broadcast-switch.wav

配置：assets/audio/sfx/broadcast-switch.ogg、assets/audio/masters/sfx/broadcast-switch.wav

使用：case-33:0（行番号は0から）。

026　椅子と金属食器の転倒

受領：inbox/audio_ogg/chair-fall-tableware.ogg、inbox/audio_wav/chair-fall-tableware.wav

配置：assets/audio/sfx/chair-fall-tableware.ogg、assets/audio/masters/sfx/chair-fall-tableware.wav

使用：case-03:0（行番号は0から）。

027　重い辞典の返却口への落下

受領：inbox/audio_ogg/heavy-book-return.ogg、inbox/audio_wav/heavy-book-return.wav

配置：assets/audio/sfx/heavy-book-return.ogg、assets/audio/masters/sfx/heavy-book-return.wav

使用：case-23:0（行番号は0から）。

028　本が床へ落ちる音

受領：inbox/audio_ogg/book-drop.ogg、inbox/audio_wav/book-drop.wav

配置：assets/audio/sfx/book-drop.ogg、assets/audio/masters/sfx/book-drop.wav

使用：case-26:0（行番号は0から）。

029　衣装の擦れと杖の一打

受領：inbox/audio_ogg/cloth-cane.ogg、inbox/audio_wav/cloth-cane.wav

配置：assets/audio/sfx/cloth-cane.ogg、assets/audio/masters/sfx/cloth-cane.wav

使用：case-34:0（行番号は0から）。

030　高所足場の金具

受領：inbox/audio_ogg/catwalk-metal.ogg、inbox/audio_wav/catwalk-metal.wav

配置：assets/audio/sfx/catwalk-metal.ogg、assets/audio/masters/sfx/catwalk-metal.wav

使用：case-15:0（行番号は0から）。

031　配達箱の開扉と封筒

受領：inbox/audio_ogg/delivery-envelope.ogg、inbox/audio_wav/delivery-envelope.wav

配置：assets/audio/sfx/delivery-envelope.ogg、assets/audio/masters/sfx/delivery-envelope.wav

使用：case-04:0（行番号は0から）。

032　鏡板の軋みとカメラの滑り

受領：inbox/audio_ogg/mirror-camera.ogg、inbox/audio_wav/mirror-camera.wav

配置：assets/audio/sfx/mirror-camera.ogg、assets/audio/masters/sfx/mirror-camera.wav

使用：case-10:0（行番号は0から）。

033　台車停止と鋏を置く音

受領：inbox/audio_ogg/cart-stop-scissors.ogg、inbox/audio_wav/cart-stop-scissors.wav

配置：assets/audio/sfx/cart-stop-scissors.ogg、assets/audio/masters/sfx/cart-stop-scissors.wav

使用：case-25:0（行番号は0から）。

034　投影機の定常回転

受領：inbox/audio_ogg/projector-loop.ogg、inbox/audio_wav/projector-loop.wav

配置：assets/audio/sfx/projector-loop.ogg、assets/audio/masters/sfx/projector-loop.wav

使用：case-16:0（行番号は0から）。

035　投影機の回転停止

受領：inbox/audio_ogg/projector-stop.ogg、inbox/audio_wav/projector-stop.wav

配置：assets/audio/sfx/projector-stop.ogg、assets/audio/masters/sfx/projector-stop.wav

使用：case-36:0（行番号は0から）。

036　衣装掛けの転倒

受領：inbox/audio_ogg/clothes-rack-fall.ogg、inbox/audio_wav/clothes-rack-fall.wav

配置：assets/audio/sfx/clothes-rack-fall.ogg、assets/audio/masters/sfx/clothes-rack-fall.wav

使用：case-20:0（行番号は0から）。

037　箱の崩落

受領：inbox/audio_ogg/crate-collapse.ogg、inbox/audio_wav/crate-collapse.wav

配置：assets/audio/sfx/crate-collapse.ogg、assets/audio/masters/sfx/crate-collapse.wav

使用：case-39:0（行番号は0から）。

038　無人の自動演奏ピアノ

受領：inbox/audio_ogg/player-piano.ogg、inbox/audio_wav/player-piano.wav

配置：assets/audio/sfx/player-piano.ogg、assets/audio/masters/sfx/player-piano.wav

使用：case-35:0（行番号は0から）。

039　案内板の切替

受領：inbox/audio_ogg/sign-flip.ogg、inbox/audio_wav/sign-flip.wav

配置：assets/audio/sfx/sign-flip.ogg、assets/audio/masters/sfx/sign-flip.wav

使用：case-27:0（行番号は0から）。

040　鍵束

受領：inbox/audio_ogg/keys-jingle.ogg、inbox/audio_wav/keys-jingle.wav

配置：assets/audio/sfx/keys-jingle.ogg、assets/audio/masters/sfx/keys-jingle.wav

使用：case-05:0、case-28:0（行番号は0から）。

041　排水の終わり

受領：inbox/audio_ogg/drain-finish.ogg、inbox/audio_wav/drain-finish.wav

配置：assets/audio/sfx/drain-finish.ogg、assets/audio/masters/sfx/drain-finish.wav

使用：case-09:0（行番号は0から）。

042　医療器具の接触

受領：inbox/audio_ogg/medical-tools.ogg、inbox/audio_wav/medical-tools.wav

配置：assets/audio/sfx/medical-tools.ogg、assets/audio/masters/sfx/medical-tools.wav

使用：case-13:0（行番号は0から）。

043　警告ブザーの停止

受領：inbox/audio_ogg/warning-buzzer-stop.ogg、inbox/audio_wav/warning-buzzer-stop.wav

配置：assets/audio/sfx/warning-buzzer-stop.ogg、assets/audio/masters/sfx/warning-buzzer-stop.wav

使用：case-08:0（行番号は0から）。

044　送信機の起動

受領：inbox/audio_ogg/transmitter-start.ogg、inbox/audio_wav/transmitter-start.wav

配置：assets/audio/sfx/transmitter-start.ogg、assets/audio/masters/sfx/transmitter-start.wav

使用：case-32:0（行番号は0から）。

045　扉を叩く音

受領：inbox/audio_ogg/door-knock.ogg、inbox/audio_wav/door-knock.wav

配置：assets/audio/sfx/door-knock.ogg、assets/audio/masters/sfx/door-knock.wav

使用：case-31:0（行番号は0から）。

046　予約端末の作動

受領：inbox/audio_ogg/terminal-scheduled.ogg、inbox/audio_wav/terminal-scheduled.wav

配置：assets/audio/sfx/terminal-scheduled.ogg、assets/audio/masters/sfx/terminal-scheduled.wav

使用：case-07:3（行番号は0から）。

047　報告書の印字

受領：inbox/audio_ogg/report-print.ogg、inbox/audio_wav/report-print.wav

配置：assets/audio/sfx/report-print.ogg、assets/audio/masters/sfx/report-print.wav

使用：case-24:2（行番号は0から）。

追加23音源を24箇所の客観描写へ接続しました。鍵束はcase-05とcase-28で共有します。case-07の予約端末は行3、case-24の印字は行2で鳴らし、それ以前の行では鳴らしません。証言の内容・真偽から音を選びません。

投影機の定常音はcase-16の行0で繰り返し、次の行への移動、再現の終了・中断、音OFF、タブ非表示で止めます。case-36の停止描写には別ファイルprojector-stopを使います。音OFFやタブ非表示で止めた効果音は自動再開しません。

制作資料はassets/source/20260920-additional-01へ保存しました。試聴ページはassets/audio/additional-preview.htmlへ移し、現在の音源パスへ修正しました。全47点の試聴ページも更新しています。

## 背景33枚の受領状況

今回のアップロードは音源と制作資料のみです。image_selection.jsonに採用画像名と予定配置先はありますが、PNG本体はありません。assets/asset-manifest.jsonのpending_imagesへ33件を登録し、状態をgenerated-not-received（制作済み・未受領）としました。ゲームは現在のPNG8地点とSVG33地点を表示します。

装備点検室・避難所・非常階段・最終報告室は、対応表にある修正版を受領後に採用します。残る未制作の追加演出素材はMISSING_ASSETS.mdを参照してください。

## 2026-09-21 講堂1枚のみ配置

inbox/ChatGPT Image 2026年9月21日 05_34_57 (1).png → assets/scenes/lecture.png。演台・客席・壁際の点検口を確認しました。PNGを再圧縮せず移動し、元ファイルと同一のGit blobを使用しています。既存のPNG優先読込により講堂はPNG表示になります。manifestへ追加し、不足一覧から講堂だけを除外しました。残りの画像は今回処理していません。

## 2026-09-21 プール更衣室1枚のみ配置

inbox/ChatGPT Image 2026年9月21日 05_34_57 (2).png → assets/scenes/changing.png。ロッカー列・奥の点検扉・プールに通じる出入口を確認しました。PNGの正常読込と元ファイルとのGit blob一致を確認し、再圧縮せず移動しています。既存のPNG優先読込によりプール更衣室はPNG表示になります。manifestへ追加し、不足一覧からプール更衣室だけを除外しました。残りの画像は今回処理していません。

## 2026-09-21 天井点検路1枚のみ配置

inbox/ChatGPT Image 2026年9月21日 05_34_57 (3).png → assets/scenes/ceiling.png。梁・寝台を見下ろす開口・点検路の入口を確認しました。PNGの正常読込と元ファイルとのGit blob一致を確認し、再圧縮せず移動しています。既存のPNG優先読込により天井点検路はPNG表示になります。manifestへ追加し、不足一覧から天井点検路だけを除外しました。残りの画像は今回処理していません。

## 2026-09-21 医務室・安置庫・防音相談室の3枚を配置

医務室（medical）：inbox/ChatGPT Image 2026年9月21日 05_34_57 (4).png → assets/scenes/medical.png。器具台の空き枠・安置庫へ向かう床の線を確認しました。

安置庫（morgue）：inbox/ChatGPT Image 2026年9月21日 05_34_58 (5).png → assets/scenes/morgue.png。二つの台・それぞれに掛かった名札を確認しました。

防音相談室（consult）：inbox/ChatGPT Image 2026年9月21日 05_34_58 (6).png → assets/scenes/consult.png。丸い卓・机の下の空間・厚い防音扉を確認しました。

3枚ともPNGの正常読込と元ファイルとのGit blob一致を確認し、再圧縮せず移動しています。既存のPNG優先読込により3地点はPNG表示になります。manifestへ追加し、不足一覧から該当する3地点だけを除外しました。残りの画像は今回処理していません。

## 2026-09-21 救護廊下・小劇場・衣装庫の3枚を配置

救護廊下（rescue）：inbox/ChatGPT Image 2026年9月21日 05_34_58 (7).png → assets/scenes/rescue.png。台車・車輪痕・交差する足跡を確認しました。

小劇場（theater）：inbox/ChatGPT Image 2026年9月21日 05_34_59 (8).png → assets/scenes/theater.png。舞台・空の客席・舞台上の鏡と撮影機材を確認しました。

衣装庫（wardrobe）：inbox/ChatGPT Image 2026年9月21日 05_34_59 (10).png → assets/scenes/wardrobe.png。前室・控室・壁面の両面ロッカー・衣装掛けを確認しました。

衣装庫は受領ファイルの連番ではなく画像内容を照合し、(10).pngを採用しました。3枚ともPNGの正常読込と元ファイルとのGit blob一致を確認し、再圧縮せず移動しています。既存のPNG優先読込により3地点はPNG表示になります。manifestへ追加し、不足一覧から該当する3地点だけを除外しました。残りの画像は今回処理していません。
