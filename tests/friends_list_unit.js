// 朋友清單（手機「朋友」）列誰：見過面的、阿哲阿凱周老師、有聯絡方式的；遠距女友可昕開局就在（使用者 2026-10-16：朋友清單沒有可昕）
const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','src/game3d.js'),'utf8');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'　'+(info||''))); if(!ok) fails++; };
const m=src.match(/function knownIds\(\)\{ return (Object\.keys\(CHARACTERS\)\.filter\(id=>\{[\s\S]*?\}\)); \}/);
check('找得到 knownIds',!!m);
if(m){
  const mk=(G,mem)=>{ const CHARACTERS={heroine_01:{},kexin:{},heroine_02:{},stranger:{social_layer:'B'},zhe:{},kai:{}}; const SOCIAL={has:(id,k)=>!!(mem[id]&&mem[id].includes(k)),reveal:()=>'UNKNOWN'}; return new Function('CHARACTERS','SOCIAL','G','return '+m[1])(CHARACTERS,SOCIAL,G); };
  let ids=mk({flags:{dating_kexin:true},contacts:{}},{});
  check('開局（交往中、還沒交換聯絡方式紀錄）：可昕在清單上',ids.includes('kexin'),JSON.stringify(ids));
  ids=mk({flags:{},contacts:{}},{});
  check('沒交往、沒聯絡方式：可昕不在',!ids.includes('kexin'),JSON.stringify(ids));
  ids=mk({flags:{},contacts:{heroine_02:3}},{});
  check('有聯絡方式的人在清單上（芷若）',ids.includes('heroine_02'),JSON.stringify(ids));
  ids=mk({flags:{},contacts:{}},{heroine_01:['FIRST_MET']});
  check('見過面的人在（以安）、沒見過的不在（芷若）',ids.includes('heroine_01')&&!ids.includes('heroine_02'),JSON.stringify(ids));
  check('阿哲、阿凱照舊在',ids.includes('zhe')&&ids.includes('kai'));
}
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
