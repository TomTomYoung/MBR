# 素材の配置記録

2026-09-20。inboxへアップロードされた素材を確認し、画像8点、音24点（OGGとWAV原本）をリネーム・配置しました。

## 画像

体育館：inbox/5e875439-ed3a-4256-9b44-0927ff941ec8.png → assets/scenes/gym.png
食堂：inbox/624183ab-beff-445d-9296-54e1bb933722.png → assets/scenes/cafeteria.png
中央広場：inbox/c1e4a1f1-f175-4b07-89ae-1f2212ae970b.png → assets/scenes/courtyard.png
保健室：inbox/c850d87c-f322-4fd4-b214-c5687cf5ea7a.png → assets/scenes/infirmary.png
温室・水路縁：inbox/d1111e98-1de3-43b2-95fb-1a2f45bfdfc6.png → assets/scenes/greenhouse.png
図書室：inbox/d1525c27-24e3-4a76-aab8-911d68d3f621.png → assets/scenes/library.png
校内スタジオ：inbox/e12ba298-1f90-4e8d-8f60-38c56826186c.png → assets/scenes/studio.png
正門：inbox/e7230fe7-aab5-4810-a703-1d998903df29.png → assets/scenes/gate.png

スタジオは録画内だけに幕が残る修正版を採用しました。旧版はassets/source/20260920/studio-before-banner-fix.pngへ保管しました。既存41枚のSVGは保持し、PNGが存在する地点はPNG、未制作地点はSVGを読み込みます。

## 音

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

assets/audio/preview.htmlで命名後の全24点を試聴できます。

## 破損素材の復旧

アップロードされたOGG 020・022・023・024、およびWAV 004はデコードに失敗しました。前回作成した正常な配布原本が残っていたため復旧し、配布時SHA256SUMSとの一致を確認しました。受領した破損データはassets/source/20260920/corruptに保管しています。

元の説明・生成コード・プロンプト・配布時チェックサムはassets/source/20260920に保管しました。ここにある旧README・catalog・SHA256SUMSは配布時の仮番号を記録した資料です。現行の配置先はassets/asset-manifest.jsonが正本です。

不足素材：[MISSING_ASSETS.md](MISSING_ASSETS.md)。
