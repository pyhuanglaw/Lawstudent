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
  'lines':['你是那個……第一次來就問 Wi-Fi 密碼的人。','不是在說你壞話。大家第一句都是這個。'],
  'choices':[ch('「密碼很難記。」','密碼是店名加開店那年。老闆很懷舊。'),ch('「妳記得每個人第一次說什麼？」','……沒有每個人。只是有些人比較好記。')],'rel':{'fam':2}},
 {'id':'Z-L2','if':st(ZR,'ACQUAINTANCE'),'unlessWorking':True,
  'lines':['法律系是不是每天都在背東西？','外文系也背。單字、詩、別人的名字。'],
  'choices':[ch('「我們背條文，你們背詩。」','詩比較短。可是比較難懂。'),ch('「我比較怕考申論。」','申論就是寫很長的「我覺得」。我們也是。')],'rel':{'fam':2}},
 {'id':'Z-L3','if':{**st(ZR,'ACQUAINTANCE'),'events':['ev_zhiruo_ge_group']},'unlessWorking':True,
  'lines':['經原我是第二次修。第一次期中考完，我就沒去了。','……不是因為難。是那學期很亂。'],
  'choices':[ch('「這次我們同組，不會讓妳再翹。」','你很有自信。我先記下來。'),ch('「那學期怎麼了？」','沒怎麼了。就是亂。……下一題。',mem='ZR_ASKED_MESSY')],'rel':{'fam':3}},
 {'id':'Z-L4','if':st(ZR,'FAMILIAR'),'unlessWorking':True,
  'lines':['你知道嗎，店裡最常被點的不是咖啡，是「跟上次一樣」。','我最喜歡聽人家這樣說。'],
  'choices':[ch('「因為妳都記得。」','……那是工作。（她低頭擦杯子）'),ch('「那我下次也說這句。」','你要先有「上次」。')],'rel':{'fam':2,'comf':2}},
 {'id':'Z-L5','if':st(ZR,'FAMILIAR'),'location':['campus','putong','boya'],'weekday':[2,4],
  'lines':['外文系的教室窗戶看出去是椰子樹。我上課常常在數它們。','數到第七棵就下課了。'],
  'choices':[ch('「法律系的窗戶看出去是另一棟法律系。」','……那你們好辛苦。'),ch('「妳在數椰子樹的時候想什麼？」','想這一幕如果是電影，要用多長的鏡頭。')],'rel':{'fam':2}},
 {'id':'Z-L6','if':st(ZR,'FAMILIAR'),'unlessWorking':True,
  'lines':['我家在台中開影印店。一張一塊。','小時候我在店裡看別人印的東西長大：講義、論文、尋狗啟事。'],
  'choices':[ch('「尋狗啟事？」','印了三百張。第二天狗自己回家了。老闆娘——我媽——說這是她印過最好的一份。'),ch('「那妳很會看別人在忙什麼。」','……你這樣說，好像我是偷看的人。是啦。')],'rel':{'fam':3,'trust':2},'mem':'ZR_HOMETOWN'},
 {'id':'Z-L7','if':st(ZR,'FAMILIAR'),'location':['cafe','wenzhou'],'time':[19,24],'unlessWorking':True,
  'lines':['你有沒有看過一部電影，看完不想跟任何人講？','不是不好看。是太好看，講了就會變少。'],
  'choices':[ch('「有。」','那不要告訴我是哪一部。'),ch('「沒有。我看完都想講。」','那你很幸福。……我是說真的。')],'rel':{'fam':2,'comf':2}},
 {'id':'Z-L8','if':{'any':[st(ZR,'FRIEND'),{**st(ZR,'FAMILIAR'),'flagNum':{'CAFE_VISITS':{'min':4}}}]},'unlessWorking':True,
  'lines':['我發現你點東西的時候，都會先看我一眼，再看菜單。','……我不是在講什麼。只是發現。'],
  'choices':[ch('「因為妳會給建議。」','我給的建議都是今天比較好喝的。不是我比較喜歡的。'),ch('「我沒發現。」','嗯。所以是我發現。')],'rel':{'fam':2,'comf':3}},
],'greet':{'base':['嗨。（她推一下眼鏡）','今天的豆子還可以。','你又來了。……不是不歡迎。','外面要下雨了。你沒帶傘吧。','（她在吧檯後面點了一下頭）'],
 'when':[{'working':True,'t':'（她在吧檯後面點了一下頭，手沒停）'},
         {'location':['cafe'],'time':[22,24],'t':'要打烊了。……你可以坐到我擦完這張桌子。'},
         {'location':['campus','putong','boya'],'t':'在學校遇到你好奇怪。好像在店外面看到菜單。'},
         {'weekday':[0,6],'t':'週末我不上班。所以我現在不是店員。'}]}}

D['characters'][ZQ] = {'steps': [
 {'id':'Q-L1','if':st(ZQ,'ACQUAINTANCE'),'time':[14,24],
  'lines':['欸不是，阿凱說你是他室友。','他說你很安靜。安靜很好。我們社團缺安靜的人。'],
  'choices':[ch('「我不會彈吉他。」','我也不會。我是去聽的。……騙你的，我會。'),ch('「阿凱怎麼形容我的？」','「他會在我打遊戲的時候講法律」。')],'rel':{'fam':2}},
 {'id':'Q-L2','if':st(ZQ,'ACQUAINTANCE'),'time':[14,24],
  'lines':['你知道資工系館晚上幾點會熄燈嗎？','十二點。可是三樓的門禁卡我有。不要告訴別人。這是祕密。'],
  'choices':[ch('「法律系館八點就鎖了。」','那你們很慘。我同情你們。'),ch('「半夜在系館做什麼？」','寫程式。晚上的系館很安靜，只剩伺服器在叫。這不是比喻。')],'rel':{'fam':2}},
 {'id':'Q-L3','if':{**st(ZQ,'ACQUAINTANCE'),'events':['ev_ziqing_club'],'notMemory':[{'npc':ZQ,'tag':'INVITED_CLUB'}]},'time':[14,24],
  'lines':['你剛剛在社課的時候，手指按很用力。','新手都這樣。按到痛，就代表你有在按。'],
  'choices':[ch('「會痛很正常嗎？」','正常。痛兩週。之後就不痛了。很像人生。……我亂講的。'),ch('「我只是去看看。」','看看的人不會按到手痛。')],'rel':{'fam':2},
  'note':'有 INVITED_CLUB 的玩家已經聽過 SMALLTALK「手指好了沒」，這層跳過（直接算過）'},
 {'id':'Q-L4','if':st(ZQ,'FAMILIAR'),'time':[14,24],
  'lines':['我早上不起床。不是懶。我晚上的腦比較好用。','你早八？……我為你默哀。'],
  'choices':[ch('「我也是晚上比較清醒。」','好。那你是自己人。'),ch('「早八其實還好。」','你說謊的時候會看旁邊。我看到了。')],'rel':{'fam':2,'comf':2}},
 {'id':'Q-L5','if':st(ZQ,'FAMILIAR'),'time':[14,24],
  'lines':['我在做一個遊戲。主角是一隻貓。','牠一直在找插座。……不要笑。這是很嚴肅的遊戲。'],
  'choices':[ch('「為什麼是貓？」','因為貓不用解釋自己在幹嘛。'),ch('「我沒有笑。」','你有。你嘴角在笑。可是我接受。')],'rel':{'fam':3},'mem':'ZQ_GAME_HEARD'},
 {'id':'Q-L6','if':st(ZQ,'FAMILIAR'),'location':['gongguan','wancai'],'time':[19,24],
  'lines':['系上排名第一的人，缺席率也是第一。你猜是誰。','……對。所以教授看到我都很頭痛。'],
  'choices':[ch('「成績好就好了吧？」','教授不這樣想。我家也不這樣想。……好，下一題。'),ch('「妳不去上課在做什麼？」','做遊戲。睡覺。做遊戲。這是順序。')],'rel':{'fam':2}},
 {'id':'Q-L7','if':{'any':[st(ZQ,'FRIEND'),{**st(ZQ,'FAMILIAR'),'memory':[{'npc':ZQ,'tag':'PLAYTESTED'}]}]},'time':[14,24],
  'lines':['你玩我的遊戲的時候，卡在第二關卡了很久。','我看到了。我在旁邊。我沒說話。這很難得。'],
  'choices':[ch('「第二關的插座藏太好了。」','那是故意的。……好吧，可能太故意了。我改。'),ch('「妳一直看我，我很緊張。」','緊張是好事。代表你在乎。我是說在乎遊戲。')],'rel':{'fam':2,'trust':2},
  'note':'沒有 PLAYTESTED（沒測過她的遊戲）、但已經 FRIEND 的玩家：第一句改成「你下次要測我的遊戲。我會看你卡在哪裡。」，選項照用'},
 {'id':'Q-L8','if':st(ZQ,'FRIEND'),'time':[14,24],
  'lines':['欸不是，你下次社課要來。不是因為缺人。','是因為你在的時候，阿凱比較不會遲到。'],
  'choices':[ch('「這是問句嗎？」','不是。（她笑了）'),ch('「好，我去。」','我記下來了。你不能反悔。這不是問句。')],'rel':{'fam':2,'comf':2}},
],'greet':{'base':['欸。','我剛起床。不要跟我講話。……好啦，講一句。','滷味十點後半價。只是告訴你。','（她把耳機拿下來一邊）怎樣？','你又要去上課？……法律系好勤勞。'],
 'when':[{'time':[14,16],'t':'早。……對，我的早上是下午兩點。'},
         {'location':['wancai'],'weekday':[1,3],'time':[18.5,21],'t':'社課快開始了。你今天有要按到手痛嗎？'},
         {'location':['gongguan'],'time':[22,24],'t':'這個時間在公館遇到你，你墮落了。歡迎。'},
         {'weekday':[0,6],'t':'週末不要跟我講課業。只能講遊戲。'}]}}

D['characters'][SIS] = {'friendOnly':True,'steps': [
 {'id':'S-L1','if':st(SIS,'ACQUAINTANCE'),'location':['library','campus'],'time':[9,17],'weekday':[1,2,3,4,5],
  'lines':['學弟。兩件事。','一，總圖二樓的飲水機壞了，去三樓裝。二，沒有二。'],
  'choices':[ch('「謝謝學姊。」','不用謝。我只是不想看到大家拿空杯子走來走去。'),ch('「為什麼說兩件事？」','本來有兩件。說到一半忘了。……不要跟別人說。')],'rel':{'fam':2}},
 {'id':'S-L2','if':st(SIS,'ACQUAINTANCE'),
  'lines':['你們民總現在上到哪？','……第幾章不重要。重要的是你看不看得懂那一章在問什麼。'],
  'choices':[ch('「我還在背定義。」','定義先背。可是背完要問自己：這個定義在防什麼？',rel={'resp':2}),ch('「我還在找問題在哪。」','那你已經比背定義的人快一步。',rel={'resp':2})],'rel':{'fam':2}},
 {'id':'S-L3','if':{**st(SIS,'ACQUAINTANCE'),'flags':['lawclub'],'events':['ev_studygroup_wed']},
  'lines':['你第一次來讀書會，坐在門邊。','新人都坐門邊。方便逃走。我第一年也是。'],
  'choices':[ch('「學姊也想過逃走？」','每個週三。……可是我沒有逃。所以現在我是社長。這不是勵志故事，是警告。'),ch('「門邊比較涼。」','好理由。可是下次往前坐一排。')],'rel':{'fam':3,'comf':2}},
 {'id':'S-L4','if':st(SIS,'FAMILIAR'),
  'lines':['你知道我保溫瓶裡裝什麼嗎？','咖啡。三倍濃。不要學。'],
  'choices':[ch('「三倍？」','一倍給上課，一倍給法服，一倍給剩下的。'),ch('「學姊睡得夠嗎？」','……這不是你該問的問題。可是謝謝。',mem='SIS_ASKED_SLEEP')],'rel':{'fam':2}},
 {'id':'S-L5','if':st(SIS,'FAMILIAR'),
  'lines':['我爸媽都是公務員。從小他們就說，考上司法官很好。','我也覺得很好。……我是說，我一直都這樣覺得。'],
  'choices':[ch('「那學姊想當司法官嗎？」','三件事。一，想。二，大概。三，下一題。'),ch('「妳說『一直都』。」','你很會聽重點。這是誇獎。也是警告。')],'rel':{'fam':2,'trust':3},'mem':'SIS_PARENTS_HEARD'},
 {'id':'S-L6','if':{**st(SIS,'FAMILIAR'),'flags':['lawclub']},'location':['wancai'],'weekday':[3],'time':[20.5,23],
  'lines':['今天那題，你回答得不對。','可是你回答的方式是對的：先說你不確定的地方。'],
  'choices':[ch('「那對的答案是什麼？」','回去查。查到了明天告訴我。不是考你，是我也想再確認一次。',rel={'resp':3}),ch('「我很怕講錯。」','法服最不怕的就是講錯。最怕的是講錯了不說。',rel={'resp':3})],'rel':{'fam':2},
  'note':'週三晚上法服讀書會之後（萬才館）'},
 {'id':'S-L7','if':st(SIS,'FAMILIAR'),'unlessWeekdayTime':{'weekday':[5],'time':[17,21]},
  'lines':['學弟，你覺得公法無聊嗎？','大家都說公法無聊。我覺得是因為大家還沒遇過被政府擋住的事。'],
  'choices':[ch('「我還沒遇過。」','希望你一直都不用遇到。……可是如果遇到，記得來找法服。'),ch('「我覺得不無聊。」','好。你是第三個這樣說的一年級。我記住了。',mem='SIS_PUBLIC_LAW_FAN')],'rel':{'fam':2}},
 {'id':'S-L8','if':st(SIS,'FRIEND'),
  'lines':['三件事。','一，你最近有睡飽。我看得出來。二，期中考前不要換位子。三……','（她想了一下）三，沒事。今天到這裡。'],
  'choices':[ch('「第三件是什麼？」','說了沒事就是沒事。（她把保溫瓶握緊了一點）'),ch('「學姊也要睡飽。」','……一，知道了。')],'rel':{'fam':2,'comf':3}},
],'greet':{'base':['學弟。','一件事：吃飯了沒。','（她舉了一下保溫瓶）','總圖今天很冷，帶外套。','讀書會不要遲到。'],
 'when':[{'location':['library'],'t':'（小聲）學弟。三樓有位子。'},
         {'weekday':[3],'time':[17,19.5],'t':'今天週三。七點，萬才館。'},
         {'weekday':[6],'time':[8,12.5],'t':'今天法服值班。不是叫你來，是告訴你我在哪。','note':'單週週六上午（法服方案 A）；雙週不說'},
         {'time':[22,24],'t':'這麼晚了。一件事：回去睡。'}]}}

D['characters'][PS] = {'steps': [
 {'id':'P-L1','if':st(PS,'ACQUAINTANCE'),
  'lines':['我可以問一個奇怪的問題嗎？','你覺得法律系的人，看起來有一種樣子嗎？'],
  'choices':[ch('「有，看起來都很累。」','……我也是嗎？不要回答。'),ch('「沒有，大家都不一樣。」','那很好。我本來擔心我看起來不像。')],'rel':{'fam':2}},
 {'id':'P-L2','if':st(PS,'ACQUAINTANCE'),
  'lines':['我爸媽在桃園開早餐店。','所以我早上六點會自己醒來。不是因為認真，是身體記得要煎蛋。'],
  'choices':[ch('「好羨慕。」','你不會羨慕的。週末四點半起床的那種。'),ch('「那妳早八都不會遲到。」','不會遲到。可是會睡著。')],'rel':{'fam':2},'mem':'PS_FAMILY_SHOP'},
 {'id':'P-L3','if':{**st(PS,'ACQUAINTANCE'),'events':['ev_studygroup_wed'],'memory':[{'npc':PS,'tag':'FIRST_MET'}]},
  'lines':['讀書會的學姊講話好快。我抄到一半就跟不上了。','你有抄到嗎？'],
  'choices':[ch('「我抄到一半。」','我們拼起來，就是一整份了。',mem='PS_NOTES_SHARED'),ch('「我沒抄，我在聽。」','……我也想變成那樣的人。')],'rel':{'fam':3}},
 {'id':'P-L4','if':st(PS,'FAMILIAR'),
  'lines':['我今天去旁聽哲學系的課。','老師問：如果一條規則每個人都遵守，結果很糟，那還要遵守嗎？……我想了一整節。'],
  'choices':[ch('「法律也會問這個。」','真的嗎？那我是不是應該更喜歡法律一點？'),ch('「妳的答案是什麼？」','還沒有。我想先聽完下週的課。')],'rel':{'fam':2,'trust':2}},
 {'id':'P-L5','if':st(PS,'FAMILIAR'),
  'lines':['我可以再問一個奇怪的問題嗎？','你覺得考試考得好的人，就是懂的人嗎？'],
  'choices':[ch('「不一定。」','我也覺得。可是我還是很想考得好。好矛盾。'),ch('「至少比較懂考試。」','哈。這個答案好誠實。')],'rel':{'fam':2,'comf':2}},
 {'id':'P-L6','if':st(PS,'FAMILIAR'),
  'lines':['桃園回台北的客運，過了林口就會開始塞車。','我都在塞車的時候背法條。背到交流道，剛好一頁。'],
  'choices':[ch('「這是很好的計時器。」','對吧。不塞車的時候我反而背不完。'),ch('「我搭捷運都在睡覺。」','臺北人好幸福。')],'rel':{'fam':2}},
 {'id':'P-L7','if':st(PS,'FAMILIAR'),
  'lines':['我發現我上課抄最多的地方，都是老師講故事的時候。','條文的地方，我反而抄很少。……這樣是不是不對？'],
  'choices':[ch('「故事比較好記。」','嗯。可是考試不考故事。（她笑了一下）'),ch('「條文課本都有，故事沒有。」','……你說得對。我好像沒有那麼糟。',mem='PS_REASSURED')],'rel':{'fam':2,'trust':2}},
 {'id':'P-L8','if':st(PS,'FRIEND'),
  'lines':['謝謝你都會認真回答我的奇怪問題。','大部分的人會說「妳想太多」。'],
  'choices':[ch('「妳的問題都不奇怪。」','……有一點奇怪。可是謝謝。'),ch('「我也常想太多。」','那我們是想太多的同盟。')],'rel':{'fam':2,'comf':3}},
],'greet':{'base':['嗨！','我今天沒有奇怪的問題。……騙你的，明天再問。','你吃早餐了嗎？','我要去哲學系。下次聊！','（她揮了揮手上的筆記）'],
 'when':[{'time':[6,9],'t':'早！我已經醒三個小時了。早餐店的小孩都這樣。'},
         {'location':['wancai'],'weekday':[3],'time':[18,19.5],'t':'讀書會快開始了。你今天要坐門邊嗎？'},
         {'location':['library'],'t':'（小聲）嗨。我在抄學姊的筆記。'},
         {'weekday':[5],'time':[17,24],'t':'週五了。我要搭客運回桃園。下週見！'}]}}

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
 {'id':'K-L6','if':{'flags':['dating_kexin']},'week':[7,9],'dateOnly':'video',
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
  'choices':[{'t':'「一場就好。」','advance':1,'energy':-5,'rel':{'kai':{'fam':3}},'random':['所以我們是天才','是隊友的問題 不是我們的','宿舍網路 我要告它 你們有教這個嗎'],'count':'KAI_GAMES'},
             {'t':'「我要念書。」','reply':'好 那我小聲','narr':'（他沒有小聲。）'}]},
 {'id':'K-D2','title':'一場變三場','if':{'flagNum':{'KAI_GAMES':{'min':2}}},'once':True,'location':'dorm','time':[23,24],
  'narr':'一場變三場，抬頭已經兩點。','lines':['所以 早八是幾點'],
  'choices':[{'t':'「八點。」','reply':'那還可以睡五個半小時 很多了','nextMorningEnergy':-10},{'t':'「我去睡了。」','reply':'好 我再一場'}]},
 {'id':'K-D3','title':'鍵盤聲','location':'dorm','time':[7,8.5],'needs':'玩家今天有早八，且昨晚沒參加 K-D1（隨機 30%）',
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

def check(d):
    err=[]
    for cid,c in d['characters'].items():
        ids=[s['id'] for s in c['steps']]
        if len(ids)!=len(set(ids)): err.append(cid+' 層 id 重複')
        for s in c['steps']:
            for l in s['lines']:
                if len(l)>60: err.append(f"{s['id']} 台詞太長：{l}")
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
