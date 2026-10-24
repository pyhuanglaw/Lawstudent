// 傍晚的光線照日期（ENGINE-SEASON-DUSK-1024，LAWWW2-B 2026-10-24；LAWWW-B 派工）——不需要瀏覽器。
//   原本 engine3d.js 的 KEY0 只照「幾點」：一年四季每天 18:57 左右日落。臺北 11/6、12/10 17:45 已經天黑，遊戲是金黃色斜陽；10/16 19:00 總圖窗外還是白天。
//   1. engine3d.js 有 sunsetAt、lightHour、sunsetPlace；applyTime 用 lightHour(hour%24, E.sunsetNow())，E.hour 照舊是時鐘、光線用的時刻放 E.lightH；夜間影子（nightShadow）也用 E.lightH；
//   2. 日落時刻（NOAA 簡化公式）：臺北 12/10、6/21、9/1；布魯明頓 11/23（冬令時間）、8/2（夏令時間）；11/5 換冬令時間那天日落早一小時；大阪 3/25、7/1；
//   3. 派工指定的五個時刻（用遊戲自己的表 KEYG 查太陽高度、路燈、夜晚係數）：
//      12/10 17:45、11/6 17:45 已經天黑（太陽在地平線下、路燈亮、星星出來）；7/20 18:30 夏天幾乎不變、太陽還在；
//      10/16 19:00 總圖（zones3d.js room() 的窗）換夜景；美國 11/23 17:00 是黃昏（太陽 0～12°、不是下午 26°）；
//   4. 12/10 17:00 路燈已經亮（臺北 17:06 日落）；15:00 以前、24:00 以後完全照舊；
//   5. 每一天（2024～2028，臺北、美國）都連續、遞增，不會跳、不會倒退，沒有 NaN；
//   6. E.sunsetNow：us_ 開頭的區域用美國那一組、jp_ 開頭用大阪，其他用臺北；同一天只算一次；E.sunsetFix 可以指定。
// 修改前 FAIL。用法：node tests/season_dusk_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const src=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8'), zsrc=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
const grab=(s,re)=>{ const m=s.match(re); return m?m[0]:null; };
const fSS=grab(src,/function sunsetAt\(y,m,d,lat,lon,tz\)\{[^\n]*\n/), fLH=grab(src,/function lightHour\(h,ss\)\{[^\n]*\n/), fSP=grab(src,/function sunsetPlace\(key,pl\)\{[^\n]*\n/), fNow=grab(src,/E\.sunsetNow=function\(\)\{[^\n]*\n/);
const K0=grab(src,/const KEY0=\[[\s\S]*?\n  \];/), KG=grab(src,/const KEY_GOLDEN=\[[\s\S]*?\]\];/), KGG=grab(src,/const KEYG=[^\n]*\n/);
check('1. engine3d.js 有 sunsetAt、lightHour、sunsetPlace、E.sunsetNow', !!(fSS&&fLH&&fSP&&fNow));
check('1. applyTime：E.hour 照舊是時鐘，光線用 lightHour(hour%24,E.sunsetNow())、放 E.lightH', /E\.applyTime=function\(hour\)\{ E\.hour=hour; const KEY=[^;]*; let h=lightHour\(hour%24,E\.sunsetNow\(\)\); E\.lightH=h;/.test(src));
check('1. 夜間影子用 E.lightH', /E\.nightShadow=function\(now\)\{[^\n]*const hh=E\.lightH!=null\?E\.lightH:/.test(src));
const room=grab(zsrc,/const nightView=\(h<5\.5\|\|h>=(19\.[0-9]+)\);/), roomT=room?+room.match(/>=([0-9.]+)\)/)[1]:19.4;   // 10-24 路線巡查④起是 19.2（和屋外天黑同一刻）
check('3. zones3d.js room() 的窗有換夜景的時刻（下面拿來判斷總圖）', !!room, 'h≥'+roomT);
const ctx={Math,Date}; vm.createContext(ctx);
try{ vm.runInContext([K0,KG,KGG].join('\n')+'\nthis.KEYG=KEYG;',ctx); }catch(e){ console.log('KEY 表讀不到',e.message); }
const KEY=ctx.KEYG;
const at=(h,col)=>{ let i=0; if(h<KEY[0][0]) h=KEY[0][0]; while(i<KEY.length-2&&KEY[i+1][0]<=h) i++; const A=KEY[i], B=KEY[i+1], t=Math.max(0,Math.min(1,(h-A[0])/(B[0]-A[0]))); return A[col]+(B[col]-A[col])*t; };
const elev=h=>at(h,3), lampsOn=h=>at(h,13)>0.5, nk=h=>h>=19.2||h<5.6?1:(h>=17.6?(h-17.6)/1.6:(h<6.4?(6.4-h)/0.8:0));   // nk：applyTime 的夜晚係數（星星、柏油變暗）
if(KEY){
  const has=!!(fSS&&fLH&&fSP); if(has) vm.runInContext(fSS+fLH+fSP+'this.sunsetAt=sunsetAt; this.lightHour=lightHour; this.sunsetPlace=sunsetPlace;',ctx);
  else console.log('（沒有 lightHour：下面用修改前的做法——光線＝時鐘——檢查同樣的時刻）');
  const SP=has?ctx.sunsetPlace:()=>NaN, LH=has?ctx.lightHour:(h=>h), hm=x=>Number.isFinite(x)?Math.floor(x)+':'+String(Math.round((x%1)*60)).padStart(2,'0'):'—';
  const near=(k,pl,ref,tol)=>{ const v=SP(k,pl); check('2. 日落 '+({tw:'臺北 ',us:'布魯明頓 ',jp:'大阪 '})[pl]+k+' ≈ '+hm(ref)+'（±'+Math.round(tol*60)+' 分）', Math.abs(v-ref)<=tol, hm(v)); };
  near('2025-12-10','tw',17+6/60,5/60); near('2025-06-21','tw',18+46/60,5/60); near('2025-09-01','tw',18+13/60,5/60);
  near('2028-11-23','us',17+26/60,8/60); near('2028-08-02','us',20+58/60,8/60); near('2028-03-25','jp',18+13/60,8/60); near('2028-07-01','jp',19+15/60,8/60);
  { const a=SP('2028-11-04','us'), b=SP('2028-11-05','us'); check('2. 美國 11/5 換冬令時間：日落早將近一小時', a-b>0.9&&a-b<1.1, hm(a)+' → '+hm(b)); }
  const L=(k,pl,h)=>LH(h,SP(k,pl));   // 修改前：光線＝時鐘
  { const h=L('2024-12-10','tw',17.75); check('3. 12/10 17:45 已經天黑：太陽在地平線下、路燈亮、夜晚係數 1', elev(h)<0&&lampsOn(h)&&nk(h)===1, 'light '+h.toFixed(2)+' elev '+elev(h).toFixed(1)); }
  { const h=L('2024-11-06','tw',17.75); check('3. 11/6 17:45（醉月湖 E12）已經天黑', elev(h)<0&&lampsOn(h)&&nk(h)===1, 'light '+h.toFixed(2)+' elev '+elev(h).toFixed(1)); }
  { const h=L('2025-07-20','tw',18.5); check('3. 7/20 18:30 夏天幾乎不變（差不到 15 分鐘）、太陽還在地平線上', Math.abs(h-18.5)<0.25&&elev(h)>0, 'light '+h.toFixed(2)+' elev '+elev(h).toFixed(1)); }
  { const h=L('2024-10-16','tw',19); check('3. 10/16 19:00 總圖的窗換夜景（room() 的 h≥'+roomT+'）', h>=roomT, 'light '+h.toFixed(2)); }
  { const h=L('2028-11-23','us',17); check('3. 美國 11/23 17:00 是黃昏（太陽 0～12°，不是下午的 26°）', elev(h)>0&&elev(h)<12, 'light '+h.toFixed(2)+' elev '+elev(h).toFixed(1)); }
  { const h=L('2024-12-10','tw',17); check('4. 12/10 17:00 路燈已經亮', lampsOn(h), 'light '+h.toFixed(2)); }
  { let same=true; for(const k of ['2024-12-10','2025-06-21','2028-11-23']) for(const pl of ['tw','us','jp']) for(let h=0;h<=15;h+=0.25) if(LH(h,SP(k,pl))!==h) same=false;
    check('4. 15:00 以前完全照舊（早上、中午、半夜）', same); }
  { let bad=[]; const t0=Date.UTC(2024,0,1);
    for(let i=0;i<365*5;i+=3) for(const pl of ['tw','us','jp']){ const k=new Date(t0+i*864e5).toISOString().slice(0,10), ss=SP(k,pl); let prev=LH(15,ss);
      if(has&&!Number.isFinite(ss)) { bad.push(k+' NaN'); continue; }
      for(let h=15.02;h<24;h+=0.02){ const v=LH(h,ss); if(!Number.isFinite(v)||v<prev-1e-9||v-prev>0.1) { bad.push(k+pl+'@'+h.toFixed(2)); break; } prev=v; }
      if(Math.abs(LH(23.999,ss)-23.999)>0.01) bad.push(k+pl+' 24:00 接不回'); }
    check('5. 2024～2028 每一天（臺北、美國、大阪）15:00～24:00 連續、遞增（每 1.2 分鐘最多走 6 分鐘：美國夏天 21:00 才日落，23:00 以後夜色接回得比較快，都是夜晚那幾列）、沒有 NaN，24:00 接回時鐘', bad.length===0, bad.slice(0,4).join(' ')); }
  { const v=LH(17.75,null); check('5. 沒有日期（例如測試、標題畫面）就照舊', v===17.75); }
}
if(fNow&&fSP&&fSS){
  const c2={Math,Date}; vm.createContext(c2);
  vm.runInContext('var calls=0;\n'+fSS+fSP+'var E={zone:null}; var GAME={G:{day:0}}; var CALENDAR={dateOf:d=>{ calls++; return {key:d===1164?"2028-11-23":(d===900?"2028-03-25":"2024-12-10")}; }};\n'+fNow+'this.E=E; this.GAME=GAME;',c2);
  const E=c2.E, G=c2.GAME.G;
  G.day=-280; E.zone={def:{id:'campus'}}; const tw=E.sunsetNow(); E.sunsetNow(); E.sunsetNow();
  G.day=1164; E.zone={def:{id:'us_campus'}}; const us=E.sunsetNow();
  E.zone={def:{id:'us_lawlib'}}; const us2=E.sunsetNow();
  G.day=900; E.zone={def:{id:'jp_room'}}; const jp=E.sunsetNow();
  check('6. E.sunsetNow：臺灣的區域用臺北（12/10 約 17:06）、us_ 開頭用美國（11/23 約 17:26）、jp_ 開頭用大阪（3/25 約 18:13）', Math.abs(tw-17.1)<0.1&&Math.abs(us-17.43)<0.15&&us2===us&&Math.abs(jp-18.22)<0.15, [tw,us,jp].map(v=>v.toFixed(2)).join(' '));
  check('6. 同一天、同一個地方只算一次（每 5 格呼叫一次 applyTime 也不浪費）', vm.runInContext('calls',c2)===3, 'dateOf 呼叫 '+vm.runInContext('calls',c2)+' 次');
  E.sunsetFix=18.2; check('6. E.sunsetFix 可以直接指定', E.sunsetNow()===18.2);
}
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
