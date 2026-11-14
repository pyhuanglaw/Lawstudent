// 公館三間新室內接進遊戲（GG-SHOPS-REDO-1104；USER_WANTS X206；AA_647）——不需要瀏覽器（D131）。
//   日和便利店 v2（cvs：BB 的 bb_support/cvs_interior.glb＋src/data/cvs_layout.js v3，story-planning 53275eaf4）、
//   頁間書屋 v2（bookstore：AA 的 aa_support/yejian.glb＋src/data/yejian_layout.js v2，a6d78f484）、
//   青木茶室 v2b（新區域 aoki：AA 的 aa_support/aoki.glb＋src/data/aoki_layout.js v2，16c1c6f16）。
// 建出遊戲真正的區域（公館＋三間室內，zones3d.js 真正的程式），用引擎真正的找路與移動（E.simWalk：30 fps＋低幀率）檢查：
//   1 三間都建得起來、尺寸照配置、正式模型的資產登錄（url 照配置、檔案在）、配置的導航阻擋都擋住
//   2 公館店門口：「進入○○」→ 那一間；門的位置照外觀（青木茶室 cx−1.85、頁間書屋 −36.4）；店門口站得住、從人行道走得到；青木茶室門口不再是外帶的「買一杯飲料」
//   3 進門站的地方：站得住、不在那一間任何出口的範圍（＋0.2 m）裡（tests/spawn_exit_unit.js 的規則）；出口從進門的地方走得到、按得到；出來回公館站得住、不在公館任何出口的範圍裡
//   4 座位：數量照配置（便利店 8、頁間 16、青木 22）；每一個都按得到（E.fitSeatRadius 之後，範圍裡有站得住、最近的互動就是它的點）、從進門的地方走得到；
//     青木 v2c／日和 v2b／頁間 v3b（2026-11-04 換模型與配置：AA 697ed69cf、BB 61a107016、AA d593be119）：青木 22 張都能坐、卡座走近點；頁間沙發照一般走近；高腳椅抬高（lift）；能不能讀書：頁間、青木照配置 canStudy（青木：AA_653 B，2026-11-04 改；原本照一盞茶屋不能）、便利店不能
//   5 點餐：便利店「結帳」（shop:'cvs'）、頁間「看看法律書與文具」（shop:'book'）、青木「點茶」（內用，ggs:'order'，吧台東端 (3.9,−1.2)；AA_653 A 改，原本是門口外帶的 shop:'tea'）按得到、走得到；
//     story3d.js 的 shop:'tea' 照舊是三種茶、key「清葉茶行」＝公館門口的「外帶」（AA_653 A：門口外帶照舊）
//   6 其他接線：店員、打工告示、路人站的點（CROWD）、「找書的女生」（pool_story.js）、快速前往、大地圖、溫州街進日和便利店的落點、index.html 載入順序、LICENSES.md
//   7 配置沒有載入的版本：照舊（舊的程序化室內、門口外帶）
// 用法：node tests/gg_interiors_1104_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8');
const LAYS=['src/data/cvs_layout.js','src/data/yejian_layout.js','src/data/aoki_layout.js'];
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/l118_redo772.js','src/data/lane118_props.js',
  'src/data/xinsheng_layout.js','src/data/bike_layout.js',...LAYS,'src/xinsheng3d.js','src/data/mokuyobi_layout.js','src/mokuyobi3d.js','src/bike3d.js','src/bikeshop3d.js','src/crowd3d.js','src/data/pool_story.js'])];
const order=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:(/xinsheng3d|mokuyobi3d/.test(f)?3:4)));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===3)).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
for(const f of pre){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=x=>JSON.stringify(x), rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8'), r2=v=>+(+v).toFixed(2);
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
ASSETS.loadOne=()=>Promise.reject(new Error('no GLB in node'));   /* 正式模型不載（備用模型；導航、互動點、座位都不靠模型）*/
const G={zone:'gongguan',day:30,hour:15,flags:{},money:5000,weather:'clear'}; global.GAME={G};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.nav) E.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; if(E.fitSeatRadius) E.fitSeatRadius(); return {z,its:E.interactables.slice()}; }
const walk=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{dt}); if(!r.ok) return Object.assign({dt:r2(dt)},r); } return {ok:true}; };
/* reachability_all／seat_reach 的規則：範圍－0.05 m 內、0.2 m 的格點，站得住而且「最近的互動」就是它（回傳那個位置，或 null）*/
/* from＝[x,z]：還要從那裡走得到（範圍裡最近的點可能是走不進去的小角落；玩家會站在走得到的地方按）*/
function touchable(it,from){ const r=(it.radius||1.5)-0.05, P=E.player, c=[];
  for(let dz=-r;dz<=r+1e-6;dz+=0.2) for(let dx=-r;dx<=r+1e-6;dx+=0.2){ const d=Math.hypot(dx,dz); if(d>r) continue; const x=it.x+dx, z=it.z+dz; if(E.canStand(x,z,0.32,0)) c.push([d,x,z]); }
  c.sort((a,b)=>a[0]-b[0]); for(const [,x,z] of c){ P.obj.position.set(x,0,z); if(E.nearestInteractable()!==it) continue; if(from&&!walk(from,[x,z]).ok) continue; return [x,z]; } return null; }
const inExit=(its,s,margin)=>its.filter(q=>q.exit&&!q.hidden&&Math.hypot(q.x-s.x,q.z-s.z)<(q.radius||1.8)+margin).map(q=>q.label+' '+Math.hypot(q.x-s.x,q.z-s.z).toFixed(2)+'m');
const SPEC={cvs:{L:CVS_LAYOUT.shop,name:'日和便利店',seats:8,glb:'bldg.cvs_interior_v2',order:{shop:'cvs',label:'結帳：飯糰／咖啡／飲料'},study:false,door:'進入便利商店'},
  bookstore:{L:YEJIAN_LAYOUT,name:'頁間書屋',seats:16,glb:'bldg.yejian_interior',order:{shop:'book',label:'看看法律書與文具'},study:true,door:'進入頁間書屋'},
  aoki:{L:AOKI_LAYOUT,name:'青木茶室',seats:22,glb:'bldg.aoki_interior',order:{ggs:'order',label:'點茶',x:3.9,z:-1.2},study:true,door:'進入青木茶室'}};
const SI=Z3.SHOP_IN;
// ---- 2 公館店門口 ----
const GG=loadZone('gongguan'); const gIts=GG.its, gNav=GG.z.nav;
const SHOPX={}; { let x=-68; const W=[10,8,12,10]; ['noodle','aoki','bookstore','cvs'].forEach((k,i)=>{ const X1=x+W[i]+1.2; SHOPX[k]=(x+X1)/2; x=X1; }); }   /* 店面街前四棟（燒臘、茶室、書屋、便利店）的中心 cx：照 zones3d.js 的 shops 表 */
for(const k of ['cvs','bookstore','aoki']){ const S=SPEC[k], door=gIts.find(q=>q.exit&&q.exit.to===k);
  check(`2 ${S.name}：公館店門口「${S.door}」進 ${k}`,!!door&&door.label===S.door,J(door&&[door.label,door.x,door.z]));
  if(!door) continue;
  const wantX=k==='bookstore'?-36.4:(k==='aoki'?r2(SHOPX.aoki-SI.aoki.door):-29.4);
  check(`2 ${S.name}：門口互動點的位置（${wantX}, 21）${k==='aoki'?'＝那一棟中心 '+r2(SHOPX.aoki)+' − 配置的門 x '+SI.aoki.door:''}`,Math.abs(door.x-wantX)<0.01&&door.z===21,J([door.x,door.z]));
  check(`2 ${S.name}：進門站的地方＝SHOP_IN（${J(door.exit.spawn)}）`,J(door.exit.spawn)===J({x:SI[k].x,z:SI[k].z,yaw:SI[k].yaw}));
  E.zone=GG.z; E.nav=gNav; E.interactables=gIts; const tp=touchable(door);
  check(`2 ${S.name}：店門口按得到（範圍裡站得住、最近的互動就是它）`,!!tp,J(tp));
  if(tp){ const w=walk([door.x,15],tp); check(`2 ${S.name}：從羅斯福路人行道 (${door.x.toFixed(1)}, 15) 走到店門口`,w.ok,J(w).slice(0,200)); } }
/* AA_653 A（2026-11-04）：門口的外帶照舊（原本這一項是「門口不再外帶」：GG-SHOPS-REDO-1104 第一版把外帶移到店裡，AA 定兩個都要）*/
{ const tk=gIts.filter(q=>q.shop==='tea'), dr=gIts.find(q=>q.exit&&q.exit.to==='aoki'), t=tk[0];
  check('2 青木茶室門口有外帶（shop:tea「外帶」，窗口在門的西邊：那一棟中心 − 配置 front.takeaway 的中間）',tk.length===1&&t.label==='外帶'&&Math.abs(t.x-r2(SHOPX.aoki-(AOKI_LAYOUT.front.takeaway.x0+AOKI_LAYOUT.front.takeaway.x1)/2))<0.01&&t.z===21,J(tk.map(q=>[q.label,q.x,q.z])));
  if(t&&dr){ E.zone=GG.z; E.nav=gNav; E.interactables=gIts; const a=touchable(t), b=touchable(dr); check('2 青木茶室：門口「外帶」和「進入青木茶室」都按得到（各自有站的地方最近的就是它）',!!a&&!!b,J([a,b])); } }
// ---- 1、3、4、5 三間室內 ----
for(const k of ['cvs','bookstore','aoki']){ const S=SPEC[k], L=S.L; let R;
  try{ R=loadZone(k); }catch(e){ check(`1 ${S.name}：區域建得起來`,false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); continue; }
  const z=R.z, its=R.its, nav=z.nav, IN=SI[k];
  check(`1 ${S.name}：區域建得起來、尺寸照配置 ${L.w}×${L.d}×${L.h}、名字「${Z3.ZONES[k].name}」`,!!z&&z.bounds.w===L.w&&z.bounds.d===L.d&&Z3.ZONES[k].name===S.name&&z.gg===k&&IN.gg===true,J(z&&z.bounds));
  const man=ASSETS.manifest[S.glb]; check(`1 ${S.name}：正式模型登錄 ${S.glb}＝${L.glb}（檔案在）`,!!man&&man.url===L.glb&&fs.existsSync(path.join(ROOT,L.glb))&&man.type==='building',J(man&&man.url));
  const onSeat=b=>(L.seats||[]).some(s=>Math.abs(b[0]-s.x)<0.05&&Math.abs(b[1]-s.z)<0.05), BL=(L.blocks||[]).filter(b=>!onSeat(b)), blk=BL.filter(b=>E.canStand(b[0],b[1],0.05,0));
  check(`1 ${S.name}：配置的導航阻擋 ${BL.length} 個都擋住（中心站不住；椅子、高腳椅 ${L.blocks.length-BL.length} 個不擋，和溫州街、118 巷的店一樣）`,!blk.length,J(blk));
  // 3 進門、出口
  const sp=z.spawn, ex=its.find(q=>q.exit&&q.exit.to==='gongguan');
  check(`3 ${S.name}：進門站的地方 (${sp.x}, ${sp.z}) 站得住（半徑 0.3）`,E.canStand(sp.x,sp.z,0.3,0)&&sp.x===IN.x&&sp.z===IN.z,J(sp));
  const near=inExit(its,sp,0.2); check(`3 ${S.name}：進門站的地方不在任何出口的範圍（＋0.2 m）裡`,!near.length,J(near));
  check(`3 ${S.name}：出口「${L.exit.label}」在門內（x ${IN.exit.x}＝配置的門 ${L.exit.at.x}）`,!!ex&&ex.label===L.exit.label&&ex.x===L.exit.at.x,J(ex&&[ex.label,ex.x,ex.z,ex.radius]));
  if(ex){ const tp=touchable(ex,[sp.x,sp.z]); check(`3 ${S.name}：出口按得到`,!!tp,J(tp)); if(tp){ const w=walk([sp.x,sp.z],tp); check(`3 ${S.name}：從進門的地方走到出口`,w.ok,J(w).slice(0,200)); }
    const out=ex.exit.spawn; check(`3 ${S.name}：出來回公館 (${out.x}, ${out.z}) 站得住、不在公館任何出口的範圍（＋0.2 m）裡`,gNav.clear(out.x,out.z,0.3)&&!inExit(gIts,out,0.2).length,J([out,inExit(gIts,out,0.2)])); }
  // 4 座位
  const seats=its.filter(q=>q.seat); check(`4 ${S.name}：座位 ${S.seats} 個（照配置）`,z.seats.length===S.seats&&seats.length===S.seats-(z.seats||[]).filter(q=>q.npcOnly).length,seats.length+'／'+z.seats.length);
  const bad=[], badW=[]; for(const it of seats){ const tp=touchable(it,[sp.x,sp.z]); if(!tp){ bad.push([it.seat.x,it.seat.z]); continue; } if(it.seat.ap){ const w=walk([sp.x,sp.z],it.seat.ap); if(!w.ok||!E.canStand(it.seat.ap[0],it.seat.ap[1],0.32,0)) badW.push([it.seat.x,it.seat.z,'ap',w.reason||w.dt]); } }
  check(`4 ${S.name}：每一個座位都按得到、走得到（從進門的地方走到一個「坐下」最近的互動就是它的點）`,!bad.length,J(bad));
  check(`4 ${S.name}：指定走近點（ap，沙發）站得住、走得到`,!badW.length,J(badW));
  if(k==='bookstore') check('4 頁間書屋 v3b（AA d593be119：茶几南移、沙發北移）：沙發兩位照一般走近（沒有 ap 特例；按得到、走得到在上一項）',seats.filter(q=>q.seat.ap).length===0&&seats.filter(q=>q.label==='坐沙發').length===2,J(seats.filter(q=>q.seat.ap).map(q=>[q.seat.x,q.seat.z])));
  const npcOnly=(z.seats||[]).filter(q=>q.npcOnly); if(k==='aoki'){ check('4 青木茶室 v2c（AA 697ed69cf：吧台西端縮 0.5 m）：22 張玩家都能坐（最裡面四人桌北側兩張原本走不進去、只給路人坐，現在拿掉）',!npcOnly.length&&seats.length===22,J(npcOnly.map(q=>[q.x,q.z])));
    const bq=seats.filter(q=>q.seat.x<-4); check('4 青木茶室：卡座兩位從兩張小圓桌中間 (−3.6, 1.3) 走近（ap；LAWWW2 量過 0.89／0.71 m）',bq.length===2&&bq.every(q=>J(q.seat.ap)===J([-3.6,1.3])),J(bq.map(q=>q.seat.ap))); }
  const hi=(L.seats||[]).filter(s=>s.seatH>0.6), lifted=seats.filter(q=>q.seat.lift>0);
  check(`4 ${S.name}：高腳椅 ${hi.length} 張坐姿抬高（lift＝座面 − 0.45）`,lifted.length===hi.length&&hi.every(s=>seats.some(q=>q.seat.x===s.x&&q.seat.z===s.z&&Math.abs(q.seat.lift-(s.seatH-0.45))<0.01)),J(lifted.map(q=>q.seat.lift)));
  const npc1=s=>(z.seats||[]).some(q=>q.npcOnly&&q.x===s.x&&q.z===s.z), st=seats.filter(q=>q.study).length, want=S.study?(L.seats||[]).filter(s=>s.canStudy&&!npc1(s)).length:0;
  check(`4 ${S.name}：能讀書的座位 ${want} 個（${k==='bookstore'?'照配置 canStudy':(k==='aoki'?'照配置 canStudy，吧台高腳椅不能（AA_653 B）；只給路人坐的不算':'便利店不能讀書')}）`,st===want&&seats.filter(q=>q.study).every(q=>!(q.seat.lift>0)||k==='bookstore'),st+'／'+want);
  // 5 點餐
  const od=its.find(q=>(S.order.ggs?q.ggs===S.order.ggs:q.shop===S.order.shop)&&!q.seat);
  check(`5 ${S.name}：「${S.order.label}」（${S.order.ggs?"ggs:'"+S.order.ggs+"'":"shop:'"+S.order.shop+"'"}）${S.order.x!=null?'在 ('+S.order.x+', '+S.order.z+')':''}`,!!od&&od.label===S.order.label&&(S.order.x==null||(od.x===S.order.x&&od.z===S.order.z)),J(od&&[od.label,od.x,od.z]));
  if(od){ const tp=touchable(od,[sp.x,sp.z]); check(`5 ${S.name}：「${od.label}」按得到`,!!tp,J(tp)); if(tp){ const w=walk([sp.x,sp.z],tp); check(`5 ${S.name}：從進門的地方走到「${od.label}」`,w.ok,J(w).slice(0,200)); } }
  check(`5 ${S.name}：座位的 shop 不是點餐的 shop（坐下不會變成點東西）`,seats.every(q=>q.shop!==S.order.shop&&!q.ggs),J([...new Set(seats.map(q=>q.shop))]));
  // 6 店員、打工告示、路人、找書的女生
  check(`6 ${S.name}：店員站的地方（SHOP_IN.clerk ${J(IN.clerk)}）在店裡`,!!IN.clerk&&Math.abs(IN.clerk.x)<L.w/2&&Math.abs(IN.clerk.z)<L.d/2);
  if(IN.job){ const it={x:IN.job.x,z:IN.job.z,radius:1.0,label:'告示'}; E.interactables.push(it); const tp=touchable(it,[sp.x,sp.z]); E.interactables.pop(); check(`6 ${S.name}：打工的告示 (${IN.job.x}, ${IN.job.z}) 按得到、走得到`,!!tp&&walk([sp.x,sp.z],tp).ok,J(tp)); }
  const def=CROWD.SHOP_ZONES[k]; if(def){ const pts=def.units.filter(u=>u.stand).map(u=>u.stand), badS=pts.filter(p=>!E.canStand(p[0],p[1],0.3,0)), badI=pts.filter(p=>its.some(i=>!i.seat&&Math.hypot(i.x-p[0],i.z-p[1])<(i.exit?1.0:0.45)));
      const close=[]; for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++) if(Math.hypot(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1])<0.7) close.push([pts[i],pts[j]]);
      if(pts.length) check(`6 ${S.name}：路人站的點 ${pts.length} 個都站得住、不擋按鈕、彼此不擠（> 0.7 m）`,!badS.length&&!badI.length&&!close.length,J({badS,badI,close}));
      if(k==='aoki'){ const ss=[].concat(...def.units.filter(u=>u.seats).map(u=>u.seats)); check('6 青木茶室：路人坐配置的座位（22 張；吧台五張是 bar）',ss.length===22&&ss.filter(s=>s.bar).length===5,ss.length+'、bar '+ss.filter(s=>s.bar).length); } }
  else check(`6 ${S.name}：CROWD 有這一間`,false);
  if(k==='bookstore'){ const ent=[].concat(...Object.values(POOL_STORY.PEOPLE).filter(p=>p&&p.where).map(p=>p.where)).find(q=>q.zone==='bookstore');
    check('6 頁間書屋：「找書的女生」（pool_story.js）站的地方站得住、面向書牆',!!ent&&E.canStand(ent.at[0],ent.at[1],0.3,0)&&Math.abs(ent.at[2]-Math.PI)<1e-6,J(ent&&ent.at)); }
}
// ---- 5 story3d.js 的點茶 ----
{ const s=rd('src/story3d.js'); check("5 story3d.js：shop:'tea'＝counter(GM,'清葉茶行',…) 桂花烏龍奶茶 70、柚香綠茶 60、春摘白茶 65（存檔 key 照舊）",/if\(it\.shop==='tea'\)\{ await counter\(GM,'清葉茶行',\[\['桂花烏龍奶茶',70,10\],\['柚香綠茶',60,6\],\['春摘白茶',65,6\]\](,'aoki')?\)/.test(s));
  check('6 story3d.js：三間的店員照 Z3.SHOP_IN（青木茶室多一個）',/zoneId==='cvs'\)\{ const c=ck\('cvs'\)/.test(s)&&/zoneId==='bookstore'(&&sh831\('bookstore'\))?\)\{ const c=ck\('bookstore'\)/.test(s)&&/zoneId==='aoki'&&ck\('aoki'\)/.test(s)); }
// ---- 6 其他接線 ----
{ const Q=PLACES.quickList(), q=k=>Q.find(p=>p[0]===k);
  check('6 快速前往：日和便利店、頁間書屋、青木茶室的落點＝進門站的地方',['cvs','bookstore','aoki'].every(k=>q(k)&&J(q(k)[2])===J({x:SI[k].x,z:SI[k].z,yaw:SI[k].yaw}))&&q('aoki')[1]==='青木茶室',J(['cvs','bookstore','aoki'].map(k=>q(k))));
  check('6 地點名：aoki＝青木茶室',PLACES.names.aoki==='青木茶室');
  check('6 大地圖、引路、路程、在外面：aoki 都算公館',/\['cvs','日和便利店'\],\['aoki','青木茶室'\]/.test(rd('src/placemap3d.js'))&&/aoki:'gongguan'/.test(rd('src/placemap3d.js'))&&/aoki:\['gongguan'\]/.test(rd('src/guide3d.js'))&&/'bikeshop','aoki'\]/.test(rd('src/guide3d.js'))&&/aoki:'gongguan'/.test(rd('src/classes3d.js'))&&/'aoki','cvs'/.test(rd('src/zrzq3d.js')));
  check('6 溫州街進日和便利店（AA_413）的落點照 SHOP_IN',/GM\.enter\('cvs',SI\?\{x:SI\.x,z:SI\.z,yaw:SI\.yaw\}/.test(rd('src/wzshops3d.js')));
  check('6 打工：頁間書屋、便利店的告示照 SHOP_IN.job，上班落點照 SHOP_IN',/dk=\(SI&&SI\.gg&&SI\.job\)\|\|s\.desk/.test(rd('src/jobs3d.js'))&&/\['books','bookstore'\],\['cvs','cvs'\]/.test(rd('src/jobs3d.js')));
  const h=rd('index.html'), ix=f=>h.indexOf('src="'+f), zi=ix('src/zones3d.js'), bb=ix('src/data/bbpack_events.js'), boot=h.indexOf('GAME.boot()');
  check('6 index.html：三個配置檔在 zones3d.js 前面、不在 bbpack 和 GAME.boot 中間',LAYS.every(f=>ix(f)>0&&ix(f)<zi&&!(ix(f)>bb&&ix(f)<boot)),J(LAYS.map(ix).concat([zi])));
  const lic=rd('LICENSES.md'); check('6 LICENSES.md：三個 GLB 各一行（本作 Blender、誰做的）',['bb_support/cvs_interior.glb','aa_support/yejian.glb','aa_support/aoki.glb'].every(g=>new RegExp('\\| [^\\n]*'+g.replace(/[.\/]/g,'\\$&')+'[^\\n]*本作 Blender').test(lic))); }
// ---- 6 從溫州街進日和便利店 ----
{ G.flags.CVS_FROM='wenzhou'; const R=loadZone('cvs'); const sp=R.z.spawn; check('6 從溫州街進日和便利店：同一個室內、窗景換溫州街（cvs_wz）、進門站的地方一樣',sp.x===SI.cvs.x&&sp.z===SI.cvs.z&&R.z.wins&&R.z.wins[0].userData.pview==='cvs_wz',J([sp,R.z.wins&&R.z.wins[0].userData.pview])); G.flags.CVS_FROM=null; }
// ---- 7 配置沒有載入的版本：照舊 ----
{ const keep={}, Zwith=Z3; for(const n of ['CVS_LAYOUT','YEJIAN_LAYOUT','AOKI_LAYOUT']){ keep[n]=globalThis[n]; delete globalThis[n]; }
  try{ vm.runInThisContext(rd('src/zones3d.js').replace(/^const (\w+)\s*=/m,'globalThis.$1='),{filename:'zones3d_nolayout.js'}); const Zn=globalThis.Z3, ZO=Zn.ZONES;
    const bld=id=>{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const z=ZO[id].build(E); return {z,its:E.interactables.slice()}; };
    const g=bld('gongguan').its, c=bld('cvs'), b=bld('bookstore');
    check('7 配置沒載入：沒有 aoki 區域；公館茶室門口照舊「買一杯飲料」（shop:tea）',Zn!==Zwith&&!ZO.aoki&&g.some(q=>q.shop==='tea'&&q.label==='買一杯飲料')&&!g.some(q=>q.exit&&q.exit.to==='aoki'));
    check('7 配置沒載入：便利商店、書店照舊（12×9、12×10；舊的結帳、買書點）',c.z.bounds.w===12&&c.z.bounds.d===9&&c.its.some(q=>q.shop==='cvs'&&q.x===3.2)&&b.z.bounds.w===12&&b.z.bounds.d===10&&b.its.some(q=>q.shop==='book'&&q.x===1.8),J([c.z.bounds,b.z.bounds]));
    check('7 配置沒載入：SHOP_IN 照舊（沒有 gg、沒有 aoki）',!Zn.SHOP_IN.cvs.gg&&!Zn.SHOP_IN.bookstore.gg&&!Zn.SHOP_IN.aoki);
  } catch(e){ check('7 配置沒載入：建得起來',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); }
  finally { globalThis.Z3=Zwith; for(const n in keep) globalThis[n]=keep[n]; } }
{ loadZone('cvs'); const back=[];
  for(const [a,b] of [[[-2.76,-4.48],[1.5,0.75]],[[-2.76,-4.48],[0.4,3.5]],[[0.4,3.5],[-2.76,-4.48]],[[0.4,3.5],[1.6,-4.0]]]){ const r=walk(a,b); if(!r.ok) back.push([a,b,r.reason,r.x,r.z]); }
  check('8 日和後面：微波（−2.76,−4.48）走去結帳、走回門口、從門口走去微波與冷藏櫃都走得到（中右兩排貨架後面的窄縫封掉；CC 11-04 GG_int_cvs_menu 601 秒走不到）',!back.length,JSON.stringify(back)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
