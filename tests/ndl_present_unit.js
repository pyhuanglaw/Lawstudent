// 麵店長桌閒聊：說話的人要真的在店裡（NDL-PRESENT-1030，使用者 2026-10-30 04:3x：「去阿鳳麵店 出現麵店團的人 對話 但根本沒有在遊戲內出現」，
//   附存檔 day 28 21:30 在麵店）——不需要瀏覽器。
//   以前：只有阿哲有麵店作息（週二、四 17:30～20:30），Alison、柏翰、芯慈從來不在麵店；長桌閒聊 17:00～21:00 只看認不認識，人不在也照樣講。
//   現在：①三位補麵店日長桌作息（和阿哲同一段，寫 terms＝比一般作息優先）；②STORY.ndlHere／ndlHereAll：說話的人（who）都在店裡才演
//         （3D 裡有這個人，或這一刻的作息在麵店）；旁白沒點名的那幾則＝至少一位認識的麵店團在。
//   0 抽得到；1 四位麵店日 18:00 都在；2 20:45 都走了＝不演；3 有人不在＝他說話的那幾則跳過；4 旁白那幾則要至少一位在
// 修改前（postrel-1030 5b48dc350）：第 0 項 FAIL（沒有 ndlHere）。用法：node tests/ndl_present_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
try{ let src=fs.readFileSync(path.join(H.ROOT,'src/data/noodle_table.js'),'utf8'); src=src.replace(/^const (NOODLE_TABLE)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:'noodle_table.js'}); }catch(e){}
global.MREL=global.MREL||{ytShift:()=>true};
const TEAM=['zhe','yu','classmate_bohan','classmate_xinci'];
const meet=(...ids)=>{ for(const id of ids){ SOCIAL.remember(id,'FIRST_MET',''); if(id==='yu') H.G.flags.met_yu=true; } };
const at=(key,hh)=>{ H.fresh(key,hh,'noodle',{afternoonDone:true}); PHONE.join(H.G,'noodle_team','麵店團'); meet(...TEAM,'heroine_03','heroine_01'); return H.G; };
check('0. STORY.ndlHere、STORY.ndlHereAll 存在',typeof STORY.ndlHere==='function'&&typeof STORY.ndlHereAll==='function');
if(typeof STORY.ndlHere!=='function') H.done();
// 作息
{ const bad=[]; for(const id of ['yu','classmate_bohan','classmate_xinci']){ const L=(CHARACTERS[id].daily_schedule||[]).filter(e=>e.zone==='noodle'&&J(e.days)===J([2,4])&&e.from===17.5&&e.to===20.5&&Array.isArray(e.terms)&&e.terms.length===8); if(L.length!==1) bad.push(id); }
  check('1. Alison、柏翰、芯慈各有一筆麵店日長桌作息（週二、四 17:30～20:30、八個學期）',!bad.length,J(bad)); }
// 1.
{ const G=at('2025-09-16',18); const here=TEAM.map(id=>[id,STORY.ndlHere(G,id)]);
  check('1. 9/16（二）18:00：麵店團四位都在店裡',here.every(x=>x[1]),J(here)); check('1. 閒聊照演',STORY.ndlTalkDue(G)); }
// 2.
{ const G=at('2025-09-16',20.75); const here=TEAM.map(id=>[id,STORY.ndlHere(G,id)]);
  check('2. 20:45：四位都走了（20:30）、閒聊不演',here.every(x=>!x[1])&&!STORY.ndlTalkDue(G),J(here)); }
// 3.
{ const G=at('2025-09-16',18); const orig=STORY.ndlHere; STORY.ndlHere=(g,id)=>id==='classmate_xinci'?false:orig(g,id);
  const L=NOODLE_TABLE.Y1, pick=[]; for(let i=0;i<L.length;i++){ G.flags.ndlTalkN={Y1:i}; const p=STORY.ndlTalkPick(G); pick.push(p&&p.e); }
  STORY.ndlHere=orig;
  const withX=pick.filter(e=>e&&(e.who||[]).includes('classmate_xinci'));
  check('3. 芯慈不在：輪到哪一則都不會挑到有她說話的那一則',withX.length===0&&pick.some(Boolean),J(withX.map(e=>e.who))); }
// 4.
{ const G=at('2025-09-16',18); const orig=STORY.ndlHere; STORY.ndlHere=()=>false;
  const e={dialogue:[{text:'（旁白）'}]}; const a=STORY.ndlHereAll(G,e); STORY.ndlHere=orig; const b=STORY.ndlHereAll(G,e);
  check('4. 旁白沒點名的那一則：一個麵店團都不在＝不演；有人在＝演',a===false&&b===true,J({a,b})); }
// 5. 麵店這一區已經生過人（S._popZone）：只認 3D 真的有的人（BB-B 10-30 n15：9/30、10/2 柏翰、芯慈作息在麵店但店裡坐滿沒生出來，ndlHere 照樣算在）
{ const G=at('2025-09-30',18); const sched=STORY.ndlHere(G,'classmate_bohan'); const o=EVENTS.npcOf, z0=STORY._popZone;
  EVENTS.npcOf=id=>id==='zhe'?{id:'zhe'}:null; STORY._popZone='noodle';
  const zhe=STORY.ndlHere(G,'zhe'), bo=STORY.ndlHere(G,'classmate_bohan'), pair=STORY.ndlHereAll(G,{who:['zhe','classmate_bohan']});
  G.zone='campus'; const away=STORY.ndlHere(G,'classmate_bohan'); G.zone='noodle';
  EVENTS.npcOf=o; STORY._popZone=z0;
  check('5. 麵店生過人以後：阿哲在 3D＝在；柏翰作息在麵店但 3D 沒有＝不在（阿哲＋柏翰那一則不演）；不在麵店照舊看作息',sched===true&&zhe===true&&bo===false&&pair===false&&away===true,J({sched,zhe,bo,pair,away})); }
H.done();
