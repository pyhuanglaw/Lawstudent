// 日誌寫那天約了誰、和誰約會（JOURNAL-DATES-1105；使用者 2026-11-05 09:0x「日誌都沒有寫我當天約了誰 跟誰約會 像是我10.22跟學姊有約 10.21約了沈以安 都沒有寫 這很重要欸」）。
//   用使用者的存檔（tests/fixtures/user_save_day37_1105.json：10/21 和沈以安羽球、10/22 和溫書瑀總圖＋afar；9/25 可昕校外一日遊）跑 src/journal3d.js。
//   修改前：日誌只讀 G.memo，那兩天的格子沒有約會（FAIL）；修改後 ALL PASS。用法：node tests/journal_dates_unit.js
'use strict';
const H=require('./pg_harness.js'); const fs=require('fs'), path=require('path'), vm=require('vm'); const {check}=H, J=JSON.stringify;
const jf=path.join(H.ROOT,'src/journal3d.js'); vm.runInThisContext(fs.readFileSync(jf,'utf8').replace(/^const JOURNAL\s*=/m,'globalThis.JOURNAL='),{filename:jf});
(async()=>{
  const SV=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/user_save_day37_1105.json'),'utf8'));
  H.fresh('2025-10-22',20,'dorm',{}); const G=H.G; G.memo=SV.memo; G.invites=SV.invites; G.trips=SV.trips; G.social=SV.social; G.rel=SV.rel; G.flags=Object.assign(G.flags||{},SV.flags);   /* 人名照存檔裡的關係（顯示名）*/
  const JR=JOURNAL, txt=day=>(JR.byDay(G)[day]||[]).map(e=>e.t);
  const d35=SV.invites.find(i=>i.id==='iv24').day, d36=SV.invites.find(i=>i.id==='iv26').day;
  check('1. 10/21（'+JR.label(d35)+'）那一格寫「和沈以安約在新體育館羽球場」（前面有時間）',txt(d35).some(t=>/^\d\d:\d\d 和(沈以安|以安|小安)約在新體育館羽球場$/.test(t)),J(txt(d35)));
  check('2. 10/22（'+JR.label(d36)+'）那一格寫和溫書瑀的兩個約（總圖、afar café），照時間排、排在其他紀錄前面',(()=>{ const L=txt(d36); const a=L.findIndex(t=>/和.+約在總圖/.test(t)), b=L.findIndex(t=>/和.+約在 afar café/.test(t)); return a===0&&b===1; })(),J(txt(d36)));
  check('3. 沒去的約寫「（沒有赴約）」；取消的不列',txt(SV.invites.find(i=>i.id==='iv10').day).some(t=>/和.+約在總圖（沒有赴約）/.test(t))&&!txt(SV.invites.find(i=>i.id==='iv6').day).some(t=>/20:47/.test(t)),J(txt(13)));
  const tr=SV.trips[0]; check('4. 校外約會（trips）也寫：「和可昕出去玩：地點」',txt(tr.day).some(t=>/和.+出去玩/.test(t)),J(txt(tr.day)));
  check('5. 查詢打「afar」查得到約會；店名英文前面空一格（AA-C 07:22）',JR.search(G,'afar').some(e=>/約在 afar café/.test(e.t)));
  check('6. 人名用現在的顯示名（SOCIAL.displayName；AA-C 07:22：日誌是祐廷自己寫的）',txt(d36).some(t=>t.includes('和'+SOCIAL.displayName('heroine_05')+'約在')),J([SOCIAL.displayName('heroine_05'),txt(d36)]));
  console.log(H.fails?('FAILED '+H.fails):'ALL PASS'); process.exit(H.fails?1:0);
})().catch(e=>{ console.log('ERR',e.stack); process.exit(1); });
