/* ===== 以安、語彤交往中的節日・第一批：情人節（四年）、語彤的中秋（AA_414，企劃線 b1fc4bf30；AA-B 2026-10-23 定稿，D109）=====
   台詞照 AA_414 一字不改（ANYTHOL_LINES、ANYTHOL_EVENTS）。私訊、出遊、電話、沒來的那幾則的時間和條件在 src/an_yt_hol3d.js。
   做法照學姊的 S.HOL（src/sis_b4_3d.js）：前一天 21:00 她私訊約 → 回覆 → 出遊（OUT，不算正式校外約會、不進 dateLog）→ 那一場 → 答應了沒到＝她再傳。
   以安：1-1 ev_an_vday_y1（2026-02-14 14:00 開車去台中）　1-2 ev_an_vday_y2（2027-02-14 14:00 大安森林公園）
         1-3 ev_an_vday_y3（2028-02-14 14:00 總圖門口，記 AN_VDAY_GIFT：r2y3b_events.js 的 ev_an_white_day 讀它）　1-4 ev_an_vday_y4（2029-02-14 21:00 她打電話來，AA_296 演出來的電話）
   語彤：2-1 ev_yt_vday_y1（2026-02-14 17:00／幫忙掃 16:00 麵店門口 → 河濱）　2-2 ev_yt_vday_y2（2027-02-14 12:00 阿鳳麵店）
         2-3 ev_yt_vday_y3（2028-02-14 14:00 麵店門口 → 寶藏巖，沒有底圖）　2-4 ev_yt_vday_y4（2029-02-14 19:00 河濱）
         2-5 ev_yt_moon（中秋 2026-09-25、2027-09-15、2028-10-03 15:00～17:30 麵店門口；三年同一個事件，年份的句子用 if；
             CG cg_moon_pomelo_heroine03「月亮。」——CG_REGISTRY 登錄了才放（已經登錄的是同一張 cg_pomelo_moon_heroine03，也認），只放第一次去的那一年）
   AA_416（企劃線 ed80edb71）第 3、5 節：2/14 這幾場第 6 階（還沒交往）也演——第 6 階 +4／+5／+6、不動裂縫；1-4 電話「外婆家好玩嗎？」換第 6 階的兩句；
     1-1 台中那一場放 CG cg_valentine_taichung_heroine01；2029 電話多一個選項「我明天開車下去。」（還沒拿到 CG、沒去過 2026 台中的）→ 2/15 14:00 ev_an_vday_tc 照 1-1 演。
   關係（AA_414 檔頭，照學姊）：情人節 {fam:3,comf:6,npcRom:5}＋這學期的裂縫 -1（AA_126 情人節約會（交往中）那一列，同 SISB4.crackDown）、電話 {fam:2,comf:3,npcRom:3}、中秋 {fam:4,comf:4,npcRom:4}。
   測試：node tests/aa414_hol_unit.js */
'use strict';
const ANYTHOL_LINES={
  /* 1-1 以安・2026-02-12（四）21:00；回「在臺北。」＝2/14 20:00 照片；答應了沒到＝15:00、17:00 */
  an1Ask:['十四號那天，你在臺北嗎？'], an1YesT:'我去台中找妳。', an1Yes:['……好。','十四號下午兩點。我把我家附近那個公園的地址傳給你。','上午我陪我媽去市場，不要太早到。'], an1NoT:'在臺北。', an1No:['好。問問而已。'],
  an1NoPhoto:['（照片：夜市的烤玉米攤）','我媽說這一攤開了三十年。'], an1Miss1:['我在公園門口。兩點到現在。'], an1Miss2:['我回家了。你沒事就好。'],
  /* 1-2 以安・2027-02-12（五）21:00；第二個回覆照 2026 有沒有去台中分兩版；沒來＝14:40、16:30 */
  an2Ask:['十四號我上去臺北一天。','下午兩點，大安森林公園的捷運站出口。我坐五點的高鐵回台中。'], an2YesT:'好。', an2Yes:['我五點要走。……所以不要遲到。'],
  an2WhyT:'妳特地上來？', an2WhyWent:['嗯。去年你來了。','今年換我。'], an2Why:['……嗯。我想上來。'], an2NoT:'那天我不行。', an2No:['好。那開學見。'],
  an2Miss1:['我在出口。'], an2Miss2:['我去搭車了。'],
  /* 1-3 以安・2028-02-13（日）21:00；沒來＝15:00、17:00 */
  an3Ask:['明天下午兩點，總圖門口。','寒假人少。我們走走就好。'], an3YesT:'好。', an3Yes:['嗯。不要遲到。'], an3NoT:'明天我不行。', an3No:['好。那三月再說。'],
  an3Miss1:['我在總圖門口。'], an3Miss2:['我先回去了。行李還沒收。'],
  /* 1-4 以安・2029-02-14（三，初二）21:00 電話；21:15 以前沒接＝21:30、21:31 */
  an4Miss1:['打給你，沒接。'], an4Miss2:['外婆家很吵。明天再說。'],
  /* 2-1 語彤・2026-02-13（五）21:00；沒來＝17:30、19:00 */
  /* AA_630 第 10 節第 4 點：2026-02-14（寒假，她在淡水）這一年拿掉——表留著（舊存檔讀得到），S.HOL 這一場 off */
  yt1Ask:['明天下午我回來上班。','五點下班。……之後可以。'], yt1YesT:'五點，茶屋門口。', yt1Yes:['嗯。'], yt1HelpT:'我早點去等妳。', yt1Help:['蘇姨會一直看你。','四點。坐吧檯旁邊。'], yt1NoT:'明天不行。', yt1No:['嗯。沒關係。'],
  yt1Miss1:['（照片：茶屋門口的燈，關了一半）'], yt1Miss2:['我回家了。'],
  /* 2-2 語彤・2027-02-13（六）21:00；沒來＝18:00、18:01（AA_630 H-007～H-010：她 2/14（日）13～17 有班；D＝交往中、N＝沒交往，an_yt_hol3d.js 照 dating 挑）*/
  yt2AskD:['明天我五點下班。','秀琴姨放假，我煮。你要不要來吃。'], yt2AskN:['明天我五點下班。','要不要一起走一段。'], yt2YesT:'好。', yt2Yes:['嗯。'], yt2WhyT:'不去別的地方？', yt2WhyD:['家裡就好。今天外面人多，我會累。'], yt2WhyN:['走走就好。今天外面人多，我會累。'], yt2NoT:'明天不行。', yt2No:['嗯。'],
  yt2Miss1D:['（照片：桌上兩副碗筷，一鍋湯）'], yt2Miss1N:['（照片：茶屋門口的路燈）'], yt2Miss2D:['湯我留著。'], yt2Miss2N:['我先回去了。'],
  /* 2-3 語彤・2028-02-13（日）21:00；沒來＝15:00、15:01 */
  yt3Ask:['明天下午有空嗎','想帶你去一個地方'], yt3YesT:'好。去哪裡？', yt3Yes:['去了就知道。','兩點，校門口。走過去。'], yt3NoT:'明天不行。', yt3No:['嗯。下次。'],
  yt3Miss1:['（照片：一張空的塑膠椅）'], yt3Miss2:['下次。'],
  /* 2-4 語彤・2029-02-13（二，初一）21:00；沒來＝19:30、19:31（AA_630 H-012：過年她在淡水，晚上回台北；D＝交往中、N＝沒交往）*/
  yt4AskD:['明天晚上我回台北。','七點。……來我家。'], yt4AskN:['明天晚上我回台北。','七點，我家樓下。有東西給你。'], yt4YesT:'好。', yt4Yes:['嗯。'], yt4NoT:'明天不行。', yt4No:['嗯。'],
  yt4Miss1:['（照片：一袋年糕）'], yt4Miss2:['放冰箱了。開學給你。'],
  /* 2-5 語彤・中秋前一天 21:00；沒來＝17:30（AA_630 H-014：烤肉在河濱 19:00，她先去占位子，16:30 起）*/
  moonAsk:['明天烤肉 明軒叫我先去河濱占位子','你要不要一起'], moonYesT:'好。', moonYes:['嗯。四點半，河濱見。']   /* AA 11-03 回 LAWWW（AA_630 H-014 那一場改 16:30）*/, moonNoT:'明天不行。', moonNo:['嗯。晚上烤肉見。'],
  moonMiss:['（照片：剝好的柚子，放在塑膠椅上）'],
  /* 第 3 節 桌遊團群組（2027-02-14（日）21:00，在群組的玩家都看得到，一次）：[說話的人, 句子] */
  grp:[['zhe','今天情人節 我在高雄'],['zhe','跟 Alison 視訊了兩個小時'],   /* AA_446 第 5 節：阿哲寒假都在高雄 */
    ['yu','你不用跟大家報告！！'],['zhe','我要讓大家知道']] };
const ANYTHOL_EVENTS=(function(){
  const AN='heroine_01', YT='heroine_03';
  const A=t=>({speaker:AN,text:t}), Y=t=>({speaker:YT,text:t}), N=t=>({speaker:null,text:t}), SU=t=>({speaker:'蘇姨',text:t});   /* AA_630 H-015 */
  const X=()=>typeof ANYTHOL!=='undefined'?ANYTHOL:null;
  const BG=k=>typeof OUT!=='undefined'&&OUT.bg?OUT.bg(k):'dark';   /* 開場的底圖（稿沒有地點字幕的那幾場）：事件的 background 讀 OUT.BG（getter：圖後來才登錄也拿得到）*/
  const yr=G=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day).y:null;
  const hasCG=id=>typeof CG_REGISTRY!=='undefined'&&!!CG_REGISTRY[id];
  const VDAY={fam:3,comf:6,npcRom:5}, VDAY6={fam:4,comf:5,npcRom:6}, CALL={fam:2,comf:3,npcRom:3}, MOON={fam:4,comf:4,npcRom:4};   /* VDAY6：第 6 階、還沒交往的情人節（AA_416 1-7）*/
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=(F.romance||{})[id]; return F['dating_'+id]===true||!!(R&&R.status==='dating'); };
  const end=(id,flag,v,tag,rel)=>({set:{[flag]:v},mem:tag?[{npc:id,tag,note:''}]:undefined,rel:{[id]:rel}});
  /* 情人節那幾場（AA_416 第 3、5 節：第 6 階也演）：交往中 +3／+6／+5，第 6 階 +4／+5／+6 */
  const endV=(id,flag,v,tag)=>[{set:{[flag]:v},mem:tag?[{npc:id,tag,note:''}]:undefined},{if:{custom:G=>dating(G,id)},rel:{[id]:VDAY}},{unless:{custom:G=>dating(G,id)},rel:{[id]:VDAY6}}];
  const crack=id=>G=>{ const x=X(); if(x&&x.crackDown&&dating(G,id)) x.crackDown(G,id); };   /* 情人節（交往中）：這學期的裂縫 -1（已經是 0 不動）*/
  const missed=(G,GM,q)=>{ const x=X(); if(x) x.missed(G,q); };   /* 答應了沒到、電話沒接（OUT 的 outingMissed）*/
  const help=G=>!!(G&&G.flags&&G.flags.YT_VDAY_Y1_HELP);
  /* 中秋：第一次去的那一年才放 CG（之前任何一年 YT_MOON_<年> 是 went＝不是第一次）*/
  const moonCG=()=>hasCG('cg_moon_pomelo_heroine03')?'cg_moon_pomelo_heroine03':(hasCG('cg_pomelo_moon_heroine03')?'cg_pomelo_moon_heroine03':null);   /* 稿的代號；CG_REGISTRY 已經登錄的是 cg_pomelo_moon_heroine03（BB 通過的 CG-25 語彤中秋，同一張）*/
  const moonFirst=G=>{ const F=(G&&G.flags)||{}; return !Object.keys(F).some(k=>/^YT_MOON_\d{4}$/.test(k)&&F[k]==='went'); };
  /* 1-1 台中那一場（2026-02-14；AA_416 第 3 節 2029 補救那一場照演）：CG cg_valentine_taichung_heroine01（AA_416 1-9：第一次符合條件、她在台中的那一年；CG_REGISTRY 有登錄才放，放了記 AN_VDAY_CG）*/
  const TC_CG='cg_valentine_taichung_heroine01';
  const TC=tail=>[ {scene:'台中・公園門口',bg:'tc_park'},
        N('（她站在公園門口，圍巾圍到下巴。看到你下車，先看了一下手錶。）'),
        A('你出門的時候傳了訊息。我算你兩點到。'),
        A('開了兩個多小時，就為了這個？你可以不用來的。'),
        {choice:[{text:'「我想來。」',goto:'a'},{text:'「路上不塞。」',goto:'b'}]},
        {label:'a'},A('……嗯。'),N('（她把圍巾拉下來一點。）'),{goto:'c'},
        {label:'b'},A('不是塞不塞的問題。'),N('（她看了你一下，沒有再說。）'),
        {label:'c'},{scene:'台中・公園',bg:'tc_park'},
        N('（公園裡只有幾個遛狗的人。你們走了兩圈。她一直在講寒假讀的公司法，講到一半停下來。）'),
        A('我在講公司法。今天是情人節。'),
        A('……算了，我繼續講。'),
        N('（傍晚，她送你到車子旁邊。你要上車的時候，她把一個紙袋塞給你。）'),
        {if:{custom:G=>hasCG(TC_CG)&&!(G.flags&&G.flags.AN_VDAY_CG)},cg:TC_CG},{if:{custom:G=>hasCG(TC_CG)},set:{AN_VDAY_CG:true}},   /* BB_241 第四節（4fb22b51b）：圖是黃昏、車子旁邊＝放在這一拍（原本在 14:00 公園門口，時間地點對不上）*/
        A('回去再打開。開車不要看手機。'),
        {scene:'國道・休息站',bg:'car_night'},
        N('（休息站，你打開紙袋。是一盒太陽餅，盒子上貼著一張便利貼，寫著你的名字。）')].concat(tail);
  /* 2029 那通電話的 CG 補救（AA_416 第 3 節）：還沒拿到台中那張 CG（AN_VDAY_CG）、也沒去過 2026 台中那一場的玩家才有這個選項 */
  const rescueOk=G=>{ const F=(G&&G.flags)||{}; return !F.AN_VDAY_CG&&F.AN_VDAY_Y1!=='went'; };
  return [
    /* ---------- 1-1 2026-02-14（六）14:00 台中・她家附近的公園門口（開車去：先回家取車，src/an_yt_hol3d.js S.drive）；背景 car_morning → tc_park → car_night ---------- */
    { id:'ev_an_vday_y1', title:'情人節', participants:[AN], location:'any', trigger:'outing', once:true, get background(){ return BG('car_morning'); }, hours:6,   /* 14:00 到、傍晚上車、開回臺北再把車開回家（兩個半小時＋30 分）*/
      dialogue:TC([...endV(AN,'AN_VDAY_Y1','went','AN_VDAY_TC')]),
      beforeOuting:(G,GM,q)=>{ const x=X(); if(x) x.payDrive(G,GM,q); },   /* 油錢＋過路費（date3d.js 地點表 D26 開車的來回），出發的時候付 */
      after:crack(AN), outingMissed:missed },
    /* ---------- AA_416 第 3 節：2/14 的 CG 補救（2029-02-15（四，初三）14:00，2029 那通電話選「我明天開車下去。」）：照 1-1 台中那一場，放 CG ---------- */
    { id:'ev_an_vday_tc', title:'台中', participants:[AN], location:'any', trigger:'outing', once:true, get background(){ return BG('car_morning'); }, hours:5,   /* 她只能出來兩個小時＋開回臺北再把車開回家 */
      dialogue:TC([...endV(AN,'AN_VDAY_Y4B','went','AN_VDAY_TC')]),
      beforeOuting:(G,GM,q)=>{ const x=X(); if(x) x.payDrive(G,GM,q); },
      after:crack(AN), outingMissed:missed },
    /* ---------- 1-2 2027-02-14（日）14:00 大安森林公園（她從台中上來一天）---------- */
    { id:'ev_an_vday_y2', title:'情人節', participants:[AN], location:'any', trigger:'outing', once:true, get background(){ return BG('daan_park'); }, hours:2.5,   /* 走到四點半她去搭車 */
      dialogue:[
        N('（她從東京回來兩個禮拜了。手上提著一個紙袋，上面都是日文。）'),
        A('東京買的。你猜。'),
        {choice:[{text:'「御守。」',goto:'a'},{text:'「巧克力。」',goto:'b'}]},
        {label:'a'},A('……你怎麼知道。'),{goto:'c'},
        {label:'b'},A('巧克力太簡單了。'),N('（她從紙袋裡拿出一個學業御守。）'),
        {label:'c'},A('你今年要考很多試。'),
        N('（你們在公園裡走了兩個多小時。她看了兩次手錶，第三次沒有看。）'),
        A('四點半了。我要去搭車。'),
        A('下次換你來。'),
        ...endV(AN,'AN_VDAY_Y2','went','AN_VDAY_OMAMORI') ],
      after:crack(AN), outingMissed:missed },
    /* ---------- 1-3 2028-02-14（一）14:00 總圖門口 → 椰林大道（去日本以前；記 AN_VDAY_GIFT：3/14 ev_an_white_day 演「一個月前你送的」那一版）---------- */
    { id:'ev_an_vday_y3', title:'情人節', participants:[AN], location:'any', trigger:'outing', once:true, get background(){ return BG('ntu_avenue'); }, hours:1.5,
      dialogue:[
        N('（寒假的椰影大道，腳踏車比平常少一半。）'),
        A('再一個多月就去日本了。'),
        A('行李我列好了。衣服帶太少，書帶太多。'),
        {choice:[{text:'（給她一支鋼筆）',set:{AN_VDAY_GIFT:'pen'},mem:[{npc:AN,tag:'AN_VDAY_PEN',note:''}],goto:'a'},{text:'（給她一盒巧克力）',set:{AN_VDAY_GIFT:'choco'},mem:[{npc:AN,tag:'AN_VDAY_CHOCO',note:''}],goto:'b'}]},
        {label:'a'},A('……你知道我的筆快沒水了。'),A('去日本帶這支。'),{goto:'c'},
        {label:'b'},A('……好。'),N('（她當場拆開，吃了一顆。）'),A('我以為我會留到日本再吃。'),
        {label:'c'},A('三月十四號那天，你不要排別的。'),
        ...endV(AN,'AN_VDAY_Y3','went',null) ],
      after:crack(AN), outingMissed:missed },
    /* ---------- 1-4 2029-02-14（三，初二）21:00 她打電話來（台中外婆家；AA_296 演出來的電話＝{scene:'電話'}）---------- */
    { id:'ev_an_vday_y4', title:'情人節', participants:[AN], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
      dialogue:[ {scene:'電話'},
        N('（電話。那頭很吵，有人在喊「碰」。）'),
        A('今天初二。我在外婆家。'),
        A('十幾個人在客廳打牌。我躲到陽台。'),
        A('……今天是情人節。我記得。'),
        {choice:[{text:'「十八號回來？」',goto:'a'},{text:'「外婆家好玩嗎？」',goto:'b'},{text:'「我明天開車下去。」',if:{custom:rescueOk},set:{AN_VDAY_RESCUE:true},goto:'r'}]},   /* AA_416 第 3 節：CG 補救的選項 */
        {label:'a'},A('十八號。高鐵三點到臺北。'),A('我只是跟你說一聲。'),{goto:'c'},
        {label:'b'},{if:{custom:G=>dating(G,AN)},speaker:AN,text:'表妹問我有沒有男朋友。我說有。'},{if:{custom:G=>dating(G,AN)},speaker:AN,text:'她問了二十分鐘。'},
        {unless:{custom:G=>dating(G,AN)},speaker:AN,text:'表妹問我有沒有男朋友。我說沒有。'},{unless:{custom:G=>dating(G,AN)},speaker:AN,text:'她說那就是快有了。'},{goto:'c'},   /* AA_416 第 3 節：第 6 階的換字 */
        {label:'r'},A('初三。下午兩點，公園門口。'),A('我只能出來兩個小時。'),
        {label:'c'},N('（那頭有人叫她的名字。）'),
        A('我要進去了。晚安。'),
        end(AN,'AN_VDAY_Y4','called','AN_VDAY_CALL',CALL) ],
      outingMissed:missed },
    /* ---------- 2-1 2026-02-14（六）17:00（幫忙掃 16:00）阿鳳麵店門口（店休、大掃除；noodle_closed3d.js）→ 河濱；背景 noodle_table → riverside ---------- */
    { id:'ev_yt_vday_y1', retired:true /* AA_630 第 10 節第 4 點：2026-02-14 這一年拿掉（寒假她在淡水）；定義留給舊存檔 */, title:'情人節', participants:[YT], location:'any', trigger:'outing', once:true, get background(){ return BG('noodle_table'); }, hours:1.5,   /* 17:00～18:30；幫忙的早一小時到（afterOuting 多推一小時）*/
      dialogue:[
        {if:{custom:help},speaker:null,text:'（鐵門拉下來一半。你彎腰鑽進去，語彤蹲在地上刷椅子腳。）'},
        {if:{custom:help},speaker:YT,text:'手套在那邊。'},
        {if:{custom:help},speaker:null,text:'（你們把最後幾張椅子刷完。阿姨從廚房出來，看了一下時鐘。）'},
        SU('今天情人節耶，你們兩個還在這裡。'),
        SU('去去去，去別的地方。店我來關。'),
        Y('阿姨叫我們去別的地方。'),
        {scene:'河濱',bg:'riverside'},
        N('（河濱的風很大。跑步的人一個一個從旁邊過去。）'),
        Y('我很少這個時間出來。平常這時候在店裡。'),
        {choice:[{text:'「冷嗎？」',goto:'a'}]},   /* AA_685 A3（企劃線 c96613e51，AA-C 定 D109）：「下次店休也出來。」那個選項拿掉（說了沒做到的約定不要開，AA_524）——它的兩句（「下次店休是明年。」「……那明年也出來。」）一起拿掉，
                                                     不再記 YT_CLOSED_OUT（AA_683 以後沒有人讀；舊存檔裡有的照留、不影響）*/
        {label:'a'},Y('……有一點。'),N('（她把手縮進袖子。你們又走了一段。）'),
        ...endV(YT,'YT_VDAY_Y1','went','YT_VDAY_RIVER') ],
      afterOuting:(G,GM,q)=>{ if(q&&q.help&&GM&&GM.advance) GM.advance(1); },
      after:crack(YT), outingMissed:missed },
    /* ---------- 2-2 2027-02-14（日）17:30（AA_630 H-017：她 13～17 在一盞茶屋有班；交往中＝她家（秀琴姨放假、她自己煮）、還沒交往＝茶屋下班一起走新生南路）---------- */
    { id:'ev_yt_vday_y2', title:'情人節', participants:[YT], location:'any', trigger:'outing', once:true, get background(){ return BG('dark'); }, hours:1.5,
      dialogue:[
        /* 交往中但還沒去過她家（YT_HOME_SEEN）：這一場就是第一次去她家——開頭多一句、記 YT_HOME_SEEN */
        {if:{custom:G=>dating(G,YT)&&!(G.flags&&G.flags.YT_HOME_SEEN)},speaker:null,text:'（新生南路、學校對面的大樓。電梯到七樓。兩房一廳。）',set:{YT_HOME_SEEN:true}},
        {if:{custom:G=>dating(G,YT)},scene:'她家',bg:'dark'},
        {if:{custom:G=>dating(G,YT)},speaker:null,text:'（她家。餐桌上擺了兩副碗筷，一鍋湯還在冒煙。）'},
        {if:{custom:G=>dating(G,YT)},speaker:YT,text:'秀琴姨今天放假。……她教了我一個禮拜。'},
        {if:{custom:G=>dating(G,YT)},speaker:YT,text:'只會這一道。'},
        {if:{custom:G=>dating(G,YT)},choice:[{text:'「謝謝。」',goto:'a'},{text:'（先喝）',goto:'b'}]},
        {unless:{custom:G=>dating(G,YT)},goto:'n'},
        {label:'a'},Y('先喝再謝。'),{goto:'c'},
        {label:'b'},N('（你們吃得很慢。語彤一直沒有看手機。）'),
        {label:'c'},Y('下班的時候，蘇姨問我要去哪裡。'),
        Y('……我說回家煮飯。她笑了很久。'),{goto:'e'},
        {label:'n'},{scene:'新生南路',bg:'dark'},
        N('（茶屋下班。你們沿著新生南路走，路邊的店都貼了紅色的情人節海報。）'),
        Y('蘇姨叫我早點走。……她說今天情人節。'),
        {choice:[{text:'「替我謝謝蘇姨。」',goto:'na'},{text:'（陪她走）',goto:'nb'}]},
        {label:'na'},Y('你下次自己謝。她會很得意。'),{goto:'nc'},
        {label:'nb'},N('（你們走得很慢。語彤一直沒有看手機。）'),
        {label:'nc'},Y('到了。……今天是我自己想走這段的。'),
        {label:'e'},
        ...endV(YT,'YT_VDAY_Y2','went','YT_VDAY_SHOP') ],
      after:crack(YT), outingMissed:missed },
    /* ---------- 2-3 2028-02-14（一）14:00 麵店門口 → 寶藏巖（底圖 treasure_hill：BB_132 第 100 組第 2 張，11-02 使用者生成）---------- */
    { id:'ev_yt_vday_y3', title:'情人節', participants:[YT], location:'any', trigger:'outing', once:true, get background(){ return BG('treasure_hill'); }, hours:2,
      dialogue:[ {scene:'寶藏巖',bg:'treasure_hill'},
        N('（河邊的老聚落，房子一層一層疊在山坡上。巷子窄到兩個人要側身才過得去。）'),
        Y('上學期的田野，我在這裡做訪談。'),
        Y('有一個阿公，每天下午坐在那張椅子上。他跟我講了三個下午。'),
        N('（她指的那張椅子是空的。）'),
        Y('……今天他不在。'),
        {choice:[{text:'「他講了什麼？」',goto:'a'},{text:'「為什麼帶我來？」',goto:'b'}]},
        {label:'a'},Y('他年輕的時候怎麼搬來的。'),Y('我寫了很多頁。報告只能用三頁。'),{goto:'c'},
        {label:'b'},Y('……我想讓你看一次。'),Y('我在做的事。'),
        {label:'c'},N('（下坡的時候，她走在前面。走到巷口，才回頭看你有沒有跟上。）'),
        ...endV(YT,'YT_VDAY_Y3','went','YT_VDAY_FIELD') ],
      after:crack(YT), outingMissed:missed },
    /* ---------- 2-4 2029-02-14（三，初二）19:00（AA_630 H-018：過年她在淡水，晚上帶年糕回台北；交往中＝她家、還沒交往＝她家大樓樓下）---------- */
    { id:'ev_yt_vday_y4', title:'情人節', participants:[YT], location:'any', trigger:'outing', once:true, get background(){ return BG('dark'); }, hours:1,
      dialogue:[
        {if:{custom:G=>dating(G,YT)},scene:'她家',bg:'dark'},
        {if:{custom:G=>dating(G,YT)},speaker:null,text:'（她家。廚房的燈亮著，平底鍋裡煎著兩片年糕。）'},
        {unless:{custom:G=>dating(G,YT)},scene:'新生南路・她家樓下',bg:'dark'},
        {unless:{custom:G=>dating(G,YT)},speaker:null,text:'（新生南路，她家大樓樓下。過年的街上很少車，警衛室的電視在播特別節目。）'},
        /* AA_524 Y4：2028 情人節她說「想帶你去一個地方」，拒絕（no）或答應了沒到（missed）的多三句（沒回 noreply 不算）*/
        {if:{flagIs:{YT_VDAY_Y3:['no','missed']}},speaker:YT,text:'去年想帶你去的那個地方，我後來自己去了。'},
        {if:{flagIs:{YT_VDAY_Y3:['no','missed']}},speaker:YT,text:'那張椅子還是空的。'},
        {if:{flagIs:{YT_VDAY_Y3:['no','missed']}},speaker:YT,text:'下次你要來。'},
        {if:{flagIs:{YT_VDAY_Y1:'went'}},speaker:YT,text:'上次跟你過情人節，是大一。'},   /* 舊存檔：2026 那一場（第 10 節第 4 點拿掉以前）去過的 */
        Y('我媽買的年糕。淡水那家老店，她每年都買。'),
        Y('我多拿了一袋。她問我要給誰。……我說給茶屋的同事。'),
        {choice:[{text:'「替我謝謝妳媽媽。」',goto:'a'},{text:'「同事？」',goto:'b'}]},
        {label:'a'},Y('不行。謝了她會問更多。'),{goto:'c'},
        {label:'b'},{if:{custom:G=>dating(G,YT)},speaker:YT,text:'……過完年我再跟她說。'},{unless:{custom:G=>dating(G,YT)},speaker:YT,text:'……本來就是。'},
        {label:'c'},N('（她把裝年糕的袋子交給你，手沒有馬上收回去。）'),
        ...endV(YT,'YT_VDAY_Y4','went','YT_VDAY_NIANGAO') ],
      after:crack(YT), outingMissed:missed },
    /* ---------- 2-5 中秋 16:30～18:50 河濱（AA_630 H-019：2026、2027、2028 同一個事件；她先去占位子、剝柚子，接 19:00 河濱烤肉 AA_623）---------- */
    { id:'ev_yt_moon', title:'中秋', participants:[YT], location:'any', trigger:'outing', get background(){ return BG('riverside'); }, hours:2.3,   /* 每年都演（不設 once）*/
      dialogue:[ {scene:'河濱',bg:'riverside'},
        N('（河濱的草地，烤肉的人還沒到。語彤鋪了一塊野餐墊，說明軒叫她先來占位子。）'),
        N('（她從背包拿出兩張摺疊椅，腿上放著一顆柚子。）'),
        Y('你會剝嗎？'),
        {choice:[{text:'「會。」',goto:'a'},{text:'「不會。」',goto:'b'}]},
        {label:'a'},N('（你剝了一半，皮斷成好幾塊。）'),Y('我來。'),{goto:'c'},
        {label:'b'},Y('看。'),N('（她用指甲在柚子頂上劃了一圈，整片皮完整地剝了下來。）'),
        {label:'c'},N('（她把剝好的一瓣放到你手上。旁邊那一攤已經開始生火，煙飄過來。）'),
        {if:{custom:G=>yr(G)===2027},speaker:YT,text:'今天以安生日。這顆柚子，等一下給她。'},   /* 2027 年多一句（也是以安的生日，group3d.js 1C-02）*/
        {if:{custom:G=>yr(G)===2028},speaker:'classmate_mingxuan',name:'明軒（提著烤肉架走過來）',text:'明年你們還來不來占位子？'},   /* 2028 年多兩句（AA_630 H-015：說話人改明軒）*/
        {if:{custom:G=>yr(G)===2028},speaker:YT,text:'來啊。'},
        N('（快七點的時候，語彤忽然抬頭。）'),
        {if:{custom:G=>moonFirst(G)&&!!moonCG()},get cg(){ return moonCG(); }},   /* 「月亮。」那一句放 CG（照原本的構圖；登錄進 adv3d.js 的 CG_REGISTRY 才放）*/
        Y('……欸。月亮。'),
        N('（對岸的樓頂上，月亮剛出來，還是淡淡的白色。）'),
        Y('明軒他們到了。……走吧。'),
        {call:G=>{ const x=X(); if(x) x.moonWent(G); }},   /* YT_MOON_<年> went、記憶 YT_MOON（一次）、{fam:4,comf:4,npcRom:4} */
        {rel:{[YT]:MOON}} ],
      outingMissed:missed } ];
})();
for(const e of ANYTHOL_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
