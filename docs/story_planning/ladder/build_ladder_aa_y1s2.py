# -*- coding: utf-8 -*-
"""大一下（Y1S2）的閒聊階梯：以安（heroine_01）、語彤（heroine_03）→ ladder_aa_y1s2.json。作者：AA-B 2026-10-16。
原稿說明：../AA_139_閒聊階梯_大一下_以安語彤.md。格式和 ladder_aa.json 完全一樣（欄位：README.md），只差 term＝'Y1S2'。
依據：交接包_v2_大一下_草稿（以安新 5 宿舍申訴、新 7 和小語吵架＋公法讀書會、早上七點的日文課、杜鵑花「每年同一個位置」；
語彤 4 阿姨扭到手腕〔期中〕、語彤 6 房東來過了〔第 10 週〕、春節、春假 4/3～4/6）。
**防卡關**：`if` 只能放階段（stage），事件、記憶的差別一律放 linesIf／extraIf（build 會擋）；有週次的層，週次放寬到第 18 週，太早或太晚的說法用 linesIf 換。
用法：python3 build_ladder_aa_y1s2.py → ladder_aa_y1s2.json；--check 只檢查。"""
import json, sys, os
Y='Y1S2'
def st(npc, mn): return {'stage': {'npc': npc, 'min': mn}}
def ch(t, reply, rel=None, mem=None):
    c = {'t': t, 'reply': reply}
    if rel: c['rel'] = rel
    if mem: c['mem'] = mem
    return c
AN='heroine_01'; YT='heroine_03'
D = {'_comment': __doc__, 'term': Y, 'characters': {}}

D['characters'][AN] = {'steps': [
 {'id':'A2-L1','if':st(AN,'ACQUAINTANCE'),'week':[1,18],
  'lines':['寒假我回台中。我媽教了我一道菜。','番茄炒蛋。她說她只會這一道。……我學了三天。'],
  'choices':[ch('「學會了嗎？」','第三天學會了。理由：前兩天的蛋都太老。'),
             ch('「下次做給我吃。」','……等我做到第五次。第五次才算會。',rel={'comf':1})],'rel':{'fam':2},'mem':'AN2_TOMATO_EGG',
  'extraIf':[{'if':{'memory':[{'npc':AN,'tag':'AN_L10_PHOTO_PROMISE'}]},'lines':['你寒假傳的照片，我都看了。回了「收到」。……我知道，很冷淡。']}],
  'note':'承接大一上 A-L10（寒假學一道菜）；沒聽過 A-L10 的玩家也說得通。extraIf：說好互傳照片的玩家多一句'},
 {'id':'A2-L2','if':st(AN,'ACQUAINTANCE'),'week':[2,18],
  'lines':['我早上七點有日文課。不是學分，我自己報的。','動詞變化有很多規則，也有很多例外。……很像法律。'],
  'choices':[ch('「為什麼學日文？」','……理由還在寫。寫好了再告訴你。'),
             ch('「七點也太早。」','七點的教室，只有想學的人。我喜歡。')],'rel':{'fam':2},'mem':'AN2_JAPANESE',
  'note':'交接包 v2 第 2 週的背景（總圖門口遇到剛下課、念動詞變化的她）。**不說為什麼學**：大三交換日本的伏筆，這裡不講'},
 {'id':'A2-L3','if':st(AN,'ACQUAINTANCE'),'week':[3,18],'location':['campus'],
  'lines':['（她拿手機對著一叢杜鵑花）……我要每年在同一個位置拍一張。','四年，四張。今天是第一張。'],
  'choices':[ch('「我幫妳拍？」','不用。要我自己拍。理由：同一個人拍，才比得出來。'),
             ch('「為什麼是這裡？」','看得到傅鐘。四年以後，它還會在這裡。')],'rel':{'fam':2},'mem':'AN2_AZALEA',
  'linesIf':[{'week':[7,18],'lines':['杜鵑花謝了。……三月的時候，我在這裡拍了一張。','每年同一個位置。四年，四張。今年是第一張。']}],
  'note':'交接包 v2 第 3 週（杜鵑花季）。第 7 週以後才推進的玩家：花謝了，改說「三月拍了」（linesIf），不卡關'},
 {'id':'A2-L4','if':st(AN,'ACQUAINTANCE'),'week':[7,18],
  'lines':['我室友的申訴，過了一半。點數減了一點。','她請我吃了一碗麵。她說我寫的理由太多。……可是她贏了一半。'],
  'choices':[ch('「理由多不是壞事。」','……嗯。可是要讓人看得完。這是我這次學到的。'),
             ch('「她說得對。」','……你站她那邊。好。下次你當她的律師。')],'rel':{'fam':2,'trust':1},
  'linesIf':[{'if':{'events':['ev_an_dorm_appeal']},'lines':['上次你幫我讀的申訴，結果出來了。點數減了一點。','室友請我吃了一碗麵。她說我寫的理由太多。……可是她贏了一半。']}],
  'note':'以安新 5（ev_an_dorm_appeal，第 5 週，結果第 7 週）。沒遇到事件的玩家照一般台詞（她自己講結果）；遇到的玩家 linesIf 改成「你幫我讀的」'},
 {'id':'A2-L5','if':st(AN,'FAMILIAR'),'week':[9,18],
  'lines':['期中考完，我的手帳右欄寫：還可以。','……「還可以」不是一個進度。我自己說過的。'],
  'choices':[ch('「那是什麼？」','是「我盡力了，可是不想說」。……你不准笑。'),
             ch('「我也還可以。」','……那我們兩個都不是進度。下週一起把它變成進度。',rel={'comf':1})],'rel':{'fam':2,'comf':1},
  'linesIf':[{'unless':{'memory':[{'npc':AN,'tag':'AN_L8_MIDTERM'}]},'lines':['期中考完，我的手帳右欄寫：還可以。','……「還可以」不是一個進度。可是我今天只想寫這三個字。']}],
  'note':'回聲大一上 A-L8（「還好」不是一個進度）；沒聽過的玩家用 linesIf 那一套'},
 {'id':'A2-L6','if':st(AN,'FAMILIAR'),'week':[12,18],
  'lines':['公法讀書會，每人十分鐘。小語說可以吃東西。','……我同意了。理由：十分鐘很餓。'],
  'choices':[ch('「妳們和好了？」','我們沒有吵。是在辯論。……好，有一點吵。'),
             ch('「我可以去嗎？」','可以。週四晚上八點。十分鐘你要講什麼，先想好。')],'rel':{'fam':2},
  'linesIf':[{'if':{'events':['ev_an_study_group']},'lines':['你來過讀書會了。你的十分鐘，講了十二分鐘。','……我沒有在計時。我有。']}],
  'note':'以安新 7（第 11～12 週：和小語吵架 ev_an_yu_argument，然後開了公法讀書會）。讀書會的事件 id 照 LAWWW-B 實作時的名稱換（這裡先寫 ev_an_study_group）；沒去過的玩家照一般台詞'},
 {'id':'A2-L7','if':st(AN,'FRIEND'),
  'lines':['我媽說，我講話越來越像她。','先講結論，然後不太讓別人插嘴。……後面那個我在改。'],
  'choices':[ch('「哪裡像？」','……剛剛那句。先講結論。'),
             ch('「像也沒關係吧。」','……你又不認識她。……好，我收下。',rel={'trust':1})],'rel':{'fam':2,'trust':2},'mem':'AN2_LIKE_MOM',
  'note':'**不說媽媽的職業**（法官；AA_113：大四畢業典禮才第一次對朋友說）。只講說話方式'},
 {'id':'A2-L8','if':st(AN,'FRIEND'),'week':[15,18],
  'lines':['暑假我七月底回台中兩週。','剩下的時間在臺北。……我還沒排。第一次沒排。'],
  'choices':[ch('「要不要一起排？」','……好。你排第一版。我改。',rel={'comf':2}),
             ch('「沒排也很好。」','……嗯。我在練習。')],'rel':{'fam':2,'comf':1},'mem':'AN2_SUMMER',
  'note':'AA_128：以安暑假 7/18～7/31 在台中'},
],'greet':{'base':['早。……我剛下日文課。腦子裡都是動詞。','這學期的憲法，老師講得比較快。我抄得比較慢。','我剛從總圖出來。二樓的長桌今天坐滿了。','（她把手帳闔起來）……今天的事做完了。剩下的不算。','下一堂在 201。走吧。'],
 'when':[{'time':[7,9],'location':['campus','library_hall'],'t':'（她嘴裡念著動詞變化）……行きます、行きました……啊。早。'},
         {'week':[3,6],'location':['campus'],'t':'杜鵑花開了。……我已經拍了。'},
         {'weekday':[4],'time':[19,21],'location':['wancai'],'week':[12,18],'t':'讀書會快開始了。十分鐘，你要講什麼？'},
         {'location':['library_hall','library'],'weather':'rain','t':'下雨了。……我的傘借室友了。理由：她比較常忘記。'},
         {'week':[16,18],'t':'期末了。手帳右欄這週寫的是：再撐一下。'}]},
 'note':'大一下以安的作息照大一上（重疊的必修一定在教室）；新增早上七點的日文課（週一、三、五，總圖附近）'}

D['characters'][YT] = {'steps': [
 {'id':'Y2-L1','if':st(YT,'ACQUAINTANCE'),'week':[1,18],
  'lines':['過年店裡休三天。……三天，阿姨不知道要做什麼。','她把每一張椅子都擦了一遍。休假也在擦。'],
  'choices':[ch('「那妳呢？」','我陪她擦。……我們家都這樣。'),
             ch('「阿姨好認真。」','……嗯。她說手停下來，會想東想西。')],'rel':{'fam':2},'mem':'YT2_NEWYEAR'},
 {'id':'Y2-L2','if':st(YT,'ACQUAINTANCE'),'location':['campus','library_hall','library'],
  'lines':['這學期有一門課，要去訪問一個人。','我想訪問阿姨。……她說不要。她說她又沒有什麼故事。'],
  'choices':[ch('「她有很多故事。」','……嗯。我知道。她不知道。'),
             ch('「換一個人訪問？」','……不換。我等她答應。')],'rel':{'fam':2,'trust':1},'mem':'YT2_INTERVIEW'},
 {'id':'Y2-L3','if':st(YT,'ACQUAINTANCE'),'week':[6,18],
  'lines':['春假那幾天，店裡照開。我沒有出去。','可是我在店門口，看到好多人拖著行李。……好像大家都要去別的地方。'],
  'choices':[ch('「下次一起出去？」','……嗯。等店裡不忙。……店裡一直都很忙。等阿姨說可以。'),
             ch('「店裡也很好。」','……嗯。店裡不用拖行李。')],'rel':{'fam':2},
  'note':'春假 4/3～4/6（交接包 v2 第 6～7 週）；說法用「那幾天」，第 6 週以後都說得通'},
 {'id':'Y2-L4','if':st(YT,'FAMILIAR'),'week':[10,18],
  'lines':['阿姨換了一盞新的燈。舊的那盞，亮了二十年。','……我把舊的拿回家了。捨不得丟。'],
  'choices':[ch('「留著很好。」','……嗯。它看過很多碗麵。'),
             ch('「舊燈會想念客人吧。」','……嗯。你講話越來越像我。',rel={'comf':1})],'rel':{'fam':2,'comf':1},'mem':'YT2_OLD_LAMP',
  'linesIf':[{'if':{'events':['ev_yutong_absent']},'lines':['阿姨的手好了。可以拿湯勺了。……她第一天就偷拿。','她還換了一盞新的燈。舊的那盞亮了二十年，我拿回家了。']}],
  'note':'**不說大一期中那週她顧店到很晚、在櫃台念書**——那是大二事件 10「期中考那一週」要讓玩家事後才知道的（AA_11）。看過語彤 4（ev_yutong_absent，阿姨包著護腕）的玩家只多聽到「阿姨的手好了」'},
 {'id':'Y2-L5','if':st(YT,'FAMILIAR'),'week':[11,18],
  'lines':['最近阿姨話比較少。','我就把桌子擦得比較乾淨。……好像這樣比較好。'],
  'choices':[ch('「會沒事的。」','……嗯。你說的話，我先收著。'),
             ch('「需要幫忙就說。」','……嗯。會說。……可能不會。可是謝謝。',rel={'trust':2})],'rel':{'fam':2,'trust':1},'mem':'YT2_WORRY',
  'linesIf':[{'if':{'events':['ev_yutong_landlord']},'lines':['房東的事，阿姨不讓我問。','我就每天把桌子擦乾淨。好像這樣，店就不會被賣掉。']}],
  'note':'語彤 6 房東來過了（ev_yutong_landlord，第 10 週以後）。沒看到那一晚的玩家，她不提房東（大二上事件 8 要能在沒有 RENT_RUMOR 時照常演）'},
 {'id':'Y2-L6','if':st(YT,'FAMILIAR'),'week':[12,18],
  'lines':['阿哲最近每次都坐同一個位子。靠門口那邊。','小語也是。……我只是說說。'],
  'choices':[ch('「妳看得好仔細。」','……嗯。端麵的時候，會看到。'),
             ch('「他們怎麼了？」','……不知道。我只看到位子。')],'rel':{'fam':2},'mem':'YT2_SEATS',
  'note':'小語 語 2「剛好路過」（第 16 週）之前的小徵兆，語彤只說看到的、不下結論；不能說成在一起（大二上才在一起）'},
 {'id':'Y2-L7','if':st(YT,'FRIEND'),
  'lines':['社會系大二開始，可以選的課比較多。我還沒想好要往哪裡走。','阿姨說，選我喜歡的。我說我喜歡的不能賺錢。','她說，那就選能讓你常回來吃麵的。'],
  'choices':[ch('「阿姨很懂。」','……嗯。她什麼都懂。只是不說。'),
             ch('「妳喜歡什麼？」','……看人。聽人說話。……這個能當工作嗎？',rel={'trust':2})],'rel':{'fam':2,'trust':2},'mem':'YT2_FUTURE'},
 {'id':'Y2-L8','if':st(YT,'FRIEND'),'week':[15,18],
  'lines':['暑假學生走了，可是附近上班的人會來。店裡一樣忙。','……你暑假在臺北嗎？週二、週四，還是一樣。'],
  'choices':[ch('「我會來。」','……嗯。我會留滷蛋。',rel={'comf':2}),
             ch('「妳也要休息。」','……嗯。阿姨也這樣說。我會休一天，陪我媽去走走。')],'rel':{'fam':2,'comf':1},'mem':'YT2_SUMMER',
  'note':'locTime 同大一上：在麵店只有週二、四 20:00～20:30 推進'},
],'greet':{'base':['……嗯。早。','（她手上拿著一本社會學的書）……下午要交報告。','……今天的湯是排骨。阿姨說的。','……總圖今天冷氣好強。','……你也來了。'],
 'when':[{'location':['noodle'],'weekday':[2,4],'time':[17.5,20],'t':'……今天客人多。你先坐。'},
         {'location':['noodle'],'weekday':[2,4],'time':[20,20.5],'t':'……快打烊了。剩下的湯，阿姨說給你。'},
         {'location':['library_hall','library'],'weekday':[1,3,5],'time':[19,21.5],'t':'（她在靠窗的位子，小聲）……嗯。'},
         {'weather':'rain','t':'……下雨了。你有傘嗎？……我有兩把。'},
         {'week':[16,18],'location':['noodle'],'t':'……期末了。長桌最近都是考生。'}]},
 'note':'語彤的日程照大一上：週二四 17:30～20:30 麵店；一三五 19:00～21:30 總圖。Y2-L8 在麵店照大一上的 locTime'}
D['characters'][YT]['steps'][-1]['location']=['noodle','campus','library_hall','library','wenzhou']
D['characters'][YT]['steps'][-1]['locTime']={'noodle':{'weekday':[2,4],'time':[20,20.5]}}

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
    json.dump(D,open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'ladder_aa_y1s2.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('ok', {k:len(v['steps']) for k,v in D['characters'].items()})
