// 資料頁、朋友列表的「科系・年級」跟著祐廷的學年（SIS-GRADE-1017）——不需要瀏覽器。用法：node tests/year_tag_unit.js
//   學姊：祐廷法律大一＝「法律系・四年級」，大二～大四＝「法研所・碩一／碩二／碩三」（00_現行設定總表第 2 節、AA_218 第 1 節）
//   其他人照 characters.js 的 year 不變；助教陳照舊「法研所（刑事法組）・碩二」
// 修改前：沒有 SOCIAL.yearTag，game3d.js 直接用 c.year，學姊四年都是「法律系・四年級」
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|SOCIAL|CALENDAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/characters.js','src/social3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const dayOf=k=>{ for(let d=-400; d<1700; d++){ const t=CALENDAR.dateOf(d); if(t&&t.key===k) return d; } return null; };
const at=(k,stage)=>{ const G={day:dayOf(k),hour:12,stage:stage||'law',flags:{},social:null}; SOCIAL.bind(G); return G; };
const want=[['2025-10-01','法律系・四年級'],['2026-10-01','法研所・碩一'],['2027-10-01','法研所・碩二'],['2028-10-01','法研所・碩三'],['2029-03-10','法研所・碩三']];
for(const [k,w] of want){ at(k); const t=SOCIAL.yearTag('heroine_05'); check('學姊 '+k+'（大'+SOCIAL.playerYear()+'）＝'+w, t===w, t); }
at('2027-10-01'); check('以安照舊（characters.js 的 year）', SOCIAL.yearTag('heroine_01')==='法律系・一年級', SOCIAL.yearTag('heroine_01'));
check('助教陳照舊', SOCIAL.yearTag('npc_ta_chen')==='法研所（刑事法組）・碩二', SOCIAL.yearTag('npc_ta_chen'));
const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
check('game3d.js 的兩處都改用 SOCIAL.yearTag（朋友列表、資料頁）', (g3.match(/SOCIAL\.yearTag\(id\)/g)||[]).length===2 && !/\['','一','二','三','四'\]\[c\.year\]/.test(g3));
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
