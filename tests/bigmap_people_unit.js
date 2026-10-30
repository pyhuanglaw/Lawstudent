// 大地圖的「認識的人現在大概在」蓋住地圖（BB-B 10-30 n15 觀察：直向蓋住大半張、共同教學館蓋住「★ 102」、寬螢幕蓋住農業陳列館；要按 👥 才收得起來）——不需要瀏覽器。
//   改成：打開地圖預設收起；自由的日子（原本自動打開的時候）👥 亮一個點；玩家自己按 👥 打開過＝之後打開地圖照樣展開（st.who）。
// 修改前：沒有 whoShow、自由的日子一打開地圖就展開（第 0 項 FAIL）。用法：node tests/bigmap_people_unit.js
const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','src/guide3d.js'),'utf8'), html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const m=src.match(/\n  function whoShow\(who,goal,goalDest\)\{[^\n]*\n/);
check('0. guide3d.js 有 whoShow；openMap 照它決定展開、👥 的點；按 👥 記住 st.who',!!m&&/const w=whoShow\(st\.who,GM\.G\.goal,GM\.G\.goalDest\); \$\('bmPeople'\)\.classList\.toggle\('hide',!w\.show\)/.test(src)&&/st\.who=!el\.classList\.contains\('hide'\)/.test(src)&&!/toggle\('hide',!\(\/自由\//.test(src));
check('0. index.html：👥 的提示點（#bmWho.hot）',/#bmWho\.hot::after\{/.test(html)&&/#bmWho\{position:relative\}/.test(html));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const whoShow=new Function(m[0]+'; return whoShow;')();
const J=o=>JSON.stringify(o);
check('1. 自由的日子、第一次打開：收起、👥 亮點',J(whoShow(undefined,'自由活動',null))==='{"show":false,"hot":true}',J(whoShow(undefined,'自由活動',null)));
check('2. 沒有目的地（沒有目標）：收起、👥 亮點',J(whoShow(undefined,'',null))==='{"show":false,"hot":true}');
check('3. 有目標、有目的地（去上課）：收起、不亮',J(whoShow(undefined,'去共同教學館上課',{zone:'campus'}))==='{"show":false,"hot":false}');
check('4. 玩家按 👥 打開過：之後打開地圖照樣展開、不亮（有目標也展開）',J(whoShow(true,'自由活動',null))==='{"show":true,"hot":false}'&&J(whoShow(true,'去上課',{zone:'campus'}))==='{"show":true,"hot":false}');
check('5. 玩家按 👥 收起來：之後照樣收起；自由的日子還是亮點',J(whoShow(false,'自由活動',null))==='{"show":false,"hot":true}'&&J(whoShow(false,'去上課',{zone:'campus'}))==='{"show":false,"hot":false}');
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
