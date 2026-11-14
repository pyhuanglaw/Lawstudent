/* WZ-REAL-LITE-EMPTY-1114（LAWWW2-B）：省資源模式（手機、畫質 low）一次只建一間店的店內——原本挑「離玩家最近的」，
   站在溫州街路中間看 SUNNY SIDE（北側），最近的卻是背後對街的林家（南側）：眼前的櫥窗後面是空的（BB 11-14 WZ_REAL_r4，BB_379）。
   改法：最近的那一間在鏡頭背後、鏡頭前面有另一間在 near 以內 → 建鏡頭前面最近的那一間（還是只建一間）。
   檢查（假的 THREE／ASSETS，直接跑 zones3d.js 的 shopInsideReal；不需要瀏覽器 D131）：
     ① 兩間店隔著街：北側 N（店面 z −5.9）、南側 S（店面 z +5.9）。玩家站 z +1（離 S 近），鏡頭在玩家南邊看北 → 建 N，不建 S（修改前建 S）
     ② 鏡頭轉過來看南 → 換成 S，N 拿掉（同一時間只有一間）
     ③ 鏡頭看北、但 N 超過 near → 照舊建最近的 S（背後的也比空的好）
     ④ 沒有鏡頭（E.camera 沒設）→ 照舊挑最近的
     ⑤ 兩間都在鏡頭前面（同一側）→ 照舊挑最近的
   node tests/shop_real_lite_front_1114_unit.js */
const fs=require('fs'),path=require('path'),vm=require('vm'); const R=path.join(__dirname,'..'); let fail=0;
const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fail++; };
const src=fs.readFileSync(path.join(R,'src/zones3d.js'),'utf8'); const a=src.indexOf('  function shopInsideReal('); let d=0,b=-1; for(let i=src.indexOf('{',src.indexOf(')',a));i<src.length;i++){ if(src[i]==='{') d++; else if(src[i]==='}'){ d--; if(d===0){ b=i+1; break; } } }
ok(a>0&&b>a,'⓪ zones3d.js 有 shopInsideReal'); ok(/shopInsideReal,/.test(src.slice(src.lastIndexOf('return {B1C'))),'⓪ Z3 匯出 shopInsideReal');
/* 假的 THREE、ASSETS：只夠這個函式用 */
class Color{ constructor(r=1,g=1,b=1){ this.r=r; this.g=g; this.b=b; } copy(c){ this.r=c.r; this.g=c.g; this.b=c.b; return this; } multiplyScalar(k){ this.r*=k; this.g*=k; this.b*=k; return this; } }
class V3{ constructor(x=0,y=0,z=0){ this.x=x; this.y=y; this.z=z; } set(x,y,z){ this.x=x; this.y=y; this.z=z; } }
class Box3{ copy(o){ this.c=o.c; return this; } applyMatrix4(){ return this; } getCenter(v){ v.x=this.c[0]; v.y=this.c[1]; v.z=this.c[2]; return v; } }
let disposed=0; class Basic{ constructor(o){ Object.assign(this,o); this.color=new Color(); this.userData={}; } dispose(){ disposed++; } }
const mesh=(name,c,mat)=>({name,isMesh:true,visible:true,geometry:{boundingBox:{c}},material:mat,matrixWorld:{},children:[],parent:null});
const mkScene=()=>{ const wood={name:'wood',map:{id:1,image:{}},color:new Color(1,1,1)}, vc={name:'vc',vertexColors:true,color:new Color(1,1,1)}, led={name:'led',emissive:new Color(1,0.8,0.6),color:new Color(0,0,0)};
  const kids=[mesh('floor',[0,0,0],wood),mesh('WALL_left_wood',[-3.6,1.5,0],wood),mesh('WALL_front_front_glass',[0,1.5,6],vc),mesh('dabu_sun',[1,0.01,4],wood),mesh('nightboard',[20,2,0],wood),mesh('shelf',[2,1,-3],vc),mesh('lamp',[0,3.2,0],led),Object.assign(mesh('WALL_S',[0,1.7,6.1],wood),{userData:{dir:[0,0,-1]}}),Object.assign(mesh('WALL_E',[3.6,1.7,0],wood),{userData:{dir:[-1,0,0]}})];
  const r={name:'Scene',children:kids,parent:null,userData:{},position:new V3(),rotation:{y:0,set(){ this.y=0; }},updateMatrixWorld(){},traverse(f){ f(this); kids.forEach(f); },clone(){ return mkScene(); }}; kids.forEach(k=>k.parent=r); return r; };
const mkCtx=()=>{ const c={THREE:{Box3,Vector3:V3,Color,MeshBasicMaterial:Basic},ASSETS:{manifest:{kN:{},kS:{}},loadOne(){ return {then(f){ f({scene:mkScene()}); return {catch(){}}; }}; }},GAME:{G:{hour:14,day:3}},PLACES:{isOpen:()=>true,typhoonClosed:()=>false},console}; vm.createContext(c); vm.runInContext(src.slice(a,b)+'; this.fn=shopInsideReal;',c); return c; };
const mkG=()=>({children:[],add(o){ this.children.push(o); o.parent=this; },remove(o){ this.children=this.children.filter(q=>q!==o); o.parent=null; }});
const cam=(x,z,fx,fz)=>({position:new V3(x,3,z),getWorldDirection(v){ v.x=fx; v.y=-0.3; v.z=fz; return v; }});
const LIST=(nearN)=>[{id:'N',place:'pN',key:'kN',w:6.4,d:10,h:3.2,x:44,z:-10.9,ry:0,cx:44,cz:-5.9,ex:3.2,ez:0,near:nearN||26},{id:'S',place:'pS',key:'kS',w:6.4,d:8,h:3,x:44,z:9.9,ry:Math.PI,cx:44,cz:5.9,ex:3.2,ez:0}];
const run=(camera,list,px,pz)=>{ const c=mkCtx(), g=mkG(), zone={update:null}, E={zone,player:{obj:{position:new V3(px,0,pz)}}}; if(camera) E.camera=camera; const R2=c.fn(E,g,zone,list,{lite:true,shutter:false}); const step=n=>{ for(let i=0;i<n;i++) zone.update(0.016,E); }; step(60); return {R:R2,E,g,step,N:R2.shops[0],S:R2.shops[1]}; };
const st=s=>s.on||s.built||s.building;
{ const t=run(cam(44,5.5,0,-1),LIST(),44,1); ok(R&&t.R.lite===true,'⓪ 省資源模式');
  ok(st(t.N)&&!st(t.S),'① 站路中間偏南（離南側的店 4.9 m、北側 6.9 m）、鏡頭看北：建眼前北側那一間，不建背後南側那一間　N '+st(t.N)+'／S '+st(t.S));
  t.E.camera=cam(44,-3.5,0,1); t.step(60);
  ok(st(t.S)&&!st(t.N)&&t.g.children.length<=1,'② 鏡頭轉過來看南：換成南側那一間、北側拿掉（同一時間只有一間）　N '+st(t.N)+'／S '+st(t.S)+'／場景裡 '+t.g.children.length+' 間'); }
{ const t=run(cam(44,5.5,0,-1),LIST(5),44,1); ok(st(t.S)&&!st(t.N),'③ 鏡頭看北、但北側那一間超過 near（5 m）：照舊建最近的南側那一間　N '+st(t.N)+'／S '+st(t.S)); }
{ const t=run(null,LIST(),44,1); ok(st(t.S)&&!st(t.N),'④ 沒有鏡頭：照舊挑最近的（南側）　N '+st(t.N)+'／S '+st(t.S)); }
{ const t=run(cam(44,30,0,-1),LIST(),44,12); ok(st(t.S)&&!st(t.N),'⑤ 兩間都在鏡頭前面（玩家在南側店後面 z 12、鏡頭在更南邊看北）：照舊挑最近的（南側）　N '+st(t.N)+'／S '+st(t.S)); }
console.log(fail?('FAILED '+fail):'ALL PASS'); process.exit(fail?1:0);
