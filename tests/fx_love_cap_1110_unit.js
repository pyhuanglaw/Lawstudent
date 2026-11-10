// FX-LOVE-CAP-1110：選項加的「她的戀愛」（fx.love）有共用的上限（LAWWW 和 AA 11-10 講好）
//   同一次活動、同一個人：選項的 love 合計最多 +2；告白那一晚 +3；扣的不限、也不補回額度；fr 不限；沒有 fx 的資料照舊。
//   SOCIAL.applyFx(G,id,fx,{cap:'鍵',max?,keep?,base?})；記在 G.flags.FX_CAP＝{人:{鍵:{d,n,k?}}}，沒有 k 的超過 SOCIAL.FX_CAP_DAYS 天清掉。
//   1. SOCIAL.applyFx 本身（上限、負的、fr、另一個鍵／另一個人、max 3、清舊的、keep、壞掉的存檔、沒有 cap＝不限）
//   2. 校外約會（date:<天>:<地點>；一次約會幾個互動點合計 +2；下一次約會重新算；告白那一晚 +3）
//   3. 閒聊階梯（ladder:<天>:<那一層>；層的 fx＋選項的 fx 合計 +2）
//   4. 一起活動／念書（STUDYN.mid：act:<天>:<活動>；約好的那一次＝meet:<約的 id>，和路上的選項、升級句的小選擇算同一次）
//   5. 期末的飯（termend:<天>；兩則話題的選項合計 +2；告白那一晚 +3）
//   6. 手機回覆（phone:<天>＝一個人一天 +2；隔天重新算）
//   7. 看電影的那一次約：路上的選項和那部片的 talk 用同一個鍵（movie:<片>）
// 電影自己的上限（talk＋with＋之後的訊息、舊存檔 MOVIE_LOVE）在 tests/movie_talk_1110_unit.js 第 13 節。
// 修改前（632ef134e：applyFx 沒有第四個參數、各處不給鍵）：每一節 FAIL。用法：node tests/fx_love_cap_1110_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const loadG=f=>{ try{ vm.runInThisContext(fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='),{filename:f}); }catch(e){ check('載入 '+f,false,String(e).slice(0,200)); } };
let WANT=[], CH=[];
GM.choose=async o=>{ const T=o.map(q=>q.t||q.text); CH.push(T); for(const w of WANT){ const k=T.findIndex((t,i)=>t===w&&!o[i].dim); if(k>=0) return k; } return 0; };
GM.money=d=>{ H.G.money+=d; };
/* 每一次 SOCIAL.applyFx 實際加了多少（只看選項的 fx；活動本身的加法不走這裡）*/
let FXD=[]; { const a0=SOCIAL.applyFx; SOCIAL.applyFx=function(){ const d=a0.apply(this,arguments); FXD.push([arguments[1],d,arguments[3]||null]); return d; }; }
const love=id=>FXD.filter(([w,d])=>w===id&&d&&d.npcRom!=null).reduce((a,[,d])=>a+d.npcRom,0);
const fam=id=>FXD.filter(([w,d])=>w===id&&d&&d.fam!=null).reduce((a,[,d])=>a+d.fam,0);
const keys=id=>[...new Set(FXD.filter(([w,,o])=>w===id&&o&&o.cap).map(([,,o])=>o.cap))];
const reset=()=>{ H.said=[]; CH=[]; FXD=[]; };
const idx=t=>H.said.findIndex(s=>s.t===t);

(async()=>{
  await sec(1,async()=>{ const a='heroine_01', b='heroine_02', m='classmate_bohan'; let G=H.fresh('2025-10-18',19); H.FRIEND(a); H.FRIEND(b); H.FRIEND(m); SOCIAL.adjust(a,{npcRom:30}); SOCIAL.adjust(b,{npcRom:30});
    const r0=SOCIAL.rel(a).npcRom, K={cap:'t:1'};
    const d1=SOCIAL.applyFx(G,a,{love:1,fr:1},K), d2=SOCIAL.applyFx(G,a,{love:2,fr:1},K), d3=SOCIAL.applyFx(G,a,{love:1},K), d4=SOCIAL.applyFx(G,a,{love:1,fr:1},K);
    check('1. 同一個鍵：+1、+2（只剩 1）、之後 0；fr 不受影響照加；滿了又沒有 fr＝null',J(d1)===J({fam:1,trust:1,comf:1,npcRom:1})&&J(d2)===J({fam:1,trust:1,comf:1,npcRom:1})&&d3===null&&J(d4)===J({fam:1,trust:1,comf:1})&&SOCIAL.rel(a).npcRom===r0+2&&SOCIAL.fxCapGot(G,a,'t:1')===2,J({d1,d2,d3,d4,cap:G.flags.FX_CAP}));
    const n1=SOCIAL.applyFx(G,a,{love:-3},K), n2=SOCIAL.applyFx(G,a,{love:2},K);
    check('1. 扣的不限、也不補回額度：-3 照扣，再 +2＝不加',J(n1)===J({npcRom:-3})&&n2===null&&SOCIAL.rel(a).npcRom===r0-1&&SOCIAL.fxCapGot(G,a,'t:1')===2,J({n1,n2}));
    const o1=SOCIAL.applyFx(G,a,{love:2},{cap:'t:2'}), o2=SOCIAL.applyFx(G,b,{love:2},K), o3=SOCIAL.applyFx(G,a,{love:5}), o4=SOCIAL.applyFx(G,m,{love:2,fr:1},K);
    check('1. 另一個鍵、另一個人各自算；沒有 cap＝和原本一樣不限；不能攻略的人 love 不算、不占額度',J(o1)===J({npcRom:2})&&J(o2)===J({npcRom:2})&&J(o3)===J({npcRom:5})&&J(o4)===J({fam:1,trust:1,comf:1})&&!G.flags.FX_CAP[m],J({o1,o2,o3,o4,cap:G.flags.FX_CAP}));
    const c1=SOCIAL.applyFx(G,a,{love:2},{cap:'t:3',max:3}), c2=SOCIAL.applyFx(G,a,{love:2},{cap:'t:3',max:3}), c3=SOCIAL.applyFx(G,a,{love:1},{cap:'t:3',max:3});
    check('1. max 3（告白那一晚）：+2、+1、之後 0',J(c1)===J({npcRom:2})&&J(c2)===J({npcRom:1})&&c3===null,J({c1,c2,c3}));
    SOCIAL.applyFx(G,a,{love:1},{cap:'movie:x',keep:true,base:1}); const kb=SOCIAL.applyFx(G,a,{love:2},{cap:'movie:x',keep:true,base:1});
    check('1. base（舊存檔已經拿的）：第一次建那一筆時算進去（1＋1＝滿）',kb===null&&G.flags.FX_CAP[a]['movie:x'].n===2&&G.flags.FX_CAP[a]['movie:x'].k===1,J(G.flags.FX_CAP[a]));
    G.day+=SOCIAL.FX_CAP_DAYS; SOCIAL.applyFx(G,b,{love:1},{cap:'t:9'}); const still=Object.keys(G.flags.FX_CAP[a]).sort();
    G.day+=1; SOCIAL.applyFx(G,b,{love:1},{cap:'t:10'}); const after=Object.keys(G.flags.FX_CAP[a]||{}).sort(), bk=Object.keys(G.flags.FX_CAP[b]).sort();
    check('1. 清舊的：'+SOCIAL.FX_CAP_DAYS+' 天內的留著；超過就清掉（keep 的那一筆留著）——不會一直長',J(still)===J(['movie:x','t:1','t:2','t:3'])&&J(after)===J(['movie:x'])&&J(bk)===J(['t:10','t:9']),J({still,after,bk}));
    const s=JSON.parse(J(G)); check('1. 存檔 JSON 來回不壞',J(s.flags.FX_CAP)===J(G.flags.FX_CAP));
    for(const bad of ['x',null,[1],7]){ G.flags.FX_CAP=bad; const d=SOCIAL.applyFx(G,a,{love:2},{cap:'t:b'}); if(J(d)!==J({npcRom:2})||SOCIAL.fxCapGot(G,a,'t:b')!==2){ check('1. 壞掉的 FX_CAP（'+J(bad)+'）',false,J([d,G.flags.FX_CAP])); } }
    G.flags.FX_CAP={[a]:'x',[b]:{k:'y','t:z':{n:'q'}}}; const e1=SOCIAL.applyFx(G,a,{love:1},{cap:'t:c'}), e2=SOCIAL.applyFx(G,b,{love:1},{cap:'t:z'}); delete G.flags; const e3=SOCIAL.applyFx(G,a,{love:1},{cap:'t:d'});
    check('1. 舊存檔沒有 FX_CAP、裡面壞掉、連 flags 都沒有：重建、照常、不丟例外',J(e1)===J({npcRom:1})&&J(e2)===J({npcRom:1})&&J(e3)===J({npcRom:1})&&G.flags.FX_CAP[a]['t:d'].n===1,J({e1,e2,e3,F:G.flags})); });

  await sec(2,async()=>{ const who='heroine_02', loc='D13', pid='D13.drink', LN=DATE_LINES.loc[loc].lines[who], keep=J(LN), pn=id=>DATE.points(loc).find(p=>p.id===id).name;
    OUT.BG.d13_base_sunset=OUT.BG.d13_base_sunset||{label:'淡水',image:'x'};
    const go=async(want)=>{ const G=H.G; const b=DATE.book(G,{who,locs:[loc],transport:'mrt',day:G.day,depart:15}); const q=OUT.get(G,'date_'+b.trip); G.hour=15; reset(); WANT=['出發','自己選'].concat(want,['差不多了，回去吧']); await OUT.prompt(GM,q); return DATE.trip(G,b.trip); };
    const next=()=>{ const G=H.G; G.day+=7; G.weekday=CALENDAR.dateOf(G.day).wd%7; };
    const day=STORY.termDay('Y1S2',5,6), start=()=>{ const G=H.fresh('2026-03-01',9); G.day=day; G.weekday=6; G.money=50000; H.rel(who,65,50,45); return G; };
    const c0f=DATE.canConfess;
    try{ const F=LN.hotspots[pid].first, c0=F.choice[0]; c0.fx={love:2,fr:1};
      LN.hotspots[pid].opts={again:[[{t:'（假）再來甲',re:'甲。',fx:{love:2}},{t:'（假）再來扣',re:'扣。',fx:{love:-1}}]]};
      LN.closing.opts={again:[{t:'（假）送她',re:'好。',fx:{love:2,fr:1}},{t:'（假）再見',fx:{fr:1}}]};
      let G=start(); await go([pn(pid),c0.t]); const v1={love:love(who),keys:keys(who)};
      next(); await go([pn(pid),'（假）再來甲','（假）送她']); const v2={love:love(who),fam:fam(who),keys:keys(who),both:CH.some(c=>c.includes('（假）再來甲'))&&CH.some(c=>c.includes('（假）送她'))};
      check('2. 校外約會：一次約會兩個地方的選項各 +2＝她的戀愛一共只加 2（fr 照加）；鍵＝date:<那一天>:<地點>；下一次約會重新算',v1.love===2&&v2.both&&v2.love===2&&v2.fam===1&&v2.keys.length===1&&v2.keys[0]==='date:'+G.day+':'+loc&&v1.keys[0]!==v2.keys[0],J({v1,v2}));
      next(); await go([pn(pid),'（假）再來扣','（假）送她']); const v3={love:love(who),neg:FXD.some(([w,d])=>w===who&&d&&d.npcRom===-1)};
      check('2. 先扣 1 再 +2：扣的照扣、加的照上限（合計 +1）',v3.neg&&v3.love===1,J(v3));
      DATE.canConfess=(g,id)=>id===who?{ok:true}:c0f(g,id); const cm=DATE.capMax(G,who), cm2=DATE.capMax(G,'heroine_01');
      LN.closing.opts={again:[{t:'（假）送她',re:'好。',fx:{love:2,fr:1}},{t:'（假）再見',fx:{fr:1}}]};
      next(); await go([pn(pid),'（假）再來甲','（假）送她','（今天先不說）']); const v4={love:love(who)};
      check('2. 告白那一晚（今天告白的條件都到了）：上限 +3（別人照 +2）',cm===3&&cm2===2&&v4.love===3,J({cm,cm2,v4}));
      DATE.canConfess=c0f; G.flags.confessed={[who]:G.day}; const cm3=DATE.capMax(G,who); G.flags.confessed[who]=G.day-1; const cm4=DATE.capMax(G,who);
      check('2. 今天她已經答應（confessed＝今天）也算告白那一晚；昨天的不算',cm3===3&&cm4===2,J([cm3,cm4]));
    } finally { DATE.canConfess=c0f; DATE_LINES.loc[loc].lines[who]=JSON.parse(keep); WANT=[]; } });

  await sec(3,async()=>{ const id='heroine_01', T='Y1S2', L=LADDER.byTerm[T][id], keep=J(L), who={name:'以安',charId:id};
    const start=()=>{ const G=H.fresh('2026-03-01',10,'campus'); G.day=STORY.termDay(T,3,2); G.weekday=2; H.rel(id,45,30,0); return G; };
    const talk=async(want)=>{ reset(); WANT=want||[]; return STORY.ladderTalk(GM,who,id); };
    try{ const s0=L.steps[0], s1=L.steps[1];
      L.steps[0]=Object.assign({},s0,{fx:{love:1,fr:1},choices:[{t:'（假）甲',re:'（假）回甲。',fx:{love:2,fr:1}},{t:'（假）乙',re:'（假）回乙。',fx:{love:-2}}]});
      if(s1) L.steps[1]=Object.assign({},s1,{fx:{love:2},choices:[{t:'（假）丙',re:'（假）回丙。',fx:{love:2}}]});
      let G=start(); await talk(['（假）甲']); const a={love:love(id),fam:fam(id),keys:keys(id)};
      check('3. 閒聊階梯：層的 fx（+1）＋選項的 fx（+2）＝這一次聊天她的戀愛一共 +2；fr 照加兩次；鍵＝ladder:<天>:<那一層>',a.love===2&&a.fam===2&&a.keys.length===1&&a.keys[0]==='ladder:'+G.day+':'+(s0.id||''),J(a));
      if(s1){ G.day+=1; G.weekday=3; await talk(['（假）丙']); const b={love:love(id),said:idx('（假）回丙。')>=0}; check('3. 隔天的下一層＝另一次聊天，重新算（+2）',b.said&&b.love===2,J(b)); }
      G=start(); await talk(['（假）乙']); const c={love:love(id)};
      check('3. 層 +1、選項 -2：扣的不限（合計 -1）',c.love===-1,J(c));
    } finally { LADDER.byTerm[T][id]=JSON.parse(keep); WANT=[]; } });

  await sec(4,async()=>{ const id='heroine_01', who={name:'以安',charId:id};
    for(const f of ['src/data/study_scenes.js','src/data/activity_scenes.js','src/studyn3d.js']){ if(f.includes('studyn3d')&&typeof STUDYN!=='undefined') continue; if(f.includes('study_scenes')&&typeof STUDY_SCENES!=='undefined') continue; if(f.includes('activity_scenes')&&typeof ACTIVITY_SCENES!=='undefined') continue; loadG(f); }
    const sc=k=>({kind:k,mid:['（假）中途。'],opts:[{t:'（假）甲',fx:{love:2,fr:1},reply:['（假）回甲。']},{t:'（假）扣',fx:{love:-1}}]});
    let G=H.fresh('2025-10-18',19); H.FRIEND(id); reset(); WANT=['（假）甲']; await STUDYN.mid(GM,who,id,sc('eat')); await STUDYN.mid(GM,who,id,sc('eat')); const a={love:love(id),fam:fam(id),keys:keys(id)};
    await STUDYN.mid(GM,who,id,sc('walk')); const b={love:love(id),keys:keys(id)}; G.day+=1; await STUDYN.mid(GM,who,id,sc('eat')); const c={love:love(id)};
    check('4. 一起活動／念書（STUDYN.mid）：同一天同一種活動的選項合計 +2（fr 照加）；鍵＝act:<天>:<活動>；另一種活動、隔天各自算',a.love===2&&a.fam===2&&J(a.keys)===J(['act:'+(G.day-1)+':eat'])&&b.love===4&&b.keys.length===2&&c.love===6,J({a,b,c}));
    G=H.fresh('2025-10-18',19); H.FRIEND(id); reset(); WANT=['（假）扣']; await STUDYN.mid(GM,who,id,sc('eat')); WANT=['（假）甲']; await STUDYN.mid(GM,who,id,sc('eat')); await STUDYN.mid(GM,who,id,sc('eat'));
    check('4. 先扣 1、再 +2、再 +2＝-1+2+0',love(id)===1,J(FXD));
    /* 約好的那一次：路上的選項、升級句的小選擇、中途的選項＝同一個鍵（meet:<約的 id>）*/
    const z='heroine_02', zw={name:'芷若',charId:z}; G=H.fresh('2025-10-18',19); H.FRIEND(z); G.invites=[];
    const W=INVITE_DATA.people[z].walk||(INVITE_DATA.people[z].walk={}); const u0=SOCIAL.upLine, m0=SOCIAL.markUp;
    try{ W.zz_fx=[{once:'T_CAP_WALK',l:['（假）路上她問。'],ch:[{t:'（假）路甲',re:'（假）回。',fx:{love:1,fr:1}}]}];
      SOCIAL.upLine=()=>({k:'T',l:['（假）升級句。'],ch:[{t:'（假）升甲',re:'（假）回。',fx:{love:2}}]}); SOCIAL.markUp=()=>{};
      const iv={id:'iv77',who:z,place:'cafe',ask:'T_CAP_WALK'}; reset(); WANT=['（假）路甲','（假）升甲','（假）甲'];
      await INV.walkAsk(GM,iv,zw); await SOCIAL.playUp(GM,zw,z,{place:'cafe',outing:true,cap:INV.fxCap(G,iv)}); await STUDYN.mid(GM,zw,z,sc('eat'),INV.fxCap(G,iv)); const m={love:love(z),fam:fam(z),keys:keys(z)};
      check('4. 約好的那一次（邀約見面）：路上的選項 +1、升級句的小選擇 +2、中途的選項 +2＝一共 +2；鍵都是 meet:<約的 id>',m.love===2&&m.fam===2&&J(m.keys)===J(['meet:iv77']),J(m));
      const src=fs.readFileSync(path.join(H.ROOT,'src/invites3d.js'),'utf8'), nMid=(src.match(/STUDYN\.mid\(/g)||[]).length, nCap=(src.match(/STUDYN\.mid\([^;]*?,S\.fxCap\(G,iv\)\)/g)||[]).length;
      check('4. invites3d.js：每一處 STUDYN.mid 都給這一次約的鍵；見面開場的升級句也給',nMid>=3&&nCap===nMid&&/playUp\(GM,who,iv\.who,\{place:P\.id,outing:true,cap:S\.fxCap\(G,iv\)\}\)/.test(src),J({nMid,nCap}));
      reset(); WANT=['（假）升甲']; await SOCIAL.playUp(GM,zw,z,{}); await SOCIAL.playUp(GM,zw,z,{}); const up={love:love(z),keys:keys(z)};
      check('4. 平常聊天的升級句小選擇：chat:<天>，一天合計 +2',up.love===2&&J(up.keys)===J(['chat:'+G.day]),J(up));
    } finally { delete W.zz_fx; SOCIAL.upLine=u0; SOCIAL.markUp=m0; WANT=[]; } });

  await sec(5,async()=>{ const Lx=TERMEND_LINES, a='heroine_01', T='Y1S1', keep=Lx.POOL[T][a].slice(), c0f=DATE.canConfess;
    const dinner=async(want)=>{ const G=H.fresh('2026-01-15',18.5); H.rel(a,45,30,0); reset(); WANT=want||[]; await TERMEND.dinner(GM,{te:{term:T,who:a,kind:'friend'}}); return G; };
    const keepTO=globalThis.TERMEND_OPTS; if(keepTO) globalThis.TERMEND_OPTS=Object.assign({},keepTO,{FRIEND:undefined});   /* TERMEND-OPTS-1110（朋友版）：以安大一上現在讀 TERMEND_OPTS.FRIEND、不抽話題池；這一節測的是話題池的機制（沛珊、多人桌還在用），先把 FRIEND 拿掉 */
    try{ Lx.POOL[T][a]=[{say:['（假）話題一。'],opts:[{t:'（假）甲',re:['（假）回甲。'],fx:{love:2,fr:1}},{t:'（假）扣',fx:{love:-1}}]},{say:['（假）話題二。'],opts:[{t:'（假）丙',re:['（假）回丙。'],fx:{love:2,fr:1}}]},keep[2]];
      let G=await dinner(['（假）甲','（假）丙']); const v={both:idx('（假）回甲。')>=0&&idx('（假）回丙。')>=0,love:love(a),fam:fam(a),keys:keys(a)};
      check('5. 期末的飯：兩則話題的選項各 +2＝這頓飯她的戀愛一共 +2（fr 照加兩次）；鍵＝termend:<天>',v.both&&v.love===2&&v.fam===2&&J(v.keys)===J(['termend:'+G.day]),J(v));
      G=await dinner(['（假）扣','（假）丙']); check('5. 先扣 1 再 +2＝+1（扣的不限）',love(a)===1,J(FXD));
      DATE.canConfess=(g,id)=>id===a?{ok:true}:c0f(g,id); G=await dinner(['（假）甲','（假）丙']);
      check('5. 告白那一晚的飯：上限 +3',love(a)===3&&FXD.some(([w,,o])=>w===a&&o&&o.max===3),J(FXD));
    } finally { DATE.canConfess=c0f; Lx.POOL[T][a]=keep; WANT=[]; globalThis.TERMEND_OPTS=keepTO; } });

  await sec(6,async()=>{ const id='heroine_01', th='p:'+id, b='heroine_02'; let G=H.fresh('2025-10-18',19); H.FRIEND(id); H.FRIEND(b); G.contacts={[id]:1,[b]:1}; PHONE.rec(G);
    const ask=(n,who,fx)=>{ PHONE.post(G,{th:'p:'+who,from:who,text:'（假）訊息'+n,ask:{id:'cap_'+n,opts:[{t:'（假）甲',say:[{from:who,text:'（假）回'}],fx},{t:'（假）乙'}]}}); return PHONE.answer(G,'cap_'+n,0); };
    reset(); ask(1,id,{love:2,fr:1}); ask(2,id,{love:1,fr:1}); ask(3,id,{love:-1}); ask(4,id,{love:1}); const d1={love:love(id),fam:fam(id),keys:keys(id)}; ask(5,b,{love:2}); const other=love(b);
    G.day+=1; ask(6,id,{love:1}); const d2=love(id);
    check('6. 手機回覆：同一個人一天合計 +2（+2、+1 不加、-1 照扣、+1 不加＝+1）；fr 照加；鍵＝phone:<天>；別人各自算；隔天重新算',d1.love===1&&d1.fam===2&&J(d1.keys)===J(['phone:'+(G.day-1)])&&other===2&&d2===2,J({d1,other,d2,FXD})); });

  await sec(7,async()=>{ global.NY3=global.NY3||{}; global.Z3=global.Z3||{ZONES:{}};
    if(typeof MOVIES==='undefined') for(const f of ['src/data/nanyang_movies.js','src/data/movie_plots.js','src/movies3d.js']) loadG(f);
    const z='heroine_02', G=H.fresh('2025-11-20',19); H.FRIEND(z); const f='m2511b', iv={id:'iv5',who:z,place:'xs_nanyang',film:f}, k=INV.fxCap(G,iv), k2=INV.fxCap(G,{id:'iv6',who:z,place:'cafe'}), k3=INV.fxCap(G,{id:'iv7',who:z,place:'xs_nanyang'});
    reset(); SOCIAL.applyFx(G,z,{love:1},k); MOVIES.fxFilm(G,z,f,{love:2}); const tot=love(z);
    check('7. 看電影的那一次約：路上／中途的選項和那部片的 talk 同一個鍵（movie:<片>，不清掉）＝合計 +2；別的地點、還沒定片＝meet:<約的 id>',k.cap==='movie:'+f&&k.keep===true&&tot===2&&k2.cap==='meet:iv6'&&k3.cap==='meet:iv7',J({k,k2,k3,tot})); });
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
