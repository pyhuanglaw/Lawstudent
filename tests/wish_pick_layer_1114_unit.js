// DATE-D05-PICK-1114（BB_458、BB_466 #25）：心願約會散場以後選互動點，改走 DATE.pickChoose（2D 圖層，圖載不到才退回文字選單），跟一般約會一樣。
// 這裡檢查：① wish3d.js 選點走 D.pickChoose；② 每一位的心願地點，心願事件的互動點全部在 date_hotspots 那張底圖上有位置（圖層 covers 成立，不會默默退回文字選單）。
// 用法：node tests/wish_pick_layer_1114_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const ld=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='),{filename:f});
ld('src/data/date_wish.js'); ld('src/data/date_hotspots.js');
const W=fs.readFileSync(path.join(ROOT,'src/wish3d.js'),'utf8');
check('① 心願約會選點走 D.pickChoose（帶 bg、pts、all）',/D\.pickChoose\?await D\.pickChoose\(GM,o2,\{bg:/.test(W));
const HS=DATE_HOTSPOTS.bg||{}, bgs=Object.keys(HS).filter(k=>HS[k]&&HS[k].pts);
const evs=[]; const walk=(o,k)=>{ if(!o||typeof o!=='object') return; if(o.hotspots&&typeof o.hotspots==='object'&&!Array.isArray(o.hotspots)) evs.push({k,ids:Object.keys(o.hotspots)}); for(const q in o) if(q!=='hotspots') walk(o[q],k?k+'.'+q:q); };
walk(DATE_WISH,'');
const bad=[], d05=[];
for(const e of evs){ if(!e.ids.length) continue; const loc=e.ids[0].split('.')[0]; const keys=bgs.filter(b=>HS[b].loc===loc||b.toLowerCase().startsWith(loc.toLowerCase()));
  const ok=keys.some(b=>e.ids.every(id=>HS[b].pts[id]));
  if(loc==='D05') d05.push({k:e.k,ok,ids:e.ids,keys}); if(keys.length&&!ok) bad.push(e.k+' '+loc+' 缺：'+e.ids.filter(id=>!keys.some(b=>HS[b].pts[id])).join('、')); }
check('② 找得到心願事件的互動點（'+evs.length+' 組）',evs.length>0);
check('② D05（芷若・光典臺北）的心願互動點全部在 D05 底圖上有位置',d05.length>0&&d05.every(x=>x.ok),JSON.stringify(d05));
check('② 有底圖的心願地點，互動點全部在底圖上有位置（沒有的照舊文字選單）',!bad.length,bad.join('；'));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
