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
  S.rec=function(G){ if(!G.msgChat||typeof G.msgChat!=='object') G.msgChat={}; const R=G.msgChat; for(const k of ['sent','wk','rot','says']) if(!R[k]||typeof R[k]!=='object') R[k]={}; return R; };
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
  /* 什麼時候有「傳訊息」：回傳 {ok, why, mode}（mode：'business'＝學姊的事務版；'silent'＝沛珊重考消失期，只顯示已送達）。BB_178 0-1、AA_202 第 4 節 */
  S.open=function(G,id){ if((G.stage||'law')!=='law') return {ok:false,why:'經濟系那一年還沒有'};
    if(!met(G,id)||!hasContact(G,id)) return {ok:false,why:'還沒有聯絡方式'};
    const pr=presence(G,id); if(pr&&pr.here===false&&(pr.kind==='before'||pr.kind==='after')) return {ok:false,why:'聯絡不上'};
    if(id==='kexin') return G.flags&&G.flags.dating_kexin===true?{ok:true}:{ok:false,why:'分開以後不開'};
    if(id==='heroine_02'&&pr&&pr.here===false) return {ok:false,why:'她在英國，只寄明信片'};   /* 大三上交換、大四英國念研究所（presence absent Y3S1／Y4S1／Y4S2）*/
    if(id==='heroine_04'&&!evDone(G,'ev_ziqing_secret_game')) return {ok:false,why:'還沒有她的私訊'};
    if(id==='heroine_05'){ if(stageNum(id)<2) return {ok:false,why:'還不熟'}; const chat=stageNum(id)>=3&&!S.takenFor(G,id)&&!Object.keys(G.flags||{}).some(k=>k.indexOf('dating_')===0&&k!=='dating_heroine_05'&&G.flags[k]); return {ok:true,mode:chat||G.flags.dating_heroine_05?null:'business'}; }
    if(id==='classmate_peishan'&&inDates(G,'2026-12-17','2027-08-06')) return {ok:true,mode:'silent'};
    return {ok:true}; };
  S.sentToday=(G,id)=>S.rec(G).sent[id]===G.day;
  S.canSend=(G,id)=>{ const o=S.open(G,id); return o.ok&&!S.sentToday(G,id); };
  /* 這個人現在有哪些話題 */
  S.topics=function(G,id){ const o=S.open(G,id); if(!o.ok) return []; const t=T(G), h=G.hour%24, tier=S.tier(G,id), out=[];
    for(const q of TOPICS){
      if(q.k==='course'){ const c=COURSE[id]; if(!c||!t) continue; if(c==='senior'){ const pr=presence(G,id); if(pr&&pr.here===false) continue; } else if(c!=='all'&&!c.includes(t.id)) continue;
        if(id==='heroine_03') continue; }   /* 語彤社會系：問課不出現（AA_202 6-3） */
      if(q.k==='night'){ if(h<21.5&&h>=5) continue; if(S.takenFor(G,id)&&FEMALE.has(id)) continue; if(!(tier==='L'||stageNum(id)>=4)) continue; if(o.mode==='business') continue; }
      if(!S.hasPool(id,q.k==='share'?'share':q.k,o.mode)) continue;
      out.push(q); }
    return out; };
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
    if(p==='在臺灣') { const pr=presence(G,id); return !(pr&&pr.here===false&&pr.kind==='abroad'); } if(p==='在美國'){ const pr=presence(G,id); return !!(pr&&pr.here===false&&pr.kind==='abroad'); }
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
    return false; };
  const RANK={A:0,R:1,L:2};
  const tierFits=(e,tr)=>e.tier===tr||(!!e.tierMin&&RANK[e.tier]<=RANK[tr]);
  const versionOk=(e,mode)=>{ const v=e.version||(e.variant==='事務版'||e.variant==='閒聊版'?e.variant:null); if(!v) return true; if(/都/.test(v)) return true; return mode==='business'?v==='事務版':v==='閒聊版'; };
  const usable=(G,id,e,ctx)=>!e.disabled&&!(e.geFlag&&!(G.flags&&G.flags[e.geFlag]))&&!(e.immediateOnly&&!ctx.immediate)&&!(e.note&&/填|照日曆算/.test(e.note))&&!e.thenGeneral&&(e.tags||[]).every(g=>S.tagOk(G,id,g))&&versionOk(e,ctx.mode);
  S.pick=function(G,id,topic,sub,ctx){ ctx=Object.assign({},ctx||{}); const R=S.rec(G), o=S.open(G,id); ctx.mode=o.mode; const tier=S.tier(G,id);
    const all=((POOL().people[id]||{}).replies||[]).filter(e=>topicKeys(topic,sub).includes(e.topic));
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
    if(Tm.slots){ const nx=Tm.slots.find(x=>x>h+0.01); if(nx!=null) return {day,h:nx,late:false,after:true}; return {day:day+1,h:Tm.slots[0],late:true}; }   /* 學姊 */
    if(id==='heroine_02'&&yearNow(G)<=2&&S.takenFor(G,id)){ const s1=15+10/60; return h<s1?{day,h:s1,late:false,after:true}:{day:day+1,h:s1,late:true}; }   /* 芷若：祐廷交往中改 15:10 回（BB_70 1-2）*/
    const asleep=Tm.sleep!=null&&(Tm.sleep>=12?(h>=Tm.sleep||h<Tm.wake):(h>=Tm.sleep&&h<Tm.wake));
    if(asleep){ const nd=(Tm.sleep>=12&&h>=Tm.sleep)?day+1:day; return {day:nd,h:Tm.wake+seedMin(G,id,0,20)/60,late:true}; }
    for(const w of (Tm.win||[])) if(w.days.includes(wd)&&h>=w.from&&h<w.to) return {day,h:w.to,late:false,after:true,win:true};
    if(id==='heroine_04'&&yearNow(G)===4&&wd>=1&&wd<=5&&h>=9.5&&h<18.5) return {day,h:18.5+seedMin(G,id,0,30)/60,late:false,after:true};   /* 大四在工作室上班：平日白天不回 */
    const bu=S.busyUntil(G,id); const fast=Tm.fastFrom!=null&&h>=Tm.fastFrom&&h<Tm.fastTo; const m=fast?seedMin(G,id,0,2):seedMin(G,id,Tm.free[0],Tm.free[1]);
    if(bu!=null&&bu>h) return {day,h:bu+m/60,late:false,after:true};
    return {day,h:h+m/60,late:false,immediate:m<=2}; };
  /* ---------- 送出 ---------- */
  S.playerText=function(G,id,topic,sub){ if(topic==='share'){ const p=PHOTOS.find(q=>q.k===sub)||PHOTOS[0]; return p.post; } const R=S.rec(G), L=SAY[topic]||['在幹嘛']; const k='say:'+topic; const i=(R.rot[k]|0)%L.length; R.rot[k]=i+1; return L[i]; };
  /* 回問選項（3-1 第 6 點）：cond「接到問課」只在問課開的時候有、goto course＝接她問課的回覆；「在美國時換成」只在她在美國時 */
  S.askOpts=function(G,id,e,nm,ctx){ if(!e.ask||!e.ask.opts) return null; const abroad=S.tok(G,id,'在美國'), course=S.topics(G,id).some(q=>q.k==='course');
    const out=[]; for(const q of e.ask.opts){ if(q.cond&&/在美國時換成/.test(q.cond)&&!abroad) continue; if(q.goto==='course'&&(abroad||!course)) continue;
      let r=q.r||[]; if(q.goto==='course'){ const c=S.pick(G,id,'course',null,ctx); r=c?c.msgs:[]; } out.push({t:q.t,say:r.map(x=>({from:id,name:nm,text:x}))}); }
    return out.length?{opts:out}:null; };
  S.send=function(G,id,topic,sub){ if(!S.canSend(G,id)) return {ok:false,why:S.open(G,id).why||'今天傳過了'}; if(!S.topics(G,id).some(q=>q.k===topic)) return {ok:false,why:'這個話題現在不行'};
    const R=S.rec(G), o=S.open(G,id), th='p:'+id; const text=S.playerText(G,id,topic,sub);
    if(typeof PHONE!=='undefined') PHONE.post(G,{th,from:'player',who:null,text});
    R.sent[id]=G.day; const wk=weekKey(G); const W=R.wk[id]&&R.wk[id].k===wk?R.wk[id]:(R.wk[id]={k:wk,n:0}); W.n++;
    if(o.mode==='silent') return {ok:true,silent:true,text};   /* 沛珊重考消失期：已送達、不回（BB_178 0-1）*/
    const at=S.replyAt(G,id); const ctx={immediate:!!at.immediate,win:!!at.win,late:!!at.late};
    const e=S.pick(G,id,topic,sub,ctx);
    const items=[]; const nm=id==='kevin'?'Kevin':undefined;
    const pre=topic==='night'?null:S.prefix(G,id,topic,Object.assign({late:at.late},ctx));
    if(pre) for(const t of pre.msgs) items.push({th,from:id,name:nm,text:t});
    else if(at.late){ const wl=S.timing(id).wakeLine; if(wl&&wl.length) for(const t of wl) items.push({th,from:id,name:nm,text:t}); }
    if(e&&!(at.late&&topic==='night')){ const L=e.msgs.concat(S.addMsgs(G,id,e)); const ask=S.askOpts(G,id,e,nm,ctx);
      L.forEach((t,i)=>{ const it={th,from:id,name:nm,text:t}; if(i===L.length-1&&ask) it.ask=ask; items.push(it); }); }
    if(!items.length) items.push({th,from:id,name:nm,text:'（貼圖）'});
    if(typeof PHONE!=='undefined') PHONE.at(G,at.day,at.h,items,null);
    /* 熟悉度：同一個人一天最多 +1；一週傳超過三次那週不再加（第 4 節）*/
    if(W.n<=3&&typeof SOCIAL!=='undefined'&&SOCIAL.activity&&id!=='kevin') SOCIAL.activity(id,'msg');
    return {ok:true,text,at,entry:e}; };
  return S;
})();
