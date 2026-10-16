# -*- coding: utf-8 -*-
"""大四上（Y4S1）的閒聊階梯：溫學姊（heroine_05）、沛珊（classmate_peishan）、可昕（kexin）→ ladder_bb_y4s1.json。
作者：BB-B 2026-10-16（D81）。原稿說明：../BB_142_閒聊階梯_大四上_學姊沛珊可昕.md。格式同 ladder_bb_y3s2.json，term＝'Y4S1'。
**芷若、子晴這學期沒有階梯**：芷若在英國念電影研究（第二輪明信片，BB_99 3-1）；子晴已經畢業、在工作室上班，只有手機（Q14，BB_99 4-1）。
大四大家都在台灣（交換延畢的玩家照遊戲學期算，同一份）。
依據 BB_99（大四上）：學姊 M7 接機（開學前）、椰林大道（第 1 週，告白點 2）、M8 研究助理（第 3 週，`RA_WORK`）、交往中的兩張書桌（第 4 週起）；
可昕 重訪日 4（第 1 週）、K21 約讀書真的讀（第 3 週，`KX_STUDY_PLAN`）、中秋（第 5 週）、K23 各自的路（第 7 週）、K22 兩個方向的讀書會（第 11 週）、聖誕（第 17 週）；
沛珊 教育相關科系大二上（P6 公開課是大四下）。
**防卡關**：`if` 只放階段；事件、記憶、旗標的差別放 linesIf／extraIf；週次放寬到第 18 週。
**學姊**：這學期可能單身、可能和祐廷交往、也可能還和顧承遠在一起（C4 第 4 週）。階梯的話三種狀態都通（friendOnly：不接戀愛選項）；戀人的戲在 2-7 事件。
**不重複事件的台詞**（build 擋）：學姊「我想吃滷肉飯」「這句，標起來」；可昕「我想第一批知道」「判的人」「幫人講話的人」「假設四年後」「今年我認輸」。
用法：python3 build_ladder_bb_y4s1.py → ladder_bb_y4s1.json；--check 只檢查。"""
import json, sys, os
Y='Y4S1'
def st(npc, mn): return {'stage': {'npc': npc, 'min': mn}}
def mem(npc, tag): return {'memory': [{'npc': npc, 'tag': tag}]}
def fl(*f): return {'flags': list(f)}
def ch(t, reply, rel=None, mem=None):
    c = {'t': t, 'reply': reply}
    if rel: c['rel'] = rel
    if mem: c['mem'] = mem
    return c

SIS='heroine_05'; PS='classmate_peishan'; KX='kexin'
D = {'_comment': __doc__, 'term': Y, 'characters': {}}

# ───────── 溫書瑀（碩二；從美國回來；寫論文；研究室走廊最後一間）─────────
D['characters'][SIS] = {'friendOnly': True, 'steps': [
 {'id':'S6-L1','if':st(SIS,'ACQUAINTANCE'),
  'lines':['美國的研究室，咖啡機壞了一學期。我學會喝茶。','回來以後，這裡的咖啡機也壞了。……我覺得它在等我。'],
  'choices':[ch('「學姊現在喝茶？」','喝。可是保溫瓶裡還是咖啡。習慣要慢慢換。'),
             ch('「修好了嗎？」','修好了。我修的。說明書是英文的，剛好。')],'rel':{'fam':2},'mem':'SIS6_TEA',
  'note':'M7 接機（三件事的「研究室的咖啡機」）的回聲'},
 {'id':'S6-L2','if':st(SIS,'ACQUAINTANCE'),
  'lines':['論文開始寫了。題目是法律扶助的時間線。','一個人從走進來，到被聽完，要多久。'],
  'choices':[ch('「要多久？」','還不知道。所以要寫一整本。'),
             ch('「學姊相信這個題目。」','……嗯。重點是，這次我知道為什麼要寫。',rel={'trust':2})],'rel':{'fam':2,'trust':1},'mem':'SIS6_THESIS',
  'note':'大二上 W7（「你自己相信這個題目嗎」）的遠回聲，不說是誰問的'},
 {'id':'S6-L3','if':st(SIS,'FAMILIAR'),'week':[3,18],
  'lines':['研究室窗外那棵樹，我不在的時候被修剪了。','……變矮了。可是有比較多光照進來。'],
  'choices':[ch('「學姊喜歡嗎？」','還在習慣。……習慣了應該會喜歡。'),
             ch('「光多一點比較好寫。」','嗯。我現在晚上也開窗。')],'rel':{'fam':2,'comf':1},'mem':'SIS6_TREE',
  'note':'大三上 S5-L1（研究室的窗戶對著一棵樹）的回聲'},
 {'id':'S6-L4','if':st(SIS,'FAMILIAR'),'week':[5,18],
  'lines':['我在美國學會一件事：「還好」要問第二次。','第一次的還好，通常不太好。'],
  'choices':[ch('「那學姊還好嗎？」','……你問第二次，我再回答。',rel={'trust':1}),
             ch('「我會記得問兩次。」','好。……你已經比我先學會了。')],'rel':{'fam':2,'trust':1},'mem':'SIS6_ASK_TWICE',
  'note':'美國篇「還好」的主題（BB_98 2-9）；台灣、日本路線的玩家也通（這句是她自己說的）'},
 {'id':'S6-L5','if':st(SIS,'FAMILIAR'),'week':[8,18],
  'lines':['法服的學弟妹找我回去講一次課。講個案的時間線。','我講了四十分鐘。……第一次沒有列三件事。'],
  'choices':[ch('「他們有發現嗎？」','有。下課有人問我：學姊，今天的三件事呢？'),
             ch('「學姊不用列也可以。」','嗯。可以。……可是我還是會列。只是不一定說出來。',rel={'trust':1})],'rel':{'fam':2,'comf':1},'mem':'SIS6_NO_THREE'},
 {'id':'S6-L6','if':st(SIS,'FAMILIAR'),'week':[10,18],
  'lines':['我爸說，論文寫完要印一本給他。放在辦公室。','公務員的辦公室，放一本法律扶助的論文。他說這叫平衡。'],
  'choices':[ch('「妳爸很驕傲。」','他不會說。……他會把它放在最上面。'),
             ch('「我也要一本。」','……要排隊。第一本是我爸，他說好了。',rel={'comf':1})],'rel':{'fam':2,'trust':1},'mem':'SIS6_FATHER_COPY',
  'note':'大二下 S4-L4（爸爸寄剪報）的後來'},
 {'id':'S6-L7','if':st(SIS,'FAMILIAR'),'week':[12,18],
  'lines':['最近我在聽很多訪談的錄音。','聽到後來，我在想自己講話是不是太快。'],
  'linesIf':[{'if':mem(SIS,'RA_WORK'),'lines':['你打的逐字稿，我又看了一次。','你在每一個停頓的地方，都打了刪節號。……很準。']}],
  'choices':[ch('「學姊講話不快。」','……你這樣說，是因為你習慣了。'),
             ch('「慢一點比較好懂。」','嗯。人聽得懂的，才是答案。……這不是我說的。',rel={'trust':1})],'rel':{'fam':2,'trust':1},'mem':'SIS6_RECORDINGS',
  'note':'M8 研究助理（RA_WORK）的玩家用 linesIf；「人聽得懂的才是答案」是重訪日 2 阿伯的話'},
 {'id':'S6-L8','if':st(SIS,'FRIEND'),'week':[16,18],
  'lines':['寒假我想把論文寫到第三章。然後放一天假。','重點是，假是寫在計畫本上的。……這次我會真的放。'],
  'choices':[ch('「放假要做什麼？」','還沒想。……第一次，放假不用先想好。'),
             ch('「我監督學姊放假。」','好。……你要是看到我在寫論文，把電腦闔起來。',rel={'comf':1})],'rel':{'fam':2,'comf':1},'mem':'SIS6_DAYOFF_PLAN',
  'note':'交往中的玩家，大四下 2-7c「她自己放的一天假」是事件；這裡三種狀態都通'},
],'greet':{'base':['學弟。……碩二了。','（她拿著保溫瓶，從研究室走廊最後一間走出來）','論文第二章。……一件事都還沒寫完。','兩件事。一，吃飯。二，你決定。','研究室的咖啡機今天沒壞。……可疑。'],
 'when':[{'location':['library','library_hall'],'week':[8,9],'t':'……期中。我沒有考試，可是我也在這裡。'},
         {'weather':'rain','t':'下雨。兩件事。一，帶傘。二，……你知道的。'},
         {'time':[20,24],'t':'這麼晚。……研究室的燈，我馬上關。'},
         {'week':[12,14],'t':'你在決定以後的事吧。……慢慢來。'},
         {'week':[16,18],'t':'期末。你考試，我寫論文。各自加油。'}]},
 'note':'碩二；三種狀態（單身、和祐廷交往、還有伴侶）都通的朋友的話（friendOnly）；戀人的戲在 BB_99 2-7'}

# ───────── 郭沛珊（教育相關科系大二上；週末舊路書房；課輔班）─────────
D['characters'][PS] = {'friendOnly': True, 'steps': [
 {'id':'P7-L1','if':st(PS,'ACQUAINTANCE'),
  'lines':['暑假營隊的那組小孩，寫信給我。','信上寫：老師，山上的書我們看完了，再寄。……我寄了。'],
  'choices':[ch('「寄了幾本？」','五本。郵費比書貴。……很值得。'),
             ch('「他們會一直寫信來。」','嗯。我希望。我會一直寄。')],'rel':{'fam':2},'mem':'PS7_CAMP_LETTER',
  'note':'大三下 P6-L8（暑假山上的營隊）的後來'},
 {'id':'P7-L2','if':st(PS,'ACQUAINTANCE'),
  'lines':['這學期修特殊教育。老師說，每個孩子學東西的速度都不一樣。','……我想到我自己。也想到你。'],
  'choices':[ch('「我怎麼了？」','你換過一次路。你知道慢不是錯。',rel={'trust':2}),
             ch('「每個人都不一樣。」','嗯。所以老師要有很多種講法。')],'rel':{'fam':2,'trust':1},'mem':'PS7_SPECIAL_ED',
  'note':'祐廷從經濟系換到法律系（劇情事實，所有玩家成立）'},
 {'id':'P7-L3','if':st(PS,'FAMILIAR'),
  'lines':['書店老闆讓我管童書區。','我把書架降低了十公分。小孩的手搆得到。'],
  'choices':[ch('「老闆同意？」','他說可以。條件是我要幫他搬。……我搬了一整個週末。'),
             ch('「妳想得很細。」','當老師要想很細。……我在練習。')],'rel':{'fam':2,'comf':1},'mem':'PS7_KIDS_SHELF'},
 {'id':'P7-L4','if':st(PS,'FAMILIAR'),'week':[5,18],
  'lines':['你大四了，在決定以後的事吧。','……我以前覺得決定很可怕。現在覺得，決定了才能改。'],
  'choices':[ch('「決定了可以改？」','可以。我就是改過的人。……你也是。',rel={'trust':1}),
             ch('「我還在想。」','好。想的時候，記得吃早餐。')],'rel':{'fam':2,'trust':1},'mem':'PS7_DECIDE'},
 {'id':'P7-L5','if':st(PS,'FAMILIAR'),'week':[8,18],
  'lines':['我第一次寫一整份教案，四十五分鐘。','寫完才發現，最難的是第一分鐘。要讓他們想聽。'],
  'choices':[ch('「妳怎麼開始？」','問一個問題。……他們想回答的那種。'),
             ch('「第一分鐘很重要。」','嗯。像讀書會第一次開始那一分鐘。……大家都在等誰先說話。')],'rel':{'fam':2,'comf':1},'mem':'PS7_FIRST_MINUTE'},
 {'id':'P7-L6','if':st(PS,'FAMILIAR'),'week':[10,18],
  'lines':['課輔班那個考一百分的孩子，升國中了。他回來看我。','比我高了。……我很想哭，可是我在包書套。'],
  'choices':[ch('「妳可以哭。」','……書套會濕。所以我笑了。',rel={'trust':1}),
             ch('「他記得妳。」','嗯。他說，紅筆笑臉他還在畫。')],'rel':{'fam':2,'comf':1},'mem':'PS7_TALLER',
  'note':'大三上 P5-L7（考一百分、紅筆笑臉）的後來'},
 {'id':'P7-L7','if':st(PS,'FAMILIAR'),'week':[13,18],
  'lines':['我媽說，下學期要來看我上課。','……我說還沒有公開課。她說那她等。'],
  'choices':[ch('「妳媽很期待。」','她說早餐店那天可以休息。……我們家不休息的。'),
             ch('「我也想看。」','……那你坐最後面。不准笑。',rel={'comf':1})],'rel':{'fam':2,'trust':1},'mem':'PS7_MOM_WAITS',
  'note':'大四下 P6（媽媽來看她的公開課，第 8 週）的前情'},
 {'id':'P7-L8','if':st(PS,'FRIEND'),'week':[16,18],
  'lines':['寒假我要回早餐店。這次我要煎蛋給客人吃。','不是幫忙。是我煎的，我的蛋。'],
  'choices':[ch('「我去吃。」','好。……你要點蛋餅。我煎的那一份。',rel={'comf':1}),
             ch('「客人會知道嗎？」','不會。可是我會知道。')],'rel':{'fam':2,'comf':1},'mem':'PS7_MY_EGGS'},
],'greet':{'base':['嗨！……我剛從課輔班回來。','（她在書店童書區，把一本繪本放回矮書架）','你吃早餐了嗎？……我四年都在問這一句。','今天上特教。我寫了三頁筆記。','童書區今天有一個小孩坐著看了一小時。'],
 'when':[{'location':['bookstore'],'weekday':[0,6],'t':'（她在童書區，對你揮手，小聲）……這裡要小聲。'},
         {'week':[8,9],'t':'期中。我的教案被老師畫了一個問號。……好的那種。'},
         {'weather':'rain','t':'下雨天，童書區會坐滿小孩。'},
         {'time':[6,8],'t':'早。……今天也比學生早。'},
         {'week':[16,18],'t':'期末。寒假我要回去煎蛋。'}]},
 'note':'教育相關科系大二上；週末舊路書房（童書區）、課輔班；戀愛事件照 BB_100 2-5，階梯只有朋友的話'}

# ───────── 杜可昕（政大法律四上；只在「我們的日子」推進——見面或視訊都算）─────────
DK = {'flags': ['dating_kexin']}
D['characters'][KX] = {'context':'date','steps': [
 {'id':'K7-L1','if':DK,
  'lines':['大四了。予樂說我們是「最後一屆的老人」。','……她今天走樓梯沒有喘。她說暑假練過了。'],
  'choices':[ch('「妳呢？」','我還是會喘。……可是我數到一百二十七了。'),
             ch('「最後一年了。」','嗯。最後一年，要過得很普通。普通的才記得住。',rel={'comf':1})],'rel':{'comf':2},'mem':'KX7_LAST_YEAR',
  'note':'大三上 K5-L1（老人、一百二十七階）的回聲'},
 {'id':'K7-L2','if':DK,'week':[4,18],
  'lines':['這學期我們約讀書，就真的讀。……我說到做到。'],
  'linesIf':[{'if':fl('KX_STUDY_PLAN'),'lines':['讀書計畫表，你上週那一格是空的。','……我替你寫了「休息」。休息也要寫進去。']}],
  'choices':[ch('「謝謝妳替我寫。」','不用謝。我是表格的管理員。'),
             ch('「下週補回來。」','不用補。休息不用補。……讀書要。',rel={'comf':1})],'rel':{'comf':2},'mem':'KX7_REST_CELL',
  'note':'K21（第 3 週，KX_STUDY_PLAN 共用的讀書計畫表）之後的玩家用 linesIf'},
 {'id':'K7-L3','if':DK,'week':[6,18],
  'lines':['邵鈞開始每天寫一題申論。寫完拿給我改。','……我改他的，他改我的。我們都改很兇。'],
  'choices':[ch('「誰比較兇？」','他。他會在旁邊寫「理由呢？」。……我也開始這樣寫了。'),
             ch('「互相改很好。」','嗯。改別人的，會發現自己的。')],'rel':{'comf':1,'fam':1},'mem':'KX7_SHAOJUN_ESSAY',
  'note':'大三下 K6-L4（邵鈞六點去圖書館）的後來'},
 {'id':'K7-L4','if':DK,'week':[8,18],
  'lines':['我把律師考試的日期寫在牆上。淡黃色的那一面。','……寫在長頸鹿的肚子上。'],
  'choices':[ch('「長頸鹿會幫妳記。」','對。牠每天看著我。很有壓力。'),
             ch('「我也寫一個日期。」','寫在旁邊。……兩個日期，比較不孤單。',rel={'comf':1})],'rel':{'comf':2,'trust':1},'mem':'KX7_EXAM_DATE',
  'note':'K23（第 7 週各自的路）之後；大三下 K6-L2（淡黃的牆）的回聲'},
 {'id':'K7-L5','if':DK,'week':[9,18],
  'lines':['最近我在想，畢業以後我們的日子要怎麼算。','不是假設題。……可是我還是想先假設一下。'],
  'choices':[ch('「一週一次。」','好。……少一次要補。'),
             ch('「不用算。」','要算。記帳是我的興趣。你知道的。',rel={'comf':1})],'rel':{'comf':2},'mem':'KX7_AFTER_GRAD',
  'note':'大二上 K3-L8（記帳是我的興趣）的回聲'},
 {'id':'K7-L6','if':DK,'week':[12,18],
  'lines':['最近我每天念到十一點。','十一點以後，是我們的時間。……十五分鐘。'],
  'choices':[ch('「十五分鐘夠嗎？」','不夠。可是剛好。……不夠的那一點，留到明天。'),
             ch('「我等妳。」','不用等。……好，等。',rel={'comf':1})],'rel':{'comf':2},'mem':'KX7_ELEVEN',
  'note':'K22（第 11 週兩個方向的讀書會）之後；不重複 K22 那兩句'},
 {'id':'K7-L7','if':DK,'week':[14,18],
  'lines':['我把這學期的筆記裝訂成一本。','封面畫了一隻長頸鹿，戴眼鏡。因為牠在念書。'],
  'choices':[ch('「借我看。」','不借。……借你封面。',rel={'comf':1}),
             ch('「長頸鹿也要考試？」','要。牠考很久了。……跟我一樣。')],'rel':{'comf':2},'mem':'KX7_BOUND_NOTES'},
 {'id':'K7-L8','if':DK,'week':[16,18],
  'lines':['大四上要結束了。我們只剩一個學期當學生。','……我不怕畢業。我怕畢業以後太忙，忘記假設。'],
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
            if 'week' in s and s['week'][1]<18 and not s.get('skipIf'): err.append(f"{s['id']} 週次沒有放寬到第 18 週（會卡關）")
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
