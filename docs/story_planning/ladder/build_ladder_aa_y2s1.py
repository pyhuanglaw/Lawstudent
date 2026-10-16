# -*- coding: utf-8 -*-
"""大二上（Y2S1）的閒聊階梯：以安（heroine_01）、語彤（heroine_03）→ ladder_aa_y2s1.json。作者：AA-B 2026-10-16。
原稿說明：../AA_141_閒聊階梯_大二上_以安語彤.md。格式同 ladder_aa_y1s2.json（欄位：README.md），term＝'Y2S1'。
依據：交接包_v3_大二_骨架（以安新 8 讀書會的規則太多〔第 7 週〕、新 9 行政法 C 類〔第 12 週〕、新 10 家教學生的家（一）〔第 13 週〕；
語彤事件 7 法服第一次值班〔第 4 週〕、事件 10 期中考那一週〔大二，朋友以上〕；阿哲和小語第 15 週在一起）、AA_113、AA_11。
**不搶事件的戲**：新 10 的補助駁回、事件 10 的大一期中那週、事件 7 的阿伯，階梯都不講。
**防卡關**：`if` 只放階段；週次放寬到第 18 週。
用法：python3 build_ladder_aa_y2s1.py → ladder_aa_y2s1.json；--check 只檢查。"""
import json, sys, os
Y='Y2S1'
def st(npc, mn): return {'stage': {'npc': npc, 'min': mn}}
def ch(t, reply, rel=None, mem=None):
    c = {'t': t, 'reply': reply}
    if rel: c['rel'] = rel
    if mem: c['mem'] = mem
    return c
AN='heroine_01'; YT='heroine_03'
D = {'_comment': __doc__, 'term': Y, 'characters': {}}

D['characters'][AN] = {'steps': [
 {'id':'A3-L1','if':st(AN,'ACQUAINTANCE'),
  'lines':['這學期我開始家教。國中二年級，數學。','學生問我為什麼要學證明。我說：因為要說服別人。學生說不想說服別人。'],
  'choices':[ch('「那妳怎麼回？」','我說：那就說服自己。……學生翻白眼了。'),
             ch('「國中生很難教吧。」','不難。只是還沒找到理由。')],'rel':{'fam':2},'mem':'AN3_TUTOR',
  'note':'新 10「家教學生的家」（第 13 週）的伏筆；**不提學生家裡的事**、不寫學生性別（新 13 的卡片「老師，謝謝妳畫的那張圖」）'},
 {'id':'A3-L2','if':st(AN,'ACQUAINTANCE'),
  'lines':['日文課升到中級了。老師說我的敬語用太多。','我說那是禮貌。老師說，那是距離。'],
  'choices':[ch('「哪一個對？」','……都對。我在想要留多少距離。'),
             ch('「敬語很難嗎？」','不難。難的是什麼時候不用。')],'rel':{'fam':2},'mem':'AN3_KEIGO',
  'note':'大三上新 15「為什麼是日本」的伏筆；這裡仍不說交換'},
 {'id':'A3-L3','if':st(AN,'ACQUAINTANCE'),'week':[8,18],
  'lines':['公法讀書會的規則，我重寫了。從一頁變三條。','小語說我進步了。我說那叫刪減。'],
  'choices':[ch('「三條是哪三條？」','每人十分鐘。離題可以，要拉回來。第三條……來了就知道。'),
             ch('「刪得好。」','……謝謝。刪的時候很痛。')],'rel':{'fam':2},
  'note':'新 8（第 7 週）之後；去過、沒去過讀書會都說得通（沒加入的玩家在群組看過小語撕規則）'},
 {'id':'A3-L4','if':st(AN,'FAMILIAR'),'week':[9,18],
  'lines':['大二的課變多了。我早上跑步多跑一圈。','理由：要想的事變多了。跑步的時候，比較想得清楚。'],
  'choices':[ch('「想清楚了嗎？」','……一半。另一半跑完就忘了。'),
             ch('「我也去跑？」','早上六點。不准遲到。……你不會來的。',rel={'comf':1})],'rel':{'fam':2,'comf':1},
  'linesIf':[{'unless':{'memory':[{'npc':AN,'tag':'AN_L7_RUN'}]},'lines':['大二的課變多了。我每天早上六點去跑步，最近多跑一圈。','理由：要想的事變多了。跑步的時候，比較想得清楚。']}],
  'note':'回聲大一上 A-L7（早上六點跑步）；沒聽過的玩家用 linesIf'},
 {'id':'A3-L5','if':st(AN,'FAMILIAR'),'week':[13,18],
  'lines':['行政法那堂，我改了答案。第一次在課堂上改。','不是因為輸了。是因為對方的理由比較好。'],
  'choices':[ch('「改答案不丟臉。」','我知道。……我只是要多說一次給自己聽。'),
             ch('「誰的理由？」','……不告訴你。理由：會驕傲。')],'rel':{'fam':2,'trust':1},
  'note':'新 9（第 12 週行政法 C 類）之後；玩家是不是站她對面都說得通'},
 {'id':'A3-L6','if':st(AN,'FAMILIAR'),'week':[15,18],
  'lines':['小語跟阿哲在一起了。','讀書會現在要排座位。理由：他們坐在一起會一直講話。'],
  'choices':[ch('「妳早就知道？」','……全世界都知道。只有他們以為沒人知道。'),
             ch('「排座位好嚴格。」','不嚴格。是保護其他人的十分鐘。')],'rel':{'fam':2},
  'note':'小語 語 3「在一起」（第 15 週系籃賽後）'},
 {'id':'A3-L7','if':st(AN,'FRIEND'),
  'lines':['這學期好多人來借我的筆記。','被需要的感覺很好。……可是我開始分不清楚，哪些是我自己想做的。'],
  'choices':[ch('「妳想做什麼？」','……還在找。可能是讀書會，可能是家教。可能都不是。',rel={'trust':2}),
             ch('「可以拒絕啊。」','……我在練習。理由欄寫：不行。兩個字，很難寫。')],'rel':{'fam':2,'trust':2},'mem':'AN3_NEEDED',
  'note':'和主線 4「被需要的一年」（祐廷）互相照：她也在問同一件事'},
 {'id':'A3-L8','if':st(AN,'FRIEND'),'week':[16,18],
  'lines':['寒假回台中。我媽說，這次換我教她一道菜。','……我只會一道。她說那就教那一道。'],
  'choices':[ch('「番茄炒蛋？」','……你記得。……對。'),
             ch('「教得會嗎？」','她學得很快。她說，看我做過一次就夠了。')],'rel':{'fam':2,'comf':2},'mem':'AN3_WINTER',
  'linesIf':[{'if':{'memory':[{'npc':AN,'tag':'AN2_TOMATO_EGG'}]},'lines':['寒假回台中。我媽說，這次換我教她一道菜。','……你知道的。我只會番茄炒蛋。她說那就教那個。']}],
  'note':'接大一下 A2-L1（番茄炒蛋）；大二下新 12「媽媽的晚餐（二）」前的日常，不談案子、不提媽媽職業'},
],'greet':{'base':['早。今天有行政法。我很期待。……這句不是反話。','我剛家教完。學生今天問我，法律系是不是都要背。','（她的手帳換了一本新的）……舊的寫滿了。','讀書會的白板，我擦乾淨了。下週輪到你擦。','霖澤館的電梯又在修。走樓梯。'],
 'when':[{'weekday':[4],'time':[19,21],'location':['wancai'],'t':'讀書會快開始了。今天第一個十分鐘是你。……騙你的。'},
         {'time':[7,9],'location':['campus','library_hall'],'t':'（她剛下日文課）……おはようございます。……早。'},
         {'week':[8,9],'t':'期中。手帳右欄這週寫的是：撐住。'},
         {'location':['library_hall','library'],'weather':'rain','t':'下雨了。……這次我有帶傘。理由：去年借出去的都沒回來。'},
         {'week':[16,18],'t':'期末了。我把讀書會的時間改成兩週一次。理由：大家都要活下去。'}]},
 'note':'大二上以安的課表照 syllabus Y2S1（債總、刑分、行政法……）；重疊的必修她在教室'}

D['characters'][YT] = {'steps': [
 {'id':'Y3-L1','if':st(YT,'ACQUAINTANCE'),
  'lines':['暑假我讀了三本書。都是客人留在店裡的。','一本講海，一本講考試。一本沒有封面。'],
  'choices':[ch('「沒有封面的那本在講什麼？」','……講一個人一直在等。我很喜歡。'),
             ch('「客人會回來拿嗎？」','……不會。阿姨說，留下來的書，就是店的。')],'rel':{'fam':2},'mem':'YT3_BOOKS'},
 {'id':'Y3-L2','if':st(YT,'ACQUAINTANCE'),'week':[6,18],
  'lines':['我加入法服了。初談組。','……我不會法律。我會聽。學姊說，這樣就夠了。'],
  'choices':[ch('「妳一定很適合。」','……嗯。阿姨也這樣說。她說我從小就在聽客人抱怨。'),
             ch('「法服累嗎？」','隔週週六早上。比顧店輕鬆。')],'rel':{'fam':2},'mem':'YT3_FAFU',
  'note':'語彤事件 7（第 5 週週六第一次值班，AA_140 G03）之後；**不講阿伯那一句**（事件 7 的戲）。法服＝隔週週六 9～12 民眾諮詢、週三晚上內部讀書會（AA_132）'},
 {'id':'Y3-L3','if':st(YT,'ACQUAINTANCE'),
  'lines':['這學期有一門課在講家庭。老師問：你家的晚餐誰煮？','全班只有我說：阿姨。'],
  'choices':[ch('「老師怎麼說？」','老師說，這就是這門課要講的。……我變成例子了。'),
             ch('「阿姨煮的最好吃。」','……嗯。我也這樣寫在作業上。')],'rel':{'fam':2,'trust':1}},
 {'id':'Y3-L4','if':st(YT,'FAMILIAR'),'week':[8,18],
  'lines':['初談組有一本記錄本。我寫得最短。','學姊說短的比較好讀。……我只是寫不出長的。'],
  'choices':[ch('「短的才好。」','……嗯。長的我記在心裡。'),
             ch('「可以給我看嗎？」','……不行。那是別人的事。',rel={'trust':1})],'rel':{'fam':2}},
 {'id':'Y3-L5','if':st(YT,'FAMILIAR'),'week':[15,18],
  'lines':['……阿哲跟小語在一起了。','我端麵的時候就看出來了。'],
  'choices':[ch('「妳好厲害。」','……嗯。看人是我唯一會的。'),
             ch('「要告訴他們妳早就知道嗎？」','……不用。他們以為沒人知道。讓他們以為。')],'rel':{'fam':2},
  'linesIf':[{'if':{'memory':[{'npc':YT,'tag':'YT2_SEATS'}]},'lines':['……阿哲跟小語在一起了。','位子。我說過的。']}],
  'note':'接大一下 Y2-L6（YT2_SEATS）'},
 {'id':'Y3-L6','if':st(YT,'FRIEND'),
  'lines':['我媽最近開始散步。傍晚，在汀州路走一圈。','週末我陪她。她走得比我慢，可是講得比我多。'],
  'choices':[ch('「真好。」','……嗯。很好。'),
             ch('「下次我也一起？」','……嗯。下次。她走很慢喔。',rel={'comf':2})],'rel':{'fam':2,'trust':2},'mem':'YT3_MOM_WALK',
  'note':'媽媽身體不好的細節不寫（AA_11 第 0 節）；這裡只寫她慢慢變好的一件小事'},
 {'id':'Y3-L7','if':st(YT,'FRIEND'),
  'lines':['學姊說，初談組以後要有人顧。……她是看著我說的。','我第一次被交代一件很久以後的事。'],
  'choices':[ch('「妳可以的。」','……嗯。我會先學會倒水。'),
             ch('「會有壓力嗎？」','……有。可是是好的那種。像一次端兩碗麵。')],'rel':{'fam':2,'trust':2},'mem':'YT3_INTAKE_LEAD',
  'note':'學姊大二下第 15 週畢業時，語彤接初談組長（交接包 v3 第 4 節第 1 點）；這裡只是學姊的一句話，不是正式交接'},
 {'id':'Y3-L8','if':st(YT,'FRIEND'),'week':[16,18],
  'lines':['過年店休三天。今年我想帶阿姨去看海。','她說不要。說了兩次不要，才說好。'],
  'choices':[ch('「去哪裡的海？」','……還沒想好。近的就好。阿姨說，海都一樣。'),
             ch('「我可以推薦。」','……嗯。你推薦，我再跟她說是我想的。',rel={'comf':2})],'rel':{'fam':2,'comf':1},'mem':'YT3_SEA'},
],'greet':{'base':['……嗯。','（她抱著初談的記錄本）……要拿去還學姊。','……阿姨今天的湯放了白蘿蔔。很甜。','……總圖靠窗那排，今天被占了。','……你也來了。……嗯，好。'],
 'when':[{'weekday':[6],'time':[9,12],'location':['wancai'],'t':'（她坐在初談的桌子後面）……先坐。要喝水嗎？'},
         {'location':['noodle'],'weekday':[2,4],'time':[17.5,20],'t':'……今天客人多。你先坐那邊。'},
         {'location':['library_hall','library'],'weekday':[1,3,5],'time':[19,21.5],'t':'（她在靠窗的位子，小聲）……嗯。'},
         {'week':[8,9],'t':'……期中。總圖今天人好多。'},
         {'weather':'rain','t':'……下雨了。我帶了兩把傘。……習慣。'}]},
 'note':'語彤的日程：週二四 17:30～20:30 麵店；一三五 19:00～21:30 總圖；大二上起隔週週六 9～12 法服值班（萬才館）'}
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
    json.dump(D,open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'ladder_aa_y2s1.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('ok', {k:len(v['steps']) for k,v in D['characters'].items()})
