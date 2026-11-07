// 第二次告白接原本答應那一場的換句（AA_723 eca6139aa secondYes；BB-B 11-07 pt1107o 以安「只是想說等你先講。」接不上被拒絕過）——不需要瀏覽器（D131）。
// 檢查：0 匯入一致（aa723.js 照 eca6139aa、七位都有 secondYes）；1 以安、語彤、子晴：第二次告白（CONF_FAIL second、今天）原本答應那幾句換掉 replace 那一段、換成 with；
//       第一次告白（沒有 CONF_FAIL）照原本；2 keep（芷若、學姊、沛珊、可昕）照原本；3 termend3d.js、date3d.js 答應那一場都經過 CF723.swapYes；
//       4 termDecide 走 second 記 c.second。修改前 FAIL。用法：node tests/confess723_secondyes_unit.js
const H=require('./pg_harness.js'); const {check}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm');
const loadG=(f,n)=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); };
loadG('src/data/decide_rules.js','DECIDE_RULES'); loadG('src/decide3d.js','DECIDE'); loadG('src/data/aa723.js','AA723'); loadG('src/confess723_3d.js','CF723');
const L=AA723.confess.lines, W=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
check('0. aa723.js 照 AA_723 eca6139aa、七位都有 secondYes',/@eca6139aa/.test(AA723.src||'')&&W.every(w=>!!L[w].secondYes),AA723.src);
const tx=x=>typeof x==='string'?x:(x&&x.text);
const yesOf=(G,w)=>{ const D=CONFESS_LINES[w]; const y=typeof D.yes==='function'?D.yes(G,null,0):D.yes; return Array.isArray(y)?y:[]; };
for(const w of ['heroine_01','heroine_03','heroine_04']){ const G=H.fresh('2026-03-01',20,'campus'); const sy=L[w].secondYes, y0=yesOf(G,w);
  const has=sy.replace.every(r=>y0.some(x=>String(tx(x)||'').replace(/[「」\s]/g,'')===r.replace(/[「」\s]/g,'')));
  const first=CF723.swapYes(G,w,y0); CF723.rec(G)[w]={day:G.day-20,cnt:0,ready:G.day-1,done:G.day,second:1}; const sec=CF723.swapYes(G,w,y0).map(tx);
  const exp=y0.map(tx), nz=t=>String(t||'').replace(/[「」\s]/g,''); const idx=[]; let fr=0; for(const r of sy.replace){ const k=exp.findIndex((t,q)=>q>=fr&&nz(t)===nz(r)); idx.push(k); fr=k+1; }
  let want=null; if(idx.every(k=>k>=0)){ want=exp.slice(); const n=idx.length; if(idx[n-1]-idx[0]===n-1) want.splice(idx[0],n,...sy.with); else if(sy.with.length===n) idx.forEach((k,q)=>{ want[k]=sy.with[q]; }); else { for(let q=n-1;q>=1;q--) want.splice(idx[q],1); want.splice(idx[0],1,...sy.with); } }
  check('1. '+w+'：原本答應那幾句裡有 replace 的句子；第一次照原本、第二次換成 with（連在一起整段換、隔旁白一句換一句）',has&&first===y0&&!!want&&J(sec)===J(want),J({has,sec,want})); }
{ const G=H.fresh('2026-03-01',20,'campus'); const y=['A','B']; CF723.rec(G).heroine_02={day:G.day-20,done:G.day,second:1}; check('2. keep（芷若）照原本',CF723.swapYes(G,'heroine_02',y)===y); }
{ const te=fs.readFileSync(path.join(H.ROOT,'src/termend3d.js'),'utf8'), da=fs.readFileSync(path.join(H.ROOT,'src/date3d.js'),'utf8'), cf=fs.readFileSync(path.join(H.ROOT,'src/confess723_3d.js'),'utf8');
  check('3. termend3d.js、date3d.js 答應那一場都經過 CF723.swapYes',/CF723\.swapYes\(G,who,yes\)/.test(te)&&/CF723\.swapYes\(G,id,Y\)/.test(da));
  check('4. termDecide 走 second 記 c.second',/c\.done=G\.day; c\.second=1; return 'second';/.test(cf)); }
H.done();
