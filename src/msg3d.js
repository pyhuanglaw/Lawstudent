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
  /* 回覆時間（AA_202 6-1；BB_178 各人那一節）：free＝有空時幾分鐘；sleep＝幾點以後睡了（隔天 wake 點回）；wakeLine＝隔天早上那一句 */
  const TIMING={
    heroine_01:{free:[1,10],sleep:22.5,wake:7.25,wakeLine:['昨天睡了。早。']},
    heroine_03:{free:[10,60]}, zhe:{free:[1,3]}, yu:{free:[1,5]}, classmate_bohan:{free:[5,30],sleep:1.5,wake:9}, classmate_xinci:{free:[10,30],sleep:3,wake:9.5}
  };
  const DEF_TIMING={free:[5,30],sleep:0.5,wake:8};
  S.timing=id=>Object.assign({},DEF_TIMING,(POOL().people[id]||{}).timing||{},TIMING[id]||{});
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
  S.hasPool=(id,topic,mode)=>{ const L=((POOL().people[id]||{}).replies||[]); return L.some(e=>(topic==='share'?/^share/.test(e.topic):e.topic===topic)&&(mode!=='business'||e.variant==='事務版')); };
  /* ---------- 挑哪一句 ---------- */
  const TIME_TAGS=[['早上',h=>h>=5&&h<11],['中午',h=>h>=11&&h<14],['下午',h=>h>=12&&h<18],['傍晚',h=>h>=16&&h<19.5],['晚上',h=>h>=18||h<1],['深夜',h=>h>=23||h<5]];
  /* 標籤：認得的才判斷；認不得的（只適用特定情況的長句）不用——寧可用沒有標籤的一般句（3-1 第 1 點：沒有標籤＝任何時候都說得通） */
  S.tagOk=function(G,id,tag){ const t=T(G), h=G.hour%24, wd=G.weekday, brk=!t; const s=String(tag).replace(/[〔〕（）()]/g,'');
    const parts=s.split(/[、，,／\/]|；/).map(x=>x.trim()).filter(Boolean); if(!parts.length) return true;
    for(const p of parts){
      const tt=TIME_TAGS.find(([k])=>p===k||p===k+'時段'); if(tt){ if(!tt[1](h)) return false; continue; }
      if(p==='平日'){ if(wd===0||wd===6) return false; continue; } if(p==='週末'){ if(!(wd===0||wd===6)) return false; continue; }
      if(p==='學期中'){ if(brk) return false; continue; } if(p==='放假'||p==='寒暑假'||p==='放假中'){ if(!brk) return false; continue; }
      const y=p.match(/^(大[一二三四])(上|下)?$/); if(y){ const yy={大一:'Y1',大二:'Y2',大三:'Y3',大四:'Y4'}[y[1]]; const cur=t?t.id:(typeof HOME!=='undefined'&&HOME.breakOf?(((HOME.breakOf(G.day)||{}).key)||''):''); if(!cur.startsWith(yy)) return false; if(y[2]&&t&&t.id!==yy+(y[2]==='上'?'S1':'S2')) return false; continue; }
      if(/^(A|R|L)層?$/.test(p)) continue;
      return false; }
    return true; };
  /* 情況版（3-1 第 2 點）：在國外 → 放假（老家、旅行）→ 考試週 → 深夜 → 一般 */
  S.situations=function(G,id){ const pr=presence(G,id), t=T(G), h=G.hour%24, out=[];
    if(pr&&pr.here===false&&pr.kind==='abroad') out.push('在國外'); if(!t) out.push('放假','在老家'); if(t&&t.exam) out.push('考試週'); if(h>=23||h<5) out.push('深夜'); return out; };
  S.pick=function(G,id,topic,sub,opts){ opts=opts||{}; const R=S.rec(G), o=S.open(G,id); let tier=S.tier(G,id); const all=((POOL().people[id]||{}).replies||[]).filter(e=>topicKeys(topic,sub).includes(e.topic));
    const forMode=o.mode==='business'?all.filter(e=>e.variant==='事務版'):all.filter(e=>e.variant!=='事務版');
    const order=tier==='L'?['L','R','A']:(tier==='R'?['R','A']:['A','R']);
    const sit=S.situations(G,id), said=R.says[id]||{};
    for(const tr of order){ const inTier=forMode.filter(e=>e.tier===tr); if(!inTier.length) continue;
      for(const v of sit){ const c=inTier.filter(e=>e.variant&&e.variant.includes(v)&&(e.tags||[]).every(g=>S.tagOk(G,id,g))&&!(e.once&&said[e.msgs.join('|')])); if(c.length) return rot(R,id,topic+tr+v,c); }
      const gen=inTier.filter(e=>(!e.variant||e.variant==='閒聊版'||(o.mode==='business'&&e.variant==='事務版'))&&!S.isSituation(e.variant)&&(e.tags||[]).every(g=>S.tagOk(G,id,g))&&(!opts.late||!e.immediateOnly));
      if(gen.length) return rot(R,id,topic+tr,gen); }
    return null; };
  S.isSituation=v=>!!v&&/在國外|放假|在老家|旅行|考試週|深夜/.test(v);
  const rot=(R,id,key,c)=>{ const k=id+':'+key; const i=(R.rot[k]|0)%c.length; R.rot[k]=i+1; return c[i]; };
  /* ---------- 回覆時間 ---------- */
  const seedMin=(G,id,a,b)=>{ let x=G.day*31+id.length*7; for(const ch of id) x=(x*33+ch.charCodeAt(0))>>>0; return a+(x%(Math.max(1,b-a+1))); };
  const BUSY_ACTS=new Set(['class','club','work','job','tutor']);
  S.busyUntil=function(G,id){ if(id==='kevin') return null; const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; const e=c&&typeof STORY!=='undefined'&&STORY.schedEnt?STORY.schedEnt(c,G):null; if(!e) return null;
    const busy=BUSY_ACTS.has(e.act)||/打工|家教|上課|社課|練球|上班/.test(String(e.label||e.away||'')); return busy&&e.to!=null?e.to:null; };
  /* 什麼時候回：{day,h,late}（late＝隔天才回，先說 wakeLine） */
  S.replyAt=function(G,id){ const Tm=S.timing(id), h=G.hour%24, day=G.day+Math.floor(G.hour/24);
    const asleep=Tm.sleep!=null&&(Tm.sleep>=12?(h>=Tm.sleep||h<Tm.wake):(h>=Tm.sleep&&h<Tm.wake));
    if(asleep){ const nd=h>=12?day+1:day; return {day:nd,h:Tm.wake+seedMin(G,id,0,20)/60,late:true}; }
    const bu=S.busyUntil(G,id); const m=seedMin(G,id,Tm.free[0],Tm.free[1]);
    if(bu!=null&&bu>h) return {day,h:bu+m/60,late:false,after:true};
    return {day,h:h+m/60,late:false}; };
  /* ---------- 送出 ---------- */
  S.playerText=function(G,id,topic,sub){ if(topic==='share'){ const p=PHOTOS.find(q=>q.k===sub)||PHOTOS[0]; return p.post; } const R=S.rec(G), L=SAY[topic]||['在幹嘛']; const k='say:'+topic; const i=(R.rot[k]|0)%L.length; R.rot[k]=i+1; return L[i]; };
  S.send=function(G,id,topic,sub){ if(!S.canSend(G,id)) return {ok:false,why:S.open(G,id).why||'今天傳過了'}; if(!S.topics(G,id).some(q=>q.k===topic)) return {ok:false,why:'這個話題現在不行'};
    const R=S.rec(G), o=S.open(G,id), th='p:'+id; const text=S.playerText(G,id,topic,sub);
    if(typeof PHONE!=='undefined') PHONE.post(G,{th,from:'player',who:null,text});
    R.sent[id]=G.day; const wk=weekKey(G); const W=R.wk[id]&&R.wk[id].k===wk?R.wk[id]:(R.wk[id]={k:wk,n:0}); W.n++;
    if(o.mode==='silent') return {ok:true,silent:true,text};   /* 沛珊重考消失期：已送達、不回（BB_178 0-1）*/
    const at=S.replyAt(G,id); const e=S.pick(G,id,topic,sub,{late:at.late||at.after});
    const items=[]; const nm=id==='kevin'?'Kevin':undefined;
    if(at.late){ const wl=S.timing(id).wakeLine; if(wl&&wl.length) for(const t of wl) items.push({th,from:id,name:nm,text:t}); }
    if(e&&!(at.late&&topic==='night')){ e.msgs.forEach((t,i)=>{ const it={th,from:id,name:nm,text:t}; if(i===e.msgs.length-1&&e.ask&&e.ask.opts&&e.ask.opts.length) it.ask={opts:e.ask.opts.map(q=>({t:q.t,say:(q.r||[]).map(r=>({from:id,name:nm,text:r}))}))}; items.push(it); }); if(e.once){ (R.says[id]||(R.says[id]={}))[e.msgs.join('|')]=G.day; } }
    if(!items.length) items.push({th,from:id,name:nm,text:'（貼圖）'});
    if(typeof PHONE!=='undefined') PHONE.at(G,at.day,at.h,items,null);
    /* 熟悉度：同一個人一天最多 +1；一週傳超過三次那週不再加（第 4 節）*/
    if(W.n<=3&&typeof SOCIAL!=='undefined'&&SOCIAL.activity&&id!=='kevin') SOCIAL.activity(id,'msg');
    return {ok:true,text,at,entry:e}; };
  return S;
})();
