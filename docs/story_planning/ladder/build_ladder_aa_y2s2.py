# -*- coding: utf-8 -*-
"""大二下（Y2S2）的閒聊階梯：以安（heroine_01）、語彤（heroine_03）→ ladder_aa_y2s2.json。作者：AA-B 2026-10-16。
原稿說明：../AA_142_閒聊階梯_大二下_以安語彤.md。格式同 ladder_aa_y1s2.json，term＝'Y2S2'。
依據：交接包_v3_大二_骨架 大二下（杜鵑花第二張〔第 3 週〕、主線 8 交換說明會〔第 4 週〕、模擬法庭、以安新 11〔第 7 週〕新 12〔第 10 週〕新 13；
語彤事件 8 買賣不破租賃〔第 6 週〕、事件 9 迴避〔第 12 週〕、事件 11 想幫她〔第 14 週〕；學姊畢業 6/5〔第 15 週〕）、AA_113、AA_11。
**不搶事件的戲**：租約、迴避、想幫她、媽媽的晚餐（二）、訴願結果、模擬法庭的過程和結果，階梯都不講；語彤這學期的階梯只寫輕的日常。
**防卡關**：`if` 只放階段；週次放寬到第 18 週。
用法：python3 build_ladder_aa_y2s2.py → ladder_aa_y2s2.json；--check 只檢查。"""
import json, sys, os
Y='Y2S2'
def st(npc, mn): return {'stage': {'npc': npc, 'min': mn}}
def ch(t, reply, rel=None, mem=None):
    c = {'t': t, 'reply': reply}
    if rel: c['rel'] = rel
    if mem: c['mem'] = mem
    return c
AN='heroine_01'; YT='heroine_03'
D = {'_comment': __doc__, 'term': Y, 'characters': {}}

D['characters'][AN] = {'steps': [
 {'id':'A4-L1','if':st(AN,'ACQUAINTANCE'),'week':[3,18],'location':['campus'],
  'lines':['（她又對著同一叢杜鵑花舉起手機）……第二張。','跟去年比，樹變大了。……還是我變了。'],
  'choices':[ch('「都有吧。」','……嗯。一年了。'),
             ch('「給我看第一張。」','……不行。四張拍完才給看。')],'rel':{'fam':2},'mem':'AN4_AZALEA2',
  'linesIf':[{'week':[7,18],'lines':['杜鵑花謝了。三月的時候，我拍了第二張。','跟去年比，樹變大了。……還是我變了。']}],
  'extraIf':[{'unless':{'memory':[{'npc':AN,'tag':'AN2_AZALEA'}]},'lines':['……我每年在同一個位置拍一張。四年，四張。']}],
  'note':'四年四張的第二張（交接包 v3 第 3 週）；沒聽過第一張的玩家多一句說明'},
 {'id':'A4-L2','if':st(AN,'ACQUAINTANCE'),'week':[5,18],
  'lines':['交換說明會，我坐第一排。後面聽不清楚。','地方是早就決定的。……今天來聽細節。'],
  'choices':[ch('「決定哪裡？」','……地方決定了。理由還在寫。快寫完了。'),
             ch('「我也在想。」','那下次說明會，你坐我旁邊。第一排。',rel={'comf':1})],'rel':{'fam':2},'mem':'AN4_EXCHANGE_TALK',
  'note':'主線 8 交換說明會（第 4 週）之後；她國中就決定去日本（AA_30 第 40 行、手帳第一頁），所以不說「還沒決定」；**不說為什麼**（大三上新 15）'},
 {'id':'A4-L3','if':st(AN,'ACQUAINTANCE'),
  'lines':['我室友說，她明年要選樓長。','理由：她想把「記點以前先問」那一條，寫進規則。'],
  'choices':[ch('「妳會投她嗎？」','會。……她的政見只有一條。我很喜歡。'),
             ch('「妳教的？」','不是。她自己想的。……我只是幫她把字改短。')],'rel':{'fam':2,'trust':1},
  'note':'回聲大一下新 5（舍友的記點申訴）；沒遇過那件事的玩家也聽得懂'},
 {'id':'A4-L4','if':st(AN,'FAMILIAR'),
  'lines':['學生這次段考，數學考了七十分。','學生說，證明題終於有理由了。……這句我要記下來。'],
  'choices':[ch('「妳教得很好。」','……是學生自己找到的。我只是一直問「為什麼」。'),
             ch('「七十分很好嗎？」','上次四十二。理由很充分。')],'rel':{'fam':2,'comf':1},
  'linesIf':[{'unless':{'memory':[{'npc':AN,'tag':'AN3_TUTOR'}]},'lines':['我家教的學生，這次段考數學考了七十分。','學生說，證明題終於有理由了。……這句我要記下來。']}],
  'note':'接大二上 A3-L1；**不提學生家裡的事**（新 10、13 的戲）'},
 {'id':'A4-L5','if':st(AN,'FAMILIAR'),
  'lines':['日文老師說，我的敬語變少了。','……我在練習不要那麼有距離。不知道是好事還是壞事。'],
  'choices':[ch('「好事。」','……你這麼快就回答。……好，我收下。'),
             ch('「對誰練習？」','……對老師。還有一些人。')],'rel':{'fam':2,'comf':1},
  'linesIf':[{'unless':{'memory':[{'npc':AN,'tag':'AN3_KEIGO'}]},'lines':['日文老師說，我的敬語變少了。以前我用太多。','……我在練習不要那麼有距離。不知道是好事還是壞事。']}],
  'note':'接大二上 A3-L2。2026-10-17 AA-C（AA_215／AA_216 大二下 #3、R9）：和她交往中，選項②「對誰練習？」的回覆「還有一些人」對男朋友太遠，交往版建議「……對老師。還有你。」；選項不能加條件、格式沒有 replyIf，lines 不動，交 LAWWW（加 replyIf，或用 unless dating_heroine_01 拆成兩層）'},
 {'id':'A4-L6','if':st(AN,'FAMILIAR'),'week':[3,18],
  'lines':['讀書會的題目，這學期換我排。','小語說我排的每一題都很像考試。……因為我是照考古題排的。'],
  'choices':[ch('「那不是很好嗎？」','小語說要有一題好玩的。……我還在想，什麼叫好玩的。'),
             ch('「排一題好玩的。」','例如？……你下禮拜來講，我給你十五分鐘。',rel={'comf':1})],'rel':{'fam':2},
  'note':'AA_238 5-6（2026-10-17 AA-C）：原 A4-L6（滿一年）搬到大二上 A3-L9，補這一層維持每學期 8 層。大二上新 8「規則太多」以後，大二下由她排題目（needed_msgs an_lead 同一學期）'},
 {'id':'A4-L7','if':st(AN,'FRIEND'),
  'lines':['大三要選交換的志願了。','我第一次覺得，選一個地方，就是放下另外一個。'],
  'choices':[ch('「放下什麼？」','……讀書會。家教。……還有一些人。我會回來，可是會錯過。',rel={'trust':2}),
             ch('「妳會選對的。」','……沒有對的。只有理由寫得完整的。')],'rel':{'fam':2,'trust':2},'mem':'AN4_CHOOSING',
  'note':'大三上申請、大三下出發（主線 8；交換延畢照 AA_137 第 2 節，這裡不提延畢）。2026-10-17 AA-C（AA_215／AA_216 大二下 #3、R9）：和她交往中，選項①「放下什麼？」的回覆「……還有一些人。」交往版建議「……讀書會。家教。……還有你。我會回來，可是會錯過。」；格式沒有 replyIf，lines 不動，交 LAWWW（加 replyIf，或用 unless dating_heroine_01 拆成兩層）'},
 {'id':'A4-L8','if':st(AN,'FRIEND'),'week':[16,18],
  'lines':['暑假七月底回台中兩週。剩下的，要準備交換的申請。','第一次，暑假排滿了。……我有一點想念沒排的那一年。'],
  'choices':[ch('「留一天給自己。」','……好。理由欄寫：留白。',rel={'comf':2}),
             ch('「申請加油。」','……嗯。寫完給你看。只看第一頁。')],'rel':{'fam':2,'comf':1},'mem':'AN4_SUMMER',
  'linesIf':[{'if':{'memory':[{'npc':AN,'tag':'AN2_SUMMER'}]},'lines':['暑假七月底回台中兩週。剩下的，要準備交換的申請。','去年你說沒排也很好。……今年排滿了。我有一點想念去年。']}],
  'note':'接大一下 A2-L8（第一次沒排的暑假）'},
],'greet':{'base':['早。今天的債各很重要。……每一堂都很重要。','我剛家教完。學生今天沒有翻白眼。進步。','（她把交換說明會的資料夾在手帳裡）……只是先收著。','讀書會今天多讀一題。你要來嗎？','霖澤館的冷氣今天很強。我帶了外套。去年冷過一次。'],
 'when':[{'weekday':[4],'time':[19,21],'location':['wancai'],'t':'讀書會快開始了。今天小語帶了雞蛋糕。……我同意的。'},
         {'week':[3,6],'location':['campus'],'t':'杜鵑花開了。……第二張，我拍了。'},
         {'week':[8,9],'t':'期中。手帳右欄：還可以。……我知道，不是進度。'},
         {'location':['library_hall','library'],'weather':'rain','t':'下雨了。我的傘在室友那裡。……她說會還。'},
         {'week':[16,18],'t':'期末了。我把交換的申請表印出來了。……先不寫。考完再寫。'}]},
 'note':'大二下以安：模擬法庭、讀書會、家教、交換說明會；事件新 11～13 照交接包 v3'}

D['characters'][YT] = {'steps': [
 {'id':'Y4-L1','if':st(YT,'ACQUAINTANCE'),'week':[1,18],
  'lines':['過年店休三天。我帶阿姨去看海。','她在沙灘上坐了一個小時，什麼都沒說。回來的路上，她說：明年還要。'],
  'choices':[ch('「阿姨開心嗎？」','……嗯。她回來那天，湯煮得特別鹹。她開心的時候都這樣。'),
             ch('「妳呢？」','……我也開心。我的湯沒有變鹹。')],'rel':{'fam':2,'comf':1},'mem':'YT4_SEA_TRIP',
  'linesIf':[{'if':{'memory':[{'npc':YT,'tag':'YT3_SEA'}]},'lines':['過年，我們真的去看海了。','阿姨在沙灘上坐了一個小時。回來的路上，她說：明年還要。']}],
  'note':'接大二上 Y3-L8（想帶阿姨去看海）'},
 {'id':'Y4-L2','if':st(YT,'ACQUAINTANCE'),
  'lines':['訪談課的作業，我的筆記寫到第三本了。','我發現椅子擺成斜的，人比較敢講。……正對著，像在被問話。'],
  'choices':[ch('「妳自己發現的？」','看了很多次。'),
             ch('「下次教我。」','……好。先學倒水。')],'rel':{'fam':2},'mem':'YT4_CHAIRS'},
 {'id':'Y4-L3','if':st(YT,'ACQUAINTANCE'),
  'lines':['我想做一個田野。……還不知道題目。','老師說，題目會自己來找你。我說，那它要找得到麵店。'],
  'choices':[ch('「麵店本身就是題目。」','……嗯。可能。……先不要跟阿姨說。'),
             ch('「題目會來的。」','我在等。我很會等。')],'rel':{'fam':2,'trust':1},
  'note':'大三事件 14 準備（記下老客人的話＝她第一次做田野）、事件 15 的伏筆；不提租約'},
 {'id':'Y4-L4','if':st(YT,'FAMILIAR'),'week':[8,18],
  'lines':['阿姨最近開始學記帳。用手機。','她記錯了三次。我幫她改。她說我很囉嗦。'],
  'choices':[ch('「囉嗦是幫忙。」','我也這樣跟她說。她說：一樣囉嗦。'),
             ch('「需要我幫忙嗎？」','……不用。你陪我吃麵就好。')],'rel':{'fam':2,'comf':1},
  'note':'續約前的準備在背景（AA_11 事件 14「準備」）；**不說為什麼開始記帳**（租約是事件 8、9 的戲）。選項 2 的回答和事件 11 的「陪我吃麵就好」同方向，事件 11 之前或之後都說得通'},
 {'id':'Y4-L5','if':st(YT,'FAMILIAR'),
  'lines':['阿哲跟小語現在都坐同一桌。','阿姨每次都多給他們一雙筷子。……不知道為什麼。'],
  'choices':[ch('「阿姨在祝福他們。」','阿姨的祝福，都是用筷子。'),
             ch('「他們會用嗎？」','……不會。可是每次都收下。')],'rel':{'fam':2}},
 {'id':'Y4-L6','if':st(YT,'FRIEND'),
  'lines':['我媽說想來店裡幫忙。阿姨說不行。','兩個人吵了一個晚上。……最後我媽負責剝蒜頭。'],
  'choices':[ch('「跟妳小時候一樣。」','她剝得比我慢。可是她說她剝得比較漂亮。',rel={'trust':1}),
             ch('「妳媽媽身體還好嗎？」','……嗯。剝蒜頭可以。她很高興。')],'rel':{'fam':2,'trust':2},'mem':'YT4_MOM_GARLIC',
  'note':'回聲大一上 Y-L3（剝蒜頭）、大二上 Y3-L6（媽媽散步）；不寫病情'},
 {'id':'Y4-L7','if':st(YT,'FRIEND'),'week':[16,18],
  'lines':['學姊畢業了。初談組現在是我在顧。','……我把椅子都擺成斜的了。'],
  'choices':[ch('「妳會顧得很好。」','你說的，我記著。'),
             ch('「學姊說了什麼？」','……她說了很多。我只記得一句。不告訴你。')],'rel':{'fam':2,'trust':2},'mem':'YT4_INTAKE_LEAD',
  'note':'學姊大二下第 15 週畢業（6/5）；語彤接初談組長（交接包 v3 第 4 節）。**學姊的話不直接引用**（學姊是 BB-B 的人物）'},
 {'id':'Y4-L8','if':st(YT,'FRIEND'),'week':[16,18],
  'lines':['暑假我要開始訪問老客人。阿姨說，客人的話比菜單還長。','……第一個要訪問的，是每天點乾麵的那個阿伯。'],
  'choices':[ch('「我可以幫妳記。」','……嗯。你字很醜。……好。',rel={'comf':2}),
             ch('「他會說什麼？」','……不知道。所以要問。')],'rel':{'fam':2,'comf':1},'mem':'YT4_FIELDWORK',
  'note':'大三事件 14「語彤把老客人說的話記下來」的開始（背景）；不說是為了續約',
  'location':['noodle','campus','library_hall','library','wenzhou'],'locTime':{'noodle':{'weekday':[2,4],'time':[20,20.5]}}},
],'greet':{'base':['……嗯。','（她抱著第三本初談記錄本）……要買新的了。','……阿姨今天換了新的湯勺。她說舊的會想念。','……總圖今天冷氣好強。我帶了外套。','……你也來了。'],
 'when':[{'weekday':[6],'time':[9,12],'location':['wancai'],'t':'（她把椅子擺成斜的）……先坐。要喝水嗎？'},
         {'location':['noodle'],'weekday':[2,4],'time':[17.5,20],'t':'……今天客人多。阿哲他們坐老位子。'},
         {'location':['library_hall','library'],'weekday':[1,3,5],'time':[19,21.5],'t':'（她在靠窗的位子，小聲）……嗯。'},
         {'week':[8,9],'t':'……期中。今天不顧店，念書。'},
         {'weather':'rain','t':'……下雨了。我帶了兩把。'}]},
 'note':'語彤的日程照舊（週二四麵店、一三五總圖、隔週週六法服）。這學期她的重頭戲在事件 8、9、11，階梯只寫輕的'}
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
    json.dump(D,open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'ladder_aa_y2s2.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('ok', {k:len(v['steps']) for k,v in D['characters'].items()})
