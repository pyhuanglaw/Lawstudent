/* STAIR-LEVEL-AUDIT-1111（LAWWW 11-11 09:41 派給 LAWWW2）：全遊戲多樓層區域的樓梯掃描——不需要瀏覽器。
   起因：木曜日的樓梯今天兩個方向都卡過（BB 11-11 PC）：①上樓沿牆滑那一步沒試換層（engine3d.js stepEntity，LAWWW 5f259dd02，所有區域共用）
         ②上層的導航格一路延伸到樓梯下半段，人下樓一直留在上層、走到樓梯底換不回來、門口的出口按不到（mokuyobi3d.js buildNav，LAWWW 2c962ad66）。
   這支：在 Node 建出遊戲真正的每一個區域（index.html 到 teach3d.js 為止的區域檔），挑出有 z.levels（兩層導航）的，
   找出每座「兩層共用」的樓梯段（兩層的 surf 都有、有坡度 axis 的那一段），然後：
     (a) 列出：上層在樓梯下半段站得住的、下層在樓梯上半段站得住的（資訊，不算失敗：雙跑樓梯的上一跑本來就兩層共用；木曜日那一種單跑樓梯才要擋）
     (b) 用引擎真正的 E.stepEntity 照搖桿一步一步推（和 tests/mokuyobi_stair_top_1111_unit.js 同一個做法）：
         每座樓梯 左、中、右 × 上樓、下樓 × 走、跑 × 30、10 fps——
         上樓：從樓梯底端上一點、在底下那一層，往上推：要走到樓梯頂再過去一點、而且在「頂端那一層」（那一點站得住、高度對的那一層）；
         下樓：從樓梯頂端下一點、在上面那一層，往下推：要走到樓梯底再過去一點、而且在「底下那一層」；
         整個過程每一步都站在那一層站得住的地方（換層沒有穿牆）。
     (c) 單跑樓梯（下端在地面 y≈0）下樓：過了樓梯的一半以後還在上面那一層的步數（木曜日 ② 的徵狀；BB 的走法＝直線推到底，木曜日第 4 項）——算失敗。
   校園（萬才館的弧形大樓梯）用的是 fn 曲面、不是 axis 坡道，不在這裡（tests/flow_wancai_stairs.py、tests/nav_buildings_unit.js 管）。
   修改前（木曜日 2c962ad66 以前的 mokuyobi3d.js）：wz_mokuyobi 的 (b) 下樓、(c) FAIL。這是模擬，不是真實玩家流程（D131）。
   用法：node tests/stair_levels_audit_1111_unit.js [區域 id] */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){}, querySelector:()=>null, querySelectorAll:()=>[], body:{appendChild(){},classList:{add(){},remove(){}}} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); const cwarn=console.warn, cerr=console.error; console.warn=()=>{}; console.error=()=>{};
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const all=[...html.matchAll(/src="([^"?]+)/g)].map(m=>m[1]);
const files=[]; for(const f of all){ if(/three-vrm|character3d|props3d/.test(f)) continue; files.push(f); if(/teach3d\.js$/.test(f)) break; }
const loadErr=[]; for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+e.message.slice(0,60)); } }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
check('0. 載入區域檔沒有錯、引擎有 E.stepEntity',!loadErr.length&&typeof E.stepEntity==='function',loadErr.join('；'));
const R=0.32, ONLY=process.argv[2]||null;
const MODES=[[E.SPD.walk,1/30,'走30'],[E.SPD.walk,0.1,'走10'],[E.SPD.run,1/30,'跑30'],[E.SPD.run,0.1,'跑10']];
const key=s=>[s.x0,s.x1,s.z0,s.z1,s.axis,s.ya,s.yb].map(v=>v==null?'':(+v).toFixed(3)).join(',');
function build(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; return z; }
let nZones=0, nStairs=0, nRuns=0;
const info=[];
for(const id of Object.keys(Z3.ZONES)){ if(ONLY&&id!==ONLY) continue; let z; try{ z=build(id); }catch(e){ continue; } if(!z||!Array.isArray(z.levels)||z.levels.length<2) continue; nZones++;
  const LV=z.levels, kb=new Set((LV[1].surf||[]).map(key)), stairs=(LV[0].surf||[]).filter(s=>s.axis&&kb.has(key(s)));
  for(const s of stairs){ nStairs++; const ax=s.axis, lo=ax==='z'?[s.z0,s.z1]:[s.x0,s.x1], cr=ax==='z'?[s.x0,s.x1]:[s.z0,s.z1];
    const uLow=s.ya<=s.yb?lo[0]:lo[1], uHigh=s.ya<=s.yb?lo[1]:lo[0], yLow=Math.min(s.ya,s.yb), yHigh=Math.max(s.ya,s.yb), du=Math.sign(uHigh-uLow), L=Math.abs(uHigh-uLow);
    const P=(u,v)=>ax==='z'?[v,u]:[u,v], U=p=>ax==='z'?p[1]:p[0];
    /* 左中右：樓梯中間那一條橫線上，兩層任一層站得住的最左、中間、最右（樓梯的 surf 範圍常常包含扶手、牆的那一格）*/
    const um=(uLow+uHigh)/2, okV=[]; for(let v=cr[0];v<=cr[1]+1e-6;v+=0.02){ const p=ax==='z'?[v,um]:[um,v]; if(z.levels.some(n=>n.clear(p[0],p[1],R))) okV.push(v); }
    const vs=okV.length?[...new Set([okV[0]+0.02,okV[Math.floor(okV.length/2)],okV[okV.length-1]-0.02].map(v=>+v.toFixed(3)))]:[(cr[0]+cr[1])/2];
    const name=id+' 樓梯 '+ax+(ax==='z'?' x '+cr[0].toFixed(2)+'～'+cr[1].toFixed(2):' z '+cr[0].toFixed(2)+'～'+cr[1].toFixed(2))+'（y '+yLow+'→'+yHigh+'）';
    const okAt=(lv,p,y)=>LV[lv].clear(p[0],p[1],R)&&Math.abs(LV[lv].heightAt(p[0],p[1])-y)<0.35;
    // (a)
    const a1=[], a0=[]; for(const v of vs) for(let t=0.05;t<0.96;t+=0.1){ const p=P(uLow+du*L*t,v); if(t<0.5&&LV[1].clear(p[0],p[1],R)) a1.push(t.toFixed(2)); if(t>0.5&&LV[0].clear(p[0],p[1],R)) a0.push(t.toFixed(2)); }
    info.push(name+'：上層在下半段站得住 '+[...new Set(a1)].length+' 處、下層在上半段站得住 '+[...new Set(a0)].length+' 處');
    // 兩端「站得住、高度對」的那幾層
    /* 每一條（v）兩端「站得住、高度對」的那幾層：樓梯外面 0.5～0.2 m 找得到就要走到那裡；找不到（樓梯頂、底直接接牆）就只要走到樓梯端 0.15 m 內 */
    /* 從樓梯端外面 0.5 m 往裡面找（每 0.05 m）：第一個「某一層站得住、高度對」的點＝那一端要走到的地方、acc＝那幾層。
       樓梯端直接接牆的（木曜日：樓梯底就是外牆，出口在旁邊的門）就停在樓梯上最靠端的那一點 */
    const yAt=u=>{ const t=Math.max(0,Math.min(1,(u-uLow)/(uHigh-uLow))); return yLow+(yHigh-yLow)*t; };
    const beyond=(u,y,sg,v)=>{ for(let d=0.5;d>=-1.0;d-=0.05){ const uu=u+sg*d, yy=d>0?y:yAt(uu), acc=[0,1].filter(lv=>okAt(lv,P(uu,v),yy)); if(acc.length) return {acc,d,u:uu}; } return {acc:[],d:0,u}; };
    const single=yLow<0.05;
    const bad=[], soft=[];
    for(const v of vs){ const accLow=beyond(uLow,yLow,-du,v), accHigh=beyond(uHigh,yHigh,du,v);
     const sUp=accLow.d>0?uLow+du*0.25:accLow.u+du*0.15, sDn=accHigh.d>0?uHigh-du*0.25:accHigh.u-du*0.15;
     for(const [dir,startU,startLv,endU,acc,sg] of [['上樓',sUp,null,accHigh.u,accHigh.acc,du],['下樓',sDn,null,accLow.u,accLow.acc,-du]]) for(const [sp,dt,mt] of MODES){ nRuns++;
      const p0=P(startU,v), lvs=[0,1].filter(lv=>LV[lv].clear(p0[0],p0[1],R)); if(!lvs.length){ bad.push(dir+' v'+v.toFixed(2)+mt+'：起點兩層都站不住'); continue; }
      const lv0=dir==='上樓'?(lvs.includes(accLow.acc[0])?accLow.acc[0]:lvs[0]):(lvs.includes(accHigh.acc[accHigh.acc.length-1])?accHigh.acc[accHigh.acc.length-1]:lvs[lvs.length-1]);
      const ent={obj:{position:new THREE.Vector3(p0[0],0,p0[1]),rotation:{y:0}},radius:R,lv:lv0}; const dv=ax==='z'?[0,sg]:[sg,0];
      let ok=false, unclear=0, upperLowHalf=0; const N=Math.ceil((L/sp*3+6)/dt);
      for(let i=0;i<N;i++){ E.stepEntity(ent,dv[0],dv[1],sp,dt); const o=ent.obj.position, u=ax==='z'?o.z:o.x;
        if(!LV[ent.lv|0].clear(o.x,o.z,R-0.02)) unclear++;
        if(dir==='下樓'&&single&&(u-uLow)*du<L*0.5-0.05&&(u-uLow)*du>0&&(ent.lv|0)===1) upperLowHalf++;
        if((u-endU)*sg>=-(0.02+sp*dt/2)&&acc.includes(ent.lv|0)){ ok=true; break; } }   /* 端點直接接牆時，低幀率跑步最後一步會差不到半步（走不進牆裡）：容許半步 */
      const o=ent.obj.position, rec=dir+' v'+v.toFixed(2)+' '+mt+'：停在 ('+o.x.toFixed(2)+','+o.z.toFixed(2)+') lv'+(ent.lv|0)+'（要到 '+(ax)+' '+endU.toFixed(2)+'、lv '+acc.join('/')+'）';
      if(!ok) bad.push(rec); else if(unclear) bad.push(rec.replace('停在','到了，但')+' 有 '+unclear+' 步站在站不住的地方');
      if(upperLowHalf) bad.push(dir+' v'+v.toFixed(2)+' '+mt+'：過了一半以後還有 '+upperLowHalf+' 步在上面那一層'); } }
    check(name+'：左中右 × 上下樓 × 走跑 × 30／10 fps 都走得到、換到對的那一層、沒有站在站不住的地方'+(single?'、下樓過了一半就在下面那一層':''),!bad.length,bad.slice(0,5).join('｜')+(bad.length>5?'｜…共 '+bad.length+' 件':'')); } }
check('1. 掃到的多樓層區域 ≥ 14 個、共用的樓梯段 ≥ 14 座（'+nZones+' 個區域、'+nStairs+' 座、'+nRuns+' 趟）',ONLY?true:(nZones>=14&&nStairs>=14));
for(const t of info) console.log('（資訊）'+t);
console.warn=cwarn; console.error=cerr;
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
