/* SHOP-WINDOW-3D-1112（LAWWW2-C）：新生南路的店從街上看進去是立體的（不是貼一張參考圖），打烊會暗。
   node tests/shop_window3d_1112_unit.js */
const fs=require('fs'),path=require('path'),vm=require('vm'); const R=path.join(__dirname,'..'); let fail=0;
const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fail++; };
const glb=fs.readFileSync(path.join(R,'assets/models/env/second_ai/xinsheng_street.glb')); const jl=glb.readUInt32LE(12); const J=JSON.parse(glb.slice(20,20+jl).toString('utf8')); const bin=glb.slice(20+jl+8);
const acc=i=>{ const a=J.accessors[i], bv=J.bufferViews[a.bufferView]; const n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type]; const off=(bv.byteOffset||0)+(a.byteOffset||0); const st=bv.byteStride||0;
  const out=[]; for(let k=0;k<a.count;k++){ const o=off+k*(st||n*(a.componentType===5126?4:a.componentType===5123?2:a.componentType===5125?4:1)); const r=[]; for(let c=0;c<n;c++) r.push(a.componentType===5126?bin.readFloatLE(o+c*4):a.componentType===5123?bin.readUInt16LE(o+c*2):a.componentType===5125?bin.readUInt32LE(o+c*4):bin.readUInt8(o+c)); out.push(r); } return out; };
const DONE=['dabu','haopai','xsports','shanlan','tongxian','dakou'];   /* 做好立體店內的店（一間一間加） */
for(const id of DONE){ const ni=J.nodes.findIndex(n=>n.name==='sk_in_'+id||n.name==='sk_in_'+id+'_wz_in_shop'); ok(ni>=0,'① 模型裡有 sk_in_'+id+'（立體店內的網格）'); if(ni<0) continue;
  const nd=J.nodes[ni], me=J.meshes[nd.mesh]; let tris=0, x0=1e9,x1=-1e9,y1=-1e9; const T=nd.translation||[0,0,0];
  for(const p of me.primitives){ const P=acc(p.attributes.POSITION); tris+=J.accessors[p.indices].count/3; for(const v of P){ x0=Math.min(x0,v[0]+T[0]); x1=Math.max(x1,v[0]+T[0]); y1=Math.max(y1,v[1]+T[1]); } }
  ok(x1-x0>=2.8,'② '+id+' 店內的深度 '+(x1-x0).toFixed(2)+' m ≥ 2.8 m（原本的景深卡只有 0.8 m）');
  ok(tris>=1000&&tris<=11000,'③ '+id+' 店內 '+tris+' 個三角形（有東西、沒有超過 11000）');
  const mat=J.materials[me.primitives[0].material]; ok(mat&&/^wz_in_/.test(mat.name)&&mat.extensions&&mat.extensions.KHR_materials_unlit,'④ '+id+' 店內材質 '+(mat&&mat.name)+' 是 unlit、名字 wz_in_ 開頭（不投影）');
  ok(y1<=3.3,'⑤ '+id+' 店內最高 '+y1.toFixed(2)+' m，沒有穿出一樓'); }
ok(!J.nodes.some(n=>/^GLOW_shopin/.test(n.name||'')),'⑥ 立體店內不放 GLOW_shopin（整條街一個光暈網格，打烊關不掉）');
/* 景深卡：做好的店不再用那一張參考圖（xs_fronts 的 <店>_int 那一格）——看 wz_street.py 的設定和 wz_shopkit.py 的分支 */
const kit=fs.readFileSync(path.join(R,'tools/blender/env_second/wz_shopkit.py'),'utf8');
ok(/XS_IN3D = \{[^}]*'dabu'/.test(kit)&&/in3d = bool\(c\.get\('int'\)\) and SET (== 'xinsheng'|in \('xinsheng', 'tingzhou'\)) and xs_inside3d/.test(kit),'⑦ wz_shopkit.py：XS_IN3D 有 dabu，xs_front 有立體店內就不放景深卡');
/* 遊戲端：Z3.shopInsideLit 打烊調暗 */
const src=fs.readFileSync(path.join(R,'src/zones3d.js'),'utf8'); const a=src.indexOf('  function shopInsideLit('); let d=0,b=-1; for(let i=src.indexOf('{',a);i<src.length;i++){ if(src[i]==='{') d++; else if(src[i]==='}'){ d--; if(d===0){ b=i+1; break; } } }
ok(a>0&&b>a,'⑧ zones3d.js 有 shopInsideLit'); ok(/shopInsideLit,/.test(src.slice(src.lastIndexOf('return {B1C'))),'⑨ Z3 匯出 shopInsideLit');
const mk=(name)=>({name,isMesh:true,parent:null,material:{name:'wz_in_shop',userData:{},color:{r:1,setRGB(r){ this.r=r; }},clone(){ return {name:this.name,userData:{},color:{r:1,setRGB(r){ this.r=r; }}}; }}});
const root={name:'root',children:[mk('sk_in_dabu_wz_in_shop'),mk('sk_in_haopai_wz_in_shop_1'),mk('sk_in_other'),mk('wall')],traverse(f){ f(this); this.children.forEach(f); }}; root.children.forEach(c=>c.parent=root);
const shared=root.children[0].material; root.children[1].material=shared;
const ctx={GAME:{G:{hour:14,day:3}},PLACES:{isOpen:(z,h)=>z==='xs_dabu'?(h>=11&&h<22):true,typhoonClosed:()=>false}}; vm.createContext(ctx); vm.runInContext(src.slice(a,b)+'; this.fn=shopInsideLit;',ctx);
const zone={update:null}; const Rr=ctx.fn(root,zone,{dabu:'xs_dabu',haopai:'xs_haopai'});
ok(Rr&&Rr.items.length===2,'⑩ 只接對照表上的店（dabu、haopai_1）：'+(Rr&&Rr.items.map(q=>q.id).join('、')));
ok(Rr.items[0].mat!==shared&&Rr.items[0].mat!==Rr.items[1].mat,'⑪ 每一間各自一份材質（共用的話一間打烊整條街都暗）');
ok(Rr.items[0].mat.color.r===1,'⑫ 14:00 大步營業：亮度 1');
ctx.GAME.G.hour=23; for(let i=0;i<31;i++) zone.update(0.016,{});
ok(Rr.items[0].mat.color.r===0.07&&Rr.items[1].mat.color.r===1,'⑬ 23:00 大步打烊：調到 0.07；好拍照自己的營業時間（'+Rr.items[1].mat.color.r+'）');
ctx.GAME.G.hour=12; for(let i=0;i<31;i++) zone.update(0.016,{}); ok(Rr.items[0].mat.color.r===1,'⑭ 隔天 12:00 開門：調回 1');
const xs=fs.readFileSync(path.join(R,'src/xinsheng3d.js'),'utf8'); ok(/Z3\.shopInsideLit\(xsR,zone,S\.SHOP_IN_PLACE\)/.test(xs)&&/SHOP_IN_PLACE=\{dabu:'xs_dabu'/.test(xs),'⑮ xinsheng3d.js 接上（S.SHOP_IN_PLACE）');
console.log(fail?('FAILED '+fail):'ALL PASS'); process.exit(fail?1:0);
