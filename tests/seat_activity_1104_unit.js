// 坐著的人在做什麼、桌上有什麼（SEAT-ACTIVITY-1104，USER_WANTS X217；使用者 2026-11-04 06:2x「坐下讀書的人他不一定是讀書……筆記型電腦、平板或者單純在滑手機……桌上要有東西呀」）——不需要瀏覽器。
// 在 Node 照 index.html 的順序載入整個遊戲（不算圖），建出真正的區域（兩點半 Café、總圖大廳、總圖 3F 閱覽區、法圖、社科圖、afar、Daybreak、巷子裡定食），讓路人坐滿位子，跑 SEATACT.tick：
//   A  desk_props.glb（LAWWW2 真正的 GLB）有 SEATACT 用到的每一個網格：每一組 tset_／rset_（＋_lod1）、自己組的單件 item_*、手上的手機 item_phone_on；平板（item_tablet、hold_tablet）有沒有＝只報告
//   B  每一區都有好幾種樣子：至少 4 種在做的事、至少 4 種桌上的組；有人用筆電、有人滑手機、有人看書；桌上有東西的人 ≥ 七成
//   C  同一張長桌相鄰（1.05 m 內）的兩個人不做同一件事
//   D  圖書館：桌上沒有杯子以外吃的喝的（S.FOOD）；吃飯的店（巷子裡定食）、早午餐（Daybreak）：沒有人用筆電、桌上沒有筆電
//   E  東西在桌上：每一件的高度＝那個位子前面量到的桌面（±1 cm）、在那個人前面（往前 0～0.9 m、左右 ±0.45 m）；同一張桌子兩組不疊在一起（不同人的同一種單件中心距離 ≥ 8 cm）
//   F  身體：滑手機＝pose read＋手上換成手機（CHAR.setReadItem 'phone'）；看書＝read＋書；筆電、寫筆記、看桌上的書＝sit；手上的東西不會一個人兩支手機（滑手機的人桌上沒有手機）
//   G  種子穩定：同一天出去再進來＝同一個位子同一件事、同一組；換一天＝有些位子換了
//   H  人走了（從 E.npcs 拿掉）、起身（pose idle）＝那一組從桌上拿掉；換區域＝整組拿掉；一個區域最多 S.CAP 組
//   I  店裡的客人（crowd3d.js 的 CROWD.enter）：一個人的照座位表、兩個人一桌聊天的姿勢不動、桌上各一個杯子；有名字的人：姿勢、手上的東西不動（不叫 setReadItem），桌上配一組；n.deskSet=false＝不放
//   J  遠近：7 m 內 LOD0、7.5 m 外 _lod1；12 m 外單件不畫
//   K  index.html：src/seatact3d.js 在 crowd3d.js 後面；game3d.js 主迴圈每 30 格叫 SEATACT.tick
//   L  正式模型晚一點才載好（桌面高度不一樣）：網格變了＝桌子的索引重算（分段算，每 30 格最多 S.INDEX_MS 毫秒）、每個人重找，東西跟著到新的桌面
// 修改前（開發分支 08968945f）：沒有 SEATACT——A 以外每一項 FAIL。用法：node tests/seat_activity_1104_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
const el=()=>({getContext:()=>ctx2d,style:{},classList:{add(){},remove(){},toggle(){},contains:()=>false},addEventListener(){},appendChild(){},setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],width:1,height:1});
global.document={ createElementNS:el, createElement:el, getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[], addEventListener(){}, body:el(), documentElement:el() };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:'',href:''};
global.localStorage={getItem:()=>null,setItem(){},removeItem(){}}; global.requestAnimationFrame=()=>0;
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const HTML=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), SRCS=[...HTML.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
const loadErr=[]; for(const f of SRCS){ try{ const src=fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e).slice(0,120)); } }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
console.warn=()=>{};
check('0 照 index.html 的順序載入每一個檔都沒有錯',!loadErr.length,loadErr.slice(0,3).join('；'));
const SA=typeof SEATACT!=='undefined'?SEATACT:null;
check('0 有 SEATACT（src/seatact3d.js）',!!SA);
/* ---- A：真正的 GLB ---- */
function glbNames(rel){ const b=fs.readFileSync(path.join(ROOT,rel)); let off=12, js=null; while(off<b.length){ const ln=b.readUInt32LE(off), ty=b.readUInt32LE(off+4), ch=b.subarray(off+8,off+8+ln); off+=8+ln; if(ty===0x4E4F534A) js=JSON.parse(ch.toString('utf8')); } return js.meshes.map(m=>m.name); }
const NAMES=glbNames('assets/models/env/second_ai/desk_props.glb');
{ const need=new Set(['item_phone_on']); if(SA){ for(const a of Object.values(SA.ACT)){ const D=a.desk; if(!D) continue; for(const sub of (D.library||D.other)?[D.library,D.other]:[D]) for(const v of Object.values(sub||{})) if(v){ if(SA.CUSTOM[v]) SA.CUSTOM[v].forEach(i=>need.add(i[0])); else { need.add(v); need.add(v+'_lod1'); } } } }
  const miss=[...need].filter(n=>!NAMES.includes(n)); check('A desk_props.glb 有 SEATACT 用到的每一個網格（'+need.size+' 個）',!!SA&&need.size>10&&!miss.length,miss.join('、'));
  console.log('INFO 平板：item_tablet '+(NAMES.includes('item_tablet')?'有':'沒有')+'、hold_tablet '+(NAMES.includes('hold_tablet')?'有':'沒有')+'（沒有＝平板先不出現，要新模型）'); }
/* 假的模型：名稱和真的 GLB 一樣（Node 裡不解貼圖）*/
const fake=new THREE.Group(); for(const n of NAMES){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.01,0.05),new THREE.MeshBasicMaterial()); m.name=n; fake.add(m); }
ASSETS.loadOne=k=>k==='prop.desk_props'?Promise.resolve({scene:fake}):new Promise(()=>{});
const readItem=new Map(); CHAR.setReadItem=(o,k)=>{ readItem.set(o,k); return true; };   /* 人物不建 VRM：記下手上換成什麼 */
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const wait=()=>new Promise(r=>setTimeout(r,0));
const dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/86400000)+1; };
const DAY=dayOf('2025-10-15');
let GM=null;
function build(id,G){ GAME.G=G; G.zone=id; G.weekday=CALENDAR.dateOf(G.day).wd%7; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav;
  E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},lv:0,radius:0.32,seat:null};
  E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
  GM={G,E,hourRate:1/150,npc:{},sitAt:(n,st)=>{ n.seat=st; n.pose='sit'; n.idlePose='sit'; n.frozen=true; n.path=null; n.obj.position.set(st.x,(st.lift||0),st.z); n.obj.rotation.y=st.yaw||0; }}; return z; }
const sitAll=(z,o)=>{ const out=[]; for(const st of (z.seats||[])){ const ob=new THREE.Group(); ob.userData={}; out.push(E.addNPC(Object.assign({obj:ob,name:'',beh:'idle',isExtra:true,pose:'read',idlePose:'read',frozen:true,seat:st,lv:st.lv|0},o||{}))); } return out; };
const run=async()=>{ SA.tick(GM); await wait(); for(let i=0;i<400&&SA.indexing&&SA.indexing();i++) SA.tick(GM); SA.tick(GM); SA.tick(GM); };   /* 桌子的索引分段算（每 30 格最多 S.INDEX_MS 毫秒）：跑到算完 */
const mkG=(d,h)=>({day:d,hour:h,flags:{},stage:'law'});
const ZONES=['cafe','library_hall','library','lawlib','soclib','afar'];
const LIB=['library_hall','library','lawlib','soclib'];
const fwdOf=st=>[Math.sin(st.yaw||0),Math.cos(st.yaw||0)];
(async()=>{
  if(!SA){ for(const n of ['B','C','D','E','F','G','H','I','J']) check(n+'（沒有 SEATACT）',false); }
  else {
    const snap={};
    for(const id of ZONES){ const z=build(id,mkG(DAY,14)); const ppl=sitAll(z); readItem.clear(); await run(); const st=SA.state();
      snap[id]=new Map(st.list.map(r=>[r.x.toFixed(2)+','+r.z.toFixed(2)+','+r.lv,r.act+'/'+r.set]));
      const acts=new Set(st.list.map(r=>r.act)), sets=new Set(st.list.filter(r=>r.set).map(r=>r.set)), withDesk=st.list.filter(r=>r.items.length).length;
      check('B '+id+'：至少 4 種在做的事、4 種桌上的組；桌上有東西 ≥ 七成（'+st.n+' 人）',acts.size>=4&&sets.size>=4&&withDesk>=0.7*st.n,[...acts].join('、')+'｜'+[...sets].join('、')+'｜桌上有東西 '+withDesk+'/'+st.n);
      if(id==='cafe'||id==='library_hall'||id==='library') check('B '+id+'：有人用筆電、有人滑手機、有人在讀（手上的書、桌上的書或筆記）',acts.has('laptop')&&acts.has('phone')&&(acts.has('book')||acts.has('textbook')||acts.has('notes')),[...acts].join('、'));
      /* C 相鄰不同 */
      const bad=[]; for(let i=0;i<st.list.length;i++) for(let j=i+1;j<st.list.length;j++){ const a=st.list[i], b=st.list[j]; if(a.lv===b.lv&&Math.hypot(a.x-b.x,a.z-b.z)<1.05&&a.act===b.act) bad.push(a.act+'@('+a.x.toFixed(1)+','+a.z.toFixed(1)+')'); }
      check('C '+id+'：1.05 m 內相鄰的兩個人不做同一件事',!bad.length,bad.slice(0,4).join('、'));
      /* D 圖書館沒吃的 */
      if(LIB.includes(id)){ const food=st.list.flatMap(r=>r.items).filter(n=>SA.FOOD.test(n)); check('D '+id+'：桌上沒有杯子以外吃的喝的',!food.length,food.join('、')); }
      /* E 東西在桌上 */
      { const recs=[...SA.groups()].flatMap(g=>g.userData.rs||[]); const off=[]; const itemsPos=new Map();
        for(const r of recs){ if(!r.tb) continue; const [fx,fz]=fwdOf(r.st); for(const it of (r.items||[])){ const dx=it.x-r.st.x, dz=it.z-r.st.z, fw=dx*fx+dz*fz, lat=-dx*fz+dz*fx;
            if(/^item_/.test(it.name)||/^[tr]set_/.test(it.name)){ if(Math.abs(it.y-r.tb.y)>0.01||fw<0||fw>0.9||Math.abs(lat)>0.45) off.push(it.name+' fw '+fw.toFixed(2)+' lat '+lat.toFixed(2)+' dy '+(it.y-r.tb.y).toFixed(3)); }
            if(/^item_/.test(it.name)){ const k=it.name; if(!itemsPos.has(k)) itemsPos.set(k,[]); itemsPos.get(k).push(it); } } }
        let clash=0; for(const L of itemsPos.values()) for(let i=0;i<L.length;i++) for(let j=i+1;j<L.length;j++) if(Math.hypot(L[i].x-L[j].x,L[i].z-L[j].z)<0.08&&Math.abs(L[i].y-L[j].y)<0.05) clash++;
        check('E '+id+'：每一件在那個人前面的桌面上（高度±1 cm、往前 0～0.9 m、左右 ±0.45 m）、兩組不疊在一起',recs.length>0&&!off.length&&!clash,off.slice(0,3).join('；')+(clash?'；疊在一起 '+clash:'')); }
      /* F 身體 */
      { const badF=[]; for(const r of st.list){ const n=ppl.find(p=>p.seat&&Math.abs(p.seat.x-r.x)<1e-6&&Math.abs(p.seat.z-r.z)<1e-6&&(p.lv|0)===r.lv); if(!n) continue; const ri=readItem.get(n.obj)||'book';
          if(r.act==='phone'&&!(n.pose==='read'&&ri==='phone')) badF.push('phone:'+n.pose+'/'+ri);
          if(r.act==='book'&&!(n.pose==='read'&&ri==='book')) badF.push('book:'+n.pose+'/'+ri);
          if((r.act==='laptop'&&r.set)||r.act==='notes'||r.act==='textbook'||r.act==='rest'){ if(n.pose!=='sit') badF.push(r.act+':'+n.pose); }
          if(ri==='phone'&&r.items.some(x=>/phone/.test(x))) badF.push('兩支手機 '+r.set); }
        check('F '+id+'：滑手機＝read＋手機、看書＝read＋書、筆電／筆記／桌上的書／休息＝sit；滑手機的人桌上沒有手機',!badF.length,badF.slice(0,4).join('、')); }
      /* J 遠近 */
      if(id==='library'){ const g=SA.groups()[0]; const r=g&&g.userData.rs.find(q=>q.set&&/^tset_/.test(q.set)); if(r){ E.player.obj.position.set(r.st.x+1,0,r.st.z); SA.tick(GM); const nm=r.set; const near=g.children.find(i=>i.name==='desk:'+nm), far=g.children.find(i=>i.name==='desk:'+nm+'_lod1');
          const cn=near&&near.count; E.player.obj.position.set(r.st.x+30,0,r.st.z); SA.tick(GM); const cf=far&&far.count, cn2=near&&near.count, items=g.children.filter(i=>/desk:item_/.test(i.name)).reduce((a,i)=>a+i.count,0);
          check('J '+id+'：7 m 內用 LOD0、走遠換 _lod1；12 m 外單件不畫',cn>=1&&cf>=1&&!(cn2>0&&cn2>=cn)&&items===0,nm+'：近 LOD0 '+cn+'、遠 _lod1 '+cf+'、遠的 LOD0 '+cn2+'、遠的單件 '+items); } else check('J（找不到 tset 的組）',false); }
      /* H 走了、起身 */
      if(id==='cafe'){ const r0=st.list.find(r=>r.items.length), n0=r0&&ppl.find(p=>p.seat&&Math.abs(p.seat.x-r0.x)<1e-6&&Math.abs(p.seat.z-r0.z)<1e-6);
        const cnt=()=>SA.groups().reduce((a,g)=>a+g.children.reduce((b,i)=>b+(i.visible?1:0),0),0), total=()=>SA.groups().reduce((a,g)=>a+(g.userData.rs||[]).length,0);
        const t0=total(); E.removeNPC(n0); SA.tick(GM); const t1=total(); const n1=ppl.find(p=>p!==n0&&SA.state().list.some(r=>r.items.length&&Math.abs(p.seat.x-r.x)<1e-6&&Math.abs(p.seat.z-r.z)<1e-6)); n1.pose=n1.idlePose='idle'; SA.tick(GM); const t2=total();
        check('H 人走了、起身：那一組從桌上拿掉',t1===t0-1&&t2===t0-2&&SA.state().n===st.n-2,'組數 '+t0+'→'+t1+'→'+t2); } }
    /* L 正式模型晚一點才載好（桌面高度不一樣）：網格變了＝索引重算、每個人重找、東西跟著到新的桌面；索引分段算（一次最多 S.INDEX_MS 毫秒） */
    { const z=build('library',mkG(DAY,14)); sitAll(z); await run(); const g=SA.groups()[0], r=g&&g.userData.rs.find(q=>q.set&&/^tset_/.test(q.set)), y0=r&&r.tb.y, fl=r&&(r.tb.y-r.tb.h); const ms=SA.indexStat(z).ms;
      if(r){ for(const o of [...z.group.children]) o.visible=false; const top=new THREE.Mesh(new THREE.BoxGeometry(8,0.04,8),new THREE.MeshBasicMaterial()); top.position.set(r.st.x,(r.tb.y-r.tb.h)+0.88-0.02,r.st.z); z.group.add(top);
        SA.MESH_TTL=0; let steps=0; SA.tick(GM); while(SA.indexing()&&steps<400){ SA.tick(GM); steps++; } SA.tick(GM); SA.MESH_TTL=4000; const r2=SA.groups()[0]&&SA.groups()[0].userData.rs.find(q=>q.st===r.st); const it=r2&&r2.items&&r2.items[0];
        check('L 正式模型晚一點才載好（換成 0.88 m 的桌面）：每個人重找桌子、東西跟著到新的桌面；索引分段算',!!it&&Math.abs(r2.tb.y-(fl+0.88))<0.011&&Math.abs(it.y-r2.tb.y)<0.005,'原本 '+(y0&&y0.toFixed(3))+' → '+(r2&&r2.tb&&r2.tb.y.toFixed(3))+'、東西 '+(it&&it.y.toFixed(3))+'；閱覽區的索引 '+ms+' ms'); }
      else check('L（找不到 tset 的組）',false); }
    /* G 種子穩定 */
    { for(const id of ['cafe','library']){ const z=build(id,mkG(DAY,16)); sitAll(z); await run(); const again=new Map(SA.state().list.map(r=>[r.x.toFixed(2)+','+r.z.toFixed(2)+','+r.lv,r.act+'/'+r.set])); let diff=0; for(const [k,v] of again) if(snap[id].get(k)!==v) diff++;
        build(id,mkG(DAY+1,14)); sitAll(E.zone); await run(); const other=new Map(SA.state().list.map(r=>[r.x.toFixed(2)+','+r.z.toFixed(2)+','+r.lv,r.act])); let chg=0; for(const [k,v] of other) if((snap[id].get(k)||'').split('/')[0]!==v) chg++;
        check('G '+id+'：同一天出去再進來＝同一個位子同一件事、同一組；換一天有些位子換了',diff===0&&chg>=2,'同一天不同 '+diff+'、隔天換了 '+chg+'/'+other.size); } }
    /* H 換區域、上限 */
    { build('library_hall',mkG(DAY,14)); sitAll(E.zone); await run(); const g0=SA.groups()[0]; const n0=SA.state().n; build('cafe',mkG(DAY,14)); SA.tick(GM); const goneOld=!g0||!g0.parent;
      check('H 換區域：上一區的桌上小物整組拿掉；一個區域最多 S.CAP 組',goneOld&&n0<=SA.CAP&&n0===Math.min(SA.CAP,46),'上一區的群組還在 '+!goneOld+'、總圖大廳 '+n0+' 組（上限 '+SA.CAP+'）'); }
    /* D 吃飯的店、早午餐：沒有筆電 */
    for(const id of ['wz_teishoku','daybreak']){ const z=build(id,mkG(DAY,12.5)); sitAll(z); await run(); const st=SA.state(); const lap=st.list.filter(r=>r.act==='laptop'||r.items.some(n=>/laptop/.test(n)));
      check('D '+id+'（'+(SA.placeOf(id))+'）：沒有人用筆電、桌上沒有筆電',st.n>0&&!lap.length,'人數 '+st.n+'、筆電 '+lap.length+'、做的事 '+[...new Set(st.list.map(r=>r.act))].join('、')); }
    /* I 店裡的客人：一個人／兩個人；有名字的人 */
    { let found=false; for(const h of [10,11,13,15,16,17]){ const z=build('afar',mkG(DAY,h)); readItem.clear(); CROWD.enter(GM,'afar'); const crowd=E.npcs.filter(n=>/^shop_/.test(n.crowd||'')&&n.seat);
        if(crowd.length<3) continue; await run(); const st=SA.state(); const recOf=n=>st.list.find(r=>Math.abs(r.x-n.seat.x)<1e-6&&Math.abs(r.z-n.seat.z)<1e-6);
        const pairs=crowd.filter(n=>n.lookAt), alone=crowd.filter(n=>!n.lookAt); if(!pairs.length||!alone.length) continue; found=true;
        const pOk=pairs.every(n=>{ const r=recOf(n); return r&&r.act==='chat'&&n.pose==='sit'&&!readItem.has(n.obj)&&r.items.every(x=>x==='item_cup'); });
        const aOk=alone.every(n=>{ const r=recOf(n); return r&&r.act!=='chat'; });
        check('I afar '+h+' 點：兩個人一桌聊天的姿勢不動、桌上只有杯子；一個人的照座位表做事',pOk&&aOk,'兩人 '+pairs.length+'（'+pairs.map(n=>{ const r=recOf(n); return r?r.act+'/'+r.items.join('+'):'沒配'; }).join('、')+'）、一個人 '+alone.length+'（'+alone.map(n=>{ const r=recOf(n); return r?r.act:'沒配'; }).join('、')+'）'); break; }
      if(!found) check('I afar：找得到一個人和兩個人一桌的客人',false);
      const z=build('library',mkG(DAY,14)); readItem.clear(); const o=new THREE.Group(); o.userData={}; const sis=E.addNPC({obj:o,id:'sis',name:'溫書瑀',beh:'idle',pose:'read',idlePose:'read',frozen:true,seat:z.seats[2],lv:0});
      const o2=new THREE.Group(); o2.userData={}; const an=E.addNPC({obj:o2,id:'an',name:'沈以安',beh:'idle',pose:'read',idlePose:'read',frozen:true,seat:z.seats[8],lv:0,deskSet:false}); await run(); const st=SA.state();
      const rs=st.list.find(r=>r.named&&Math.abs(r.x-z.seats[2].x)<1e-6), ra=st.list.find(r=>r.named&&Math.abs(r.x-z.seats[8].x)<1e-6&&Math.abs(r.z-z.seats[8].z)<1e-6);
      check('I 有名字的人（學姊在 3F 讀書）：姿勢不動（read）、手上照舊（不叫 setReadItem）、桌上配一組；deskSet=false 的不放',!!rs&&rs.items.length>0&&sis.pose==='read'&&!readItem.has(o)&&!ra,(rs?rs.act+'/'+rs.set+'、'+rs.items.join('+'):'學姊沒配')+'、pose '+sis.pose+'、setReadItem '+readItem.has(o)+'、以安 '+(ra?'有配（錯）':'沒配')); }
  }
  /* K 載入順序、掛勾 */
  { const a=f=>HTML.indexOf(f); const G3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
    check('K index.html：seatact3d.js 在 crowd3d.js 後面、game3d.js 每 30 格叫 SEATACT.tick',a('src/seatact3d.js')>a('src/crowd3d.js')&&a('src/crowd3d.js')>0&&/E\.frame%30===0[^\n]*SEATACT\.tick\(GM\)/.test(G3)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
