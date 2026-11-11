// 選項的效果、每次約會都有選項（DLG-FX-MECH-1110；使用者 X324，AA_746 第 2 節）——不需要瀏覽器（D131）。
// 使用者 11-10 20:0x（對 AA）：「每次約會都要有選擇性的對話選項，依據選項內容增加友情或者愛情」
// 稽核（AA_746、audit_1110/）：校外約會 1,765 個選項沒有任何效果、只在第一次到那個互動點出現。AA 之後照這裡的格式改稿；這支測試用假資料確認機制（資料沒有新欄位＝和原本一樣）。
//   1. SOCIAL.applyFx(G,id,{fr,love})：fr＝熟悉、信任、自在各 +n；love＝她的戀愛（可以攻略的對象）；0＝不動、負的照扣；MOVIES.fx 叫同一支
//   2. 校外約會（src/date3d.js）：選項 {t, reply|re, fx}——fx 照算、re（字串／陣列／括號＝旁白）當她的回答；沒有 fx 的選項＝只有原本的加法
//   3. 校外約會：互動點的 opts＝{first, again, dating}——第二次以後到同一個互動點出 again（好幾組＝輪流）、交往中出 dating；抵達、收尾也可以有；
//      沒有 opts＝第二次以後沒有選項（原本的樣子）；輪到第幾組記在存檔（dateMemory…optN），舊存檔沒有＝第一組
//   4. 閒聊階梯（src/story3d.js ladPlay／ladNext）：層的 fx、選項的 fx／re；那個人那個學期的 dating 陣列＝交往中那一階（進度另外記、不占 steps）
//   5. 期末飯（src/termend3d.js）：話題池／飯桌句的 {say, opts:[{t,re,fx}]}（或 {choice}）＝玩家選、不再自動回「嗯。」；沒有 opts 照舊；
//      TE-HOOK-REPEAT-1110：鉤子要說的那一句話題池不先說（原本連說兩次）
//   6. 一起活動／念書（src/studyn3d.js STUDYN.mid）：選項 {t, rel?, fx?, reply|re}、輪換那幾則也可以有 opts；匯入工具收 fx／re
//   7. 手機回覆（PHONE.answer）：選項的 fx 算在那個私訊的人身上；她傳的訊息的回覆（MSG_REPLIES）、玩家主動傳的回問（msg pool）把 fx 帶過去
//   8. 邀約見面路上的選項（invites.js walk 的 ch）、好感升級句的小選擇（rel_lines 的 ch）：有 fx 才加
// 修改前（35e560bbd）：第 1 節沒有 SOCIAL.applyFx；第 2 節 fx 不算、re 不說；第 3 節第二次以後沒有選項——FAIL。用法：node tests/dlg_fx_mech_1110_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const clone=x=>JSON.parse(JSON.stringify(x));
const cp_=require('child_process'); const cp_exec=py=>cp_.execFileSync('python3',['-c',py],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); const run_py=args=>{ try{ return cp_.execFileSync('python3',args,{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); }catch(e){ return String(e.stderr||e.message); } };
/* 選項：想選的字（WANT）在這一組裡＝選它；不然第一個。記下每一組 */
let WANT=[], CH=[];
GM.choose=async o=>{ const T=o.map(q=>q.t||q.text); CH.push(T); for(const w of WANT){ const k=T.findIndex((t,i)=>t===w&&!o[i].dim); if(k>=0) return k; } return 0; };
GM.money=d=>{ H.G.money+=d; };
let ADJ=[]; { const a0=SOCIAL.adjust; SOCIAL.adjust=function(id,d){ ADJ.push([id,Object.assign({},d)]); return a0.apply(this,arguments); }; }
const sum=(id,k)=>ADJ.filter(([w,d])=>w===id&&d[k]!=null).reduce((a,[,d])=>a+d[k],0);
const idx=t=>H.said.findIndex(s=>s.t===t);
const reset=()=>{ H.said=[]; CH=[]; ADJ=[]; };
module.exports={H,sec,clone,reset,idx,sum,J,get CH(){ return CH; },set WANT(v){ WANT=v; },get ADJ(){ return ADJ; }};

(async()=>{
  await sec(1,async()=>{ const G=H.fresh('2025-10-18',19), a='heroine_01', b='classmate_bohan'; H.FRIEND(a); H.FRIEND(b); SOCIAL.adjust(a,{npcRom:10}); const ok=typeof SOCIAL.applyFx==='function';
    const r0=Object.assign({},SOCIAL.rel(a)); const d1=ok&&SOCIAL.applyFx(G,a,{fr:1,love:2}), r1=Object.assign({},SOCIAL.rel(a)), d2=ok&&SOCIAL.applyFx(G,a,{fr:-1,love:-2}), r2=Object.assign({},SOCIAL.rel(a));
    check('1. SOCIAL.applyFx：fr 1＝熟悉、信任、自在各 +1；love 2＝她的戀愛 +2；負的照扣回來',ok&&J(d1)===J({fam:1,trust:1,comf:1,npcRom:2})&&r1.fam===r0.fam+1&&r1.npcRom===r0.npcRom+2&&J(r2)===J(r0)&&J(d2)===J({fam:-1,trust:-1,comf:-1,npcRom:-2}),J({d1,d2,r0,r1}));
    check('1. 沒有 fx、空的、0＝不動（null）；男生朋友 love 不算、fr 照算',ok&&SOCIAL.applyFx(G,a,undefined)===null&&SOCIAL.applyFx(G,a,{})===null&&SOCIAL.applyFx(G,a,{fr:0,love:0})===null&&SOCIAL.applyFx(G,b,{love:3})===null&&J(SOCIAL.applyFx(G,b,{fr:2,love:3}))===J({fam:2,trust:2,comf:2})); });

  await sec(2,async()=>{ const who='heroine_02', loc='D13', pid='D13.drink', LN=DATE_LINES.loc[loc].lines[who], keep=J(LN), pn=id=>DATE.points(loc).find(p=>p.id===id).name;
    OUT.BG.d13_base_sunset=OUT.BG.d13_base_sunset||{label:'淡水',image:'x'};
    const go=async(want)=>{ const G=H.G; const b=DATE.book(G,{who,locs:[loc],transport:'mrt',day:G.day,depart:15}); const q=OUT.get(G,'date_'+b.trip); G.hour=15; reset(); WANT=['出發','自己選'].concat(want,['差不多了，回去吧']); await OUT.prompt(GM,q); return DATE.trip(G,b.trip); };
    const next=()=>{ const G=H.G; G.day+=7; G.weekday=CALENDAR.dateOf(G.day).wd%7; };
    const day=STORY.termDay('Y1S2',5,6), start=()=>{ const G=H.fresh('2026-03-01',9); G.day=day; G.weekday=6; G.money=50000; H.rel(who,65,50,45); return G; };
    try{
      const F=LN.hotspots[pid].first, c0=F.choice[0], c1=F.choice[1];
      delete c0.fx; delete c1.fx;   /* 2026-11-11 起真的資料有 fx（AA 52c3ee258，X324）：這兩個選項先拿掉 fx＝「沒有新欄位」的樣子，下面再放假的 fx 比差多少 */
      /* 沒有新欄位：第一次有選項、第二次以後沒有（原本的樣子）；選項沒有 fx＝只有互動點原本的加法 */
      start(); await go([pn(pid),c0.t]); const base={ch:CH.filter(c=>c.includes(c0.t)).length,rom:sum(who,'npcRom'),fam:sum(who,'fam'),trust:sum(who,'trust')};
      next(); await go([pn(pid)]); const again0=CH.filter(c=>!c.includes(pn('D13.rail'))&&!c.includes('出發')&&!c.includes('自己選')&&c.length>1&&!c.some(t=>/回去/.test(t)));
      check('2. 資料沒有新欄位：第一次到互動點有選項；第二次沒有（和原本一樣）',base.ch===1&&again0.length===0,J({base,again0}));
      /* fx、re */
      c0.fx={fr:1,love:2}; delete c0.reply; c0.re=['（假的）她回第一句。','（她笑了一下。）']; c1.fx={fr:-1};
      start(); await go([pn(pid),c0.t]); const a={rom:sum(who,'npcRom'),fam:sum(who,'fam'),i0:idx('（假的）她回第一句。'),i1:idx('（她笑了一下。）')};
      start(); await go([pn(pid),c1.t]); const b={rom:sum(who,'npcRom'),fam:sum(who,'fam'),trust:sum(who,'trust')};
      check('2. 選項的 fx：{fr:1,love:2}＝比原本多 熟悉 +1、她的戀愛 +2；{fr:-1}＝熟悉、信任各 -1',a.rom===base.rom+2&&a.fam===base.fam+1&&b.fam===base.fam-1&&b.rom===base.rom&&b.trust===base.trust-1,J({base,a,b}));
      check('2. 選項的 re（陣列）：她照順序說；整句括號＝旁白',a.i0>=0&&a.i1===a.i0+1&&H.said.length>0,J(a));
      /* 3. opts：again 兩組輪流、dating */
      LN.hotspots[pid].opts={again:[[{t:'（假）再來一次甲',re:'甲的回答。',fx:{love:1}},{t:'（假）再來一次乙',re:'（她沒有回答。）',fx:{fr:-1}}],{lines:[{who,text:'（假）第二組的開場。'}],choice:[{t:'（假）第二組丙',fx:{fr:2}}]}],
        dating:[[{t:'（假）交往中丁',re:'丁的回答。',fx:{love:3}}]]};
      LN.closing.opts={again:[{t:'（假）送她到車站',re:'好。',fx:{love:1}},{t:'（假）在這裡說再見',fx:{fr:1}}]};
      const G=start(); await go([pn(pid),c0.t]); const first={grp:CH.some(c=>c.includes('（假）再來一次甲')),cl:CH.some(c=>c.includes('（假）送她到車站'))};
      next(); await go([pn(pid),'（假）再來一次乙','（假）送她到車站']); const v2={grp:CH.find(c=>c.includes('（假）再來一次甲')),narr:H.said.find(s=>s.t==='（她沒有回答。）'),fam:sum(who,'fam'),rom:sum(who,'npcRom'),cl:CH.some(c=>c.includes('（假）送她到車站')),clRe:idx('好。')>=0};
      next(); await go([pn(pid),'（假）第二組丙']); const v3={grp:CH.some(c=>c.includes('（假）第二組丙')),open:idx('（假）第二組的開場。')>=0,noA:!CH.some(c=>c.includes('（假）再來一次甲'))};
      next(); await go([pn(pid),'（假）再來一次甲']); const v4={grp:CH.some(c=>c.includes('（假）再來一次甲')),re:idx('甲的回答。')>=0};
      const saved=clone(G); const optN=clone(DATE.mem(G,who,loc).optN||null);
      check('3. opts.again：第一次到那個互動點不出（照 first 的選項）；第二次出第一組、選了有效果、括號的 re＝旁白',!first.grp&&!first.cl&&!!v2.grp&&v2.grp.length===2&&!!v2.narr&&v2.narr.who===null,J({first,v2}));
      check('3. opts.again 好幾組＝輪流（第三次第二組、帶自己的開場句；第四次回到第一組）；輪到哪裡記在存檔',v3.grp&&v3.open&&v3.noA&&v4.grp&&v4.re&&!!optN&&optN[pid+':again']===3&&J(saved.dateMemory[who][loc].optN)===J(optN),J({v3,v4,optN}));
      check('3. 收尾的 opts.again：第二次以後到這個地點才出、有效果',v2.cl&&v2.clRe,J(v2));
      H.date(who); next(); await go([pn(pid),'（假）交往中丁']);
      check('3. opts.dating：交往中出這一組（稿上 +3；一次約會她的戀愛最多 +2＝實際 +2，FX-LOVE-CAP-1110）',CH.some(c=>c.includes('（假）交往中丁'))&&idx('丁的回答。')>=0&&ADJ.some(([w,d])=>w===who&&d.npcRom===2)&&!ADJ.some(([w,d])=>w===who&&d.npcRom===3),J(CH));
      /* 舊存檔：dateMemory 沒有 optN、或壞掉 */
      const old=clone(saved); delete old.dateMemory[who][loc].optN; H.G=old; SOCIAL.bind(old); INV.rec(old); await go([pn(pid)]); const o1=CH.some(c=>c.includes('（假）再來一次甲'));
      old.dateMemory[who][loc].optN=[1,2]; next(); await go([pn(pid)]); const o2=CH.some(c=>c.includes('（假）再來一次甲'))||CH.some(c=>c.includes('（假）第二組丙'));
      check('3. 舊存檔（沒有 optN、或格式壞掉）：從第一組開始、照常演；存檔 JSON 來回不壞',o1&&o2&&!!JSON.parse(J(old)).dateMemory[who][loc].optN,J(old.dateMemory[who][loc].optN));
      /* 壞資料 */
      LN.hotspots[pid].opts={again:[[{t:''},{nope:1}],'x',null],dating:7}; H.G=start(); await go([pn(pid),c0.t]); next(); let e=null; try{ await go([pn(pid)]); }catch(x){ e=String(x); }
      check('3. 壞掉的 opts（沒有字的選項、不是物件）：當作沒有、不丟例外、不出空的選項',e===null&&CH.every(c=>c.every(t=>typeof t==='string'&&t.trim())),J([e,CH]));
    } finally { DATE_LINES.loc[loc].lines[who]=JSON.parse(keep); WANT=[]; } });

  await sec(4,async()=>{ const id='heroine_01', T='Y1S2', L=LADDER.byTerm[T][id], keep=J(L), who={name:'以安',charId:id}, K=id+'@'+T;
    const start=(w)=>{ const G=H.fresh('2026-03-01',10,'campus'); G.day=STORY.termDay(T,w||3,2); G.weekday=2; H.rel(id,45,30,0); return G; };
    const talk=async(want)=>{ reset(); WANT=want||[]; return STORY.ladderTalk(GM,who,id); };
    try{
      /* 沒有新欄位：交往中也照 steps（原本的樣子） */
      let G=start(); H.date(id); await talk(); const s0=L.steps[0];
      check('4. 資料沒有 dating：交往中也是照 steps 的第一層（和原本一樣）',idx(STORY.ladLines(s0,G,id)[0])>=0&&G.social.ladder[K]===1&&G.social.ladder[K+'#dating']==null,J([H.said.map(x=>x.t),G.social.ladder]));
      /* 層和選項的 fx、re */
      L.steps[0]=Object.assign({},s0,{fx:{love:1},choices:[{t:'（假）甲',re:'（假）回甲。',fx:{love:2}},{t:'（假）乙',re:['（她看了你一眼。）','（假）回乙。'],fx:{fr:-1}}]});
      G=start(); await talk(['（假）甲']); const a={rom:sum(id,'npcRom'),re:idx('（假）回甲。')>=0,who:(H.said[idx('（假）回甲。')]||{}).who};
      G=start(); await talk(['（假）乙']); const b={rom:sum(id,'npcRom'),neg:ADJ.some(([w,d])=>w===id&&J(d)===J({fam:-1,trust:-1,comf:-1})),n:H.said[idx('（她看了你一眼。）')],re:idx('（假）回乙。')};
      check('4. 層的 fx＋選項的 fx：選甲＝她的戀愛 +1+2（一次聊天最多 +2＝實際 +2，FX-LOVE-CAP-1110）；選乙＝+1、熟悉信任自在各 -1；re 當她的回答（括號＝旁白）',a.rom===2&&a.re&&a.who==='以安'&&b.rom===1&&b.neg&&!!b.n&&b.n.who===null&&b.re>=0,J({a,b}));
      /* dating 那一階 */
      L.dating=[{id:'A2-D1',lines:['（假）交往層一。'],choices:[{t:'（假）丙',re:'（假）回丙。',fx:{love:3}}],fx:{fr:1}},{id:'A2-D2',week:[10,18],lines:['（假）交往層二。']}];
      G=start(); await talk(); const nd={d:idx('（假）交往層一。')>=0,lad:clone(G.social.ladder)};
      G=start(); H.date(id); await talk(['（假）丙']); const d1={d:idx('（假）交往層一。')>=0,re:idx('（假）回丙。')>=0,rom:sum(id,'npcRom'),fam:sum(id,'fam'),lad:clone(G.social.ladder)};
      const same=await talk(); const d1b={again:idx('（假）交往層一。')>=0||idx('（假）交往層二。')>=0};
      G.day+=1; G.weekday=3; await talk(['（假）甲']); const d2={step:idx('（假）回甲。')>=0,d:idx('（假）交往層二。')>=0,lad:clone(G.social.ladder)};
      G.day=STORY.termDay(T,10,2); G.weekday=2; await talk(); const d3={d:idx('（假）交往層二。')>=0,lad:clone(G.social.ladder)};
      check('4. dating 那一階：沒交往＝不出、照 steps；交往中＝先聊交往層（層 fx fr 1、選項 love 3＝上限 +2）、進度另外記、不占 steps',!nd.d&&nd.lad[K]===1&&d1.d&&d1.re&&d1.rom===2&&d1.fam>=1&&d1.lad[K+'#dating']===1&&(d1.lad[K]|0)===0,J({nd,d1}));
      check('4. 一天一層照舊；交往層的下一層條件還沒到（第 10 週才有）＝照 steps；條件到了才聊交往層',!d1b.again&&d2.step&&!d2.d&&d2.lad[K]===1&&d2.lad[K+'#dating']===1&&d3.d&&d3.lad[K+'#dating']===2,J({d1b,d2,d3}));
      const old=clone(G); delete old.social.ladder[K+'#dating']; H.G=old; SOCIAL.bind(old); EVENTS.bind(GM); old.day+=1; old.weekday=3; await talk(['（假）丙']);
      check('4. 舊存檔（沒有交往層的進度）：從交往層第一層開始；存檔 JSON 來回不壞',idx('（假）交往層一。')>=0&&JSON.parse(J(old)).social.ladder[K+'#dating']===1,J(old.social.ladder));
    } finally { LADDER.byTerm[T][id]=JSON.parse(keep); WANT=[]; } });

  await sec(5,async()=>{ const Lx=TERMEND_LINES, a='heroine_01', T='Y1S1', keep=Lx.POOL[T][a].slice(), me='祐廷', AN=SOCIAL.displayName(a);
    const dinner=async(term,who,kind,want,day)=>{ const G=H.fresh(day||'2026-01-15',18.5); H.rel(who,45,30,0); reset(); WANT=want||[]; await TERMEND.dinner(GM,{te:{term,who,kind:kind||'friend'}}); return H.said.map(x=>(x.who||'')+'｜'+x.t); };
    const keepTO=globalThis.TERMEND_OPTS; if(keepTO) globalThis.TERMEND_OPTS=Object.assign({},keepTO,{FRIEND:undefined});   /* TERMEND-OPTS-1110（朋友版）：以安大一上現在讀 TERMEND_OPTS.FRIEND、不抽話題池；這一節測的是話題池的機制（沛珊、多人桌還在用），先把 FRIEND 拿掉 */
    try{
      const L0=await dinner(T,a), auto0=L0.filter(x=>Lx.REPLY.some(r=>x===me+'｜'+r)).length, noCh=CH.filter(c=>c.some(t=>/（假）/.test(t))).length;
      check('5. 資料沒有 opts：話題之間祐廷照舊自動回（「嗯。」「真的假的。」），沒有多的選項',auto0>=1&&noCh===0,J(L0));
      Lx.POOL[T][a]=[{say:['（假）話題一。'],opts:[{t:'（假）甲',re:['（假）回甲。','（她把菜單推過來。）'],fx:{love:2}},{t:'（假）乙',fx:{fr:-1}}]},keep[1],keep[2]];
      const L1=await dinner(T,a,'friend',['（假）甲']), i1=L1.indexOf(AN+'｜（假）話題一。'), r1={ch:CH.some(c=>J(c)===J(['（假）甲','（假）乙'])),re:L1[i1+1],narr:L1[i1+2],next:L1[i1+3],rom:sum(a,'npcRom')};
      const k1=typeof keep[1]==='string'?keep[1]:null;
      check('5. 話題池那一則有 opts：她先說、玩家選、她照 re 回（括號＝旁白）、fx 算（她的戀愛 +2）；祐廷不再自動回「嗯。」，下一則沒有選項的照舊自動回',
        i1>=0&&r1.ch&&r1.re===AN+'｜（假）回甲。'&&r1.narr==='｜（她把菜單推過來。）'&&r1.rom===2&&!Lx.REPLY.some(r=>r1.next===me+'｜'+r)&&(k1===null||(r1.next===AN+'｜'+k1&&Lx.REPLY.some(r=>L1[i1+4]===me+'｜'+r))),J({r1,L1}));
      const L2=await dinner(T,a,'friend',['（假）乙']);
      check('5. 選乙（沒有 re、fx fr -1）：不出空的框、熟悉信任自在各 -1',ADJ.some(([w,d])=>w===a&&J(d)===J({fam:-1,trust:-1,comf:-1}))&&H.said.every(x=>typeof x.t==='string'&&x.t.trim()),J(L2));
    } finally { Lx.POOL[T][a]=keep; WANT=[]; globalThis.TERMEND_OPTS=keepTO; }
    /* 鉤子把話題池剛說過的那一句再說一次（AA audit_1110 termend D6） */
    const dup=[]; const G0=H.fresh('2026-06-20',18.5);
    for(const term in Lx.HOOK) for(const who in Lx.HOOK[term]){ const day={Y1S1:'2026-01-15',Y1S2:'2026-06-20',Y2S1:'2027-01-14',Y2S2:'2027-06-19',Y3S1:'2028-01-13',Y3S2:'2028-06-17',Y4S1:'2029-01-11'}[term]; if(!day) continue;
      for(const kind of ['friend','gf']){ let L; try{ L=await dinner(term,who,who==='kai'?'fallback':kind,[],day); }catch(e){ dup.push([term,who,kind,'例外 '+e]); continue; }
        const seen={}; for(const x of L){ if(/^｜/.test(x)||x.indexOf(me+'｜')===0) continue; seen[x]=(seen[x]|0)+1; } for(const x in seen) if(seen[x]>1) dup.push([term,who,kind,x]); } }
    const L3=await dinner('Y1S2','yu','friend',[],'2026-06-20'), n3=L3.filter(x=>/你要不要來探班？/.test(x)).length, hooked=CH.some(c=>c.includes(Lx.HOOK_NO));
    check('5. 期末飯：同一頓飯她不把同一句說兩次（鉤子要說的那一句，話題池不先說）——Alison 大一下「你要不要來探班？」只說一次、後面接鉤子的選項',n3===1&&hooked&&L3.findIndex(x=>/你要不要來探班？/.test(x))>L3.findIndex(x=>/小隊|營隊|暑假/.test(x)),J(L3));
    check('5. 七個學期、每個有鉤子的人（朋友版、女朋友版）：沒有一句她的話在同一頓飯重複',dup.length===0,J(dup.slice(0,6))); });

  await sec(6,async()=>{ const id='heroine_01', who={name:'以安',charId:id}; const cp=require('child_process');
    for(const f of ['src/data/study_scenes.js','src/data/activity_scenes.js','src/studyn3d.js','src/data/msg_replies.js','src/msgreply3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js']){ if(f.includes('msg3d')&&typeof MSG!=='undefined') continue; if(f.includes('studyn3d')&&typeof STUDYN!=='undefined') continue; if(f.includes('msgreply3d')&&typeof MSGR!=='undefined') continue; try{ vm.runInThisContext(fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='),{filename:f}); }catch(e){ check('6. 載入 '+f,false,String(e).slice(0,200)); } }
    const sc={mid:['（假）中途。'],opts:[{t:'（假）甲',rel:{fam:1},fx:{love:2},reply:['（假）回甲。']},{t:'（假）乙',fx:{fr:-1},re:'（她沒說話。）'},{t:''}]};
    let G=H.fresh('2025-10-18',19); H.FRIEND(id); reset(); WANT=['（假）甲']; await STUDYN.mid(GM,who,id,sc); const a={ch:CH[0],rel:ADJ.some(([w,d])=>w===id&&J(d)===J({fam:1})),fx:ADJ.some(([w,d])=>w===id&&J(d)===J({npcRom:2})),re:idx('（假）回甲。')>=0};
    G=H.fresh('2025-10-18',19); H.FRIEND(id); reset(); WANT=['（假）乙']; await STUDYN.mid(GM,who,id,sc); const b={fx:ADJ.length===1&&J(ADJ[0][1])===J({fam:-1,trust:-1,comf:-1}),narr:(H.said[idx('（她沒說話。）')]||{}).who===null};
    check('6. 一起活動／念書的選項（STUDYN.mid）：rel 照舊＋fx 另外算；只有 fx、沒有 rel 也可以；re＝reply；沒有字的選項不出',a.ch.length===2&&a.rel&&a.fx&&a.re&&b.fx&&b.narr,J({a,b,ADJ}));
    const old={mid:['x'],opts:[{t:'o1',rel:{comf:1},reply:['r1']}]}; G=H.fresh('2025-10-18',19); H.FRIEND(id); reset(); await STUDYN.mid(GM,who,id,old);
    check('6. 原本的格式（rel＋reply、沒有 fx）：和原本一樣',ADJ.length===1&&J(ADJ[0][1])===J({comf:1})&&idx('r1')>=0,J(ADJ));
    const py=`
import sys, json
sys.path.insert(0, 'tools/story')
import import_study_scenes as ST
import import_activity_scenes as AC
out = {}
out['opts'] = ST.opts([{'t': 'a', 'rel': {'fam': 1}, 'reply': ['r']}, {'t': 'b', 'fx': {'fr': -1, 'love': 2}, 're': 'x'}, {'t': 'c', 'fx': {}}], 'w')
bad = []
for o in ([{'t': 'a'}], [{'t': 'a', 'fx': {'luv': 1}}], [{'t': 'a', 'fx': {'fr': 1.5}}], [{'t': 'a', 'rel': {}, 'zzz': 1}], [{'t': 'a', 'fx': {'fr': 1}, 'reply': ['r'], 're': 'x'}]):
    try:
        ST.opts(o, 'w'); bad.append(False)
    except SystemExit:
        bad.append(True)
out['bad'] = bad
P = AC.person('heroine_01', {'1': {'seat': ['s'], 'mid': ['m']}, '2': {'seat': ['s'], 'mid': ['m']}, '3': {'seat': ['s'], 'mid': ['m'], 'choice': {'at': 'mid', 'opts': [{'t': 'a', 'fx': {'love': 1}, 're': ['r']}]}}, 'rot': [{'mid': ['m'], 'opts': [{'t': 'a', 'fx': {'fr': 1}}]}]}, 'eat')
out['rot'] = P['rot'][0].get('opts'); out['s3'] = P['scenes']['3'].get('opts')
print(json.dumps(out, ensure_ascii=False))
`;
    let o=null, err=''; try{ o=JSON.parse(cp.execFileSync('python3',['-c',py],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']})); }catch(e){ err=String(e.stderr||e.message).slice(-400); }
    check('6. 匯入工具（study／activity scenes）：選項 {t, rel?, fx?, reply|re}——fx、re 帶得過去（re 變 reply）、輪換的 opts 收；沒有 rel 也沒有 fx、fx 的欄位或數字不對、不認得的欄位、reply 和 re 都寫＝停下來',
      !!o&&J(o.opts[1])===J({t:'b',rel:{},fx:{fr:-1,love:2},reply:['x']})&&J(o.opts[0])===J({t:'a',rel:{fam:1},reply:['r']})&&J(o.opts[2].reply)==='[]'&&o.bad.every(x=>x)&&J(o.rot)===J([{t:'a',rel:{},fx:{fr:1},reply:[]}])&&J(o.s3[0].reply)===J(['r']),err||J(o)); });

  await sec(7,async()=>{ const id='heroine_01', th='p:'+id; let G=H.fresh('2025-10-18',19); H.FRIEND(id); G.contacts={[id]:1}; PHONE.rec(G);
    PHONE.post(G,{th,from:id,text:'（假）訊息',ask:{id:'fx_t1',opts:[{t:'（假）甲',say:[{from:id,text:'（假）回甲'}],fx:{love:2,fr:1}},{t:'（假）乙'}]}}); reset(); const r1=PHONE.answer(G,'fx_t1',0), a1=ADJ.slice();
    PHONE.post(G,{th,from:id,text:'（假）訊息二',ask:{id:'fx_t2',opts:[{t:'（假）甲'},{t:'（假）乙',fx:{fr:-1}}]}}); reset(); PHONE.answer(G,'fx_t2',0); const a2=ADJ.slice();
    G.flags.FX_CAP={};   /* 手機回覆一個人一天 love 最多 +2（FX-LOVE-CAP-1110；上限在 tests/fx_love_cap_1110_unit.js 第 6 節）：這裡只看 fxWho，先清掉 */ PHONE.post(G,{th:'g:class',from:id,text:'（假）群組',ask:{id:'fx_t3',opts:[{t:'（假）甲',fx:{love:1},fxWho:id},{t:'（假）乙',fx:{love:1}}]}}); reset(); PHONE.answer(G,'fx_t3',0); const a3=ADJ.slice();
    check('7. 手機回覆（PHONE.answer）：選項的 fx 算在這個私訊的人身上；沒有 fx 的選項＝不動；群組的要寫 fxWho',!!r1&&a1.some(([w,d])=>w===id&&J(d)===J({fam:1,trust:1,comf:1,npcRom:2}))&&!a2.some(([w,d])=>d.npcRom!=null||d.fam<0)&&a3.some(([w,d])=>w===id&&d.npcRom===1),J({a1,a2,a3}));
    /* 她主動傳的訊息的回覆（msg_replies／msgreply3d）、玩家主動傳的回問（msg pool／msg3d askOpts）帶 fx */
    const P=MSG_REPLIES.people, keep=P[id]; try{ P[id]=(keep||[]).concat([{text:'（假）她傳的。',opts:[{t:'（假）回一',rel:{fam:1},say:['（假）好。'],fx:{love:1}},{t:'（假）回二',rel:{},say:[]}]}]);
      const m={th,from:id,text:'（假）她傳的。',day:G.day,h:G.hour}; const at=MSGR.attach(G,m);
      check('7. 她傳的訊息的回覆選項（MSG_REPLIES）：fx 帶到手機的選項上（fxWho＝她）；沒寫的沒有',at&&J(m.ask.opts[0].fx)===J({love:1})&&m.ask.opts[0].fxWho===id&&m.ask.opts[1].fx===undefined&&J(m.ask.opts[0].rel)===J({fam:1}),J(m.ask)); } finally { if(keep) P[id]=keep; else delete P[id]; }
    const ao=MSG.askOpts(G,id,{ask:{opts:[{t:'（假）一',r:['（假）嗯'],fx:{fr:1}},{t:'（假）二',r:[]}]}},'以安',{});
    check('7. 玩家主動傳訊息的回問選項（msg pool 的 ask.opts）：fx 帶過去',!!ao&&J(ao.opts[0].fx)===J({fr:1})&&ao.opts[0].fxWho===id&&ao.opts[1].fx===undefined,J(ao));
    const py=`
import sys, json, subprocess
sys.path.insert(0, 'tools/story')
import import_msg_replies as M
src = open(M.__file__, encoding='utf-8').read()
print(json.dumps({'fx': "q['fx'] = dict(fx)" in src, 're': "'re' in o and not say" in src}))
`;
    let o=null; try{ o=JSON.parse(cp_exec(py)); }catch(e){ o={err:String(e.stderr||e.message).slice(-300)}; }
    check('7. 匯入工具（msg replies）：fx、re 收（--check 和現在的資料一樣）',!!o&&o.fx&&o.re&&/^OK/.test(run_py(['tools/story/import_msg_replies.py','--check'])),J(o)); });

  await sec(8,async()=>{ const id='heroine_02', who={name:'芷若',charId:id}; let G=H.fresh('2025-10-18',19); H.FRIEND(id);
    const W=INVITE_DATA.people[id].walk||(INVITE_DATA.people[id].walk={}), keep=W.zz_fx; try{ W.zz_fx=[].concat([{once:'T_FX_WALK',l:['（假）路上她問。'],ch:[{t:'（假）甲',re:'（假）回甲。',fx:{fr:1,love:1}},{t:'（假）乙',r:['（假）回乙。']}]}]);
      reset(); WANT=['（假）甲']; const r=await INV.walkAsk(GM,{who:id,ask:'T_FX_WALK'},who);
      check('8. 邀約見面路上的選項（invites.js walk 的 ch）：{t, r|re, fx}——fx 算、re 當她的回答',r!==false&&idx('（假）回甲。')>=0&&ADJ.some(([w,d])=>w===id&&J(d)===J({fam:1,trust:1,comf:1,npcRom:1})),J({said:H.said,ADJ}));
      G=H.fresh('2025-10-18',19); H.FRIEND(id); reset(); WANT=['（假）乙']; await INV.walkAsk(GM,{who:id,ask:'T_FX_WALK'},who);
      check('8. 沒有 fx 的選項＝照舊不加數值',idx('（假）回乙。')>=0&&ADJ.length===0,J(ADJ)); } finally { delete W.zz_fx; }
    const u0=SOCIAL.upLine, m0=SOCIAL.markUp; try{ SOCIAL.upLine=()=>({k:'T',l:['（假）升級句。'],ch:[{t:'（假）甲',re:'（假）回。',fx:{love:2}},{t:'（假）乙',r:['（假）回乙']}]}); SOCIAL.markUp=()=>{};
      G=H.fresh('2025-10-18',19); H.FRIEND(id); reset(); WANT=['（假）甲']; await SOCIAL.playUp(GM,who,id,{}); const up={re:idx('（假）回。')>=0,fx:ADJ.some(([w,d])=>w===id&&d.npcRom===2)};
      reset(); WANT=['（假）乙']; await SOCIAL.playUp(GM,who,id,{});
      check('8. 好感升級句後面的小選擇（rel_lines 的 ch）：有 fx 才加、沒有照舊不加',up.re&&up.fx&&idx('（假）回乙')>=0&&ADJ.length===0,J({up,ADJ})); } finally { SOCIAL.upLine=u0; SOCIAL.markUp=m0; } });
  if(require.main===module) H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
