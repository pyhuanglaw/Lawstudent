// 資料頁、朋友列表的「科系・年級」跟著祐廷的學年（SIS-GRADE-1017；00_現行設定總表第 2-1 節，AA-C c70dc425）——不需要瀏覽器。用法：node tests/year_tag_unit.js
// （2026-10-28 AA_519 2-1（企劃線 d75cd0228，NPC-STORY2-1028）：陳助教那一列大三「法研所（刑事法組）・碩四」、大四「法研所博士班」——表照新的改）
// 修改前：沒有 SOCIAL.yearTag，game3d.js 直接用 c.year（學姊四年都是「法律系・四年級」、以安大四還是一年級、經濟系那一年顯示法律大一時的年級）
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|SOCIAL|CALENDAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/characters.js','src/social3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const dayOf=k=>{ for(let d=-500; d<1700; d++){ const t=CALENDAR.dateOf(d); if(t&&t.key===k) return d; } return null; };
const at=(k,stage,flags)=>{ const G={day:dayOf(k),hour:12,stage:stage||'law',flags:flags||{},social:null}; SOCIAL.bind(G); return G; };
const ROWS=[ // [人物, 經濟系那一年, 大一, 大二, 大三, 大四]（總表 2-1）
  ['heroine_01',null,'法律系・一年級','法律系・二年級','法律系・三年級','法律系・四年級'],
  ['zhe',null,'法律系・一年級','法律系・二年級','法律系・三年級','法律系・四年級'],
  ['heroine_03',null,'社會系・一年級','社會系・二年級（雙主修法律）','社會系・三年級（雙主修法律）','社會系・四年級（雙主修法律）'],
  ['heroine_02',null,'外文系・二年級','外文系・三年級','外文系・四年級（上學期在英國交換）','英國・電影研究所'],
  ['heroine_04',null,'資工系・二年級','資工系・三年級','資工系・四年級','獨立遊戲工作室'],
  ['heroine_05','法律系・三年級','法律系・四年級','法研所（財經法學組）・碩一','法研所（財經法學組）・碩二','法研所（財經法學組）・碩三'],
  ['kexin','經濟系・一年級','政大法律系・一年級','政大法律系・二年級','政大法律系・三年級','政大法律系・四年級'],   /* AA_368 M3：經濟系那一年照日期（2/14 起才是「休學中」，下面另外測）*/
  ['classmate_peishan',null,'法律系・一年級','法律系・二年級','法律系・二年級','法律系・二年級'],
  ['kai',null,'資工系・一年級','資工系・二年級','資工系・三年級','資工系・四年級'],
  ['npc_fangyt','森林系・一年級','森林系・二年級','森林系・三年級','森林系・四年級','森林系'],
  ['npc_huangxh',null,'心理系・一年級','心理系・二年級','心理系・三年級','心理系・四年級'],
  ['econ_zhengxun','經濟系・一年級','經濟系・二年級','經濟系・三年級','經濟系・四年級','經濟系'],
  ['econ_pinyu','經濟系・一年級','經濟系・二年級','經濟系・三年級','經濟系・四年級','經濟系'],
  ['econ_jiahao','經濟系・二年級','經濟系・三年級','經濟系・四年級','經濟系','經濟系'],
  ['npc_ta_chen',null,'法研所（刑事法組）・碩二','法研所（刑事法組）・碩三','法研所（刑事法組）・碩四','法研所博士班'] ];   /* AA_519 2-1（企劃線 d75cd0228，2026-10-28 NPC-STORY2-1028）：2025 碩二、2026 碩三、2027 碩四，2028-09 起法研所博士班（原本大三、大四都寫「法研所（刑事法組）」）*/
const WHEN=[['2024-10-01','econ'],['2025-10-01'],['2026-10-01'],['2027-10-01'],['2028-10-01']];
for(const r of ROWS){ const bad=[]; WHEN.forEach(([k,st],i)=>{ if(r[i+1]==null) return; at(k,st); const t=SOCIAL.yearTag(r[0]); if(t!==r[i+1]) bad.push(k+'：'+t+' ≠ '+r[i+1]); }); check(r[0]+' 五個學年照表', !bad.length, bad.join(' | ')); }
at('2027-10-01','law',{dating_classmate_peishan:true}); check('沛珊大三：交往中＝教育系・一年級', SOCIAL.yearTag('classmate_peishan')==='教育系・一年級', SOCIAL.yearTag('classmate_peishan'));
at('2028-10-01','law',{PS_RECONNECT:true}); check('沛珊大四：放榜後重新聯絡上＝教育系・二年級', SOCIAL.yearTag('classmate_peishan')==='教育系・二年級', SOCIAL.yearTag('classmate_peishan'));
{ const bad=[]; for(const [k,want] of [['2024-08-23','經濟系・一年級'],['2024-10-17','經濟系・一年級'],['2025-02-13','經濟系・一年級'],['2025-02-14','經濟系・一年級（休學中）'],['2025-05-01','經濟系・一年級（休學中）'],['2025-08-28','經濟系・一年級（休學中）']]){ at(k,'econ'); const t=SOCIAL.yearTag('kexin'); if(t!==want) bad.push(k+'：'+t+' ≠ '+want); }
  check('AA_368 M3：可昕經濟系那一年照日期——2025-02-14 以前「經濟系・一年級」、2/14 起「經濟系・一年級（休學中）」（原本從 2024-08 認識她起就寫「（2025-02 起休學）」）', !bad.length&&!JSON.stringify(CHARACTERS.kexin.tagByPY).includes('2025-02 起休學'), bad.join(' | ')); }
at('2029-03-10'); check('大四下照大四', SOCIAL.yearTag('heroine_05')==='法研所（財經法學組）・碩三', SOCIAL.yearTag('heroine_05'));
const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
check('game3d.js 的兩處都改用 SOCIAL.yearTag（朋友列表、資料頁）', (g3.match(/SOCIAL\.yearTag\(id\)/g)||[]).length===2 && !/\['','一','二','三','四'\]\[c\.year\]/.test(g3));
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
