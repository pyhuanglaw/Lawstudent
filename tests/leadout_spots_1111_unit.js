/* LEADOUT-WALL-1111（LAWWW 11-11 17:49 派給 LAWWW2，P2；BB v9.10.25「這版沒做完」第 5 項）：一起念書散場、兩個人起身走到入口（src/invites3d.js S.leadOut）
   原本的目標點＝區域出生點（zone.spawn）左右各 0.55 m（你在左、她在右）。木曜日一樓的出生點在窄樓梯上，兩個點都在牆裡：走不到，靠 GAME.walkTo 的 4 秒保險直接放過去。
   修法：S.leadOutSpots 選點——照舊的兩個點站得住、從兩個人起身的地方找得到路，就照舊（大多數的區域不變）；不行才在出生點附近找（左右 0.35～0.55 m、沿出生點的方向前後每 0.2 m 到 2 m），
   兩個點相距至少 0.7 m（並排或前後站）。都找不到才照舊（walkTo 的保險還在）。不改流程、不改台詞。
   這支：在 Node 建出真的區域（index.html 的載入順序，到 invites3d.js 為止），兩個人從相鄰兩個座位起身（GAME.standUp 同一套算法）：
     0 有 INV.leadOutSpots
     1 會走 leadOut 的區域（invites.js 有 sitAt.lead 的地點：總圖大廳 library_hall 二樓、備用的三樓閱覽區 library）＋木曜日（BB 看到的地方）：
       兩個點都站得住（canStand 0.32）、相距 ≥ 0.7 m；兩個人用引擎真的 stepEntity 走過去（E.simWalk，走 30／10 fps）都走到、沒有 4 秒不動（＝walkTo 不靠保險，walkFallbacks 0）
     2 其他有座位的區域（同一套檢查，一個座位一組）：以後別的地點加 sitAt.lead 也不會走進牆裡
     3 照舊的兩個點本來就可以的區域：選出來的就是照舊那兩個點（行為不變）
     4 S.leadOut 真的用選出來的點（假的 GM：記下 walkTo 的目的地）；木曜日不是出生點左右各 0.55 m 那兩個在牆裡的點
   修改前（開發分支 f16135b3a4）：0、4 FAIL；1、2 木曜日、一盞、同弦、大步、好拍、法圖 FAIL（兩個點有一個站不住或走不到）。這是模擬，不是真實玩家流程（D131）。
   用法：node tests/leadout_spots_1111_unit.js [區域 id,…] */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){}, querySelector:()=>null, querySelectorAll:()=>[], body:{appendChild(){},classList:{add(){},remove(){}}} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); const cwarn=console.warn, cerr=console.error; console.warn=()=>{}; console.error=()=>{};
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const all=[...html.matchAll(/src="([^"?]+)/g)].map(m=>m[1]);
const files=[]; for(const f of all){ if(/three-vrm|character3d|props3d/.test(f)) continue; files.push(f); if(/invites3d\.js$/.test(f)) break; }
const loadErr=[]; for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+e.message.slice(0,60)); } }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
check('0. 載入沒有錯；有 INV.leadOutSpots',!loadErr.length&&typeof INV!=='undefined'&&typeof INV.leadOutSpots==='function',loadErr.join('；')||(typeof INV!=='undefined'?'INV.leadOutSpots '+typeof INV.leadOutSpots:'沒有 INV'));
const R=0.32, ONLY=process.argv[2]?process.argv[2].split(','):null;
function build(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; return z; }
/* 起身的位置：GAME.standUp（src/game3d.js）同一套——有高度的座位先試椅子後面 0.6 m；再四個方向 0.75／1.0／1.3 m；都不行就 E.unstick */
function standPos(s){ const yaw=s.yaw||0, lv=s.lv|0, ok=(x,z)=>E.canStand(x,z,R,lv)&&(s.y==null||Math.abs(E.heightAt(x,z,lv)-s.y)<=0.2); const dirs=[[Math.cos(yaw),-Math.sin(yaw)],[-Math.cos(yaw),Math.sin(yaw)],[Math.sin(yaw),Math.cos(yaw)],[-Math.sin(yaw),-Math.cos(yaw)]];
  { const bx=s.x-Math.sin(yaw)*0.6, bz=s.z-Math.cos(yaw)*0.6; if(s.y!=null&&ok(bx,bz)) return {x:bx,z:bz,lv}; }
  for(const d of [0.75,1.0,1.3]) for(const [dx,dz] of dirs){ const nx=s.x+dx*d, nz=s.z+dz*d; if(ok(nx,nz)) return {x:nx,z:nz,lv}; }
  if(E.canStand(s.x,s.z,0.3,lv)) return {x:s.x,z:s.z,lv};   /* 座位本身站得住（E.unstick 用 0.3 判斷，站得住就不動它）：就從那裡起身 */
  const ent={obj:{position:new THREE.Vector3(s.x,0,s.z)},lv,radius:R}; if(E.unstick(ent,12)) return {x:ent.obj.position.x,z:ent.obj.position.z,lv}; return null; }
/* 兩個相鄰的座位（S.pairSeats 找的是相鄰兩個；這裡取一個座位和同一層最近的另一個）*/
function seatPairs(z,lvOnly,k){ const S=z.seats.filter(s=>!s.label&&!s.npcOnly&&(lvOnly==null||(s.lv|0)===lvOnly)); if(!S.length) return []; const pick=k>=3?[S[0],S[Math.floor(S.length/2)],S[S.length-1]]:[S[0]];
  return [...new Set(pick)].map(a=>{ const b=S.filter(s=>s!==a&&(s.lv|0)===(a.lv|0)).sort((p,q)=>Math.hypot(p.x-a.x,p.z-a.z)-Math.hypot(q.x-a.x,q.z-a.z))[0]||a; return [a,b]; }); }
const orig=z=>{ const sp=z.spawn, y=sp.yaw||0, dx=Math.cos(y)*0.55, dz=-Math.sin(y)*0.55; return [{x:sp.x-dx,z:sp.z-dz},{x:sp.x+dx,z:sp.z+dz}]; };
const f2=v=>+(+v).toFixed(2);
function checkZone(id,lvOnly,k){ let z; try{ z=build(id); }catch(e){ return {id,err:'build '+e.message.slice(0,40)}; } if(!z||!z.spawn||!Array.isArray(z.seats)) return null; const pairs=seatPairs(z,lvOnly,k); if(!pairs.length) return null;
  const lv=z.spawn.lv|0, out=[]; let same=true;
  for(const [a,b] of pairs){ const pa=standPos(a), pb=standPos(b); if(!pa||!pb){ out.push('起身的位置找不到'); continue; }
    E.player={obj:{position:new THREE.Vector3(pa.x,0,pa.z)},lv:pa.lv,radius:R};
    const pr=typeof INV.leadOutSpots==='function'?INV.leadOutSpots(E,[pa,pb]):null, T=pr||orig(z), O=orig(z);
    if(Math.hypot(T[0].x-O[0].x,T[0].z-O[0].z)>1e-6||Math.hypot(T[1].x-O[1].x,T[1].z-O[1].z)>1e-6) same=false;
    const st=T.map(p=>E.canStand(p.x,p.z,R,lv)), gap=Math.hypot(T[0].x-T[1].x,T[0].z-T[1].z);
    if(!st[0]||!st[1]) out.push('站不住 '+JSON.stringify(T.map((p,i)=>[f2(p.x),f2(p.z),st[i]])));
    if(gap<0.7-1e-6) out.push('兩個點太近 '+gap.toFixed(2));
    for(const [from,to,who] of [[pa,T[0],'你'],[pb,T[1],'她']]) for(const dt of [1/30,0.1]){ const r=E.simWalk(from.x,from.z,to.x,to.z,{lv0:from.lv,lv1:lv,dt}); if(!r.ok) out.push(who+(dt<0.05?'30':'10')+'fps 從('+f2(from.x)+','+f2(from.z)+',lv'+from.lv+')走不到('+f2(to.x)+','+f2(to.z)+')：'+r.reason+(r.x!=null?'@'+r.x+','+r.z:'')); } }
  return {id,bad:out,same,pairs:pairs.length}; }
/* 1 會走 leadOut 的區域＋木曜日 */
const LEADZ=[]; for(const P of INVITE_DATA.places){ const SA=P.sitAt; if(SA&&SA.lead){ LEADZ.push([P.zone,SA.lv==null?null:SA.lv]); if(SA.alt) LEADZ.push([SA.alt,null]); } }
LEADZ.push(['wz_mokuyobi',null]);
{ const out=[]; let n=0; for(const [id,lvOnly] of LEADZ){ if(ONLY&&!ONLY.includes(id)) continue; const r=checkZone(id,lvOnly,3); if(!r) { out.push(id+' 建不出來或沒有座位'); continue; } n++; if(r.err||r.bad.length) out.push(id+'：'+(r.err||r.bad.slice(0,3).join('；'))); }
  check('1. 會走 leadOut 的區域（'+LEADZ.map(q=>q[0]).join('、')+'）：兩個點站得住、相距 ≥ 0.7 m，兩個人從座位起身走過去都走到（30／10 fps，不靠 4 秒保險）',!out.length&&n>0,out.join('｜')); }
/* 2、3 其他有座位的區域 */
{ const out=[], sameBad=[]; let n=0, nSame=0; const lead=new Set(LEADZ.map(q=>q[0]));
  for(const id of Object.keys(Z3.ZONES)){ if(lead.has(id)||(ONLY&&!ONLY.includes(id))) continue; const r=checkZone(id,null,1); if(!r) continue; n++; if(r.err){ out.push(id+'：'+r.err); continue; } if(r.bad.length) out.push(id+'：'+r.bad.slice(0,2).join('；'));
    /* 3：照舊的兩個點本來就站得住、走得到 → 選出來的一定是那兩個（不動）*/
    const z=E.zone, O=orig(z), lv=z.spawn.lv|0; const [a,b]=seatPairs(z,null,1)[0], pa=standPos(a), pb=standPos(b);
    const fine=pa&&pb&&O.every(p=>E.canStand(p.x,p.z,R,lv))&&[[pa,O[0]],[pb,O[1]]].every(([f,t])=>{ const p=E.pathTo(f.x,f.z,f.lv,t.x,t.z,lv); return !!(p&&p.length); });
    if(fine){ nSame++; if(!r.same) sameBad.push(id); } }
  check('2. 其他有座位的區域（'+n+' 個）：同樣兩個點站得住、相距 ≥ 0.7 m、走得到',!out.length&&n>0,out.slice(0,8).join('｜'));
  check('3. 照舊的兩個點本來就可以的區域（'+nSame+' 個）：選出來的就是照舊那兩個（行為不變）',!sameBad.length&&nSame>0,sameBad.join('、')); }
/* 4 S.leadOut 用選出來的點（假的 GM） */
(async()=>{ if(!ONLY||ONLY.includes('wz_mokuyobi')){ const z=build('wz_mokuyobi'); const sts=seatPairs(z,null,1)[0]; const pa=standPos(sts[0]), pb=standPos(sts[1]);
    const mk=p=>({obj:{position:new THREE.Vector3(p.x,0,p.z),rotation:{y:0}},lv:p.lv,radius:R}); const P=mk(pa), n=mk(pb); E.player=P; const got=[];
    const GM={E,walkTo:(ent,x,z,o)=>{ got.push({who:ent===P?'你':'她',x:f2(x),z:f2(z),lv:o&&o.lv}); return Promise.resolve(true); },standUp:()=>{},face:()=>{}};
    const ec=E.endCinematic; E.endCinematic=()=>{};   /* 鏡頭的運鏡（Node 沒有鏡頭狀態）*/
    let err=null; try{ await INV.leadOut(GM,{who:'heroine_01'},n); }catch(e){ err=e.message; } finally { E.endCinematic=ec; }
    const O=orig(z), lv=z.spawn.lv|0, ok=got.length===2&&got.every(g=>E.canStand(g.x,g.z,R,lv))&&!got.some(g=>O.some(o=>Math.hypot(o.x-g.x,o.z-g.z)<0.05));
    check('4. S.leadOut 走的是選出來的點（木曜日：不是出生點左右各 0.55 m 那兩個在牆裡的點；兩個點都站得住）',ok&&!err,err||JSON.stringify(got)+' 照舊的點 '+JSON.stringify(O.map(p=>[f2(p.x),f2(p.z)]))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })();
