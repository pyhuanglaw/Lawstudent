// 經濟系休學退宿以後，快速前往不能去校內：NTU_ZONES 要包含快速前往清單裡所有校內區域（BB 2026-11-02 P3：漏了 gym）。用法：node tests/ntu_zones_gym_unit.js
// 修改前：1 FAIL。
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), m=g.match(/const NTU_ZONES=\[([^\]]*)\]/);
const Z=m?m[1].split(',').map(s=>s.trim().replace(/'/g,'')):[];
const CAMPUS=['campus','classroom','linze','wancai','library_hall','library','lawlib','soclib','dorm','dorm_hall','gym'];   /* places.js quickList 裡在校內的區域 */
check('1. NTU_ZONES 包含快速前往清單裡所有校內區域（含新體育館 gym）',CAMPUS.every(z=>Z.includes(z)),'缺 '+CAMPUS.filter(z=>!Z.includes(z)).join(','));
check('2. 校外的（公館、溫州街、118 巷、Café、便利商店、麵店、書店）不在 NTU_ZONES',['gongguan','wenzhou','lane118','cafe','cvs','noodle','bookstore'].every(z=>!Z.includes(z)));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
