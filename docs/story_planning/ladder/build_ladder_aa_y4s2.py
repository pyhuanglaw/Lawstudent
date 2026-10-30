# -*- coding: utf-8 -*-
"""大四下（Y4S2）的閒聊階梯：以安（heroine_01）、語彤（heroine_03）→ ladder_aa_y4s2.json。作者：AA-B 2026-10-16；2026-10-17 AA-C 照 AA_263 附錄 A 改稿。
原稿說明：../AA_152_閒聊階梯_大四下_以安語彤.md。格式同 ladder_aa_y4s1.json，term＝'Y4S2'。
依據：交接包_v5 F15（杜鵑花第四張，第 3 週 3/8）、F18（春假 4/3～4/4，第 7 週）、F19（語彤 16b 阿姨的照片 4/19，第 9 週）、F20（以安新 20，第 11 週）、F21（系籃最後一場、成發 5/12，第 12 週）、
F22～F25（收拾 6/1、畢業典禮 6/2——都在第 15 週）；AA_144 X4（以安和交換路線的玩家補修：民訴甲下、保險法）、X5（典禮照常、證書下學期）。
**時間**：典禮 2029-06-02（六）在第 15 週，之後沒有自由時間（AA_128 11-1；同 BB 的 Y4S2，AA_263 第 4 節第 5 點 (a)）→ 所有週次上限 15，沒有典禮後的層。
典禮前說「典禮那天」未來式的層用 skipIf `GRAD_DONE`（暫名，LAWWW 在 6/2 典禮後設）：6/2 晚上、6/3 不再播未來式。
**路線**：大四下所有路線都在臺灣。~~以安延畢一學期~~（2026-10-20 AA-C：使用者 10-18 以安不延畢，交換前多修課；2029-02-03 法研所筆試、3/22 放榜上了商法組，8 月司法官一試，`AA_285`）；語彤延畢一年（社會系＋法律雙主修，證書 2030，AA_253 §11），兩人照常參加 6/2 的典禮。
事件 13 以後語彤週四不顧店（另一個工讀生），週二照顧；祐廷是麵店工讀生的玩家（`JOB_NOODLE` 暫名）週二上班。
**不搶事件的戲**：新 20 為什麼念法律（唯一的回聲）、新 21 介紹媽媽、16b 阿姨的照片、17 典禮，階梯都不講；媽媽的職業階梯一律不說。
以安這學期說出口的「理由」：階梯裡一處都不留（只留新 20 戀愛版，不在階梯；AA_263 第 4 節第 6 點）。
**防卡關**：`if` 只放階段；週次上限 15（典禮那一週），不到 15 的要 skipIf 或 skipAfterWeek。
用法：python3 build_ladder_aa_y4s2.py → ladder_aa_y4s2.json；--check 只檢查。"""
import json, sys, os
Y='Y4S2'
WMAX=15  # 這學期最後一週（6/2 典禮）
def st(npc, mn): return {'stage': {'npc': npc, 'min': mn}}
def ch(t, reply, rel=None, mem=None):
    c = {'t': t, 'reply': reply}
    if rel: c['rel'] = rel
    if mem: c['mem'] = mem
    return c
AN='heroine_01'; YT='heroine_03'
D = {'_comment': __doc__, 'term': Y, 'characters': {}}
JP={'flagIs':{'EXCHANGE_ROUTE':'JP'}}
GRAD={'flags':['GRAD_DONE']}  # 暫名：6/2 典禮後

D['characters'][AN] = {'steps': [
 {'id':'A8-L1','if':st(AN,'ACQUAINTANCE'),'week':[1,15],
  'lines':['這學期我多選了一門保險法。不是必修。','……學分早就夠了。就是想上。'],
  'choices':[ch('「學分夠了還選？」','保險法很好玩。真的。……你那個表情是什麼意思。'),
             ch('「妳很喜歡商法。」','嗯。公司、保險、證券。小語說我講到這些，眼睛會亮。',rel={'comf':1})],'rel':{'fam':2,'comf':1},'mem':'AN8_ELECTIVE',
  'extraIf':[{'if':JP,'lines':['你補修的那門民訴，我的筆記還在。要的話跟我說。']}],
  'note':'2026-10-20 AA-C（AA_313）：以安不延畢（使用者 10-18，AA_285），原本「補修班坐最後一排」（AN8_RETAKE）整層換掉：她大四下多選商法的課（使用者 10-18：她對公司法、證券交易法、保險法更有興趣）；記憶改 AN8_ELECTIVE。日本路線的祐廷延畢補修，extraIf 她借筆記（原本給 LAWWW 的 LADDER_REPLY_IF 不用做）'},
 {'id':'A8-L2','if':st(AN,'ACQUAINTANCE'),'week':[4,15],'location':['campus'],
  'lines':['第四張拍完了。四年，四張。','四張排在一起，第一張我站得好僵。'],
  'choices':[ch('「給我看。」','好。……四張拍完才給看。現在可以了。',rel={'trust':1}),
             ch('「這張是誰拍的？」','小語。她一直叫我笑，我就笑了。')],'rel':{'fam':2,'trust':1},'mem':'AN8_AZALEA4',
  'note':'杜鵑花第四張（第 3 週 3/8，AA_71 2-9）；收尾大二下 A4-L1（「四張拍完才給看」）；CG-18 只在戀愛線，階梯不提。'
         '**給 LAWWW**：選項②用 `LADDER_REPLY_IF`，和以安交往中（dating_heroine_01，第四張是語彤拍的，Y8-L2）回「語彤。她拍了很多張。」。2026-10-17 AA-C 照 AA_263 附錄 A 改稿'},
 {'id':'A8-L3','if':st(AN,'FAMILIAR'),'week':[6,15],
  'lines':['商法組放榜那天，我媽打了兩次電話。','第一次說恭喜。第二次問我，八月的司法官讀到哪了。'],
  'choices':[ch('「讀到哪了？」','行政法第二遍。……你不要也問。',rel={'trust':1}),
             ch('「要不要一起讀？」','好。週四總圖三樓，語彤也在。三個人都不講話。',rel={'comf':1})],'rel':{'fam':2,'trust':1},
  'note':'2026-10-20 AA-C（AA_313）：以安不延畢，2/3 和大家同一場、3/22（四，第 5 週）放榜上了商法組（AA_285 第 4 節①），所以從第 6 週開；原本「研究所我明年二月才考」（2030-02-16）作廢。不說媽媽的職業'},
 {'id':'A8-L4','if':st(AN,'FAMILIAR'),'week':[8,15],
  'lines':['上次回台中，我把手帳都帶回家放了。','只帶了最新那本上來。'],
  'choices':[ch('「十一本都放家裡？」','十二本，日本又多一本。媽媽幫我照年份排在書架上。'),
             ch('「為什麼只帶一本？」','其他的太重了。這本還在寫。')],'rel':{'fam':2,'comf':1},
  'note':'春假只有 4/3～4/4（第 7 週），是她排行程的春假旅行（AA_181 第 4 節），所以不說「春假回台中」；接 A5-L7（手帳十一本）。2026-10-17 AA-C 照 AA_263 附錄 A 改稿'},
 {'id':'A8-L5','if':st(AN,'FAMILIAR'),'week':[13,15],
  'lines':['系籃最後一場你有去嗎？阿哲最後一分鐘被換下來。','他坐在板凳上，毛巾一直蓋著頭。'],
  'choices':[ch('「他還好嗎？」','比完就好了，晚上還說要請大家吃雞排。'),
             ch('「妳也有去？」','有。小語喊到聲音啞了，晚上講話都是氣音。',rel={'comf':1})],'rel':{'fam':2,'comf':1},
  'note':'系籃最後一場、成發同一天（5/12（六），第 12 週，交接包_v5 F21、AA_181 第 4 節）。2026-10-17 AA-C 照 AA_263 附錄 A 改稿'},
 {'id':'A8-L6','if':st(AN,'FRIEND'),'week':[12,15],'skipIf':GRAD,
  'lines':['畢業典禮，我媽要來。','……我還在想，要怎麼介紹她。'],
  'choices':[ch('「介紹她，很難嗎？」','不難。可是我想好要講什麼以前，不想先講。',rel={'trust':2}),
             ch('「妳媽媽一定很開心。」','她說她要坐第一排。我說家長沒有第一排。')],'rel':{'fam':2,'trust':2},'mem':'AN8_INTRODUCE',
  'extraIf':[{'if':{'flags':['dating_heroine_01']},'lines':['我媽說，典禮那天她要看看你。……你站我旁邊。']}],
  'note':'新 21 畢業典禮與媽媽（6/2）的伏筆；**不說她的職業**。和她交往中多一句（新 21 交往版是典禮上才「媽，這是祐廷」，所以不寫「先見你」）。'
         '典禮後的 linesIf、extraIf 刪掉（典禮後沒有自由時間）；skipIf GRAD_DONE：6/2 晚上、6/3 不播未來式。2026-10-17 AA-C 照 AA_263 附錄 A 改稿'},
 {'id':'A8-L7','if':st(AN,'FRIEND'),'week':[12,15],'skipIf':GRAD,
  'lines':['典禮完，九月就是研究所了。','……同一個校園，換一個身分讀書而已。'],
  'choices':[ch('「研究所在哪裡上課？」','A館。跟現在一樣。……我連路都不用重新記。',rel={'trust':2}),
             ch('「捨不得大學嗎？」','有一點。大學的學生證，我想留著。')],'rel':{'fam':2,'trust':2},'mem':'AN8_NEXT_SEPT',
  'note':'2026-10-20 AA-C（AA_313）：以安不延畢，原本「證書要等到明年一月」「延畢會很麻煩嗎」（AN8_DIPLOMA）換掉：典禮後九月念法研所；記憶改 AN8_NEXT_SEPT；skipIf GRAD_DONE 照舊'},
 {'id':'A8-L8','if':st(AN,'FRIEND'),'week':[13,15],
  'lines':['宿舍六月底要清空。我已經裝了四箱，三箱是書。','研究生宿舍九月才進得去。七、八月我在外面租一個小房間讀書。'],
  'choices':[ch('「要幫忙嗎？」','要。搬的那天我借推車，再跟你說。',rel={'comf':2}),
             ch('「要回台中嗎？」','先不要。八月要考試，書都在這裡。')],'rel':{'fam':2,'trust':1},
  'note':'主線 11 收拾、宿舍 6/28 期滿（AA_181 2-9）。2026-10-20 AA-C（AA_313）：她不延畢，九月研究所；暑假在臺北租房準備 8 月司法官一試（AA_285）'},
],'greet':{'base':['行政法我從第一章重讀。','（她在手帳上寫東西，看到你，把筆蓋起來。）你要坐這裡嗎？','學弟妹問我考古題，我都叫他們去問小語。','宿舍的洗衣機又壞了，我排了好久。','你也在？我要去買飲料，要幫你帶嗎？'],
 'when':[{'weekday':[1],'time':[8,12],'t':'等一下證交法。這門課只有九個人。'},
         {'weekday':[3],'time':[8,12],'t':'保險法要點名，我先走了。'},
         {'location':['noodle'],'t':'（長桌，她旁邊空著一個位子）阿哲說他晚點到。'},
         {'weekday':[4],'time':[17,21.5],'location':['library_hall','library'],'t':'（總圖三樓。語彤在對面那桌。）旁邊有位子。'},
         {'week':[4,6],'location':['campus'],'t':'杜鵑快謝了。你今年有拍嗎？'},
         {'weather':'rain','t':'又下雨。我今天穿錯鞋了。'},
         {'week':[14,15],'unless':GRAD,'t':'典禮前我要把報告交完。保險法的我還沒寫。'}]},
 'note':'大四下以安：~~補修（X4）~~ 不延畢、多選商法的課（2026-10-20 AA-C，AA_313；保險法照 AA_263 第 4 節第 9 點週三上午，避開週二的法律實習）、杜鵑花第四張、新 20、新 21、典禮照常（X5）；不說媽媽的職業；說出口的「理由」一處都不留。2026-10-17 AA-C 照 AA_263 附錄 A 改稿'}

D['characters'][YT] = {'steps': [
 {'id':'Y8-L0','if':st(YT,'FRIEND'),'week':[1,4],'skipAfterWeek':4,
  'lines':['跨年我跟我媽在家看電視。','阿姨十一點打電話來，說她那邊看得到一點煙火。'],
  'choices':[ch('「阿姨一個人過嗎？」','她說店收完就睡了，打來只是要說新年快樂。',rel={'trust':1}),
             ch('「好看嗎？」','電視上的很清楚。')],'rel':{'fam':2,'trust':1},'mem':'YT8_NYE_HOME',
  'linesIf':[{'if':{'flags':['dating_heroine_03']},'lines':['跨年我跟我媽在家看電視，阿姨十一點也打來。','十二點那通電話，我媽後來問是誰。','我說同學。她說同學會在十二點打來嗎。']},
             {'if':{'memory':[{'npc':YT,'tag':'YT_TAMSUI_SUNSET'}]},'lines':['跨年我跟我媽在家看電視。阿姨十一點打電話來。','廣告的時候，我跟我媽講了淡水的夕陽。她說下次她也要去。']}],
  'note':'AA_262：原大四上 Y7-L7（跨年在學期以後、AA_210 3-6 在家陪媽媽看電視）搬來；寒假的事，開學頭四週講，過了第 4 週還沒到朋友就跳過。'
         '交往中的玩家 00:01 和她通過電話（AA_210 3-6），用 linesIf；三個版本都提到阿姨的電話，選項①接得上。'
         '**給 LAWWW**：第 1～4 週還不到朋友的玩家，要等到第 5 週 skipAfterWeek 才算過，Y8-L1 以後晚一個月開；程式可以的話加 skipIf「階段低於 FRIEND」（AA_263 第 2 節第 21 點）。2026-10-17 AA-C 照 AA_263 附錄 A 改稿'},
 {'id':'Y8-L1','if':st(YT,'ACQUAINTANCE'),'week':[1,15],'skipIf':GRAD,
  'lines':['社會系的學分我修完了，法律那邊還差一年。','六月典禮我會去，證書要等明年。'],
  'choices':[ch('「還差哪些？」','幾門法律的必修。我排在下學年，跟學弟妹一起上。'),
             ch('「典禮妳穿學士服嗎？」','穿。我媽說一定要拍。',rel={'comf':1})],'rel':{'fam':2,'comf':1},'mem':'YT8_EXTRA_YEAR',
  'note':'語彤延畢一年（社會系＋法律雙主修，AA_253 §11）：2029-06 照常參加典禮，證書延一年；skipIf GRAD_DONE。記憶 YT8_LAST_TERM 改名 YT8_EXTRA_YEAR。2026-10-17 AA-C 照 AA_263 附錄 A 改稿'},
 {'id':'Y8-L2','if':st(YT,'ACQUAINTANCE'),'week':[4,15],'location':['campus'],
  'lines':['以安拍第四張那天，我也在。','她叫小語幫我們兩個拍，拍了好幾張她都說不行。'],
  'choices':[ch('「照片在哪？」','在以安手機裡。她說要先給她媽看。'),
             ch('「她是不是很挑？」','很挑。換了三個位置，最後還是站原本那裡。')],'rel':{'fam':2,'comf':1},
  'linesIf':[{'if':{'flags':['dating_heroine_01']},'lines':['以安拍第四張那天，是我幫你們拍的。','她說兩個人都要在裡面。……我拍了十二張，她只要第一張。']}],
  'note':'杜鵑花第四張（第 3 週）；接大三下 Y6-L3（上次語彤是拍的人）。和以安交往中，第四張是以安和祐廷兩人入鏡，語彤是拍的人（linesIf dating_heroine_01）；選項兩個版本都通。2026-10-17 AA-C 照 AA_263 附錄 A 改稿'},
 {'id':'Y8-L3','if':st(YT,'FAMILIAR'),'week':[6,15],
  'lines':['〈公館的時間〉要放進系上的年度合集。','阿姨問，那她要不要簽名。'],
  'choices':[ch('「讓她簽。」','……她簽了。簽在最後一段旁邊。很小。'),
             ch('「妳也要簽。」','……我不要。我的名字在標題下面，已經很大了。')],'rel':{'fam':2,'trust':1},
  'note':'15b〈公館的時間〉之後。2026-10-17 AA-C 照 AA_263 附錄 A 改稿'},
 {'id':'Y8-L4','if':st(YT,'FAMILIAR'),'week':[8,15],'skipIf':GRAD,
  'lines':['我媽說，畢業典禮她要來。她去買了一雙新鞋。','買完又拿去修鞋店，請老闆幫她加一層止滑。'],
  'choices':[ch('「新鞋也要修？」','她說新鞋會滑。老闆笑她，還是幫她弄了。'),
             ch('「我想見妳媽媽。」','典禮那天就見得到。她會一直說我話太多。',rel={'trust':1})],'rel':{'fam':2,'trust':1},'mem':'YT8_MOM_SHOES',
  'linesIf':[{'if':{'flags':['dating_heroine_03']},'lines':['我媽說，畢業典禮她要來。她買了新的鞋。','……她說你那天也要穿好一點。她要拍照。']}],
  'note':'接大三下 Y6-L4（修鞋店）；事件 17 典禮前，skipIf GRAD_DONE。和她交往中換 lines（linesIf dating_heroine_03）。'
         '**給 LAWWW**：選項②「我想見妳媽媽。」對已經見過媽媽的男朋友不對，用 `LADDER_REPLY_IF`：dating_heroine_03 回「……你上禮拜才見過。她說你可以再來。」。2026-10-17 AA-C 照 AA_263 附錄 A 改稿'},
 {'id':'Y8-L5','if':st(YT,'FAMILIAR'),'week':[11,15],
  'lines':['阿姨回來，帶了一盒日本的醬油。','……她說，沒有我們的好。可是她每天都用一點。'],
  'choices':[ch('「她很想念日本吧。」','嗯。她說明年還要去，店再休一個禮拜。'),
             ch('「妳呢？想去嗎？」','……想。跟阿姨一起。下次我請假。')],'rel':{'fam':2,'comf':1},
  'note':'16b 阿姨第一次出國（4/19，第 9 週；麵店公休 4/19～4/25）之後；不重講照片。選項①原本「工讀生已經答應了」：出國那週店是休的、工讀生也要畢業（Y8-L6），改成「店再休一個禮拜」。2026-10-17 AA-C 照 AA_263 附錄 A 改稿'},
 {'id':'Y8-L6','if':st(YT,'FRIEND'),'week':[13,15],
  'lines':['週四那個工讀生也要畢業了，他要去當老師。','阿姨在問有沒有學弟妹想來顧店。'],
  'choices':[ch('「我幫妳問問看。」','好。週四晚上的班，要會切蔥的。',rel={'comf':1}),
             ch('「那店裡呢？」','先我跟阿姨顧，暑假我本來就在。')],'rel':{'fam':2,'comf':1},
  'extraIf':[{'if':{'flags':['JOB_NOODLE']},'lines':['阿姨叫我問你，畢業以後還來不來顧店。']}],
  'note':'事件 14 之後請的週四工讀生（事件 13 以後語彤週四不顧店）；祐廷是麵店工讀生（週二，JOB_NOODLE 暫名）多一句 extraIf。不用阿姨的話收尾。2026-10-17 AA-C 照 AA_263 附錄 A 改稿'},
 {'id':'Y8-L7','if':st(YT,'FRIEND'),'week':[12,15],
  'lines':['學士照拍好了。阿姨說要貼在紅紙旁邊。','我說我證書還沒拿到，她說先貼再說。'],
  'choices':[ch('「拍得好看嗎？」','攝影師一直叫我笑，我笑到臉很痠。',rel={'trust':2}),
             ch('「明年證書拿到再換一張？」','她說那時候要換一張大的。')],'rel':{'fam':2,'trust':2},'mem':'YT8_GRAD_PHOTO',
  'note':'典禮前的學士照（她延畢一年，證書明年）；接大四上 Y7-L6（紅紙是她寫的、阿姨說每年都要），不再宣告「二十四年那張我自己寫」。2026-10-17 AA-C 照 AA_263 附錄 A 改稿'},
 {'id':'Y8-L8','if':st(YT,'FRIEND'),'week':[13,15],'location':['noodle','campus','library_hall','library','wenzhou'],
  'lines':['工讀生做到六月，暑假週四我回來顧店。','反正暑假也要讀書，在店裡讀也一樣。'],
  'choices':[ch('「我週四來吃。」','好。來之前傳一下，我留長桌。',rel={'comf':2}),
             ch('「那妳的田野呢？」','暑假先停，九月再說。')],'rel':{'fam':2,'trust':1},'mem':'YT8_SUMMER_THURSDAY',
  'note':'接 Y8-L6（週四的工讀生要畢業）；事件 13 以後週四不是她的班，不說「還是」、不宣告（AA_263 第 4 節第 8 點 (a)）。記憶 YT8_CHOSE_THURSDAY 改名 YT8_SUMMER_THURSDAY。不用「斜對面」（戀愛線專用）。2026-10-17 AA-C 照 AA_263 附錄 A 改稿'},
],'greet':{'base':['（她把耳機拿下來一邊。）怎麼了？','法律的課我排到下學年了，這學期比較空。','你也來讀書？我快讀完這章了。','（她在筆記本上畫桌子的位置。）阿姨說店裡的桌子要重新排。','我要去影印，你有要印什麼嗎？'],
 'when':[{'weekday':[4],'time':[17,21.5],'location':['library_hall','library'],'t':'（總圖三樓，她在打逐字稿。）你小聲一點，以安在讀書。'},
         {'location':['noodle'],'weekday':[2],'time':[17.5,20],'if':{'flags':['JOB_NOODLE']},'t':'今天人多，你先去收那兩桌。'},
         {'location':['noodle'],'weekday':[2],'time':[17.5,20],'unless':{'flags':['JOB_NOODLE']},'t':'今天乾麵賣完了，湯麵可以嗎？'},
         {'location':['noodle'],'weekday':[6],'time':[9,11],'t':'（她在剝蒜頭）還沒開喔，十一點才開。'},
         {'location':['noodle'],'week':[11,15],'t':'阿姨從日本帶回來的醬油，你吃得出來嗎？'},
         {'week':[6,15],'t':'（她拿著系上的年度合集）你不要翻到最後一段。'},
         {'week':[8,9],'t':'期中考週。我只考一科，其他都是報告。'},
         {'weather':'rain','t':'下雨了。我要先回店裡收招牌。'}]},
 'note':'大四下語彤：延畢一年（典禮照常、證書明年）、16b、事件 17 典禮；週六在麵店備料（不在法服）；階梯只寫事件之外。2026-10-17 AA-C 照 AA_263 附錄 A 改稿'}

def texts(c):
    """這個人所有會播的句子（層的 lines、linesIf、extraIf、選項回覆、招呼）。"""
    out=[]
    for s in c['steps']:
        out+=s['lines']+[x for li in s.get('linesIf',[])+s.get('extraIf',[]) for x in li['lines']]+[c2['reply'] for c2 in s.get('choices',[])]
    g=c.get('greet',{})
    out+=g.get('base',[])+[w['t'] for w in g.get('when',[])]
    return out
def dots(t):
    """「……」開頭（含旁白（…）後面接「……」）。"""
    if t.startswith('（') and '）' in t: t=t[t.index('）')+1:]
    return t.startswith('……')
def check(d):
    err=[]
    for cid,c in d['characters'].items():
        ids=[s['id'] for s in c['steps']]
        if len(ids)!=len(set(ids)): err.append(cid+' 層 id 重複')
        for s in c['steps']:
            for l in s['lines']+[x for li in s.get('linesIf',[])+s.get('extraIf',[]) for x in li['lines']]+[c2['reply'] for c2 in s.get('choices',[])]:
                if len(l)>60: err.append(f"{s['id']} 台詞太長：{l}")
            if len(s.get('choices',[]))>2: err.append(s['id']+' 選項超過 2')
            # 防卡關：if 只能放階段（stage）或 any 裡的階段／flagNum
            bad=[k for k in s.get('if',{}) if k not in ('stage','any')]
            if bad: err.append(f"{s['id']} 的 if 只能放階段（防卡關）：{bad}")
            # 週次：這學期到第 15 週（6/2 典禮）為止；上限 15 才算不卡關，不到 15 要 skipIf／skipAfterWeek；超過 15 是舊的（典禮後沒有自由時間）
            if 'week' in s:
                if s['week'][1]>WMAX: err.append(f"{s['id']} 週次上限 {s['week'][1]} 超過第 {WMAX} 週（典禮後沒有自由時間）")
                if s['week'][1]<WMAX and not s.get('skipIf') and not s.get('skipAfterWeek'): err.append(f"{s['id']} 週次上限不到第 {WMAX} 週，也沒有 skipIf／skipAfterWeek（會卡關）")
            for li in s.get('linesIf',[])+s.get('extraIf',[]):
                if 'week' in li and li['week'][1]>WMAX: err.append(f"{s['id']} 的 linesIf／extraIf 週次超過第 {WMAX} 週（播不到）")
            for t in ('不准賴',):
                if cid==AN and any(t in x for x in s['lines']+[c2['reply'] for c2 in s.get('choices',[])]): err.append(f"{s['id']} 以安「不准賴」只用在論證")
        g=c.get('greet')
        if g:
            if len(g['base'])!=5: err.append(cid+' 短招呼不是 5 句')
            for w in g.get('when',[]):
                if 'week' in w and w['week'][1]>WMAX: err.append(f"{cid} 招呼週次超過第 {WMAX} 週（播不到）：{w['t']}")
                if len(w['t'])>60: err.append(f"{cid} 招呼太長：{w['t']}")
        T=texts(c)
        n=sum(dots(t) for t in T)
        if n*4>=len(T): err.append(f"{cid} 「……」開頭 {n}/{len(T)} 句，要壓到 25% 以下（AA_188）")
        if cid==AN and any('理由' in t for t in T): err.append('以安這學期說出口的「理由」階梯裡一處都不留（AA_263 第 4 節第 6 點）')
    return err
e=check(D)
if e: sys.exit('\n'.join(e))
if '--check' not in sys.argv:
    json.dump(D,open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'ladder_aa_y4s2.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('ok', {k:len(v['steps']) for k,v in D['characters'].items()}, {k:f"「……」開頭 {sum(dots(t) for t in texts(v))}/{len(texts(v))}" for k,v in D['characters'].items()})
