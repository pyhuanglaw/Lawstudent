// 季節布置第三批的落地東西不擋人、不卡人（LIFE-DETAILS-SEASONAL-1110；LAWWW 11-11 08:10 定的檢查；LAWWW2 帳號 A）——不需要瀏覽器。
// 在 Node 建出遊戲真正的溫州街、公館（zones3d.js），把 src/data/season_deco.js 的 blocks（那一組顯示的那一天才擋）全部擋起來（最壞的情況），用引擎自己的碰撞（E.canStand，半徑 0.30）檢查：
//   1. 模型裡每一個落地東西的腳印（season_<區域>.json 的 foot：水果箱、文旦禮籃、傘架、烤肉架…）：站得住的人中心離它 ≥ 0.30 m（身體碰不到）——
//      除了烤肉架，其他都放在原本就擋住的地方（門廊、花台上），不靠新的阻擋
//   2. 每一塊 blocks 附近 6 m 內站得到的點（每 0.25 m）：用引擎真正的找路＋移動（E.simWalk，走路，30 fps、10 fps）都走得到 6 m 外的騎樓（不會卡在烤肉架旁邊）
//   3. 擋起來以前走得到的互動點、座位（這一區的 E.interactables、E.seats）：擋起來以後半徑裡還是有站得住的點
//   4. 路人站點（crowd3d.js 的 CROWD.SPOTS，zone 是這一區的）：站點的範圍（c ± spread/2）不和任何一塊 blocks 重疊
//   5. 擋的格子都是新擋的（S.block 回傳的格子），S.unblock 以後導航和原本一模一樣（模型載不到時不留看不見的牆）
//   6. 季節攤販（A1～A6，data 的 stalls）：客人站的位置站得到；攤販站的位置玩家站不到、不在攤子裡；攤販和客人在攤子兩邊；模型有每一攤
// 修改前（blocks 和烤肉架一樣大：x 26～27、z 21～21.5）：第 1 項 FAIL——人可以斜站到離烤肉架 7 cm（引擎的「站得住」只看前後左右四個點）。
// 這是模擬，不是真實玩家流程（D131）。用法：node tests/season_deco_nav_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
// 和 tests/cafe230_ext_nav_unit.js 一樣：index.html 到 teach3d.js 為止的區域檔（不要人物、劇情）＋溫州街的小店、公園；季節布置的資料和 SD3、路人
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const all=[...html.matchAll(/src="([^"?]+)/g)].map(m=>m[1]);
const files=[]; for(const f of all){ if(/three-vrm|character3d|props3d|season_deco3d/.test(f)) continue; files.push(f); if(/teach3d\.js$/.test(f)) break; }
for(const f of ['src/lane118.js','src/data/l118_shop_layouts.js','src/l118_shops3d.js','src/wzpark3d.js','src/wzshops3d.js','src/bike3d.js','src/bikeshop3d.js','src/mokuyobi_sys3d.js','src/offbeat_sys3d.js',
  'src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/courses.js','src/data/syllabus.js','src/classes3d.js','src/crowd3d.js','src/data/season_deco.js']) if(!files.includes(f)) files.push(f);
for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){ console.log('（載入 '+f+' 失敗：'+e.message+'）'); } }
{ let src=fs.readFileSync(path.join(ROOT,'src/season_deco3d.js'),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1=').replace('S.hook(); return S;','return S;'); vm.runInThisContext(src,{filename:'src/season_deco3d.js'}); }   // 不包區域的 build（這裡自己擋）
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, R=0.30, D=SEASON_DECO;
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function build(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null;
  const z=Z3.ZONES[id].build(E); z.def=Z3.ZONES[id]; E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.nav) E.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const rectD=(r,x,z)=>Math.hypot(Math.max(r[0]-x,0,x-r[1]),Math.max(r[2]-z,0,z-r[3]));
function nearestStand(r,pad){ let best=1e9, bp=null; for(let x=r[0]-pad;x<=r[1]+pad;x+=0.02) for(let z=r[2]-pad;z<=r[3]+pad;z+=0.02){ if(!E.canStand(x,z,R,0)) continue; const d=rectD(r,x,z); if(d<best){ best=d; bp=[+x.toFixed(2),+z.toFixed(2)]; } } return [best,bp]; }
const reachable=(x,z,r)=>{ for(let a=0;a<=r;a+=0.1) for(let t=0;t<16;t++){ const px=x+Math.cos(t*Math.PI/8)*a, pz=z+Math.sin(t*Math.PI/8)*a; if(E.canStand(px,pz,R,0)) return true; } return false; };
check('0. 載入：區域、SEASON_DECO、SD3.block／unblock、CROWD.SPOTS',!!Z3.ZONES.wenzhou&&!!Z3.ZONES.gongguan&&!!D&&typeof SD3!=='undefined'&&typeof SD3.block==='function'&&typeof SD3.unblock==='function'&&typeof CROWD!=='undefined'&&Array.isArray(CROWD.SPOTS));
for(const zid of ['wenzhou','gongguan']){
  const Z=D.zones[zid], info=JSON.parse(fs.readFileSync(path.join(ROOT,Z.glb.replace(/\.glb$/,'.json')),'utf8')), FOOT=info.foot||{};
  const z=build(zid), nav=z.nav, b0=nav.b.slice();
  const before={it:E.interactables.filter(i=>i.x!=null&&reachable(i.x,i.z,i.radius||1)).map(i=>[i.label,i.x,i.z,i.radius||1]), seat:(E.seats||[]).filter(s=>reachable(s.x,s.z,0.9)).map(s=>[s.x,s.z])};
  const rects=[]; for(const c of Z.codes) for(const r of ((Z.blocks||{})[c]||[])) rects.push(r);
  const got=SD3.block(nav,rects);
  // 1
  const bad1=[]; let n1=0; for(const code of Object.keys(FOOT)) for(const r of FOOT[code]){ n1++; const [d,p]=nearestStand(r,1.0); if(d<R-1e-6) bad1.push([code,r,+d.toFixed(2),p]); }
  check(zid+' 1. 落地東西的腳印 '+n1+' 個：站得住的人中心離它們都 ≥ '+R+' m（身體碰不到）',n1>0&&!bad1.length,bad1.length+' 個碰得到：'+J(bad1.slice(0,5)));
  // 2
  if(rects.length){ const bad2=[]; let n2=0;
    for(const r of rects){ const cx=(r[0]+r[1])/2, cz=(r[2]+r[3])/2; let tgt=null; for(const dx of [6,-6,7,-7]){ for(let dz=-1.5;dz<=1.5&&!tgt;dz+=0.25) if(E.canStand(cx+dx,cz+dz-0.8,R,0)) tgt=[cx+dx,cz+dz-0.8]; if(tgt) break; }
      if(!tgt){ bad2.push(['找不到 6 m 外站得住的點',r]); continue; }
      for(let x=cx-6;x<=cx+6;x+=0.25) for(let zz=cz-6;zz<=cz+6;zz+=0.25){ if(!E.canStand(x,zz,R,0)) continue; if(Math.hypot(x-tgt[0],zz-tgt[1])>14) continue; n2++;
        for(const dt of [0.033,0.1]){ const q=E.simWalk(x,zz,tgt[0],tgt[1],{lv0:0,lv1:0,dt,speed:1.45}); const end=q&&q.x!=null?[q.x,q.z]:(q&&q.ok?tgt:null);
          if(!end||Math.hypot(end[0]-tgt[0],end[1]-tgt[1])>0.6){ bad2.push([+x.toFixed(2),+zz.toFixed(2),dt,end&&end.map(v=>+v.toFixed(2)),q&&q.reason]); break; } } } }
    check(zid+' 2. 擋起來以後，blocks 附近 6 m 內站得到的 '+n2+' 個點都走得到 6 m 外的騎樓（30 fps、10 fps）',n2>50&&!bad2.length,bad2.length+' 個走不到：'+J(bad2.slice(0,6))); }
  // 3
  const lostIt=before.it.filter(([l,x,zz,r])=>!reachable(x,zz,r)), lostSeat=before.seat.filter(([x,zz])=>!reachable(x,zz,0.9));
  check(zid+' 3. 擋起來以前走得到的互動點 '+before.it.length+' 個、座位 '+before.seat.length+' 個：擋起來以後半徑裡還是站得住',!lostIt.length&&!lostSeat.length,J({lostIt,lostSeat}));
  // 4
  const spots=CROWD.SPOTS.filter(s=>s.zone===zid&&s.c), hit=[]; for(const s of spots){ const sp=s.spread||[0,0], sr=[s.c[0]-sp[0]/2,s.c[0]+sp[0]/2,s.c[1]-sp[1]/2,s.c[1]+sp[1]/2]; for(const r of rects) if(sr[0]<r[1]+R&&sr[1]>r[0]-R&&sr[2]<r[3]+R&&sr[3]>r[2]-R) hit.push([s.id,r]); }
  check(zid+' 4. 路人站點 '+spots.length+' 個（CROWD.SPOTS）：範圍不和 blocks 重疊（再留人的半徑）',!hit.length,J(hit));
  // 6 季節攤販（A1～A6）：客人站的位置（at）半徑裡站得住；攤販站的位置（clerk）玩家站不到（在阻擋裡）、不在攤子的腳印裡；每一攤都有模型的腳印
  const ST=Z.stalls||[], bad6=[];
  for(const q of ST){ const r=q.foot, inFoot=(x,zz)=>x>r[0]-0.05&&x<r[1]+0.05&&zz>r[2]-0.05&&zz<r[3]+0.05;
    if(!reachable(q.at.x,q.at.z,Math.min(q.at.r,0.6))) bad6.push([q.key,'客人站不到',q.at]);
    if(q.clerk&&E.canStand(q.clerk.x,q.clerk.z,R,0)) bad6.push([q.key,'攤販的位置玩家站得到',q.clerk]);
    if(q.clerk&&inFoot(q.clerk.x,q.clerk.z)) bad6.push([q.key,'攤販站在攤子裡',q.clerk]);
    if(!(FOOT[q.code]||[]).some(f=>Math.abs(f[0]-r[0])<0.01&&Math.abs(f[3]-r[3])<0.01)) bad6.push([q.key,'模型沒有這一攤的腳印',r]);
    const d1=Math.abs(q.at.z-(r[2]+r[3])/2), d0=q.clerk?Math.abs(q.clerk.z-(r[2]+r[3])/2):1; if(q.clerk&&Math.sign(q.at.z-(r[2]+r[3])/2)===Math.sign(q.clerk.z-(r[2]+r[3])/2)) bad6.push([q.key,'攤販和客人在同一邊']); }
  check(zid+' 6. 季節攤販 '+ST.length+' 攤：客人站的位置站得到、攤販的位置玩家站不到也不在攤子裡、攤販和客人在攤子的兩邊、模型有這一攤',ST.length>0&&!bad6.length,J(bad6));
  // 5
  SD3.unblock(nav,got); let same=true; for(let i=0;i<nav.b.length;i++) if(nav.b[i]!==b0[i]){ same=false; break; }
  check(zid+' 5. blocks 擋了 '+got.length+' 格（都是新擋的）；放回去以後導航和原本一模一樣',(rects.length?got.length>0:got.length===0)&&same&&got.every(i=>!b0[i]),J({rects,got:got.length}));
}
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
