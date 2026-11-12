// SHOP-INTERIOR-VIEW-1112（使用者 11-12 進泰米村食：「窗景呢」「都給你電腦測試 你看不出來???」——兩扇大窗和門的玻璃外面是一片藍；櫃台上一堆紫紅色的球）
// 原因：汀州路／公館這一批（src/tz_shops3d.js 蓋的十一間）從來沒有放窗景，玻璃外面直接是區域的背景色。蘭花是七顆洋紅色的球（沒有莖葉）。
// 檢查：①每一間都有窗外照片 assets/models/env/views/<區域>_{day,night}.webp（1024×512）②tz_shops3d.js 載完正式模型放一片視差窗（Z3.shopViewPane）：在正面牆外面、蓋住整面牆、朝店裡；
//       ③配置每一間有 viewDepth ④泰米村食的建模腳本沒有那七顆洋紅色的球了。修改前（開發 e300b47d8）①②③④ FAIL。用法：node tests/tz_shop_views_1112_unit.js
const fs=require('fs'),path=require('path'),vm=require('vm'); const R=p=>path.join(__dirname,'..',p); let fail=0; const check=(n,ok,d)=>{ console.log((ok?'PASS ':'FAIL ')+n+(d!==undefined?'　'+d:'')); if(!ok) fail++; };
const src=fs.readFileSync(R('src/data/tz_shops_layout.js'),'utf8'); const ALL=JSON.parse(src.slice(src.indexOf('{',src.indexOf('const TZ_SHOPS_LAYOUT=')),src.lastIndexOf('}')+1));
const webp=p=>{ if(!fs.existsSync(p)) return null; const b=fs.readFileSync(p); if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP') return null; const t=b.toString('ascii',12,16);
  if(t==='VP8 ') return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff]; if(t==='VP8L'){ const v=b.readUInt32LE(21); return [(v&0x3fff)+1,((v>>14)&0x3fff)+1]; } if(t==='VP8X') return [b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1]; return null; };
{ const bad=[]; for(const id in ALL) for(const t of ['day','night']){ const k=ALL[id].view||ALL[id].zone, s=webp(R('assets/models/env/views/'+k+'_'+t+'.webp')); if(!s||s[0]!==1024||s[1]!==512) bad.push(k+'_'+t+(s?' '+s.join('×'):' 沒有')); }
  check('1. 十一間都有窗外照片（白天、晚上，1024×512；公館三間用配置的 view＝遊戲裡拍的同一條店面街）',!bad.length,bad.join('、')||Object.keys(ALL).length+' 間'); }
{ const calls=[]; const ctx={console,Math,Object,JSON,THREE:{Group:function(){ this.children=[]; this.userData={}; this.add=function(){}; this.remove=function(){}; }},P3:{M:()=>({})},TK:{Bin:function(){ this.add=()=>{}; this.build=()=>{}; },boxG:()=>({})},W3:{stoneTex:()=>null},
    Z3:{ZONES:{},room:()=>({group:new ctx.THREE.Group(),nav:{blockRect(){},freeRect(){}}}),shopViewPane:(z,g,o)=>{ calls.push(o); z.viewPanes=(z.viewPanes||0)+1; return o; },attachRoomGLB(){}},TZ_SHOPS_LAYOUT:ALL};
  vm.createContext(ctx); vm.runInContext(fs.readFileSync(R('src/tz_shops3d.js'),'utf8')+'\n;this.__S=TZS3;',ctx);
  const code=fs.readFileSync(R('src/tz_shops3d.js'),'utf8'); const S=ctx.__S;
  check('2. tz_shops3d.js：正式模型載完就放視差窗（attachRoomGLB 後面接 S.viewPane）',/attachRoomGLB\(z,g0,fb,root\); z\.formal=true; S\.viewPane\(z,g0,L\)/.test(code)&&!!S);
  if(S){ const bad=[]; for(const id in ALL){ const L=ALL[id], p=S.pane(L); const ok=p.kind===(L.view||L.zone)&&p.z>L.d/2+0.2&&p.z<L.d/2+1.0&&p.w>=L.w&&p.h>=L.front.head&&Math.abs(p.ry-Math.PI)<1e-6&&p.depth===L.viewDepth&&Math.abs(p.y-1.6)<1e-6; if(!ok) bad.push(id+JSON.stringify(p)); }
    check('3. 每一間的那一片：在正面牆外面（牆厚 0.2 m 以外、1 m 以內）、比房間寬、高過窗頂、朝店裡、中心高度＝拍照的鏡頭高度 1.6 m、景深＝配置的 viewDepth',!bad.length,bad.join(' ')||'');
    const z={}; S.viewPane(z,{},ALL.taimi); S.viewPane(z,{},ALL.taimi); check('4. 同一間不會放兩片（重複呼叫只放一次）',calls.length===1,calls.length+' 次'); } }
{ const bad=Object.keys(ALL).filter(id=>!(ALL[id].viewDepth>=6&&ALL[id].viewDepth<=40)); check('5. 配置每一間有 viewDepth（對面店面的距離，6～40 m）',!bad.length,bad.join('、')); }
{ const py=fs.readFileSync(R('tools/blender/env_second/tz_shops_interior.py'),'utf8'); check('6. 泰米村食櫃台的蘭花：沒有那七顆洋紅色的球（#c94a8a…半徑 4.5 cm）了，有花梗和葉子',!/0\.045, RR\.choice\(\('#c94a8a'/.test(py)&&/蘭花（SHOP-INTERIOR-VIEW-1112/.test(py)); }
// BB 11-12 追加：⑦東南大聯、汀州聯通抬頭看到天空（天花板 3.1／3.0 m，跟隨鏡頭 3.18 m 高過天花板 → 遊戲把天花板藏起來）：兩間加高到 3.3 m；之後新做的店天花板 ≥ 3.3 m
//                ⑧進門後鏡頭在正面牆外面：牆淡出了、窗框門框布簾還留在半空 → 正面牆上的零件放進 WALL_Sfix_*（名字含 WALL_＝跟著牆淡出），dir 朝店裡（0,0,−1）
{ const low=['dongnan','liantong','yuehaochi','keju','taimi','xile','yindehao'].filter(id=>!(ALL[id].h>=3.2)); check('7. 汀州路這幾間的天花板 ≥ 3.2 m（跟隨鏡頭 3.18 m 不會高過天花板；東南大聯、汀州聯通 3.3）',!low.length&&ALL.dongnan.h>=3.3&&ALL.liantong.h>=3.3,low.join('、')||('東南 '+ALL.dongnan.h+'、聯通 '+ALL.liantong.h)); }
{ const bad=[]; for(const id in ALL){ const f=fs.readFileSync(R(ALL[id].glb)); const n=f.readUInt32LE(12), J=JSON.parse(f.slice(20,20+n).toString('utf8')); const fx=J.nodes.filter(x=>/^WALL_Sfix_/.test(x.name||'')&&x.mesh!=null);
    const ok=fx.length>=1&&fx.every(x=>x.extras&&Array.isArray(x.extras.dir)&&x.extras.dir[2]===-1&&Array.isArray(x.extras.at)); const front=ALL[id].front; if(!ok&&(front.windows.length||!front.open)) bad.push(id+'('+fx.map(x=>x.name).join(',')+')'); }
  check('8. 每一間的模型：正面牆上的零件在 WALL_Sfix_*（有 dir＝朝店裡、at＝牆的位置），跟著正面牆一起淡出',!bad.length,bad.join(' ')); }
console.log(fail?'FAILED: '+fail:'ALL PASS'); process.exit(fail?1:0);
