// AA_187 以安、語彤的戀愛線補完：遊戲裡還沒有的五段（任務 AA187-PAIR-GAPS-1031；企劃線 claude/cool-heisenberg-o8kuqx；src/aa187_3d.js）——不需要瀏覽器。
//   0 載得到、index.html 的位置、掛勾；每一句台詞照稿（從企劃線 git show 讀 AA_187 逐字比對）；作廢的不出（「理由：樣本要夠」、總圖版、「只有你注意到」）
//   1 1-1 新 13b「反駁的次數」ev_an_counted：2027-10-21 起、大三上、讀書會散會後、加入讀書會、第 5 階以上、她在；只演一次；記 AN_COUNTED；裂縫談話那晚不演
//   2 1-6 交往中散會後的那段路 ev_an_walk_home：「（送她回去）」→ 五組照順序輪（下雨那一組只在下雨）；每個月最多一次；不扣時間；2028-11-30 以後不播；她在日本不播；不送不算
//   3 2-1 語彤 (a) 告白理由句兩版（NOTICED_EMPTY_SEAT；字照 AA_313 第 4 節）(b) 大三上第一個下雨的週二、HELPED、走進麵店：旁白一句，只一次
//   4 2-3 打烊後的那一桌 ev_yt_family_dinner：2029-04-26 17:00 私訊兩則、20:30～21:00 在麵店＝演、記 YT_FAMILY_DINNER；21:00 沒到＝兩則；尾聲語彤前面一句旁白（交往中才有）
//   5 2-4 週四的斜對面 ev_yt_thu_seat：交往中、事件 13 以後、週四 17:30～18:30 總圖三樓坐她旁邊；四組照順序輪（下雨那一組只在下雨）；每個月最多一次；裂縫談話那天不出
// 修改前（開發分支 97c4f5e7e）：沒有 src/aa187_3d.js——FAIL。用法：node tests/aa187_pair_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return; } try{ const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+e); } };
for(const f of ['src/data/cracktalk_lines.js','src/cracktalk3d.js','src/aa187_3d.js']) L3(f);   /* index.html 的順序：cracktalk3d.js 在前 */
GM.toast=()=>{}; GM.caption=()=>{};
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const git=f=>{ try{ return cp.execSync('git show origin/claude/cool-heisenberg-o8kuqx:"docs/story_planning/'+f+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const DOC=git('AA_187_以安語彤_戀愛線補完.md'), DOC313=git('AA_313_法律系四年_AA自己逐場檢查.md');
const AN='heroine_01', YT='heroine_03', X=()=>typeof AA187!=='undefined'&&AA187.EVENTS?AA187:null, ev=id=>STORY_EVENTS.find(e=>e.id===id);
const PLG=ACTIVITIES.list.find(a=>a.id==='public_law_group');
const setT=(k,h)=>{ const G=H.G, d=typeof k==='number'?k:D(k); G.day=d; G.hour=h; G.weekday=wdOf(d); };
const fresh=(k,h,zone,flags)=>{ const G=H.fresh(typeof k==='number'?keyOf(k):k,h,zone||'dorm',flags||{}); return G; };
const said=()=>H.said.map(s=>(s.who?s.who+'：':'')+s.t);
const run=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id),{noTitle:true}); return said(); };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const st5=id=>{ H.rel(id,45,30,0); SOCIAL.rel(id).npcRom=35; };   /* 第 5 階（date3d.js stageNum：熟悉 ≥40、信任 ≥25、她的戀愛 ≥30）*/
const st4=id=>{ H.rel(id,45,30,0); SOCIAL.rel(id).npcRom=10; };
const date=id=>{ H.G.flags['dating_'+id]=true; };
const plgOn=d=>ACTIVITIES.on(PLG,d,H.G);
const thus=(from,to)=>{ const a=[]; for(let d=D(from);d<=D(to);d++) if(wdOf(d)===4) a.push(d); return a; };
const plgThus=(from,to)=>thus(from,to).filter(plgOn);
const after=()=>{ const e=CLS.afterActEvent(H.G,PLG); return e?e.id:null; };   /* classes3d.js：散會後接著演的那一件（afterActivity）*/
const norm=t=>String(t).replace(/^「|」$/g,'');
const inDoc=(t,doc)=>{ doc=doc||DOC; return !doc||doc.indexOf(t)>=0||doc.indexOf(norm(t))>=0; };   /* 讀不到企劃線（沒 fetch）就只比對程式 */
(async()=>{
  const ok=!!X();
  check('0. src/aa187_3d.js 載得到、五個事件進了 STORY_EVENTS',ok&&!loadErr.length&&['ev_an_counted','ev_an_walk_home','ev_yt_umbrella_hook','ev_yt_family_dinner','ev_yt_thu_seat'].every(id=>!!ev(id)),J(loadErr));
  if(!ok){ H.done(); return; }
  await sec('0',async()=>{
    check('0. 讀稿：企劃線 AA_187（檔首【文件狀態】、1-1「……樣本還不夠。」那一版、2-3、2-4）',!!DOC&&DOC.indexOf('文件狀態')>=0&&DOC.indexOf('……樣本還不夠。')>=0&&DOC.indexOf('### 2-4.')>=0,'長度 '+DOC.length);
    const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), a=f=>html.indexOf(f);
    check('0. index.html：aa187_3d.js 在 story3d.js、date3d.js、postgrad3d.js、cracktalk3d.js、xcrom3d.js 以後，bbpack_events.js、GAME.boot() 以前',/<script src="src\/aa187_3d\.js\?v=[^"]+"><\/script>/.test(html)&&['src/story3d.js','src/date3d.js','src/postgrad3d.js','src/cracktalk3d.js','src/xcrom3d.js'].every(f=>a(f)>0&&a(f)<a('src/aa187_3d.js'))&&a('src/aa187_3d.js')<a('src/data/bbpack_events.js')&&a('src/aa187_3d.js')<a('GAME.boot()'));
    check('0. 掛勾：STORY.PHONE_RULES、STORY.TICKS 各一個；PG.epiLine 包過（尾聲）',STORY.PHONE_RULES.some(f=>/S\.phone\(G\)/.test(String(f)))&&STORY.TICKS.some(f=>/umbDay/.test(String(f)))&&PG.epiLine._aa187===true);
    /* 每一句台詞、旁白、選項都在稿裡（補的系統選項「（各自回去）」除外；選項的括號是遊戲的動作寫法：「送她回去」照字比）*/
    const COMPOSED=new Set(['（各自回去）']);
    const bad=[]; for(const e of X().EVENTS) for(const l of e.dialogue){ if(l.text!==undefined&&!inDoc(l.text)) bad.push(e.id+'：'+l.text); for(const c of (l.choice||[])) if(!COMPOSED.has(c.text)&&!inDoc(c.text.replace(/^（|）$/g,''))) bad.push(e.id+' 選項：'+c.text); }
    for(const t of X().FD_MSG.concat(X().FD_MISS,[X().FD_EPI])) if(!inDoc(t)) bad.push('私訊／尾聲：'+t);
    check('0. 每一句都在 AA_187（一字不差；補的只有不送的那個選項「（各自回去）」）',bad.length===0,bad.slice(0,6).join('｜'));
    const src=fs.readFileSync(path.join(H.ROOT,'src/aa187_3d.js'),'utf8');
    check('0. 作廢的不出：1-1 的「理由：樣本要夠，才能下結論。」、1-6 總圖版（「這本明天要還」「我室友問我」）、2-1「只有你注意到」；沒有「小語」',['樣本要夠','這本明天要還','我室友問我','只有你注意到','小語'].every(t=>src.indexOf("'"+t)<0&&src.indexOf(t+"'")<0&&!X().EVENTS.some(e=>J(e.dialogue).indexOf(t)>=0)));
  });

  /* ===== 1 1-1 新 13b「反駁的次數」===== */
  await sec('1',async()=>{
    const E1=ev('ev_an_counted');
    const at=(k,o)=>{ o=o||{}; const G=fresh(k,21.5,'wancai',o.member===false?{}:{PUBLIC_LAW_GROUP:true}); (o.st4?st4:st5)(AN); if(o.dating) date(AN); if(o.att!==false) ACTIVITIES.markAttended(G,PLG); return G; };
    check('1. 2027-10-21（四）是大三上、那晚有公法讀書會',CALENDAR.termOf(D('2027-10-21')).id==='Y3S1'&&wdOf(D('2027-10-21'))===4&&plgOn(D('2027-10-21')));
    at('2027-10-21'); check('1. 10/21 散會後（加入讀書會、第 5 階、有去、她在）＝ev_an_counted（afterActivity public_law_group）',E1.afterActivity==='public_law_group'&&E1.once===true&&after()==='ev_an_counted',after());
    at('2027-10-14'); check('1. 10/14（10/21 以前）不演',after()!=='ev_an_counted',after());
    at('2027-10-21',{st4:true}); check('1. 第 4 階（她的戀愛 <30）不演、不提示',after()!=='ev_an_counted'&&AA187.countedOk(H.G)===false);
    at('2027-10-21',{member:false}); check('1. 沒加入公法讀書會不演',AA187.countedOk(H.G)===false);
    at('2027-10-21',{att:false}); check('1. 那晚沒去讀書會不演',AA187.countedOk(H.G)===false);
    { const later=plgThus('2027-10-22','2028-01-20'); const G=at(later[0]); check('1. 10/21 那晚沒演到（還不到第 5 階）：之後第一個符合條件的週四（'+keyOf(later[0])+'）演',after()==='ev_an_counted',after()); }
    { const y3s2=plgThus('2028-02-20','2028-03-20')[0]; at(y3s2); check('1. 大三下（'+keyOf(y3s2)+'）不演（大三上才有）',after()!=='ev_an_counted',after()); }
    { at('2027-10-21'); const was=AA187.countedOk(H.G); CRACKTALK.pr(H.G,AN).plan={att:[{m:'plg',day:H.G.day,t1:21.5}],i:0}; check('1. 那晚排了以安的裂縫談話（「你留一下。」）：先不演',was===true&&AA187.countedOk(H.G)===false); }
    at('2027-10-21'); const L=await run('ev_an_counted');
    check('1. 台詞照稿（2026-10-18 最新版：「……樣本還不夠。」）、沒有選項、記 AN_COUNTED',J(L)===J(['（其他人都走了。她的手帳攤在桌上，你看到一頁寫著「反駁」兩個字，下面一排正字。）','祐廷：這是什麼？','沈以安：（把手帳闔上）統計。','沈以安：……讀書會上，有人反駁我的次數。','祐廷：幾次？','沈以安：十七。','沈以安：其他人加起來是三。','（她把手帳收進包包。拉鍊拉到一半，停住。）','沈以安：……樣本還不夠。'].map(t=>t.replace(/^祐廷：/,H.G.name+'：').replace(/^沈以安：/,SOCIAL.displayName(AN)+'：')))&&H.opts.length===0&&H.G.flags.AN_COUNTED===true,J(L));
    ACTIVITIES.markAttended(H.G,PLG); check('1. 只演一次（演過以後同一晚、之後的週四都不再演）',after()!=='ev_an_counted');
  });

  /* ===== 2 1-6 交往中散會後的那段路 ===== */
  await sec('2',async()=>{
    const W=AA187.WALK, lines=i=>W[i].lines.map(l=>(l.speaker==='player'?H.G.name+'：':l.speaker?SOCIAL.displayName(l.speaker)+'：':'')+l.text);
    const days=plgThus('2027-09-01','2028-11-30').filter(d=>d<D('2028-03-25')||d>=D('2028-09-01'));   /* 大三上～大四上的讀書會週四（她在日本那一段不算）*/
    const byMonth={}; for(const d of days){ const m=keyOf(d).slice(0,7); (byMonth[m]=byMonth[m]||[]).push(d); }
    const months=Object.keys(byMonth).sort();
    const at=(d,o)=>{ o=o||{}; H.G.day=d; H.G.hour=21.5; H.G.weekday=wdOf(d); H.G.zone='wancai'; H.G.weather=o.rain?'rain':'clear'; ACTIVITIES.markAttended(H.G,PLG); };
    fresh(months[0]+'-01',21.5,'wancai',{}); date(AN); H.FRIEND(AN);
    at(byMonth[months[0]][0]);
    check('2. 和以安交往中、她那晚在讀書會：散會後＝ev_an_walk_home（afterActivity public_law_group）',after()==='ev_an_walk_home',after());
    const h0=H.G.hour, L0=await run('ev_an_walk_home',[0]);
    check('2. 選項「（送她回去）」／「（各自回去）」；送她＝第一組（旁白＋對話）、不扣時間、記這個月',J(H.opts[0])===J(['（送她回去）','（各自回去）'])&&J(L0)===J(lines(0))&&H.G.hour===h0&&H.G.flags.AN_WALK_M===months[0],J([H.opts[0],L0,H.G.hour]));
    at(byMonth[months[0]][1]); check('2. 同一個月第二次讀書會：不再出（每個月最多一次）',after()!=='ev_an_walk_home'&&AA187.walkOk(H.G)===false);
    const seq=[0]; let mi=1;
    for(const rain of [false,false,true,false,false,false]){ const m=months[mi++]; if(!m) break; at(byMonth[m][0],{rain}); const L=await run('ev_an_walk_home',[0]); seq.push(H.G.flags.AN_WALK_CUR); if(J(L)!==J(lines(H.G.flags.AN_WALK_CUR))) seq.push('台詞不符'); }
    check('2. 照順序輪：0→1→2→（下雨）3「不要說話。我在算角度。」→4→一輪用完重來 0→1（下雨那一組只在下雨）',J(seq)===J([0,1,2,3,4,0,1]),J(seq));
    { fresh(months[0]+'-01',21.5,'wancai',{}); date(AN); const s=[]; for(let i=0;i<4;i++){ at(byMonth[months[i]][0]); await run('ev_an_walk_home',[0]); s.push(H.G.flags.AN_WALK_CUR); }
      check('2. 一直沒下雨：0→1→2→4（雨的那一組跳過）',J(s)===J([0,1,2,4]),J(s)); }
    { fresh(months[0]+'-01',21.5,'wancai',{}); date(AN); at(byMonth[months[0]][0],{rain:true}); await run('ev_an_walk_home',[0]); check('2. 第一次就下雨：先用雨的那一組（3）',H.G.flags.AN_WALK_CUR===3,H.G.flags.AN_WALK_CUR); }
    { fresh(months[0]+'-01',21.5,'wancai',{}); date(AN); at(byMonth[months[0]][0]); const L=await run('ev_an_walk_home',[1]); at(byMonth[months[0]][1]);
      check('2. 選「（各自回去）」：沒有台詞、不算這個月（下一週再問）',L.length===0&&H.G.flags.AN_WALK_M==null&&after()==='ev_an_walk_home',J([L,H.G.flags.AN_WALK_M])); }
    { fresh(months[0]+'-01',21.5,'wancai',{}); at(byMonth[months[0]][0]); check('2. 沒有交往：不出',after()!=='ev_an_walk_home'&&AA187.walkOk(H.G)===false); }
    { fresh(months[0]+'-01',21.5,'wancai',{}); date(AN); H.G.day=byMonth[months[0]][0]; H.G.weekday=4; check('2. 那晚沒去讀書會：不出',AA187.walkOk(H.G)===false); }
    { fresh(months[0]+'-01',21.5,'wancai',{}); date(AN); at(byMonth[months[0]][0]); CRACKTALK.pr(H.G,AN).plan={att:[{m:'plg',day:H.G.day,t1:21.5}],i:0}; check('2. 那晚是以安的裂縫談話：不出',AA187.walkOk(H.G)===false); }
    { const d1130=D('2028-11-30'), d1207=D('2028-12-07'); fresh('2028-11-01',21.5,'wancai',{}); date(AN);
      at(d1130); const a=AA187.walkOk(H.G); at(d1207); const b=plgOn(d1207), c=AA187.walkOk(H.G);
      check('2. 2028-11-30（她交棒那一晚，大四上第 13 週）還有；12/7（第 14 週，讀書會照開）她不去＝不播',a===true&&b===true&&c===false,J([a,b,c])); }
    { const jp=plgThus('2028-04-01','2028-05-30')[0]; fresh(keyOf(jp),21.5,'wancai',{}); date(AN); at(jp); check('2. 大三下她在日本（'+keyOf(jp)+'，讀書會照開）：不出',plgOn(jp)&&STORY.present(AN,H.G)===false&&AA187.walkOk(H.G)===false); }
  });

  /* ===== 3 2-1 語彤 ===== */
  await sec('3',async()=>{
    const over=TERMEND_LINES.HEART.heroine_03.over.find(o=>o.terms.includes('Y4S1')), f=over.she.find(x=>typeof x==='function');
    fresh('2028-12-20',21,'noodle',{}); const a=f(H.G); SOCIAL.remember(YT,'NOTICED_EMPTY_SEAT',''); const b=f(H.G);
    check('3. (a) 大四上心意邀約她的理由句：沒有 NOTICED_EMPTY_SEAT＝「你每次吃完，都自己把碗拿到櫃台。」「……我都有看到。」（AA_187 2-1）',J(a)===J(['你每次吃完，都自己把碗拿到櫃台。','……我都有看到。'])&&inDoc(a[0])&&inDoc(a[1]),J(a));
    check('3. (a) 事件 10 選過「我那週有注意到妳的位子空著」（NOTICED_EMPTY_SEAT）＝另一版；字照 AA_313 第 4 節（2026-10-20，比 AA_187 10-18 的改字晚）',J(b)===J(['大一期中那週，我的位子空著。……你那時候就看到了。'])&&(!DOC313||DOC313.indexOf('大一期中那週，我的位子空著。……你那時候就看到了。')>=0),J(b));
    { const e10=STORY_EVENTS.find(e=>(e.dialogue||[]).some(l=>(l.choice||[]).some(c=>c.text==='「我那週有注意到妳的位子空著。」'))), ix=e10?e10.dialogue.findIndex(l=>l.label==='seen'):-1, seen=ix>=0?e10.dialogue.slice(ix,ix+4):[];
      check('3. (a) 事件 10 那個選項記 NOTICED_EMPTY_SEAT（'+(e10&&e10.id)+'）',seen.some(l=>(l.mem||[]).some(m=>m.npc===YT&&m.tag==='NOTICED_EMPTY_SEAT'))); }
    const U=ev('ev_yt_umbrella_hook');
    const tues=[]; for(let d=CALENDAR.termDays?CALENDAR.termDays('Y3S1').from:D('2027-09-01');tues.length<6;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y3S1'&&wdOf(d)===2&&!(CALENDAR.typhoon&&CALENDAR.typhoon(d))) tues.push(d); }
    const tick=()=>{ for(const f of STORY.TICKS) f(GM,0.5); };
    const at=(d,h,zone,w)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wdOf(d); H.G.zone=zone; H.G.weather=w; };
    fresh(keyOf(tues[0]),12,'campus',{}); SOCIAL.remember(YT,'HELPED','把傘給她');
    at(tues[0],12,'campus','clear'); tick(); at(tues[0]+1,12,'campus','rain'); tick();
    check('3. (b) 大三上：晴天的週二、下雨的週三都不算「第一個下雨的週二」',H.G.flags.YT_UMB_TUE==null);
    at(tues[1],10,'campus','rain'); tick(); check('3. (b) 下雨的週二（人在校園也記）：記 YT_UMB_TUE＝那天',H.G.flags.YT_UMB_TUE===tues[1],keyOf(tues[1]));
    at(tues[1],18,'noodle','rain'); const c1=EVENTS.check(U); const L=await run('ev_yt_umbrella_hook');
    check('3. (b) 那天走進麵店（有 HELPED）：旁白「（那把傘，掛在只有她拿得到的地方。）」，不說話、不選擇、沒有標題',c1&&U.trigger==='auto'&&!U.title&&J(L)===J(['（那把傘，掛在只有她拿得到的地方。）'])&&H.opts.length===0,J(L));
    check('3. (b) 只一次',!EVENTS.check(U));
    { fresh(keyOf(tues[0]),12,'campus',{}); SOCIAL.remember(YT,'HELPED','把傘給她'); at(tues[1],10,'campus','rain'); tick(); at(tues[2],18,'noodle','rain'); tick();
      check('3. (b) 第一個下雨的週二沒去麵店：下一個下雨的週二不演（只有第一個）',H.G.flags.YT_UMB_TUE===tues[1]&&!EVENTS.check(U)); }
    { fresh(keyOf(tues[0]),12,'campus',{}); at(tues[1],18,'noodle','rain'); tick(); check('3. (b) 沒有 HELPED（大一沒把傘給她）：不演',H.G.flags.YT_UMB_TUE===tues[1]&&!EVENTS.check(U)); }
    { const t2=[]; for(let d=D('2027-02-15');t2.length<1;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y2S2'&&wdOf(d)===2) t2.push(d); } fresh(keyOf(t2[0]),18,'noodle',{}); SOCIAL.remember(YT,'HELPED',''); at(t2[0],18,'noodle','rain'); tick();
      check('3. (b) 大二下的雨天週二：不算',H.G.flags.YT_UMB_TUE==null&&!EVENTS.check(U)); }
  });

  /* ===== 4 2-3 打烊後的那一桌 ===== */
  await sec('4',async()=>{
    const F=ev('ev_yt_family_dinner'), d=D('2029-04-26'), dm=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag).map(m=>m.from+':'+m.text);
    const rules=()=>{ AA187.phone(H.G); PHONE.tick(H.G); };
    check('4. 2029-04-26 是週四（大四下）',wdOf(d)===4&&CALENDAR.termOf(d)&&CALENDAR.termOf(d).id==='Y4S2');
    fresh('2029-04-26',16.9,'dorm',{}); date(YT); H.FRIEND(YT); rules(); const m0=dm('aa187_fd').length; setT(d,17.05); rules();
    check('4. 當天 17:00 語彤私訊兩則：「今天打烊後留下來」「阿姨說的 不是我說的」（17:00 以前沒有）',m0===0&&J(dm('aa187_fd'))===J([YT+':今天打烊後留下來',YT+':阿姨說的 不是我說的']),J(dm('aa187_fd')));
    const chk=(h,zone)=>{ setT(d,h); H.G.zone=zone; return EVENTS.check(F); };
    check('4. 20:30～21:00 人在麵店（3D）＝演；20:29、21:00、不在麵店不演',F.location==='noodle'&&F.trigger==='auto'&&F.once===true&&chk(20.5,'noodle')&&chk(20.95,'noodle')&&!chk(20.48,'noodle')&&!chk(21,'noodle')&&!chk(20.7,'gongguan'));
    { const G=H.G; const k=G.flags.dating_heroine_03; G.flags.dating_heroine_03=false; const a=chk(20.7,'noodle'); G.flags.dating_heroine_03=k; setT(D('2029-04-19'),20.7); G.zone='noodle'; const b=EVENTS.check(F);
      check('4. 沒有交往、別的週四都不演',!a&&!b); }
    chk(20.6,'noodle'); const L=await run('ev_yt_family_dinner'), A='阿姨', Y=SOCIAL.displayName(YT);
    check('4. 台詞照稿、記 YT_FAMILY_DINNER',J(L)===J(['（鐵門拉下一半。桌上擺了三副碗筷。）',A+'：坐。今天你不是客人。','（語彤把自己那碗推過來一點，又推回去。）',A+'：她以前不讓同學進廚房的。',Y+'：……阿姨。',A+'：日本的寺廟，我幫你們兩個都拜了。',Y+'：（低頭吃麵）……我們沒有要你拜。',A+'：我拜我的。','（回去的路上，她說今天的麵比較鹹。你說沒有。她說有。）'])&&H.G.flags.YT_FAMILY_DINNER===true,J(L));
    check('4. 只演一次',!chk(20.7,'noodle'));
    setT(d,21.05); rules(); check('4. 演過了：21:00 不傳「阿姨說下次」',dm('aa187_fd_miss').length===0);
    fresh('2029-04-26',17.05,'dorm',{}); date(YT); rules(); setT(d,20.95); rules(); const n0=dm('aa187_fd_miss').length; setT(d,21.05); rules();
    check('4. 沒到：21:00 語彤「阿姨說下次」「她多煮了一碗 我吃掉了」（21:00 以前沒有）',n0===0&&J(dm('aa187_fd_miss'))===J([YT+':阿姨說下次',YT+':她多煮了一碗 我吃掉了']),J(dm('aa187_fd_miss')));
    fresh('2029-04-26',17.05,'dorm',{}); rules(); setT(d,21.05); rules(); check('4. 沒有交往：17:00、21:00 都沒有',dm('aa187_fd').length===0&&dm('aa187_fd_miss').length===0);
    /* 尾聲（2034-06-03 Café）：語彤的句子前面一句旁白 */
    const epi=fl=>{ fresh('2034-06-03',19,'cafe',fl); SOCIAL.rel(YT).fam=60; return PG.epiLine(H.G,YT); };
    const e1=epi({dating_heroine_03:true,YT_FAMILY_DINNER:true}), e0=epi({dating_heroine_03:true}), e2=epi({YT_FAMILY_DINNER:true});
    check('4. 尾聲：交往中、有 YT_FAMILY_DINNER＝語彤的句子前面多「（語彤的手機桌布，是麵店那張照片：三個人，一張桌子。）」；後面照原本',Array.isArray(e1)&&e1[0]==='（語彤的手機桌布，是麵店那張照片：三個人，一張桌子。）'&&J(e1.slice(1))===J(e0),J(e1));
    check('4. 尾聲：沒演過那一桌、或沒在交往（朋友那一版）不加',Array.isArray(e0)&&e0[0]!==AA187.FD_EPI&&!(Array.isArray(e2)&&e2[0]===AA187.FD_EPI),J([e0,e2]));
  });

  /* ===== 5 2-4 週四的斜對面 ===== */
  await sec('5',async()=>{
    const SE=ev('ev_yt_thu_seat'), SEAT=AA187.SEAT, lines=i=>SEAT[i].lines.map(l=>(l.speaker==='player'?H.G.name+'：':l.speaker?SOCIAL.displayName(l.speaker)+'：':'')+l.text);
    const her={charId:YT,obj:{position:{x:1.2,y:0,z:0.9}},lv:0};
    const put=near=>{ GM.npc={[YT]:her}; E.npcs=[her]; her.obj.position.x=near?1.2:6; E.player.obj.position.x=0; E.player.obj.position.z=0; };
    const at=(d,h,o)=>{ o=o||{}; H.G.day=d; H.G.hour=h; H.G.weekday=wdOf(d); H.G.zone=o.zone||'library'; H.G.weather=o.rain?'rain':'clear'; put(o.near!==false); };
    const ths=thus('2027-12-16','2028-12-31').filter(d=>!(d>=D('2028-03-25')&&d<D('2028-09-01')));   /* 她在日本的那一段不算 */
    const byM={}; for(const d of ths){ const m=keyOf(d).slice(0,7); (byM[m]=byM[m]||[]).push(d); } const M=Object.keys(byM).sort();
    fresh('2027-12-23',17.75,'library',{}); date(YT); H.FRIEND(YT);
    at(D('2027-12-09'),17.75); check('5. 事件 13（12/16 週四空出來）以前的週四：不出（她週四在麵店）',!EVENTS.check(SE));
    at(D('2027-12-09'),17.75); H.G.flags.YT_EV13=true; const ev13=EVENTS.check(SE); H.G.flags.YT_EV13=false;
    at(byM[M[0]][0],17.75); const c0=EVENTS.check(SE);
    check('5. 事件 13 以後（演過 YT_EV13，或 12/16 起）週四 17:45 總圖三樓、坐在她旁邊（npcNear）＝出；trigger seat',SE.trigger==='seat'&&SE.location==='library'&&SE.npcNear===YT&&ev13&&c0);
    at(byM[M[0]][0],17.4); const a=EVENTS.check(SE); at(byM[M[0]][0],18.55); const b=EVENTS.check(SE); at(byM[M[0]][0]+6,17.75); const c=EVENTS.check(SE); at(byM[M[0]][0],17.75,{near:false}); const d_=EVENTS.check(SE); at(byM[M[0]][0],17.75,{zone:'library_hall'}); const e=EVENTS.check(SE);
    check('5. 17:30 以前、18:30 以後、週三、離她太遠（不是斜對面）、總圖二樓：都不出',!a&&!b&&!c&&!d_&&!e,J([a,b,c,d_,e]));
    { H.G.flags.dating_heroine_03=false; at(byM[M[0]][0],17.75); const x=EVENTS.check(SE); H.G.flags.dating_heroine_03=true; check('5. 沒有交往：不出',!x); }
    at(byM[M[0]][0],17.75); const L0=await run('ev_yt_thu_seat');
    check('5. 第一組：「（她推來一張便條：「你翻頁好大聲。」下面一行小字：「但我不想換位子。」）」；記這個月',J(L0)===J(lines(0))&&H.G.flags.YT_SEAT4_M===M[0],J(L0));
    at(byM[M[0]][1],17.75); check('5. 同一個月下一個週四：不出（每個月最多一次）',!EVENTS.check(SE));
    const seq=[0]; let mi=1; for(const rain of [false,false,true,false,false]){ const m=M[mi++]; at(byM[m][0],17.75,{rain}); if(!EVENTS.check(SE)){ seq.push('不出'); continue; } const L=await run('ev_yt_thu_seat'); seq.push(H.G.flags.YT_SEAT4_CUR); if(J(L)!==J(lines(H.G.flags.YT_SEAT4_CUR))) seq.push('台詞不符'); }
    check('5. 照順序輪：0→2「……拿錯了。」「妳拿著吧。」「……嗯。」→3→（下雨）1「……下雨了。」→重來 0→2',J(seq)===J([0,2,3,1,0,2]),J(seq));
    { fresh('2027-12-23',17.75,'library',{}); date(YT); at(byM[M[0]][0],17.75,{rain:true}); await run('ev_yt_thu_seat'); check('5. 第一次就下雨：先用「下雨了」那一組（1）',H.G.flags.YT_SEAT4_CUR===1,H.G.flags.YT_SEAT4_CUR); }
    { fresh('2027-12-23',17.75,'library',{}); date(YT); at(byM[M[0]][0],17.75); CRACKTALK.pr(H.G,YT).plan={att:[{m:'zone',zone:'library',day:H.G.day}],i:0}; check('5. 那天是語彤的裂縫談話（人到三樓就演）：不出',!EVENTS.check(SE)); }
    { const lib=STORY_EVENTS.findIndex(e=>e.id==='ev_library_outlet'), me=STORY_EVENTS.indexOf(SE); check('5. 坐下的事件排在隨機的「插座」（ev_library_outlet，50%）前面：劇情先演',lib<0||me<lib,J([me,lib])); }
  });
  H.done();
})();
