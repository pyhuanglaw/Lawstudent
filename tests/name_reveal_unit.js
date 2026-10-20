// 認識前不露名字（AA 10-13 P1-1；BB-C 10-20 用使用者存檔：還沒認識以安，按鈕就寫「和沈以安說話」）——不需要瀏覽器。
//   女主角（social_layer D）：還沒有 FIRST_MET 的時候，名字是「不認識的女生」——
//   1. 沒看過（UNKNOWN）；2. 看過三次（noticed → RECOGNIZABLE；原本這時就露出全名）；
//   3. 認識（SOCIAL.meet）以後才是全名；4. 照作息生出來的人，搭話按鈕用同一個名字（game3d.js spawnCharacter）；
//   5. 其他層（B：不熟的同學）照舊（RECOGNIZABLE＝descriptor）。
// 修改前 2 FAIL。用法：node tests/name_reveal_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|SOCIAL|CALENDAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/characters.js','src/social3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const G={day:9,hour:10,flags:{},social:null}; SOCIAL.bind(G);
const nm=()=>SOCIAL.displayName('heroine_01');
check('1. 以安：沒看過＝「不認識的女生」', nm()==='不認識的女生', nm());
for(let i=0;i<3;i++) SOCIAL.noticed('heroine_01');
check('2. 以安：看過三次（RECOGNIZABLE）、還沒認識＝照樣「不認識的女生」', SOCIAL.reveal('heroine_01')==='RECOGNIZABLE'&&nm()==='不認識的女生', SOCIAL.reveal('heroine_01')+' '+nm());
SOCIAL.meet('heroine_01','putong');
check('3. 認識以後＝「沈以安」', nm()==='沈以安', nm());
{ const src=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
  check('4. 照作息生出來的人：搭話按鈕＝「和」＋SOCIAL.displayName＋「說話」', /talkLabel:bgOnly\?null:'和'\+SOCIAL\.displayName\(id\)\+'說話'/.test(src)); }
{ const id=Object.keys(CHARACTERS).find(k=>CHARACTERS[k].social_layer==='B'&&CHARACTERS[k].descriptor);
  if(id){ for(let i=0;i<3;i++) SOCIAL.noticed(id); check('5. 不熟的同學（B 層）照舊：RECOGNIZABLE＝descriptor', SOCIAL.displayName(id)===CHARACTERS[id].descriptor, id+' '+SOCIAL.displayName(id)); }
  else check('5. 找得到有 descriptor 的 B 層同學', false); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
