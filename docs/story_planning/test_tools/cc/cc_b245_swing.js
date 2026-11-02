// CC（帳號 A）11-02 BB_245 第二批 #3：BUG-SWING-SEAT 小公園鞦韆座位（Node，不開瀏覽器、不改 src/）。
// LAWWW 驗法（BB245_LAWWW_REPLY_1102.md 第一節）：探針：GLB 座板節點和 wz_park_layout 座位差 <0.1 m；瀏覽器 20:00 後盪鞦韆截圖（截圖在 cc_b245_swing_shot_probe.py）。
// 讀碼：遊戲載的是 assets/models/env/second_ai/wz_park.glb（bldg.wz_park）；匯出時 ART-PARK2 的鞦韆（park2_props.glb 的 PARK_SWING_SEAT_A／B 節點）已經
//   照 layout 的 swings 位置擺好、併進 park2 那一個網格（wz_park.glb 裡沒有單獨的 SEAT 節點）。所以這裡直接讀遊戲那一份 GLB 的頂點：
//   鞦韆架範圍（swings 中心 ±1.7 m（避開兩側支架腳）、z ±1.7 m）、高度 0.3～0.7 m 的頂點＝座板（＋鐵鍊最下面一小段），以 swings 中心 x 分左右兩群，
//   每群取 x、z 的中點＝座板中心；座板頂＝高度 ≤0.55 m 的頂點最高的那個（鐵鍊在座板上面，不算）。
// 檢查：WZ_PARK_LAYOUT.seats 裡 kind:'swing' 的每個座位，到最近的座板中心水平距離 < 0.1 m；兩個座位各對到不同的座板。
//   座位沒有高度欄位（坐下的高度由坐姿決定），座板頂高度只印 INFO（ART-PARK2 寫座面 0.48 m）。
// 回覆文件和派工說明的差別：派工寫「座板和座位的高度差小於 0.1 m」，回覆文件寫「座位差 <0.1 m」——以回覆文件為準（水平位置），高度只記。
// 修正 commit：30430910（鞦韆 A z 24.2→25.0、B z 24.2→24.8）；對照＝30430910^（預期 FAIL：座位在座板前面 0.6～0.8 m）。
// 用法：cd <受測工作樹> && node <本檔>（工作樹要有 src/data/wz_park_layout.js 和 assets/models/env/second_ai/wz_park.glb）
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=process.cwd();
let fails=0; const FL=[];
const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok){ fails++; FL.push(n); } };
const info=s=>console.log('INFO '+s);
let sha='?'; try{ sha=cp.execSync('git rev-parse --short HEAD',{cwd:ROOT}).toString().trim(); }catch(e){}
console.log('cc_b245_swing　受測 '+ROOT+'（'+sha+'）');
const src=fs.readFileSync(path.join(ROOT,'src/data/wz_park_layout.js'),'utf8').replace(/^const WZ_PARK_LAYOUT\s*=/m,'globalThis.WZ_PARK_LAYOUT=');
vm.runInThisContext(src,{filename:'wz_park_layout.js'});
const L=WZ_PARK_LAYOUT, sw=L.items.find(i=>i.kind==='swings'), seats=L.seats.filter(s=>s.kind==='swing');
check('layout 有鞦韆（items kind swings）和 2 個 kind:swing 座位',!!sw&&seats.length===2,JSON.stringify({sw:sw&&{x:sw.x,z:sw.z,w:sw.w},seats}));
const GLB=path.join(ROOT,'assets/models/env/second_ai/wz_park.glb');
if(!fs.existsSync(GLB)||!sw){ check('有 wz_park.glb',false,GLB); console.log('FAILED '+fails); process.exit(1); }
/* ---- 讀 GLB（JSON＋BIN chunk；POSITION 是 float、沒有壓縮）---- */
const b=fs.readFileSync(GLB); const jl=b.readUInt32LE(12); const J=JSON.parse(b.slice(20,20+jl).toString('utf8')); const bo=20+jl, bl=b.readUInt32LE(bo); const BIN=b.slice(bo+8,bo+8+bl);
const ext=J.extensionsRequired||[]; check('GLB 沒有頂點壓縮（可以直接讀 POSITION）',!ext.some(e=>/meshopt|draco|quantiz/i.test(e)),JSON.stringify(ext));
/* 節點的世界矩陣（只用 translation／rotation／scale）*/
const mul=(a,c)=>{ const o=new Array(16).fill(0); for(let i=0;i<4;i++) for(let j=0;j<4;j++) for(let k=0;k<4;k++) o[j*4+i]+=a[k*4+i]*c[j*4+k]; return o; };
const trs=n=>{ if(n.matrix) return n.matrix.slice(); const t=n.translation||[0,0,0], q=n.rotation||[0,0,0,1], s=n.scale||[1,1,1]; const [x,y,z,w]=q;
  return [(1-2*(y*y+z*z))*s[0],(2*(x*y+z*w))*s[0],(2*(x*z-y*w))*s[0],0,(2*(x*y-z*w))*s[1],(1-2*(x*x+z*z))*s[1],(2*(y*z+x*w))*s[1],0,(2*(x*z+y*w))*s[2],(2*(y*z-x*w))*s[2],(1-2*(x*x+y*y))*s[2],0,t[0],t[1],t[2],1]; };
const I=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]; const world=new Array(J.nodes.length);
const walk=(i,P)=>{ const M=mul(P,trs(J.nodes[i])); world[i]=M; for(const c of (J.nodes[i].children||[])) walk(c,M); };
const roots=(J.scenes&&J.scenes[J.scene||0]&&J.scenes[J.scene||0].nodes)||J.nodes.map((n,i)=>i).filter(i=>!J.nodes.some(n=>(n.children||[]).includes(i)));
roots.forEach(r=>walk(r,I));
const pts=[]; const named=[];
J.nodes.forEach((n,ni)=>{ if(/SWING/i.test(n.name||'')) named.push(n.name); if(n.mesh==null||!world[ni]) return; if(n.extensions&&n.extensions.EXT_mesh_gpu_instancing) return;   /* 有 instancing 的是樹、燈這類重複物件 */
  const M=world[ni];
  for(const p of J.meshes[n.mesh].primitives){ const a=J.accessors[p.attributes.POSITION]; if(a.componentType!==5126) continue; const bv=J.bufferViews[a.bufferView]; const st=bv.byteStride||12, o0=(bv.byteOffset||0)+(a.byteOffset||0);
    for(let k=0;k<a.count;k++){ const x=BIN.readFloatLE(o0+k*st), y=BIN.readFloatLE(o0+k*st+4), z=BIN.readFloatLE(o0+k*st+8);
      const X=M[0]*x+M[4]*y+M[8]*z+M[12], Y=M[1]*x+M[5]*y+M[9]*z+M[13], Z=M[2]*x+M[6]*y+M[10]*z+M[14];
      if(Math.abs(X-sw.x)<1.7&&Math.abs(Z-sw.z)<1.7&&Y>0.3&&Y<0.7) pts.push([X,Y,Z,n.name]); } } });
info('GLB 裡名字有 SWING 的節點：'+JSON.stringify(named)+'（空＝鞦韆已併進別的網格）；鞦韆範圍 0.3～0.7 m 的頂點 '+pts.length+' 個，來自 '+JSON.stringify([...new Set(pts.map(p=>p[3]))]));
const boards=[]; for(const side of [-1,1]){ const g=pts.filter(p=>(p[0]-sw.x)*side>0); if(!g.length) continue;
  const mn=k=>Math.min(...g.map(p=>p[k])), mx=k=>Math.max(...g.map(p=>p[k])); const low=g.filter(p=>p[1]<=0.55);
  boards.push({x:(mn(0)+mx(0))/2,z:(mn(2)+mx(2))/2,w:mx(0)-mn(0),d:mx(2)-mn(2),top:low.length?Math.max(...low.map(p=>p[1])):null,bottom:mn(1),n:g.length}); }
info('座板（GLB）：'+JSON.stringify(boards.map(q=>({x:+q.x.toFixed(3),z:+q.z.toFixed(3),寬:+q.w.toFixed(2),深:+q.d.toFixed(2),頂:q.top&&+q.top.toFixed(3),底:+q.bottom.toFixed(3),頂點:q.n}))));
check('GLB 找得到兩塊座板（鞦韆架左右各一，寬 0.3～0.7 m）',boards.length===2&&boards.every(q=>q.w>0.3&&q.w<0.7),String(boards.length));
const used=new Set();
seats.forEach((s,i)=>{ let best=-1, bd=1e9; boards.forEach((q,j)=>{ const d=Math.hypot(q.x-s.x,q.z-s.z); if(d<bd){ bd=d; best=j; } });
  if(best>=0) used.add(best);
  check('鞦韆座位 '+(i+1)+'（'+s.x+', '+s.z+'）和 GLB 座板中心水平距離 < 0.1 m',bd<0.1,'距離 '+(isFinite(bd)?bd.toFixed(3):'?')+' m（座板 '+(best>=0?boards[best].x.toFixed(3)+', '+boards[best].z.toFixed(3):'?')+'；dx '+(best>=0?(s.x-boards[best].x).toFixed(3):'?')+'、dz '+(best>=0?(s.z-boards[best].z).toFixed(3):'?')+'）');
  if(best>=0) info('座位 '+(i+1)+' 對到的座板頂高 '+(boards[best].top!=null?boards[best].top.toFixed(3):'?')+' m（ART-PARK2 寫座面 0.48 m；遊戲的座位沒有高度欄位）'); });
check('兩個鞦韆座位各對到不同的座板',used.size===2,String(used.size));
console.log(fails?('FAILED '+fails+'：'+FL.join('、')):'ALL PASS');
process.exit(fails?1:0);
