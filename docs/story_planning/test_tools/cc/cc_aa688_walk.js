#!/usr/bin/env node
/* CC-C（帳號 C）11-04：AA688_walk（BB-C 22:33 派工）——AA_688（企劃線 7cc729232，AA-C 定 D109）接進遊戲以後「照日期走一遍」。
   和 LAWWW-C 的 tests/aa688_yt_pg_unit.js（每一項自己設好時間、挑那幾天測）不同：這支從畢業以後（2029-06-03 10:00）開始，照遊戲畢業後篇自己的「跳到下一件事」（PG.advance）一路走到 2030-12-31，
   途中：PG 的場景到了就演（選項都選第一個）、出遊時間到了就出發（OUT.tick）、手機照收。把整段時間裡語彤的出遊、群組訊息記下來，再逐字對 AA_688。
   1 第 2 節：只和語彤交往（沒有讀書小組）——表上 18 個月每月一格：週六、17:30、一盞茶屋（出遊標題、地點字幕）、她說的那一句＝表上「改成」（2029-08 照留）；2029-09 沒有；同一個月沒有第二格。
   2 第 3 節：在桌遊團群組裡——「一試過了。」2029-09-07 15:10、「上了。」「蘇姨已經在寫紅紙了。」2029-12-14 15:10（排在阿哲「放榜了」那幾則後面）；2030-09-06、2030-12-13 沒有她那兩則。
   3 第 4 節：多段感情《今天不用幫忙》（REPAIR.heroine_03）六處逐字、真的演（MREL.run）；稿「現在」欄的舊字不在 MULTIREL_LINES。
   4 （順便）語彤畢業以後的格子裡沒有麵店、阿姨、乾麵、店休、延畢。
   期望值一律從企劃線的稿讀（CC_50 第 41 條：不照遊戲輸出改期望）。
   【前置／捷徑】pg_harness 的假 GM（不需要瀏覽器）；畢業、交往、搬出宿舍、群組直接設（同 tests/aa688_yt_pg_unit.js 的 freshPG／grpSave）；選項都選第一個。
   用法：LW_ROOT=<開發分支 checkout> [CC_REPO=<有企劃線物件的 repo>] [SHA=…] node cc_aa688_walk.js */
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(process.env.LW_ROOT||path.join(__dirname,'..','..','..','..'));
const CC_REPO=process.env.CC_REPO||path.resolve(__dirname,'..','..','..','..');
if(fs.existsSync(path.join(ROOT,'tests','alison.js'))) require(path.join(ROOT,'tests','alison.js'));
const H=require(path.join(ROOT,'tests','pg_harness.js'));
const {GM}=H, J=JSON.stringify;
let FAILS=0, PASSES=0; const check=(name,ok,inf)=>{ console.log((ok?'PASS ':'FAIL ')+name+(inf?'　'+inf:'')); if(ok) PASSES++; else FAILS++; return ok; };
const info=s=>console.log('INFO '+s);
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
global.ZRUK=global.ZRUK||{W_FROM:'2028-09-01',playW:async()=>'orig'};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
const loadErr=[];
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,120)); } }
const caps=[]; GM.caption=(a,b)=>{ caps.push(b!=null?b:a); }; GM.toast=()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.money=d=>{ H.G.money=(H.G.money|0)+(+d||0); };
const YT='heroine_03', KX='kexin';
const DK=k=>PG.DK(k), K=d=>d==null?null:CALENDAR.dateOf(d).key, WD=d=>CALENDAR.dateOf(d).wd%7, WDN=d=>'日一二三四五六'[WD(d)];
const hm=h=>{ const x=Math.round(h*60); return String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0'); };
const gitShow=(rev,p)=>{ try{ return cp.execFileSync('git',['-C',CC_REPO,'-c','core.quotepath=off','show',rev+':'+p],{encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const DOC_SHA='7cc729232', DOC_P='docs/story_planning/AA_688_語彤畢業以後的舊設定_延畢2030考試麵店.md';
const doc=gitShow(DOC_SHA,DOC_P);
const part=(t,a,b)=>{ const i=t.indexOf('\n## '+a+'.'); if(i<0) return ''; const j=b?t.indexOf('\n## '+b+'.',i+1):-1; return t.slice(i,j<0?undefined:j); };
const rows=s=>s.split('\n').filter(l=>/^\|/.test(l)&&!/^\|-/.test(l)).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim()));
const sl=s=>String(s||'').replace(/\*\*/g,'').split('／');
const S2=rows(part(doc,2,3)).filter(r=>/^20\d\d-\d\d$/.test(r[0]));   /* [月, 原本, 改成] */
const S3=rows(part(doc,3,4)), S4=rows(part(doc,4,5));
const rowOf=(R,k)=>R.find(r=>r[0].includes(k))||[];
const WANT={}; for(const r of S2) WANT[r[0]]=r[2]==='照留'?r[1]:r[2];
const ymOf=d=>K(d).slice(0,7);
const HEADSHA=process.env.SHA||'?';
const sec=async(n,f)=>{ console.log('\n===== '+n); try{ await f(); }catch(e){ check(n+'：丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const freshPG=(key,h,flags)=>{ const G=H.fresh(key,h,'dorm',Object.assign({MOVED_OUT:DK('2029-06-28'),HOME_AFTER:'home',Y4_PATH:'other',PACKED_Y4:DK('2029-06-01'),ROOM_Y2:true,ROOM_Y3:true,ROOM_Y4:true},flags||{}));
  G.acts={att:{}}; G.outings=[]; G.flags.GRADUATED=PG.gradDay(); G.flags.GRAD_DONE=true; PG.rec(G).done.grad=1; for(const e of ['ev_grad_family','ev_grad_lunch','ev_grad_envelope','ev_y4_path','ev_move_out_y4']) G.events.done[e]=1; return G; };   /* 同 tests/aa688_yt_pg_unit.js 的 freshPG */

(async()=>{
console.log('cc_aa688_walk　LW_ROOT='+ROOT+'　SHA='+HEADSHA+'　稿 '+DOC_SHA);
check('0. 載得到 PG、PGDATE、PG_DATES、MREL、MULTIREL_LINES、POSTGRAD_LINES；AA_688（'+DOC_SHA+'）第 2 節 18 列、第 3 節、第 4 節讀得到',typeof PG!=='undefined'&&typeof PGDATE!=='undefined'&&typeof PG_DATES!=='undefined'&&typeof MREL!=='undefined'&&typeof MULTIREL_LINES!=='undefined'&&typeof POSTGRAD_LINES!=='undefined'&&S2.length===18&&S3.length>=5&&S4.length>=7,
  (loadErr.length?'載入錯誤 '+J(loadErr.slice(0,4))+'；':'')+J([S2.length,S3.length,S4.length]));

/* ================= 1＋2 照日期走：畢業以後到 2030 年底 ================= */
const Y1=sl(rowOf(S3,'Y2030.yt1')[1]), Y2=sl(rowOf(S3,'Y2030.yt2')[1]);
let OUTS=[], GRP=[], WALK={};
await sec('1＋2 照日期走（2029-06-03 10:00 → 2030-12-31，PG.advance 跳到下一件事）',async()=>{
  const G=freshPG('2029-06-03',10,{});
  H.FRIEND(YT); H.date(YT); PHONE.join(G,'noodle_team','桌遊團'); H.FAMILIAR('zhe'); H.FAMILIAR('yu');   /* 只和語彤交往、在桌遊團群組裡（沒有讀書小組）*/
  const END=DK('2030-12-31')*24+23.9, now=()=>G.day*24+(+G.hour||0);
  let guard=0, stalls=0, nAdv=0, nSteps=0, nOut=0; const steps=[], errs=[], seen=new Set();
  const grab=()=>{ for(const m of (G.msgs||[])){ if(m.th!=='g:noodle_team') continue; const k=[m.tag,m.from||m.who,m.text,m.day,m.h].join('|'); if(seen.has(k)) continue; seen.add(k); GRP.push({from:m.from||m.who,text:m.text,key:K(m.day),h:m.h,tag:m.tag}); } };   /* G.msgs 有上限、舊的會被擠掉：每一圈都收 */
  while(guard++<6000&&now()<END){
    grab(); H.tick(); grab();
    const q=OUT.due(G);
    if(q){ nOut++; const at0=[K(G.day),hm(G.hour)]; caps.length=0; H.said=[]; H.opts=[]; H.picks=[0]; const rec={id:q.id,who:q.pgWho||q.who||null,key:K(q.day),wd:WDN(q.day),h:q.h,title:q.title,place:q.place,asked:at0};
      try{ await OUT.tick(GM); }catch(e){ errs.push('OUT '+q.id+' '+String(e&&e.message||e).slice(0,80)); }
      rec.opt0=(H.opts[0]||[])[0]||null; rec.caps=caps.slice(); rec.said=H.said.map(s=>[s.who,s.t]); rec.state=(OUT.get(G,q.id)||{}).state; OUTS.push(rec); continue; }
    const s=PG.due(G);
    if(s){ nSteps++; H.picks=[]; try{ await PG.runStep(GM,s); }catch(e){ errs.push('PG '+s.id+' '+String(e&&e.message||e).slice(0,80)); PG.rec(G).done[s.id]=1; } steps.push(K(G.day)+' '+s.id); continue; }
    const t0=now(); let ok=false; try{ ok=await PG.advance(GM); }catch(e){ errs.push('advance '+String(e&&e.message||e).slice(0,80)); } nAdv++;
    if(!ok||now()<=t0+1e-6){ stalls++; PG.setT(G,H.E,Math.floor((t0+1)/24),(t0+1)%24); }   /* 沒有下一件事（或跳不動）＝往前一小時 */
  }
  grab(); info('G.msgs 最後 '+(G.msgs||[]).length+' 則；走的途中收到的群組訊息 '+GRP.length+' 則');
  WALK={end:K(G.day)+' '+hm(G.hour),guard,nAdv,stalls,nSteps,nOut,steps:steps.length,errs};
  info('走完：'+J({end:WALK.end,圈數:guard,跳:nAdv,往前一小時:stalls,場景:nSteps,出遊:nOut,例外:errs.length}));
  if(errs.length) info('例外（記下來；不是這支要驗的）：'+J(errs.slice(0,8)));
  info('演過的 PG 場景（'+steps.length+'）：'+J(steps).slice(0,900));
  check('1. 走得到 2030 年底（沒有卡住）',now()>=END-24,WALK.end);
});
await sec('1 第 2 節：語彤每月一格（週六 17:30、一盞茶屋、她那一句）',()=>{
  const Y=OUTS.filter(r=>r.who===YT&&/^pg_date_heroine_03_/.test(r.id));
  info('語彤的出遊（'+Y.length+'）：'+J(Y.map(r=>[r.key+'（'+r.wd+'）'+hm(r.h),r.title,r.place,r.asked.join(' '),r.caps,r.said.map(x=>x[1]),r.state])));
  const byYm={}; for(const r of Y) (byYm[r.key.slice(0,7)]||(byYm[r.key.slice(0,7)]=[])).push(r);
  const months=Object.keys(WANT);
  check('1. 表上 18 個月（2029-06～08、10～12、2030-01～12）每月一格，2029-09 沒有，同一個月沒有第二格',months.length===18&&months.every(m=>(byYm[m]||[]).length===1)&&!byYm['2029-09']&&Object.keys(byYm).every(m=>WANT[m]!=null),
    J(Object.fromEntries(Object.keys(byYm).concat(months).filter((v,i,a)=>a.indexOf(v)===i).sort().map(m=>[m,(byYm[m]||[]).map(r=>r.key)]))));
  const bad=[];
  for(const m of months){ const r=(byYm[m]||[])[0]; if(!r){ bad.push(m+' 沒有'); continue; }
    if(r.wd!=='六') bad.push(m+' 不是週六 '+r.key+'（'+r.wd+'）');
    if(Math.abs(r.h-17.5)>1e-6) bad.push(m+' 不是 17:30 '+hm(r.h));
    if(!/一盞茶屋/.test(r.title||'')||(r.place&&r.place!=='一盞茶屋')) bad.push(m+' 地點 '+J([r.title,r.place]));
    if(!r.caps.includes('一盞茶屋')) bad.push(m+' 字幕 '+J(r.caps));
    const ys=r.said.filter(x=>x[0]&&/語彤|heroine_03/.test(x[0])).map(x=>x[1]); if(J(ys)!==J([WANT[m]])) bad.push(m+' 她說 '+J(ys)+' 應該 '+J(WANT[m]));
    if(r.state!=='done') bad.push(m+' 出遊 '+r.state); }
  check('1. 每一格：週六、17:30、出遊標題／地點「一盞茶屋」、地點字幕「一盞茶屋」、她說的那一句逐字＝AA_688 第 2 節「改成」（2029-08 照留）、出遊演完（done）',!bad.length,bad.length?J(bad.slice(0,8)):'18 格');
  const asked=Y.map(r=>r.asked[1]);
  info('1. 問出發的時間（17:30 減走路 15 分鐘再減 15 分鐘）：'+J([...new Set(asked)])+'；出發選項 '+J([...new Set(Y.map(r=>r.opt0))]));
  const OLD=/麵店|阿姨|乾麵|店休|延畢|最後一個學期|國考我要考/;
  check('4. 語彤這 18 格她說的話裡沒有麵店、阿姨、乾麵、店休、延畢、「最後一個學期」「國考我要考」',!Y.some(r=>r.said.some(x=>OLD.test(x[1]))),J(Y.filter(r=>r.said.some(x=>OLD.test(x[1]))).map(r=>r.key)));
  const others=OUTS.filter(r=>r.who!==YT); if(others.length) info('其他出遊（'+others.length+'）：'+J(others.map(r=>[r.id,r.key+' '+hm(r.h),r.title])).slice(0,600));
});
await sec('2 第 3 節：桌遊團群組語彤那幾則',()=>{
  const Y=GRP.filter(m=>m.from===YT);
  info('走完以後群組裡語彤的訊息：'+J(Y.map(m=>[m.key,hm(m.h),m.text])));
  const a=Y.filter(m=>m.text===Y1[0]), b=Y.filter(m=>Y2.includes(m.text));
  check('2. 「'+Y1[0]+'」只有一則、2029-09-07 15:10（AA_688 第 3 節：搬到一試放榜那天、字不動）',Y1.length===1&&a.length===1&&a[0].key==='2029-09-07'&&hm(a[0].h)==='15:10',J(a));
  check('2. 「'+Y2.join('」「')+'」各一則、2029-12-14 15:10、照這個順序（第 3 節：搬到放榜那天、字不動）',Y2.length===2&&b.length===2&&J(b.map(m=>m.text))===J(Y2)&&b.every(m=>m.key==='2029-12-14'&&hm(m.h)==='15:10'),J(b));
  const d14=GRP.filter(m=>m.key==='2029-12-14'), iz=d14.findIndex(m=>m.from==='zhe'&&/放榜/.test(m.text)), iy=d14.findIndex(m=>m.from===YT&&m.text===Y2[0]);
  check('2. 2029-12-14 排在阿哲「放榜了」那幾則後面',iz>=0&&iy>iz,J(d14.map(m=>[m.from,m.text,hm(m.h)])));
  check('2. 2030-09-06、2030-12-13 沒有她那兩則（2030 那兩則拿掉）',!Y.some(m=>m.key==='2030-09-06'||m.key==='2030-12-13'),J(Y.filter(m=>/^2030-(09-06|12-13)/.test(m.key))));
});

/* ================= 3 第 4 節：多段感情《今天不用幫忙》 ================= */
await sec('3 第 4 節：多段感情《今天不用幫忙》（REPAIR.heroine_03）六處',async()=>{
  const R=(MULTIREL_LINES.REPAIR||{})[YT]||{}, tx=x=>typeof x==='string'?x:(x&&x.n!=null?x.n:(x&&x.t!=null?x.t:null));
  const T1=((((R.talk1||[]).find(x=>x&&x.c)||{}).c||[]).find(o=>o.t==='「好。我等妳。」')||{}).then||[];
  const w1=sl(rowOf(S4,'talk1')[2]), a2=rowOf(S4,'ask 第 2 句')[2], a4=rowOf(S4,'ask 第 4 句')[2], rb=rowOf(S4,'result B')[2], d2=rowOf(S4,'result D 第 2 句')[2], d3=rowOf(S4,'result D 第 3 句')[2];
  const res=[['talk1 選「好。我等妳。」最後兩句',J(T1.slice(-2).map(tx))===J(w1),J(T1.map(tx))],['ask 第 2 句',(R.ask||[])[1]===a2,J(R.ask)],['ask 第 4 句',(R.ask||[])[3]===a4,J(R.ask)],
    ['result B 旁白',((R.result||{}).B||[]).map(tx).includes(rb),J((R.result||{}).B)],['result D 第 2 句',((R.result||{}).D||[])[1]===d2,J((R.result||{}).D)],['result D 第 3 句',((R.result||{}).D||[])[2]===d3,J((R.result||{}).D)]];
  for(const [k,ok,inf] of res) check('3. '+k+'＝AA_688 第 4 節「改成」',ok,inf);
  const olds=S4.filter(r=>r[0]!=='欄').flatMap(r=>sl(r[1])), all=J(MULTIREL_LINES);
  check('3. 稿「現在」欄的舊字都不在 MULTIREL_LINES',olds.length>=6&&!olds.some(o=>all.includes(o)),J(olds.filter(o=>all.includes(o))));
  H.fresh('2027-04-07',15,'campus',{}); MREL._gm=GM; H.CLOSE(YT); ROM.start(H.G,YT); H.G.flags.dating_kexin=true; const c=MREL.ctx(H.G,YT,KX);   /* 【前置】同時和語彤、可昕交往（多段感情） */
  H.said=[]; H.picks=[0]; await MREL.run(GM,YT,R.talk1,c); const t1=H.said.map(s=>s.t);
  H.said=[]; await MREL.run(GM,YT,R.ask,c); const ta=H.said.map(s=>s.t); H.said=[]; await MREL.run(GM,YT,R.result.B,c); const tb=H.said.map(s=>s.t); H.said=[]; await MREL.run(GM,YT,R.result.D,c); const td=H.said.map(s=>s.t);
  info('3. 真的演（MREL.run）：talk1 '+J(t1)+'｜ask '+J(ta)+'｜B '+J(tb)+'｜D '+J(td));
  check('3. 真的演：talk1 最後兩句、ask 第 2／4 句、B 旁白、D 第 2／3 句都是改過的字',J(t1.slice(-2))===J(w1)&&ta[1]===a2&&ta[3]===a4&&tb.includes(rb)&&td[1]===d2&&td[2]===d3,'');
});
console.log('\n'+(FAILS?'FAILED '+FAILS:'ALL PASS '+PASSES));
process.exit(FAILS?1:0);
})();
