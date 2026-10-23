/* ===== 芷若在英國：約好的視訊（每月、每週）、生日和新年的回覆（AA_419，AA-B 2026-10-23 18:4x；USER_WANTS E07；D109 AA 定）=====
   接 msg3d.js 的「芷若在英國：照交情聯絡」（VAC-ZR-UK-1017：私訊、每天一則照舊）。台詞照 AA_419 一字不改（D100、D109）。
   - 第 1 節 每月的視訊（好朋友、曖昧＝MSG.ukRow 'close'：第 5 階以上、兩人都單身；子晴×芷若交往中〔ZRZQ.dating〕也算不單身）：
     她在英國的那幾個月，每個月第一個週日臺灣 22:00；前一天 21:00 她私訊「明天晚上十點？」（回「好。」／「這次不行。」→「好。下個月。」、那個月不打）。
     沒回她的：照樣打（只有「這次不行。」才不打；同 sis_jp3d.js 第 3 節「沒回她的：照樣打」）。私訊那天和視訊那天她都要在英國
     （2028-09 那個月：9/2 她出發、9/3 才到＝不打，十月起才有）。
     接起來（出遊 OUT，place 視訊、late 0.25）：開頭（三句輪流）→ 話題（M1～M8 照順序，用過的不再用、用完從頭；M6 只在冬令時間，夏令時跳過、留到以後；
     2028-09 起 M1 換第二次去英國那一句）→ 收尾（三句輪流）。22:15 以前沒接（含「先不接」）＝22:20「沒接。……下個月見。」。
   - 第 2 節 每週的視訊（交往中、2028-09 起她在英國）：每個週日臺灣 22:00，不用前一天約；修補「每週固定一個時間」以後（BB_119 2-3 的談話：遊戲還沒有，
     旗標 G.flags.ZR_WEEKLY_FIX===true，目前沒有地方設）改 17:00、開頭第 2 句和收尾換句、收尾不算裂縫。
     開頭四句輪流（第 2 句分夏令／冬令；第 4 句「今天換你先講。」接 W11——這一輪 W11 講過了就跳過第 4 句、用第 1 句，話題才不會在用完以前重複）；
     話題 W1～W14 照順序、用完從頭（W12 夏令／冬令兩句；冬令那句和 M6 一樣：看過 M6 的只用夏令那句＝冬令時間跳過 W12、留到夏令；W13 2029-03 以後才有）。
     收尾（22:00 版）：「早點睡。」連兩次＝ZR_CRACK +1（ROM.crack）、之後重新算；「再講十分鐘。」重新算（沒接的那幾週不算選，計數不動）。
     沒接：22:20（17:00 版 17:20）「沒接。……你在忙吧。」；連兩週以上沒接「又沒接。……沒關係。」（不算裂縫）。
     修補以後八週接了幾次：S.fixAnswered（判斷由 BB_119 那一段的程式做，這裡只記）。
   - 第 3 節 生日（9/28）、新年（1/1）的按鈕：她在英國、交情朋友以上（MSG.ukRow friend／close／dating）才開，只開這兩個（msg3d.js 的 S.topics 叫 MSG.ukTopics2）；
     英國的新年只有 1/1（農曆年照舊不開）。回覆時間照英國的作息（MSG.replyAt → MSG.ukReplyAt，連「我剛起床。」「抱歉，這週比較忙。」那兩種開頭都照舊）；
     1/1 臺灣 00:00～08:00 傳的當下就回（英國還是 12/31 傍晚）。句子在這個檔（S.T2），不改產生出來的 msg2_pool.js。
   時間：都照臺灣時間；祐廷在國外（美國路線 2028-08～12 和她第二次去英國重疊）時遊戲時鐘是當地時間＝臺灣＋STORY.tzOffset，排程照換算（S.toGame）。
   接線：index.html 緊接在 msg3d.js 後面（那時 STORY、OUT 還沒載入）——手機規則掛在 MSG.ukDaily（story3d.js 的 phoneRules 每次都叫它），
   事件推進 STORY_EVENTS；MSG.pick2／send／replyAt 包一層（之後載入的 jp3d.js、us_life3d.js、kxdrift3d.js 再包在外面）。
   存檔：G.flags.ZR_UK_CALLS＝{m:{o,c,used,seenM6,log}, w:{o,used,sleep,miss,log}}（舊存檔沒有＝空的）。
   測試：node tests/aa419_zr_uk_unit.js */
'use strict';
const ZRUK=(function(){
  const S={}, ZR='heroine_02', TH='p:'+ZR;
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const tz=(G,d)=>typeof STORY!=='undefined'&&STORY.tzOffset?(+STORY.tzOffset(G,d)||0):0;
  const cal=d=>CALENDAR.dateOf(d), keyOf=d=>cal(d).key, wdOf=d=>cal(d).wd%7;
  const onDay=(G,d)=>Object.assign({},G,{day:d});
  const Z=t=>({speaker:ZR,text:t}), N=t=>({speaker:null,text:t}), dm=t=>({th:TH,from:ZR,text:t});
  const hm=h=>(h<12?'早上 ':'下午 ')+String(h>12?h-12:h)+':00';
  /* ---------- 時間：臺灣 ↔ 遊戲時鐘 ---------- */
  S.twNow=G=>now(G)-tz(G,G.day);
  S.twDay=G=>Math.floor(S.twNow(G)/24+1e-9);
  S.toGame=(G,d,h)=>{ const a=T(d,h)+tz(G,d), dd=Math.floor(a/24+1e-9); return {day:dd,h:+(a-dd*24).toFixed(4)}; };
  S.inUK=(G,d)=>typeof MSG!=='undefined'&&!!MSG.inUK&&MSG.inUK(onDay(G,d),ZR);
  const off=(G,d)=>typeof MSG!=='undefined'&&MSG.ukOff?MSG.ukOff(onDay(G,d)):8;
  S.winter=(G,d)=>off(G,d)===8;   /* 英國冬令時間（AA_419 第 0 節；MSG.ukOff 慢 8 小時＝冬令）*/
  S.fixOn=G=>!!(G&&G.flags&&G.flags.ZR_WEEKLY_FIX===true);   /* BB_119 2-3 修補選了「每週固定一個時間」：還沒有那一段談話，沒有地方設 */
  S.rec=function(G){ const F=G.flags||(G.flags={}); let R=F.ZR_UK_CALLS; if(!R||typeof R!=='object') R=F.ZR_UK_CALLS={};
    if(!R.m||typeof R.m!=='object') R.m={o:0,c:0,used:[],seenM6:false,log:[]};
    if(!R.w||typeof R.w!=='object') R.w={o:0,used:[],sleep:0,miss:0,log:[]};
    for(const k of ['m','w']){ if(!Array.isArray(R[k].used)) R[k].used=[]; if(!Array.isArray(R[k].log)) R[k].log=[]; R[k].o=R[k].o|0; }
    R.m.c=R.m.c|0; R.w.sleep=R.w.sleep|0; R.w.miss=R.w.miss|0; return R; };
  const log=(L,e)=>{ L.push(e); if(L.length>80) L.splice(0,L.length-80); };

  /* ---------- 台詞（AA_419，照原文）---------- */
  S.M_OPEN=['聽得到嗎？……我這邊網路有點慢。','你那邊很晚了吧。我這邊剛吃完午餐。','我換了一個房間打給你。原本那間有人在練琴。'];
  S.M_CLOSE=['好。我要去上課了。……下個月見。','你那邊快十一點了。去睡覺。','下個月同一個時間。我會記得。'];
  S.M_ORDER=['M1','M2','M3','M4','M5','M6','M7','M8'];
  S.M={
    M1:{say:['來的第一個禮拜，傘就被風吹壞了。好看的那一把。','現在用的是超市買的。很醜，可是不會壞。'],second:['這個城市的風比倫敦還大。我這次先買了醜的傘。']},
    M2:{say:['宿舍的廚房六個人用。冰箱每一格都貼名字。','我那一格，只有牛奶和一顆檸檬。']},
    M3:{say:['這裡的咖啡很苦。我去了四家，第四家的店員拉花歪了。','……我差點跟他說，我可以幫你。']},
    M4:{say:['我寄的明信片收到了嗎？'],opts:[{t:'收到了。',r:['好。下一張是下雨的。這裡每一張都可以是下雨的。']},{t:'還沒。',r:['郵局說要兩個禮拜。……我寄太早了。']}]},
    M5:{say:['上課要一直發言。第一個禮拜我都不敢講。','現在會了。講錯了也沒關係，他們聽不出來。']},
    M6:{say:['這裡下午四點天就黑了。','我還是會在四點的時候想：Café 現在要開燈了。'],winter:true},
    M7:{say:['這週看了一部很老的片，黑白的。整間戲院只有六個人。','……我坐倒數第三排。']},
    M8:{say:['我好想吃阿鳳的乾麵。這裡的麵都是軟的。','你替我吃一碗。拍給我看。'],opts:[{t:'好。',r:['要拍到滷蛋。']},{t:'我現在就去。',r:['現在十點了。……明天啦。']}]} };
  S.SECOND='2028-09-01';   /* 第二次去英國（2028-09 起）：M1 換句 */
  S.W_OPEN=['聽得到嗎？……好，看到你了。',null,'等一下。……我把耳機找到了。','今天換你先講。'];
  S.W_OPEN2={summer:'你那邊十點了吧。我這邊太陽還很大。',winter:'你那邊十點了吧。我這邊天快黑了。',fix:'早安。……我這邊是早上。你那邊吃晚餐了沒？'};
  S.W_ORDER=['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12','W13','W14'];
  S.W={
    W1:{say:['上課有個同學每次都坐同一排。他問我臺灣的冬天冷不冷。','我說很濕。……他聽不懂。']},
    W2:{say:['室友煮了一鍋湯，叫我喝。很鹹。','我喝完了。……我們臺灣人很有禮貌。']},
    W3:{say:['學校旁邊有一家咖啡店，店員記得我點什麼了。','……換我被記得，感覺很奇怪。']},
    W4:{say:['店長傳照片給我，吧檯換了新的燈。','……我不在的時候，它變漂亮了。'],opts:[{t:'妳回來再看。',r:['嗯。我回去，第一個看它。']}]},
    W5:{say:['這裡又下雨了。……我已經不帶傘了。']},
    W6:{say:['這週的作業，寫一部片的開頭三分鐘。我寫了十頁。','老師說太長了。……跟你們法律系一樣。']},
    W7:{say:['我媽寄了一箱東西來。一半是泡麵，一半是暖暖包。','……她不知道這裡有暖氣。']},
    W8:{say:['昨天在宿舍樓下看到一隻狐狸。這裡的狐狸，跟溫州街的貓一樣多。']},
    W9:{say:['放映課，老師放了一部臺灣的片。全班只有我聽得懂裡面的台語。','……我笑的時候，大家都轉過來看我。']},
    W10:{say:['我在宿舍用小鍋子打奶泡。',N('（她把杯子舉到鏡頭前。）'),'……拉花歪了。你喝。']},
    W11:{say:['你那邊呢？這週有什麼？'],opts:[{t:'讀書。',r:['讀什麼？……講給我聽。我想聽你講。']},{t:'想妳。',r:['……嗯。',N('（她把鏡頭轉向窗外，過了一下才轉回來。）')]}]},
    W12:{winter:['這裡四點天就黑了。我還是會在四點想：Café 要開燈了。'],summer:['這裡晚上九點天還是亮的。……我常常忘記吃晚餐。']},
    W13:{say:['我在看八月的機票。','……還很久。我只是看看。'],from:'2029-03-01'},
    W14:{say:['我把你寄來的明信片貼在書桌前面。','……室友問是誰寫的。我說，常客。'],opts:[{t:'常客？',r:['……好啦。不是常客。']}]} };
  S.W_CLOSE_Q='你那邊很晚了吧。';
  S.W_CLOSE={sleep:{t:'早點睡。',r:['好。……晚安。',N('（視訊結束。）')]},more:{t:'再講十分鐘。',r:['好。……我泡一杯茶，你看我泡。',N('（十分鐘以後，她先說了晚安。）')]},fix:'你要去吃晚餐了吧。……去吧。'};
  S.ASK={q:'明天晚上十點？',yes:'好。',no:'這次不行。',noR:'好。下個月。'};
  S.MISS={m:'沒接。……下個月見。',w:'沒接。……你在忙吧。',w2:'又沒接。……沒關係。'};
  S.T2={bday:{friend:'謝謝。……你怎麼知道。',close:'謝謝！我今天一個人去看了一部電影。……你傳來的時候，剛好散場。',dating:'謝謝。……晚上視訊的時候再說一次。'},
        newyear:{friend:'新年快樂。你們先跨了。',close:'你們先跨了。……我這邊還有八個小時。新年快樂。',dating:'我這邊還沒。……等一下視訊再說。'}};
  S.W_FROM='2028-09-01';   /* 每週的視訊：2028-09 她到英國以後 */

  /* ---------- 挑話題 ---------- */
  const availM=(G,d,id)=>!S.M[id].winter||S.winter(G,d);
  S.nextM=function(G,d){ const R=S.rec(G).m; let c=S.M_ORDER.filter(id=>!R.used.includes(id)&&availM(G,d,id)), reset=false;
    if(!c.length){ reset=true; c=S.M_ORDER.filter(id=>availM(G,d,id)); } return {id:c[0],reset}; };
  const availW=(G,d,id)=>{ const w=S.W[id]; if(w.from){ const f=D(w.from); if(f==null||d<f) return false; } if(id==='W12'&&S.winter(G,d)&&S.rec(G).m.seenM6) return false; return true; };
  S.nextW=function(G,d){ const R=S.rec(G).w; let c=S.W_ORDER.filter(id=>!R.used.includes(id)&&availW(G,d,id)), reset=false;
    if(!c.length){ reset=true; c=S.W_ORDER.filter(id=>availW(G,d,id)); } const used=reset?[]:R.used;
    let k=R.o%4, skip=0; if(k===3){ if(!used.includes('W11')) return {open:3,id:'W11',reset,skip}; k=0; skip=1; }   /* 第 4 句接 W11；W11 這一輪講過了＝跳過第 4 句 */
    return {open:k,id:c[0],reset,skip}; };
  /* 一個話題的台詞：她說的幾句（字串＝她說、物件＝旁白）＋選項（每個選項接她的回答）*/
  let lab=0;
  const topicLines=(say,opts)=>{ const out=say.map(t=>typeof t==='string'?Z(t):t); if(!opts||!opts.length) return out; const p='zruk'+(++lab)+'_';
    out.push({choice:opts.map((o,i)=>({text:'「'+o.t+'」',goto:p+i}))});
    opts.forEach((o,i)=>{ out.push({label:p+i}); for(const r of o.r) out.push(typeof r==='string'?Z(r):r); out.push({goto:p+'x'}); }); out.push({label:p+'x'}); return out; };
  S.curQ=(G,ev)=>typeof OUT==='undefined'||!OUT.rec?null:(OUT.rec(G).find(x=>x.ev===ev&&x.arrived&&x.state==='planned')||null);   /* 正在演的那一通（OUT.go 演之前標 arrived）*/
  const run=async(L,ev)=>{ if(typeof EVENTS!=='undefined'&&EVENTS.runLines) await EVENTS.runLines(L,ev); return L; };

  /* ---------- 第 1 節 每月 ---------- */
  S.monthLines=function(G,d){ const R=S.rec(G).m, op=S.M_OPEN[R.o%S.M_OPEN.length]; R.o++;
    const nx=S.nextM(G,d); if(nx.reset) R.used=[]; R.used.push(nx.id); if(nx.id==='M6') R.seenM6=true;
    const cl=S.M_CLOSE[R.c%S.M_CLOSE.length]; R.c++;
    const sp=S.M[nx.id], dS=D(S.SECOND), say=sp.second&&dS!=null&&d>=dS?sp.second:sp.say;
    log(R.log,{ym:keyOf(d).slice(0,7),day:d,ans:'yes',topic:nx.id});
    return [Z(op)].concat(topicLines(say,sp.opts),[Z(cl)]); };
  S.playM=async function(G,GM,ev){ const q=S.curQ(G,S.EV_M), d=q&&q.zr&&q.zr.d!=null?q.zr.d:S.twDay(G); return run(S.monthLines(G,d),ev); };
  S.firstSun=day=>{ let d=day-(cal(day).d-1); while(wdOf(d)!==0) d++; return d; };
  S.monthOk=function(G,sd){ if(!law(G)||!S.inUK(G,sd-1)||!S.inUK(G,sd)) return false; if(typeof ZRZQ!=='undefined'&&ZRZQ.dating&&ZRZQ.dating(G)) return false;
    const o=MSG.open(onDay(G,sd),ZR); return !!(o&&o.ok&&o.mode==='uk'&&o.uk==='close'); };
  S.monthIds=sd=>{ const ym=keyOf(sd).slice(0,7); return {ym,ask:'zruk_m_ask_'+ym,id:'zruk_m_'+ym,miss:'zruk_m_miss_'+ym}; };
  S.monthCall=function(G,sd,tw){ const I=S.monthIds(sd), call=T(sd,22);
    if(!PHONE.sent(G,I.ask)){ if(tw<call-0.25&&S.monthOk(G,sd)){ const a=S.toGame(G,sd-1,21), c=S.toGame(G,sd,22);
        PHONE.at(G,a.day,a.h,[Object.assign(dm(S.ASK.q),{ask:{id:I.ask,until:T(c.day,c.h-0.25),opts:[{t:S.ASK.yes},{t:S.ASK.no,say:[{from:ZR,text:S.ASK.noR}]}]}})],I.ask); }
      return; }
    const m=PHONE.byAsk(G,I.ask), ans=m&&m.ans!=null?m.ans:null;
    if(ans===1){ const L=OUT.rec(G), i=L.findIndex(q=>q.id===I.id&&q.state==='planned'&&!q.arrived); if(i>=0) L.splice(i,1);   /* 「這次不行。」：那個月不打 */
      const R=S.rec(G).m; if(!R.log.some(e=>e.ym===I.ym)) log(R.log,{ym:I.ym,day:sd,ans:'no'}); return; }
    if(OUT.get(G,I.id)||tw>=call+0.25||!(ans===0||Math.floor(tw/24+1e-9)===sd)||!S.monthOk(G,sd)) return;   /* 回「好。」就排；沒回的到那個週日才排（照樣打）*/
    const c=S.toGame(G,sd,22);
    OUT.plan(G,{id:I.id,ev:S.EV_M,day:c.day,h:c.h,late:0.25,place:'視訊',verb:'接起來',no:'先不接',title:'和芷若視訊（英國'+hm(22-off(G,sd))+'）',travel:'',travelH:0,back:'視訊結束。',alarm:true,zr:{k:'m',ym:I.ym,d:sd,h:22}}); };
  S.monthly=function(G){ const tw=S.twNow(G), td=Math.floor(tw/24+1e-9), done=new Set();
    for(const sd of [S.firstSun(td),S.firstSun(td+1)]){ if(done.has(sd)) continue; done.add(sd); if(td===sd-1||td===sd) S.monthCall(G,sd,tw); } };

  /* ---------- 第 2 節 每週 ---------- */
  S.weekLines=function(G,d,fix){ const R=S.rec(G).w, nx=S.nextW(G,d); if(nx.reset) R.used=[]; R.o+=1+nx.skip; if(!R.used.includes(nx.id)) R.used.push(nx.id);
    const win=S.winter(G,d), op=nx.open===1?(fix?S.W_OPEN2.fix:(win?S.W_OPEN2.winter:S.W_OPEN2.summer)):S.W_OPEN[nx.open];
    const sp=S.W[nx.id], say=nx.id==='W12'?(win?sp.winter:sp.summer):sp.say;   /* 冬令又看過 M6 的不會挑到 W12（availW）*/
    R.miss=0; log(R.log,{day:d,ans:'yes',topic:nx.id,fix:!!fix});
    let tail;
    if(fix) tail=[Z(S.W_CLOSE.fix)];   /* 修補以後的 17:00：不問「你那邊很晚了吧」、不算裂縫 */
    else { const C=S.W_CLOSE; tail=[Z(S.W_CLOSE_Q),{choice:[{text:'「'+C.sleep.t+'」',goto:'zruk_ws'},{text:'「'+C.more.t+'」',goto:'zruk_wt'}]},
      {label:'zruk_ws'}].concat(C.sleep.r.map(t=>typeof t==='string'?Z(t):t),[{call:g=>S.sleepPick(g,true)},{goto:'zruk_we'},{label:'zruk_wt'}],
      C.more.r.map((t,i)=>typeof t==='string'?Z(t):Object.assign({},t,i===C.more.r.length-1?{advance:1/6}:{})),[{call:g=>S.sleepPick(g,false)},{label:'zruk_we'}]); }
    return [Z(op)].concat(topicLines(say,sp.opts),tail); };
  /* 收尾的選項（BB_119 2-3 裂縫①）：「早點睡。」連兩次＝ZR_CRACK +1、重新算；「再講十分鐘。」重新算 */
  S.sleepPick=function(G,early){ const R=S.rec(G).w; if(!early){ R.sleep=0; return 0; } R.sleep++; if(R.sleep<2) return 0; R.sleep=0;
    if(typeof ROM!=='undefined'&&ROM.crack) ROM.crack(G,ZR,1); else G.flags.ZR_CRACK=(+G.flags.ZR_CRACK||0)+1; return 1; };
  S.playW=async function(G,GM,ev){ const q=S.curQ(G,S.EV_W), d=q&&q.zr&&q.zr.d!=null?q.zr.d:S.twDay(G), fix=q&&q.zr?!!q.zr.fix:S.fixOn(G); return run(S.weekLines(G,d,fix),ev); };
  S.weekly=function(G){ const tw=S.twNow(G), d=Math.floor(tw/24+1e-9); if(wdOf(d)!==0) return; const w0=D(S.W_FROM); if(w0==null||d<w0) return;
    if(!S.inUK(G,d)||MSG.ukRow(G,ZR)!=='dating') return; const id='zruk_w_'+keyOf(d); if(OUT.get(G,id)) return;
    const fix=S.fixOn(G), h=fix?17:22; if(tw>=T(d,h)+0.25) return; const c=S.toGame(G,d,h);
    OUT.plan(G,{id,ev:S.EV_W,day:c.day,h:c.h,late:0.25,place:'視訊',verb:'接起來',no:'先不接',title:'和芷若視訊（英國'+hm(h-off(G,d))+'）',travel:'',travelH:0,back:'視訊結束。',alarm:true,zr:{k:'w',d,h,fix}}); };
  /* 修補以後的八週接了幾次（BB_119：六次以上＝修補成功；判斷由那一段的程式做）*/
  S.fixAnswered=function(G){ const L=S.rec(G).w.log.filter(e=>e.fix&&(e.ans==='yes'||e.ans==='missed')).slice(0,8); return {n:L.filter(e=>e.ans==='yes').length,of:L.length}; };

  /* ---------- 沒接 ---------- */
  S.missed=function(G,q){ const z=q&&q.zr; if(!z||typeof PHONE==='undefined') return; const R=S.rec(G);
    if(z.k==='m'){ const tag='zruk_m_miss_'+z.ym; if(PHONE.sent(G,tag)) return; log(R.m.log,{ym:z.ym,day:z.d,ans:'missed'}); const a=S.toGame(G,z.d,22+20/60); PHONE.at(G,a.day,a.h,[dm(S.MISS.m)],tag); return; }
    if(z.k==='w'){ const tag='zruk_w_miss_'+keyOf(z.d); if(PHONE.sent(G,tag)) return; R.w.miss++; log(R.w.log,{day:z.d,ans:'missed',fix:!!z.fix});
      const a=S.toGame(G,z.d,(z.h||22)+20/60); PHONE.at(G,a.day,a.h,[dm(R.w.miss>=2?S.MISS.w2:S.MISS.w)],tag); } };

  /* ---------- 手機規則（每次 STORY.phoneRules → MSG.ukDaily）---------- */
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined'||typeof OUT==='undefined'||typeof MSG==='undefined'||typeof CALENDAR==='undefined') return;
    try{ S.monthly(G); }catch(e){ console.warn('ZRUK monthly',e); } try{ S.weekly(G); }catch(e){ console.warn('ZRUK weekly',e); } };

  /* ---------- 第 3 節 生日、新年的按鈕 ---------- */
  const md=G=>{ const x=cal(G.day+Math.floor((+G.hour||0)/24)); return x.m*100+x.d; };
  S.t2Entry=function(G,topic){ if(!law(G)||!S.T2[topic]||typeof MSG==='undefined'||!MSG.inUK(G,ZR)) return null; const row=MSG.ukRow(G,ZR), t=S.T2[topic][row]; if(!t) return null;
    if(topic==='bday'&&md(G)!==928) return null; if(topic==='newyear'&&md(G)!==101) return null;   /* 英國的新年只有 1/1 */
    return {topic,tier:row==='dating'?'L':(row==='close'?'L':'R'),msgs:[t],tags:[],variant:'在英國',zrUk:row,src:'AA_419 第 3 節'}; };
  S.topics2=(G,id)=>id!==ZR?[]:[{k:'bday',t:'生日快樂'},{k:'newyear',t:'新年快樂'}].filter(q=>!!S.t2Entry(G,q.k));
  S.immediateNY=G=>{ const h=(+G.hour||0)%24; return md(G)===101&&h<8; };   /* 1/1 臺灣 00:00～08:00（MSG.replyAt 裡的 G 是臺灣時間：jp3d.js、us_life3d.js 換算後才叫進來）*/
  if(typeof MSG!=='undefined'&&!MSG._zruk){ MSG._zruk=true;
    MSG.ukTopics2=(G,id,o)=>S.topics2(G,id);   /* msg3d.js S.topics 的英國那一段只開這兩個 */
    if(typeof MSG.pick2==='function'){ const p0=MSG.pick2; MSG.pick2=function(G,id,topic,peek){ if(id===ZR&&(topic==='bday'||topic==='newyear')&&MSG.inUK&&MSG.inUK(G,ZR)){ const e=S.t2Entry(G,topic); return e?{e,act:null}:null; } return p0.apply(this,arguments); }; }
    if(typeof MSG.send==='function'){ const s0=MSG.send; MSG.send=function(G,id,topic){ const prev=S._t2; S._t2=id===ZR?topic:null; try{ return s0.apply(this,arguments); } finally { S._t2=prev; } }; }
    if(typeof MSG.replyAt==='function'){ const r0=MSG.replyAt; MSG.replyAt=function(G,id){ if(id===ZR&&S._t2==='newyear'&&MSG.inUK(G,ZR)&&MSG.ukRow(G,ZR)!=='none'&&S.immediateNY(G)){ const day=G.day+Math.floor((+G.hour||0)/24); return {day,h:(+G.hour||0)%24+1/60,late:false,immediate:true}; } return r0.apply(this,arguments); }; }
    if(typeof MSG.ukDaily==='function'){ const d0=MSG.ukDaily; MSG.ukDaily=function(G){ const r=d0.apply(this,arguments); try{ S.phone(G); }catch(e){ console.warn('ZRUK.phone',e); } return r; }; } }

  /* ---------- 事件 ---------- */
  S.EV_M='ev_zr_uk_monthly'; S.EV_W='ev_zr_uk_weekly';
  S.EVENTS=[
    {id:S.EV_M,title:'視訊',participants:[ZR],location:'any',trigger:'outing',background:'dark',hours:0.5,
      dialogue:[{scene:'視訊',bg:'video'},{call:(G,GM,ev)=>S.playM(G,GM,ev)}],outingMissed:(G,GM,q)=>S.missed(G,q)},
    {id:S.EV_W,title:'視訊',participants:[ZR],location:'any',trigger:'outing',background:'dark',hours:0.5,
      dialogue:[{scene:'視訊',bg:'video'},{call:(G,GM,ev)=>S.playW(G,GM,ev)}],outingMissed:(G,GM,q)=>S.missed(G,q)} ];
  if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVENTS) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  return S;
})();
