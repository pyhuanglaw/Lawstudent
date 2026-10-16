# -*- coding: utf-8 -*-
"""大三上（Y3S1）的閒聊階梯：子晴（heroine_04）、溫學姊（heroine_05）、沛珊（classmate_peishan）、可昕（kexin）→ ladder_bb_y3s1.json。
**芷若這學期在英國**（Z10 明信片代替，BB_98 3-1），沒有面對面的階梯。
作者：BB-B 2026-10-16（D81 越早遇到的越先做）。原稿說明：../BB_140_閒聊階梯_大三上_子晴學姊沛珊可昕.md。
格式和 ladder_bb_y2s2.json 一樣（欄位：README.md），只差 term＝'Y3S1'。大三上所有路線的玩家都在台灣；第 11 週交換志願表之後，
走日本、美國路線的玩家用 extraIf 的 flagIs:{EXCHANGE_ROUTE:'JP'|'US'} 多一句（同 AA_149）。
依據 BB_98（大三上事件）：子晴 Q8b 爸爸卡關第 5 週（手機）、Q10 畢業專題第 8 週；學姊 法學院圖書館的鄰座（BB_100 3-3）、感冒週第 9 週、C3 分開檢查點第 9 週、
志願表第 11 週、W15c 送機 1/5（第 18 週）；沛珊 B8 第 5 週、P5b 書店的櫃台第 6 週；可昕 K15 第 3 週、K11 第 4 週、主線 4 的電話第 7 週、K16 第 9 週、
交換的決定第 11 週、K17 第 14 週、聖誕第 16 週、跨年第 17 週。
**防卡關**：`if` 只放階段（可昕只看 dating_kexin）；事件、記憶、旗標的差別放 linesIf／extraIf；有週次的層放寬到第 18 週。
**不重複事件的台詞**（build 擋）：子晴「第三關怎麼過」「他卡了三天」；沛珊「我女兒在念師範」「我每天都很想去上課」「同學都比我小一歲」；
可昕「還有九分鐘」「他自己的事，誰幫」。
學姊、沛珊：戀愛的事全部在事件裡（BB_122、BB_100 2-5），階梯只有朋友的話（friendOnly）。
用法：python3 build_ladder_bb_y3s1.py → ladder_bb_y3s1.json；--check 只檢查。"""
import json, sys, os
Y='Y3S1'
def st(npc, mn): return {'stage': {'npc': npc, 'min': mn}}
def mem(npc, tag): return {'memory': [{'npc': npc, 'tag': tag}]}
def ev(*ids): return {'events': list(ids)}
def route(r): return {'flagIs': {'EXCHANGE_ROUTE': r}}
def ch(t, reply, rel=None, mem=None):
    c = {'t': t, 'reply': reply}
    if rel: c['rel'] = rel
    if mem: c['mem'] = mem
    return c

ZQ='heroine_04'; SIS='heroine_05'; PS='classmate_peishan'; KX='kexin'
D = {'_comment': __doc__, 'term': Y, 'characters': {}}
FRI_DINNER = {'weekday': [5], 'time': [17, 21]}

# ───────── 高子晴（資工四上；最後一年；畢業專題；吉他社器材長交出去了）─────────
D['characters'][ZQ] = {'steps': [
 {'id':'Q5-L1','if':st(ZQ,'ACQUAINTANCE'),'time':[14,24],
  'lines':['暑假我把那個遊戲做到一半了。……一半又多一點。','多的那一點，是一個存檔點。我做了三個禮拜。'],
  'choices':[ch('「存檔點很重要。」','對。人生沒有存檔點，所以遊戲要有。……這句很好，我要寫進去。'),
             ch('「為什麼做那麼久？」','因為要決定存什麼。……不是每件事都要存。',rel={'trust':1})],'rel':{'fam':2},'mem':'ZQ5_SAVE_POINT',
  'note':'接大二下 Q4-L8（暑假把遊戲做到一半）；Q15「存檔點」的遠伏筆，不說破'},
 {'id':'Q5-L2','if':st(ZQ,'ACQUAINTANCE'),'time':[14,24],
  'lines':['吉他社的器材長，我交出去了。導線的借還表也交出去了。','新的器材長說他會用。……我不信，可是我很感動。'],
  'choices':[ch('「妳會想念導線嗎？」','欸不是，……有一點。它們晚上不會再動了。'),
             ch('「妳做得很好。」','我知道。……這句我很少說。')],'rel':{'fam':2},'mem':'ZQ5_HANDOVER',
  'note':'接大二下 Q4-L2（器材長、導線）'},
 {'id':'Q5-L3','if':st(ZQ,'FAMILIAR'),'time':[14,24],'week':[6,18],
  'lines':['我爸最近開始玩遊戲了。我不知道他從哪裡學的。','……他打得很爛。跟以前一樣。'],
  'linesIf':[{'if':ev('ev_ziqing_dad_stuck'),'lines':['我爸又傳訊息來了。這次只卡了一天。','……他在進步。我不知道該高興還是擔心。']}],
  'choices':[ch('「妳教他。」','不教。他要自己過。……這是我們家的規則，剛剛訂的。'),
             ch('「他在玩什麼？」','……不告訴你。',rel={'trust':1})],'rel':{'fam':2,'trust':1},'mem':'ZQ5_DAD_LEVELS',
  'note':'Q8b（第 5 週）之後推進的玩家用 linesIf；他玩的是她做的遊戲，到 Q12 才說'},
 {'id':'Q5-L4','if':st(ZQ,'FAMILIAR'),'time':[14,24],'week':[9,18],
  'lines':['畢業專題開始做了。每天都在系館。','……系館的燈，比我的作息規律。'],
  'linesIf':[{'if':ev('ev_ziqing_capstone'),'lines':['畢業專題我交了那一個。你知道是哪一個。','……教授說太私人了。我說，遊戲本來就是私人的。']}],
  'choices':[ch('「要注意身體。」','欸不是，你說話像我爸。……他最近也這樣說。'),
             ch('「做得怎麼樣？」','做到一半。我好像永遠都在一半。')],'rel':{'fam':2,'comf':1},'mem':'ZQ5_CAPSTONE',
  'note':'Q10（第 8 週，Café）之後推進的玩家用 linesIf；不重複 Q10 的問題'},
 {'id':'Q5-L5','if':st(ZQ,'FAMILIAR'),'time':[14,24],'week':[6,18],
  'lines':['芷若從英國寄了明信片給我。上面只有天氣。','……她說倫敦每天下雨。我回：台北也是。我們在比誰比較濕。'],
  'choices':[ch('「她過得好嗎？」','好。她說她學會一個人吃晚餐。……她以前就會，只是現在承認了。'),
             ch('「妳想她嗎？」','……欸不是，這種問題要先問我心情好不好。……想。',rel={'comf':1})],'rel':{'fam':2},'mem':'ZQ5_ZHIRUO_POSTCARD',
  'note':'芷若在英國（Z10 明信片，第 3 週起每月）；「寄明信片的人只會寫天氣」是大二上 Z3-L5 的回聲'},
 {'id':'Q5-L6','if':st(ZQ,'FAMILIAR'),'time':[14,24],'week':[12,18],
  'lines':['我的發表會在五月。下學期。','……你記在行事曆上。用紅色。'],
  'extraIf':[{'if':route('JP'),'lines':['你要去日本？……欸不是，那你要看直播。不准中途離開。']},
             {'if':route('US'),'lines':['美國？我發表會在晚上，你那邊是早上。……好，你要早起。']}],
  'choices':[ch('「我一定會去。」','……好。你說的。我截圖了。'),
             ch('「要準備什麼嗎？」','準備鼓掌。……騙你的。準備安靜看完就好。')],'rel':{'fam':2,'trust':1},'mem':'ZQ5_SHOW_DATE',
  'note':'第 11 週志願表之後；Q12（大三下第 14 週）的前情；路線用 extraIf 多一句'},
 {'id':'Q5-L7','if':st(ZQ,'FAMILIAR'),'time':[14,24],'week':[14,18],
  'lines':['我開始投工作室的履歷。投了三間。','……其中一間回信了。他們說想看我的發表會。'],
  'choices':[ch('「那很好！」','欸不是，你比我還高興。……好啦，我也很高興。'),
             ch('「妳想去哪一間？」','很小的那間。小到我會是第五個人。',rel={'trust':1})],'rel':{'fam':2,'comf':1},'mem':'ZQ5_STUDIO',
  'note':'Q11「我明年在一間很小的工作室」的前情'},
 {'id':'Q5-L8','if':st(ZQ,'FRIEND'),'time':[14,24],'week':[16,18],
  'lines':['這是我在台大的最後一個寒假。','……我要回家。我爸說要跟我打一場。我會讓他。不會讓太多。'],
  'choices':[ch('「讓他贏一次。」','……好。一次。他會記一輩子。'),
             ch('「全力打。」','好。他輸了會說「再一場」。……我等這句等了十幾年。',rel={'trust':1})],'rel':{'fam':2,'trust':1},'mem':'ZQ5_WINTER_MATCH'},
],'greet':{'base':['欸。大四了。……還是下午起床。','（她把耳機拿下來一邊）……專題在跑，我在等。','系館的燈今天也亮著。我也是。','我交出去的導線，今天又打結了。不是我的錯。','欸不是，你今天看起來很有精神。……不習慣。'],
 'when':[{'location':['wancai'],'weekday':[1,3],'time':[19,21],'t':'我只是回來看看。……新的器材長很努力。'},
         {'week':[8,9],'t':'……期中。我睡系館。最後一次了。'},
         {'weather':'rain','t':'下雨。系館的屋頂會漏。我放了一個桶子。'},
         {'time':[14,16],'t':'早安。……大四也是下午起床。'},
         {'week':[16,18],'t':'期末。大學最後一個……不對，還有一個。'}]},
 'note':'資工四上；下午以後才遇得到（time 14～24）；第 8 週 Q10 在 Café'}

# ───────── 溫書瑀（學姊，碩一；法學院圖書館；申請美國交換，1/5 出發；只有朋友的話）─────────
D['characters'][SIS] = {'friendOnly': True, 'steps': [
 {'id':'S5-L1','if':st(SIS,'ACQUAINTANCE'),'unlessWeekdayTime':FRI_DINNER,
  'lines':['碩一的第一週，我去領了研究室的鑰匙。','……鑰匙很小。我握了很久。'],
  'choices':[ch('「研究室在哪裡？」','走廊最後一間。窗戶對著一棵樹。'),
             ch('「恭喜學姊。」','……謝謝。重點是，我第一次有一把不是社團的鑰匙。',rel={'trust':1})],'rel':{'fam':2},'mem':'SIS5_KEY',
  'note':'接大二下 S4-L8（研究室走廊最後一間）'},
 {'id':'S5-L2','if':st(SIS,'ACQUAINTANCE'),'unlessWeekdayTime':FRI_DINNER,
  'lines':['研究所的課，第一堂就要報告。','我準備了三十頁。教授說：講五分鐘就好。'],
  'choices':[ch('「五分鐘講得完嗎？」','講不完。我講了四分鐘，剩下一分鐘在發呆。……很好的一分鐘。'),
             ch('「學姊準備太多了。」','對。我在練習準備得剛好。……這比準備很多難。',rel={'trust':1})],'rel':{'fam':2},'mem':'SIS5_FIVE_MIN'},
 {'id':'S5-L3','if':st(SIS,'FAMILIAR'),'unlessWeekdayTime':FRI_DINNER,'week':[3,18],
  'lines':['法學院圖書館的那個位子，最近有人跟我搶。','……是我自己的書。我放了太多本。'],
  'choices':[ch('「我幫學姊搬。」','不用。……好，搬一半。'),
             ch('「書比人多。」','重點是，書不會吵架。……你會。',rel={'comf':1})],'rel':{'fam':2,'comf':1},'mem':'SIS5_LIBRARY_SEAT',
  'note':'法學院圖書館的鄰座（BB_100 3-3，兩個人吵一個制度題）的日常面'},
 {'id':'S5-L4','if':st(SIS,'FAMILIAR'),'unlessWeekdayTime':FRI_DINNER,'week':[5,18],
  'lines':['我在寫交換的申請。去美國一學期。','寫到「為什麼想去」那一欄，我寫了一個問號，又擦掉。'],
  'choices':[ch('「為什麼想去？」','……想看看不認識我的地方。在那裡，我不是誰的學姊。',rel={'trust':2}),
             ch('「學姊會申請上的。」','重點是，這次申請不上也沒關係。……我第一次這樣想。')],'rel':{'fam':2,'trust':1},'mem':'SIS5_EXCHANGE_APP',
  'note':'C3（第 9 週）時她「碩一，申請交換」；分開的事不在階梯'},
 {'id':'S5-L5','if':st(SIS,'FAMILIAR'),'unlessWeekdayTime':FRI_DINNER,'week':[10,18],
  'lines':['法服的學弟妹問我，碩士生是不是很閒。','我說：比法四閒。……然後我列了三件事給他們看。'],
  'choices':[ch('「哪三件？」','一，讀書。二，寫報告。三，……還在想。這是新的。'),
             ch('「學姊不閒吧。」','不閒。可是我會說閒。這是新的練習。')],'rel':{'fam':2,'comf':1},'mem':'SIS5_NOT_BUSY',
  'note':'感冒週（第 9 週）之後；感冒週她的部分在 AA_12 主線 6，不重複'},
 {'id':'S5-L6','if':st(SIS,'FAMILIAR'),'unlessWeekdayTime':FRI_DINNER,'week':[12,18],
  'lines':['交換的結果出來了。我下學期在美國。一月五號出發。','……我在計畫本上畫了一架飛機。畫得很醜。'],
  'extraIf':[{'if':route('JP'),'lines':['你去日本，我去美國。……家族群組要排三個時區了。']},
             {'if':route('US'),'lines':['你也去美國。……重點是，到了以後先睡覺。時差很可怕。']}],
  'choices':[ch('「學姊要照顧自己。」','……嗯。你也是。這句我收下了。',rel={'trust':1}),
             ch('「飛機畫得多醜？」','像一條魚。……我決定它是魚。')],'rel':{'fam':2,'comf':1},'mem':'SIS5_PLANE_FISH',
  'note':'第 11 週志願表之後；路線用 extraIf 多一句；美國路線抵達以後的事在 US1～US4，這裡不說'},
 {'id':'S5-L7','if':st(SIS,'FAMILIAR'),'unlessWeekdayTime':FRI_DINNER,'week':[14,18],
  'lines':['我在整理研究室的書。要帶去美國的，只能一箱。','……三十本選一本。我選了大一的那本民總。'],
  'choices':[ch('「為什麼選那本？」','上面有我大一畫的問號。……那時候我不知道，問號可以留著。',rel={'trust':1}),
             ch('「一箱夠嗎？」','不夠。可是剛好。')],'rel':{'fam':2,'trust':1},'mem':'SIS5_ONE_BOOK'},
 {'id':'S5-L8','if':st(SIS,'FRIEND'),'unlessWeekdayTime':FRI_DINNER,'week':[16,18],
  'lines':['出發前，我想去總圖坐一下。三樓靠窗。','……重點是，那是我大一坐的位子。我想跟它說一聲。'],
  'choices':[ch('「要我幫妳占位子嗎？」','……不用。那個位子，一直都沒有人坐。'),
             ch('「它會等妳回來。」','位子不會等人。……可是我會回來坐。',rel={'comf':1})],'rel':{'fam':2,'comf':1},'mem':'SIS5_OLD_SEAT',
  'note':'W15c 送機（1/5）的前情；送機本身在事件'},
],'greet':{'base':['學弟。','（她拿著保溫瓶，從法學院圖書館出來）','碩一。……一件事都還沒列完。','兩件事。一，吃飯。二，你自己決定。','研究室窗外那棵樹，今天掉葉子了。'],
 'when':[{'location':['library','library_hall'],'week':[8,9],'t':'……期中。一句可以。'},
         {'weather':'rain','t':'下雨。兩件事。一，帶傘。二，不要跑。'},
         {'week':[12,15],'t':'交換的文件，我又多印了一份。……習慣。'},
         {'week':[16,18],'t':'期末。我在打包。一箱。'},
         {'time':[20,23],'t':'這麼晚。……研究室的燈，我也還沒關。'}]},
 'note':'碩一；只有朋友的話（friendOnly）：可能在 C3（第 9 週）分開（BB_122），戀愛的事都在事件；週五傍晚不推進；1/5 出發'}

# ───────── 郭沛珊（教育相關科系大一；週末在舊路書房打工；課輔班照舊；只有朋友的話）─────────
D['characters'][PS] = {'friendOnly': True, 'steps': [
 {'id':'P5-L1','if':st(PS,'ACQUAINTANCE'),'week':[6,18],
  'lines':['新的系，第一個月就要去國小見習。','我坐在教室最後一排。……小朋友一直回頭看我。'],
  'choices':[ch('「他們好奇吧。」','嗯。我也好奇他們。我們互相看了一節課。'),
             ch('「像不像妳想的？」','不像。比我想的吵。……我很喜歡。',rel={'trust':1})],'rel':{'fam':2},'mem':'PS5_OBSERVE',
  'note':'P5b（第 6 週書店的櫃台）以後才推進'},
 {'id':'P5-L2','if':st(PS,'ACQUAINTANCE'),'week':[6,18],
  'lines':['書店的老闆說，我包書套包得最快。','……因為早餐店的蛋餅也是這樣包的。'],
  'choices':[ch('「技能轉移。」','對。我爸聽到會很得意。'),
             ch('「教我。」','不行。這是家傳的。……好，教你一半。',rel={'comf':1})],'rel':{'fam':2,'comf':1},'mem':'PS5_BOOK_COVER'},
 {'id':'P5-L3','if':st(PS,'FAMILIAR'),'week':[6,18],
  'lines':['我最近在練習寫黑板。字要大，要直，要讓最後一排看得到。','……我的字以前很小。你知道的。'],
  'choices':[ch('「現在呢？」','現在大到老闆說，書店的價錢牌不用再請別人寫了。'),
             ch('「寫一個給我看。」','……寫什麼？……好，我寫你的名字。很大。',rel={'comf':1})],'rel':{'fam':2},'mem':'PS5_BLACKBOARD',
  'note':'大二上 P3-L6「你的字要寫大一點」的回聲'},
 {'id':'P5-L4','if':st(PS,'FAMILIAR'),'week':[9,18],
  'lines':['期中考考教育心理學。題目問：學生為什麼會放棄？','……我寫了三頁。寫到一半發現，我在寫我自己。'],
  'choices':[ch('「妳沒有放棄。」','嗯。我換了一條路。……這兩個不一樣，我現在知道了。',rel={'trust':2}),
             ch('「三頁很多。」','教授說很好。可是要我下次寫別人。')],'rel':{'fam':2,'trust':1},'mem':'PS5_WHY_GIVE_UP'},
 {'id':'P5-L5','if':st(PS,'FAMILIAR'),'week':[10,18],
  'lines':['讀書會的人上週來書店找我。一次來了五個。','……老闆以為是校外教學。我說是我的前同學。他們說不是前的。'],
  'choices':[ch('「當然不是前的。」','……嗯。我剛剛就想聽這句。',rel={'trust':1}),
             ch('「他們買書了嗎？」','買了。全部買同一本。……讀書會的習慣。')],'rel':{'fam':2,'comf':1},'mem':'PS5_STUDYGROUP_VISIT',
  'note':'大二下 P5（KEPT_FRIEND）的後來；不寫柏翰'},
 {'id':'P5-L6','if':st(PS,'FAMILIAR'),'week':[12,18],
  'lines':['你們大三要決定交換了吧。','……我大概不會交換了。我想先把一間教室待好。'],
  'extraIf':[{'if':route('JP'),'lines':['日本？……寄一張小學教室的照片給我。']},
             {'if':route('US'),'lines':['美國？那邊的小學長什麼樣子，幫我看一下。']}],
  'choices':[ch('「妳會是很好的老師。」','……你又講得好像你知道。'),
             ch('「一間教室也很大。」','嗯。三十個人，就是三十個世界。……教授說的，我借來用。')],'rel':{'fam':2,'trust':1},'mem':'PS5_ONE_CLASSROOM',
  'note':'第 11 週志願表之後；路線用 extraIf'},
 {'id':'P5-L7','if':st(PS,'FAMILIAR'),'week':[14,18],
  'lines':['課輔班的那個孩子，上週考了一百分。','他跑來跟我說，然後借了一支紅筆，自己在考卷上畫笑臉。'],
  'choices':[ch('「他學妳的。」','……對。紅筆笑臉是我的。現在是他的了。',rel={'comf':1}),
             ch('「妳一定很高興。」','很高興。高興到我在公車上笑出來。')],'rel':{'fam':2,'comf':1},'mem':'PS5_HUNDRED',
  'note':'P5b 她在改作業、用紅筆畫笑臉的回聲'},
 {'id':'P5-L8','if':st(PS,'FRIEND'),'week':[16,18],
  'lines':['寒假我要回桃園幫忙。早上四點半起床的那種。','……這次我想跟我爸說，我以後也要當很早起的人。不是為了煎蛋。'],
  'choices':[ch('「為了什麼？」','為了早自習。……老師要比學生早到。'),
             ch('「他會很高興。」','他會說「嗯」。……我們家的「嗯」很大聲。',rel={'comf':1})],'rel':{'fam':2,'trust':1},'mem':'PS5_EARLY_RISER'},
],'greet':{'base':['嗨！……我剛從見習的國小回來。','（她在書店櫃台後面，揮了一下紅筆）','你吃早餐了嗎？……永遠的職業病。','今天書店很安靜。我在包書套。','今天上班級經營。點名要記得每個人的臉。'],
 'when':[{'location':['bookstore'],'weekday':[0,6],'t':'（她在櫃台包書套，抬頭對你點頭）'},
         {'week':[8,9],'t':'期中。我們系也考試。……我現在知道出題的人在想什麼了。'},
         {'weather':'rain','t':'下雨天，書店的客人會待很久。我喜歡。'},
         {'time':[6,8],'t':'早。……早起的人，今天也很早。'},
         {'week':[16,18],'t':'期末。我在改課輔班的考卷，也在寫自己的。'}]},
 'note':'教育相關科系大一（P5b 媽媽說「在念師範」）；週末在舊路書房（bookstore）打工、課輔班照舊。第 6 週 P5b 以後才推進（她第一次在書店出現）。戀愛事件照 BB_100 2-5，階梯只有朋友的話'}

# ───────── 杜可昕（政大法律三上；法律系開場已交往；只在「我們的日子」見面或視訊時推進）─────────
DK = {'flags': ['dating_kexin']}
D['characters'][KX] = {'context':'date','steps': [
 {'id':'K5-L1','if':DK,
  'lines':['大三了。予樂說我們現在是「老人」。','……她今天走樓梯喘了。所以我相信。'],
  'choices':[ch('「妳還沒老。」','你也是。……我們一起不老。',rel={'comf':1}),
             ch('「政大的階梯很多。」','一百二十七階。我每天都數。……我沒有變強壯。')],'rel':{'comf':2},'mem':'KX5_OLD_PEOPLE',
  'note':'「一百二十七階」接大一下的手機小事（BB_96 9-8）'},
 {'id':'K5-L2','if':DK,'dateOnly':'meet','week':[4,18],
  'lines':['三十分鐘的見面，我發現可以說很多。','只要我們都不看手機。……我剛剛看了一次。不算。'],
  'choices':[ch('「三十分鐘也很好。」','嗯。……可是我還是比較喜歡兩個小時的。'),
             ch('「下次一小時。」','好。我先跟予樂借時間。')],'rel':{'comf':2},'mem':'KX5_SHORT_MEET',
  'note':'K15（第 3 週三十分鐘的晚餐，KX_SHORT_MEET）之後；不重複「還有九分鐘」'},
 {'id':'K5-L3','if':DK,'dateOnly':'video','week':[6,18],
  'lines':['我開始帶大一的民總讀書會了。','學弟妹叫我「假設學姊」。因為我每一題都說假設。……我很喜歡。'],
  'choices':[ch('「很適合妳。」','我知道。……我第一次喜歡被叫學姊。'),
             ch('「他們問難的嗎？」','問很難的。我答不出來的，就說「假設我們下週再講」。')],'rel':{'comf':2},'mem':'KX5_HYPO_SENIOR',
  'note':'BB_107 第 1 節她帶大一讀書會；K17（第 14 週）她拿你練習是之後的事'},
 {'id':'K5-L4','if':DK,'dateOnly':'meet','week':[8,18],
  'lines':['我最近在想一個假設題。還沒想好要問誰。','……想好了再問你。'],
  'linesIf':[{'if':ev('ev_kexin_call_helper'),'lines':['上次那通電話，我問的那一題。','……你回答完，我睡得比較好。我也不知道為什麼。']}],
  'choices':[ch('「隨時都可以問。」','我知道。所以我才敢慢慢想。'),
             ch('「是關於我的嗎？」','……假設是。',rel={'comf':1})],'rel':{'comf':2,'trust':1},'mem':'KX5_HELPER_Q',
  'note':'主線 4 的電話（第 7 週）之後推進的玩家用 linesIf；不重複電話裡的題目'},
 {'id':'K5-L5','if':DK,'dateOnly':'video','week':[10,18],
  'lines':['期中考完，我把整學期的筆記重新抄了一次。','……抄到一半，發現我在畫長頸鹿。習慣很可怕。'],
  'choices':[ch('「長頸鹿是好習慣。」','你每次都這樣說。……所以我一直沒改。'),
             ch('「抄一次會比較懂？」','會。第一次是寫給老師看，第二次是寫給我自己。')],'rel':{'comf':2},'mem':'KX5_RECOPY'},
 {'id':'K5-L6','if':DK,'dateOnly':'meet','week':[12,18],
  'lines':['最近我在學一件事：不要先替別人擔心。','……我學得很慢。'],
  'extraIf':[{'if':route('JP'),'lines':['日本。……時差一小時。我算過了，一小時很近。']},
             {'if':route('US'),'lines':['美國。……我把時差寫在手上了。十三個小時。洗了三次還在。']}],
  'choices':[ch('「妳學得很好。」','沒有。……可是我有在學。'),
             ch('「擔心也沒關係。」','嗯。那我擔心一點點就好。',rel={'comf':1})],'rel':{'comf':2,'trust':1},'mem':'KX5_LEARN_WORRY',
  'note':'第 11 週交換的決定（一定讓她知道）之後；路線用 extraIf；美國冬天時差 13 小時（AA_144）'},
 {'id':'K5-L7','if':DK,'dateOnly':'meet','week':[15,18],
  'lines':['這次聖誕，我們應該都在趕報告。','……先說好：交報告的那一刻，你傳一張照片給我。我也是。'],
  'choices':[ch('「說好了。」','好。……照片裡不准有別人的報告。'),
             ch('「趕完一起吃宵夜。」','好。宵夜比聖誕重要。這是我的新規則。',rel={'comf':1})],'rel':{'comf':2},'mem':'KX5_XMAS_PHOTO',
  'note':'聖誕（第 16 週，都在趕報告）的前情'},
 {'id':'K5-L8','if':DK,'week':[16,18],
  'lines':['這學期我們的日子，短的比長的多。','……可是短的那幾次，我都記得很清楚。'],
  'choices':[ch('「短的也很好。」','嗯。像三十分鐘的麵。很快，可是很燙。'),
             ch('「我也記得。」','那你說一個。……不用了，我知道你記得。',rel={'comf':1})],'rel':{'comf':2},'mem':'KX5_SHORT_ONES',
  'note':'大三的省略（AA_112 第 7 節第 4 點：短的見面）'},
],'greet':None,'note':'同前：交往中不在路上遇到；短招呼用手機池（BB_107 第 7 節）；分開就停'}

BAN=['大家都只問','謝謝你沒有','不要跟別人講','不要跟別人說','你不用那個表情','我可以問一個奇怪的問題嗎','你是第一個','熱可可','加一份濃縮','我請你',
     '我錄取了','遞面紙','做好了，給我玩','換了題目的那個','我上週分手了','你們是不是覺得','比分數的地方',
     '第三關怎麼過','他卡了三天','我女兒在念師範','我每天都很想去上課','同學都比我小一歲','還有九分鐘','他自己的事，誰幫']
BRANDS=['麥當勞','摩斯','星巴克','7-11','統一超商','全家便利','萊爾富','誠品','路易莎','50嵐','五十嵐','迷客夏','寶可夢','任天堂','Switch','iPhone','Instagram','Google','YouTube','Netflix','迪士尼']
def texts(s):
    out=list(s['lines'])+[x for li in s.get('linesIf',[])+s.get('extraIf',[]) for x in li['lines']]
    for c in s.get('choices',[]): out+= [c['t'], c['reply']]
    return out
def check(d):
    err=[]
    for cid,c in d['characters'].items():
        ids=[s['id'] for s in c['steps']]
        if len(ids)!=len(set(ids)): err.append(cid+' 層 id 重複')
        if len(ids)!=8: err.append(cid+' 不是 8 層')
        for s in c['steps']:
            for l in texts(s):
                if len(l)>48: err.append(f"{s['id']} 台詞太長（{len(l)}）：{l}")
                for b in BAN+BRANDS:
                    if b in l: err.append(f"{s['id']} 禁用字樣「{b}」：{l}")
            for ch_ in s.get('choices',[]):
                if len(ch_['t'])>20: err.append(f"{s['id']} 選項超過 20 字：{ch_['t']}")
            if len(s.get('choices',[]))>2: err.append(s['id']+' 選項超過 2')
            cond=s.get('if',{})
            bad=[k for k in cond if k not in ('stage','any')]
            if cid==KX and cond!={'flags':['dating_kexin']}: err.append(s['id']+' 可昕的 if 只能是 dating_kexin')
            elif cid!=KX and bad: err.append(f"{s['id']} 的 if 只能放階段（防卡關）：{bad}")
            if 'week' in s and s['week'][1]<18 and not s.get('skipIf'): err.append(f"{s['id']} 週次沒有放寬到第 18 週（會卡關）")
        g=c.get('greet')
        if g and len(g['base'])!=5: err.append(cid+' 短招呼不是 5 句')
        if g:
            for w in g['when']:
                if len(w['t'])>48: err.append(f"{cid} 情境句太長：{w['t']}")
            for b in g['base']:
                if len(b)>48: err.append(f"{cid} 短招呼太長：{b}")
    return err
e=check(D)
if e: sys.exit('\n'.join(e))
if '--check' not in sys.argv:
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'ladder_bb_y3s1.json'),'w',encoding='utf-8') as f:
        json.dump(D,f,ensure_ascii=False,indent=1); f.write('\n')
print('ok', {k:len(v['steps']) for k,v in D['characters'].items()})
