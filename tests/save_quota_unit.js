// BUG-SAVE-QUOTA-1102（CC M5、BB 10:07）：存檔大小與空間不足——不需要瀏覽器。
//   1. 寫入遇到 QuotaExceededError：GM.saveErr＝'quota'；自動存檔看寫入結果，提示「儲存空間不足」（5 分鐘內不重複、成功就重置）；欄位、快速存檔也用同一句
//   2. 開新遊戲前的備份最多 1 份（NEW_KEEP=1；細節 tests/save_newgame_backup_unit.js）
//   3. 習慣記憶：地點、座位、同桌、吃飯的鍵最多 300 個，刪最久沒用到的；劇情讀的鍵（seat:boya:study、meal:noodle、meal:xiaofu:fri）和其他種類的鍵不刪；舊的大存檔讀檔時減到上限
//   4. 存檔頁：欄位、備份有「刪除」（自動存檔、快速存檔沒有）
// 修改前（7776c53c8）：第 1、3、4 項 FAIL。用法：node tests/save_quota_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const SRC=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
/* 1. 抽 isQuota … autosave 原樣執行 */
const blk=SRC.match(/\n  const isQuota=[\s\S]*?\n  GM\.autosave=autosave;\n/);
check('1. 抽得到 isQuota、write、autosave',!!blk);
if(blk){
  const quotaErr=()=>{ const e=new Error('The quota has been exceeded.'); e.name='QuotaExceededError'; e.code=22; return e; };
  const st={ m:new Map(), mode:'ok', setItem(k,v){ if(this.mode==='quota') throw quotaErr(); if(this.mode==='other') throw new Error('SecurityError'); this.m.set(k,v); }, getItem(k){ return this.m.has(k)?this.m.get(k):null; } };
  const toasts=[]; let clock=1e6;
  const ctx={ GM:{}, G:{day:5}, E:{player:{}}, D:{busyDepth:0}, KEY_AUTO:'fatiao3d_auto', JSON, performance:{now:()=>0}, Date:{now:()=>clock},
    snapshot:()=>({day:5,big:'x'}), toast:(t,ms)=>toasts.push(t), ls:()=>st };
  vm.createContext(ctx); vm.runInContext(blk[0]+'\nthis.write=write; this.autosave=autosave;',ctx);
  st.mode='quota'; let r=ctx.autosave();
  check('1. 空間不足：自動存檔回傳失敗、GM.saveErr＝quota、提示「儲存空間不足」並教玩家刪欄位／備份或匯出',r===false&&ctx.GM.saveErr==='quota'&&toasts.length===1&&/儲存空間不足/.test(toasts[0])&&/刪掉不用的欄位或備份/.test(toasts[0])&&/匯出存檔檔案/.test(toasts[0]),JSON.stringify(toasts));
  clock+=60*1000; ctx.autosave(); check('1. 5 分鐘內再失敗：不重複提示',toasts.length===1,JSON.stringify(toasts.length));
  clock+=5*60*1000; ctx.autosave(); check('1. 超過 5 分鐘還是失敗：再提示一次',toasts.length===2);
  st.mode='ok'; r=ctx.autosave(); check('1. 空出空間以後：存得進去、saveErr 清掉',r===true&&ctx.GM.saveErr===null&&st.m.has('fatiao3d_auto'));
  st.mode='quota'; clock+=1000; ctx.autosave(); check('1. 成功過一次以後再失敗：馬上提示（不等 5 分鐘）',toasts.length===3);
  st.mode='other'; clock+=10*60*1000; ctx.autosave(); check('1. 不是空間不足的失敗：另一句（瀏覽器儲存不可用）',/自動存檔失敗（瀏覽器儲存不可用）/.test(toasts[toasts.length-1]),toasts[toasts.length-1]);
  check('1. 欄位、快速存檔失敗用 GM.saveFailText()（空間不足＝同一句）',/toast\(ok\?'已存到欄位 '\+i:GM\.saveFailText\(\)/.test(SRC)&&/if\(!write\(KEY_QUICK,snapshot\(\)\)\)\{ toast\(GM\.saveFailText\(\),6000\)/.test(SRC));
}
/* 2. */
check('2. 開新遊戲前的備份最多 1 份',/\n  const NEW_KEEP=1, KEY_NEWBK=/.test(SRC));
/* 3. 習慣鍵上限（遊戲真的 EVENTS） */
const H=require('./pg_harness.js');
(async()=>{
  H.fresh('2026-03-02',10,'campus',{});
  const G=H.G; G.habits={}; const KEEP=['seat:boya:study','meal:noodle','meal:xiaofu:fri'];
  for(const k of KEEP) G.habits[k]={n:2,first:1,last:1,days:[1]};
  G.habits['invite:kexin']={n:1,first:1,last:1,days:[1]}; G.habits['retake:study']={n:1,first:1,last:1,days:[1]};
  const d0=G.day; for(let i=0;i<450;i++){ G.day=d0+i; EVENTS.habit('seat:campus:@'+i+',0'); }
  const ks=Object.keys(G.habits), loc=ks.filter(k=>/^(place|seat|table|meal):/.test(k)&&!KEEP.includes(k));
  check('3. 450 個座位鍵：只留 300 個、留的是最近的（@449 在、@0～@149 不在）',loc.length===300&&!!G.habits['seat:campus:@449,0']&&!G.habits['seat:campus:@0,0']&&!G.habits['seat:campus:@149,0']&&!!G.habits['seat:campus:@150,0'],'loc='+loc.length);
  check('3. 劇情讀的鍵、其他種類的鍵都還在',KEEP.every(k=>!!G.habits[k])&&!!G.habits['invite:kexin']&&!!G.habits['retake:study']);
  check('3. EVENTS.habitCount 照常（最近那個鍵 1 次）',EVENTS.habitCount({key:'seat:campus:@449,0'})===1);
  /* 舊的大存檔：讀檔 migrate 先減 */
  const s={habits:{}}; for(let i=0;i<1054;i++) s.habits['place:z'+i+':am']={n:1,first:1,last:i,days:[i]};
  const n=EVENTS.habitTrim(s); check('3. 舊存檔 1,054 個鍵：EVENTS.habitTrim 減到 300（刪 754）',n===754&&Object.keys(s.habits).length===300&&!!s.habits['place:z1053:am']);
  check('3. 讀檔（migrate）會跑 EVENTS.habitTrim',/EVENTS\.habitTrim\(s\)/.test(SRC));
  /* 4. 刪除鈕 */
  check('4. 欄位 1～3 有刪除（delSave）、備份有刪除；自動存檔、快速存檔沒有',/mk\('欄位 '\+i,s,\(\)=>saveSlot\(i\),\(\)=>loadFrom\(s\),null,\(\)=>delSave\(KEY_SLOT\+i,'欄位 '\+i\)\)/.test(SRC)&&/mk\(nm,b,null,\(\)=>loadFrom\(b\),bx,\(\)=>delSave\(k,nm\)\)/.test(SRC)&&/mk\('自動存檔',auto,null,\(\)=>loadFrom\(auto\)\);/.test(SRC)&&/function delSave\(key,label\)\{ if\(typeof confirm==='function'&&!confirm\(/.test(SRC));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
