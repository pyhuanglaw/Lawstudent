// 法律頁：自己讀書讀到的筆記也列（BB-B 11-07 BB_255 CC 試玩第 7 件「總圖自己讀書 2 小時有兩句內容，☰ → 法律還寫還沒上過課」；D118「讀書時顯示學習進度」）——不需要瀏覽器（D131）。
// 檢查：1 還沒上課、讀了民總的 law_154、law_88：法律頁有「自己讀的筆記」兩列，不寫「還沒上過課」；2 什麼都沒讀：照舊「還沒上過課」；
//       3 觀念卡的筆記（<課>_w<週>）、別的筆記（club_law、NOTE_HOLIDAY_WAGE）不列在這裡。修改前 1 FAIL。用法：node tests/legal_selfstudy_unit.js
const H=require('./pg_harness.js'); const {check}=H; const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
const i=src.indexOf('  function renderLegal(){'), j=src.indexOf('  function renderMap(',i);
if(i<0||j<0){ check('0. game3d.js 找得到 renderLegal',false); H.done(); }
const box={innerHTML:'',kids:[],appendChild(d){ this.kids.push(d); }};
global.document={getElementById:()=>null,createElement:()=>({className:'',innerHTML:''}),addEventListener(){}};
const legal={summary:()=>({bySec:{},misc:[]})};
const mk=new Function('CLS','STUDY','LEGAL','$','getG','BOX','let G; '+src.slice(i,j)+'; return ()=>{ G=getG(); BOX.kids=[]; renderLegal(); return BOX.kids.map(d=>d.innerHTML).join("\\n"); };');
const show=()=>mk(typeof CLS!=='undefined'?CLS:undefined,typeof STUDY!=='undefined'?STUDY:undefined,legal,()=>box,()=>H.G,box)();
(async()=>{
  { const G=H.fresh('2025-08-30',15,'library'); G.notes=[{id:'law_154',title:'民法 §154：要約與要約之引誘',body:'x',day:G.day},{id:'law_88',title:'民法 §88：意思表示錯誤',body:'y',day:G.day}];
    const h=show(); check('1. 讀了民總兩份（還沒上課）：「自己讀的筆記」兩列、不寫「還沒上過課」',/自己讀的筆記/.test(h)&&/民法 §154/.test(h)&&/民法 §88/.test(h)&&!/還沒上過課/.test(h),h.slice(0,200)); }
  { const G=H.fresh('2025-08-30',15,'library'); G.notes=[]; const h=show(); check('2. 什麼都沒讀：照舊「還沒上過課」',/還沒上過課/.test(h)&&!/自己讀的筆記/.test(h),h.slice(0,120)); }
  { const G=H.fresh('2025-08-30',15,'library'); G.notes=[{id:'club_law',title:'法律服務社',body:'',day:G.day},{id:'NOTE_HOLIDAY_WAGE',title:'假日工資',body:'',day:G.day}]; const h=show();
    check('3. 別的筆記（社團、打工）不列在「自己讀的筆記」',!/自己讀的筆記/.test(h),h.slice(0,120)); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
