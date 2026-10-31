// I10 抓包 CG「門鈴」（I10-CG-DOORBELL-1027；使用者 2026-10-30 選 A：AA_476 B-1；條件 AA_126 9-4；BB_125 第 6 節）——不需要瀏覽器。src/multirel3d.js、src/data/multirel_lines.js、src/data/characters.js
//   1 提示：那一週的週一和芷若說話多一句（三句輪流、同一學期不重複）；沒遇到＝週二 22:10 訊息
//   2 門鈴：週三 21:40 以後、芷若在上班、祐廷坐吧檯高腳椅、那一週提示過、子晴還沒進店 → 場面逐字＋CG cg_doorbell 在子晴推門那一刻；兩人都知道
//   3 不演：沒提示、21:40 以前、沒坐吧檯、子晴已經在店裡、考試週、第 5 週以前、子晴已經知道芷若、OPEN_OK
//   4 之後：不再有《星期五下午》；隔天 19:30《你出來一下》→ 兩段同時結束（BB_194 §22）；那一晚子晴不再出現（reachable）
//   5 子晴週三的作息（BB_125 6-1）：吉他社 19～21 → 走到溫州街 → 21:40 到兩點半
// 修改前（開發分支 43e5f1b88）：沒有 MREL.bellDue、ZZ_BELL——FAIL。用法：node tests/i10_doorbell_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
global.ZRUK={W_FROM:'2028-09-01',playW:async()=>'orig'};
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(MREL|MULTIREL_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ load('src/data/multirel_lines.js'); load('src/multirel3d.js'); }catch(e){ ok=false; err=String(e&&e.stack||e); }
const X=()=>typeof MREL!=='undefined'?MREL:null;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const ZR='heroine_02', ZQ='heroine_04';
const setD=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; };
const T=()=>H.said.map(s=>s.t);
const seq=arr=>{ const t=T(); let i=0; for(const a of arr){ const k=t.indexOf(a,i); if(k<0) return false; i=k+1; } return true; };
const clr=()=>{ H.said=[]; H.opts=[]; H.cgs=[]; };
const msgs=th=>(H.G.msgs||[]).filter(m=>!th||m.th===th).map(m=>m.text);
const play=async a=>{ if(a) await X().play(GM,a); return a; };
/* 第 n 週的星期 w（1＝一、3＝三）：學期 tid */
const dayOf=(tid,week,wd)=>{ for(let d=STORY.dayOfKey('2025-08-01');d<STORY.dayOfKey('2030-01-01');d++){ const t=CALENDAR.termOf(d); if(t&&t.id===tid&&t.week===week&&CALENDAR.dateOf(d).wd%7===wd) return d; } return null; };
const both=(key)=>{ H.fresh(key,12,'campus',{}); X()._gm=GM; H.CLOSE(ZQ); H.CLOSE(ZR); ROM.start(H.G,ZQ); H.G.day+=3; ROM.start(H.G,ZR); };
const atBar=()=>{ H.G.zone='cafe'; GM.npc={[ZR]:{staff:'cafe',leaving:false}}; H.E.player.pose='sit'; H.E.player.seat={x:-2.9,z:-3.3,bar:true}; };
const H1=['週三晚上子晴會來等我下班。她練完吉他，會把剩下的蛋糕吃完。','這週三我會晚一點走。子晴要來，我們去公館。','週三打烊前店裡會很吵。子晴一來就開始講她的關卡。'];

(async()=>{
check('0. 兩個檔都載得到；有 ZZ_BELL、bellDue',ok&&!!X()&&!!X().bellDue&&!!(MULTIREL_LINES.ZZ_BELL),err);
if(!X()||!X().bellDue){ H.done(); return; }
const W5=dayOf('Y2S1',5,3), W6=dayOf('Y2S1',6,3), W3=dayOf('Y2S1',3,3), W8=dayOf('Y2S1',8,3);

await sec(5,async()=>{
  H.fresh('2026-10-01',12,'campus',{}); const c=CHARACTERS[ZQ], at=(d,h)=>STORY.schedEnt(c,{day:d,hour:h,weekday:CALENDAR.dateOf(d).wd%7,flags:H.G.flags,noInvite:true})||{};
  check('5. 子晴週三（第 5 週）20:30＝吉他社（萬才館），21:20＝走到溫州街，21:45＝兩點半（BB_125 6-1）',at(W5,20.5).act==='club'&&at(W5,21.33).zone==='wenzhou'&&at(W5,21.75).zone==='cafe',J([at(W5,20.5),at(W5,21.33),at(W5,21.75)].map(e=>e.zone+'/'+e.act)));
  check('5. 22:05 還在兩點半（22:10 才走）、22:15 照舊在公館',at(W5,22.08).zone==='cafe'&&at(W5,22.25).zone==='gongguan');
  check('5. 週一照舊（吉他社練完直接回去，不來）；第 3 週週三吉他社還沒開始＝不來等',at(W5-2,21.75).zone!=='cafe'&&at(W3,21.75).zone!=='cafe',J([at(W5-2,21.75).zone,at(W3,21.75).zone]));
});

await sec(1,async()=>{
  both('2026-09-10'); setD(W5-2,16);
  check('1. 那一週是門鈴的晚上（第 5 週週三：芷若上班、子晴吉他社）；第 3 週、考試週不是',X().bellNightOk(H.G,W5)&&!X().bellNightOk(H.G,W3)&&!X().bellNightOk(H.G,W8));
  clr(); const r=await X().bellHintTalk(GM,null);
  check('1. 週一和芷若說話：多一句「週三晚上子晴會來等我下班。她練完吉他，會把剩下的蛋糕吃完。」',r===true&&J(T())===J([H1[0]]),J(T()));
  clr(); await X().bellHintTalk(GM,null); check('1. 同一週不再說',T().length===0);
  setD(W6-1,22.2); X().phone(H.G,GM); PHONE.tick(H.G);
  check('1. 下一週沒遇到：週二 22:10 芷若傳第二句（不重複第一句）',msgs('p:'+ZR).includes(H1[1])&&!msgs('p:'+ZR).includes(H1[0]),J(msgs('p:'+ZR)));
  setD(W6-1,21.9); const n0=msgs('p:'+ZR).length; X().phone(H.G,GM); check('1. 22:10 以前不傳',msgs('p:'+ZR).length===n0);
});

await sec(3,async()=>{
  both('2026-09-10'); setD(W5,21.8); atBar();
  check('3. 那一週沒提示過＝不演（玩家要先知道）',!X().bellDue(H.G,GM));
  setD(W5-1,15); await X().bellHintTalk(GM,null); setD(W5,21.6); atBar();
  check('3. 21:40 以前不演',!X().bellDue(H.G,GM));
  H.G.hour=21.8; H.E.player.seat={x:0,z:0,bar:false}; check('3. 坐一般的位子（不是吧檯）不演',!X().bellDue(H.G,GM));
  atBar(); GM.npc[ZQ]={}; check('3. 子晴已經坐在店裡（她先到了）不演',!X().bellDue(H.G,GM));
  atBar(); GM.npc={}; check('3. 芷若不在吧檯上班不演',!X().bellDue(H.G,GM));
  atBar(); ROM.learn(H.G,ZQ,ZR,'test'); check('3. 子晴已經知道芷若不演',!X().bellDue(H.G,GM));
  both('2026-09-10'); H.G.flags.OPEN_OK={[ZQ]:{[ZR]:true}}; setD(W5-1,15); await X().bellHintTalk(GM,null); setD(W5,21.8); atBar();
  check('3. 有人曾同意（OPEN_OK）不演、也不提示',!X().bellDue(H.G,GM)&&!(X().rec(H.G).zz.bellHint||{})[W5]);
});

await sec(2,async()=>{
  both('2026-09-10'); setD(W5-1,15); await X().bellHintTalk(GM,null); setD(W5,21.75); atBar();
  check('2. 週三 21:45 坐吧檯、芷若上班、提示過、子晴還沒進店：要演；那一刻子晴不會先生出來（reachable）',X().bellDue(H.G,GM)&&STORY.reachable(ZQ,H.G)===false);
  const d=X().dueAuto(H.G); check('2. dueAuto＝門鈴（不是《星期五下午》）',!!d&&d.k==='zz_bell',J(d&&d.k));
  clr(); await play(d);
  check('2. 場面逐字（BB_125 第 6 節）：打烊前的 Café……「芷若，我來——」……「……我走錯時間了。」（她把門輕輕關上。鈴又響了一次。）',
    seq(['（打烊前的 Café。店裡只剩你一個客人。）','（芷若在你的杯子上寫了一行字，推過來。她的手沒有馬上放開。）','（門口的鈴響了。）','芷若，我來——','（她停在門口。）','……我走錯時間了。','（她把門輕輕關上。鈴又響了一次。）']),J(T()));
  check('2. CG 門鈴（cg_doorbell）在子晴推門那一刻（鈴響之後、「芷若，我來——」之前）',J(H.cgs)===J(['cg_doorbell']));
  check('2. 兩個人都知道了；那一晚子晴不再出現（reachable）、隔天照常',ROM.knowsOf(H.G,ZQ,ZR)&&ROM.knowsOf(H.G,ZR,ZQ)&&STORY.reachable(ZQ,H.G)===false&&(()=>{ const d0=H.G.day; H.G.day++; const r=STORY.reachable(ZQ,H.G); H.G.day=d0; return r!==false; })());
  setD(W5+2,16.1); check('2. 之後不再有《星期五下午》',!X().zzDue(H.G));
  H.said=[]; setD(W5+1,19.6); H.G.zone='dorm'; H.E.player.seat=null; H.E.player.pose='idle'; GM.npc={}; const c=X().dueAuto(H.G);
  check('2. 隔天 19:30《你出來一下》',!!c&&c.k==='zz_callout',J(c&&c.k));
  H.picks=['對不起。我應該先講']; await play(c);
  check('2. 兩段同時結束（BB_194 §22）：「我們兩個都決定分手。」、dating 清掉、ZQ_ZR_ENDED_DAY',seq(['你現在在哪？','我們兩個都決定分手。','芷若，走了。'])&&!H.G.flags.dating_heroine_04&&!H.G.flags.dating_heroine_02&&H.G.flags.ZQ_ZR_ENDED_DAY===W5+1,J(T().slice(-3)));
  check('2. 同一學期最多一次（記在 bellT）',X().rec(H.G).zz.bellT&&X().rec(H.G).zz.bellT.Y2S1===W5);
});

await sec(4,async()=>{
  both('2026-09-10'); ROM.learn(H.G,ZR,ZQ,'early'); setD(W5-1,15); await X().bellHintTalk(GM,null); setD(W5,21.8); atBar(); await play(X().dueAuto(H.G));
  H.said=[]; setD(W5+1,19.6); H.G.zone='dorm'; H.E.player.seat=null; GM.npc={}; await play(X().dueAuto(H.G));
  check('4. 芷若早就知道子晴＝拆成各自講：子晴先「我跟芷若講好了。我不要了。」',H.has('我跟芷若講好了。我不要了。')&&!H.G.flags.dating_heroine_04&&H.G.flags.dating_heroine_02===true);
  H.said=[]; setD(W5+2,21.6); const d=X().dueAuto(H.G); check('4. 再隔天 Café 打烊後芷若',!!d&&d.k==='zz_split_zr'); await play(d);
  check('4. 兩段都結束',!H.G.flags.dating_heroine_02);
  both('2026-09-10'); setD(W5-1,15); for(let i=0;i<3;i++){ X().rec(H.G).zz.bellUsed={Y2S1:[0,1,2]}; } const r=await X().bellHintTalk(GM,null);
  check('4. 三句都用過的學期＝不再提示（也就不會有門鈴）',r===false);
  check('4. CG 不被「她知道別人」擋（cg_doorbell 例外）',X().cgBlocked(H.G,'cg_doorbell')===false);
});
H.done();
})();
