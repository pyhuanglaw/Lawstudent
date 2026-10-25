// 招牌稽核（LAWWW2-B 2026-10-25）：字左右相反的牌子、舞台的深色木地板——不需要瀏覽器，讀 GLB。
//   1. 機場出境（airport_dep.glb）換匯櫃台看板 GLOW_ap_fx_board：看板朝 −x（人站在 x 小的那一邊、面向 +x，右手邊＝+z）→ u 要往 +z 變大；
//   2. 美國社區（us_community.glb）公車站牌 usc_bus_sign 兩面：x 大的那一面（人面向 −x，右手邊＝−z）u 往 −z 變大；x 小的那一面（人面向 +x）u 往 +z 變大；
//   3. 3F 主球場（gym_arena.glb）舞台台面 arena_stage_deck 不是深色木板：沒有貼圖、顏色是紅地毯（和開學典禮 2D 背景 v3 一樣）；
//      裙板 SET_STAGE_skirt 用深紅的 arena_stage_skirt_red（演唱會帳篷頂照舊用黑的 arena_stage_skirt）。
// 修改前 FAIL。用法：node tests/sign_audit_1025_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
function glb(f){ const buf=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai',f)), jl=buf.readUInt32LE(12), J=JSON.parse(buf.slice(20,20+jl).toString('utf8')), bin0=20+jl+8;
  const acc=(ai,k)=>{ const a=J.accessors[ai], v=J.bufferViews[a.bufferView], off=bin0+(v.byteOffset||0)+(a.byteOffset||0), st=v.byteStride||k*4, out=[];
    for(let i=0;i<a.count;i++){ const r=[]; for(let j=0;j<k;j++) r.push(buf.readFloatLE(off+i*st+j*4)); out.push(r); } return out; };
  const idx=ai=>{ const a=J.accessors[ai], v=J.bufferViews[a.bufferView], off=bin0+(v.byteOffset||0)+(a.byteOffset||0), sz=a.componentType===5125?4:2, out=[];
    for(let i=0;i<a.count;i++) out.push(sz===4?buf.readUInt32LE(off+i*4):buf.readUInt16LE(off+i*2)); return out; };
  return {J,acc,idx}; }
// 每個三角形：u 對 z 的偏導（人面向的方向由呼叫的人決定）。節點沒有旋轉／縮放（Blender 匯出時套用了），只加平移
function tris(G,name){ const n=G.J.nodes.find(q=>q.name===name); if(!n) return null; const t=n.translation||[0,0,0], out=[];
  for(const pr of G.J.meshes[n.mesh].primitives){ const P=G.acc(pr.attributes.POSITION,3).map(p=>[p[0]+t[0],p[1]+t[1],p[2]+t[2]]), T=G.acc(pr.attributes.TEXCOORD_0,2), I=pr.indices!=null?G.idx(pr.indices):P.map((_,i)=>i);
    for(let k=0;k<I.length;k+=3){ const a=I[k],b=I[k+1],c=I[k+2], z1=P[b][2]-P[a][2], y1=P[b][1]-P[a][1], z2=P[c][2]-P[a][2], y2=P[c][1]-P[a][1], u1=T[b][0]-T[a][0], u2=T[c][0]-T[a][0], det=z1*y2-z2*y1;
      out.push({x:(P[a][0]+P[b][0]+P[c][0])/3, dudz:Math.abs(det)<1e-9?0:(u1*y2-u2*y1)/det}); } }
  return out; }
{ const T=tris(glb('airport_dep.glb'),'GLOW_ap_fx_board');
  check('1. 機場換匯看板：人面向 +x 看，字是正的（u 往 +z 變大）', !!T&&T.length>0&&T.every(t=>t.dudz>0), T?T.map(t=>t.dudz.toFixed(2)).join(' '):'找不到'); }
{ const T=tris(glb('us_community.glb'),'usc_bus_sign');
  if(!T) check('2. 找得到公車站牌',false);
  else { const xm=(Math.max(...T.map(t=>t.x))+Math.min(...T.map(t=>t.x)))/2, E=T.filter(t=>t.x>xm), W=T.filter(t=>t.x<=xm);
    check('2. 公車站牌 x 大的那一面：人面向 −x 看，字是正的（u 往 −z 變大）', E.length>0&&E.every(t=>t.dudz<0), E.map(t=>t.dudz.toFixed(2)).join(' '));
    check('2. 公車站牌 x 小的那一面：人面向 +x 看，字是正的（u 往 +z 變大）', W.length>0&&W.every(t=>t.dudz>0), W.map(t=>t.dudz.toFixed(2)).join(' ')); } }
{ const G=glb('gym_arena.glb'), M=G.J.materials, deck=M.find(m=>m.name==='arena_stage_deck'), pb=deck&&deck.pbrMetallicRoughness;
  const lin2s=c=>Math.round(255*(c<=0.0031308?c*12.92:1.055*Math.pow(c,1/2.4)-0.055)), rgb=pb&&pb.baseColorFactor?pb.baseColorFactor.slice(0,3).map(lin2s):null;
  check('3. 舞台台面沒有木紋貼圖、是紅地毯（約 #9a1f26）', !!pb&&!pb.baseColorTexture&&!!rgb&&Math.abs(rgb[0]-0x9a)<=6&&Math.abs(rgb[1]-0x1f)<=6&&Math.abs(rgb[2]-0x26)<=6, rgb?'rgb '+rgb.join(','):'找不到或有貼圖');
  const sk=G.J.nodes.find(n=>n.name==='SET_STAGE_skirt'), skm=sk&&M[G.J.meshes[sk.mesh].primitives[0].material];
  check('3. 舞台裙板用深紅的 arena_stage_skirt_red', !!skm&&skm.name==='arena_stage_skirt_red', skm&&skm.name); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
