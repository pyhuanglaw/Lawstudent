"""霖澤館 1F 入口東牆的公布欄（LAWWW-B 10-24 03:53：互動點搬到 (7.2, 1.2)，那裡沒有公布欄模型）→ 貼圖 tools/blender/env_second/textures/gen/linze_notice.png。
LAWWW2-B 2026-10-24。PIL：python3 tools/blender/linze_notice_tex.py
貼圖 1024 × 768：
  上面 1024 × 512＝軟木板（2.0 × 1.0 m，每公尺 512 px）和一直貼著的單子：獎學金、法學講座、讀書會、二手書（下面撕得掉的電話條）、系學會考古題、法律服務社、失物招領、迎新茶會；
  補習班、事務所的徵才單那兩格留著軟木（AA_433：補習班大二上、事務所大三上才貼）。
  下面 1024 × 256＝兩張徵才單（模型裡是另外兩個節點，遊戲可以照 jobs3d.js 的 S.board2 開關）：
    「徵工讀生」法科補習班（有意者請來電）、「誠徵實習生」律師事務所（請寄履歷）——和 AA_433 的「打電話問。」「寄履歷。」一致。
字都是虛構的一般用語，沒有真實的補習班、事務所名稱（D77）。單子的內文用灰線代替（看不清楚的小字）。"""
import os, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'tools', 'blender', 'env_second', 'textures', 'gen', 'linze_notice.png')   # tools/blender/textures/ 是下載的 Poly Haven（.gitignore），產生的貼圖放這裡
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
PX = 512                                       # 每公尺幾個像素
JOBS = {'cram': (0.62, 0.06, 0.21, 0.30), 'office': (0.88, 0.06, 0.21, 0.30)}   # 兩張徵才單在軟木板上的位置（公尺，左上角、寬、高）——linze_interior.py 用同一組數字
JOB_SLOT = {'cram': (0, 520, 128, 183), 'office': (128, 520, 128, 183)}       # 兩張徵才單在貼圖下面那一條的位置（px：x、y、寬、高）


def F(n): return ImageFont.truetype(FONT, n)


def paper(im, x, y, w, h, bg, title, tcol, sub=None, lines=5, rr=None, band=None, tabs=False, hand=False):
    """一張單子：底色、（上方色帶）、標題、副標、灰線內文、（下面撕得掉的電話條）、一根圖釘"""
    d = ImageDraw.Draw(im); X, Y, W, H = int(x), int(y), int(w), int(h)
    sh = Image.new('L', (W + 8, H + 8), 0); ImageDraw.Draw(sh).rectangle([4, 4, W + 3, H + 3], fill=90); sh = sh.filter(ImageFilter.GaussianBlur(3))
    im.paste((60, 45, 30), (X - 1, Y + 1), sh)                                                      # 一點陰影
    d.rectangle([X, Y, X + W - 1, Y + H - 1], fill=bg)
    ty = Y + 15; bb = Y
    if band: bb = Y + int(H * 0.2); d.rectangle([X, Y, X + W - 1, bb], fill=band); ty = Y + 12
    sz = 26 if W > 120 else 20
    while d.textlength(title, font=F(sz)) > W - 14 and sz > 10: sz -= 1
    tw = d.textlength(title, font=F(sz)); d.text((X + (W - tw) / 2, ty), title, font=F(sz), fill=tcol)
    yy = max(ty + sz + 6, bb + 8)   # 副標在色帶下面
    if sub:
        s2 = 14
        while d.textlength(sub, font=F(s2)) > W - 12 and s2 > 9: s2 -= 1
        sw = d.textlength(sub, font=F(s2)); d.text((X + (W - sw) / 2, yy), sub, font=F(s2), fill=(70, 70, 80)); yy += s2 + 8
    rr = rr or random.Random(X * 7 + Y)
    for k in range(lines):
        ly = yy + k * 10
        if ly > Y + H - (34 if tabs else 12): break
        d.line([(X + 10, ly), (X + 10 + rr.randint(int(W * 0.45), W - 20), ly + (rr.randint(-1, 1) if hand else 0))], fill=(150, 150, 158) if not hand else (90, 110, 150), width=2)
    if tabs:
        n = max(4, W // 18)
        for k in range(n):
            tx = X + k * W / n; d.line([(tx, Y + H - 28), (tx, Y + H)], fill=(170, 170, 170), width=1)
            d.line([(tx + W / n / 2 - 1, Y + H - 24), (tx + W / n / 2 - 1, Y + H - 4)], fill=(120, 120, 130), width=2)
    px = X + W // 2; col = rr.choice([(200, 40, 40), (40, 90, 190), (30, 140, 70), (220, 170, 30)])
    d.ellipse([px - 6, Y - 3, px + 6, Y + 9], fill=col); d.ellipse([px - 3, Y - 1, px + 1, Y + 3], fill=(255, 255, 255))   # 圖釘（釘在單子的上緣，不壓到標題）


def main():
    rr = random.Random(1024)
    im = Image.new('RGB', (1024, 768), (128, 128, 128))
    cork = Image.new('RGB', (1024, 512), (196, 160, 112)); px = cork.load()                           # 淺色軟木（不是深色木頭）
    for _ in range(26000):
        x, y = rr.randrange(1024), rr.randrange(512); c = rr.randint(-28, 22); r, g, b = px[x, y]
        px[x, y] = (max(0, min(255, r + c)), max(0, min(255, g + c)), max(0, min(255, b + c)))
    cork = cork.filter(ImageFilter.GaussianBlur(0.6)); im.paste(cork, (0, 0))
    m = lambda v: v * PX
    paper(im, m(0.06), m(0.05), m(0.21), m(0.30), (250, 249, 244), '獎學金申請', (180, 30, 30), '本學期校內外獎助學金', 9)
    paper(im, m(0.31), m(0.04), m(0.27), m(0.40), (246, 246, 242), '法學講座', (250, 250, 250), '每週四中午　法律系館A 201', 11, band=(30, 52, 92))
    paper(im, m(1.14), m(0.05), m(0.25), m(0.17), (250, 236, 120), '考古題借閱', (60, 50, 20), '系學會　系辦旁邊的櫃子', 4)
    paper(im, m(1.43), m(0.07), m(0.20), m(0.15), (214, 238, 214), '讀書會招人', (40, 90, 50), '民法總則　每週二晚上', 3, hand=True)
    paper(im, m(1.67), m(0.04), m(0.27), m(0.36), (236, 244, 252), '法律服務社', (30, 70, 140), '招募新社員　免費法律諮詢', 9)
    paper(im, m(0.06), m(0.42), m(0.21), m(0.30), (252, 252, 250), '二手書轉讓', (40, 40, 50), '民總、刑總、憲法　便宜賣', 6, tabs=True)
    paper(im, m(0.32), m(0.50), m(0.22), m(0.16), (255, 255, 255), '失物招領', (40, 40, 50), '黑色螢光筆一支', 3, hand=True)
    paper(im, m(1.16), m(0.30), m(0.30), m(0.22), (252, 226, 230), '迎新茶會', (170, 50, 80), '系學會　大一新生請來', 5)
    paper(im, m(1.52), m(0.48), m(0.24), m(0.18), (250, 249, 244), '系辦公告', (40, 40, 50), '學期成績單　請到系辦領取', 4)
    paper(im, m(1.80), m(0.50), m(0.16), m(0.22), (255, 244, 214), '宿舍', (120, 80, 20), '洗衣機故障', 4, hand=True)
    paper(im, m(0.62), m(0.50), m(0.44), m(0.22), (238, 240, 250), '社團博覽會', (60, 60, 140), '椰影大道　下週三起三天', 5)
    # 下面那一條：兩張徵才單（另外的節點；軟木板上那兩格空著）
    for key, (title, sub) in (('cram', ('徵工讀生', '法科補習班・改考卷、櫃台')), ('office', ('誠徵實習生', '律師事務所・法律系大三以上'))):
        x, y, w, h = JOB_SLOT[key]; paper(im, x, y, w, h, (252, 252, 248), title, (30, 40, 70), sub, 9, rr=random.Random(len(key)))
        foot = '有意者請來電' if key == 'cram' else '請寄履歷'; d = ImageDraw.Draw(im); fw = d.textlength(foot, font=F(12)); d.text((x + (w - fw) / 2, y + h - 22), foot, font=F(12), fill=(170, 40, 40))
    os.makedirs(os.path.dirname(OUT), exist_ok=True); im.save(OUT); print('wrote', os.path.relpath(OUT, ROOT), im.size)


if __name__ == '__main__':
    main()
