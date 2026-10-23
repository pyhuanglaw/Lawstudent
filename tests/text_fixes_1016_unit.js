/* 2026-10-16 第①級文字修正（BB-B 法律審查第 20 批 c36de340、BB_149 第 3 節店名建議、AA-B 公園旁白定稿）：
   店名諧音（清葉茶行、日日便利）、溫學姊的大專生計畫「二月要交」、阿凱的機車問題「可以請警察來看」、物權第 3 週「買房子要登記」。
   node tests/text_fixes_1016_unit.js */
const fs=require('fs'), path=require('path'), ROOT=path.join(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok||!info?'':'  → '+info)); if(!ok) fails++; };
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const src=['src/zones3d.js','src/data/dorm_room_layout.js','src/story3d.js','src/data/places.js','src/data/events.js','src/data/invites.js','src/data/syllabus.js'].map(rd).join('\n');
check('1. 店名：公館的茶行叫「清葉茶行」，便利商店叫「日日便利」（招牌、地點名稱、快速移動；和溫州街的「日日便利」同一家連鎖）；舊名不再出現',!/青葉茶行|全日便利商店/.test(src)&&rd('src/zones3d.js').includes("{n:'日日便利'")&&rd('src/zones3d.js').includes("name:'日日便利', indoor")&&(rd('src/data/places.js').match(/日日便利/g)||[]).length===2&&/counter\(GM,'清葉茶行'/.test(rd('src/story3d.js')));
check('2. 讀書會（ev_studygroup_wed）：溫學姊「……我二月要交大專生研究計畫。你們大三就會知道那是什麼東西。」',rd('src/data/events.js').includes('……我二月要交大專生研究計畫。你們大三就會知道那是什麼東西。')&&!rd('src/data/events.js').includes('下週要交大專生'));
check('3. 阿凱問機車擋騎樓：選項「不一定是告，可以請警察來看」、回「喔，所以告跟叫警察不一樣。好，我學到了。」（BB_172 K2 改字）',rd('src/data/invites.js').includes("{t:'不一定是告，可以請警察來看',r:['「喔，所以告跟叫警察不一樣。好，我學到了。」']}")&&!/可以檢舉，不一定是告/.test(src));
check('4. 物權第 3 週：「在台灣，買房子要登記才算你的。」（民法 §758 依法律行為取得）',rd('src/data/syllabus.js').includes('在台灣，買房子要登記才算你的。')&&!rd('src/data/syllabus.js').includes('在台灣，房子要登記才算你的。'));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
