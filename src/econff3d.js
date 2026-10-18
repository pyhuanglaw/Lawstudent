/* ===== 經濟系在學期間：事件接事件（D102；使用者 2026-10-18 06:0x 選擇題；規格 AA_292，企劃 98c0bfa1）=====
   使用者原話：「經濟系你現在安排是什麼？完全沒有朋友可約，為什麼要度過每一天」→ 選「事件接事件」、經濟系同學的邀約「不用」。
   - 範圍：9/2 E01 早上以後～10/17 便利貼（ev_y0_e30_note）。8/23 宿營開局、9/1 宿舍第一晚、9/2 早上照原本的流程；10/19 以後休學在家另一張表（等 AA）。
   - 玩家空下來 1.5 秒（沒有對話、沒有選單、沒坐著、手機沒開）就跳到下一個事件：黑幕 → 換時間（中間經濟系的課自動算出席，不發翹課訊息）
     → 換區域、站好 → 日期字卡（隔兩天以上多一句 AA_292 第 2 節的旁白）→ 演。
   - 「一定」的照時間帶過去；「條件」的用 EVENTS.check（或 prereq）判斷，不成立就跳下一個。出遊型（系烤、即興劇、聚會、車上）走 OUT.go。
   - 跳的途中手機規則照時間跑（每小時一次）；收到要回的訊息（可昕的邀約、群組問去不去）就停在那一刻、打開手機，回完再繼續。
   - 兩堂有劇情的課（9/5 會計第一堂 P1、9/9 第一次經原 E03）：帶到教室坐好、上課；講到話的同學（阿勳、韋綸、品妤、可昕）坐在附近。
   - 存檔：G.flags.ECONFF＝{done:{n:1}, lines:[用過的旁白]}；讀檔後從下一個沒做的接。網址加 ?nofastecon 關掉（測試舊流程用）。
   測試：node tests/econ_ff_unit.js */
'use strict';
const ECONFF=(()=>{
  const S={};
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id):null;
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const WD=['日','一','二','三','四','五','六'];
  const wdOf=d=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:0;
  /* AA_292 第 1 節（#1～#3 照原本的流程；手機那幾列在跳的途中照時間收；h≥24＝前一天的深夜，例 #25 10/15 24:30）*/
  S.STEPS=[
    {n:4, key:'2024-09-02',h:12.25,ev:'ev_y0_e02'},
    {n:5, key:'2024-09-05',cls:'acct_y0',with:['econ_zhengxun','econ_weilun','econ_pinyu','kexin']},
    {n:6, key:'2024-09-09',cls:'econ_principles_y0',with:['econ_zhengxun','kexin']},
    {n:'b1',key:'2024-09-13',h:19,ev:'ev_y0_e14'},   /* 保齡球搬到 9/13 第一次班聚（AA_293 4-1）*/
    {n:7, key:'2024-09-18',h:10,zone:'campus',at:{x:-3,z:12,yaw:0},ev:'ev_y0_e07'},
    {n:8, key:'2024-09-19',h:15.17,zone:'putong',ev:'ev_y0_p2'},
    {n:9, key:'2024-09-20',h:17,ev:'ev_y0_e05'},
    {n:12,key:'2024-09-21',h:17,ev:'ev_y0_e08'},
    {n:'t1',key:'2024-09-22',h:22+40/60,ev:'ev_y0_kt1'},
    {n:13,key:'2024-09-23',h:12.17,zone:'campus',ev:'ev_y0_e09'},
    {n:14,key:'2024-09-26',h:15.17,zone:'putong',ev:'ev_y0_p1b1',then:'ev_y0_p2'},
    {n:'t2',key:'2024-09-25',h:11+50/60,ev:'ev_y0_kt2'},
    {n:'t3',key:'2024-09-28',h:20.5,ev:'ev_y0_kt3'},
    {n:16,key:'2024-09-30',h:19,zone:'dorm',ev:'ev_y0_t0a'},
    {n:17,key:'2024-10-01',h:12.17,zone:'campus',ev:'ev_y0_t1'},
    {n:18,key:'2024-10-03',h:15.17,zone:'putong',ev:'ev_y0_p2'},
    {n:'t4',key:'2024-10-02',h:11+50/60,ev:'ev_y0_kt4'},
    {n:19,key:'2024-10-07',h:12,zone:'boya',ev:'ev_y0_p2b',then:'ev_y0_b2'},
    {n:'t5',key:'2024-10-09',h:23.5,zone:'dorm',at:{x:0,z:2.4,yaw:Math.PI},ev:'ev_y0_kt5'},
    {n:21,key:'2024-10-12',h:14,zone:'cafe',ev:'ev_y0_l5a'},
    {n:'t6',key:'2024-10-13',h:22.5,ev:'ev_y0_kt6'},
    {n:22,key:'2024-10-14',h:12,zone:'boya',ev:'ev_y0_p2b'},
    {n:23,key:'2024-10-15',h:19,ev:'ev_y0_gather'},
    {n:25,key:'2024-10-15',h:24.5,zone:'dorm',ev:'ev_y0_a1'},
    {n:26,key:'2024-10-16',h:19,zone:'library',ev:'ev_y0_e10',then:'ev_y0_e10b'},
    {n:27,key:'2024-10-17',h:14.67,ev:'ev_y0_e30'},
    {n:28,key:'2024-10-17',h:17.67,ev:'ev_y0_e26'},
    {n:29,key:'2024-10-17',h:22.5,zone:'dorm',ev:'ev_y0_e30_note'},
    {n:30,key:'2024-10-19',h:9,zone:'dorm',at:{x:0,z:2.4,yaw:Math.PI},ev:'ev_y0_a3'}];   /* 10/19 退宿（AA_292 第二張表 #1）：阿勳封箱、搬回臺北的家（HOME.moveOut）——2026-10-18 使用者「休學之後我還住在宿舍？之後沒有劇情」*/
  /* AA_292 第 2 節：兩個事件隔兩天以上，日期字卡下面一句（跳過的期間落在哪一段就用那一句；同一句不重複；只隔一天沒有）*/
  S.LINES=[['2024-09-03','2024-09-08','（課表貼在書桌前面。你還在記哪一間教室在哪一棟。）'],
           ['2024-09-10','2024-09-17','（博雅、普通、共同，三棟樓之間的路，你已經不用看地圖了。）'],
           ['2024-09-22','2024-09-25','（晚上十點半左右，手機常常會亮一下。）'],
           ['2024-09-27','2024-09-29','（教師節連假。你回臺北的家，帶了一袋要洗的衣服。）'],
           ['2024-10-02','2024-10-06','（中秋過了。宿舍走廊上，還有人在分沒吃完的月餅。）'],
           ['2024-10-08','2024-10-11','（期中考的範圍公布了。阿勳把考試日期寫在一張紙上，貼在桌前。）'],
           [null,null,'（這幾天都在上課。）']];
  S.rec=G=>{ const F=G.flags=G.flags||{}; const r=F.ECONFF=F.ECONFF||{}; r.done=r.done||{}; r.lines=r.lines||[]; return r; };
  /* ===== AA_300（使用者 10-18：「終於到法律系了，花了兩個半小時……每天一直按快轉」→ 選「縮到約 30 分鐘」「只留長場景」）=====
     經濟系那一年（9/2 早上以後）只停第 1 節的 29 場；其他事件不演、不停（EVENTS.check 擋、出遊不排）；跳過的日子只出一張日期卡＋第 4 節那一句。
     8/23 宿營、9/1 宿舍第一晚在 9/2 以前，照原本的流程。網址 ?nofastecon 關掉（舊流程）*/
  S.KEEP=new Set(['ev_y0_e14','ev_y0_e05','ev_y0_e08','ev_y0_l5a','ev_y0_gather','ev_y0_e30','ev_y0_e26','ev_y0_e30_note','ev_y0_a3',   /* 開學到休學 3～11 */
    'ev_y0_e12','ev_y0_e21a','ev_y0_e21','ev_y0_e21o','ev_y0_e23','ev_y0_e27','ev_y0_e27b',   /* 休學到寒假 12～17 */
    'ev_y0_kh3','ev_y0_e18b',   /* AA_303（使用者 10-18 逐場確認，取代 AA_300 的 29 場）：1/31～2/2 高雄三天兩夜、4/24 生日；R3 大安森林公園、R7 保齡球再戰拿掉 */
    'ev_y0_e35','ev_y0_e35h','ev_y0_exam1','ev_y0_exam1h','ev_y0_kh_bus','ev_y0_kh_bus_h','ev_y0_kh_home','ev_y0_kh_home_h','ev_y0_kh_call','ev_y0_kh_call_h',
    'ev_y0_e36r','ev_y0_e36rh','ev_y0_e36','ev_y0_e36h','ev_y0_e36n']);   /* 衝刺班到放榜 26～29（23～25 是 RH-C0、RH-C4、RH-L6）*/
  S.RH_PLAY=['RH-M0','RH-C0','RH-C4','RH-L6'];   /* AA_303：2/15 她住進來（RH-M0，等 AA 交 retake_home）、6/8 報名、6/24 笑出來、6/28 熱牛奶；RH-L1 洗碗、RH-L5 端午拿掉 */
  S.short=G=>!!G&&G.stage==='econ'&&!S.off()&&!!(G.flags&&G.flags.E01_MORNING)&&!G.flags.ECON_FULL;   /* ECON_FULL：測試用，照 AA_292 的完整版（舊流程的測試）*/
  /* AA_300 第 7 節（Q-AA300-INVITES）：不在 29 場裡的出遊，排它們的私訊、群組邀約整個不傳 */
  S.CUT_MSG=['y0_kx_essay3',   /* AA_303：1/11「我在想要不要休學」那則拿掉（高雄當面說）*/
    'y0_e18_missed','y0_e18a_ask','y0_e20_ask','y0_e20_day','y0_e20_mail','y0_r5_miss','y0_r2_miss','y0_r6_miss'];
  S.cutMsg=(G,tag)=>S.short(G)&&(/^y0_c1_/.test(tag)||S.CUT_MSG.includes(tag));
  /* AA_300 第 8 節：T1、T3、T6（AA_293 交往前的手機過場）在 30 分鐘版改成跳的途中照時間收到的手機訊息（自動打開那段對話、可以「跳過」，不另外停）；T2、T4、T5 不演。
     句子照 events.js ev_y0_kt1／kt3／kt6 原句；選項掛在最後一則、回覆在 say；熟悉度、記憶、閒聊階梯在收到時記 */
  const KT=t=>({th:'p:kexin',from:'kexin',text:t});
  S.KT_PHONE={
    ev_y0_kt1:G=>({msgs:[KT('（照片：昨天那串玉米，焦的那一面朝上）'),KT('品妤說焦的朝下拍。我偏要朝上。')],   /* AA_302 第 6 列 */
      opts:[{t:'拍得很好。',say:[KT('謝謝。下次換你烤。')]},{t:'那串是我翻的。',say:[KT('我知道。所以我拍了。')]}].map(o=>G.flags.E02_WORD?Object.assign(o,{say:o.say.concat([KT('迎新那天你挑的那個經濟學名詞，我也查了。'),KT('查完覺得你應該是在開玩笑。')]),set:{KX0_LOOKED_UP:true}}):o),
      rel:{fam:2},lad:G.flags.E02_WORD?['K0-L1']:[]}),
    ev_y0_kt3:()=>({msgs:[KT('（照片：一隻耳環，是一片吐司。）'),KT('今天是吐司。昨天是骰子。'),KT('品妤說我的耳環是隨機變數。……我竟然沒辦法反駁。')],
      opts:[{t:'明天是什麼？',say:[KT('不知道耶，看明天早上的心情。')]},{t:'吐司比較好看。',say:[KT('真的假的？那我明天再戴吐司。')]}],mem:'KX0_EARRINGS',rel:{fam:2},lad:['K0-L2']}),
    ev_y0_kt6:()=>({msgs:[KT('下下禮拜就期中考了。你經原讀到哪了？'),KT('……你不用回答。我猜還沒開始。')],
      opts:[{t:'我還沒開始。',say:[KT('我也還沒。好，那我們都先不要講。')]},{t:'晚上傳訊息問妳。',say:[KT('現在就是晚上啊。……好啦，明天問。')]}],mem:'KX0_CLASSROOM',rel:{fam:2,comf:1},lad:['K0-L8']})};
  S.ktPhone=function(G,s){ const f=S.KT_PHONE[s.ev]; if(!f||typeof PHONE==='undefined') return false; const d=DK(s.key); if(d==null) return false; const x=f(G), tag=s.ev.slice(3);
    const L=x.msgs.slice(); L[L.length-1]=Object.assign({},L[L.length-1],{ask:{id:tag,opts:x.opts}});
    if(!PHONE.at(G,d,s.h,L,tag)) return false;
    if(x.rel&&typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust('kexin',x.rel); if(x.mem&&typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember('kexin',x.mem); if(x.lad&&x.lad.length&&typeof STORY!=='undefined'&&STORY.ladMark) STORY.ladMark(G,x.lad); return true; };
  S.cutId=(G,id)=>!!id&&/^ev_y0_/.test(id)&&S.short(G)&&!S.KEEP.has(id);
  S.cut=(G,ev)=>!!ev&&ev.stage==='econ'&&S.cutId(G,ev.id);
  S.stepCut=(G,s)=>(!!s.trip&&!S.short(G))||S.short(G)&&(!!s.cls||(!!s.ev&&!S.KEEP.has(s.ev))||(!!s.play&&!S.KEEP.has(s.play))||(!!s.rh&&!S.RH_PLAY.includes(s.rh)));
  /* 第 4 節：日期卡下面那一句（照「跳過的日子」；每句一次；同一天、隔一天的不出）*/
  S.CARDS=[['2024-08-26','2024-08-31','（宿營回來，暑假只剩一個禮拜。）'],
    ['2024-09-02','2024-09-12','（開學第一週。新生座談、第一堂經原、第一堂會計。阿勳每一堂都坐你旁邊，品妤每一堂都坐可昕旁邊。）'],
    ['2024-09-14','2024-09-18','（下課以後，常常是同一群人一起走出教室：韋綸、唐睿、品妤、阿勳，還有她。）'],
    ['2024-09-22','2024-10-11','（颱風假那天，你和阿勳在宿舍泡了一整晚的泡麵。之後，小福的午餐常常是同一桌。）'],
    ['2024-10-13','2024-10-14','（期中考的範圍公布了。阿勳把考試日期寫在一張紙上，貼在桌前。）'],
    ['2024-10-16','2024-10-16','（隔天晚上，你們在總圖三樓念微積分。她看了五分鐘，還在第一行。）'],
    ['2024-10-20','2024-11-05','（休學以後，你還是常回學校。去社科院找可昕，跟阿勳、品妤吃飯。）'],
    ['2024-11-07','2024-12-30','（十二月，她第一次來你家吃飯，媽媽煮了一桌。你一個人回以前的補習班問了重考班。）'],   /* AA_303 第 3 節：「可以免費」在高雄當面講 */
    ['2025-01-01','2025-01-27','（一月，你大部分的時間都在家裡。手機裡經濟系的群組，你看了，不太回。）'],
    ['2025-02-03','2025-02-11','（爸爸回上海了。成績出來那天，她傳來一張截圖：國文，零分。）'],   /* 1/29～1/30 不出（AA_303）*/
    ['2025-02-16','2025-04-23','（她住進來以後，餐桌的一半是她的書。錯一題請一碗豆花，你已經欠她四碗。）'],
    ['2025-04-25','2025-06-07','（五月，餐桌旁邊多了一台電風扇。考前一個月，兩個人說好，去報一個衝刺班。）'],
    ['2025-06-09','2025-06-23','（衝刺班，早上九點到晚上九點，每天。傍晚你們常常想回家，請了好幾次假，也遲到過。）'],
    ['2025-06-25','2025-06-27','（衝刺班。後來去請假，她已經不笑了。）'],
    ['2025-06-29','2025-07-10','（衝刺班最後一天，你們待到九點。管理人員說：「後天考試對吧。加油。」）'],
    ['2025-07-12','2025-07-24','（對答案。數學，你從第一題重新對了一次，全對。考完，她回高雄過暑假。）'],
    ['2025-07-26','2025-08-12','（後來，你們每天晚上講電話。分數的事，沒有人再提。）'],
    ['2025-08-14','2025-08-21','（你把經濟系的課本裝進紙箱。民法那本，留在書桌上。）']];
  S.cardLine=function(G,d0,d1){ if(!S.short(G)||d1-d0<2) return null; const r=S.rec(G), k0=d0+1, k1=d1-1;
    for(const [a,b,t] of S.CARDS){ if(r.lines.includes(t)) continue; const da=DK(a), db=DK(b); if(da!=null&&db!=null&&da<=k1&&db>=k0){ r.lines.push(t); return t; } } return null; };
  /* 沒演到的事件，旗標的預設（AA_300 第 4 節最後）：MATH_100＝true（對答案那句寫了全對）；E22B_TOLD 不記；CRAM_FREE_KNOWN 照 LIFE_FIXED */
  S.defaults=function(G){ if(!S.short(G)) return; const F=G.flags, d=DK('2025-07-12'), c=DK('2024-12-13'); if(d!=null&&G.day>=d&&F.MATH_100==null) F.MATH_100=true;
    if(c!=null&&G.day>=c&&!F.CRAM_FREE_KNOWN) F.CRAM_FREE_KNOWN=true; };   /* 12/13 補習班那場不演：過了就算知道可以免費（AA_300 第 4 節；沒有它 2/13 水餃店不會約 2/14 一起去問補習班，BB-C 10-18 QA-AA300）*/
  S.off=()=>typeof location!=='undefined'&&/[?&]nofastecon\b/.test(location.search||'');
  S.on=function(G){ if(!G||G.stage!=='econ'||S.off()) return false; const F=G.flags||{}; if(!F.E01_MORNING||F.Y0_MOVED_OUT) return false;
    const a=DK('2024-09-02'), b=DK('2024-10-20'); return a!=null&&b!=null&&G.day>=a&&G.day<b; };   /* 9/2 E01 早上以後～10/19 退宿 */
  /* ===== 第二階段：休學在家（10/19 退宿以後～8/29 05:00 轉法律系；AA_292 第 5～8 節，使用者 06:3x 選擇題 D102 ③）=====
     在家選單收起來（home3d.js baseRound 問 S.on2 → S.homeStep）：家裡的事件（trigger home）、固定核心的電話照舊；該出發的出遊自動出發；
     下面 STEPS2 的「要到外面演」的（3D 校園、玩樂日的出遊）時間到了帶過去演完回家；其他照 HOME.y0Jump 跳到下一個有事的時間（家裡的事件、電話、出遊、要回的訊息、Y0_FIXED）。
     要回的訊息停下來就打開手機（D103：使用者「我根本不會看手機」）。玩家在外面（出遊演完人留在現場）空下來就自動回家（S.tick）。*/
  S.STEPS2=[
    {n:'h2',key:'2024-10-23',h:12,zone:'campus',at:{x:97.9,z:-61.4,yaw:Math.PI},ev:'ev_y0_soc_door'},
    {n:'h3',key:'2024-11-06',h:20,zone:'campus',at:{x:-34.6,z:-97.0,yaw:Math.PI},ev:'ev_y0_e12',out:'y0_e12'},
    {n:'h29',key:'2025-04-01',h:15,play:'ev_y0_r3'},
    {n:'h21',key:'2025-01-31',h:8,trip:'ev_y0_kh3',back:'2025-02-02'},   /* AA_303 第 15 場：1/28 除夕電話約好（KH_TRIP）才去 */
    {n:'h34',key:'2025-05-05',h:14,play:'ev_y0_r6'}];   /* R4 模擬考、E34 經原最後一堂拿掉；R3 改大安森林公園（AA_298 第 2、3 節）。soc_door、E12 照舊（AA_298 第 3 節）*/
  S.on2=function(G){ if(!G||G.stage!=='econ'||S.off()) return false; const F=G.flags||{}; if(!F.Y0_MOVED_OUT) return false; const e=DK('2025-08-29'); return e!=null&&G.day*24+G.hour<e*24+5; };
  S.PLAY_DAYS=['2025-04-01','2025-05-05','2025-05-24'];   /* AA_292 第 6 節：玩樂日不記 retake:study（R3、R6、R7）*/
  S.step2Done=(G,s)=>!!S.rec(G).done[s.n]||(!!s.ev&&done(G,s.ev))||(!!s.play&&done(G,s.play))||(!!s.trip&&done(G,s.trip));
  S.next2=function(G){ const now=G.day*24+G.hour; const L=S.STEPS2.concat(S.rhLong(G)).map(s=>Object.assign({t:(DK(s.key)!=null?DK(s.key)*24+s.h:Infinity)},s)).sort((a,b)=>a.t-b.t); for(const s of L){ if(S.step2Done(G,s)) continue; if(S.stepCut(G,s)){ S.rec(G).done[s.n]='cut'; continue; } if(s.trip&&!(G.flags&&G.flags.KH_TRIP)){ if(DK(s.key)!=null&&DK(s.key)*24+s.h<now) S.rec(G).done[s.n]='missed'; continue; }   /* 高雄：除夕電話還沒約，先不算；過了出發時間還沒約＝不去 */ const d=DK(s.key); if(d==null) continue; const t=d*24+s.h; if(t<now-6){ S.rec(G).done[s.n]='missed'; continue; } return Object.assign({t},s); } return null; };
  S.clsItem=(G,day,cid)=>typeof CLS==='undefined'?null:((CLS.dayItems(G,day)||[]).find(it=>it.c&&it.c.id===cid)||null);
  S.tOf=(G,s)=>{ const d=DK(s.key); if(d==null) return null; if(s.cls){ const it=S.clsItem(G,d,s.cls); return it?d*24+it.t0-1/12:d*24+9; } return d*24+s.h; };
  S.stepDone=function(G,s){ const r=S.rec(G); if(r.done[s.n]) return true; if(s.cls){ const d=DK(s.key), it=S.clsItem(G,d,s.cls); return !!(it&&typeof CLS!=='undefined'&&CLS.rec(G).done[it.key]); }
    return !!s.ev&&done(G,s.ev)&&(!s.then||done(G,s.then)); };
  /* 下一個要做的：時間還沒過太久（過了 6 小時就算錯過、跳過）、還沒做完 */
  S.next=function(G){ const now=G.day*24+G.hour; const L=S.STEPS.map(s=>({s,t:S.tOf(G,s)})).filter(x=>x.t!=null).sort((a,b)=>a.t-b.t); for(const {s,t} of L){ if(S.stepDone(G,s)) continue; if(S.stepCut(G,s)){ S.rec(G).done[s.n]='cut'; continue; }   /* AA_303：T1、T3、T6 全拿掉（不再改成手機訊息）*/ if(t<now-6){ S.rec(G).done[s.n]='missed'; continue; } return s; } return null; };   /* 照時間排（陣列順序不用照日期）*/
  S.lineFor=function(G,d0,d1){ if(d1-d0<2) return null; const r=S.rec(G); const k0=d0+1, k1=d1-1;
    for(const [a,b,t] of S.LINES){ if(r.lines.includes(t)) continue; if(a==null){ return t; } const da=DK(a), db=DK(b); if(da!=null&&db!=null&&da<=k1&&db>=k0) return t; } return null; };
  S.dateLabel=(day,h)=>{ const D=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(day):{m:0,d:0}; const hh=Math.floor(h%24), mm=Math.round((h%1)*60)%60; return D.m+'/'+D.d+'（'+WD[wdOf(day)]+'）'+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0'); };
  /* 跳過的課：自動算出席（不發翹課的轉述）*/
  S.attendBetween=function(G,t1){ if(typeof CLS==='undefined') return 0; const R=CLS.rec(G); let n=0; const d1=Math.floor(t1/24);
    for(let d=G.day;d<=d1;d++) for(const it of (CLS.dayItems(G,d)||[])){ if(R.done[it.key]||d*24+it.t1>t1+1e-6) continue; if(it.exam) continue; R.done[it.key]=1; R.attend[it.c.id]=(R.attend[it.c.id]||0)+1; R.prep[it.c.id]=(R.prep[it.c.id]||0)+1; R.note['skip_'+it.key]=1; n++; }
    return n; };
  const setT=(G,E,day,h)=>{ if(day!==G.day){ G.day=day; G.weekday=wdOf(day);   /* 0＝週日（game3d 的 WEEK、sleepNow 都是 0；原本 ||7 會錯開，AA-C 10-18 回報）*/ G.energy=100; if(G.flags) G.flags.companion=null; G.weather=(typeof CALENDAR!=='undefined'&&CALENDAR.typhoon&&CALENDAR.typhoon(day))?'rain':'clear'; } G.hour=h; if(E) E.hour=G.hour; };
  /* 往前跳到 (day,h)：每 15 分鐘走一格，整點跑手機規則；收到要回的訊息就停（回傳 'msg'）*/
  S.jumpTo=function(GM,day,h){ const G=GM.G, E=GM.E; const target=day*24+h; const p0=typeof PHONE!=='undefined'&&PHONE.pending?PHONE.pending(G).length:0; let t=G.day*24+G.hour;
    while(t+0.25<=target+1e-6){ t=Math.round((t+0.25)*4)/4; const d=(h>=24&&t>=day*24)?day:Math.floor(t/24); setT(G,E,d,t-d*24);   /* h≥24：深夜還算前一天（遊戲的「過了午夜還是晚上」）*/
      if(Math.abs(t-Math.round(t))<1e-6&&typeof PHONE!=='undefined'){ try{ if(typeof STORY!=='undefined'&&STORY.phoneRules) STORY.phoneRules(GM); PHONE.tick(G,()=>{}); }catch(e){ console.warn('ECONFF phone',e); }
        if(PHONE.pending&&PHONE.pending(G).length>p0) return 'msg'; } }
    setT(G,E,day,h); return 'ok'; };
  async function sitIn(GM,it){ const E=GM.E, P=E.player; const room=it.room&&it.room.room; const seats=((E.zone&&E.zone.seats)||[]).filter(q=>!room||q.room===room);
    const free=seats.filter(q=>!GM.freeSeat||GM.freeSeat(q)===q); const st=free[Math.floor(free.length/2)]||seats[0]; if(st&&GM.sitAt) GM.sitAt(P,st); return {st,free}; }
  /* 有劇情的課：帶到教室坐好，講到話的同學坐在附近，上課 */
  async function storyClass(GM,s){ const G=GM.G, it=S.clsItem(G,G.day,s.cls); if(!it) return; const z=it.room.zone;
    if(z&&G.zone!==z&&GM.enter) await GM.enter(z,undefined,{noFade:true});
    const {st,free}=await sitIn(GM,it); let k=0;
    for(const id of (s.with||[])){ if(GM.npc&&GM.npc[id]) continue; const q=free.filter(f=>f!==st)[k++]; if(!q||!GM.spawnCharacter) break; GM.spawnCharacter(id,q.x,q.z,{seat:q,pose:'sit'}); }
    if(typeof CLS!=='undefined') await CLS.attend(GM,it,{});
    if(GM.standUp&&GM.E.player.seat) GM.standUp(GM.E.player); }
  async function runEv(GM,id){ const G=GM.G, e=evOf(id); if(!e||done(G,id)) return false;
    if(e.trigger==='outing'&&typeof OUT!=='undefined'){ const q=(G.outings||[]).find(o=>o.ev===id&&o.state==='planned'); if(q){ await OUT.go(GM,q); return true; } }
    const ok=EVENTS.check(e)||(EVENTS.cond&&EVENTS.cond(e.prereq)&&e.trigger!=='outing');
    if(!ok) return false; await EVENTS.run(e); return true; }
  /* 跳的途中收到的訊息：最新那一則要回的（沒有就最新那一則）在哪一段對話（AA_300 第 6 節）*/
  S.newestTh=G=>{ if(typeof PHONE==='undefined') return null; const P=PHONE.pending?PHONE.pending(G):[]; const m=P.length?P[P.length-1]:((G.msgs||[]).filter(x=>x.from!=='player').slice(-1)[0]); return m&&PHONE.th?PHONE.th(m):null; };
  S.busy=false;
  S.advance=async function(GM){ const G=GM.G, E=GM.E; const s=S.next(G); if(!s) return false; const r=S.rec(G); const t=S.tOf(G,s), now=G.day*24+G.hour;
    const day=DK(s.key); let h=s.cls?(t-day*24):s.h;
    if(t>now+0.05){ const d0=G.day; await GM.fade(true);
      const res=S.jumpTo(GM,day,h);
      S.attendBetween(G,G.day*24+G.hour);
      if(res==='msg'){ if(GM.updateHUD) GM.updateHUD(); await GM.fade(false); if(GM.phoneThread) GM.phoneThread(S.newestTh(G),{skip:true}); else if(GM.openPhone) GM.openPhone(); return true; }   /* AA_300 第 6 節：直接打開那一段對話，按「跳過」關掉、繼續跳 */   /* 收到要回的訊息：先回，回完下一次再接 */
      if(s.zone&&G.zone!==s.zone&&GM.enter) await GM.enter(s.zone,s.at?Object.assign({lv:0},s.at):undefined,{noFade:true});
      else if(s.at&&E&&E.placeAt){ E.placeAt(E.player,s.at.x,s.at.z,0); E.player.obj.rotation.y=s.at.yaw||0; }
      const line=S.short(G)?S.cardLine(G,d0,G.day):S.lineFor(G,d0,G.day); if(line&&!S.short(G)) r.lines.push(line);   /* AA_300 第 4 節的句子（cardLine 自己記用過）*/
      if(GM.updateHUD) GM.updateHUD(); if(E&&E.setWeather) E.setWeather(G.weather);
      if(GM.titleCard&&G.day!==d0) await GM.titleCard(S.dateLabel(G.day,G.hour),line||'',line?3200:1800);
      await GM.fade(false); }
    try{ if(s.cls) await storyClass(GM,s);
      else { await runEv(GM,s.ev); if(s.then) await runEv(GM,s.then); } }
    catch(e){ console.warn('ECONFF step '+s.n,e); }
    r.done[s.n]=r.done[s.n]||1; if(GM.autosave) GM.autosave(); return true; };
  /* ===== 重考期在家的日常（AA_297，src/data/retake_home.js；使用者 10-18「完全沒有可昕跟我一起在家讀書的感覺」「她住我家一起重考」「她完全沒出現」）=====
     2/15～7/10 在家：每天演一段 short（不重複、用完再輪；早上／白天／吃飯／晚上輪流），長場景（long，週六）照日期時間演。演完才接著跳。*/
  const RH=()=>typeof RETAKE_HOME!=='undefined'?RETAKE_HOME:null;
  S.rhOn=G=>{ const R=RH(); if(!R||!S.on2(G)||S.short(G)||R.daily===false) return false;   /* AA_300：每天的短場景整個關掉（使用者「只留長場景」）*/ const a=DK(R.range[0]), b=DK(R.range[1]); return a!=null&&b!=null&&G.day>=a&&G.day<=b; };
  S.RH_H={morning:7.25,day:14,meal:18.5,evening:21.5};
  S.RH_EVERY=3;   /* 幾天演一段（2026-10-18 使用者：「重考不用每天停，可以放一點在念書」）；長場景照日期 */
  S.RH_KIND=['morning','day','meal','evening'];
  const inWhen=(G,w)=>{ if(!w) return true; const a=DK(w[0]), b=DK(w[1]); return a!=null&&b!=null&&G.day>=a&&G.day<=b; };
  S.rhPick=function(G){ const R=RH(); if(!R) return null; const r=S.rec(G); r.rhUsed=r.rhUsed||[]; let pool=R.short.filter(e=>inWhen(G,e.when));
    if(!pool.length) return null; let fresh=pool.filter(e=>!r.rhUsed.includes(e.id)); if(!fresh.length){ r.rhUsed=r.rhUsed.filter(id=>!pool.some(e=>e.id===id)); fresh=pool; }   /* 用完再輪 */
    const want=S.RH_KIND[((G.day%4)+4)%4]; return fresh.find(e=>e.kind===want)||fresh[0]; };
  S.rhLong=G=>{ const R=RH(); if(!R) return []; return R.long.map(e=>{ const [hh,mm]=String(e.time||'20:00').split(':').map(Number); return {n:e.id,key:e.date,h:hh+(mm||0)/60,rh:e.id}; }); };
  /* 衝刺班（AA_298 第 1 節）：6/9～7/9 每天 09:00～21:00；中間跳過的日子只出日期卡，卡下面那一行是 cram_cards（每張一次）*/
  S.cramDay=G=>{ const R=RH(); const c=R&&R.cram; if(!c||!S.on2(G)) return false; const a=DK(c.from), b=DK(c.to); return a!=null&&b!=null&&G.day>=a&&G.day<=b; };
  S.cramCard=function(G){ const R=RH(); if(!R||!R.cram_cards||!S.on2(G)||S.short(G)) return null;   /* AA_300 第 4 節的句子取代 cram_cards */ const r=S.rec(G); r.cramShown=r.cramShown||[];
    const c=R.cram_cards.find(x=>{ const a=DK(x.from), b=DK(x.to); return a!=null&&b!=null&&G.day>=a&&G.day<=b; }); if(!c||r.cramShown.includes(c.from)) return null; r.cramShown.push(c.from); return c; };
  const rhDialogue=e=>{ const out=[]; if(e.place) out.push({scene:e.place,bg:e.bg||false}); const sp=s=>s==null?null:s;   /* bg：補習班那幾段（cram_class）*/
    for(const l of e.lines) out.push({speaker:sp(l.s),text:l.t});
    if(e.choice&&e.choice.length){ out.push({choice:e.choice.map((c,i)=>({text:c.t,goto:'c'+i}))}); e.choice.forEach((c,i)=>{ out.push({label:'c'+i}); for(const t of (c.reply||[])) out.push(/^（/.test(t)?{speaker:null,text:t}:{speaker:'kexin',text:t});   /* 回覆：括號開頭＝旁白（含「媽媽把你推出廚房。」這種帶引號的整句照旁白），其他＝可昕 */ if(c.rel) out.push({rel:{kexin:c.rel}}); out.push({goto:'end'}); }); out.push({label:'end'}); }
    for(const l of (e.after||[])) out.push({speaker:sp(l.s),text:l.t});   /* 選項之後、每個分支都演的（RH-L4 花插在玻璃杯裡；AA_298 1-2 第 3 點）*/
    return out; };
  S.rhPlay=async function(GM,e){ const G=GM.G; const ev={id:'rh_'+e.id,stage:'econ',title:'',participants:['kexin'],location:'any',trigger:'econff',once:false,background:(typeof HOME!=='undefined'&&HOME.bgNow&&!e.bg&&!(e.place&&!/祐廷家/.test(e.place)))?HOME.bgNow():'dark',dialogue:rhDialogue(e)};
    try{ if(typeof EVENTS!=='undefined') await EVENTS.run(ev,{noTitle:true}); } catch(err){ console.warn('ECONFF rh '+e.id,err); }
    const r=S.rec(G); r.rhUsed=r.rhUsed||[]; if(!r.rhUsed.includes(e.id)) r.rhUsed.push(e.id); r.rhDay=G.day; if(typeof ADV!=='undefined'&&HOME.at(G)) ADV.begin({background:HOME.bgNow?HOME.bgNow():'blur'}); };
  /* 第二階段：家裡選單那一輪（home3d.js baseRound）。回傳值照 baseRound：true＝還在家、false＝出門了 */
  S.homeStep=async function(GM){ const G=GM.G, H=HOME.rec(G); S.defaults(G);
    if(S.short(G)&&typeof OUT!=='undefined'&&OUT.rec) for(const o of OUT.rec(G)) if(o.state==='planned'&&S.cutId(G,o.ev)) o.state='done';   /* AA_300：不在 29 場裡的出遊（舊存檔排好的）不出發 */
    const q=HOME.dueOuting(G); if(q) return HOME.goOut(GM,q);   /* 該出發的出遊：自動「去」（AA_292 第 8 節）*/
    const iv=HOME.dueInvites(G)[0]; if(iv&&typeof INV!=='undefined'){ await HOME.leaveTo(GM,INV.place(iv.place)||{}); return false; }
    const s=S.next2(G), now=G.day*24+G.hour;
    if(s&&s.t<=now+0.05) return S.run2(GM,s);
    const rd=S.rec(G).rhDay; if(S.rhOn(G)&&(rd==null||G.day-rd>=S.RH_EVERY)&&G.hour>=7&&G.hour<23.5){ const e=S.rhPick(G); if(e){ await S.rhPlay(GM,e); return H.at; } }   /* 重考期在家：每 RH_EVERY 天一段（AA_297）*/
    const end=HOME.y0FfEnd(); let to=end!=null?end:now+24; if(s&&s.t<to) to=s.t;
    if(S.rhOn(G)||(RH()&&DK(RH().range[0])===G.day+1)){ const nd=(rd!=null&&S.rhOn(G))?Math.max(G.day+1,rd+S.RH_EVERY):G.day+1, e=S.rhPick(Object.assign({},G,{day:nd})), hh=e?S.RH_H[e.kind]||14:14, t=nd*24+hh; if(t<to&&t>now+0.05) to=t; }   /* 重考期：每 RH_EVERY 天停一次（使用者 10-18：「重考不用每天停」）*/
    if(to<=now+0.05) return H.at;
    const why=await HOME.y0Jump(GM,to);
    if(why==='msg'&&GM.phoneThread){ if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); await GM.phoneThread(S.newestTh(G),{skip:true}); if(H.at&&typeof ADV!=='undefined') ADV.begin({background:HOME.bgNow?HOME.bgNow():'blur'}); }   /* 要回的訊息：打開手機回（D103）*/
    return H.at; };
  /* 要到外面演的一步：玩樂日＝排可昕的出遊、出發；3D＝帶到現場、站好、演、回家 */
  S.run2=async function(GM,s){ const G=GM.G, E=GM.E, H=HOME.rec(G); const r=S.rec(G);
    if(s.rh){ const e=RH()&&RH().long.find(x=>x.id===s.rh); if(e) await S.rhPlay(GM,e); r.done[s.n]=1; if(GM.autosave) GM.autosave(); return H.at; }
    if(s.trip){ const e=evOf(s.trip), E=GM.E;   /* 高雄三天兩夜（AA_303 第 15 場）：從家裡出發、2D 演完、回到臺北的家是最後一天晚上 */
      try{ if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); await GM.fade(true); if(GM.titleCard) await GM.titleCard(S.dateLabel(G.day,G.hour),'開車去高雄 約 4 小時',2000); await GM.fade(false);
        if(e&&!done(G,s.trip)&&typeof EVENTS!=='undefined') await EVENTS.run(e); } catch(err){ console.warn('ECONFF trip',err); }
      r.done[s.n]=1; const b=DK(s.back); if(b!=null){ await GM.fade(true); setT(G,E,b,21); if(GM.updateHUD) GM.updateHUD(); if(GM.titleCard) await GM.titleCard(S.dateLabel(b,21),'回臺北的家',2200); H.at=true; H.day=G.day; if(typeof ADV!=='undefined') ADV.begin({background:HOME.bgNow?HOME.bgNow():'blur'}); await GM.fade(false); }
      if(GM.autosave) GM.autosave(); return H.at; }   /* 長場景（AA_297）：在家裡演（出門那幾段是 2D 的地點字卡）*/
    try{
      if(s.play){ if(typeof STORY!=='undefined'&&STORY.rtPlanPlay) STORY.rtPlanPlay(G); const q=typeof OUT!=='undefined'?OUT.get(G,'rt_play_'+G.day):null; r.done[s.n]=1; if(q&&q.state==='planned') return HOME.goOut(GM,q); return H.at; }
      if(s.out&&typeof OUT!=='undefined'){ const q=OUT.get(G,s.out); if(q&&q.state==='planned') q.state='done'; }   /* E12：出遊（goto）由這裡帶過去，不要再停一次 */
      H.at=false; if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); await GM.fade(true); if(GM.titleCard) await GM.titleCard(S.dateLabel(G.day,G.hour),'捷運＋公車 約 30 分鐘',1800);
      const at=s.at; if(GM.enter) await GM.enter(s.zone,at?Object.assign({lv:0},at):undefined,{noFade:true}); await GM.fade(false);
      S.busy=true; try{ await runEv(GM,s.ev); } finally { S.busy=false; }
    } catch(e){ console.warn('ECONFF step2 '+s.n,e); }
    r.done[s.n]=r.done[s.n]||1; if(GM.autosave) GM.autosave();
    if(!HOME.at(G)&&HOME.go) await HOME.go(GM);   /* 演完回家（HOME.go 會接著跑家裡那一輪）*/
    return false; };
  /* 睡覺、快轉＝直接到下一個事件（2026-10-18 使用者：「我每天睡覺到休學，還可以跟可昕告白，中間我們根本沒遇到」——一定要演的事件不能被睡過去）。
     story3d.js 的 sleepNow、home3d.js 的 sleep／ffMenu 先問這裡：事件模式而且還有下一個事件＝跳過去、回傳 true */
  S.sleepJump=async function(GM){ const G=GM.G; if(!S.on(G)||!S.next(G)) return false; if(S.busy) return true; S.busy=true;
    try{ if(GM.E&&GM.E.player&&GM.E.player.seat&&GM.standUp) GM.standUp(GM.E.player); await S.advance(GM); } catch(e){ console.warn('ECONFF sleepJump',e); } finally { S.busy=false; } return true; };
  /* 每 0.5 秒（story3d.js S.tick）：空下來 1.5 秒就接下一個 */
  let idleSince=0;
  let idle2=0;
  S.tick2=function(GM){ const G=GM.G, E=GM.E, P=E&&E.player; if(!S.on2(G)||S.busy||typeof HOME==='undefined'||HOME.at(G)){ idle2=0; return; }
    const free=!!P&&!E.paused&&!P.busy&&!(GM.D&&GM.D.active)&&!GM.titleIdle&&!(P.path&&P.path.length)&&!(typeof EVENTS!=='undefined'&&EVENTS.running);
    const today=typeof OUT!=='undefined'&&OUT.rec?OUT.rec(G).some(q=>q.day===G.day&&q.state==='planned'&&G.hour<q.h+(q.late!=null?q.late:0.75)):false;   /* 只等今天還沒到時間的出遊（舊寫法：只要今天有一筆沒做完的就不回家——瀏覽器探測 8/7 一直留在博雅）*/
    if(!free||today){ idle2=0; return; } const now=Date.now(); if(!idle2){ idle2=now; return; } if(now-idle2<3000) return;
    idle2=0; S.busy=true; HOME.go(GM).then(ok=>{ if(!ok) console.warn('ECONFF home: HOME.go 沒有回家',{canGo:HOME.canGo&&HOME.canGo(G),at:HOME.at(G)}); }).catch(e=>console.warn('ECONFF home',e)).finally(()=>{ S.busy=false; }); };   /* 出遊演完人在外面、空下來 3 秒：自動回家（休學在家，D102 ③）*/
  S.tick=function(GM){ const G=GM.G; S.tick2(GM); if(!S.on(G)||S.busy){ idleSince=0; return; } const E=GM.E, P=E&&E.player;
    const free=!!P&&!E.paused&&!P.busy&&!P.seat&&!(GM.D&&GM.D.active)&&!GM.titleIdle&&!(P.path&&P.path.length)&&!(typeof EVENTS!=='undefined'&&EVENTS.running);
    if(!free){ idleSince=0; return; } const now=Date.now(); if(!idleSince){ idleSince=now; return; } if(now-idleSince<1500) return;
    idleSince=0; S.busy=true; S.advance(GM).catch(e=>console.warn('ECONFF',e)).finally(()=>{ S.busy=false; }); };
  return S;
})();
