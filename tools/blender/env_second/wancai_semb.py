"""萬才館 2F 研討室 B＝法服的初談室（AA_399 第 5 節，企劃線 5d09bb725；LAWWW-B 10-24 03:53 任務 #82 第一間）
→ 室內區域的 GLB＋配置：assets/models/env/second_ai/wancai_semb.glb＋wancai_semb.layout.json。LAWWW2-B 2026-10-24；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/wancai_semb.py [-- --out-dir assets/models/env/second_ai]
企劃：
  - 平常：單週六 09:00～12:00 開（門上「法服初談：單週六上午」，closed2_3d.js 已經做了門上的紙）。柏翰值班；背景有初談志工。
  - 事件換到這裡：語彤阿姨來法服（2027-05-22）、推甄面試（2028-10-26 10:00，門上換「推甄面試，請在外面等候」）、支線 SQ02 帶去法服那一步。
萬才館 2F 北側走廊的「研討室 B」門（src/data/wancai_layout.js 的 doors.seminarB，lv 1、x 1.5）進來。區域自己的座標：x −3.8…3.8、z −3.0…3.0；
  門在 −z 那一面（走廊那一側，靠東 x 2.6），進門面向 +z；+z 那一面一排窗（和研討室 A 同一面、同一套窗，窗景借研討室 A 的照片）。
房間（兩套布置，同一時間只開一套；遊戲照日期換，rooms_glb3d.js 的 set_days）：
  - 共用：門口西邊的報到櫃台（取號機、桌牌、初談單）、北牆四張等候椅＋飲水機、東牆書櫃（法典、判決彙編、法服的案件夾）、公告欄、時鐘、冷氣、盆栽。
  - SET_CONSULT（平常）：兩個初談隔間（中間一道屏風、前面各一道矮屏風留入口），每間一張小桌：志工坐窗那一側面向門，來談的人坐對面兩張；
    桌上面紙、筆記本、初談單、紙杯。隔間牆上貼「初談須知」「轉介資源」。
  - SET_INTERVIEW（2028-10-26 推甄面試）：屏風收掉，窗前一張長桌、三位口試委員面向門，前面一張考生的椅子；桌上名牌（只寫「委員」）、水、資料夾。
內容都是虛構的（沒有真實姓名、機構名稱、商標）。做法和研討室 A（wancai_seminar.py）一樣：lane118_shops.py 的共用零件；遊戲端 rooms_glb3d.js（Z3.room＋attachRoomGLB）。"""
import json, math, os, random, sys, types
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lane118_shops as K   # noqa: E402
from lane118_shops import L, B, Mesh, CMesh, bpy, uvquad, img_mat, rot, rbox, ccyl, clathe, plant, navcheck, auto_ap   # noqa: E402
import wancai_seminar as SA   # noqa: E402   研討室 A 的會議椅、旁聽椅、書櫃
from PIL import Image, ImageDraw, ImageFont, ImageFilter   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUTDIR = os.path.join(L.ROOT, arg('--out-dir', 'assets/models/env/second_ai'))
GEN = K.GEN; PI = math.pi
H = 3.2; K.H = H
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
SID = 'wancai_semb'
REG = {'RULES': (0, 0, 384, 512), 'REFER': (384, 0, 768, 512), 'NOTICE': (0, 512, 512, 1024), 'CLOCK': (768, 0, 1024, 256),
       'TENT': (768, 256, 1024, 352), 'NUM': (768, 352, 1024, 448), 'FORM': (512, 512, 768, 864), 'NAME': (768, 448, 1024, 528),
       'DESK': (768, 528, 1024, 608), 'PAD': (512, 864, 768, 1024), 'FILE': (768, 608, 1024, 1024)}


def F(n): return ImageFont.truetype(CJK, n)
def uv(key): x0, y0, x1, y1 = REG[key]; return (x0 / 1024, 1 - y1 / 1024, x1 / 1024, 1 - y0 / 1024)
def ctext(d, cx, y, t, f, fill): w = d.textlength(t, font=f); d.text((cx - w / 2, y), t, font=f, fill=fill)


def make_tex():
    """初談須知、轉介資源、公告欄（值班表的格子：字是糊的）、時鐘、報到櫃台的桌牌、取號機、初談單、委員名牌、報到處、便條紙、案件夾的書背標籤"""
    im = Image.new('RGB', (1024, 1024), '#808080'); d = ImageDraw.Draw(im)
    x0, y0, x1, y1 = REG['RULES']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 248, 242)); d.rectangle([x0, y0, x1 - 1, y0 + 70], fill=(38, 74, 92))
    ctext(d, (x0 + x1) / 2, y0 + 14, '初談須知', F(42), (255, 255, 255))
    for k, ln in enumerate(['請先在櫃台填初談單', '一次初談約三十分鐘', '本社提供法律意見參考', '不代寫書狀、不代理出庭', '談話的內容保密', '需要的話會轉介']):
        d.text((x0 + 22, y0 + 96 + k * 64), f'{k + 1}. ' + ln, font=F(26), fill=(46, 46, 42))
    x0, y0, x1, y1 = REG['REFER']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(244, 248, 240)); d.rectangle([x0, y0, x1 - 1, y0 + 70], fill=(70, 104, 64))
    ctext(d, (x0 + x1) / 2, y0 + 14, '轉介資源', F(42), (255, 255, 255))
    for k, (t, s) in enumerate([('法律扶助', '經濟條件符合的'), ('調解', '鄰里、車禍、小額'), ('家事', '離婚、監護、扶養'), ('勞動', '資遣、加班費'), ('消費', '定型化契約')]):
        yy = y0 + 92 + k * 82; d.rectangle([x0 + 18, yy, x0 + 30, yy + 12], fill=(70, 104, 64))
        d.text((x0 + 40, yy - 8), t, font=F(30), fill=(40, 40, 36)); d.text((x0 + 40, yy + 30), s, font=F(22), fill=(110, 110, 100))
    x0, y0, x1, y1 = REG['NOTICE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(176, 132, 88)); rr = random.Random(11)
    # 值班表（白紙、格子；名字的地方是糊掉的筆跡）
    px, py, w, h = x0 + 20, y0 + 20, 300, 290; d.rectangle([px, py, px + w, py + h], fill=(250, 250, 248)); ctext(d, px + w / 2, py + 10, '初談值班表', F(28), (40, 40, 40))
    for k in range(6): d.line([(px + 10, py + 56 + k * 38), (px + w - 10, py + 56 + k * 38)], fill=(150, 150, 150), width=2)
    d.line([(px + 96, py + 56), (px + 96, py + h - 30)], fill=(150, 150, 150), width=2)
    for k, t in enumerate(['第1週', '第3週', '第5週', '第7週', '第9週']): d.text((px + 14, py + 62 + k * 38), t, font=F(20), fill=(60, 60, 60))
    ghost = Image.new('L', (w, h), 0); gd = ImageDraw.Draw(ghost)
    for k in range(5):
        xx = 110
        for _ in range(2): ww = rr.randint(50, 70); gd.line([(xx, 76 + k * 38), (xx + ww, 76 + k * 38 + rr.randint(-3, 3))], fill=200, width=5); xx += ww + 26
    ghost = ghost.filter(ImageFilter.GaussianBlur(1.6)); base = im.crop((px, py, px + w, py + h)); ink = Image.new('RGB', base.size, (40, 60, 140)); im.paste(Image.composite(ink, base, ghost), (px, py))
    for k, (t, col) in enumerate([('志工訓練\n第 3 週六下午', (250, 228, 140)), ('案件討論\n週三晚上', (210, 232, 246)), ('初談紀錄\n當天交', (232, 246, 214))]):
        qx, qy = x0 + 340, y0 + 20 + k * 160; qw, qh = 150, 140
        d.rectangle([qx, qy, qx + qw, qy + qh], fill=col); d.ellipse([qx + qw / 2 - 6, qy + 4, qx + qw / 2 + 6, qy + 16], fill=(200, 40, 40))
        for j, ln in enumerate(t.split('\n')): ctext(d, qx + qw / 2, qy + 30 + j * 40, ln, F(24), (60, 50, 40))
    d.rectangle([x0 + 30, y0 + 330, x0 + 310, y0 + 490], fill=(246, 244, 236)); ctext(d, x0 + 170, y0 + 344, '請保持安靜', F(30), (90, 40, 30))
    ctext(d, x0 + 170, y0 + 392, '隔間裡在談話', F(24), (90, 90, 80)); ctext(d, x0 + 170, y0 + 428, '手機請轉靜音', F(24), (90, 90, 80))
    x0, y0, x1, y1 = REG['CLOCK']; cx, cy, r = (x0 + x1) / 2, (y0 + y1) / 2, 110
    d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(246, 246, 242)); d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(40, 40, 40), width=8)
    for k in range(12): a = k * PI / 6; d.line([(cx + (r - 20) * math.sin(a), cy - (r - 20) * math.cos(a)), (cx + (r - 6) * math.sin(a), cy - (r - 6) * math.cos(a))], fill=(40, 40, 40), width=6)
    d.line([(cx, cy), (cx + 50 * math.sin(5.4), cy - 50 * math.cos(5.4))], fill=(30, 30, 30), width=10); d.line([(cx, cy), (cx + 80 * math.sin(2.1), cy - 80 * math.cos(2.1))], fill=(30, 30, 30), width=6)
    x0, y0, x1, y1 = REG['TENT']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(38, 74, 92)); ctext(d, (x0 + x1) / 2, y0 + 12, '法律服務社', F(30), (255, 255, 255)); ctext(d, (x0 + x1) / 2, y0 + 52, '初談報到', F(26), (220, 236, 240))
    x0, y0, x1, y1 = REG['NUM']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(200, 40, 40)); ctext(d, (x0 + x1) / 2, y0 + 26, '請取號', F(40), (255, 255, 255))
    x0, y0, x1, y1 = REG['FORM']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(252, 252, 250)); ctext(d, (x0 + x1) / 2, y0 + 14, '初談單', F(32), (40, 40, 40))
    for k, t in enumerate(['日期', '姓名', '聯絡方式', '問題類型', '事情經過']):
        yy = y0 + 70 + k * 48; d.text((x0 + 16, yy), t, font=F(20), fill=(70, 70, 70)); d.line([(x0 + 110, yy + 24), (x1 - 16, yy + 24)], fill=(160, 160, 160), width=2)
    for k in range(3): yy = y0 + 310 + k * 10; d.line([(x0 + 16, yy), (x1 - 16, yy)], fill=(200, 200, 200), width=1)
    x0, y0, x1, y1 = REG['NAME']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 248)); ctext(d, (x0 + x1) / 2, y0 + 18, '委　員', F(40), (30, 30, 30))
    x0, y0, x1, y1 = REG['DESK']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 248)); ctext(d, (x0 + x1) / 2, y0 + 18, '報到處', F(40), (30, 30, 30))
    x0, y0, x1, y1 = REG['PAD']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 246, 210))
    for k in range(6): yy = y0 + 22 + k * 22; d.line([(x0 + 12, yy), (x1 - 12, yy)], fill=(200, 196, 160), width=2)
    for k, w in enumerate([150, 120, 170, 60]): d.line([(x0 + 16, y0 + 18 + k * 22), (x0 + 16 + w, y0 + 16 + k * 22)], fill=(40, 50, 120), width=3)
    x0, y0, x1, y1 = REG['FILE']   # 案件夾的書背：色塊＋白色標籤（年度用數字，沒有姓名）
    cols = [(38, 74, 92), (70, 104, 64), (150, 60, 50), (200, 160, 60), (90, 90, 120), (38, 74, 92), (70, 104, 64), (150, 60, 50)]
    sw = (x1 - x0) / len(cols)
    for k, col in enumerate(cols):
        a = x0 + k * sw; d.rectangle([a, y0, a + sw - 2, y1], fill=col); d.rectangle([a + 6, y0 + 60, a + sw - 8, y0 + 170], fill=(246, 246, 240))
        ctext(d, a + sw / 2, y0 + 72, str(110 + k // 2), F(18), (40, 40, 40)); ctext(d, a + sw / 2, y0 + 100, ('上' if k % 2 == 0 else '下'), F(22), (40, 40, 40))
        d.ellipse([a + sw / 2 - 9, y1 - 90, a + sw / 2 + 9, y1 - 72], outline=(230, 230, 230), width=3)
    im.save(os.path.join(GEN, 'wancai_semb_print.png'))


class Room(K.Shop):
    def __init__(self):
        self.sid = SID; self.T = {'name': '法律系館B 研討室 B', 'sub': '法服初談室'}; self.S = dict(trim='#5a4a3e', wainH=0.9)
        self.W, self.D = 7.6, 6.0; self.X0, self.X1, self.Z0, self.Z1 = -3.8, 3.8, -3.0, 3.0
        self.rng = random.Random(2028); self.extra = {}
        B.reset(texres=512)
        self.root = B.group(SID, props={'kind': SID, 'layout': SID + '.layout.json'})
        self.blocks, self.seats, self.inter = [], [], []; self.clerk = self.order = self.counter = None
        self.M = M = {
            'floor': L.pbr(SID + '_floor', 'laminate_floor_02', tile=1.4, target='#cdb594', contrast=0.7, normal=0.25, maps=('diff', 'nor'), res=512, rough_value=0.45),   # 淺色木地板（使用者 10-23：不要深色木地板）
            'wall': L.pbr(SID + '_wall', 'painted_plaster_wall', tile=2.0, target='#ece7dc', contrast=0.3, normal=0.1, maps=('diff', 'nor'), res=256, rough_value=0.85),
            'wain': L.pbr(SID + '_wain', 'walnut_veneer', tile=0.9, target='#9a7a5a', contrast=0.7, normal=0.3, maps=('diff', 'nor'), res=256, rough_value=0.5),
            'wood': L.pbr(SID + '_wood', 'wood_table_001', tile=1.1, target='#b08a62', contrast=0.7, normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.4),
            'vc': L.vc_material(SID + '_vc', rough=0.6), 'vcm': L.vc_metal(SID + '_vcmetal', rough=0.32, metal=0.4),
            'fabric': L.flat(SID + '_screen_fabric', '#8fa3ad', rough=0.95),
            'glass': L.flat('l118_glass', '#dfe9ec', rough=0.05, alpha=0.16),
            'tube': L.flat('GLOW_l118_tube', '#ffffff', rough=0.3, emit=B.srgb('#f2f6ff')),
            'ceil': L.pbr(SID + '_ceiling', 'ceiling_interior', tile=1.2, target='#eeeeea', contrast=0.6, normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.9, cull=True),   # 單面朝下
            'print': img_mat(SID + '_print', SID + '_print.png', rough=0.55),
        }
        self.vc = CMesh(SID + '_props', M['vc']); self.vm = CMesh(SID + '_metal', M['vcm'])
        self.wood = Mesh(SID + '_woodparts', M['wood']); self.tube = Mesh(SID + '_tubes', M['tube'])
        self.prt = Mesh(SID + '_prints', M['print'])
        self.WG = {k: {} for k in 'NWES'}
        self.SETS = {}

    def sset(self, name):
        """一套布置的網格（SET_CONSULT／SET_INTERVIEW）：節點掛在 SET_<name> 底下，遊戲照日期開關"""
        if name not in self.SETS:
            g = B.group('SET_' + name, self.root, {'kind': 'room_set', 'set': name.lower()})
            M = self.M
            self.SETS[name] = dict(g=g, vc=CMesh(f'{SID}_{name.lower()}_props', M['vc']), vm=CMesh(f'{SID}_{name.lower()}_metal', M['vcm']),
                                   wood=Mesh(f'{SID}_{name.lower()}_wood', M['wood']), fab=Mesh(f'{SID}_{name.lower()}_fabric', M['fabric']),
                                   prt=Mesh(f'{SID}_{name.lower()}_prints', M['print']), blocks=[], seats=[], spots={})
        return self.SETS[name]


def pq(c, side, a0, a1, y0, y1, key, inset=0.015):
    """牆上的印刷品（跟著那一面牆淡出）"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; m = c.wg(side, 'print', c.M['print'])
    if side == 'N': z = Z0 + inset; pts = [(a0, y0, z), (a1, y0, z), (a1, y1, z), (a0, y1, z)]
    elif side == 'S': z = Z1 - inset; pts = [(a1, y0, z), (a0, y0, z), (a0, y1, z), (a1, y1, z)]
    elif side == 'W': x = X0 + inset; pts = [(x, y0, a1), (x, y0, a0), (x, y1, a0), (x, y1, a1)]
    else: x = X1 - inset; pts = [(x, y0, a0), (x, y0, a1), (x, y1, a1), (x, y1, a0)]
    uvquad(m, pts, uv(key))


def flat_print(m, cx, y, cz, w, d, yaw, key):
    """桌上平放的紙（初談單、便條紙）：中心 (cx, y, cz)、寬 w（本地 x）、長 d（本地 z，字的上緣朝 −z）"""
    T = rot(cx, cz, yaw); p = [T(-w / 2, d / 2), T(w / 2, d / 2), T(w / 2, -d / 2), T(-w / 2, -d / 2)]
    uvquad(m, [(p[0][0], y, p[0][1]), (p[1][0], y, p[1][1]), (p[2][0], y, p[2][1]), (p[3][0], y, p[3][1])], uv(key))


def tent(vc, prt, cx, cz, yaw, key, w=0.24, h=0.09, y=0.74):
    """桌上的三角桌牌：兩片斜板，字朝 yaw 那一邊"""
    T = rot(cx, cz, yaw); t = 0.035
    for s in (1, -1):
        a, b = T(-w / 2, s * t), T(w / 2, s * t); top_a, top_b = T(-w / 2, 0.0), T(w / 2, 0.0)
        pts = [(a[0], y, a[1]), (b[0], y, b[1]), (top_b[0], y + h, top_b[1]), (top_a[0], y + h, top_a[1])]
        if s > 0: uvquad(prt, pts, uv(key))
        else: vc.poly([pts[1], pts[0], pts[3], pts[2]], '#f2f2ee')


def screen(fab, vm, x0, x1, z0, z1, h=1.45):
    """屏風（灰藍布面＋鋁框＋兩隻腳）：沿 x 或沿 z 的一道，厚 0.05"""
    if x1 - x0 >= z1 - z0:
        zc = (z0 + z1) / 2; fab.box(x0 + 0.03, x1 - 0.03, 0.08, h - 0.03, zc - 0.022, zc + 0.022)
        vm.cbox(x0, x1, h - 0.03, h, zc - 0.028, zc + 0.028, '#b9bec2'); vm.cbox(x0, x0 + 0.03, 0.04, h, zc - 0.028, zc + 0.028, '#b9bec2'); vm.cbox(x1 - 0.03, x1, 0.04, h, zc - 0.028, zc + 0.028, '#b9bec2')
        for xx in (x0 + 0.015, x1 - 0.015): vm.cbox(xx - 0.02, xx + 0.02, 0.0, 0.04, zc - 0.2, zc + 0.2, '#8a8f94')
    else:
        xc = (x0 + x1) / 2; fab.box(xc - 0.022, xc + 0.022, 0.08, h - 0.03, z0 + 0.03, z1 - 0.03)
        vm.cbox(xc - 0.028, xc + 0.028, h - 0.03, h, z0, z1, '#b9bec2'); vm.cbox(xc - 0.028, xc + 0.028, 0.04, h, z0, z0 + 0.03, '#b9bec2'); vm.cbox(xc - 0.028, xc + 0.028, 0.04, h, z1 - 0.03, z1, '#b9bec2')
        for zz in (z0 + 0.015, z1 - 0.015): vm.cbox(xc - 0.2, xc + 0.2, 0.0, 0.04, zz - 0.02, zz + 0.02, '#8a8f94')


def small_table(wood, vc, x0, x1, z0, z1, h=0.74):
    """小會談桌：淺木紋桌面、灰色鐵腳"""
    wood.rbox(x0, x1, h - 0.03, h, z0, z1, r=0.015, seg=2)
    for xx in (x0 + 0.06, x1 - 0.06):
        for zz in (z0 + 0.06, z1 - 0.06): vc.cbox(xx - 0.02, xx + 0.02, 0.0, h - 0.03, zz - 0.02, zz + 0.02, '#5a5f63')
    vc.cbox(x0 + 0.06, x1 - 0.06, 0.62, 0.66, z0 + 0.05, z0 + 0.08, '#5a5f63')


def tissue(vc, x, z, yaw, y=0.74):
    T = rot(x, z, yaw); rbox(vc, T, -0.11, 0.11, y, y + 0.085, -0.06, 0.06, '#e8eef2', r=0.01); rbox(vc, T, -0.03, 0.03, y + 0.085, y + 0.12, -0.012, 0.012, '#ffffff', r=0.006)


def cup(vc, x, z, y=0.74, col='#f4f2ec'):
    clathe(vc, [(0.0, 0.0), (0.028, 0.0), (0.036, 0.09), (0.0, 0.09)], x, y, z, col, seg=10)


def bottle(vc, x, z, y=0.74):
    clathe(vc, [(0.0, 0.0), (0.03, 0.0), (0.032, 0.15), (0.016, 0.19), (0.014, 0.22), (0.0, 0.22)], x, y, z, '#cfe2ea', seg=10)


def booth(c, S, cx, side):
    """一個初談隔間：桌子中心 (cx, 1.0)；志工坐窗那一側（z 1.62，面向 −z）、來談的人坐門那一側兩張（z 0.38，面向 +z）。side＝−1 西邊、+1 東邊"""
    tz0, tz1 = 0.62, 1.38; small_table(S['wood'], S['vc'], cx - 0.55, cx + 0.55, tz0, tz1)   # 1.1 m：桌子和牆中間要留得出一條走道（外側那張椅子從牆邊走過去）
    S['blocks'].append(dict(x0=round(cx - 0.58, 3), x1=round(cx + 0.58, 3), z0=round(tz0 - 0.03, 3), z1=round(tz1 + 0.03, 3), why='consult_table'))
    NS = types.SimpleNamespace(vc=S['vc'], vm=S['vm'])
    SA.meet_chair(NS, cx, 1.62, PI); S['seats'].append(dict(x=cx, z=1.62, yaw=round(PI, 4), kind='sit', table=[cx, 1.0], label='坐下', uses=['初談（志工）', '值班']))
    for dx in (-0.38, 0.38):
        SA.meet_chair(NS, cx + dx, 0.38, 0.0); S['seats'].append(dict(x=round(cx + dx, 3), z=0.38, yaw=0.0, kind='sit', table=[round(cx + dx, 3), 1.0], label='坐下', uses=['初談（來談的人）', '陪同']))
    rr = c.rng; vc, prt = S['vc'], S['prt']
    tissue(vc, cx + side * 0.38, 1.25, 0.0)
    flat_print(prt, cx - 0.12, 0.742, 0.95, 0.21, 0.297, PI + rr.uniform(-0.15, 0.15), 'FORM')          # 初談單（朝來談的人）
    flat_print(prt, cx + 0.2, 0.742, 1.2, 0.15, 0.2, rr.uniform(-0.2, 0.2), 'PAD')                      # 志工的便條紙（朝志工）
    S['vm'].cbox(cx + 0.31, cx + 0.33, 0.743, 0.75, 1.1, 1.26, '#2a3a6a')                                 # 筆
    for dx in (-0.38, 0.38): cup(vc, cx + dx + 0.12, 0.8)
    cup(vc, cx - side * 0.4, 1.3)


def build():
    c = Room(); X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M; rr = c.rng
    fl = Mesh(SID + '_floorm', M['floor'], tile=1.2); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(c.root)
    ce = Mesh(SID + '_ceiling', M['ceil'], tile=1.2); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(c.root)   # 朝下
    wh = 0.9
    # +z（S）：一排窗（和研討室 A 同一套：窗洞中心 2.1 m、2.2 × 1.6）
    WX = [-2.45, 0.0, 2.45]; wy0, wy1 = 1.3, 2.9
    c.wins = dict(side='S', wall='front', z=Z1, xs=WX, y=2.1, w=2.2, h=1.6, note='遊戲 room() 的窗：winWall＝front（+z），winXs 要寫 −x（room() 的 front 牆 x 是反的）；窗景借研討室 A（同一面、隔壁間）')
    wl = c.wg('S', 'wall', M['wall']); wn = c.wg('S', 'wain', M['wain']); fr = c.wg('S', 'frame', M['vcm'], cm=True); gl = c.wg('S', 'glass', M['glass']); tr = c.wg('S', 'trim', M['vc'], cm=True)
    QS = lambda xa, xb, y0, y1: [(xb, y0, Z1), (xa, y0, Z1), (xa, y1, Z1), (xb, y1, Z1)]
    xs = [X0] + [v for wx in WX for v in (wx - 1.1, wx + 1.1)] + [X1]
    for k in range(0, len(xs), 2): wl.quad(QS(xs[k], xs[k + 1], wh, H))
    wn.quad(QS(X0, X1, 0.0, wh)); tr.cbox(X0, X1, wh - 0.02, wh + 0.03, Z1 - 0.015, Z1, '#4a3a2e')
    for wx in WX:
        a, b = wx - 1.1, wx + 1.1; wl.quad(QS(a, b, wh, wy0)); wl.quad(QS(a, b, wy1, H))
        fr.cbox(a, b, wy0 - 0.03, wy0, Z1 - 0.3, Z1, '#d9d6cf')
        for (xa, xb) in ((a, a + 0.05), (b - 0.05, b), (wx - 0.025, wx + 0.025)): fr.cbox(xa, xb, wy0, wy1, Z1 - 0.08, Z1 - 0.03, '#a9aeb2')
        for (ya, yb) in ((wy0, wy0 + 0.05), (wy1 - 0.05, wy1)): fr.cbox(a, b, ya, yb, Z1 - 0.085, Z1 - 0.035, '#a9aeb2')
        gl.quad([(b, wy0, Z1 - 0.055), (a, wy0, Z1 - 0.055), (a, wy1, Z1 - 0.055), (b, wy1, Z1 - 0.055)])
        fr.cbox(a + 0.05, b - 0.05, wy1 - 0.42, wy1 + 0.12, Z1 - 0.14, Z1 - 0.06, '#e6e2d8')                 # 捲簾拉下一截（隔間裡談話，擋一點外面的光）
    c.block(X0, X1, Z1 - 0.32, Z1, 'window_sill')
    # −z（N，走廊那一側）：門（x 2.6）、公告欄、時鐘、四張等候椅、飲水機
    wl = c.wg('N', 'wall', M['wall']); wn = c.wg('N', 'wain', M['wain']); tr = c.wg('N', 'trim', M['vc'], cm=True); wd = c.wg('N', 'door', M['wood'])
    dx, dw = 2.6, 1.0; d0, d1 = dx - dw / 2 - 0.08, dx + dw / 2 + 0.08
    QN = lambda xa, xb, y0, y1: [(xa, y0, Z0), (xb, y0, Z0), (xb, y1, Z0), (xa, y1, Z0)]
    for (xa, xb) in ((X0, d0), (d1, X1)): wl.quad(QN(xa, xb, wh, H)); wn.quad(QN(xa, xb, 0.0, wh))
    wl.quad(QN(d0, d1, 2.2, H))
    for (xa, xb) in ((X0, d0), (d1, X1)): tr.cbox(xa, xb, wh - 0.02, wh + 0.03, Z0, Z0 + 0.015, '#4a3a2e')
    for (xa, xb) in ((d0, d0 + 0.08), (d1 - 0.08, d1)): tr.cbox(xa, xb, 0.0, 2.2, Z0, Z0 + 0.06, '#5a5f63')
    tr.cbox(d0, d1, 2.12, 2.2, Z0, Z0 + 0.06, '#5a5f63')
    wd.rbox(dx - dw / 2 + 0.01, dx + dw / 2 - 0.01, 0.0, 2.11, Z0 + 0.0, Z0 + 0.04, r=0.004, seg=1)
    tr.cbox(dx + dw / 2 - 0.18, dx + dw / 2 - 0.08, 1.0, 1.04, Z0 + 0.04, Z0 + 0.09, '#c9ced2')                          # 門把（門往東開）
    tr.cbox(dx - 0.2, dx + 0.2, 1.4, 1.85, Z0 + 0.04, Z0 + 0.045, '#2a2e33')                                             # 門上小窗
    K.frame_board(c, 'N', -3.3, -0.9, 1.2, 2.25, '#5a4030'); pq(c, 'N', -3.3, -0.9, 1.2, 2.25, 'NOTICE', inset=0.014)
    pq(c, 'N', 0.25, 0.75, 2.45, 2.95, 'CLOCK', inset=0.016)
    for x in (-3.05, -2.4, -1.75, -1.1):   # −3.1 的走近點在格子的邊上（浮點誤差算到牆那一格）
        z = Z0 + 0.34; SA.wall_chair(c, x, z, 0.0); c.seat(x, z, 0.0, (x, z + 0.6), 'sit', ap=(x, z + 0.5), label='坐下等'); c.seats[-1]['uses'] = ['等候', '陪同']
    c.block(-3.35, -0.8, Z0, Z0 + 0.42, 'wait_chairs')
    # 飲水機（西北角）＋紙杯架
    wx_, wz_ = X0 + 0.25, Z0 + 0.95
    c.vc.crbox(wx_ - 0.17, wx_ + 0.17, 0.0, 1.0, wz_ - 0.17, wz_ + 0.17, '#e8eaec', r=0.02, seg=1); c.vc.cbox(wx_ + 0.17, wx_ + 0.175, 0.62, 0.9, wz_ - 0.12, wz_ + 0.12, '#2a2e33')
    c.vm.cbox(wx_ + 0.15, wx_ + 0.22, 0.7, 0.74, wz_ - 0.06, wz_ - 0.02, '#c9302c'); c.vm.cbox(wx_ + 0.15, wx_ + 0.22, 0.7, 0.74, wz_ + 0.02, wz_ + 0.06, '#2a6ac9')
    c.vc.cbox(wx_ + 0.12, wx_ + 0.19, 0.38, 0.4, wz_ - 0.12, wz_ + 0.12, '#9aa0a4')
    ccyl(c.vc, (X0 + 0.04, 1.15, wz_ + 0.32), (X0 + 0.04, 1.45, wz_ + 0.32), 0.04, '#f4f2ec', seg=8)                       # 紙杯架（牆上）
    c.block(X0, X0 + 0.45, wz_ - 0.22, wz_ + 0.22, 'water')
    # 報到櫃台（門口西邊）：桌子＋志工的椅子（靠北牆，面向南）；取號機、桌牌、一疊初談單、筆筒
    rx0, rx1, rz0, rz1 = 0.45, 1.75, -2.15, -1.65   # 櫃台靠北：櫃台和隔間的屏風中間留 1.15 m 的走道
    c.wood.rbox(rx0, rx1, 0.72, 0.75, rz0, rz1, r=0.012, seg=2); c.vc.cbox(rx0 + 0.02, rx1 - 0.02, 0.05, 0.72, rz1 - 0.03, rz1 - 0.01, '#d8d4c8')   # 前面的擋板
    for xx in (rx0 + 0.04, rx1 - 0.04): c.vc.cbox(xx - 0.02, xx + 0.02, 0.0, 0.72, rz0 + 0.03, rz1 - 0.03, '#5a5f63')
    c.block(rx0 - 0.03, rx1 + 0.03, rz0 - 0.03, rz1 + 0.03, 'reception')
    SA.meet_chair(c, 1.05, -2.55, 0.0); c.seat(1.05, -2.55, 0.0, (1.05, -1.9), 'sit', ap=(0.0, -2.25), label='坐下'); c.seats[-1]['uses'] = ['報到（志工）']
    c.block(0.75, 1.35, -2.85, -2.25, 'reception_chair')
    tent(c.vc, c.prt, 0.75, -1.74, 0.0, 'TENT', w=0.28, h=0.1, y=0.75)                                                    # 桌牌：字朝 +z（給走到櫃台前的人看）
    T = rot(1.6, -1.8, 0.0); rbox(c.vc, T, -0.07, 0.07, 0.75, 0.93, -0.06, 0.06, '#c9302c', r=0.012)                       # 取號機
    T2 = rot(1.6, -1.8, 0.0); p = [T2(-0.06, 0.061), T2(0.06, 0.061)]   # 取號機的字朝 +z
    uvquad(c.prt, [(p[0][0], 0.82, p[0][1]), (p[1][0], 0.82, p[1][1]), (p[1][0], 0.9, p[1][1]), (p[0][0], 0.9, p[0][1])], uv('NUM'))
    for k in range(4): flat_print(c.prt, 1.05 + k * 0.004, 0.752 + k * 0.002, -1.95, 0.21, 0.297, PI + rr.uniform(-0.05, 0.05), 'FORM')
    clathe(c.vc, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.1), (0.0, 0.1)], 0.55, 0.75, -2.05, '#3a3f44', seg=10)                  # 筆筒
    for k in range(3): ccyl(c.vm, (0.55 + (k - 1) * 0.012, 0.8, -2.05), (0.55 + (k - 1) * 0.018, 0.92, -2.04 + k * 0.006), 0.004, ('#1a3a8a', '#202020', '#a02020')[k], seg=5)
    # 東牆：書櫃（北段：法典、判決彙編）＋案件夾的櫃子（中段）、冷氣
    wl = c.wg('E', 'wall', M['wall']); wn = c.wg('E', 'wain', M['wain']); tr = c.wg('E', 'trim', M['vc'], cm=True)
    wl.quad([(X1, wh, Z0), (X1, wh, Z1), (X1, H, Z1), (X1, H, Z0)]); wn.quad([(X1, 0, Z0), (X1, 0, Z1), (X1, wh, Z1), (X1, wh, Z0)])
    tr.cbox(X1 - 0.015, X1, wh - 0.02, wh + 0.03, Z0, Z1, '#4a3a2e')
    SA.law_books(c, X1 - 0.38, X1, -1.9, -0.75, h=2.0)
    # 案件夾的鐵櫃（上鎖、兩層開放格放案件夾）
    kx0, kx1, kz0, kz1 = X1 - 0.42, X1, -0.65, 0.35
    cab = c.wg('E', 'cabinet', M['vcm'], cm=True); cab.cbox(kx0, kx1, 0.0, 1.05, kz0, kz1, '#c9ccc8')
    cab.cbox(kx0 - 0.005, kx0, 0.08, 0.5, kz0 + 0.04, kz1 - 0.04, '#b9bcb8'); cab.cbox(kx0 - 0.02, kx0 - 0.005, 0.42, 0.46, (kz0 + kz1) / 2 - 0.08, (kz0 + kz1) / 2 + 0.08, '#5a5f63')
    fp = c.wg('E', 'print', M['print'])
    for k, yy in enumerate((0.55, 0.82)):
        cab.cbox(kx0, kx1, yy - 0.015, yy, kz0, kz1, '#b9bcb8')
        uvquad(fp, [(kx0 + 0.03, yy, kz1 - 0.04), (kx0 + 0.03, yy, kz0 + 0.04), (kx0 + 0.03, yy + 0.22, kz0 + 0.04), (kx0 + 0.03, yy + 0.22, kz1 - 0.04)], uv('FILE'))
    c.block(kx0 - 0.03, X1, kz0, kz1, 'case_cabinet')
    K.ac_unit(c, X1, 2.6, -1.3, '-x', w=0.9, fade=True)
    # 西牆：只有牆（隔間裡的海報貼在屏風／牆上）
    wl = c.wg('W', 'wall', M['wall']); wn = c.wg('W', 'wain', M['wain']); tr = c.wg('W', 'trim', M['vc'], cm=True)
    wl.quad([(X0, wh, Z1), (X0, wh, Z0), (X0, H, Z0), (X0, H, Z1)]); wn.quad([(X0, 0, Z1), (X0, 0, Z0), (X0, wh, Z0), (X0, wh, Z1)])
    tr.cbox(X0, X0 + 0.015, wh - 0.02, wh + 0.03, Z0, Z1, '#4a3a2e')
    pq(c, 'W', 0.7, 1.5, 1.25, 2.3, 'RULES', inset=0.015)                                                                   # 西邊隔間的牆上：初談須知
    pq(c, 'E', 1.0, 1.8, 1.25, 2.3, 'REFER', inset=0.015)                                                                   # 東邊隔間的牆上：轉介資源
    plant(c, X1 - 0.35, Z1 - 0.62, 1.15); c.block(X1 - 0.6, X1, Z1 - 0.87, Z1 - 0.37, 'plant')
    # ---------- SET_CONSULT：兩個初談隔間 ----------
    S = c.sset('CONSULT')
    screen(S['fab'], S['vm'], -0.03, 0.03, -0.3, Z1 - 0.34)                                                                # 中間一道（到窗台前）
    screen(S['fab'], S['vm'], X0, -1.3, -0.33, -0.27); screen(S['fab'], S['vm'], 1.3, X1 - 0.43, -0.33, -0.27)             # 前面的矮屏風（各留 1.3 m 的入口）
    S['blocks'] += [dict(x0=-0.08, x1=0.08, z0=-0.35, z1=round(Z1 - 0.32, 3), why='screen_mid'), dict(x0=X0, x1=-1.28, z0=-0.37, z1=-0.23, why='screen_w'),
                    dict(x0=1.28, x1=round(X1 - 0.42, 3), z0=-0.37, z1=-0.23, why='screen_e')]
    booth(c, S, -1.8, -1); booth(c, S, 1.8, 1)   # ±1.8：0.4 m 導航格上，桌子兩邊（靠牆、靠中間屏風）各剛好留一條站得住的格子（±1.75 時中間那條被桌角吃掉）
    S['spots'] = {'duty': dict(x=-1.8, z=1.62, yaw=round(PI, 4), act='sit', note='柏翰（法服值班）：西邊隔間志工的位子'),
                  'volunteer': dict(x=1.8, z=1.62, yaw=round(PI, 4), act='sit', note='背景的初談志工：東邊隔間'),
                  'desk': dict(x=1.05, z=-2.55, yaw=0.0, act='sit', note='報到櫃台的志工（可以沒有人）'),
                  'client': dict(x=-2.18, z=0.38, yaw=0.0, act='sit', note='來談的人（語彤阿姨、SQ02 的店員）：西邊隔間'),
                  'companion': dict(x=-1.42, z=0.38, yaw=0.0, act='sit', note='陪同的人（玩家）：西邊隔間')}
    # ---------- SET_INTERVIEW：推甄面試（2028-10-26）----------
    S2 = c.sset('INTERVIEW')
    NS2 = types.SimpleNamespace(vc=S2['vc'], vm=S2['vm'])
    small_table(S2['wood'], S2['vc'], -1.25, 1.25, 1.05, 1.8)
    S2['vc'].cbox(-1.22, 1.22, 0.05, 0.71, 1.06, 1.08, '#d8d4c8')                                                           # 桌前的擋板
    S2['blocks'].append(dict(x0=-1.28, x1=1.28, z0=1.02, z1=1.83, why='panel_table'))
    for k, x in enumerate((-0.75, 0.0, 0.75)):
        SA.meet_chair(NS2, x, 2.15, PI); S2['seats'].append(dict(x=x, z=2.15, yaw=round(PI, 4), kind='sit', table=[x, 1.42], label='坐下', uses=['口試委員']))
        tent(S2['vc'], S2['prt'], x, 1.18, PI, 'NAME', w=0.22, h=0.08)
        bottle(S2['vc'], x + 0.28, 1.5); flat_print(S2['prt'], x - 0.12, 0.742, 1.45, 0.21, 0.297, rr.uniform(-0.1, 0.1), 'FORM')
        S2['vc'].cbox(x + 0.02, x + 0.24, 0.742, 0.752, 1.32, 1.62, ('#25425e', '#7a2a24', '#3e5a3a')[k])                     # 資料夾
    SA.meet_chair(NS2, 0.0, 0.25, 0.0); S2['seats'].append(dict(x=0.0, z=0.25, yaw=0.0, kind='sit', table=[0.0, 1.05], ap=[0.0, -0.6], label='坐下', uses=['考生']))
    S2['blocks'].append(dict(x0=-0.3, x1=0.3, z0=0.0, z1=0.5, why='candidate_chair'))
    flat_print(S2['prt'], 1.05, 0.762, -1.72, 0.21, 0.09, 0.0, 'DESK')                                                     # 報到櫃台上多一張「報到處」
    S2['spots'] = {'panel': [dict(x=x, z=2.15, yaw=round(PI, 4), act='sit', note='口試委員') for x in (-0.75, 0.0, 0.75)],
                   'candidate': dict(x=0.0, z=0.25, yaw=0.0, act='sit', note='考生（玩家）'),
                   'desk': dict(x=1.05, z=-2.55, yaw=0.0, act='sit', note='報到處的助理'),
                   'wait': [dict(x=x, z=-2.66, yaw=0.0, act='sit', note='等候的考生（背景）') for x in (-3.05, -2.4, -1.75)]}
    # 燈、天花板
    for x in (-1.9, 1.9):
        for z in (-1.5, 1.4):
            c.vc.cbox(x - 0.62, x + 0.62, H - 0.02, H, z - 0.32, z + 0.32, '#f4f4f1'); c.tube.box(x - 0.58, x + 0.58, H - 0.026, H - 0.02, z - 0.28, z + 0.28)
    c.look('notice', -2.1, round(Z0 + 0.95, 3), 0.8, '公告欄', '', dev='初談值班表（字是糊的）、志工訓練、案件討論、請保持安靜；遊戲裡顯示的字等 AA 寫')
    c.look('rules', round(X0 + 0.7, 3), 1.1, 0.8, '初談須知', '', dev='西邊隔間牆上（SET_CONSULT 那一套才看得到隔間；面試那天也在牆上）')
    c.look('cases', 2.95, 0.15, 0.7, '案件夾的櫃子', '', dev='上鎖的鐵櫃＋兩層案件夾（書背只有年度、上下學期）')
    c.door = dict(x=dx, w=dw, z=Z0, note='−z 那一面靠東；從萬才館 2F 北側走廊的「研討室 B」門（wancai_layout.js doors.seminarB，lv 1、x 1.5）進來')
    c.spawn = dict(x=dx, z=round(Z0 + 1.45, 3), yaw=0.0, note='進門、面向房間裡（+z）')
    c.exits = [dict(x=dx, z=round(Z0 + 0.45, 3), r=0.7, label='離開研討室', to='wancai', spawn_note='回到萬才館 2F 北側走廊、研討室 B 的門前面（wancai_layout.js doors.seminarB 的 x，lv 1）')]
    D = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items(): m.finish(c.root, props={'dir': D[k]}, uv=key in ('wall', 'wain', 'door', 'bookwood'), merge=key not in ('print',))
    for m in (c.vc, c.vm, c.tube): m.finish(c.root, uv=False)
    c.wood.finish(c.root); c.prt.finish(c.root, uv=False, merge=False)
    for m in c.extra.values(): m.finish(c.root, uv=False)
    for name, S_ in c.SETS.items():
        for kk in ('vc', 'vm'): S_[kk].finish(S_['g'], uv=False)
        for kk in ('wood', 'fab'): S_[kk].finish(S_['g'])
        S_['prt'].finish(S_['g'], uv=False, merge=False)
        L.merge_by_material(S_['g'])
    in_set = lambda ob: ob.parent is not None and ob.parent.name.startswith('SET_')
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith('WALL_') or in_set(ob), key=lambda ob: '')
    out = os.path.join(OUTDIR, SID + '.glb'); st = L.export(out, gpu_instances=False)
    tris, set_tris = 0, {}
    for ob in bpy.data.objects:
        if ob.type == 'MESH':
            ob.data.calc_loop_triangles(); n = len(ob.data.loop_triangles); tris += n
            if in_set(ob): set_tris[ob.parent.name] = set_tris.get(ob.parent.name, 0) + n
    common_blocks = list(c.blocks); common_seats = list(c.seats)
    sets = {name.lower(): dict(node='SET_' + name, blocks=common_blocks + S_['blocks'], seats=common_seats + S_['seats'], spots=S_['spots']) for name, S_ in c.SETS.items()}
    lay = dict(version=1, zone=SID, name='法律系館B 研討室 B', type='研討室（法服初談室）', src='AA_399 第 5 節（企劃線 5d09bb725）；LAWWW-B 10-24 03:53 任務 #82',
               bounds=dict(x0=X0, x1=X1, z0=Z0, z1=Z1), h=H, cam_dist=4.0, door=c.door, spawn=c.spawn, exits=c.exits, windows=c.wins, view='wancai_sema',
               counter=None, clerk=None, teacherSpot=None, order=None, seats=sets['consult']['seats'], interact=c.inter, blocks=sets['consult']['blocks'],
               spots=sets['consult']['spots'], set_default='consult', sets=sets, set_days={'2028-10-26': 'interview'},
               open=dict(wd=6, h0=9, h1=12, termWeeks='odd', days=['2027-05-22', '2028-10-26'],
                         note='AA_399 第 5 節：單週六 09:00～12:00（學期的第 1、3、5…週，CALENDAR.termOf(day).week）；days＝事件那一天整天開。其他時間門照舊關著（closed2_3d.js 門上的紙）'),
               host_door=dict(zone='wancai', id='seminarB', lv=1, note='wancai_layout.js 的 doors.seminarB：加 to、spawn；open 的時段才走得進去（rooms_glb3d.js Z3.roomGlbOpen），closed（門上的紙）照舊'))
    for s_ in sets.values(): auto_ap(c, dict(lay, seats=s_['seats'], blocks=s_['blocks']))
    probs = {k: navcheck(c, dict(lay, seats=s_['seats'], blocks=s_['blocks'])) for k, s_ in sets.items()}
    lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=probs, ap={k: sum(1 for s in s_['seats'] if s.get('ap')) for k, s_ in sets.items()})
    L.write_json(os.path.join(OUTDIR, SID + '.layout.json'), lay)
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, set_tris=set_tris, layout=SID + '.layout.json', seats={k: len(s_['seats']) for k, s_ in sets.items()}))
    print(json.dumps({'room': SID, 'tris': tris, 'set_tris': set_tris, 'seats': {k: len(s_['seats']) for k, s_ in sets.items()}, 'problems': probs}, ensure_ascii=False))
    return [p for v in probs.values() for p in v]


if __name__ == '__main__':
    make_tex(); p = build(); print('WANCAI_SEMB', 'OK' if not p else p)
