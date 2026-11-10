// 選項的效果、每次約會都有選項（DLG-FX-MECH-1110；使用者 X324，AA_746 第 2 節）——不需要瀏覽器（D131）。
// 使用者 11-10 20:0x（對 AA）：「每次約會都要有選擇性的對話選項，依據選項內容增加友情或者愛情」
// 稽核（AA_746、audit_1110/）：校外約會 1,765 個選項沒有任何效果、只在第一次到那個互動點出現。AA 之後照這裡的格式改稿；這支測試用假資料確認機制（資料沒有新欄位＝和原本一樣）。
//   1. SOCIAL.applyFx(G,id,{fr,love})：fr＝熟悉、信任、自在各 +n；love＝她的戀愛（可以攻略的對象）；0＝不動、負的照扣；MOVIES.fx 叫同一支
//   2. 校外約會（src/date3d.js）：選項 {t, reply|re, fx}——fx 照算、re（字串／陣列／括號＝旁白）當她的回答；沒有 fx 的選項＝只有原本的加法
//   3. 校外約會：互動點的 opts＝{first, again, dating}——第二次以後到同一個互動點出 again（好幾組＝輪流）、交往中出 dating；抵達、收尾也可以有；
//      沒有 opts＝第二次以後沒有選項（原本的樣子）；輪到第幾組記在存檔（dateMemory…optN），舊存檔沒有＝第一組
// 修改前（35e560bbd）：第 1 節沒有 SOCIAL.applyFx；第 2 節 fx 不算、re 不說；第 3 節第二次以後沒有選項——FAIL。用法：node tests/dlg_fx_mech_1110_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const clone=x=>JSON.parse(JSON.stringify(x));
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
      check('3. opts.dating：交往中出這一組（她的戀愛 +3）',CH.some(c=>c.includes('（假）交往中丁'))&&idx('丁的回答。')>=0&&ADJ.some(([w,d])=>w===who&&d.npcRom===3),J(CH));
      /* 舊存檔：dateMemory 沒有 optN、或壞掉 */
      const old=clone(saved); delete old.dateMemory[who][loc].optN; H.G=old; SOCIAL.bind(old); INV.rec(old); await go([pn(pid)]); const o1=CH.some(c=>c.includes('（假）再來一次甲'));
      old.dateMemory[who][loc].optN=[1,2]; next(); await go([pn(pid)]); const o2=CH.some(c=>c.includes('（假）再來一次甲'))||CH.some(c=>c.includes('（假）第二組丙'));
      check('3. 舊存檔（沒有 optN、或格式壞掉）：從第一組開始、照常演；存檔 JSON 來回不壞',o1&&o2&&!!JSON.parse(J(old)).dateMemory[who][loc].optN,J(old.dateMemory[who][loc].optN));
      /* 壞資料 */
      LN.hotspots[pid].opts={again:[[{t:''},{nope:1}],'x',null],dating:7}; H.G=start(); await go([pn(pid),c0.t]); next(); let e=null; try{ await go([pn(pid)]); }catch(x){ e=String(x); }
      check('3. 壞掉的 opts（沒有字的選項、不是物件）：當作沒有、不丟例外、不出空的選項',e===null&&CH.every(c=>c.every(t=>typeof t==='string'&&t.trim())),J([e,CH]));
    } finally { DATE_LINES.loc[loc].lines[who]=JSON.parse(keep); WANT=[]; } });
  if(require.main===module) H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
