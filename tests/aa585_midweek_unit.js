// AA_585 期中週黑板（法律三十門第 8、9 週：前七週整理＋案例作業；AA 定稿 1bdfd2304，BB_231 @995ffc585 法律審 60 週 PASS；任務 AA585-MIDWEEK-1102）——不需要瀏覽器。
//   1  tools/syllabus/import_syllabus.py 把 AA_585_midweek.json 當補丁來源疊上去（BB 的源稿不動）：三十門每門的第 8、9 週＝AA_585 一字不差（白名單那一版）
//   2  三十門週次 1～15 連續（D118 沒有期中考：第 8、9 週照常上課）
//   3  第 8、9 週（黑板、老師那句、同學）沒有「考」「分數」「成績」；判決研討兩門的「期中報告」除外
//   4  reviewed 加 60 筆（'<代號>|8'、'<代號>|9'），遊戲上課那一週顯示 AA 的黑板（CLS.content）
//   5  民總第 9 週照原題（十七歲網購遊戲機），不用備案；第 7 週和第 8 週黑板第三行不重複
//   6  白名單 AA_585_midweek.json@1bdfd2304 approved
// 修改前（int/next1102 db76e4881）：1～4、6 FAIL（三十門都沒有第 8、9 週）。用法：node tests/aa585_midweek_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path'), cp=require('child_process');
const {check}=H, J=JSON.stringify;
const sec=(n,f)=>{ try{ f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const P585='docs/story_planning/AA_585_midweek.json';
const ALLOW=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files;
const ent=ALLOW.find(e=>e.path===P585&&e.status==='approved');
let SRC=null; try{ SRC=JSON.parse(cp.execFileSync('git',['-C',H.ROOT,'show',(ent?ent.sha:'1bdfd2304')+':'+P585],{encoding:'utf8'})); }catch(e){ SRC=null; }
const IDS=SRC?Object.keys(SRC).filter(k=>!k.startsWith('_')):[];
const C=SYLLABUS.courses, wk=(c,n)=>(C[c]||[]).find(x=>x.w===n);
const SEM=['crim_judgment_sem','public_judgment_sem'];

sec(6,()=>{ check('6. 白名單：AA_585_midweek.json@1bdfd2304 approved（approvedBy 寫 BB_231 法律審）',!!ent&&ent.sha==='1bdfd2304'&&/BB_231/.test(ent.approvedBy||''),J(ent&&ent.sha)); });
sec(1,()=>{ check('1. 讀得到 AA_585_midweek.json、三十門',!!SRC&&IDS.length===30,IDS.length+'');
  const bad=IDS.filter(c=>J([wk(c,8),wk(c,9)])!==J(SRC[c]));
  check('1. 三十門的第 8、9 週＝AA_585 一字不差（board 三行、line、react 空）',bad.length===0,J(bad.slice(0,5)));
  check('1. SYLLABUS.source 寫了 AA_585@1bdfd2304',/AA_585@1bdfd2304/.test(SYLLABUS.source),SYLLABUS.source.slice(-80)); });
sec(2,()=>{ const bad=IDS.filter(c=>{ const W=(C[c]||[]).map(x=>x.w); return J(W.filter(w=>w<=15))!==J([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]); });
  check('2. 三十門週次 1～15 連續、照順序',bad.length===0,J(bad.map(c=>[c,(C[c]||[]).map(x=>x.w)]))); });
sec(3,()=>{ const bad=[]; for(const c of IDS) for(const n of [8,9]){ const w=wk(c,n)||{}; const T=[...(w.board||[]),w.line||'',...(w.react||[]).map(r=>r.text||'')];
    for(const t of T){ const s=SEM.includes(c)?t.replace(/期中報告/g,''):t; if(/考|分數|成績/.test(s)) bad.push(c+'|'+n+'：'+t); } }
  check('3. 第 8、9 週沒有「考」「分數」「成績」（判決研討的「期中報告」除外）',bad.length===0,J(bad));
  check('3. 對照：判決研討兩門的第 8 週真的寫「期中報告」（例外有用到）',SEM.some(c=>J(wk(c,8)||{}).includes('期中報告'))||SEM.some(c=>J(wk(c,9)||{}).includes('期中報告'))); });
sec(4,()=>{ const miss=[]; for(const c of IDS) for(const n of [8,9]) if(!SYLLABUS.reviewed.includes(c+'|'+n)) miss.push(c+'|'+n);
  check('4. reviewed 有那 60 筆',IDS.length===30&&miss.length===0,J(miss.slice(0,6)));
  CLS.attach&&CLS.attach(); const c=COURSES.list.find(x=>x.id==='civ_general'); const day=STORY.termDay('Y1S1',9,1);
  H.fresh('2025-10-27',9,'linze',{}); const it={c,week:9,term:'Y1S1',day,slot:(c.slots||[])[0]||{wd:1,block:'am'}}; let ct=null; try{ ct=CLS.content(it); }catch(e){ ct={err:String(e)}; }
  check('4. 上民總第 9 週：黑板＝AA_585（案例作業／十七歲的甲…／爸媽知道後不同意…）、老師那句',!!ct&&J(ct.board)===J(SRC.civ_general[1].board)&&ct.line===SRC.civ_general[1].line,J(ct&&{b:ct.board,l:ct.line,e:ct.err})); });
sec(5,()=>{ check('5. 民總第 9 週照原題（十七歲網購四萬元遊戲機），不用備案',J((wk('civ_general',9)||{}).board)===J(['案例作業','十七歲的甲沒問爸媽，網購了一台四萬元的遊戲機','爸媽知道後不同意。這個買賣有效嗎？']));
  const dup=IDS.filter(c=>{ const a=((wk(c,7)||{}).board||[])[2], b=((wk(c,8)||{}).board||[])[2]; return !!a&&a===b; });
  check('5. 第 7 週和第 8 週黑板第三行沒有一樣的（第 7 週「下週、下下週：前七週整理＋案例作業」接第 8 週「下週：案例作業（當堂寫）」）',dup.length===0,J(dup)); });
H.done();
