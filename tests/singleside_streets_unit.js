// 溫州街、118 巷街景 GLB 的大面改單面（PERF-SINGLESIDE-GLB-1025 第三份，LAWWW2-B 2026-10-25）——不需要瀏覽器，讀 GLB。
//   同一頁量：整條街全部改單面上限 +11%（溫州街）、+15%（118 巷）；但葉片、鐵窗、招牌這些開口的零件補反面以後好處就沒了（公館 ④ 試過）。
//   這一份只把「大面、背面看不到」的材質改單面（店內的貨、店內牆、牆面磁磚／馬賽克／粉刷、騎樓柱、地面的牆腳、亮著的房間），不補反面、幾何不動：
//   1. 這幾個材質單面（溫州街 9 個、118 巷 7 個；11-07 PERF-WZ-SHADERS 加價目牌 wz_in_price_u、黑板 wz_in_board_u：正面朝店面玻璃（街），和 wz_in_goods 同一個 shader）；
//   2. 其他材質照舊雙面（原本就單面的 wz_stain 除外）——葉片、鐵窗、招牌、遮雨棚、電線這些兩面都看得到；
//   3. 三角形數和改前一樣（135,522、63,826；溫州街 2026-11-04 阿德影印 v2.1（LAWWW2-C ADE-V2.1-1104，BB_255 的 1～5：三台影印機做出紙匣、出紙口、送紙器、操作面板、裝訂出紙器；門口白瓷高盆、水泥盆；樓上每扇鐵窗四盆、多曬衣服；拿掉懸在玻璃前面的電錶箱；材質、大面不變）133,335→135,522；溫州街 2026-11-04 阿德影印 v2 照參考圖（LAWWW2-C ADE-V2-1104：外牆換 ambientCG 暖米色小方磚 wz_wall_tile_sq＝大面材質 9→10、店內影印機層架、Poly Haven 冷氣／合果芋／多肉、鵝頸燈、鐵窗盆栽；材質 46→53）123,731→133,335；溫州街 2026-11-04 帝大紅茶、冰菓室兩盞店內吊燈輪廓改正（LAWWW2-C LAMPSHADE-FLIP-1104：裡外相反→朝外，吊燈本身三角形數不變；重匯時刪底面那一步差 6 個）123,737→123,731；溫州街 2026-11-04 lane_east 第二次減面（LAWWW2-C LANEEAST-TRIS2-1104：店裡隔著玻璃的東西背對街道的面刪掉 −5,104；整條街的四種大材質照 x 切四段，三角形數不變）128,837→123,737；溫州街 2026-11-04 小路深色木立面 v1（LAWWW2 188eb0624：雨遮常春藤 +1 材質）127,303→128,837、材質 45→46；溫州街 2026-11-04 lane_east 減面（LAWWW2 1d64f3511：店內按店拆網格、阿忠鮮果水果 7×4→5×3 段）131,615→127,303；溫州街 2026-11-04 SUNNY SIDE 東側轉角落地窗＋條紋雨遮＋窗後景深卡 131,261→131,615、網格 69／材質 45 不變（LAWWW2 3de4ef933／1e5aadb33）；溫州街 2026-11-04 WZ-SECOND-1104 v3b（LAWWW2 3c613fe8c 櫥窗減面 146,919→131,261、材質 44→45）；v3（LAWWW2 7cbbecbb1：第二批五間外觀與櫥窗照參考圖、第一批四間招牌雨遮）94,809→146,919、材質 46→44；溫州街 2026-11-04 日常失速 W2 外觀 +1,428 面、材質 44→46（LAWWW2 82d541853）；之前木曜日 B4 外觀：拿掉 F4、加樓梯間與木招牌 PLATE_FACE_mok_B4＝FACE 5，LAWWW2 50c1b0681 README 寫明 93,881→93,381）：沒有補反面、沒有少東西；
//   4. 遊戲照名字找的 FACE 節點（招牌、店內的面）都在（4、45 個）；材質數一樣（44、33）。
// 修改前 FAIL。用法：node tests/singleside_streets_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
function load(n){ const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/'+n+'.glb')), jl=b.readUInt32LE(12); return JSON.parse(b.slice(20,20+jl).toString('utf8')); }
const BIG=/^(wz_in_goods|wz_in_price_u|wz_in_board_u|wz_in_shop|wz_wall_|wz_in_tiles_|wz_room_lit|wz_pillar_|wz_ground_wall)/;
/* 2026-11-11 LAWWW（BB_341 街景四項 a60902c2a、室內第 3 版玻璃後重產 5f450b726）：lane118_street 三角形 74,492 → 68,876（玻璃後面不再用舊店型的店內）→ 69,586（四間前 2.6 m 照第 3 版的桌椅）；大面材質 9 → 8 個：舊店內的貨架材質 wz_in_goods 跟著舊店內一起拿掉了（玻璃後換成新室內的算圖），其他 8 個照舊單面。舊期望 big 9、tris 74,492 */
const W={wenzhou_street:{big:11,tris:129050,face:5,mats:49},   /* SHOP-REAL-INSIDE 溫州街（LAWWW2-C 11-12）：日常失速不再嵌烘光的店內（−2 萬三角形、2 個材質）、SUNNY SIDE／小路的簡化店內拿掉（黑板材質 wz_in_board_u 跟著沒有）：157,859→129,050、材質 52→49、大面材質 12→11 */     /* 11-07 PERF-WZ-DC-1107（LAWWW2-B）：五個頂點色材質合成兩個打包材質（55 → 52；三角形數不變），tests/wz_vc_pack_unit.js */   /* 溫州街 11-07 #167 日常失速店內第二版（LAWWW2-B）：店內 21,808 → 18,771（街上看不到的面拿掉）。11-07 SHOP-WINDOW-2D-1105（LAWWW2-B）：日常失速玻璃後面換成立體店內 offbeat_storefront（+22,602 三角形、+2 材質：烘好燈光的店內、葉子），原本 135,522／53 */ lane118_street:{big:8,tris:69586,face:20,mats:33}   /* 11-11 第二批：兩間飲料店照參考圖（72,452 → 74,492）｜11-11 L118-SHOPS-REDO-1111 第 1 版第一批（LAWWW2，使用者 X338）：九間店照參考圖換外觀＋兩間外帶飲料店——三角形 63,826 → 72,452（保溫櫃、窯爐、外帶櫃台、海報）；FACE 45 → 20（十一間的招牌改成貼圖，不再留 SIGN_FACE／VSIGN_FACE；剩下的是填空小店和樓上住戶的直招牌）；材質數一樣 33 */};
for(const [n,want] of Object.entries(W)){ const J=load(n), M=J.materials;
  const big=M.filter(m=>BIG.test(m.name)), bigDs=big.filter(m=>m.doubleSided).map(m=>m.name);
  check('1. '+n+'：大面的材質單面（'+want.big+' 個）', big.length===want.big&&!bigDs.length, bigDs.length?'還是雙面：'+bigDs.join(' '):big.map(m=>m.name).join(' '));
  const other=M.filter(m=>!BIG.test(m.name)&&m.name!=='wz_stain'), oneS=other.filter(m=>!m.doubleSided).map(m=>m.name);
  check('2. '+n+'：其他材質照舊雙面（'+other.length+' 個；葉片、鐵窗、招牌、遮雨棚…）', !oneS.length, oneS.length?'變單面：'+oneS.join(' '):'');
  let t=0; for(const m of J.meshes) for(const p of m.primitives) t+=(p.indices!=null?J.accessors[p.indices].count:J.accessors[p.attributes.POSITION].count)/3;
  check('3. '+n+'：三角形數和改前一樣（'+want.tris.toLocaleString('en')+'）', t===want.tris, t.toLocaleString('en'));
  const face=J.nodes.filter(x=>/FACE/.test(x.name||'')).length;
  check('4. '+n+'：FACE 節點 '+want.face+' 個、材質 '+want.mats+' 個', face===want.face&&M.length===want.mats, 'FACE '+face+'、材質 '+M.length); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
