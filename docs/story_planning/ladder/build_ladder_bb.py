# -*- coding: utf-8 -*-
"""BB_130 → ladder_bb.json（給 LAWWW-B 直接實作）。作者：BB-B 2026-10-15（使用者 2026-10-15 授權：大一上閒聊全案通過，直接實作）。
條件鍵和遊戲現有 SMALLTALK 一樣（story3d.js S.smallTalk 的 ok()）：if／unless（EVENTS.cond：stage、events、memory、flags、notFlags、flagNum…）、term、week、location（zone）、time [h0,h1)、weekday（0＝日）。
step：依序推進；每人每天最多一層；after 自動是上一層。context:'date' ＝ 只在「我們的日子」見面或視訊時（可昕）。
choices：玩家二選一；reply 是她的收尾；rel、mem 是該選項的結果（mem＝記憶 tag，寫在她身上）。
greet：當天推進過或條件未到時的短招呼；先挑符合 when 的情境句，沒有就用 base 輪替（不連續重複）。
用法：python3 build_ladder_bb.py → ladder_bb.json；python3 build_ladder_bb.py --check 只檢查。"""
import json, sys, os
Y='Y1S1'
def st(npc, mn): return {'stage': {'npc': npc, 'min': mn}}
def ch(t, reply, rel=None, mem=None, who=None):
    c = {'t': t, 'reply': reply}
    if rel: c['rel'] = rel
    if mem: c['mem'] = mem
    return c

ZR='heroine_02'; ZQ='heroine_04'; SIS='heroine_05'; PS='classmate_peishan'; KX='kexin'
D = {'_comment': __doc__, 'term': Y, 'characters': {}}

D['characters'][ZR] = {'steps': [
 {'id':'Z-L1','if':st(ZR,'ACQUAINTANCE'),'unlessWorking':True,
  'lines':['欸，你是上次來店裡那個吧？','我就覺得很眼熟。我在兩點半打工，溫州街那間。'],
  'choices':[ch('「對，妳記性很好。」','還好啦，客人不多的時候比較記得住。你那天點什麼我就忘了。'),ch('「妳今天沒班？」','沒啊，今天休假。難得可以出來晃。')],'rel':{'fam':2}},
 {'id':'Z-L2','if':st(ZR,'ACQUAINTANCE'),'unlessWorking':True,
  'lines':['你們法律系是不是每天都在背東西？','我們外文也是欸。單字、詩，還有一堆作家的名字。'],
  'choices':[ch('「我們背條文，你們背詩。」','詩比較短啦，可是很多根本看不懂。'),ch('「我比較怕考申論。」','我們期末是交報告，寫到最後都在湊字數。')],'rel':{'fam':2}},
 {'id':'Z-L3','if':st(ZR,'ACQUAINTANCE'),'unlessWorking':True,
  'lines':['欸，週五經原你是不是坐前面？我坐你後面兩排。','我是第二次修啦。第一次期中考完我就沒去了。','那學期很亂。'],
  'linesIf':[{'if':{'events':['ev_zhiruo_ge_group']},'lines':['經原我是第二次修啦。第一次期中考完我就沒去了。','那學期很亂。']}],
  'choices':[ch('「這次我盯著妳，不讓妳翹。」','好啊，那你要記得叫我。我早上真的爬不起來。'),ch('「那學期怎麼了？」','就……很多事啦。之後再跟你講。',mem='ZR_ASKED_MESSY')],'rel':{'fam':3},
  'note':'2026-10-16 BB-B：原本 if 要 ev_zhiruo_ge_group（Y1S1 一次性的 auto 事件，錯過就永遠卡在 Z-L3）→ 拿掉；分組過的玩家（linesIf）不說「坐你後面兩排」那句；選項改成兩種玩家都說得通'},
 {'id':'Z-L4','if':st(ZR,'FAMILIAR'),'unlessWorking':True,
  'lines':['店裡很多熟客一進來就說「跟上次一樣」。','我滿喜歡聽到這句的，不用想要推薦什麼。'],
  'choices':[ch('「因為妳都記得。」','也沒有都記得啦。記錯過一次，客人超尷尬，我更尷尬。'),ch('「那我下次也說這句。」','好啊。那你要記得你上次點什麼。')],'rel':{'fam':2,'comf':2}},
 {'id':'Z-L5','if':st(ZR,'FAMILIAR'),'location':['campus','putong','boya'],'weekday':[2,4],
  'lines':['我們上課的教室，窗戶看出去就是椰林大道。','上課無聊就一直看外面騎車的人。真的很多人騎車不看路欸。'],
  'choices':[ch('「法律系的窗戶看出去是另一棟法律系。」','真的假的，那也太慘。'),ch('「妳上課都在看窗外喔？」','也沒有都啦。老師講到我聽不懂的時候才看。')],'rel':{'fam':2}},
 {'id':'Z-L6','if':st(ZR,'FAMILIAR'),'unlessWorking':True,
  'lines':['我家在台中開影印店，學校旁邊那種。','我小時候放學都在店裡寫功課。有時候會看到很奇怪的，像尋狗啟事一次印三百張。'],
  'choices':[ch('「尋狗啟事？」','對啊，印了三百張，結果隔天狗自己回家了。我媽到現在還在講。'),ch('「那妳從小就看很多別人的東西。」','……你這樣講好像我在偷看。好啦，是有一點。')],'rel':{'fam':3,'trust':2},'mem':'ZR_HOMETOWN'},
 {'id':'Z-L7','if':st(ZR,'FAMILIAR'),'location':['cafe','wenzhou'],'time':[19,24],'unlessWorking':True,
  'lines':['你有沒有那種電影，看完不太想跟別人講的？','就是很喜歡，可是不知道怎麼講，講出來好像就沒那麼好了。'],
  'choices':[ch('「有。」','那你不用跟我講是哪一部，沒關係。'),ch('「沒有。我看完都想講。」','真的喔？那你最近看了什麼？')],'rel':{'fam':2,'comf':2}},
 {'id':'Z-L8','if':{'any':[st(ZR,'FRIEND'),{**st(ZR,'FAMILIAR'),'flagNum':{'CAFE_VISITS':{'min':4}}}]},'unlessWorking':True,
  'lines':['欸，我發現你點東西都會先看我一眼，才看菜單。','是在等我推薦喔？'],
  'choices':[ch('「因為妳會給建議。」','我只是跟你說今天哪支豆子比較好喝而已啦。'),ch('「我沒發現。」','真的假的？你每次都這樣欸。')],'rel':{'fam':2,'comf':3}},
],'greet':{'base':['嗨。（她推一下眼鏡）','嗨！你要去哪？','欸，又遇到你。','欸，你也在這。','（她遠遠揮了一下手）'],
 'when':[{'working':True,'t':'（她在吧檯後面點了一下頭，手沒停）'},
         {'location':['cafe'],'time':[22,24],'t':'快打烊了欸。我等一下也要走了。'},
         {'location':['campus','putong','boya'],'t':'欸，在學校遇到你有點怪欸。你這節有課？'},
         {'weekday':[0,6],'t':'週末欸，你也出來晃？'}]}}

D['characters'][ZQ] = {'steps': [
 {'id':'Q-L1','if':st(ZQ,'ACQUAINTANCE'),'time':[14,24],
  'lines':['你是阿凱的室友對吧？他有跟我講。','他說你很安靜。我們吉他社最近在招人，安靜的也收喔。'],
  'choices':[ch('「我不會彈吉他。」','我會啊，可是來社團不用會。來聽也可以。'),ch('「阿凱怎麼形容我的？」','他說「他會在我打遊戲的時候講法律」。')],'rel':{'fam':2},
  'note':'（2026-10-16 上下文修正：「我們社團」改成「我們吉他社」；這是第一層，玩家不一定知道她在吉他社，選項「我不會彈吉他」才接得上）'},
 {'id':'Q-L2','if':st(ZQ,'ACQUAINTANCE'),'time':[14,24],
  'lines':['你知道資工系館晚上幾點熄燈嗎？十二點。','可是我有三樓的門禁卡，所以常常待到很晚。'],
  'choices':[ch('「法律系館晚上好像很早就關了。」','真的假的？那你們晚上都去哪讀？'),ch('「半夜在系館做什麼？」','寫作業啊。晚上人少，比較不會被吵。')],'rel':{'fam':2}},
 {'id':'Q-L3','if':st(ZQ,'ACQUAINTANCE'),'time':[14,24],'skipIf':{'memory':[{'npc':ZQ,'tag':'INVITED_CLUB'}]},
  'lines':['（她在甩手指）剛剛練太久，手指好痛。','你看，這邊都是繭。按弦按出來的。'],
  'linesIf':[{'if':{'events':['ev_ziqing_club']},'lines':['你上次社課按得好用力喔。','新手都這樣啦，按到痛就是有在按。']}],
  'choices':[ch('「會痛很正常嗎？」','正常啊，大概痛兩個禮拜，之後就不痛了。'),ch('「我的手指不行。」','大家一開始都不行啦。')],'rel':{'fam':2},
  'note':'2026-10-16 BB-B（AA-B 指出）：原本 if 用 notMemory INVITED_CLUB＋要 ev_ziqing_club，有 INVITED_CLUB 或沒去過社課的玩家會永遠卡在 Q-L3 → 有 INVITED_CLUB（聽過 SMALLTALK「手指好了沒」）的用 skipIf 直接算過；沒去過社課的照一般 lines，去過的用 linesIf；選項改成兩種都說得通'},
 {'id':'Q-L4','if':st(ZQ,'FAMILIAR'),'time':[14,24],
  'lines':['我早上真的起不來。晚上腦袋比較清楚。','你們法律系很多早八吧？好可憐。'],
  'choices':[ch('「我也是晚上比較清醒。」','對吧。早上的課根本是在考驗人。'),ch('「早八其實還好。」','騙人，沒有人覺得早八還好。')],'rel':{'fam':2,'comf':2}},
 {'id':'Q-L5','if':st(ZQ,'FAMILIAR'),'time':[14,24],
  'lines':['欸，你常去總圖吧。二樓跟三樓，哪邊插座比較多？','不要問為什麼。我在做一個東西，要用。'],
  'choices':[ch('「三樓吧，靠窗那排。」','（她拿手機記下來。）好，謝啦。'),ch('「做什麼東西？」','做好再跟你說。做不好就不說了。')],'rel':{'fam':3},'mem':'ZQ_OUTLETS',
  'note':'2026-10-16 BB-B（BB_166 1-1，AB-62）：原本說破她在做遊戲（貓、插座），比大一下 Q6 ev_ziqing_secret_game 早；改成只說「在做一個東西」。記憶 ZQ_GAME_HEARD 改 ZQ_OUTLETS'},
 {'id':'Q-L6','if':st(ZQ,'FAMILIAR'),'location':['gongguan','wancai'],'time':[19,24],
  'lines':['我這學期又被助教寄信了，說我缺席太多。','可是期中考我考最高，他好像也不知道要怎麼辦。'],
  'choices':[ch('「成績好就好了吧？」','教授不這樣想啊。我爸更不這樣想。'),ch('「妳不去上課在做什麼？」','睡覺。寫自己的東西。再睡覺。')],'rel':{'fam':2}},
 {'id':'Q-L7','if':{'any':[st(ZQ,'FRIEND'),{**st(ZQ,'FAMILIAR'),'memory':[{'npc':ZQ,'tag':'PLAYTESTED'}]}]},'time':[14,24],
  'lines':['你上次玩的時候，第二關卡好久。','我在旁邊忍住沒講話，很難欸。'],
  'linesIf':[{'unless':{'memory':[{'npc':ZQ,'tag':'PLAYTESTED'}]},'lines':['我在做的那個東西，之後要找人幫我試。','到時候我坐旁邊看你卡在哪，不講話。']}],
  'choices':[ch('「我很容易卡住。」','那剛好，你卡住的地方就是我做壞的地方。'),ch('「妳坐旁邊看，我會緊張。」','那我假裝在滑手機。')],'rel':{'fam':2,'trust':2},
  'note':'2026-10-16 BB-B：沒有 PLAYTESTED、但已經 FRIEND 的玩家用 linesIf 換整套開場（原本寫在 note）；選項改成兩種都說得通'},
 {'id':'Q-L8','if':st(ZQ,'FRIEND'),'time':[14,24],
  'lines':['欸，你下次社課要不要來？','你在的話，阿凱比較不會遲到。'],
  'choices':[ch('「妳是為了阿凱喔？」','對啊，不然咧。（她笑了）'),ch('「好，我去。」','好，那我跟阿凱講。')],'rel':{'fam':2,'comf':2}},
],'greet':{'base':['欸。','好睏。','喔，嗨。','（她把耳機拿下來一邊）怎樣？','（她揮了一下手，眼睛還在手機上）'],
 'when':[{'time':[14,16],'t':'早。我剛起來。'},
         {'location':['wancai'],'weekday':[1,3],'time':[18.5,21],'t':'社課要開始了，你要來嗎？'},
         {'location':['gongguan'],'time':[22,24],'t':'這麼晚還在公館？你也來吃宵夜喔。'},
         {'weekday':[0,6],'t':'週末欸，不要跟我講作業。'}]}}

D['characters'][SIS] = {'friendOnly':True,'steps': [
 {'id':'S-L1','if':st(SIS,'ACQUAINTANCE'),'location':['library','campus'],'time':[9,17],'weekday':[1,2,3,4,5],
  'lines':['學弟。','總圖二樓的飲水機壞了，要裝水去三樓。'],
  'choices':[ch('「謝謝學姊。」','嗯。我剛剛也白跑一趟。'),ch('「學姊是特地來講的嗎？」','沒有，剛好看到你。')],'rel':{'fam':2}},
 {'id':'S-L2','if':st(SIS,'ACQUAINTANCE'),
  'lines':['你們民總現在上到哪？','看得懂嗎？'],
  'choices':[ch('「我還在背定義。」','先背沒關係。背完可以想一下，這條為什麼要這樣定。',rel={'resp':2}),ch('「我還在找問題在哪。」','嗯，那很好。很多人大一都只在背。',rel={'resp':2})],'rel':{'fam':2}},
 {'id':'S-L3','if':{**st(SIS,'ACQUAINTANCE'),'flags':['lawclub'],'events':['ev_studygroup_wed']},'skipIf':{**st(SIS,'FAMILIAR'),'notEvents':['ev_studygroup_wed']},
  'note':'2026-10-16 BB-B：沒去週三讀書會（沒加法服）的玩家原本會永遠卡在 S-L3 → 到 FAMILIAR 還沒去過就 skipIf 直接算過',
  'lines':['你第一次來讀書會，坐門邊對不對？','新人都坐門邊，比較好走。我大一也是。'],
  'choices':[ch('「學姊也想過要走？」','每個禮拜三都想啊。結果沒走成，現在變社長。'),ch('「門邊比較涼。」','那下次往前坐一排，前面也有冷氣。')],'rel':{'fam':3,'comf':2}},
 {'id':'S-L4','if':st(SIS,'FAMILIAR'),
  'lines':['（她喝了一口保溫瓶，皺了一下眉）太濃了。','我今天放了三包。你不要學。'],
  'choices':[ch('「三包？」','今天事情比較多。'),ch('「學姊睡得夠嗎？」','……還好啦。謝謝。',mem='SIS_ASKED_SLEEP')],'rel':{'fam':2}},
 {'id':'S-L5','if':st(SIS,'FAMILIAR'),
  'lines':['我爸媽都是公務員。從小就一直跟我說，考上司法官很好。','我也覺得很好啊。一直都這樣覺得。'],
  'choices':[ch('「那學姊想當司法官嗎？」','……想啊。（她低頭翻書）'),ch('「妳說『一直都』。」','……你很會抓字欸。')],'rel':{'fam':2,'trust':3},'mem':'SIS_PARENTS_HEARD'},
 {'id':'S-L6','if':{**st(SIS,'FAMILIAR'),'flags':['lawclub']},'location':['wancai'],'weekday':[3],'time':[20.5,23],'skipIf':{'notFlags':['lawclub']},
  'lines':['今天讀書會那題，你答錯了喔。','不過你先講你哪裡不確定，這樣很好。'],
  'choices':[ch('「那對的答案是什麼？」','你回去查查看，明天跟我講。我也想再確認一次。',rel={'resp':3}),ch('「我很怕講錯。」','讀書會本來就是講錯的地方啊。講錯了沒人發現才麻煩。',rel={'resp':3})],'rel':{'fam':2},
  'note':'週三晚上法服讀書會之後（萬才館）（2026-10-16 上下文修正：「今天那題」改成「今天讀書會那題」，條件只保證週三晚上在萬才館，不保證玩家知道「那題」是哪一題）'},
 {'id':'S-L7','if':st(SIS,'FAMILIAR'),'unlessWeekdayTime':{'weekday':[5],'time':[17,21]},
  'lines':['學弟，你覺得憲法無聊嗎？','很多人都說無聊。我覺得是還沒遇過跟政府卡住的事吧。'],
  'choices':[ch('「我還沒遇過。」','那很好啊。真的遇到了，再來法服找我。'),ch('「我覺得不無聊。」','真的？那你是我今年聽到的第三個。',mem='SIS_PUBLIC_LAW_FAN')],'rel':{'fam':2}},
 {'id':'S-L8','if':st(SIS,'FRIEND'),
  'lines':['三件事。','一，你最近有睡飽，看得出來。二，考試前不要換位子。三……','（她想了一下）三，算了，沒事。'],
  'choices':[ch('「第三件是什麼？」','就說沒事了啦。（她低頭收東西）'),ch('「學姊也要睡飽。」','……知道了。')],'rel':{'fam':2,'comf':3}},
],'greet':{'base':['學弟。','吃飯了沒？沒吃就去吃。','（她朝你點了一下頭，手上還拿著書）','有在讀書嗎？','學弟，有事再傳訊息給我。'],
 'when':[{'location':['library'],'t':'（小聲）學弟。三樓有位子。'},
         {'weekday':[3],'time':[17,19.5],'t':'今天禮拜三，七點萬才館有讀書會。'},
         {'weekday':[6],'time':[8,12.5],'weekParity':'odd','t':'我今天法服值班，在萬才館。','note':'單週週六上午（法服方案 A）；雙週不說'},
         {'time':[22,24],'t':'這麼晚了，快回去睡。','note':'（2026-10-16 BB-B，AB-62：原本『這麼晚了。一件事：回去睡。』，條列每學期最多 2 次）'}]},
 'note':'（2026-10-16 BB-B，AB-62：條列每學期最多 2 次，留給 S-L1、S-L8 的台詞；S-L5 選項①原本『三件事。一，想。二，大概。三，下一題。』、S-L8 選項②原本『……一，知道了。』、短招呼原本『一件事：吃飯了沒。』和深夜那句，改成一般的話）'}

D['characters'][PS] = {'steps': [
 {'id':'P-L1','if':st(PS,'ACQUAINTANCE'),
  'lines':['我可以問一個奇怪的問題嗎？','你覺得法律系的人，看起來有一種樣子嗎？'],
  'choices':[ch('「有，看起來都很累。」','……那我也是嗎？算了，不要回答。'),ch('「沒有，大家都不一樣。」','真的喔？我還以為只有我看起來不像。')],'rel':{'fam':2}},
 {'id':'P-L2','if':st(PS,'ACQUAINTANCE'),
  'lines':['我家在桃園開早餐店。','所以我早上六點就會自己醒來，從小幫忙習慣了。'],
  'choices':[ch('「好羨慕。」','不要羨慕啦，放假要四點半起來幫忙。'),ch('「那妳早八都不會遲到。」','不會遲到啊，可是會睡著。')],'rel':{'fam':2},'mem':'PS_FAMILY_SHOP'},
 {'id':'P-L3','if':{**st(PS,'ACQUAINTANCE'),'events':['ev_studygroup_wed'],'memory':[{'npc':PS,'tag':'FIRST_MET'}]},'skipIf':{**st(PS,'FAMILIAR'),'notEvents':['ev_studygroup_wed']},
  'note':'2026-10-16 BB-B：沒去週三讀書會的玩家原本會永遠卡在 P-L3 → 到 FAMILIAR 還沒去過就 skipIf 直接算過',
  'lines':['學姊讀書會講那段好快，我筆記只抄到一半。','你那邊有嗎？'],
  'choices':[ch('「我也抄到一半。」','那我們拼一下？說不定拼起來就完整了。',mem='PS_NOTES_SHARED'),ch('「我沒抄，我在聽。」','好厲害。我不抄會很不安。')],'rel':{'fam':3}},
 {'id':'P-L4','if':st(PS,'FAMILIAR'),
  'lines':['我今天跑去旁聽哲學系的課。','老師問說，如果一條規則大家都遵守，結果反而很糟，那還要遵守嗎？我想了一整節課。'],
  'choices':[ch('「法律也會問這個。」','真的喔？那我們的課怎麼都還沒講到。'),ch('「妳的答案是什麼？」','還沒想到。我下禮拜還要去聽。')],'rel':{'fam':2,'trust':2}},
 {'id':'P-L5','if':st(PS,'FAMILIAR'),
  'lines':['問你一件事喔。','你覺得考試考得好的人，就是懂的人嗎？'],
  'choices':[ch('「不一定。」','我也覺得。可是我還是很想考好欸。'),ch('「至少比較懂考試。」','哈哈，好誠實喔。')],'rel':{'fam':2,'comf':2},
  'note':'（2026-10-16 BB-B，AB-62：原本『我可以再問一個奇怪的問題嗎？』，那句每學期最多 1 次，留給 P-L1）'},
 {'id':'P-L6','if':st(PS,'FAMILIAR'),
  'lines':['我每次從桃園搭客運上來，過了林口就開始塞。','我都趁塞車背法條，塞越久背越多。'],
  'choices':[ch('「那塞車也不錯。」','對啊，不塞我反而背不完。'),ch('「我坐車都在睡覺。」','我也想睡，可是一睡就坐過站。')],'rel':{'fam':2}},
 {'id':'P-L7','if':st(PS,'FAMILIAR'),
  'lines':['我發現我上課抄最多的地方，都是老師講故事的時候。','條文的地方，我反而抄很少。……這樣是不是不對？'],
  'choices':[ch('「故事比較好記。」','嗯。可是考試不考故事。（她笑了一下）'),ch('「條文課本都有，故事沒有。」','……對欸。那我好像也沒有抄錯。',mem='PS_REASSURED')],'rel':{'fam':2,'trust':2}},
 {'id':'P-L8','if':st(PS,'FRIEND'),
  'lines':['欸，你都不會覺得我問題很多喔？','我室友上次直接說我想太多。'],
  'choices':[ch('「不會啊，我覺得很好玩。」','真的？那我就繼續問了喔。'),ch('「我也常想太多。」','那剛好。以後想太多的時候就找你。')],'rel':{'fam':2,'comf':3}},
],'greet':{'base':['嗨！','欸，你也在這邊！','嗨，我剛好要走了，下次聊！','（她朝你笑了一下）','（她揮了揮手上的筆記）'],
 'when':[{'time':[6,9],'t':'早！你吃早餐了嗎？'},
         {'location':['wancai'],'weekday':[3],'time':[18,19.5],'t':'讀書會快開始了，你要一起進去嗎？'},
         {'location':['library'],'t':'（小聲）嗨。你也來讀書喔？'},
         {'weekday':[5],'time':[17,24],'t':'我要去搭客運回桃園了，下禮拜見！'}]}}

D['characters'][KX] = {'context':'date','steps': [
 {'id':'K-L1','if':{'flags':['dating_kexin']},
  'lines':['政大的山，我還在跟它不熟。','每天上去的時候都覺得它在考我。下來的時候它說：及格。'],
  'choices':[ch('「我們這邊只有平地。」','那你們很好命。……可是你們沒有風景。'),ch('「下次我陪妳爬一次。」','好。不准中途停下來拍照。……好啦，可以拍一張。')]},
 {'id':'K-L2','if':{'flags':['dating_kexin']},'dateOnly':'meet',
  'lines':['（她摸了一下耳朵上的小長頸鹿）我的耳環只戴一邊，而且每天不一樣。','另一邊空著，是留給還沒想到的那一個耳環。……不要問長什麼樣子，我也還沒想到。'],
  'choices':[ch('「下次我幫妳挑一個。」','好。可是要很奇怪的。不奇怪我不戴。'),ch('「今天這隻很好看。」','我知道。我只是想聽你說。')],'mem':'KX_EARRING_STORY'},
 {'id':'K-L3','if':{'flags':['dating_kexin']},
  'lines':['政大法律系的同學，第一週就分好讀書會了。','我和予樂一組。她負責講話，我負責讓她不要講太久。','還有一個叫邵鈞的，他什麼都要查出處。……我覺得我們會變成好朋友。']},
 {'id':'K-L4','if':{'flags':['dating_kexin']},'week':[4,18],
  'lines':['我們民總老師今天問：人什麼時候開始算是人？','全班吵了一節。我站「出生」。你們呢？'],
  'choices':[ch('（說你們老師怎麼講）','……好，那我們兩個學校意見一致。好無聊。（她笑）'),ch('「我們還沒教到。」','那你先想。下次見面你要給我答案，不准查課本。')]},
 {'id':'K-L5','if':{'flags':['dating_kexin']},'dateOnly':'meet',
  'lines':['你知道我最喜歡我們見面的哪個時候嗎？','不是見到的時候。是要分開、還沒分開的那五分鐘。','因為那五分鐘我們都在想，下次要說什麼。'],
  'choices':[ch('「那下次多留五分鐘。」','不行。多留就會變成十分鐘，十分鐘就會錯過公車。……我算過了。'),ch('（不說話，陪她等公車）','（她靠在你肩上一下）好。這次的五分鐘很好。')],'rel':{'comf':3},'mem':'KX_FIVE_MINUTES'},
 {'id':'K-L6','if':{'flags':['dating_kexin']},'week':[7,18],'dateOnly':'video',
  'lines':['（她把手機立在書堆旁邊，只看得到她的額頭）不要講話。我們各自念。','（二十分鐘後）……你翻頁的聲音好大。','我不是在抱怨。是我聽得到，所以知道你還在。'],'note':'視訊一起讀書；精力照一般讀書'},
 {'id':'K-L7','if':{'flags':['dating_kexin']},'dateOnly':'meet',
  'lines':['予樂問我，你是什麼樣的人。','我說：他會在我講完話以後，等兩秒才回答。她說這樣很好。我說我知道。'],
  'choices':[ch('「我在想要怎麼回答。」','對。所以我說很好。'),ch('「那妳怎麼介紹妳自己？」','我說：我會假設很多事。她說她早就知道了。')],'rel':{'trust':2}},
 {'id':'K-L8','if':{'flags':['dating_kexin']},'week':[14,18],
  'lines':['這學期快結束了。','我本來以為不同學校會很難。……結果只是很遠，不是很難。','假設——算了，今天不假設。今天就是今天。'],'mem':'KX_TERM1_DONE'},
],'greet':None,'note':'交往中不在路上遇到；短招呼用手機池（BB_107 第 7 節）。分開（dating_kexin 沒了）就停，不倒退、不刪記憶'}

# 室友阿凱：宿舍事件（K-D1～6，條件與結果）
D['kaiDorm'] = [
 {'id':'K-D1','title':'一起打電動','location':'dorm','time':[21,24],'weekday':[0,1,2,3,4],'perWeek':1,
  'lines':['所以 一場就好 你上路 我中路'],
  'choices':[{'t':'「一場就好。」','advance':1,'rel':{'kai':{'fam':3}},'random':['所以我們是天才','是隊友的問題 不是我們的','宿舍網路 我要告它 你們有教這個嗎'],'count':'KAI_GAMES'},
             {'t':'「我要念書。」','reply':'好 那我小聲','narr':'（他沒有小聲。）'}]},
 {'id':'K-D2','title':'一場變三場','if':{'flagNum':{'KAI_GAMES':{'min':2}}},'once':True,'location':'dorm','time':[23,24],
  'narr':'一場變三場，抬頭已經兩點。','lines':['所以 你明天第一堂幾點'],
  'choices':[{'t':'「九點十分。」','reply':'所以是早八 在宿舍 九點以前都叫早八 還可以睡六個小時 很多了','sleepAt':2},{'t':'「我去睡了。」','reply':'好 我再一場'}]},
 {'id':'K-D3','title':'鍵盤聲','location':'dorm','time':[7,8.5],'needs':'玩家今天第一堂在 9:10 以前（大一必修最早 9:10；宿舍說法叫「早八」，K-D2），且昨晚沒參加 K-D1（隨機 30%）',
  'narr':'阿凱的螢幕還亮著，他戴著耳機在打字，鍵盤聲很大。',
  'choices':[{'t':'「可以小聲一點嗎？」','reply':'所以 我吵到你了 對不起 我換靜音的那把','mem':'KAI_QUIET_KEYBOARD'},
             {'t':'（什麼都不說，出門）','inc':'KAI_FRICTION'},
             {'t':'「你到底要不要睡？」','goto':'K-D4'}]},
 {'id':'K-D4','title':'吵架','when':'K-D3 選第三個，或 KAI_FRICTION 到 3',
  'lines':[{'who':'kai','t':'所以 你現在是在念我嗎'},{'who':'player','t':'我只是想睡覺。'},{'who':'kai','t':'我也想啊 可是程式寫不完'}],
  'narr':'兩個人都不說話。他把燈關了，自己用手機的光繼續打字。','set':'KAI_FIGHT','effect':'之後兩天阿凱只說「嗯」，SMALLTALK 暫停；不影響其他人'},
 {'id':'K-D5','title':'和解的飲料','if':{'flags':['KAI_FIGHT']},'location':'dorm','daysAfter':[1,3],
  'narr':'桌上有一杯飲料，杯子上貼著一張便利貼：「所以 這是和解的飲料 不是賄賂」',
  'choices':[{'t':'（喝掉，說）「我也太兇了。」','reply':'所以 我們訂一個規則 一點以後我戴耳機打字 你早八前一天我不開喇叭','mem':'KAI_ROOM_RULES','rel':{'kai':{'fam':4,'trust':3}},'clear':'KAI_FIGHT'},
             {'t':'（去買宵夜回來）','reply':'所以 你也在和解 那我們兩個都和解了。所以 我們訂一個規則……','mem':'KAI_ROOM_RULES','rel':{'kai':{'fam':4,'trust':3}},'clear':'KAI_FIGHT'}],
  'fallback':'沒去宿舍的話，第 4 天阿凱自己先說「所以 上次的事 是我不對」，照樣和好（KAI_ROOM_RULES、清 KAI_FIGHT）'},
 {'id':'K-D6','title':'室友模式','if':{'memory':[{'npc':'kai','tag':'KAI_ROOM_RULES'}]},'once':True,'location':'dorm','weekday':[0],'time':[20,24],
  'lines':['所以 我寫了一個小程式 會在一點的時候叫我戴耳機','它叫「室友模式」'],
  'choices':[{'t':'「謝謝。」','reply':'不客氣 它目前只會說「所以」','rel':{'kai':{'fam':2}}}]},
]

D['bikeSeat'] = {'_comment':'腳踏車載妹墊（AA_137 第 5 節；D78）：腳踏車一開始就有後座墊；FAMILIAR 以上、約好同行才坐。學姊有伴侶時一樣會坐（使用者 D78：「學姊也要給我載」）：只在本來就一起去同一個地方（同行、家族活動）時，不是兩人私下約會（BB_122「分手前不私下約」照舊）。（2026-10-16 BB-B 更正：原本寫「學姊有伴侶時不坐、走在旁邊」，和 D78 相反）可昕、以安、語彤、阿凱、阿哲的台詞在 AA_137／ladder_aa.json。',
 ZR:{'min':'FAMILIAR','on':'……我第一次坐別人的後座。不要笑。','off':'謝謝。……你騎得比我想的穩。','decline':'我走路就好。我喜歡看路邊的店。'},
 ZQ:{'min':'FAMILIAR','on':'你的腳踏車本來就有後座墊？……好，出發。','off':'再騎一圈。……騙你的。到了。','decline':'我會暈車。腳踏車也會。……好啦是我還不熟你。','note':'（2026-10-16 BB-B，AB-62：on 原本『欸不是，你的腳踏車本來就有後座墊？……好，出發。這不是問句。』；坐後座每次都說、每學期都會出現，兩個口頭禪都拿掉；大三下重訪日 3〔BB_98 Q11〕她第一次把「這不是問句」改成問句，大三下的階梯也擋這句）'},
 PS:{'min':'FAMILIAR','on':'腳踏車後座要抓哪裡？……機車的我知道。','off':'好好玩。我小時候都坐我爸的機車後座送蛋餅。','decline':'我走路！我走得很快，你看。','note':'（2026-10-16 BB-B，AB-62：on 原本『我可以問一個奇怪的問題嗎？……坐後座要抓哪裡？』；那句每學期最多 1 次，大一上 P-L1 已經用了，大一下起的階梯都擋這句〔只留給 P0、P5〕，坐後座每學期都會說。「機車的我知道」接 off 句的爸爸機車後座）'},
 SIS:{'min':'FAMILIAR','on':'我側坐，抓後面的架子。你騎慢一點，不要回頭。','off':'到了。……謝謝你有騎慢。','decline':'我走路就好。你先騎，我跟得上。','note':'D78（使用者 2026-10-16 01:12，經 LAWWW-B）：學姊也坐後座（側坐），有伴侶時一樣；朋友之間的分寸：抓後面的架子、不抓人（2026-10-16 BB-B，AB-62：on 原本『兩件事。一，我側坐，抓後面的架子。二，騎慢一點。……三，不要回頭。』、off 原本『到了。一，你騎得很穩。二，謝謝。三，……沒有三。』；坐後座每次都說，等於每次都一二三，改成一般的話；off 不用「騎得很穩」，避免和芷若的 off 撞句）'},
}

def check(d):
    err=[]
    for cid,c in d['characters'].items():
        ids=[s['id'] for s in c['steps']]
        if len(ids)!=len(set(ids)): err.append(cid+' 層 id 重複')
        for s in c['steps']:
            for l in s['lines']+[x for li in s.get('linesIf',[]) for x in li['lines']]+[x for li in s.get('extraIf',[]) for x in li['lines']]:
                if len(l)>60: err.append(f"{s['id']} 台詞太長：{l}")
            if 'notMemory' in json.dumps(s.get('if',{})): err.append(s['id']+' if 用 notMemory 會讓階梯卡住，改 skipIf（README）')
            for x in s.get('choices',[]):
                if len(x)==0: err.append(s['id']+' 空選項')
            if len(s.get('choices',[]))>2: err.append(s['id']+' 選項超過 2')
        g=c.get('greet')
        if g and len(g['base'])!=5: err.append(cid+' 短招呼不是 5 句')
    return err
e=check(D)
if e: sys.exit('\n'.join(e))
if '--check' not in sys.argv:
    json.dump(D,open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'ladder_bb.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('ok', {k:len(v['steps']) for k,v in D['characters'].items()}, 'kaiDorm', len(D['kaiDorm']))
