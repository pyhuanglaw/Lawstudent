// BB-B：wish82_probe 選的日子在遊戲邏輯裡會不會傳心願訊息（Node，照 tests/date_wish_unit.js 的載法）
const path=require('path'); process.chdir(process.argv[2]); require(path.join(process.argv[2],'tests','alison.js'));
const H=require(path.join(process.argv[2],'tests','pg_harness.js')); const fs=require('fs'), vm=require('vm');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
load('src/data/date_wish.js'); load('src/wish3d.js');
const S5={fam:45,trust:30,comf:30,npcRom:35,rom:10};
const CASES=[['classmate_peishan','2026-11-12',20.8,[],{}],['classmate_peishan','2026-11-19',20.8,[],{}],['classmate_peishan','2026-11-26',20.8,[],{}],['classmate_peishan','2026-12-03',20.8,[],{}],['classmate_peishan','2026-10-29',20.8,[],{}]];
for(const [id,key,h0,evs,fl] of CASES){ const G=H.fresh(key,h0,'dorm',Object.assign({EXCHANGE_ROUTE:'TW',EXCH_RULE:1},fl)); G.outings=[]; G.contacts=G.contacts||{}; G.money=30000;
  const r=SOCIAL.rel(id); Object.assign(r,S5); SOCIAL.remember(id,'FIRST_MET',''); G.contacts[id]=G.day-30; for(const e of evs) G.events.done[e]=true; if(STORY._bindGM) STORY._bindGM(H.GM);
  let got=null, why=[]; for(let h=h0;h<24;h+=0.25){ G.hour=h; try{ WISH.phone(G); PHONE.tick(G); }catch(e){ why.push(e.message); break; } const A=DATE.log(G,id).wishAsk; if(A&&A.state==='sent'){ got={h, date:CALENDAR.dateOf(A.date).key, depart:A.depart}; break; } }
  const I=WISH.ev(id).herInvite; const T=CALENDAR.termOf(G.day);
  console.log(id.padEnd(18), key, got?('傳了 '+got.h.toFixed(2)+' → 約 '+got.date+' '+got.depart):'沒傳', '| stage', DATE.stageNum(id), 'cond', WISH.cond(G,id,I.if), 'willing', WISH.willing(G,id), 'here', WISH.here(G,id), 'term', T&&T.id, why.join(';')); }
