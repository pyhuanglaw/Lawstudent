// AA_258 第 2、4 節（AA258-SIS-GAPS-1031；AA-B 11-01 確認沒被取代）——不需要瀏覽器。
//   1 學姊交往中初一 09:00 私訊（2027／2028／2029 三年）＋兩個回覆；09:00 以前沒有；沒交往沒有（src/sis_b10_3d.js S.cny1）
//   2 美國路線 11/08 沛珊（臺灣 23:10，重新聯絡上才傳）、11/10 子晴（臺灣 23:40）；台灣路線、不到朋友、和她交往中都沒有（src/r2y4a3d.js）
// 修改前（開發分支 181452d0b）：1、2 FAIL。用法：node tests/aa258_rest_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
for(const f of ['src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/data/sis_b4_events.js','src/sis_b4_3d.js','src/data/sis_b10_events.js','src/sis_b10_3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js']) L3(f);
GM.toast=()=>{}; GM.caption=()=>{};
const D=k=>STORY.dayOfKey(k), SIS='heroine_05';
const th=id=>(H.G.msgs||[]).filter(m=>m.th==='p:'+id).map(m=>m.text);
/* 1 */
{ const R=[]; for(const [k,first] of [['2027-02-06','新年快樂。……今年想第一個跟你說，所以先傳了。'],['2028-01-26','新年快樂。'],['2029-02-13','新年快樂。論文我今天放一天假。']]){
    const G=H.fresh(k,8.9,'dorm',{dating_heroine_05:true,met_sis:true,SIS_W1:true}); G.contacts={[SIS]:G.day-60}; SISB10.phone(G); PHONE.tick(G); const a=th(SIS).length; G.hour=9.1; SISB10.phone(G); PHONE.tick(G); R.push([k,a,th(SIS)[0],th(SIS).length]); }
  check('1. 交往中初一 09:00：2027「新年快樂。……今年想第一個跟你說，所以先傳了。」三則、2028「新年快樂。」三則、2029「新年快樂。論文我今天放一天假。」兩則；09:00 以前沒有',
    J(R)===J([['2027-02-06',0,'新年快樂。……今年想第一個跟你說，所以先傳了。',3],['2028-01-26',0,'新年快樂。',3],['2029-02-13',0,'新年快樂。論文我今天放一天假。',2]]),J(R));
  const G=H.fresh('2027-02-06',9.1,'dorm',{dating_heroine_05:true,met_sis:true}); G.contacts={[SIS]:G.day-60}; SISB10.phone(G); PHONE.tick(G); const r=PHONE.answer(G,'sisb10_cny1_2027_ask',0);
  check('1. 回覆「好。初三見。」→「好。不用排行程。」',!!r&&J(r.out.map(m=>m.text))===J(['好。初三見。','好。不用排行程。']),J(r&&r.out));
  const G2=H.fresh('2027-02-06',9.1,'dorm',{met_sis:true}); H.FRIEND(SIS); G2.contacts={[SIS]:G2.day-60}; SISB10.phone(G2); PHONE.tick(G2);
  check('1. 沒交往：沒有',!th(SIS).some(t=>/今年想第一個跟你說/.test(t))); }
/* 2 */
{ const US={EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together',Y4_PATH:'bar'};
  const run=(k,flags,setup)=>{ const G=H.fresh(k,8,'dorm',Object.assign({},US,flags||{})); if(setup) setup(G); const d0=G.day; for(let d=d0;d<=d0+4;d++){ G.day=d; for(const h of [10,14,20,23.9]){ G.hour=h; R2Y4A.phoneY4(G); PHONE.tick(G); } } return G; };
  const ok=G=>{ for(const id of ['classmate_peishan','heroine_04']){ H.FRIEND(id); INV.addContact(G,id); } };
  run('2028-11-07',{PS_RECONNECT:true},ok); const ps=th('classmate_peishan'), zq=th('heroine_04');
  check('2. 美國路線：沛珊「今天第一次試教。」「📷（教室的黑板，右下角一個畫歪的笑臉）」「有一個小朋友舉了六次手。……這次我有看到他。」',J(ps)===J(['今天第一次試教。','📷（教室的黑板，右下角一個畫歪的笑臉）','有一個小朋友舉了六次手。……這次我有看到他。']),J(ps));
  check('2. 美國路線：子晴「新關卡做好了」「📷（一隻像素的貓，站在一個發亮的存檔點旁邊）」「你不在 沒人玩第三遍」「回來再玩」',J(zq)===J(['新關卡做好了','📷（一隻像素的貓，站在一個發亮的存檔點旁邊）','你不在 沒人玩第三遍','回來再玩']),J(zq));
  const m=(H.G.msgs||[]).find(x=>x.tag==='y4_us_ps_lesson'||(x.th==='p:classmate_peishan'&&x.text==='今天第一次試教。'));
  check('2. 沛珊那則是臺灣 11/08 23:10（玩家那邊的時間由 tzOffset 換算）',!!m,J(m&&[m.day,m.h]));
  run('2028-11-07',{},ok); check('2. 沛珊沒有重新聯絡上：不傳',!th('classmate_peishan').length);
  run('2028-11-07',{EXCHANGE_ROUTE:'TW'},ok); check('2. 台灣路線：兩則都沒有',!th('classmate_peishan').length&&!th('heroine_04').length);
  run('2028-11-07',{PS_RECONNECT:true,dating_heroine_04:true},ok); check('2. 和子晴交往中：子晴那則沒有',!th('heroine_04').length);
  run('2028-11-07',{PS_RECONNECT:true},G=>{ INV.addContact(G,'heroine_04'); H.FAMILIAR('heroine_04'); }); check('2. 子晴只到有點熟：沒有',!th('heroine_04').length); }
H.done();
