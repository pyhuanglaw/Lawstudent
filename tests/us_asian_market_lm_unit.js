// 美國竹葉亞洲超市（us_asian_market）室內的光照貼圖（INTERIOR-AAA-REVIEW-1028 美國那一批，LAWWW2-B 2026-10-31）——不需要瀏覽器。
// us3d.js 的 us_asian_market 區域用 Z3.attachRoomGLB 接 us_asian_market.glb，看到場景的 extras.lightmap 就接光照貼圖（不用改程式）。這支檢查：
//   ①extras.lightmap 白天、晚上兩張都在
//   ②地板、天花板、輕鋼架、踢腳板、貨架、冷藏櫃的背板和框、收銀台、洞洞板、門口地墊、牆、紅色飾帶、正面的窗框有第二套 UV（TEXCOORD_1）
//   ③發光面（燈盤、冷藏櫃的燈、燈籠、螢幕）、玻璃（正面、門、冷藏櫃的門）、門外的景、店外的停車場和人行道、商品、價格條、小東西、招牌照舊即時光（沒有第二套 UV）
//   ④鏡頭比天花板高時要藏的天花板、輕鋼架、燈盤（us3d.js）照舊在
//   ⑤區域照舊用 attachRoomGLB 接正式模型
//   ⑥天花板朝下（光照烘焙會拿掉疊在一起的反面、只留一面：留下的要是朝下、從店裡看得到的那一面；第一版烘完天花板正面朝上，從店裡往上看整片不見）
//   ⑦牆有朝室內的面（10-31 光照烘焙找到：腳本原本那一面朝外、遊戲裡看得到是靠單面化補的反面；烘焙拿掉反面後只剩朝外那面，從室內看牆整片不見）
// 用法：node tests/us_asian_market_lm_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const REL='assets/models/env/second_ai/us_asian_market.glb', b=fs.readFileSync(path.join(ROOT,REL)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8'));
const sc=j.scenes[j.scene||0], lm=sc.extras&&sc.extras.lightmap, files=lm?['day','night'].map(t=>lm[t]):[];
check('① extras.lightmap 的白天、晚上兩張都在',!!lm&&files.length===2&&files.every(f=>f&&fs.existsSync(path.join(ROOT,f))),JSON.stringify(lm||null).slice(0,220));
const node=nm=>j.nodes.find(x=>x.name===nm);
const uv1=nm=>{ const nd=node(nm); if(!nd||nd.mesh==null) return null; return j.meshes[nd.mesh].primitives.every(p=>p.attributes.TEXCOORD_1!=null); };
const BAKE=['usam_floor','usam_ceiling','usam_grid','usam_kickplate','usam_shelves','usam_case_back','usam_case_frames','usam_counter_top','usam_wood','usam_pegboard','usam_entry_mat','WALL_N_wall','WALL_E_wall','WALL_W_wall','WALL_S_wall','WALL_N_band','WALL_S_mullions'];
const got=BAKE.map(x=>[x,uv1(x)]);
check('② 地板、天花板、輕鋼架、貨架、冷藏櫃、收銀台、牆、飾帶、窗框有第二套 UV',got.every(([,v])=>v===true),JSON.stringify(got.filter(([,v])=>v!==true)));
const LIVE=['GLOW_usam_troffers','GLOW_usam_case','GLOW_usam_lanterns','GLOW_usam_screens','WALL_S_glass','WALL_S_door','usam_case_doors','usam_view','usam_out_lot','usam_out_walk','usam_out_lines','usam_products','usam_price','usam_vc','usam_signs','WALL_N_sign'];
const live=LIVE.map(x=>[x,uv1(x)]);
check('③ 發光面、玻璃、門外的景、店外、商品、價格條、小東西、招牌沒有第二套 UV（照舊即時光）',live.every(([,v])=>v===false),JSON.stringify(live.filter(([,v])=>v!==false)));
{ const miss=['usam_ceiling','usam_grid','GLOW_usam_troffers'].filter(x=>!node(x)); check('④ 鏡頭在天花板上面時要藏的天花板、輕鋼架、燈盤照舊在',!miss.length,miss.join('、')); }
{ const src=fs.readFileSync(path.join(ROOT,'src/us3d.js'),'utf8'), i=src.indexOf("ASSETS.loadOne('bldg.us_asian_market')"), body=i>=0?src.slice(i,i+600):'';
  check('⑤ 照舊用 attachRoomGLB 接正式模型',/Z3\.attachRoomGLB\(z,g0,fb,root\)/.test(body),body?'':'找不到 us_asian_market 的載入'); }
{ const nd=node('usam_ceiling'), bin=b.slice(20+n+8); let dn=0, up=0;
  if(nd&&nd.mesh!=null) for(const p of j.meshes[nd.mesh].primitives){ const a=j.accessors[p.attributes.POSITION], bv=j.bufferViews[a.bufferView], o=(bv.byteOffset||0)+(a.byteOffset||0), st=bv.byteStride||12, V=k=>[0,1,2].map(c=>bin.readFloatLE(o+k*st+c*4));
    const ia=j.accessors[p.indices], ib=j.bufferViews[ia.bufferView], io=(ib.byteOffset||0)+(ia.byteOffset||0), sz={5125:4,5123:2,5121:1}[ia.componentType], I=k=>sz===4?bin.readUInt32LE(io+k*4):sz===2?bin.readUInt16LE(io+k*2):bin.readUInt8(io+k);
    for(let k=0;k<ia.count;k+=3){ const A=V(I(k)),B=V(I(k+1)),C=V(I(k+2)), ny=(B[2]-A[2])*(C[0]-A[0])-(B[0]-A[0])*(C[2]-A[2]); if(ny<0) dn++; else if(ny>0) up++; } }
  check('⑥ 天花板有朝下的面（從店裡看得到）、沒有只剩朝上的',dn>0&&!(up>0&&dn===0),'朝下 '+dn+'、朝上 '+up+' 個三角形'); }
function faceDirs(nodeName){ const nd=j.nodes.find(x=>x.name===nodeName), bin=b.slice(20+n+8), out={'+x':0,'-x':0,'+y':0,'-y':0,'+z':0,'-z':0};
  if(!nd||nd.mesh==null) return null;
  for(const p of j.meshes[nd.mesh].primitives){ const a=j.accessors[p.attributes.POSITION], bv=j.bufferViews[a.bufferView], o=(bv.byteOffset||0)+(a.byteOffset||0), st=bv.byteStride||12, V=k=>[0,1,2].map(c=>bin.readFloatLE(o+k*st+c*4));
    const ia=j.accessors[p.indices], ib=j.bufferViews[ia.bufferView], io=(ib.byteOffset||0)+(ia.byteOffset||0), sz={5125:4,5123:2,5121:1}[ia.componentType], I=k=>sz===4?bin.readUInt32LE(io+k*4):sz===2?bin.readUInt16LE(io+k*2):bin.readUInt8(io+k);
    for(let k=0;k<ia.count;k+=3){ const A=V(I(k)),B=V(I(k+1)),C=V(I(k+2)), u=[B[0]-A[0],B[1]-A[1],B[2]-A[2]], v=[C[0]-A[0],C[1]-A[1],C[2]-A[2]], nn=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]], L=Math.hypot(...nn)||1;
      for(let c=0;c<3;c++){ if(nn[c]/L>0.9) out['+'+'xyz'[c]]++; else if(nn[c]/L<-0.9) out['-'+'xyz'[c]]++; } } }
  return out; }
{ const W=[['WALL_N_wall','+z'],['WALL_S_wall','-z'],['WALL_E_wall','-x'],['WALL_W_wall','+x']], bad=[]; for(const [nm,dir] of W){ const d=faceDirs(nm); if(!d||!d[dir]) bad.push(nm+'（'+(d?JSON.stringify(d):'沒有')+'）'); }
  check('⑦ 牆、護牆板有朝室內的面（光照烘焙拿掉疊在一起的反面以後，留下的要是從室內看得到的那一面；10-31 第一版法學院圖書館四面牆只剩朝外的面，整片不見）',!bad.length,bad.join('；')); }
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
