#!/usr/bin/env node
/* CC-C（帳號 C）11-04：TE_SAME_NIGHT（BB-C 22:33 派工）——同一晚的期末邀約（心意、朋友）全部 20:30 一起到；週四、週五考完的學期都一樣；手機裡的順序照原本（週五學期語彤排第一）。
   BB-C 原文要驗的：
     ① 每個學期，同一晚的邀約都是 20:30 到。
     ② 玩家回了第一則以後，其他幾則照樣在手機裡看得到；照「只能接一個」婉拒，或照原本處理，不能消失不見。
     ③ 不動的照舊：芯慈當天才約、學姊回國以後才到、可昕和女朋友的學期末約會。
   做法：大一上～大四下八個學期，每個學期幾種人物組合，時段第一天到最後一天每晚 11:54～12:18、19:54～21:30 每 3 分鐘跑一次手機規則（同 tests/te_fri_same_night_unit.js 的 nights），
     記每一則期末邀約（te_<學期>_<id>）到的日子、時間、在手機裡的先後；「回第一則」那一種：第一則到了 1 分鐘回第一個選項（答應），再跑完那一晚，看其他幾則還在不在、狀態。
   對照：BASE＝修改前那一版（ce3462d4b，間隔 9 分鐘）跑出來的 JSON；給了就比「照原本」的幾項（先後、芯慈、學姊、可昕、女朋友那一頓）。
   【前置／捷徑】pg_harness 的假 GM；關係、心意（npcRom 40、4 次約會、心願）、常接觸點數直接設（同 te_fri_same_night_unit.js 的 setup）。
   用法：LW_ROOT=<checkout> [BASE=<對照組 JSON>] [OUT_JSON=<這一輪的 JSON>] [SHA=…] node cc_te_same_night_walk.js */
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(process.env.LW_ROOT||path.join(__dirname,'..','..','..','..'));
require(path.join(ROOT,'tests','alison.js'));
const H=require(path.join(ROOT,'tests','pg_harness.js'));
const {GM}=H, J=JSON.stringify;
let FAILS=0, PASSES=0; const check=(name,ok,inf)=>{ console.log((ok?'PASS ':'FAIL ')+name+(inf?'　'+inf:'')); if(ok) PASSES++; else FAILS++; return ok; };
const info=s=>console.log('INFO '+s);
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){} }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const YT='heroine_03', AN='heroine_01', ZQ='heroine_04', SIS='heroine_05', XC='classmate_xinci', KX='kexin';
const DK=k=>STORY.dayOfKey(k), K=d=>d==null?null:CALENDAR.dateOf(d).key, WD=d=>CALENDAR.dateOf(d).wd%7, WDN=d=>'日一二三四五六'[WD(d)];
const hm=h=>{ const x=Math.round(h*60); return String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0'); };
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=WD(d); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
const HEADSHA=process.env.SHA||'?';
const BASE=process.env.BASE&&fs.existsSync(process.env.BASE)?JSON.parse(fs.readFileSync(process.env.BASE,'utf8')):null;
const setup=(term,o)=>{ const w=TERMEND.windowOf(term); H.fresh('2025-09-01',9,'campus',o.flags); at(w.from,9); H.G.stage='law';
  for(const id of o.hearts||[]){ H.rel(id,70,50,45); SOCIAL.rel(id).npcRom=40; DATE.log(H.G,id).count=4; DATE.log(H.G,id).wish=true; }
  const C={}; for(const id of o.friends||[]){ H.rel(id,30,10,5); C[id]={pts:9,k:{}}; }
  for(const id of o.dating||[]){ H.CLOSE(id); ROM.start(H.G,id); }
  H.G.termend={contact:{[term]:C},think:{}}; const P=TERMEND.plan(H.G,w); if(o.addHeart&&!P.heart.includes(o.addHeart)) P.heart.push(o.addHeart); return {w,P}; };
/* 照時間一格一格走；answer：第一則到了 1 分鐘以後回第一個選項 */
const walkTerm=(w,answer)=>{ let answered=null; const seenAt={};
  for(let d=w.from;d<=w.to;d++) for(const [a,b] of [[11.9,12.3],[19.9,21.5]]) for(let h=a;h<=b+1e-9;h+=0.05){ at(d,+h.toFixed(3)); rules();
    for(const m of (H.G.msgs||[])){ if(!/^te_/.test(m.tag||'')||!m.ask) continue; if(seenAt[m.tag]==null&&(d>m.day||(d===m.day&&H.G.hour>=m.h-1e-6))) seenAt[m.tag]=[d,H.G.hour]; }
    if(answer&&!answered){ const first=(H.G.msgs||[]).filter(m=>/^te_/.test(m.tag||'')&&m.ask&&seenAt[m.tag]&&PHONE.askOpen(H.G,m)).sort((x,y)=>(x.day*24+x.h)-(y.day*24+y.h))[0];
      if(first&&(d*24+H.G.hour)>=first.day*24+first.h+0.0166){ PHONE.answer(H.G,first.ask.id,0); answered={tag:first.tag,from:first.from,day:d,h:H.G.hour}; rules(); } } }
  return answered; };
const invOf=(term)=>{ const L=(H.G.msgs||[]).map((m,i)=>Object.assign({i},m)).filter(m=>/^te_/.test(m.tag||'')&&m.ask&&(m.tag.startsWith('te_'+term+'_')||m.tag.startsWith('te_gf_'+term+'_')||m.tag.startsWith('te_ex_')));
  return L.map(m=>({tag:m.tag,from:m.from,key:K(m.day),wd:WDN(m.day),h:+(+m.h).toFixed(3),i:m.i,open:PHONE.askOpen?!!PHONE.askOpen(H.G,m):null,ans:m.ans!=null?m.ans:null,text:m.text})); };
const outsOf=(term)=>OUT.rec(H.G).filter(q=>q&&q.te&&q.te.term===term).map(q=>({id:q.id,who:q.te.who,kind:q.te.kind,key:K(q.day),h:q.h,place:q.place,state:q.state}));
const SC={
  friends4:{hearts:[],friends:[YT,AN,ZQ,XC]},
  heart2friend2:{hearts:[YT,AN],friends:[XC,ZQ]},
  xc_sameday:{hearts:[YT],friends:[AN],addHeart:XC},   /* 【捷徑】芯慈的心意要另外的前置（S.cond），同 te_fri_same_night_unit.js e：直接放進這學期的名單（只看 send 怎麼排）*/
  sis:{hearts:[],friends:[YT,SIS]},
  gf_yt:{hearts:[],friends:[AN,ZQ],dating:[YT],flags:{dating_heroine_03:true}},
  kx:{hearts:[],friends:[YT,AN],dating:[KX]}};
const RES={sha:HEADSHA,runs:{}};
(async()=>{
console.log('cc_te_same_night_walk　LW_ROOT='+ROOT+'　SHA='+HEADSHA+(BASE?'　對照 '+BASE.sha:'　（沒有對照組）'));
check('0. 載得到 TERMEND、PHONE、OUT；TERMEND.windowOf 八個學期都有',typeof TERMEND!=='undefined'&&TERMS.every(t=>!!TERMEND.windowOf(t)));
for(const term of TERMS) for(const sc of Object.keys(SC)) for(const ans of (sc==='friends4'||sc==='heart2friend2')?[false,true]:[false]){
  const key=term+'/'+sc+(ans?'/answer':''); let r;
  try{ const {w,P}=setup(term,SC[sc]); const answered=walkTerm(w,ans);
    r={plan:{heart:P.heart,friend:P.friend,exempt:P.exempt||[],back:K(P.back),fallback:P.fallback||null},exam:TERMEND.examDay?K(TERMEND.examDay(H.G,w)):null,answered:answered&&{tag:answered.tag,key:K(answered.day),h:+answered.h.toFixed(3)},inv:invOf(term),outs:outsOf(term),gf:(H.G.msgs||[]).filter(m=>/^te_gf_/.test(m.tag||'')).map(m=>({tag:m.tag,key:K(m.day),h:m.h,text:m.text}))};
  }catch(e){ r={err:String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')}; }
  RES.runs[key]=r; }
if(process.env.OUT_JSON) fs.writeFileSync(process.env.OUT_JSON,J(RES,null,1));
/* ---------- 檢查 ---------- */
const nm=id=>({heroine_03:'語彤',heroine_01:'芷若',heroine_04:'子晴',heroine_05:'學姊',classmate_xinci:'芯慈',kexin:'可昕'})[id]||id;
const fmt=r=>r.err?r.err:r.inv.map(x=>nm(x.from)+' '+x.key+'（'+x.wd+'）'+hm(x.h)).join('、');
for(const k of Object.keys(RES.runs)) info(k+'：'+fmt(RES.runs[k])+(RES.runs[k].answered?'｜回了 '+RES.runs[k].answered.tag+' '+RES.runs[k].answered.key+' '+hm(RES.runs[k].answered.h):''));
const errs=Object.keys(RES.runs).filter(k=>RES.runs[k].err); check('0. 每一輪都跑完（沒有例外）',!errs.length,J(errs.map(k=>[k,RES.runs[k].err])));
/* ① 同一晚的都 20:30（芯慈當天 12:00 的不算） */
const bad1=[];
for(const k of Object.keys(RES.runs)){ const r=RES.runs[k]; if(r.err||/\/answer$/.test(k)) continue; const byNight={};
  for(const x of r.inv){ if(Math.abs(x.h-12)<0.01) continue; (byNight[x.key]||(byNight[x.key]=[])).push(x); }
  for(const d in byNight){ const L=byNight[d]; if(L.length<2) continue;   /* BB-C 22:51：那一晚只有一則（例：大四上學姊 12/24）幾點到都不影響玩家選＝不看時間 */ if(L.some(x=>Math.abs(x.h-20.5)>1e-6)) bad1.push(k+' '+d+'：'+L.map(x=>nm(x.from)+' '+hm(x.h)).join('、')); } }
check('① 每個學期、每種組合：同一晚有兩則以上的，都在 20:30 一起到（BB-C 22:33、22:51；芯慈當天 12:00 那一則另外看）',!bad1.length,bad1.length?(bad1.length+' 晚：'+J(bad1.slice(0,8))):'');
/* 週五考完的學期：語彤排第一 */
const bad1b=[];
for(const t of ['Y2S2','Y4S1']) for(const sc of ['friends4','heart2friend2']){ const r=RES.runs[t+'/'+sc]; if(!r||r.err) continue; const L=r.inv.filter(x=>Math.abs(x.h-12)>0.01).sort((a,b)=>a.i-b.i); if(L.some(x=>x.from===YT)&&L[0].from!==YT) bad1b.push(t+'/'+sc+' '+L.map(x=>nm(x.from)).join('→')); }
check('① 週五考完的學期（大二下、大四上）：有語彤那一則的時候，手機裡她排第一',!bad1b.length,J(bad1b));
/* ② 回了第一則以後：其他幾則還在、狀態 */
const bad2=[];
for(const k of Object.keys(RES.runs).filter(k=>/\/answer$/.test(k))){ const r=RES.runs[k], r0=RES.runs[k.replace(/\/answer$/,'')]; if(r.err||!r0||r0.err) continue;
  const sameNight=r0.inv.filter(x=>r.answered&&x.key===r.answered.key&&Math.abs(x.h-12)>0.01).map(x=>x.tag);
  for(const tg of sameNight){ if(r.answered&&tg===r.answered.tag) continue; const x=r.inv.find(y=>y.tag===tg); if(!x) bad2.push(k+' '+nm(((r0.inv.find(y=>y.tag===tg))||{}).from)+'（沒回的那一輪 '+hm(((r0.inv.find(y=>y.tag===tg))||{}).h||0)+' 到）回了以後手機裡沒有'); }
  info('② '+k+'：回了 '+(r.answered?nm((r.inv.find(x=>x.tag===r.answered.tag)||{}).from)+' '+hm(r.answered.h):'（沒有）')+'；同一晚其他幾則 '+J(sameNight.filter(t=>!r.answered||t!==r.answered.tag).map(tg=>{ const x=r.inv.find(y=>y.tag===tg); return x?[nm(x.from),x.open?'還開著':'關了',x.ans]:[tg,'不見了']; })));
}
check('② 回了第一則以後，同一晚其他幾則都還在手機裡（沒有消失）',!bad2.length,J(bad2.slice(0,8)));
/* ③ 照原本：對照組 */
if(BASE){ const b3=[], b4=[];
  for(const k of Object.keys(RES.runs)){ const r=RES.runs[k], o=BASE.runs[k]; if(!o||o.err||r.err) continue;
    const seq=x=>x.inv.slice().sort((a,b)=>a.i-b.i).filter(y=>Math.abs(y.h-12)>0.01).map(y=>y.from).join('→'); if(!/\/answer$/.test(k)&&seq(r)!==seq(o)) b3.push(k+' '+seq(o)+' ⇒ '+seq(r));
    const xc=x=>J(x.inv.filter(y=>y.from===XC&&Math.abs(y.h-12)<0.01).map(y=>[y.key,y.h])); if(xc(r)!==xc(o)) b4.push(k+' 芯慈當天 '+xc(o)+' ⇒ '+xc(r));
    const sis=x=>J(x.inv.filter(y=>y.from===SIS).map(y=>[y.key,y.h])); if(/\/sis/.test(k)&&J(r.inv.filter(y=>y.from===SIS).map(y=>y.key))!==J(o.inv.filter(y=>y.from===SIS).map(y=>y.key))) b4.push(k+' 學姊 '+sis(o)+' ⇒ '+sis(r));
    const og=x=>J(x.outs.filter(q=>q.kind==='gf'||q.who===KX).map(q=>[q.id,q.key,q.h])+J(x.gf.map(m=>[m.tag,m.key,m.h]))); if(/\/(gf_yt|kx)/.test(k)&&og(r)!==og(o)) b4.push(k+' 女朋友／可昕 '+og(o)+' ⇒ '+og(r)); }
  check('① 手機裡的先後照原本（和對照組 '+BASE.sha+' 一樣）',!b3.length,J(b3.slice(0,8)));
  check('③ 照原本：芯慈當天 12:00、學姊回國以後的日子、女朋友／可昕的學期末約會和對照組一樣',!b4.length,J(b4.slice(0,8)));
} else info('③ 沒有對照組（BASE），「照原本」那幾項這一輪只記錄');
{ const sis=RES.runs['Y4S1/sis'], sx=sis&&!sis.err?sis.inv.filter(x=>x.from===SIS):[];
  check('③ 大四上學姊：12/24（回國的隔天）才到、帶「我昨天回來的」（BB-C 22:51：20:30、20:39 都算）',sx.length===1&&sx[0].key==='2028-12-24'&&/我昨天回來的/.test(sx[0].text||''),J(sx.map(x=>[x.key,hm(x.h),x.text])));
  if(sis&&!sis.err) info('③ 大四上學姊：'+J(sis.inv.filter(x=>x.from===SIS).map(x=>[x.key,hm(x.h),x.text])));
  const xs=Object.keys(RES.runs).filter(k=>/xc_sameday$/.test(k)).map(k=>[k.split('/')[0],RES.runs[k].err?'例外':RES.runs[k].inv.filter(x=>x.from===XC).map(x=>x.key+' '+hm(x.h))]); info('③ 芯慈心意（當天才約）：'+J(xs));
  const gs=Object.keys(RES.runs).filter(k=>/\/(gf_yt|kx)$/.test(k)).map(k=>[k,RES.runs[k].err?'例外':RES.runs[k].outs.filter(q=>q.kind==='gf'||q.who===KX).map(q=>q.id+' '+q.key+' '+hm(q.h)).concat(RES.runs[k].gf.map(m=>m.tag+' '+m.key+' '+hm(m.h)+' '+m.text))]); info('③ 女朋友／可昕：'+J(gs)); }
console.log('\n'+(FAILS?'FAILED '+FAILS:'ALL PASS '+PASSES));
process.exit(FAILS?1:0);
})();
