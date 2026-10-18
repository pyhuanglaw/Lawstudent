# -*- coding: utf-8 -*-
"""大四上（Y4S1）的閒聊階梯：以安（heroine_01）、語彤（heroine_03）→ ladder_aa_y4s1.json。作者：AA-B 2026-10-16。
原稿說明：../AA_151_閒聊階梯_大四上_以安語彤.md。格式同 ladder_aa_y3s1.json，term＝'Y4S1'。
日本路線 8/5 回來；美國路線 2028-08-02～12-23 在美國，這學期碰不到階梯（AA_262）；以安 8/5 回來。路線差別用 linesIf（flagIs EXCHANGE_ROUTE）。
依據：交接包_v5_大四_畢業後_尾聲_骨架、交接包_v5_交付清單 F3（R1 時差）、F4（以安回來後第一次讀書會）、F6（語彤 15b〈公館的時間〉第 6 週）、F7（以安新 18 她的選擇第 7 週）、
F10（以安新 19 讀書會交棒第 13 週）、F11（語彤事件 15 二十三週年第 15 週 12/14）、F13（語彤事件 16 分一點時間第 16 週）；AA_113、AA_11、AA_30（「你不在的時候，我訪問了二十三個老闆」）。
**不搶事件的戲**：新 18 的理由、新 19 的最後一條規則、15b 的文章內容、二十三週年最後一碗端給誰、分一點時間，階梯都不講；媽媽的職業照舊不說（大四下新 21 才說）。
**防卡關**：`if` 只放階段；週次放寬到第 18 週（16 週制不推進到 17、18 週，只是不卡關）。
用法：python3 build_ladder_aa_y4s1.py → ladder_aa_y4s1.json；--check 只檢查。"""
import json, sys, os
Y='Y4S1'
def st(npc, mn): return {'stage': {'npc': npc, 'min': mn}}
def ch(t, reply, rel=None, mem=None):
    c = {'t': t, 'reply': reply}
    if rel: c['rel'] = rel
    if mem: c['mem'] = mem
    return c
AN='heroine_01'; YT='heroine_03'
D = {'_comment': __doc__, 'term': Y, 'characters': {}}
JP={'flagIs':{'EXCHANGE_ROUTE':'JP'}}; US={'flagIs':{'EXCHANGE_ROUTE':'US'}}

D['characters'][AN] = {'steps': [
 {'id':'A7-L1','if':st(AN,'ACQUAINTANCE'),'week':[1,18],
  'lines':['回來了。……麵店的長桌，阿姨真的幫我留了位子。','她說，是習慣。'],
  'choices':[ch('「歡迎回來。」','謝謝。八月就回來了，今天才第一次來吃。'),
             ch('「點大碗了嗎？」','點了。吃不完，剩下的給阿哲。',rel={'comf':1})],'rel':{'fam':2,'comf':1},'mem':'AN7_BACK',
  'linesIf':[{'if':{'flagIs':{'EXCHANGE_ROUTE':'JP'},'flags':['dating_heroine_01']},'lines':['阿姨問我們日本好不好玩。','我說是去上課的，她說那怎麼曬這麼黑。']}],
  'note':'接大三上 A5-L8；日本路線交往中才用 linesIf，挽回失敗的照 base（AA_262 第 2 節）。2026-10-17 AA-C 照 AA_262 附錄 A 改稿'},
 {'id':'A7-L2','if':st(AN,'ACQUAINTANCE'),'week':[2,18],
  'lines':['今年生日不是中秋。','……我有一點想念柚子。'],
  'choices':[ch('「生日快樂。」','謝謝。今天晚上我媽要上來吃飯。'),
             ch('「明年再插蠟燭。」','好。明年柚子你買。')],'rel':{'fam':2,'comf':1},
  'linesIf':[{'if':{'memory':[{'npc':AN,'tag':'AN_BDAY_POMELO'}]},'lines':['今年生日不是中秋。','去年的蠟燭還在筆筒裡。……今年不用插。']}],
  'note':'9/15 大四上第 2 週。2026-10-17 AA-C 照 AA_262 附錄 A 改稿'},
 {'id':'A7-L3','if':st(AN,'ACQUAINTANCE'),
  'lines':['日本的鄰居，每天早上倒垃圾都跟我說早安。','住了一個學期，我還是不知道她叫什麼。她沒說，我也沒問。'],
  'choices':[ch('「那邊的規則？」','嗯。早上說早安，晚上不說晚安。我到最後都不知道為什麼。',rel={'trust':1}),
             ch('「妳想知道嗎？」','……想。最後一天，我在門口留了一張紙條。寫我的名字。')],'rel':{'fam':2,'trust':1},'mem':'AN7_NEIGHBOR',
  'note':'日本的生活；不講町公所那張通知。2026-10-17 AA-C 照 AA_262 附錄 A 改稿'},
 {'id':'A7-L4','if':st(AN,'FAMILIAR'),'week':[5,18],
  'lines':['學弟妹一直問我日本好不好。','我說很好，可是講不出哪裡好。'],
  'choices':[ch('「那妳說了什麼？」','我說便利商店很好逛。他們好像有點失望。'),
             ch('「妳有想過留下來嗎？」','七月有一天想過。那天很熱，我在河堤坐到天黑。',rel={'trust':1})],'rel':{'fam':2,'comf':1},
  'note':'3/25～8/5 沒有雪（原「下雪那天」作廢）。2026-10-17 AA-C 照 AA_262 附錄 A 改稿'},
 {'id':'A7-L5','if':st(AN,'FAMILIAR'),'week':[8,18],
  'lines':['研究所要交的計畫，第一頁我改了好幾次。','最後寫的是大二那個家。'],
  'choices':[ch('「之前寫什麼？」','條文。後來覺得條文放後面就好。'),
             ch('「那個家知道嗎？」','不知道。……寫完我會寄一份給他們。不寫名字。',rel={'trust':2})],'rel':{'fam':2,'trust':1},'mem':'AN7_PROPOSAL',
  'linesIf':[{'if':{'flags':['WISH_DONE_heroine_01']},'lines':['研究所要交的計畫，第一頁我改了好幾次。','最後寫的是景美那天想到的。']}],
  'note':'新 18（第 7 週）之後；不重講理由。2026-10-17 AA-C 照 AA_262 附錄 A 改稿'},
 {'id':'A7-L6','if':st(AN,'FRIEND'),'week':[14,18],
  'lines':['讀書會交出去以後，我週四晚上空出來了。','語彤叫我去總圖三樓，她說週四那層人很少。'],
  'choices':[ch('「去了嗎？」','去了。她坐窗邊，我坐她後面那桌。九點半她先走。'),
             ch('「我也可以陪妳。」','好啊。但你不要一直講話。',rel={'comf':2})],'rel':{'fam':2,'comf':1},
  'note':'新 19 讀書會交棒（第 13 週）之後。2026-10-17 AA-C 照 AA_262 附錄 A 改稿'},
 {'id':'A7-L7','if':st(AN,'FRIEND'),'week':[10,18],
  'lines':['上禮拜天我什麼都沒排。','結果整天在宿舍，把手帳從大一翻到現在。'],
  'choices':[ch('「讀到什麼？」','大一的第一頁，寫著「大三：日本」。結果真的去了。……現在看，還滿開心的。',rel={'trust':1}),
             ch('「下次我幫妳排。」','……好。你排的，我不改。',rel={'comf':2})],'rel':{'fam':2,'trust':1},'mem':'AN7_NO_PLAN',
  'note':'回聲大一手帳第一頁「大三：日本」。2026-10-17 AA-C 照 AA_262 附錄 A 改稿'},
 {'id':'A7-L8','if':st(AN,'FRIEND'),'week':[14,18],
  'lines':['寒假我回台中兩個禮拜。','一月中回來，總圖幾點開我已經查好了。'],
  'choices':[ch('「那跨年呢？」','還沒想。阿哲應該會揪吧。'),
             ch('「回來找妳讀書。」','好。二樓靠窗，我幫你占。',rel={'trust':1})],'rel':{'fam':2,'trust':1},
  'note':'原本講跨年（12/31 在學期以後，她大二、大三也上過頂樓），改成寒假安排（AA_262 第 2 節）。2026-10-17 AA-C 照 AA_262 附錄 A 改稿'},
],'greet':{'base':['這學期週五早上有公法研討，我很期待。','研究所的書，好重。公法的特別重。','（她在手帳上寫了一行日文，又劃掉）……習慣。','這學期課不多，我大部分時間在總圖。','你也在。要一起坐嗎？'],
 'when':[{'weekday':[4],'time':[19,21],'location':['wancai'],'week':[2,13],'t':'讀書會八點開始，我先來擦白板。'},
         {'week':[8,9],'t':'期中考週。強執我還有兩章沒看。'},
         {'weather':'rain','t':'又下雨。日本梅雨的時候也是這樣，下一整天。'},
         {'week':[16,18],'t':'期末考週。強執禮拜一早上考，我還沒背完。'},
         {'location':['noodle'],'t':'（她面前是一碗大碗的）阿姨又幫我盛大碗了。'}]},
 'note':'大四上以安：回來、研究所（新 18）、讀書會交棒（新 19）；不說媽媽的職業。2026-10-17 AA-C 照 AA_262 附錄 A 改稿'}

D['characters'][YT] = {'steps': [
 {'id':'Y7-L1','if':st(YT,'ACQUAINTANCE'),'week':[1,18],
  'lines':['暑假，我訪問了阿姨。她講了一整個晚上。','最後她問我：這樣算故事嗎？'],
  'choices':[ch('「算。」','我也這樣說。她說：那妳寫，不要寫我的名字。'),
             ch('「她講了什麼？」','……不能說。她說要先給我媽聽。')],'rel':{'fam':2,'trust':1},'mem':'YT7_AUNT_STORY',
  'note':'接大三下 Y6-L8；R1（AA_30 3-4）已經講「訪問了二十三個老闆」，JP、US 的 linesIf 刪掉（美國路線這學期人在美國）。2026-10-17 AA-C 照 AA_262 附錄 A 改稿'},
 {'id':'Y7-L2','if':st(YT,'ACQUAINTANCE'),'week':[3,18],
  'lines':['訪談課的學弟妹，現在會自己把椅子擺斜了。','我沒教過，可能是看我擺的。'],
  'choices':[ch('「為什麼要擺斜？」','正對面坐，對方會緊張。',rel={'trust':1}),
             ch('「他們有問妳嗎？」','有一個問了。我說你坐久了就知道。')],'rel':{'fam':2},'mem':'YT7_CHAIRS_PASSED',
  'note':'她延畢、多帶一年訪談課（AA_262 裁定）。2026-10-17 AA-C 照 AA_262 附錄 A 改稿'},
 {'id':'Y7-L3','if':st(YT,'FAMILIAR'),'week':[7,18],
  'lines':['系刊那篇，阿姨拿去影印了二十份。她說要貼在店裡。我說不行。','……最後貼了一份。在廁所門口。'],
  'choices':[ch('「那是最多人看的地方。」','對，所以我每次去都想撕掉。'),
             ch('「我去看。」','不要。要看去總圖翻系刊。')],'rel':{'fam':2,'comf':1},
  'note':'15b（第 6 週）之後。2026-10-17 AA-C 照 AA_262 附錄 A 改稿'},
 {'id':'Y7-L4','if':st(YT,'FAMILIAR'),'week':[2,18],
  'lines':['以安回來以後，又每個禮拜四都來吃。','阿姨很高興，終於有人點大碗了。'],
  'choices':[ch('「妳想念她嗎？」','……嗯。她不在的時候，長桌太安靜。'),
             ch('「她吃得完嗎？」','吃不完，都是阿哲幫她吃。')],'rel':{'fam':2,'comf':1},
  'note':'接以安 A5-L8、A7-L1。2026-10-17 AA-C 照 AA_262 附錄 A 改稿'},
 {'id':'Y7-L5','if':st(YT,'FAMILIAR'),'week':[10,18],
  'lines':['我媽週四散步，現在走到總圖門口了。','……她說，要看我有沒有在讀書。'],
  'choices':[ch('「妳有嗎？」','有。……她站在門口看了十分鐘，就走了。'),
             ch('「下次請她進來。」','……她說不要。總圖是我的地方。',rel={'trust':1})],'rel':{'fam':2,'trust':1},
  'note':'接 Y6-L7；不寫病情'},
 {'id':'Y7-L6','if':st(YT,'FRIEND'),'week':[16,18],
  'lines':['二十三週年以後，店裡多了一張紅紙。阿姨每天都去看一下。','……她說，字寫得太醜了。可是不換。'],
  'choices':[ch('「誰寫的？」','我寫的。阿姨叫我寫，寫完又嫌醜。',rel={'trust':2}),
             ch('「明年還要寫嗎？」','阿姨說每年都要。我說那我先去練字。')],'rel':{'fam':2,'trust':2},'mem':'YT7_RED_PAPER',
  'note':'事件 15（12/14，第 15 週）之後，週次改 [16,18]；不講最後一碗端給誰。2026-10-17 AA-C 照 AA_262 附錄 A 改稿'},
 {'id':'Y7-L7','if':st(YT,'FRIEND'),'week':[10,18],
  'lines':['阿姨說，明年要再請一個工讀生。','她說她要學會禮拜天也休息。'],
  'choices':[ch('「阿姨休得住嗎？」','休不住。上禮拜天她又跑去店裡擦椅子。'),
             ch('「妳呢？」','我禮拜天陪我媽散步。走到麵店門口就回頭。',rel={'comf':1})],'rel':{'fam':2,'comf':1},
  'note':'原 Y7-L7（跨年三個人看煙火）搬到大四下 Y8-L0（AA_262 第 2 節）；這一層新寫，接 Y6-L2（阿姨休假擦椅子）、Y6-L7（媽媽散步）。2026-10-17 AA-C 照 AA_262 附錄 A 改稿'},
 {'id':'Y7-L8','if':st(YT,'FRIEND'),'week':[16,18],
  'lines':['期末考完，我要陪我媽去回診。','這次我先跟醫院約好了，不用一大早去排隊。'],
  'choices':[ch('「要我陪嗎？」','不用。你考完先去睡。'),
             ch('「需要我幫忙嗎？」','……不用。考完以後，陪我吃麵就好。')],'rel':{'fam':2,'comf':1},
  'note':'事件 16（12/21）之後，週次改 [16,18]；她這學期那一句留給事件 16 告白版；不寫病情。2026-10-17 AA-C 照 AA_262 附錄 A 改稿'},
],'greet':{'base':['（她朝你揮了一下手，又低頭寫東西。）','這學期報告很多，我在趕。','訪談課這學期我在旁邊看，換學弟妹問。','（她在打逐字稿）這個老闆講話好快。','你也在這裡讀啊。'],
 'when':[{'weekday':[4],'time':[17,21.5],'location':['library_hall','library'],'t':'（總圖三樓靠窗。她在打逐字稿。）週四我都在這裡。'},
         {'location':['noodle'],'weekday':[2],'time':[17.5,20],'t':'今天我顧店。你要吃什麼？'},
         {'weekday':[6],'time':[9,12],'location':['noodle'],'t':'（她在長桌上寫報告）店十一點才開，我先借桌子。'},
         {'week':[7,9],'t':'（她拿著系刊）你那本借別人了，這本先給你。'},
         {'weather':'rain','t':'又下雨。你有帶傘嗎？……沒有的話我有。'}]},
 'note':'大四上語彤：15b、二十三週年、分一點時間；階梯只寫事件之外。2026-10-17 AA-C 照 AA_262 附錄 A 改稿'}
def check(d):
    err=[]
    for cid,c in d['characters'].items():
        ids=[s['id'] for s in c['steps']]
        if len(ids)!=len(set(ids)): err.append(cid+' 層 id 重複')
        for s in c['steps']:
            for l in s['lines']+[x for li in s.get('linesIf',[])+s.get('extraIf',[]) for x in li['lines']]:
                if len(l)>60: err.append(f"{s['id']} 台詞太長：{l}")
            if len(s.get('choices',[]))>2: err.append(s['id']+' 選項超過 2')
            # 防卡關：if 只能放階段（stage）或 any 裡的階段／flagNum
            bad=[k for k in s.get('if',{}) if k not in ('stage','any')]
            if bad: err.append(f"{s['id']} 的 if 只能放階段（防卡關）：{bad}")
            if 'week' in s and s['week'][1]<18 and not s.get('skipIf'): err.append(f"{s['id']} 週次沒有放寬到第 18 週，也沒有 skipIf（會卡關）")
            for t in ('不准賴',):
                if cid==AN and any(t in x for x in s['lines']+[c2['reply'] for c2 in s.get('choices',[])]): err.append(f"{s['id']} 以安「不准賴」只用在論證")
        g=c.get('greet')
        if g and len(g['base'])!=5: err.append(cid+' 短招呼不是 5 句')
    return err
e=check(D)
if e: sys.exit('\n'.join(e))
if '--check' not in sys.argv:
    json.dump(D,open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'ladder_aa_y4s1.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('ok', {k:len(v['steps']) for k,v in D['characters'].items()})
