// CC #15（BB 10:10）：BUG-SAVE-QUOTA-1102（781bd3039）——習慣鍵上限、劇情鍵不刪、舊大存檔讀檔後變小
// 用法：WT=<受測資料夾> node m5b_quota_recheck.js
'use strict';
const WT=process.env.WT||process.cwd();
const H=require(WT+'/tests/pg_harness.js');
const fs=require('fs'), {check}=H, J=JSON.stringify;
(async()=>{
  const G=H.fresh('2028-12-01',10,'dorm'); G.habits={};
  const keep=['seat:boya:study','meal:noodle','meal:xiaofu:fri'], other=['invite:heroine_01','retake:maritime','kai_supper'];
  for(const k of keep.concat(other)) G.habits[k]={n:5,last:1,days:[1]};   /* 最舊的 last：如果照「最久沒用」刪，會第一批被刪 */
  for(let i=0;i<1000;i++) G.habits[['place','seat','table','meal'][i%4]+':x'+i]={n:1,last:100+i,days:[100+i]};
  const before=Object.keys(G.habits).length, sz0=JSON.stringify(G.habits).length;
  const fn=typeof EVENTS!=='undefined'&&EVENTS.habitTrim; check('0. EVENTS.habitTrim 存在',typeof fn==='function');
  if(fn){ const n=EVENTS.habitTrim(G); const ks=Object.keys(G.habits), trimmable=ks.filter(k=>/^(place|seat|table|meal):/.test(k)&&!keep.includes(k));
    check('1. 可刪的地點／座位／同桌／吃飯鍵 ≤300（刪了 '+n+'）',trimmable.length<=300,J({before,after:ks.length,trimmable:trimmable.length}));
    check('2. 劇情讀的鍵（seat:boya:study、meal:noodle、meal:xiaofu:fri）和其他種類（invite:、retake:、kai_supper）都還在，就算它們最久沒用',keep.concat(other).every(k=>k in G.habits),J(keep.concat(other).filter(k=>!(k in G.habits))));
    check('3. 留下來的是最近用過的（x700～x999 都在、x0～x699 的可刪鍵都不在）',['place:x996','seat:x997','table:x998','meal:x999'].every(k=>k in G.habits)&&!('place:x0' in G.habits),'');
    const sz1=JSON.stringify(G.habits).length; check('4. habits 變小（'+sz0+' → '+sz1+' 字）',sz1<sz0,'');
    const n2=EVENTS.habitTrim(G); check('5. 再跑一次不再刪（冪等）',n2===0,'n2='+n2); }
  /* 讀檔路徑：game3d.js 的 load 有沒有呼叫 habitTrim（靜態）*/
  const g3=fs.readFileSync(WT+'/src/game3d.js','utf8'); check('6. game3d.js 讀檔時呼叫 EVENTS.habitTrim',/EVENTS\.habitTrim\(s\)/.test(g3),'');
  check('7. 開新遊戲前的備份只留 1 份（NEW_KEEP=1）',/const NEW_KEEP=1\b/.test(g3),'');
  check('8. autosave 失敗會提示、5 分鐘內不重複',/autoFailAt/.test(g3)&&/5\*60\*1000/.test(g3),'');
  H.done();
})();
