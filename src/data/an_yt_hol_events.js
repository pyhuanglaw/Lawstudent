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
  an1Ask:['十四號那天，你在臺北嗎？'], an1YesT:'我去台中找妳。', an1Yes:['……好。','十四號下午兩點。我把我家附近那個公園的地址傳給你。','上午我陪我媽去市場，不要太早到。'], an1NoT:'在臺北。', an1No:['好。我只是問問。'],
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
  yt1Ask:['明天店休。','下午大掃除。……五點以後可以。'], yt1YesT:'五點，麵店門口。', yt1Yes:['嗯。'], yt1HelpT:'我去幫忙掃。', yt1Help:['……阿姨會很高興。','四點。穿舊衣服。'], yt1NoT:'明天不行。', yt1No:['嗯。沒關係。'],
  yt1Miss1:['（照片：拉下來的鐵門）'], yt1Miss2:['我回家了。'],
  /* 2-2 語彤・2027-02-13（六）21:00；沒來＝13:00、13:01 */
  yt2Ask:['明天中午，麵店。','我沒班。'], yt2YesT:'好。', yt2Yes:['嗯。'], yt2WhyT:'不去別的地方？', yt2Why:['……麵店就好。今天外面人多，我會累。'], yt2NoT:'明天不行。', yt2No:['嗯。'],
  yt2Miss1:['（照片：桌上兩碗麵、兩顆滷蛋）'], yt2Miss2:['阿姨說留到兩點。'],
  /* 2-3 語彤・2028-02-13（日）21:00；沒來＝15:00、15:01 */
  yt3Ask:['明天下午有空嗎','想帶你去一個地方'], yt3YesT:'好。去哪裡？', yt3Yes:['去了就知道。','兩點，麵店門口。走過去。'], yt3NoT:'明天不行。', yt3No:['嗯。下次。'],
  yt3Miss1:['（照片：一張空的塑膠椅）'], yt3Miss2:['下次。'],
  /* 2-4 語彤・2029-02-13（二，初一）21:00；沒來＝19:30、19:31 */
  yt4Ask:['明天晚上，河濱。','七點。'], yt4YesT:'好。', yt4Yes:['嗯。'], yt4NoT:'明天不行。', yt4No:['嗯。'],
  yt4Miss1:['（照片：一袋年糕）'], yt4Miss2:['初四來店裡拿。'],
  /* 2-5 語彤・中秋前一天 21:00；沒來＝16:00 */
  moonAsk:['明天麵店三點收','……阿姨說你可以來'], moonYesT:'好。', moonYes:['嗯。三點。'], moonNoT:'明天不行。', moonNo:['嗯。晚上烤肉見。'],
  moonMiss:['（照片：剝好的柚子，放在塑膠椅上）'],
  /* 第 3 節 麵店團群組（2027-02-14（日）21:00，在群組的玩家都看得到，一次）：[說話的人, 句子] */
  grp:[['zhe','今天情人節 我在高雄'],['zhe','跟 Alison 視訊了兩個小時'],   /* AA_446 第 5 節：阿哲寒假都在高雄 */
    ['yu','你不用跟大家報告！！'],['zhe','我要讓大家知道']] };
const ANYTHOL_EVENTS=(function(){
  const AN='heroine_01', YT='heroine_03';
  const A=t=>({speaker:AN,text:t}), Y=t=>({speaker:YT,text:t}), N=t=>({speaker:null,text:t}), AY=t=>({speaker:'阿姨',text:t});
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
        {if:{custom:G=>hasCG(TC_CG)&&!(G.flags&&G.flags.AN_VDAY_CG)},cg:TC_CG},{if:{custom:G=>hasCG(TC_CG)},set:{AN_VDAY_CG:true}},   /* 「開了兩個多小時，就為了這個？」那一拍 */
        A('開了兩個多小時，就為了這個？……你可以不用來的。'),
        {choice:[{text:'「我想來。」',goto:'a'},{text:'「路上不塞。」',goto:'b'}]},
        {label:'a'},A('……嗯。'),N('（她把圍巾拉下來一點。）'),{goto:'c'},
        {label:'b'},A('不是塞不塞的問題。'),N('（她看了你一下，沒有再說。）'),
        {label:'c'},{scene:'台中・公園',bg:'tc_park'},
        N('（公園裡只有幾個遛狗的人。你們走了兩圈。她一直在講寒假讀的公司法，講到一半停下來。）'),
        A('我在講公司法。今天是情人節。'),
        A('……你不要笑。'),
        N('（傍晚，她送你到車子旁邊。你要上車的時候，她把一個紙袋塞給你。）'),
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
        A('……下次換你來。'),
        ...endV(AN,'AN_VDAY_Y2','went','AN_VDAY_OMAMORI') ],
      after:crack(AN), outingMissed:missed },
    /* ---------- 1-3 2028-02-14（一）14:00 總圖門口 → 椰林大道（去日本以前；記 AN_VDAY_GIFT：3/14 ev_an_white_day 演「一個月前你送的」那一版）---------- */
    { id:'ev_an_vday_y3', title:'情人節', participants:[AN], location:'any', trigger:'outing', once:true, get background(){ return BG('ntu_avenue'); }, hours:1.5,
      dialogue:[
        N('（寒假的椰林大道，腳踏車比平常少一半。）'),
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
        {label:'a'},A('十八號。高鐵三點到臺北。'),A('……我只是跟你說一聲。'),{goto:'c'},
        {label:'b'},{if:{custom:G=>dating(G,AN)},speaker:AN,text:'表妹問我男朋友是誰。我說你不認識。'},{if:{custom:G=>dating(G,AN)},speaker:AN,text:'……她說那就是有。'},
        {unless:{custom:G=>dating(G,AN)},speaker:AN,text:'表妹問我有沒有男朋友。我說沒有。'},{unless:{custom:G=>dating(G,AN)},speaker:AN,text:'……她說那就是快有了。'},{goto:'c'},   /* AA_416 第 3 節：第 6 階的換字 */
        {label:'r'},A('……初三。下午兩點，公園門口。'),A('我只能出來兩個小時。'),
        {label:'c'},N('（那頭有人叫她的名字。）'),
        A('我要進去了。……晚安。'),
        end(AN,'AN_VDAY_Y4','called','AN_VDAY_CALL',CALL) ],
      outingMissed:missed },
    /* ---------- 2-1 2026-02-14（六）17:00（幫忙掃 16:00）阿鳳麵店門口（店休、大掃除；noodle_closed3d.js）→ 河濱；背景 noodle_table → riverside ---------- */
    { id:'ev_yt_vday_y1', title:'情人節', participants:[YT], location:'any', trigger:'outing', once:true, get background(){ return BG('noodle_table'); }, hours:1.5,   /* 17:00～18:30；幫忙的早一小時到（afterOuting 多推一小時）*/
      dialogue:[
        {if:{custom:help},speaker:null,text:'（鐵門拉下來一半。你彎腰鑽進去，語彤蹲在地上刷椅子腳。）'},
        {if:{custom:help},speaker:YT,text:'手套在那邊。'},
        {if:{custom:help},speaker:null,text:'（你們把最後幾張椅子刷完。阿姨從廚房出來，看了一下時鐘。）'},
        AY('今天情人節耶，你們兩個還在這裡。'),
        AY('去去去，去別的地方。店我來關。'),
        Y('……阿姨叫我們去別的地方。'),
        {scene:'河濱',bg:'riverside'},
        N('（河濱的風很大。跑步的人一個一個從旁邊過去。）'),
        Y('我很少這個時間出來。平常這時候在店裡。'),
        {choice:[{text:'「冷嗎？」',goto:'a'},{text:'「下次店休也出來。」',set:{YT_CLOSED_OUT:true},goto:'b'}]},   /* AA_524 Y3：記 YT_CLOSED_OUT（2027 店休刷椅子腳那一場讀，noodle_closed3d.js）*/
        {label:'a'},Y('……有一點。'),N('（她把手縮進袖子。你們又走了一段。）'),{goto:'c'},
        {label:'b'},Y('下次店休是明年。'),Y('……那明年也出來。'),
        {label:'c'},...endV(YT,'YT_VDAY_Y1','went','YT_VDAY_RIVER') ],
      afterOuting:(G,GM,q)=>{ if(q&&q.help&&GM&&GM.advance) GM.advance(1); },
      after:crack(YT), outingMissed:missed },
    /* ---------- 2-2 2027-02-14（日）12:00 阿鳳麵店（最裡面靠窗那一桌：noodle_table_window；在麵店，不是校外約會）---------- */
    { id:'ev_yt_vday_y2', title:'情人節', participants:[YT], location:'any', trigger:'outing', once:true, get background(){ return BG('noodle_table_window'); }, hours:1.5,
      dialogue:[
        N('（麵店門口貼了一張紅紙，是阿姨的字：「情人節：兩碗乾麵，送一顆滷蛋」。）'),
        Y('阿姨自己寫的。……我叫她不要貼。'),
        N('（店裡坐滿了。阿姨把最裡面靠窗的那一桌留給你們，桌上已經放了兩顆滷蛋。）'),
        AY('送的。一人一顆。不是一桌一顆。'),
        Y('……阿姨。'),
        {choice:[{text:'「謝謝阿姨。」',goto:'a'},{text:'（先吃）',goto:'b'}]},
        {label:'a'},AY('謝什麼。吃。'),{goto:'c'},
        {label:'b'},N('（你們吃得很慢。語彤一直沒有看手機。）'),
        {label:'c'},Y('今天我沒班。'),
        Y('……是我自己想在這裡吃的。'),
        ...endV(YT,'YT_VDAY_Y2','went','YT_VDAY_SHOP') ],
      after:crack(YT), outingMissed:missed },
    /* ---------- 2-3 2028-02-14（一）14:00 麵店門口 → 寶藏巖（沒有底圖：深色底＋地點字幕）---------- */
    { id:'ev_yt_vday_y3', title:'情人節', participants:[YT], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'寶藏巖',bg:'dark'},
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
    /* ---------- 2-4 2029-02-14（三，初二）19:00 河濱（店休；背景 riverside 晚上）---------- */
    { id:'ev_yt_vday_y4', title:'情人節', participants:[YT], location:'any', trigger:'outing', once:true, get background(){ return BG('riverside'); }, hours:1,
      dialogue:[
        N('（過年的河濱，跑步的人比平常少。對岸的燈一排一排亮著。）'),
        /* AA_524 Y4：2028 情人節她說「想帶你去一個地方」，拒絕（no）或答應了沒到（missed）的——第一句旁白之後多三句（沒回 noreply 不算）*/
        {if:{flagIs:{YT_VDAY_Y3:['no','missed']}},speaker:YT,text:'（指了一下對岸）去年想帶你去的地方，在那邊。'},
        {if:{flagIs:{YT_VDAY_Y3:['no','missed']}},speaker:YT,text:'山坡上那一排房子。'},
        {if:{flagIs:{YT_VDAY_Y3:['no','missed']}},speaker:YT,text:'……今年從這裡看就好。'},
        {if:{flagIs:{YT_VDAY_Y1:'went'}},speaker:YT,text:'上次店休碰到情人節，是大一。'},   /* 2026 有去河濱的多一句 */
        Y('阿姨叫我拿年糕給你。'),
        Y('她說你太瘦了。'),
        {choice:[{text:'「替我謝謝阿姨。」',goto:'a'},{text:'「妳也很瘦。」',goto:'b'}]},
        {label:'a'},Y('你自己謝。初四開門，你來。'),{goto:'c'},
        {label:'b'},Y('……我吃很多。只是你沒看到。'),
        {label:'c'},N('（她把裝年糕的袋子交給你，手沒有馬上收回去。）'),
        ...endV(YT,'YT_VDAY_Y4','went','YT_VDAY_NIANGAO') ],
      after:crack(YT), outingMissed:missed },
    /* ---------- 2-5 中秋 15:00～17:30 阿鳳麵店門口（2026、2027、2028 同一個事件；17:30 結束，接 18:00 麵店團的烤肉）---------- */
    { id:'ev_yt_moon', title:'中秋', participants:[YT], location:'any', trigger:'outing', get background(){ return BG('noodle_table'); }, hours:2.5,   /* 每年都演（不設 once）*/
      dialogue:[
        N('（麵店三點就收了。阿姨在裡面準備晚上烤肉的東西，叫你們去外面坐。）'),
        N('（語彤搬了兩張塑膠椅到店門口，腿上放著一顆柚子。）'),
        Y('你會剝嗎？'),
        {choice:[{text:'「會。」',goto:'a'},{text:'「不會。」',goto:'b'}]},
        {label:'a'},N('（你剝了一半，皮斷成好幾塊。）'),Y('……我來。'),{goto:'c'},
        {label:'b'},Y('看。'),N('（她用指甲在柚子頂上劃了一圈，整片皮完整地剝了下來。）'),
        {label:'c'},N('（她把剝好的一瓣放到你手上。巷口開始有人在烤肉，煙飄過來。）'),
        {if:{custom:G=>yr(G)===2027},speaker:YT,text:'今天以安生日。這顆柚子，晚上帶去。'},   /* 2027 年多一句（也是以安的生日，group3d.js 1C-02）*/
        {if:{custom:G=>yr(G)===2028},speaker:'阿姨',name:'阿姨（從店裡）',text:'明年你們還來不來剝？'},   /* 2028 年多兩句 */
        {if:{custom:G=>yr(G)===2028},speaker:YT,text:'……來啊。'},
        N('（快五點半的時候，語彤忽然抬頭。）'),
        {if:{custom:G=>moonFirst(G)&&!!moonCG()},get cg(){ return moonCG(); }},   /* 「月亮。」那一句放 CG（標題「月亮。」，BB-B 畫；登錄進 adv3d.js 的 CG_REGISTRY 才放）*/
        Y('……欸。月亮。'),
        N('（東邊的樓頂上，月亮剛出來，還是淡淡的白色。）'),
        Y('阿哲在群組叫了。……走吧。'),
        {call:G=>{ const x=X(); if(x) x.moonWent(G); }},   /* YT_MOON_<年> went、記憶 YT_MOON（一次）、{fam:4,comf:4,npcRom:4} */
        {rel:{[YT]:MOON}} ],
      outingMissed:missed } ];
})();
for(const e of ANYTHOL_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
