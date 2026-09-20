from pathlib import Path
import json, math, subprocess, hashlib, html, shutil, zipfile
import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parents[1]
SR = 44100
RNG = np.random.default_rng(21092026)
for folder in ['audio_wav', 'audio_ogg']:
    (ROOT / folder).mkdir(parents=True, exist_ok=True)
CATALOG = []

def t(d):
    return np.arange(round(d * SR), dtype=np.float64) / SR

def filt(x, cutoff, mode='lowpass'):
    return signal.sosfilt(signal.butter(2, cutoff, mode, fs=SR, output='sos'), x)

def edge(x, attack=.003, release=.045):
    y = x.copy()
    a, r = min(len(y), round(attack * SR)), min(len(y), round(release * SR))
    if a: y[:a] *= np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    if r: y[-r:] *= np.cos(np.linspace(0, np.pi / 2, r)) ** 2
    return y

def noise(d, band=(300, 5000), attack=.015, release=.1):
    return edge(filt(RNG.normal(size=len(t(d))), band, 'bandpass'), attack, release)

def modal(d, modes, decay=.2, amp=1):
    x = t(d)
    y = sum(a * np.sin(2 * np.pi * f * x) * np.exp(-x / (decay / (1 + .13 * i)))
            for i, (f, a) in enumerate(modes))
    return edge(y * amp, .001, .05)

def wood(d=.4, pitch=110):
    x = t(d)
    return edge(modal(d, [(pitch, 1), (pitch * 2.37, .25), (pitch * 4.9, .11)], .055)
                + filt(RNG.normal(size=len(x)), 1300) * np.exp(-x / .016) * .6, .001, .04)

def steel(d=.7, pitch=630, decay=.18):
    return modal(d, [(pitch, 1), (pitch * 1.62, .47), (pitch * 2.71, .23),
                     (pitch * 4.23, .11)], decay)

def paper(d=.6):
    x = t(d)
    return noise(d, (850, 7500), .025, .11) * (.12 + .8 * np.sin(2 * np.pi * 11 * x) ** 6)

def scrape(d=1, pitch=180):
    x = t(d)
    return edge(noise(d, (150, 2300)) * (.25 + .65 * np.sin(2 * np.pi * 21 * x) ** 6)
                + .12 * np.sin(2 * np.pi * (pitch * x + 20 * x * x)), .09, .14)

def click(pitch=2200):
    return steel(.12, pitch, .014) * .2 + noise(.12, (1800, 9000), .0005, .06) * np.exp(-t(.12) / .008) * .5

def water(d, fade=True):
    x = t(d)
    y = noise(d, (170, 5400), .025, .15) * (.3 + .25 * np.sin(2 * np.pi * 3.7 * x) ** 2)
    for at in np.arange(.08, d - .22, .113):
        length = min(.2, d - at)
        u = t(length)
        f = RNG.uniform(180, 500) + RNG.uniform(150, 600) * np.exp(-u / .035)
        g = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-u / .05) * .08
        start = round(at * SR)
        y[start:start + len(g)] += g
    if fade: y *= np.linspace(1, .03, len(y)) ** .9
    return y

def motor(d, f0=95, f1=95, level=.1):
    x = t(d)
    phase = 2 * np.pi * (f0 * x + (f1 - f0) * x * x / (2 * d))
    return edge(level * (np.sin(phase) + .3 * np.sin(2 * phase) + .17 * np.sin(5 * phase))
                + noise(d, (450, 3600)) * .025, .12, .15)

def buf(d): return np.zeros((round(d * SR), 2))

def put(y, sound, at, pan=0, gain=1):
    n = round(at * SR)
    sound = sound[:max(0, len(y) - n)] * gain
    a = (pan + 1) * np.pi / 4
    y[n:n + len(sound)] += np.column_stack((sound * np.cos(a), sound * np.sin(a)))

def save(number, key, title, d, events, cases, description, loop=False, samples=None, peak=-10):
    y = buf(d) if samples is None else samples.copy()
    for at, sound, pan, gain in events: put(y, sound, at, pan, gain)
    y -= y.mean(axis=0)
    if not loop:
        for c in range(2): y[:, c] = edge(y[:, c], .002, .07)
    y *= 10 ** (peak / 20) / max(np.max(np.abs(y)), 1e-9)
    pcm = np.round(y * 32767).astype(np.int16)
    wav = ROOT / 'audio_wav' / (key + '.wav')
    ogg = ROOT / 'audio_ogg' / (key + '.ogg')
    wavfile.write(wav, SR, pcm)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(wav), '-c:a', 'libvorbis', '-q:a', '5', str(ogg)], check=True)
    item = dict(number=number, key=key, title=title, category='合成効果音', source='deterministic procedural audio synthesis',
                duration_seconds=len(y)/SR, sample_rate=SR, channels=2, bits=16, loop=loop,
                cases=cases, description=description, wav=str(wav.relative_to(ROOT)), ogg=str(ogg.relative_to(ROOT)),
                intended_path='assets/audio/sfx/' + key + '.ogg', peak_dbfs=float(20*np.log10(np.max(np.abs(y))+1e-12)),
                rms_dbfs=float(20*np.log10(np.sqrt(np.mean(y*y))+1e-12)),
                boundary_delta=float(np.max(np.abs(y[0]-y[-1]))))
    if loop: item.update(loop_start_sample=0, loop_end_sample=len(y))
    CATALOG.append(item)
    print(key, round(item['duration_seconds'], 2), flush=True)

save(1, 'broadcast-switch', '放送卓スイッチ', .55,
     [(.06, click(1250), 0, 1)], ['case-33'], '放送卓の小さな切替スイッチ一回。')
save(2, 'chair-fall-tableware', '椅子と金属食器の転倒', 3.0,
     [(.08, scrape(.32), -.3, .4), (.36, wood(.45, 95), -.25, 1),
      (.47, steel(.7, 760), .2, .45), (.76, steel(.5, 930), .33, .3),
      (1.03, steel(.4, 1120), .4, .2), (1.23, steel(.35, 980), .45, .12)], ['case-03'], '椅子の転倒に続き、金属食器が小さく跳ねて転がる。')
save(3, 'heavy-book-return', '重い辞典の返却口への落下', 1.6,
     [(.06, paper(.23), -.1, .16), (.23, wood(.5, 67), 0, 1), (.24, steel(.45, 610), .1, .22)],
     ['case-23'], '厚い辞典の重い衝突と、金属角の小さな接触。')
save(4, 'book-drop', '本が床へ落ちる音', 1.25,
     [(.05, paper(.22), -.1, .3), (.22, wood(.3, 155), 0, .7), (.25, paper(.3), .1, .15)],
     ['case-26'], '通常の本が床へ落ち、紙が短く擦れる。')
save(5, 'cloth-cane', '衣装の擦れと杖の一打', 1.9,
     [(.05, noise(.75, (300, 3500), .12, .2), -.2, .3), (.95, wood(.25, 230), .15, .65)],
     ['case-34'], '布が擦れた後、杖先が一度だけ床を打つ。')
save(6, 'catwalk-metal', '高所足場の金具', 1.25,
     [(.06, steel(.7, 520, .23), -.1, .65)], ['case-15'], '足場金具の軽い鳴り。', peak=-14)
save(7, 'delivery-envelope', '配達箱の開扉と封筒', 1.9,
     [(.07, click(950), -.2, .7), (.23, steel(.38, 310), -.1, .17),
      (.56, paper(.55), .1, .6), (.93, wood(.2, 270), .1, .07)],
     ['case-04'], '小さな配達箱の扉が開き、一枚の封筒が落ちる。')
save(8, 'mirror-camera', '鏡板の軋みとカメラの滑り', 3.1,
     [(.05, scrape(.8, 410), -.25, .3), (.95, wood(.25, 145), .05, .28),
      (1.1, scrape(1.1, 210), .2, .45)], ['case-10'], '鏡板の回転部が軋み、カメラが床を滑る。')
save(9, 'cart-stop-scissors', '台車停止と鋏を置く音', 2.3,
     [(.05, scrape(.85, 125), -.2, .24), (.91, wood(.22, 145), 0, .36),
      (1.23, steel(.6, 1270), .22, .4)], ['case-25'], '台車の車輪が止まり、鋏が器具面に置かれる。')

# An exactly periodic motor and shutter cycle supports continuous diegetic playback.
x = t(8)
projector = .19*np.sin(2*np.pi*96*x)+.052*np.sin(2*np.pi*192*x)+.022*np.sin(2*np.pi*480*x)
projector += .025*(np.sin(2*np.pi*720*x)+.5*np.sin(2*np.pi*1080*x))*(.35+.65*np.sin(2*np.pi*12*x)**10)
loop_stereo = np.column_stack((projector, projector*.93 + .013*np.sin(2*np.pi*144*x)))
save(10, 'projector-loop', '投影機の定常回転', 8, [], ['case-16','case-36'],
     '8秒ループの投影機モーターと送り機構。停止はprojector-stopへ切り替える。', loop=True, samples=loop_stereo, peak=-21)
save(10, 'projector-stop', '投影機の回転停止', 2.7,
     [(0, motor(2.1, 96, 18, .17), 0, 1), (1.95, click(580), .1, .15)],
     ['case-16','case-36'], '回転速度が落ちて停止する投影機。ループ版と対で使用。', peak=-17)
save(11, 'clothes-rack-fall', '衣装掛けの転倒', 2.6,
     [(.04, noise(.32, (400, 2500)), -.2, .16), (.39, steel(.9, 340, .26), 0, .6),
      (.51, steel(.5, 680), .18, .26), (.83, steel(.35, 460), -.12, .17)],
     ['case-20'], '軽い金属製衣装掛けが倒れ、横棒が小さく鳴る。')
save(12, 'crate-collapse', '箱の崩落', 3.5,
     [(.08, scrape(.35, 100), -.35, .2), (.35, wood(.4, 88), -.25, .75),
      (.58, wood(.45, 116), .25, .62), (.87, wood(.35, 72), -.08, .68),
      (1.15, paper(.55), .18, .27), (1.39, steel(.75, 1670, .22), .3, .13)],
     ['case-39'], '複数の箱が崩れ、終わりに細い金属音が残る。')

def piano(midi, d=2):
    x=t(d); f=440*2**((midi-69)/12)
    y=sum(a*np.sin(2*np.pi*f*k*(1+.00002*k*k)*x)*np.exp(-x/(1.1/k**.45))
          for k,a in enumerate([1,.25,.1,.05,.025],1))
    return edge(y,.004,.12)
notes=[(62,0),(65,.5),(69,1),(67,1.5),(65,2),(62,2.5),(60,3),(64,3.5),
       (67,4),(69,4.5),(65,5),(62,5.5),(60,6),(57,6.5),(62,7)]
events=[(.2+at,piano(m),(-1)**i*.12,.28) for i,(m,at) in enumerate(notes)]
events += [(0, paper(.6), -.15,.07),(.12,motor(7.7,54,54,.018),0,1),
            (7.85,click(800),.1,.12)]
save(13, 'player-piano', '無人の自動演奏ピアノ', 10.2, events, ['case-35'],
     '紙帯式自動演奏の短いオリジナル旋律と送り機構。劇中音源として再生。', peak=-15)
save(14, 'sign-flip', '案内板の切替', 1.35,
     [(.05, click(820), -.15, .3),(.22,scrape(.27, 245),0,.25),(.52,wood(.25,170),.1,.45)],
     ['case-27'], '表示板が回転して止まる一回の切替。')
save(15, 'keys-jingle', '鍵束', 1.55,
     [(at,steel(.38,pitch,.11),pan,amp) for at,pitch,pan,amp in
      [(.04,1670,-.2,.4),(.16,2200,.2,.31),(.27,1880,-.1,.3),(.42,2580,.15,.19),(.6,2050,0,.14)]],
     ['case-05','case-28'], '複数の小さな鍵が触れ合う一度の揺れ。', peak=-13)
save(16, 'drain-finish', '排水の終わり', 4.8,
     [(.05,water(4.2),0,1)], ['case-09'], '水量が減り、気泡を含む排水音が静まって停止する。', peak=-13)
save(17, 'medical-tools', '医療器具の接触', 1.25,
     [(.06,steel(.5,1820,.14),-.12,.35),(.28,steel(.45,2390,.12),.16,.23)],
     ['case-13'], '小さな医療器具同士の短い接触。', peak=-15)
x=t(.68)
buzzer=edge((np.sin(2*np.pi*780*x)+.25*np.sin(2*np.pi*2340*x))*(.6+.4*np.sin(2*np.pi*18*x)**2),.012,.009)
save(18, 'warning-buzzer-stop', '警告ブザーの停止', 1.1,
     [(.05,buzzer,0,.6)], ['case-08'], '短い警告ブザーが明確に途切れて停止する。', peak=-17)
save(19, 'transmitter-start', '送信機の起動', 2.6,
     [(.05,click(1050),-.12,.5),(.2,motor(1.6,140,240,.1),0,1),
      (.35,noise(.32,(900,4700)),.1,.1),(1.85,click(730),.3,.25)],
     ['case-32'], '送信機のリレーと起動、続く窓留め具の小さな音。', peak=-14)
save(20, 'door-knock', '扉を叩く音', 1.8,
     [(.06,wood(.27,150),0,.5),(.43,wood(.3,142),0,.57),(.83,wood(.3,146),0,.45)],
     ['case-31'], '木製扉への三回のノック。', peak=-12)
save(21, 'terminal-scheduled', '予約端末の作動', 2.4,
     [(.05,click(1180),-.05,.45),(.22,motor(1.4,210,205,.07),0,1),
      (1.65,click(980),.12,.25)], ['case-07'], '予約時刻に端末が自動起動するリレーと駆動部の音。', peak=-15)
save(22, 'report-print', '報告書の印字', 3.6,
     [(.04,click(820),-.1,.3),(.22,motor(2.1,165,160,.08),0,1),
      *[(.32+i*.22,click(1850),(-1)**i*.15,.15) for i in range(8)],
      (2.36,paper(.73),.2,.35)], ['case-24'], '短い機械式の印字に続く一枚の紙送り。', peak=-13)

assert len(CATALOG)==23 and len({x['number'] for x in CATALOG})==22
validation=[]
for item in CATALOG:
    assert item['peak_dbfs']<=-9.99
    for ext in ['wav','ogg']:
        file=ROOT/item[ext]
        subprocess.run(['ffmpeg','-v','error','-i',str(file),'-f','null','-'],check=True,capture_output=True)
    if item['loop']: assert item['boundary_delta']<.02, item
    validation.append(dict(key=item['key'],wav_decode=True,ogg_decode=True,
                           peak_dbfs=round(item['peak_dbfs'],3),rms_dbfs=round(item['rms_dbfs'],3),
                           loop_boundary_delta=item['boundary_delta']))
(ROOT/'audio_catalog.json').write_text(json.dumps(CATALOG,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'audio_validation.json').write_text(json.dumps(validation,ensure_ascii=False,indent=2),encoding='utf-8')
cards=''.join('<article><h2>'+html.escape(i['title'])+'</h2><p>'+html.escape(i['key'])+' · '+str(round(i['duration_seconds'],2))+'秒</p><p>'+html.escape(i['description'])+'</p><audio controls preload="none" '+('loop' if i['loop'] else '')+'><source src="'+i['ogg']+'" type="audio/ogg"><source src="'+i['wav']+'" type="audio/wav"></audio></article>' for i in CATALOG)
page='<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MBR 追加効果音</title><style>body{max-width:900px;margin:40px auto;padding:0 24px;background:#efede8;color:#171717;font:16px/1.7 system-ui}h1{font-size:26px}h2{font-size:18px;font-weight:500}article{border-top:1px solid #999;padding:18px 0}p{margin:.4em 0}audio{width:min(100%,520px)}</style><h1>MBR 追加効果音</h1><p>22項目・23音源。投影機はループ音と停止音を分けています。再生ボタンから試聴できます。</p>'+cards+'</html>'
(ROOT/'audio_preview.html').write_text(page,encoding='utf-8')
readme='MBR 追加素材 01\n\n不足一覧の追加効果音22項目を、合成効果音23音源として作成しました。投影機はループ用と停止用の2音源です。各音源は44.1kHz、16bit、ステレオのWAV原本とOGG版を収録しています。\n\n解凍後、audio_preview.htmlを開くと試聴できます。audio_catalog.jsonに使用場面・秒数・予定配置先を収録しています。production/create_additional_audio.pyで再生成できます。必要環境はPython、NumPy、SciPy、FFmpegです。\n\n全46ファイルのデコード、ピーク値、投影機ループの境界を検査しました。検査結果はaudio_validation.jsonです。聴感の採否は試聴で確認してください。\n\n背景画像は会話に個別表示されます。このパッケージには背景33枚の英語プロンプトと日本語説明、予定ファイル名を収録しています。生成画像そのものはこのZIPには含みません。\n\nGitHubへのアップロードとゲームへの組み込みは行っていません。\n'
(ROOT/'README.txt').write_text(readme,encoding='utf-8')
checks=[]
for p in sorted(ROOT.rglob('*')):
    if p.is_file() and p.name!='SHA256SUMS.txt':
        checks.append(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+str(p.relative_to(ROOT)))
(ROOT/'SHA256SUMS.txt').write_text('\n'.join(checks)+'\n',encoding='utf-8')
archive=ROOT.parent/(ROOT.name+'.zip')
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(ROOT.rglob('*')):
        if p.is_file():z.write(p,str(p.relative_to(ROOT.parent)))
print(json.dumps(dict(audio_items=22,audio_files=23,decoded_files=46,zip=str(archive),bytes=archive.stat().st_size)),flush=True)
