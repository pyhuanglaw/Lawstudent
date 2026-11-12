// L118-DRINK-WALL-FLICKER-1112＋WZ-OFFBEAT-WINDOW-FLICKER-1112（使用者 11-12：118 巷「飲料店牆壁一直在閃」、溫州街「日常失速從店外面看進去會一直閃」）
// 原因：兩片牆疊在同一個平面（z-fighting）。
//   ① 118 巷喝不喝咖啡（東側 z −7～−2）：_drink 的白磁磚後牆（wz_in_tiles_lane118）和 shallow_interior 的後牆（wz_in_shop）都在 x＝8.1；果茶社（西側 z −9～−6）同樣（cafe_vc_wz_matte × wz_in_shop，x＝−8.15）
//   ② 溫州街日常失速立體店內（offbeat_storefront）的兩面牆和這一棟外殼牆的內面同平面：x＝−47.2、z＝−8.0
// 檢查：這幾個材質在那幾個平面上（±0.5 mm、範圍內）已經沒有頂點；挪到的新平面上有。修改前（開發 e300b47d8）①②都 FAIL。用法：node tests/shop_flicker_1112_unit.js
const fs=require('fs'),path=require('path'); let fail=0; const check=(n,ok,d)=>{ console.log((ok?'PASS ':'FAIL ')+n+(d!==undefined?'　'+d:'')); if(!ok) fail++; };
function load(p){ const f=fs.readFileSync(path.join(__dirname,'..',p)); const n=f.readUInt32LE(12), J=JSON.parse(f.slice(20,20+n).toString('utf8')), b0=20+n+8;
  const mul=(a,b)=>{ const o=new Array(16).fill(0); for(let r=0;r<4;r++) for(let c=0;c<4;c++) for(let k=0;k<4;k++) o[r*4+c]+=a[r*4+k]*b[k*4+c]; return o; };
  const loc=nd=>{ if(nd.matrix){ const m=nd.matrix,o=[]; for(let r=0;r<4;r++) for(let c=0;c<4;c++) o.push(m[c*4+r]); return o; }
    const [x,y,z,w]=nd.rotation||[0,0,0,1], s=nd.scale||[1,1,1], t=nd.translation||[0,0,0];
    return [(1-2*(y*y+z*z))*s[0],2*(x*y-z*w)*s[1],2*(x*z+y*w)*s[2],t[0], 2*(x*y+z*w)*s[0],(1-2*(x*x+z*z))*s[1],2*(y*z-x*w)*s[2],t[1], 2*(x*z-y*w)*s[0],2*(y*z+x*w)*s[1],(1-2*(x*x+y*y))*s[2],t[2], 0,0,0,1]; };
  const out=[]; const walk=(i,pm)=>{ const nd=J.nodes[i], m=mul(pm,loc(nd));
    if(nd.mesh!=null) for(const pr of J.meshes[nd.mesh].primitives){ const a=J.accessors[pr.attributes.POSITION], bv=J.bufferViews[a.bufferView], off=b0+(bv.byteOffset||0)+(a.byteOffset||0), st=bv.byteStride||12, V=[];
      for(let k=0;k<a.count;k++){ const x=f.readFloatLE(off+k*st), y=f.readFloatLE(off+k*st+4), z=f.readFloatLE(off+k*st+8); V.push([m[0]*x+m[1]*y+m[2]*z+m[3], m[4]*x+m[5]*y+m[6]*z+m[7], m[8]*x+m[9]*y+m[10]*z+m[11]]); }
      out.push({mat:J.materials[pr.material].name,V}); }
    for(const c of nd.children||[]) walk(c,m); };
  for(const r of J.scenes[J.scene||0].nodes) walk(r,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]); return out; }
const count=(P,mat,ax,v,box)=>{ let n=0; for(const p of P) if(p.mat===mat) for(const q of p.V) if(Math.abs(q[ax]-v)<5e-4&&q[0]>=box[0]&&q[0]<=box[1]&&q[1]>=box[2]&&q[1]<=box[3]&&q[2]>=box[4]&&q[2]<=box[5]) n++; return n; };
{ const P=load('assets/models/env/second_ai/lane118_street.glb');
  const a=count(P,'wz_in_tiles_lane118',0,8.1,[8.0,8.2,-0.1,3.2,-7,-2]), a2=count(P,'wz_in_tiles_lane118',0,8.088,[8.0,8.2,-0.1,3.2,-7,-2]), s=count(P,'wz_in_shop',0,8.1,[8.0,8.2,-0.1,3.2,-7,-2]);
  check('1. 118 巷喝不喝咖啡：白磁磚後牆不在店內後牆（x＝8.1）那個平面上，往店裡挪了 1.2 cm（x＝8.088）；頂點色的後牆還在 x＝8.1',a===0&&a2>0&&s>0,'磁磚 x=8.1:'+a+' x=8.088:'+a2+' 頂點色 x=8.1:'+s);
  const b=count(P,'cafe_vc_wz_matte',0,-8.15,[-8.2,-8.1,-0.1,3.2,-9,-6]), b2=count(P,'cafe_vc_wz_matte',0,-8.138,[-8.2,-8.1,-0.1,3.2,-9,-6]), t=count(P,'wz_in_shop',0,-8.15,[-8.2,-8.1,-0.1,3.2,-9,-6]);
  check('2. 118 巷果茶社：米白後牆不在店內後牆（x＝−8.15）那個平面上，往店裡挪了 1.2 cm；頂點色的後牆還在',b===0&&b2>0&&t>0,'米白 x=-8.15:'+b+' x=-8.138:'+b2+' 頂點色:'+t); }
{ const P=load('assets/models/env/second_ai/wenzhou_street.glb'), BOX=[-48,-36,-1,5,-20,-7];
  const a=count(P,'offbeat_storefront',0,-47.2,BOX), a2=count(P,'offbeat_storefront',0,-47.192,BOX), w=count(P,'wz_wall_tile',0,-47.2,BOX);
  check('3. 溫州街日常失速：立體店內的西牆不在外殼牆內面（x＝−47.2）那個平面上，往店裡挪了 8 mm；外殼牆還在',a===0&&a2>0&&w>0,'店內 x=-47.2:'+a+' x=-47.192:'+a2+' 外殼:'+w);
  const b=count(P,'offbeat_storefront',2,-8.0,BOX), b2=count(P,'offbeat_storefront',2,-8.008,BOX), w2=count(P,'wz_wall_tile',2,-8.0,BOX);
  check('4. 溫州街日常失速：立體店內的北牆不在外殼牆內面（z＝−8.0）那個平面上，往店裡挪了 8 mm；外殼牆還在',b===0&&b2>0&&w2>0,'店內 z=-8.0:'+b+' z=-8.008:'+b2+' 外殼:'+w2); }
{ const s=fs.readFileSync(path.join(__dirname,'..','tools/blender/env_second/wz_shopkit.py'),'utf8'), t=fs.readFileSync(path.join(__dirname,'..','tools/blender/env_second/wz_street.py'),'utf8');
  check('5. 建模腳本也改了（重建不會又疊回去）：_drink 的後牆 zb−0.038～zb+0.012；wz_street.py 匯入日常失速店內後挪那兩面牆',/2\.95, zb - 0\.038, zb \+ 0\.012\)/.test(s)&&/WZ-OFFBEAT-WINDOW-FLICKER-1112/.test(t)); }
console.log(fail?'FAILED: '+fail:'ALL PASS'); process.exit(fail?1:0);
