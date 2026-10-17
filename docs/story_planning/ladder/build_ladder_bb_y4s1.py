# -*- coding: utf-8 -*-
"""大四上（Y4S1）的閒聊階梯：沛珊（classmate_peishan）、可昕（kexin）→ ladder_bb_y4s1.json（2026-10-17 BB-C：學姊這學期在美國交換，沒有階梯）。
作者：BB-B 2026-10-16（D81）。原稿說明：../BB_142_閒聊階梯_大四上_學姊沛珊可昕.md。格式同 ladder_bb_y3s2.json，term＝'Y4S1'。
**芷若、子晴這學期沒有階梯**：芷若在英國念電影研究（第二輪明信片，BB_99 3-1）；子晴已經畢業、在工作室上班，只有手機（Q14，BB_99 4-1）。
大四上美國路線的玩家在美國交換（2026-10-17 BB-C，BB_183），3D 遇不到沛珊；可昕只在「我們的日子」推進、這學期沒有 dateOnly，視訊也推進。台灣、日本路線的玩家在台灣（交換延畢的玩家照遊戲學期算，同一份）。
依據 BB_99（大四上）：可昕 重訪日 4（第 1 週）、K21 約讀書真的讀（第 3 週，`KX_STUDY_PLAN`）、中秋（第 5 週）、K23 各自的路（第 7 週）、K22 兩個方向的讀書會（第 11 週）、聖誕（第 17 週）；
沛珊 教育相關科系大二上（P6 公開課是大四下）。
**防卡關**：`if` 只放階段；事件、記憶、旗標的差別放 linesIf／extraIf；週次放寬到第 16 週（2026-10-16 改 16 週制，AA_198）。
**學姊**：碩三上在美國交換（2026-10-17 BB-C），這學期沒有她的階梯。
**不重複事件的台詞**（build 擋）：可昕「我想第一批知道」「判的人」「幫人講話的人」「假設四年後」「今年我認輸」。
用法：python3 build_ladder_bb_y4s1.py → ladder_bb_y4s1.json；--check 只檢查。"""
import json, sys, os
Y='Y4S1'
def st(npc, mn): return {'stage': {'npc': npc, 'min': mn}}
def mem(npc, tag): return {'memory': [{'npc': npc, 'tag': tag}]}
def fl(*f): return {'flags': list(f)}
def route(r): return {'flagIs': {'EXCHANGE_ROUTE': r}}   # 2026-10-17 BB-C（照 AA_234 b7e7d445）：同 y3s1／y4s2 的 route()；美國路線大四上人在美國，可昕的層用 linesIf 換成視訊的說法
def ch(t, reply, rel=None, mem=None):
    c = {'t': t, 'reply': reply}
    if rel: c['rel'] = rel
    if mem: c['mem'] = mem
    return c

SIS='heroine_05'; PS='classmate_peishan'; KX='kexin'
D = {'_comment': __doc__, 'term': Y, 'characters': {}}

# ───────── 溫書瑀（碩三上，在美國交換）─────────
# 2026-10-17 BB-C：學姊碩三上在美國交換（AA_218），這學期沒有她的階梯（原 S6-L1～L8 搬到 Y3S1／Y4S2，BB_195）

# ───────── 郭沛珊（教育相關科系大二上；週末舊路書房；課輔班）─────────
D['characters'][PS] = {'friendOnly': True, 'steps': [
 {'id':'P7-L1','if':st(PS,'ACQUAINTANCE'),
  'lines':['暑假我去山上帶營隊。那裡的小孩寫信給我了。','信上寫：老師，妳帶來的書我們看完了，再寄。……我寄了。'],
  'choices':[ch('「寄了幾本？」','五本。郵費比書貴。……很值得。'),
             ch('「他們會一直寫信來。」','嗯。我希望。我會一直寄。')],'rel':{'fam':2},'mem':'PS7_CAMP_LETTER',
  'note':'大三下 P6-L8（暑假山上的營隊）的後來（2026-10-16 上下文修正：新學期不假設聽過 P6-L8，「那組小孩」「山上的書」改成自己講清楚）'},
 {'id':'P7-L2','if':st(PS,'ACQUAINTANCE'),
  'lines':['這學期修特殊教育。老師說，每個孩子學東西的速度都不一樣。','……我想到我自己。也想到你。'],
  'choices':[ch('「我怎麼了？」','你換過一次路。你知道慢不是錯。',rel={'trust':2}),
             ch('「每個人都不一樣。」','嗯。所以老師要有很多種講法。')],'rel':{'fam':2,'trust':1},'mem':'PS7_SPECIAL_ED',
  'note':'祐廷從經濟系換到法律系（劇情事實，所有玩家成立）'},
 {'id':'P7-L3','if':st(PS,'FAMILIAR'),
  'lines':['我週末打工的書店，老闆讓我管童書區。','我把書架降低了十公分。小孩的手搆得到。'],
  'choices':[ch('「老闆同意？」','他說可以。條件是我要幫他搬。……我搬了一整個週末。'),
             ch('「妳想得很細。」','當老師要想很細。……我在練習。')],'rel':{'fam':2,'comf':1},'mem':'PS7_KIDS_SHELF'},
 {'id':'P7-L4','if':st(PS,'FAMILIAR'),'week':[5,18],
  'lines':['你大四了，在決定以後的事吧。','……我以前很怕做決定，怕選錯。後來發現選了也還能改。'],
  'choices':[ch('「決定了可以改？」','可以。我就是改過的人。……你也是。',rel={'trust':1}),
             ch('「我還在想。」','好。想的時候，記得吃早餐。')],'rel':{'fam':2,'trust':1},'mem':'PS7_DECIDE'},
 {'id':'P7-L5','if':st(PS,'FAMILIAR'),'week':[8,18],
  'lines':['這學期的教案，我改了四次。','寫完才發現，最難的是第一分鐘。要讓他們想聽。'],  # 2026-10-17 BB-C 照 AA-C：大三下 base 已經是「第一次寫教案」，這裡不能再是第一次；「又在寫一整份教案，四十分鐘」不順，用 AA 給的替代句

  'choices':[ch('「妳怎麼開始？」','問一個問題。……他們想回答的那種。'),
             ch('「第一分鐘很重要。」','嗯。像大一讀書會第一次的那一分鐘。……大家都在等誰先說話。')],'rel':{'fam':2,'comf':1},'mem':'PS7_FIRST_MINUTE'},
 {'id':'P7-L6','if':st(PS,'FAMILIAR'),'week':[10,18],
  'lines':['課輔班有個孩子，以前考過一百分。他升國中了，回來看我。','比我高了。……我很想哭，可是我在包書套。'],
  'choices':[ch('「妳可以哭。」','……書套會濕。所以我笑了。',rel={'trust':1}),
             ch('「他記得妳。」','嗯。我改考卷畫的紅筆笑臉，他說他還在畫。')],'rel':{'fam':2,'comf':1},'mem':'PS7_TALLER',
  'note':'大三上 P5-L7（考一百分、紅筆笑臉）的後來（2026-10-16 上下文修正：新學期不假設聽過 P5-L7，「那個考一百分的孩子」「紅筆笑臉」改成自己講清楚）'},
 {'id':'P7-L7','if':st(PS,'FAMILIAR'),'week':[13,18],
  'lines':['我媽說，下學期要來看我上課。','……我說還沒有公開課。她說那她等。'],
  'choices':[ch('「妳媽很期待。」','她說家裡的早餐店那天可以休息。……我們家不休息的。'),
             ch('「我也想看。」','……那你坐最後面。不准笑。',rel={'comf':1})],'rel':{'fam':2,'trust':1},'mem':'PS7_MOM_WAITS',
  'note':'大四下 P6（媽媽來看她的公開課，第 8 週）的前情'},
 {'id':'P7-L8','if':st(PS,'FRIEND'),'week':[15,16],
  'lines':['寒假我要回家裡的早餐店。這次我要煎蛋給客人吃。','不是幫忙。是我煎的，我的蛋。'],
  'choices':[ch('「我去吃。」','好。……你要點蛋餅。我煎的那一份。',rel={'comf':1}),
             ch('「客人會知道嗎？」','不會。可是我會知道。')],'rel':{'fam':2,'comf':1},'mem':'PS7_MY_EGGS'},
],'greet':{'base':['嗨！……我剛從課輔班回來。','（她抱著一疊特教課的講義，對你笑了一下）','你吃早餐了嗎？……我四年都在問這一句。','今天上特教。我寫了三頁筆記。','書店童書區今天有個小孩，坐著看了一小時。'],
 'when':[{'location':['bookstore'],'weekday':[0,6],'t':'（她在童書區，對你揮手，小聲）……這裡要小聲。'},
         {'location':['bookstore'],'weekday':[0,6],'t':'（她在書店童書區，把一本繪本放回矮書架）','note':'2026-10-17 BB-C（照 AA_234 b7e7d445）：原 base 第 2 句，移到 when'},
         {'week':[8,9],'t':'期中。我的教案被老師畫了一個問號。……好的那種。'},
         {'weather':'rain','t':'下雨天，書店的童書區會坐滿小孩。'},
         {'time':[6,8],'t':'早。……老師要比學生早到。今天也做到了。'},
         {'week':[15,16],'t':'期末。寒假我要回家裡的早餐店煎蛋。'}]},
 'note':'教育相關科系大二上；週末舊路書房（童書區）、課輔班；戀愛事件照 BB_100 2-5，階梯只有朋友的話（2026-10-17 BB-C 稽核＋2026-10-17 BB-C（照 AA_234 b7e7d445）：base 第 2 句〔她在書店童書區放繪本〕移到 when location bookstore〔週末〕，base 補 AA 寫的句子；P7-L5 教案改四十分鐘〔國小一節，AA 審稿決定 6〕）'}

# ───────── 杜可昕（政大法律四上；只在「我們的日子」推進——見面或視訊都算）─────────
DK = {'flags': ['dating_kexin']}
D['characters'][KX] = {'context':'date','steps': [
 {'id':'K7-L1','if':DK,
  'lines':['大四了。予樂說我們是「最後一屆的老人」。','……她今天爬學校的樓梯沒有喘。她說暑假練過了。'],
  'choices':[ch('「妳呢？」','我還是會喘。……可是一百二十七階，我每天都數得完。'),
             ch('「最後一年了。」','嗯。予樂說要把想吃的店都吃一遍。',rel={'comf':1})],'rel':{'comf':2},'mem':'KX7_LAST_YEAR',
  'note':'大三上 K5-L1（老人、一百二十七階）的回聲（2026-10-16 上下文修正：新學期不假設聽過 K5-L1，「數到一百二十七」補成政大樓梯的階數）'},
 {'id':'K7-L2','if':DK,'week':[4,18],
  'lines':['這學期我們約讀書，就真的讀。……我說到做到。','你哪天沒讀，我就替你記「休息」。休息也要記。'],
  'linesIf':[  # 2026-10-17 BB-C（外部審稿 11）：KX_STUDY_PLAN 那套是「共用的讀書計畫表」，視訊也通，所以美國路線兩個都成立時先命中它也不會變成同一間房間；照 AA_237 把美國那組放最前面
             {'if':route('US'),'lines':['這學期我們視訊讀書，就真的讀。……我說到做到。','你哪天沒讀，我就替你記「休息」。休息也要記。']},
             {'if':fl('KX_STUDY_PLAN'),'lines':['我們共用的讀書計畫表，你上週那一格是空的。','……我替你寫了「休息」。休息也要寫進去。']}],
  'choices':[ch('「謝謝妳替我記。」','不用謝。我是讀書進度的管理員。'),
             ch('「下週補回來。」','不用補。休息不用補。……讀書要。',rel={'comf':1})],'rel':{'comf':2},'mem':'KX7_REST_CELL',
  'note':'K21（第 3 週，KX_STUDY_PLAN 共用的讀書計畫表）之後的玩家用 linesIf（2026-10-16 上下文修正：沒有旗標的那套原本沒講到「替你寫休息」，兩個選項都接不上，補一句；選項改成兩套都通的說法）。2026-10-17 BB-C（照 AA_234 b7e7d445）：美國路線（route US，他在美國、整學期只有視訊）的 linesIf 放在 KX_STUDY_PLAN 那套後面：有共用計畫表的玩家，原本那套兩條路線都通'},
 {'id':'K7-L3','if':DK,'week':[6,18],
  'lines':['讀書會的邵鈞，開始每天寫一題申論。寫完拿給我改。','……我改他的，他改我的。我們都改很兇。'],
  'choices':[ch('「誰比較兇？」','他。他會在旁邊寫「理由呢？」。……我也開始這樣寫了。'),
             ch('「互相改很好。」','嗯。他抓得到我自己看不到的錯。')],'rel':{'comf':1,'fam':1},'mem':'KX7_SHAOJUN_ESSAY',
  'note':'大三下 K6-L4（邵鈞六點去圖書館）的後來（2026-10-16 上下文修正：K22 第 11 週才介紹邵鈞，這層第 6 週起，補「讀書會的」）'},
 {'id':'K7-L4','if':DK,'week':[8,18],
  'lines':['我把律師考試的日期，寫在房間那面淡黃的牆上。','予樂說那面牆像長頸鹿的肚子。……所以是寫在牠肚子上。'],
  'linesIf':[{'if':route('US'),'lines':['我把律師考試的日期，寫在房間那面淡黃的牆上。','（她把鏡頭轉過去）看到沒？予樂說那面牆像長頸鹿的肚子。']}],
  'choices':[ch('「長頸鹿會幫妳記。」','對。牠每天看著我。很有壓力。'),
             ch('「我也寫一個日期。」','好，你的我幫你寫，就寫在旁邊。',rel={'comf':1})],'rel':{'comf':2,'trust':1},'mem':'KX7_EXAM_DATE',
  'note':'K23（第 7 週各自的路）之後；大三下 K6-L2（淡黃的牆）的回聲（2026-10-16 上下文修正：新學期不假設聽過 K6-L2，「長頸鹿的肚子」補上是予樂形容那面牆的話）。2026-10-17 BB-C（照 AA_234 b7e7d445）：美國路線用 linesIf（視訊）；選項②回覆改成兩條路線都通'},
 {'id':'K7-L5','if':DK,'week':[9,18],
  'lines':['最近我在想，畢業以後我們的日子要怎麼算。','……一個禮拜一次？兩次？我還沒想好。'],
  'choices':[ch('「一週一次。」','好。……少一次要補。'),
             ch('「不用算。」','要算。不算我會亂掉。',rel={'comf':1})],'rel':{'comf':2},'mem':'KX7_AFTER_GRAD',
  'note':'2026-10-17 BB-C（照 AA_234 b7e7d445）：「假設」減量（這學期只留 K7-L8）；選項②拿掉「記帳是我的興趣。你知道的。」（K3-L8 已經不講數字，沒有來源）'},
 {'id':'K7-L6','if':DK,'week':[12,18],
  'lines':['最近我每天念到十一點。','十一點以後，是我們的時間。……十五分鐘。'],
  'linesIf':[{'if':route('US'),'lines':['最近我每天念到十一點。','十一點以後是我們的時間。你那邊剛好是早上。……十五分鐘。']}],
  'choices':[ch('「十五分鐘夠嗎？」','不夠。可是剛好。……不夠的那一點，留到明天。'),
             ch('「我等妳。」','不用等。……好，等。',rel={'comf':1})],'rel':{'comf':2},'mem':'KX7_ELEVEN',
  'note':'K22（第 11 週兩個方向的讀書會）之後；不重複 K22 那兩句。2026-10-17 BB-C（照 AA_234 b7e7d445）：美國路線用 linesIf（時差不寫數字，台灣晚上 11 點＝美東早上）'},
 {'id':'K7-L7','if':DK,'week':[14,18],
  'lines':['我把這學期的筆記裝訂成一本。','封面畫了一隻長頸鹿，戴眼鏡。因為牠在念書。'],
  'linesIf':[{'if':route('US'),'lines':['我把這學期的筆記裝訂成一本。','（她把封面舉到鏡頭前）長頸鹿，戴眼鏡。因為牠在念書。']}],
  'note':'2026-10-17 BB-C（照 AA_234 b7e7d445）：美國路線用 linesIf（視訊）；選項①回覆改成兩條路線都通（「封面給你看」）',
  'choices':[ch('「借我看。」','不借。……封面給你看。',rel={'comf':1}),
             ch('「長頸鹿也要考試？」','要。牠考很久了。……跟我一樣。')],'rel':{'comf':2},'mem':'KX7_BOUND_NOTES'},
 {'id':'K7-L8','if':DK,'week':[15,16],
  'lines':['大四上要結束了。再過一個學期，我就畢業了。……你那邊呢？','……我不怕畢業。我比較怕畢業以後太忙，我們連約吃飯都要排半個月。'],  # 2026-10-17 BB-C（照 AA_237 208fbe40，外部審稿）

  'choices':[ch('「我會提醒妳。」','好。每天一題。你出。'),
             ch('「妳不會忘的。」','……嗯。你在，我就不會。',rel={'comf':2})],'rel':{'comf':2,'trust':1},'mem':'KX7_LAST_TERM'},
],'greet':None,'note':'同前：交往中不在路上遇到；短招呼用手機池；分開就停。沒有 dateOnly，見面、視訊都推進'}

BAN=['大家都只問','謝謝你沒有','不要跟別人講','不要跟別人說','你不用那個表情','我可以問一個奇怪的問題嗎','你是第一個','熱可可','加一份濃縮','我請你',
     '我想吃滷肉飯','這句，標起來','我想第一批知道','判的人','幫人講話的人','假設四年後','今年我認輸']
BRANDS=['麥當勞','摩斯','星巴克','7-11','統一超商','全家便利','萊爾富','誠品','路易莎','50嵐','五十嵐','迷客夏','寶可夢','任天堂','Switch','iPhone','Instagram','Google','YouTube','Netflix','迪士尼']
def texts(s):
    out=list(s['lines'])+[x for li in s.get('linesIf',[])+s.get('extraIf',[]) for x in li['lines']]
    for c in s.get('choices',[]): out+= [c['t'], c['reply']]
    return out
def check(d):
    err=[]
    for cid,c in d['characters'].items():
        ids=[s['id'] for s in c['steps']]
        if len(ids)!=len(set(ids)): err.append(cid+' 層 id 重複')
        if len(ids)!=8: err.append(cid+' 不是 8 層')
        for s in c['steps']:
            for l in texts(s):
                if len(l)>48: err.append(f"{s['id']} 台詞太長（{len(l)}）：{l}")
                for b in BAN+BRANDS:
                    if b in l: err.append(f"{s['id']} 禁用字樣「{b}」：{l}")
            for ch_ in s.get('choices',[]):
                if len(ch_['t'])>20: err.append(f"{s['id']} 選項超過 20 字：{ch_['t']}")
            if len(s.get('choices',[]))>2: err.append(s['id']+' 選項超過 2')
            cond=s.get('if',{})
            bad=[k for k in cond if k not in ('stage','any')]
            if cid==KX and cond!={'flags':['dating_kexin']}: err.append(s['id']+' 可昕的 if 只能是 dating_kexin')
            elif cid!=KX and bad: err.append(f"{s['id']} 的 if 只能放階段（防卡關）：{bad}")
            if cid==KX and False: pass
            if 'week' in s and s['week'][1]<16 and not s.get('skipIf'): err.append(f"{s['id']} 週次沒有放寬到第 16 週（會卡關；16 週制，AA_198）")
        g=c.get('greet')
        if g and len(g['base'])!=5: err.append(cid+' 短招呼不是 5 句')
        if g:
            for w in g['when']:
                if len(w['t'])>48: err.append(f"{cid} 情境句太長：{w['t']}")
                for b in BAN+BRANDS:
                    if b in w['t']: err.append(f"{cid} 情境句禁用字樣「{b}」")
            for b in g['base']:
                if len(b)>48: err.append(f"{cid} 短招呼太長：{b}")
    return err
e=check(D)
if e: sys.exit('\n'.join(e))
if '--check' not in sys.argv:
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'ladder_bb_y4s1.json'),'w',encoding='utf-8') as f:
        json.dump(D,f,ensure_ascii=False,indent=1); f.write('\n')
print('ok', {k:len(v['steps']) for k,v in D['characters'].items()})
