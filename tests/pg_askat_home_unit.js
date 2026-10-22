// PG-ASKAT-HOME-1021：人在家裡時，該問「出發」的時間要照家裡出發算車程——不需要瀏覽器。
//   原本 OUT.trip 只有經濟系那一年（HOME.baseMode）才照家裡算；法律系以後在家（寒暑假、畢業後住家裡），OUT.due、PG 固定格的 askAt、鬧鐘都照學校算（例：約 19:00、車程 10 分鐘 → 18:35 問），
//   從家裡的選單出發（OUT.go 的 fromHome）卻照家裡算 30 分鐘 → 19:05 才到；可昕的 AA_351 遲到 15 分鐘以上就記一次。
//   1 法律系、人在家：OUT.trip 照家裡（30 分鐘）；OUT.due 在 18:15 就該問（19:00 − 30 分 − 15 分），18:10 還不用；不在家照舊 18:35
//   2 PG 固定格（PGDATE.askAt）：在家＝18:15、不在家＝18:35，和 OUT.due 同一個時間
//   3 不受影響：電話、視訊不算車程；比 30 分鐘遠的照原本（政大 40 分鐘）；經濟系那一年照舊
// 修改前（開發分支 4660ca57）：第 1、2 項的「在家」FAIL。用法：node tests/pg_askat_home_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check}=H;
const NAMES=/^(PG_DATES|PGDATE)$/;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/pg_dates.js','src/pgdates3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);
const J=JSON.stringify, near=(a,b)=>Math.abs(a-b)<1e-6;
const setup=(atHome,stage)=>{ const G=H.fresh('2029-08-04',17,atHome?'home':'campus',{GRADUATED:H.D('2029-06-02'),MOVED_OUT:H.D('2029-06-28'),HOME_AFTER:'home'}); if(stage) G.stage=stage; HOME.rec(G).at=!!atHome; return G; };
const q0=G=>({id:'t_pg',ev:'ev_t',day:G.day,h:19,late:0.5,place:'政大山下',title:'測試的約',travel:'走路 約 10 分鐘',travelH:1/6,alarm:true});
{ const G=setup(true); const q=q0(G); OUT.plan(G,q); const p=OUT.get(G,'t_pg');
  const tr=OUT.trip(G,p); G.hour=18.1; const d1=OUT.due(G); G.hour=18.26; const d2=OUT.due(G);
  check('1. 法律系、人在家：車程照家裡 30 分鐘；18:10 還不用問、18:15 以後問（19:00 − 30 分 − 15 分）',near(tr.travelH,0.5)&&!d1&&!!d2&&d2.id==='t_pg',J({tr,d1:d1&&d1.id,d2:d2&&d2.id}));
  const G2=setup(false); OUT.plan(G2,q0(G2)); const p2=OUT.get(G2,'t_pg'); G2.hour=18.5; const e1=OUT.due(G2); G2.hour=18.6; const e2=OUT.due(G2);
  check('1. 不在家（校園）：照舊 18:35 才問（車程 10 分鐘）',near(OUT.trip(G2,p2).travelH,1/6)&&!e1&&!!e2,J({e1:e1&&e1.id,e2:e2&&e2.id})); }
{ const s=G=>({id:'t_pg2',ev:'ev_t',day:G.day,h:19,place:'政大山下',title:'測試的約',travel:'走路 約 10 分鐘',travelH:1/6,who:'kexin',key:'k'});
  const Gh=setup(true), ah=PGDATE.askAt(Gh,s(Gh)), Gc=setup(false), ac=PGDATE.askAt(Gc,s(Gc)), T=(G,h)=>G.day*24+h;
  check('2. PG 固定格 askAt：在家＝18:15、不在家＝18:35（和 OUT.due 同一個時間）',near(ah,T(Gh,18.25))&&near(ac,T(Gc,19-1/6-0.25)),J([ah-T(Gh,0),ac-T(Gc,0)])); }
{ const G=setup(true); const call={id:'c',h:20,call:true,travelH:0}, video={id:'v',h:20,verb:'接起來',place:'視訊',travelH:0}, far={id:'f',h:20,travelH:2/3,travel:'捷運＋公車 約 40 分鐘'};
  const Ge=setup(true,'econ'); Ge.flags.Y0_MOVED_OUT=true; const Ge2=setup(false,'econ');
  check('3. 電話、視訊不算車程；比 30 分鐘遠的照原本；經濟系在家照舊照家裡、不在家照舊',OUT.trip(G,call).travelH===0&&OUT.trip(G,video).travelH===0&&near(OUT.trip(G,far).travelH,2/3)&&near(OUT.trip(Ge,q0(Ge)).travelH,0.5)&&near(OUT.trip(Ge2,q0(Ge2)).travelH,1/6)); }
H.done();
