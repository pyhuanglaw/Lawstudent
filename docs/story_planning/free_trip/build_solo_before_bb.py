# -*- coding: utf-8 -*-
"""「你來過一次」：BB 的五位（芷若、子晴、學姊、沛珊、可昕）。AB-25，BB-B 2026-10-16。
規則照 AA-B 的 build_solo_before.py（AA_160 4-4、AA_161 第 1 節）：
  - 條件：約會的地點 X 有 G.places.free[X] ≥ 1（自由出行的次數；約會、心願不算）。
  - 時機：她的約會抵達台詞（date_system/lines/X.json 的 arrive.first）說完，旁白（solo_before_aa_v1.json 的 narr[X]）以後，接這裡她的一兩句。
  - 次數：同一個人、同一個地方一次（G.places.soloSaid['<id>:<地點>']，舊存檔預設 {}）。
  - 心願地點的第一次約會是心願事件：沛珊 D06、可昕 D25 不放在這裡，改在 date_system/wish/wish_bb.py 的 arrive.extraIf（freeVisited）。
    芷若 D05、子晴 D03、學姊 D15 的心願地點不在這九個裡，不用處理。
  - 不讀 ENC_（R7）；沒有數值、沒有選項。
旁白沿用 AA 的 narr（同一個地方同一句），本檔只有她們的台詞。
用法：python3 build_solo_before_bb.py → solo_before_bb_v1.json；--check 只檢查。"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SPOTS = {}
for f in ('spots_v1.json', 'spots_v2.json'):
    for s in json.load(open(os.path.join(HERE, f), encoding='utf-8'))['spots']: SPOTS[s['id']] = s
PLACES = ['D04', 'D06', 'D12', 'D13', 'D09', 'D18', 'D20', 'D24', 'D25']
WISH = {'classmate_peishan': 'D06', 'kexin': 'D25'}   # 心願地點：用 wish_bb 的 extraIf
BAN = ['不要跟別人講', '不要跟別人說', '你是第一個', '我請你', '我可以問一個奇怪的問題嗎', '兩張票', '存檔', '脖子還是很短', '香菜', '剛好坐兩個人',
       '我不是質疑', '這句是稱讚', '你來剛好', '你來得剛好']   # 後四個：BB_124 7-2、BB_150 已經用過的說法

HER = {
    'heroine_02': {   # 芷若：電影的眼睛、安靜；一個人看電影的人
        'D04': ['你一個人來看過？……哪一部？', '一個人看的電影，記得比較久。我也是。'],
        'D06': ['你來過。那你一定有一幅，停了很久。', '……今天帶我去那一幅前面。'],
        'D12': ['你一個人走過這條街？', '……那你走前面。我想看你會停在哪裡。'],
        'D13': ['你來過淡水。……一個人看夕陽？', '那今天的夕陽算第二次。第二次通常比較好看。'],
        'D09': ['你坐過了？……那你知道哪一段最好看。', '到了那一段，跟我說。我不想錯過。'],
        'D18': ['你一個人來過九份？', '……人那麼多，一個人走，會不會反而很安靜。'],
        'D20': ['你來過。……那條溪，你一個人看了多久？', '今天我陪你再看一次。'],
        'D24': ['你一個人來泡過？……好像很適合你。', '安安靜靜的。今天也可以這樣。'],
        'D25': ['你一個人來看過海？', '……下次帶我的相機來。我教你拍浪。'],
    },
    'heroine_04': {   # 子晴：欸不是、遊戲的比喻；怕被評價
        'D04': ['欸不是，你一個人來看過晚場？', '……好，你是老玩家。今天帶新手。'],
        'D06': ['你一個人來過美術館？', '欸不是，你比我想的還要文青。這不是問句。'],
        'D12': ['你走過了？那你一定找到隱藏商店了。', '……沒有？好，今天一起找。'],
        'D13': ['你一個人來過淡水？……那你上次坐在哪裡？', '我要坐同一個位置。我想知道你看到什麼。'],
        'D09': ['欸不是，你坐過了？那透明地板的車廂呢？', '……沒有？那這次坐那個。我先去排隊。'],
        'D18': ['你一個人來過？……那你已經解鎖地圖了。', '今天你當嚮導，我當玩家。'],
        'D20': ['你來過？……一個人在山裡，不會怕嗎？', '欸不是，我是在問我自己。我會怕。'],
        'D24': ['你一個人來泡腳？', '欸不是，那是單人模式。今天開雙人模式。'],
        'D25': ['你一個人看過這片海？', '……那你一定截圖了。給我看，我要拿來當關卡背景。'],
    },
    'heroine_05': {   # 學姊：一件事、重點是；計畫、照顧人
        'D04': ['你一個人來看過電影？', '一件事：下次看完，講給我聽。我記不住劇情。'],
        'D06': ['你來過。……你一個人看展，會讀說明嗎？', '重點是，今天我們兩個都不讀。'],
        'D12': ['你一個人來過迪化街？', '重點是，你沒有被人潮推著走。我小時候一直被推。'],
        'D13': ['你一個人來過淡水。', '一件事：你那次有看到夕陽嗎？……沒有的話，今天補。'],
        'D09': ['你來過貓空？……比我早。', '我在台大多待了兩年，結果是你先上來。'],
        'D18': ['你一個人來九份？', '一件事：下次這種事，可以問我一聲。我會說好。'],
        'D20': ['你一個人來過烏來？', '……重點是，你有放自己一天假。很好。'],
        'D24': ['你一個人來泡過？……很好。', '重點是，你知道累了要去哪裡。我現在才知道。'],
        'D25': ['你來過外澳？一個人？', '一件事：今天換我跟著你走。我不看地圖。'],
    },
    'classmate_peishan': {   # 沛珊：認真發問、觀察；以前只去考場
        'D04': ['你一個人看過電影？', '……一個人看，和兩個人看，哪一個比較好？'],
        'D12': ['你一個人來過？', '……那你上次，有沒有走進那些老房子裡面？我想進去看。'],
        'D13': ['你來過淡水？……你一個人的時候，都在想什麼？', '我一個人的時候，都在想考試。所以我想知道別人的。'],
        'D09': ['你坐過纜車了？……一個人坐的？', '一個人坐，車廂會不會太大？'],
        'D18': ['你一個人來過？……那你上次，從哪個轉角看海？', '我想站在同一個地方。'],
        'D20': ['你來過烏來？……一個人？', '那你上次聽到的溪聲，跟今天一樣大嗎？'],
        'D24': ['你一個人來過宜蘭？……原來你比我先來。', '那今天你教我，泡腳要泡多久。'],
        'D25': ['你看過這片海了？一個人？', '……是什麼感覺？我想先聽你說，再自己看。'],
    },
    'kexin': {   # 可昕：假設、這是告知；政大後山、不服輸
        'D04': ['你一個人來過西門町？', '假設那天我也在，我們可能擦肩而過。……好可惜。'],
        'D06': ['你一個人看過展？假設你看了那個講規則的展——', '……不准劇透。這是告知。'],
        'D12': ['你來過迪化街？那你知道往河走。', '……好，今天不靠河。靠你。'],
        'D13': ['你一個人來過淡水？假設你上次許了一個願——', '……不用說。我猜得到一半。'],
        'D09': ['你來過我們學校的後山？……一個人？', '那你是偷渡。好，今天補辦簽證。'],
        'D18': ['你一個人爬過那些階梯？', '……我們學校的階梯比較多。我不是在比。我是在比。'],
        'D20': ['你來過烏來？一個人坐了多久的車？', '……我只是想知道。從你們學校，真的比較遠。'],
        'D24': ['你一個人來泡過腳？假設你上次先泡、後吃——', '……你看，我就知道。今天照我的順序。'],
    },
}


def arrive_first(spot, who):
    p = os.path.join(HERE, '..', 'date_system', 'lines', spot + '.json')
    d = json.load(open(p, encoding='utf-8'))
    f = (d['lines'].get(who) or {}).get('arrive', {}).get('first', {})
    return [x['text'] for x in f.get('lines', [])]


def check():
    errs = []
    seen = {}
    for who, m in HER.items():
        for k, ls in m.items():
            if k not in SPOTS: errs.append(f'{who} {k} 不是景點')
            if k not in PLACES: errs.append(f'{who} {k} 不在九個地點裡')
            if WISH.get(who) == k: errs.append(f'{who} {k} 是心願地點，改用 wish_bb 的 extraIf')
            if not (1 <= len(ls) <= 2): errs.append(f'{who} {k} 要一兩句')
            first = arrive_first(k, who)
            if not first: errs.append(f'{who} {k} 沒有約會抵達台詞（arrive.first）')
            for t in ls:
                if len(t) > 40: errs.append(f'{who} {k} {len(t)} 字：{t}')
                for b in BAN:
                    if b in t: errs.append(f'{who} {k} 用了「{b}」：{t}')
                if t in first: errs.append(f'{who} {k} 和抵達台詞重複：{t}')
                if t in seen: errs.append(f'重複：{t}（{seen[t]}、{who} {k}）')
                seen[t] = f'{who} {k}'
        for k in PLACES:
            if k not in m and WISH.get(who) != k: errs.append(f'{who} 缺 {k}')
    return errs


if __name__ == '__main__':
    errs = check()
    for e in errs: print('ERR', e)
    if errs: sys.exit(1)
    out = {'source': 'AB-25（AA_160 4-4、AA_161 第 1 節）；BB-B 2026-10-16', 'status': 'READY_FOR_INTEGRATION（第②級日常內容；AA-B 核對）',
           'rules': {'if': 'G.places.free[地點] ≥ 1（自由出行的次數；約會、心願不算）', 'when': '她的約會抵達台詞（arrive.first）→ 旁白（solo_before_aa_v1.json 的 narr）→ 本檔',
                     'once': '同一個人、同一個地方一次（G.places.soloSaid["<id>:<地點>"]，舊存檔預設 {}）',
                     'wish': '沛珊 D06、可昕 D25 是心願地點：改在 wish_bb 的 arrive.extraIf（freeVisited）', 'r7': '不讀 ENC_', 'values': '沒有數值、沒有選項',
                     'narr': '沿用 solo_before_aa_v1.json 的 narr'},
           'lines': {who: {k: [{'who': who, 'text': t} for t in ls] for k, ls in m.items()} for who, m in HER.items()}}
    if '--check' not in sys.argv:
        with open(os.path.join(HERE, 'solo_before_bb_v1.json'), 'w', encoding='utf-8') as f: json.dump(out, f, ensure_ascii=False, indent=1)
    print('ok', {w: len(m) for w, m in HER.items()})
