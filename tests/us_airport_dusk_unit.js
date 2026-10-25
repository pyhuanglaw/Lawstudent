// 桃園機場窗外的遠景和屋外同一刻天黑（US-AIRPORT-DUSK-1025，LAWWW2-B 2026-10-25；LAWWW-B 派工）——不需要瀏覽器。
//   us3d.js 的 apOutside（出境、入境大廳窗外的遠景＋入境門外的地面）原本寫死「光線 7～17 白天、17～19、5～7 慢慢變」、亮度剩 35% 以下就換夜景：
//   光線 18.3 就換成夜景（亮著燈的停車大樓），比日落（18.95）還早；冬天 12 月 16:55 太陽還沒下山，機場外已經是夜景。
//   改成和屋外同一套：亮度＝屋外的亮度（engine3d.js applyTime 的夜晚係數 nk）；換夜景和臺灣大樓大廳的窗景同一刻（光線 ≥ 屋外完全天黑、早上 6 點以前）。
//   1. 讀得到引擎的 nk、臺灣大廳換夜景的規則（building3d.js）、us3d.js 的 apOutside；
//   2. 遠景的亮度＝屋外的亮度（1−nk），一整天每 3 分鐘比一次；
//   3. 換夜景的時刻＝臺灣大廳窗景（傍晚 ≥ 屋外完全天黑、早上 < 6）；屋外還沒完全天黑以前都是白天那塊；
//   4. 派工指定的時刻（用引擎自己的 lightHour、臺北的日落）：12/23 05:40 桃園入境是暗的、夜景；8/2 07:00 出境是亮的、白天；
//      冬天 12/20 16:55（17:07 日落前）還是白天那塊；夏天 7/13 18:40（18:47 日落前）也是。
// 修改前 FAIL。用法：node tests/us_airport_dusk_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8'), grab=(s,re)=>{ const m=s.match(re); return m?m[0]:null; };
const eng=rd('src/engine3d.js'), us=rd('src/us3d.js'), bld=rd('src/building3d.js');
const nkM=eng.match(/const nk=(h>=([0-9.]+)\|\|h<5\.6\?1:[^;]*?);/), T=nkM?+nkM[2]:19.2;
const lobby=bld.match(/const night=\(h%24<([0-9.]+)\|\|h%24>=([0-9.]+)\);/);
const fAP=grab(us,/const AP_NIGHT=\[[^\]]*\];\s*function apOutside\(mats,h,planes\)\{[\s\S]*?u\.usBase\*0\.75; \} \}/);
const fSS=grab(eng,/function sunsetAt\(y,m,d,lat,lon,tz\)\{[^\n]*\n/), fLH=grab(eng,/function lightHour\(h,ss\)\{[^\n]*\n/), fSP=grab(eng,/function sunsetPlace\(key,pl\)\{[^\n]*\n/);
check('1. 引擎的夜晚係數 nk（h ≥ T 就是 1）', !!nkM, nkM?'T='+T:'');
check('1. 霖澤館大廳窗景換夜景的規則（building3d.js）', !!lobby, lobby?'h<'+lobby[1]+' 或 h≥'+lobby[2]:'');
check('1. us3d.js 的 apOutside', !!fAP);
check('1. 引擎的 sunsetAt、lightHour、sunsetPlace', !!(fSS&&fLH&&fSP));
if(!(nkM&&lobby&&fAP&&fSS&&fLH&&fSP)){ console.log('FAILED '+fails); process.exit(1); }
class C{ constructor(r,g,b){ this.r=r; this.g=g; this.b=b; } clone(){ return new C(this.r,this.g,this.b); } setRGB(r,g,b){ this.r=r; this.g=g; this.b=b; return this; } }
const ctx={Math}; vm.createContext(ctx);
vm.runInContext('this.nk=h=>('+nkM[1]+');\n'+fAP+'\nthis.apOutside=apOutside;\n'+fSS+fLH+fSP+'this.lightHour=lightHour; this.sunsetPlace=sunsetPlace;',ctx);
const nk=ctx.nk, mOut=0.8*0.8; // 遠景的材質：基本色 0.8、自發光 0.8
const mat={color:new C(0.8,0.8,0.8),emissive:new C(0.8,0.8,0.8),emissiveIntensity:1,userData:{usBase:1}};
const planes={day:[{visible:true}],night:[{visible:false}]};
const run=h=>{ ctx.apOutside([mat],h,planes); return {k:mat.color.r/0.8, night:planes.night[0].visible, day:planes.day[0].visible}; };
const AP=(us.match(/const AP_NIGHT=\[([^\]]*)\]/)||[,'0.13'])[1].split(',').map(Number);
// 2. 亮度＝屋外的亮度：k＝AP_NIGHT[0]＋(1−AP_NIGHT[0])×(1−nk)
{ let worst=0, at=null; for(let i=0;i<480;i++){ const h=i*0.05, r=run(h), want=AP[0]+(1-AP[0])*(1-nk(h)), e=Math.abs(r.k-want); if(e>worst){ worst=e; at=h; } }
  check('2. 遠景的亮度＝屋外的亮度（1−nk），一整天每 3 分鐘比一次', worst<0.01, '最大差 '+worst.toFixed(3)+(at!=null?'（光線 '+at.toFixed(2)+'）':'')); }
// 3. 換夜景的時刻＝臺灣大廳窗景
{ const lo=+lobby[1], hi=+lobby[2]; let bad=[]; for(let i=0;i<2400;i++){ const h=i*0.01, r=run(h), want=(h<lo||h>=hi); if(r.night!==want||r.day===want) bad.push(h.toFixed(2)); }
  check('3. 換夜景的時刻＝臺灣大廳的窗景（h<'+lo+' 或 h≥'+hi+'）', bad.length===0, bad.length?'不一樣的光線時刻：'+bad.slice(0,4).join(' ')+(bad.length>4?' …共 '+bad.length:''):'');
  check('3. 臺灣大廳換夜景＝屋外完全天黑（nk 的 T）', hi===T, 'h≥'+hi+'、T='+T);
  let early=[]; for(let i=1500;i<Math.round(T*100);i++){ const h=i/100; if(run(h).night) early.push(h); }
  check('3. 屋外還沒完全天黑（光線 15～'+T+'）都是白天那塊', early.length===0, early.length?'光線 '+early[0].toFixed(2)+' 就換夜景':''); }
// 4. 派工指定的時刻（臺北的日落 → 光線用的時刻）
const tp=(md,hh,mm)=>{ const ss=ctx.sunsetPlace('2028-'+md,'tw'); return {ss, h:ctx.lightHour(hh+mm/60,ss)}; };
const fmt=x=>Math.floor(x)+':'+String(Math.round((x%1)*60)).padStart(2,'0');
{ const t=tp('12-23',5,40), r=run(t.h); check('4. 12/23 05:40 桃園入境：暗的、夜景', r.night&&r.k<=0.25, '光線 '+t.h.toFixed(2)+'、亮度 '+r.k.toFixed(2)+(r.night?'、夜景':'、白天那塊')); }
{ const t=tp('08-02',7,0), r=run(t.h); check('4. 8/2 07:00 出境：亮的、白天', !r.night&&r.k>=0.99, '光線 '+t.h.toFixed(2)+'、亮度 '+r.k.toFixed(2)); }
{ const t=tp('12-20',16,55), r=run(t.h); check('4. 12/20 16:55（'+fmt(t.ss)+' 日落前）還是白天那塊', !r.night, '光線 '+t.h.toFixed(2)+'、亮度 '+r.k.toFixed(2)+(r.night?'、夜景':'')); }
{ const t=tp('07-13',18,40), r=run(t.h); check('4. 7/13 18:40（'+fmt(t.ss)+' 日落前）還是白天那塊', !r.night, '光線 '+t.h.toFixed(2)+'、亮度 '+r.k.toFixed(2)+(r.night?'、夜景':'')); }
{ const t=tp('12-20',17,45), r=run(t.h); check('4. 12/20 17:45（屋外已經完全天黑）夜景', r.night, '光線 '+t.h.toFixed(2)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
