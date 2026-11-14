// 118 巷九間店：互動鍵不被別的東西搶走（L118-IT-REACH-1111；BB 11-11 在使用者電腦用搖桿逐張走到每張椅子按互動鍵，好幾張按出來是別張椅子、點餐或看的東西——擋發布：每張椅子都要坐得到）
// 做法照 tests/l118_shops_notrap_1111_unit.js：在 Node 建出遊戲真正的店內區域（建好以後照遊戲跑 E.fitSeatRadius），按鈕用引擎真正的 E.nearestInteractable（其他椅子都空著、旁邊沒有人）。
//   1. 每張椅子：GAME.seatApproach 的候選站位（座位指定的 ap、前 0.5、後 0.6、兩側 0.55、後 0.7、0.75、前 0.8、後 0.9；站得住＝那一層 clear 半徑 0.3、從進門的位置找得到路）裡，
//      至少一個站位上按鈕是「這張椅子」；而且那個站位往四周 0.1 m 內（站得住的地方）按鈕還是這一張（BB：停在走近點旁邊 0.709 m、差 1 cm 出界）。
//   2. 點餐、每個看的東西、離開：至少有一個站得住、走得到的位置按鈕是它，而且那個位置四周 0.1 m 內還是它（每 0.05 m 掃）。
//   3. 任何椅子：只算椅子時是它的站位，不能被點餐、看的東西搶走（五湖四海 #9 後面 0.6 m 那一點按出來是「點餐」）。
//   4. 遊戲真的帶玩家去的站位（game3d.js seatApproach 原文，從進門的位置算）：推搖桿站在那裡（沒有點地）按鈕是那一張；點椅子走過去（tapPref＝點在椅子上，engine3d.js 點到的椅子多 E.TAP_SEAT_REACH）按鈕也是那一張。
//   印出九間的統計（幾張椅子、幾個站位、拿掉覆寫表（座位預設半徑回到 0.7）時幾張坐不到）。修改前（沒有覆寫表）FAIL。
// 這是模擬，不是真實玩家流程（D131）；搖桿實際停的位置、iPhone 實機由 BB／CC 在使用者電腦重跑。用法：node tests/l118_interact_reach_1111_unit.js [店 id,…]
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
process.on('unhandledRejection',()=>{});
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/lane118_layout.js','src/data/l118_shop_layouts.js','src/l118_shops3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|L118S|LANE118_LAYOUT|L118_SHOP_LAYOUTS|LINZE_LAYOUT|CLASSROOM_LAYOUT|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), i0=g.indexOf('function seatApproach('), i1=g.indexOf("return best||[seat.x+fx*0.5,seat.z+fz*0.5]; }",i0);
check('0. game3d.js 有 seatApproach、l118_shops3d.js 有覆寫表',i0>0&&i1>i0&&!!(L118S.IT_FIX&&L118S.IT_DEF));
const seatApproach=new Function('E',g.slice(i0,i1)+"return best||[seat.x+fx*0.5,seat.z+fz*0.5]; }\nreturn seatApproach;")(E);
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); if(z.id==null) z.id=id; E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; E.fitSeatRadius(); return z; }   /* fitSeatRadius：和遊戲換區域時一樣（engine3d.js） */
/* GAME.seatApproach 的候選站位（同一組、同一個順序；ap 在最前面）*/
const CANDS=s=>{ const yaw=s.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw); return [...(s.ap?[['ap',s.ap[0],s.ap[1]]]:[]),['前0.5',s.x+fx*0.5,s.z+fz*0.5],['後0.6',s.x-fx*0.6,s.z-fz*0.6],['側0.55',s.x+fz*0.55,s.z-fx*0.55],['側0.55',s.x-fz*0.55,s.z+fx*0.55],
  ['後0.7',s.x-fx*0.7,s.z-fz*0.7],['後0.75',s.x-fx*0.75,s.z-fz*0.75],['前0.8',s.x+fx*0.8,s.z+fz*0.8],['後0.9',s.x-fx*0.9,s.z-fz*0.9]]; };
const MARGIN=0.1, R3=v=>+v.toFixed(2);
const IDS=(process.argv[2]?process.argv[2].split(','):Object.keys(L118_SHOP_LAYOUTS)).filter(id=>Z3.ZONES['l118_'+id]);
if(!process.argv[2]) check('0. 九間店的室內都有區域',IDS.length===9,IDS.join());
function audit(id){ const L=L118_SHOP_LAYOUTS[id], z=loadZone('l118_'+id), sp=z.spawn||L.spawn, P=E.player, ITS=E.interactables.slice(); let k=0; for(const it of ITS) if(it.seat) it._no=++k;   /* _no：BB 用的編號（配置的順序，從 1 開始）*/
  const nm=it=>!it?'沒有按鈕':it.seat?'#'+it._no+'「'+it.label+'」':it.shop118?'「'+it.label+'」':it.look?'看「'+it.label+'」':it.exit?'「'+it.label+'」':(it.label||'?');
  const stand=(x,zz)=>E.canStand(x,zz,0.3,0);
  const reach=(x,zz)=>{ const p=E.pathTo(sp.x,sp.z,0,x,zz,0); if(!p||!p.length) return false; const q=p[p.length-1]; return Math.hypot(q[0]-x,q[1]-zz)<=0.6; };   /* 和 seatApproach 一樣：路的終點離站位 0.6 m 內 */
  const at=(x,zz,tp)=>{ P.obj.position.set(x,0,zz); P.lv=0; P.tapPref=tp?{x:tp[0],z:tp[1],lv:0,zone:z.id}:null; const w=E.nearestInteractable(); P.tapPref=null; return w; };
  const atSeatsOnly=(x,zz)=>{ E.interactables=ITS.filter(i=>i.seat); const w=at(x,zz); E.interactables=ITS; return w; };
  const margin=(x,zz,it)=>{ let m=0.25; for(let a=0;a<16;a++){ const dx=Math.cos(a*Math.PI/8), dz=Math.sin(a*Math.PI/8); for(let t=0.01;t<m;t+=0.01){ const qx=x+dx*t, qz=zz+dz*t; if(!stand(qx,qz)) continue; if(at(qx,qz)!==it){ m=t; break; } } } return m; };
  const out={id,name:L.name,seats:0,cands:0,noSeat:[],thin:[],stolen:[],gameAp:[],tapAp:[],items:[],itemBad:[]};
  for(const it of ITS.filter(i=>i.seat)){ out.seats++; const s=it.seat; let best=null;
    for(const [kn,x,zz] of CANDS(s)){ if(!stand(x,zz)||!reach(x,zz)) continue; out.cands++; const w=at(x,zz);
      if(w===it){ const m=margin(x,zz,it); if(!best||m>best.m) best={kn,x,zz,m}; }
      else if(atSeatsOnly(x,zz)===it&&w&&(w.shop118||w.look)) out.stolen.push(nm(it)+' '+kn+'('+R3(x)+','+R3(zz)+')→'+nm(w)); }
    if(!best){ const ws=CANDS(s).filter(([kn,x,zz])=>stand(x,zz)&&reach(x,zz)).map(([kn,x,zz])=>kn+'→'+nm(at(x,zz))); out.noSeat.push(nm(it)+' ('+s.x+','+s.z+')：'+(ws.join('、')||'沒有站得住的站位')); }
    else if(best.m<MARGIN-1e-9) out.thin.push(nm(it)+' ('+s.x+','+s.z+') 最好的站位 '+best.kn+'('+R3(best.x)+','+R3(best.zz)+') 只有 '+best.m.toFixed(2)+' m');
    /* 遊戲會帶玩家去的站位：seatApproach 照玩家現在的位置挑路最短的，玩家從哪一邊來都可能——照它的三段挑法（按鈕範圍內而且離這張最近 → 範圍內 → 站得住），把那一段的每個站位都算；
       另外照原文從進門的位置跑一次（原文的結果一定要在裡面）*/
    const reachR=(it.radius||1.8)-0.05, own=(x,zz)=>{ const d0=Math.hypot(x-it.x,zz-it.z); return !ITS.some(q=>q!==it&&q.seat&&!q.hidden&&Math.hypot(x-q.x,zz-q.z)<d0-1e-6); };
    const ok0=CANDS(s).filter(([kn,x,zz])=>stand(x,zz)&&reach(x,zz)), m1=ok0.filter(([kn,x,zz])=>Math.hypot(x-it.x,zz-it.z)<=reachR), m2=m1.filter(([kn,x,zz])=>own(x,zz));
    const elig=(m2.length?m2:m1.length?m1:ok0).slice(); P.obj.position.set(sp.x,0,sp.z); P.lv=0; const ga=seatApproach(s); if(!elig.some(e=>Math.hypot(e[1]-ga[0],e[2]-ga[1])<1e-6)) elig.push(['原文',ga[0],ga[1]]);
    /* 點椅子（game3d.js tapToSeat：點的地方站不住、離座位 0.45 m 內最近的是這一張）：點在椅子上和往四邊偏 0.15 m */
    const taps=[[0,0],[0.15,0],[-0.15,0],[0,0.15],[0,-0.15]].map(([a,b])=>[s.x+a,s.z+b]).filter(([x,zz])=>{ if(stand(x,zz)) return false; let bs=null, bd=0.45; for(const q of ITS){ if(!q.seat) continue; const d=Math.hypot(q.seat.x-x,q.seat.z-zz); if(d<bd){ bd=d; bs=q; } } return bs===it; });
    for(const [kn,x,zz] of elig){ const w0=at(x,zz); if(w0!==it) out.gameAp.push(nm(it)+' 推搖桿站在'+kn+'('+R3(x)+','+R3(zz)+')→'+nm(w0));
      for(const tp of taps){ const w1=at(x,zz,tp); if(w1!==it){ out.tapAp.push(nm(it)+' 點('+R3(tp[0])+','+R3(tp[1])+')走到'+kn+'('+R3(x)+','+R3(zz)+')→'+nm(w1)); break; } } } }
  /* 點餐、看的東西、出口：每 0.05 m 掃半徑裡站得住、走得到的點 */
  for(const it of ITS.filter(i=>!i.seat)){ const S=new Map(), W=new Set(), key=(i,j)=>i+','+j, st=0.05, n=Math.ceil(it.radius/st);
    for(let i=-n;i<=n;i++) for(let j=-n;j<=n;j++){ const x=it.x+i*st, zz=it.z+j*st; if(Math.hypot(i*st,j*st)>=it.radius) continue; if(!stand(x,zz)) continue; S.set(key(i,j),[x,zz]); if(at(x,zz)===it) W.add(key(i,j)); }
    let robust=null; const c=Math.round(MARGIN/st);
    for(const kk of W){ const [i,j]=kk.split(',').map(Number); let ok=true; for(let a=-c;a<=c&&ok;a++) for(let b=-c;b<=c&&ok;b++){ if(Math.hypot(a,b)>c+1e-9) continue; const q=key(i+a,j+b); if(S.has(q)&&!W.has(q)) ok=false; } if(ok){ const p=S.get(kk); if(reach(p[0],p[1])){ robust=p; break; } } }
    out.items.push(nm(it)+' 贏 '+W.size+'/'+S.size+' 點'+(robust?'（例 ('+R3(robust[0])+','+R3(robust[1])+')）':''));
    if(!robust) out.itemBad.push(nm(it)+' ('+R3(it.x)+','+R3(it.z)+') r'+it.radius+'：半徑裡站得住的 '+S.size+' 點、它贏的 '+W.size+' 點，沒有一點四周 '+MARGIN+' m 也是它'); }
  return out; }
/* 修改前：拿掉覆寫表、座位預設半徑回到 0.7（只為了印統計；跑完放回去）*/
const FIX=L118S.IT_FIX||{}, DEF=L118S.IT_DEF||{}, saved={}; for(const k of Object.keys(FIX)){ saved[k]=FIX[k]; delete FIX[k]; } const r0=DEF.seatR; DEF.seatR=0.7;
const before={}; for(const id of IDS){ const a=audit(id); before[id]=a; }
Object.assign(FIX,saved); DEF.seatR=r0;
/* 覆寫表的每一格都對得到配置（腳本重新產生、座位挪了，那一格就不再套用——這裡抓出來，不讓它默默失效）*/
{ const stale=[]; for(const [id,F] of Object.entries(FIX)){ const L=L118_SHOP_LAYOUTS[id]; if(!L){ stale.push(id); continue; }
    for(const k of Object.keys(F.seats||{})) if(!L.seats.some(s=>s.x+','+s.z===k)) stale.push(id+' 座位 '+k);
    for(const k of Object.keys(F.interact||{})) if(!(L.interact||[]).some(q=>q.id===k)) stale.push(id+' 看的東西 '+k);
    if(F.order&&!L.order) stale.push(id+' 點餐'); }
  check('0. 覆寫表（l118_shops3d.js L118_IT_FIX）每一格都對得到配置的座位座標、看的東西 id（11-12 起表是空的也可以：值搬回配置了）',!stale.length,stale.join('、'));
  const nI=IDS.reduce((n,id)=>n+L118_SHOP_LAYOUTS[id].seats.filter(q=>Array.isArray(q.i)).length,0), T=L118_SHOP_LAYOUTS.tea, H=L118_SHOP_LAYOUTS.home;
  check('0b. L118-IT-REACH-1111 收尾：配置自己帶按鈕位置（seats[].i 共 '+nI+' 張）、辛亥韓食小菜櫃 prio 0.2、五湖四海點餐 (0.65,−2.15) r 0.75、大鍋 prio 0.3；遊戲程式的覆寫表是空的',
    nI===56&&Object.keys(FIX).length===0&&T.interact.find(q=>q.id==='banchan').prio===0.2&&T.order.prio===0.3&&H.order.z===-2.15&&H.order.r===0.75&&H.interact.find(q=>q.id==='dumpling_pot').prio===0.3&&require('child_process').spawnSync('python3',[require('path').join(__dirname,'..','tools/lane118/it_fix.py'),'--check']).status===0); }
const tot={seats:0,cands:0,b:0,a:0};
for(const id of IDS){ const a=audit(id), b=before[id]; tot.seats+=a.seats; tot.cands+=a.cands; tot.b+=b.noSeat.length+b.gameAp.length; tot.a+=a.noSeat.length;
  console.log('— '+id+' '+a.name+'：'+a.seats+' 張椅子、'+a.cands+' 個站得住的站位；拿掉覆寫表時 '+b.noSeat.length+' 張搖桿坐不到'+(b.noSeat.length?'（'+b.noSeat.map(s=>s.split(' ')[0]).join(' ')+'）':'')+'、'+b.gameAp.length+' 張遊戲帶去的站位按鈕不是它、'+b.stolen.length+' 個站位被點餐／看的東西搶走；'+a.items.join('；'));
  check(id+' '+a.name+'：'+a.seats+' 張椅子每張至少一個站位按鈕是它',a.seats>0&&!a.noSeat.length,a.noSeat.join(' ／ '));
  check(id+' '+a.name+'：那個站位四周 '+MARGIN+' m 按鈕還是它（搖桿停偏一點也坐得到）',!a.thin.length,a.thin.join(' ／ '));
  check(id+' '+a.name+'：點餐、看的東西、離開各有站得到的位置（四周 '+MARGIN+' m 也是它）',!a.itemBad.length,a.itemBad.join(' ／ '));
  check(id+' '+a.name+'：椅子的站位沒有被點餐、看的東西搶走',!a.stolen.length,a.stolen.join(' ／ '));
  check(id+' '+a.name+'：遊戲帶玩家去的站位（seatApproach）推搖桿、點椅子走過去，按鈕都是那一張',!a.gameAp.length&&!a.tapAp.length,a.gameAp.concat(a.tapAp).join(' ／ ')); }
/* 2026-11-11（BB 第二輪 PC，a2dd74af1）：CC 的走法＝搖桿走到椅子的四邊（東西南北各從 0.45 m 往外找第一個站得住的點），停在哪就看按鈕。
   辛亥韓食 #9 只有西邊站得到、那一點是「看：小菜櫃」（贏 1 cm）——上面「至少一個候選站位是它」沒抓到，因為候選站位用的是 ap、不是 CC 停的那一點。
   這一項：每張椅子四邊裡站得到的那幾個點，至少一個按鈕是它，而且不能是點餐、看的東西（是隔壁椅子算 P1，BB 判不擋，這裡只列出來）。 */
{ const bad=[], nb=[]; for(const id of IDS){ const z=loadZone('l118_'+id), P=E.player, ITS=E.interactables.slice(); let k=0; for(const it of ITS) if(it.seat) it._no=++k;
    const at=(x,zz)=>{ P.obj.position.set(x,0,zz); P.lv=0; P.tapPref=null; return E.nearestInteractable(); };
    for(const it of ITS.filter(i=>i.seat)){ const s=it.seat, w=[]; for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) for(let t=0.45;t<=1.0;t+=0.05){ const x=s.x+dx*t, zz=s.z+dz*t; if(E.canStand(x,zz,0.3,0)){ w.push(at(x,zz)); break; } }
      if(!w.length) continue; if(!w.includes(it)){ if(w.some(q=>q&&!q.seat)) bad.push(id+' #'+it._no+'→'+w.map(q=>!q?'無':q.seat?'#'+q._no:q.label).join('/')); else nb.push(id+' #'+it._no+'→'+w.map(q=>!q?'無':q.seat?'#'+q._no:q.label).join('/')); } } }
  check('CC 的走法：椅子四邊站得到的點，沒有一張「只出現點餐、看的東西」（辛亥韓食 #9 那一類，擋發布）',!bad.length,bad.join(' ／ '));
  console.log('（P1、不擋：四邊站得到的點都是隔壁椅子的 '+nb.length+' 張：'+nb.join(' ／ ')+'）'); }
console.log('九間合計：'+tot.seats+' 張椅子、'+tot.cands+' 個站得住的站位；拿掉覆寫表時 '+tot.b+' 件（搖桿坐不到＋遊戲帶去的站位按鈕不是它），現在搖桿坐不到 '+tot.a+' 張');
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
