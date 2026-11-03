// BB_241 第四節（4fb22b51b）：CG-24 台中情人節（cg_valentine_taichung_heroine01）放在「（傍晚，她送你到車子旁邊……紙袋塞給你。）」那一拍，不在 14:00 公園門口
const fs=require('fs'), path=require('path'); const s=fs.readFileSync(path.join(__dirname,'..','src/data/an_yt_hol_events.js'),'utf8'); let f=0;
const ck=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) f++; };
const iGate=s.indexOf("我算你兩點到。"), iBag=s.indexOf("（傍晚，她送你到車子旁邊。你要上車的時候，她把一個紙袋塞給你。）"), iCg=s.indexOf("cg:TC_CG}");
ck('1. CG 在紙袋那一拍之後（傍晚、車子旁邊）',iBag>0&&iCg>iBag,JSON.stringify({iBag,iCg}));
ck('2. 公園門口（兩點）那一段沒有 CG',iGate>0&&!(iCg>iGate&&iCg<iBag));
ck('3. AN_VDAY_CG 記號和 CG 放在一起（只出現一次）',(s.match(/set:\{AN_VDAY_CG:true\}/g)||[]).length===1&&s.indexOf('set:{AN_VDAY_CG:true}')>iCg);
console.log(f?'FAILED '+f:'ALL PASS'); process.exit(f?1:0);
