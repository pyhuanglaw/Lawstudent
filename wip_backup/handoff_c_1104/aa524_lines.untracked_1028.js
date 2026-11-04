/* ===== AA_524 說了沒發生（一）：以安、芷若、語彤（企劃線 8fd10848d；AA-C 定稿 D109；任務 HEROINE-LIFE-1028、USER_WANTS X122）=====
   這裡是程式（src/promise524_3d.js，PROM524）執行時用的台詞，照稿一字不差（含標點、「……」）。
   改在現有事件、資料裡的句子寫在各自的檔（各處註解寫 AA_524 第幾條、補的那一行帶 aa524:true）：
     events.js（A1 時差、A5 報告、Z2 第一次見面、Z4 十點的電話、Z11 點餐前那一句的呼叫、Y2 跨年）、y34b3d.js（A1 餞行、Y1 二十三週年、Y7 群組）、
     termend_lines.js（A3、A6、Y1）、termend3d.js（A6 朋友的飯桌一句）、r2y3b3d.js（A7、A10）、r2y3b_events.js（A10）、encounters.js（A11）、vac_activities.js（A12）、story3d.js（A13）、
     y2r2_3d.js（Z1 旗標）、y2b_events.js（Z1 聖誕的視訊）、feed_y2s1.js（Z3 動態）、fest_events.js（Z8 旗標）、an_yt_hol_events.js（Y3 旗標、Y4）、noodle_closed3d.js（Y3）、needed_msgs.js（Y6）；
     閒聊階梯（A4、A14、Z10）在 tools/ladder/import_ladder.py 的 _fix、約會的地點台詞（A8、A9、Z7、Y9）在 tools/date/import_date_lines.py（重產 ladder.js、date_lines.js）。
   格式：字串＝她說；{narr:'（…）'}＝旁白；{who:'阿姨',t:'…'}＝別人說。
   測試：node tests/aa524_promises_unit.js（雙向逐字對稿）*/
'use strict';
const AA524_LINES={
  src:{AA_524:'8fd10848d'},
  /* A2 以安的告白那一場（她先說或玩家先說都算），有 AN_REASON_HIDDEN 的，最後多兩句 */
  a2:['（把手帳翻到園區那一天）上次沒給你看的那一行。',{narr:'（理由欄寫著：「想到{name}。」）'}],
  /* Z3 大二上第 8 週週六 22:07 她私訊（有 ZR_EARLY_PROMISE）；選項期限週日 08:30 */
  z3:{msg:['明天早場。九點十分。','你說過你起得來。'],go:'我去。',goReply:'好。',no:'起不來。',noReply:'我就知道。'},
  /* Z5 她主動約的 D04 西門老片（ZR_Z11B 'with'）：那一次約會開頭多兩句 */
  z5:[{narr:'（她買的票是倒數第三排。）'},'說好的。'],
  /* Z6 2026-08-26 22:07 私訊（有 ZR_TELL_BACK）*/
  z6:['回來了。','台中帶來的行李，比我去的時候重。'],
  /* Z8 她主動約的 D04 西門老片（有 ZR_POSTER）：開頭多兩句 */
  z8:[{narr:'（放的是海報上那一部。）'},'第五次。'],
  /* Z9 第二輪明信片 6/15 那一張的背面（多段感情坦白那一場有她的）*/
  z9:'（背面只寫了一行：「寫了三次才寄。」）',
  /* Z11 D04 西門偶遇一起走以後（「今天的片，下次在 Café 說。」），下一次在 Café 點餐前她一句 */
  z11:'上次那部片。……結局我猜錯了。',
  /* Y5 說完 Y-L8 那一層以後的第二個週四 21:00 私訊（有 YT_TEN_MINUTES；那個週四店休往後延一週）；選項期限 21:40；「我過去。」＝21:50 到麵店門口 */
  y5:{msg:'今天我顧到打烊。',go:'我過去。',no:'今天不行。',noReply:'嗯。',scene:[{narr:'（你到的時候，她在拉鐵門。阿姨在裡面算錢。）'},'……你真的來了。']},
  /* Y8 之後第一次在麵店點餐（有 YT_BDAY_Y1、還沒演過）：阿姨請的那一顆滷蛋 */
  y8:[{narr:'（阿姨把一顆滷蛋放進你的碗裡。）'},{who:'阿姨',t:'生日那天說的。'}]
};
