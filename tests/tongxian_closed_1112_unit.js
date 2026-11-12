/* 同弦樂器打烊要看得出來關了（BB 2026-11-12 在使用者電腦判 FAIL；店面標準 §12 第 1 點）：
     新生南路 23:30，同弦標籤「已閉館」，但櫥窗吊燈亮、吉他牆照得清楚、沒有鐵捲門；同一條街大步、好拍、山嵐、新運動都有鐵門。
   原因：同弦的店在二樓，不在 XS3.SHOP_REAL（玻璃後面放室內模型的那一套＝打烊調暗＋鐵捲門）；二樓那張亮窗卡（街景模型 xs_fronts_lit，吉他牆、吊燈是貼圖）沒有接營業時間，一直亮。
   改法：① Z3.shopShutters＋XS3.SHOP_SHUT：一樓櫥窗、樓梯口各一片鐵捲門（和其他店同一套）② Z3.ggShopLit 可以給對照表，XS3.SHOP_LIT_PLACE：亮窗卡照營業時間調暗（和公館同一套著色器）。
   這裡驗：23:30／週一公休／颱風停業有鐵門、營業中沒有；位置對著街景模型的櫥窗和樓梯口（讀 GLB）；亮窗卡同弦那一格打烊乘 0.03；不動 zone.shopReal。
   修改前：①～⑧、⑩～⑭ FAIL。鐵捲門、調暗後實際的樣子沒有在瀏覽器看過（雲端沒有顯示卡）。 node tests/tongxian_closed_1112_unit.js */
const fs=require('fs'),path=require('path'),vm=require('vm'); const R=path.join(__dirname,'..'); let fail=0;
const ok=(c,m,info)=>{ console.log((c?'PASS ':'FAIL ')+m+(info&&!c?'　'+info:'')); if(!c) fail++; };
const src=fs.readFileSync(path.join(R,'src/zones3d.js'),'utf8'), xs=fs.readFileSync(path.join(R,'src/xinsheng3d.js'),'utf8');
const fnText=(name)=>{ const a=src.indexOf('  function '+name+'('); if(a<0) return ''; let d=0; for(let i=src.indexOf('{',src.indexOf(')',a));i<src.length;i++){ if(src[i]==='{') d++; else if(src[i]==='}'){ d--; if(d===0) return src.slice(a,i+1); } } return ''; };
const T_real=fnText('shopInsideReal'), T_shut=fnText('shopShutters');
ok(!!T_shut&&/shopShutters,/.test(src.slice(src.lastIndexOf('return {B1C'))),'① zones3d.js 有 shopShutters、Z3 有匯出');
/* 新生南路的設定 */
const cX={Math}; vm.createContext(cX);
const mShut=/S\.SHOP_SHUT=\(\(\)=>\{([\s\S]*?)\}\)\(\);/.exec(xs), mLit=/S\.SHOP_LIT_PLACE=(\{[^}]*\});/.exec(xs), mReal=/S\.SHOP_REAL=\(\(\)=>\{([\s\S]*?)\}\)\(\);/.exec(xs);
const SHUT=mShut?vm.runInContext('(()=>{'+mShut[1]+'})()',cX):[], LITMAP=mLit?vm.runInContext('('+mLit[1]+')',cX):{}, REAL=mReal?vm.runInContext('(()=>{'+mReal[1]+'})()',cX):[];
ok(SHUT.length===2&&SHUT[0].id==='tongxian'&&SHUT[1].id==='tongxian_stair'&&SHUT.every(q=>q.place==='xs_tongxian'&&q.cx===-16.5&&q.ry===Math.PI/2),'② XS3.SHOP_SHUT：同弦一樓櫥窗、樓梯口各一片，地點 xs_tongxian、在店面玻璃那一面（x −16.5）、朝街',JSON.stringify(SHUT));
ok(/if\(Z3\.shopShutters\) Z3\.shopShutters\(E,g,zone,S\.SHOP_SHUT\);/.test(xs)&&/if\(Z3\.ggShopLit\) Z3\.ggShopLit\(xsR,zone,S\.SHOP_LIT_PLACE,\{glow:false\}\);/.test(xs),'③ xinsheng3d.js 接上（街景模型載入以後）');
ok(REAL.length===6&&!REAL.some(q=>/tongxian/.test(q.id))&&/Z3\.shopInsideReal\(E,g,zone,S\.SHOP_REAL\)/.test(xs),'④ 有室內模型的那六間照舊（SHOP_REAL 沒有動）');
/* 假的 THREE：夠這兩個函式用 */
class V3{ constructor(x=0,y=0,z=0){ this.x=x; this.y=y; this.z=z; } set(x,y,z){ this.x=x; this.y=y; this.z=z; } }
class Box3{} class Color{ constructor(r=1,g=1,b=1){ this.r=r; this.g=g; this.b=b; } }
class PlaneGeometry{ constructor(w,h){ this.w=w; this.h=h; const uv=[[0,1],[1,1],[0,0],[1,0]]; this.attributes={uv:{count:4,getX:i=>uv[i][0],getY:i=>uv[i][1],setXY(i,x,y){ uv[i]=[x,y]; }}}; } }
class Mesh{ constructor(geo,mat){ this.geometry=geo; this.material=mat; this.position=new V3(); this.rotation={y:0}; this.userData={}; this.visible=true; this.name=''; } }
const canvas=()=>({width:0,height:0,getContext:()=>({createLinearGradient:()=>({addColorStop(){}}),fillRect(){},set fillStyle(v){}})});
const places=fs.readFileSync(path.join(R,'src/data/calendar.js'),'utf8').replace(/^const /mg,'var ')+'\n'+fs.readFileSync(path.join(R,'src/data/places.js'),'utf8').replace(/^const /mg,'var ');   /* 行事曆：星期幾（週一公休）、颱風假 */
const mk=()=>{ const g={children:[],add(o){ this.children.push(o); o.parent=this; },remove(o){ this.children=this.children.filter(q=>q!==o); }}; const zone={update:null}; const E={zone,q:{level:'high'},player:{obj:{position:new V3(-12,0,-8)}}};
  const ctx={Math,console,THREE:{Box3,Vector3:V3,Color,PlaneGeometry,Mesh,CanvasTexture:class{ constructor(c){ this.image=c; } },MeshLambertMaterial:class{ constructor(o){ Object.assign(this,o); } },RepeatWrapping:1000,DoubleSide:2,SRGBColorSpace:'srgb'},document:{createElement:canvas},GAME:{G:{hour:14,day:0}}};
  vm.createContext(ctx); vm.runInContext(places,ctx); vm.runInContext(T_real+'\n'+T_shut+'\n; this.shopInsideReal=shopInsideReal; this.shopShutters=shopShutters;',ctx); return {g,zone,E,ctx}; };
if(T_shut){ const W=mk(), P=W.ctx.PLACES; const KEEP={shops:['有室內模型的那幾間']}; W.zone.shopReal=KEEP;
  /* 找一個週三（營業）、週一（公休）、颱風假 */
  const dayOf=wd=>{ for(let d=60;d<90;d++){ const o12=P.isOpen('xs_tongxian',14,d), ty=P.typhoonClosed&&P.typhoonClosed('xs_tongxian',d); if(!ty&&(wd==='open'?o12:!o12)) return d; } return null; };
  const dOpen=dayOf('open'), dMon=dayOf('closed');
  ok(dOpen!=null&&dMon!=null&&P.isOpen('xs_tongxian',23.5,dOpen)===false&&P.isOpen('xs_tongxian',21.4,dOpen)===true,'⑤ 營業時間照 places.js：12:00～21:30、週一公休（找得到營業日 '+dOpen+'、公休日 '+dMon+'）');
  W.ctx.GAME.G.day=dOpen; W.ctx.GAME.G.hour=14;
  const Rr=W.ctx.shopShutters(W.E,W.g,W.zone,SHUT); const st=n=>{ for(let i=0;i<n;i++) W.zone.update(0.016,W.E); };
  const sh=id=>W.g.children.find(o=>o.name==='shop_shutter_'+id);
  ok(!!Rr&&W.g.children.length===2&&!!sh('tongxian')&&!!sh('tongxian_stair')&&W.zone.shopShut===Rr,'⑥ 兩片鐵捲門掛上場景（shop_shutter_tongxian、shop_shutter_tongxian_stair），記在 zone.shopShut',W.g.children.map(o=>o.name).join(','));
  ok(W.zone.shopReal===KEEP,'⑦ zone.shopReal（有室內模型的店，CC 在瀏覽器看 built／on）沒有被蓋掉');
  if(sh('tongxian')&&sh('tongxian_stair')){ const a=sh('tongxian'), b=sh('tongxian_stair');
    ok(a.visible===false&&b.visible===false,'⑧ 營業中（14:00）：沒有鐵門');
    W.ctx.GAME.G.hour=23.5; st(21); ok(a.visible===true&&b.visible===true,'⑨ 23:30（打烊）：櫥窗、樓梯口的鐵門都拉下來——修改前：沒有鐵門');
    W.ctx.GAME.G.hour=21.4; st(21); ok(a.visible===false&&b.visible===false,'⑩ 21:24（還沒打烊）：收起來');
    W.ctx.GAME.G.hour=21.6; st(21); ok(a.visible===true,'⑩b 21:36：拉下來');
    W.ctx.GAME.G.day=dMon; W.ctx.GAME.G.hour=14; st(21); ok(a.visible===true&&b.visible===true,'⑪ 週一公休 14:00：拉下來');
    { const iso0=P.typhoonClosed; P.typhoonClosed=(z)=>z==='xs_tongxian'; W.ctx.GAME.G.day=dOpen; W.ctx.GAME.G.hour=14; st(21); ok(a.visible===true,'⑪b 颱風停業：拉下來'); P.typhoonClosed=iso0; st(21); ok(a.visible===false,'⑪c 颱風過了：收起來'); }
    /* 位置對著街景模型（讀 GLB）：一樓櫥窗的立體店內 sk_in_tongxian、樓梯口的兩盞燈 */
    const glb=fs.readFileSync(path.join(R,'assets/models/env/second_ai/xinsheng_street.glb')); const J=JSON.parse(glb.slice(20,20+glb.readUInt32LE(12)).toString('utf8'));
    const nd=J.nodes.find(n=>n.name==='sk_in_tongxian'), acc=nd&&J.accessors[J.meshes[nd.mesh].primitives[0].attributes.POSITION], lamps=J.nodes.filter(n=>/^GLOW_xs_stairlamp/.test(n.name||''));
    const z0=a.position.z-a.geometry.w/2, z1=a.position.z+a.geometry.w/2;
    ok(!!acc&&z0<=acc.min[2]+0.06&&z1>=acc.max[2]-0.06&&z1-z0<acc.max[2]-acc.min[2]+0.6&&Math.abs(a.position.x-(acc.max[0]+0.07))<0.02&&a.geometry.h>=acc.max[1]-1e-6,'⑫ 櫥窗那一片蓋住一樓的立體店內（模型 z '+(acc&&acc.min[2].toFixed(2))+'～'+(acc&&acc.max[2].toFixed(2))+'、高 '+(acc&&acc.max[1])+'；鐵門 z '+z0.toFixed(2)+'～'+z1.toFixed(2)+'），貼在玻璃外 6 cm',JSON.stringify([a.position,a.geometry.w,a.geometry.h]));
    const s0=b.position.z-b.geometry.w/2, s1=b.position.z+b.geometry.w/2;
    ok(lamps.length===2&&lamps.every(n=>n.translation[2]>s0&&n.translation[2]<s1&&n.translation[0]<b.position.x)&&s1<z0+0.05&&Math.abs(b.geometry.h-3.82)<1e-6&&Math.abs(b.position.x-a.position.x)<1e-9,'⑬ 樓梯口那一片在櫥窗北邊、不重疊，樓梯的兩盞燈在它後面（燈 z '+lamps.map(n=>n.translation[2].toFixed(2)).join('、')+'；鐵門 z '+s0.toFixed(2)+'～'+s1.toFixed(2)+'、高 3.82＝一樓 4.2−0.38）');
    ok(Math.abs(a.rotation.y-Math.PI/2)<1e-9&&a.material===b.material&&a.material.name==='shopreal_shutter','⑬b 朝街（+x）、和其他店同一張浪板材質'); }
  /* 沒有室內模型：不載入、不出錯；省資源模式也一樣 */
  { const W2=mk(); let loads=0; W2.ctx.ASSETS={manifest:{},loadOne(){ loads++; return Promise.resolve(null); }}; W2.E.q.level='low'; const R2=W2.ctx.shopShutters(W2.E,W2.g,W2.zone,SHUT); let err=''; try{ for(let i=0;i<60;i++) W2.zone.update(0.016,W2.E); }catch(e){ err=String(e); }
    ok(!!R2&&!err&&loads===0&&R2.shops.every(s=>!s.built&&!s.loading),'⑭ 這兩片不接室內模型（不載入任何東西）；省資源模式跑 60 幀沒有例外',err); } }
/* 亮窗卡（二樓的吉他牆、吊燈是這一張）：照營業時間調暗 */
{ const glb=fs.readFileSync(path.join(R,'assets/models/env/second_ai/xinsheng_street.glb')); const J=JSON.parse(glb.slice(20,20+glb.readUInt32LE(12)).toString('utf8'));
  const nd=J.nodes.find(n=>n.name==='xs_fronts_lit'), ids=String((nd&&nd.extras||{}).xsShops||'').split(','), pr=nd&&J.meshes[nd.mesh].primitives[0];
  ok(ids.indexOf('tongxian')===1&&pr&&pr.attributes.TEXCOORD_1!==undefined,'⑮ 街景模型的亮窗卡 xs_fronts_lit：有第二組 UV（店編號）、同弦是第 2 間（'+ids.join('、')+'）');
  const c={Math}; vm.createContext(c); vm.runInContext(places,c); const P=c.PLACES;
  ok(ids.every(k=>LITMAP[k]&&P.hours&&P.hours[LITMAP[k]]),'⑯ XS3.SHOP_LIT_PLACE：亮窗卡上的每一間都對到有營業時間的地點',JSON.stringify(LITMAP));
  /* 跑真的 ggShopLit（假的網格、材質）*/
  const a=src.indexOf('  const GG_LIT_ZONE='), b=src.indexOf('  const GG_GLOW_SHOP='), blk=src.slice(a,src.indexOf('  function shopInsideLit(',a))+src.slice(src.indexOf('  const ggLitWired='),b);
  const zone={update:null}, mat={name:'wz_xs_fronts',onBeforeCompile:null}, mesh={isMesh:true,name:'xs_fronts_lit',material:mat,geometry:{attributes:{uv1:{}}},userData:{xsShops:ids.join(',')},parent:null};
  const root={name:'xinsheng_street_glb',userData:{},traverse(f){ f(this); f(mesh); }};
  const ctx={Math,console,WeakMap,THREE:{Material:{prototype:{onBeforeCompile(){}}},Vector3:V3},GAME:{G:{hour:14,day:0}},PLACES:P}; vm.createContext(ctx);
  let Rl=null, err=''; try{ vm.runInContext(blk+'\n; this.ggShopLit=ggShopLit;',ctx); Rl=ctx.ggShopLit(root,zone,LITMAP,{glow:false}); }catch(e){ err=String(e&&e.stack||e).split('\n').slice(0,3).join(' / '); }
  ok(!!Rl&&!err&&/function ggShopLit\(root,zone,map,opt\)/.test(src),'⑰ Z3.ggShopLit 可以給對照表（不給＝公館原本那一張）',err);
  if(Rl){ let dOpen=null; for(let d=60;d<90&&dOpen==null;d++) if(P.isOpen('xs_tongxian',14,d)&&!(P.typhoonClosed&&P.typhoonClosed('xs_tongxian',d))) dOpen=d;
    const at=(h,d)=>{ ctx.GAME.G.hour=h; ctx.GAME.G.day=d; Rl.upd(); return Rl.lit.slice(1,ids.length+1); };
    const day=at(14,dOpen), night=at(23.5,dOpen);
    ok(day[1]===1&&night[1]===0.03,'⑱ 同弦那一格：14:00 亮（1）、23:30 暗（0.03）——修改前：這張卡沒有接營業時間，一直亮',JSON.stringify([day,night]));
    ok(ids.every((k,i)=>night[i]===(P.isOpen(LITMAP[k],23.5,dOpen)?1:0.03)),'⑲ 其他幾間也照各自的營業時間（23:30：'+ids.map((k,i)=>k+' '+night[i]).join('、')+'）');
    ok(typeof mat.onBeforeCompile==='function'&&mat.onBeforeCompile!==null&&zone.ggLit&&zone.ggLit.name==='xs_fronts_lit'&&Rl.glow===null,'⑳ 著色器接在亮窗卡的材質上（和公館同一套）；這條街的光暈不跟著熄（glow:false）'); }
  /* 公館原本的呼叫不變 */
  ok(/ggShopLit\(r,zone\); \}\)\.catc/.test(src)||/ggShopLit\(r,zone\);/.test(src),'㉑ 公館照舊呼叫 ggShopLit(r,zone)（用公館的對照表）');
  ok(/const zk=LZ\[ids\[i\]\]/.test(src)&&/const LZ=map\|\|GG_LIT_ZONE/.test(src),'㉒ 對照表沒給＝GG_LIT_ZONE'); }
console.log(fail?('FAILED '+fail):'ALL PASS'); process.exit(fail?1:0);
