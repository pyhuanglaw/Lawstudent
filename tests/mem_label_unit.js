// 人物面板的記憶不印程式代號（MEM-LABEL-RAW-1110，使用者 2026-11-10 截圖：以安的面板寫「10/31 LAWLIB_TOGETHER（法律學院圖書館）」「11/2 SHOP_CAFE_AN」「11/3 MOVIE_TOGETHER」）——不需要瀏覽器（D131）。
//   1 約的地點（INVITE_DATA.places 的 memory）每一個都有中文名稱
//   2 店裡碰到（shop_enc.js 的 memo，SHOP_ 開頭）：SOCIAL.memLabel 寫「在店裡碰到」，不是代號
//   3 沒登記的：「一段回憶」；game3d.js 兩個顯示的地方（朋友清單、人物面板）都走 SOCIAL.memLabel
// 修改前 1、2、3 FAIL。用法：node tests/mem_label_unit.js
const H=require('./pg_harness.js'); const {check}=H; const J=JSON.stringify; const fs=require('fs'), path=require('path');
const L=SOCIAL.MEMORY_LABEL, miss=INVITE_DATA.places.filter(p=>p.memory&&!L[p.memory]).map(p=>p.memory+'('+p.id+')');
check('1. 約的地點的記憶都有中文名稱',!miss.length,J(miss));
const shop=[...fs.readFileSync(path.join(H.ROOT,'src/data/shop_enc.js'),'utf8').matchAll(/"memo":\s*"([A-Z0-9_]+)"/g)].map(m=>m[1]);
check('2. 店裡碰到（'+shop.length+' 個 SHOP_）：寫中文、不是代號',typeof SOCIAL.memLabel==='function'&&shop.length>=10&&shop.every(t=>{ const s=SOCIAL.memLabel(t); return s&&s!==t&&!/[A-Z_]{4,}/.test(s); }),J(shop.slice(0,3).map(t=>[t,SOCIAL.memLabel&&SOCIAL.memLabel(t)])));
const g=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
check('3. 沒登記的寫「一段回憶」；game3d.js 兩處都走 SOCIAL.memLabel',typeof SOCIAL.memLabel==='function'&&SOCIAL.memLabel('ZZ_NOT_A_TAG')==='一段回憶'&&(g.match(/SOCIAL\.memLabel\?SOCIAL\.memLabel\(m\.tag\)/g)||[]).length===2);
H.done();
