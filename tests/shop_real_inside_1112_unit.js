/* SHOP-REAL-INSIDE-1112（LAWWW2-C）：從店外看到的店內＝走進去的那一顆室內模型（§12 第 1 點；使用者 11-12「店外面看進去牆壁是灰色，可是人在店裡面居然牆壁是木頭的」）。
   node tests/shop_real_inside_1112_unit.js */
const fs=require('fs'),path=require('path'),vm=require('vm'); const R=path.join(__dirname,'..'); let fail=0;
const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fail++; };
const src=fs.readFileSync(path.join(R,'src/zones3d.js'),'utf8'); const a=src.indexOf('  function shopInsideReal('); let d=0,b=-1; for(let i=src.indexOf('{',src.indexOf(')',a));i<src.length;i++){ if(src[i]==='{') d++; else if(src[i]==='}'){ d--; if(d===0){ b=i+1; break; } } }
ok(a>0&&b>a,'① zones3d.js 有 shopInsideReal'); ok(/shopInsideReal,/.test(src.slice(src.lastIndexOf('return {B1C'))),'② Z3 匯出 shopInsideReal');
/* 假的 THREE、ASSETS：只夠這個函式用 */
class Color{ constructor(r=1,g=1,b=1){ this.r=r; this.g=g; this.b=b; } copy(c){ this.r=c.r; this.g=c.g; this.b=c.b; return this; } multiplyScalar(k){ this.r*=k; this.g*=k; this.b*=k; return this; } }
class V3{ constructor(x=0,y=0,z=0){ this.x=x; this.y=y; this.z=z; } set(x,y,z){ this.x=x; this.y=y; this.z=z; } }
class Box3{ copy(o){ this.c=o.c; return this; } applyMatrix4(){ return this; } getCenter(v){ v.x=this.c[0]; v.y=this.c[1]; v.z=this.c[2]; return v; } }
let disposed=0; class Basic{ constructor(o){ Object.assign(this,o); this.color=new Color(); this.userData={}; } dispose(){ disposed++; } }
const mesh=(name,c,mat)=>({name,isMesh:true,visible:true,geometry:{boundingBox:{c}},material:mat,matrixWorld:{},children:[],parent:null});
const mkScene=()=>{ const wood={name:'wood',map:{id:1,image:{}},color:new Color(1,1,1)}, vc={name:'vc',vertexColors:true,color:new Color(1,1,1)}, led={name:'led',emissive:new Color(1,0.8,0.6),color:new Color(0,0,0)};
  const kids=[mesh('floor',[0,0,0],wood),mesh('WALL_left_wood',[-3.6,1.5,0],wood),mesh('WALL_front_front_glass',[0,1.5,6],vc),mesh('dabu_sun',[1,0.01,4],wood),mesh('nightboard',[20,2,0],wood),mesh('shelf',[2,1,-3],vc),mesh('lamp',[0,3.2,0],led),Object.assign(mesh('WALL_S',[0,1.7,6.1],wood),{userData:{dir:[0,0,-1]}}),Object.assign(mesh('WALL_E',[3.6,1.7,0],wood),{userData:{dir:[-1,0,0]}})];
  const r={name:'Scene',children:kids,parent:null,userData:{},position:new V3(),rotation:{y:0,set(){ this.y=0; }},updateMatrixWorld(){},traverse(f){ f(this); kids.forEach(f); },clone(){ return mkScene(); }}; kids.forEach(k=>k.parent=r); return r; };
let loads=0; const g={children:[],add(o){ this.children.push(o); o.parent=this; },remove(o){ this.children=this.children.filter(q=>q!==o); o.parent=null; }};
const zone={update:null,shopInLit:{items:[{id:'dabu',mesh:{visible:true}}]}}; const E={zone,player:{obj:{position:new V3(-12,0,60)}}};
const ctx={THREE:{Box3,Vector3:V3,Color,MeshBasicMaterial:Basic},ASSETS:{manifest:{'bldg.xs_dabu':{}},loadOne(){ loads++; return {then(f){ f({scene:mkScene()}); return {catch(){}}; }}; }},GAME:{G:{hour:14,day:3}},PLACES:{isOpen:(z,h)=>h>=11&&h<22,typhoonClosed:()=>false},console};
vm.createContext(ctx); vm.runInContext(src.slice(a,b)+'; this.fn=shopInsideReal;',ctx);
const Rr=ctx.fn(E,g,zone,[{id:'dabu',place:'xs_dabu',key:'bldg.xs_dabu',w:7.4,d:12,h:3.4,x:-22.52,z:-16.7,ry:Math.PI/2,cx:-16.5,cz:-16.7,ex:0,ez:3.7}],{lite:true});
const s=Rr.shops[0]; const step=n=>{ for(let i=0;i<n;i++) zone.update(0.016,E); };
ok(!s.on&&loads===0,'③ 省資源模式（手機）：玩家在 75 m 外不載入');
E.player.obj.position.z=-10; step(21);
ok(s.on&&loads===1&&g.children.length===1,'④ 走到 26 m 內：載入那一間的室內模型、接上');
const grp=g.children[0]; const vis=n=>grp.children.find(q=>q.name===n).visible;
ok(grp.position.x===-22.52&&grp.position.z===-16.7&&grp.rotation.y===Math.PI/2,'⑤ 放在店面玻璃後面（室內的正面 z＝d/2 轉到朝街）');
ok(vis('floor')&&vis('WALL_left_wood')&&vis('shelf')&&vis('lamp'),'⑥ 地板、側牆、貨架、燈都在');
ok(!vis('WALL_front_front_glass')&&!vis('dabu_sun')&&!vis('nightboard'),'⑦ 室內自己的正面牆、陽光斑、範圍外的板子不放');
ok(!vis('WALL_S')&&vis('WALL_E'),'⑦b 名字不是 WALL_front 的正面牆照自訂屬性 dir [0,0,−1] 藏（汀州路的 WALL_S）；側牆 dir [−1,0,0] 留著');
const fl=grp.children.find(q=>q.name==='floor'), wl=grp.children.find(q=>q.name==='WALL_left_wood'), sh=grp.children.find(q=>q.name==='shelf'), lp=grp.children.find(q=>q.name==='lamp');
ok(fl.material instanceof Basic&&fl.material.map&&fl.material.map.id===1&&fl.material===wl.material,'⑧ 材質換成不受場景光的，貼圖是室內那一張（同一個來源材質共用一份）');
ok(sh.material.vertexColors===true&&Math.abs(lp.material.color.g-0.8*0.86)<1e-6,'⑨ 頂點色照舊；發光的燈用發光色');
ok(Math.abs(fl.material.color.r-0.86)<1e-6,'⑩ 營業中亮度 0.86'); ok(zone.shopInLit.items[0].mesh.visible===false,'⑪ 街景模型裡簡化的店內（sk_in_dabu）藏起來');
ctx.GAME.G.hour=23; step(21); ok(Math.abs(fl.material.color.r-0.07)<1e-6,'⑫ 打烊：整間調到 0.07');
ctx.GAME.G.hour=12; step(21); ok(Math.abs(fl.material.color.r-0.86)<1e-6,'⑬ 開門：調回來');
E.player.obj.position.z=24; step(21); ok(s.on,'⑭ 走到離店面 37 m：還沒超過 far（40），留著（near 26、far 40：不會在邊界上一直接上又拿掉）');
E.player.obj.position.z=40; step(21); ok(!s.on&&g.children.length===0&&disposed===3&&zone.shopInLit.items[0].mesh.visible===true,'⑮ 走遠：拿掉、材質釋放（'+disposed+' 個）、簡化的店內放回來');
E.player.obj.position.z=-16; step(41); ok(s.on&&loads===2,'⑯ 再走回來：重新接上');
/* 一般模式（電腦）：進區域就先做好、不顯示；走近只開顯示（CC 11-12：第一次走近最長一幀 233 ms） */
{ loads=0; let inits=0, compiles=0; const cobj=[]; const g2={children:[],add(o){ this.children.push(o); o.parent=this; },remove(o){ this.children=this.children.filter(q=>q!==o); }};
  const z2={update:null,shopInLit:{items:[{id:'dabu',mesh:{visible:true}},{id:'haopai',mesh:{visible:true}}]}}; const E2={zone:z2,q:{level:'high'},camera:{},scene:{},renderer:{initTexture(){ inits++; },compile(o){ compiles++; cobj.push(o); }},player:{obj:{position:new V3(-12,0,60)}}};
  ctx.ASSETS.manifest['bldg.xs_haopai']={}; ctx.GAME.G.hour=14;
  const R2=ctx.fn(E2,g2,z2,[{id:'dabu',place:'xs_dabu',key:'bldg.xs_dabu',w:7.4,d:12,h:3.4,x:-22.52,z:-16.7,ry:Math.PI/2,cx:-16.5,cz:-16.7,ex:0,ez:3.7},{id:'haopai',place:'xs_haopai',key:'bldg.xs_haopai',w:4.4,d:14,h:3.4,x:-23.52,z:-23.2,ry:Math.PI/2,cx:-16.5,cz:-23.2,ex:0,ez:2.2}],{lite:false});
  const st=n=>{ for(let i=0;i<n;i++) z2.update(0.016,E2); }; const [a1,a2]=R2.shops;
  ok(R2.lite===false&&loads===1&&!a1.built&&a1.building&&g2.children.length===0,'㉗a 第 3 版：載入完的那一幀不 clone、不換材質、不掛上場景（那一下就是省資源模式第一次走近的那一頓）');
  { let k=0; while(!a1.built&&k<12){ st(1); k++; } ok(a1.built&&k>=2&&k<=8&&!a1.building,'㉗b 分幀做完（clone 一幀、零件每幀 3 個）：'+k+' 幀'); }
  ok(loads===1&&a1.built&&!a1.on&&g2.children[0].visible===false,'㉗ 一般模式：玩家在遠處，第一間（最近的）先做好、掛著不顯示');
  ok(!a2.built,'㉙ 一次只做一間（分幀）');
  ok(inits===0&&!a1.ready,'㉘a 貼圖不在做好的那一幀一次上傳（那樣本身就是一頓）'); st(1); ok(inits===1&&compiles===0,'㉘b 一幀上傳一張貼圖'); st(3);
  { const vis0=a1.list.filter(o=>o.visible).length; st(1); const vis1=a1.list.filter(o=>o.visible).length; ok(!a1.ready&&vis1-vis0<=1&&a1.list.every(o=>!o.visible||o.frustumCulled===false),'㉘c 第 2 版：零件一幀打開一個、先不做視錐裁切（一定畫得到：頂點資料、材質跟著分幀上傳）');
    st(a1.list.length+3); ok(inits>=1&&!cobj.includes(a1.grp)&&cobj.every(x=>!x||!x.children||!x.children.length||x.isMesh)&&a1.ready&&a1.list.every(o=>o.visible&&o.frustumCulled===true)&&g2.children[0].visible===false,'㉘ 貼圖（initTexture '+inits+' 次）、零件都畫過一幀以後才算可以顯示，視錐裁切還原；玩家在遠處＝關掉顯示。不再一次 compile 整間（一次只編一個網格的材質）'); }
  { const E3={zone:{update:null},q:{level:'medium'},renderer:{},player:{obj:{position:new V3(0,0,0)}}}; const R3=ctx.fn(E3,{children:[],add(){},remove(){}},E3.zone,[{id:'x',key:'none',w:1,d:1,h:1,x:0,z:0}]); const E4={zone:{update:null},q:{level:'low'},renderer:{},player:{obj:{position:new V3(0,0,0)}}}; const R4=ctx.fn(E4,{children:[],add(){},remove(){}},E4.zone,[{id:'x',key:'none',w:1,d:1,h:1,x:0,z:0}]);
    ok(R3.lite===false&&R4.lite===true,'㉞ 預設畫質 medium 也預載（CC 11-12：電腦上進區域 10 秒每一間還是 built:false）；只有 low 或觸控裝置才省資源'); }
  st(21); ok(a2.built&&loads===2&&!a2.on,'㉚ 下一拍做第二間');
  ok(z2.shopInLit.items[0].mesh.visible===true,'㉛ 還沒顯示的時候簡化的店內照舊顯示');
  E2.player.obj.position.z=-18; st(21); ok(a1.on&&a2.on&&g2.children.every(q=>q.visible)&&loads===2&&z2.shopInLit.items[0].mesh.visible===false,'㉜ 走近：只是打開顯示（沒有再載入），簡化的店內藏起來');
  const d0=disposed; E2.player.obj.position.z=60; st(21); ok(!a1.on&&a1.built&&g2.children.length===2&&disposed===d0,'㉝ 走遠：關掉顯示、不釋放（再走近不用重做）'); }
/* 新生南路的設定 */
const xs=fs.readFileSync(path.join(R,'src/xinsheng3d.js'),'utf8'); ok(/Z3\.shopInsideReal\(E,g,zone,S\.SHOP_REAL\)/.test(xs),'⑰ xinsheng3d.js 接上');
const lay={dabu:['DABU_LAYOUT','dabu_layout.js',q=>q],haopai:['HAOPAI_LAYOUT','haopai_layout.js',q=>q.haopai],xsports:['XINSHENG_SPORTS_LAYOUT','xinsheng_sports_layout.js',q=>q],shanlan:['SHANLAN_LAYOUT','shanlan_layout.js',q=>q],dakou:['DAKOU_LAYOUT','dakou_layout.js',q=>q.shop],nanyang:['NANYANG_LAYOUT','nanyang_layout.js',q=>q.lobby]};
const c2={Math}; vm.createContext(c2); for(const k in lay) vm.runInContext(fs.readFileSync(path.join(R,'src/data',lay[k][1]),'utf8').replace(/^const /mg,'var '),c2);
const m=/S\.SHOP_REAL=\(\(\)=>\{([\s\S]*?)\}\)\(\);/.exec(xs); const REAL=vm.runInContext('(()=>{'+m[1]+'})()',c2);
const XL=JSON.parse((t=>t.slice(t.indexOf('{'),t.lastIndexOf('}')+1))(fs.readFileSync(path.join(R,'src/data/xinsheng_layout.js'),'utf8')));
for(const q of REAL){ const L=lay[q.id][2](c2[lay[q.id][0]]), sp=XL.shops.find(z=>z.id===q.id);
  ok(L&&q.w===L.w&&q.d===L.d,'⑱ '+q.id+'：寬、深和室內配置一樣（'+q.w+'×'+q.d+'）');
  ok(sp&&Math.abs(q.cz-(sp.z0+sp.z1)/2)<0.06&&Math.abs((q.x+q.d/2)-(XL.arcade.x0-0.02))<1e-6,'⑲ '+q.id+'：中心對著街上那一間、正面貼在店面玻璃（x '+XL.arcade.x0+'）後面'); }
/* 街景模型：牆挖得夠深（不然室內被一樓牆體切掉） */
const ws=fs.readFileSync(path.join(R,'tools/blender/env_second/wz_street.py'),'utf8');
for(const q of REAL){ const mm=new RegExp("'"+q.id+"': dict\\(int=(?:'[a-z_]+'|None, real=True), back=([0-9.]+)").exec(ws); ok(mm&&+mm[1]>=Math.min(q.d,16)+0.1-1e-9,'⑳ wz_street.py '+q.id+' 的牆往裡挖 '+(mm&&mm[1])+' m（室內深 '+q.d+'）'); }
ok(!/'nanyang_front', -4\.3/.test(ws),'㉑ 南洋戲院門口不再貼那一張參考圖（nanyang_front）');
/* 汀州路：七間走得進去的店 */
{ const c3={Math,console,THREE:{},Z3:{},ASSETS:{manifest:{}},window:{}}; vm.createContext(c3);
  for(const f of ['tingzhou_layout.js','tz_shops_layout.js']) vm.runInContext(fs.readFileSync(path.join(R,'src/data',f),'utf8').replace(/^const /mg,'var '),c3);
  const tz=fs.readFileSync(path.join(R,'src/tingzhou3d.js'),'utf8'); ok(/Z3\.shopInsideReal\(E,g,zone,S\.shopReal\(\)\)/.test(tz),'㉒ tingzhou3d.js 接上');
  const m1=/S\.REAL_DEP=(\{[^}]*\});/.exec(tz), m2=/S\.shopReal=function\(\)\{([\s\S]*?)return out; \};/.exec(tz);
  const m3=/S\.REAL_SX=(\{[^}]*\});/.exec(tz); const list=vm.runInContext('(function(){ const S={REAL_DEP:'+m1[1]+',REAL_SX:'+(m3?m3[1]:'{}')+'}; '+m2[1]+' return out; })()',c3);
  { const by=Object.fromEntries(list.map(q=>[q.id,q])); ok(['liantong','dongnan','keju','yuehaochi'].every(id=>Math.abs(by[id].cx-(c3.TINGZHOU_LAYOUT.facade.west-c3.TINGZHOU_LAYOUT.facade.arcade-0.3))<1e-9&&Array.isArray(by[id].sx)&&by[id].sh<=2.9)&&['taimi','xile','yindehao'].every(id=>Math.abs(Math.abs(by[id].cx)-(Math.abs(c3.TINGZHOU_LAYOUT.facade.west)+3.0))<1e-9),'㉓b TZ-SHUTTER-POS-1112：沒有騎樓的四間玻璃在店面線後 0.3 m（x '+(c3.TINGZHOU_LAYOUT.facade.west-c3.TINGZHOU_LAYOUT.facade.arcade-0.3)+'），鐵捲門只蓋玻璃那一段、不高過招牌板'); }
  ok(list.length===8&&list.some(q=>q.id==='limao'),'㉓ 汀州路 7 間＋巷 A 的禮貌生財（LIMAO-REAL-VIEW-1114；位置、轉向另外在 limao_real_view_1114_unit 查）：'+list.map(q=>q.id).join('、'));
  const T=c3.TINGZHOU_LAYOUT, Z=c3.TZ_SHOPS_LAYOUT;
  for(const q of list.filter(q=>q.id!=='limao')){ const sp=T.shops.find(z=>z.id===q.id), L=Z[q.id], w=sp.side==='W';   /* 禮貌生財不在汀州路那一排（巷 A 南側、店面朝 −z），下面三項是那一排的算法 */
    ok(Math.abs(L.w-(sp.z1-sp.z0))<=0.6&&q.w===L.w&&q.d===L.d&&q.key===L.asset&&q.place===L.zone,'㉔ '+q.id+'：室內 '+L.w+'×'+L.d+' 對著街上那一間（寬 '+(sp.z1-sp.z0)+'）、模型 '+q.key);
    ok(w?(q.ry===Math.PI/2&&q.x<T.facade.west):(q.ry===-Math.PI/2&&q.x>T.facade.east),'㉕ '+q.id+'：'+(w?'西側朝東':'東側朝西')+'，放在立面後面');
    const mm=new RegExp("'"+q.id+"': dict\\((arcade=False, )?dep=([0-9.]+), real=True, back=([0-9.]+)").exec(ws); if(mm){ const noArc=!!mm[1]; mm[1]=String(+mm[2]+(noArc?T.facade.arcade:0)); mm[2]=mm[3]; }   /* TZ-SHUTTER-POS-1112：沒有騎樓的店整棟退 arcade（3.2 m）到店面線，玻璃離立面＝arcade＋dep（原本這一項只比 dep，四間都少 3.2 m 也過） */
    ok(mm&&+mm[2]>=q.d+0.1-1e-9&&Math.abs(+mm[1]-Math.abs(q.cx-(w?T.facade.west:T.facade.east)))<1e-9,'㉖ wz_street.py '+q.id+'：real、牆挖 '+(mm&&mm[2])+' m、玻璃離立面 '+(mm&&mm[1])+' m 和遊戲的設定一樣'); } }
{ const z3=fs.readFileSync(path.join(__dirname,'..','src/zones3d.js'),'utf8');
  ok(/sb=Math\.max\(0,Math\.min\(sh-0\.4,s\.sb\|\|0\)\)/.test(z3)&&/\(s\.y\|\|0\)\+sb\+hh\/2/.test(z3),'㉟c SHOP-WINDOW-3D-1112 v2：s.sb＝鐵捲門拉一半（門片下緣離地 sb，沒給＝拉到地，和原本一樣）');
  ok(/part\('box',sw\+0\.16,0\.3,0\.24,0,(?:sh|hh)\/2-0\.15/.test(z3)&&/part\('bar'/.test(z3)&&/part\('railL'/.test(z3)&&/part\('railR'/.test(z3)&&/m\.add\(q\)/.test(z3),'㉟b SHUTTER-DEPTH-1112：鐵捲門有捲箱（不高過門窗那一段的頂）、底條、兩邊軌道，掛在那一片下面一起顯示／藏');
  ok(/shop_shutter_'\+s\.id/.test(z3)&&/s\.shutter\.visible=!isOpen\(s\)/.test(z3)&&/m\.visible=!isOpen\(s\)/.test(z3),'㉟ 打烊拉下鐵捲門：每一間在玻璃外放一片（shop_shutter_<店>），營業中藏、打烊顯示，每一拍照營業時間更新（BB 11-12：鮮果打烊沒有鐵門）'); }
{ const z3=fs.readFileSync(path.join(__dirname,'..','src/zones3d.js'),'utf8');
  ok(/if\(s\.kx&&s\.kx!==1\) r\.scale\.x=s\.kx;/.test(z3),'㊱ kx：室內可以在寬度方向縮一點（公館：牆厚會伸進隔壁店）'); }
/* 走到店前的那一間優先（BB 11-12：第一次走到 SUNNY SIDE 前 3 m，B7 built:false——四間排隊預載，它排最後）。四間、一般模式，人一進區域就站在最後一間前面 3 m：
   改之前要等前三間（遠的）各自建完才輪到；改之後正在建的遠店先放掉、眼前這一間馬上建，而且一幀做 4 件 */
{ let ld=0; const g2={children:[],add(o){ this.children.push(o); o.parent=this; },remove(o){ this.children=this.children.filter(q=>q!==o); o.parent=null; }};
  const z2={update:null}, E2={zone:z2,player:{obj:{position:new V3(-200,0,0)}}};
  const c2={THREE:{Box3,Vector3:V3,Color,MeshBasicMaterial:Basic},ASSETS:{manifest:{k0:{},k1:{},k2:{},k3:{}},loadOne(){ ld++; return {then(f){ f({scene:mkScene()}); return {catch(){}}; }}; }},GAME:{G:{hour:14,day:3}},PLACES:{isOpen:()=>true,typhoonClosed:()=>false},console};
  vm.createContext(c2); vm.runInContext(src.slice(a,b)+'; this.fn=shopInsideReal;',c2);
  const mk=(id,x)=>({id,place:'p'+id,key:'k'+id,w:7.4,d:12,h:3.4,x,z:-10,ry:0,cx:x,cz:-4,ex:3,ez:0});
  const R2=c2.fn(E2,g2,z2,[mk(0,-100),mk(1,-60),mk(2,-20),mk(3,60)],{lite:false,shutter:false}); const S3=R2.shops[3], st=n=>{ for(let i=0;i<n;i++) z2.update(0.016,E2); };
  st(3);   /* 人還在很遠：第一間（最近的那一間）已經開始預載 */
  const busy0=R2.shops.find(q=>q.building||q.built); E2.player.obj.position.x=60; E2.player.obj.position.z=-1;   /* 走到（或被放到）第四間前面 3 m */
  let n=0; while(!(S3.built&&S3.ready&&S3.on)&&n<400){ st(1); n++; }
  ok(!!busy0&&busy0!==S3,'㊳ 人還沒到的時候，先預載的是別間（'+(busy0&&busy0.id)+'）');
  ok(S3.on&&n<=40,'㊴ 走到第四間前面 3 m：'+n+' 幀以內它就建好、顯示（改之前要先等別間建完、一幀一件，60 幀以上）');
  st(400); ok(R2.shops.every(q=>q.built&&q.ready)&&R2.shops.filter(q=>q.on).length===1,'㊵ 被放掉的那一間之後照樣排回來建好；只有眼前那一間顯示'); }
/* SHOP-FIRST-APPROACH-1112：建好以後先 compileAsync 這一間（照場景的燈），編好以前零件不打開；別間的工作照做；renderer 沒有 compileAsync 照舊 */
{ const g3={children:[],add(o){ this.children.push(o); o.parent=this; },remove(o){ this.children=this.children.filter(q=>q!==o); o.parent=null; }};
  let calls=[], res=[], comp=[], fr=0; const RN={compile(o,cam,tgt){ comp.push({o,cam,tgt,fr}); }, compileAsync(sc,cam,tgt){ calls.push({sc,cam,tgt,fr}); return {then(f){ res.push(f); }}; }, initTexture(){}};
  const z3b={update:null}, E3b={zone:z3b,player:{obj:{position:new V3(-100,0,-1)}},renderer:RN,camera:{isCam:1},scene:{isScene:1}};
  const c3={THREE:{Box3,Vector3:V3,Color,MeshBasicMaterial:Basic},ASSETS:{manifest:{k0:{},k1:{}},loadOne(){ return {then(f){ f({scene:mkScene()}); return {catch(){}}; }}; }},GAME:{G:{hour:14,day:3}},PLACES:{isOpen:()=>true,typhoonClosed:()=>false},console,setTimeout:()=>0};
  vm.createContext(c3); vm.runInContext(src.slice(a,b)+'; this.fn=shopInsideReal;',c3);
  const mk=(id,x)=>({id,place:'p'+id,key:'k'+id,w:7.4,d:12,h:3.4,x,z:-10,ry:0,cx:x,cz:-4,ex:3,ez:0});
  const R3=c3.fn(E3b,g3,z3b,[mk(0,-100),mk(1,60)],{lite:false,shutter:false}); const S0=R3.shops[0], st=n=>{ for(let i=0;i<n;i++){ fr++; z3b.update(0.016,E3b); } };
  let n=0; while(!S0.built&&n<200){ st(1); n++; }
  st(80); const openWhile=S0.list.filter(o=>o.visible).length; const mine=comp.filter(c=>{ let q=c.o; while(q){ if(q===S0.grp) return true; q=q.parent; } return false; }); const perFr={}; mine.forEach(c=>{ perFr[c.fr]=(perFr[c.fr]||0)+1; }); const c0=calls.find(c=>c.sc===S0.grp);
  const mats=new Set(); S0.list.forEach(o=>(o.traverse?o.traverse.bind(o):(f=>f(o)))(m=>{ if(m.material) mats.add([].concat(m.material).map(x=>x.uuid||x.id).join('|')); }));
  ok(mine.length>0&&mine.length===mats.size&&mine.every(c=>c.cam===E3b.camera&&c.tgt===E3b.scene)&&Math.max(...Object.values(perFr))===1,'㊷ 建好那一間：一幀只編一個材質（Rn.compile(網格, 鏡頭, 整個場景)；同一組材質只編一次：'+mine.length+' 次／'+mats.size+' 組，一幀最多 '+Math.max(...Object.values(perFr))+' 個）');
  ok(!!c0&&c0.cam===E3b.camera&&c0.tgt===E3b.scene&&c0.fr>=Math.max(...mine.map(c=>c.fr)),'㊷b 全部送出以後才 compileAsync 整間等 isReady');
  ok(S0.compiling===true&&openWhile===0&&!S0.ready,'㊸ 還在編的時候零件一個都不打開、不算可以顯示（'+openWhile+' 個打開）');
  const S1=R3.shops[1]; ok(S1.built,'㊹ 編的時候別間照樣建（第二間 built '+S1.built+'）');
  res.forEach(f=>f()); st(200); ok(S0.compiling===false&&S0.ready&&S0.on,'㊺ 編好以後照舊一幀一個打開、顯示（ready '+S0.ready+'、on '+S0.on+'）');
  ok(R3.prof.step.compile&&R3.prof.step.compile.n>=1&&R3.prof.step.compileWait&&R3.prof.step.compileWait.n>=1,'㊻ prof 記 compile（每一個材質主執行緒花多久）、compileWait（送出到全部 isReady 多久）'); }
/* SHOP-FIRST-APPROACH r7：零件都打開以後，畫面外先畫一次整間（1×1 viewport＋scissor、暫時的場景同一個霧），畫完 viewport／scissor／父物件／顯示狀態都還原 */
{ const g4={children:[],add(o){ if(o.parent&&o.parent!==this&&o.parent.remove) o.parent.remove(o); this.children.push(o); o.parent=this; },remove(o){ this.children=this.children.filter(q=>q!==o); o.parent=null; }};
  class V4{ constructor(x=0,y=0,z=0,w=0){ this.x=x; this.y=y; this.z=z; this.w=w; } copy(v){ this.x=v.x; this.y=v.y; this.z=v.z; this.w=v.w; return this; } }
  class Sc{ constructor(){ this.children=[]; this.fog=null; } add(o){ if(o.parent&&o.parent!==this&&o.parent.remove) o.parent.remove(o); this.children.push(o); o.parent=this; } remove(o){ this.children=this.children.filter(q=>q!==o); o.parent=null; } }
  let VP=new V4(0,0,800,600), SCI=new V4(0,0,800,600), ST=false; const draws=[];
  const RN={compile(){}, initTexture(){}, getViewport(v){ return v.copy(VP); }, getScissor(v){ return v.copy(SCI); }, getScissorTest(){ return ST; },
    setViewport(x,y,w,h){ VP=(x&&x.isV4!==undefined)||typeof x==='object'?new V4(x.x,x.y,x.z,x.w):new V4(x,y,w,h); }, setScissor(x,y,w,h){ SCI=typeof x==='object'?new V4(x.x,x.y,x.z,x.w):new V4(x,y,w,h); }, setScissorTest(b){ ST=b; },
    render(scn,cam){ draws.push({scn,cam,vp:[VP.z,VP.w],sci:[SCI.z,SCI.w],st:ST,vis:scn.children.map(o=>o.visible),fog:scn.fog}); }};
  const FOG={isFog:1}, z4={update:null}, E4={zone:z4,player:{obj:{position:new V3(-100,0,-1)}},renderer:RN,camera:{isCam:1},scene:{isScene:1,fog:FOG}};
  const c4={THREE:{Box3,Vector3:V3,Vector4:V4,Scene:Sc,Color,MeshBasicMaterial:Basic},ASSETS:{manifest:{k0:{}},loadOne(){ return {then(f){ f({scene:mkScene()}); return {catch(){}}; }}; }},GAME:{G:{hour:14,day:3}},PLACES:{isOpen:()=>true,typhoonClosed:()=>false},console,setTimeout:()=>0};
  vm.createContext(c4); vm.runInContext(src.slice(a,b)+'; this.fn=shopInsideReal;',c4);
  const R4=c4.fn(E4,g4,z4,[{id:0,place:'p0',key:'k0',w:7.4,d:12,h:3.4,x:-100,z:-10,ry:0,cx:-100,cz:-4,ex:3,ez:0}],{lite:false,shutter:false}); const S4=R4.shops[0];
  for(let i=0;i<400&&!(S4.ready&&S4.on);i++) z4.update(0.016,E4);
  const d=draws[0];
  ok(draws.length===1&&d.cam===E4.camera&&d.vp[0]===1&&d.vp[1]===1&&d.sci[0]===1&&d.sci[1]===1&&d.st===true&&d.vis[0]===true&&d.fog===FOG,'㊼ SHOP-FIRST r7：零件都打開以後畫面外先畫一次整間（同一個鏡頭、1×1、scissor、同一個霧）：'+draws.length+' 次');
  ok(VP.z===800&&VP.w===600&&SCI.z===800&&ST===false&&S4.grp.parent===g4&&S4.ready&&S4.on&&R4.prof.step.pre&&R4.prof.step.pre.n===1,'㊼b 畫完 viewport／scissor 還原、店內掛回原來的地方、照常顯示；prof.step.pre 有記'); }
{ const P=Rr.prof; ok(P&&P.step&&P.frame&&typeof P.reset==='function'&&P.step.clone&&P.step.clone.n>=1&&P.step.prep&&P.step.mesh&&P.step.tick&&Object.values(P.step).every(o=>o.max>=0&&o.sum>=0),'㊶ shopReal.prof：每一種工作（clone／prep／tex／mesh／tick…）記次數、最長、合計——CC 在電腦上看哪一步是那 150 ms（'+Object.keys(P.step).join('、')+'）'); }
console.log(fail?('FAILED '+fail):'ALL PASS'); process.exit(fail?1:0);
