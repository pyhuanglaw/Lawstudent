// 點地面走過去以後，互動範圍重疊時以「點的位置」為準（engine3d.js P.tapPref＋nearestInteractable）——不需要瀏覽器。
//   起因：BB-C 10-28 v9.10.12 rc3 flow_main_day12：大一宿舍點床走過去，人停在床底下紙箱那一側（紙箱 (-1.55,0.628) 半徑 0.45、睡覺 (-1.55,1.165) 半徑 0.9），
//   按鈕是「床底下的紙箱」不是「睡覺」（床的範圍裡站得住的點約兩成是紙箱；v9.10.11 就這樣）。
//   1 點床走過來：停在紙箱旁邊也是「睡覺」  2 沒點（推搖桿走過來）：照舊取離人最近的（紙箱）  3 點在紙箱上：紙箱
//   4 點的位置在別的區域／別的樓層：不算  5 點的位置不在任何範圍裡：照舊  6 推搖桿會清掉點的位置；點地面會記下來（原始碼）  7 l118 的正規表示式照舊抓得到（結尾 return best; };）
// 修改前（開發分支 6a91f4c04）：第 1、6 項 FAIL。用法：node tests/tap_pref_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const eng=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8');
const m=eng.match(/E\.nearestInteractable=function\(\)\{[\s\S]*?return best; \};/);
check('7. engine3d.js 找得到 nearestInteractable（結尾 return best; };）',!!m);
const BOX={x:-1.55,z:0.628,radius:0.45,lv:0,label:'床底下的紙箱'}, BED={x:-1.55,z:1.165,radius:0.9,label:'睡覺'};
const pick=(px,pz,tapPref,zone,lv)=>{ const E={levels:null,zone:{id:zone||'dorm'},player:{lv:lv|0,obj:{position:{x:px,y:0,z:pz}},tapPref},interactables:[BOX,BED],npcs:[]}; vm.runInNewContext(m[0],{E,Math}); const r=E.nearestInteractable(); return r&&r.label; };
if(m){
  const stop=[-1.65,0.6];   /* BB 量到的那一排：x -1.65、z 0.37～0.86，紙箱比較近 */
  check('1. 點床（床的位置）走過來、停在紙箱旁邊：按鈕是「睡覺」',pick(stop[0],stop[1],{x:-1.55,z:1.3,lv:0,zone:'dorm'})==='睡覺');
  check('2. 推搖桿走過來（沒有點的位置）：照舊取離人最近的＝紙箱',pick(stop[0],stop[1],null)==='床底下的紙箱');
  check('3. 點在紙箱上走過來：紙箱',pick(stop[0],stop[1],{x:-1.55,z:0.62,lv:0,zone:'dorm'})==='床底下的紙箱');
  check('4. 點的位置是別的區域、別的樓層的：不算（照舊紙箱）',pick(stop[0],stop[1],{x:-1.55,z:1.3,lv:0,zone:'campus'})==='床底下的紙箱'&&pick(stop[0],stop[1],{x:-1.55,z:1.3,lv:1,zone:'dorm'})==='床底下的紙箱');
  check('5. 點的位置不在任何範圍裡（點了很遠的地方又停在這裡）：照舊紙箱',pick(stop[0],stop[1],{x:3,z:3,lv:0,zone:'dorm'})==='床底下的紙箱');
  check('5. 點床、但人走到只在紙箱範圍、不在床範圍的地方：紙箱（點的那一個不在人的範圍裡就不算）',pick(-1.55,0.2,{x:-1.55,z:1.3,lv:0,zone:'dorm'})==='床底下的紙箱');
}
check('6. 推搖桿（E.cam.ctl）會清掉點的位置；點地面 moveTo 以後記下點的位置（原始碼）',/if\(!E\.cam\.ctl\) E\.cam\.swingAcc=0; else P\.tapPref=null;/.test(eng)&&/E\.moveTo\(P,tx,tz,null,tlv\); P\.tapPref=\{x:hit\.x,z:hit\.z,/.test(eng));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
