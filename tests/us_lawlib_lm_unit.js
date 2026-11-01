// 美國法學院圖書館（us_lawlib）室內的光照貼圖（INTERIOR-AAA-REVIEW-1028 美國那一批，LAWWW2-B 2026-10-31）——不需要瀏覽器。
// us3d.js 的 us_lawlib 區域用 Z3.attachRoomGLB 接 us_lawlib.glb，看到場景的 extras.lightmap 就接光照貼圖（不用改程式）。這支檢查：
//   ①extras.lightmap 白天、晚上兩張都在；沒有 dayEmit（天窗、彩色玻璃晚上變暗是 us3d.js 的 skyTint 在調，roomLightmap 再調一次會變兩倍暗）
//   ②地毯、天花板（樓板底）、米白飾帶、石地、深色家具、淺木（書架、桌子）、書背、樓梯、軟椅布、牆、護牆板、大門有第二套 UV（TEXCOORD_1）
//   ③天窗、彩色玻璃、發光面（嵌燈、螢幕、樓梯小燈、出口燈）、玻璃欄杆、門的玻璃、紅絨繩、黃銅柱、小立牌、欄杆鋼柱、鐵線雕塑照舊即時光（沒有第二套 UV）
//   ④二樓開放時要藏的紅絨繩、小立牌、黃銅柱（us_lawlib_2f.layout.json 的 glb_hide）照舊在
//   ⑤區域照舊用 attachRoomGLB 接正式模型，照舊照時段調天窗、彩色玻璃（skyTint）
//   ⑦牆有朝室內的面（10-31 光照烘焙找到：腳本原本那一面朝外、遊戲裡看得到是靠單面化補的反面；烘焙拿掉反面後只剩朝外那面，從室內看牆整片不見）
// 用法：node tests/us_lawlib_lm_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const REL='assets/models/env/second_ai/us_lawlib.glb', b=fs.readFileSync(path.join(ROOT,REL)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8'));
const sc=j.scenes[j.scene||0], lm=sc.extras&&sc.extras.lightmap, files=lm?['day','night'].map(t=>lm[t]):[];
check('① extras.lightmap 的白天、晚上兩張都在',!!lm&&files.length===2&&files.every(f=>f&&fs.existsSync(path.join(ROOT,f))),JSON.stringify(lm||null).slice(0,220));
check('① 沒有 dayEmit（天窗、彩色玻璃由 skyTint 調）',!!lm&&!('dayEmit' in lm));
const node=nm=>j.nodes.find(x=>x.name===nm);
const uv1=nm=>{ const nd=node(nm); if(!nd||nd.mesh==null) return null; return j.meshes[nd.mesh].primitives.every(p=>p.attributes.TEXCOORD_1!=null); };
const BAKE=['usll_carpet','usll_ceiling','usll_cream','usll_floor_stone','usll_furniture_dark','usll_oak','usll_shelf_faces','usll_stair_white','usll_upholstery','WALL_N_wall','WALL_E_wall','WALL_S_wall','WALL_W_wall','WALL_N_wainscot','WALL_S_door'];
const got=BAKE.map(x=>[x,uv1(x)]);
check('② 地毯、天花板、飾帶、石地、家具、書架、書背、樓梯、牆、護牆板、大門有第二套 UV',got.every(([,v])=>v===true),JSON.stringify(got.filter(([,v])=>v!==true)));
const LIVE=['usll_skylight','WALL_N_stained','GLOW_usll_downlights','GLOW_usll_screens','GLOW_usll_stair_lamps','WALL_S_exit_sign','usll_rail_glass','WALL_S_door_glass','usll_rope','usll_rope_sign','usll_stanchions','usll_rail_posts','usll_wire_spheres'];
const live=LIVE.map(x=>[x,uv1(x)]);
check('③ 天窗、彩色玻璃、發光面、玻璃、紅絨繩、黃銅柱、立牌、鋼柱、鐵線雕塑沒有第二套 UV（照舊即時光）',live.every(([,v])=>v===false),JSON.stringify(live.filter(([,v])=>v!==false)));
{ const L2=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/us_lawlib_2f.layout.json'),'utf8')), miss=(L2.glb_hide||[]).filter(x=>!node(x));
  check('④ 二樓開放時要藏的節點照舊在（'+(L2.glb_hide||[]).join('、')+'）',(L2.glb_hide||[]).length>0&&!miss.length,miss.join('、')); }
{ const src=fs.readFileSync(path.join(ROOT,'src/us3d.js'),'utf8'), i=src.indexOf("ASSETS.loadOne('bldg.us_lawlib')"), body=i>=0?src.slice(i,i+1200):'';
  check('⑤ 照舊用 attachRoomGLB 接正式模型、照時段調天窗和彩色玻璃',/Z3\.attachRoomGLB\(z,g0,fb,root\)/.test(body)&&/usll_\(skylight\|stained_glass\)/.test(body),body?'':'找不到 us_lawlib 的載入'); }
function faceDirs(nodeName){ const nd=j.nodes.find(x=>x.name===nodeName), bin=b.slice(20+n+8), out={'+x':0,'-x':0,'+y':0,'-y':0,'+z':0,'-z':0};
  if(!nd||nd.mesh==null) return null;
  for(const p of j.meshes[nd.mesh].primitives){ const a=j.accessors[p.attributes.POSITION], bv=j.bufferViews[a.bufferView], o=(bv.byteOffset||0)+(a.byteOffset||0), st=bv.byteStride||12, V=k=>[0,1,2].map(c=>bin.readFloatLE(o+k*st+c*4));
    const ia=j.accessors[p.indices], ib=j.bufferViews[ia.bufferView], io=(ib.byteOffset||0)+(ia.byteOffset||0), sz={5125:4,5123:2,5121:1}[ia.componentType], I=k=>sz===4?bin.readUInt32LE(io+k*4):sz===2?bin.readUInt16LE(io+k*2):bin.readUInt8(io+k);
    for(let k=0;k<ia.count;k+=3){ const A=V(I(k)),B=V(I(k+1)),C=V(I(k+2)), u=[B[0]-A[0],B[1]-A[1],B[2]-A[2]], v=[C[0]-A[0],C[1]-A[1],C[2]-A[2]], nn=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]], L=Math.hypot(...nn)||1;
      for(let c=0;c<3;c++){ if(nn[c]/L>0.9) out['+'+'xyz'[c]]++; else if(nn[c]/L<-0.9) out['-'+'xyz'[c]]++; } } }
  return out; }
{ const W=[['WALL_N_wall','+z'],['WALL_S_wall','-z'],['WALL_E_wall','-x'],['WALL_W_wall','+x'],['WALL_N_wainscot','+z'],['WALL_W_wainscot','+x']], bad=[]; for(const [nm,dir] of W){ const d=faceDirs(nm); if(!d||!d[dir]) bad.push(nm+'（'+(d?JSON.stringify(d):'沒有')+'）'); }
  check('⑦ 牆、護牆板有朝室內的面（光照烘焙拿掉疊在一起的反面以後，留下的要是從室內看得到的那一面；10-31 第一版法學院圖書館四面牆只剩朝外的面，整片不見）',!bad.length,bad.join('；')); }
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
