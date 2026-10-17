# -*- coding: utf-8 -*-
"""大三下（Y3S2）的閒聊階梯：語彤（heroine_03，留在台灣的玩家）→ ladder_aa_y3s2.json。作者：AA-B 2026-10-16。
原稿說明：../AA_150_閒聊階梯_大三下_語彤.md。格式同 ladder_aa_y3s1.json，term＝'Y3S2'。
**以安**：她 3/25 出發去日本（AA_201 甲）。出發前的五週（2/21～3/24）她在台灣、不修課，照生活運作過日子，**有 4 層**（2026-10-17 AA-C 補，AA_216 第十一節指出的缺口）；每一層 skipIf `AN_JP_DEPARTED`（LAWWW 在 2028-03-25 設，不管玩家有沒有去送機），出發以後沒聊到的層直接算過。日本期間是 2D 場景＋摘要日＋手機（AA_144 第 5 節、AA_145 3-6），不走 3D 閒聊。
**語彤只給留在台灣的玩家**：日本、美國路線的玩家人不在台灣，3D 遇不到她，所以不用另外擋（她每週一張田野照片走手機，AA_144 5-3）。
依據：交接包_v4_大三_骨架 第 3 節、3-1（T1 空出來的週四〔第 2 週起每週四〕、228〔第 3 週〕、杜鵑花第三張語彤代拍〔第 4 週〕、田野的發現〔第 6 週〕、G5 子晴芷若畢業〔第 16 週〕、期末「大四要怎麼過」〔第 18 週〕）、AA_11 大三下、AA_30 場景 T1。
**不搶事件的戲**：T1 的田野場景（水源市場阿嬤那句）、田野的發現，階梯都不講。
**防卡關**：`if` 只放階段；週次放寬到第 18 週。
用法：python3 build_ladder_aa_y3s2.py → ladder_aa_y3s2.json；--check 只檢查。"""
import json, sys, os
Y='Y3S2'
def st(npc, mn): return {'stage': {'npc': npc, 'min': mn}}
def ch(t, reply, rel=None, mem=None):
    c = {'t': t, 'reply': reply}
    if rel: c['rel'] = rel
    if mem: c['mem'] = mem
    return c
AN='heroine_01'; YT='heroine_03'
D = {'_comment': __doc__, 'term': Y, 'characters': {}}

D['characters'][AN] = {'steps': [
 {'id':'A6-L1','if':st(AN,'ACQUAINTANCE'),'skipIf':{'flags':['AN_JP_DEPARTED']},
  'lines':['這學期我沒有課表。','第一個禮拜一，我還是八點就醒了。……然後不知道要去哪裡。'],
  'choices':[ch('「去總圖？」','去了。三樓的位子，現在都是學弟妹在坐。'),
             ch('「睡回去。」','我試了，睡不著。理由：鬧鐘還沒改。',rel={'comf':1})],'rel':{'fam':2},
  'note':'出發前的五週（AA_201 第 2 節）：不修課、照生活運作；不寫成「最後的日子」'},
 {'id':'A6-L2','if':st(AN,'ACQUAINTANCE'),'skipIf':{'flags':['AN_JP_DEPARTED']},
  'lines':['在留資格的文件寄來了。','我把它放在護照旁邊，每天晚上確認一次還在。'],
  'choices':[ch('「它不會跑掉。」','我知道。……我還是會確認。'),
             ch('「緊張嗎？」','有一點。準備好了，可是還沒開始。',rel={'trust':1})],'rel':{'fam':2}},
 {'id':'A6-L3','if':st(AN,'FAMILIAR'),'skipIf':{'flags':['AN_JP_DEPARTED']},
  'lines':['讀書會這幾週我還是會去，可是題目給小語排了。','她第一週排了一題「好玩的」。……真的滿好玩的。'],
  'choices':[ch('「什麼題目？」','學校可不可以規定學生不能染頭髮。大家吵到十點。'),
             ch('「妳會想念讀書會嗎？」','……會。可是我不說，小語會得意。',rel={'comf':1})],'rel':{'fam':2},
  'note':'接大二下 A4-L6（她排題目、小語要一題好玩的）'},
 {'id':'A6-L4','if':st(AN,'FRIEND'),'skipIf':{'flags':['AN_JP_DEPARTED']},
  'lines':['3/24 晚上，阿哲說要在麵店幫我餞行。','我說不用。他已經跟阿姨訂好位子了。'],
  'choices':[ch('「我會去。」','……好。你坐我旁邊。阿哲會講很多話，我需要有人分。',rel={'comf':2}),
             ch('「要帶什麼去日本？」','我列了一張表。第一項是電鍋。我媽說的。')],'rel':{'fam':2,'comf':1},
  'note':'3/24 19:00 以安的餞行（AA_201 第 1 節）'},
],'greet':{'base':['你今天有課嗎？我沒有。','我剛從總圖出來。……習慣了，還是會去。','日語課在晚上，我先去吃飯。','行李清單又多了一項。','三月底以前，我週四晚上都在萬才館。'],
 'when':[{'weekday':[4],'time':[19.5,20],'location':['wancai'],'t':'讀書會我還是會去。……今天是小語排的題目。'}]},
 'note':'大三下出發前的五週（2/21～3/24）；3/25 以後不在台灣'}

D['characters'][YT] = {'steps': [
 {'id':'Y6-L1','if':st(YT,'ACQUAINTANCE'),'week':[2,18],
  'lines':['週四晚上，我現在不知道要穿什麼。','……以前都穿圍裙。'],
  'choices':[ch('「穿妳想穿的。」','……嗯。我想穿圍裙。……開玩笑的。'),
             ch('「圍裙也很好看。」','……阿姨叫我週四不准穿。',rel={'comf':1})],'rel':{'fam':2,'comf':1},'mem':'YT6_THURSDAY',
  'note':'事件 13 空出來的週四（大三上第 17 週）之後；T1 第 2 週起'},
 {'id':'Y6-L2','if':st(YT,'ACQUAINTANCE'),'week':[3,18],
  'lines':['二二八那天麵店公休。阿姨在家睡到中午。','……她說二十三年第一次。醒來以後，她去店裡擦椅子。'],
  'choices':[ch('「休息也擦椅子。」','她說那不是工作，是看看它們。'),
             ch('「妳呢？」','我陪她擦。……我們兩個休息的方法一樣。')],'rel':{'fam':2,'comf':1},
  'note':'228 連假（第 3 週，AA_71）；回聲大一下 Y2-L1（過年擦椅子）'},
 {'id':'Y6-L3','if':st(YT,'ACQUAINTANCE'),'week':[5,18],
  'lines':['杜鵑花節那天，我陪以安去拍她的第三張。','她站的那個位置，樹是歪的。她拍了三年，都沒說。'],
  'choices':[ch('「她故意的吧。」','……嗯。以安說：歪的才是同一棵。'),
             ch('「妳也有拍嗎？」','有。我拍她在拍。……她說不算。可是她存起來了。')],'rel':{'fam':2},'mem':'YT6_AZALEA_FOR_AN',
  'note':'2026-10-17 AA-C（外部審稿閒聊 05＋AA_201）：日本路線改 3/25 出發，杜鵑花節（3/11～12）以安還在臺灣、自己拍第三張；語彤是陪她去。原本「以安在日本、請人代拍」的前提（AA_190、AA_144 5-3）作廢，所以不做祐廷代拍的版本、不加 linesIf'},
 {'id':'Y6-L4','if':st(YT,'FAMILIAR'),'week':[7,18],
  'lines':['公館有一家修鞋店。老闆說他記得每一雙鞋。','……可是不記得客人的臉。他說：鞋比較誠實。'],
  'choices':[ch('「那他記得妳的鞋嗎？」','……記得。他說我的鞋底磨的地方，跟阿姨一樣。',rel={'trust':1}),
             ch('「鞋比較誠實。」','我寫進筆記了。第二頁。')],'rel':{'fam':2,'trust':1},'mem':'YT6_COBBLER',
  'note':'田野的發現（第 6 週，v4 骨架 3b：同一家修鞋店，「你平常怎麼走路」放報告第一頁）之後的回訪；不重講那一句，所以這句寫在第二頁'},
 {'id':'Y6-L5','if':st(YT,'FAMILIAR'),'week':[9,18],
  'lines':['工讀生切蔥切得很醜。阿姨每天都說很好。','……她以前都說我切得不好。'],
  'choices':[ch('「妳吃醋了？」','……沒有。……有一點。'),
             ch('「阿姨在教他。」','嗯。她教我的時候，也是先說不好。……原來那也是在教。',rel={'trust':1})],'rel':{'fam':2,'comf':1},
  'note':'事件 14 之後請的工讀生（AA_11 大三下：國外的玩家收到第十二張照片就是這個）'},
 {'id':'Y6-L6','if':st(YT,'FRIEND'),'week':[11,18],
  'lines':['老師說，我的田野筆記可以寫成一篇報告。','……我說，那是客人的話，不是我的。'],
  'choices':[ch('「記下來的是妳。」','老師也這樣說。……我再想想。',rel={'trust':2}),
             ch('「問客人可不可以。」','……好。我去問。一個一個問。')],'rel':{'fam':2,'trust':2},'mem':'YT6_REPORT',
  'note':'事件 16（大四）田野筆記的伏筆；不說出路'},
 {'id':'Y6-L7','if':st(YT,'FRIEND'),'week':[13,18],
  'lines':['我媽說，週四我不在店裡，她不習慣。','……她也開始週四去散步了。走到麵店門口，再走回家。'],
  'choices':[ch('「她在看妳在不在。」','……嗯。我知道。所以我週四會先回去一下。'),
             ch('「下次一起走。」','……好。她走很慢。你要等。',rel={'comf':2})],'rel':{'fam':2,'trust':1},
  'note':'回聲大二上 Y3-L6（媽媽散步）；不寫病情'},
 {'id':'Y6-L8','if':st(YT,'FRIEND'),'week':[16,18],
  'lines':['暑假，我想再問阿姨一次。','……她上次說，她沒有故事。'],
  'choices':[ch('「這次她會說。」','……不知道。可是這次我會等她說完。',rel={'trust':2}),
             ch('「我可以陪妳問。」','……嗯。你坐旁邊就好。不要說話。阿姨看到你會想煮麵。',rel={'comf':2})],'rel':{'fam':2,'trust':2},'mem':'YT6_ASK_AUNT',
  'linesIf':[{'if':{'memory':[{'npc':YT,'tag':'YT2_INTERVIEW'}]},'lines':['暑假，我想再問阿姨一次。','……大一那次，你記得嗎。她說她沒有故事。']}],
  'note':'回聲大一下 Y2-L2（想訪問阿姨，阿姨說「我又沒有故事」）；大四事件 16b 阿姨的照片的伏筆'},
],'greet':{'base':['……嗯。','（她翻著田野筆記）……今天要問的，還沒想好。','……週二還是我顧店。週四是工讀生。','……以安傳了日本的早餐。好小一份。','……你也來了。'],
 'when':[{'weekday':[4],'time':[17,20],'t':'（她拿著田野筆記）……今天要去問修鞋的老闆。要一起嗎？'},
         {'location':['noodle'],'weekday':[2],'time':[17.5,20],'t':'……今天是我。阿哲他們坐老位子。'},
         {'location':['library_hall','library'],'weekday':[1,3,5],'time':[19,21.5],'t':'（她在靠窗的位子整理筆記）……嗯。'},
         {'weekday':[6],'time':[9,12],'location':['wancai'],'weekParity':'odd','t':'（她把椅子擺成斜的）……今天人比較少。'},
         {'weather':'rain','t':'……下雨。……田野改天。'}]},
 'note':'大三下留在台灣：週二麵店、週四田野（工讀生顧店）、一三五總圖、單週週六法服'}
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
    json.dump(D,open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'ladder_aa_y3s2.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('ok', {k:len(v['steps']) for k,v in D['characters'].items()})
