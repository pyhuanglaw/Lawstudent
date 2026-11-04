#!/usr/bin/env node
/* CC-C（帳號 C）11-04：AA_689 逐字驗（BB-C 23:03 派工，跑在 95942084e＝含 39e6f0ca5）。期望值一律用 git show 讀企劃線 AA_689（1f2983981；補 fc3da48ca 只記錄），CC_50 第 41 條。
   1 第五節：芷若大二下心意「下禮拜五晚上我有空。……」——照時間走：最後一科週五 6/11 晚上（有語彤那一則＝同一晚到）／沒有語彤（隔天到）兩種，邀約的字逐字、答應以後飯排在 6/18（五）
     子晴朋友大四上「欸 禮拜一工作室不用加班 宵夜」——12/22（五）晚上到、答應以後飯 12/25（一）
   2 4-1：語彤畢業以後資料頁的四列標籤（S.PG_TAG.heroine_03）逐字；舊的兩個標籤不在；SOCIAL.pgTag 在幾個日子顯示對的那一列
   3 4-2：feed yt1i 2029-11-22 22:00、yt4i 2029-12-15 21:00（字不動＝和 1e378a386 那一版逐欄比）；yt2i、yt3i 照留
   4 4-3：以安 2030 說實話那一場的地點字幕（S.TELL.heroine_01.loc30）「燒臘店，兩人桌」；語彤照留（沒有 loc30）；補（fc3da48ca）分開談那一場只記錄
   5 4-4：讀書小組只有語彤那一版（POSTGRAD_LINES R2 study.yutong）三句：前兩句照留、最後一句「她說我的那張明天貼。」
   【前置／捷徑】pg_harness 的假 GM；心意、朋友、常接觸點數直接設（同 te_fri_same_night_unit.js 的 setup）。
   用法：LW_ROOT=<checkout> [OLD_ROOT=<1e378a386 checkout>] [CC_REPO=<有企劃線物件的 repo>] [SHA=…] node cc_aa689_check.js */
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(process.env.LW_ROOT||path.join(__dirname,'..','..','..','..'));
const CC_REPO=process.env.CC_REPO||path.resolve(__dirname,'..','..','..','..');
require(path.join(ROOT,'tests','alison.js'));
const H=require(path.join(ROOT,'tests','pg_harness.js'));
const {GM}=H, J=JSON.stringify;
let FAILS=0, PASSES=0; const check=(name,ok,inf)=>{ console.log((ok?'PASS ':'FAIL ')+name+(inf?'　'+inf:'')); if(ok) PASSES++; else FAILS++; return ok; };
const info=s=>console.log('INFO '+s);
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{}; global.ZRUK=global.ZRUK||{W_FROM:'2028-09-01',playW:async()=>'orig'};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
const loadErr=[];
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,100)); } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const YT='heroine_03', AN='heroine_01', ZR='heroine_02', ZQ='heroine_04';
const DK=k=>STORY.dayOfKey(k), K=d=>d==null?null:CALENDAR.dateOf(d).key, WD=d=>CALENDAR.dateOf(d).wd%7, WDN=d=>'日一二三四五六'[WD(d)];
const hm=h=>{ const x=Math.round(h*60); return String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0'); };
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=WD(d); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const gitShow=(rev,p)=>{ try{ return cp.execFileSync('git',['-C',CC_REPO,'-c','core.quotepath=off','show',rev+':'+p],{encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const DOCP='docs/story_planning/AA_689_回LAWWW_AA688留下的舊設定_芷若子晴週五邀約.md';
const doc=gitShow('1f2983981',DOCP), doc2=gitShow('fc3da48ca',DOCP);
const rows=s=>s.split('\n').filter(l=>/^\|/.test(l)&&!/^\|-/.test(l)).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim()));
const sec5=doc.slice(doc.indexOf('## 五、')), R5=rows(sec5);
const rowOf=(R,k)=>R.find(r=>r[0].includes(k))||[];
const ZR_NEW=rowOf(R5,'芷若 大二下 心意')[2], ZQ_NEW=rowOf(R5,'子晴 朋友 大四上')[2];
const s41=doc.slice(doc.indexOf('### 4-1'),doc.indexOf('### 4-2')), TAG41=[...s41.matchAll(/`\['(\d{4}-\d\d-\d\d)','([^']+)'\]`/g)].map(m=>[m[1],m[2]]), OLD41=[...s41.split('原本')[1].matchAll(/「([^」]+)」/g)].map(m=>m[1]);
const s42=doc.slice(doc.indexOf('### 4-2'),doc.indexOf('### 4-3')), R42=rows(s42), T42=id=>{ const r=rowOf(R42,'`'+id+'`'); const m=/\*\*`([^`]+)`\*\*/.exec(r[2]||''); return m?m[1]:(/照留/.test(r[2]||'')?'照留':null); };
const s43=doc.slice(doc.indexOf('### 4-3'),doc.indexOf('### 4-4')), LOC30=(/改\*\*「([^」]+)」/.exec(s43)||[])[1];
const s44=doc.slice(doc.indexOf('### 4-4'),doc.indexOf('### 4-5')), LAST44=(/最後一句：「([^」]+)」/.exec(s44)||[])[1], KEEP44=((/前兩則照留：(.+)$/m.exec(s44)||[])[1]||'').split('／').map(x=>x.trim());
const HEADSHA=process.env.SHA||'?';
const sec=async(n,f)=>{ console.log('\n===== '+n); try{ await f(); }catch(e){ check(n+'：丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const setup=(term,o)=>{ const w=TERMEND.windowOf(term); H.fresh('2025-09-01',9,'campus',o.flags); at(w.from,9); H.G.stage='law';
  for(const id of o.hearts||[]){ H.rel(id,70,50,45); SOCIAL.rel(id).npcRom=40; DATE.log(H.G,id).count=4; DATE.log(H.G,id).wish=true; }
  const C={}; for(const id of o.friends||[]){ H.rel(id,30,10,5); C[id]={pts:9,k:{}}; } H.G.termend={contact:{[term]:C},think:{}}; const P=TERMEND.plan(H.G,w); return {w,P}; };
const nights=(w,d0,d1)=>{ for(let d=d0;d<=d1;d++) for(let h=19.9;h<=21.5+1e-9;h+=0.05){ at(d,+h.toFixed(3)); rules(); } };
const askOf=(term,id)=>(H.G.msgs||[]).find(m=>m.tag==='te_'+term+'_'+id&&m.ask);
(async()=>{
console.log('cc_aa689_check　LW_ROOT='+ROOT+'　SHA='+HEADSHA+'　稿 1f2983981（補 fc3da48ca）');
check('0. 載得到 TERMEND、SOCIAL.PG_TAG、FEED_PG、R2Y4B.TELL、POSTGRAD_LINES；AA_689 讀得到（第五節兩句、4-1 四列、4-2 兩個日子、4-3、4-4）',typeof TERMEND!=='undefined'&&!!SOCIAL.PG_TAG&&typeof FEED_PG!=='undefined'&&typeof R2Y4B!=='undefined'&&!!R2Y4B.TELL&&typeof POSTGRAD_LINES!=='undefined'&&!!ZR_NEW&&!!ZQ_NEW&&TAG41.length===4&&!!T42('yt1i')&&!!LOC30&&!!LAST44&&KEEP44.length===2,
  (loadErr.length?'載入錯誤 '+J(loadErr.slice(0,3))+'；':'')+J({ZR_NEW,ZQ_NEW,TAG41,OLD41,yt1i:T42('yt1i'),yt4i:T42('yt4i'),LOC30,LAST44,KEEP44}));
await sec('1 第五節：週五同一晚到的兩句（照時間走）',()=>{
  for(const [label,o] of [['有語彤那一則（她 6/11 週五就約）',{hearts:[ZR],friends:[YT]}],['沒有語彤那一則',{hearts:[ZR],friends:[]}]]){
    const {w,P}=setup('Y2S2',o); nights(w,w.from,DK('2027-06-13')); const m=askOf('Y2S2',ZR);
    if(!check('1. 芷若大二下心意（'+label+'）：邀約有到',P.heart.includes(ZR)&&!!m,J({heart:P.heart,friend:P.friend}))) continue;
    check('1. 芷若大二下心意（'+label+'）：字逐字「'+ZR_NEW+'」（'+K(m.day)+'（'+WDN(m.day)+'）'+hm(m.h)+' 到）',m.text===ZR_NEW,J(m.text));
    at(m.day,m.h+0.05); PHONE.answer(H.G,m.ask.id,0); rules(); const q=OUT.rec(H.G).find(x=>x&&x.te&&x.te.who===ZR&&x.te.term==='Y2S2');
    check('1. 芷若大二下心意（'+label+'）：答應以後飯排在 2027-06-18（五）（稿：「下禮拜五」＝6/18）',!!q&&K(q.day)==='2027-06-18',J(q&&[K(q.day)+'（'+WDN(q.day)+'）',hm(q.h),q.place])); }
  { const {w,P}=setup('Y4S1',{friends:[YT,ZQ]}); nights(w,w.from,DK('2028-12-23')); const m=askOf('Y4S1',ZQ), y=askOf('Y4S1',YT);
    if(check('1. 子晴大四上朋友（和語彤同一學期）：邀約有到',P.friend.includes(ZQ)&&!!m,J({friend:P.friend}))){
      check('1. 子晴大四上：12/22（五）晚上到（和語彤那一則同一晚）',K(m.day)==='2028-12-22'&&!!y&&K(y.day)==='2028-12-22',J([K(m.day),hm(m.h),y&&K(y.day)]));
      check('1. 子晴大四上：字逐字「'+ZQ_NEW+'」',m.text===ZQ_NEW,J(m.text));
      at(m.day,m.h+0.05); PHONE.answer(H.G,m.ask.id,0); rules(); const q=OUT.rec(H.G).find(x=>x&&x.te&&x.te.who===ZQ&&x.te.term==='Y4S1');
      check('1. 子晴大四上：答應以後飯排在 2028-12-25（一）（稿：「12/22 週五到、飯 12/25 週一」）',!!q&&K(q.day)==='2028-12-25',J(q&&[K(q.day)+'（'+WDN(q.day)+'）',hm(q.h),q.place])); } }
  const all=J(TERMEND_LINES); for(const [who,r] of [['芷若',rowOf(R5,'芷若 大二下 心意')],['子晴',rowOf(R5,'子晴 朋友 大四上')]]) check('1. '+who+'原本那一句「'+r[1]+'」不在 TERMEND_LINES',!all.includes(r[1]),'');
  const inv2=rowOf(R5,'芷若 大二下 invite2'); check('1. 芷若大二下 invite2「'+inv2[1]+'」照留',/照留/.test(inv2[2]||'')&&all.includes(inv2[1]),''); });
await sec('2 4-1：語彤畢業以後資料頁的四列標籤',()=>{
  const T=SOCIAL.PG_TAG[YT];
  check('2. S.PG_TAG.heroine_03＝稿上四列（逐字、照順序）',J(T)===J(TAG41),J(T));
  const all=J(SOCIAL.PG_TAG); check('2. 舊的「'+OLD41.join('」「')+'」不在',OLD41.length>=2&&!OLD41.some(t=>all.includes(t)),J(OLD41));
  const G=H.fresh('2029-09-02',12,'dorm',{GRADUATED:PG.gradDay()}); const shown=[];
  for(const k of ['2029-09-02','2029-12-13','2029-12-14','2030-03-01','2030-07-31','2030-08-01','2030-12-31']){ at(DK(k),12); shown.push([k,SOCIAL.pgTag?SOCIAL.pgTag(YT):null]); }
  const want={'2029-09-02':'準備國考','2029-12-13':'準備國考','2029-12-14':'律師（職前訓練）','2030-03-01':'律師（事務所實習）','2030-07-31':'律師（事務所實習）','2030-08-01':'律師・事務所','2030-12-31':'律師・事務所'};
  check('2. 資料頁顯示（SOCIAL.pgTag）照日子換：9/2 準備國考、12/14 職前訓練、2030-03-01 事務所實習、2030-08-01 律師・事務所',shown.every(([k,v])=>v===want[k]),J(shown)); });
await sec('3 4-2：語彤畢業以後的動態',()=>{
  const L=[].concat(...Object.values(FEED_PG).filter(Array.isArray)), f=id=>L.find(x=>x&&x.id===id);
  let O=null; if(process.env.OLD_ROOT){ try{ const src=fs.readFileSync(path.join(process.env.OLD_ROOT,'src/data/feed_pg.js'),'utf8'); O=new Function(src.replace(/^const FEED_PG\s*=/m,'var FEED_PG=')+';return FEED_PG;')(); }catch(e){ O=null; } }
  const OL=O?[].concat(...Object.values(O).filter(Array.isArray)):[], of=id=>OL.find(x=>x&&x.id===id);
  check('3. yt1i t＝'+T42('yt1i')+'、yt4i t＝'+T42('yt4i')+'（稿 4-2）',!!f('yt1i')&&f('yt1i').t===T42('yt1i')&&!!f('yt4i')&&f('yt4i').t===T42('yt4i'),J([f('yt1i')&&f('yt1i').t,f('yt4i')&&f('yt4i').t]));
  if(O){ const same=id=>{ const a=Object.assign({},f(id)), b=Object.assign({},of(id)); delete a.t; delete b.t; return J(a)===J(b); };
    check('3. 字不動：yt1i、yt4i 除了 t 以外每一欄和 1e378a386 一樣；yt2i、yt3i 整則照留（含 t）',same('yt1i')&&same('yt4i')&&J(f('yt2i'))===J(of('yt2i'))&&J(f('yt3i'))===J(of('yt3i')),J({yt2i:f('yt2i')&&f('yt2i').t,yt3i:f('yt3i')&&f('yt3i').t,old1:of('yt1i')&&of('yt1i').t,old4:of('yt4i')&&of('yt4i').t})); }
  else info('3. 沒有 OLD_ROOT：「字不動」那一項沒比');
  check('3. yt2i 照留 2029-11-08、yt3i 照留 2030-06-23（稿 4-2）',!!f('yt2i')&&/^2029-11-08/.test(f('yt2i').t)&&!!f('yt3i')&&/^2030-06-23/.test(f('yt3i').t),J([f('yt2i')&&f('yt2i').t,f('yt3i')&&f('yt3i').t])); });
await sec('4 4-3：2030「跟她們說實話」的地點字幕',()=>{
  const T=R2Y4B.TELL;
  check('4. 以安 loc30＝「'+LOC30+'」（原本「麵店，兩人桌」）',!!T[AN]&&T[AN].loc30===LOC30,J(T[AN]&&T[AN].loc30));
  check('4. 語彤照留：沒有 loc30（稿 4-3）',!!T[YT]&&T[YT].loc30==null,J(T[YT]&&{loc:T[YT].loc,loc30:T[YT].loc30}));
  check('4. 「麵店，兩人桌」不在 R2Y4B.TELL',!J(T).includes('麵店，兩人桌'),'');
  if(doc2){ const at30=(/`at30` 字幕：「([^」]+)」/.exec(doc2)||[])[1], nar=(/開場旁白：(（[^）]+）)/.exec(doc2)||[])[1], src=fs.readFileSync(path.join(ROOT,'src/r2y4b3d.js'),'utf8');
    info('4.（補 fc3da48ca，只記錄；BB-C 這次沒點名）以安分開談 at30「'+at30+'」在程式裡：'+src.includes('at30:\''+at30+'\'')+'；開場旁白「'+nar+'」在程式裡：'+(!!nar&&src.includes(nar))); } });
await sec('5 4-4：2029-12-14 讀書小組只有語彤那一版',()=>{
  const R2=POSTGRAD_LINES.R2||{}, Y=(R2.study||{}).yutong;
  check('5. study.yutong 三句：「'+KEEP44.join('」「')+'」照留、最後一句「'+LAST44+'」',J(Y)===J(KEEP44.concat([LAST44])),J(Y));
  check('5. 舊的「她說下一張要寫我的。」不在 POSTGRAD_LINES',!J(POSTGRAD_LINES).includes('她說下一張要寫我的。'),''); });
console.log('\n'+(FAILS?'FAILED '+FAILS:'ALL PASS '+PASSES));
process.exit(FAILS?1:0);
})();
