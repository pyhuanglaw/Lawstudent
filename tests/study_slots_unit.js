// 一起念書第 6 次解鎖的「她那一格」（AA_722 9bb7e3cc9；INVITE-PLACES-1107、STUDY-DATE-PROGRESS-1107）——不需要瀏覽器（D131）。
// AA_706 第 1 節第 3 點：「第 6 次還會解鎖她下一個想帶你去的地方（邀約選單多一個她那一格）」；原本只記旗標、選單沒有那一格。
// 檢查：1 六格都在、只有她、解鎖以前不列；2 以安的小路：只在平日（週二公休）18、19 點、演第一次那一場、記 AN_SHOP1_DONE、扣 200、之後不再列；她故事線第 7 拍照 AN_SHOP1_DONE
//       3 芷若週六早場：只有週六 09:50、答應句照 AA、扣票 150、第一次 first、之後 rot 輪流；4 語彤一盞下班後要 YT_MET_JOB
//       5 子晴滷味（沒有場景）：約好＝排進行程（不在店裡等）、那一場是 2D、第一次她請、第二次 120、演完到公館商圈
//       6 沛珊課輔班到 2026-12-17、第三組 rot 要 PS_HIDDEN_TIRED；7 可昕木柵：週末 13:00、演完回家／宿舍
// 修改前全部 FAIL。用法：node tests/study_slots_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
loadG('src/nanyang_sys3d.js',['NYS']); loadG('src/data/heroine_arcs.js',['HEROINE_ARCS']); const ok0=loadG('src/data/study_slots.js',['STUDY_SLOTS'])&&loadG('src/studyslot3d.js',['STUDYSLOT']);
if(!ok0){ check('0. src/data/study_slots.js、src/studyslot3d.js 存在',false); H.done(); return; }
const SL=STUDY_SLOTS.slots, S=id=>SL.find(s=>s.id===id), P=id=>INV.place('slot_'+id);
const WHO={an_shop1:'heroine_01',zr_morning_movie:'heroine_02',yt_after_close:'heroine_03',zq_luwei:'heroine_04',ps_tutor:'classmate_peishan',kx_mzu_lib:'kexin'};
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone); G.invites=[]; G.stats=G.stats||{}; G.visited={}; E.zone={seats:[],spawn:{x:0,z:0,yaw:0},roomAt:()=>null}; E.npcs=[]; E.player.seat=null; E.player.busy=false; INV._now=()=>Date.now()+1e9; GM.money=d=>{ G.money+=d; }; return G; };
const dayOfWd=(G,wd,from)=>{ for(let d=from!=null?from:G.day;d<(from!=null?from:G.day)+7;d++) if(CALENDAR.dateOf(d).wd%7===wd) return d; return null; };
const npc=id=>{ const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const meet=async(G,id,sid,d,h)=>{ G.day=d; G.hour=h-0.1; const iv=INV.accept(G,id,'slot_'+sid,d,h,{by:'player'}); H.said=[]; await INV.meet(GM,iv,npc(id),{}); return iv; };
const txt=t=>/^「[^「」]*」$/.test(t)?t.slice(1,-1):t;
const played=L=>L.every(t=>H.said.some(s=>s.t===txt(t)));
(async()=>{
  { const G=fresh('2025-10-15',10,'campus'); const ids=Object.keys(WHO);
    check('1. 六格都在（slot_<id>）',ids.every(k=>P(k)),J(ids.filter(k=>!P(k))));
    const pre=ids.filter(k=>P(k).show(G,WHO[k]));
    for(const k of ids) G.flags[S(k).flag]=G.day; G.flags.PS_HIDDEN_TIRED=undefined;
    const post=ids.filter(k=>P(k).show(G,WHO[k])), other=ids.filter(k=>P(k).show(G,'heroine_05')||P(k).show(G,null));
    check('1. 解鎖以前不列、解鎖以後只有她看得到',pre.length===0&&post.length===6&&other.length===0,J({pre,post,other})); }
  { const G=fresh('2025-10-15',10,'wenzhou'), id='heroine_01', sl=S('an_shop1'); H.FRIEND(id); G.flags[sl.flag]=G.day;
    const W=STUDYSLOT.when(G,sl), wds=[...new Set(W.map(q=>CALENDAR.dateOf(q.day).wd%7))];
    check('2. 小路：平日 18、19 點，週二不約',W.length>0&&W.every(q=>q.h===18||q.h===19)&&!wds.includes(2)&&!wds.includes(0)&&!wds.includes(6),J(W.map(q=>[CALENDAR.dateOf(q.day).wd%7,q.h])));
    G.money=1000; const d=dayOfWd(G,3,G.day+1); const iv=await meet(G,id,'an_shop1',d,18);
    check('2. 第一次那一場照 AA_722、記 AN_SHOP1_DONE、扣 200',played(sl.first)&&G.flags.AN_SHOP1_DONE===d&&G.money===800&&iv.state==='done',J({said:H.said.map(s=>s.t).slice(0,4),f:G.flags.AN_SHOP1_DONE,m:G.money,st:iv.state}));
    check('2. 一次性：演過就不再列',!P('an_shop1').show(G,id));
    const b7=(HEROINE_ARCS.people.heroine_01.beats||[])[6]; check('2. 以安第 7 拍照 AN_SHOP1_DONE（AA_722）',!!b7&&b7.after==='flag:AN_SHOP1_DONE',J(b7&&b7.after)); }
  { const G=fresh('2025-10-15',10,'xinsheng'), id='heroine_02', sl=S('zr_morning_movie'); H.FRIEND(id); G.flags[sl.flag]=G.day;
    const W=STUDYSLOT.when(G,sl);
    check('3. 早場：只有週六 09:50',W.length>0&&W.every(q=>CALENDAR.dateOf(q.day).wd%7===6&&Math.abs(q.h-(9+50/60))<1e-6),J(W.map(q=>[CALENDAR.dateOf(q.day).wd%7,q.h])));
    const sat=W[0].day, r=INV.personal(G,id,P('zr_morning_movie'),sat,W[0].h,{res:'accept'});
    check('3. 答應句照 AA_722',!!r&&J(r.lines)===J(sl.acc),J(r&&r.lines));
    G.money=1000; await meet(G,id,'zr_morning_movie',sat,W[0].h); const m1=G.money, p1=played(sl.first);
    await meet(G,id,'zr_morning_movie',sat+7,W[0].h); const p2=played(sl.rot[0]); await meet(G,id,'zr_morning_movie',sat+14,W[0].h); const p3=played(sl.rot[1]);
    check('3. 扣票 150；第一次 first、第二次 rot 第一組、第三次第二組',m1===850&&p1&&p2&&p3&&G.money===550,J({m1,p1,p2,p3,m:G.money})); }
  { const G=fresh('2025-10-15',10,'wenzhou'), id='heroine_03', sl=S('yt_after_close'); G.flags[sl.flag]=G.day; delete G.flags.YT_MET_JOB;
    const a=P('yt_after_close').show(G,id); G.flags.YT_MET_JOB=true; const b=P('yt_after_close').show(G,id);
    check('4. 一盞下班後：要在茶屋認識過（YT_MET_JOB）',!a&&b,J([a,b])); }
  { const G=fresh('2025-10-15',15,'gongguan'), id='heroine_04', sl=S('zq_luwei'); H.FRIEND(id); G.flags[sl.flag]=G.day; G.money=1000;
    const iv=INV.accept(G,id,'slot_zq_luwei',G.day,19,{by:'player'}); const L=OUT.rec(G), q=L.find(x=>x.slot==='zq_luwei');
    check('5. 滷味：約好＝排進行程、不在店裡等她',!!q&&q.state==='planned'&&q.ev==='ev_slot_zq_luwei_first'&&!(G.invites||[]).includes(iv)&&!P('zq_luwei').show(G,id),J({q:q&&{ev:q.ev,st:q.state,d:q.day,h:q.h},inv:(G.invites||[]).length}));
    const ev=STORY_EVENTS.find(e=>e.id==='ev_slot_zq_luwei_first'), bgOk=!!ev&&ev.trigger==='outing'&&ev.dialogue[0].bg===sl.bg[1];
    const fin=ev&&ev.dialogue.find(l=>l.call); if(fin) await fin.call(G,GM); const m1=G.money;
    const iv2=INV.accept(G,id,'slot_zq_luwei',G.day+1,19,{by:'player'}); const q2=OUT.rec(G).find(x=>x.slot==='zq_luwei'&&x.day===G.day+1); const ev2=q2&&STORY_EVENTS.find(e=>e.id===q2.ev); const f2=ev2&&ev2.dialogue.find(l=>l.call); if(f2) await f2.call(G,GM);
    check('5. 2D、第一次她請、第二次 120（rot 第一組）',bgOk&&m1===1000&&!!q2&&q2.ev==='ev_slot_zq_luwei_r0'&&G.money===880,J({bgOk,m1,ev2:q2&&q2.ev,m:G.money}));
    check('5. 演完到公館商圈',!!ev&&typeof ev.afterBack==='function'&&J(sl.end)===J({spot:'公館商圈'}),J(sl.end)); }
  { const G=fresh('2025-10-15',10,'wenzhou'), id='classmate_peishan', sl=S('ps_tutor'); G.flags[sl.flag]=G.day;
    const u=STORY.dayOfKey('2026-12-17'); const a=STUDYSLOT.open(G,sl,u), b=STUDYSLOT.open(G,sl,u+1);
    G.flags.STUDYSLOT={ps_tutor:{n:3,last:1}}; const k1=STUDYSLOT.pick(G,sl).k; G.flags.PS_HIDDEN_TIRED=G.day; const k2=STUDYSLOT.pick(G,sl).k;
    check('6. 課輔班到 2026-12-17；第三組要 PS_HIDDEN_TIRED',a&&!b&&k1==='r0'&&k2==='r2',J({a,b,k1,k2})); }
  { const G=fresh('2025-10-15',10,'campus'), sl=S('kx_mzu_lib'); G.flags[sl.flag]=G.day; const W=STUDYSLOT.when(G,sl);
    check('7. 木柵：週末 13:00、演完回家／宿舍',W.length>0&&W.every(q=>[0,6].includes(CALENDAR.dateOf(q.day).wd%7)&&q.h===13)&&!!(sl.end&&sl.end.home),J({W:W.map(q=>[CALENDAR.dateOf(q.day).wd%7,q.h]),end:sl.end})); }
  /* 8 你和別人交往、她知道（AA_722 897ddd17e）：小路、滷味不出現；其他四格照常；以安解鎖以後第一次見面說那兩句、記 AN_SHOP1_DONE＝alone、只說一次；第 7 拍的條件成立 */
  { const G=fresh('2025-10-15',10,'wenzhou'); for(const k of Object.keys(WHO)) G.flags[S(k).flag]=G.day; G.flags.dating_kexin=true; const RR=ROM.relRec(G); for(const id of Object.values(WHO)) (RR[id]||(RR[id]={})).kexin=1;
    const vis=Object.keys(WHO).filter(k=>P(k).show(G,WHO[k]));
    check('8. 交往中、她知道：小路、滷味不出現，其他四格照常',!vis.includes('an_shop1')&&!vis.includes('zq_luwei')&&['zr_morning_movie','yt_after_close','ps_tutor'].every(k=>vis.includes(k)),J(vis));
    H.FRIEND('heroine_01'); H.said=[]; const said=await STUDYSLOT.blockSay(GM,{name:'以安',charId:'heroine_01'},'heroine_01'); const L=S('an_shop1').partnerBlock.say;
    const again=await STUDYSLOT.blockSay(GM,{name:'以安',charId:'heroine_01'},'heroine_01');
    check('8. 以安：見面時說那兩句（照 AA_722）、記 AN_SHOP1_DONE＝alone、只說一次',said&&!again&&L.every(t=>H.said.some(x=>x.t===t))&&G.flags.AN_SHOP1_DONE==='alone',J({said,again,f:G.flags.AN_SHOP1_DONE,h:H.said.map(x=>x.t)}));
    check('8. 第 7 拍等的條件（flag:AN_SHOP1_DONE）成立',typeof ARCS!=='undefined'&&ARCS.cond?!!ARCS.cond(G,'heroine_01','flag:AN_SHOP1_DONE'):!!G.flags.AN_SHOP1_DONE);
    check('8. 掛在約好的見面開場（INV.meetOpen）和當面說話前（STORY.PRE_TALK）',!!INV.meetOpen._slot&&STORY.PRE_TALK.includes(STUDYSLOT.blockSay));
    const G2=fresh('2025-10-15',10,'wenzhou'); G2.flags[S('an_shop1').flag]=G2.day; H.said=[]; const s2=await STUDYSLOT.blockSay(GM,{name:'以安',charId:'heroine_01'},'heroine_01');
    check('8. 沒有在和別人交往：不說、不記',!s2&&G2.flags.AN_SHOP1_DONE==null); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
