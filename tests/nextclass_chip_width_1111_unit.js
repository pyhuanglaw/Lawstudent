// 左上「今天的課」chip（#nextClass）不撐到整欄寬（CC 11-11 20:12 N1_TSR_DORM_ab；LAWWW 判＝版面問題）——不需要瀏覽器（D131）。
// CC：宿舍長桌椅子點了開手機「今天」頁——#nextClass 文字只有「今天的課都結束了」8 個字，框卻 506 px 寬（#hud 是直排 flex，
// 子元素預設 align-items:stretch＝跟著最寬的 #goal 撐到 60vw）。#hud 裡只有它能點（pointer-events:auto），畫面上方一大半的點擊會被它接走
// （Chromium 觸控吸附把 chip 下緣 8 px 的點也吸過去；iPhone 沒驗，Playwright≠iPhone）。
// 修法：#nextClass align-self:flex-start＝框只跟字一樣寬（上限照舊 60vw／直向照舊算）。其他 chip 不能點、照舊。
// 檢查（index.html 的 CSS；實際寬度由 CC 在瀏覽器量）：
//   1. #hud 是直排 flex、pointer-events:none
//   2. #nextClass 有 align-self:flex-start；max-width、nowrap、pointer-events:auto 照舊
//   3. #hud 裡能點的只有 #nextClass（clock、goal、guide 沒有 pointer-events:auto）
// 修改前（ab282014a）：第 2 項 FAIL。用法：node tests/nextclass_chip_width_1111_unit.js
const fs=require('fs'), path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8'); let fail=0;
const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'　'+(info||''))); if(!ok) fail++; };
const rule=sel=>{ const re=new RegExp('(^|[}\\s])'+sel.replace('#','\\#')+'\\{([^}]*)\\}','m'); const m=html.match(re); return m?m[2]:null; };
const hud=rule('#hud'), nc=rule('#nextClass');
check('1. #hud 直排 flex、pointer-events:none',!!hud&&/display:flex/.test(hud)&&/flex-direction:column/.test(hud)&&/pointer-events:none/.test(hud),hud);
check('2. #nextClass align-self:flex-start（框跟字一樣寬，不跟著 #goal 撐開）',!!nc&&/align-self:flex-start/.test(nc),nc);
check('2. #nextClass 其他照舊：max-width:60vw、nowrap、省略號、pointer-events:auto',!!nc&&/max-width:60vw/.test(nc)&&/white-space:nowrap/.test(nc)&&/text-overflow:ellipsis/.test(nc)&&/pointer-events:auto/.test(nc),nc);
const m=html.match(/<div id="hud">([\s\S]*?)<\/div>\s*<div id="hudR">/); const ids=m?[...m[1].matchAll(/id="([^"]+)"/g)].map(x=>x[1]):[];
const clickable=ids.filter(id=>{ const r=rule('#'+id); return r&&/pointer-events:auto/.test(r); });
check('3. #hud 裡能點的只有 #nextClass',ids.includes('nextClass')&&ids.includes('goal')&&ids.includes('clock')&&JSON.stringify(clickable)===JSON.stringify(['nextClass']),JSON.stringify({ids,clickable}));
console.log(fail?('有 '+fail+' 項失敗'):'ALL PASS'); process.exit(fail?1:0);
