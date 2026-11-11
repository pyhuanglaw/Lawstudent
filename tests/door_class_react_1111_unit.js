// 門口上課（2D）有名字同學的反應句（CC 11-11 17:11 回報；LAWWW 判：規則漏了門口上課）——不需要瀏覽器（D131）。
// 使用者 2026-10-15「以安不在教室卻回答老師」：同學要真的在教室才有反應句（classes3d.js reactOK 的 inScene＝3D 場景裡有那個人）。
// 門口上課（S.attend 的 o.door；萬才館研討室 A、共同教學館 102…進不去的房間）沒有 3D 同學 → 原本有名字的同學全部被濾掉。
// 修法：門口上課改看作息（STORY.schedEnt：那個時間的作息是這一堂＝在教室），和 3D 教室生出同學同一套；不在的照舊不說。
// 檢查：
//   1. 日文（上）第 3 週（共同教學館 102，門口上課）：作息在 102 上課的宇恆／采蓁其中一句會播（兩句反應播一句）
//   2. 同一堂、把他們的作息拿掉（schedEnt 回 null）：有名字的反應句都不播（「以安不在教室卻回答」的規則照舊）
//   3. 3D 教室（不是門口）：照舊看 inScene（EVENTS.npcOf）——沒有生出來的人不說
// 修改前（1ce2a18b0）：第 1 項 FAIL。用法：node tests/door_class_react_1111_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const TD=(t,w,wd)=>STORY.termDayIn(t,w,wd);
const setDay=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; const w=CALENDAR.dateOf(d).wd; G.weekday=w===7?0:w; };
const fresh=(d,h,zone,flags)=>{ const G=H.fresh('2026-01-01',h,zone||'campus',flags||{}); setDay(d,h); G.outings=[]; EVENTS.zoneChanged(); return G; };
const said=()=>H.said.map(s=>s.t);
const A=['コンピューター。這個我會。','我的名字用片假名寫，好像變成別人。'];
const hit=()=>said().filter(t=>A.some(a=>t.indexOf(a)>=0));
(async()=>{
  /* 3D 場景存在（GAME.E.npcs）＝inScene 會真的看 EVENTS.npcOf；pg_harness 沒有 GAME：這裡給一個（教室裡沒有生出任何人）*/
  global.GAME={E:{npcs:[]},G:null};
  const run=async(o,sched)=>{ const G=fresh(TD('Y2S1',3,1),13.5,'gongtong',{JP_MET:true}); GAME.G=G; for(const id of ['jp_caizhen','jp_liheng','jp_yuheng']) H.FAMILIAR(id);
    const S0=STORY.schedEnt; if(sched===false) STORY.schedEnt=()=>null;
    try{ const it=CLS.dayItems(G,G.day).find(x=>x.c.id==='japanese_1'); if(!it) return null; H.said=[]; H.picks=[0,0,0,0]; await CLS.attend(GM,it,o); return it; }
    finally{ STORY.schedEnt=S0; } };
  { const it=await run({door:true});
    check('1. 門口上課（日文上第 3 週、共同教學館 102）：作息在這間上課的同學，反應句播得出來（兩句播一句）',!!it&&hit().length===1,J({it:!!it,said:said()})); }
  { await run({door:true},false);
    check('2. 同一堂、作息不在這間（schedEnt 沒有）：有名字的反應句不播（使用者 10-15 規則照舊）',hit().length===0,J(said())); }
  { await run({inScene:true});
    check('3. 不是門口（3D 教室）：照舊看 inScene——教室裡沒有生出他們＝不播',hit().length===0,J(said())); }
  delete global.GAME;
  H.done();
})().catch(e=>{ console.log('FAIL 例外：'+(e&&e.stack||e)); process.exit(1); });
