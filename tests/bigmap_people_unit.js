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
// 6～7：同一批 BB-B 觀察（AA_541 第 7 節）：寬螢幕大地圖「總圖書館」被人名標籤蓋住；HUD 目標那一行直向、橫向都被截。修改前 FAIL。
check('6. 大地圖人名標籤先問 free（會蓋住已經畫的地名、門口就只留點）',/const tw=x\.measureText\(n\.name\)\.width; if\(free\(u\+7\+tw\/2,w,tw,14\)\)\{/.test(src));
{ const g=(html.match(/#goal\{font-size:12px;[^}]*\}/)||[''])[0];
  check('7. HUD 目標最多兩行（-webkit-line-clamp:2、white-space:normal），不再一行截斷',/-webkit-line-clamp:2/.test(g)&&/white-space:normal/.test(g)&&!/nowrap/.test(g),g); }
/* MAP-FRIEND-GO-1103（使用者 11-03 22:5x：「我希望地圖上看到朋友在那邊可以選直接過去」）：大地圖「認識的人現在大概在」每一行，能直接過去的多一個「直接過去（約 N 分鐘）」，按下去關地圖、和手機「朋友」同一套（friendGo＋quickGo） */
{ const g=fs.readFileSync(path.join(__dirname,'..','src/game3d.js'),'utf8');
  check('F1. 大地圖的人：GM.friendGoInfo 可以過去＝「直接過去（約 N 分鐘）」按鈕（data-fgo），「帶我去」照留',/GM\.friendGoInfo&&GM\.friendGoInfo\(q\.id\)/.test(src)&&/data-fgo="'\+q\.id\+'">直接過去/.test(src)&&/data-find="'\+q\.id\+'">帶我去/.test(src));
  check('F2. 按「直接過去」：先關地圖，再 GM.friendGoNow',/data-fgo\]'\)\.forEach\(b=>b\.onclick=async\(\)=>\{ closeMap\(\); if\(GM\.friendGoNow\) await GM\.friendGoNow\(b\.dataset\.fgo\)/.test(src));
  check('F3. game3d.js：friendGoInfo／friendGoNow 和手機「朋友」同一套（friendGo、quickGo force、到了 goFollow；不能過去寫原因）',/GM\.friendGoInfo=id=>\{[^\n]*friendGo\(id,[^\n]*placeState\(fg\.pl\)/.test(g)&&/GM\.friendGoNow=async id=>\{[^\n]*await quickGo\(fg\.pl,\{force:true\}\); goFollow\(id\)[^\n]*不能直接過去：/.test(g)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
