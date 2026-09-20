from pathlib import Path
import json, math, shutil, subprocess, zipfile
import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = Path('/workspace/scratch/c02d7c3d5e73/output/MBR_materials_20260920')
for p in ['audio_wav', 'audio_ogg', 'production']:
    (ROOT/p).mkdir(parents=True, exist_ok=True)
SR = 44100
RNG = np.random.default_rng(9202026)
catalog = []

def time(d): return np.arange(round(d*SR), dtype=np.float64)/SR
def freq(midi): return 440*2**((midi-69)/12)
def smooth(x, hz, kind='lowpass'):
    return signal.sosfilt(signal.butter(2,hz,kind,fs=SR,output='sos'),x)
def ramp(x, attack=.006, release=.03):
    x = x.copy()
    a=min(len(x),round(attack*SR)); r=min(len(x),round(release*SR))
    if a: x[:a] *= np.sin(np.linspace(0,np.pi/2,a))**2
    if r: x[-r:] *= np.cos(np.linspace(0,np.pi/2,r))**2
    return x
def piano(midi,d=4,vel=.5):
    t=time(d); f=freq(midi)
    y=np.zeros(len(t))
    for k,a in enumerate([1,.32,.17,.085,.036,.02],1):
        ph=2*np.pi*f*k*(1+0.000045*k*k)*t
        y+=a*np.sin(ph)*np.exp(-t/(2.7/(k**.65)))
    y+=.013*smooth(RNG.standard_normal(len(t)),2800)*np.exp(-t/.024)
    return vel*ramp(y,.012,.15)
def bell(midi,d=4,vel=.25):
    t=time(d); f=freq(midi); y=np.zeros(len(t))
    for rat,amp,dec in [(1,1,2.4),(2.01,.30,1.8),(2.76,.12,1.1),(4.06,.08,.7)]:
        y+=amp*np.sin(2*np.pi*f*rat*t)*np.exp(-t/dec)
    return vel*ramp(y,.005,.2)
def bowed(midi,d=9,vel=.1):
    t=time(d); f=freq(midi); y=np.zeros(len(t))
    for k in range(1,7):
        y+=np.sin(2*np.pi*f*k*t+.006*k*np.sin(2*np.pi*4.7*t))/(k**1.85)
    return vel*ramp(y,1.7,2.7)
def pan(x,p=0):
    a=(p+1)*np.pi/4
    return np.column_stack((x*np.cos(a),x*np.sin(a)))
def add(buf,x,at,p=0,wrap=False):
    if x.ndim==1:x=pan(x,p)
    start=round(at*SR)
    if wrap:
        idx=(start+np.arange(len(x)))%len(buf)
        np.add.at(buf,idx,x)
    else:
        n=min(len(x),len(buf)-start)
        if n>0:buf[start:start+n]+=x[:n]
def space(buf,loop=False,wet=.28):
    out=buf.copy()
    for sec,amp in [(.071,.30),(.113,.23),(.179,.18),(.263,.13),(.397,.095),(.557,.065),(.809,.038),(1.193,.02)]:
        lag=round(sec*SR)
        echo=buf[:,::-1] if lag%2 else buf
        if loop:out+=wet*amp*np.roll(echo,lag,axis=0)
        else:out[lag:]+=wet*amp*echo[:-lag]
    return out
def master(y,loop,peak_db,rms_db=None):
    y=y.astype(np.float64)
    if y.ndim==1:y=pan(y)
    y-=np.mean(y,axis=0)
    if not loop:
        for c in range(2):y[:,c]=ramp(y[:,c],.004,.09)
    peak=np.max(np.abs(y)); rms=np.sqrt(np.mean(y*y))
    gain=10**(peak_db/20)/max(peak,1e-9)
    if rms_db is not None:gain=min(gain,10**(rms_db/20)/max(rms,1e-9))
    y*=gain
    return y
def save(i,title,kind,buf,loop=False,notes='',peak_db=-5,rms_db=None):
    y=master(buf,loop,peak_db,rms_db)
    name=f'{i:03d}'; wav=ROOT/'audio_wav'/f'{name}.wav'; ogg=ROOT/'audio_ogg'/f'{name}.ogg'
    wavfile.write(wav,SR,np.round(y*32767).astype(np.int16))
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-c:a','libvorbis','-q:a','5',str(ogg)],check=True)
    item={'number':name,'title':title,'kind':kind,'duration_seconds':len(y)/SR,'loop':loop,'sample_rate':SR,'channels':2,'loop_start_sample':0 if loop else None,'loop_end_sample':len(y) if loop else None,'peak_dbfs':float(20*np.log10(np.max(np.abs(y))+1e-12)),'rms_dbfs':float(20*np.log10(np.sqrt(np.mean(y*y))+1e-12)),'boundary_delta':float(np.max(np.abs(y[0]-y[-1]))),'notes':notes,'wav':f'audio_wav/{name}.wav','ogg':f'audio_ogg/{name}.ogg'}
    catalog.append(item)
    print(json.dumps({'number':name,'title':title,'seconds':item['duration_seconds'],'peak':round(item['peak_dbfs'],2)},ensure_ascii=False),flush=True)
    return y

# Original instrumental scores. Notes and resonances crossing a loop seam wrap naturally.
def score(i,title,d,bpm,chords,motifs,ending=False):
    y=np.zeros((round(d*SR),2)); beat=60/bpm; bar=beat*4; wrap=not ending
    for b in range(round(d/bar)):
        ch=chords[b%len(chords)]; at=b*bar
        for j,m in enumerate(ch):add(y,bowed(m,bar*1.9,.048 if i!=3 else .043),at,p=(j-1)*.48,wrap=wrap)
        add(y,piano(ch[0]-12,bar*1.5,.16),at+.05,-.15,wrap)
        mot=motifs[b%len(motifs)]
        for j,m in enumerate(mot):
            if m is not None:add(y,piano(m,4.9,.20 if j%2 else .26),at+(j*.75+.35)*beat,(-1)**j*.22,wrap)
        if b%4==0:add(y,bell(ch[-1]+12,7,.08),at+2.5*beat,.45,wrap)
        if i==3:
            for j in range(8):add(y,piano(ch[(j+b)%len(ch)],1.7,.078),at+j*.5*beat,(-1)**j*.3,wrap)
    y=space(y,loop=wrap,wet=.6)
    if ending:
        y[-SR*6:]*=np.linspace(1,0,SR*6)[:,None]**1.3
    return save(i,title,'BGM',y,wrap,'オリジナルの音集合成。声なし。'+('全長ループ。' if wrap else '結末用、末尾は余韻を残してフェード。'),peak_db=-5,rms_db=-23)

score(1,'残された校庭',64,60,[[50,57,64],[46,53,60],[48,55,62],[45,52,59]],[[74,None,69,65],[72,69,None,64],[74,76,None,69],[73,None,69,64]])
score(2,'焼き付いた事実',64,60,[[50,57,60],[48,55,58],[46,53,57],[45,52,58]],[[77,None,None,76],[74,None,69,None],[72,None,None,69],[70,None,73,None]])
score(3,'証言の継ぎ目',48,80,[[50,57,65],[48,55,64],[46,53,62],[45,52,61]],[[74,69,77,None],[72,67,76,None],[70,65,74,None],[69,73,None,76]])
score(4,'最終出席簿',24,80,[[50,57,65],[46,53,62],[48,55,64],[50,57,66]],[[74,None,77,None],[74,70,69,None],[72,None,76,None],[74,None,None,None]],ending=True)

# Periodic noise beds generated directly in the frequency domain.
def noise_loop(d,low,high):
    n=round(d*SR); f=np.fft.rfftfreq(n,1/SR)
    z=RNG.standard_normal(len(f))+1j*RNG.standard_normal(len(f))
    weight=(f/(f+low))**3/(1+(f/high)**4)/np.sqrt(np.maximum(f,15))
    weight[0]=0
    y=np.fft.irfft(z*weight,n)
    return y/(np.std(y)+1e-9)
t=time(24); wind=noise_loop(24,90,1700)
wind*=.72+.16*np.sin(2*np.pi*2*t/24)+.08*np.sin(2*np.pi*5*t/24)
sea=noise_loop(24,220,2300)*(.5+.28*np.cos(2*np.pi*3*t/24))
y=pan(wind*.6,-.15)+pan(np.roll(wind,round(.037*SR))*.38,.6)+pan(sea*.32,-.5)
save(5,'島の風と遠い波','環境音',y,True,'正門・中央広場・桟橋向け。24秒ループ。',peak_db=-13,rms_db=-29)
y=pan(noise_loop(24,130,900)*.17)+pan(np.sin(2*np.pi*100*t)*.015,-.4)+pan(np.sin(2*np.pi*150*t)*.01,.4)
save(6,'無人の校舎','環境音',y,True,'室内の静かな空調・建物の低い響き。24秒ループ。',peak_db=-18,rms_db=-34)

def sfx(i,title,d,events,notes='',peak=-8,wet=.2):
    y=np.zeros((round(d*SR),2))
    for at,x,p in events:add(y,x,at,p)
    return save(i,title,'効果音',space(y,wet=wet),False,notes,peak_db=peak)
def tone(f,d,amp=1):
    t=time(d);return ramp(np.sin(2*np.pi*f*t)*np.exp(-t/max(.015,d*.28))*amp,.004,.025)
def rustle(d,amp=1,center=1700):
    t=time(d);n=smooth(RNG.standard_normal(len(t)),[500,center+2500],'bandpass')
    return ramp(n*(.5+.5*np.sin(2*np.pi*9*t)**2)*amp,.035,.08)
def thud(d=.35,f=95):
    t=time(d);return ramp(np.sin(2*np.pi*(f*t-26*t*t))*np.exp(-t/.07)+.45*smooth(RNG.standard_normal(len(t)),750)*np.exp(-t/.023),.002,.03)
def metal(d=.8):
    t=time(d); y=np.zeros(len(t))
    for f,a in [(487,1),(911,.5),(1427,.3),(2381,.14)]:y+=a*np.sin(2*np.pi*f*t)*np.exp(-t/.18)
    return ramp(y,.001,.04)
def drip(d=.7):
    t=time(d);f=1600-1000*np.exp(-t/.035)
    return ramp(np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/.09),.002,.05)
def scrape(d=1):
    t=time(d); n=smooth(RNG.standard_normal(len(t)),[220,2800],'bandpass')
    return ramp(n*(.2+.8*np.sin(2*np.pi*17*t)**8)+.13*np.sin(2*np.pi*(260*t+65*t*t)),.11,.2)
def sweep(d=1.4,reverse=False):
    t=time(d); env=np.sin(np.pi*np.minimum(t/d,1))**1.6
    y=smooth(RNG.standard_normal(len(t)),[200,3500],'bandpass')*env*.15
    y+=np.sin(2*np.pi*(160*t+210*t*t/d))*env*.15
    return y[::-1] if reverse else y

sfx(7,'カーソル',.23,[(0,tone(880,.09),0)],'選択移動。',peak=-16,wet=0)
sfx(8,'決定',.5,[(0,tone(660,.16),-.1),(.07,tone(990,.2),.1)],'メニューの決定。',peak=-13,wet=.1)
sfx(9,'戻る',.42,[(0,tone(660,.17),.1),(.07,tone(440,.19),-.1)],'キャンセル・閉じる。',peak=-14,wet=.1)
sfx(10,'手帳を開く',.85,[(0,rustle(.43),-.2),(.37,thud(.2,170)*.2,.1)],'紙の擦れと表紙。',peak=-10)
sfx(11,'証拠を記録',1.7,[(0,rustle(.25)*.18,-.2),(.18,bell(81,1.3,.5),-.15),(.34,bell(86,1.25,.34),.2)],'客観的な証拠の記録用。',peak=-9)
sfx(12,'証言を記録',1.65,[(0,rustle(.25)*.2,.1),(.16,piano(69,1.3,.5),-.1),(.34,piano(74,1.2,.38),.1)],'証言を記録する共通音。真偽で使い分けない。',peak=-10)
sfx(13,'発見再現に入る',2.8,[(0,sweep(1.5,True),0),(.9,bell(62,1.8,.3),.2)],'人型から再現を開始する演出。',peak=-9,wet=.5)
sfx(14,'発見再現から戻る',2.3,[(0,sweep(1.4),0),(.15,piano(50,2,.18),-.2)],'再現終了。',peak=-11,wet=.45)
sfx(15,'三件のリポート確定',3.5,[(0,thud(.3,120)*.25,0),(.1,bell(62,2.7,.5),-.25),(.46,bell(69,2.4,.42),0),(.82,bell(74,2.2,.36),.25)],'三件確定、および最終一件の確定。',peak=-8,wet=.5)
sfx(16,'全件確定',6,[(0,piano(50,5,.28),0),(.12,bell(74,5,.4),-.25),(.55,bell(77,4.8,.35),0),(.98,bell(81,4.7,.3),.25),(1.45,piano(86,4.4,.16),0)],'全40件を確定した際の余韻。',peak=-8,wet=.6)
sfx(17,'校内の足音',1.75,[(0,thud(.27,120),-.18),(.43,thud(.3,106),.18),(.86,thud(.27,117),-.18),(1.28,thud(.3,110),.18)],'硬い校内床を四歩。',peak=-10,wet=.34)
sfx(18,'扉とラッチ',1.8,[(0,metal(.32)*.2,-.1),(.2,scrape(.65)*.3,0),(.88,thud(.45,84),.1)],'普通の扉を開閉する場面用。',peak=-9)
sfx(19,'寝台を引く',2,[(0,metal(.34)*.18,-.2),(.12,scrape(1.2),0),(1.35,thud(.32,100)*.4,.2)],'保健室の寝台、台車などを引く音。',peak=-10,wet=.3)
sfx(20,'水滴',1.8,[(0,drip(),-.28),(.61,drip()*.75,.3),(1.12,drip()*.6,-.1)],'水辺・温室の滴り。',peak=-12,wet=.45)
t=time(.85); splash=ramp(smooth(RNG.standard_normal(len(t)),[250,6500],'bandpass')*np.exp(-t/.27),.008,.2)
sfx(21,'水面のしぶき',1.65,[(0,splash,0),(.18,drip()*.18,-.3),(.33,drip()*.12,.3)],'物が水面を叩く音。',peak=-9,wet=.25)
sfx(22,'放送スイッチと校内チャイム',4.7,[(0,metal(.1)*.09,0),(.24,bell(76,2.7,.3),-.15),(.79,bell(72,2.6,.3),.05),(1.34,bell(74,2.7,.3),.15),(1.89,bell(67,2.7,.28),0)],'4音のオリジナルチャイム。音声と独立した素材。',peak=-11,wet=.5)
t=time(.23); impact=ramp(smooth(RNG.standard_normal(len(t)),[100,10000],'bandpass')*np.exp(-t/.026)+.6*np.sin(2*np.pi*72*t)*np.exp(-t/.055),.0003,.07)
sfx(23,'遠い発砲音',1.9,[(0,impact,0),(.17,impact*.14,-.55),(.29,impact*.09,.55)],'再現内の発砲・録音の素材。同じ音でも実音と録音の区別は本文側で示す。',peak=-7,wet=.45)
sfx(24,'金属機構の作動と停止',3.1,[(0,metal(.45)*.23,-.25),(.3,scrape(1.6)*.6,0),(1.95,thud(.4,76),.1),(2.03,metal(.7)*.24,.25)],'貨物リフト・跳ね橋・可動壁などの機構用。',peak=-10,wet=.4)

(ROOT/'audio_catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding='utf-8')
assert len(catalog)==24
assert all(x['peak_dbfs'] < -1 for x in catalog)
for x in catalog:
    if x['loop']:assert x['boundary_delta']<.02, x
shutil.copy(__file__,ROOT/'production'/'create_audio.py')
print('Audio generation and numeric validation complete.',flush=True)
