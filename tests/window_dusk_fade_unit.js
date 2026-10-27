// 黃昏窗外的照片跟著屋外暗下來（ART-HALL-WINDOW-DUSK-1025，LAWWW2-B 2026-10-25；BB-B RELEASE-91010-TEST 附註④）——不需要瀏覽器。
//   12/10 17:20（臺北 17:06 日落、光線 19.1、引擎的夜晚係數 nk 0.92：屋外幾乎全黑、路燈亮）三個大廳窗外還是白天的照片（調暗到約 26%），比屋外亮；
//   19.2 才一下子換成夜景照片。改成光線 18.6～19.2（nk 0.625→1）白天照片照 nk 疊成夜景照片（world3d.js photoFade＋窗景材質的 map2／xf）。
//   1. photoFade：18.6 以前、19.2 以後都是 0；18.6～19.2＝(nk−0.625)/0.375（跟著屋外的夜晚係數），一直往上、19.2 前一刻到 1（換夜景那一刻不跳）；
//   2. 窗景材質（windowMat）照 xf 把白天（×色調）疊成夜景照片（遠景 map2＋近景 nmap2）；
//   3. setWindowView：白天、xf>0 時把夜景照片放進 map2（近景放 nmap2）；晚上、xf=0、白天照片還沒載入時 xf=0；夜景照片還沒載入時 xf=0（照舊只畫白天那張）；
//   4. 用照片的窗景都把 photoFade 傳進去：大樓大廳（B3.setOutView：霖澤館、萬才館、法圖、社科圖、教學館）、118 巷店內、房間（zones3d room()）、總圖大廳（library3d）；
//   5. 12/10 17:20：白天照片剩下的亮度（(1−xf)×色調的亮度）≤ 10%（改前 26%）；12/10 16:30、夏天 7/15 18:00 照舊是白天照片（xf=0）；7/15 18:30（日落前 16 分鐘）才開始疊、不到兩成；
//   6. 白天（光線 18.6 以前）照片的色調和改前一樣（photoTint 沒動）。
// 修改前 FAIL。用法：node tests/window_dusk_fade_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8'), grab=(s,re)=>{ const m=s.match(re); return m?m[0]:null; };
const eng=rd('src/engine3d.js'), w3=rd('src/world3d.js');
const nkM=eng.match(/const nk=(h>=([0-9.]+)\|\|h<5\.6\?1:[^;]*?);/), T=nkM?+nkM[2]:19.2;
const fPF=grab(w3,/function photoFade\(h\)\{[^\n]*\n/), fPT=grab(w3,/function photoTint\(h,rain\)\{[^\n]*\n/), fSW=grab(w3,/function setWindowView\(m,kind,night,fallback,tint,xf\)\{[\s\S]*?\n    return !!ph; \}/);
const fSS=grab(eng,/function sunsetAt\(y,m,d,lat,lon,tz\)\{[^\n]*\n/), fLH=grab(eng,/function lightHour\(h,ss\)\{[^\n]*\n/), fSP=grab(eng,/function sunsetPlace\(key,pl\)\{[^\n]*\n/);
check('1. world3d.js 有 photoFade（黃昏夜景照片的比例）', !!fPF);
check('1. 引擎的夜晚係數 nk、sunsetAt、lightHour、sunsetPlace', !!(nkM&&fSS&&fLH&&fSP), nkM?'T='+T:'');
check('3. setWindowView 收 xf（黃昏夜景照片的比例）', !!fSW);
if(!(fPF&&fPT&&fSW&&nkM&&fSS&&fLH&&fSP)){ console.log('FAILED '+fails); process.exit(1); }
const ctx={Math}; vm.createContext(ctx);
vm.runInContext('this.nk=h=>('+nkM[1]+');\n'+fPF+fPT+'this.photoFade=photoFade; this.photoTint=photoTint;\n'+fSS+fLH+fSP+'this.lightHour=lightHour; this.sunsetPlace=sunsetPlace;',ctx);
const {nk,photoFade:PF,photoTint:PT}=ctx;
// 1. photoFade 的形狀
{ let bad=[]; for(let i=0;i<2400;i++){ const h=i*0.01, x=PF(h), want=(h>=18.6&&h<T)?(nk(h)-0.625)/0.375:0; if(Math.abs(x-want)>1e-6) bad.push(h.toFixed(2)+':'+x.toFixed(3)); }
  check('1. 18.6 以前、'+T+' 以後是 0；中間＝(nk−0.625)/0.375（跟著屋外的夜晚係數）', bad.length===0, bad.length?bad.slice(0,4).join(' '):''); }
{ let prev=-1, mono=true; for(let i=1860;i<Math.round(T*100);i++){ const x=PF(i/100); if(x<prev-1e-9) mono=false; prev=x; } const end=PF(T-1e-6);
  check('1. 18.6～'+T+' 一直往上，'+T+' 前一刻到 1（換夜景那一刻不跳）', mono&&end>0.999, 'T 前一刻 '+end.toFixed(4)); }
// 2. 窗景材質
{ const wm=grab(w3,/function windowMat\(depth\)\{[\s\S]*?toneMapped:false, fog:false \}\); \}/)||'';
  const ok=/map2:\{value:null\}/.test(wm)&&/nmap2:\{value:null\}/.test(wm)&&/xf:\{value:0\}/.test(wm)&&/uniform sampler2D map2;/.test(wm)&&/col=mix\(col,mix\(c2\.rgb,n2\.rgb,n2\.a\),xf\)/.test(wm)&&/vec3 col=mix\(c\.rgb,nc\.rgb,nc\.a\)\*tint;/.test(wm);
  check('2. 窗景材質照 xf 把白天（×色調）疊成夜景照片（遠景 map2＋近景 nmap2）', ok); }
// 3. setWindowView 的行為（假的貼圖快取）
{ const loaded=new Set(['a_day','a_night','b_day','b_near_day','b_night','b_near_night','c_day']);
  const c2={VIEW_LAYERS:{b:{far:8,near:5}}}; vm.createContext(c2);
  vm.runInContext('const VIEW_LAYERS=this.VIEW_LAYERS; function viewPhoto(kind,night){ return LOADED.has(kind+(night?"_night":"_day"))?{tex:kind+(night?"_night":"_day")}:null; }\n'+fSW+'\nthis.sw=setWindowView;',Object.assign(c2,{LOADED:loaded}));
  const mk=()=>({uniforms:{map:{value:null},tint:{value:{set(){}}},depth:{value:20},photo:{value:0},sxy:{value:null},nmap:{value:null},ndepth:{value:4},near:{value:0},map2:{value:null},nmap2:{value:null},near2:{value:0},xf:{value:0}}});
  const t=(u)=>({map:u.map.value&&u.map.value.tex, map2:u.map2.value&&u.map2.value.tex, nmap2:u.nmap2.value&&u.nmap2.value.tex, near2:u.near2.value, xf:u.xf.value});
  const R=[]; let m;
  m=mk(); c2.sw(m,'a',false,null,0xffffff,0.5); R.push(['白天 xf 0.5：夜景照片放進 map2',t(m.uniforms),r=>r.map==='a_day'&&r.map2==='a_night'&&r.xf===0.5&&r.near2===0]);
  m=mk(); c2.sw(m,'b',false,null,0xffffff,0.8); R.push(['兩層窗景：夜景近景放進 nmap2',t(m.uniforms),r=>r.map2==='b_night'&&r.nmap2==='b_near_night'&&r.near2===1&&r.xf===0.8]);
  m=mk(); c2.sw(m,'a',false,null,0xffffff,0.5); c2.sw(m,'a',false,null,0xffffff,0); R.push(['xf 回到 0：不畫夜景',t(m.uniforms),r=>r.xf===0&&!r.map2]);
  m=mk(); c2.sw(m,'a',true,null,0xffffff,0.5); R.push(['晚上：xf＝0（已經是夜景照片）',t(m.uniforms),r=>r.map==='a_night'&&r.xf===0]);
  m=mk(); c2.sw(m,'c',false,null,0xffffff,0.5); R.push(['夜景照片還沒載入：xf＝0（照舊只畫白天那張）',t(m.uniforms),r=>r.map==='c_day'&&r.xf===0]);
  m=mk(); c2.sw(m,'z',false,{tex:'fallback'},0xffffff,0.5); R.push(['白天照片還沒載入（程序化貼圖）：xf＝0',t(m.uniforms),r=>r.map==='fallback'&&r.xf===0]);
  m=mk(); c2.sw(m,'a',false,null,0xffffff,1.7); R.push(['xf 最多 1',t(m.uniforms),r=>r.xf===1]);
  m={uniforms:{map:{value:null},tint:{value:{set(){}}},photo:{value:0},nmap:{value:null},near:{value:0}}}; let err=null; try{ c2.sw(m,'a',false,null,0xffffff,0.5); }catch(e){ err=e.message; } R.push(['舊的材質（沒有 xf）不出錯',{err},r=>!r.err]);
  for(const [n,r,f] of R) check('3. '+n, f(r), JSON.stringify(r)); }
// 4. 每個用照片的窗景都把 photoFade 傳進去
{ const S=[['src/building3d.js','大樓大廳 B3.setOutView（霖澤館、萬才館、法圖、社科圖、教學館）',/function setOutView\(o,h,weather,night\)\{[^\n]*W3\.photoTint\(h,weather==='rain'\):0xffffff,ph&&W3\.photoFade\?W3\.photoFade\(h\):0\); \}/],
    ['src/l118_shops3d.js','118 巷店內 setPhotoView',/function setPhotoView\(pv,h,weather\)\{[\s\S]{0,700}?getHex\(\),ph&&W3\.photoFade\?W3\.photoFade\(h\):0\); \}/],
    ['src/zones3d.js','房間 room() 的照片窗景',/W3\.setWindowView\(w\.material,w\.userData\.pview,nightView,viewTex\(nightView\),ph\?W3\.photoTint\(h,rain\):\(nightView\?\(rain\?0x9098a8:0xd8dce6\):winC\),ph&&W3\.photoFade\?W3\.photoFade\(h\):0\)/],
    ['src/library3d.js','總圖大廳 pOuts',/u\.tint\.value\.set\(v\?W3\.photoTint\(h,weather==='rain'\):0xffffff\); const v2=\(v&&!night&&W3\.photoFade&&W3\.photoFade\(h\)>0\)\?viewOf\(o\.userData\.view,true\):null; if\(u\.xf\)\{ u\.map2\.value=v2; u\.near2\.value=0; u\.xf\.value=v2\?W3\.photoFade\(h\):0; \}/]];
  for(const [f,n,re] of S) check('4. '+n+'（'+f+'）', re.test(rd(f)));
  const calls=(rd('src/building3d.js')+rd('src/l118_shops3d.js')+rd('src/zones3d.js')+rd('src/library3d.js')+rd('src/lawlib3d.js')+rd('src/soclib3d.js')+rd('src/teach3d.js')+rd('src/wancai3d.js')).match(/W3\.photoTint\(/g)||[];
  check('4. 用 photoTint 的地方都已經在上面（4 處）', calls.length===4, calls.length+' 處'); }
// 5. 派工指定的時刻（臺北的日落 → 光線用的時刻）
const lum=hex=>{ const l=c=>{ c/=255; return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4); }; return 0.2126*l(hex>>16&255)+0.7152*l(hex>>8&255)+0.0722*l(hex&255); };
const tp=(key,hh,mm)=>{ const ss=ctx.sunsetPlace(key,'tw'); return {ss, h:ctx.lightHour(hh+mm/60,ss)}; };
const fmt=x=>Math.floor(x)+':'+String(Math.round((x%1)*60)).padStart(2,'0');
{ const t=tp('2025-12-10',17,20), xf=PF(t.h), day=(1-xf)*lum(PT(t.h,false)), before=lum(0x8a8aa8);
  check('5. 12/10 17:20（'+fmt(t.ss)+' 日落）白天照片剩下的亮度 ≤ 10%（改前 '+Math.round(before*100)+'%）', day<=0.10, '光線 '+t.h.toFixed(2)+'、nk '+nk(t.h).toFixed(2)+'、夜景照片 '+Math.round(xf*100)+'%、白天照片剩 '+(day*100).toFixed(1)+'%'); }
{ const t=tp('2025-12-10',16,30); check('5. 12/10 16:30 照舊是白天照片', PF(t.h)===0, '光線 '+t.h.toFixed(2)); }
{ const t=tp('2026-07-15',18,0); check('5. 7/15 18:00（'+fmt(t.ss)+' 日落）照舊是白天照片', PF(t.h)===0, '光線 '+t.h.toFixed(2)); }
{ const t=tp('2026-07-15',18,30), x=PF(t.h); check('5. 7/15 18:30（日落前 16 分鐘，引擎的 nk 已經 '+nk(t.h).toFixed(2)+'）才開始疊夜景，不到兩成', x>0&&x<0.2, '光線 '+t.h.toFixed(2)+'、夜景照片 '+Math.round(x*100)+'%'); }
{ const t=tp('2025-12-10',17,45); check('5. 12/10 17:45 已經是夜景照片（換夜景＝'+T+'）', t.h>=T, '光線 '+t.h.toFixed(2)); }
// 6. photoTint 沒動
{ const OLD=(h,rain)=>{ h=((h%24)+24)%24; if(h<5.5||h>=19.2) return 0xffffff; if(h<6.5) return 0xb8c2d6; if(h<8) return rain?0xc8ccd2:0xe8eef8; if(h<16) return rain?0xc9cfd6:0xffffff; if(h<17.6) return rain?0xc2c4c8:0xfff0dc; if(h<18.4) return rain?0x9a9ca4:0xffcfa0; return 0x8a8aa8; };
  let bad=[]; for(let i=0;i<2400;i++){ const h=i*0.01; for(const r of [false,true]) if(PT(h,r)!==OLD(h,r)) bad.push(h.toFixed(2)); }
  check('6. 照片的色調（photoTint）和改前一樣', bad.length===0, bad.slice(0,4).join(' ')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
