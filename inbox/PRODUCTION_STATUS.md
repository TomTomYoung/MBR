MBR 追加素材 01 制作結果

背景33地点を生成し、画風と主要な配置を目視確認しました。生成画像は会話に個別表示されています。修正前と修正後の両方が表示された地点では、後に表示された画像が採用版です。装備点検室、避難所、非常階段、最終報告室は修正版を採用します。

追加効果音22項目は23音源です。投影機のみ、ループと停止を別ファイルにしました。WAV23点とOGG23点、試聴ページ、制作ソースを収録しています。音源は数式とノイズを用いた合成効果音です。全46ファイルのデコードと信号値を確認しています。聴感の採否は試聴ページで確認できます。

このZIPに画像そのものは含みません。image_selection.jsonに採用画像名と予定配置先、image_catalog.jsonに英語プロンプトと日本語説明を収録しています。ゲームへの組み込み、inboxの不足一覧更新、GitHubへの送信は行っていません。

残る追加演出用素材

人物肖像40人分、全身立ち絵・会話差分、発見再現の人物カット、台詞音声は未制作です。現行UIはこれらを使っておらず、外見や演出の仕様も未確定の項目です。

温室の床下待避庫と育苗トレー、体育館の巡回人形二体と車輪を示す調査用の寄り画像も未制作です。今回は不足背景33地点の全景と追加効果音22項目を対象にしました。

採用画像対応

01 講堂：exec-d8ca685c-0f37-4ba5-85e8-5adf093b359f.png → assets/scenes/lecture.png
02 プール更衣室：exec-6372f197-e785-4d75-aa44-be5f61b6ddbd.png → assets/scenes/changing.png
03 天井点検路：exec-afbdea39-609a-45c2-b5d5-f7b3e9f3d308.png → assets/scenes/ceiling.png
04 医務室：exec-efc61a25-548c-4052-b91a-ede8c763d4e6.png → assets/scenes/medical.png
05 安置庫：exec-f20989b7-d2e6-45da-bb97-ab359b54aa58.png → assets/scenes/morgue.png
06 防音相談室：exec-52453a55-f012-423c-aec0-397043fefb16.png → assets/scenes/consult.png
07 救護廊下：exec-79d52ab8-9902-413e-8d2a-9a723d1077f4.png → assets/scenes/rescue.png
08 小劇場：exec-5f5cc02a-133c-4dd8-8874-6d6f5016d171.png → assets/scenes/theater.png
09 衣装庫：exec-e2415789-25d1-4827-97ab-1744ab79ad1a.png → assets/scenes/wardrobe.png
10 遮光観察室：exec-0954dc43-bfc4-4ba7-8b54-9d06904a223c.png → assets/scenes/darkroom.png
11 旧写真室：exec-27134aaa-f6b6-4b88-a036-a228b6023d13.png → assets/scenes/photo.png
12 展示ホール：exec-ec3158fb-1066-43be-a5e6-b3e7eb1b29f1.png → assets/scenes/exhibition.png
13 配達箱前：exec-4531ab39-bc88-49f9-84f8-cd25734b155e.png → assets/scenes/post.png
14 規約審査室：exec-4b25487b-0cf3-45d8-804a-d5f72ca685bf.png → assets/scenes/review.png
15 装備点検室：exec-df97db97-b04b-4859-9aa9-63e9e88cc53a.png → assets/scenes/equipment.png
16 音楽室前：exec-55907aed-f05a-439c-a670-0986b410d729.png → assets/scenes/music.png
17 物品庫：exec-0b046a47-d676-4d6b-abb4-6dec19884843.png → assets/scenes/store.png
18 物品庫前の救護所：exec-ccd11cfd-ac86-4c1d-94d9-69cde71cf104.png → assets/scenes/aid.png
19 乾いた点検廊下：exec-52d4c10e-8fc6-4851-8271-7205f3b6a450.png → assets/scenes/service.png
20 桟橋：exec-72eb6d0e-eea0-446b-bf36-e427e9fe36ab.png → assets/scenes/dock.png
21 水没試験室：exec-5c576af1-1979-4969-afaf-21828ad37f35.png → assets/scenes/flood.png
22 天文展示室：exec-b8e9e2a9-d42a-4a7d-b5d4-40ba2d84866d.png → assets/scenes/observatory.png
23 時計塔：exec-7ecd53eb-7087-42a0-963e-9054de50ec0f.png → assets/scenes/clock.png
24 地下貨物リフト：exec-17c4ff31-e313-4334-ae8d-fd91984d8fce.png → assets/scenes/lift.png
25 屋上リフト口：exec-d7fe436a-2496-4dea-9824-93ddfbbbf331.png → assets/scenes/roof.png
26 外周点検通路：exec-9809ebdb-9b1c-4a3e-b28f-a3db13543fb7.png → assets/scenes/walkway.png
27 避難所：exec-17f9223a-afb3-4271-ad01-82de35015018.png → assets/scenes/shelter.png
28 中央管理室：exec-08852c7d-3d1b-4106-ae93-4b50711dfa86.png → assets/scenes/management.png
29 非常階段：exec-054f1fd3-ec04-487c-9d0e-29ec949968b1.png → assets/scenes/stairs.png
30 中央機構室：exec-5cb6bbd5-bd7b-4eea-b9be-2d6062a45419.png → assets/scenes/mechanism.png
31 非常通信室：exec-a5cb13ae-960d-492e-a3c1-2374d2431fdb.png → assets/scenes/comms.png
32 最終報告室：exec-c9fb88f2-b05b-48c7-949f-a1023b23ca5e.png → assets/scenes/terminal.png
33 南門：exec-9e292744-e1f3-404d-ad7d-f388cc90549a.png → assets/scenes/south.png

修正指示

equipment

```text
Edit this MBR manga background with one precise local change: the small rectangular room-name plaque above the right-hand door becomes a completely plain white plate within its existing thin black border. Preserve the exact composition, every weapon, protective gear, empty gauntlet recess, furniture, door hardware, white floor and the existing black-and-white manga linework. Match the original 16:9 framing and image dimensions.
```

装備点検室の扉上の札を白地に修正しました。

shelter

```text
Edit this MBR manga background with one exact local change. The small tally counter mounted at the left foreground entrance has four completely blank pale display drums within its existing dark rectangular window, ready for later game typesetting. Preserve the housing, handle, wheel and mounting screws. Preserve the entire shelter, both entrances, furniture, perspective, ink border and black-and-white manga drawing exactly.
```

避難所の計数器の表示窓だけを、後から数字を重ねられる四つの空欄へ修正します。筐体と室内の構図は維持します。

stairs

```text
Correct only the lock hardware in this MBR manga stairwell background. The single partly open door leaf has one ordinary keyed round knob on its visible front face and one matching reverse knob aligned along the same lock spindle through the leaf, naturally glimpsed in profile beside the thin latch edge. The fixed right door jamb is a plain uninterrupted strip of frame. Show a mechanically coherent ordinary door assembly. Preserve the door angle, blank notice panel, hinge positions, stairs, railings, window, composition, ink border and exact sparse black-and-white manga linework.
```

非常階段の扉金物だけを修正します。一枚の扉に表裏一組のノブを同じ軸で取り付け、固定枠は平らな枠として描きます。

terminal

```text
Edit this MBR manga background with one exact local change. The small digital module to the right of the monitor has a completely blank dark rectangular display surface prepared for later game typesetting. Preserve its bezel, switches, housing and adjacent paper output. Preserve all other elements exactly: desk, chair, doorway, terminal monitor, one printed white sheet, windows, shadows, white floor, ink border and the black-and-white manga style.
```

最終報告室の端末の小さな数字表示だけを、後から設定どおりの内容を重ねられる空欄へ修正します。
