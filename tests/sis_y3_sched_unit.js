// 學姊大三起的平日作息（BB_206 第 2 節、AA_259 (b) 第 3 點）：研究室、下午法圖，不在總圖三樓——不需要瀏覽器。
//   1 大三起（2027-09～）：週一～週四 9:00～14:00 研究室（linze_5f、sis_desk；12:20～14:00 是 AA_399 那一筆）、14:00～17:00 法圖；週五 9:00～17:00 法圖
//   1b 2028-02～2029-05 平日 14:00～17:00 研究小間 03（AA_399 3-1，lupstory3d.js 放人）：作息不排；17:00～17:30 總圖門口
//   2 大二以前照舊總圖；出國前最後一天（2028-07-31，AA_392）照舊總圖三樓；美國期間不在；口試那天（2029-05-29）照舊；2029-07 起上班不在校園
//   3 和邀約、研究室的門對得上：大三起約總圖＝「我在法圖。五點以後過去找你。」；研究室有人的時段（LAB5.labNow）
// 修改前（開發分支 43d549914）：15 項裡 9 項 FAIL（第 1 節的研究室、法圖、研究小間、總圖門口，第 3 節的研究室）。用法：node tests/sis_y3_sched_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check}=H, J=JSON.stringify, SIS='heroine_05';
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const at=(key,h)=>{ H.fresh(key,h,'campus'); const e=STORY.schedEnt(CHARACTERS[SIS],H.G), p=STORY.presence(SIS,H.G); return {zone:e?e.zone:null,spot:e&&e.spot||null,away:e&&e.away||null,here:p.here!==false}; };
const Z=(key,h)=>at(key,h).zone;

(async()=>{
await sec(1,()=>{
  check('1. 大三上週三（2027-10-13）10:00：研究室（linze_5f、sis_desk）',J(at('2027-10-13',10))===J({zone:'linze_5f',spot:'sis_desk',away:null,here:true}),J(at('2027-10-13',10)));
  check('1. 同一天 13:00 研究室（AA_399）、15:00 法圖、17:30 不是法圖那一筆',Z('2027-10-13',13)==='linze_5f'&&Z('2027-10-13',15)==='lawlib'&&Z('2027-10-13',17.5)!=='lawlib',J([Z('2027-10-13',13),Z('2027-10-13',15),Z('2027-10-13',17.5)]));
  check('1. 週五（2027-10-15）早上、下午都在法圖（週五不在研究室，照 AA_399）',Z('2027-10-15',10)==='lawlib'&&Z('2027-10-15',13)==='lawlib',J([Z('2027-10-15',10),Z('2027-10-15',13)]));
  check('1. 碩三（2029-05-24 週四）10:00 研究室；2029-06-12 研究室結束、平日在法圖（研究小間也結束）',Z('2029-05-24',10)==='linze_5f'&&Z('2029-06-12',10)==='lawlib'&&Z('2029-06-12',15)==='lawlib',J([Z('2029-05-24',10),Z('2029-06-12',10),Z('2029-06-12',15)]));
  /* AA_399 3-1：2028-02～2029-05 平日 14:00～17:00 在總圖研究小間 03（src/lupstory3d.js 放人），作息這段不排、也不排在別的地方；17:00～17:30 在總圖門口 */
  check('1. 研究小間那段（2028-03-15 週三 14:30、16:30；2028-02-04 週五 15:00；2029-05-24 週四 15:00）：作息不排任何地方',[['2028-03-15',14.5],['2028-03-15',16.5],['2028-02-04',15],['2029-05-24',15]].every(([k,h])=>Z(k,h)===null),J([Z('2028-03-15',14.5),Z('2028-02-04',15)]));
  { const d=at('2028-03-15',17.1); H.fresh('2028-03-15',17.1,'campus'); const e=STORY.schedEnt(CHARACTERS[SIS],H.G);
    check('1. 17:00～17:30 在總圖門口（campus，大一上第一次見面的台階那個位置），17:30 以後不是這一筆',d.zone==='campus'&&!!e&&J(e.at)===J([83,3,-Math.PI/2])&&Z('2028-03-15',17.6)!=='campus',J([d,e&&e.at])); }
  check('1. 研究小間開始以前（2028-01-26 週三 15:00）照法圖；同一段期間週五早上（2028-02-04 10:00）也是法圖',Z('2028-01-26',15)==='lawlib'&&Z('2028-02-04',10)==='lawlib');
  check('1. 大三起平日白天不在總圖',['2027-10-13','2027-10-15','2028-03-16','2028-11-30'].every(k=>[9.5,11,13,15,16.5].every(h=>Z(k,h)!=='library'))); });

await sec(2,()=>{
  check('2. 大二以前照舊總圖（2026-10-14 10:00、2027-03-17 15:00、大三前的暑假 2027-07-14）',Z('2026-10-14',10)==='library'&&Z('2027-03-17',15)==='library'&&Z('2027-07-14',10)==='library');
  check('2. 出國前最後一天（2028-07-31，AA_392 第 7 節）照舊總圖三樓',Z('2028-07-31',11)==='library');
  check('2. 美國期間（2028-09-14）不在',at('2028-09-14',10).here===false);
  check('2. 口試那天（2029-05-29）照舊是口試那一筆',at('2029-05-29',10).away==='口試（法律系館A的研究室）');
  check('2. 2029-07 起上班，平日白天不在校園',Z('2029-07-10',10)===null); });

await sec(3,()=>{
  H.fresh('2027-10-13',10,'campus'); H.FRIEND(SIS); const r=INV.personal(H.G,SIS,INV.place('library'),H.G.day,10,{res:'accept'});
  check('3. 大三起約總圖：「我在法圖。五點以後過去找你。」（AA_259 (b) 第 3 點）',r.res==='resched'&&J(r.lines)===J(['「我在法圖。五點以後過去找你。」']),J(r));
  const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (LAB5)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
  if(typeof LAB5==='undefined') load('src/lab5f3d.js');
  const lab=(k,h)=>{ H.fresh(k,h,'campus'); return LAB5.labNow(H.G); };
  check('3. 研究室有人：大三起週一～週四早上也在（2027-10-13 10:00），週五不在；碩一照舊只有 12:20～14:00（2026-09-22 10:00 不在）',lab('2027-10-13',10)===true&&lab('2027-10-15',10)===false&&lab('2026-09-22',10)===false&&lab('2026-09-22',12.5)===true); });

H.done();
})();
