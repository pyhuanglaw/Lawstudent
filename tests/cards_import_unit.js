// 觀念卡匯入（D118-B2-1102、CARDS-Y1S2-IMPORT-1102）：AA 的觀念卡稿經劇情匯入白名單進 src/data/study_units.js——不需要瀏覽器。
//   a 白名單：cards_y1s1.json、cards_y1s2.json、cards_y2s1.json、crimpro_titles.json 各有一筆 approved（有 approvedBy），讀得到那一版
//   b 每學期匯入的張數（大一上 27＝民總一 10、憲法上 9、刑總一 8；大一下 29＝憲法下 9、刑總二 10、債總一 10；
//     大二上 33＝行政法 8、刑法分則 8、債總二 8、物權 9）
//   c 匯入的字＝白名單那一版（git show <sha>:<path>）一字不差（plain／example／cue／basis，每一張都比）
//   d 刑訴題庫卡 crimpro_q1～q9 的標題＝crimpro_titles.json
//   e AA 還沒交定稿的學期（大二下以後）沒有匯入：plain／example／cue 都空
//   f 洩題檢查（STUDY.cueLeaks(q, cue)，遊戲 cueFor 只看 cue）：大一下 45 題、大二上 62 題每一題都不擋
//     （AA notes：「S.cueLeaks 只看 cue 時 45 題都不擋」「62 題全部 false」）；大一上只列出哪幾題不會出提示（資訊，不算失敗）；
//     讀過的卡，cueFor 給的提示就是 cue
// 修改前（開發分支 b1b249873）：plain／cue 全部空、刑訴題庫卡是暫用標題、白名單沒有這四個檔——a、b、c、d、f FAIL。
// 用法：node tests/cards_import_unit.js（要先 git fetch origin claude/story-planning，才讀得到白名單那一版）
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check}=H, J=JSON.stringify;
for(const f of ['src/data/study_units.js','src/study3d.js']){ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) continue; const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const DIR='docs/story_planning/study/';
const FILES={Y1S1:DIR+'cards_y1s1.json',Y1S2:DIR+'cards_y1s2.json',Y2S1:DIR+'cards_y2s1.json'}, TITLES=DIR+'crimpro_titles.json';
const ALLOW=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8'));
const approved=p=>ALLOW.files.filter(e=>e.path===p&&e.status==='approved'&&e.approvedBy&&e.sha);
const show=(sha,p)=>{ try{ return JSON.parse(cp.execFileSync('git',['-C',H.ROOT,'show',sha+':'+p],{encoding:'utf8',stdio:['ignore','pipe','pipe']})); }catch(e){ return null; } };
const U={}; for(const u of STUDY_UNITS.units) U[u.id]=u;
const Q={}; for(const q of EXAM_BANK.questions) Q[q.id]=q; for(const q of QBANK) Q[q.id]=Q[q.id]||q;
const has=u=>!!(u.plain||u.example||u.cue);

/* a 白名單 */
const src={};
for(const [t,p] of Object.entries(FILES).concat([['titles',TITLES]])){ const a=approved(p); src[t]=a.length===1?show(a[0].sha,p):null;
  check('a. 白名單有 '+p+' 一筆 approved，讀得到那一版（git show）',a.length===1&&!!src[t],J(a.map(e=>e.sha))); }

/* b 張數 */
const EXPECT={Y1S1:{civ_general:10,const_1:9,crim_gen1:8},Y1S2:{const_2:9,crim_gen2:10,oblig_gen1:10},Y2S1:{admin_law:8,crim_spec:8,oblig_gen2:8,property:9}};
for(const [t,want] of Object.entries(EXPECT)){ const got={}; for(const u of STUDY_UNITS.units) if(u.term===t&&has(u)) got[u.course]=(got[u.course]||0)+1;
  const srt=o=>J(Object.keys(o).sort().map(k=>[k,o[k]])), n=Object.values(got).reduce((a,b)=>a+b,0), wn=Object.values(want).reduce((a,b)=>a+b,0);
  check('b. '+t+' 匯入 '+wn+' 張（'+J(want)+'）',srt(got)===srt(want),J({n,got})); }

/* c 一字不差 */
for(const t of Object.keys(FILES)){ const S=src[t]; if(!S){ check('c. '+t+' 匯入的字＝白名單那一版',false,'讀不到來源'); continue; }
  const bad=[]; let n=0;
  for(const [id,c] of Object.entries(S)){ if(id.startsWith('_')) continue; n++; const u=U[id];
    if(!u){ bad.push(id+':遊戲沒有這張'); continue; }
    for(const k of ['plain','example','cue']) if(u[k]!==c[k]) bad.push(id+'.'+k);
    if(J(u.basis||[])!==J(c.basis||[])) bad.push(id+'.basis'); }
  check('c. '+t+' 匯入的 '+n+' 張 plain／example／cue／basis＝白名單那一版一字不差',n>0&&!bad.length,J(bad.slice(0,8))); }
{ const u=U.const_2_w2, c=src.Y1S2&&src.Y1S2.const_2_w2;   // 抽一張看得到的
  check('c. 抽樣 const_2_w2：cue＝稿上那一句',!!c&&!!u&&u.cue===c.cue&&u.cue.length>0,J(u&&u.cue)); }

/* d 刑訴題庫卡標題 */
{ const T=src.titles||{}; const qu=STUDY_UNITS.units.filter(u=>u.src==='qbank'); const bad=qu.filter(u=>T[u.id]!==u.title).map(u=>u.id);
  check('d. 刑訴題庫卡 '+qu.length+' 張的標題＝crimpro_titles.json（crimpro_q1～q9）',qu.length===9&&!bad.length&&Object.keys(T).filter(k=>!k.startsWith('_')).length===9,J({bad,q1:U.crimpro_q1&&U.crimpro_q1.title})); }

/* e 還沒交定稿的學期沒有匯入 */
{ const rest=STUDY_UNITS.units.filter(u=>!FILES[u.term]&&u.src!=='qbank'); const leak=rest.filter(has).map(u=>u.id);
  check('e. 白名單沒有的學期（'+[...new Set(rest.map(u=>u.term))].join('、')+'）'+rest.length+' 張週卡 plain／example／cue 都空',rest.length>0&&!leak.length,J(leak.slice(0,5)));
  const qb=STUDY_UNITS.units.filter(u=>u.src==='qbank'&&has(u)).map(u=>u.id);
  check('e. 刑訴題庫卡只換了標題，plain／example／cue 還空著（AA 另批寫）',!qb.length,J(qb)); }

/* f 洩題檢查 */
const noHint={};
for(const t of Object.keys(FILES)){ noHint[t]=[]; let n=0;
  for(const u of STUDY_UNITS.units){ if(u.term!==t||!u.cue) continue;
    for(const qid of u.qids){ const q=Q[qid]; n++; if(!q){ noHint[t].push(qid+'（找不到題目）'); continue; } if(STUDY.cueLeaks(q,u.cue)) noHint[t].push(qid+'@'+u.id+(q.type==='tf'||!q.options?'（是非題）':'')); } }
  noHint[t].n=n; }
console.log('INFO 大一上：有 cue 的卡涵蓋 '+noHint.Y1S1.n+' 題，考試時不會出提示的 '+noHint.Y1S1.length+' 題：'+(noHint.Y1S1.join('、')||'（無）'));
console.log('INFO 大一下：有 cue 的卡涵蓋 '+noHint.Y1S2.n+' 題，考試時不會出提示的 '+noHint.Y1S2.length+' 題：'+(noHint.Y1S2.join('、')||'（無）'));
console.log('INFO 大二上：有 cue 的卡涵蓋 '+noHint.Y2S1.n+' 題，考試時不會出提示的 '+noHint.Y2S1.length+' 題：'+(noHint.Y2S1.join('、')||'（無）'));
check('f1. 大一下 45 題，STUDY.cueLeaks(題, cue) 全部不擋（AA notes：只看 cue 時 45 題都不擋）',noHint.Y1S2.n===45&&noHint.Y1S2.length===0,J({n:noHint.Y1S2.n,blocked:noHint.Y1S2}));
check('f1b. 大二上 62 題，STUDY.cueLeaks(題, cue) 全部不擋（AA notes：只用 cue 文字 62 題全部 false）',noHint.Y2S1.n===62&&noHint.Y2S1.length===0,J({n:noHint.Y2S1.n,blocked:noHint.Y2S1}));
{ const G=H.fresh('2026-06-01',10,'dorm'); const u=U.const_2_w2; STUDY.rec(G).u[u.id]='read';
  const qid=u.qids.find(id=>!STUDY.cueLeaks(Q[id],u.cue)); const got=qid?STUDY.cueFor(G,qid):null;
  check('f2. 讀過 const_2_w2，考那一週的題目時 cueFor 給的提示是 cue',!!qid&&got===STUDY.CUE_PREFIX+u.cue+'）',J({qid,got})); }
H.done();
