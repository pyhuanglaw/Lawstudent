# -*- coding: utf-8 -*-
"""AA_135（以安）、AA_136（語彤）→ ladder_aa.json（給 LAWWW-B 直接實作）。作者：AA-B 2026-10-15（使用者 2026-10-15：大一上閒聊全案通過，直接實作）。
格式和 ladder_bb.json 完全一樣（欄位說明：README.md）。以安 heroine_01、語彤 heroine_03。
用法：python3 build_ladder_aa.py → ladder_aa.json；python3 build_ladder_aa.py --check 只檢查。"""
import json, sys, os
Y='Y1S1'
def st(npc, mn): return {'stage': {'npc': npc, 'min': mn}}
def ch(t, reply, rel=None, mem=None):
    c = {'t': t, 'reply': reply}
    if rel: c['rel'] = rel
    if mem: c['mem'] = mem
    return c
AN='heroine_01'; YT='heroine_03'
D = {'_comment': __doc__, 'term': Y, 'characters': {}}

D['characters'][AN] = {'steps': [
 {'id':'A-L1','if':st(AN,'ACQUAINTANCE'),'dayMin':3,
  'note':'主線民總那天（新遊戲 9/4、舊存檔 9/18；以安追出來、Café 或總圖）的事件之後。2026-10-16：dayMin 改由 LAWWW-B 看 meetAn 演過（開局選 1）',
  'lines':['你上課都抄在哪？手機還是紙本？'],
  'choices':[ch('「手機。」','手機喔。考前不會一直要充電嗎？',mem='AN_L1_NOTES_PHONE'),
             ch('「紙本。」','那考前可以互借嗎？我民總有一段沒抄到。',mem='AN_L1_NOTES_PAPER')],'rel':{'fam':2}},
 {'id':'A-L2','if':st(AN,'ACQUAINTANCE'),'location':['linze','classroom','library_hall','library','campus'],
  'lines':['（她的手帳攤在桌上，每頁分兩欄，右邊那欄寫得比左邊還多。）','你在看這個喔？待辦事項啦。','右邊寫為什麼要做，不然我會一直拖。'],
  'rel':{'fam':2},'mem':'AN_L2_PLANNER'},
 {'id':'A-L3','if':st(AN,'ACQUAINTANCE'),
  'lines':['你住宿舍？我也是。大一女舍。','我們那棟的規則有十七頁。我讀完了。'],
  'choices':[ch('「十七頁？」','其中有三頁在講吹風機。'),
             ch('「妳全部讀完？」','嗯，反正睡不著。有幾條寫得很怪，我下禮拜樓層會議要問。')],'rel':{'fam':2},'mem':'AN_L3_DORM',
  'note':'伏筆：AA_113 事件 3「宿舍的規則」（ev_an_dorm_rules_peishan）；「規則是我們要住的，總要有人讀完」留給那個事件，這裡不說'},
 {'id':'A-L4','if':st(AN,'ACQUAINTANCE'),
  'lines':['我家在台中，坐高鐵一個小時。','我媽每個月會約我吃一次飯。她很忙，所以那天我都不排別的。'],
  'rel':{'fam':2,'trust':1},'mem':'AN_L4_HOME','note':'不說媽媽的職業（法官）：大四畢業典禮才第一次對朋友說（AA_113 事件 21）'},
 {'id':'A-L5','if':st(AN,'ACQUAINTANCE'),'week':[4,18],'location':['linze','classroom','campus'],
  'lines':['憲法課你坐哪？我都坐第三排。','第一排看黑板要一直抬頭，脖子會痛。'],
  'rel':{'fam':2},'mem':'AN_L5_CONST','note':'她的 3D 座位要在前三排（遊戲民總寫「前排的小安」）'},
 {'id':'A-L6','if':st(AN,'ACQUAINTANCE'),'location':['noodle','cafe','library_hall','library'],
  'lines':['欸，你們宿舍有沒有那種規定，寫得很清楚，可是怪怪的？','我們那邊說十一點以後不能用吹風機，可是很多人十一點才洗完澡。'],
  'choices':[ch('（說一個你們宿舍的規定）','那個真的很怪。你有去問舍監嗎？',mem='AN_L6_RULE_EXAMPLE'),
             ch('「沒有欸，我都照規定。」','也是啦，照規定最省事。',mem='AN_L6_RULE_NONE')],'rel':{'fam':2},
  'note':'回聲：大一下 ev_an_dorm_appeal 可以加一句「你上學期講的那個例子，我後來還在想。」（AN_L6_RULE_EXAMPLE）'},
 {'id':'A-L7','if':st(AN,'FAMILIAR'),
  'lines':['我早上六點會去操場跑步。','那時候人比較少。'],
  'rel':{'fam':2,'comf':1},'mem':'AN_L7_RUN'},
 {'id':'A-L8','if':st(AN,'FAMILIAR'),'week':[8,18],
  'lines':['期中準備得怎樣？'],
  'linesIf':[{'week':[10,18],'lines':['期中考完了，你考得怎樣？']}],
  'choices':[ch('「還好。」','那就好。'),
             ch('「很慘。」','哪一科？民總的話，88 條那段我有整理，你拿去看。',rel={'trust':2})],'rel':{'fam':2},'mem':'AN_L8_MIDTERM'},
 {'id':'A-L9','if':st(AN,'FRIEND'),'location':['library_hall','library','linze','classroom'],
  'week':[4,9],
  'lines':['你期中哪一週最多？期中考那週我有三科。'],
  'choices':[ch('「我也是那週。」','那那週大概都不用約吃飯了。'),
             ch('「我還沒看。」','課程網有，你看一下。我怕撞到宿舍的會議。')],
  'rel':{'fam':2,'trust':1},'mem':'AN_L9_MIDTERM_WEEK',
  'note':'2026-10-16 改（使用者 20:3x，AA_193 第 8 組）：原本擦身而過就講童年「因為我說了算」，移到大一下 ev_an_dorm_appeal（她為「記點以前沒人問」生氣時，選「我想先聽妳的」多一句）；AN_L9_REASON 不再記'},
 {'id':'A-L11','if':st(AN,'FAMILIAR'),'week':[10,18],
  'lines':['公法讀書會開始了，每個人輪流講十分鐘。','班上的小語說要可以吃東西，我就答應了，反正是晚上。'],
  'choices':[ch('「小語也會去？」','會。她是第一個說要來的。……她說她是被憲法逼的。'),
             ch('「我可以去嗎？」','可以啊，週四晚上八點，B館研討室。')],'rel':{'fam':2},
  'linesIf':[{'if':{'events':['ev_public_law_group']},'lines':['這禮拜讀憲法，你要講哪一段先跟我說。']}],
  'note':'AA_238 5-5（2026-10-17 AA-C）：讀書會改到大一上第 10 週（AA_218 17-4），原大一下 A2-L6 搬來。「我可以去嗎？」照 LADDER_CHOICE_IF 加 A-L11：notEvents ev_public_law_group。週次上限寫 18 不影響 16 週制（第 17、18 週不存在）'},
 {'id':'A-L10','if':st(AN,'FRIEND'),'week':[14,18],
  'lines':['寒假你回臺北的家，對吧。','我回台中。我媽說今年要教我做一道菜，她只會那一道。'],
  'choices':[ch('「是什麼菜？」','她不講，說講了我會先上網查。'),
             ch('「寒假傳照片來。」','好啊，你也要傳喔。',mem='AN_L10_PHOTO_PROMISE')],'rel':{'fam':2,'comf':2},'mem':'AN_L10_WINTER'},
],'greet':{'base':['你今天還有課嗎？','我剛從總圖出來，三樓今天位子很多。','你等一下要去哪？','晨思鐘下面有一隻貓，好像每天都在。','今天的進度我抄完了。你要的話晚上傳給你。'],
 'when':[{'time':[6,8],'location':['campus'],'t':'（她穿著運動服，剛跑完）……不要看。我還沒換衣服。'},
         {'location':['classroom','linze'],'time':[8,12],'t':'第三排還有位子，要坐嗎？'},
         {'location':['library_hall','library'],'t':'（她小聲）外面說。'},
         {'location':['noodle'],'t':'你點好了嗎？我還在看菜單。'},
         {'weekday':[5],'time':[17,24],'week':[4,4],'t':'這個週末我要回台中。'},
         {'weekday':[5],'time':[17,24],'week':[8,8],'t':'這個週末我要回台中。'},
         {'weekday':[5],'time':[17,24],'week':[12,12],'t':'這個週末我要回台中。'},
         {'weekday':[5],'time':[17,24],'week':[16,16],'t':'考完我還會留在臺北一個月。'},
         {'week':[16,18],'t':'期末了。我這週手帳只寫了一個字：睡。'}]},
 'note':'以安和祐廷同為法律系一年級：重疊的必修（民總、憲法、刑總一…）她一定在教室（使用者 2026-10-15 第 5 點），平常的作息不要把她放在總圖'}

D['characters'][YT] = {'steps': [
 {'id':'Y-L1','if':{**st(YT,'ACQUAINTANCE'),'any':[{'events':['ev_rain_library_door']},{'events':['ev_noodle_yutong']},{'events':['ev_library_door_phone']}]},
  'lines':['你是那天在總圖門口的嘛。'],
  'choices':[ch('「妳記性很好欸。」','店裡客人很多，看久了就記得。'),
             ch('「妳也記得？」','嗯，那天雨很大。')],'rel':{'fam':2},
  'linesIf':[{'if':{'events':['ev_library_door_phone']},'unless':{'events':['ev_rain_library_door']},'lines':['你是那天在總圖門口，我問你幾點的那個。']}],
  'note':'linesIf：沒遇過總圖門口的雨（只在麵店認識）的玩家，台詞換成這一套，選項照用'},
 {'id':'Y-L2','if':st(YT,'ACQUAINTANCE'),'location':['campus','library_hall','library'],
  'lines':['社會系第一堂課，老師叫我們寫「你從哪裡來」。','我寫汀州路。老師說可以再多寫一點。','我不知道還要寫什麼。你們法律系也有這種作業嗎？'],'rel':{'fam':2}},
 {'id':'Y-L3','if':st(YT,'ACQUAINTANCE'),'location':['noodle','campus'],'locTime':{'noodle':{'weekday':[2,4],'time':[20,20.5]}},
  'lines':['我從小在阿姨的麵店剝蒜頭。','一個晚上可以剝兩斤。沒有薪水，有麵吃。'],
  'choices':[ch('「兩斤是多少？」','很多啦。手會臭好幾天。'),ch('「現在還剝嗎？」','週二、週四都要。手會一直有蒜味。')],'rel':{'fam':2,'comf':2},
  'note':'locTime：在麵店只有週二、四 20:00～20:30（客人少的時候）推進；她的日程週二四 17:30～20:30 在麵店，其他時段在麵店只給短招呼'},
 {'id':'Y-L4','if':st(YT,'FAMILIAR'),
  'lines':['我媽很愛笑，跟我差很多。','她常說我講話太省，客人會以為我在生氣。'],'rel':{'fam':2},'mem':'YT_MOM_HEARD'},
 {'id':'Y-L5','if':st(YT,'FAMILIAR'),'location':['library_hall','library'],
  'lines':['我都坐三樓靠窗，看得到外面有沒有在下雨。','我常常忘記帶傘。'],
  'choices':[ch('「下次我幫妳看天氣。」','好啊，那你要記得喔。'),ch('「那妳要記得帶傘。」','（她笑了一下）好。')],'rel':{'fam':2,'comf':2},
  'extraIf':[{'if':{'memory':[{'npc':YT,'tag':'HELPED'}]},'lines':['你那把傘還在我們店的櫃台，你要記得拿。']}],
  'note':'extraIf：雨天的總圖門口選「傘給她」（HELPED；flags.rain_umbrella＝give）的玩家，她說完這一層的台詞後多一句'},
 {'id':'Y-L6','if':st(YT,'FAMILIAR'),'week':[6,18],
  'lines':['我今天社會學被點到。','講完老師說很好，可是我有點忘記我講了什麼。'],
  'choices':[ch('「妳講了什麼？」','就是老店的熟客會賒帳那個。阿姨櫃台有一本，我小時候看過。'),ch('「被稱讚很好啊。」','可能吧，我是緊張到忘記。')],'rel':{'fam':2,'trust':2},'mem':'YT_CLASS_PRAISED'},
 {'id':'Y-L7','if':st(YT,'FAMILIAR'),'unlessWeekdayTime':{'weekday':[2,4],'time':[17.5,20.5]},
  'lines':['我媽每個月要回診一次，都排在週末，我陪她去。','醫院等很久，我都在看旁邊的人。','……欸，你吃飯了嗎？'],
  'rel':{'fam':2,'trust':3},'note':'沒有選項：她自己換話題，玩家不追問病況（不寫病名、病情穩定，AA_11 第 0 節）'},
 {'id':'Y-L8','if':{'any':[st(YT,'FRIEND'),{**st(YT,'FAMILIAR'),'flagNum':{'NOODLE_VISITS':{'min':3}}}]},'location':['noodle','wenzhou'],'locTime':{'noodle':{'weekday':[2,4],'time':[20,20.5]}},
  'lines':['我小時候最喜歡快打烊的時候。','阿姨把椅子倒放在桌上，店裡一下子變很大。','現在八點半就下班了，都看不到。'],
  'choices':[ch('「那哪天陪妳等一次。」','好啊，哪天我顧到打烊再跟你說。'),
             ch('「打烊以後妳都在幹嘛？」','幫阿姨擦桌子，然後一起吃剩下的滷味。')],'rel':{'fam':2,'comf':3},'mem':'YT_TEN_MINUTES',
  'note':'NOODLE_VISITS：在麵店吃過的次數（沒有這個計數就用 LAWWW-B 現有的麵店造訪紀錄）'},
],'greet':{'base':['（她點了一下頭）嗨。','你吃飯了嗎？','我等一下要去總圖。','我要先走了，下次說。','（她把髮圈從手腕拿下來，綁了頭髮，揮了一下手）'],
 'when':[{'location':['noodle'],'weekday':[2,4],'time':[17.5,20],'t':'（她端著兩碗麵經過）等我一下。'},
         {'location':['library_hall','library'],'weather':'rain','t':'下雨了。我今天有帶傘。'},
         {'location':['gongguan','wenzhou'],'t':'那家豆花換老闆了，你有吃過嗎？'},
         {'weekday':[0,6],'t':'我等一下要陪我媽，先走喔。'}]},
 'note':'語彤的日程：週二四 17:30～20:30 麵店；一三五 19:00～21:30 總圖（characters.js）。她只在遇過她以後才有階梯'}

def check(d):
    err=[]
    for cid,c in d['characters'].items():
        ids=[s['id'] for s in c['steps']]
        if len(ids)!=len(set(ids)): err.append(cid+' 層 id 重複')
        for s in c['steps']:
            for l in s['lines']:
                if len(l)>60: err.append(f"{s['id']} 台詞太長：{l}")
            if len(s.get('choices',[]))>2: err.append(s['id']+' 選項超過 2')
        g=c.get('greet')
        if g and len(g['base'])!=5: err.append(cid+' 短招呼不是 5 句')
    return err
e=check(D)
if e: sys.exit('\n'.join(e))
if '--check' not in sys.argv:
    json.dump(D,open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'ladder_aa.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('ok', {k:len(v['steps']) for k,v in D['characters'].items()})
