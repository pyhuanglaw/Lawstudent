"""社科院圖書館 2 樓（SOCLIB-2F-1104；LAWWW2-C 2026-11-04）的配置 → src/data/soclib2f_layout.js（const SOCLIB2F_LAYOUT= 後面接純 JSON）。
遊戲（src/soclib2f3d.js：導航格、地板高度、座位、互動點、電梯、程序化備用模型）和 Blender（tools/blender/env_second/soclib2f_interior.py）讀同一份，兩邊一定對得上。

使用者 11-04 16:1x（對 AA-C）：「我那時候大學最喜歡去社科院圖書館2樓，你現在好像沒有2樓，你查一下他的2樓有一個專門的讀書室還會有洗手間啊」。
規格：AA_669 第 6 節（企劃線 468a1d0b9）：樓梯、電梯從一樓接上來；一樓那種特殊柱子不要延伸到二樓（D136）；自習室一間（玻璃門、長桌加矮隔板、每張桌子都有插座、
  靠窗那排看得到樹、約 40～60 位、期末要看起來是滿的、靠窗那排第三個位子是劇情的「老位子」）；討論室兩三間（玻璃牆、門口預約的小螢幕）；洗手間在樓梯旁邊、男女分開、
  門口一台飲水機；走廊有公告欄和一排置物櫃；地板照 D112（不要深色木地板）。館方 2020 年的公告寫到 2 樓有自習室和討論室（epaper.ntu.edu.tw/view.php?id=29815，只留網址）。

做法（D136：像但不照抄）：一樓閱覽室（soclib，挑高 5.6 m、樹狀柱、天窗）是單層的大空間，二樓不能蓋在它上面——
  在閱覽室東邊接一棟兩層的「東側館」：一樓（從閱覽室東牆的門進來）是門廳＋樓梯＋電梯＋影印休息區，二樓是走廊、自習室、討論室、洗手間、置物櫃、公告欄。
  東側館是另一個區域 soclib_2f（和宿舍走廊、總圖大廳一樣的兩層導航）：閱覽室東牆的門 ⇄ 東側館一樓西牆的門。
座標（東側館自己的）：x 往東、z 往南，單位公尺；外牆中心線 x ±8、z ±11.2（W 16、D 22.4）；一樓 y 0（淨高 3.95）、二樓 y 4.2、二樓天花板 7.8。
導航格：0.4 m，原點 (−8.2, −11.4)：格子中心在 0.4 的整數倍上。
  牆的中心線放在格子中心（0.4 的整數倍），走得到的範圍（free0／free1）的邊界放在 0.2 的奇數倍（格子和格子的交界）：
  人的身體（半徑 0.33）最遠到 free 的邊界，牆面在邊界外 0.1 m（不穿牆、也不會離牆一大段）。
電梯：B3.buildElevator 的運鏡固定在車廂中心往西 3.4 m、往南 4.2 m、高 2.6 m（game3d.js 的 elevatorRide）——
  兩層樓在那個位置都要是空的、中間沒有牆：二樓是自習室（北面是玻璃隔間）、一樓是影印休息區。車廂深 2.2 m（和總圖、萬才館一樣：井道角柱不會剛好擋在人的正中間）。
牆（walls）：每一段 {lv, x0,z0,x1,z1（中心線）, kind, y0,y1}；kind：outer＝外牆（擋住鏡頭時淡出，正式模型的 WALL_*）、inner＝室內的牆（鏡頭碰撞）、
  glass＝玻璃隔間（鏡頭碰撞）、rail＝欄杆；lv：0＝一樓、1＝二樓、2＝兩層都有（樓梯間）。開口（門、玻璃門）是牆的缺口，另外列在 openings。
用法：python3 tools/blender/env_second/soclib2f_layout_gen.py（寫出 src/data/soclib2f_layout.js）"""
import json, math, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OUT = os.path.join(ROOT, 'src', 'data', 'soclib2f_layout.js')
W, D, Y1, RY, T, ST, CELL = 16.0, 22.4, 4.2, 7.8, 0.2, 0.25, 0.4
XW, XE, ZN, ZS = -W / 2, W / 2, -D / 2, D / 2           # 外牆中心線
NR = 26; RISE = Y1 / NR; TREAD = 0.28; HALF = NR // 2; RUN = HALF * TREAD    # 一階 16.2 cm、踏面 28 cm、一跑 13 階（3.64 m）
r3 = lambda v: round(v, 4)
PI = math.pi

# ---- 樓梯（雙跑，兩層共用：D36）：A 跑從一樓門廳往南爬到平台，B 跑從平台往北爬回二樓走廊 ----
SZ0 = -5.0                                                           # 一樓門廳／二樓走廊南邊的線（樓梯的北端）
A = dict(x0=-7.8, x1=-6.2, z0=SZ0, z1=r3(SZ0 + RUN), risers=HALF, up='+z', vx0=-7.9)          # vx0：畫面上的踏面一直到西外牆
LD = dict(x0=-7.8, x1=-4.2, z0=r3(SZ0 + RUN), z1=0.6, y=round(HALF * RISE, 10), vz1=0.7)              # 平台（2.1 m）；vz1：到樓梯間南牆
B = dict(x0=-5.8, x1=-4.2, z0=SZ0, z1=r3(SZ0 + RUN), risers=HALF, up='-z', vx1=-4.1)
STAIR = dict(rise=round(RISE, 10), tread=TREAD, A=A, landing=LD, B=B, midWall=dict(x0=-6.2, x1=-5.8, h=r3(Y1 + 1.0)),
             well=dict(x0=-7.9, x1=-4.1, z0=-4.9, z1=0.7), eastX=-4.0, southZ=0.8)
ELEV = dict(x0=3.4, x1=5.4, z0=-3.8, z1=-1.6, doorX0=3.8, doorX1=5.0, doorZ=-3.8, callZ=-4.6,
            floors=[dict(label='1F 往閱覽室', lv=0, open=True), dict(label='2F 自習室、討論室', lv=1, open=True)],
            block=[4.4, -2.4, 2.4, 2.4])          # 井道和四周一圈（格子中心 x 3.2～5.6、z −3.6～−1.2）擋起來；車廂裡的格子由電梯自己開關
CAM = dict(x=r3((ELEV['x0'] + ELEV['x1']) / 2 - 3.4), z=r3((ELEV['z0'] + ELEV['z1']) / 2 + 4.2), dy=2.6)   # 電梯運鏡的位置（只是檢查用）

# ---- 走得到的範圍 [x0, z0, x1, z1] ----
FREE0 = [[-7.8, -11.0, 7.8, -5.0],      # 一樓門廳
         [-3.8, -5.0, 7.8, 2.6],        # 影印休息區（電梯在這裡面；電梯運鏡的位置也在這裡）
         [-7.8, -5.0, -4.2, 0.6]]       # 樓梯間（A 跑、平台、B 跑；兩跑中間的牆、B 跑最上面一排另外擋）
STUDY = dict(x0=-1.6, x1=XE, z0=-0.8, z1=ZS, free=[-1.4, -0.6, 7.8, 11.0],
             doors=[dict(id='north', x=-0.8, z=-0.8, w=1.2, axis='x', label='自習室'), dict(id='west', x=-1.6, z=5.2, w=1.2, axis='z', label='自習室（側門）')])
DZ0, DZ1 = ZN, -6.8                     # 北邊一排房間（洗手間、討論室）：北外牆到走廊北牆（中心線）；房間淨深 4.2 m：桌子（1.6 m）南北兩頭、東西兩邊都留 3 格（1.2 m）走道
DISC = [dict(id='d1', name='討論室 1', x0=-3.2, x1=0.4, free=[-3.0, -11.0, 0.2, -7.0], door=dict(x=-2.4, w=1.2)),
        dict(id='d2', name='討論室 2', x0=0.4, x1=4.0, free=[0.6, -11.0, 3.8, -7.0], door=dict(x=1.2, w=1.2)),
        dict(id='d3', name='討論室 3', x0=4.0, x1=XE, free=[4.2, -11.0, 7.8, -7.0], door=dict(x=4.8, w=1.2))]
WC = dict(x0=XW, x1=-3.2, split=-5.6, z0=DZ0, z1=DZ1, doors=[-6.8, -4.4])
RESEARCH = dict(x0=XW, x1=-4.0, z0=STAIR['southZ'], z1=ZS, splits=[4.8, 8.0])
FREE1 = [[-7.8, -6.6, 7.8, -5.0],       # 二樓東西向的走廊（寬 1.9 m）
         [-3.8, -5.0, -1.8, 11.0],      # 南北向的走廊（西牆：置物櫃、公告欄、研究小間的門）
         [-1.8, -5.0, 7.8, -1.0],       # 電梯廳（南邊是自習室的玻璃隔間）
         [-5.8, -5.0, -4.2, r3(SZ0 + RUN)],   # B 跑（從平台上來）
         STUDY['free']] + [d['free'] for d in DISC]
for dd in STUDY['doors']:
    h = dd['w'] / 2
    FREE1.append([r3(dd['x'] - h), -1.0, r3(dd['x'] + h), -0.6] if dd['axis'] == 'x' else [-1.8, r3(dd['z'] - h), -1.4, r3(dd['z'] + h)])
for d in DISC: FREE1.append([r3(d['door']['x'] - d['door']['w'] / 2), -7.0, r3(d['door']['x'] + d['door']['w'] / 2), -6.6])   # 討論室的玻璃門

# ---- 牆（中心線）----
walls = []
def wall(lv, x0, z0, x1, z1, kind, y0=None, y1=None, **kw):
    if y0 is None: y0 = Y1 if lv == 1 else 0.0
    if y1 is None: y1 = RY if lv in (1, 2) else Y1
    walls.append(dict(lv=lv, x0=r3(x0), z0=r3(z0), x1=r3(x1), z1=r3(z1), kind=kind, y0=r3(y0), y1=r3(y1), **kw))
ENT = dict(x=XW, z=-8.4, w=1.6)          # 從閱覽室進來的門（一樓西牆）
for lv in (0, 1):
    y0, y1 = (0.0, Y1) if lv == 0 else (Y1, RY)
    wall(lv, XW, ZN, XE, ZN, 'outer', y0, y1, dir=[0, 0, 1])                    # 北外牆
    wall(lv, XW, ZS, XE, ZS, 'outer', y0, y1, dir=[0, 0, -1])                   # 南外牆
    wall(lv, XE, ZN, XE, ZS, 'outer', y0, y1, dir=[-1, 0, 0])                   # 東外牆
    if lv == 0:
        wall(0, XW, ZN, XW, ENT['z'] - ENT['w'] / 2, 'outer', dir=[1, 0, 0]); wall(0, XW, ENT['z'] + ENT['w'] / 2, XW, ZS, 'outer', dir=[1, 0, 0])
    else: wall(1, XW, ZN, XW, ZS, 'outer', dir=[1, 0, 0])
# 樓梯間（兩層都有：0～7.8）
wall(2, STAIR['eastX'], -4.9, STAIR['eastX'], STAIR['southZ'], 'inner', 0.0, RY)
wall(2, XW, STAIR['southZ'], STAIR['eastX'], STAIR['southZ'], 'inner', 0.0, RY)
wall(0, B['x0'], -4.9, B['vx1'], -4.9, 'inner', 0.0, r3(Y1 - ST))             # 一樓：B 跑最上面那一段的下面（門廳南牆）
wall(1, A['vx0'], -4.9, A['x1'], -4.9, 'rail', Y1, r3(Y1 + 1.05))               # 二樓：A 跑上方的欄杆
# 一樓：影印休息區的西牆、南牆（南邊是書庫，關著）
wall(0, STAIR['eastX'], STAIR['southZ'], STAIR['eastX'], 2.8, 'inner', 0.0, r3(Y1 - ST))   # 只到一樓天花板（3.95）：原本到 4.2，南牆的牆頂和二樓地板同高、疊在一起
wall(0, STAIR['eastX'], 2.8, XE, 2.8, 'inner', 0.0, r3(Y1 - ST))                         #   （二樓南北向走廊地上一條黑線、遊戲裡會閃；v2 預覽用射線查到的）
# 二樓：北邊一排房間的前牆（洗手間實心、討論室玻璃）、隔間
wall(1, XW, DZ1, WC['x1'], DZ1, 'inner')
for d in DISC:
    dx0, dx1 = d['door']['x'] - d['door']['w'] / 2, d['door']['x'] + d['door']['w'] / 2
    if dx0 - d['x0'] > 0.05: wall(1, d['x0'], DZ1, dx0, DZ1, 'glass')
    wall(1, dx1, DZ1, d['x1'], DZ1, 'glass')
for x in (WC['split'], WC['x1'], DISC[0]['x1'], DISC[1]['x1']): wall(1, x, DZ0, x, DZ1, 'inner')
# 二樓：研究小間（南北向走廊的西邊；東牆接著樓梯間的東牆）、隔間
wall(1, RESEARCH['x1'], RESEARCH['z0'], RESEARCH['x1'], ZS, 'inner')
for z in RESEARCH['splits']: wall(1, XW, z, RESEARCH['x1'], z, 'inner')
# 二樓：自習室的西牆（側門）、北面玻璃隔間（玻璃門）
sw = STUDY['doors'][1]; sn = STUDY['doors'][0]
wall(1, STUDY['x0'], STUDY['z0'], STUDY['x0'], sw['z'] - sw['w'] / 2, 'inner'); wall(1, STUDY['x0'], sw['z'] + sw['w'] / 2, STUDY['x0'], ZS, 'inner')
wall(1, STUDY['x0'], STUDY['z0'], sn['x'] - sn['w'] / 2, STUDY['z0'], 'inner'); wall(1, sn['x'] + sn['w'] / 2, STUDY['z0'], XE, STUDY['z0'], 'glass')
openings = [dict(id='entrance', lv=0, x=ENT['x'], z=ENT['z'], w=ENT['w'], axis='z', kind='door', h=2.4, inward=[1, 0, 0]),       # inward：房間在哪一邊（玻璃門往那邊推開）
            dict(id='study_n', lv=1, x=sn['x'], z=sn['z'], w=sn['w'], axis='x', kind='glassDoor', h=2.3, inward=[0, 0, 1]),
            dict(id='study_w', lv=1, x=sw['x'], z=sw['z'], w=sw['w'], axis='z', kind='glassDoor', h=2.3, inward=[1, 0, 0])] + \
           [dict(id=d['id'], lv=1, x=d['door']['x'], z=DZ1, w=d['door']['w'], axis='x', kind='glassDoor', h=2.3, inward=[0, 0, -1]) for d in DISC]

# ---- 家具、座位 ----
furn, seats = [], []
# 自習室：南北向的長桌（兩排、每排三張），桌子中間一道矮隔板、每兩個位子一個插座；座位面向桌子（東、西兩邊各三個）
TL, TDp, SOFF, SP = 2.8, 0.7, 0.73, 0.95   # 桌長、桌深、座位離桌子中心線、同一邊的座位間距
COLS = [0.6, 4.2]; TZ = [1.3, 5.3, 9.3]     # 桌子之間的橫向走道 1.2 m（三格：人走得過去、不會卡在桌角）
for j, x in enumerate(COLS):
    for i, z in enumerate(TZ):
        tid = f'st{j}{i}'; furn.append(dict(type='studyTable', id=tid, lv=1, x=x, z=z, w=TDp, d=TL, divider=True, outlets=3))
        for k in (-1, 0, 1):
            for s in (-1, 1):            # s=−1 西邊（面向東 yaw π/2）、+1 東邊（面向西 yaw −π/2）
                seats.append(dict(lv=1, x=r3(x + s * SOFF), z=r3(z + k * SP), yaw=r3(-PI / 2 if s > 0 else PI / 2), kind='study', table=tid))
# 靠窗那排：東外牆的窗前一整條長檯面，座位面向窗（北往南第三個＝「老位子」）
WCX0 = 7.2
furn.append(dict(type='windowCounter', lv=1, x0=WCX0, x1=7.9, z0=-0.4, z1=10.8, outlets=7))
for k in range(13):
    seats.append(dict(lv=1, x=r3(WCX0 - 0.38), z=r3(-0.2 + 0.85 * k), yaw=r3(PI / 2), kind='window', table='sw' + str(k // 3), **({'old': True} if k == 2 else {})))
# 討論室：每間一張會議桌（4 人）、北牆白板、門口外面預約的小螢幕
for d in DISC:   # 討論室：南北向的桌子（0.8 × 1.6：桌子四周都留 3 格走道），東西兩邊各兩個位子面對面，白板在北牆（桌子的頭）
    cx, cz = (d['x0'] + d['x1']) / 2, -9.0
    furn.append(dict(type='discTable', id=d['id'], lv=1, x=r3(cx), z=cz, w=0.8, d=1.6))
    furn.append(dict(type='whiteboard', lv=1, x=r3(cx), z=-11.05, w=1.8, room=d['id']))
    for k in (-1, 1):
        sz = r3(cz + 0.4 * k)
        for s in (-1, 1): seats.append(dict(lv=1, x=r3(cx + s * (0.4 + 0.38)), z=sz, yaw=r3(-PI / 2 if s > 0 else PI / 2), kind='discuss', table=d['id']))
    furn.append(dict(type='bookingScreen', lv=1, x=r3(d['door']['x'] + 0.85), z=r3(DZ1 + 0.14), room=d['id'], name=d['name']))
furn += [  # 二樓
         dict(type='lockers', lv=1, x=-3.9, z0=-3.4, z1=0.4, d=0.45, n=8, face='+x'),        # 南北向走廊西牆（樓梯間的牆）一排置物櫃
         dict(type='notice', lv=1, x=-3.88, z=2.2, ry=r3(PI / 2), w=2.0, what='floor2'),       # 公告欄（研究小間 A 的牆）
         dict(type='water', lv=1, x=WC['split'], z=r3(DZ1 + 0.32)),                                      # 飲水機：男女廁的門中間
         dict(type='bench', lv=1, x=7.62, z=-3.0, w=1.6, d=0.42, ry=r3(-PI / 2), seat=True),  # 電梯廳東邊等電梯的長椅
         dict(type='bins', lv=1, x=6.6, z=-1.16, w=1.2, ry=r3(PI)),                             # 資源回收（電梯廳東南角）
         dict(type='planter', lv=1, x=7.45, z=-4.6, r=0.26),
         dict(type='planter', lv=1, x=-2.3, z=10.6, r=0.26),
         dict(type='extinguisher', lv=1, x=-1.8, z=-4.75),
         dict(type='clock', lv=1, x=2.3, z=11.07, ry=r3(PI)),
         dict(type='rules', lv=1, x=5.0, z=11.08, ry=r3(PI), w=1.2),
         # 一樓
         dict(type='notice', lv=0, x=-0.8, z=-11.08, ry=0.0, w=2.0, what='floor1'),
         dict(type='bench', lv=0, x=1.2, z=-10.75, w=1.6, d=0.42, ry=0.0, seat=True),
         dict(type='lowShelf', lv=0, x=-4.4, z=-10.92, w=3.8, d=0.35, h=0.85, what='reserve'),   # 北面窗下的矮書架：預約書架、新書推薦（擋導航、有互動點）
         dict(type='lowShelf', lv=0, x=4.2, z=-10.92, w=3.4, d=0.35, h=0.85, what='newbooks'),
         dict(type='slatWall', lv=0, x=-3.9, z0=-4.3, z1=0.3, h=2.7, face='+x'),                # 影印休息區西牆（樓梯間的牆）：竹木條＋樓層導覽框（不擋路）
         dict(type='hose', lv=0, x=-2.6, z=2.7, ry=r3(PI)), dict(type='hose', lv=1, x=-3.9, z=5.6, ry=r3(PI / 2)),   # 消防栓箱（紅色，牆上凸出 12 cm）
         dict(type='exitSign', lv=0, x=-7.88, z=ENT['z'], y=2.72, ry=r3(PI / 2)), dict(type='exitSign', lv=1, x=-5.0, z=-5.2, y=3.2, ry=r3(PI), hang=True),   # 避難方向指示燈（綠色，自己發光）
         dict(type='planter', lv=0, x=-7.3, z=-10.5, r=0.3),
         dict(type='planter', lv=0, x=7.3, z=-10.5, r=0.3),
         dict(type='planter', lv=0, x=7.35, z=2.15, r=0.28),
         dict(type='extinguisher', lv=0, x=-7.75, z=-5.55),
         dict(type='copier', lv=0, x=0.6, z=2.3, w=0.8, d=0.7, ry=r3(PI)),                      # 影印區（南牆）：兩台影印機＋儲值機
         dict(type='copier', lv=0, x=1.7, z=2.3, w=0.8, d=0.7, ry=r3(PI)),
         dict(type='cardKiosk', lv=0, x=2.6, z=2.45, w=0.5, d=0.4, ry=r3(PI)),
         dict(type='sofa', lv=0, x=-2.2, z=-2.6, w=2.0, ry=0.0, seat=True),                    # 休息區：兩張沙發面對面＋矮桌
         dict(type='sofa', lv=0, x=-2.2, z=-0.2, w=2.0, ry=r3(PI), seat=True),
         dict(type='coffeeTable', lv=0, x=-2.2, z=-1.4, w=1.2, d=0.6),
         dict(type='umbrella', lv=0, x=-7.45, z=-9.75, r=0.2),                                  # 門口的傘架（台灣的雨天）
         dict(type='posterStand', lv=0, x=2.6, z=-6.4, ry=r3(-PI / 2), w=0.62, d=0.45),     # 門廳的海報立牌（期末考週請勿占位、論文寫作工作坊）：門廳中間、面向入口（BB_260 §5 第 1 點）
         dict(type='bookcart', lv=0, x=7.6, z=0.2, ry=r3(-PI / 2), w=0.9, d=0.45),         # 還書車（影印區東牆窗下，BB_260 §5 第 1 點）
         dict(type='planter', lv=0, x=-3.4, z=-5.6, r=0.3), dict(type='planter', lv=0, x=6.9, z=-6.3, r=0.3),   # 門廳兩盆大盆栽（BB_260 §5 第 1 點）
         dict(type='bins', lv=0, x=-1.0, z=2.4, w=1.2, ry=r3(PI)),                           # 一樓回收桶（影印區南牆）
         dict(type='kiosk', lv=0, x=-7.6, z=-6.4, ry=r3(PI / 2), w=0.6, d=0.5)]              # 自助服務機（查館藏、印預約單；西牆、門和樓梯中間，面向東）

# ---- 門（關著的、洗手間）：face＝門朝哪一邊（站在那一邊看得到門）----
doors = [dict(id='wc_m', lv=1, x=WC['doors'][0], z=DZ1, face='+z', label='男廁', look='男廁。乾淨，有一股淡淡的芳香劑味道。洗手台的鏡子前面，有人在整理頭髮。', wc=True),
         dict(id='wc_f', lv=1, x=WC['doors'][1], z=DZ1, face='+z', label='女廁', look='女廁。門口貼著「請勿將衛生紙丟入馬桶」。', wc=True),
         dict(id='rs1', lv=1, x=RESEARCH['x1'], z=4.0, face='+x', label='研究小間 A', look='研究小間 A：研究生預約使用。門上貼著今天的使用時段，從早上排到閉館。'),
         dict(id='rs2', lv=1, x=RESEARCH['x1'], z=7.2, face='+x', label='研究小間 B', look='研究小間 B：研究生預約使用。門關著，裡面有鍵盤的聲音。'),
         dict(id='rs3', lv=1, x=RESEARCH['x1'], z=10.4, face='+x', label='研究小間 C', look='研究小間 C：研究生預約使用。門上的小白板寫著「論文趕工中，請勿打擾」。'),
         dict(id='store', lv=0, x=5.6, z=2.8, face='-z', label='書庫', look='書庫（館員）：舊期刊和過期的報紙放在這裡。要調閱請到閱覽室的服務台填單。'),
         dict(id='office', lv=0, x=XE, z=-5.2, face='-x', label='館員辦公室', look='館員辦公室。門上貼著「非請勿入」。')]

signs = [dict(lv=0, x=-4.95, z=-5.02, y=2.55, ry=r3(PI), w=1.6, text='2F 自習室・討論室・洗手間'),
         dict(lv=0, x=-7.94, z=ENT['z'], y=2.65, ry=r3(PI / 2), w=1.2, text='往閱覽室'),
         dict(lv=0, x=-1.2, z=-7.6, y=2.95, ry=r3(-PI / 2), w=1.5, text='自習室在二樓', hang=True),   # BB_260 §5 第 1 點：從入口進來第一眼看到（吊牌，兩面都有字）
         dict(lv=0, x=1.4, z=0.9, y=2.95, ry=r3(PI), w=1.0, text='影印區', hang=True),
         dict(lv=0, x=-0.8, z=-11.06, y=2.35, ry=0.0, w=1.2, text='請保持安靜'),
         dict(lv=1, x=-4.95, z=r3(DZ1 + 0.14), y=2.55, ry=0.0, w=1.4, text='洗手間・飲水機'),
         dict(lv=1, x=sn['x'], z=-0.86, y=2.45, ry=r3(PI), w=1.0, text='自習室'),
         dict(lv=1, x=3.2, z=-0.86, y=2.1, ry=r3(PI), w=1.2, text='請保持安靜'),
         dict(lv=1, x=-1.66, z=sw['z'], y=2.45, ry=r3(-PI / 2), w=1.0, text='自習室'),
         dict(lv=1, x=-2.8, z=-4.82, y=2.5, ry=0.0, w=1.3, text='研究小間・自習室側門 →')]

# 窗（外面的景）：{lv, wall:N/S/E, a0, a1（沿著牆的範圍）, y0, y1（離那一層地板）}
windows = [dict(lv=0, wall='N', a0=-6.4, a1=-2.4, y0=1.0, y1=3.0), dict(lv=0, wall='N', a0=2.0, a1=6.0, y0=1.0, y1=3.0),
           dict(lv=0, wall='E', a0=-10.4, a1=-6.0, y0=1.0, y1=3.0), dict(lv=0, wall='E', a0=-4.4, a1=2.0, y0=1.0, y1=3.0),
           dict(lv=1, wall='E', a0=-0.4, a1=10.8, y0=0.85, y1=2.85, room='study'),
           dict(lv=1, wall='E', a0=-6.4, a1=-5.2, y0=0.9, y1=2.7), dict(lv=1, wall='E', a0=-4.6, a1=-1.4, y0=0.9, y1=2.7), dict(lv=1, wall='E', a0=-10.4, a1=-7.6, y0=0.9, y1=2.6, room='d3'),
           dict(lv=1, wall='N', a0=-2.4, a1=-0.4, y0=2.2, y1=2.95, room='d1'), dict(lv=1, wall='N', a0=1.2, a1=3.2, y0=2.2, y1=2.95, room='d2'),   # 討論室北牆：白板（0.95～2.05 m）上面的高窗
           dict(lv=1, wall='N', a0=5.0, a1=7.0, y0=2.2, y1=2.95, room='d3'),
           dict(lv=1, wall='S', a0=-3.6, a1=-2.0, y0=0.9, y1=2.6)]

# 天花板燈（日光燈盤）：{lv, x, z, w, d}
lights = []
for x in (-6.0, -2.0, 2.0, 6.0):
    for z in (-9.6, -6.4): lights.append(dict(lv=0, x=x, z=z, w=1.2, d=0.6))   # 一樓門廳兩排
for x, z in ((-1.4, -2.6), (1.6, -0.6), (6.4, -0.6), (-1.4, 1.4)): lights.append(dict(lv=0, x=x, z=z, w=1.2, d=0.6))
for x in (-6.0, -2.0, 2.0, 6.0): lights.append(dict(lv=1, x=x, z=-5.8, w=1.2, d=0.3))
for z in (-2.6, 1.6, 5.6, 9.6): lights.append(dict(lv=1, x=-2.8, z=z, w=0.3, d=1.2))
for x in (0.6, 6.0): lights.append(dict(lv=1, x=x, z=-3.0, w=1.2, d=0.3))
for x in (-0.4, 2.4, 5.6): lights.extend(dict(lv=1, x=x, z=z, w=0.6, d=1.2) for z in (0.6, 3.3, 6.0, 8.7))
for d in DISC: lights.append(dict(lv=1, x=r3((d['x0'] + d['x1']) / 2), z=-9.0, w=0.6, d=1.2))

L = dict(version=2, W=W, D=D, cell=CELL, wallT=T, slabT=ST, roofY=RY,
         floors=[dict(lv=0, y=0.0, name='1F'), dict(lv=1, y=Y1, name='2F')],
         navOrigin=[-8.2, -11.4], navSize=[16.4, 22.8],
         entrance=dict(x=ENT['x'], z=ENT['z'], w=ENT['w'], spawn=dict(x=-6.4, z=ENT['z'], lv=0, yaw=r3(PI / 2)), exitAt=dict(x=-7.6, z=ENT['z'], r=0.9)),
         hall=dict(note='閱覽室（soclib 區域）東牆的門：閱覽室自己的座標；東牆 x=15、牆上的書架到 z=6.2、期刊架在 z=10.29 以南、閱報區沙發 x≤12.5',
                   x=14.9, z=8.8, w=1.6, it=dict(x=14.4, z=8.8, r=0.8), spawn=dict(x=13.4, z=8.8, yaw=r3(-PI / 2))),
         stair=STAIR, elevator=ELEV, elevCam=CAM, free0=FREE0, free1=FREE1, study=STUDY, disc=DISC, discZ=[DZ0, DZ1],
         wc=WC, research=RESEARCH, walls=walls, openings=openings,
         furniture=furn, seats=seats, doors=doors, signs=signs, windows=windows, lights=lights,
         note='free0／free1＝走得到的範圍 [x0,z0,x1,z1]（先整層擋起來、再開這些）；家具另外擋；電梯的井道照 elevator.block 擋；樓梯的高度照 stair（和宿舍走廊同一種做法，方向相反：A 跑往南、B 跑往北）')

# ---- 檢查 ----
def grid_ok(v): return abs(v / 0.2 - round(v / 0.2)) < 1e-6 and round(v / 0.2) % 2 == 1
for r in FREE0 + FREE1:
    for v in r:
        if not grid_ok(v) and abs(v - r3(SZ0 + RUN)) > 1e-6: print('free 邊界不在 0.2 的奇數倍：', r, v)
for s in seats:
    inside = any(r[0] <= s['x'] <= r[2] and r[1] <= s['z'] <= r[3] for r in FREE1)
    if not inside: print('座位不在走得到的範圍裡：', s)
cx, cz = CAM['x'], CAM['z']
assert any(r[0] < cx < r[2] and r[1] < cz < r[3] for r in FREE0), '一樓的電梯運鏡位置不在空的地方'
assert STUDY['free'][0] < cx < STUDY['free'][2] and STUDY['free'][1] < cz < STUDY['free'][3], '二樓的電梯運鏡位置不在自習室裡'

os.makedirs(os.path.dirname(OUT), exist_ok=True)
hdr = ('/* ===== 社會科學院圖書館 東側館（一樓門廳＋樓梯＋電梯＋影印休息區、二樓自習室、討論室、洗手間）：tools/blender/env_second/soclib2f_layout_gen.py 產生，不要手改 =====\n'
       '   SOCLIB-2F-1104（使用者 11-04 16:1x：社科院圖書館 2 樓的讀書室、洗手間；AA_669 第 6 節）。遊戲 src/soclib2f3d.js 和 Blender soclib2f_interior.py 讀同一份。\n'
       '   座標：x 往東、z 往南；一樓 y 0、二樓 y 4.2。導航格 0.4 m、原點 (−8.2, −11.4)；牆的中心線在 0.4 的整數倍、free0／free1 的邊界在 0.2 的奇數倍。 */\n')
open(OUT, 'w', encoding='utf-8').write(hdr + 'const SOCLIB2F_LAYOUT=' + json.dumps(L, ensure_ascii=False, separators=(',', ':')) + ';\n')
n_study = sum(1 for s in seats if s['kind'] in ('study', 'window'))
print(OUT, 'seats', len(seats), 'study+window', n_study, 'old', [s for s in seats if s.get('old')], 'walls', len(walls), 'cam', CAM)
