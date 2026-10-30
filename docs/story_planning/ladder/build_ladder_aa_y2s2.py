# -*- coding: utf-8 -*-
"""大二下（Y2S2）的閒聊階梯：以安（heroine_01）、語彤（heroine_03）→ ladder_aa_y2s2.json。作者：AA-B 2026-10-16。
原稿說明：../AA_142_閒聊階梯_大二下_以安語彤.md。格式同 ladder_aa_y1s2.json，term＝'Y2S2'。
依據：交接包_v3_大二_骨架 大二下（杜鵑花第二張〔第 3 週〕、主線 8 交換說明會〔第 4 週〕、以安新 11〔第 7 週〕新 12〔第 10 週〕新 13；
語彤事件 8 買賣不破租賃〔第 6 週〕、事件 9 陪阿姨來〔第 13 週〕、事件 11 想幫她〔第 15 週〕；~~學姊畢業 6/5~~（她大二是碩一，AA_218））、AA_113、AA_11。
**不搶事件的戲**：租約、迴避、想幫她、媽媽的晚餐（二）、訴願結果，階梯都不講（模擬法庭 2026-10-17 使用者刪除，AA_252）；語彤這學期的階梯只寫輕的日常。
**防卡關**：`if` 只放階段；週次放寬到第 18 週（2026-10-17 AA-C：16 週制，AA_198；學期不會推進到第 17、18 週，放寬只是不卡關，上限不統一）。
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
  'lines':['（她又對著同一叢杜鵑花舉起手機）……第二張。','跟去年比，好像長高了一點。'],
  'choices':[ch('「真的耶。」','我回去要把兩張放在一起比。'),
             ch('「給我看第一張。」','……不行。四張拍完才給看。')],'rel':{'fam':2},'mem':'AN4_AZALEA2',
  'linesIf':[{'week':[7,18],'lines':['杜鵑花謝了。我三月有去拍第二張。','跟去年比，好像長高了一點。']}],
  'extraIf':[{'unless':{'memory':[{'npc':AN,'tag':'AN2_AZALEA'}]},'lines':['我每年都在同一個地方拍一張，想拍滿四年。']}],
  'note':'四年四張的第二張（交接包 v3 第 3 週）；沒聽過第一張的玩家多一句說明。2026-10-17 AA-C 照 AA_255 附錄 A 改稿（拿掉「還是我變了」）'},
 {'id':'A4-L2','if':st(AN,'ACQUAINTANCE'),'week':[5,18],
  'lines':['上次的交換說明會，我坐第一排，後面聽不清楚。','去哪裡我早就決定了，去是想聽細節。'],
  'choices':[ch('「決定哪裡？」','日本，國中就決定了。'),
             ch('「我也在想。」','真的？那你先看簡章，要準備的東西比想的多。',rel={'comf':1})],'rel':{'fam':2},'mem':'AN4_EXCHANGE_TALK',
  'note':'主線 8 交換說明會（第 4 週週四）之後，所以說「上次」；她國中就決定去日本（AA_30、AA_253 第 1 節：讓玩家知道她要出國）；**不說為什麼**（大三上新 15）。2026-10-17 AA-C 照 AA_255 附錄 A 改稿'},
 {'id':'A4-L3','if':st(AN,'ACQUAINTANCE'),
  'lines':['我室友說，她明年要選樓長。','她說要把「記點以前先問」那條寫進宿舍規則。'],
  'choices':[ch('「妳會投她嗎？」','會啊，我還要幫她發傳單。'),
             ch('「妳教的？」','她自己想的。我只有幫她看錯字。')],'rel':{'fam':2,'trust':1},
  'note':'回聲大一下新 5（舍友的記點申訴）；沒遇過那件事的玩家也聽得懂。2026-10-17 AA-C 照 AA_255 附錄 A 改稿'},
 {'id':'A4-L4','if':st(AN,'FAMILIAR'),
  'lines':['我家教的學生，這次段考數學七十分。','上次才四十二。'],
  'choices':[ch('「妳教得很好。」','是學生自己願意寫。我只是每一題都叫人家講一遍給我聽。'),
             ch('「學生有很開心嗎？」','有，傳了考卷的照片給我，分數圈了三圈。')],'rel':{'fam':2,'comf':1},
  'note':'接大二上 A3-L1；**不提學生家裡的事**（新 10、13 的戲）；不寫學生性別。2026-10-17 AA-C 照 AA_255 附錄 A 改稿（兩版合成一版）'},
 {'id':'A4-L5','if':st(AN,'FAMILIAR'),
  'lines':['日文老師說，我這學期敬語用得比較少了。','她說聽起來比較自然。可是考試還是要寫敬語。'],
  'choices':[ch('「那很好啊。」','嗯，只是我自己還不習慣。'),
             ch('「妳跟我講話好像也是。」','真的？我自己沒發現。',rel={'comf':1})],'rel':{'fam':2,'comf':1},
  'linesIf':[{'unless':{'memory':[{'npc':AN,'tag':'AN3_KEIGO'}]},'lines':['日文老師說，我的敬語變少了。以前我用太多。','她說聽起來比較自然。可是考試還是要寫敬語。']}],
  'note':'接大二上 A3-L2。2026-10-17 AA-C 照 AA_255 附錄 A 改稿。**給 LAWWW**：`LADDER_REPLY_IF`（story3d.js:462）的 key 改成新的選項②「妳跟我講話好像也是。」，交往版回覆「真的？……跟你講話本來就不用敬語啊。」'},
 {'id':'A4-L6','if':st(AN,'FAMILIAR'),'week':[3,18],
  'lines':['讀書會這學期的題目，小語說每一題都很像考試。','她說至少要有一題好玩的。'],
  'choices':[ch('「那不是很好嗎？」','我也覺得很好。可是小語說她都在打瞌睡。'),
             ch('「排一題好玩的。」','例如？……你下禮拜來講，我給你十五分鐘。',rel={'comf':1})],'rel':{'fam':2},
  'note':'AA_238 5-6：原 A4-L6（滿一年）搬到大二上 A3-L9。2026-10-17 AA-C（AA_255 第 2 節裁定）：不說這學期誰排題目（和 P4 交接、STUDYGROUP_LEADER 不衝突）'},
 {'id':'A4-L7','if':st(AN,'FRIEND'),
  'lines':['大三上就要交交換的志願表了。','我在想，去了以後，讀書會跟家教怎麼辦。'],
  'choices':[ch('「讀書會可以先交給小語。」','嗯。家教比較難，學生才剛習慣我。',rel={'trust':2}),
             ch('「妳一定會去吧？」','會。只是要先想好回來以後怎麼辦。')],'rel':{'fam':2,'trust':2},'mem':'AN4_CHOOSING',
  'note':'大三上第 11 週交志願表、大三下 2028-03-25 出發（AA_253）。2026-10-17 AA-C 照 AA_255 附錄 A 改稿。**給 LAWWW**：`LADDER_REPLY_IF`（story3d.js:463）的 key 改成新的選項①「讀書會可以先交給小語。」，交往版回覆「嗯。……還有你，半年見不到。」（志願表還沒交，她不知道你會不會一起去）'},
 {'id':'A4-L8','if':st(AN,'FRIEND'),'week':[14,18],
  'lines':['暑假我七月底回台中兩週，其他時間要準備交換的申請，還有日文。','整個暑假都排滿了。'],
  'choices':[ch('「留一天給自己。」','好，我留一天什麼都不排。',rel={'comf':2}),
             ch('「申請加油。」','謝謝。讀書計畫寫好了，可以幫我看嗎？')],'rel':{'fam':2,'comf':1},'mem':'AN4_SUMMER',
  'linesIf':[{'if':{'memory':[{'npc':AN,'tag':'AN2_SUMMER'}]},'lines':['暑假我七月底回台中兩週，其他時間要準備交換的申請，還有日文。','去年暑假我什麼都沒排，今年全部排滿。']}],
  'note':'接大一下 A2-L8（第一次沒排的暑假）。2026-10-17 AA-C 照 AA_255 附錄 A 改稿'},
],'greet':{'base':['（她抱著債各的課本）早。講義你印了嗎？我多印了一份。','我家教的學生這週終於有寫作業了。','你這學期修幾學分？我好像排太滿了。','這週讀書會在B館，有空可以來。','這禮拜報告好多，我到現在還沒睡飽。'],
 'when':[{'weekday':[4],'time':[19,21],'location':['wancai'],'week':[1,7],'t':'讀書會快開始了。小語帶了雞蛋糕，要的話自己拿。'},
         {'weekday':[4],'time':[19,21],'location':['wancai'],'week':[10,15],'t':'讀書會快開始了。小語帶了雞蛋糕，要的話自己拿。'},
         {'week':[3,6],'location':['campus'],'t':'杜鵑花開了。……第二張，我拍了。'},
         {'week':[8,9],'t':'期中考週，我宿舍跟總圖兩邊跑，好累。'},
         {'location':['library_hall','library'],'weather':'rain','t':'下雨了。我的傘在室友那裡。……她說會還。'},
         {'week':[16,18],'t':'期末了。我把交換的申請表印出來了。……先不寫。考完再寫。'}]},
 'note':'大二下以安：讀書會、家教、交換說明會（模擬法庭刪除，AA_252）；事件新 11～13 照交接包 v3。2026-10-17 AA-C：招呼照 AA_255 附錄 A（讀書會第 8、9、16 週沒有）'}

D['characters'][YT] = {'steps': [
 {'id':'Y4-L1','if':st(YT,'ACQUAINTANCE'),'week':[1,18],
  'lines':['過年我帶阿姨去看海了。','她在沙灘上坐了好久，回來一直說明年還要去。'],
  'choices':[ch('「阿姨開心嗎？」','很開心。回來那天湯煮得特別鹹，她開心的時候都這樣。'),
             ch('「妳呢？」','我也是。只是坐車坐到腰好痠。')],'rel':{'fam':2,'comf':1},'mem':'YT4_SEA_TRIP',
  'linesIf':[{'if':{'memory':[{'npc':YT,'tag':'YT3_SEA'}]},'lines':['過年我們真的去看海了。','她在沙灘上坐了好久，回來一直說明年還要去。']}],
  'note':'接大二上 Y3-L8（想帶阿姨去看海）。2026-10-17 AA-C 照 AA_255 附錄 A 改稿'},
 {'id':'Y4-L2','if':st(YT,'ACQUAINTANCE'),
  'lines':['訪談課的作業，我的筆記寫到第三本了。','我發現椅子擺成斜的，人比較敢講。……正對著，像在被問話。'],
  'choices':[ch('「妳自己發現的？」','看了很多次。'),
             ch('「下次教我。」','好啊。那你先當一次受訪的。')],'rel':{'fam':2},'mem':'YT4_CHAIRS',
  'note':'2026-10-17 AA-C 照 AA_255 附錄 A：「先學倒水」是法服初談的梗，語彤不在法服，改'},
 {'id':'Y4-L3','if':st(YT,'ACQUAINTANCE'),
  'lines':['我想自己做一個田野，題目還沒想到。','老師說可以先從身邊的地方找。'],
  'choices':[ch('「麵店本身就是題目。」','可能喔。可是要先問阿姨。'),
             ch('「題目會來的。」','希望啦，期末前要交題目。')],'rel':{'fam':2,'trust':1},
  'note':'大三事件 14 準備、事件 15 的伏筆；不提租約。2026-10-17 AA-C 照 AA_255 附錄 A 改稿'},
 {'id':'Y4-L4','if':st(YT,'FAMILIAR'),'week':[8,18],
  'lines':['阿姨最近開始學記帳。用手機。','她記錯了三次。我幫她改。她說我很囉嗦。'],
  'choices':[ch('「她用什麼記？」','手機的記帳 app，字要調到最大。'),
             ch('「需要我幫忙嗎？」','不用啦，她只是按錯格子。')],'rel':{'fam':2,'comf':1},
  'note':'續約前的準備在背景（AA_11 事件 14「準備」）；**不說為什麼開始記帳**。2026-10-17 AA-C 照 AA_255 附錄 A：選項②原本「你陪我吃麵就好」會搶事件 11（第 15 週）的收尾句，改'},
 {'id':'Y4-L5','if':st(YT,'FAMILIAR'),
  'lines':['阿哲跟小語現在每次都坐門口那桌。','阿姨都先端他們那桌。我問她為什麼，她說他們吃比較快。'],
  'choices':[ch('「阿姨偏心。」','對啊，你那碗每次都最後。'),
             ch('「他們會待到打烊嗎？」','常常，阿哲還會幫忙收椅子。')],'rel':{'fam':2},
  'note':'2026-10-17 AA-C 照 AA_255 附錄 A 改稿（拿掉筷子的象徵）'},
 {'id':'Y4-L6','if':st(YT,'FRIEND'),
  'lines':['我媽說想來店裡幫忙。阿姨說不行。','兩個人吵了一個晚上。……最後我媽負責剝蒜頭。'],
  'choices':[ch('「跟妳小時候一樣。」','她剝得比我慢。可是她說她剝得比較漂亮。',rel={'trust':1}),
             ch('「妳媽媽身體還好嗎？」','……嗯。剝蒜頭可以。她很高興。')],'rel':{'fam':2,'trust':2},'mem':'YT4_MOM_GARLIC',
  'note':'回聲大一上 Y-L3（剝蒜頭）、大二上 Y3-L6（媽媽散步）；不寫病情'},
 {'id':'Y4-L7','if':st(YT,'FRIEND'),'week':[14,18],
  'lines':['下學期我要當訪談課的助教了。老師說，教室我可以自己排。','我想把椅子都擺成斜的。'],
  'choices':[ch('「妳會做得很好。」','希望啦。第一堂要自我介紹，我還沒想好要講什麼。'),
             ch('「老師說了什麼？」','她說每週要改二十份作業。我還在算時間夠不夠。')],'rel':{'fam':2,'trust':2},'mem':'YT4_INTAKE_LEAD',
  'note':'語彤不加入法服（AA_218 17-11），初談組改社會系訪談課（大三上事件 13b 助教的前一學期）；記憶代號不改名。2026-10-17 AA-C 照 AA_255 附錄 A 改稿'},
 {'id':'Y4-L8','if':st(YT,'FRIEND'),'week':[14,18],
  'lines':['暑假我想訪問店裡的老客人。','第一個要問的，是每天都點乾麵的那個阿伯。'],
  'choices':[ch('「我可以幫妳記。」','……嗯。你字很醜。……好。',rel={'comf':2}),
             ch('「他會說什麼？」','不知道。我想先問他在這裡吃幾年了。')],'rel':{'fam':2,'comf':1},'mem':'YT4_FIELDWORK',
  'note':'大三事件 14「語彤把老客人說的話記下來」的開始（背景）；不說是為了續約。2026-10-17 AA-C 照 AA_255 附錄 A 改稿',
  'location':['noodle','campus','library_hall','library','wenzhou'],'locTime':{'noodle':{'weekday':[2,4],'time':[20,20.5]}}},
],'greet':{'base':['（她從書裡抬起頭，點了一下頭。）','（她抱著一疊訪談筆記）我要去影印。','阿姨換了新的湯勺，一直說不順手。','債各上次那份講義我沒拿到，等一下要去系辦問。','你也在。'],
 'when':[{'weekday':[6],'time':[9,12],'location':['noodle'],'t':'（她在擦長桌）還沒開喔，十一點才開。'},
         {'location':['noodle'],'weekday':[2,4],'time':[17.5,20],'t':'今天比較多人，你可能要等一下。'},
         {'location':['library_hall','library'],'weekday':[1,3,5],'time':[19,21.5],'t':'（她小聲）我坐到九點半。'},
         {'week':[8,9],'t':'期中這兩週，阿姨叫我不用去店裡。'},
         {'weather':'rain','t':'下雨了。你有傘嗎？我包包裡有一把多的。'}]},
 'note':'語彤的日程（週二四麵店、一三五總圖、週六早上麵店；不加入法服，AA_218 17-11；**characters.js 的週六法律系館B要改成麵店，LAWWW**）。這學期她的重頭戲在事件 8、9、11，階梯只寫輕的。2026-10-17 AA-C 招呼照 AA_255 附錄 A'}
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
