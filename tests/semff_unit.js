// 學期中的快轉（FF-SEMESTER-1023；使用者 10-23「能不能有一個跳過整個禮拜的選項 自動會去上課之類的? 劇情強制撥放」「或者跳到下一個事件的選項」）——不需要瀏覽器。
//   0  src/semff3d.js 載得到、index.html 接在 classes3d.js 後面；宿舍的床在學期中多「快轉」（寒暑假照舊是 home3d 的快轉）；寒暑假、經濟系、國外不出
//   1  沒有劇情的課自動上（done、attend、prep 和真的上完一樣，不演課堂）；快轉開始以前的課不補
//   2  停點：有劇情的課（課前事件、考試、CLS.IN_CLASS 的 due：債各第 6 週、刑訴第 7 週、民總第 4 週 L1）停在課前 20 分鐘或鬧鐘；答應的當面約；要回的訊息（打開手機、關掉接著跳）；
//      新成立的一定要演的事件；睡著以後才演的事件照睡覺那樣演完接著跳；課前 20 分鐘以內有劇情的課＝不跳
//   3  上限：過一週＝7 天後 07:30；到下一個有事的時候最多 21 天、不超過學期最後一天 20:00
// 修改前（開發分支 fdc39c9fc）：沒有 src/semff3d.js、床沒有學期中的快轉、CLS.IN_CLASS 沒有 due——全部 FAIL。用法：node tests/semff_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(LOANS|SEMFF)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/loans3d.js','src/y2b3d.js','src/r2y3a3d.js','src/r2y4b3d.js']) load(f);
let ok=true, err=''; try{ load('src/semff3d.js'); }catch(e){ ok=false; err=String(e); }
const X=()=>typeof SEMFF!=='undefined'?SEMFF:null;
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h, now=()=>Tm(H.G.day,H.G.hour);
const lbl=t=>{ const d=Math.floor(t/24+1e-9), x=CALENDAR.dateOf(d), m=Math.round((t-d*24)*60); return x.key.slice(5)+' '+String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const fresh=(key,h,flags)=>H.fresh(key,h,'dorm',Object.assign({EXCHANGE_ROUTE:'TW'},flags||{}));
let phoneCalls=[], onPhone=null, toasts=[];
GM.phoneThread=async(th,o)=>{ phoneCalls.push({skip:!!(o&&o.skip),at:lbl(now()),pend:PHONE.pending(H.G).map(m=>m.ask&&m.ask.id)}); if(onPhone) await onPhone(); };
GM.toast=t=>{ toasts.push(t); };
const items=(key)=>CLS.dayItems(H.G,D(key));
const evPush=e=>{ STORY_EVENTS.push(e); return ()=>{ const i=STORY_EVENTS.indexOf(e); if(i>=0) STORY_EVENTS.splice(i,1); }; };
const reset=()=>{ phoneCalls=[]; onPhone=null; toasts=[]; };

(async()=>{
/* ---- 0 ---- */
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. src/semff3d.js 載得到、index.html 接在 classes3d.js 後面',ok&&!!X()&&/classes3d\.js\?v=[^"]+"><\/script>\n<script src="src\/semff3d\.js\?v=[^"]+"><\/script>/.test(html),err);
  if(!X()) return;
  fresh('2025-10-05',22); const o=STORY.bedOptions(H.G), ff=o.find(q=>q.t==='快轉');
  check('0. 大一上第 5 週（10/5 22:00）宿舍的床：有「快轉」（kind semff）',!!ff&&ff.kind==='semff',J(o.map(q=>q.t+'/'+q.kind)));
  const O=X().opts(H.G);
  check('0. 選項：到下一個有事的時候／過一週／不用了',!!O&&O.map(q=>q.t).join('|')==='到下一個有事的時候|過一週|不用了',J(O&&O.map(q=>q.t)));
  fresh('2026-01-20',22); const o2=STORY.bedOptions(H.G);
  check('0. 寒假（1/20）：床的快轉是 home3d 的（kind ff），SEMFF 不出',!X().on(H.G)&&o2.some(q=>q.kind==='ff')&&!o2.some(q=>q.kind==='semff'),J(o2.map(q=>q.kind)));
  fresh('2025-10-05',22); H.G.stage='econ';
  check('0. 經濟系（stage econ）：不出',!X().on(H.G));
  fresh('2025-10-05',22); const dep=STORY.abroad; STORY.abroad=()=>true; const ab=X().on(H.G); STORY.abroad=dep;
  check('0. 交換人在國外：不出',!ab);
  const src=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8');
  check('0. story3d.js bedScene 接 kind semff → SEMFF.menu；STORY.nightEvent 有匯出',/o\.kind==='semff'\)\{ if\(typeof SEMFF!=='undefined'\) await SEMFF\.menu\(GM\)/.test(src)&&typeof STORY.nightEvent==='function');
});
if(!X()){ H.done(); return; }

/* ---- 1 自動上課 ---- */
await sec(1,async()=>{ fresh('2025-09-28',22); reset(); const R=CLS.rec(H.G), before=items('2025-09-26').filter(it=>!R.done[it.key]).length;
  const r=await X().jump(GM,now()+7*24); const wk=[]; for(let d=D('2025-09-29');d<=D('2025-10-05');d++) wk.push(...CLS.dayItems(H.G,d));
  check('1. 9/28 22:00 跳一週：途中停下來（訊息／有事），停之前經過的課自動上了 '+r.auto+' 堂',r.auto>=4&&['msg','stop','event','out'].includes(r.why),J({why:r.why,stop:r.stop,at:lbl(now())}));
  const plain=wk.filter(it=>Tm(it.day,it.t1)<=now());
  check('1. 9/29 以後、停點以前下課的課都記了 done、attend、prep（和真的上完一樣）',plain.length===r.auto&&plain.every(it=>R.done[it.key]===1)&&plain.every(it=>(R.attend[it.c.id]|0)>=1&&(it.c.kind==='service'||(R.prep[it.c.id]|0)>=1)),J(plain.map(it=>it.key+':'+R.done[it.key])));
  check('1. 自動上的課沒有演課堂（沒有台詞、選項）',H.said.length===0&&H.opts.length===0,J(H.said.slice(0,3)));
  check('1. 快轉開始以前的課（9/26）不補',items('2025-09-26').filter(it=>!R.done[it.key]).length===before);
  check('1. 停點以後的課沒有記',items('2025-10-03').every(it=>!R.done[it.key])); });

/* ---- 2 停點 ---- */
await sec(2,async()=>{
  // 2a 有課前事件的課（大一英文 10/9 的 beforeClass）：停在課前 20 分鐘，不自動上
  fresh('2025-10-05',22); reset(); { const r=await X().jump(GM,now()+7*24); const en=items('2025-10-09').find(it=>it.c.id==='english_y1');
    check('2a. 10/5 跳一週：停在 10/9 大一英文前 20 分鐘（有課前事件），那堂沒記',r.why==='stop'&&!!en&&Math.abs(now()-(Tm(en.day,en.t0)-1/3))<1e-6&&!CLS.rec(H.G).done[en.key]&&/大一英文/.test(r.stop.why),J({stop:r.stop,at:lbl(now())}));
    check('2a. 字卡：日期＋停下來的原因',/^10\/9（四）08:50$/.test((H.cards.slice(-1)[0]||[])[0])&&/大一英文/.test((H.cards.slice(-1)[0]||[])[1]),J(H.cards.slice(-1))); }
  // 2b 考試（期中考第 8 週）：停在考前 1 小時（床的鬧鐘那個時間）
  fresh('2025-10-19',22); reset(); { const r=await X().jump(GM,now()+7*24); const ex=items('2025-10-20').find(it=>it.exam);
    check('2b. 10/19 跳一週：停在 10/20 第一科期中考前 1 小時（鬧鐘），考試沒有被自動上',r.why==='stop'&&!!ex&&Math.abs(now()-(Tm(ex.day,ex.t0)-1))<1e-6&&!CLS.rec(H.G).done[ex.key],J({stop:r.stop,at:lbl(now())}));
    const exs=[]; for(let d=D('2025-10-20');d<=D('2025-10-31');d++) for(const it of CLS.dayItems(H.G,d)) if(it.exam) exs.push(it);
    check('2b. 期中考每一科都算有劇情（classEventful＝exam）',exs.length>=3&&exs.every(it=>X().classEventful(H.G,it)==='exam'),exs.length); }
  // 2c CLS.IN_CLASS 的 due：債各第 6 週（語彤 1B-02）、刑訴第 7 週、民總第 4 週 L1
  fresh('2027-03-28',22); reset(); { const r=await X().jump(GM,now()+7*24); const it=items('2027-03-29').find(q=>q.c.id==='oblig_spec');
    check('2c. 大二下第 6 週債各（3/29）：IN_CLASS 的劇情段 → 停在課前 20 分鐘',!!it&&r.why==='stop'&&r.stop.x.kind==='inclass'&&Math.abs(now()-(Tm(it.day,it.t0)-1/3))<1e-6,J({stop:r.stop,at:lbl(now())}));
    const w5=items('2027-03-22').find(q=>q.c.id==='oblig_spec');
    check('2c. 第 5 週的債各沒有劇情段（照常自動上）',!!w5&&!X().classEventful(H.G,w5),w5&&w5.key); }
  fresh('2027-10-17',22); reset(); { const cr=items('2027-10-19').find(q=>q.c.id==='crimpro'), cr6=items('2027-10-12').find(q=>q.c.id==='crimpro');
    check('2c. 大三上刑訴第 7 週（作業）有劇情段、第 6 週沒有',!!cr&&X().classEventful(H.G,cr)==='inclass'&&!!cr6&&!X().classEventful(H.G,cr6),J([cr&&cr.key,cr6&&cr6.key]));
    H.G.flags.CRIMPRO_W7=D('2027-10-19'); check('2c. 刑訴第 7 週講過了（CRIMPRO_W7）＝沒有劇情段',!X().classEventful(H.G,cr)); }
  fresh('2025-09-21',22); reset(); { const wk=[]; for(let d=D('2025-09-22');d<=D('2025-09-28');d++) wk.push(...CLS.dayItems(H.G,d)); const cg=wk.find(q=>q.c.id==='civ_general');
    H.G.flags.noodleTableDay=D('2025-09-11');   /* 舊局第 4 週週四民總下課是阿哲約吃麵（AA_542 1-1，classAlso）：這一項只看 L1，先當作群組早就有了（不約）*/
    check('2c. 大一上民總第 4 週（L1 借書那一句）有劇情段；知道 L1 以後沒有',!!cg&&X().classEventful(H.G,cg)==='inclass'&&(LOANS.know(H.G,'L1'),!X().classEventful(H.G,cg)),cg&&cg.key); }
  // 2d 答應的當面約：約前 30 分鐘（床的鬧鐘）
  fresh('2025-10-12',22); reset(); H.FAMILIAR('zhe'); { const iv=INV.make?null:null; const d=D('2025-10-14'); H.G.invites.push({id:'iv_t1',who:'zhe',place:'noodle',zone:'noodle',day:d,h:19,state:'accepted',accepted:true,by:'player',label:'和阿哲約在麵店'});
    check('2d. 那一天的停點有約前 30 分鐘（10/14 18:30）',X().dayStops(H.G,d).some(q=>Math.abs(q.t-Tm(d,18.5))<1e-6),J(X().dayStops(H.G,d).map(q=>lbl(q.t)+' '+q.why)));
    H.G.day=d; H.G.weekday=CALENDAR.dateOf(d).wd%7; H.G.hour=17; const r=await X().jump(GM,Tm(d,22));
    check('2d. 10/14 17:00 跳到 22:00：停在 18:30',r.why==='stop'&&Math.abs(now()-Tm(d,18.5))<1e-6,J({why:r.why,stop:r.stop,at:lbl(now())})); }
  // 2e 要回的訊息：停在那一刻打開手機；關掉以後接著跳到原本選的時間
  fresh('2025-11-02',22); reset(); { const d=D('2025-11-03'); PHONE.at(H.G,d,20,[{th:'p:zhe',from:'zhe',text:'測試：要回的',ask:{id:'t_semff_ask',opts:[{t:'好'}]}}],'t_semff');
    H.picks=['過一週']; const r=await X().menu(GM); const c=phoneCalls[0];
    check('2e. 11/2 22:00「過一週」：11/3 20:00 停下來打開手機（跳過），看得到那則',!!c&&c.skip&&/^11-03 20:/.test(c.at)&&c.pend.includes('t_semff_ask'),J(phoneCalls));
    check('2e. 關掉以後接著跳（沒有停在 11/3 20:00）',now()>Tm(d,20.5),J({why:r&&r.why,stop:r&&r.stop,at:lbl(now())})); }
  // 2f 新成立的一定要演的事件（trigger auto、location any）：停在成立那一刻；跳之前就成立的不停
  fresh('2025-11-02',22); reset(); { const d=D('2025-11-04'); const un=evPush({id:'ev_t_semff_auto',title:'測試',participants:[],location:'any',trigger:'auto',once:true,prereq:{custom:G=>G.day>d||(G.day===d&&G.hour>=15)},dialogue:[{text:'測試'}]});
    const r=await X().jump(GM,now()+7*24); un();
    check('2f. 新成立的事件（11/4 15:00）：停在那裡（why event），或之前有別的停點',(r.why==='event'&&Math.abs(now()-Tm(d,15))<1e-6)||(r.why!=='end'&&now()<Tm(d,15)),J({why:r.why,stop:r.stop,at:lbl(now())})); }
  fresh('2025-11-02',22); reset(); { const un=evPush({id:'ev_t_semff_old',title:'測試',participants:[],location:'any',trigger:'auto',once:true,prereq:{custom:()=>true},dialogue:[{text:'測試'}]});
    const w=X().snap(H.G), nw=X().newThing(H.G,w); un();
    check('2f. 跳之前就成立的事件不算新的（不會一跳就停）',nw===null,nw); }
  // 2g 睡著以後才演的事件：跳過那一晚時照睡覺那樣演完，接著跳
  fresh('2025-11-09',12); reset(); { const d=D('2025-11-10'); const un=evPush({id:'ev_t_semff_sleep',title:'測試',participants:[],location:'any',trigger:'sleep',once:true,prereq:{custom:G=>G.day===d},dialogue:[{text:'測試：睡著以後'}]});
    const r=await X().jump(GM,Tm(d+1,12)); un();
    const played=H.said.some(s=>s.t==='測試：睡著以後');
    check('2g. 11/10 晚上的睡覺事件：跳的途中演了（或之前有別的停點沒跳到那晚）',played?(!!H.G.events.done.ev_t_semff_sleep):(r.why!=='end'&&now()<Tm(d,23.5)),J({played,why:r.why,stop:r.stop,at:lbl(now())}));
    if(played) check('2g. 演完接著跳（沒有停在那一晚）',now()>Tm(d,27)-1e-6,lbl(now())); }
  // 2h 課前 20 分鐘以內、那堂有劇情：不跳
  fresh('2025-10-09',8+55/60); reset(); { const t0=now(); const r=await X().jump(GM,now()+24);
    check('2h. 10/9 08:55（09:10 英文課前 20 分鐘以內，有課前事件）：不跳（why now），時間沒動',r.why==='now'&&now()===t0&&/大一英文/.test(r.stop.why),J({why:r.why,at:lbl(now())})); }
  // 2i 選單：「不用了」什麼都不做
  fresh('2025-10-05',22); reset(); { H.picks=['不用了']; const t0=now(); await X().menu(GM); check('2i. 「不用了」：時間沒動',now()===t0); }
});

/* ---- 3 上限 ---- */
await sec(3,()=>{ fresh('2025-12-17',22); const O=X().opts(H.G), r=CALENDAR.termDays('Y1S1');
  check('3. 學期最後一週（12/17）：兩個選項都不超過學期最後一天（12/21）20:00',O[0].to===Tm(r.to,20)&&O[1].to===Tm(r.to,20),J([lbl(O[0].to),lbl(O[1].to)]));
  fresh('2025-10-05',22); const O2=X().opts(H.G);
  check('3. 10/5：過一週＝10/12 07:30；到下一個有事的時候最多 21 天（10/26 08:00）',O2[1].to===Tm(D('2025-10-12'),7.5)&&O2[0].to===Tm(D('2025-10-26'),8),J([lbl(O2[0].to),lbl(O2[1].to)]));
  fresh('2025-12-21',20.25); check('3. 學期最後一天 20:00 以後：不出（換寒假的快轉）',!X().on(H.G)); });

H.done();
})();
