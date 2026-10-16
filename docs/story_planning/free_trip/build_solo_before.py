# -*- coding: utf-8 -*-
"""「你來過一次」：玩家自己（自由出行）去過一個地方，之後和她約會第一次去那裡時，多一句旁白和她的一句（AA_160 4-4、AA_161 第 1 節）。
規則（AA-B 2026-10-16 定）：
  - 條件：約會的地點 X 有 G.places.free[X] ≥ 1（自由出行的次數；約會、心願不算）。
  - 時機：約會抵達的台詞（date_system/lines/X.json 的 arrive）說完以後。
  - 次數：同一個人、同一個地方一次（記在 G.places.soloSaid，例如 'heroine_01:D04'；舊存檔預設 {}）。
  - 心願地點的第一次約會就是心願事件：那一次不用本檔，改用心願事件裡的 arrive.extraIf（語彤 D13：date_system/wish/wish_aa.py）。
  - 不讀 ENC_（偶遇的記憶），只看 G.places.free（AA_160 R7）。
  - 沒有數值、沒有選項；只是讓玩家感覺「這個地方我來過」。
人物：本檔是 AA 的以安、語彤（AA 的其他人物不約會）＋每個地方的旁白；BB 的人物（芷若、子晴、學姊、沛珊、可昕）由 BB-B 補在同一個格式的 bb 檔。
用法：python3 build_solo_before.py → solo_before_aa_v1.json；--check 只檢查。"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SPOTS = {}
for f in ('spots_v1.json', 'spots_v2.json'):
    for s in json.load(open(os.path.join(HERE, f), encoding='utf-8'))['spots']: SPOTS[s['id']] = s
WISH = {'heroine_03': 'D13'}   # 心願地點：第一次約會是心願事件，用 wish_aa 的 extraIf

NARR = {   # 旁白：上一次一個人來的時候（呼應 AA_161 的抵達、離開、交通）
    'D04': '你來過一次。上次是一個人，從六號出口走出來。',
    'D06': '你來過一次。那時候一個人，走進來，外面的聲音就不見了。',
    'D12': '你來過一次。上次回去的捷運上，身上有一點茶的味道。',
    'D13': '你來過一次。上次回程差點睡過頭，在中正紀念堂醒來。',
    'D09': '你來過一次。上次纜車往上的時候，你一直看著動物園。',
    'D18': '你來過一次。上次在客運上晃了一個多小時。',
    'D20': '你來過一次。上次下了公車，空氣一下子變涼了。',
    'D24': '你來過一次。上次國道客運開了一個多小時，你睡了一半。',
    'D25': '你來過一次。上次火車開到海邊，窗外一下子全是藍色。',
}

HER = {   # 她的一兩句（接在她自己的抵達台詞後面，見 date_system/lines/<地點>.json 的 arrive.first）
    'heroine_01': {   # 以安：什麼都先查；今天說好少查一點
        'D04': ['你來過？……好。那電影院你帶路。我只記得出口。'],
        'D06': ['你來過？……好。那三個展，你選一個。', '理由：我今天少查一點。'],
        'D12': ['你來過？那些老房子，你看了幾間？', '……好，我不考你。'],
        'D13': ['你來過？那你知道日落要站哪裡。', '我查的是時間。你知道的是位置。'],
        'D09': ['你坐過？……那二十分鐘，我就不用一直看手錶了。'],
        'D18': ['你來過？那芋圓吃哪一家，你決定。這個我不查。'],
        'D20': ['你來過？……一個小時，從城市到山裡。', '你也記下來了嗎。'],
        'D24': ['你來過？……那泡腳池免費，你也知道了。', '好。今天我負責聽。'],
        'D25': ['你來過？……那火車那一個半小時，你都在看什麼？', '好。今天我也看那個。'],
    },
    'heroine_03': {   # 語彤：話少；阿姨；拍照
        'D04': ['……你來過。', '那電影你選。我不會選。'],
        'D06': ['……你一個人來的時候，看了哪一間？', '帶我去那一間。'],
        'D12': ['……你也來過。', '阿姨說，來過一次的人，第二次會走得比較慢。'],
        'D09': ['……阿姨來過，你也來過。', '只有我沒來過。'],
        'D18': ['……你來過。', '那你知道，哪一條巷子人比較少。'],
        'D20': ['……你上次，有坐台車嗎？', '那今天坐。'],
        'D24': ['……你來過。', '下次，帶阿姨來。她說她腳很痠。'],
        'D25': ['……你來過。', '那你告訴我，浪什麼時候最大。'],
    },
}


def check():
    errs = []
    for k, t in NARR.items():
        if k not in SPOTS: errs.append(f'旁白 {k} 不是景點')
        if len(t) > 40: errs.append(f'旁白 {k} {len(t)} 字')
    for who, m in HER.items():
        for k, ls in m.items():
            if k not in SPOTS: errs.append(f'{who} {k} 不是景點')
            if WISH.get(who) == k: errs.append(f'{who} {k} 是心願地點，改用 wish_aa 的 extraIf')
            for t in ls:
                if len(t) > 40: errs.append(f'{who} {k} {len(t)} 字：{t}')
                if who == 'heroine_03' and '兩個人' in t: errs.append(f'語彤不用「兩個人」：{t}')
            if not os.path.exists(os.path.join(HERE, '..', 'date_system', 'lines', k + '.json')): errs.append(f'{k} 沒有約會台詞檔')
    missing = set(SPOTS) - set(NARR)
    if missing: errs.append(f'缺旁白：{sorted(missing)}')
    return errs


if __name__ == '__main__':
    errs = check()
    for e in errs: print('ERR', e)
    if errs: sys.exit(1)
    out = {'source': 'AA_160 4-4、AA_161 第 1 節；AA-B 2026-10-16', 'status': 'READY_FOR_INTEGRATION（第②級日常內容，AA-B 定）',
           'rules': {'if': 'G.places.free[地點] ≥ 1（自由出行的次數；約會、心願不算）', 'when': '約會抵達的台詞說完以後',
                     'once': '同一個人、同一個地方一次（G.places.soloSaid["<id>:<地點>"]，舊存檔預設 {}）',
                     'wish': '心願地點的第一次約會是心願事件：改用 wish_aa／wish_bb 的 arrive.extraIf（freeVisited）', 'r7': '不讀 ENC_', 'values': '沒有數值、沒有選項'},
           'narr': NARR, 'lines': {who: {k: [{'who': who, 'text': t} for t in ls] for k, ls in m.items()} for who, m in HER.items()}}
    if '--check' not in sys.argv:
        with open(os.path.join(HERE, 'solo_before_aa_v1.json'), 'w', encoding='utf-8') as f: json.dump(out, f, ensure_ascii=False, indent=1)
    print('ok', {'narr': len(NARR), **{w: len(m) for w, m in HER.items()}})
