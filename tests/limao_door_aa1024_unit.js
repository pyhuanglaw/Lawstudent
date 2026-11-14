// 禮貌生財門口沒開時的三句（AA_1024 第 5 節；LIMAO-DOOR-HOURS-TEXT-1114）——不需要瀏覽器（D131）。
//   0 index.html 載入 src/data/limao_door_aa1024.js（shop_hours_aa831.js 之後）
//   1 三句和稿（企劃線 fa3d6ad5f7 第 5 節的表）一字不差
//   2 SH831.LINE_X.tz_limao：15:00＝還沒開那一句、23:40／凌晨 01:00＝…（01:00 算還沒開）、營業時間照 shop_hours_aa831.js（19:00～23:30）
//   3 SH831.door：15:00 到門口＝說「每晚七點到十一點半」那一句（不是「今日不看」）、沒有進去
// 用法：node tests/limao_door_aa1024_unit.js
const H=require('./pg_harness.js'); const {check,GM}=H;
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const L=f=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
for(const f of ['src/data/shop_hours_aa831.js','src/data/limao_door_aa1024.js','src/shop_hours831_3d.js']) if(!(f==='src/shop_hours831_3d.js'&&typeof SH831!=='undefined')) L(f);
(async()=>{
  const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. index.html 載入 limao_door_aa1024.js（shop_hours_aa831.js 之後、shop_hours831_3d.js 之前）',html.indexOf('src/data/shop_hours_aa831.js')<html.indexOf('src/data/limao_door_aa1024.js')&&html.indexOf('src/data/limao_door_aa1024.js')<html.indexOf('src/shop_hours831_3d.js'));
  const [p,sha]=LIMAO_DOOR_AA1024.src.split('@'); let doc=''; try{ doc=cp.execFileSync('git',['show',sha+':'+p],{cwd:H.ROOT,encoding:'utf8'}); }catch(e){}
  const sec5=doc.slice(doc.indexOf('## 5.'));
  check('1. 三句都在稿的第 5 節裡、一字不差（還沒開／已收攤／今日不看）',!!doc&&[LIMAO_DOOR_AA1024.notOpen,LIMAO_DOOR_AA1024.closed,LIMAO_DOOR_AA1024.off].every(t=>sec5.includes('| '+t+' |'))&&new Set([LIMAO_DOOR_AA1024.notOpen,LIMAO_DOOR_AA1024.closed,LIMAO_DOOR_AA1024.off]).size===3,doc?'':'讀不到稿');
  const at=h=>{ const G=H.fresh('2025-10-23',h,'tingzhou'); return SH831.LINE_X.tz_limao(G); };
  check('2. 15:00、18:59＝還沒開那一句（寫「每晚七點到十一點半」）',at(15)===LIMAO_DOOR_AA1024.notOpen&&at(18.98)===LIMAO_DOOR_AA1024.notOpen&&/每晚七點到十一點半/.test(at(15)));
  check('2. 23:30、23:50＝已收攤那一句（紙還在，不是「今日不看」）',at(23.5)===LIMAO_DOOR_AA1024.closed&&at(23.83)===LIMAO_DOOR_AA1024.closed&&!/今日不看/.test(at(23.5)));
  check('2. 營業時間照 shop_hours_aa831.js：19:00～23:30',SHOP_HOURS_AA831.shops.tz_limao.open===19&&SHOP_HOURS_AA831.shops.tz_limao.close===23.5);
  { const G=H.fresh('2025-10-23',15,'tingzhou'); const said=[]; const say0=GM.say; GM.say=async(w,t)=>{ said.push(t); }; let r=null; try{ r=await SH831.door(GM,'tz_limao'); } finally { GM.say=say0; }
    check('3. 15:00 到門口：處理掉了（沒有進去）、說的是還沒開那一句',r===true&&said.length===1&&said[0]===LIMAO_DOOR_AA1024.notOpen,JSON.stringify([r,said])); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
