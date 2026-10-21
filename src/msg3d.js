/* ===== 玩家主動傳訊息給朋友（SYS-PHONE-CHAT／MSG-L1；AA_202 第 1～4 節、BB_178 第 0 節；回覆池 src/data/msg_pool.js）=====
   - 手機「訊息」→ 某人的一對一對話串 →「傳訊息」→ 話題：在幹嘛／問課／分享（貓、吃的、講義三選一）／晚安。同一個人一天一次（對方的回問答完就結束）。
   - 對方什麼時候回（AA_202 第 2 節）：有空＝照個性幾分鐘；上課、打工、社團、家教＝那一段結束以後；睡了＝隔天早上，先「昨天睡了」那一句（傳的是晚安就只回這一句，3-1 第 4 點）。
     回覆用 PHONE.at 排進去（時間到才出現，和其他手機訊息一樣）。
   - 回什麼（3-1）：照關係分三層 A（認識、有點熟）、R（朋友、好朋友）、L（交往中，或第 5 階以上而且兩人都單身；只有戀愛對象）；
     先挑情況版（在國外 → 放假 → 考試週 → 深夜），沒有才用一般版；同一層輪流用；句子的標籤（早上、平日、學期中、大一…）不對就不用。
   - 熟悉度：對方回了，同一個人一天最多 +1（SOCIAL.activity 'msg'）；一週傳超過三次，那週就不再加（第 4 節）。閒聊階梯不推進、不加戀愛、不扣分。
   - 祐廷和別人交往中，而且她知道（ROM.knowsOf）：其他女性角色一律友情版、不開晚安（第 4 節，2026-10-17 改讀「她知道」）。
   測試：node tests/msg_chat_unit.js */
'use strict';
const MSG=(function(){
  const S={};
  const POOL=()=>typeof MSG_POOL!=='undefined'?MSG_POOL:{people:{}};
  const TOPICS=[{k:'chat',t:'在幹嘛'},{k:'course',t:'問課'},{k:'share',t:'分享'},{k:'night',t:'晚安'}];
  /* 祐廷傳的字（AA_202 第 1 節的表）：照順序輪流 */
  const SAY={chat:['在幹嘛','你在哪'],course:['今天那堂你有抄到嗎','下禮拜要交什麼','這題你怎麼寫'],night:['晚安']};
  const PHOTOS=[{k:'cat',t:'路上的貓',post:'（照片：路上的貓）'},{k:'food',t:'今天吃的東西',post:'（照片：今天吃的東西）'},{k:'notes',t:'一張講義',post:'（照片：一張講義）'}];
  S.TOPICS=TOPICS; S.PHOTOS=PHOTOS;
  const keepReplies=()=>typeof HOMETOWN_LINES!=='undefined'&&HOMETOWN_LINES.classmate_peishan&&HOMETOWN_LINES.classmate_peishan.keep?HOMETOWN_LINES.classmate_peishan.keep.replies:null;
  const ROMANTIC=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  const FEMALE=new Set(['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin','yu','classmate_xinci']);
  /* 同一門課的同學（AA_202 第 1 節「問課」）：一直同班的／只有某幾個學期的／學長姐 */
  const COURSE={heroine_01:'all',zhe:'all',yu:'all',classmate_bohan:'all',classmate_xinci:'all',classmate_mingxuan:'all',
    heroine_02:['Y1S1','Y1S2'],classmate_peishan:['Y1S1','Y1S2','Y2S1'],heroine_05:'senior',kevin:['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2']};
  /* 回覆時間（AA_202 6-1；BB_178 各人那一節，原文在 MSG_POOL.people[id].rules.noReplyText）：
     free＝有空時幾分鐘；sleep～wake＝睡了（wake 點回，先說 wakeLine）；win＝固定不回的時段（days 星期、from～to，to 以後才回）；slots＝只在這幾個時間回（學姊）*/
  const TIMING={
    heroine_01:{free:[1,10],sleep:22.5,wake:7.25,wakeLine:['昨天睡了。早。']},
    heroine_03:{free:[10,60],win:[{days:[2,4],from:17,to:20.5}]},   /* 週二、週四麵店時間，20:30 以後才回 */
    zhe:{free:[1,3]}, yu:{free:[1,5]}, classmate_bohan:{free:[5,30],sleep:2,wake:8.5}, classmate_xinci:{free:[10,30],sleep:3,wake:9.5,fastFrom:0.5,fastTo:3},   /* 00:30 以後反而秒回 */
    heroine_02:{free:[5,30],sleep:1,wake:9,wakeLine:['昨天太晚看到了。']},   /* 上班時間由作息判斷；祐廷交往中改 15:10 回（replyAt 另外處理）*/
    heroine_04:{free:[1,10],sleep:3,wake:14,wakeLine:['早','剛看到'],fastFrom:22,fastTo:24},   /* 22～24 點最活躍、下午兩點才醒 */
    heroine_05:{slots:[12+10/60,17+5/60,22.5],wakeLine:['抱歉，昨天十點半就睡了。']},   /* 很準時：12:10、17:05、22:30；22:30 以後隔天 12:10 */
    kai:{free:[1,10],sleep:5,wake:13,wakeLine:['剛醒']},   /* 凌晨兩點到四點最活躍；一點以前傳的，一點才回 */
    classmate_mingxuan:{free:[1,10],sleep:1.5,wake:9,wakeLine:['昨天睡死 哈哈'],win:[{days:[2,4,6],from:19,to:21+5/60}]},   /* 二四六 19～21 家教，21:05 一次回 */
    npc_fangyt:{free:[10,60]}, kevin:{free:[1,5]}
  };
  const DEF_TIMING={free:[5,30],sleep:0.5,wake:8};
  S.timing=id=>Object.assign({},DEF_TIMING,TIMING[id]||{});
  const T=G=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null;
  const stageNum=id=>typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(id):(()=>{ const st=typeof SOCIAL!=='undefined'&&SOCIAL.stage?SOCIAL.stage(id):'STRANGER'; return Math.max(0,['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION'].indexOf(st)); })();
  const weekKey=G=>{ const t=T(G); return t?t.id+'W'+t.week:'D'+Math.floor(G.day/7); };
  S.rec=function(G){ if(!G.msgChat||typeof G.msgChat!=='object') G.msgChat={}; const R=G.msgChat; for(const k of ['sent','wk','rot','says','help','thx','bday','once']) if(!R[k]||typeof R[k]!=='object') R[k]={}; return R; };   /* once：一段期間只播一次的句子（子晴「芷若在英國」）；舊存檔沒有＝空的 */
  /* 祐廷和別人交往中，而且她知道（AA_202 第 4 節，2026-10-17：只在她知道時才算） */
  S.takenFor=function(G,id){ const F=G.flags||{}; for(const k in F){ if(k.indexOf('dating_')!==0||!F[k]) continue; const p=k.slice(7); if(p===id) continue;
      if(typeof ROM!=='undefined'&&ROM.knowsOf?ROM.knowsOf(G,id,p):true) return true; } return false; };
  const herPartner=(G,id)=>{ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; return !!(c&&c.partner&&typeof STORY!=='undefined'&&STORY.inTerms&&STORY.inTerms(G,c.partner)); };
  /* 層：L＝交往中，或第 5 階以上而且兩人都單身（AA_202 6 的格式註、AA_215／AA_216 R8）；R＝朋友、好朋友；A＝認識、有點熟 */
  S.tier=function(G,id){ const F=G.flags||{}; if(F['dating_'+id]===true) return 'L'; const n=stageNum(id);
    if(ROMANTIC.includes(id)&&id!=='kexin'&&n>=5&&!S.takenFor(G,id)&&!Object.keys(F).some(k=>k.indexOf('dating_')===0&&F[k])&&!herPartner(G,id)) return 'L';
    return n>=3?'R':'A'; };
  const met=(G,id)=>id==='kevin'?true:(typeof SOCIAL!=='undefined'&&SOCIAL.stage?SOCIAL.stage(id)!=='STRANGER':true);
  const hasContact=(G,id)=>id==='kevin'||(typeof INV!=='undefined'&&INV.hasContact?INV.hasContact(G,id):false);
  const presence=(G,id)=>typeof STORY!=='undefined'&&STORY.presence?STORY.presence(id,G):{here:true};
  const evDone=(G,e)=>!!(G.events&&G.events.done&&G.events.done[e]);
  const inDates=(G,a,b)=>typeof STORY!=='undefined'&&STORY.inDates?STORY.inDates(G,[[a,b]]):false;
  /* ---------- 芷若在英國：照交情聯絡（AA_276 第 2 節、BB_178 1-E〔bb6baddf；AA-C 266210fe 定稿〕；任務 VAC-ZR-UK-1017）----------
     兩段：大三上交換、大四在英國念研究所（人物的 presence：不在、away「英國」）。回覆池是 msg_pool.js 的情況版「在英國」（她在英國只用這一組，不用 Café 的句子）。
     交情（S.ukRow）：認識、有點熟＝不開（只寄明信片）；朋友＝開，一週回一兩次（週三、週日台灣 22:00＝她那邊的下午；這一段傳的只回最新一則，前面加「抱歉，這週比較忙。」）；
     好朋友、曖昧（第 5 階以上，兩人都單身＝S.tier 的 L）、交往中＝當天回；她那邊半夜（台灣 07:00～16:00，夏令 06:00～15:00）傳的，她起床再回、先說「我剛起床。」；
     交往中另外每天一則（英國 23:00 她睡前＝台灣 07:00，夏令 06:00；S.ukDaily，story3d.js 的手機規則每次叫）。前任：不開（BB_119 2-3）。
     沒做：每月／每週約好的視訊（中間話題、收尾的裂縫 ① 要 BB_119 2-3）、生日新年按鈕的英國句子（MSG-2 回覆池還沒有）、社群發文（AA_276：遊戲沒有，不做）*/
  S.inUK=(G,id)=>{ const pr=presence(G,id); return !!(pr&&pr.here===false&&/英國/.test(String(pr.away||''))); };
  /* 英國比台灣慢 8 小時；夏令時間慢 7 小時：2027-10-31 以前、2028-03-26～10-29、2029-03-25 以後（BB_178 1-E）*/
  S.ukOff=G=>{ const k=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).key:''; return (k<'2027-10-31'||(k>='2028-03-26'&&k<'2028-10-29')||k>='2029-03-25')?7:8; };
  S.ukRow=function(G,id){ const F=G.flags||{}; if(F['dating_'+id]===true) return 'dating'; if(F['EX_'+id]) return 'none'; if(stageNum(id)<3) return 'none'; return S.tier(G,id)==='L'?'close':'friend'; };
  const UK='在英國';
  const ukList=(G,id,topic,ctx)=>{ const tier=S.tier(G,id); return ((POOL().people[id]||{}).replies||[]).filter(e=>e.variant===UK&&(topic==='share'?/^share/.test(e.topic):e.topic===topic)&&tierFits(e,tier)&&usable(G,id,e,ctx||{mode:'uk'})); };
  S.ukHas=(G,id,topic)=>ukList(G,id,topic).length>0;
  S.UK_FRIEND_SLOTS=[{wd:3,h:22},{wd:0,h:22}];   /* 朋友「一週回一兩次」的兩個時間（BB_178 1-E 沒寫是哪幾天：LAWWW 定週三、週日，她那邊的下午）*/
  S.ukReplyAt=function(G,id,row){ const h=G.hour%24, day=G.day+Math.floor(G.hour/24);
    if(row==='friend'){ for(let k=0;k<8;k++){ const d=day+k, wd=CALENDAR.dateOf(d).wd%7; for(const sl of S.UK_FRIEND_SLOTS) if(sl.wd===wd&&(k>0||h<sl.h)) return {day:d,h:sl.h+seedMin(G,id,0,20)/60,late:false,after:true,ukFriend:d+'@'+sl.h}; } }
    const off=S.ukOff(Object.assign({},G,{day})), wake=8+off, sleep=off-1;   /* 她 08:00 起床、23:00 睡（英國時間）＝台灣 16:00／07:00（夏令 15:00／06:00）*/
    if(h>=sleep&&h<wake) return {day,h:wake+seedMin(G,id,0,20)/60,late:true,ukWake:true};
    const m=seedMin(G,id,5,30); return {day,h:h+m/60,late:false,immediate:false}; };
  /* 交往中每天一則（BB_178 1-E）：輪流、用完從頭；第 8 則（帶感情的那一句）一個月最多一次 */
  S.ukDaily=function(G){ const id='heroine_02'; if(typeof PHONE==='undefined'||!G||!G.flags||G.flags['dating_'+id]!==true||(G.stage||'law')!=='law'||!S.inUK(G,id)) return false;
    const tag='zr_uk_daily_'+G.day; if(PHONE.sent(G,tag)) return false; const L=((POOL().people[id]||{}).replies||[]).filter(e=>e.variant===UK&&e.topic==='daily'&&!e.disabled); if(!L.length) return false;
    const R=S.rec(G), mon=CALENDAR.dateOf(G.day).key.slice(0,7); let i=(R.rot['uk_daily']|0)%L.length, e=L[i];
    if((e.tags||[]).includes('一個月最多一次')&&R.ukAff===mon){ i=(i+1)%L.length; e=L[i]; }
    if((e.tags||[]).includes('一個月最多一次')) R.ukAff=mon; R.rot['uk_daily']=i+1;
    PHONE.at(G,G.day,S.ukOff(G)-1,e.msgs.map(t=>({th:'p:'+id,from:id,text:t})),tag); return true; };
  /* 子晴「芷若在英國」那一句（BB_178 第 2 節）：她在英國的那一段只播一次（段＝第幾次去英國：大三上、大四）*/
  S.zrUkKey=G=>{ const k=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).key:''; return k<'2028-06-01'?'Y3':'Y4'; };
  /* 什麼時候有「傳訊息」：回傳 {ok, why, mode}（mode：'business'＝學姊的事務版；'silent'＝沛珊重考消失期，只顯示已送達）。BB_178 0-1、AA_202 第 4 節 */
  /* 經濟系那一年交往以後的可昕（AA_301 MSG_KX_Y0；使用者 10-18「我還是不能聯絡女朋友啊，可昕？」）：10/17～2/13、7/12～8/29 開；2/14～7/11 住在一起不開（D103 重要的事當面講）*/
  const Y0=()=>typeof MSG_KX_Y0!=='undefined'?MSG_KX_Y0:null, DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):0;
  const y0In=(G,a,b)=>inDates(G,a,b);
  S.y0Pool=function(G){ const Y=Y0(); if(!Y) return []; const V=Y.variants.filter(v=>y0In(G,v.from,v.to)).sort((a,b)=>(DK(a.to)-DK(a.from))-(DK(b.to)-DK(b.from))).map(v=>v.variant);   /* 範圍短的（期末）先 */
    const out=[]; for(const t of ['chat','share_cat','share_food','share_notes','night']){ for(const v of V){ const L=Y.replies.filter(e=>e.topic===t&&e.variant===v); if(L.length){ out.push(...L); break; } } } return out; };   /* 同一個話題：這個時期最具體的那一版；都沒有就不出（AA_301 第 1 節）*/
  S.open=function(G,id){ if((G.stage||'law')==='econ'&&id==='kexin'&&G.flags&&G.flags.dating_kexin===true&&Y0()){ const c=Y0().closed; if(c&&y0In(G,c.from,c.to)) return {ok:false,why:c.why,show:true}; return S.y0Pool(G).length?{ok:true,mode:'y0'}:{ok:false,why:'經濟系那一年還沒有'}; }
    if((G.stage||'law')!=='law') return {ok:false,why:'經濟系那一年還沒有'};
    if(!met(G,id)||!hasContact(G,id)) return {ok:false,why:'還沒有聯絡方式'};
    const pr=presence(G,id); if(pr&&pr.here===false&&(pr.kind==='before'||pr.kind==='after')) return {ok:false,why:'聯絡不上'};
    if(id==='kexin') return G.flags&&G.flags.dating_kexin===true?{ok:true}:{ok:false,why:'分開以後不開'};
    if(id==='heroine_02'&&S.inUK(G,id)){ const row=S.ukRow(G,id); return row==='none'?{ok:false,why:'她在英國，只寄明信片'}:{ok:true,mode:'uk',uk:row}; }   /* 大三上交換、大四英國念研究所：照交情（AA_276 第 2 節、BB_178 1-E；原本一律只寄明信片）。回台中（presence home）照常傳 */
    if(id==='heroine_04'&&!evDone(G,'ev_ziqing_secret_game')) return {ok:false,why:'還沒有她的私訊'};
    if(id==='heroine_05'){ if(stageNum(id)<2) return {ok:false,why:'還不熟'}; const chat=stageNum(id)>=3&&!S.takenFor(G,id)&&!Object.keys(G.flags||{}).some(k=>k.indexOf('dating_')===0&&k!=='dating_heroine_05'&&G.flags[k]); return {ok:true,mode:chat||G.flags.dating_heroine_05?null:'business'}; }
    if(id==='classmate_peishan'&&inDates(G,'2026-12-17','2027-08-06')) return typeof STORY!=='undefined'&&STORY.psKeep&&STORY.psKeep(G)?{ok:true,mode:'keep'}:{ok:true,mode:'silent'};   /* 交往中的例外（AA_276 第 4、6-1 節）：她 23:00 以後回，句子在 hometown_lines.js */
    return {ok:true}; };
  S.sentToday=(G,id)=>S.rec(G).sent[id]===G.day;
  S.canSend=(G,id)=>{ const o=S.open(G,id); return o.ok&&!S.sentToday(G,id); };
  /* 這個人現在有哪些話題 */
  S.topics=function(G,id){ const o=S.open(G,id); if(!o.ok) return []; const t=T(G), h=G.hour%24, tier=S.tier(G,id), out=[];
    if(o.mode==='y0'){ const L=S.y0Pool(G); for(const q of TOPICS){ if(q.k==='course') continue; if(q.k==='night'&&h<21.5&&h>=5) continue; if(L.some(e=>q.k==='share'?/^share/.test(e.topic):e.topic===q.k)) out.push(q); } return out; }   /* 經濟系那一年的可昕（AA_301）*/
    if(o.mode==='uk'){ for(const q of TOPICS){ if(q.k==='course') continue; if(q.k==='night'&&((h<21.5&&h>=5)||S.takenFor(G,id))) continue; if(S.ukHas(G,id,q.k)) out.push(q); } return out; }   /* 芷若在英國：只有「在英國」那一組有的話題（朋友沒有晚安）；生日、新年等第二批話題的英國句子還沒有，先不開 */
    for(const q of TOPICS){
      if(q.k==='course'){ const c=COURSE[id]; if(!c||!t) continue; if(c==='senior'){ const pr=presence(G,id); if(pr&&pr.here===false) continue; } else if(c!=='all'&&!c.includes(t.id)) continue;
        if(id==='heroine_03') continue; }   /* 語彤社會系：問課不出現（AA_202 6-3） */
      if(q.k==='night'){ if(h<21.5&&h>=5) continue; if(S.takenFor(G,id)&&FEMALE.has(id)) continue; if(!(tier==='L'||stageNum(id)>=4)) continue; if(o.mode==='business') continue; }
      if(o.mode==='keep'){ if(q.k==='course') continue; out.push(q); continue; }   /* 沛珊消失期交往中：問課不開（她不在學校）*/
      if(!S.hasPool(id,q.k==='share'?'share':q.k,o.mode)) continue;
      out.push(q); }
    return out.concat(S.topics2(G,id,o)); };
  const topicKeys=(topic,sub)=>topic==='share'?['share_'+sub,'share']:[topic];
  S.hasPool=(id,topic,mode)=>{ const L=((POOL().people[id]||{}).replies||[]); return L.some(e=>(topic==='share'?/^share/.test(e.topic):e.topic===topic)&&!e.disabled&&versionOk(e,mode)); };
  /* ---------- 挑哪一句 ---------- */
  /* 標籤（3-1 第 1 點；BB_178 0-2）：認得的才判斷，認不得的那一句不用（寧可用沒有標籤的一般句：沒有標籤＝任何時候都說得通）。
     括號裡的說明、出處（`BB_171`）、「兩則輪流」「帶感情的那一句」這類寫給人看的字不算條件 */
  const TIME_TAGS=[['早上',h=>h>=5&&h<11],['中午',h=>h>=11&&h<14],['下午',h=>h>=12&&h<18],['傍晚',h=>h>=16&&h<19.5],['晚上',h=>h>=18||h<1],['深夜',h=>h>=23||h<5]];
  const YEAR={大一:1,大二:2,大三:3,大四:4};
  const yearNow=G=>{ const t=T(G); if(t) return +t.id[1]; const B=typeof HOME!=='undefined'&&HOME.breakOf?HOME.breakOf(G.day):null; return B&&B.key?+B.key[1]:0; };
  const semNow=G=>{ const t=T(G); return t?t.id.slice(2):''; };
  const md=G=>{ const k=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).key:''; const m=k.match(/-(\d\d)-(\d\d)$/); return m?{m:+m[1],d:+m[2]}:null; };
  const inMD=(G,a,b)=>{ const x=md(G); if(!x) return false; const v=x.m*100+x.d, lo=a[0]*100+a[1], hi=b[0]*100+b[1]; return lo<=hi?(v>=lo&&v<=hi):(v>=lo||v<=hi); };
  const IGNORE=/^(只在立即回覆|兩則輪流|三則輪流|這一段期間只播一次|事務版、閒聊版都一樣|事務版、閒聊版都用|事務版|閒聊版|R 以上|A 層|R 層|L 層)$|^`[A-Z]{2}_\d+`|^帶感情的那一句|^照.*(時間|輪流)|^每條路線都一樣|^照人在哪裡判斷/;
  S.tok=function(G,id,p){ const t=T(G), h=G.hour%24, wd=G.weekday, brk=!t;
    if(IGNORE.test(p)) return true;
    const tt=TIME_TAGS.find(([k])=>p===k); if(tt) return tt[1](h);
    if(p==='平日') return wd>=1&&wd<=5; if(p==='週末') return wd===0||wd===6; if(p==='學期中') return !brk; if(/^(放假|放假中|寒暑假)$/.test(p)) return brk; if(p==='暑假') return brk&&(()=>{ const x=md(G); return !!x&&x.m>=6&&x.m<=9; })();
    if(p==='考試週') return !!(t&&t.exam); if(p==='深夜') return h>=23||h<5; if(p==='下雨天') return G.weather==='rain'; if(p==='平日課後') return wd>=1&&wd<=5&&h>=12;
    if(p==='交往中') return !!(G.flags&&G.flags['dating_'+id]===true);   /* BB_178 1-E 交往中那一組 */
    if(p==='一個月最多一次') return true;   /* 芷若每天一則的第 8 則：S.ukDaily 管 */
    if(p==='兩人是朋友') return true;   /* 子晴「芷若在英國」（BB_178 第 2 節）：遊戲還沒有子晴×芷若的狀態（ZZ），她們是朋友 */
    if(p==='在臺灣') { const pr=presence(G,id); return !(pr&&pr.here===false&&pr.kind==='abroad'); } if(p==='在美國'){ const pr=presence(G,id); return !!(pr&&pr.here===false&&pr.kind==='abroad'); } if(p==='在老家'||p==='在老家或旅行'){ const pr=presence(G,id); return !!(pr&&pr.here===false&&pr.kind==='home'); }   /* AA_276：寒暑假回老家（可昕高雄、沛珊台中）*/
    let m=p.match(/^(?:祐廷)?(大[一二三四])(上|下)?(?:～(大[一二三四])(上|下)?)?(起)?$/);
    if(m){ const y=yearNow(G), a=YEAR[m[1]], b=m[3]?YEAR[m[3]]:(m[5]?9:a); if(!(y>=a&&y<=b)) return false; const sm=semNow(G);
      if(m[2]&&y===a&&!m[3]&&sm&&sm!==(m[2]==='上'?'S1':'S2')) return false; if(m[4]&&y===b&&sm&&m[4]==='上'&&sm!=='S1') return false; return true; }
    m=p.match(/^(\d{1,2})～(\d{1,2}) 月$/); if(m){ const x=md(G); if(!x) return false; const lo=+m[1], hi=+m[2]; return lo<=hi?(x.m>=lo&&x.m<=hi):(x.m>=lo||x.m<=hi); }
    m=p.match(/^(\d{1,2}) 月$/); if(m){ const x=md(G); return !!x&&x.m===+m[1]; }
    m=p.match(/^(?:寒假 |暑假 )?(\d{1,2})\/(\d{1,2})～(\d{1,2})\/(\d{1,2})$/); if(m) return inMD(G,[+m[1],+m[2]],[+m[3],+m[4]]);
    m=p.match(/^週([一二三四五六日])～([一二三四五六日]) (\d{1,2}):(\d\d) 以後$/); if(m){ const W='日一二三四五六'; const a=W.indexOf(m[1]), b=W.indexOf(m[2]); return wd>=a&&wd<=b&&h>=+m[3]+(+m[4])/60; }
    m=p.match(/^週([一二三四五六日])、週([一二三四五六日])(下午|晚上)?$/); if(m){ const W='日一二三四五六'; if(![W.indexOf(m[1]),W.indexOf(m[2])].includes(wd)) return false; return m[3]?TIME_TAGS.find(([k])=>k===m[3])[1](h):true; }
    m=p.match(/^(有|沒有) `([A-Z0-9_]+)`$/)||p.match(/^`([A-Z0-9_]+)`$/); if(m){ const f=m.length===3?m[2]:m[1], neg=m.length===3&&m[1]==='沒有'; const v=!!(G.flags&&G.flags[f])||(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(id,f)); return neg?!v:v; }
    if(p==='認識小語才有') return typeof SOCIAL!=='undefined'&&SOCIAL.stage?SOCIAL.stage('yu')!=='STRANGER':false;
    return false; };
  S.tagOk=function(G,id,tag){ const s=String(tag).replace(/（[^）]*）|\([^)]*\)|〔[^〕]*〕/g,'').trim(); if(!s) return true;
    const parts=s.split(/[、，；,]/).map(x=>x.trim()).filter(Boolean); return parts.every(p=>S.tok(G,id,p)); };
  /* 情況版（3-1 第 2 點；BB_178 0-3）：認得的才用；其他的（祐廷在國外、在山上…）先不用 */
  S.sitOk=function(G,id,v,ctx){ if(!v||v==='閒聊版'||v==='事務版') return null; const t=T(G), h=G.hour%24;
    if(v==='考試週') return !!(t&&t.exam); if(v==='深夜') return h>=23||h<5; if(v==='00:30 以後傳的') return h>=0.5&&h<5;
    if(/^(放假|放假中)$/.test(v)||/^放假[、]?在/.test(v)||/^過年回/.test(v)||/^寒假留/.test(v)) return !t;
    if(/^大四/.test(v)) return yearNow(G)===4&&!/倫敦/.test(v);
    if(v==='在美國') return S.tok(G,id,'在美國');
    if(v==='家教日 21:05') return !!(ctx&&ctx.win);
    if(v==='上午傳的') return !!(ctx&&ctx.late)&&yearNow(G)<=3;   /* 子晴：下午兩點才醒，前一晚到早上傳的（大一～大三；大四照上班時間）*/
    if(v==='大三起、課輔班那天'||v==='大三起、書店那天') return yearNow(G)>=3;
    if(v==='大二下在家重考') return yearNow(G)===2&&semNow(G)==='S2';
    if(v==='芷若在英國') return S.inUK(G,'heroine_02')&&typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has('heroine_02','FIRST_MET')&&!S.rec(G).once[id+':zr_uk:'+S.zrUkKey(G)];   /* 子晴（BB_178 第 2 節）：祐廷認識芷若；一段期間只播一次 */
    return false; };
  const RANK={A:0,R:1,L:2};
  const tierFits=(e,tr)=>e.tier===tr||(!!e.tierMin&&RANK[e.tier]<=RANK[tr]);
  const versionOk=(e,mode)=>{ const v=e.version||(e.variant==='事務版'||e.variant==='閒聊版'?e.variant:null); if(!v) return true; if(/都/.test(v)) return true; return mode==='business'?v==='事務版':v==='閒聊版'; };
  const usable=(G,id,e,ctx)=>!e.disabled&&!(e.geFlag&&!(G.flags&&G.flags[e.geFlag]))&&!(e.immediateOnly&&!ctx.immediate)&&!(e.note&&/填|照日曆算/.test(e.note))&&!e.thenGeneral&&(e.tags||[]).every(g=>S.tagOk(G,id,g))&&versionOk(e,ctx.mode);
  S.pick=function(G,id,topic,sub,ctx){ ctx=Object.assign({},ctx||{}); const R=S.rec(G), o=S.open(G,id); ctx.mode=o.mode; const tier=S.tier(G,id);
    if(o.mode==='y0'){ const c=S.y0Pool(G).filter(e=>topicKeys(topic,sub).includes(e.topic)); return c.length?rot(R,id,'y0:'+topic+(sub||'')+'|'+c[0].variant,c):null; }   /* 經濟系那一年的可昕（AA_301）*/
    const all=((POOL().people[id]||{}).replies||[]).filter(e=>topicKeys(topic,sub).includes(e.topic));
    if(o.mode==='uk'){ const U=all.filter(e=>e.variant===UK&&tierFits(e,tier)&&usable(G,id,e,ctx)); return U.length?rot(R,id,'uk:'+topic+(sub||''),U):null; }   /* 芷若在英國：只用「在英國」那一組（朋友那一組好朋友、交往中也用：tierMin）*/
    const order=tier==='L'?['L','R','A']:(tier==='R'?['R','A']:['A','R']);
    for(const tr of order){ const inTier=all.filter(e=>tierFits(e,tr)&&usable(G,id,e,ctx)); if(!inTier.length) continue;
      const sit=inTier.filter(e=>S.sitOk(G,id,e.variant,ctx)===true); if(sit.length) return rot(R,id,topic+tr+'|'+sit[0].variant,sit);
      const gen=inTier.filter(e=>S.sitOk(G,id,e.variant,ctx)===null); if(gen.length) return rot(R,id,topic+tr,gen); }
    return null; };
  /* 開頭句（thenGeneral）：先說這一句，再接一般版（明軒「剛家教完 你說什麼」、子晴「早／剛看到」；BB_178）*/
  S.prefix=function(G,id,topic,ctx){ const R=S.rec(G); const c=((POOL().people[id]||{}).replies||[]).filter(e=>e.thenGeneral&&e.topic===topic&&!e.disabled&&S.sitOk(G,id,e.variant,ctx)===true); return c.length?rot(R,id,'pre:'+topic+'|'+c[0].variant,c):null; };
  S.addMsgs=function(G,id,e){ const A=e.addIf; if(!A) return []; const tag=String(A.tag||''); let ok=false; if(tag==='下雨天') ok=G.weather==='rain'; else { const m=tag.match(/(\d{1,2})～(\d{1,2}) 月/); if(m){ const x=md(G); ok=!!x&&x.m>=+m[1]&&x.m<=+m[2]; } } return ok?(A.msgs||[]):[]; };
  const rot=(R,id,key,c)=>{ const k=id+':'+key; const i=(R.rot[k]|0)%c.length; R.rot[k]=i+1; return c[i]; };
  /* ---------- 回覆時間 ---------- */
  const seedMin=(G,id,a,b)=>{ let x=G.day*31+id.length*7; for(const ch of id) x=(x*33+ch.charCodeAt(0))>>>0; return a+(x%(Math.max(1,b-a+1))); };
  const BUSY_ACTS=new Set(['class','club','work','job','tutor']);
  S.busyUntil=function(G,id){ if(id==='kevin') return null; const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; const e=c&&typeof STORY!=='undefined'&&STORY.schedEnt?STORY.schedEnt(c,G):null; if(!e) return null;
    const busy=BUSY_ACTS.has(e.act)||/打工|家教|上課|社課|練球|上班/.test(String(e.label||e.away||'')); return busy&&e.to!=null?e.to:null; };
  /* 什麼時候回：{day,h,late,after,win,immediate}（late＝隔天才回，先說 wakeLine） */
  S.replyAt=function(G,id){ const Tm=S.timing(id), h=G.hour%24, wd=G.weekday, day=G.day+Math.floor(G.hour/24);
    if(id==='heroine_02'&&S.inUK(G,id)){ const row=S.ukRow(G,id); if(row!=='none') return S.ukReplyAt(G,id,row); }   /* 芷若在英國（BB_178 1-E）*/
    { const pr=presence(G,id); if(pr&&pr.here===false&&pr.kind==='trip'&&!pr.signal&&pr.back!=null&&pr.back>day) return {day:pr.back,h:15,late:true}; }   /* 方奕廷暑假上山沒訊號（BB_171 第 1 節「常常晚好幾天才回」）：下山那天 15:00 才回（照寒假初三 15:00 的做法）。signal＝短期出門有訊號（AA_350 S4、S8：阿凱日本／曼谷、以安東京／京都、小語營隊），照平常回 */
    if(Tm.slots){ const nx=Tm.slots.find(x=>x>h+0.01); if(nx!=null) return {day,h:nx,late:false,after:true}; return {day:day+1,h:Tm.slots[0],late:true}; }   /* 學姊 */
    if(id==='heroine_02'&&yearNow(G)<=2&&S.takenFor(G,id)){ const s1=15+10/60; return h<s1?{day,h:s1,late:false,after:true}:{day:day+1,h:s1,late:true}; }   /* 芷若：祐廷交往中改 15:10 回（BB_70 1-2）*/
    const asleep=Tm.sleep!=null&&(Tm.sleep>=12?(h>=Tm.sleep||h<Tm.wake):(h>=Tm.sleep&&h<Tm.wake));
    if(asleep){ const nd=(Tm.sleep>=12&&h>=Tm.sleep)?day+1:day; return {day:nd,h:Tm.wake+seedMin(G,id,0,20)/60,late:true}; }
    for(const w of (Tm.win||[])) if(w.days.includes(wd)&&h>=w.from&&h<w.to) return {day,h:w.to,late:false,after:true,win:true};
    if(id==='heroine_04'&&yearNow(G)===4&&wd>=1&&wd<=5&&h>=9.5&&h<18.5) return {day,h:18.5+seedMin(G,id,0,30)/60,late:false,after:true};   /* 大四在工作室上班：平日白天不回 */
    const bu=S.busyUntil(G,id); const fast=Tm.fastFrom!=null&&h>=Tm.fastFrom&&h<Tm.fastTo; const m=fast?seedMin(G,id,0,2):seedMin(G,id,Tm.free[0],Tm.free[1]);
    if(bu!=null&&bu>h) return {day,h:bu+m/60,late:false,after:true};
    return {day,h:h+m/60,late:false,immediate:m<=2}; };
  /* ---------- 第二批話題（MSG-2：謝謝、生日快樂、還好嗎、新年快樂；AA_202 第 7 節、AA_257、BB_178 第 10 節）---------- */
  const POOL2=()=>typeof MSG2_POOL!=='undefined'?MSG2_POOL:{people:{},topics:{}};
  const TOPICS2=[{k:'thanks',t:'謝謝'},{k:'bday',t:'生日快樂'},{k:'ok',t:'還好嗎'},{k:'newyear',t:'新年快樂'}];
  S.isT2=k=>TOPICS2.some(q=>q.k===k);
  const dayOf=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const evDay=(G,e)=>{ const L=G.events&&G.events.last; return L&&L[e]!=null?L[e]:null; };
  const calY=G=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).y:0;
  /* 新年＝1/1，以及除夕到初三（calendar.js 的春節假：「除夕」「春節」×3；不含除夕前一日和補假）*/
  const hol=d=>{ if(typeof CALENDAR==='undefined'||!CALENDAR.holidaysOf) return null; const x=CALENDAR.dateOf(d); return CALENDAR.holidaysOf(x.y)[x.key]||null; };
  S.lunarNY=G=>{ const n=hol(G.day); return n==='除夕'||n==='春節'; };
  const chuSan=G=>{ for(let d=G.day;d>=G.day-4;d--) if(hol(d)==='除夕') return d+3; return null; };
  const isMD=(G,m,d)=>{ const x=md(G); return !!x&&x.m===m&&x.d===d; };
  S.newYearDay=G=>isMD(G,1,1)||S.lunarNY(G);
  /* 「謝謝」「還好嗎」的「事」對到遊戲裡的哪一場（AA_202 7-1「條件表 LAWWW 照各人事件的旗標列」、7-2；BB_178 10-2、10-3）：
     ev＝那一場演過那天起算（G.events.last）；flag＝那一場要選到的選項；help:'notes'＝問課時對方回了筆記照片（通則）；on／dates＝固定日期；msg＝她傳的那則（PHONE.sent）；stage＝熟悉度門檻。
     表裡沒有的（遊戲裡還沒有那一場、日期還沒定：家教學生的家被駁回、交換出發前一週、系籃輸球、小語的營隊、國考前一週、M2、F3、學姊 US2、W15…）＝不開 */
  const EV2={
    'heroine_01:yu_argument':{ev:'ev_an_yu_argument'},
    'heroine_03:aunt_hand':{ev:'ev_yutong_absent'},   /* AA_11 事件 4：阿姨扭到手、她顧店的那兩週 */
    'heroine_03:dm_exam_eve':{on:'2026-06-17'},   /* 雙主修筆試 6/18（AA_250 第 2 節）的前一天 */
    'classmate_bohan:split_peishan':{ev:'ev_peishan_bohan_split'},
    'classmate_xinci:rank_second':{ev:'ev_xinci_second'},
    'heroine_02:z2_ge_group':{ev:'ev_zhiruo_ge_group',flag:'ge_group_zhiruo'},   /* 選「我已經有組了」的沒有這個旗標 */
    'heroine_02:z9_ticket':{ev:'ev_zhiruo_last_shift'},
    'heroine_02:notes_photo':{help:'notes'},
    'heroine_02:z4_secret':{ev:'ev_zhiruo_secret'},
    'heroine_02:z7_applied':{msg:'zr_z7_msg',dates:['2026-12-10','2026-12-13']},   /* 12/10 23:59 她傳「我交了」，3 天（12/11～12/13）*/
    'heroine_04:q7_lab_letter':{ev:'ev_ziqing_lab_letter'},
    'heroine_04:q8_dad_visit':{ev:'ev_ziqing_dad_visit'},
    'heroine_05:old_books':{ev:'ev_sis_books_y1s2'},
    'heroine_05:low_night':{ev:'ev_sis_low_night'},
    'heroine_05:grad_exam':{dates:['2026-02-01','2026-02-02'],stage:2},
    'classmate_peishan:notes_files':{help:'notes'},
    'classmate_peishan:p3_retake':{ev:'ev_peishan_decision'},
    'classmate_peishan:bohan_split':{ev:'ev_peishan_bohan_split',stage:2},
    'kexin:k10c_bad_exam':{ev:'ev_kexin_bad_exam'},
    'kai:k1_keyboard':{ev:'ev_kai_keyboard_quiet'},
    'kai:k2_engineer':{ev:'ev_kai_engineer'},
    'kai:k5_sue':{ev:'ev_kai_can_they_sue'},
    'classmate_mingxuan:m1_highlighter':{ev:'ev_mingxuan_notes',flag:'GREEN_HIGHLIGHTER'},   /* 坐到他旁邊的那個選項 */
    'classmate_mingxuan:tutor_intro':{ev:'ev_mingxuan_tutor_intro',flag:'TUTOR_WD'},   /* 答應的那一次 */
    'classmate_mingxuan:notes_photo':{help:'notes'},
    'npc_fangyt:f1_pothos':{ev:'ev_fangyt_pothos',flag:'POTHOS'},
    'kevin:old_book':{flag:'KEVIN_OLD_BOOK',from:['2025-09-05',20]},
    'kevin:notes_exams':{help:'notes'} };
  const AA6_NOTES=['heroine_01','zhe','yu','classmate_bohan','classmate_xinci'];   /* AA 六位的「謝謝」沒有固定事件：先用通則（問課她回了筆記照片）；語彤沒有問課，不開 */
  S.conds2=function(G,id,topic){ const P=POOL2().people[id]; if(!P) return []; let L=(P.conds&&P.conds[topic])||[];
    if(topic==='thanks'&&!L.length&&AA6_NOTES.includes(id)) L=[{key:'notes_photo'}];
    const R=S.rec(G), out=[], n0=topic==='thanks'?7:3;
    for(const c of L){ const m=EV2[id+':'+c.key]||(c.key==='notes_photo'&&AA6_NOTES.includes(id)?{help:'notes'}:null); if(!m) continue;
      const nd=(String(c.days||'').match(/(\d+) 天/)||[])[1], n=nd?+nd:n0; let d=null;
      if(m.ev){ d=evDay(G,m.ev); if(d==null) continue; if(m.flag&&(G.flags||{})[m.flag]==null) continue; if(m.flag&&G.flags[m.flag]===false) continue; }
      else if(m.help){ const h=R.help[id]; if(!h||h.k!==m.help) continue; d=h.day; if(c.date&&c.date!=='同班期間'&&!S.tagOk(G,id,c.date)) continue; }
      else if(m.flag){ if(!(G.flags||{})[m.flag]) continue; d=dayOf(m.from[0]); if(d==null||G.day<d||(G.day===d&&G.hour%24<m.from[1])) continue; }
      if(m.on){ if(!inDates(G,m.on,m.on)) continue; d=G.day; }
      if(m.dates){ if(!inDates(G,m.dates[0],m.dates[1])) continue; if(d==null) d=dayOf(m.dates[0]); }
      if(m.msg&&!(typeof PHONE!=='undefined'&&PHONE.sent&&PHONE.sent(G,m.msg))) continue;
      if(m.stage&&stageNum(id)<m.stage) continue;
      if(d==null) continue;
      if(!m.on&&!m.dates&&(G.day<d||G.day>d+n)) continue;
      if(topic==='thanks'&&R.thx[id+':'+c.key]===d) continue;
      out.push({key:c.key,day:d}); }
    return out.sort((a,b)=>b.day-a.day); };
  /* 生日的分年份列：y2026_2027＝那幾年；y2028_japan＝那一年而且祐廷在日本；route_c（可昕走向 C）還沒有這條路線＝不用 */
  const bdayRowOk=(G,key)=>{ if(key==null) return true; const m=String(key).match(/^y(\d{4}(?:_\d{4})*)/); if(!m||!m[1].split('_').map(Number).includes(calY(G))) return false;
    if(/_japan$/.test(key)) return typeof STORY!=='undefined'&&!!STORY.route&&STORY.route(G)==='JP'&&!!STORY.abroad&&STORY.abroad(G); return true; };
  /* 第二批的標籤（AA_257 寫在句子後面括號裡的） */
  const TAG2=[[/^過年(；初三 15:00 以後才回)?$/,G=>S.lunarNY(G)],[/^1\/1，大一、大二$/,G=>isMD(G,1,1)&&yearNow(G)>=1&&yearNow(G)<=2],
    [/^(\d{1,2})\/(\d{1,2})$/,(G,m)=>isMD(G,+m[1],+m[2])],[/^2025、2026，Café 有班$/,G=>calY(G)===2025||calY(G)===2026],
    [/^看過 Q6 才用；沒看過：只有第一則$/,()=>true],   /* 子晴的私訊本來就要 Q6 以後才開 */
    [/^(阿姨扭到手|筆試前一天|分開以後|國考前)$/,(G,m,e)=>e.cond!=null]];   /* 這幾個是「事」的名字，和 cond 同一件 */
  const tag2Ok=(G,id,e,tag)=>{ for(const [re,f] of TAG2){ const m=String(tag).match(re); if(m) return f(G,m,e); } return S.tagOk(G,id,tag); };
  const usable2=(G,id,e)=>!e.disabled&&!e.noReply&&(e.msgs||[]).length>0&&!(e.flags||[]).some(f=>!(G.flags&&G.flags[f]))&&(e.tags||[]).every(g=>tag2Ok(G,id,e,g));
  S.pick2=function(G,id,topic,peek){ const P=POOL2().people[id]; if(!P) return null; const o=S.open(G,id), tier=o.mode==='business'?'A':S.tier(G,id), R=S.rec(G);   /* 學姊閒聊條件不成立：四個話題都用 A（事務版；BB_178 10-6）*/
    let all=(P.replies||[]).filter(e=>e.topic===topic), act=null;
    if(topic==='thanks'||topic==='ok'){ act=S.conds2(G,id,topic)[0]; if(!act) return null; all=all.filter(e=>e.cond==null||e.cond===act.key); }
    if(topic==='bday') all=all.filter(e=>bdayRowOk(G,e.cond));
    const order=tier==='L'?['L','R','A']:(tier==='R'?['R','A']:['A','R']);
    for(const tr of order){ const inT=all.filter(e=>e.tier===tr); if(!inT.length) continue;
      const spec=inT.filter(e=>e.cond!=null), ok=(spec.length?spec:inT).filter(e=>usable2(G,id,e));
      if(!ok.length){ if(topic==='bday'&&spec.length) return null; continue; }   /* 學姊 2028、2029 照 BB_98 2-11、BB_99 2-6（那兩節的句子還沒進回覆池）：那兩年先不開 */
      return {e:peek?ok[0]:rot(R,id,'2:'+topic+tr+(act?'|'+act.key:''),ok),act}; }
    return null; };
  S.topics2=function(G,id,o){ const P=POOL2().people[id], out=[]; if(!P) return out; const x=md(G);
    for(const q of TOPICS2){
      if(q.k==='bday'&&!(x&&P.birthday===String(x.m).padStart(2,'0')+'-'+String(x.d).padStart(2,'0'))) continue;
      if(q.k==='newyear'&&!S.newYearDay(G)) continue;
      if(o.mode==='silent'){ if(q.k==='bday'||q.k==='newyear') out.push(q); continue; }   /* 沛珊重考消失期：生日、新年照開，已送達、不回（BB_178 10-0 第 7 點）*/
      if(S.pick2(G,id,q.k,true)) out.push(q); }
    return out; };
  /* ---------- 送出 ---------- */
  S.playerText=function(G,id,topic,sub){ if(S.isT2(topic)){ const L=(POOL2().topics[topic]||{}).say||[topic], R=S.rec(G), k='say:'+topic, i=(R.rot[k]|0)%L.length; R.rot[k]=i+1; return L[i]; }
    if(topic==='share'){ const p=PHOTOS.find(q=>q.k===sub)||PHOTOS[0]; return p.post; } const R=S.rec(G), L=SAY[topic]||['在幹嘛']; const k='say:'+topic; const i=(R.rot[k]|0)%L.length; R.rot[k]=i+1; return L[i]; };
  /* 回問選項（3-1 第 6 點）：cond「接到問課」只在問課開的時候有、goto course＝接她問課的回覆；「在美國時換成」只在她在美國時 */
  S.askOpts=function(G,id,e,nm,ctx){ if(!e.ask||!e.ask.opts) return null; const abroad=S.tok(G,id,'在美國'), course=S.topics(G,id).some(q=>q.k==='course');
    const out=[]; for(const q of e.ask.opts){ if(q.cond&&/在美國時換成/.test(q.cond)&&!abroad) continue; if(q.goto==='course'&&(abroad||!course)) continue;
      let r=q.r||[]; if(q.goto==='course'){ const c=S.pick(G,id,'course',null,ctx); r=c?c.msgs:[]; } out.push({t:q.t,say:r.map(x=>/^（旁白：/.test(x)?{from:null,text:x}:{from:id,name:nm,text:x})}); }
    return out.length?{opts:out}:null; };
  S.send=function(G,id,topic,sub){ if(!S.canSend(G,id)) return {ok:false,why:S.open(G,id).why||'今天傳過了'}; if(!S.topics(G,id).some(q=>q.k===topic)) return {ok:false,why:'這個話題現在不行'};
    const R=S.rec(G), o=S.open(G,id), th='p:'+id; const text=S.playerText(G,id,topic,sub);
    if(typeof PHONE!=='undefined') PHONE.post(G,{th,from:'player',who:null,text});
    R.sent[id]=G.day; const wk=weekKey(G); const W=R.wk[id]&&R.wk[id].k===wk?R.wk[id]:(R.wk[id]={k:wk,n:0}); W.n++;
    if(topic==='bday') R.bday[id+':'+calY(G)]=G.day;   /* 沛珊放榜那天（2027-08-06）看 3/15 有沒有傳過（AA_257 §4 表下註）*/
    if(o.mode==='silent') return {ok:true,silent:true,text};   /* 沛珊重考消失期：已送達、不回（BB_178 0-1）*/
    if(o.mode==='keep'&&!S.isT2(topic)){ const KR=keepReplies(), L=KR&&(KR[topic==='share'?'share_'+(sub||'cat'):topic]||KR[topic])||[]; const k='keep:'+topic+(topic==='share'?'_'+(sub||'cat'):''), i=(R.rot[k]|0)%Math.max(1,L.length); R.rot[k]=i+1;
      const h0=G.hour%24, at={day:G.day+Math.floor(G.hour/24),h:h0>=23?h0+0.1:23+seedMin(G,id,0,20)/60}; if(L.length&&typeof PHONE!=='undefined') PHONE.at(G,at.day,at.h,[{th,from:id,text:L[i]}],null); return {ok:true,text,at,keep:true}; }   /* 23:00 以後才看手機：白天傳的當晚一起回（AA_276 6-1）*/
    const at=S.replyAt(G,id); if(o.mode==='keep'){ const h0=G.hour%24; if(at.day===G.day&&h0<23&&at.h<23) Object.assign(at,{h:23+seedMin(G,id,0,20)/60,immediate:false,late:false}); }   /* 謝謝、生日、新年（AA_257 的 L）也延到 23:00 */
    const ctx={immediate:!!at.immediate,win:!!at.win,late:!!at.late};
    const t2=S.isT2(topic), pk=t2?S.pick2(G,id,topic):null; const e=t2?(pk&&pk.e):S.pick(G,id,topic,sub,ctx);
    if(pk&&pk.act&&topic==='thanks') R.thx[id+':'+pk.act.key]=pk.act.day;   /* 謝謝：同一件事一次 */
    if(t2&&e&&(e.tags||[]).some(g=>/初三 15:00 以後才回/.test(g))){ const c3=chuSan(G); if(c3!=null&&(at.day<c3||(at.day===c3&&at.h<15))) Object.assign(at,{day:c3,h:15+seedMin(G,id,0,30)/60,late:false,after:true,immediate:false}); }   /* 方奕廷過年在山上（AA_257 §8）*/
    if(topic==='course'&&e&&e.msgs.some(t=>/^（照片/.test(t))) R.help[id]={k:'notes',day:at.day};   /* 問課附筆記照片（BB_178 10-3 的「通則」）→ 7 天內有「謝謝」*/
    const items=[]; const nm=id==='kevin'?'Kevin':undefined;
    const pre=topic==='night'?null:S.prefix(G,id,topic,Object.assign({late:at.late},ctx));
    if(pre) for(const t of pre.msgs) items.push({th,from:id,name:nm,text:t});
    else if(at.late&&!(e&&e.noWake)){ const wl=at.ukWake?['我剛起床。']:S.timing(id).wakeLine; if(wl&&wl.length) for(const t of wl) items.push({th,from:id,name:nm,text:t}); }   /* 芷若在英國：她那邊半夜傳的，起床先回「我剛起床。」（BB_178 1-E）*/
    if(e&&!(at.late&&topic==='night')){ const L=e.msgs.concat(S.addMsgs(G,id,e)); const ask=S.askOpts(G,id,e,nm,ctx);
      L.forEach((t,i)=>{ const it={th,from:id,name:nm,text:t}; if(i===L.length-1&&ask) it.ask=ask; items.push(it); }); }
    if(!items.length) items.push({th,from:id,name:nm,text:'（貼圖）'});
    if(e&&e.variant==='芷若在英國') R.once[id+':zr_uk:'+S.zrUkKey(G)]=G.day;   /* 一段期間只播一次 */
    if(at.ukFriend&&typeof PHONE!=='undefined'){ const tag='zr_uk_r_'+at.ukFriend, P=PHONE.rec(G); P.q=P.q.filter(q=>q.tag!==tag); items.unshift({th,from:id,name:nm,text:'抱歉，這週比較忙。'}); PHONE.at(G,at.day,at.h,items,tag); }   /* 芷若在英國、朋友：這一段傳的只回最新一則（前面那則排好的回覆拿掉），前面加「抱歉，這週比較忙。」（BB_178 1-E）*/
    else if(typeof PHONE!=='undefined') PHONE.at(G,at.day,at.h,items,null);
    /* 熟悉度：同一個人一天最多 +1；一週傳超過三次那週不再加（第 4 節）*/
    if(W.n<=3&&typeof SOCIAL!=='undefined'&&SOCIAL.activity&&id!=='kevin') SOCIAL.activity(id,'msg');
    return {ok:true,text,at,entry:e}; };
  return S;
})();
