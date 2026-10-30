# -*- coding: utf-8 -*-
"""大一下（Y1S2）的閒聊階梯：以安（heroine_01）、語彤（heroine_03）→ ladder_aa_y1s2.json。作者：AA-B 2026-10-16。
原稿說明：../AA_139_閒聊階梯_大一下_以安語彤.md。格式和 ladder_aa.json 完全一樣（欄位：README.md），只差 term＝'Y1S2'。
依據：交接包_v2_大一下_草稿（以安新 5 宿舍申訴、新 7 和小語吵架＋公法讀書會、早上七點的日文課、杜鵑花「每年同一個位置」；
語彤 4 阿姨扭到手腕〔期中〕、語彤 6 房東來過了〔第 10 週〕、春節、春假 4/3～4/6）。
**防卡關**：`if` 只能放階段（stage），事件、記憶的差別一律放 linesIf／extraIf（build 會擋）；有週次的層，週次放寬到第 18 週（2026-10-17 AA-C：16 週制，AA_198；學期不會推進到第 17、18 週，放寬只是不卡關，上限不統一），太早或太晚的說法用 linesIf 換。
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
  'lines':['我媽寒假教我煮番茄炒蛋。','她說她只會這一道，我練了三天。'],
  'choices':[ch('「學會了嗎？」','第三天才沒有煎老。'),
             ch('「下次做給我吃。」','等我多練幾次，現在煎得還不好看。',rel={'comf':1})],'rel':{'fam':2},'mem':'AN2_TOMATO_EGG',
  'extraIf':[{'if':{'memory':[{'npc':AN,'tag':'AN_L10_PHOTO_PROMISE'}]},'lines':['寒假說好要傳照片，結果我們兩個都沒傳。']},
             {'if':{'flags':['dating_heroine_01']},'lines':['練好了先煮給你吃。']}],
  'note':'承接大一上 A-L10（寒假學一道菜）；沒聽過 A-L10 的玩家也說得通。extraIf：說好互傳照片的玩家多一句（2026-10-17 口語改稿：lines 第 1 句照 AA_209 第 2 節，其他照 AA_209 附錄 A）。2026-10-17 AA-C（AA_215／AA_216 大一下 #8）：大一就可能交往；選項②的回覆原本「現在還不能給別人吃」，對男友說「別人」很怪，改成兩種關係都通的「現在煎得還不好看」；交往中多一句（extraIf dating_heroine_01）'},
 {'id':'A2-L2','if':st(AN,'ACQUAINTANCE'),'week':[2,18],
  'lines':['我早上七點有日文課。不是學分，我自己報的。','動詞變化有很多規則，也有很多例外。……很像法律。'],
  'choices':[ch('「為什麼學日文？」','……還沒想好怎麼講。想好了再告訴你。'),
             ch('「七點也太早。」','七點的教室，只有想學的人。我喜歡。')],'rel':{'fam':2},'mem':'AN2_JAPANESE',
  'note':'交接包 v2 第 2 週的背景（總圖門口遇到剛下課、念動詞變化的她）。**不說為什麼學**：大三交換日本的伏筆，這裡不講（2026-10-17 AA-C：選項①回覆原本「……理由還在寫」，AA_209 第 1 節第 2 點以安說出口的「理由」歸零）'},
 {'id':'A2-L3','if':st(AN,'ACQUAINTANCE'),'week':[3,18],'location':['campus'],
  'lines':['（她拿手機對著一叢杜鵑花）我想每年都在這裡拍一張，拍到畢業。','今年是第一張。'],
  'choices':[ch('「我幫妳拍？」','好啊，要拍到後面的晨思鐘喔。'),
             ch('「為什麼是這裡？」','這邊拍得到晨思鐘，比較好認。')],'rel':{'fam':2},'mem':'AN2_AZALEA',
  'linesIf':[{'if':{'events':['ev_an_azalea_y1']},'lines':['上次那張杜鵑我洗出來了，拍得還不錯。']},
             {'week':[7,18],'lines':['杜鵑都謝了。三月的時候我在這邊拍了一張。','我想每年都來拍，拍到畢業。']}],
  'note':'交接包 v2 第 3 週（杜鵑花季）。第 7 週以後才推進的玩家：花謝了，改說「三月拍了」（linesIf），不卡關（2026-10-17 口語改稿照 AA_209 附錄 A：看過杜鵑事件 ev_an_azalea_y1 的玩家用第一套 linesIf，不重講「每年拍一張」；沒看過的照一般台詞或花謝那套）'},
 {'id':'A2-L4','if':st(AN,'ACQUAINTANCE'),'week':[7,18],
  'lines':['我室友晚歸被記點，我幫她寫了申訴，結果點數減了一點。','她請我吃麵，可是一直念我寫太長。'],
  'choices':[ch('「理由多不是壞事。」','舍監好像只看了第一頁。下次我寫短一點。'),
             ch('「她說得對。」','你跟她講的一樣。好啦，下次先給她看。')],'rel':{'fam':2,'trust':1},
  'linesIf':[{'if':{'events':['ev_an_dorm_appeal']},'lines':['你幫我看的那份申訴，室友叫我跟你說謝謝。','她請我吃麵，可是一直念我寫太長。']}],
  'note':'以安新 5（ev_an_dorm_appeal，第 5 週，結果第 7 週）。沒遇到事件的玩家照一般台詞（她自己講結果）；遇到的玩家 linesIf 改成「你幫我讀的」（2026-10-17 口語改稿照 AA_209 附錄 A）'},
 {'id':'A2-L5','if':st(AN,'FAMILIAR'),'week':[9,18],
  'lines':['期中都考完了。','刑總第二題我寫完才發現，題目問的不是那個。'],
  'choices':[ch('「刑總本來就難。」','聽說全班平均也不高。'),
             ch('「我也考得不太好。」','那下禮拜找一天一起對考卷吧。',rel={'comf':1})],'rel':{'fam':2,'comf':1},
  'note':'（2026-10-17 口語改稿照 AA_209 附錄 A：接的大一上那句已刪〔AA_194〕，不再回聲，unless 那套 linesIf 刪掉；選項改成對考卷，「我也考得不太好」對應原本的「我也還可以」，comf+1 跟著它）'},
 {'id':'A2-L6','if':st(AN,'FAMILIAR'),'week':[12,18],
  'lines':['這學期讀書會讀行政法。小語說行政法比憲法還不像人話。','……她說得有道理，可是我不會跟她說。'],
  'choices':[ch('「妳們和好了？」','本來就沒有不好。她隔天傳了一張貓的貼圖給我。我回她一題憲法。'),
             ch('「小語還是每次都帶宵夜？」','每次。上禮拜是鹽酥雞，整間研討室都是味道。',rel={'comf':1})],'rel':{'fam':2},
  'extraIf':[{'if':{'events':['ev_an_yu_argument']},'lines':['（她停了一下）讀書會那天，我跟小語沒有吵。是在辯論。……好，有一點吵。']}],
  'note':'AA_238 5-5（2026-10-17 AA-C）：讀書會改到大一上，原本這一層（讀書會開始了）搬到大一上 A-L11；這一層改成大一下的讀書會。吵架改在讀書會裡（第 12 週週四），extraIf 只給看過 ev_an_yu_argument 的玩家；「妳們和好了？」照 LADDER_CHOICE_IF（A2-L6：events ev_an_yu_argument），沒看過吵架的只看到選項②。「我可以去嗎？」的條件改掛 A-L11'},
 {'id':'A2-L7','if':st(AN,'FRIEND'),
  'lines':['我媽上次說我講話越來越像她。','講很快，又不太讓別人插嘴。'],
  'choices':[ch('「哪裡像？」','她說我打電話都直接講事情，不先問她吃飽沒。'),
             ch('「像也沒關係吧。」','也是啦。只是被她講出來有點不甘心。',rel={'trust':1})],'rel':{'fam':2,'trust':2},'mem':'AN2_LIKE_MOM',
  'note':'**不說媽媽的職業**（法官；AA_113：大四畢業典禮才第一次對朋友說）。只講說話方式（2026-10-17 口語改稿照 AA_209 附錄 A）'},
 {'id':'A2-L8','if':st(AN,'FRIEND'),'week':[14,18],
  'lines':['暑假我七月底回台中兩個禮拜。','其他時間都在臺北，還不知道要幹嘛。'],
  'choices':[ch('「要不要一起排？」','好啊，你先想想要去哪，我再看時間。',rel={'comf':2}),
             ch('「沒排也很好。」','也是，說不定就在總圖待一整個暑假。')],'rel':{'fam':2,'comf':1},'mem':'AN2_SUMMER',
  'note':'AA_197 1-4：以安暑假 7/25～8/8 在台中（2026-10-17 照 AA_209 第 4 節第 8 點改日期，原本寫 AA_128 的 7/18～7/31；台詞照 AA_209 附錄 A）'},
],'greet':{'base':['我等一下要去印講義。','這學期憲法進度好快，我都抄不完。','總圖二樓最近晚上都坐滿。','（她看了一下手機）我室友在找我，先走喔。','欸，你也來了。'],
 'when':[{'time':[7,9],'location':['campus','library_hall'],'t':'（她嘴裡念著動詞變化）……行きます、行きました……啊。早。'},
         {'week':[3,6],'location':['campus'],'t':'杜鵑花開了。……我已經拍了。'},
         {'weekday':[4],'time':[19,21],'location':['wancai'],'week':[2,16],'t':'讀書會快開始了，我先上去開門。'},   # 讀書會大一上第 10 週就開了（AA_238），大一下整學期
         {'week':[10,15],'location':['campus','library_hall','library'],'t':'日文課下禮拜小考。……我國中就想去日本交換了。'},   # AA_253 §7：交換地點由交往對象決定，大二下學期末以前要讓玩家知道她想去日本
         {'location':['library_hall','library'],'weather':'rain','t':'下雨了。傘借室友了，我等雨小一點再走。'},
         {'week':[16,18],'t':'期末了，我這禮拜每天都待到總圖閉館。'}]},
 'note':'大一下以安的作息照大一上（重疊的必修一定在教室）；新增早上七點的日文課（週一、三、五，總圖附近）（2026-10-17：短招呼 base 五句、when 的讀書會／下雨／期末三句照 AA_209 附錄 A 換）'}

D['characters'][YT] = {'steps': [
 {'id':'Y2-L1','if':st(YT,'ACQUAINTANCE'),'week':[1,18],
  'lines':['過年店裡休了幾天，阿姨很不習慣。','她把每張椅子都擦了一遍，放假還在擦。'],
  'choices':[ch('「那妳呢？」','我就陪她擦啊，不然也沒事做。'),
             ch('「阿姨好認真。」','她說手停下來會想東想西。')],'rel':{'fam':2},'mem':'YT2_NEWYEAR',
  'note':'（2026-10-17 口語改稿照 AA_209 附錄 A；過年店休不寫天數，AA_209 第 2 節）'},
 {'id':'Y2-L2','if':st(YT,'ACQUAINTANCE'),'location':['campus','library_hall','library'],
  'lines':['這學期有一門課，要去訪問一個人。','我想訪問阿姨，她說不要，說她又沒什麼故事。'],
  'choices':[ch('「她有很多故事。」','我也這樣跟她講，她就跑去洗碗了。'),
             ch('「換一個人訪問？」','我想再問她一次看看，不行再換。')],'rel':{'fam':2,'trust':1},'mem':'YT2_INTERVIEW',
  'note':'（2026-10-17 口語改稿照 AA_209 附錄 A）'},
 {'id':'Y2-L3','if':st(YT,'ACQUAINTANCE'),'week':[6,18],
  'lines':['春假那幾天店裡照開，我都在顧店。','一直有人拖著行李從門口經過，應該是要回家或出去玩。'],
  'choices':[ch('「下次一起出去？」','好啊，可是要等阿姨那邊排得出人。'),
             ch('「店裡也很好。」','也是啦，至少不用擠車。')],'rel':{'fam':2},
  'extraIf':[{'if':{'flags':['dating_heroine_03']},'lines':['明年春假，我想跟阿姨請一天假。']}],
  'note':'春假 4/3～4/6（交接包 v2 第 6～7 週）；說法用「那幾天」，第 6 週以後都說得通（2026-10-17 口語改稿照 AA_209 附錄 A）。2026-10-17 AA-C（AA_215／AA_216 大一下 #8）：交往中多一句（extraIf dating_heroine_03），接選項①「下次一起出去？」→「要等阿姨那邊排得出人」也通'},
 {'id':'Y2-L4','if':st(YT,'FAMILIAR'),'week':[10,18],
  'lines':['阿姨換了一盞新燈，舊的那盞用了快二十年。','我把舊的拿回家了，丟掉有點捨不得。'],
  'choices':[ch('「留著很好。」','我放在書桌上，結果太亮，晚上開著很刺眼。'),
             ch('「新的比較亮嗎？」','亮很多，客人說湯看起來比較好吃。',rel={'comf':1})],'rel':{'fam':2,'comf':1},'mem':'YT2_OLD_LAMP',
  'linesIf':[{'if':{'events':['ev_yutong_absent']},'lines':['阿姨的手好了。可以拿湯勺了。……她第一天就偷拿。','她還換了一盞新的燈。舊的那盞亮了二十年，我拿回家了。']}],
  'note':'**不說大一期中那週她顧店到很晚、在櫃台念書**——那是大二事件 10「期中考那一週」要讓玩家事後才知道的（AA_11）。看過語彤 4（ev_yutong_absent，阿姨包著護腕）的玩家只多聽到「阿姨的手好了」（2026-10-17 口語改稿：lines、兩個選項照 AA_209 附錄 A，選項②的字也換；linesIf 附錄沒列，照舊）'},
 {'id':'Y2-L5','if':st(YT,'FAMILIAR'),'week':[11,18],
  'lines':['阿姨最近話變少了，問她都說沒事。'],
  'choices':[ch('「會沒事的。」','希望啦。'),
             ch('「需要幫忙就說。」','好。可是我也不知道要你幫什麼，有的話再說。',rel={'trust':2})],'rel':{'fam':2,'trust':1},'mem':'YT2_WORRY',
  'linesIf':[{'if':{'events':['ev_yutong_landlord']},'lines':['房東那件事，阿姨不讓我問。','她還是照常開店，只是收店收得很慢。']}],
  'note':'語彤 6 房東來過了（ev_yutong_landlord，第 10 週以後）。沒看到那一晚的玩家，她不提房東（大二上事件 8 要能在沒有 RENT_RUMOR 時照常演）（2026-10-17 口語改稿照 AA_209 附錄 A：寫看得到的行為，不寫象徵句）'},
 {'id':'Y2-L6','if':st(YT,'FAMILIAR'),'week':[12,18],
  'lines':['阿哲最近來店裡，都坐靠門口那個位子。','小語每次都坐他旁邊。'],
  'choices':[ch('「妳看得好仔細。」','端麵的時候就會看到啊。'),
             ch('「他們怎麼了？」','不知道，你去問阿哲啊。')],'rel':{'fam':2},'mem':'YT2_SEATS',
  'note':'小語 語 2「剛好路過」（第 16 週）之前的小徵兆，語彤只說看到的、不下結論；不能說成在一起（大二上才在一起）（2026-10-17 口語改稿照 AA_209 附錄 A）'},
 {'id':'Y2-L7','if':st(YT,'FRIEND'),
  'lines':['大二開始可以多修別系的課。我想多修一個系。','阿姨叫我選喜歡的。我說，我喜歡的要先考試。'],
  'choices':[ch('「阿姨很懂。」','她講得很簡單啦，又不是她要考。'),
             ch('「妳喜歡什麼？」','……考上再跟你說。社會系的我也喜歡，訪問人、聽人講事情那種。',rel={'trust':2})],'rel':{'fam':2,'trust':2},'mem':'YT2_FUTURE',
  'note':'（2026-10-17 口語改稿照 AA_209 附錄 A：阿姨的話不當收尾格言，三句併成兩句）。2026-10-17 AA-C（AB65-3 大一下再過一次）：原本「我還不知道要往哪個方向」和 AA_221 第二節衝突——她大一下正在準備法律系雙主修（5/28～29 報名、6/18 筆試）；改成暗示「要先考試」，不說破是法律（《你以前是經濟系的？》和甄選照 BB_191 4-3）；選項②保留「訪問人」（事件 13 田野的伏筆，YT2_FUTURE 照舊）'},
 {'id':'Y2-L8','if':st(YT,'FRIEND'),'week':[14,18],
  'lines':['暑假學生少了，可是附近上班的人還是會來，店裡一樣忙。','我週二、週四一樣在。'],
  'choices':[ch('「我會來。」','好啊，來之前傳一下，我幫你留位子。',rel={'comf':2}),
             ch('「妳也要休息。」','會啦，我想找一天陪我媽出去走走。')],'rel':{'fam':2,'comf':1},'mem':'YT2_SUMMER',
  'note':'locTime 同大一上：在麵店只有週二、四 20:00～20:30 推進（2026-10-17 口語改稿照 AA_209 附錄 A）'},
],'greet':{'base':['（她點了一下頭）嗨。','這禮拜報告好多。','（她抱著一本很厚的書）這本禮拜五前要看完。','我剛從系館出來。'],
 'when':[{'location':['noodle'],'weekday':[2,4],'time':[17.5,20],'t':'今天客人多，你先找位子坐。'},
         {'location':['noodle'],'weekday':[2,4],'time':[20,20.5],'t':'快打烊了，阿姨說剩下的湯給你。'},
         {'location':['library_hall','library'],'weekday':[1,3,5],'time':[19,21.5],'t':'（她在靠窗的位子，抬頭跟你揮了一下手）'},
         {'weather':'rain','t':'下雨了。我多帶一把傘，要用就拿去。'},
         {'week':[16,18],'location':['noodle'],'t':'最近長桌都是考生，吃麵也在看筆記。'}]},
 'note':'語彤的日程照大一上：週二四 17:30～20:30 麵店；一三五 19:00～21:30 總圖。Y2-L8 在麵店照大一上的 locTime（2026-10-17：短招呼 base、when 五句照 AA_209 附錄 A 換；base 第 5 句「……你也來了。」照附錄刪掉，剩 4 句）'}
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
        if g and not 4<=len(g['base'])<=5: err.append(cid+' 短招呼不是 4～5 句')   # 2026-10-17：AA_209 附錄 A 刪掉語彤一句，4 句也可以輪替
    return err
e=check(D)
if e: sys.exit('\n'.join(e))
if '--check' not in sys.argv:
    json.dump(D,open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'ladder_aa_y1s2.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('ok', {k:len(v['steps']) for k,v in D['characters'].items()})
