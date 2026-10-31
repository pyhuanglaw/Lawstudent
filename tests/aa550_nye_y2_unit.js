// AA_550（企劃線 da56f3a68；VAC-B1）：大二跨年（2027-01-01）芷若 00:04、子晴 00:00 的私訊；Kevin 2026-01-25 20:00 家族群組大阪照片。不需要瀏覽器。src/bbpack3d.js
//   1 子晴（FRIEND 以上）00:00 三則；不熟不傳  2 芷若（FAMILIAR 以上）00:04 三則；00:04 以前不傳  3 沛珊大二沒有  4 Kevin 大阪照片（在家族群組才收到）
// 修改前（開發分支 f32a11388）：沒有這幾則——FAIL。用法：node tests/aa550_nye_y2_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check}=H;
const load=f=>{ const p=path.join(H.ROOT,f); let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
let err=''; try{ load('src/data/bbpack_events.js'); load('src/bbpack3d.js'); }catch(e){ err=String(e); }
const X=()=>typeof BBPACK!=='undefined'?BBPACK:null, J=JSON.stringify;
const ZQ='heroine_04', ZR='heroine_02', PS='classmate_peishan';
const setT=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; const w=CALENDAR.dateOf(d).wd; G.weekday=w===7?0:w; };
const rules=()=>{ X().phone(H.G); PHONE.tick(H.G); };
const tx=th=>(H.G.msgs||[]).filter(m=>m.th===th).map(m=>m.text);
const NY2=H.D('2027-01-01');
(async()=>{
  check('0. 檔案載得到',!!X()&&!err,err); if(!X()){ H.done(); return; }
  H.fresh('2026-12-31',23,'dorm',{}); H.FRIEND(ZQ); H.FAMILIAR(ZR); H.FRIEND(PS); setT(NY2,0.02); rules();
  check('1. 子晴（朋友以上）00:00：「📷（遊戲裡的煙火，這次只有她的角色）」「新年快樂」「阿凱在他們那棟頂樓 我自己放」（不加句號）',J(tx('p:'+ZQ))===J(['📷（遊戲裡的煙火，這次只有她的角色）','新年快樂','阿凱在他們那棟頂樓 我自己放']),J(tx('p:'+ZQ)));
  check('2. 芷若 00:04 以前不傳',tx('p:'+ZR).length===0);
  setT(NY2,0.1); rules();
  check('2. 芷若（有點熟以上）00:04：「今年一百六十杯。」「店長說明年要再請一個人。」「新年快樂。」',J(tx('p:'+ZR))===J(['今年一百六十杯。','店長說明年要再請一個人。','新年快樂。']),J(tx('p:'+ZR)));
  check('3. 沛珊大二沒有（重考那段）',!tx('p:'+PS).some(t=>/新年快樂/.test(t)));
  H.fresh('2026-12-31',23,'dorm',{}); H.FAMILIAR(ZQ); setT(NY2,0.5); rules();
  check('1. 子晴只到有點熟＝不傳',tx('p:'+ZQ).length===0);
  H.fresh('2026-01-24',12,'dorm',{}); PHONE.join&&PHONE.join(H.G,'family_law'); const inG=PHONE.inGroup(H.G,'family_law'); setT(H.D('2026-01-25'),20.1); rules();
  check('4. Kevin 1/25 20:00 家族群組：「📷（大阪的路口，一隻在吃章魚燒的鹿）」「鹿是我亂講的 是狗」',inG&&J(tx('g:family_law').slice(-2))===J(['📷（大阪的路口，一隻在吃章魚燒的鹿）','鹿是我亂講的 是狗']),J([inG,tx('g:family_law')]));
  H.fresh('2026-01-24',12,'dorm',{}); setT(H.D('2026-01-25'),20.1); rules();
  check('4. 不在家族群組＝收不到',!tx('g:family_law').includes('鹿是我亂講的 是狗'));
  H.done();
})();
