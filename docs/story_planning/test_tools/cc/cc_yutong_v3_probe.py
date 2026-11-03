# -*- coding: utf-8 -*-
"""CC（帳號 A）11-03：「語彤第三版」（企劃線 AA_624～AA_643）的瀏覽器探針（BB 21:32，v9.10.20 第一批，目標 d2b962a3f）。
稿：企劃線 claude/story-planning 的 docs/story_planning/AA_610、AA_624、AA_625、AA_642、AA_643（探針裡逐字抄期望句子；每一句都要逐字在稿裡＝md 檢查，報稿的檔名和行）。
每一場：
  【前置／捷徑】最小存檔讀檔（GAME.applySave，條件事件先關）→ 用遊戲的 API 設好前置（關係數字、記憶、聯絡方式、群組、打工紀錄、交往）→ GAME.snapshot() →
  條件事件照開（EVENTS.onEnter／tick 還原）再讀一次，時間地點＝事件的前一刻。手機自動打開照開（要回訊息的場景），其他關掉。
  照玩家觸發（不用 ?turbo）：走到茶屋門口點「進去一盞」（班的時間到了就開班）、走到她旁邊點「和語彤說話」、點「看期刊架」「坐到圓桌（做初談紀錄）」、
  等私訊／點手機的回覆按鈕、點「出發：」；對話框用手指點、選項照稿選。
  從讀完檔起，MutationObserver 收畫面上的字（#caption、#dlgName、#dlgText、#choices）＋ GAME.say 的說話人和原文（只記不改）、手機訊息（G.msgs）。
檢查：稿逐句（startswith、依序）＝GAME.say 的字＋說話人（旁白＝沒有說話人）；手機的稿逐則（G.msgs）；畫面上不該出現的字（麵店、阿鳳…）；JS 例外。
  截圖：每一場她（或指定的人）第一句的時候橫向一張（PORT 的場另加直向），最後一張；ADV 立繪框（#adv .advSlot）的狀態記在輸出。
場（CASES＝逗號分隔；不給＝全部）：
  tea_first 第一班（AA_610 第 2 節）｜tea_cats 找公園的貓（第三班打烊）｜tea_pay 3' 第一次領薪水｜mom_here 10' 媽媽發現（在場）｜absent 4 她今天沒來（蘇姨）｜
  mom_back 10' 沒在場（蘇姨轉述）＋第 10 週她回來上班（沒聽過家裡的補一句）｜rent 6 房東來過了（茶屋）｜ev5 圖書館三樓（AA_643 9-1）｜
  ev9 陪秀琴姨去法服（在場，萬才館圓桌）｜ev9_msg 9 不在場（6/12 私訊）｜ev11 想幫秀琴姨（茶屋打烊，吵架那一支）｜home 第一次去她家（交往後，私訊→出發）｜
  home_rent 第一次去她家＋事件 6 在她家當面｜ev13 自己選的週四｜ev14 續約（法服紀錄，柏翰私訊→出發）｜ev15b_shelf 15b 期刊架｜ev15b_tea 15b 茶屋當面｜
  ev16 自己選的（分一點時間）｜ev16b 秀琴姨的照片（私訊）｜xmas_y4 大四聖誕（燒臘店阿姨）｜box_y3 寄到英國的那一箱（燒臘店阿姨）｜
  ev8 買賣不破租賃（債各第 6 週課堂→傳訊息）｜grad_friend 畢業那天（朋友：事件 17、Café 的約、Café 那一句、晚上 FB）｜grad_gf 畢業那天（交往中的約）｜end4 結局 4（尾聲）
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=tea_cats,ev5] python3 cc_yutong_v3_probe.py '<URL>/index.html' <輸出資料夾>
環境：LW_REPO（讀稿用的 repo，預設 /home/user/Lawstudent）、STORY_REF（預設 origin/claude/story-planning）、CASE_S（每一場上限秒數，預設 1500）。
exit 0＝ALL PASS；1＝有 FAIL。"""
import os, sys, json, asyncio, time, traceback, subprocess, math
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L  # noqa: E402
from playwright.async_api import async_playwright  # noqa: E402

URL0, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?')
REPO = os.environ.get('LW_REPO', '/home/user/Lawstudent')
REF = os.environ.get('STORY_REF', 'origin/claude/story-planning')
CASE_S = int(os.environ.get('CASE_S', '1500'))
J = lambda o: json.dumps(o, ensure_ascii=False)
YT = 'heroine_03'
DOCS = {'610': 'AA_610_語彤改成打工同事才認識.md', '624': 'AA_624_語彤新背景_富二代_打工.md', '625': 'AA_625_語彤新版事件台詞.md',
        '642': 'AA_642_語彤第三版接線_回LAWWW六件.md', '643': 'AA_643_語彤AA625接線_回LAWWW六題＋畢業那天四句.md'}

# ---------------------------------------------------------------- 稿（逐字抄；N＝旁白、ME＝祐廷）
N, ME = None, '祐廷'
TEA = ('wenzhou', {'x': -20.5, 'z': 2.6, 'yaw': 0}, 12 + 40 / 60)   # 一盞門口（WZ_SHOPS_LAYOUT.teahouse.enterAt (-20.5,4.6)）；班 13:00（12:30 起走進去就開班）
SHIFT_LINES = ['水溫不要太高，烏龍會苦。', '語彤第一天來，把整壺茶倒在自己身上。你比她好。', '這間店第七年了。', '客人坐下先給水。他們會自己看菜單。', '三號桌的阿伯每次都點一樣的。你不用問。']
BAN_OLD = ['麵店', '阿鳳', '扭到']
CASES = {
    'tea_first': dict(title='第一班（AA_610 第 2 節）＋之後讀檔一次', at=('Y1S1', 3, 6), where=TEA, met=False, tea=0, keepFm=True, reload_name=True, act='tea', picks=['妳在這裡做多久了'], shot=['語彤', '蘇姨'], port=True,
                      exp=[('610', N, '（水屋裡，一個綁馬尾的女生正在一個一個擦茶杯。）'), ('610', '蘇姨', '語彤，他今天第一天。妳帶他。'), ('610', '語彤', '……嗯。'),
                           ('610', '語彤', '客人坐下先給水，不要先問點什麼。他們會自己看。'), ('610', '語彤', '高三暑假開始。'),
                           ('610', N, '（一個下午下來，她跟你講的話不超過十句。）'), ('610', N, '（收店的時候，她倒了一杯剩下的烏龍茶，放在你旁邊。）'), ('610', '語彤', '第一天都這樣。下週就順了。')],
                      done="!!GAME.G.flags.YT_MET_JOB&&(GAME.G.jobs.tea.shifts|0)>=1"),
    'tea_cats': dict(title='找公園的貓（第三班打烊）', at=('Y1S1', 4, 6), where=TEA, tea=2, flags={'TEA_SHIFTS': 2}, act='tea', picks=['好啊', '妳一個人住喔'], shot=['語彤'], port=True, shiftline=True,
                     exp=[('625', '語彤', '……嗯。你下班有事嗎？'), ('625', '語彤', '要不要一起去找公園的貓？大安森林公園那邊，晚上會有好幾隻出來。'),
                          ('625', N, '（公園的長椅旁邊，一隻橘貓從草叢裡走出來，在語彤腳邊坐下。）'), ('625', '語彤', '牠每天都在這裡。我叫牠「橘子」。……很普通的名字。'),
                          ('625', N, '（她蹲下來，摸了摸貓的頭。）'), ('625', '語彤', '我很想養一隻。'), ('625', ME, '那就養啊。'),
                          ('625', '語彤', '我一個人住。白天上課、週末打工，牠會常常自己待在家。'), ('625', '語彤', '……那樣不好。'),
                          ('625', '語彤', '嗯。我是新北人，家在淡水。'), ('625', '語彤', '我爸媽離婚了。上大學以前，我跟我媽住。'), ('625', '語彤', '淡水到學校太遠，我媽就在學校附近買了房子給我住。'),
                          ('625', '語彤', '晚上有一個阿姨會來煮飯。秀琴姨。……她煮的比茶屋的點心好吃。不要跟蘇姨說。'), ('625', N, '（橘子吃完你們帶來的小魚乾，走回草叢裡。）'),
                          ('625', N, '（你沒有再問。你們坐著看橘子走遠，坐到十點。）'), ('625', '語彤', '……謝謝你陪我找貓。')],
                     done="!!GAME.G.flags.YT_CATS"),
    'tea_pay': dict(title="3' 第一次領薪水", at=('Y1S1', 8, 7), where=TEA, tea=5, flags={'TEA_SHIFTS': 5, 'YT_CATS_NO': True}, act='tea', picks=['為什麼不拆'], shot=['蘇姨'],
                    exp=[('625', N, '（打烊。蘇姨把兩個薪水袋放在吧檯上，一個寫你的名字，一個寫「語彤」。）'), ('625', '蘇姨', '這個月的。辛苦了。'),
                         ('625', N, '（你拆開數了一下。語彤沒有拆，把袋子翻過來又翻回去。）'), ('625', '蘇姨', '語彤每次都這樣。拿了也不拆。'),
                         ('625', '語彤', '……嗯。我第一次拿到自己賺的錢，是去年暑假。那一包我也沒拆。'), ('625', '語彤', '拆了就會花掉。……花掉就不知道它長什麼樣子了。')],
                    done="!!GAME.G.flags.YT_FIRST_PAY"),
    'mom_here': dict(title="10' 媽媽發現（在場）", at=('Y1S2', 9, 6), where=TEA, tea=10, flags={'TEA_SHIFTS': 10, 'YT_CATS_NO': True, 'YT_FIRST_PAY': True}, act='tea', shot=['語彤的媽媽'], port=True,
                     exp=[('625', N, '（門口的風鈴響了。一位穿著套裝的女士站在門口，沒有進來。）'), ('625', N, '（語彤端著茶盤轉身，看到她，停住了。）'), ('625', '語彤', '……媽。'),
                          ('625', N, '（語彤的媽媽看了店裡一圈，又看了女兒手上的茶盤。）'), ('625', '語彤的媽媽', '我在外面等妳下班。'), ('625', N, '（她走出去，站在對面的騎樓下。一直等到五點。）')],
                     done="!!GAME.G.flags.YT_MOM_HERE&&(GAME.G.jobs.tea.worked||[]).includes(GAME.G.day)"),
    'absent': dict(title='4 她今天沒來（蘇姨）', at=('Y1S2', 9, 7), where=TEA, tea=11, flags={'TEA_SHIFTS': 11, 'YT_CATS_NO': True, 'YT_FIRST_PAY': True, 'YT_MOM_SEEN': True, 'YT_MOM_HERE': True}, act='tea', shot=['蘇姨'],
                   exp=[('625', N, '（吧檯後面只有蘇姨。）'), ('625', '蘇姨', '語彤今天請假。她說家裡有事。'), ('625', '蘇姨', '這孩子很少請假的。')],
                   done="!!GAME.G.flags.YT_ABSENT_SEEN&&(GAME.G.jobs.tea.worked||[]).includes(GAME.G.day)"),
    'mom_back': dict(title="10' 沒在場（蘇姨轉述）＋第 10 週她回來上班", at=('Y1S2', 10, 6), where=TEA, tea=11, flags={'TEA_SHIFTS': 11, 'YT_CATS_NO': True, 'YT_FIRST_PAY': True, 'YT_ABSENT_SEEN': True},
                     act='tea', picks=['妳想考牙醫'], shot=['語彤'], port=True,
                     exp=[('625', '蘇姨', '上禮拜她媽媽來了，站在門口等她下班。……兩個人走的時候都沒講話。'),
                          ('625', '語彤', '……嗯。上禮拜那個是我媽。她臨時來找我，樓下警衛跟她說我在這裡。'), ('625', '語彤', '她說，我讓妳來台北是念書的，不是端茶的。'),
                          ('625', '語彤', '她說，妳要不要再考一次牙醫。'), ('625', '語彤', '我說，這是我自己選的。'), ('625', '語彤', '她說隨便我。……她沒有說隨便我，可是我就當她說了。'),
                          ('625', '語彤', '不想。……我想知道別人怎麼過日子。'), ('625', '語彤', '我媽在淡水開牙醫診所。……我一個人住學校對面，是她買的房子。')],
                     done="!!GAME.G.flags.YT_MOM_BACK&&!!GAME.G.flags.YT_PARENTS_KNOW"),
    'rent': dict(title='6 房東來過了（茶屋，10\' 的下一班）', at=('Y1S2', 10, 7), where=TEA, tea=12, flags={'TEA_SHIFTS': 12, 'YT_CATS_NO': True, 'YT_FIRST_PAY': True, 'YT_ABSENT_SEEN': True, 'YT_MOM_HERE': True,
                 'YT_MOM_SEEN': True, 'YT_FAMILY_HEARD': True, 'YT_PARENTS_KNOW': True}, dayflags={'YT_MOM_BACK': -1}, act='tea', shot=['語彤'],
                 exp=[('625', '語彤', '……嗯。昨天秀琴姨煮完飯，沒有馬上走。'), ('625', '語彤', '她說她的房東要把房子賣了。她住了十四年。'), ('625', '語彤', '賣了她要住哪裡。……她問我，我也不知道。'),
                      ('625', ME, '我上課有聽過，房子賣了租約不一定就沒了。我再查。'), ('625', '語彤', '嗯。你查到再跟我說。')],
                 done="!!(((GAME.G.events||{}).done||{}).ev_yutong_landlord)"),
    'ev5': dict(title='5 圖書館三樓（AA_643 第 9-1 節）', at=('Y1S2', 10, 6), where=('library', None, 17 + 35 / 60), flags={'YT_PARENTS_KNOW': True, 'YT_FAMILY_HEARD': True, 'YT_MOM_BACK': 1},
                act='npc', picks=['要不要我幫妳看民總'], shot=['語彤'], port=True, rel={YT: dict(fam=30, trust=10)},
                exp=[('643', N, '（總圖三樓靠窗。語彤桌上攤著兩本書，一本社會學，一本民法總則。茶屋的圍裙還塞在包包旁邊。）'), ('643', '語彤', '……下班才來的。三樓比較安靜。'),
                     ('643', '語彤', '我跟我媽說，成績不會掉。掉了我就不做。'), ('643', '語彤', '所以我要念。'), ('643', '語彤', '好。……意思表示那一章，我看了三遍。'),
                     ('643', '語彤', '那天你沒有問我媽的事。……謝謝。')],
                done="!!(((GAME.G.events||{}).done||{}).ev_yutong_thanks)"),
    'ev9': dict(title='9 陪秀琴姨去法服（在場，萬才館大廳圓桌）', key='2027-05-22', where=('wancai', None, 9 + 5 / 60), flags={'lawclub': True, 'CLUB_lawclub_study': True}, rel={YT: dict(fam=35, trust=20), 'classmate_bohan': dict(fam=40, trust=25)},
                contacts=[YT, 'classmate_bohan'], act='it:坐到圓桌', picks=['整齊的部分'], shot=['秀琴姨', '語彤'], port=True,
                exp=[('625', N, '（法律系館B的諮詢室。門開了，進來的是秀琴姨，後面跟著語彤。）'), ('625', '語彤', '（看到你，停了一下）……嗯。我陪秀琴姨來的。'), ('625', '柏翰', '你們認識？'),
                     ('625', ME, '我們在同一家茶屋打工。'), ('625', '柏翰', '好。那紀錄你照做，意見我來講。'), ('625', '柏翰', '阿姨，先跟您說，我們都是學生。今天講的，之後會請指導律師再看一次。'),
                     ('625', '秀琴姨', '學生好啊。學生比較有耐心。'), ('625', N, '（秀琴姨把租約攤在桌上。語彤把它轉過來，對著柏翰。）'), ('625', '柏翰', '（翻到最後一頁）書面的，還有……快兩年。您一直住在那裡，對吧？'),
                     ('625', '秀琴姨', '十五年了。'), ('625', '柏翰', '那這樣。房子賣了，租約跟著房子走。新屋主要接著當房東，到期以前，他不能叫您搬。'), ('625', '秀琴姨', '新屋主說他要重新裝潢，租給學生。'),
                     ('625', '柏翰', '那是到期以後的事。到期以前，他要等。這快兩年，可以拿來準備怎麼跟他談續約。'), ('625', '秀琴姨', '談？跟屋主談？我只會煮飯耶。'), ('625', '語彤', '秀琴姨，所以才要準備。'),
                     ('625', N, '（秀琴姨看了她一眼，笑出來。）'), ('625', '秀琴姨', '好啦，聽妳們的。'), ('625', '語彤', '剛剛他講的那個，我這學期也在上。'),
                     ('625', '語彤', '在課本上看的時候，覺得好整齊。坐在秀琴姨旁邊聽，就不整齊了。'), ('625', '語彤', '今天先不要。今天我只想陪她。')],
                done="!!(((GAME.G.events||{}).done||{}).ev_yt_aunt_consult)"),
    'ev9_msg': dict(title='9 不在場（都沒遇到＝6/12 21:00 私訊）', key='2027-06-12', where=('dorm', None, 20 + 50 / 60), rel={YT: dict(fam=35, trust=20)}, contacts=[YT], act='wait', phone=True,
                    msgs=[('643', '上次我陪秀琴姨去法服。'), ('625', '裡面的人說，租約到期以前，新屋主不能叫她搬。'), ('625', '她出來的時候在笑。')],
                    done="(GAME.G.msgs||[]).some(m=>m.tag==='y2_yt_aunt_msg')||(GAME.G.msgs||[]).filter(m=>m.th==='p:heroine_03').length>=3", wait_after=8),
    'ev11': dict(title='11 想幫秀琴姨（大二下第 15 週茶屋打烊，選①吵架）', at=('Y2S2', 15, 6), where=TEA, tea=40,
                 flags={'TEA_SHIFTS': 40, 'YT_CATS_NO': True, 'YT_FIRST_PAY': True, 'YT_MOM_BACK': 1, 'YT_MOM_HERE': True, 'YT_ABSENT_SEEN': True, 'YT_MOM_SEEN': True, 'YT_PARENTS_KNOW': True, 'YT_FAMILY_HEARD': True},
                 done_ev=['ev_yutong_landlord', 'ev_yt_aunt_consult'], mem=[[YT, 'RENT_RUMOR', ''], [YT, 'RENT_CONSULTATION', '']], act='tea', picks=['我覺得她要的不是錢', '她要的是可以不用搬'], shot=['語彤'], port=True,
                 exp=[('643', N, '（打烊。蘇姨先走了。語彤在數今天的零錢，數到一半停下來。）'), ('625', '語彤', '我想幫秀琴姨付新房子的押金。萬一到期真的要搬。'), ('625', '語彤', '我跟她說了，她不收。'),
                      ('625', '語彤', '那她要什麼？'), ('625', '語彤', '我有的就只有錢。'), ('625', '語彤', '……我知道。')],
                 done="!!GAME.G.flags.YT_EV11B&&!!GAME.G.flags.YT_FIGHT_DAY"),
    'home': dict(title='第一次去她家（交往以後的平日傍晚私訊→18:30）', at=('Y2S1', 3, 2), where=('dorm', None, 16 + 50 / 60), dating=True, rel={YT: dict(fam=60, trust=45, comf=40, rom=60, npcRom=50)},
                 contacts=[YT], mem=[[YT, 'RENT_RUMOR', '']], act='wait', phone=True, ppicks=['好。'], picks=['妳一個人住這麼大', '出發'], shot=['秀琴姨'], port=True,
                 msgs=[('625', '……今天秀琴姨煮很多。你要不要來吃。')],
                 exp=[('625', N, '（新生南路、學校對面的大樓。電梯到七樓。）'), ('625', N, '（兩房一廳。客廳很大，只有一張長桌、一張沙發。另一間房間的門開著，裡面堆滿書和紙箱。廚房裡，一個阿姨在盛湯。）'),
                      ('625', '秀琴姨', '你就是祐廷喔？坐、坐。'), ('625', '語彤', '……嗯。這是秀琴姨。'), ('625', '秀琴姨', '她都不帶人回來。你是第一個。'), ('625', '語彤', '秀琴姨。'),
                      ('625', N, '（晚餐。秀琴姨煮了三菜一湯，收完碗就走了。）'), ('625', '語彤', '我媽買的。……我只是想知道一個人過日子是什麼感覺。')],
                 done="!!GAME.G.flags.YT_HOME_SEEN"),
    'home_rent': dict(title='第一次去她家＋事件 6 在她家當面（大一下第 11 週）', at=('Y1S2', 11, 2), where=('dorm', None, 16 + 50 / 60), dating=True, rel={YT: dict(fam=60, trust=45, comf=40, rom=60, npcRom=50)},
                      flags={'YT_PARENTS_KNOW': True, 'YT_FAMILY_HEARD': True}, contacts=[YT], act='wait', phone=True, ppicks=['好。'], picks=['秀琴姨煮得很好吃', '出發'], shot=['秀琴姨'],
                      msgs=[('625', '……今天秀琴姨煮很多。你要不要來吃。')],
                      exp=[('625', N, '（新生南路、學校對面的大樓。電梯到七樓。）'), ('625', '秀琴姨', '你就是祐廷喔？坐、坐。'), ('625', '語彤', '……嗯。這是秀琴姨。'),
                           ('625', '秀琴姨', '她都不帶人回來。你是第一個。'), ('625', '語彤', '秀琴姨。'), ('625', N, '（秀琴姨把最後一盤菜端上桌，在餐桌旁邊坐下來，沒有拿包包。）'),
                           ('625', '秀琴姨', '房東說要把房子賣了。我住了十四年。賣了我要住哪裡。'), ('625', N, '（語彤沒說話。她幫秀琴姨盛了一碗湯。）'), ('625', '語彤', '秀琴姨，妳先吃。'),
                           ('625', '語彤', '嗯。比茶屋的點心好吃。……不要跟蘇姨說。')],
                      done="!!GAME.G.flags.YT_HOME_SEEN"),
    'ev13': dict(title='13 自己選的週四（12/16 總圖三樓）', key='2027-12-16', where=('library', None, 17 + 55 / 60), flags={'RENT_RENEWED': True, 'YT_EV14': 'heard'}, rel={YT: dict(fam=45, trust=30)},
                 mem=[[YT, 'RENT_CONSULTATION', '']], act='npc', picks=['先從秀琴姨開始'], shot=['語彤'],
                 exp=[('625', '語彤', '……嗯。秀琴姨的事解決了。'), ('625', '語彤', '這兩年我一直在想她的事。現在不用想了，突然空出一塊。'), ('625', '語彤', '我想做一件自己的事。'),
                      ('625', N, '（她從背包拿出一本新的筆記本。第一頁寫著：「溫州街。」）'), ('625', '語彤', '我想把這條街上的人說的話記下來。茶屋的客人、巷口的老闆、秀琴姨。'),
                      ('625', '語彤', '社會系教我們做田野。我以前覺得那是作業。'), ('625', '語彤', '她說她沒什麼好講的。……她講了兩個小時。')],
                 done="!!(((GAME.G.events||{}).done||{}).ev_yt_thursday_free)"),
    'ev14': dict(title='14 續約（法服做紀錄：柏翰私訊→14:30 法律系館B研討室）', key='2027-11-24', where=('dorm', None, 13 + 40 / 60), flags={'lawclub': True, 'CLUB_lawclub_study': True},
                 rel={YT: dict(fam=40, trust=25), 'classmate_bohan': dict(fam=40, trust=25)}, contacts=[YT, 'classmate_bohan'], groups=[['lawclub_study', '法服讀書會']], mem=[[YT, 'RENT_CONSULTATION', '']],
                 act='wait', phone=True, ppicks=['我去。'], picks=['出發'], shot=['指導律師', '秀琴姨'], port=True,
                 exp=[('625', '指導律師', '租約到明年三月。屋主想重新裝潢，我們理解。秀琴姨在這裡住了十六年，從來沒有晚繳過一次房租。'), ('625', '新屋主', '……我只是想租給學生，比較好收。'),
                      ('625', '指導律師', '秀琴姨願意配合調一點租金，換五年的租約。您不用重新找人、不用空租期。'), ('625', N, '（新屋主看了一下語彤準備的資料：十六年的繳費紀錄，一張一張夾好。）'),
                      ('625', '新屋主', '……五年。租金照這個數字。'), ('625', '秀琴姨', '好。好。'), ('625', N, '（散會。秀琴姨抓著語彤的手，一直沒放。）')],
                 done="!!(((GAME.G.events||{}).done||{}).ev_yt_lease_renew)"),
    'ev15b_shelf': dict(title='15b〈溫州街的時間〉期刊架（總圖三樓）', key='2028-10-17', where=('library', None, 16.0), rel={YT: dict(fam=40, trust=25)}, act='it:看期刊架', shot=[N],
                        exp=[('625', N, '（系刊第三頁，她的名字下面寫著：『謝謝秀琴姨，和一盞茶屋所有的人。』）')], done="!!GAME.G.flags.YT_ESSAY"),
    'ev15b_tea': dict(title='15b 當面（系刊出刊後第一次茶屋班打烊；讀過期刊架）', key='2028-10-21', where=TEA, tea=80,
                      flags={'TEA_SHIFTS': 80, 'YT_CATS_NO': True, 'YT_FIRST_PAY': True, 'YT_MOM_BACK': 1, 'YT_MOM_HERE': True, 'YT_ABSENT_SEEN': True, 'YT_MOM_SEEN': True, 'YT_PARENTS_KNOW': True,
                             'YT_FAMILY_HEARD': True, 'YT_EV11B': 1, 'YT_ESSAY': 'shelf'}, done_ev=['ev_yutong_landlord'], mem=[[YT, 'RENT_RUMOR', ''], [YT, 'RENT_CONSULTATION', '']], act='tea', shot=['語彤'],
                      exp=[('643', '語彤', '你看過了喔。……蘇姨也看了。她說寫得太短。')], done="!!GAME.G.flags.YT_ESSAY_SHIFT"),
    'ev16': dict(title='16 自己選的（分一點時間，12/21 總圖三樓）', key='2028-12-21', where=('library', None, 17 + 10 / 60), rel={YT: dict(fam=45, trust=30)}, act='npc', picks=['這本以後要做什麼'], shot=['語彤'], port=True,
                 exp=[('625', '語彤', '我可以給你看一個東西嗎。'), ('625', N, '（田野筆記，已經寫到第三本。）'), ('625', '語彤', '這本不是作業。是我自己想寫的。'),
                      ('625', '語彤', '我媽到現在還是希望我去考牙醫。'), ('625', '語彤', '可是這四年，打工、社會系、法律、這本筆記，每一件都是我自己選的。'),
                      ('625', '語彤', '畢業專題。老師說可以再寫長一點。')],
                 done="!!GAME.G.flags.YT16"),
    'ev16b': dict(title='16b 秀琴姨的照片（4/19 18:00 私訊）', key='2029-04-19', where=('dorm', None, 17 + 50 / 60), rel={YT: dict(fam=40, trust=25)}, contacts=[YT], act='wait', phone=True,
                  msgs=[('625', '秀琴姨在台中的公園抱著一個小孩，背後是兒子一家'), ('625', '她說台中太熱了。'), ('625', '她說下禮拜回來，叫我不要一直吃泡麵。')], msg_contains=[0],
                  done="(GAME.G.msgs||[]).some(m=>m.th==='p:heroine_03'&&/泡麵/.test(m.text||''))", wait_after=8),
    'xmas_y4': dict(title='大四聖誕交換禮物（公館燒臘：燒臘店阿姨，AA_642 第 1 節）', key='2028-12-22', where=('dorm', None, 18 + 20 / 60),
                    rel={YT: dict(fam=40, trust=25), 'zhe': dict(fam=45, trust=30), 'heroine_01': dict(fam=45, trust=30), 'yu': dict(fam=40, trust=25)}, contacts=[YT, 'zhe', 'heroine_01', 'yu'],
                    meet=['zhe', 'heroine_01', 'yu'], groups=[['noodle_team', '桌遊團']], act='wait', phone=True, picks=['一本小筆記本', '出發'], shot=['燒臘店阿姨'],
                    exp=[('642', N, '（阿姨多放了一碟燙青菜，說是煮多了。）'), (None, '燒臘店阿姨', '最後一個冬天的期末。……吃完再走。')],
                    done="!!(((GAME.G.events||{}).done||{}).ev_y4_xmas)", ban_spk={'（阿姨多放了一碟燙青菜，說是煮多了。）': ['秀琴姨', '蘇姨'], '最後一個冬天的期末。': ['秀琴姨', '蘇姨']}),
    'box_y3': dict(title='寄到英國的那一箱（大三聖誕，公館燒臘；AA_642 第 5 節）', key='2027-12-26', where=('dorm', None, 18.0),
                   rel={YT: dict(fam=40, trust=25), 'zhe': dict(fam=45, trust=30), 'heroine_01': dict(fam=45, trust=30), 'yu': dict(fam=40, trust=25), 'heroine_02': dict(fam=30, trust=10)},
                   contacts=[YT, 'zhe', 'heroine_01', 'yu'], meet=['zhe', 'heroine_01', 'yu', 'heroine_02'], groups=[['noodle_team', '桌遊團']], act='wait', phone=True, picks=['一包乖乖', '出發'], shot=['燒臘店阿姨（畫面外）'],
                   exp=[('642', N, '（語彤從包包裡拿出一卷膠帶，把箱子封了三圈。）'), ('642', '燒臘店阿姨（畫面外）', '箱子不夠大的話，店裡有！')],
                   done="!!(((GAME.G.events||{}).done||{}).ev_xmas_y3_box)"),
    'ev8': dict(title='8 買賣不破租賃（大二下債各第 6 週：課堂回想＋下課傳訊息）', key='2027-03-29', where=('linze', {'x': -2.0, 'z': -6.0, 'lv': 1, 'yaw': 3.14}, 8 + 55 / 60), rel={YT: dict(fam=40, trust=25)}, contacts=[YT], mem=[[YT, 'RENT_RUMOR', '']],
                act='class', picks=['傳訊息給語彤'], shot=[N],
                exp=[('643', N, '（你想起語彤說的，秀琴姨的房東要把房子賣了。）')],
                msgs=[('625', '今天上到買賣不破租賃。秀琴姨的房子如果被賣，租約還有效，新屋主要照原本的條件租到期滿。'), ('625', '……真的？'), ('625', '我明天跟她說。'), ('625', '謝謝。我不知道課本裡有寫這個。')],
                done="!!GAME.G.flags.YT_LEASE_HELP"),
    'grad_friend': dict(title='畢業那天（朋友：事件 17、Café 的約、Café 那一句、晚上的截圖）', key='2029-06-02', where=('dorm', None, 5 + 50 / 60), grad=True,
                        rel={YT: dict(fam=50, trust=35), 'zhe': dict(fam=45, trust=30)}, contacts=[YT, 'zhe'], meet=['zhe'], act='wait', phone=True, picks=['好。', '出發'], shot=['語彤的媽媽', '語彤'], port=True,
                        exp=[('625', '語彤', '……媽。這是祐廷。茶屋的。'), ('625', '語彤的媽媽', '（看了你一眼，點了一下頭）你好。'), ('625', N, '（她們拍了一張合照。語彤的媽媽把花給她，沒有多說什麼。）'),
                             ('625', '語彤的媽媽', '恭喜。'), ('643', '語彤', '晚上要不要一起吃？今天不排班，我們去兩點半。'), ('643', '語彤', '暑假我也要準備國考。……跟你們一樣。')],
                        msgs=[('625', '……她以前常貼我的照片。'), ('625', '這是第一次，她寫我念什麼系。')],
                        done="GAME.G.flags.GRAD_EVENING==='cafe'&&(GAME.G.msgs||[]).some(m=>m.th==='p:heroine_03'&&/第一次，她寫我念什麼系/.test(m.text||''))"),
    'grad_gf': dict(title='畢業那天（交往中：她的約）', key='2029-06-02', where=('dorm', None, 5 + 50 / 60), grad=True, dating=True, rel={YT: dict(fam=60, trust=45, comf=40, rom=60, npcRom=50)},
                    contacts=[YT], act='wait', phone=True, picks=['好。'], shot=['語彤'],
                    exp=[('643', '語彤', '今天不排班。晚上來我家，我煮。')], done="!!GAME.G.flags.GRAD_DONE"),
    'end4': dict(title='結局 4（很好的朋友：尾聲語彤那一列）', key='2034-06-03', where=('dorm', None, 18 + 50 / 60), epi=True, rel={YT: dict(fam=50, trust=35)}, act='wait', shot=['語彤'],
                 exp=[('643', N, '（她週末還是會去一盞茶屋坐一下。蘇姨幫她留著吧檯最旁邊的位子。）')], done="!!GAME.G.flags.EPILOGUE_DONE"),
}
ORDER = ['tea_first', 'tea_cats', 'tea_pay', 'mom_here', 'absent', 'mom_back', 'rent', 'ev5', 'ev9', 'ev9_msg', 'ev11', 'home', 'home_rent', 'ev13', 'ev14', 'ev15b_shelf', 'ev15b_tea',
         'ev16', 'ev16b', 'xmas_y4', 'box_y3', 'ev8', 'grad_friend', 'grad_gf', 'end4']

BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'MET_KAI': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'YT_JOB_V': 1}
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'cvs', 'bookstore', 'dorm', 'dorm_hall', 'campus', 'classroom', 'wz_teahouse')


def url_for():
    base, _, q = URL0.partition('?'); ps = [x for x in q.split('&') if x and x != 'turbo']
    return base + ('?' + '&'.join(ps) if ps else '')


# ---------------------------------------------------------------- 稿檢查（期望句子逐字在稿裡；回報檔名:行）
def load_docs():
    out = {}
    for k, f in DOCS.items():
        try: out[k] = subprocess.run(['git', '-C', REPO, 'show', '%s:docs/story_planning/%s' % (REF, f)], capture_output=True, text=True, timeout=60).stdout
        except Exception: out[k] = ''
    return out


def strip(t):
    return t.strip().strip('「」').strip()


def doc_line(docs, k, t):
    if k is None: return None
    s = docs.get(k) or ''; core = strip(t)
    for c in (core, core.strip('（）'), core.replace('（看到你，停了一下）', '').replace('（翻到最後一頁）', '').replace('（看了你一眼，點了一下頭）', '')):
        if not c: continue
        for i, ln in enumerate(s.splitlines(), 1):
            if c in ln: return i
    return 0


DAY_JS = r"""(a=>{ let d=null; if(a.key) d=STORY.dayOfKey(a.key); else { const T=CALENDAR.termDays(a.term); for(let x=T.from;x<=T.to;x++){ const t=CALENDAR.termOf(x); if(t&&t.id===a.term&&t.week===a.week&&CALENDAR.dateOf(x).wd===a.wd){ d=x; break; } } }
  if(d==null) return null; const c=CALENDAR.dateOf(d), t=CALENDAR.termOf(d); return {d, wd:c.wd===7?0:c.wd, key:c.key, term:t&&t.id, week:t&&t.week}; })"""

SETUP = r"""(c=>{ const G=GAME.G, F=G.flags, YT='heroine_03';
  for(const id of (c.meet||[])) SOCIAL.meet(id, id===YT?'tea':'');
  for(const [id,r] of Object.entries(c.rel||{})){ const R=SOCIAL.rel(id); for(const k in r) R[k]=Math.max(R[k]|0,r[k]); }
  for(const m of (c.mem||[])) SOCIAL.remember(m[0],m[1],m[2]||'');
  G.contacts=G.contacts||{}; for(const id of (c.contacts||[])) if(G.contacts[id]==null) G.contacts[id]=G.day-60;
  for(const g of (c.groups||[])) if(typeof PHONE!=='undefined'&&PHONE.join&&!PHONE.inGroup(G,g[0])) PHONE.join(G,g[0],g[1]);
  if(c.dating){ F['dating_'+YT]=true; F.romance=F.romance||{}; F.romance[YT]=Object.assign({},F.romance[YT]||{},{status:'dating',sinceDay:G.day-40}); }
  const so=G.social||(G.social={}), U=so.relUp||(so.relUp={}); for(const id of Object.keys(c.rel||{})) if((U[id]|0)<4) U[id]=4;
  for(const k in (c.dayflags||{})) F[k]=G.day+c.dayflags[k];
  const D=(G.events.done=G.events.done||{}); for(const e of (c.done_ev||[])) D[e]=G.day-7;
  if(!c.keepFm) so.fm120=true;   /* 捷徑：讀檔時的「舊存檔初遇修正」（game3d.js relabelFirstMet）記成做過；不然第二次讀檔會把剛記的 FIRST_MET 改成 GREETED（見 tea_first 的讀檔檢查）*/
  return {stage:SOCIAL.stage(YT), rel:SOCIAL.rel(YT), knows:typeof STORY!=='undefined'&&STORY.knows?STORY.knows(YT,G):null, dating:!!F['dating_'+YT],
    jobs:G.jobs&&G.jobs.tea?{shifts:G.jobs.tea.shifts,day:G.jobs.tea.day}:null, groups:(c.groups||[]).map(g=>PHONE.inGroup(G,g[0]))}; })"""

HOOK = r"""(()=>{ if(window.__YT3) return 'again'; const W=window.__YT3={scr:[],say:[],ev:[]};
  const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2)+' '+GAME.G.zone; }catch(e){ return ''; } };
  const watch=(id,kind,get)=>{ const el=document.getElementById(id); if(!el) return false; let last='';
    const rec=()=>{ const t=get(el); if((t||kind==='name')&&t!==last){ W.scr.push({k:kind,t,at:at()}); } last=t; };
    new MutationObserver(rec).observe(el,{childList:true,subtree:true,characterData:true,attributes:true}); return true; };
  const vis=el=>!el.classList.contains('hide');
  watch('caption','caption',el=>vis(el)?(el.textContent||'').trim():''); watch('dlgName','name',el=>(el.textContent||'').trim());
  watch('dlgText','text',el=>(el.textContent||'').trim()); watch('choices','choices',el=>vis(el)?[...el.querySelectorAll('button')].map(b=>(b.textContent||'').trim()).join('｜'):'');
  const s0=GAME.say; GAME.say=function(w,t){ try{ W.say.push({n:(w&&w.name)||(typeof w==='string'?w:''),c:(w&&w.charId)||null,t:String(t==null?'':t),at:at()}); }catch(e){} return s0.apply(this,arguments); };
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const v0=EVENTS.run; EVENTS.run=function(ev){ try{ W.ev.push({id:String((ev&&ev.id)||''),at:at(),n:W.say.length}); }catch(e){} return v0.apply(this,arguments); }; }
  return true; })()"""

TS = r"""(()=>{ const D=GAME.D, ch=document.getElementById('choices'), dl=document.getElementById('dlg'), P=GAME.E.player, it=document.getElementById('interact');
  const ph=!!(GAME.phoneIsOpen&&GAME.phoneIsOpen());
  return {dlg:!!(D&&D.active), name:(dl&&!dl.classList.contains('hide'))?((document.getElementById('dlgName')||{}).textContent||'').trim():'',
    txt:(dl&&!dl.classList.contains('hide'))?((document.getElementById('dlgText')||{}).textContent||'').trim():'',
    ch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>(b.textContent||'').trim()):[],
    busy:!!P.busy, depth:(D&&D.busyDepth)|0, phone:ph, asks:ph?[...document.querySelectorAll('[data-ask]')].filter(b=>!b.disabled).map(b=>({k:b.dataset.ask,t:(b.textContent||'').trim()})):[],
    act:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim():'',
    h:+(+GAME.G.hour).toFixed(3), key:CALENDAR.dateOf(GAME.G.day).key, zone:GAME.G.zone, x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2),
    evr:!!(typeof EVENTS!=='undefined'&&EVENTS.running)}; })()"""
SLOTS = "[...document.querySelectorAll('#adv .advSlot')].map(e=>({id:e.id, show:e.classList.contains('show'), dim:e.classList.contains('dim'), off:e.classList.contains('off'), img:(e.querySelector('img')||{}).src||null}))"
NPC_AT = "(id=>{ const n=(GAME.E.npcs||[]).find(q=>q.charId===id||q.id===id); if(!n) return null; const o=n.obj.position; return {x:+o.x.toFixed(2),z:+o.z.toFixed(2),lv:n.lv|0}; })"
MSGS = "(th=>(GAME.G.msgs||[]).filter(m=>m.th===th).map(m=>({d:CALENDAR.dateOf(m.day).key,h:+(+m.h||0).toFixed(2),from:m.from,tag:m.tag||'',text:String(m.text||'')})))"
CHOICE_AT = "(k=>{ const b=document.querySelectorAll('#choices button'); const e=b[k]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })"


async def tap_choice(pg, cdp, k):
    c = await pg.evaluate(CHOICE_AT, k)
    if c: await L.touch_tap(cdp, c[0], c[1])
    return bool(c)


def norm_spk(n, c):
    if c == YT: return '語彤'
    n = (n or '').strip()
    if n in ('陳語彤',): return '語彤'
    if n in ('林柏翰', '柏翰'): return '柏翰'
    return n


async def base_state(pg, cs, run):
    if 'key' in cs: a = {'key': cs['key']}
    else: a = {'term': cs['at'][0], 'week': cs['at'][1], 'wd': cs['at'][2]}
    d = await pg.evaluate(DAY_JS, a)
    if not d: return None, None
    zone, pos, hour = cs['where']
    flags = dict(BASEF); flags.update(cs.get('flags') or {})
    if cs.get('met', True): flags.update({'YT_MET_JOB': True, 'met_heroine_03': True})
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'flags': flags,
          'day': d['d'], 'weekday': d['wd'], 'hour': hour, 'zone': zone, 'pos': pos, 'weather': 'clear', 'stage': 'law', 'money': 30000, 'visited': {z: True for z in VISITED}}
    if cs.get('tea') is not None:
        n = cs['tea']; st['jobs'] = {'tea': {'since': d['d'] - 7 * max(1, n), 'from': None, 'day': [6, 7], 'shifts': n, 'skill': min(10, n), 'worked': [], 'missedRun': 0, 'wk': {}, 'brk': {}, 'ot': {}},
                                     '_meta': {'n': {'tea': 3}, 'asked': {'tea': True}}}
        if n == 0: st['jobs']['tea']['since'] = d['d'] - 1
    return st, d


async def do_action(pg, cdp, run, cs):
    stop = lambda s: bool(s.get('dlg') or s.get('choices'))
    act = cs.get('act', 'wait')
    if act == 'tea':
        ok = await L.go_to(pg, cdp, run, -20.5, 4.4, 1.0, '一盞門口', max_s=300, stop=stop)
        for _ in range(20):
            s = await pg.evaluate(TS)
            if s['zone'] == 'wz_teahouse' or s['dlg'] or s['ch']: break
            if s['act'].startswith('進去一盞'): await L.tap(pg, cdp, '#interact'); run.note('點「進去一盞」'); await pg.wait_for_timeout(3000); continue
            await pg.wait_for_timeout(1000)
        return ok
    if act == 'npc':
        p = None
        for _ in range(40):
            p = await pg.evaluate(NPC_AT, YT)
            if p: break
            await pg.wait_for_timeout(1500)
        run.note('她在：%s' % J(p))
        if not p: return False
        await L.go_to(pg, cdp, run, p['x'], p['z'], 1.6, '走到語彤旁邊', max_s=400, stop=stop)
        for _ in range(15):
            s = await pg.evaluate(TS)
            if s['dlg'] or s['ch']: return True
            if '語彤' in s['act']:   # 讀書區第一次遇到＝只點頭（libquiet3d.js LIBQ.gate）；沒有開始就像玩家一樣再點一次（最多三次）
                run.note('點「%s」' % s['act']); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(8000); continue
            p2 = await pg.evaluate(NPC_AT, YT)
            if p2 and math.hypot(p2['x'] - s['x'], p2['z'] - s['z']) > 1.6: await L.go_to(pg, cdp, run, p2['x'], p2['z'], 1.4, '再靠近一點', max_s=120, stop=stop)
            await pg.wait_for_timeout(1000)
        return True
    if act.startswith('it:'):
        lb = act[3:]; it = None
        for _ in range(20):
            it = await L.find_it(pg, lb)
            if it: break
            await pg.wait_for_timeout(1500)
        run.note('互動點：%s' % J(it))
        if not it: return False
        await L.go_to(pg, cdp, run, it['x'], it['z'], max(0.8, it['r'] * 0.7), lb, max_s=400, stop=stop)
        for _ in range(15):
            s = await pg.evaluate(TS)
            if s['dlg'] or s['ch']: return True
            if s['act'].startswith(lb): run.note('點「%s」' % s['act']); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500); return True
            await pg.wait_for_timeout(1000)
        return False
    return True


async def drive(pg, cdp, run, cs, out, name):
    picks = list(cs.get('picks') or []); ppicks = list(cs.get('ppicks') or [])
    t0 = time.time(); last = None; since = time.time(); shot_done = set(); done_at = None; slots = {}
    while time.time() - t0 < CASE_S:
        s = await pg.evaluate(TS)
        dn = await pg.evaluate("(()=>{ try{ return !!(%s); }catch(e){ return false; } })()" % cs['done'])
        idle = not s['dlg'] and not s['ch'] and s['depth'] == 0 and not s['busy'] and not s['evr']
        if dn and idle:
            if done_at is None: done_at = time.time()
            if time.time() - done_at > cs.get('wait_after', 4): break
        else: done_at = None
        sig = (s['txt'][:30], tuple(s['ch']), s['zone'], s['phone'], len(s['asks']))
        if sig != last: last = sig; since = time.time()
        elif time.time() - since > 300 and not dn:
            run.note('300 秒沒有變化：%s' % J(s)); await run.shot(pg, name + '_stuck'); since = time.time()
        if s['phone']:
            if s['asks']:
                k = None
                for i, p in enumerate(ppicks):
                    k = next((a for a in s['asks'] if a['t'].startswith(p)), None)
                    if k: ppicks.pop(i); break
                if not k: k = s['asks'][0]
                run.note('手機的回覆 %s → 點「%s」' % (J([a['t'] for a in s['asks']]), k['t']))
                await pg.screenshot(path=os.path.join(out, name + '_phone.png'))
                await L.tap(pg, cdp, '[data-ask="%s"]' % k['k']); await pg.wait_for_timeout(1500); continue
            await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(600); continue
        if s['ch']:
            k = None
            for i, p in enumerate(picks):
                k = next((j for j, t in enumerate(s['ch']) if p in t), None)
                if k is not None: picks.pop(i); break
            if k is None: k = next((j for j, t in enumerate(s['ch']) if t.startswith(('出發：', '接起來', '「好。」', '好。'))), 0)
            run.note('選項 %s → 點「%s」' % (J(s['ch']), s['ch'][k]))
            await tap_choice(pg, cdp, k); await pg.wait_for_timeout(1300); continue
        if s['dlg']:
            nm = s['name']
            for w in (cs.get('shot') or []):
                hit = (w is None and not nm and s['txt']) or (w and (nm == w or (w == '語彤' and nm in ('語彤', '陳語彤'))))
                if hit and (w or '旁白') not in shot_done:
                    shot_done.add(w or '旁白'); await pg.wait_for_timeout(1500); tag = name + '_' + (w or 'narr')
                    await pg.screenshot(path=os.path.join(out, tag + '_land.png')); slots[tag + '_land'] = await pg.evaluate(SLOTS)
                    if cs.get('port'):
                        await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(2500)
                        await pg.screenshot(path=os.path.join(out, tag + '_port.png')); slots[tag + '_port'] = await pg.evaluate(SLOTS)
                        await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(2000)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(900)
    return slots


def unq(t):
    """讀書區的「（小聲）」前綴是遊戲共用的機制（libquiet3d.js LIBQ.whisper，D127 ③），不是稿的字：比對前拿掉"""
    return t[4:] if t.startswith('（小聲）') else t


def compare(run, name, cs, says, docs, msgs):
    ok_all = True; rows = []
    i = 0
    for k, spk, txt in cs.get('exp') or []:
        j = next((q for q in range(i, len(says)) if unq(says[q]['t']).startswith(txt)), None)
        if j is None: j = next((q for q in range(len(says)) if unq(says[q]['t']).startswith(txt)), None); order = False
        else: order = True
        got = None if j is None else [norm_spk(says[j]['n'], says[j]['c']), says[j]['t']]
        ln = doc_line(docs, k, txt); ref = ('%s:%s' % (DOCS[k], ln)) if k else '（稿只改說話人）'
        sp_ok = j is not None and ((spk is None and not got[0]) or (spk is not None and got[0] == spk))
        ok = j is not None and order and sp_ok
        if not ok: rows.append({'稿': ref, '說話人': spk, '句子': txt, '遊戲': got, '依序': order})
        run.check('[%s] 稿逐句「%s：%s」（%s）' % (name, spk or '旁白', txt[:40], ref), ok, '' if ok else J(got))
        ok_all = ok_all and ok
        if j is not None and order: i = j + 1
        if k and ln == 0: run.check('[%s] 探針抄的句子逐字在稿裡：%s' % (name, txt[:40]), False, DOCS[k])
    if cs.get('msgs'):
        texts = [m['text'] for m in msgs]; i = 0
        for n, (k, txt) in enumerate(cs['msgs']):
            cont = n in (cs.get('msg_contains') or [])
            j = next((q for q in range(i, len(texts)) if (txt in texts[q] if cont else texts[q].startswith(txt))), None)
            ln = doc_line(docs, k, txt); ref = '%s:%s' % (DOCS[k], ln)
            ok = j is not None
            if not ok: rows.append({'稿': ref, '手機': txt, '遊戲': texts[i:i + 4]})
            run.check('[%s] 手機稿逐則「%s」（%s）' % (name, txt[:40], ref), ok, '' if ok else J(texts[-6:]))
            ok_all = ok_all and ok
            if j is not None: i = j + 1
    for t, bad in (cs.get('ban_spk') or {}).items():
        hit = [x for x in says if unq(x['t']).startswith(t) and norm_spk(x['n'], x['c']) in bad]
        run.check('[%s] 「%s」的說話人不是 %s' % (name, t[:20], '／'.join(bad)), not hit, J(hit[:2]))
    return ok_all, rows


async def run_case(BR, name, cs, docs, run):
    out = os.path.join(OUT, name); os.makedirs(out, exist_ok=True)
    print('\n==== %s：%s ====' % (name, cs['title']), flush=True)
    ctx = BR[1]; pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); errs = []   # 同一個瀏覽器（HTTP 快取共用，載入快一點）、每一場一個新分頁
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    pg.set_default_timeout(180000)
    res = {'name': name, 'title': cs['title'], 'pass': False, 'rows': []}
    try:
        await pg.goto(url_for()); run.check('[%s] 遊戲載入' % name, await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()")
        st, d = await base_state(pg, cs, run)
        if not st: run.check('[%s] 找得到日子' % name, False, J(cs.get('key') or cs.get('at'))); return res
        await pg.evaluate("(()=>{ window.__YTEV={a:EVENTS.onEnter,b:EVENTS.tick}; })()")
        await L.load_state(pg, st, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(2500)
        info = await pg.evaluate(SETUP, {k: cs.get(k) for k in ('meet', 'rel', 'mem', 'contacts', 'groups', 'dating', 'dayflags', 'done_ev', 'keepFm')} | {'meet': [YT] + list(cs.get('meet') or []) if cs.get('met', True) else list(cs.get('meet') or [])})
        if cs.get('grad') or cs.get('epi'):
            info['pg'] = await pg.evaluate(PG_SETUP, {'epi': bool(cs.get('epi'))})
        run.setup('[%s] 最小存檔讀檔：%s（星期%s，%s 第 %s 週）%.2f %s；遊戲 API 設前置：%s' % (name, d['key'], '日一二三四五六'[d['wd']], d['term'], d['week'], cs['where'][2], cs['where'][0], J(info)))
        snap = await pg.evaluate("()=>GAME.snapshot()")
        snap = snap.get('G', snap) if isinstance(snap, dict) else snap
        snap['hour'] = cs['where'][2]
        await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(()=>{ EVENTS.onEnter=window.__YTEV.a; EVENTS.tick=window.__YTEV.b; })()")
        await pg.evaluate(HOOK)
        await L.load_state(pg, snap, quiet_events=False, quiet_phone=not cs.get('phone')); await pg.wait_for_timeout(3000)
        run.setup('[%s] GAME.snapshot() 再讀一次（條件事件照開%s）' % (name, '、手機自動打開照開' if cs.get('phone') else '、只關手機自動打開'))
        if cs.get('keepFm'):   # 新遊戲從標題「開始」玩到這裡、中間沒讀過檔＝G.social 沒有 fm120（game3d.js 只在讀檔時記）；這裡的兩次讀檔是捷徑，把它拿掉回到新遊戲的樣子
            run.setup('[%s] 拿掉 G.social.fm120（回到「新遊戲、還沒讀過檔」）：%s' % (name, J(await pg.evaluate("(()=>{ const had=!!(GAME.G.social&&GAME.G.social.fm120); if(GAME.G.social) delete GAME.G.social.fm120; return had; })()"))))
        await run.shot(pg, name + '_loaded')
        if cs.get('act') == 'class':
            await class_flow(pg, cdp, run, cs)
        else:
            await do_action(pg, cdp, run, cs)
        slots = await drive(pg, cdp, run, cs, out, name)
        await pg.wait_for_timeout(1500); await pg.screenshot(path=os.path.join(out, name + '_after.png'))
        W = await pg.evaluate("(()=>window.__YT3||{scr:[],say:[],ev:[]})()")
        msgs = await pg.evaluate(MSGS, 'p:' + YT)
        if name in ('xmas_y4', 'box_y3'): msgs = msgs + await pg.evaluate(MSGS, 'g:noodle_team')
        with open(os.path.join(out, 'transcript.json'), 'w', encoding='utf-8') as f: json.dump({'say': W['say'], 'ev': W['ev'], 'msgs': msgs, 'slots': slots, 'scr': W['scr']}, f, ensure_ascii=False, indent=1)
        print('  [%s] 事件：%s' % (name, J([e['id'] for e in W['ev']])), flush=True)
        print('  [%s] 台詞：%s' % (name, J([[norm_spk(x['n'], x['c']) or '旁白', x['t']] for x in W['say']])[:6000]), flush=True)
        if cs.get('msgs'): print('  [%s] 她的訊息：%s' % (name, J([[m['d'], m['h'], m['from'], m['text']] for m in msgs][-10:])), flush=True)
        print('  [%s] 立繪框：%s' % (name, J(slots)[:1500]), flush=True)
        done = await pg.evaluate("(()=>{ try{ return !!(%s); }catch(e){ return false; } })()" % cs['done'])
        run.check('[%s] 演完（%s）' % (name, cs['done'][:80]), done)
        ok, rows = compare(run, name, cs, W['say'], docs, msgs)
        if cs.get('shiftline'):
            sl = [x['t'] for x in W['say'] if x['t'] in SHIFT_LINES]
            run.check('[%s] 茶屋平常的班：一班最多一句、句子在 AA_625 第 77～82 行' % name, len(sl) <= 1 and all(doc_line(docs, '625', t) for t in sl), J(sl))
        bad = [r for r in W['scr'] if any(w in r['t'] for w in BAN_OLD)]
        run.check('[%s] 畫面上沒有舊設定的字（%s）' % (name, '、'.join(BAN_OLD)), not bad, J(bad[:4]))
        rl_ok = True
        if cs.get('reload_name'):   # 第一班演完：照玩家「讀檔」一次（GAME.snapshot()→GAME.applySave，同「繼續」），名字還是語彤嗎
            # BB 22:46（BUG-YT-FIRSTMET-RELABEL-1103）：讀檔兩次，每次都要名字「陳語彤」、met_heroine_03 在、記憶有 FIRST_MET（G.social 沒有 fm120＝新遊戲、還沒讀過檔）
            ST_JS = "(()=>({name:SOCIAL.displayName('heroine_03'), met:!!GAME.G.flags.met_heroine_03, fm:SOCIAL.has('heroine_03','FIRST_MET'), job:!!GAME.G.flags.YT_MET_JOB, fm120:!!(GAME.G.social&&GAME.G.social.fm120), mem:((GAME.G.social&&GAME.G.social.mem&&GAME.G.social.mem.heroine_03)||[]).map(m=>m.tag)}))()"
            pre = await pg.evaluate(ST_JS)
            run.setup('[%s] 讀檔前：%s' % (name, J(pre)))
            for k in (1, 2):
                snap2 = await pg.evaluate("()=>GAME.snapshot()"); snap2 = snap2.get('G', snap2) if isinstance(snap2, dict) else snap2
                await L.load_state(pg, snap2, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(3000)
                post = await pg.evaluate(ST_JS)
                ok_k = run.check('[%s] 第 %d 次讀檔（GAME.snapshot→applySave，同「繼續」）：名字「陳語彤」、met_heroine_03 在、記憶有 FIRST_MET' % (name, k), post['name'] == '陳語彤' and post['met'] and post['fm'], J({'讀檔前': pre, '讀檔後': post}))
                rl_ok = rl_ok and ok_k
        res.update({'pass': ok and done and not bad and rl_ok, 'rows': rows})
    except Exception as e:
        run.check('[%s] 跑完（沒有探針例外）' % name, False, repr(e)[:500]); traceback.print_exc()
        try: await pg.screenshot(path=os.path.join(out, name + '_exception.png'))
        except Exception: pass
    run.check('[%s] 沒有 JS 例外' % name, not errs, J(errs[:3]))
    try: await asyncio.wait_for(pg.close(), 30)
    except Exception: pass
    return res


# 畢業那天、尾聲：postgrad3d.js 的場景表從 2029-05-10 起跑；前面的場景（報名、一試…）記成已處理，只留要測的那一場
PG_SETUP = r"""(o=>{ const G=GAME.G, F=G.flags, R=(F.PG=F.PG&&typeof F.PG==='object'?F.PG:{}); R.done=R.done||{};
  F.BAR_REG=false; F.Y4_PATH='job'; F.GRAD_THESIS_OK=true;
  if(o.epi){ F.GRADUATED=STORY.dayOfKey('2029-06-02'); F.GRAD_DONE=true; F.FIRST_DAY_SEEN=true; R.done.grad=true;
    if(typeof PG!=='undefined'&&PG.STEPS) for(const s of PG.STEPS) if(s.id!=='epi') R.done[s.id]=R.done[s.id]||'skip'; }
  return {pgDone:Object.keys(R.done).length, on:typeof PG!=='undefined'&&PG.on?PG.on(G):null}; })"""


async def class_flow(pg, cdp, run, cs):
    """債各（oblig_spec）第 6 週週一上午 L201：照玩家走進霖澤館 201 坐下（等開課）。"""
    run.note('ev8：上課的流程交給遊戲（走到 201 門口、進教室、坐下）')
    it = None
    s = await pg.evaluate(TS)
    if s['act'].startswith('進入 201'): run.note('點「%s」' % s['act']); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(4000)
    for lb in ('進入 201',):
        it = await L.find_it(pg, lb)
        if it: break
    run.note('201 的入口：%s' % J(it))
    if it:
        await L.go_to(pg, cdp, run, it['x'], it['z'], 1.0, '201 門口', max_s=400, stop=lambda s: bool(s.get('dlg') or s.get('choices')))
        s = await pg.evaluate(TS)
        if s['act']: run.note('點「%s」' % s['act']); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(4000)
    for _ in range(30):
        it2 = await L.find_it(pg, '坐下')
        s = await pg.evaluate(TS)
        if s['dlg'] or s['ch']: return
        if it2:
            await L.go_to(pg, cdp, run, it2['x'], it2['z'], 0.8, '座位', max_s=300, stop=lambda s: bool(s.get('dlg') or s.get('choices')))
            s = await pg.evaluate(TS)
            if s['act'].startswith('坐下'): await L.tap(pg, cdp, '#interact'); run.note('點「坐下」'); return
        await pg.wait_for_timeout(1500)


async def main():
    run = L.Run('yutong_v3', OUT); os.makedirs(OUT, exist_ok=True)
    want = [c.strip() for c in (os.environ.get('CASES') or '').split(',') if c.strip()] or ORDER
    print('cc_yutong_v3_probe  SHA=%s  URL=%s  CASES=%s' % (SHA, url_for(), ','.join(want)), flush=True)
    docs = load_docs()
    for k, f in DOCS.items(): run.check('稿讀得到：%s（%s）' % (f, REF), len(docs.get(k) or '') > 500, '%d 字' % len(docs.get(k) or ''))
    results = []
    async with async_playwright() as p:
        BR = await L.launch(p, landscape=True)
        try: await BR[2].close()
        except Exception: pass
        for name in want:
            if name not in CASES: run.check('場名 %s' % name, False, '沒有這一場'); continue
            results.append(await run_case(BR, name, CASES[name], docs, run))
        try: await asyncio.wait_for(BR[0].close(), 30)
        except Exception: pass
    print('\n==== 摘要 ====', flush=True)
    for r in results:
        print('%s %s %s' % ('PASS' if r['pass'] else 'FAIL', r['name'], r['title']), flush=True)
        for row in r['rows']: print('    和稿不一樣：' + J(row), flush=True)
    with open(os.path.join(OUT, 'summary.json'), 'w', encoding='utf-8') as f: json.dump(results, f, ensure_ascii=False, indent=1)
    print('SHA', SHA, flush=True)
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
