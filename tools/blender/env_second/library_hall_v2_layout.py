"""總圖大廳第二版的配置（LIB-INTERIOR-1102 一樓，LAWWW2 帳號 A 2026-11-02）：純 Python，不需要 Blender。
  python3 tools/blender/env_second/library_hall_v2_layout.py --base <有 src/data/library_layout.js 的 repo> [--write <repo>]
  --write 寫回 <repo>/src/data/library_layout.js（遊戲 src/library3d.js 和 Blender tools/blender/env_second/library_hall_v2.py 讀同一份）。

依據（使用者 11-02）：
  - 08:58「舊有的空間配置 能用的就沿用 按造實際配置安排」＋總圖 1F 平面圖：入口門禁管制口 → 總服務台（正對入口）→ 中央的大階梯（往北上二樓）→
    北邊半圓形的「展演廳」；西側多元共享區＋閱報區、東側數位媒體區；入口兩旁的樓梯、電梯、辦公室。
  - 09:01「總圖一樓」兩張照片：
    1. 中庭：深灰地毯的走道（兩旁木頭展示櫃，櫃裡亮燈）→ 一整片木頭的「台階書牆」（坐的大階梯＋中間走的樓梯，階梯的立面是書架）往上到二樓，
       兩側二樓迴廊（玻璃欄杆）、上面方格天花板＋崁燈；照片是從二樓入口上方的連廊往北拍的。
    2. 展演廳：半圓形、挑高兩層，下面一圈高窗、上面一圈高側窗，淺色木地板、深灰石材牆裙、白牆，一座弧形的矮展示櫃，吊著一圈弧形的軌道燈。
沿用第一版（v1，總圖第一階段 D43）：x −12～12 的大廳南半邊整個不動——門廳、閘門、入口出生點、出口、電梯（x 9.4～11.4）、B1 樓梯間的門（西牆 z −2.4）、
  二樓西翼的長桌（小安「總圖的下午」坐的 seats[0]／[1]）、二樓東側往 3F 的樓梯間、研究小間的門、多媒體中心的門、館員辦公室、影印機（芯慈的劇情）。
改的：
  - 大廳往北加深 8 m（北牆 z −9 → −17）；第一版的帝國式大樓梯（中間一跑上平台、兩側兩跑折返）換成照片的台階書牆：
    x −3.6～3.6、z −6.0（最下面一階，南端）～ −14.4（最上面，北端），中間 x ±0.9 是走的樓梯（28 階、一階 17.9 cm、深 30 cm），
    兩側是坐的大階梯（12 階、一階 41.7 cm、深 70 cm；立面是書架）。最上面接二樓北側的連廊（z −14.4～−16.9）。
  - 北牆中間開口（x −3.2～3.2）進展演廳：半圓、圓心 (0, −17)、半徑 5.4，挑高到屋頂 9.6；二樓北側連廊靠展演廳那邊是玻璃欄杆。
  - 一樓新的北半邊：西側多元共享區（四人桌、矮隔屏）、東側數位媒體區（電腦桌、視聽座位），階梯兩旁的展示櫃、閱報架。
  - 二樓：西翼往北延長（多兩張長桌）；東側往北是一條走道（x 3.7～5.2）接北側連廊，多媒體中心（x 5.2～11.9、z −16.9～−8.9，整修中、關著）。
座標、單位、樓層和第一版一樣：x 往東、z 往南（+z 是入口）、y 往上；1F y＝0、2F y＝5.0。
這是遊戲化的配置（照片和平面圖的相對位置與氣氛，不是實測尺寸）。
"""
import json, math, os, sys

V2_NOTE = ('總圖大廳第二版（LIB-INTERIOR-1102，LAWWW2 2026-11-02）：使用者 11-02 的 1F 平面圖＋兩張一樓照片（台階書牆、半圓形展演廳）；'
           '南半邊（門廳、閘門、電梯、B1 門、二樓西翼長桌、3F 樓梯間）沿用第一版。產生：tools/blender/env_second/library_hall_v2_layout.py，不要手改。')


def load_js(path):
    s = open(path, encoding='utf-8').read()
    return json.loads(s[s.index('{'):s.rindex('}') + 1])


def build(v1):
    L = json.loads(json.dumps(v1))          # 深拷貝
    L['version'] = 2
    L['note'] = V2_NOTE
    L['bounds'] = {'x0': -12.0, 'x1': 12.0, 'z0': -17.0, 'z1': 9.0}          # 大廳本身（長方形）；展演廳在北牆外
    L['navBox'] = {'x0': -13.0, 'x1': 13.0, 'z0': -23.6, 'z1': 10.0}         # 導航格的範圍（含展演廳）；格線和第一版對齊（z 原點 −10 往北 0.4 的整數倍：格子中心一樣，南半邊家具擋到的格子和第一版一模一樣）
    # 第一版的帝國式大樓梯 stair、核心 core 留著不刪：第二版不用它們（src/library_hall_v2.js），但沒載到 library_hall_v2.js 的舊程式／測試讀到也不會出錯
    L['bookstair'] = {'x0': -3.6, 'x1': 3.6, 'z0': -14.4, 'z1': -6.0, 'low': 'z1',
                      'walk': {'x0': -0.9, 'x1': 0.9, 'risers': 28, 'rise': 5.0 / 28, 'tread': 0.3},
                      'seats': {'risers': 12, 'rise': 5.0 / 12, 'tread': 0.7},
                      'note': '台階書牆：中間走的樓梯兩層共用（導航 addSurf），兩側坐的大階梯擋住（一階 42 cm 走不上去）'}
    L['rotunda'] = {'cx': 0.0, 'cz': -17.0, 'r': 5.4, 'open': {'x0': -3.2, 'x1': 3.2}, 'h': L['roofY'],
                    'note': '展演廳：半圓形、挑高到屋頂；一樓從北牆中間的開口進去，二樓北側連廊的玻璃欄杆看下去'}
    U = L['upper']
    U['north'] = {'x0': -5.2, 'x1': 5.2, 'z0': -16.9, 'z1': -14.4}
    U['wings'] = [{'x0': -11.9, 'x1': -3.7, 'z0': -16.9, 'z1': -0.6}, {'x0': -11.9, 'x1': -5.2, 'z0': -0.6, 'z1': 8.9},
                  {'x0': 3.7, 'x1': 5.2, 'z0': -16.9, 'z1': -8.9}, {'x0': 3.7, 'x1': 11.9, 'z0': -8.9, 'z1': -0.6},
                  {'x0': 5.2, 'x1': 11.9, 'z0': -0.6, 'z1': 8.9}]
    U['closed'] = [{'x0': 5.2, 'x1': 11.9, 'z0': -16.9, 'z1': -8.9, 'name': '多媒體中心（整修中）'}]
    # 二樓的玻璃欄杆（中庭、台階上方的挑空，展演廳的挑空）：[x0, z0, x1, z1]
    L['rails'] = [[-3.7, -14.4, -3.7, -0.6], [3.7, -14.4, 3.7, -0.6],          # 台階兩側的挑空
                  [-3.7, -0.6, -0.95, -0.6], [0.95, -0.6, 3.7, -0.6],          # 南側連廊的北邊（中間留一段看樓梯：一樣有欄杆）
                  [-0.95, -0.6, 0.95, -0.6],
                  [-5.2, 1.4, 5.2, 1.4], [-5.2, 1.4, -5.2, 8.9], [5.2, 1.4, 5.2, 8.9],   # 南側連廊的南邊、兩翼靠入口挑空那一邊（第一版就有）
                  [-3.2, -16.9, 3.2, -16.9]]                                  # 北側連廊靠展演廳那一邊
    # 家具：第一版的，扣掉帝國式樓梯兩側的書架牆（coreShelf），北牆附近的搬到新的北牆
    keep = []
    for f in L['furniture']:
        if f['type'] == 'coreShelf':
            continue
        f = dict(f)
        if f['type'] == 'prop' and f.get('kind') == 'extinguisher':
            if f['lv'] == 0:
                f.update({'x': 6.5, 'z': -16.65, 'nav': [6.5, -16.7, 0.4, 0.4]})
            else:
                f.update({'x': -10.8, 'z': -16.65})
        keep.append(f)
    new = []
    # 一樓：中庭走道兩旁的展示櫃（照片 1：木頭、玻璃、櫃裡亮燈）
    for sx in (-1, 1):
        new.append({'type': 'prop', 'kind': 'displayCase', 'lv': 0, 'x': sx * 3.05, 'z': -2.9, 'w': 0.7, 'd': 3.4, 'h': 1.05, 'nav': [sx * 3.05, -2.9, 0.8, 3.5]})   # 北端 z −4.6：離台階最下面一階（−6.0）1.4 m，繞過去不會卡
    # 一樓西側北半邊：多元共享區（四人桌＋矮隔屏）、閱報架
    for (x, z) in ((-9.4, -10.2), (-6.4, -10.2), (-9.4, -14.8), (-6.4, -14.8)):   # 椅子後面要走得到：離隔屏、北牆都留 0.6 m 以上
        new.append({'type': 'groupTable', 'lv': 0, 'x': x, 'z': z, 'w': 1.6, 'd': 1.0, 'seats': 4})
    new.append({'type': 'prop', 'kind': 'lowScreen', 'lv': 0, 'x': -7.9, 'z': -12.5, 'w': 4.6, 'd': 0.08, 'h': 1.3, 'nav': [-7.9, -12.5, 4.6, 0.4]})   # 導航 0.4 厚（＋道具的 0.05 邊）：剛好擋一排格子（0.4 m 一格，看格子中心）；0.5 會擋兩排，四人桌靠隔屏那一側的椅子後面站不住
    new.append({'type': 'prop', 'kind': 'newsRack', 'lv': 0, 'x': -11.6, 'z': -12.5, 'w': 0.5, 'd': 3.0, 'h': 1.6, 'ry': 1.5708, 'nav': [-11.55, -12.5, 0.6, 3.1]})
    # 一樓東側北半邊：數位媒體區（電腦桌兩排、視聽座位）
    for z in (-10.0, -12.6, -15.2):   # 一排一排隔 2.6 m：椅子後面要站得住（離後一排的桌子 ≥ 0.6 m）
        new.append({'type': 'pcDesk', 'lv': 0, 'x': 8.4, 'z': z, 'w': 4.8, 'd': 0.75, 'seats': 4})
    new.append({'type': 'prop', 'kind': 'mediaShelf', 'lv': 0, 'x': 11.6, 'z': -12.6, 'w': 0.45, 'd': 4.6, 'h': 1.8, 'ry': -1.5708, 'nav': [11.6, -12.6, 0.55, 4.7]})
    # 一樓北側（台階後面、展演廳前）：平面圖畫了六張小圓桌；台階最上面到北牆只有 2.6 m、兩旁還有柱子，放了椅子走不過去——這一版不放（roundTable 型別留著）
    # 展演廳：弧形矮展示櫃（照片 2）、兩張長椅
    # 弧形展示櫃（照片 2）：圓心 (0,−17)、半徑 3.0～3.7、北邊 60°～120°（0°＝東、90°＝北）；導航用三段外接長方形擋（後面到弧牆還有 1.3 m 走得過去，不會留窄縫）
    R_ = L['rotunda']; cs = {'r0': 3.0, 'r1': 3.7, 'a0': 60, 'a1': 120}; R_['case'] = cs
    for k in range(3):
        aa = [math.radians(cs['a0'] + (cs['a1'] - cs['a0']) * (k + t / 4) / 3) for t in range(5)]
        pts = [(R_['cx'] + r * math.cos(a), R_['cz'] - r * math.sin(a)) for a in aa for r in (cs['r0'], cs['r1'])]
        x0, x1 = min(p[0] for p in pts), max(p[0] for p in pts); z0, z1 = min(p[1] for p in pts), max(p[1] for p in pts)
        new.append({'type': 'prop', 'kind': 'curveCase', 'lv': 0, 'x': round((x0 + x1) / 2, 3), 'z': round((z0 + z1) / 2, 3), 'w': round(x1 - x0, 3), 'd': round(z1 - z0, 3), 'h': 1.0,
                    'nav': [round((x0 + x1) / 2, 3), round((z0 + z1) / 2, 3), round(x1 - x0 + 0.1, 3), round(z1 - z0 + 0.1, 3)]})
    for sx in (-1, 1):
        new.append({'type': 'prop', 'kind': 'benchLow', 'lv': 0, 'x': sx * 2.5, 'z': -17.9, 'w': 1.6, 'd': 0.45, 'h': 0.45, 'nav': [sx * 2.5, -17.9, 1.6, 0.5]})
    # 二樓（使用者 11-02 的二樓平面圖 2F）：西半邊是「人社中日韓文圖書」的書架（平面圖黃色）、靠西牆是閱覽座位；東半邊是「人社西文圖書」（藍色）；
    #   北側是討論室 225、226 和展示區（台階上來的地方）。第一版的長桌（z −6.8、−3.8、3.0、6.6）照舊：靠西牆的閱覽座位，小安「總圖的下午」是 z 3.0 那一張。
    #   書架是雙面的（stack）：w 長、d 深、h 高；cap＝兩端的色板（平面圖的顏色）；label＝端板上的索書號（遊戲畫的字，見 signs）
    #   西半邊三排：東端都離北側連廊那根柱子 (−5.2,−14.4) 和中庭欄杆遠一點（第一次排到 x −5.4，從北側連廊進西翼的路被柱子和書架夾成 0.7 m，走不過去）；
    #   最北那一排短一點，留北牆前 1.4 m 的走道給討論室的門
    for i, (x, z, w) in enumerate(((-9.0, -15.2, 4.0), (-8.8, -12.4, 4.4), (-8.8, -10.2, 4.4))):
        new.append({'type': 'stack', 'lv': 1, 'x': x, 'z': z, 'w': w, 'd': 0.62, 'h': 2.1, 'cap': '#e8b923', 'label': ('000–299', '300–699', '700–999')[i]})
    for i, z in enumerate((-6.9, -4.7)):
        new.append({'type': 'stack', 'lv': 1, 'x': 6.6, 'z': z, 'w': 3.8, 'd': 0.62, 'h': 2.1, 'cap': '#3a7ca5', 'label': ('A–H', 'J–Z')[i]})
    for sx in (-1, 1):   # 展示區：台階上來兩邊、北牆上的展板（貼牆，不佔走道：北側連廊只有 2.5 m 深，立在地上的展板會把連廊到兩翼的路擠到柱子和欄杆中間，走不過去）
        new.append({'type': 'prop', 'kind': 'exhibit', 'lv': 1, 'x': sx * 4.2, 'z': -16.84, 'w': 1.4, 'd': 0.05, 'h': 1.6, 'nav': [sx * 4.2, -16.84, 1.4, 0.1]})
    L['furniture'] = keep + new
    # 討論室 225、226（二樓北牆，關著：和研究小間一樣要預約）
    L['doors'] = [d for d in L['doors'] if d['id'] not in ('disc225', 'disc226')] + [
        {'id': 'disc225', 'lv': 1, 'x': -9.4, 'z': -16.85, 'ry': 0, 'label': '討論室 225', 'closed': '討論室 225。門上貼著「請上網預約，憑學生證開門」，今天的時段都被借走了。'},
        {'id': 'disc226', 'lv': 1, 'x': -6.6, 'z': -16.85, 'ry': 0, 'label': '討論室 226', 'closed': '討論室 226。玻璃門裡面有四個人在白板前面討論，門上寫著「使用中」。'}]
    # 招牌、指示
    signs = [s for s in L['signs'] if not (s['lv'] == 1 and s.get('z', 0) < -8.5)]
    signs += [{'lv': 1, 'text': '3F 閱覽區　東側樓梯間 →', 'x': 7.0, 'z': -8.82, 'y': 2.9, 'ry': 0, 'w': 3.0},
              {'lv': 0, 'text': '展演廳', 'x': 0.0, 'z': -16.88, 'y': 4.15, 'ry': 0, 'w': 2.0},
              {'lv': 0, 'text': '多元共享區', 'x': -7.9, 'z': -16.88, 'y': 2.9, 'ry': 0, 'w': 2.6},
              {'lv': 0, 'text': '數位媒體區', 'x': 8.4, 'z': -16.88, 'y': 2.9, 'ry': 0, 'w': 2.6},
              {'lv': 1, 'text': '人社中日韓文圖書', 'x': -6.56, 'z': -12.4, 'y': 2.42, 'ry': 1.5708, 'w': 1.9},
              {'lv': 1, 'text': '人社西文圖書', 'x': 4.66, 'z': -5.8, 'y': 2.42, 'ry': -1.5708, 'w': 1.6},
              {'lv': 1, 'text': '展示區', 'x': 0.0, 'z': -16.84, 'y': 3.2, 'ry': 0, 'w': 1.6}]
    for f in [g for g in new if g['type'] == 'stack']:   # 書架端板上的索書號（朝主要走道那一端：西半邊朝東、東半邊朝西）
        e = 1 if f['x'] < 0 else -1
        signs.append({'lv': 1, 'text': f['label'], 'x': round(f['x'] + e * (f['w'] / 2 + 0.035), 3), 'z': f['z'], 'y': 1.72, 'ry': e * 1.5708, 'w': 0.52})
    L['signs'] = signs
    # 窗：西、東外牆（每 2.4 m 一扇；北段新加），展演廳的窗角度（度，0＝正北）
    L['windowsV2'] = {'xWallZ': [round(-15.6 + 2.4 * k, 2) for k in range(11)], 'rotundaDeg': [-72, -36, 0, 36, 72]}   # 展演廳的窗：弧牆 15 段（一段 12°）的第 1、4、7、10、13 段（library_hall_v2.py）
    L['directory'] = {'x': -3.6, 'z': 0.0, 'note': '樓層簡介立牌：入口閘門後面、西側展示櫃前面，面朝南（門口）；第一版掛在核心書架上 (−3.2, −0.48)。字是遊戲畫的 canvas，架子在正式模型、備用模型各一份'}
    L['furnitureNote'] = 'v2 新的型別：groupTable（一樓四人桌）、pcDesk（電腦桌）、roundTable（圓桌）、stack（二樓雙面書架）——src/library_hall_v2.js 處理；prop 的 kind 只影響 Blender 畫什麼'
    return L


def write_js(L, repo):
    p = os.path.join(repo, 'src', 'data', 'library_layout.js')
    old = open(p, encoding='utf-8').read()
    head = old[:old.index('const LIBRARY_LAYOUT')]
    head = head.rstrip() + '\n/* v2（LIB-INTERIOR-1102）：由 tools/blender/env_second/library_hall_v2_layout.py 產生（沿用上面第一版的說明；第二版改了什麼看那支腳本的開頭）*/\n'
    open(p, 'w', encoding='utf-8').write(head + 'const LIBRARY_LAYOUT=' + json.dumps(L, ensure_ascii=False, indent=2) + ';\n')
    return p


if __name__ == '__main__':
    A = sys.argv[1:]
    base = A[A.index('--base') + 1] if '--base' in A else '.'
    v1 = load_js(os.path.join(base, 'src', 'data', 'library_layout.js'))
    if v1.get('version') == 2:
        sys.exit('base 已經是第二版：請給第一版的 library_layout.js（開發分支）')
    L = build(v1)
    if '--write' in A:
        print('寫', write_js(L, A[A.index('--write') + 1]))
    if '--json' in A:
        json.dump(L, open(A[A.index('--json') + 1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps({'furniture': len(L['furniture']), 'signs': len(L['signs']), 'bookstair': L['bookstair']['z0'], 'rotunda': L['rotunda']['r']}, ensure_ascii=False))
