# 不足素材一覧

更新日：2026-09-21。現在の実装・配置済み素材に基づく制作リストです。

画像は29地点の漫画線画を配置済みです。残る12地点は今回未確認・未配置で、ゲームは既存SVGを表示します。今回は装備点検室・物品庫・物品庫前の救護所・乾いた点検廊下・桟橋・水没試験室の6枚を配置しました。うち5枚は受領データの破損を正常画像との照合で確認し、正常画像から復旧しています。装備点検室の保留は解消しました。assets/asset-manifest.jsonのpending_imagesに残る受領状態は前回確認時点の記録で、順次照合が必要です。

音はBGM4曲・環境音2種・効果音41種（全47音源）を配置済みです。以前の不足リストにあった追加効果音22項目・23音源は受領・配置・再現場面への接続が完了しました。

共通画風：シンプルな漫画の白黒線画。細い輪郭線、限定した黒ベタとスクリーントーン、広い白い余白。デスゲームの現場報告書に添えた客観的な記録画。横長16:9、基準1280×720以上。人型・文字・識別札は必要に応じてゲーム側で重ね、推理上必要な関係は本文に合わせます。

## 背景12枚（制作済み・今回未確認・未配置）

### 22 天文展示室（observatory）

予定配置先：assets/scenes/observatory.png

区画：観測棟。情景：窓形の枠に夜の桟橋が浮かぶ。天井には天文展示の機材が吊られている。

投影された夜の桟橋と窓形の枠、投影機、伝声管を区別します。実際の窓と誤読させません。

### 23 時計塔（clock）

予定配置先：assets/scenes/clock.png

区画：観測棟。情景：点検口と塔の入口。破れた用紙が二つの現場をつなぐ。

塔の入口、点検口、点検簿の紙片と鍵の位置を読み取りやすくします。

### 24 地下貨物リフト（lift）

予定配置先：assets/scenes/lift.png

区画：体育棟。情景：かごの内側には屋上の光も地下の闇も残る。

貨物かごの内側と、屋上側と一致する傷を示します。

### 25 屋上リフト口（roof）

予定配置先：assets/scenes/roof.png

区画：体育棟。情景：地下と同じ擦り傷を持つ扉。かごは場所を変えていた。

地下リフトと同じ扉の傷、呼出し装置、外周通路の入口を示します。

### 26 外周点検通路（walkway）

予定配置先：assets/scenes/walkway.png

区画：体育棟。情景：手すりの向こうに落下の痕跡。傍らの投槍には別人の貸出票がある。

正常な高所足場、手すり、落下の痕跡、投槍と貸出票を示します。

### 27 避難所（shelter）

予定配置先：assets/scenes/shelter.png

区画：体育棟。情景：入口に計数器がある。反対の壁には、もう一つ扉がある。

入口の計数器と反対側の別の扉を一画面で区別します。

### 28 中央管理室（management）

予定配置先：assets/scenes/management.png

区画：管理棟。情景：二人が同時にいた痕跡と、一人が残された痕跡が重なっている。

管理卓、資料、内扉を描きます。人物の残像は別レイヤーにします。

### 29 非常階段（stairs）

予定配置先：assets/scenes/stairs.png

区画：管理棟。情景：戻れないと書かれた扉。鍵穴は両側にある。

階段、両側に鍵穴を持つ扉を読み取れる構図にします。掲示の文言は別表示にします。

### 30 中央機構室（mechanism）

予定配置先：assets/scenes/mechanism.png

区画：管理棟。情景：壁そのものが動く試験区画。停止位置の目盛りが刻まれている。

可動隔壁、停止目盛り、操作部と閉鎖途中の痕跡を示します。

### 31 非常通信室（comms）

予定配置先：assets/scenes/comms.png

区画：管理棟。情景：校外へ続く一本の回線。送信の完了印は、後の銃声でも消えない。

校外への回線、送信装置、完了表示、下書きを区別します。

### 32 最終報告室（terminal）

予定配置先：assets/scenes/terminal.png

区画：管理棟。情景：扉の前に一つ、室内に二つの輪郭。誰もいない端末に提出の痕跡がある。

戸口と室内、予約提出端末と印字部を一画面に収めます。人型三つはゲーム側で重ねます。

### 33 南門（south）

予定配置先：assets/scenes/south.png

区画：外周。情景：北門という表示。その後ろには南側だけに建つ貯水塔がある。

貯水塔が門の背後に見える構図にします。北門という偽装表示は別レイヤーで正確に表します。

## 追加効果音（受領・配置完了）

追加22項目・23音源は不足一覧から除外しました。対応と配置先は[ASSET_PLACEMENT.md](ASSET_PLACEMENT.md)、全47点の試聴は[preview.html](../assets/audio/preview.html)を参照してください。

## 既存背景の追加カット候補

温室：本文e23dの固定された床下待避庫と、その上から動いた育苗トレーを示す調査用の寄り。今回の背景は全景として使用します。

体育館：本文e15dのレール上の巡回人形二体と車輪を示す調査用の寄り。人の足跡と人形の軌跡を混同させません。

## 人物・音声素材（追加演出用、現行UIでは未使用）

40人の名簿用肖像は未制作です。現在の名簿は氏名と活動を文字で表示しています。採用する場合は、同じ漫画線画で表情・顔立ち・髪形・識別小物を定めてから制作します。未確定の死因や犯人を示す情報は肖像へ追加しません。

01　p01　朝倉 律　学級委員長　予定：assets/portraits/p01.png
02　p02　一ノ瀬 澪　演劇部の声役　予定：assets/portraits/p02.png
03　p03　宇佐美 翔　写真部　予定：assets/portraits/p03.png
04　p04　榎本 凪　建築模型が得意　予定：assets/portraits/p04.png
05　p05　大庭 蓮　水泳部　予定：assets/portraits/p05.png
06　p06　柏木 紬　服飾係　予定：assets/portraits/p06.png
07　p07　神崎 透　保健委員　予定：assets/portraits/p07.png
08　p08　久世 遥　地理委員　予定：assets/portraits/p08.png
09　p09　黒瀬 岳　ボクシング部　予定：assets/portraits/p09.png
10　p10　小鳥遊 杏　合唱部の進行係　予定：assets/portraits/p10.png
11　p11　篠原 慧　将棋部　予定：assets/portraits/p11.png
12　p12　白石 環　救護班長　予定：assets/portraits/p12.png
13　p13　瀬戸 湊　ボート部　予定：assets/portraits/p13.png
14　p14　高槻 千景　新聞部　予定：assets/portraits/p14.png
15　p15　橘 悠真　陸上部　予定：assets/portraits/p15.png
16　p16　月島 栞　図書委員　予定：assets/portraits/p16.png
17　p17　寺崎 誠　工作班　予定：assets/portraits/p17.png
18　p18　戸塚 泉　調理係　予定：assets/portraits/p18.png
19　p19　中原 朔　天文同好会　予定：assets/portraits/p19.png
20　p20　七瀬 灯　ボランティア委員　予定：assets/portraits/p20.png
21　p21　西園寺 梓　会計係　予定：assets/portraits/p21.png
22　p22　野々村 航　放送委員　予定：assets/portraits/p22.png
23　p23　橋本 蛍　園芸係　予定：assets/portraits/p23.png
24　p24　花房 椿　理科部　予定：assets/portraits/p24.png
25　p25　日向 颯　陸上部の跳躍選手　予定：assets/portraits/p25.png
26　p26　深見 静　相談係　予定：assets/portraits/p26.png
27　p27　藤堂 怜　討論部　予定：assets/portraits/p27.png
28　p28　星野 真琴　舞台美術係　予定：assets/portraits/p28.png
29　p29　真壁 隼　格闘技経験者　予定：assets/portraits/p29.png
30　p30　水瀬 雫　水中競技の選手　予定：assets/portraits/p30.png
31　p31　宮原 奏　ピアノ担当　予定：assets/portraits/p31.png
32　p32　村瀬 理央　映像係　予定：assets/portraits/p32.png
33　p33　望月 彗　天文同好会　予定：assets/portraits/p33.png
34　p34　八代 千尋　郵便係　予定：assets/portraits/p34.png
35　p35　矢野 圭　集計係　予定：assets/portraits/p35.png
36　p36　結城 小夜　美術部　予定：assets/portraits/p36.png
37　p37　吉岡 直　救護班　予定：assets/portraits/p37.png
38　p38　若槻 薫　広報係　予定：assets/portraits/p38.png
39　p39　綿貫 要　副委員長　予定：assets/portraits/p39.png
40　p40　桐生 綾　記録係　予定：assets/portraits/p40.png

全身立ち絵・会話差分・発見再現の人物カットは演出仕様が未確定のため枚数未定です。肖像40枚とは別の拡張候補です。

点呼と発見再現の台詞の音声収録も未制作です。117件の証言レコード数と収録台詞数は同一ではないため、収録する場合はsrc/data/case-text.jsから話者付きの台詞一覧を作成します。全員死亡後の客観場面に新しい証人の声を足しません。

地図・白い人型・通常UIはコード描画済みで、不足画像には数えません。

配置履歴：[ASSET_PLACEMENT.md](ASSET_PLACEMENT.md)。配置先の対応はassets/asset-manifest.jsonを参照してください。
