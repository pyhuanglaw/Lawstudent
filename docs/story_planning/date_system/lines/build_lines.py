# -*- coding: utf-8 -*-
"""約會反應台詞（BB_128 2-7、2-9 的 DATE_LINES／DATE_LIKES）：每個地點一個 <LOC>.py → <LOC>.json＋檢查。作者：BB-B 2026-10-15。
用法：python3 build_lines.py D01 [D09 …]
檢查：七位都有；每個互動點都有 first、normal≥3、remember、dating≥1；每一行 ≤40 字；選項 ≤20 字、最多 2 個；不用的句型（BB_128 2-7）；真實店名（D77）。"""
import json, sys, importlib.util, os
HERE=os.path.dirname(os.path.abspath(__file__))
SEVEN=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin']
BAN=['大家都只問','謝謝你沒有','不要跟別人講','你不用那個表情','我可以問一個奇怪的問題嗎']
# D77（使用者 2026-10-16）：真實店名、品牌改諧音或替代名；地點（園區、老街、景點、車站、市場、夜市）照原名。台詞裡出現就擋下來（清單隨時補）
BRANDS=['麥當勞','摩斯','星巴克','7-11','7-ELEVEN','統一超商','全家便利','萊爾富','肯德基','必勝客','誠品','光點','三創','路易莎','50嵐','五十嵐','迷客夏','鼎泰豐','春水堂','85度C','阿柑姨','賴阿婆','阿妹茶樓','好樂迪','錢櫃','UNIQLO','IKEA','家樂福','全聯']
def conv(st, who):
    if isinstance(st, dict):   # 帶條件的一套：{'tier','lines','if'?,'unless'?}（EVENTS.cond 的格式）
        o = conv((st['tier'], st['lines']) + ((st['choice'],) if st.get('choice') else ()), who)
        for k in ('if', 'unless'):
            if st.get(k): o[k] = st[k]
        return o
    tier, lines = st[0], st[1]
    out = {'tier': tier, 'lines': [({'who':'narr','text':l[1:]} if l.startswith('＊') else {'who':who,'text':l}) for l in lines]}
    if len(st) > 2: out['choice'] = [{'t':t,'reply':[{'who':who,'text':r} for r in rs]} for t,rs in st[2]]
    return out
def build(loc):
    spec=importlib.util.spec_from_file_location(loc, os.path.join(HERE, loc+'.py')); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    err=[]; out={'loc':loc,'points':m.POINTS,'likes':{},'dislikeLine':{},'lines':{}}
    for who in SEVEN:
        h=m.H.get(who)
        if not h: err.append(f'{loc} 缺 {who}'); continue
        out['likes'][who]=h['likes']; out['dislikeLine'][who]=h.get('dislike_line',{})
        for p,v in h['likes'].items():
            if v=='dislike' and p not in h.get('dislike_line',{}): err.append(f'{loc} {who} {p} 不太喜歡卻沒有那一句')
        L={'arrive':{'first':(conv(h['arrive']['first'],who) if h['arrive']['first'] else {'wishEvent':h.get('wish_first')}),'normal':[conv(x,who) for x in h['arrive']['normal']],'dating':[conv(x,who) for x in h['arrive']['dating']]},
           'closing':{'first':(conv(h['close']['first'],who) if h['close']['first'] else {'wishEvent':h.get('wish_first')}),'normal':[conv(x,who) for x in h['close']['normal']],'dating':[conv(x,who) for x in h['close']['dating']]},'hotspots':{}}
        for p in m.POINTS:
            q=h['points'].get(p)
            if not q: err.append(f'{loc} {who} 缺 {p}'); continue
            if len(q['normal'])<3: err.append(f'{loc} {who} {p} 普通不到 3 套')
            L['hotspots'][p]={'first':(conv(q['first'],who) if q['first'] else {'wishEvent':h.get('wish_first')}),'normal':[conv(x,who) for x in q['normal']],'remember':conv(q['remember'],who),'dating':[conv(x,who) for x in q['dating']]}
        out['lines'][who]=L
    txt=json.dumps(out,ensure_ascii=False)
    for b in BAN:
        if b in txt: err.append(f'{loc} 用了不用的句型：{b}')
    for b in BRANDS:
        if b in txt: err.append(f'{loc} 台詞有真實店名或品牌（D77，改諧音或通稱）：{b}')
    def walk(o):
        if isinstance(o,dict):
            if 'text' in o and len(o['text'])>40: err.append(f"{loc} 太長：{o['text']}")
            if 't' in o and isinstance(o['t'],str) and len(o['t'])>20: err.append(f"{loc} 選項太長：{o['t']}")
            if 'choice' in o and len(o['choice'])>2: err.append(f'{loc} 選項超過 2')
            for v in o.values(): walk(v)
        elif isinstance(o,list):
            for v in o: walk(v)
    walk(out)
    if err: sys.exit('\n'.join(err))
    json.dump(out,open(os.path.join(HERE,loc+'.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
    n=sum(1 for _ in txt.split('"text"'))-1
    print(f'{loc} ok：七位，{n} 行台詞')
for loc in sys.argv[1:]: build(loc)
